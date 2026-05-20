"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/store.module.css";
import {
  useCartStore,
  useUIStore,
  useWishlistStore,
} from "@/store/StoreProvider";

export function Stars({
  rating,
  reviews,
  compact = false,
}: {
  rating: number;
  reviews?: number;
  compact?: boolean;
}) {
  return (
    <span
      className={styles.rating}
      aria-label={`Rated ${rating.toFixed(1)} out of five${
        reviews ? ` from ${reviews} reviews` : ""
      }`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon key={index} name="star" />
      ))}
      <span>
        {rating.toFixed(1)}
        {reviews && !compact ? ` / ${reviews}` : ""}
      </span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { requestAddToCart } = useCartStore();
  const { isWishlisted, requestToggleWishlist } = useWishlistStore();
  const { setQuickViewProduct } = useUIStore();
  const saved = isWishlisted(product.id);

  return (
    <article className={styles.productCard}>
      <div className={styles.productImage}>
        <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <ProductVisual product={product} />
        </Link>
        <div className={styles.productBadges}>
          <span>{product.badge}</span>
          {product.compareAt ? (
            <span>Save {formatPrice(product.compareAt - product.price)}</span>
          ) : null}
        </div>
        <button
          className={`${styles.iconButton} ${styles.wishlistButton}`}
          type="button"
          aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${
            saved ? "from" : "to"
          } wishlist`}
          aria-pressed={saved}
          onClick={() => requestToggleWishlist(product)}
        >
          <Icon name="heart" />
        </button>
        <button
          className={`${styles.button} ${styles.quickButton}`}
          type="button"
          onClick={() => setQuickViewProduct(product)}
        >
          Quick view
        </button>
      </div>
      <div className={styles.productInfo}>
        <div className={styles.productTop}>
          <span className={styles.productKicker}>{product.tag}</span>
          <Stars rating={product.rating} reviews={product.reviews} compact />
        </div>
        <h3>
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className={styles.mutedText}>{product.description}</p>
        <span className={styles.stockNote}>{product.stockNote}</span>
        <div className={styles.productMeta}>
          <small>{product.category}</small>
          <span className={styles.priceStack}>
            {product.compareAt ? <span>{formatPrice(product.compareAt)}</span> : null}
            <strong>{formatPrice(product.price)}</strong>
          </span>
        </div>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => requestAddToCart(product, 1, { openCart: true })}
        >
          Add to cart
          <Icon name="bag" />
        </button>
      </div>
    </article>
  );
}

export function ProductVisual({
  compact = false,
  product,
  scene = 0,
}: {
  compact?: boolean;
  product: Product;
  scene?: number;
}) {
  const formClass = {
    dropper: styles.visualDropper,
    jar: styles.visualJar,
    pump: styles.visualPump,
    set: styles.visualSet,
    tube: styles.visualTube,
  }[product.visual.form];
  const visualStyle = {
    "--visual-accent": product.visual.accent,
    "--visual-tilt": `${scene % 2 === 0 ? -4 : 4}deg`,
  } as CSSProperties;

  return (
    <span
      aria-label={product.imageAlt}
      className={`${styles.productVisual} ${formClass} ${
        compact ? styles.productVisualCompact : ""
      }`}
      role="img"
      style={visualStyle}
    >
      <span className={styles.visualGlow} />
      <span className={styles.visualLine} />
      <span className={styles.visualLabel}>{product.visual.texture}</span>
      {product.visual.form === "set" ? (
        <span className={styles.visualSetGroup}>
          <span className={`${styles.mockProduct} ${styles.mockBottle}`}>
            <span className={styles.mockPump} />
            <span className={styles.mockLabel}>
              <strong>SOO</strong>
              <small>cleanse</small>
            </span>
          </span>
          <span className={`${styles.mockProduct} ${styles.mockDropper}`}>
            <span className={styles.mockDropperCap} />
            <span className={styles.mockLabel}>
              <strong>SOO</strong>
              <small>serum</small>
            </span>
          </span>
          <span className={`${styles.mockProduct} ${styles.mockJar}`}>
            <span className={styles.mockJarLid} />
            <span className={styles.mockLabel}>
              <strong>SOO</strong>
              <small>cream</small>
            </span>
          </span>
        </span>
      ) : (
        <span className={`${styles.mockProduct} ${mockClass(product.visual.form)}`}>
          {product.visual.form === "dropper" ? (
            <span className={styles.mockDropperCap} />
          ) : null}
          {product.visual.form === "pump" ? <span className={styles.mockPump} /> : null}
          {product.visual.form === "jar" ? <span className={styles.mockJarLid} /> : null}
          <span className={styles.mockLabel}>
            <strong>SOO</strong>
            <small>{product.category}</small>
          </span>
        </span>
      )}
    </span>
  );
}

function mockClass(form: Product["visual"]["form"]) {
  if (form === "dropper") {
    return styles.mockDropper;
  }

  if (form === "jar") {
    return styles.mockJar;
  }

  if (form === "tube") {
    return styles.mockTube;
  }

  return styles.mockBottle;
}
