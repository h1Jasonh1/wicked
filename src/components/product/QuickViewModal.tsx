"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/types/product";
import {
  useCartStore,
  useUIStore,
  useWishlistStore,
} from "@/store/StoreProvider";
import { Icon } from "@/components/ui/Icons";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantitySelector, VariantSelectors } from "@/components/product/ProductControls";
import { Stars } from "@/components/product/ProductCard";
import styles from "@/styles/store.module.css";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct } = useUIStore();

  return (
    <div
      className={`${styles.overlay} ${
        quickViewProduct ? styles.overlayOpen : ""
      }`}
      aria-hidden={!quickViewProduct}
    >
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close quick view overlay"
        onClick={() => setQuickViewProduct(null)}
      />
      {quickViewProduct ? (
        <QuickViewContent key={quickViewProduct.id} product={quickViewProduct} />
      ) : null}
    </div>
  );
}

function QuickViewContent({ product }: { product: Product }) {
  const { requestAddToCart, requestBuyNow } = useCartStore();
  const { isWishlisted, requestToggleWishlist } = useWishlistStore();
  const { setQuickViewProduct } = useUIStore();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const saved = isWishlisted(product.id);

  return (
    <section
      className={`${styles.modal} ${styles.quickModalGrid}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view for ${product.name}`}
    >
      <button
        className={styles.quickClose}
        type="button"
        aria-label="Close quick view"
        onClick={() => setQuickViewProduct(null)}
      >
        <Icon name="close" />
      </button>
      <ProductGallery
        activeImage={activeImage}
        ariaLabel="Quick view gallery"
        mainClassName={styles.quickImage}
        onImageChange={setActiveImage}
        product={product}
      />
      <div className={styles.quickModalContent}>
        <span className={styles.eyebrow}>{product.category}</span>
        <h2 className={styles.productTitle}>{product.name}</h2>
        <p className={styles.mutedText}>{product.description}</p>
        <Stars rating={product.rating} reviews={product.reviews} />
        <div className={styles.productPriceRow}>
          {product.compareAt ? (
            <span className={styles.comparePrice}>{formatPrice(product.compareAt)}</span>
          ) : null}
          <strong className={styles.productPrice}>{formatPrice(product.price)}</strong>
          <span className={styles.pill}>{product.stockNote}</span>
        </div>
        <VariantSelectors
          product={product}
          selectedVariant={selectedVariant}
          selectedSize={selectedSize}
          onVariantChange={setSelectedVariant}
          onSizeChange={setSelectedSize}
        />
        <div className={styles.productActions}>
          <QuantitySelector quantity={quantity} onChange={setQuantity} />
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() =>
              requestAddToCart(product, quantity, {
                variant: selectedVariant,
                size: selectedSize,
                openCart: true,
              })
            }
          >
            Add to cart
            <Icon name="bag" />
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() =>
              requestBuyNow(product, quantity, {
                variant: selectedVariant,
                size: selectedSize,
              })
            }
          >
            Buy now
          </button>
          <button
            className={styles.textButton}
            type="button"
            aria-pressed={saved}
            onClick={() => requestToggleWishlist(product)}
          >
            {saved ? "Saved" : "Save"}
            <Icon name="heart" />
          </button>
        </div>
        <Link
          className={styles.textButton}
          href={`/product/${product.slug}`}
          onClick={() => setQuickViewProduct(null)}
        >
          Full product page
          <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}
