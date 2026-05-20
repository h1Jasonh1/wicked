import type { Metadata } from "next";
import { loadProducts } from "@/lib/products";
import ShopClient from "./shop-client";

export const metadata: Metadata = {
  title: "Shop SOO | Premium Skincare",
  description:
    "Browse SOO cleansers, serums, moisturisers, toners, SPF, masks, eye care and skincare bundles.",
};

type ShopPageProps = {
  searchParams: Promise<{
    filter?: string;
    collection?: string;
    category?: string;
    concern?: string;
    q?: string;
    skinType?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [params, products] = await Promise.all([
    searchParams,
    loadProducts(),
  ]);

  return (
    <ShopClient
      key={[
        params.category ?? "All",
        params.collection ?? "All",
        params.skinType ?? "All",
        params.concern ?? "All",
        params.filter ?? "All",
        params.q ?? "",
      ].join(":")}
      initialCategory={params.category ?? "All"}
      initialCollection={params.collection ?? "All"}
      initialConcern={params.concern ?? "All"}
      initialFilter={params.filter ?? "All"}
      initialQuery={params.q ?? ""}
      initialSkinType={params.skinType ?? "All"}
      products={products}
    />
  );
}
