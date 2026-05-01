"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/data/store";
import { primaryNav, supportLinks } from "@/data/navigation";
import { isActivePath } from "@/lib/routing";
import { Icon } from "@/components/ui/Icons";
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
          <Icon name="close" />
        </button>
      </div>
      <nav aria-label="Mobile navigation">
        {primaryNav.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <span>{item.label}</span>
            <Icon name="arrow" />
          </Link>
        ))}
        <Link
          className={accountActive ? styles.mobileMenuActive : undefined}
          href="/account"
          aria-current={accountActive ? "location" : undefined}
          onClick={onClose}
        >
          <span>Account</span>
          <Icon name="user" />
        </Link>
        <div className={styles.mobileSupport}>
          {supportLinks.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
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
  );
}
