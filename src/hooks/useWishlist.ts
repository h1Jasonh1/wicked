"use client";

import { useUIStore, useWishlistStore } from "@/store/StoreProvider";

/**
 * Convenience hook for wishlist consumers — combines wishlist state
 * with the drawer open/close UI controls. Components that only need
 * isWishlisted/requestToggleWishlist (e.g. the heart on a product card)
 * can call `useWishlistStore` directly to avoid re-rendering on drawer
 * state changes.
 *
 * `requestToggleWishlist` is the user-facing action — for guests it
 * opens the auth gate modal because wishlist is account-only. The bare
 * `toggleWishlist` bypasses the gate and is only used by the post-sign-
 * in replay.
 */
export function useWishlist() {
  const wishlistStore = useWishlistStore();
  const ui = useUIStore();

  return {
    isWishlisted: wishlistStore.isWishlisted,
    openWishlistDrawer: ui.openWishlistDrawer,
    requestToggleWishlist: wishlistStore.requestToggleWishlist,
    setWishlistOpen: ui.setWishlistOpen,
    toggleWishlist: wishlistStore.toggleWishlist,
    wishlist: wishlistStore.wishlist,
    wishlistCount: wishlistStore.wishlistCount,
    wishlistOpen: ui.wishlistOpen,
  };
}
