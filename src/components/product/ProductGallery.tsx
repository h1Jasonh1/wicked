"use client";

import { ProductVisual } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import styles from "@/styles/store.module.css";

export function ProductGallery({
  activeImage,
  ariaLabel = "Product gallery",
  mainClassName = styles.galleryMain,
  onImageChange,
  product,
}: {
  activeImage: number;
  ariaLabel?: string;
  mainClassName?: string;
  onImageChange: (index: number) => void;
  product: Product;
}) {
  return (
    <div className={styles.gallery}>
      <div className={mainClassName}>
        <ProductVisual product={product} scene={activeImage} />
      </div>
      <div className={styles.thumbGrid} aria-label={ariaLabel}>
        {product.gallery.map((image, index) => (
          <button
            className={`${styles.thumbButton} ${
              activeImage === index ? styles.activeThumb : ""
            }`}
            key={image}
            type="button"
            aria-label={`Show ${product.name} view ${index + 1}`}
            aria-pressed={activeImage === index}
            onClick={() => onImageChange(index)}
          >
            <ProductVisual product={product} compact scene={index} />
          </button>
        ))}
      </div>
    </div>
  );
}
