import Link from "next/link";
import { brand } from "@/data/store";
import { socialLinks, supportLinks } from "@/data/navigation";
import { BrandLogo } from "@/components/navigation/BrandLogo";
import { Icon } from "@/components/ui/Icons";
import { PaymentMethods } from "@/components/ui/PaymentMethods";
import styles from "@/styles/store.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <Link
            className={`${styles.logo} ${styles.footerLogo}`}
            href="/"
            aria-label={`${brand.name} home`}
          >
            <BrandLogo variant="white" placement="footer" />
          </Link>
          <p>{brand.description}</p>
          <div className={styles.socials}>
            <a
              href={socialLinks.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks.instagram.ariaLabel}
            >
              <Icon name="instagram" />
            </a>
            <a
              href={socialLinks.tiktok.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks.tiktok.ariaLabel}
            >
              <Icon name="tiktok" />
            </a>
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
      </div>
      <div className={styles.footerBottom}>
        <p>© 2026 WICKED skincare. Secure checkout with trusted payment methods.</p>
        <PaymentMethods />
      </div>
    </footer>
  );
}
