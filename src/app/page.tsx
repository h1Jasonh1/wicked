import Image from "next/image";
import Link from "next/link";
import { brand, collections, heroImage, products, reviews } from "./data/store";
import { Icon } from "./components/Icons";
import { ProductCard, ProductVisual } from "./components/ProductCard";
import styles from "./components/Store.module.css";

export default function Home() {
  const featured = products.slice(0, 8);
  const spotlight = products[0];

  return (
    <main>
      <section className={styles.hero}>
        <Image
          className={styles.heroImage}
          src={heroImage}
          alt="Premium skincare bottle on a deep black studio background"
          fill
          priority
          sizes="100vw"
        />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>{brand.tagline}</span>
          <h1>WICKED skincare with an edge.</h1>
          <p>
            Clean formulas, bold results, and daily essentials for skin that
            looks alive. Built for modern routines without the noise.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/shop">
              Shop skincare
              <Icon name="arrow" />
            </Link>
            <Link className={styles.secondaryButton} href="/shop#collections">
              Build a routine
            </Link>
          </div>
          <dl className={styles.heroMetrics} aria-label="Store highlights">
            <div>
              <dt>24h</dt>
              <dd>fast dispatch</dd>
            </div>
            <div>
              <dt>4.9</dt>
              <dd>routine rating</dd>
            </div>
            <div>
              <dt>12</dt>
              <dd>focused formulas</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.section} id="collections">
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>WICKED routines</span>
          <h2>Focused skincare, edited by routine step.</h2>
          <p>
            Browse cleanser, toner, treatment, barrier, SPF, mask, eye care, and
            bundle edits with a clear purpose for each step.
          </p>
        </div>
        <div className={styles.collectionGrid}>
          {collections.map((collection) => (
            <Link
              className={styles.collectionCard}
              href={`/shop?collection=${encodeURIComponent(collection.name)}`}
              key={collection.slug}
            >
              <div className={styles.collectionImage}>
                <Image
                  src={collection.image}
                  alt={`${collection.name} collection visual direction`}
                  fill
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
                />
              </div>
              <div className={styles.collectionContent}>
                <small>{collection.visualDirection}</small>
                <h3>{collection.name}</h3>
                <p>{collection.description}</p>
                <span className={styles.collectionCta}>
                  Shop edit
                  <Icon name="arrow" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Best sellers</span>
          <h2>High-performance essentials for a sharper routine.</h2>
          <p>
            Premium skincare staples made to cleanse, treat, protect, and
            restore without cluttering your shelf.
          </p>
        </div>
        <div className={styles.productGrid}>
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className={styles.inlineActions}>
          <Link className={styles.primaryButton} href="/shop">
            View all products
            <Icon name="arrow" />
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.splitSection}`}>
        <div className={styles.mediaFill}>
          <Image
            src={collections[1].image}
            alt="Premium skincare serum photographed in moody studio light"
            fill
            sizes="(max-width: 1000px) 100vw, 52vw"
          />
        </div>
        <div className={styles.splitCopy}>
          <span className={styles.eyebrow}>Brand direction</span>
          <h2>Clean formulas. Bold results.</h2>
          <p>
            WICKED keeps the black luxury mood, then strips the routine back to
            what matters: effective textures, clear claims, and shelf-ready
            skincare that feels confident.
          </p>
          <Link className={styles.textButton} href="/about">
            Read the brand story
            <Icon name="arrow" />
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.benefitGrid}>
          {[
            ["Fast delivery", "Free tracked South Africa delivery over R750."],
            ["Formula standards", "Clean textures, clear actives, and no inflated claims."],
            ["Secure checkout", "Encrypted payment handling and clear VAT-inclusive totals."],
            ["Easy returns", "Unopened skincare returns with quick support guidance."],
          ].map(([title, text]) => (
            <article className={styles.benefitCard} key={title}>
              <Icon name={title === "Fast delivery" ? "truck" : "shield"} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.splitSection}`}>
        <div className={styles.splitCopy}>
          <span className={styles.eyebrow}>Product spotlight</span>
          <h2>{spotlight.name}</h2>
          <p>{spotlight.longDescription}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href={`/product/${spotlight.slug}`}>
              View product
              <Icon name="arrow" />
            </Link>
            <Link className={styles.secondaryButton} href="/shop">
              Shop all
            </Link>
          </div>
        </div>
        <div className={styles.mediaFill}>
          <ProductVisual product={spotlight} scene={1} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Customer notes</span>
          <h2>Skincare people actually want to keep using.</h2>
        </div>
        <div className={styles.policyGrid}>
          {reviews.slice(0, 3).map((review) => (
            <article className={styles.reviewCard} key={review.name}>
              <p>{review.quote}</p>
              <h3>{review.name}</h3>
              <span className={styles.stockNote}>{review.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.infoCard}>
          <span className={styles.eyebrow}>Skin notes</span>
          <h2>Get the next WICKED drop first.</h2>
          <p>
            Early access to routine edits, restock alerts, and concise guidance
            for building a cleaner skincare shelf.
          </p>
          <form className={styles.newsletterMini}>
            <label className={styles.srOnly} htmlFor="home-newsletter">
              Email address
            </label>
            <input
              className={styles.input}
              id="home-newsletter"
              type="email"
              placeholder="skin@domain.com"
            />
            <button className={styles.primaryButton} type="button">
              <Icon name="arrow" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
