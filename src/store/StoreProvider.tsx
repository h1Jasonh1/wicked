"use client";

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AddToCartOptions, CartItem, Toast } from "@/types/cart";
import type { Product } from "@/types/product";
import { useAuth } from "@/components/auth/AuthProvider";

const CART_ACCOUNT_PROMPT_KEY = "wicked.cartAccountPromptShown";

export type StoreContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  cartTotal: number;
  wishlist: ReadonlySet<string>;
  wishlistCount: number;
  recentlyViewed: string[];
  toast: Toast | null;
  cartOpen: boolean;
  searchOpen: boolean;
  wishlistOpen: boolean;
  checkoutOpen: boolean;
  cartAccountPromptVisible: boolean;
  quickViewProduct: Product | null;
  discountCode: string;
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
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  markViewed: (productId: string) => void;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: Dispatch<SetStateAction<boolean>>;
  setWishlistOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  openCartDrawer: () => void;
  openWishlistDrawer: () => void;
  dismissCartAccountPrompt: () => void;
  setDiscountCode: (code: string) => void;
  startCheckout: () => void;
  placeOrder: () => void;
  showToast: (message: string, type?: Toast["type"]) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartAccountPromptVisible, setCartAccountPromptVisible] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [discountCode, setDiscountCode] = useState("");

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
  const discount = useMemo(
    () =>
      discountCode.trim().toUpperCase() === "WICKED10"
        ? Math.round(cartSubtotal * 0.1)
        : 0,
    [cartSubtotal, discountCode],
  );
  const shipping = useMemo(
    () => (cartSubtotal === 0 || cartSubtotal - discount >= 750 ? 0 : 95),
    [cartSubtotal, discount],
  );
  const tax = useMemo(
    () =>
      cartSubtotal === 0
        ? 0
        : Math.round(((cartSubtotal - discount) * 15) / 115),
    [cartSubtotal, discount],
  );
  const cartTotal = useMemo(
    () => Math.max(0, cartSubtotal - discount + shipping),
    [cartSubtotal, discount, shipping],
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

  const promptForAccountAfterCartAdd = useCallback(() => {
    if (isAuthenticated) {
      return;
    }

    const hasSeenPrompt =
      window.sessionStorage.getItem(CART_ACCOUNT_PROMPT_KEY) === "true";

    if (hasSeenPrompt) {
      return;
    }

    window.sessionStorage.setItem(CART_ACCOUNT_PROMPT_KEY, "true");
    setCartAccountPromptVisible(true);
    showToast("Create an account to secure your cart and complete checkout.");
  }, [isAuthenticated, showToast]);

  const dismissCartAccountPrompt = useCallback(() => {
    setCartAccountPromptVisible(false);
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
    promptForAccountAfterCartAdd();
  }, [openCartDrawer, promptForAccountAfterCartAdd, showToast]);

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

  const isWishlisted = useCallback(
    (productId: string) => wishlist.has(productId),
    [wishlist],
  );

  const toggleWishlist = useCallback((product: Product) => {
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
  }, [isWishlisted, showToast]);

  const markViewed = useCallback((productId: string) => {
    setRecentlyViewed((current) => [
      productId,
      ...current.filter((item) => item !== productId),
    ].slice(0, 6));
  }, []);

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

  const placeOrder = useCallback(() => {
    if (!cartItems.length) {
      showToast("Your cart is empty. Add a WICKED skincare essential to continue.", "error");
      return;
    }

    if (!isAuthenticated) {
      setCheckoutOpen(true);
      showToast("Sign in to continue to checkout.", "error");
      return;
    }

    setCartItems([]);
    setCheckoutOpen(false);
    setDiscountCode("");
    showToast("Order preview complete. A WICKED confirmation email would be sent next.");
  }, [cartItems.length, isAuthenticated, showToast]);

  const value: StoreContextValue = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      discount,
      shipping,
      tax,
      cartTotal,
      wishlist,
      wishlistCount,
      recentlyViewed,
      toast,
      cartOpen,
      searchOpen,
      wishlistOpen,
      checkoutOpen,
      cartAccountPromptVisible,
      quickViewProduct,
      discountCode,
      addToCart,
      buyNow,
      updateCartQuantity,
      removeCartItem,
      isWishlisted,
      toggleWishlist,
      markViewed,
      setCartOpen,
      setSearchOpen,
      setWishlistOpen,
      setCheckoutOpen,
      setQuickViewProduct,
      openCartDrawer,
      openWishlistDrawer,
      dismissCartAccountPrompt,
      setDiscountCode,
      startCheckout,
      placeOrder,
      showToast,
    }),
    [
      addToCart,
      buyNow,
      cartCount,
      cartItems,
      cartOpen,
      cartSubtotal,
      cartTotal,
      checkoutOpen,
      cartAccountPromptVisible,
      discount,
      discountCode,
      dismissCartAccountPrompt,
      isWishlisted,
      markViewed,
      openCartDrawer,
      openWishlistDrawer,
      placeOrder,
      quickViewProduct,
      recentlyViewed,
      removeCartItem,
      searchOpen,
      shipping,
      showToast,
      startCheckout,
      tax,
      toast,
      toggleWishlist,
      updateCartQuantity,
      wishlist,
      wishlistCount,
      wishlistOpen,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}
