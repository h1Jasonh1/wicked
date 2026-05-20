// Category UI metadata. The category *values* themselves come from the
// live product catalogue at runtime — the labels, aliases, and ordering
// below are presentation-layer concerns that don't need to live in the
// DB. The category list itself is in the public.categories table on
// Supabase, but the canonical category-text value is whatever sits on
// each product row.

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

// Order in which categories appear in the empty-search "suggested"
// dropdown. Values not present in the live catalogue are skipped.
export const suggestedCategoryValues = [
  "Cleansers",
  "Serums",
  "Moisturisers",
  "Sunscreen / SPF",
  "Masks",
] as const;

export type SearchableCategory = {
  aliases: string[];
  href: string;
  label: string;
  value: string;
};

/**
 * Build the "searchable categories" list from a runtime product set.
 * Returns one entry per distinct category in the catalogue (in the
 * order they appear), skipping the synthetic "All" pseudo-category.
 */
export function buildSearchableCategories(
  categoryValues: Iterable<string>,
): SearchableCategory[] {
  const seen = new Set<string>();
  const out: SearchableCategory[] = [];
  for (const value of categoryValues) {
    if (!value || value === "All" || seen.has(value)) continue;
    seen.add(value);
    out.push({
      aliases: categoryAliases[value] ?? [],
      href: `/shop?category=${encodeURIComponent(value)}#shop-products`,
      label: categoryLabels[value] ?? value,
      value,
    });
  }
  return out;
}
