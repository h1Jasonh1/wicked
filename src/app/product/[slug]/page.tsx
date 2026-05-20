import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/data/store";
import { loadProductBySlug, loadRelatedProducts } from "@/lib/products";
import ProductPageClient from "./product-page-client";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProductBySlug(slug);

  if (!product) {
    return { title: `${brand.name} Product` };
  }

  return {
    title: `${product.name} | ${brand.name}`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await loadProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await loadRelatedProducts(product, 4);

  return (
    <ProductPageClient product={product} relatedProducts={relatedProducts} />
  );
}
