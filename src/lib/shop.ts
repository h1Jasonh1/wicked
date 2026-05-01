import type {
  Product,
  ProductConcern,
  ProductFilter,
  ProductSkinType,
} from "@/types/product";

export type SortOption =
  | "Featured"
  | "Newest"
  | "Price Low to High"
  | "Price High to Low"
  | "Best Rated";

export const sortOptions: SortOption[] = [
  "Featured",
  "Newest",
  "Price Low to High",
  "Price High to Low",
  "Best Rated",
];

export type ProductFilterState = {
  category: string;
  collection: string;
  concern: string;
  filter: string;
  maxPrice: number;
  query: string;
  skinType: string;
  sort: SortOption;
};

export function getMaxProductPrice(products: Product[]) {
  return Math.max(...products.map((product) => product.price));
}

export function getVisibleProducts(
  products: Product[],
  {
    category,
    collection,
    concern,
    filter,
    maxPrice,
    query,
    skinType,
    sort,
  }: ProductFilterState,
) {
  const term = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesQuery = term
      ? [
          product.name,
          product.category,
          product.collection,
          product.tag,
          product.description,
          ...product.skinTypes,
          ...product.concerns,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      : true;
    const matchesCategory =
      category === "All" || product.category === category;
    const matchesCollection =
      collection === "All" || product.collection === collection;
    const matchesSkinType =
      skinType === "All" ||
      product.skinTypes.includes(skinType as ProductSkinType);
    const matchesConcern =
      concern === "All" ||
      product.concerns.includes(concern as ProductConcern);
    const matchesFilter =
      filter === "All" || product.filters.includes(filter as ProductFilter);
    const matchesPrice = product.price <= maxPrice;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesCollection &&
      matchesSkinType &&
      matchesConcern &&
      matchesFilter &&
      matchesPrice
    );
  });

  return [...filtered].sort((a, b) => {
    if (sort === "Newest") {
      return b.releaseRank - a.releaseRank;
    }

    if (sort === "Price Low to High") {
      return a.price - b.price;
    }

    if (sort === "Price High to Low") {
      return b.price - a.price;
    }

    if (sort === "Best Rated") {
      return b.rating - a.rating;
    }

    return b.reviews - a.reviews;
  });
}

export function hasActiveProductFilters(
  {
    category,
    collection,
    concern,
    filter,
    maxPrice,
    query,
    skinType,
  }: ProductFilterState,
  maxProductPrice: number,
) {
  return (
    query.trim() !== "" ||
    category !== "All" ||
    collection !== "All" ||
    skinType !== "All" ||
    concern !== "All" ||
    filter !== "All" ||
    maxPrice < maxProductPrice
  );
}
