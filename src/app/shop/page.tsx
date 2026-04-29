import type { Metadata } from "next";
import { products } from "@/app/data/store";
import ShopClient from "./shop-client";

export const metadata: Metadata = {
  title: "Shop WICKED | Premium Skincare",
  description:
    "Browse WICKED cleansers, serums, moisturisers, toners, SPF, masks, eye care and skincare bundles.",
};

type ShopPageProps = {
  searchParams: Promise<{
    filter?: string;
    collection?: string;
    category?: string;
    q?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  return (
    <ShopClient
      key={[
        params.category ?? "All",
        params.collection ?? "All",
        params.filter ?? "All",
        params.q ?? "",
      ].join(":")}
      initialCategory={params.category ?? "All"}
      initialCollection={params.collection ?? "All"}
      initialFilter={params.filter ?? "All"}
      initialQuery={params.q ?? ""}
      products={products}
    />
  );
}
