"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { categoryCards } from "@/data/categories";
import {
  getMaxProductPrice,
  getVisibleProducts,
  hasActiveProductFilters,
  sortOptions,
  type SortOption,
} from "@/lib/shop";
import type { Product } from "@/types/product";
import { useReducedMotionScroll } from "@/hooks/useOverlayControls";
import { Icon } from "@/components/ui/Icons";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterPanel } from "@/components/product/ProductFilters";
import styles from "@/styles/store.module.css";

export default function ShopClient({
  initialCategory,
  initialCollection,
  initialConcern,
  initialFilter,
  initialQuery,
  initialSkinType,
  products,
}: {
  initialCategory: string;
  initialCollection: string;
  initialConcern: string;
  initialFilter: string;
  initialQuery: string;
  initialSkinType: string;
  products: Product[];
}) {
  const maxProductPrice = getMaxProductPrice(products);
  const scrollIntoView = useReducedMotionScroll();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [collection, setCollection] = useState(initialCollection);
  const [skinType, setSkinType] = useState(initialSkinType);
  const [concern, setConcern] = useState(initialConcern);
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

    const frame = window.requestAnimationFrame(() => {
      sortListRef.current
        ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
        ?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [sort, sortOpen]);

  const filterState = useMemo(
    () => ({
      category,
      collection,
      concern,
      filter,
      maxPrice,
      query,
      skinType,
      sort,
    }),
    [category, collection, concern, filter, maxPrice, query, skinType, sort],
  );
  const visibleProducts = useMemo(
    () => getVisibleProducts(products, filterState),
    [filterState, products],
  );
  const hasActiveFilters = hasActiveProductFilters(
    filterState,
    maxProductPrice,
  );

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setCollection("All");
    setSkinType("All");
    setConcern("All");
    setFilter("All");
    setMaxPrice(maxProductPrice);
  };

  const scrollToProducts = () => {
    const productSection = document.getElementById("shop-products");

    if (!productSection) {
      return;
    }

    scrollIntoView(productSection);
  };

  const handleCategorySelect = (nextCategory: string) => {
    setQuery("");
    setCategory(nextCategory);
    setCollection("All");
    setSkinType("All");
    setConcern("All");
    setFilter("All");
    setMaxPrice(maxProductPrice);
    window.requestAnimationFrame(scrollToProducts);
  };

  const filterPanelProps = {
    category,
    collection,
    concern,
    filter,
    maxPrice,
    maxProductPrice,
    skinType,
    onReset: resetFilters,
    onCategoryChange: setCategory,
    onCollectionChange: setCollection,
    onConcernChange: setConcern,
    onFilterChange: setFilter,
    onMaxPriceChange: setMaxPrice,
    onSkinTypeChange: setSkinType,
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
            <span className={styles.eyebrow}>Shop SOO</span>
            <h1>Shop all</h1>
          </div>
          <div className={styles.shopResultMeta} aria-live="polite">
            <span>{visibleProducts.length} products</span>
            <span>
              {category === "All" ? "All categories" : category}
            </span>
            <span>
              {skinType === "All" ? "All skin types" : skinType}
            </span>
            {concern !== "All" ? <span>{concern}</span> : null}
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
                    full SOO catalogue.
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
