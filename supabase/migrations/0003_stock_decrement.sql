-- =====================================================================
-- Atomic stock decrement helpers for the order placement flow.
--
-- Without these, two concurrent orders for the last unit of a product
-- can both pass the stock-availability check in app code and then both
-- create orders against the same inventory. The decrement_stock_batch
-- function performs the row-level locking + check + decrement in a
-- single transaction and rolls back the whole batch if any item is
-- short, so partial decrements can never leak out.
-- =====================================================================

-- Decrement stock for a batch of items atomically. Input is a JSON
-- array of { product_id: uuid, quantity: integer }.
-- On any insufficient-stock or missing-product, the function raises and
-- the entire transaction (including any earlier decrements) rolls back.
create or replace function public.decrement_stock_batch(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  rows_affected integer;
begin
  -- Lock + decrement each row. We iterate in product_id order so two
  -- concurrent orders touching the same set of products acquire locks
  -- in the same sequence, avoiding deadlocks.
  for item in
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as elem
    order by (elem->>'product_id')::uuid
  loop
    update public.products
    set stock_quantity = stock_quantity - item.quantity
    where id = item.product_id
      and is_active = true
      and stock_quantity >= item.quantity;

    get diagnostics rows_affected = row_count;
    if rows_affected = 0 then
      raise exception 'insufficient_stock:%', item.product_id
        using errcode = 'P0001';
    end if;
  end loop;
end;
$$;

-- Restore stock for a batch of items. Used when the order row creation
-- fails after a successful decrement_stock_batch — best-effort cleanup
-- so we don't leave inventory wrongly reserved against a non-existent
-- order. Intentionally never raises; the worst case (failed restore) is
-- a small inventory drift that admin can correct, which is preferable
-- to throwing here and masking the original failure.
create or replace function public.restore_stock_batch(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  for item in
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as elem
  loop
    update public.products
    set stock_quantity = stock_quantity + item.quantity
    where id = item.product_id;
  end loop;
exception when others then
  -- Swallow on purpose. Caller has already failed the order; surfacing
  -- a second failure here would obscure the first. Inventory drift
  -- gets reconciled by admin if it ever happens.
  null;
end;
$$;

-- Lock down: only the service role should call these. Client supabase
-- code goes through RLS-protected tables; only the service-role admin
-- client (used in placeOrderAction / ITN handler) needs RPC access.
revoke all on function public.decrement_stock_batch(jsonb) from public, anon, authenticated;
revoke all on function public.restore_stock_batch(jsonb) from public, anon, authenticated;
grant execute on function public.decrement_stock_batch(jsonb) to service_role;
grant execute on function public.restore_stock_batch(jsonb) to service_role;
