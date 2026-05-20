"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { formatPrice } from "@/lib/formatters";
import { useHeaderSearch } from "@/hooks/useSearch";
import { Icon } from "@/components/ui/Icons";
import { ProductVisual, Stars } from "@/components/product/ProductCard";
import styles from "@/styles/store.module.css";

export function SearchPanel() {
  const { products } = useCatalog();
  const [term, setTerm] = useState("");
  const searchPanelRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchScrollTouchedRef = useRef(false);
  const [searchScrollHintVisible, setSearchScrollHintVisible] = useState(false);
  const [searchScrollHintMuted, setSearchScrollHintMuted] = useState(false);
  const {
    categoryResults,
    productResults,
    query,
    searchOpen,
    setSearchOpen,
  } = useHeaderSearch(term, products);
  const hasSearchResults = categoryResults.length || productResults.length;
  const shopResultsHref = query
    ? `/shop?q=${encodeURIComponent(query)}#shop-products`
    : "/shop#shop-products";

  const closeSearch = useCallback(() => {
    searchScrollTouchedRef.current = false;
    setSearchScrollHintMuted(false);
    setSearchScrollHintVisible(false);
    setSearchOpen(false);
    setTerm("");
  }, [setSearchOpen]);

  const updateSearchScrollHint = useCallback(
    (markTouched = false) => {
      if (markTouched) {
        searchScrollTouchedRef.current = true;
      }

      const results = searchResultsRef.current;
      const canScroll = results
        ? searchOpen &&
          Boolean(hasSearchResults) &&
          results.scrollHeight > results.clientHeight + 4
        : false;
      const hasMoreBelow = results
        ? results.scrollTop + results.clientHeight < results.scrollHeight - 8
        : false;
      const shouldShow = canScroll && hasMoreBelow;
      const shouldMute = shouldShow && searchScrollTouchedRef.current;

      setSearchScrollHintVisible((current) =>
        current === shouldShow ? current : shouldShow,
      );
      setSearchScrollHintMuted((current) =>
        current === shouldMute ? current : shouldMute,
      );
    },
    [hasSearchResults, searchOpen],
  );

  const handleSearchResultsScroll = useCallback(() => {
    updateSearchScrollHint(true);
  }, [updateSearchScrollHint]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeSearch, searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const closeOnPointerDown = (event: PointerEvent) => {
      const header = searchPanelRef.current?.closest("header");
      const target = event.target;

      if (header && target instanceof Node && !header.contains(target)) {
        closeSearch();
      }
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    return () => document.removeEventListener("pointerdown", closeOnPointerDown);
  }, [closeSearch, searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const measureSearchResults = () => updateSearchScrollHint(false);
    const frame = window.requestAnimationFrame(() => {
      searchScrollTouchedRef.current = false;
      setSearchScrollHintMuted(false);
      if (searchResultsRef.current) {
        searchResultsRef.current.scrollTop = 0;
      }
      updateSearchScrollHint(false);
    });

    window.addEventListener("resize", measureSearchResults);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureSearchResults);
    };
  }, [
    categoryResults.length,
    productResults.length,
    query,
    searchOpen,
    updateSearchScrollHint,
  ]);

  const shouldShowSearchScrollHint =
    searchOpen && Boolean(hasSearchResults) && searchScrollHintVisible;

  return (
    <section
      className={`${styles.headerSearch} ${
        searchOpen ? styles.headerSearchOpen : ""
      }`}
      id="header-search-panel"
      ref={searchPanelRef}
      aria-hidden={!searchOpen}
      aria-label="Search SOO skincare"
    >
      <div className={styles.headerSearchInner}>
        <div className={styles.searchInputWrap}>
          <Icon name="search" />
          <label className={styles.srOnly} htmlFor="global-search">
            Search products and categories
          </label>
          <input
            className={styles.input}
            id="global-search"
            ref={searchInputRef}
            type="text"
            role="searchbox"
            autoComplete="off"
            enterKeyHint="search"
            value={term}
            placeholder="Search cleansers, serums, SPF..."
            onChange={(event) => setTerm(event.target.value)}
          />
          {term ? (
            <button
              className={styles.searchClear}
              type="button"
              aria-label="Clear search"
              onClick={() => setTerm("")}
            >
              <Icon name="close" />
            </button>
          ) : null}
        </div>
        <div
          className={`${styles.searchResultsFrame} ${
            shouldShowSearchScrollHint ? styles.searchResultsFrameScrollable : ""
          } ${searchScrollHintMuted ? styles.searchResultsFrameMuted : ""}`}
        >
          <div
            className={styles.searchResults}
            ref={searchResultsRef}
            onScroll={handleSearchResultsScroll}
          >
            {hasSearchResults ? (
              <div className={styles.searchSections}>
                {categoryResults.length ? (
                  <section className={styles.searchSection} aria-label="Category results">
                    <div className={styles.searchSectionHeader}>
                      <span>{query ? "Categories" : "Suggested categories"}</span>
                    </div>
                    <div className={styles.searchCategoryGrid}>
                      {categoryResults.map((category) => (
                        <Link
                          className={styles.searchCategoryResult}
                          href={category.href}
                          key={category.value}
                          onClick={closeSearch}
                        >
                          <span>
                            <strong>{category.label}</strong>
                            <small>Category</small>
                          </span>
                          <Icon name="arrow" />
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}

                {productResults.length ? (
                  <section className={styles.searchSection} aria-label="Product results">
                    <div className={styles.searchSectionHeader}>
                      <span>Products</span>
                    </div>
                    <div className={styles.searchProductList}>
                      {productResults.map((product) => (
                        <Link
                          className={styles.searchResult}
                          href={`/product/${product.slug}`}
                          key={product.id}
                          onClick={closeSearch}
                        >
                          <span className={styles.drawerThumb}>
                            <ProductVisual product={product} compact />
                          </span>
                          <span className={styles.searchResultContent}>
                            <span className={styles.searchResultTop}>
                              <strong>{product.name}</strong>
                              <span className={styles.pill}>{product.badge}</span>
                            </span>
                            <small>{product.category}</small>
                            <Stars
                              rating={product.rating}
                              reviews={product.reviews}
                              compact
                            />
                          </span>
                          <span className={styles.searchResultPrice}>
                            {formatPrice(product.price)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div>
                  <h3>No results found.</h3>
                  <p className={styles.mutedText}>
                    Try searching serum, SPF, cleanser, or mask.
                  </p>
                </div>
              </div>
            )}
          </div>
          {shouldShowSearchScrollHint ? (
            <div className={styles.searchScrollHint} aria-hidden="true">
              <span>Scroll for more</span>
              <span className={styles.searchScrollChevron} />
            </div>
          ) : null}
        </div>
        {query && productResults.length ? (
          <Link
            className={styles.searchViewAll}
            href={shopResultsHref}
            onClick={closeSearch}
          >
            Shop all matching products
            <Icon name="arrow" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
