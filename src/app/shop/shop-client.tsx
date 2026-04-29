"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product } from "@/app/data/store";
import { categories, collections, formatPrice, shopFilters } from "@/app/data/store";
import { Icon } from "@/app/components/Icons";
import { ProductCard } from "@/app/components/ProductCard";
import styles from "@/app/components/Store.module.css";

type SortOption =
  | "Featured"
  | "Newest"
  | "Price Low to High"
  | "Price High to Low"
  | "Best Rated";

const sortOptions: SortOption[] = [
  "Featured",
  "Newest",
  "Price Low to High",
  "Price High to Low",
  "Best Rated",
];

const categoryCards = [
  {
    category: "Cleansers",
    label: "Cleansers",
  },
  {
    category: "Serums",
    label: "Serums",
  },
  {
    category: "Moisturisers",
    label: "Moisturisers",
  },
  {
    category: "Toners",
    label: "Toners",
  },
  {
    category: "Sunscreen / SPF",
    label: "SPF",
  },
  {
    category: "Masks",
    label: "Masks",
  },
  {
    category: "Eye Care",
    label: "Eye Care",
  },
  {
    category: "Sets / Bundles",
    label: "Bundles",
  },
];

export default function ShopClient({
  initialCategory,
  initialCollection,
  initialFilter,
  initialQuery,
  products,
}: {
  initialCategory: string;
  initialCollection: string;
  initialFilter: string;
  initialQuery: string;
  products: Product[];
}) {
  const maxProductPrice = Math.max(...products.map((product) => product.price));
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [collection, setCollection] = useState(initialCollection);
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState<SortOption>("Featured");
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const sortRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [filtersOpen]);

  useEffect(() => {
    if (!sortOpen) {
      return;
    }

    const closeOnPointerDown = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnPointerDown);

    return () => document.removeEventListener("pointerdown", closeOnPointerDown);
  }, [sortOpen]);

  useEffect(() => {
    if (!sortOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      sortListRef.current
        ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
        ?.focus();
    });
  }, [sort, sortOpen]);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesQuery = term
        ? [
            product.name,
            product.category,
            product.collection,
            product.tag,
            product.description,
          ]
            .join(" ")
            .toLowerCase()
            .includes(term)
        : true;
      const matchesCategory =
        category === "All" || product.category === category;
      const matchesCollection =
        collection === "All" || product.collection === collection;
      const matchesFilter =
        filter === "All" ||
        product.filters.includes(filter as Product["filters"][number]);
      const matchesPrice = product.price <= maxPrice;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesCollection &&
        matchesFilter &&
        matchesPrice
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "Newest") {
        return b.releaseRank - a.releaseRank;
      }

      if (sort === "Price Low to High") {
        return a.price - b.price;
      }

      if (sort === "Price High to Low") {
        return b.price - a.price;
      }

      if (sort === "Best Rated") {
        return b.rating - a.rating;
      }

      return b.reviews - a.reviews;
    });
  }, [category, collection, filter, maxPrice, products, query, sort]);

  const hasActiveFilters =
    query.trim() !== "" ||
    category !== "All" ||
    collection !== "All" ||
    filter !== "All" ||
    maxPrice < maxProductPrice;

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setCollection("All");
    setFilter("All");
    setMaxPrice(maxProductPrice);
  };

  const scrollToProducts = () => {
    const productSection = document.getElementById("shop-products");

    if (!productSection) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    productSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleCategorySelect = (nextCategory: string) => {
    setQuery("");
    setCategory(nextCategory);
    setCollection("All");
    setFilter("All");
    setMaxPrice(maxProductPrice);
    window.requestAnimationFrame(scrollToProducts);
  };

  const filterPanelProps = {
    category,
    collection,
    filter,
    maxPrice,
    maxProductPrice,
    onReset: resetFilters,
    onCategoryChange: setCategory,
    onCollectionChange: setCollection,
    onFilterChange: setFilter,
    onMaxPriceChange: setMaxPrice,
  };

  const desktopFilterControls = (
    <FilterPanel
      {...filterPanelProps}
      priceFilterId="desktop-price-filter"
    />
  );

  const mobileFilterControls = (
    <FilterPanel
      {...filterPanelProps}
      onReset={() => {
        resetFilters();
        setFiltersOpen(false);
      }}
      priceFilterId="mobile-price-filter"
    />
  );

  const focusSortOption = (index: number) => {
    const options = sortListRef.current?.querySelectorAll<HTMLButtonElement>(
      "[data-sort-option]",
    );

    options?.[index]?.focus();
  };

  const handleSortSelect = (nextSort: SortOption) => {
    setSort(nextSort);
    setSortOpen(false);
    sortButtonRef.current?.focus();
  };

  const handleSortButtonKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setSortOpen(true);
    }
  };

  const handleSortOptionKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    option: SortOption,
  ) => {
    const currentIndex = sortOptions.indexOf(option);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSortOption((currentIndex + 1) % sortOptions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSortOption(
        (currentIndex - 1 + sortOptions.length) % sortOptions.length,
      );
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusSortOption(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusSortOption(sortOptions.length - 1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSortOpen(false);
      sortButtonRef.current?.focus();
      return;
    }

    if (event.key === "Tab") {
      setSortOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSortSelect(option);
    }
  };

  return (
    <main>
      <section className={`${styles.shopPage} ${styles.shopBrowsePage}`} id="shop-products">
        <div className={styles.shopProductHeader}>
          <div>
            <span className={styles.eyebrow}>Shop WICKED</span>
            <h1>Shop all</h1>
          </div>
          <div className={styles.shopResultMeta} aria-live="polite">
            <span>{visibleProducts.length} products</span>
            <span>
              {category === "All" ? "All categories" : category}
            </span>
            {hasActiveFilters ? (
              <button className={styles.textButton} type="button" onClick={resetFilters}>
                Reset filters
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.shopCategoryGrid} aria-label="Quick category filters">
          {categoryCards.map((card) => (
            <button
              className={`${styles.shopCategoryCard} ${
                category === card.category ? styles.shopCategoryCardActive : ""
              }`}
              key={card.category}
              type="button"
              aria-pressed={category === card.category}
              onClick={() => handleCategorySelect(card.category)}
            >
              {card.label}
            </button>
          ))}
        </div>

        <div className={styles.shopLayout}>
          <div className={styles.desktopFilter}>{desktopFilterControls}</div>
          <div className={styles.shopListing}>
            <div className={styles.shopTools}>
              <div className={styles.toolRow}>
                <div className={styles.shopSearchField}>
                  <Icon name="search" />
                  <label className={styles.srOnly} htmlFor="shop-search">
                    Search within products
                  </label>
                  <input
                    className={styles.input}
                    id="shop-search"
                    type="search"
                    value={query}
                    placeholder="Search cleanser, niacinamide, SPF..."
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div
                  className={`${styles.sortSelect} ${
                    sortOpen ? styles.sortSelectOpen : ""
                  }`}
                  ref={sortRef}
                >
                  <button
                    className={styles.sortSelectButton}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                    aria-controls="shop-sort-options"
                    onClick={() => setSortOpen((open) => !open)}
                    onKeyDown={handleSortButtonKeyDown}
                    ref={sortButtonRef}
                  >
                    <span className={styles.srOnly}>Sort products</span>
                    <span>{sort}</span>
                    <Icon name="up" />
                  </button>
                  <div
                    className={styles.sortSelectMenu}
                    id="shop-sort-options"
                    role="listbox"
                    aria-label="Sort products"
                    aria-hidden={!sortOpen}
                    ref={sortListRef}
                  >
                    {sortOptions.map((option) => (
                      <button
                        className={
                          sort === option ? styles.sortSelectOptionActive : ""
                        }
                        key={option}
                        type="button"
                        role="option"
                        aria-selected={sort === option}
                        data-sort-option
                        tabIndex={sortOpen ? 0 : -1}
                        onClick={() => handleSortSelect(option)}
                        onKeyDown={(event) => handleSortOptionKeyDown(event, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className={styles.filterToggle}
                  type="button"
                  aria-expanded={filtersOpen}
                  onClick={() => setFiltersOpen(true)}
                >
                  <Icon name="filter" />
                  Filters
                </button>
              </div>
            </div>

            {loading ? (
              <div className={styles.shopProductGrid} aria-label="Loading products">
                {Array.from({ length: 6 }).map((_, index) => (
                  <article className={styles.skeletonCard} key={index}>
                    <span className={styles.skeletonBlock} />
                    <span className={styles.skeletonLine} />
                    <span className={styles.skeletonLine} />
                    <span className={styles.skeletonLine} />
                  </article>
                ))}
              </div>
            ) : visibleProducts.length ? (
              <div className={styles.shopProductGrid}>
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div>
                  <h3>No skincare matches this routine.</h3>
                  <p className={styles.mutedText}>
                    Broaden your filters or reset the price range to view the
                    full WICKED catalogue.
                  </p>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div
        className={`${styles.shopMobilePanel} ${
          filtersOpen ? styles.shopMobilePanelOpen : ""
        }`}
        aria-hidden={!filtersOpen}
      >
        <button
          className={styles.shopMobileBackdrop}
          type="button"
          aria-label="Close shop filters"
          onClick={() => setFiltersOpen(false)}
        />
        <div
          className={styles.shopMobileFilterSheet}
          role="dialog"
          aria-modal="true"
          aria-label="Shop filters"
        >
          {mobileFilterControls}
          <div className={styles.mobileFilterActions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => setFiltersOpen(false)}
            >
              Close
            </button>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => setFiltersOpen(false)}
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function FilterPanel({
  category,
  collection,
  filter,
  maxPrice,
  maxProductPrice,
  priceFilterId,
  onReset,
  onCategoryChange,
  onCollectionChange,
  onFilterChange,
  onMaxPriceChange,
}: {
  category: string;
  collection: string;
  filter: string;
  maxPrice: number;
  maxProductPrice: number;
  priceFilterId: string;
  onReset: () => void;
  onCategoryChange: (value: string) => void;
  onCollectionChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onMaxPriceChange: (value: number) => void;
}) {
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
