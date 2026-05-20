"use client";

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AddToCartOptions,
  AuthGate,
  CartItem,
  Toast,
} from "@/types/cart";
import type { Product } from "@/types/product";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import {
  clearPendingAuthGate,
  readPendingAuthGate,
} from "@/lib/auth-gate";
import {
  CHECKOUT_FLAT_SHIPPING,
  CHECKOUT_FREE_SHIPPING_AT,
  CHECKOUT_VAT_RATE,
} from "@/lib/checkout/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CartItemRow,
  WishlistItemRow,
} from "@/lib/supabase/database.types";

const GUEST_CART_KEY = "soo.guestCart";

type StoredCartItem = {
  productId: string;
  quantity: number;
  selectedVariant: string | null;
  selectedSize: string | null;
};

function clearGuestCartStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_KEY);
}

function buildCartKey(
  productId: string,
  variant?: string | null,
  size?: string | null,
) {
  return `${productId}::${variant ?? ""}::${size ?? ""}`;
}

// Three slices, three contexts. Components subscribe only to the slice
// they actually use, so a quantity tick on the cart no longer re-renders
// the wishlist drawer or the search input. The StoreProvider below owns
// the underlying state and feeds all three providers.

export type CartStore = {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  shipping: number;
  tax: number;
  cartTotal: number;
  /**
   * Promo code the user typed at checkout. Stored client-side as a UI
   * convenience only; the server re-reads + validates it against the
   * `promo_codes` table when placing the order. The client deliberately
   * does NOT estimate the discount — every promo lives server-side and
   * a stale client estimate would mislead the customer about their
   * total before payment.
   */
  discountCode: string;
  /**
   * User-initiated add-to-cart trigger. Opens the AuthGateModal when
   * the visitor is unauthenticated; falls through to addToCart when
   * they're signed in. Components attached to "Add to cart" / "Buy now"
   * buttons should call this — addToCart stays available for the gate
   * modal's "Continue as guest" path and post-sign-in replay.
   */
  requestAddToCart: (
    product: Product,
    quantity?: number,
    options?: AddToCartOptions,
  ) => void;
  /** Like requestAddToCart but also opens the checkout drawer afterwards. */
  requestBuyNow: (
    product: Product,
    quantity?: number,
    options?: AddToCartOptions,
  ) => void;
  /** Direct add — bypasses the auth gate. Used by the modal + replay only. */
  addToCart: (
    product: Product,
    quantity?: number,
    options?: AddToCartOptions,
  ) => void;
  buyNow: (
    product: Product,
    quantity?: number,
    options?: AddToCartOptions,
  ) => void;
  updateCartQuantity: (cartKey: string, amount: number) => void;
  removeCartItem: (cartKey: string) => void;
  /**
   * Drop the in-memory cart without surfacing a toast. Used by the order
   * confirmation page when payment is confirmed, so the locally-cached
   * cart can't race with the ITN handler's server-side cart wipe.
   */
  clearCartLocal: () => void;
  setDiscountCode: (code: string) => void;
  startCheckout: () => void;
};

export type WishlistStore = {
  wishlist: ReadonlySet<string>;
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  /**
   * User-initiated wishlist toggle. For guests this opens the
   * AuthGateModal — wishlist is account-only, never persisted in a
   * guest session. For authed users this toggles the saved set.
   */
  requestToggleWishlist: (product: Product) => void;
  /** Direct toggle — bypasses the auth gate. Used by post-sign-in replay only. */
  toggleWishlist: (product: Product) => void;
};

export type UIStore = {
  toast: Toast | null;
  cartOpen: boolean;
  searchOpen: boolean;
  wishlistOpen: boolean;
  checkoutOpen: boolean;
  quickViewProduct: Product | null;
  recentlyViewed: string[];
  /** Active auth-gate request. Null when no modal is showing. */
  authGate: AuthGate | null;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: Dispatch<SetStateAction<boolean>>;
  setWishlistOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  openCartDrawer: () => void;
  openWishlistDrawer: () => void;
  markViewed: (productId: string) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  /** Dismiss the auth gate without completing the underlying action. */
  dismissAuthGate: () => void;
};

const CartContext = createContext<CartStore | null>(null);
const WishlistContext = createContext<WishlistStore | null>(null);
const UIContext = createContext<UIStore | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { productsById } = useCatalog();
  const supabase = getSupabaseBrowserClient();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const hydratedFromSupabase = useRef(false);
  const lastSyncedUserId = useRef<string | null>(null);
  const cartWriteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wishlistWriteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Refs that always hold the freshest state. The async flush reads from
  // these so a write that started while the user was clicking still
  // commits the latest quantities. Without this, an in-flight delete +
  // insert closes over a stale cartItems snapshot and silently loses
  // changes that happened mid-write.
  const latestCartRef = useRef<CartItem[]>([]);
  const latestWishlistRef = useRef<string[]>([]);
  const cartWriteInFlight = useRef(false);
  const cartWriteDirty = useRef(false);
  const wishlistWriteInFlight = useRef(false);
  const wishlistWriteDirty = useRef(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authGate, setAuthGate] = useState<AuthGate | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  // Tracks whether we've read localStorage for the current guest session.
  // Persistence effects gate on this so the empty initial state can't
  // overwrite stored guest data before hydration has run.
  const [guestStorageReady, setGuestStorageReady] = useState(false);

  const wishlist = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const wishlistCount = wishlistIds.length;
  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [cartItems],
  );
  const shipping = useMemo(
    () =>
      cartSubtotal === 0 || cartSubtotal >= CHECKOUT_FREE_SHIPPING_AT
        ? 0
        : CHECKOUT_FLAT_SHIPPING,
    [cartSubtotal],
  );
  const tax = useMemo(
    () =>
      cartSubtotal === 0
        ? 0
        : Math.round(
            (cartSubtotal * CHECKOUT_VAT_RATE) / (100 + CHECKOUT_VAT_RATE),
          ),
    [cartSubtotal],
  );
  const cartTotal = useMemo(
    () => Math.max(0, cartSubtotal + shipping),
    [cartSubtotal, shipping],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
  }, []);

  // ---------------------------------------------------------------
  // Supabase cart + wishlist sync
  // ---------------------------------------------------------------
  // 1. On sign-in: load remote cart + wishlist, merge with whatever's in
  //    local memory (the guest's pre-login cart), and persist the merged
  //    result back. After this completes, subsequent local mutations are
  //    debounce-written to Supabase.
  useEffect(() => {
    if (!supabase || !currentUser) {
      hydratedFromSupabase.current = false;
      lastSyncedUserId.current = null;
      return;
    }

    if (lastSyncedUserId.current === currentUser.id) {
      return;
    }

    let cancelled = false;
    const userId = currentUser.id;

    void (async () => {
      const [cartResponse, wishlistResponse] = await Promise.all([
        supabase.from("cart_items").select("*").eq("user_id", userId),
        supabase.from("wishlist_items").select("*").eq("user_id", userId),
      ]);

      if (cancelled) return;

      const remoteCartRows = (cartResponse.data ?? []) as CartItemRow[];
      const remoteWishlistRows =
        (wishlistResponse.data ?? []) as WishlistItemRow[];

      const remoteCartItems: CartItem[] = [];
      for (const row of remoteCartRows) {
        const product = productsById.get(row.product_id);
        if (!product) continue;
        const item: CartItem = {
          ...product,
          cartKey: buildCartKey(product.id, row.selected_variant, row.selected_size),
          quantity: row.quantity,
        };
        if (row.selected_variant) item.selectedVariant = row.selected_variant;
        if (row.selected_size) item.selectedSize = row.selected_size;
        remoteCartItems.push(item);
      }

      // Merge: take the union, with quantities summed for matching keys.
      setCartItems((local) => {
        const merged = new Map<string, CartItem>();
        for (const item of remoteCartItems) {
          merged.set(item.cartKey, { ...item });
        }
        for (const item of local) {
          const existing = merged.get(item.cartKey);
          if (existing) {
            merged.set(item.cartKey, {
              ...existing,
              quantity: existing.quantity + item.quantity,
            });
          } else {
            merged.set(item.cartKey, item);
          }
        }
        return Array.from(merged.values());
      });

      setWishlistIds((local) => {
        const merged = new Set<string>(remoteWishlistRows.map((r) => r.product_id));
        for (const id of local) merged.add(id);
        return Array.from(merged);
      });

      hydratedFromSupabase.current = true;
      lastSyncedUserId.current = userId;
      // Local guest cart copy has been merged into the authed account —
      // drop it so a future sign-out (or another guest on this device)
      // doesn't re-hydrate the previous shopper's selection. Wishlist
      // is account-only so there's nothing to clear there.
      clearGuestCartStorage();
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, productsById, supabase]);

  // 2. On sign-out: drop the in-memory cart + wishlist so the next visitor
  //    isn't seeing the previous user's selection. Also clear the guest
  //    cart localStorage so the in-memory reset isn't undone on reload.
  // The setState calls are reacting to an external auth-state transition,
  // which is the documented exception to set-state-in-effect.
  useEffect(() => {
    if (currentUser) return;
    hydratedFromSupabase.current = false;
    lastSyncedUserId.current = null;
    /* eslint-disable react-hooks/set-state-in-effect */
    setCartItems([]);
    setWishlistIds([]);
    setGuestStorageReady(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    clearGuestCartStorage();
  }, [currentUser]);

  // 2b. Guest-session hydration: on first mount as an unauthenticated
  //     visitor, rebuild cart from localStorage so a reload doesn't lose
  //     what the shopper added through the "Continue as guest" path.
  //     Wishlist is account-only and has no guest storage to read.
  //     Pulling initial state from a browser-only API (localStorage) is
  //     the canonical "synchronize React with an external system" use
  //     case — the rule's documented exception.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (currentUser) return;
    if (guestStorageReady) return;
    if (typeof window === "undefined") return;

    try {
      const cartJson = window.localStorage.getItem(GUEST_CART_KEY);
      if (cartJson) {
        const stored = JSON.parse(cartJson) as StoredCartItem[];
        const rebuilt: CartItem[] = [];
        for (const stash of stored) {
          const product = productsById.get(stash.productId);
          if (!product) continue;
          const item: CartItem = {
            ...product,
            cartKey: buildCartKey(
              product.id,
              stash.selectedVariant,
              stash.selectedSize,
            ),
            quantity: stash.quantity,
          };
          if (stash.selectedVariant) item.selectedVariant = stash.selectedVariant;
          if (stash.selectedSize) item.selectedSize = stash.selectedSize;
          rebuilt.push(item);
        }
        if (rebuilt.length > 0) setCartItems(rebuilt);
      }
    } catch {
      // Corrupted JSON — drop it and start fresh.
      clearGuestCartStorage();
    }
    setGuestStorageReady(true);
  }, [currentUser, guestStorageReady, productsById]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 2c. Persist guest cart to localStorage. Gated on `guestStorageReady`
  //     so the initial empty render can't stomp the stored cart before
  //     hydration completes.
  useEffect(() => {
    if (currentUser || !guestStorageReady) return;
    if (typeof window === "undefined") return;
    const stored: StoredCartItem[] = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant ?? null,
      selectedSize: item.selectedSize ?? null,
    }));
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(stored));
  }, [cartItems, currentUser, guestStorageReady]);

  // ---------------------------------------------------------------
  // Cart strategy: OPTION A — every quantity change is committed to
  // Supabase, debounced 400ms so rapid +/- clicks coalesce into one
  // round-trip. The in-memory cart is the UI source of truth; Supabase
  // is the persistence layer that survives reload and follows the user
  // across devices.
  //
  // The flush uses a "snapshot from ref" + "in-flight + dirty" pair so
  // that:
  //   1. A write started while the user is still clicking commits the
  //      latest cart state, not the snapshot at the moment the timer
  //      fired.
  //   2. If state changes during the in-flight write, we re-flush
  //      immediately afterwards instead of dropping the change.
  // ---------------------------------------------------------------
  useEffect(() => {
    latestCartRef.current = cartItems;
    cartWriteDirty.current = true;
  }, [cartItems]);

  useEffect(() => {
    latestWishlistRef.current = wishlistIds;
    wishlistWriteDirty.current = true;
  }, [wishlistIds]);

  // 3. After hydration, push every cart change back to Supabase (debounced).
  useEffect(() => {
    if (!supabase || !currentUser || !hydratedFromSupabase.current) return;
    const userId = currentUser.id;

    const flushCart = async () => {
      if (cartWriteInFlight.current) {
        // A write is already running. Mark as dirty; the in-flight
        // write's tail-call will re-flush with the latest snapshot.
        cartWriteDirty.current = true;
        return;
      }
      cartWriteInFlight.current = true;
      cartWriteDirty.current = false;
      try {
        const snapshot = latestCartRef.current;
        const { error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId);
        if (deleteError) {
          console.error("[supabase] cart delete failed", deleteError.message);
        }
        if (snapshot.length > 0) {
          const rows = snapshot.map((item) => ({
            user_id: userId,
            product_id: item.id,
            quantity: item.quantity,
            selected_variant: item.selectedVariant ?? null,
            selected_size: item.selectedSize ?? null,
          }));
          const { error: insertError } = await supabase
            .from("cart_items")
            .insert(rows);
          if (insertError) {
            console.error("[supabase] cart insert failed", insertError.message);
          }
        }
      } finally {
        cartWriteInFlight.current = false;
        if (cartWriteDirty.current) {
          // Latest cart state changed while we were writing — go again.
          cartWriteDirty.current = false;
          await flushCart();
        }
      }
    };

    if (cartWriteTimer.current) clearTimeout(cartWriteTimer.current);
    cartWriteTimer.current = setTimeout(() => {
      void flushCart();
    }, 400);

    return () => {
      if (cartWriteTimer.current) clearTimeout(cartWriteTimer.current);
    };
  }, [cartItems, currentUser, supabase]);

  // 4. After hydration, push every wishlist change back to Supabase.
  useEffect(() => {
    if (!supabase || !currentUser || !hydratedFromSupabase.current) return;
    const userId = currentUser.id;

    const flushWishlist = async () => {
      if (wishlistWriteInFlight.current) {
        wishlistWriteDirty.current = true;
        return;
      }
      wishlistWriteInFlight.current = true;
      wishlistWriteDirty.current = false;
      try {
        const snapshot = latestWishlistRef.current;
        const { error: deleteError } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", userId);
        if (deleteError) {
          console.error(
            "[supabase] wishlist delete failed",
            deleteError.message,
          );
        }
        if (snapshot.length > 0) {
          const rows = snapshot.map((productId) => ({
            user_id: userId,
            product_id: productId,
          }));
          const { error: insertError } = await supabase
            .from("wishlist_items")
            .insert(rows);
          if (insertError) {
            console.error(
              "[supabase] wishlist insert failed",
              insertError.message,
            );
          }
        }
      } finally {
        wishlistWriteInFlight.current = false;
        if (wishlistWriteDirty.current) {
          wishlistWriteDirty.current = false;
          await flushWishlist();
        }
      }
    };

    if (wishlistWriteTimer.current) clearTimeout(wishlistWriteTimer.current);
    wishlistWriteTimer.current = setTimeout(() => {
      void flushWishlist();
    }, 400);

    return () => {
      if (wishlistWriteTimer.current) clearTimeout(wishlistWriteTimer.current);
    };
  }, [currentUser, supabase, wishlistIds]);

  const dismissAuthGate = useCallback(() => {
    setAuthGate(null);
  }, []);

  const openCartDrawer = useCallback(() => {
    setSearchOpen(false);
    setWishlistOpen(false);
    setCheckoutOpen(false);
    setQuickViewProduct(null);
    setCartOpen(true);
  }, []);

  const openWishlistDrawer = useCallback(() => {
    setSearchOpen(false);
    setCartOpen(false);
    setCheckoutOpen(false);
    setQuickViewProduct(null);
    setWishlistOpen(true);
  }, []);

  const addToCart = useCallback((
    product: Product,
    quantity = 1,
    options: AddToCartOptions = {},
  ) => {
    const quantityToAdd = Number.isFinite(quantity)
      ? Math.max(1, Math.floor(quantity))
      : 1;
    const selectedVariant = options.variant ?? product.variants?.[0];
    const selectedSize = options.size ?? product.sizes?.[0];
    const cartKey = [product.id, selectedVariant ?? "", selectedSize ?? ""].join(
      "::",
    );

    setCartItems((items) => {
      const existing = items.find((item) => item.cartKey === cartKey);

      if (existing) {
        return items.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item,
        );
      }

      return [
        ...items,
        {
          ...product,
          cartKey,
          quantity: quantityToAdd,
          selectedVariant,
          selectedSize,
        },
      ];
    });

    if (options.openCart) {
      openCartDrawer();
    }

    showToast(`${product.name} is now in your cart.`);
  }, [openCartDrawer, showToast]);

  const buyNow = useCallback((
    product: Product,
    quantity = 1,
    options: AddToCartOptions = {},
  ) => {
    addToCart(product, quantity, options);
    setQuickViewProduct(null);

    if (!isAuthenticated) {
      setCartOpen(false);
      setCheckoutOpen(true);
      showToast("Sign in to continue to checkout.", "error");
      return;
    }

    setCheckoutOpen(true);
  }, [addToCart, isAuthenticated, showToast]);

  // ---- Auth-gated request fns ----
  // Components attached to user-facing "Add to cart" / "Save" buttons
  // call these. For authed shoppers they fall through to the direct
  // action; for guests they capture the intent and open the modal so
  // the user can sign up / log in / (cart only) continue as guest.

  const requestAddToCart = useCallback(
    (product: Product, quantity = 1, options: AddToCartOptions = {}) => {
      if (isAuthenticated) {
        addToCart(product, quantity, options);
        return;
      }
      setAuthGate({
        kind: "cart",
        productId: product.id,
        productName: product.name,
        quantity: Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1)),
        options,
      });
    },
    [addToCart, isAuthenticated],
  );

  const requestBuyNow = useCallback(
    (product: Product, quantity = 1, options: AddToCartOptions = {}) => {
      if (isAuthenticated) {
        buyNow(product, quantity, options);
        return;
      }
      // Guest "Buy now" funnels through the same gate as add-to-cart;
      // checkout requires auth anyway, so signing in is the productive
      // next step. We close the quick-view modal so the gate isn't
      // sitting behind another overlay.
      setQuickViewProduct(null);
      setAuthGate({
        kind: "cart",
        productId: product.id,
        productName: product.name,
        quantity: Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1)),
        options,
      });
    },
    [buyNow, isAuthenticated],
  );

  const updateCartQuantity = useCallback((cartKey: string, amount: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeCartItem = useCallback((cartKey: string) => {
    const item = cartItems.find((cartItem) => cartItem.cartKey === cartKey);
    setCartItems((items) =>
      items.filter((cartItem) => cartItem.cartKey !== cartKey),
    );

    if (item) {
      showToast(`${item.name} removed from cart.`, "error");
    }
  }, [cartItems, showToast]);

  const clearCartLocal = useCallback(() => {
    setCartItems([]);
    setDiscountCode("");
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.has(productId),
    [wishlist],
  );

  const toggleWishlist = useCallback((product: Product) => {
    // Wishlist is account-only. Guards above (the request fn + the
    // sign-out reset) make sure this only runs for authed users, but
    // we double-check here so a stray caller can't silently drop items
    // into a guest in-memory wishlist that never persists anywhere.
    if (!isAuthenticated) return;

    const alreadySaved = isWishlisted(product.id);

    setWishlistIds((current) =>
      current.includes(product.id)
        ? current.filter((productId) => productId !== product.id)
        : [...current, product.id],
    );

    showToast(
      `${product.name} ${alreadySaved ? "removed from" : "saved to"} wishlist.`,
      alreadySaved ? "error" : "success",
    );
  }, [isAuthenticated, isWishlisted, showToast]);

  const requestToggleWishlist = useCallback(
    (product: Product) => {
      if (isAuthenticated) {
        toggleWishlist(product);
        return;
      }
      setAuthGate({
        kind: "wishlist",
        productId: product.id,
        productName: product.name,
      });
    },
    [isAuthenticated, toggleWishlist],
  );

  const markViewed = useCallback((productId: string) => {
    setRecentlyViewed((current) => [
      productId,
      ...current.filter((item) => item !== productId),
    ].slice(0, 6));
  }, []);

  // Replay a pending auth-gate action once the visitor finishes signing
  // in. The modal stashed the intent in sessionStorage before routing
  // to /auth/login or /auth/register; here we pick it up, look up the
  // product in the live catalog, and run the underlying cart / wishlist
  // action against the now-authenticated session. The ref guard makes
  // sure we replay at most once per signed-in user. Calling
  // addToCart / toggleWishlist from an effect is the same external-
  // state-transition exception used by the sign-in / sign-out effects.
  const replayedForUserId = useRef<string | null>(null);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!currentUser) {
      replayedForUserId.current = null;
      return;
    }
    if (replayedForUserId.current === currentUser.id) return;

    const pending = readPendingAuthGate();
    if (!pending) {
      replayedForUserId.current = currentUser.id;
      return;
    }

    const product = productsById.get(pending.productId);
    if (!product) {
      // Product disappeared from the catalog between request and
      // sign-in — drop the pending intent rather than silently failing.
      clearPendingAuthGate();
      replayedForUserId.current = currentUser.id;
      return;
    }

    if (pending.kind === "cart") {
      addToCart(product, pending.quantity, pending.options);
    } else {
      // Only add the item if it isn't already saved (toggle would
      // otherwise remove it on replay, which is the opposite of intent).
      if (!latestWishlistRef.current.includes(product.id)) {
        toggleWishlist(product);
      }
    }

    clearPendingAuthGate();
    replayedForUserId.current = currentUser.id;
  }, [addToCart, currentUser, productsById, toggleWishlist]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const startCheckout = useCallback(() => {
    if (!cartItems.length) {
      showToast("Add a skincare essential before entering secure checkout.", "error");
      return;
    }

    if (!isAuthenticated) {
      setCartOpen(false);
      setCheckoutOpen(true);
      showToast("Sign in to continue to checkout.", "error");
      return;
    }

    setCartOpen(false);
    setCheckoutOpen(true);
  }, [cartItems.length, isAuthenticated, showToast]);

  const cartValue = useMemo<CartStore>(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      shipping,
      tax,
      cartTotal,
      discountCode,
      requestAddToCart,
      requestBuyNow,
      addToCart,
      buyNow,
      updateCartQuantity,
      removeCartItem,
      clearCartLocal,
      setDiscountCode,
      startCheckout,
    }),
    [
      addToCart,
      buyNow,
      cartCount,
      cartItems,
      cartSubtotal,
      cartTotal,
      clearCartLocal,
      discountCode,
      removeCartItem,
      requestAddToCart,
      requestBuyNow,
      shipping,
      startCheckout,
      tax,
      updateCartQuantity,
    ],
  );

  const wishlistValue = useMemo<WishlistStore>(
    () => ({
      wishlist,
      wishlistCount,
      isWishlisted,
      requestToggleWishlist,
      toggleWishlist,
    }),
    [
      isWishlisted,
      requestToggleWishlist,
      toggleWishlist,
      wishlist,
      wishlistCount,
    ],
  );

  const uiValue = useMemo<UIStore>(
    () => ({
      toast,
      cartOpen,
      searchOpen,
      wishlistOpen,
      checkoutOpen,
      quickViewProduct,
      recentlyViewed,
      authGate,
      setCartOpen,
      setSearchOpen,
      setWishlistOpen,
      setCheckoutOpen,
      setQuickViewProduct,
      openCartDrawer,
      openWishlistDrawer,
      markViewed,
      showToast,
      dismissAuthGate,
    }),
    [
      authGate,
      cartOpen,
      checkoutOpen,
      dismissAuthGate,
      markViewed,
      openCartDrawer,
      openWishlistDrawer,
      quickViewProduct,
      recentlyViewed,
      searchOpen,
      showToast,
      toast,
      wishlistOpen,
    ],
  );

  return (
    <CartContext.Provider value={cartValue}>
      <WishlistContext.Provider value={wishlistValue}>
        <UIContext.Provider value={uiValue}>{children}</UIContext.Provider>
      </WishlistContext.Provider>
    </CartContext.Provider>
  );
}

export function useCartStore(): CartStore {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartStore must be used inside StoreProvider");
  }
  return context;
}

export function useWishlistStore(): WishlistStore {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlistStore must be used inside StoreProvider");
  }
  return context;
}

export function useUIStore(): UIStore {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIStore must be used inside StoreProvider");
  }
  return context;
}
