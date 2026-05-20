"use client";

import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/types/product";

type CatalogContextValue = {
  products: Product[];
  productsBySlug: Map<string, Product>;
  productsById: Map<string, Product>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  children,
  products,
}: {
  children: React.ReactNode;
  products: Product[];
}) {
  const value = useMemo<CatalogContextValue>(() => {
    const bySlug = new Map<string, Product>();
    const byId = new Map<string, Product>();
    for (const product of products) {
      bySlug.set(product.slug, product);
      byId.set(product.id, product);
    }
    return { products, productsBySlug: bySlug, productsById: byId };
  }, [products]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }
  return context;
}
