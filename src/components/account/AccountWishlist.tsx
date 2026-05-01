"use client";

import Link from "next/link";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/formatters";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductVisual } from "@/components/product/ProductCard";
import styles from "@/styles/store.module.css";

export function AccountWishlist() {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const savedProducts = products.filter((product) => isWishlisted(product.id));

  if (!savedProducts.length) {
    return (
      <div className={styles.emptyState}>
        <div>
          <h3>Your wishlist is empty.</h3>
          <p className={styles.mutedText}>
            Saved products will appear here once wishlist persistence is linked
            to customer accounts.
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
            onClick={() => toggleWishlist(product)}
          >
            Remove
          </button>
        </article>
      ))}
    </div>
  );
}
