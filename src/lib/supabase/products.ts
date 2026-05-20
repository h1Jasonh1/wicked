import "server-only";

import type { ProductRow } from "./database.types";
import { getSupabasePublicClient } from "./public";
import type {
  Product,
  ProductBadge,
  ProductConcern,
  ProductFilter,
  ProductForm,
  ProductSkinType,
  StockStatus,
} from "@/types/product";

const KNOWN_BADGES: ProductBadge[] = [
  "New",
  "Best Seller",
  "Limited",
  "Signature",
  "Sale",
];
const KNOWN_FILTERS: ProductFilter[] = ["New", "Popular", "Premium", "Sale"];
const KNOWN_FORMS: ProductForm[] = ["pump", "dropper", "jar", "tube", "set"];

function asBadge(value: string | null): ProductBadge {
  if (value && (KNOWN_BADGES as string[]).includes(value)) {
    return value as ProductBadge;
  }
  return "Signature";
}

function asFilters(values: string[] | null): ProductFilter[] {
  if (!values) return [];
  return values.filter((value): value is ProductFilter =>
    (KNOWN_FILTERS as string[]).includes(value),
  );
}

function asForm(value: string | undefined): ProductForm {
  if (value && (KNOWN_FORMS as string[]).includes(value)) {
    return value as ProductForm;
  }
  return "pump";
}

function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "Out of stock";
  if (stock <= 12) return "Low stock";
  return "In stock";
}

export function mapProductRow(row: ProductRow): Product {
  const visual = (row.visual ?? {}) as Partial<{
    form: string;
    accent: string;
    texture: string;
  }>;

  const fallbackImage =
    row.featured_image ??
    row.images?.[0] ??
    "https://images.unsplash.com/photo-1701056035595-58d01e6e50f1?auto=format&fit=crop&w=2400&q=88";

  const images = (row.images && row.images.length ? row.images : [fallbackImage]).filter(
    Boolean,
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category ?? "Skincare",
    collection: row.collection ?? "Daily Reset",
    tag: row.tag ?? row.short_description ?? "",
    badge: asBadge(row.badge),
    skinTypes: (row.skin_types ?? []) as ProductSkinType[],
    concerns: (row.concerns ?? []) as ProductConcern[],
    price: Number(row.price),
    salePrice: row.compare_at_price ? Number(row.price) : undefined,
    compareAt: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    rating: row.rating ? Number(row.rating) : 4.8,
    reviewCount: row.review_count,
    reviews: row.review_count,
    stockStatus: getStockStatus(row.stock_quantity),
    inventory: row.stock_quantity,
    stock: row.stock_quantity,
    stockNote:
      row.stock_quantity <= 0
        ? "Restocking soon"
        : row.stock_quantity <= 12
          ? "Limited batch"
          : "Ready to dispatch",
    images,
    image: fallbackImage,
    imageAlt: row.short_description ?? row.name,
    gallery: images.slice(1),
    variants: row.variants?.length ? row.variants : undefined,
    sizes: row.sizes?.length ? row.sizes : undefined,
    visual: {
      form: asForm(visual.form),
      accent: visual.accent ?? "#d6bf8d",
      texture: visual.texture ?? "studio",
    },
    description: row.description ?? row.short_description ?? "",
    longDescription: row.long_description ?? row.description ?? "",
    benefits: row.benefits ?? [],
    ingredients: row.ingredients ?? [],
    details: row.ingredients ?? [],
    specs: row.specs ?? [],
    usage: row.care ?? "",
    care: row.care ?? "",
    delivery: row.delivery ?? "",
    returns: row.returns ?? "",
    filters: asFilters(row.filters),
    isFeatured: row.is_featured,
    isActive: row.is_active,
    releaseRank: row.release_rank ?? 0,
  };
}

export async function fetchActiveProducts(): Promise<Product[] | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("release_rank", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[supabase] fetchActiveProducts failed", error.message);
    return null;
  }

  return data.map(mapProductRow);
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[supabase] fetchProductBySlug failed", error.message);
    return null;
  }

  return data ? mapProductRow(data) : null;
}

export async function fetchRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[] | null> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .neq("id", product.id)
    .or(
      `category.eq.${product.category},collection.eq.${product.collection}`,
    )
    .limit(limit);

  if (error) {
    console.error("[supabase] fetchRelatedProducts failed", error.message);
    return null;
  }

  return data.map(mapProductRow);
}
