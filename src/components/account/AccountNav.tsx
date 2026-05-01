"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/store.module.css";

const accountLinks = [
  { label: "Profile", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Settings", href: "/account/settings" },
] as const;

function isActiveAccountPath(pathname: string, href: string) {
  if (href === "/account") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.accountNav} aria-label="Account navigation">
      {accountLinks.map((item) => {
        const active = isActiveAccountPath(pathname, item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={active ? styles.accountNavActive : undefined}
            key={item.href}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
