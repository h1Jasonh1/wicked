"use client";

import Link from "next/link";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { formatPrice } from "@/lib/formatters";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductVisual } from "@/components/product/ProductCard";
import styles from "@/styles/store.module.css";

export function AccountWishlist() {
  const { products } = useCatalog();
  const { isWishlisted, requestToggleWishlist } = useWishlist();
  const savedProducts = products.filter((product) => isWishlisted(product.id));

  if (!savedProducts.length) {
    return (
      <div className={styles.emptyState}>
        <div>
          <h3>Your wishlist is empty.</h3>
          <p className={styles.mutedText}>
            Tap the heart on any product to save it here. Items sync across
            devices once you&apos;re signed in.
          </p>
          <Link className={styles.primaryButton} href="/shop">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accountProductGrid}>
      {savedProducts.map((product) => (
        <article className={styles.accountProductCard} key={product.id}>
          <Link className={styles.drawerThumb} href={`/product/${product.slug}`}>
            <ProductVisual product={product} compact />
          </Link>
          <div>
            <span className={styles.eyebrow}>{product.category}</span>
            <h3>{product.name}</h3>
            <strong>{formatPrice(product.price)}</strong>
          </div>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => requestToggleWishlist(product)}
          >
            Remove
          </button>
        </article>
      ))}
    </div>
  );
}
