"use client";

import type { Product } from "@/types/product";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/store.module.css";

export function VariantSelectors({
  product,
  selectedVariant,
  selectedSize,
  onVariantChange,
  onSizeChange,
}: {
  product: Product;
  selectedVariant: string;
  selectedSize: string;
  onVariantChange: (value: string) => void;
  onSizeChange: (value: string) => void;
}) {
  return (
    <>
      {product.variants?.length ? (
        <div className={styles.variantGroup}>
          <span>Formula option</span>
          <div className={styles.variantOptions}>
            {product.variants.map((variant) => (
              <button
                className={selectedVariant === variant ? styles.variantActive : ""}
                key={variant}
                type="button"
                aria-pressed={selectedVariant === variant}
                onClick={() => onVariantChange(variant)}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {product.sizes?.length ? (
        <div className={styles.variantGroup}>
          <span>Size</span>
          <div className={styles.variantOptions}>
            {product.sizes.map((size) => (
              <button
                className={selectedSize === size ? styles.variantActive : ""}
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                onClick={() => onSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function QuantitySelector({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className={styles.quantity} aria-label="Quantity selector">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, quantity - 1))}
      >
        <Icon name="minus" />
      </button>
      <span>{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
