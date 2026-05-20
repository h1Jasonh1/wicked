import type { Collection } from "@/types/product";

export type {
  Collection,
  Product,
  ProductBadge,
  ProductFilter,
  ProductForm,
} from "@/types/product";

export const brand = {
  name: "SOO",
  mark: "SOO",
  tagline: "Skincare with an edge.",
  description:
    "High-performance skincare for modern routines: clean formulas, bold results, and a black luxury point of view.",
};

export const heroImage =
  "https://images.unsplash.com/photo-1701056035595-58d01e6e50f1?auto=format&fit=crop&w=2400&q=88";

// Collections describe routine groupings shown on the home / about / shop
// filter pages. They aren't in the DB because the data we render here
// (visualDirection, marketing image, copy) isn't on the products table.
// Each `name` matches the `collection` text column on a product row.
export const collections: Collection[] = [
  {
    name: "Daily Reset",
    slug: "daily-reset",
    description:
      "Cleansers and toners that leave skin fresh, balanced, and ready for the rest of the routine.",
    visualDirection: "Cleanse",
    image:
      "https://images.unsplash.com/photo-1764694071454-fa9417be04a7?auto=format&fit=crop&w=1400&q=84",
  },
  {
    name: "Targeted Actives",
    slug: "targeted-actives",
    description:
      "Serums built around visible glow, smooth texture, hydration, and clarity without complicated layering.",
    visualDirection: "Treat",
    image:
      "https://images.unsplash.com/photo-1751131964776-57e3cbca0a14?auto=format&fit=crop&w=1400&q=84",
  },
  {
    name: "Barrier Support",
    slug: "barrier-support",
    description:
      "Moisturisers, eye care, and calm daily support for skin that needs comfort and resilience.",
    visualDirection: "Repair",
    image:
      "https://images.unsplash.com/photo-1768235146417-4ccc5befad83?auto=format&fit=crop&w=1400&q=84",
  },
  {
    name: "Glow Sets",
    slug: "glow-sets",
    description:
      "Curated skincare bundles for simple morning, evening, and travel routines.",
    visualDirection: "Bundle",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1400&q=84",
  },
];

export const shopFilters = ["All", "New", "Popular", "Premium", "Sale"] as const;

export const reviews = [
  {
    name: "Mila Jacobs",
    quote:
      "SOO feels elevated but practical. The cleanser and moisturiser made my routine simpler within a week.",
    initials: "MJ",
  },
  {
    name: "Thando Meyer",
    quote:
      "The brand knows exactly what it is: sharp black packaging, clear formulas, and product copy that does not overpromise.",
    initials: "TM",
  },
  {
    name: "Nadia Petersen",
    quote:
      "The SPF and serums sit beautifully under makeup. Everything feels considered without being precious.",
    initials: "NP",
  },
  {
    name: "Lara Singh",
    quote:
      "Fast delivery, secure packaging, and the checkout totals were easy to trust. The bundle was gift-ready.",
    initials: "LS",
  },
];

export { formatPrice } from "@/lib/formatters";
