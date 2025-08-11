-- Hotfix: seed common page keys and ensure Storage policies for ad-images
-- Safe to run multiple times (idempotent)

create extension if not exists pgcrypto;

-- Admin helper (UUID)
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  return exists (select 1 from public.users where id = user_id and role = 'admin');
exception when others then
  return false;
end;
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- Ensure bucket ad-images exists (portable across Storage versions)
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('ad-images', 'ad-images', true);
exception when unique_violation then null; end $$;

-- Reset Storage policies for ad-images
drop policy if exists "public read ad-images" on storage.objects;
create policy "public read ad-images" on storage.objects
for select using (bucket_id = 'ad-images');

drop policy if exists "admin write ad-images" on storage.objects;
create policy "admin write ad-images" on storage.objects
for all using (public.is_admin(auth.uid()) and bucket_id = 'ad-images')
with check (public.is_admin(auth.uid()) and bucket_id = 'ad-images');

-- Seed common ad pages for the builder
create table if not exists public.ad_pages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  route_pattern text,
  created_at timestamptz not null default now()
);

insert into public.ad_pages(key, route_pattern) values
  ('home', null),
  ('past_papers', '^/past-papers$'),
  ('pdf_viewer', '^/content/past-paper/'),
  ('global_header', null)
on conflict (key) do nothing;


