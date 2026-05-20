import type { Product } from "./product";

export type CartItem = Product & {
  cartKey: string;
  quantity: number;
  selectedVariant?: string;
  selectedSize?: string;
};

export type Toast = {
  message: string;
  type: "success" | "error";
};

export type AddToCartOptions = {
  variant?: string;
  size?: string;
  openCart?: boolean;
};

// What the AuthGateModal is currently presenting. Captured at the
// moment a guest tries to add to cart or save a wishlist item, so the
// modal can reference the product by name, the "Continue as Guest"
// path can complete the original action, and a successful sign-in can
// replay the action against the now-authenticated session.
export type AuthGate =
  | {
      kind: "cart";
      productId: string;
      productName: string;
      quantity: number;
      options: AddToCartOptions;
    }
  | {
      kind: "wishlist";
      productId: string;
      productName: string;
    };
