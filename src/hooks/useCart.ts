"use client";

import { useCartStore, useUIStore } from "@/store/StoreProvider";

/**
 * Convenience hook combining cart state and the UI bits a typical cart
 * consumer needs (open the drawer, the checkout drawer, etc.). Pulls
 * from two separate contexts under the hood so callers that don't need
 * UI flags can reach for `useCartStore` directly and skip those re-renders.
 *
 * `requestAddToCart` / `requestBuyNow` are the user-facing action fns —
 * they open the auth gate modal for guests. The bare `addToCart` /
 * `buyNow` bypass the gate and should only be used from the modal's
 * "Continue as guest" path or the post-sign-in replay.
 */
export function useCart() {
  const cart = useCartStore();
  const ui = useUIStore();

  return {
    addToCart: cart.addToCart,
    buyNow: cart.buyNow,
    cartCount: cart.cartCount,
    cartItems: cart.cartItems,
    cartOpen: ui.cartOpen,
    cartSubtotal: cart.cartSubtotal,
    cartTotal: cart.cartTotal,
    checkoutOpen: ui.checkoutOpen,
    clearCartLocal: cart.clearCartLocal,
    discountCode: cart.discountCode,
    openCartDrawer: ui.openCartDrawer,
    removeCartItem: cart.removeCartItem,
    requestAddToCart: cart.requestAddToCart,
    requestBuyNow: cart.requestBuyNow,
    setCartOpen: ui.setCartOpen,
    setCheckoutOpen: ui.setCheckoutOpen,
    setDiscountCode: cart.setDiscountCode,
    shipping: cart.shipping,
    startCheckout: cart.startCheckout,
    tax: cart.tax,
    updateCartQuantity: cart.updateCartQuantity,
  };
}
