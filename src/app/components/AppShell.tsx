"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { brand, categories, formatPrice, products } from "@/app/data/store";
import type { Product } from "@/app/data/store";
import { Icon } from "./Icons";
import { ProductCard, ProductVisual, Stars } from "./ProductCard";
import styles from "./Store.module.css";
import { StoreProvider, useStore } from "./StoreProvider";

const primaryNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const supportLinks = [
  { label: "Delivery", href: "/delivery" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const categoryAliases: Record<string, string[]> = {
  Cleansers: ["cleanser", "cleanse", "face wash", "wash"],
  Serums: ["serum", "active", "vitamin", "treatment"],
  Moisturisers: ["moisturiser", "moisturizer", "cream", "barrier"],
  Toners: ["toner", "tone", "mist"],
  "Sunscreen / SPF": ["spf", "sunscreen", "sun cream", "sun protection"],
  Masks: ["mask", "treatment mask"],
  "Eye Care": ["eye", "eyes", "eye cream"],
  "Sets / Bundles": ["bundle", "bundles", "set", "sets", "kit"],
};

const categoryLabels: Record<string, string> = {
  "Sunscreen / SPF": "SPF / Sunscreen",
  "Sets / Bundles": "Bundles",
};

const searchableCategories = categories
  .filter((category) => category !== "All")
  .map((category) => ({
    aliases: categoryAliases[category] ?? [],
    href: `/shop?category=${encodeURIComponent(category)}#shop-products`,
    label: categoryLabels[category] ?? category,
    value: category,
  }));

const suggestedCategoryValues = [
  "Cleansers",
  "Serums",
  "Moisturisers",
  "Sunscreen / SPF",
  "Masks",
];

function normaliseSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearchTerm(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ShellFrame>{children}</ShellFrame>
    </StoreProvider>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const {
    cartOpen,
    cartCount,
    checkoutOpen,
    quickViewProduct,
    openCartDrawer,
    openWishlistDrawer,
    setCheckoutOpen,
    setCartOpen,
    setQuickViewProduct,
    searchOpen,
    setSearchOpen,
    setWishlistOpen,
    toast,
    wishlistOpen,
    wishlistCount,
  } = useStore();

  useEffect(() => {
    const hash = window.location.hash.slice(1);

    if (hash) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(decodeURIComponent(hash))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 16);
        setShowTop(window.scrollY > 700);
        shellRef.current?.style.setProperty(
          "--wicked-scroll",
          `${Math.min(window.scrollY * -0.025, 0)}px`,
        );
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const root = shellRef.current;

    if (!root || !("IntersectionObserver" in window)) {
      return;
    }

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("main section, main article"),
    );

    targets.forEach((target, index) => {
      target.classList.add(styles.revealItem);
      target.style.setProperty("--reveal-delay", `${Math.min(index * 45, 360)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setMobileOpen(false);
      setSearchOpen(false);
      setCartOpen(false);
      setWishlistOpen(false);
      setCheckoutOpen(false);
      setQuickViewProduct(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [
    setCartOpen,
    setCheckoutOpen,
    setQuickViewProduct,
    setSearchOpen,
    setWishlistOpen,
  ]);

  const overlayOpen =
    mobileOpen ||
    cartOpen ||
    checkoutOpen ||
    wishlistOpen ||
    Boolean(quickViewProduct);

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  return (
    <div className={styles.shell} ref={shellRef}>
      <AnnouncementBar />
      <header
        className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ""} ${
          searchOpen ? styles.navbarSearchOpen : ""
        }`}
      >
        <div className={styles.navbarRow}>
          <Link
            className={styles.logo}
            href="/"
            aria-label={`${brand.name} home`}
            onClick={() => setSearchOpen(false)}
          >
            <span>{brand.mark}</span>
            <small>EST. 2026</small>
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                className={isActive(pathname, item.href) ? styles.activeLink : ""}
                href={item.href}
                onClick={() => setSearchOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.navActions}>
            <button
              className={styles.iconButton}
              type="button"
              aria-label={searchOpen ? "Close search" : "Search products"}
              aria-controls="header-search-panel"
              aria-expanded={searchOpen}
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(!searchOpen);
              }}
            >
              <Icon name="search" />
            </button>
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Open wishlist"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(false);
                openWishlistDrawer();
              }}
            >
              <Icon name="heart" />
              {wishlistCount ? <span className={styles.badge}>{wishlistCount}</span> : null}
            </button>
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Open cart"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(false);
                openCartDrawer();
              }}
            >
              <Icon name="bag" />
              {cartCount ? <span className={styles.badge}>{cartCount}</span> : null}
            </button>
            <button
              className={`${styles.iconButton} ${styles.menuButton}`}
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => {
                setSearchOpen(false);
                setMobileOpen(true);
              }}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
        <SearchPanel />
      </header>

      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className={styles.mobileMenuTop}>
          <Link className={styles.logo} href="/" onClick={() => setMobileOpen(false)}>
            <span>{brand.mark}</span>
            <small>EST. 2026</small>
          </Link>
          <button
            className={styles.mobileClose}
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              <span>{item.label}</span>
              <Icon name="arrow" />
            </Link>
          ))}
          <div className={styles.mobileSupport}>
            {supportLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className={styles.mobileMenuFooter}>
          <span>{brand.tagline}</span>
          <strong>Clean formulas. Bold results. No routine noise.</strong>
          <small>Free South Africa delivery over R750</small>
        </div>
      </div>

      <div key={pathname} className={styles.pageTransition}>
        {children}
      </div>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutDrawer />
      <QuickViewModal />

      {toast ? (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastError : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <button
        className={`${styles.backToTop} ${showTop ? styles.backToTopVisible : ""}`}
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <Icon name="up" />
      </button>
    </div>
  );
}

function AnnouncementBar() {
  const items = [
    "FREE DELIVERY OVER R750",
    "FAST SOUTH AFRICA DELIVERY",
    "CLEAN FORMULAS. BOLD RESULTS.",
    "EASY RETURNS",
    "SECURE CHECKOUT",
    "WICKED SKINCARE",
  ];

  return (
    <div className={styles.announcementBar} aria-label="Store announcements">
      <div className={styles.announcementTrack}>
        {[0, 1].map((group) => (
          <span aria-hidden={group === 1} key={group}>
            {items.map((item) => (
              <small key={`${group}-${item}`}>{item}</small>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href.includes("?")) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <Link className={styles.logo} href="/" aria-label={`${brand.name} home`}>
            <span>{brand.mark}</span>
            <small>EST. 2026</small>
          </Link>
          <p>{brand.description}</p>
          <div className={styles.socials}>
            <Link href="/contact" aria-label="Instagram">
              <Icon name="instagram" />
            </Link>
            <Link href="/contact" aria-label="TikTok">
              <Icon name="tiktok" />
            </Link>
            <Link href="/contact" aria-label="Facebook">
              <Icon name="facebook" />
            </Link>
            <Link href="/contact" aria-label="X">
              <Icon name="x" />
            </Link>
          </div>
        </div>
        <div className={styles.footerColumn}>
          <h3>Shop</h3>
          <Link href="/shop">All Products</Link>
          <Link href="/shop?filter=New#collections">New Arrivals</Link>
          <Link href="/shop?filter=Popular#collections">Best Sellers</Link>
          <Link href="/shop?category=Sets%20%2F%20Bundles#collections">Sets / Bundles</Link>
        </div>
        <div className={styles.footerColumn}>
          <h3>Brand</h3>
          <Link href="/about">About WICKED</Link>
          <Link href="/shop#collections">Collections</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faqs">FAQs</Link>
        </div>
        <div className={styles.footerColumn}>
          <h3>Support</h3>
          {supportLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className={styles.footerColumn}>
          <h3>Skin notes</h3>
          <p>Receive routine edits, restock timing, and concise skincare guidance.</p>
          <form
            className={styles.newsletterMini}
            onSubmit={(event) => event.preventDefault()}
          >
            <label className={styles.srOnly} htmlFor="footer-email">
              Email address
            </label>
            <input
              className={styles.input}
              id="footer-email"
              type="email"
              placeholder="skin@domain.com"
            />
            <button className={styles.primaryButton} type="submit" aria-label="Join list">
              <Icon name="arrow" />
            </button>
          </form>
          <PaymentMethods />
        </div>
      </div>
    </footer>
  );
}

function SearchPanel() {
  const { searchOpen, setSearchOpen } = useStore();
  const [term, setTerm] = useState("");
  const searchPanelRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchScrollTouchedRef = useRef(false);
  const [searchScrollHintVisible, setSearchScrollHintVisible] = useState(false);
  const [searchScrollHintMuted, setSearchScrollHintMuted] = useState(false);
  const { categoryResults, productResults, query } = useMemo(() => {
    const query = normaliseSearchTerm(term);

    const categoryMatches = query
      ? searchableCategories.filter((category) =>
          [category.label, category.value, ...category.aliases].some((value) =>
            matchesSearchTerm(value, query),
          ),
        )
      : suggestedCategoryValues
          .map((value) =>
            searchableCategories.find((category) => category.value === value),
          )
          .filter((category): category is (typeof searchableCategories)[number] =>
            Boolean(category),
          );

    const matchingProducts = query
      ? products.filter((product) =>
          [
            product.name,
            product.category,
            product.collection,
            product.tag,
            product.badge,
            product.description,
            ...product.filters,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query),
        )
      : [];

    return {
      categoryResults: categoryMatches.slice(0, 5),
      productResults: matchingProducts.slice(0, 5),
      query,
    };
  }, [term]);
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
    if (searchOpen) {
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
    }
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
    searchOpen && hasSearchResults && searchScrollHintVisible;

  return (
    <section
      className={`${styles.headerSearch} ${
        searchOpen ? styles.headerSearchOpen : ""
      }`}
      id="header-search-panel"
      ref={searchPanelRef}
      aria-hidden={!searchOpen}
      aria-label="Search WICKED skincare"
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

function CartDrawer() {
  const {
    cartItems,
    cartOpen,
    cartSubtotal,
    cartTotal,
    discount,
    removeCartItem,
    setCartOpen,
    shipping,
    startCheckout,
    tax,
    updateCartQuantity,
  } = useStore();

  return (
    <div
      className={`${styles.drawerLayer} ${cartOpen ? styles.drawerOpen : ""}`}
      aria-hidden={!cartOpen}
    >
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close cart overlay"
        onClick={() => setCartOpen(false)}
      />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Cart">
        <div className={styles.drawerTop}>
          <div>
            <span className={styles.eyebrow}>Cart</span>
            <h2>Your selection</h2>
          </div>
          <button
            className={styles.mobileClose}
            type="button"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className={styles.drawerItems}>
          {cartItems.length ? (
            cartItems.map((item) => (
              <article className={styles.drawerItem} key={item.cartKey}>
                <div className={styles.drawerThumb}>
                  <ProductVisual product={item} compact />
                </div>
                <div>
                  <h3>{item.name}</h3>
                  <small>
                    {formatPrice(item.price)}
                    {item.selectedVariant ? ` / ${item.selectedVariant}` : ""}
                    {item.selectedSize ? ` / ${item.selectedSize}` : ""}
                  </small>
                  <div className={styles.heroActions}>
                    <div className={styles.quantity} aria-label="Quantity">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => updateCartQuantity(item.cartKey, -1)}
                      >
                        <Icon name="minus" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => updateCartQuantity(item.cartKey, 1)}
                      >
                        <Icon name="plus" />
                      </button>
                    </div>
                    <button
                      className={styles.textButton}
                      type="button"
                      onClick={() => removeCartItem(item.cartKey)}
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
                <h3>Your cart is empty.</h3>
                <p className={styles.mutedText}>
                  Start with one WICKED essential. Totals, delivery, and VAT stay
                  clear before checkout.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className={styles.drawerFooter}>
          <p className={styles.mutedText}>
            Free South Africa delivery applies above R750.
          </p>
          <SummaryLine label="Subtotal" value={formatPrice(cartSubtotal)} />
          <SummaryLine
            label="Shipping"
            value={shipping ? formatPrice(shipping) : "Free"}
          />
          <SummaryLine label="VAT included" value={formatPrice(tax)} />
          {discount ? (
            <SummaryLine label="WICKED code" value={`-${formatPrice(discount)}`} />
          ) : null}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <button className={styles.primaryButton} type="button" onClick={startCheckout}>
            Enter secure checkout
          </button>
          <Link
            className={styles.secondaryButton}
            href="/shop"
            onClick={() => setCartOpen(false)}
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}

function WishlistDrawer() {
  const {
    addToCart,
    isWishlisted,
    setWishlistOpen,
    toggleWishlist,
    wishlistOpen,
  } = useStore();
  const savedProducts = products.filter((product) => isWishlisted(product.id));

  return (
    <div
      className={`${styles.drawerLayer} ${wishlistOpen ? styles.drawerOpen : ""}`}
      aria-hidden={!wishlistOpen}
    >
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close wishlist overlay"
        onClick={() => setWishlistOpen(false)}
      />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
      >
        <div className={styles.drawerTop}>
          <div>
            <span className={styles.eyebrow}>Wishlist</span>
            <h2>Saved routine</h2>
          </div>
          <button
            className={styles.mobileClose}
            type="button"
            aria-label="Close wishlist"
            onClick={() => setWishlistOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
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
      </aside>
    </div>
  );
}

function CheckoutDrawer() {
  const {
    cartItems,
    cartSubtotal,
    cartTotal,
    checkoutOpen,
    discount,
    discountCode,
    placeOrder,
    setCheckoutOpen,
    setDiscountCode,
    shipping,
    tax,
  } = useStore();

  return (
    <div
      className={`${styles.drawerLayer} ${checkoutOpen ? styles.drawerOpen : ""}`}
      aria-hidden={!checkoutOpen}
    >
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close checkout overlay"
        onClick={() => setCheckoutOpen(false)}
      />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Checkout preview"
      >
        <div className={styles.drawerTop}>
          <div>
            <span className={styles.eyebrow}>Checkout</span>
            <h2>Secure skincare checkout</h2>
          </div>
          <button
            className={styles.mobileClose}
            type="button"
            aria-label="Close checkout"
            onClick={() => setCheckoutOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <form className={styles.formPanel}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Email</span>
              <input className={styles.input} type="email" placeholder="skin@domain.com" />
            </label>
            <label className={styles.field}>
              <span>Phone</span>
              <input className={styles.input} type="tel" placeholder="+27 82 555 0140" />
            </label>
            <label className={styles.field}>
              <span>Full name</span>
              <input className={styles.input} type="text" placeholder="Avery Mokoena" />
            </label>
            <label className={styles.field}>
              <span>Postcode</span>
              <input className={styles.input} type="text" placeholder="8001" />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Address</span>
              <input className={styles.input} type="text" placeholder="18 Bree Street, Cape Town" />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Payment</span>
              <span className={styles.infoCard}>
                <Icon name="card" />
                Encrypted card entry connects here. Visa, Mastercard, Amex, and
                Apple Pay ready.
              </span>
            </label>
          </div>
        </form>
        <div className={styles.checkoutSummary}>
          <h3>Order summary</h3>
          {cartItems.length ? (
            cartItems.map((item) => (
              <SummaryLine
                key={item.cartKey}
                label={`${item.name} x ${item.quantity}`}
                value={formatPrice(item.price * item.quantity)}
              />
            ))
          ) : (
            <p className={styles.mutedText}>Your cart is empty.</p>
          )}
          <label className={styles.field}>
            <span>Discount code</span>
            <input
              className={styles.input}
              value={discountCode}
              placeholder="Try WICKED10"
              onChange={(event) => setDiscountCode(event.target.value)}
            />
          </label>
          <SummaryLine label="Subtotal" value={formatPrice(cartSubtotal)} />
          <SummaryLine
            label="Shipping"
            value={shipping ? formatPrice(shipping) : "Free"}
          />
          <SummaryLine label="VAT included" value={formatPrice(tax)} />
          {discount ? <SummaryLine label="Discount" value={`-${formatPrice(discount)}`} /> : null}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <PaymentMethods />
          <button className={styles.primaryButton} type="button" onClick={placeOrder}>
            Place secure preview order
          </button>
        </div>
      </aside>
    </div>
  );
}

function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct } = useStore();

  return (
    <div
      className={`${styles.overlay} ${
        quickViewProduct ? styles.overlayOpen : ""
      }`}
      aria-hidden={!quickViewProduct}
    >
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close quick view overlay"
        onClick={() => setQuickViewProduct(null)}
      />
      {quickViewProduct ? (
        <QuickViewContent key={quickViewProduct.id} product={quickViewProduct} />
      ) : null}
    </div>
  );
}

function QuickViewContent({ product }: { product: Product }) {
  const {
    addToCart,
    buyNow,
    isWishlisted,
    setQuickViewProduct,
    toggleWishlist,
  } = useStore();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const saved = isWishlisted(product.id);

  return (
    <section
      className={`${styles.modal} ${styles.quickModalGrid}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view for ${product.name}`}
    >
      <button
        className={styles.quickClose}
        type="button"
        aria-label="Close quick view"
        onClick={() => setQuickViewProduct(null)}
      >
        <Icon name="close" />
      </button>
      <div className={styles.gallery}>
        <div className={styles.quickImage}>
          <ProductVisual product={product} scene={activeImage} />
        </div>
        <div className={styles.thumbGrid} aria-label="Quick view gallery">
          {product.gallery.map((image, index) => (
            <button
              className={`${styles.thumbButton} ${
                activeImage === index ? styles.activeThumb : ""
              }`}
              key={image}
              type="button"
              aria-label={`Show ${product.name} view ${index + 1}`}
              onClick={() => setActiveImage(index)}
            >
              <ProductVisual product={product} compact scene={index} />
            </button>
          ))}
        </div>
      </div>
      <div className={styles.quickModalContent}>
        <span className={styles.eyebrow}>{product.category}</span>
        <h2 className={styles.productTitle}>{product.name}</h2>
        <p className={styles.mutedText}>{product.description}</p>
        <Stars rating={product.rating} reviews={product.reviews} />
        <div className={styles.productPriceRow}>
          {product.compareAt ? (
            <span className={styles.comparePrice}>{formatPrice(product.compareAt)}</span>
          ) : null}
          <strong className={styles.productPrice}>{formatPrice(product.price)}</strong>
          <span className={styles.pill}>{product.stockNote}</span>
        </div>
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
              addToCart(product, quantity, {
                variant: selectedVariant,
                size: selectedSize,
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
            onClick={() =>
              buyNow(product, quantity, {
                variant: selectedVariant,
                size: selectedSize,
              })
            }
          >
            Buy now
          </button>
          <button
            className={styles.textButton}
            type="button"
            aria-pressed={saved}
            onClick={() => toggleWishlist(product)}
          >
            {saved ? "Saved" : "Save"}
            <Icon name="heart" />
          </button>
        </div>
        <Link
          className={styles.textButton}
          href={`/product/${product.slug}`}
          onClick={() => setQuickViewProduct(null)}
        >
          Full product page
          <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}

export function VariantSelectors({
  product,
  selectedVariant,
  selectedSize,
  onVariantChange,
  onSizeChange,
}: {
  product: Product;
  selectedVariant: string;
  selectedSize: string;
  onVariantChange: (value: string) => void;
  onSizeChange: (value: string) => void;
}) {
  return (
    <>
      {product.variants?.length ? (
        <div className={styles.variantGroup}>
          <span>Formula option</span>
          <div className={styles.variantOptions}>
            {product.variants.map((variant) => (
              <button
                className={selectedVariant === variant ? styles.variantActive : ""}
                key={variant}
                type="button"
                aria-pressed={selectedVariant === variant}
                onClick={() => onVariantChange(variant)}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {product.sizes?.length ? (
        <div className={styles.variantGroup}>
          <span>Size</span>
          <div className={styles.variantOptions}>
            {product.sizes.map((size) => (
              <button
                className={selectedSize === size ? styles.variantActive : ""}
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                onClick={() => onSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function QuantitySelector({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className={styles.quantity} aria-label="Quantity selector">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, quantity - 1))}
      >
        <Icon name="minus" />
      </button>
      <span>{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryLine}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PaymentMethods() {
  return (
    <div className={styles.payments} aria-label="Accepted payments">
      <span className={`${styles.paymentBadge} ${styles.paymentVisa}`} aria-label="Visa" role="img">
        <VisaLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentMastercard}`} aria-label="Mastercard" role="img">
        <MastercardLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentApple}`} aria-label="Apple Pay" role="img">
        <ApplePayLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentGoogle}`} aria-label="Google Pay" role="img">
        <GooglePayLogo />
      </span>
      <span className={`${styles.paymentBadge} ${styles.paymentPaypal}`} aria-label="PayPal" role="img">
        <PaypalLogo />
      </span>
    </div>
  );
}

function VisaLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 86 28" aria-hidden="true" focusable="false">
      <path fill="#f4f2ff" d="M17.3 20.3H13L9.7 8H14l1.4 6.6L19.1 8h4.2l-6 12.3Z" />
      <path fill="#f4f2ff" d="M24.5 8h4l-2.4 12.3h-4L24.5 8Z" />
      <path
        fill="#f4f2ff"
        d="M39.5 8.4a11 11 0 0 0-3.5-.6c-3.9 0-6.5 1.9-6.5 4.6 0 2 1.9 3.1 3.3 3.8 1.5.7 2 1.2 2 1.8 0 .9-1.2 1.3-2.3 1.3a8.4 8.4 0 0 1-3.7-.8l-.5-.2-.6 3.1c.9.4 2.7.8 4.5.8 4.1 0 6.7-1.9 6.7-4.8 0-1.6-1-2.8-3.3-3.8-1.4-.7-2.2-1.1-2.2-1.7 0-.6.7-1.2 2.2-1.2a7 7 0 0 1 2.9.5l.4.2.6-3Z"
      />
      <path
        fill="#f4f2ff"
        d="M50 8h3.1l3.2 12.3h-3.7l-.5-1.9h-5.1l-.9 1.9H42L48 9.1c.4-.7 1-1.1 2-1.1Zm.4 4-2 4.2h3l-1-4.2Z"
      />
      <path fill="#d6bf8d" d="M14 8h9.3l-1 2.1h-8.9L14 8Z" opacity=".9" />
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 70 34" aria-hidden="true" focusable="false">
      <circle cx="28" cy="17" r="12.5" fill="#ea5a4e" />
      <circle cx="42" cy="17" r="12.5" fill="#f3ba4d" />
      <path fill="#e68c49" d="M35 7.1a12.5 12.5 0 0 1 0 19.8 12.5 12.5 0 0 1 0-19.8Z" />
    </svg>
  );
}

function ApplePayLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 90 32" aria-hidden="true" focusable="false">
      <path
        fill="#f8f4ec"
        d="M21.7 15.1c0-2.9 2.4-4.3 2.5-4.4-1.3-2-3.4-2.2-4.1-2.3-1.8-.2-3.4 1-4.4 1s-2.5-1-4.1-.9c-2.1 0-4 1.2-5 3.1-2.2 3.7-.6 9.2 1.5 12.2 1 1.5 2.3 3.2 3.9 3.1 1.6-.1 2.2-1 4.1-1 1.9 0 2.5 1 4.2 1 1.7 0 2.8-1.5 3.8-3.1 1.2-1.7 1.7-3.4 1.7-3.5-.1-.1-3.9-1.5-4-5.2Zm-2.8-8.6c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.8.8-3.7 1.9-.8.9-1.5 2.5-1.3 4 1.4.1 2.8-.7 3.7-1.8Z"
      />
      <text x="33" y="22.5" fill="#f8f4ec" fontFamily="Arial, Helvetica, sans-serif" fontSize="16" fontWeight="700">
        Pay
      </text>
    </svg>
  );
}

function GooglePayLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 104 32" aria-hidden="true" focusable="false">
      <path fill="#4285f4" d="M19.8 15.1v3.1h5.5c-.2 1.3-.9 2.4-1.9 3.1v2.5h3.1c1.8-1.7 2.9-4.1 2.9-7 0-.6-.1-1.2-.2-1.7h-9.4Z" />
      <path fill="#34a853" d="M19.8 28c2.6 0 4.8-.9 6.5-2.3l-3.1-2.5c-.9.6-2 1-3.4 1-2.5 0-4.6-1.7-5.4-4h-3.2v2.6A9.8 9.8 0 0 0 19.8 28Z" />
      <path fill="#fbbc04" d="M14.4 20.2a5.9 5.9 0 0 1 0-3.8v-2.6h-3.2a9.7 9.7 0 0 0 0 9l3.2-2.6Z" />
      <path fill="#ea4335" d="M19.8 12.4c1.4 0 2.7.5 3.7 1.5l2.8-2.8A9.4 9.4 0 0 0 19.8 8a9.8 9.8 0 0 0-8.6 5.8l3.2 2.6c.8-2.3 2.9-4 5.4-4Z" />
      <text x="37" y="22.4" fill="#f8f4ec" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontWeight="700">
        Pay
      </text>
    </svg>
  );
}

function PaypalLogo() {
  return (
    <svg className={styles.paymentLogo} viewBox="0 0 98 32" aria-hidden="true" focusable="false">
      <path
        fill="#6fb3ff"
        d="M19.8 7.1h-8.1c-.6 0-1.1.4-1.2 1L7.2 28h5l.9-5.6h3.4c5.3 0 9.7-2.7 10.5-7.9.7-4.6-2.1-7.4-7.2-7.4Zm1.6 7.6c-.4 2.7-2.7 3.8-5.6 3.8H14l1.2-7.4h2.3c2.9 0 4.3 1.1 3.9 3.6Z"
      />
      <path
        fill="#2f7de1"
        d="M24.7 10.1c1.6 1.1 2.4 2.9 2 5.4-.8 5.3-5.2 7.9-10.5 7.9h-3.4l-.6 3.8h-4l3.3-19.9c.1-.6.6-1 1.2-1h8.1c2.4 0 4.4.5 5.8 1.6l-1.9 2.2Z"
        opacity=".68"
      />
      <text x="34" y="22.5" fill="#9ec5ff" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontWeight="800">
        PayPal
      </text>
    </svg>
  );
}

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
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div className={styles.relatedGrid}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
