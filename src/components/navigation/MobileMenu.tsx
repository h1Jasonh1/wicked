"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/data/navigation";

const menuLinks = primaryNav.filter((item) => item.href !== "/");
import { isActivePath } from "@/lib/routing";
import { Icon } from "@/components/ui/Icons";
import { useCartStore, useUIStore, useWishlistStore } from "@/store/StoreProvider";
import { BrandLogo } from "./BrandLogo";
import styles from "@/styles/store.module.css";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const accountActive = isActivePath(pathname, "/account");
  const { openCartDrawer, openWishlistDrawer } = useUIStore();
  const { cartCount } = useCartStore();
  const { wishlistCount } = useWishlistStore();

  const handleCart = () => {
    onClose();
    openCartDrawer();
  };

  const handleWishlist = () => {
    onClose();
    openWishlistDrawer();
  };

  // The drawer mounts with `open` toggling these CSS classes; the stagger
  // animations key off `mobileMenuOpen` via animation-delay so children
  // sweep in from top to bottom each time the menu re-opens.
  return (
    <div
      className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}
      aria-hidden={!open}
    >
      <div className={styles.mobileMenuTop}>
        <Link className={styles.logo} href="/" onClick={onClose}>
          <BrandLogo variant="white" placement="mobileMenu" />
        </Link>
        <button
          className={styles.mobileClose}
          type="button"
          aria-label="Close menu"
          onClick={onClose}
        >
          <span className={styles.mobileCloseLabel}>Close</span>
          <Icon name="close" />
        </button>
      </div>

      <div className={styles.mobileMenuBody}>
        <div className={styles.mobileMenuFigure} aria-hidden="true">
          <Image
            src="/assets/tenderd-image1.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 0px, 38vw"
            className={styles.mobileMenuImage}
            priority={false}
          />
          <span className={styles.mobileMenuFigureCaption}>
            <em>SOO</em> — Authentic Korean skincare.
          </span>
        </div>

        <nav className={styles.mobileMenuNav} aria-label="Primary">
          <ul className={styles.mobileMenuPrimary}>
            {menuLinks.map((item, idx) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li
                  key={item.href}
                  className={styles.mobileMenuItem}
                  style={{ ["--stagger" as string]: `${idx * 60}ms` }}
                >
                  <Link
                    href={item.href}
                    className={`${styles.mobileMenuLink} ${active ? styles.mobileMenuLinkActive : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onClose}
                  >
                    <span className={styles.mobileMenuLinkText}>{item.label}</span>
                    <span className={styles.mobileMenuLinkArrow} aria-hidden="true">
                      <Icon name="arrow" />
                    </span>
                  </Link>
                </li>
              );
            })}
            <li
              className={styles.mobileMenuItem}
              style={{ ["--stagger" as string]: `${menuLinks.length * 60}ms` }}
            >
              <Link
                href="/account"
                className={`${styles.mobileMenuLink} ${accountActive ? styles.mobileMenuLinkActive : ""}`}
                aria-current={accountActive ? "page" : undefined}
                onClick={onClose}
              >
                <span className={styles.mobileMenuLinkText}>Account</span>
                <span className={styles.mobileMenuLinkArrow} aria-hidden="true">
                  <Icon name="arrow" />
                </span>
              </Link>
            </li>
          </ul>

          <ul className={styles.mobileMenuSecondary}>
            <li
              className={styles.mobileMenuItem}
              style={{ ["--stagger" as string]: `${(menuLinks.length + 1) * 60 + 40}ms` }}
            >
              <button
                type="button"
                className={styles.mobileMenuSubLink}
                onClick={handleWishlist}
              >
                <span className={styles.mobileMenuBullet} aria-hidden="true" />
                <span>
                  Wishlist
                  {wishlistCount ? (
                    <em className={styles.mobileMenuCount}>({wishlistCount})</em>
                  ) : null}
                </span>
                <Icon name="heart" />
              </button>
            </li>
            <li
              className={styles.mobileMenuItem}
              style={{ ["--stagger" as string]: `${(menuLinks.length + 1) * 60 + 100}ms` }}
            >
              <button
                type="button"
                className={styles.mobileMenuSubLink}
                onClick={handleCart}
              >
                <span className={styles.mobileMenuBullet} aria-hidden="true" />
                <span>
                  Cart
                  {cartCount ? (
                    <em className={styles.mobileMenuCount}>({cartCount})</em>
                  ) : null}
                </span>
                <Icon name="bag" />
              </button>
            </li>
          </ul>
        </nav>

      </div>

    </div>
  );
}
