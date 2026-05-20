import Image from "next/image";
import styles from "@/styles/store.module.css";

// Two brand assets:
// - wordmark = horizontal "SOO skincare" lockup, used in nav + footer
// - emblem   = square rings/infinity mark, used as the compact icon
//              (mobile menu, and any place that needs a square slot)
const wordmarkBase = {
  alt: "SOO skincare",
  height: 200,
  width: 900,
};

const emblemBase = {
  alt: "SOO",
  height: 300,
  width: 600,
};

const brandAssets = {
  wordmark: {
    black: { ...wordmarkBase, src: "/assets/soo-wordmark-side-black.png" },
    white: { ...wordmarkBase, src: "/assets/soo-wordmark-side-white.png" },
  },
  emblem: {
    black: { ...emblemBase, src: "/assets/soo-logo-only-black.png" },
    white: { ...emblemBase, src: "/assets/soo-logo-only-white.png" },
  },
} as const;

type BrandLogoVariant = keyof typeof brandAssets.wordmark;
type BrandLogoPlacement = "nav" | "mobileMenu" | "footer";

// Each placement picks its asset (wordmark vs emblem) and a target render
// size. Aspect ratios are kept ~4.5:1 for the wordmark and ~2:1 for the
// emblem so the source PNGs scale cleanly without distortion.
const placementConfig: Record<
  BrandLogoPlacement,
  { asset: keyof typeof brandAssets; height: number; width: number }
> = {
  nav: { asset: "wordmark", height: 72, width: 120 },
  mobileMenu: { asset: "emblem", height: 80, width: 80 },
  footer: { asset: "emblem", height: 80, width: 80 },
};

export function BrandLogo({
  eager = false,
  placement = "nav",
  variant = "white",
}: {
  eager?: boolean;
  placement?: BrandLogoPlacement;
  variant?: BrandLogoVariant;
}) {
  const { asset, height, width } = placementConfig[placement];
  const logo = brandAssets[asset][variant];

  return (
    <Image
      className={`${styles.logoImage} ${
        variant === "black" ? styles.logoImageBlack : styles.logoImageWhite
      }`}
      src={logo.src}
      alt={logo.alt}
      width={width}
      height={height}
      loading={eager ? "eager" : undefined}
    />
  );
}
