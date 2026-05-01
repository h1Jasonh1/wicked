export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const supportLinks = [
  { label: "Delivery", href: "/delivery" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

export const socialLinks = {
  instagram: {
    href: "https://www.instagram.com/wickedskincc/",
    ariaLabel: "Open WICKED on Instagram",
  },
  tiktok: {
    href: "https://www.tiktok.com/@wickedskin",
    ariaLabel: "Open WICKED on TikTok",
  },
} as const;

export const announcementItems = [
  "FREE DELIVERY OVER R750",
  "FAST SOUTH AFRICA DELIVERY",
  "CLEAN FORMULAS. BOLD RESULTS.",
  "EASY RETURNS",
  "SECURE CHECKOUT",
  "WICKED SKINCARE",
] as const;
