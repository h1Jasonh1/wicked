/**
 * Hand-written Supabase database types. Mirrors the SQL schema in
 * supabase/migrations/0001_init.sql.
 *
 * Regenerate with the Supabase CLI once the project is linked:
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  marketing_emails: boolean;
  order_sms_updates: boolean;
  created_at: string;
  updated_at: string;
};

export type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string | null;
  address_line_1: string;
  address_line_2: string | null;
  suburb: string | null;
  city: string;
  province: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  brand: string | null;
  category: string | null;
  product_type: string | null;
  collection: string | null;
  tag: string | null;
  badge: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  images: string[] | null;
  featured_image: string | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  rating: number | null;
  review_count: number;
  skin_types: string[] | null;
  concerns: string[] | null;
  filters: string[] | null;
  benefits: string[] | null;
  ingredients: string[] | null;
  specs: string[] | null;
  variants: string[] | null;
  sizes: string[] | null;
  visual: Json | null;
  long_description: string | null;
  care: string | null;
  delivery: string | null;
  returns: string | null;
  release_rank: number | null;
  created_at: string;
  updated_at: string;
};

export type CartItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_variant: string | null;
  selected_size: string | null;
  created_at: string;
  updated_at: string;
};

export type WishlistItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount_total: number;
  delivery_total: number;
  total: number;
  currency: string;
  delivery_address: Json | null;
  payment_status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_metadata: Json | null;
  promo_code: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  tracking_provider: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string | null;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  total: number;
  created_at: string;
};

export type PromoCodeRow = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  usage_limit: number | null;
  used_count: number;
  minimum_order_amount: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  order_reference: string | null;
  message: string;
  user_id: string | null;
  created_at: string;
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      addresses: Table<AddressRow>;
      categories: Table<CategoryRow>;
      products: Table<ProductRow>;
      cart_items: Table<CartItemRow>;
      wishlist_items: Table<WishlistItemRow>;
      orders: Table<OrderRow>;
      order_items: Table<OrderItemRow>;
      promo_codes: Table<PromoCodeRow>;
      contact_messages: Table<ContactMessageRow>;
    };
    Views: Record<string, never>;
    Functions: {
      decrement_stock_batch: {
        Args: { p_items: Json };
        Returns: undefined;
      };
      restore_stock_batch: {
        Args: { p_items: Json };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
