-- PREMIUM AD LAYOUT BUILDER BACKEND
-- Tables: ad_templates, ad_template_versions, ad_template_docs (JSON),
--         ad_template_assignments (bind to campaign/slot), optional categories
-- Storage: ad-assets (public read, admin write)
-- RLS: admin-only writes, public read of published templates
-- RPCs: create_template, save_template_version, publish_template_version, resolve_template_for_slot

create extension if not exists pgcrypto;

-- helper
create or replace function public.is_admin(user_id uuid)
returns boolean language plpgsql security definer stable as $$
begin
  return exists (select 1 from public.users where id=user_id and role='admin');
exception when others then
  return false;
end; $$;
grant execute on function public.is_admin(uuid) to authenticated;

-- 0) Storage bucket for template assets (icons, bg images, fonts…)
do $$
begin
  insert into storage.buckets (id, name, public) values ('ad-assets','ad-assets',true);
exception when unique_violation then null;
end $$;

drop policy if exists "public read ad-assets" on storage.objects;
create policy "public read ad-assets" on storage.objects
for select using (bucket_id='ad-assets');

drop policy if exists "admin write ad-assets" on storage.objects;
create policy "admin write ad-assets" on storage.objects
for all using (public.is_admin(auth.uid()) and bucket_id='ad-assets')
with check (public.is_admin(auth.uid()) and bucket_id='ad-assets');

-- 1) Templates
create table if not exists public.ad_template_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.ad_template_categories(id) on delete set null,
  status text not null default 'draft', -- draft|active|archived
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.ad_templates(id) on delete cascade,
  version int not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(template_id, version)
);

-- JSON document holding the full builder layout
-- Suggested JSON structure:
-- {
--   "devices": {
--     "desktop": { "elements":[{ id, type, x,y,w,h, z, props, visible:true }], "meta":{ grid:{cols,rowHeight,gap} } },
--     "tablet":  { ... },
--     "mobile":  { ... }
--   },
--   "vars": { "theme":"light" },
--   "conditions": { "roles":["free"], "countries":["NP"], "tiers":["free"] }
-- }
create table if not exists public.ad_template_docs (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references public.ad_template_versions(id) on delete cascade,
  layout jsonb not null,
  created_at timestamptz not null default now(),
  unique(template_version_id)
);

-- Use template versions directly in slots or campaigns
create table if not exists public.ad_template_assignments (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references public.ad_template_versions(id) on delete cascade,
  -- bind to a slot or a campaign (one of them required)
  slot_id uuid references public.ad_slots(id) on delete cascade,
  campaign_id uuid references public.ad_campaigns(id) on delete cascade,
  device text check (device in ('desktop','tablet','mobile')) default 'desktop',
  start_at timestamptz,
  end_at timestamptz,
  targeting jsonb default '{}'::jsonb,     -- optional extra constraints
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) RLS
alter table public.ad_template_categories enable row level security;
alter table public.ad_templates enable row level security;
alter table public.ad_template_versions enable row level security;
alter table public.ad_template_docs enable row level security;
alter table public.ad_template_assignments enable row level security;

-- public read: only published versions; admin write-all
drop policy if exists tcat_read on public.ad_template_categories;
create policy tcat_read on public.ad_template_categories for select using (true);

drop policy if exists t_read on public.ad_templates;
create policy t_read on public.ad_templates for select using (true);

drop policy if exists tv_read on public.ad_template_versions;
create policy tv_read on public.ad_template_versions
for select using (is_published = true);

drop policy if exists td_read on public.ad_template_docs;
create policy td_read on public.ad_template_docs
for select using (exists (select 1 from public.ad_template_versions v
                          where v.id = template_version_id and v.is_published=true));

drop policy if exists ta_read on public.ad_template_assignments;
create policy ta_read on public.ad_template_assignments
for select using (is_active = true);

-- admin writes
drop policy if exists tcat_admin on public.ad_template_categories;
create policy tcat_admin on public.ad_template_categories
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists t_admin on public.ad_templates;
create policy t_admin on public.ad_templates
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists tv_admin on public.ad_template_versions;
create policy tv_admin on public.ad_template_versions
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists td_admin on public.ad_template_docs;
create policy td_admin on public.ad_template_docs
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists ta_admin on public.ad_template_assignments;
create policy ta_admin on public.ad_template_assignments
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 3) RPCs
-- Create a template
create or replace function public.create_template(p_name text, p_category text default null)
returns uuid language plpgsql security definer as $$
declare v_tid uuid; v_cid uuid;
begin
  if not public.is_admin(auth.uid()) then raise exception 'admin only'; end if;
  if p_category is not null then
    insert into public.ad_template_categories(name) values (p_category)
    on conflict (name) do update set name = excluded.name
    returning id into v_cid;
  end if;
  insert into public.ad_templates(name, category_id, created_by)
  values (p_name, v_cid, auth.uid()) returning id into v_tid;
  return v_tid;
end $$;
grant execute on function public.create_template(text, text) to authenticated;

-- Save a version (draft/published)
create or replace function public.save_template_version(p_template_id uuid, p_layout jsonb, p_publish boolean default false)
returns uuid language plpgsql security definer as $$
declare v_ver int; v_vid uuid;
begin
  if not public.is_admin(auth.uid()) then raise exception 'admin only'; end if;
  select coalesce(max(version),0)+1 into v_ver from public.ad_template_versions where template_id=p_template_id;
  insert into public.ad_template_versions(template_id, version, is_published)
  values (p_template_id, v_ver, coalesce(p_publish,false))
  returning id into v_vid;
  insert into public.ad_template_docs(template_version_id, layout) values (v_vid, p_layout);
  if p_publish then
    update public.ad_template_versions set is_published = false where template_id = p_template_id and id <> v_vid;
    update public.ad_templates set status='active' where id=p_template_id;
  end if;
  return v_vid;
end $$;
grant execute on function public.save_template_version(uuid, jsonb, boolean) to authenticated;

-- Publish a specific version (unpublish others)
create or replace function public.publish_template_version(p_template_id uuid, p_version_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'admin only'; end if;
  update public.ad_template_versions set is_published=false where template_id=p_template_id and id <> p_version_id;
  update public.ad_template_versions set is_published=true where id=p_version_id;
  update public.ad_templates set status='active' where id=p_template_id;
end $$;
grant execute on function public.publish_template_version(uuid, uuid) to authenticated;

-- Resolve a template assignment for a slot (by time/device/targeting)
-- Simplified: returns the latest published template_version_id bound to the slot & device within schedule
create or replace function public.resolve_template_for_slot(p_slot_id uuid, p_device text)
returns uuid language sql stable as $$
  select a.template_version_id
  from public.ad_template_assignments a
  join public.ad_template_versions v on v.id = a.template_version_id and v.is_published = true
  where a.slot_id = p_slot_id
    and coalesce(a.device, p_device) = p_device
    and a.is_active = true
    and (a.start_at is null or a.start_at <= now())
    and (a.end_at   is null or a.end_at   >= now())
  order by a.created_at desc
  limit 1;
$$;
grant execute on function public.resolve_template_for_slot(uuid, text) to anon, authenticated;