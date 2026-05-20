"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/types/product";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  QuantitySelector,
  VariantSelectors,
} from "@/components/product/ProductControls";
import { ProductRail } from "@/components/sections/ProductRail";
import { Icon } from "@/components/ui/Icons";
import { Stars } from "@/components/product/ProductCard";
import {
  useCartStore,
  useUIStore,
  useWishlistStore,
} from "@/store/StoreProvider";
import styles from "@/styles/store.module.css";

export default function ProductPageClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { requestAddToCart, requestBuyNow } = useCartStore();
  const { isWishlisted, requestToggleWishlist } = useWishlistStore();
  const { markViewed, recentlyViewed } = useUIStore();
  const { productsById } = useCatalog();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => markViewed(product.id), 10);
    return () => window.clearTimeout(timer);
  }, [markViewed, product.id]);

  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewed
        .filter((id) => id !== product.id)
        .map((id) => productsById.get(id))
        .filter((item): item is Product => Boolean(item))
        .slice(0, 4),
    [product.id, productsById, recentlyViewed],
  );

  const selectedOptions = {
    variant: selectedVariant,
    size: selectedSize,
  };
  const saved = isWishlisted(product.id);

  return (
    <main>
      <section className={styles.productPage}>
        <div className={styles.productLayout}>
          <ProductGallery
            activeImage={activeImage}
            onImageChange={setActiveImage}
            product={product}
          />

          <div className={styles.productCopy}>
            <span className={styles.eyebrow}>{product.collection}</span>
            <div className={styles.productInlineBadges}>
              <span>{product.badge}</span>
              <span>{product.stockNote}</span>
            </div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.productPriceRow}>
              {product.compareAt ? (
                <span className={styles.comparePrice}>
                  {formatPrice(product.compareAt)}
                </span>
              ) : null}
              <strong className={styles.productPrice}>
                {formatPrice(product.price)}
              </strong>
              <Stars rating={product.rating} reviews={product.reviews} />
            </div>
            <p>{product.description}</p>
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
                    ...selectedOptions,
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
                onClick={() => requestBuyNow(product, quantity, selectedOptions)}
              >
                Buy now
              </button>
              <button
                className={styles.button}
                type="button"
                aria-pressed={saved}
                onClick={() => requestToggleWishlist(product)}
              >
                <Icon name="heart" />
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            <div className={styles.trustGrid}>
              <div className={styles.trustItem}>
                <Icon name="truck" />
                <strong>Delivery</strong>
                <span>{product.delivery}</span>
              </div>
              <div className={styles.trustItem}>
                <Icon name="return" />
                <strong>Returns</strong>
                <span>{product.returns}</span>
              </div>
              <div className={styles.trustItem}>
                <Icon name="shield" />
                <strong>Secure</strong>
                <span>Encrypted checkout with VAT-inclusive totals before payment.</span>
              </div>
            </div>

            <div className={styles.accordion}>
              <details open>
                <summary>Description</summary>
                <div className={styles.accordionContent}>
                  <p>{product.longDescription}</p>
                  <ul>
                    {product.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </details>
              <details>
                <summary>Product details</summary>
                <div className={styles.accordionContent}>
                  <ul>
                    {product.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </details>
              <details>
                <summary>Ingredients and specifications</summary>
                <div className={styles.accordionContent}>
                  <ul>
                    {product.specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                </div>
              </details>
              <details>
                <summary>Delivery information</summary>
                <div className={styles.accordionContent}>
                  <p>{product.delivery}</p>
                  <Link className={styles.textButton} href="/delivery">
                    Full delivery information
                    <Icon name="arrow" />
                  </Link>
                </div>
              </details>
              <details>
                <summary>Returns information</summary>
                <div className={styles.accordionContent}>
                  <p>{product.returns}</p>
                  <Link className={styles.textButton} href="/returns">
                    Returns and refunds policy
                    <Icon name="arrow" />
                  </Link>
                </div>
              </details>
              <details>
                <summary>Care or usage</summary>
                <div className={styles.accordionContent}>
                  <p>{product.care}</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <ProductRail
        eyebrow="Related products"
        title="Complete the routine."
        items={relatedProducts}
      />
      <ProductRail
        eyebrow="Recently viewed"
        title="Your recent skincare path."
        items={recentlyViewedProducts}
      />
    </main>
  );
}
