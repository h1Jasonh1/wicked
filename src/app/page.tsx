import { HomeLanding } from "@/components/landing/HomeLanding";
import { loadProducts } from "@/lib/products";

export default async function Home() {
  // The catalogue feeds the routine carousel; the rest of the editorial
  // landing is static marketing content. HomeLanding falls back to a
  // static four-up if the catalogue is empty or unreachable.
  const products = await loadProducts();

  return <HomeLanding products={products} />;
}
