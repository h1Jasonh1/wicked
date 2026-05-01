import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import styles from "@/styles/store.module.css";

export function ProductRail({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow: string;
  items: Product[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={eyebrow}>
        <h2>{title}</h2>
      </SectionHeading>
      <div className={styles.relatedGrid}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
