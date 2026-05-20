import "server-only";

import type { Product } from "@/types/product";
import {
  fetchActiveProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
} from "./supabase/products";

/**
 * Server-side product data source. The catalogue is owned entirely by
 * Supabase — there is no local mock fallback. If the DB is unreachable
 * the UI renders an empty state rather than silently masking a real
 * connectivity problem with stale seed data.
 */
export async function loadProducts(): Promise<Product[]> {
  return (await fetchActiveProducts()) ?? [];
}

export async function loadProductBySlug(slug: string): Promise<Product | null> {
  return (await fetchProductBySlug(slug)) ?? null;
}

export async function loadRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  return (await fetchRelatedProducts(product, limit)) ?? [];
}
