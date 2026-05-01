import type { Product } from "@/types/product";
import { searchableCategories, suggestedCategoryValues } from "@/data/categories";

export function normaliseSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

export function matchesSearchTerm(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

export function getHeaderSearchResults(term: string, products: Product[]) {
  const query = normaliseSearchTerm(term);
  const categoryResults = query
    ? searchableCategories.filter((category) =>
        [category.label, category.value, ...category.aliases].some((value) =>
          matchesSearchTerm(value, query),
        ),
      )
    : suggestedCategoryValues
        .map((value) =>
          searchableCategories.find((category) => category.value === value),
        )
        .filter(
          (category): category is (typeof searchableCategories)[number] =>
            Boolean(category),
        );

  const productResults = query
    ? products.filter((product) =>
        [
          product.name,
          product.category,
          product.collection,
          product.tag,
          product.badge,
          product.description,
          ...product.filters,
          ...product.skinTypes,
          ...product.concerns,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : [];

  return {
    categoryResults: categoryResults.slice(0, 5),
    productResults: productResults.slice(0, 5),
    query,
  };
}
