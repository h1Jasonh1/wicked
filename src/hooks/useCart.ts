"use client";

import { useStore } from "@/store/StoreProvider";

export function useCart() {
  const {
    addToCart,
    buyNow,
    cartAccountPromptVisible,
    cartCount,
    cartItems,
    cartOpen,
    cartSubtotal,
    cartTotal,
    discount,
    discountCode,
    openCartDrawer,
    dismissCartAccountPrompt,
    placeOrder,
    removeCartItem,
    setCartOpen,
    setCheckoutOpen,
    setDiscountCode,
    shipping,
    startCheckout,
    tax,
    updateCartQuantity,
    checkoutOpen,
  } = useStore();

  return {
    addToCart,
    buyNow,
    cartAccountPromptVisible,
    cartCount,
    cartItems,
    cartOpen,
    cartSubtotal,
    cartTotal,
    checkoutOpen,
    discount,
    discountCode,
    dismissCartAccountPrompt,
    openCartDrawer,
    placeOrder,
    removeCartItem,
    setCartOpen,
    setCheckoutOpen,
    setDiscountCode,
    shipping,
    startCheckout,
    tax,
    updateCartQuantity,
  };
}
