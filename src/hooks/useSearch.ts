"use client";

import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getHeaderSearchResults } from "@/lib/search";
import { useUIStore } from "@/store/StoreProvider";

export function useHeaderSearch(term: string, products: Product[]) {
  const { searchOpen, setSearchOpen } = useUIStore();
  const results = useMemo(
    () => getHeaderSearchResults(term, products),
    [products, term],
  );

  return {
    ...results,
    searchOpen,
    setSearchOpen,
  };
}
