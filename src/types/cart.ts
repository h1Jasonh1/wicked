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
