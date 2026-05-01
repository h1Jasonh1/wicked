"use client";

import Link from "next/link";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/formatters";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Drawer } from "@/components/ui/Drawer";
import { ProductVisual } from "@/components/product/ProductCard";
import styles from "@/styles/store.module.css";

export function WishlistDrawer() {
  const { addToCart } = useCart();
  const { isWishlisted, setWishlistOpen, toggleWishlist, wishlistOpen } =
    useWishlist();
  const savedProducts = products.filter((product) => isWishlisted(product.id));

  return (
    <Drawer
      ariaLabel="Wishlist"
      eyebrow="Wishlist"
      title="Saved routine"
      open={wishlistOpen}
      onClose={() => setWishlistOpen(false)}
    >
      <div className={styles.drawerItems}>
        {savedProducts.length ? (
          savedProducts.map((product) => (
            <article className={styles.drawerItem} key={product.id}>
              <Link
                className={styles.drawerThumb}
                href={`/product/${product.slug}`}
                onClick={() => setWishlistOpen(false)}
              >
                <ProductVisual product={product} compact />
              </Link>
              <div>
                <h3>{product.name}</h3>
                <small>{formatPrice(product.price)}</small>
                <div className={styles.cardActions}>
                  <button
                    className={styles.textButton}
                    type="button"
                    onClick={() => {
                      setWishlistOpen(false);
                      addToCart(product, 1, { openCart: true });
                    }}
                  >
                    Add to cart
                  </button>
                  <button
                    className={styles.textButton}
                    type="button"
                    onClick={() => toggleWishlist(product)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div>
              <h3>Your saved routine is empty.</h3>
              <p className={styles.mutedText}>
                Use the heart to save formulas while you compare routines,
                textures, and skin goals.
              </p>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
