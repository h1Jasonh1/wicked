"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import styles from "@/styles/landing.module.css";

function ArrowOut() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11L11 3M5 3h6v6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 7H3M6.5 3.5L3 7l3.5 3.5" />
    </svg>
  );
}

// The Korean houses SOO stocks. Each owns a colour drawn from the six
// accents the design's Tweaks panel auditioned — the active house's tint
// flows down to the ritual carousel below, binding the two acts.
const HOUSES = [
  {
    name: "Medicube",
    city: "Seoul",
    est: "2016",
    hero: "Collagen · PDRN",
    note: "Derm-clinic technology decanted into an everyday routine.",
    tint: "#c7a269",
  },
  {
    name: "COSRX",
    city: "Seoul",
    est: "2013",
    hero: "96% Snail Mucin",
    note: "The cult barrier-first staples that built the K-beauty canon.",
    tint: "#9ba56b",
  },
  {
    name: "Beauty of Joseon",
    city: "Seoul",
    est: "2010",
    hero: "Rice · Ginseng",
    note: "Hanbang heritage formulas — quiet, golden, gently brightening.",
    tint: "#d98a5a",
  },
  {
    name: "Anua",
    city: "Seoul",
    est: "2015",
    hero: "Heartleaf 77%",
    note: "Low-irritation layering for reactive, city-tired skin.",
    tint: "#5fa8a0",
  },
  {
    name: "SKIN1004",
    city: "Jeju",
    est: "2017",
    hero: "Madagascar Centella",
    note: "Single-origin cica — soothing, unfussy, barrier-kind.",
    tint: "#d29a8a",
  },
  {
    name: "Round Lab",
    city: "Seoul",
    est: "2017",
    hero: "Birch Sap · Mugwort",
    note: "Clean mineral hydration drawn from Dokdo birch forests.",
    tint: "#ece6d8",
  },
];

// Fallback used only when the live catalogue is empty/unreachable, so the
// ritual grid never collapses to blank frames.
const FALLBACK_PRODUCTS = [
  { name: "Glow Essence", category: "72% Snail Mucin · 50ml" },
  { name: "Cica Calm Cream", category: "Centella Asiatica · 60ml" },
  { name: "Ferment Night Ampoule", category: "Galactomyces · 30ml" },
  { name: "Barrier Veil Cream", category: "Niacinamide · PHA · 50ml" },
];

export function ShelfSection({ products }: { products: Product[] }) {
  // The active house drives the whole section's accent. Hovering a slat
  // re-tints the ritual carousel below in real time.
  const [house, setHouse] = useState(0);
  const [index, setIndex] = useState(0);
  // Items visible at once — drives both the translate step and the dot
  // count. Mirrors the CSS breakpoints (4 desktop / 2 tablet).
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const update = () => setVisibleCount(mql.matches ? 2 : 4);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const hasProducts = products.length > 0;
  const itemCount = hasProducts ? products.length : FALLBACK_PRODUCTS.length;
  const maxIndex = Math.max(0, itemCount - visibleCount);
  const currentIndex = Math.min(index, maxIndex);
  const activeTint = HOUSES[house].tint;

  return (
    <section
      className={styles.shelf}
      id="shop"
      style={{ "--house": activeTint } as React.CSSProperties}
    >
      <header className={styles.shelfHead}>
        <span className={styles.eyebrow}>The shelf · Houses &amp; the ritual</span>
        <h2 data-reveal className={styles.reveal}>
          Six houses, <em>one ritual.</em>
        </h2>
      </header>

      {/* ACT 01 — the houses (brand accordion) */}
      <div className={styles.shelfActHead}>
        <span className={styles.shelfActLabel}>
          <b>01</b> The houses
        </span>
        <span className={styles.shelfActAside}>
          {String(house + 1).padStart(2, "0")} — 06
        </span>
      </div>

      <div className={styles.accordion}>
        {HOUSES.map((entry, index) => {
          const isActive = index === house;
          return (
            <div
              key={entry.name}
              className={`${styles.slat} ${isActive ? styles.slatActive : ""}`}
              style={{ "--house": entry.tint } as React.CSSProperties}
              onMouseEnter={() => setHouse(index)}
            >
              <div className={styles.slatPlate} aria-hidden="true" />
              <span className={styles.slatGhost} aria-hidden="true">
                {entry.name}
              </span>
              <span className={styles.slatEdge} aria-hidden="true" />

              <button
                className={styles.slatHit}
                type="button"
                aria-expanded={isActive}
                aria-label={`Show ${entry.name}`}
                onFocus={() => setHouse(index)}
                onClick={() => setHouse(index)}
              >
                <span className={styles.slatNum}>
                  N°{String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.slatNameV}>{entry.name}</span>
              </button>

              <div className={styles.slatBody}>
                <span className={styles.slatEyebrow}>
                  Est. {entry.est} · {entry.city}
                </span>
                <span className={styles.slatName}>{entry.name}</span>
                <span className={styles.slatHero}>{entry.hero}</span>
                <p className={styles.slatNote}>{entry.note}</p>
                <Link
                  className={styles.slatCta}
                  href="/shop"
                  tabIndex={isActive ? 0 : -1}
                >
                  Shop the house
                  <span className={styles.arr} aria-hidden="true">
                    <ArrowOut />
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* connective bridge */}
      <div className={styles.shelfBridge}>
        <span>
          Whichever house you start with, the four-step ritual holds.
        </span>
      </div>

      {/* ACT 02 — the ritual (product carousel, tinted by the active house) */}
      <div className={styles.shelfActHead}>
        <span className={styles.shelfActLabel}>
          <b>02</b> The ritual
        </span>
        <span className={styles.shelfActAside}>
          Cleanse → Tone → Treat → Seal
        </span>
      </div>

      <div className={styles.carouselWrap}>
        {maxIndex > 0 ? (
          <div className={styles.carouselNav}>
            <button
              className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
              type="button"
              aria-label="Previous product"
              disabled={currentIndex === 0}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft />
            </button>
            <button
              className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
              type="button"
              aria-label="Next product"
              disabled={currentIndex === maxIndex}
              onClick={() => setIndex((current) => Math.min(maxIndex, current + 1))}
            >
              <ChevronRight />
            </button>
          </div>
        ) : null}
        <div className={styles.carousel}>
        <div
          className={styles.carouselTrack}
          style={{
            // --cols comes from the matching CSS breakpoint (4 desktop / 2
            // tablet). Translate by one column-width per index step so the
            // carousel cycles a single product at a time.
            transform: `translateX(calc(-${currentIndex} * (100% / var(--carousel-cols, 4))))`,
            transition: "transform 0.8s cubic-bezier(.22,.61,.36,1)",
          }}
        >
          {hasProducts
            ? products.map((product, idx) => (
                <Link
                  className={styles.product}
                  href={`/product/${product.slug}`}
                  key={product.id}
                >
                  <div className={styles.productFrame}>
                    <span className={styles.productNum}>
                      N°{String(idx + 1).padStart(2, "0")}
                    </span>
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.imageAlt || product.name}
                        fill
                        sizes="(max-width: 900px) 50vw, 25vw"
                      />
                    ) : (
                      <div className={styles.placeholder} />
                    )}
                    <span className={styles.productCta} aria-hidden="true">
                      <ChevronRight />
                    </span>
                  </div>
                  <div className={styles.productMeta}>
                    <div>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <span className={styles.productCat}>
                        {product.category}
                      </span>
                    </div>
                    <span className={styles.productPrice}>
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </Link>
              ))
            : FALLBACK_PRODUCTS.map((product, idx) => (
                <Link
                  className={styles.product}
                  href="/shop"
                  key={product.name}
                >
                  <div className={styles.productFrame}>
                    <span className={styles.productNum}>
                      N°{String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.placeholder} />
                    <span className={styles.productCta} aria-hidden="true">
                      <ChevronRight />
                    </span>
                  </div>
                  <div className={styles.productMeta}>
                    <div>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <span className={styles.productCat}>
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
        </div>
      </div>
    </section>
  );
}
