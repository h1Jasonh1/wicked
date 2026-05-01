import {
  categories,
  concernFilters,
  products,
  shopFilters,
  skinTypeFilters,
} from "./store";

export { categories, concernFilters, shopFilters, skinTypeFilters };

export const categoryCards = [
  { category: "Cleansers", label: "Cleansers" },
  { category: "Serums", label: "Serums" },
  { category: "Moisturisers", label: "Moisturisers" },
  { category: "Toners", label: "Toners" },
  { category: "Sunscreen / SPF", label: "SPF" },
  { category: "Masks", label: "Masks" },
  { category: "Eye Care", label: "Eye Care" },
  { category: "Sets / Bundles", label: "Bundles" },
] as const;

export const categoryAliases: Record<string, string[]> = {
  Cleansers: ["cleanser", "cleanse", "face wash", "wash"],
  Serums: ["serum", "active", "vitamin", "treatment"],
  Moisturisers: ["moisturiser", "moisturizer", "cream", "barrier"],
  Toners: ["toner", "tone", "mist"],
  "Sunscreen / SPF": ["spf", "sunscreen", "sun cream", "sun protection"],
  Masks: ["mask", "treatment mask"],
  "Eye Care": ["eye", "eyes", "eye cream"],
  "Sets / Bundles": ["bundle", "bundles", "set", "sets", "kit"],
};

export const categoryLabels: Record<string, string> = {
  "Sunscreen / SPF": "SPF / Sunscreen",
  "Sets / Bundles": "Bundles",
};

export const searchableCategories = categories
  .filter((category) => category !== "All")
  .map((category) => ({
    aliases: categoryAliases[category] ?? [],
    href: `/shop?category=${encodeURIComponent(category)}#shop-products`,
    label: categoryLabels[category] ?? category,
    value: category,
  }));

export const suggestedCategoryValues = [
  "Cleansers",
  "Serums",
  "Moisturisers",
  "Sunscreen / SPF",
  "Masks",
] as const;

export function getProductsByIds(ids: readonly string[]) {
  return ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));
}
