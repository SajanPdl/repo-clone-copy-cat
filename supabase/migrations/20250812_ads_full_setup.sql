-- ===========================================
-- FULL ADS SETUP: STORAGE, LEGACY ADS, ADVANCED ADS, RLS, RPCs
-- ===========================================

-- Ensure pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Robust admin helper (UUID)
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

-- ===========================================
-- STORAGE BUCKET for ad images + RLS
-- ===========================================
select storage.create_bucket('ad-images', public => true);

create policy if not exists "public read ad-images" on storage.objects
for select using (bucket_id = 'ad-images');

create policy if not exists "admin write ad-images" on storage.objects
for all using (public.is_admin(auth.uid()) and bucket_id = 'ad-images')
with check (public.is_admin(auth.uid()) and bucket_id = 'ad-images');

-- ===========================================
-- LEGACY ADS (backward compatibility)
-- ===========================================
create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  link_url text,
  position text not null,    -- e.g. header/sidebar/footer/content
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.advertisements
  add column if not exists ad_type text not null default 'banner';

alter table public.advertisements enable row level security;

drop policy if exists ads_select on public.advertisements;
drop policy if exists ads_admin on public.advertisements;

create policy ads_select on public.advertisements
for select using (true);

create policy ads_admin on public.advertisements
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ===========================================
-- ADVANCED ADS: core entities
-- ===========================================
create table if not exists public.advertisers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid references public.advertisers(id) on delete set null,
  name text not null,
  placement text not null, -- header|footer|sidebar|inline_*|popup|pdf_sidebar|floater
  start_at timestamptz not null default now(),
  end_at timestamptz,
  priority int not null default 1,
  daily_cap int,
  hourly_cap int,
  targeting jsonb not null default '{}'::jsonb, -- {roles:[], categories:[], countries:[], devices:[]}
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ad_campaigns
  add column if not exists source text not null default 'internal',     -- internal|adsterra|adsense|house
  add column if not exists external_placement_id text,
  add column if not exists budget_usd numeric,
  add column if not exists pacing text default 'standard',
  add column if not exists frequency_caps jsonb default '{}'::jsonb,   -- {"per_session":1,"per_day":3}
  add column if not exists objectives jsonb default '{}'::jsonb,       -- {"click":"cpc","view":"cpm","conv":"pro_upgrade"}
  add column if not exists revenue_model text default 'cpm',           -- cpm|cpc|cpa
  add column if not exists behavior_tags text[] default '{}';          -- e.g. {"physics","k12","search:vector"}

create index if not exists idx_ad_campaigns_active on public.ad_campaigns(is_active, placement);
create index if not exists idx_ad_campaigns_schedule on public.ad_campaigns(start_at, end_at);

create table if not exists public.ad_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  title text,
  description text,
  media_url text not null,
  media_type text not null default 'image',  -- image|video|html
  link_url text,
  width int,
  height int,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_impressions (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references public.ad_creatives(id) on delete cascade,
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  user_id uuid,
  country text,
  device text,
  occurred_at timestamptz not null default now()
);

create table if not exists public.ad_clicks (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references public.ad_creatives(id) on delete cascade,
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  user_id uuid,
  country text,
  device text,
  occurred_at timestamptz not null default now()
);

-- ===========================================
-- RLS for advanced ads
-- ===========================================
alter table public.advertisers enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_creatives enable row level security;
alter table public.ad_impressions enable row level security;
alter table public.ad_clicks enable row level security;

drop policy if exists admin_all_advertisers on public.advertisers;
create policy admin_all_advertisers on public.advertisers
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists admin_all_campaigns on public.ad_campaigns;
create policy admin_all_campaigns on public.ad_campaigns
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists admin_all_creatives on public.ad_creatives;
create policy admin_all_creatives on public.ad_creatives
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists public_read_creatives on public.ad_creatives;
create policy public_read_creatives on public.ad_creatives
for select using (true);

drop policy if exists insert_impressions on public.ad_impressions;
create policy insert_impressions on public.ad_impressions
for insert with check (true);

drop policy if exists insert_clicks on public.ad_clicks;
create policy insert_clicks on public.ad_clicks
for insert with check (true);

-- ===========================================
-- RPCs: FETCH + METRICS
-- ===========================================
create or replace function public.get_active_ads(
  p_placement text,
  p_user_role text default null,
  p_category  text default null,
  p_country   text default null,
  p_device    text default null,
  p_limit     int  default 5
)
returns table (
  creative_id uuid,
  campaign_id uuid,
  title text,
  description text,
  media_url text,
  media_type text,
  link_url text,
  priority int
)
language sql
stable
as $$
  select c.id as creative_id,
         c.campaign_id,
         c.title,
         c.description,
         c.media_url,
         c.media_type,
         c.link_url,
         camp.priority
  from public.ad_creatives c
  join public.ad_campaigns camp on camp.id = c.campaign_id
  where camp.is_active = true
    and camp.placement = p_placement
    and (camp.start_at is null or camp.start_at <= now())
    and (camp.end_at   is null or camp.end_at   >= now())
    and (
      camp.targeting = '{}'::jsonb
      or (
        (p_user_role is null or (camp.targeting->'roles')      is null or p_user_role = any (coalesce(array(select jsonb_array_elements_text(camp.targeting->'roles')),      array[]::text[])))
        and (p_category is null or (camp.targeting->'categories') is null or p_category = any (coalesce(array(select jsonb_array_elements_text(camp.targeting->'categories')), array[]::text[])))
        and (p_country  is null or (camp.targeting->'countries')  is null or p_country  = any (coalesce(array(select jsonb_array_elements_text(camp.targeting->'countries')),  array[]::text[])))
        and (p_device   is null or (camp.targeting->'devices')    is null or p_device   = any (coalesce(array(select jsonb_array_elements_text(camp.targeting->'devices')),    array[]::text[])))
      )
    )
  order by camp.priority desc, c.created_at desc
  limit p_limit
$$;

grant execute on function public.get_active_ads(text,text,text,text,text,int) to anon, authenticated;

create or replace function public.log_ad_impression(
  p_creative uuid,
  p_campaign uuid,
  p_user     uuid default null,
  p_country  text default null,
  p_device   text default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.ad_impressions(creative_id, campaign_id, user_id, country, device)
  values (p_creative, p_campaign, p_user, p_country, p_device);
end;
$$;

create or replace function public.log_ad_click(
  p_creative uuid,
  p_campaign uuid,
  p_user     uuid default null,
  p_country  text default null,
  p_device   text default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.ad_clicks(creative_id, campaign_id, user_id, country, device)
  values (p_creative, p_campaign, p_user, p_country, p_device);
end;
$$;

grant execute on function public.log_ad_impression(uuid,uuid,uuid,text,text) to anon, authenticated;
grant execute on function public.log_ad_click(uuid,uuid,uuid,text,text)      to anon, authenticated;

-- ===========================================
-- END
-- ===========================================


