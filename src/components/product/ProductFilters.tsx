"use client";

import { useMemo } from "react";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { collections, shopFilters } from "@/data/store";
import { formatPrice } from "@/lib/formatters";
import styles from "@/styles/store.module.css";

function uniqueValues<T extends string>(values: Iterable<T | undefined | null>) {
  const seen = new Set<T>();
  for (const value of values) {
    if (value) seen.add(value);
  }
  return Array.from(seen);
}

export function FilterPanel({
  category,
  collection,
  concern,
  filter,
  maxPrice,
  maxProductPrice,
  priceFilterId,
  skinType,
  onReset,
  onCategoryChange,
  onCollectionChange,
  onConcernChange,
  onFilterChange,
  onMaxPriceChange,
  onSkinTypeChange,
}: {
  category: string;
  collection: string;
  concern: string;
  filter: string;
  maxPrice: number;
  maxProductPrice: number;
  priceFilterId: string;
  skinType: string;
  onReset: () => void;
  onCategoryChange: (value: string) => void;
  onCollectionChange: (value: string) => void;
  onConcernChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onMaxPriceChange: (value: number) => void;
  onSkinTypeChange: (value: string) => void;
}) {
  const { products } = useCatalog();
  const categories = useMemo(
    () => ["All", ...uniqueValues(products.map((product) => product.category))],
    [products],
  );
  const skinTypeFilters = useMemo(
    () => [
      "All",
      ...uniqueValues(products.flatMap((product) => product.skinTypes)),
    ],
    [products],
  );
  const concernFilters = useMemo(
    () => [
      "All",
      ...uniqueValues(products.flatMap((product) => product.concerns)),
    ],
    [products],
  );

  return (
    <aside className={styles.filterPanel} aria-label="Shop filters">
      <div className={styles.drawerTop}>
        <div>
          <span className={styles.eyebrow}>Filters</span>
          <h2>Refine products</h2>
        </div>
        <button className={styles.textButton} type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className={styles.filterGroup}>
        <label>Category</label>
        {categories.map((item) => (
          <button
            className={category === item ? styles.activeChip : ""}
            key={item}
            type="button"
            onClick={() => onCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>Collection</label>
        <button
          className={collection === "All" ? styles.activeChip : ""}
          type="button"
          onClick={() => onCollectionChange("All")}
        >
          All
        </button>
        {collections.map((item) => (
          <button
            className={collection === item.name ? styles.activeChip : ""}
            key={item.slug}
            type="button"
            onClick={() => onCollectionChange(item.name)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>Skin type</label>
        {skinTypeFilters.map((item) => (
          <button
            className={skinType === item ? styles.activeChip : ""}
            key={item}
            type="button"
            onClick={() => onSkinTypeChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>Concern / application</label>
        {concernFilters.map((item) => (
          <button
            className={concern === item ? styles.activeChip : ""}
            key={item}
            type="button"
            onClick={() => onConcernChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label>Status</label>
        {shopFilters.map((item) => (
          <button
            className={filter === item ? styles.activeChip : ""}
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor={priceFilterId}>Maximum price</label>
        <input
          className={styles.range}
          id={priceFilterId}
          max={maxProductPrice}
          min={100}
          step={20}
          type="range"
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
        />
        <span className={styles.stockNote}>{formatPrice(maxPrice)}</span>
      </div>
    </aside>
  );
}
