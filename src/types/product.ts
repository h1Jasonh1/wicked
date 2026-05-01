export type ProductBadge = "New" | "Best Seller" | "Limited" | "Signature" | "Sale";

export type ProductForm = "pump" | "dropper" | "jar" | "tube" | "set";

export type ProductFilter = "New" | "Popular" | "Premium" | "Sale";

export type StockStatus = "In stock" | "Low stock" | "Out of stock" | "Preorder";

export type ProductSkinType =
  | "All skin types"
  | "Normal"
  | "Dry"
  | "Oily"
  | "Combination"
  | "Sensitive";

export type ProductConcern =
  | "Acne & Breakouts"
  | "Barrier Support"
  | "Dark Spots"
  | "Dryness"
  | "Dullness"
  | "Fine Lines"
  | "Oil Control"
  | "Pores & Texture"
  | "Redness"
  | "Sun Protection";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  tag: string;
  badge: ProductBadge;
  skinTypes: ProductSkinType[];
  concerns: ProductConcern[];
  price: number;
  salePrice?: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  reviews: number;
  stockStatus: StockStatus;
  inventory: number;
  stock: number;
  stockNote: string;
  images: string[];
  image: string;
  imageAlt: string;
  gallery: string[];
  variants?: string[];
  sizes?: string[];
  visual: {
    form: ProductForm;
    accent: string;
    texture: string;
  };
  description: string;
  longDescription: string;
  benefits: string[];
  ingredients: string[];
  details: string[];
  specs: string[];
  usage: string;
  care: string;
  delivery: string;
  returns: string;
  filters: ProductFilter[];
  isFeatured: boolean;
  isActive: boolean;
  releaseRank: number;
};

export type ProductFormInput = {
  name: string;
  slug: string;
  category: string;
  skinTypes: ProductSkinType[];
  concerns: ProductConcern[];
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  inventory: number;
  badge: ProductBadge;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  ingredients: string[];
  usage: string;
  deliveryReturnsNote: string;
  image?: File | null;
  galleryImages?: File[];
  isFeatured: boolean;
  isActive: boolean;
};

export type Collection = {
  name: string;
  slug: string;
  description: string;
  image: string;
  visualDirection: string;
};
