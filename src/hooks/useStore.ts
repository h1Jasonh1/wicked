"use client";

// Legacy import path. Prefer the focused hooks from @/store/StoreProvider:
//   - useCartStore     (cart state + cart-related actions)
//   - useWishlistStore (wishlist state + isWishlisted/toggle)
//   - useUIStore       (drawer/modal state, toast, recently viewed)
// The convenience hooks @/hooks/useCart and @/hooks/useWishlist combine
// the relevant slices for typical consumers.
export {
  useCartStore,
  useWishlistStore,
  useUIStore,
} from "@/store/StoreProvider";
