"use client";

import { useStore } from "@/store/StoreProvider";

export function useWishlist() {
  const {
    isWishlisted,
    openWishlistDrawer,
    setWishlistOpen,
    toggleWishlist,
    wishlist,
    wishlistCount,
    wishlistOpen,
  } = useStore();

  return {
    isWishlisted,
    openWishlistDrawer,
    setWishlistOpen,
    toggleWishlist,
    wishlist,
    wishlistCount,
    wishlistOpen,
  };
}
