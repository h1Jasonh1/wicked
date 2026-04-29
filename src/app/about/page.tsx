import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/app/components/Icons";
import { brand, collections } from "@/app/data/store";
import styles from "@/app/components/Store.module.css";

export const metadata: Metadata = {
  title: "About WICKED | Premium Skincare With an Edge",
  description:
    "Learn about WICKED's modern black skincare language, clean formula standards and routine-first product philosophy.",
};

export default function AboutPage() {
  return (
    <main>
      <section className={styles.policyPage}>
        <div className={styles.policyHero}>
          <span className={styles.eyebrow}>About WICKED</span>
          <h1>{brand.tagline}</h1>
          <p>
            WICKED exists for customers who want high-performance skincare
            without noise. The palette is black, clean, and confident. The
            promise is simple: every formula must earn its place in the routine.
          </p>
          <Link className={styles.primaryButton} href="/shop">
            Shop collections
            <Icon name="arrow" />
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.splitSection}`}>
        <div className={styles.mediaFill}>
          <Image
            src={collections[1].image}
            alt="Premium skincare serum styled in dark WICKED brand lighting"
            fill
            sizes="(max-width: 1000px) 100vw, 52vw"
          />
        </div>
        <div className={styles.splitCopy}>
          <span className={styles.eyebrow}>Brand story</span>
          <h2>Built for skin that looks alive.</h2>
          <p>
            The brand started from a narrow idea: skincare can feel bold and
            premium without becoming complicated. WICKED makes daily formulas
            that look sharp, layer cleanly, and explain themselves quickly.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Values</span>
          <h2>Modern, confident, minimal.</h2>
        </div>
        <div className={styles.policyGrid}>
          {[
            ["No routine noise", "We keep steps focused so every cleanser, serum, and cream has a clear role."],
            ["Formula clarity", "We care about texture, ingredient purpose, skin feel, and repeat use."],
            ["Trust first", "Product information, totals, policies, and support stay direct and easy to understand."],
          ].map(([title, text]) => (
            <article className={styles.policyCard} key={title}>
              <Icon name="gem" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.splitSection}`}>
        <div className={styles.splitCopy}>
          <span className={styles.eyebrow}>Quality promise</span>
          <h2>Edited skincare, not endless skincare.</h2>
          <p>
            WICKED does not aim to overwhelm the shelf. Each product is selected
            for a specific routine step, priced clearly, and supported with the
            information needed to buy with confidence.
          </p>
          <Link className={styles.textButton} href="/delivery">
            Read delivery standards
            <Icon name="arrow" />
          </Link>
        </div>
        <div className={styles.mediaFill}>
          <Image
            src={collections[3].image}
            alt="WICKED skincare routine products arranged as a premium set"
            fill
            sizes="(max-width: 1000px) 100vw, 52vw"
          />
        </div>
      </section>
    </main>
  );
}
