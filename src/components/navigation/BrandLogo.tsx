import Image from "next/image";
import styles from "@/styles/store.module.css";

const brandLogoBase = {
  alt: "WICKED skincare logo",
  height: 118,
  width: 1068,
};

const brandLogos = {
  black: {
    ...brandLogoBase,
    src: "/assets/wicked-logo-black.png",
  },
  white: {
    ...brandLogoBase,
    src: "/assets/wicked-logo-white.png",
  },
};

type BrandLogoVariant = keyof typeof brandLogos;
type BrandLogoPlacement = "nav" | "mobileMenu" | "footer";

const brandLogoDimensions: Record<
  BrandLogoPlacement,
  Pick<typeof brandLogoBase, "height" | "width">
> = {
  nav: {
    height: 20,
    width: 180,
  },
  mobileMenu: {
    height: 14,
    width: 128,
  },
  footer: {
    height: 23,
    width: 206,
  },
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
  const logo = brandLogos[variant];
  const dimensions = brandLogoDimensions[placement];

  return (
    <Image
      className={`${styles.logoImage} ${
        variant === "black" ? styles.logoImageBlack : styles.logoImageWhite
      }`}
      src={logo.src}
      alt={logo.alt}
      width={dimensions.width}
      height={dimensions.height}
      loading={eager ? "eager" : undefined}
    />
  );
}
