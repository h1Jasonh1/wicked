"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Product } from "@/types/product";
import { ShelfSection } from "@/components/landing/ShelfSection";
import styles from "@/styles/landing.module.css";

// Small inline glyphs — the landing page is self-contained and the
// shared <Icon> set is tuned for the rest of the (lighter-weight) UI.
function ArrowOut() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11L11 3M5 3h6v6" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

type EditorialPair = {
  tag: string;
  num: string;
  sub: string;
  title: string;
  image?: string;
  imageAlt?: string;
};

const EDITORIAL_PAIRS: EditorialPair[] = [
  {
    tag: "Cold press",
    num: "01 / 04",
    sub: "Process · 02:14",
    title: "The Korean double cleanse, from balm to foam.",
    image: "/assets/tenderd-image2.webp",
    imageAlt: "Tended ritual editorial",
  },
  {
    tag: "Snail mucin",
    num: "02 / 04",
    sub: "Ingredient story · 03:01",
    title: "Why snail mucin out-plumps hyaluronic acid.",
    image: "/assets/tenderd-image1.jpg",
    imageAlt: "Tended ritual editorial",
  },
  {
    tag: "Lab",
    num: "03 / 04",
    sub: "Formulation · 03:48",
    title: "Layering niacinamide and retinol, without the breakout.",
    image: "/assets/tenderd-image3.webp",
    imageAlt: "Tended ritual editorial",
  },
  {
    tag: "Ritual",
    num: "04 / 04",
    sub: "5-step morning ritual · 01:22",
    title: "Five layers, eleven minutes, every morning.",
    image: "/assets/tenderd-image4.webp",
    imageAlt: "Tended ritual editorial",
  },
];

type ScatterItem = {
  cls: "s1" | "s2" | "s3" | "s4";
  meta: string;
  image?: string;
  video?: string;
};

const SCATTER_ITEMS: ScatterItem[] = [
  { cls: "s1", meta: "Field, dawn", video: "/assets/scatterblock-video3.mp4" },
  { cls: "s2", meta: "", image: "/assets/scatterblock-image2.jpg" },
  { cls: "s3", meta: "Studio, glass", image: "/assets/scatterblock-image3.jpg" },
  { cls: "s4", meta: "", video: "/assets/scatterblock-video1.mp4" },
];

const INSTAGRAM_URL = "https://www.instagram.com/wickedskincc/";

export function HomeLanding({ products }: { products: Product[] }) {
  const splitRef = useRef<HTMLElement>(null);
  const splitStageRef = useRef<HTMLDivElement>(null);
  const splitVideoRef = useRef<HTMLDivElement>(null);
  const scatterStageRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  // Immersive scroll treatment: hide the document scrollbar while the
  // landing page is mounted, and trail a transparent "scroll" bubble on
  // the cursor near the top of the page. Both are cleaned up on unmount
  // so other routes keep their normal scrollbar.
  useEffect(() => {
    document.documentElement.classList.add("wk-hide-scrollbar");

    const cue = scrollCueRef.current;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!cue || !finePointer) {
      return () => {
        document.documentElement.classList.remove("wk-hide-scrollbar");
      };
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let raf = 0;
    let hasMoved = false;

    const nearTop = () => window.scrollY < window.innerHeight * 0.55;
    // The scroll bubble should only invite scrolling — suppress it when
    // the cursor is parked on the nav, since hovering links/icons is its
    // own interaction and the bubble would just clutter that.
    let overNav = false;

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!hasMoved) {
        hasMoved = true;
        currentX = targetX;
        currentY = targetY;
      }
      const target = event.target as Element | null;
      overNav = !!target?.closest("header");
      cue.classList.toggle(styles.scrollCueVisible, nearTop() && !overNav);
    };

    const onScroll = () => {
      cue.classList.toggle(
        styles.scrollCueVisible,
        hasMoved && nearTop() && !overNav,
      );
    };

    const tick = () => {
      const ease = reduceMotion ? 1 : 0.16;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      cue.style.transform = `translate(${currentX}px, ${currentY}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("wk-hide-scrollbar");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Scroll-driven choreography for the pinned "Double Cleanse" split
  // section and the library scatter cluster. Both derive a single 0..1
  // progress from the section's position in the viewport, throttled to
  // one rAF per scroll burst.
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const updateSplit = () => {
      const section = splitRef.current;
      const stage = splitStageRef.current;
      const video = splitVideoRef.current;
      if (!section || !stage || !video) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(1, section.offsetHeight - vh);
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      const anim = reduceMotion ? 0 : Math.min(1, scrolled / vh);
      const isMobile = window.matchMedia("(max-width: 900px)").matches;

      if (isMobile) {
        // Mobile: matches the "Play / Reel" reference. At start the video
        // is moderately sized between words spread on either side. By the
        // end the words have slid fully off-screen and the video nearly
        // fills the viewport.
        const videoWvw = 44 + 42 * anim; // 44vw → 86vw
        const videoHvh = 24 + 32 * anim; // 24vh → 56vh
        video.style.setProperty("--sv-w", `${videoWvw}vw`);
        video.style.setProperty("--sv-h", `${videoHvh}vh`);
        stage.style.setProperty("--word-offset", `${anim * 88}vw`);
        stage.style.setProperty("--word-offset-y", "0vh");
      } else {
        stage.style.setProperty("--word-offset", `${22 - 21 * anim}vw`);
        video.style.setProperty("--sv-w", `${14 + 86 * anim}vw`);
        const startH = (14 * 9) / 16;
        video.style.setProperty(
          "--sv-h",
          `calc(${(1 - anim) * startH}vw + ${anim * 100}vh)`,
        );
        stage.style.setProperty("--word-offset-y", "0vh");
      }
      video.style.setProperty("--play-tag-op", String(Math.max(0, 1 - anim * 1.6)));
    };

    const updateScatter = () => {
      const stage = scatterStageRef.current;
      if (!stage) return;

      // Below the responsive breakpoint, the scatter cluster falls back to a
      // simple vertical stack via CSS — clear any inline transforms we may
      // have written on wider viewports so they don't override that layout.
      if (window.matchMedia("(max-width: 900px)").matches) {
        stage
          .querySelectorAll<HTMLElement>("[data-scatter-item]")
          .forEach((el) => {
            el.style.transform = "";
          });
        return;
      }

      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const seen = Math.max(0, Math.min(total, vh - rect.top));
      const progress = total > 0 ? seen / total : 0;
      const drift = reduceMotion
        ? 0
        : Math.max(0, Math.min(1, (progress - 0.35) / 0.5));

      stage
        .querySelectorAll<HTMLElement>("[data-scatter-item]")
        .forEach((el) => {
          const cs = getComputedStyle(el);
          const ox = parseFloat(cs.getPropertyValue("--ox")) || 0;
          const oy = parseFloat(cs.getPropertyValue("--oy")) || 0;
          const dx = parseFloat(cs.getPropertyValue("--dx")) || 0;
          const dy = parseFloat(cs.getPropertyValue("--dy")) || 0;
          const tx = ox + dx * drift;
          const ty = oy + dy * drift;
          el.style.transform = `translate(-50%, -50%) translate(${tx}vw, ${ty}vw)`;
        });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateSplit();
        updateScatter();
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Entry reveals — fade/clip-mask elements in as they enter the viewport.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add(styles.isActive));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.isActive);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.landing}>
      {/* Transparent bubble that trails the cursor, hinting "scroll". */}
      <div className={styles.scrollCue} ref={scrollCueRef} aria-hidden="true">
        <span className={styles.scrollCueLabel}>Scroll</span>
        <svg
          className={styles.scrollCueArrow}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 2v10M3 8l4 4 4-4" />
        </svg>
      </div>

      {/* ---------- HERO ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <div className={styles.placeholder} />
        </div>
        <div className={styles.heroVignette} />
        <div className={styles.heroFade} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            Authentic Korean Skincare — made for glass skin
          </p>
          <h1 className={styles.heroHeadline}>
            <span className={styles.line}>Glass skin,</span>
            <span className={styles.line}>earned through</span>
            <span className={styles.line}>quiet ritual.</span>
          </h1>
          <Link className={styles.heroCta} href="/shop">
            Explore the routine
            <span className={styles.arr} aria-hidden="true">
              <ArrowOut />
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- THE SHELF — houses + ritual, combined ---------- */}
      <ShelfSection products={products} />

      {/* ---------- EDITORIAL PAIRS ---------- */}
      <section className={styles.editorial} id="ritual">
        <div className={styles.edHead}>
          <h2 data-reveal className={styles.reveal}>
            Tended.
          </h2>
        </div>

        <div className={styles.pair}>
          {renderEditorialCard(EDITORIAL_PAIRS[0], "a")}
          <div className={styles.pairRight}>
            {renderEditorialCard(EDITORIAL_PAIRS[1], "b")}
          </div>
        </div>

        <div className={`${styles.pair} ${styles.pairOffset}`}>
          {renderEditorialCard(EDITORIAL_PAIRS[2], "a")}
          {renderEditorialCard(EDITORIAL_PAIRS[3], "b")}
        </div>
      </section>

      {/* ---------- PINNED SPLIT ---------- */}
      <section className={styles.split} ref={splitRef}>
        <div className={styles.splitPin}>
          <div className={styles.splitCaptionMobileTop}>
            <span>Seoul</span>
          </div>
          <div className={styles.splitStage} ref={splitStageRef}>
            <span className={`${styles.splitWord} ${styles.splitWordLeft}`}>
              Double
            </span>
            <div className={styles.splitVideo} ref={splitVideoRef}>
              <video
                src="/assets/scatterblock-video2.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label="The Korean double cleanse, explained"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  // Swap container dims so the portrait source fills the
                  // landscape stage after a -90deg rotation (same trick as s1).
                  width: "var(--sv-h, 7.9vw)",
                  height: "var(--sv-w, 14vw)",
                  transform: "translate(-50%, -50%) rotate(-90deg)",
                  objectFit: "cover",
                  background: "transparent",
                }}
              />
            </div>
            <span className={`${styles.splitWord} ${styles.splitWordRight}`}>
              <em>Cleanse.</em>
            </span>
          </div>

          <div className={styles.splitCaptionBottom}>
            <span className={styles.splitCityDesktop}>Seoul · Cape Town</span>
            <span className={styles.splitCityMobile}>Cape Town</span>
          </div>
        </div>
      </section>

      {/* ---------- LIBRARY SCATTER ---------- */}
      <section className={styles.scatter} id="library">
        <div className={styles.scatterStage} ref={scatterStageRef}>
          <div className={styles.scatterCluster}>
            <div
              data-scatter-item
              className={`${styles.scatterItem} ${styles.center}`}
            >
              <Image
                src="/assets/scatterblock-image1.jpg"
                alt="Hero, the ritual"
                fill
                sizes="(max-width: 900px) 100vw, 35vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
              <span className={styles.meta}>Hero, the ritual</span>
            </div>
            {SCATTER_ITEMS.map((item) => (
              <div
                key={item.cls}
                data-scatter-item
                className={`${styles.scatterItem} ${styles[item.cls]}`}
              >
                {item.video ? (
                  item.cls === "s1" ? (
                    <video
                      src={item.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      aria-label={item.meta || "Tended ritual"}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        background: "transparent",
                      }}
                    />
                  ) : (
                    <video
                      src={item.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      aria-label={item.meta || "Tended ritual"}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        background: "transparent",
                      }}
                    />
                  )
                ) : item.image ? (
                  <Image
                    src={item.image}
                    alt={item.meta || "Tended ritual"}
                    fill
                    sizes="(max-width: 900px) 60vw, 25vw"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                ) : (
                  <div className={styles.placeholder} />
                )}
                {item.meta ? (
                  <span className={styles.meta}>{item.meta}</span>
                ) : null}
              </div>
            ))}
          </div>

          <div
            data-reveal
            className={styles.scatterContent}
            id="scatter-content"
          >
            <h2 data-reveal className={styles.scatterTitle}>
              <span className={styles.lineWrap}>
                <span>The Journal,</span>
              </span>
              <span className={styles.lineWrap}>
                <span>read deeper.</span>
              </span>
            </h2>
            <Link className={styles.scatterBtn} href="/shop">
              <span>Open the routine library</span>
              <span className={styles.arr} aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- INSTAGRAM STRIP ---------- */}
      <section className={styles.insta}>
        <div className={styles.instaHead}>
          <h2>Follow us on Instagram</h2>
          <span className={styles.handle}>@wickedskincc</span>
        </div>
        <div className={styles.instaGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <a
              key={index}
              className={styles.instaCell}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open SOO on Instagram"
            >
              <div className={styles.placeholder} />
              <span className={styles.ig} aria-hidden="true">
                <InstagramGlyph />
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function renderEditorialCard(
  pair: EditorialPair,
  variant: "a" | "b",
) {
  return (
    <Link
      className={`${styles.card} ${variant === "a" ? styles.cardA : styles.cardB}`}
      href="/shop"
    >
      <div className={styles.cardMedia}>
        <span className={styles.cardTag}>{pair.tag}</span>
        <span className={styles.cardTagNum}>{pair.num}</span>
        {pair.image ? (
          <Image
            src={pair.image}
            alt={pair.imageAlt ?? pair.title}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : (
          <div className={styles.placeholder} />
        )}
        <span className={styles.playPill}>Play film</span>
      </div>
      <div className={styles.cardCaption}>
        <div className={styles.captionInner}>
          <span className={styles.cardSub}>{pair.sub}</span>
          <h3 className={styles.cardTitle}>{pair.title}</h3>
        </div>
        <span className={styles.cardArrow} aria-hidden="true">
          <ArrowOut />
        </span>
      </div>
    </Link>
  );
}
