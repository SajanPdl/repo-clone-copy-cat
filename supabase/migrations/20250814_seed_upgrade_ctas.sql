-- Seed "Upgrade to Pro" house campaigns, creatives, and initial placements
-- Idempotent: uses on conflict do nothing / upsert-like behavior

create extension if not exists pgcrypto;

-- 1) Ensure pages exist
insert into public.ad_pages(key, route_pattern) values
  ('home', null),
  ('dashboard', '^/dashboard'),
  ('pdf_viewer', '^/content/past-paper/'),
  ('profile', '^/profile')
on conflict (key) do nothing;

-- 2) Seed house campaigns targeted to free users
-- common targeting jsonb
with t as (
  select '{"roles":["free"]}'::jsonb as targeting
)
insert into public.ad_campaigns(
  advertiser_id, name, placement, start_at, end_at, priority, daily_cap, hourly_cap,
  targeting, is_active, source, external_placement_id, budget_usd, pacing,
  frequency_caps, objectives, revenue_model, behavior_tags, created_at, updated_at
)
select null, 'upgrade_sidebar', 'sidebar', now(), null, 10, null, null,
       t.targeting, true, 'house', null, null, 'standard',
       '{"per_session":1,"per_day":6}'::jsonb, '{"view":"cpm"}'::jsonb, 'cpm', '{}', now(), now()
from t
on conflict do nothing;

with t as (
  select '{"roles":["free"]}'::jsonb as targeting
)
insert into public.ad_campaigns(
  advertiser_id, name, placement, start_at, end_at, priority, daily_cap, hourly_cap,
  targeting, is_active, source, external_placement_id, budget_usd, pacing,
  frequency_caps, objectives, revenue_model, behavior_tags, created_at, updated_at
)
select null, 'upgrade_pdf_top', 'header', now(), null, 10, null, null,
       t.targeting, true, 'house', null, null, 'standard',
       '{"per_session":1,"per_day":6}'::jsonb, '{"view":"cpm"}'::jsonb, 'cpm', '{}', now(), now()
from t
on conflict do nothing;

with t as (
  select '{"roles":["free"]}'::jsonb as targeting
)
insert into public.ad_campaigns(
  advertiser_id, name, placement, start_at, end_at, priority, daily_cap, hourly_cap,
  targeting, is_active, source, external_placement_id, budget_usd, pacing,
  frequency_caps, objectives, revenue_model, behavior_tags, created_at, updated_at
)
select null, 'upgrade_ads_replacement', 'inline', now(), null, 9, null, null,
       t.targeting, true, 'house', null, null, 'standard',
       '{"per_session":2,"per_day":12}'::jsonb, '{"view":"cpm"}'::jsonb, 'cpm', '{}', now(), now()
from t
on conflict do nothing;

-- 3) Add HTML creatives for each campaign
-- helper to lookup campaign ids
with cs as (
  select id, name from public.ad_campaigns where name in ('upgrade_sidebar','upgrade_pdf_top','upgrade_ads_replacement')
)
insert into public.ad_creatives(campaign_id, title, description, media_url, media_type, link_url, width, height)
select c.id,
  case c.name when 'upgrade_sidebar' then 'Upgrade Sidebar Card'
              when 'upgrade_pdf_top' then 'Upgrade Banner Top'
              else 'Upgrade Inline Promo' end as title,
  'House promotion for upgrading to Pro',
  -- Store HTML snippet in media_url for simplicity; renderer treats media_type=html
  case c.name
    when 'upgrade_sidebar' then '<div style="border-radius:12px;padding:12px;background:#fff;border:1px solid #e5e7eb"><h4 style="margin:0 0 8px 0;">Upgrade to Pro</h4><ul style="padding-left:16px;margin:8px 0;color:#374151;font-size:13px"><li>No ads</li><li>Faster downloads</li><li>Highlights & notes</li><li>AI with higher limits</li></ul><a href="/subscription" style="display:inline-block;padding:8px 12px;border-radius:8px;background:#4f46e5;color:#fff;text-decoration:none;">Upgrade Now</a></div>'
    when 'upgrade_pdf_top' then '<div style="width:100%;text-align:center;padding:8px 12px;background:linear-gradient(90deg,#dc2626,#7c3aed);color:#fff;border-radius:8px;">Unlock highlights, notes & offline access — <a href="/subscription" style="color:#fff;text-decoration:underline;">Go Pro</a></div>'
    else '<div style="border-radius:10px;padding:10px;background:#111827;color:#fff;display:flex;align-items:center;justify-content:space-between"><span>No ads. Faster downloads. Go Pro.</span><a href="/subscription" style="padding:8px 10px;border-radius:8px;background:#10b981;color:#111827;text-decoration:none;">Upgrade</a></div>'
  end as media_url,
  'html',
  '/subscription',
  null, null
from cs c
on conflict do nothing;

-- 4) Create minimal layouts and slots (desktop) and assign campaigns
do $$
declare
  v_home uuid; v_dashboard uuid; v_pdf uuid;
  v_layout_home uuid; v_layout_dash uuid; v_layout_pdf uuid;
  v_slot_home uuid; v_slot_dash uuid; v_slot_pdf uuid;
  v_c_sidebar uuid; v_c_pdf_top uuid; v_c_inline uuid;
begin
  -- page ids
  select id into v_home from public.ad_pages where key='home';
  select id into v_dashboard from public.ad_pages where key='dashboard';
  select id into v_pdf from public.ad_pages where key='pdf_viewer';

  -- upsert layouts (desktop, default)
  insert into public.ad_layouts(page_id, device, name, grid_config, is_active)
  values (v_home,'desktop','default','{"cols":12,"rowHeight":40,"gap":8}'::jsonb,true)
  on conflict (page_id, device, name) do update set updated_at=now()
  returning id into v_layout_home;

  insert into public.ad_layouts(page_id, device, name, grid_config, is_active)
  values (v_dashboard,'desktop','default','{"cols":12,"rowHeight":40,"gap":8}'::jsonb,true)
  on conflict (page_id, device, name) do update set updated_at=now()
  returning id into v_layout_dash;

  insert into public.ad_layouts(page_id, device, name, grid_config, is_active)
  values (v_pdf,'desktop','default','{"cols":12,"rowHeight":40,"gap":8}'::jsonb,true)
  on conflict (page_id, device, name) do update set updated_at=now()
  returning id into v_layout_pdf;

  -- slots
  -- dashboard sidebar slot
  insert into public.ad_slots(layout_id, slot_key, placement, device, x,y,w,h, order_index, config, is_active)
  values (v_layout_dash, 'sidebar_promos', 'sidebar', 'desktop', 8,2,4,4, 0, '{"rotationMs":7000}'::jsonb, true)
  on conflict (layout_id, slot_key, device) do update set updated_at=now();
  select id into v_slot_dash from public.ad_slots where layout_id=v_layout_dash and slot_key='sidebar_promos' and device='desktop';

  -- pdf top banner
  insert into public.ad_slots(layout_id, slot_key, placement, device, x,y,w,h, order_index, config, is_active)
  values (v_layout_pdf, 'pdf_top', 'header', 'desktop', 0,0,12,2, 0, '{"rotationMs":7000}'::jsonb, true)
  on conflict (layout_id, slot_key, device) do update set updated_at=now();
  select id into v_slot_pdf from public.ad_slots where layout_id=v_layout_pdf and slot_key='pdf_top' and device='desktop';

  -- home inline promo
  insert into public.ad_slots(layout_id, slot_key, placement, device, x,y,w,h, order_index, config, is_active)
  values (v_layout_home, 'home_inline_promo', 'inline', 'desktop', 0,6,12,2, 0, '{"rotationMs":7000}'::jsonb, true)
  on conflict (layout_id, slot_key, device) do update set updated_at=now();
  select id into v_slot_home from public.ad_slots where layout_id=v_layout_home and slot_key='home_inline_promo' and device='desktop';

  -- campaign ids
  select id into v_c_sidebar from public.ad_campaigns where name='upgrade_sidebar';
  select id into v_c_pdf_top from public.ad_campaigns where name='upgrade_pdf_top';
  select id into v_c_inline from public.ad_campaigns where name='upgrade_ads_replacement';

  -- assignments (idempotent)
  if v_slot_dash is not null and v_c_sidebar is not null then
    insert into public.ad_slot_assignments(slot_id, campaign_id, rotation_index, is_active)
    values (v_slot_dash, v_c_sidebar, 0, true)
    on conflict (slot_id, campaign_id) do update set is_active=true, updated_at=now();
  end if;

  if v_slot_pdf is not null and v_c_pdf_top is not null then
    insert into public.ad_slot_assignments(slot_id, campaign_id, rotation_index, is_active)
    values (v_slot_pdf, v_c_pdf_top, 0, true)
    on conflict (slot_id, campaign_id) do update set is_active=true, updated_at=now();
  end if;

  if v_slot_home is not null and v_c_inline is not null then
    insert into public.ad_slot_assignments(slot_id, campaign_id, rotation_index, is_active)
    values (v_slot_home, v_c_inline, 0, true)
    on conflict (slot_id, campaign_id) do update set is_active=true, updated_at=now();
  end if;
end$$;


