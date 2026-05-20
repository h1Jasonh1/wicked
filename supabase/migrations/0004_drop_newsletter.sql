-- =====================================================================
-- Drop the unused newsletter_subscribers table.
--
-- The newsletter capture surface was removed from the home page and the
-- product is no longer collecting subscribers, so the table and its
-- policy are dead weight. Safe to drop — no other code reads from it.
-- =====================================================================

drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
drop table if exists public.newsletter_subscribers;
