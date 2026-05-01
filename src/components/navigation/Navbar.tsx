"use client";

import Link from "next/link";
import { brand } from "@/data/store";
import { primaryNav } from "@/data/navigation";
import { isActivePath } from "@/lib/routing";
import { Icon } from "@/components/ui/Icons";
import { SearchPanel } from "@/components/search/SearchPanel";
import { BrandLogo } from "./BrandLogo";
import { useStore } from "@/store/StoreProvider";
import styles from "@/styles/store.module.css";

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
  const {
    cartCount,
    openCartDrawer,
    openWishlistDrawer,
    searchOpen,
    setSearchOpen,
    wishlistCount,
  } = useStore();
  const accountActive = isActivePath(pathname, "/account");
  const toggleSearch = () => setSearchOpen((open) => !open);

  return (
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
          <BrandLogo variant="white" eager />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {primaryNav.map((item) => (
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
            className={`${styles.iconButton} ${
              searchOpen ? styles.iconButtonActive : ""
            }`}
            type="button"
            aria-label={searchOpen ? "Close search" : "Search products"}
            aria-controls="header-search-panel"
            aria-expanded={searchOpen}
            aria-pressed={searchOpen}
            onClick={toggleSearch}
          >
            <Icon name="search" />
          </button>
          <Link
            className={`${styles.iconButton} ${styles.accountIconButton} ${
              accountActive ? styles.iconButtonActive : ""
            }`}
            href="/account"
            aria-label="Account"
            aria-current={accountActive ? "location" : undefined}
            onClick={() => setSearchOpen(false)}
          >
            <Icon name="user" />
          </Link>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Open wishlist"
            onClick={() => {
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
