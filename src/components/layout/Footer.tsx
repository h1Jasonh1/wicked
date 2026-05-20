import Link from "next/link";
import { socialLinks, supportLinks } from "@/data/navigation";
import { BrandLogo } from "@/components/navigation/BrandLogo";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footMark}>
        <BrandLogo placement="footer" variant="white" />
      </div>

      <div className={styles.footGrid}>
        <div className={styles.footContact}>
          <span className={styles.footLine}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 7 9-7" />
            </svg>
            <a href="mailto:hello@sooskincare.com">hello@sooskincare.com</a>
          </span>
          <span className={styles.footLine}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4z" />
            </svg>
            <a href="tel:+27100000000">+27 10 000 0000</a>
          </span>

          <div className={styles.footSocials} aria-label="Social">
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

        <div className={styles.footCol}>
          <h3>Shop</h3>
          <ul>
            <li>
              <Link href="/shop">All Products</Link>
            </li>
            <li>
              <Link href="/shop?filter=New#collections">New Arrivals</Link>
            </li>
            <li>
              <Link href="/shop?filter=Popular#collections">Best Sellers</Link>
            </li>
            <li>
              <Link href="/shop?category=Sets%20%2F%20Bundles#collections">
                Sets / Bundles
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.footCol}>
          <h3>Brand</h3>
          <ul>
            <li>
              <Link href="/about">About SOO</Link>
            </li>
            <li>
              <Link href="/shop#collections">Collections</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/faqs">FAQs</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footCol}>
          <h3>Support</h3>
          <ul>
            {supportLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className={styles.footRule} />

      <div className={styles.footBottom}>
        <span>© 2026 SOO skincare. All rights reserved.</span>
        <span className={styles.pay}>
          <span>We accept payments through</span>
          <span className={styles.chip}>Visa</span>
          <span className={`${styles.chip} ${styles.chipMaster}`} aria-label="Mastercard" />
          <span className={`${styles.chip} ${styles.chipAmex}`}>Amex</span>
          <span className={`${styles.chip} ${styles.chipDiscover}`}>Disc</span>
          <span className={`${styles.chip} ${styles.chipPaypal}`}>
            <i>PayPal</i>
          </span>
        </span>
      </div>
    </footer>
  );
}
