-- =====================================================================
-- Add payment_metadata jsonb column to orders.
--
-- Stores the raw ITN payload PayFast sent us, so when a customer or
-- their bank disputes a charge weeks later we have the original
-- transaction data (pf_payment_id, amount_gross, amount_fee, all the
-- custom_str fields, etc.) on file. Without it, recovering this
-- requires scraping PayFast's dashboard.
-- =====================================================================

alter table public.orders
  add column if not exists payment_metadata jsonb;
