import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  brand,
  getProductBySlug,
  getRelatedProducts,
  products,
} from "@/data/store";
import ProductPageClient from "./product-page-client";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: `${brand.name} Product`,
    };
  }

  return {
    title: `${product.name} | ${brand.name}`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductPageClient
      product={product}
      relatedProducts={getRelatedProducts(product, 4)}
    />
  );
}
