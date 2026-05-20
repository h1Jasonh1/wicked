-- =====================================================================
-- WICKED — flip marketing preferences to opt-in (default off)
-- =====================================================================
-- Earlier schema defaulted marketing_emails and order_sms_updates to true,
-- which is the wrong default — users must explicitly opt in. This migration
-- flips the column defaults and backfills every existing profile that was
-- created with the old default to false. Profiles that have explicitly
-- opted in via the settings UI (after this ships) will not be affected,
-- because that path runs after the deploy.
-- =====================================================================

alter table public.profiles
  alter column marketing_emails set default false,
  alter column order_sms_updates set default false;

update public.profiles
set marketing_emails = false
where marketing_emails is true;

update public.profiles
set order_sms_updates = false
where order_sms_updates is true;
