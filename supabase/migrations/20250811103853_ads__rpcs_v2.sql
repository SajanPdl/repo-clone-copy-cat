-- Seed more Upgrade CTAs + tablet/mobile layouts and assignments (idempotent)
create extension if not exists pgcrypto;

-- helpers
create or replace function public.is_admin(user_id uuid)
returns boolean language plpgsql security definer stable as $$
begin return exists (select 1 from public.users where id=user_id and role='admin'); exception when others then return false; end; $$;
grant execute on function public.is_admin(uuid) to authenticated;

-- 0) Ensure pages exist
insert into public.ad_pages(key, route_pattern) values
  ('home', null),
  ('dashboard', '^/dashboard'),
  ('pdf_viewer', '^/content/past-paper/'),
  ('profile', '^/profile'),
  ('downloads', '^/downloads')
on conflict (key) do nothing;

-- 1) NEW house campaigns for free users
with t as (select '{"roles":["free"]}'::jsonb targeting)
insert into public.ad_campaigns(advertiser_id,name,placement,start_at,end_at,priority,daily_cap,hourly_cap,
  targeting,is_active,source,external_placement_id,budget_usd,pacing,frequency_caps,objectives,revenue_model,behavior_tags,created_at,updated_at)
select null,'upgrade_profile_badge','sidebar',now(),null,10,null,null,
       targeting,true,'house',null,null,'standard','{"per_session":1,"per_day":6}'::jsonb,'{"view":"cpm"}'::jsonb,'cpm','{}',now(),now()
from t
on conflict do nothing;

with t as (select '{"roles":["free"]}'::jsonb targeting)
insert into public.ad_campaigns(advertiser_id,name,placement,start_at,end_at,priority,daily_cap,hourly_cap,
  targeting,is_active,source,external_placement_id,budget_usd,pacing,frequency_caps,objectives,revenue_model,behavior_tags,created_at,updated_at)
select null,'upgrade_downloads','inline',now(),null,9,null,null,
       targeting,true,'house',null,null,'standard','{"per_session":1,"per_day":12}'::jsonb,'{"view":"cpm"}'::jsonb,'cpm','{}',now(),now()
from t
on conflict do nothing;

-- 2) Creatives (HTML snippets)
with cs as (select id,name from public.ad_campaigns where name in ('upgrade_profile_badge','upgrade_downloads'))
insert into public.ad_creatives(campaign_id,title,description,media_url,media_type,link_url,width,height)
select c.id,
       case c.name when 'upgrade_profile_badge' then 'Pro Badge Teaser' else 'Downloads Upgrade CTA' end,
       'House upgrade promotion',
       case c.name
         when 'upgrade_profile_badge' then
           '<div style="border-radius:12px;padding:12px;background:#fff;border:1px solid #e5e7eb"><div style="display:flex;align-items:center;gap:8px;"><div style="width:20px;height:20px;border-radius:50%;background:#9ca3af;"></div><span style="opacity:.6">Verified Pro Member</span></div><p style="margin:8px 0 10px 0;color:#374151;font-size:13px">Stand out with a Pro badge on your profile</p><a href="/subscription" style="display:inline-block;padding:8px 12px;border-radius:8px;background:#0ea5e9;color:#fff;text-decoration:none">Go Pro</a></div>'
         else
           '<div style="border-radius:10px;padding:10px;background:#111827;color:#fff;display:flex;align-items:center;justify-content:space-between"><span>Faster downloads • No ads • Priority access</span><a href="/subscription" style="padding:8px 10px;border-radius:8px;background:#f59e0b;color:#111827;text-decoration:none;">Upgrade</a></div>'
       end,
       'html','/subscription',null,null
from cs c
on conflict do nothing;

-- 3) Tablet / Mobile layouts + slots + assignments
do $$
declare
  v_home uuid; v_dashboard uuid; v_pdf uuid; v_profile uuid; v_down uuid;
  v_l_home_tab uuid; v_l_home_mob uuid;
  v_l_dash_tab uuid; v_l_dash_mob uuid;
  v_l_pdf_tab uuid;  v_l_pdf_mob uuid;
  v_l_prof_tab uuid; v_l_prof_mob uuid;
  v_l_down_tab uuid; v_l_down_mob uuid;

  v_slot_home_tab uuid; v_slot_home_mob uuid;
  v_slot_dash_tab uuid; v_slot_dash_mob uuid;
  v_slot_pdf_tab uuid;  v_slot_pdf_mob uuid;
  v_slot_prof_tab uuid; v_slot_prof_mob uuid;
  v_slot_down_tab uuid; v_slot_down_mob uuid;

  v_c_sidebar uuid; v_c_pdf_top uuid; v_c_inline uuid; v_c_prof uuid; v_c_down uuid;
begin
  select id into v_home     from public.ad_pages where key='home';
  select id into v_dashboard from public.ad_pages where key='dashboard';
  select id into v_pdf      from public.ad_pages where key='pdf_viewer';
  select id into v_profile  from public.ad_pages where key='profile';
  select id into v_down     from public.ad_pages where key='downloads';

  -- tablet layouts (cols 8)
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_home,'tablet','default','{"cols":8,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_home_tab;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_dashboard,'tablet','default','{"cols":8,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_dash_tab;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_pdf,'tablet','default','{"cols":8,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_pdf_tab;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_profile,'tablet','default','{"cols":8,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_prof_tab;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_down,'tablet','default','{"cols":8,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_down_tab;

  -- mobile layouts (cols 4)
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_home,'mobile','default','{"cols":4,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_home_mob;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_dashboard,'mobile','default','{"cols":4,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_dash_mob;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_pdf,'mobile','default','{"cols":4,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_pdf_mob;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_profile,'mobile','default','{"cols":4,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_prof_mob;
  insert into public.ad_layouts(page_id,device,name,grid_config,is_active) values
    (v_down,'mobile','default','{"cols":4,"rowHeight":40,"gap":8}'::jsonb,true)
    on conflict (page_id,device,name) do update set updated_at=now()
    returning id into v_l_down_mob;

  -- slots (tablet)
  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_dash_tab,'sidebar_promos','sidebar','tablet',6,2,2,4,0,'{"rotationMs":7000}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_dash_tab from public.ad_slots where layout_id=v_l_dash_tab and slot_key='sidebar_promos' and device='tablet';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_pdf_tab,'pdf_top','header','tablet',0,0,8,2,0,'{"rotationMs":7000}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_pdf_tab from public.ad_slots where layout_id=v_l_pdf_tab and slot_key='pdf_top' and device='tablet';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_home_tab,'home_inline_promo','inline','tablet',0,6,8,2,0,'{"rotationMs":7000}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_home_tab from public.ad_slots where layout_id=v_l_home_tab and slot_key='home_inline_promo' and device='tablet';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_prof_tab,'profile_upgrade','sidebar','tablet',6,2,2,3,0,'{}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_prof_tab from public.ad_slots where layout_id=v_l_prof_tab and slot_key='profile_upgrade' and device='tablet';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_down_tab,'downloads_inline','inline','tablet',0,8,8,2,0,'{}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_down_tab from public.ad_slots where layout_id=v_l_down_tab and slot_key='downloads_inline' and device='tablet';

  -- slots (mobile)
  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_dash_mob,'sidebar_promos','sidebar','mobile',0,2,4,3,0,'{"rotationMs":7000}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_dash_mob from public.ad_slots where layout_id=v_l_dash_mob and slot_key='sidebar_promos' and device='mobile';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_pdf_mob,'pdf_top','header','mobile',0,0,4,2,0,'{"rotationMs":7000}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_pdf_mob from public.ad_slots where layout_id=v_l_pdf_mob and slot_key='pdf_top' and device='mobile';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_home_mob,'home_inline_promo','inline','mobile',0,6,4,2,0,'{"rotationMs":7000}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_home_mob from public.ad_slots where layout_id=v_l_home_mob and slot_key='home_inline_promo' and device='mobile';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_prof_mob,'profile_upgrade','sidebar','mobile',0,2,4,3,0,'{}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_prof_mob from public.ad_slots where layout_id=v_l_prof_mob and slot_key='profile_upgrade' and device='mobile';

  insert into public.ad_slots(layout_id,slot_key,placement,device,x,y,w,h,order_index,config,is_active)
    values (v_l_down_mob,'downloads_inline','inline','mobile',0,8,4,2,0,'{}'::jsonb,true)
    on conflict (layout_id,slot_key,device) do update set updated_at=now();
  select id into v_slot_down_mob from public.ad_slots where layout_id=v_l_down_mob and slot_key='downloads_inline' and device='mobile';

  -- campaign ids
  select id into v_c_sidebar from public.ad_campaigns where name='upgrade_sidebar';
  select id into v_c_pdf_top from public.ad_campaigns where name='upgrade_pdf_top';
  select id into v_c_inline from public.ad_campaigns where name='upgrade_ads_replacement';
  select id into v_c_prof  from public.ad_campaigns where name='upgrade_profile_badge';
  select id into v_c_down  from public.ad_campaigns where name='upgrade_downloads';

  -- assignments (tablet + mobile)
  if v_slot_dash_tab is not null and v_c_sidebar is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_dash_tab,v_c_sidebar,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;
  if v_slot_dash_mob is not null and v_c_sidebar is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_dash_mob,v_c_sidebar,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;

  if v_slot_pdf_tab is not null and v_c_pdf_top is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_pdf_tab,v_c_pdf_top,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;
  if v_slot_pdf_mob is not null and v_c_pdf_top is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_pdf_mob,v_c_pdf_top,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;

  if v_slot_home_tab is not null and v_c_inline is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_home_tab,v_c_inline,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;
  if v_slot_home_mob is not null and v_c_inline is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_home_mob,v_c_inline,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;

  if v_slot_prof_tab is not null and v_c_prof is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_prof_tab,v_c_prof,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;
  if v_slot_prof_mob is not null and v_c_prof is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_prof_mob,v_c_prof,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;

  if v_slot_down_tab is not null and v_c_down is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_down_tab,v_c_down,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;
  if v_slot_down_mob is not null and v_c_down is not null then
    insert into public.ad_slot_assignments(slot_id,campaign_id,rotation_index,is_active)
    values (v_slot_down_mob,v_c_down,0,true)
    on conflict (slot_id,campaign_id) do update set is_active=true,updated_at=now();
  end if;
end$$;