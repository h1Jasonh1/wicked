"use client";

import Link from "next/link";
import { brand } from "@/data/store";
import { primaryNav } from "@/data/navigation";
import { isActivePath } from "@/lib/routing";
import { BrandLogo } from "@/components/navigation/BrandLogo";
import { Icon } from "@/components/ui/Icons";
import { SearchPanel } from "@/components/search/SearchPanel";
import {
  useCartStore,
  useUIStore,
  useWishlistStore,
} from "@/store/StoreProvider";
import styles from "@/styles/navbar.module.css";

// Centre links — the logo already carries "/", so Home is dropped here.
const centreLinks = primaryNav.filter((item) => item.href !== "/");

export function Navbar({
  isScrolled,
  mobileOpen,
  onOpenMobileMenu,
  pathname,
}: {
  isScrolled: boolean;
  mobileOpen: boolean;
  onOpenMobileMenu: () => void;
  pathname: string;
}) {
  // Three focused store slices: a cart tick doesn't re-render the search
  // panel, a wishlist toggle doesn't re-render the bag badge.
  const { cartCount } = useCartStore();
  const { wishlistCount } = useWishlistStore();
  const { openCartDrawer, openWishlistDrawer, searchOpen, setSearchOpen } =
    useUIStore();

  // The nav floats transparent only over the home hero. Everywhere else
  // — and once scrolled, or while the search panel is open — it collapses
  // to the smoky dark blurred bar.
  const isHome = pathname === "/";
  const solid = !isHome || isScrolled || searchOpen;

  return (
    <header
      className={`${styles.nav} ${solid ? styles.navScrolled : ""} ${
        searchOpen ? styles.navSearchOpen : ""
      }`}
    >
      <div className={styles.navRow}>
        <Link
          className={styles.navMark}
          href="/"
          aria-label={`${brand.name} home`}
          onClick={() => setSearchOpen(false)}
        >
          <BrandLogo placement="nav" variant="white" eager />
        </Link>

        <nav className={styles.navLinks} aria-label="Primary navigation">
          {centreLinks.map((item) => (
            <Link
              key={item.href}
              className={isActivePath(pathname, item.href) ? styles.activeLink : ""}
              href={item.href}
              onClick={() => setSearchOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.navActions}>
          <button
            className={`${styles.navIcon} ${searchOpen ? styles.navIconActive : ""}`}
            type="button"
            aria-label={searchOpen ? "Close search" : "Search products"}
            aria-controls="header-search-panel"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Icon name="search" />
          </button>
          <button
            className={styles.navIcon}
            type="button"
            aria-label="Open wishlist"
            onClick={() => {
              setSearchOpen(false);
              openWishlistDrawer();
            }}
          >
            <Icon name="heart" />
            {wishlistCount ? (
              <span className={styles.iconBadge}>{wishlistCount}</span>
            ) : null}
          </button>
          <button
            className={styles.navIcon}
            type="button"
            aria-label="Open cart"
            onClick={() => {
              setSearchOpen(false);
              openCartDrawer();
            }}
          >
            <Icon name="bag" />
            {cartCount ? (
              <span className={styles.iconBadge}>{cartCount}</span>
            ) : null}
          </button>
          <button
            className={`${styles.navIcon} ${styles.menuButton}`}
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => {
              setSearchOpen(false);
              onOpenMobileMenu();
            }}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      <SearchPanel />
    </header>
  );
}
