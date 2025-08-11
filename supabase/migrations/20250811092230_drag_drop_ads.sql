-- ===========================================
-- DRAG-AND-DROP AD PLACEMENTS
-- Visual slots, layout config, and slot–campaign assignment
-- ===========================================

create extension if not exists pgcrypto;

-- Robust admin helper
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
-- Core entities for visual placements
-- ===========================================

-- Pages/contexts where layouts apply (optional route regex)
create table if not exists public.ad_pages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  route_pattern text,
  created_at timestamptz not null default now()
);

-- Grid layouts & meta per device
create table if not exists public.ad_layouts (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.ad_pages(id) on delete cascade,
  device text not null check (device in ('desktop','tablet','mobile')),
  name text not null default 'default',
  grid_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_id, device, name)
);

-- Visual slots the DnD builder manages
create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  layout_id uuid not null references public.ad_layouts(id) on delete cascade,
  slot_key text not null,
  placement text not null,            -- header|footer|sidebar|inline|popup|pdf_sidebar|floater
  device text not null check (device in ('desktop','tablet','mobile')),
  x int not null default 0,
  y int not null default 0,
  w int not null default 12,
  h int not null default 2,
  order_index int not null default 0,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(layout_id, slot_key, device)
);

-- A slot may host one or many campaigns (carousel/rotation)
create table if not exists public.ad_slot_assignments (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.ad_slots(id) on delete cascade,
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  rotation_index int not null default 0,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slot_id, campaign_id)
);

-- Helpful indices
create index if not exists idx_ad_slots_layout_device on public.ad_slots(layout_id, device, is_active);
create index if not exists idx_ad_slot_assignments_active on public.ad_slot_assignments(slot_id, is_active);

-- ===========================================
-- RLS
-- ===========================================
alter table public.ad_pages enable row level security;
alter table public.ad_layouts enable row level security;
alter table public.ad_slots enable row level security;
alter table public.ad_slot_assignments enable row level security;

-- Read for everyone
drop policy if exists pages_read on public.ad_pages;
create policy pages_read on public.ad_pages for select using (true);

drop policy if exists layouts_read on public.ad_layouts;
create policy layouts_read on public.ad_layouts for select using (true);

drop policy if exists slots_read on public.ad_slots;
create policy slots_read on public.ad_slots for select using (true);

drop policy if exists slot_assignments_read on public.ad_slot_assignments;
create policy slot_assignments_read on public.ad_slot_assignments for select using (true);

-- Admin write-all
drop policy if exists pages_admin on public.ad_pages;
create policy pages_admin on public.ad_pages
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists layouts_admin on public.ad_layouts;
create policy layouts_admin on public.ad_layouts
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists slots_admin on public.ad_slots;
create policy slots_admin on public.ad_slots
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists slot_assignments_admin on public.ad_slot_assignments;
create policy slot_assignments_admin on public.ad_slot_assignments
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ===========================================
-- RPCs for the DnD Builder (admin-only)
-- ===========================================

-- Upsert a full layout (grid + slots)
-- payload: { page_key, route_pattern, device, name, grid_config, slots: [...] }
create or replace function public.upsert_ad_layout(p_payload jsonb)
returns uuid
language plpgsql
security definer
as $$
declare
  v_page_id uuid;
  v_layout_id uuid;
  v_device text;
  v_name text;
  v_grid jsonb;
  v_slots jsonb;
  v_record jsonb;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;

  v_device := coalesce((p_payload->>'device'), 'desktop');
  v_name   := coalesce((p_payload->>'name'), 'default');
  v_grid   := coalesce((p_payload->'grid_config'), '{}'::jsonb);
  v_slots  := coalesce((p_payload->'slots'), '[]'::jsonb);

  -- upsert page
  insert into public.ad_pages(key, route_pattern)
  values (p_payload->>'page_key', p_payload->>'route_pattern')
  on conflict (key) do update set route_pattern = excluded.route_pattern
  returning id into v_page_id;

  -- upsert layout
  insert into public.ad_layouts(page_id, device, name, grid_config, is_active, updated_at)
  values (v_page_id, v_device, v_name, v_grid, true, now())
  on conflict (page_id, device, name) do update set grid_config = excluded.grid_config, updated_at = now()
  returning id into v_layout_id;

  -- replace slots
  delete from public.ad_slots where layout_id = v_layout_id and device = v_device;

  for v_record in select * from jsonb_array_elements(v_slots)
  loop
    insert into public.ad_slots(
      layout_id, slot_key, placement, device, x, y, w, h, order_index, config, is_active, updated_at
    ) values (
      v_layout_id,
      coalesce((v_record->>'slot_key'),'slot_'||floor(random()*100000)::text),
      coalesce((v_record->>'placement'),'inline'),
      v_device,
      coalesce((v_record->>'x')::int,0),
      coalesce((v_record->>'y')::int,0),
      coalesce((v_record->>'w')::int,12),
      coalesce((v_record->>'h')::int,2),
      coalesce((v_record->>'order_index')::int,0),
      coalesce((v_record->'config'),'{}'::jsonb),
      coalesce((v_record->>'is_active')::boolean, true),
      now()
    );
  end loop;

  return v_layout_id;
end;
$$;

-- Get an active layout with slots for a page+device
create or replace function public.get_ad_layout(p_page_key text, p_device text)
returns jsonb
language sql
stable
as $$
  with page as (
    select id from public.ad_pages where key = p_page_key
  ),
  layout as (
    select l.* from public.ad_layouts l
    join page p on p.id = l.page_id
    where l.device = p_device and l.is_active = true
    order by created_at desc
    limit 1
  )
  select jsonb_build_object(
    'layout_id', l.id,
    'grid_config', l.grid_config,
    'slots', coalesce(
      (select jsonb_agg(jsonb_build_object(
        'slot_id', s.id,
        'slot_key', s.slot_key,
        'placement', s.placement,
        'device', s.device,
        'x', s.x, 'y', s.y, 'w', s.w, 'h', s.h,
        'order_index', s.order_index,
        'config', s.config,
        'is_active', s.is_active
      ) order by s.order_index)
       from public.ad_slots s where s.layout_id = l.id and s.device = p_device and s.is_active = true),
      '[]'::jsonb
    )
  )
  from layout l;
$$;

grant execute on function public.upsert_ad_layout(jsonb) to authenticated;
grant execute on function public.get_ad_layout(text, text) to anon, authenticated;

-- Assign a campaign to a slot (create/update)
create or replace function public.assign_campaign_to_slot(p_slot_id uuid, p_campaign_id uuid, p_rotation_index int default 0)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;
  insert into public.ad_slot_assignments(slot_id, campaign_id, rotation_index, is_active, updated_at)
  values (p_slot_id, p_campaign_id, coalesce(p_rotation_index,0), true, now())
  on conflict (slot_id, campaign_id) do update set rotation_index = excluded.rotation_index, is_active = true, updated_at = now();
end;
$$;

grant execute on function public.assign_campaign_to_slot(uuid, uuid, int) to authenticated;

-- Optional: clear assignments for a slot
create or replace function public.clear_slot_assignments(p_slot_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;
  delete from public.ad_slot_assignments where slot_id = p_slot_id;
end;
$$;

grant execute on function public.clear_slot_assignments(uuid) to authenticated;

-- ===========================================
-- DRAG-AND-DROP AD PLACEMENTS
-- Visual slots, layout config, and slot–campaign assignment
-- ===========================================

create extension if not exists pgcrypto;

-- Robust admin helper
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
-- Core entities for visual placements
-- ===========================================

-- Pages/contexts where layouts apply (optional route regex)
create table if not exists public.ad_pages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,          -- e.g. "home", "past_papers", "pdf_viewer", "global_header"
  route_pattern text,                -- optional route regexp
  created_at timestamptz not null default now()
);

-- Grid layouts & meta per device
create table if not exists public.ad_layouts (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.ad_pages(id) on delete cascade,
  device text not null check (device in ('desktop','tablet','mobile')),
  name text not null default 'default',
  grid_config jsonb not null default '{}'::jsonb,   -- free-form config (cols, rowHeight, margins, breakpoints)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_id, device, name)
);

-- Visual slots the DnD builder manages
create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  layout_id uuid not null references public.ad_layouts(id) on delete cascade,
  slot_key text not null,             -- stable key per layout (e.g. "header_top","sidebar_1","inline_2")
  placement text not null,            -- logical placement: header|footer|sidebar|inline|popup|pdf_sidebar|floater
  device text not null check (device in ('desktop','tablet','mobile')),
  x int not null default 0,
  y int not null default 0,
  w int not null default 12,
  h int not null default 2,
  order_index int not null default 0, -- stacking/rotation order
  config jsonb not null default '{}'::jsonb, -- frequency caps, carousel, triggers, etc.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(layout_id, slot_key, device)
);

-- A slot may host one or many campaigns (carousel/rotation)
create table if not exists public.ad_slot_assignments (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.ad_slots(id) on delete cascade,
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  rotation_index int not null default 0,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slot_id, campaign_id)
);

-- Helpful indices
create index if not exists idx_ad_slots_layout_device on public.ad_slots(layout_id, device, is_active);
create index if not exists idx_ad_slot_assignments_active on public.ad_slot_assignments(slot_id, is_active);

-- ===========================================
-- RLS
-- ===========================================
alter table public.ad_pages enable row level security;
alter table public.ad_layouts enable row level security;
alter table public.ad_slots enable row level security;
alter table public.ad_slot_assignments enable row level security;

-- Read for everyone
drop policy if exists pages_read on public.ad_pages;
create policy pages_read on public.ad_pages for select using (true);

drop policy if exists layouts_read on public.ad_layouts;
create policy layouts_read on public.ad_layouts for select using (true);

drop policy if exists slots_read on public.ad_slots;
create policy slots_read on public.ad_slots for select using (true);

drop policy if exists slot_assignments_read on public.ad_slot_assignments;
create policy slot_assignments_read on public.ad_slot_assignments for select using (true);

-- Admin write-all
drop policy if exists pages_admin on public.ad_pages;
create policy pages_admin on public.ad_pages
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists layouts_admin on public.ad_layouts;
create policy layouts_admin on public.ad_layouts
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists slots_admin on public.ad_slots;
create policy slots_admin on public.ad_slots
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists slot_assignments_admin on public.ad_slot_assignments;
create policy slot_assignments_admin on public.ad_slot_assignments
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ===========================================
-- RPCs for the DnD Builder (admin-only)
-- ===========================================

-- Upsert a full layout (grid + slots) in one go to reduce race conditions
-- payload: { page_key, device, name, grid_config, slots: [{slot_key, placement, x,y,w,h,order_index, config, is_active}] }
create or replace function public.upsert_ad_layout(p_payload jsonb)
returns uuid
language plpgsql
security definer
as $$
declare
  v_page_id uuid;
  v_layout_id uuid;
  v_device text;
  v_name text;
  v_grid jsonb;
  v_slots jsonb;
  v_record jsonb;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;

  v_device := coalesce((p_payload->>'device'), 'desktop');
  v_name   := coalesce((p_payload->>'name'), 'default');
  v_grid   := coalesce((p_payload->'grid_config'), '{}'::jsonb);
  v_slots  := coalesce((p_payload->'slots'), '[]'::jsonb);

  -- upsert page
  insert into public.ad_pages(key, route_pattern)
  values (p_payload->>'page_key', p_payload->>'route_pattern')
  on conflict (key) do update set route_pattern = excluded.route_pattern
  returning id into v_page_id;

  -- upsert layout
  insert into public.ad_layouts(page_id, device, name, grid_config, is_active, updated_at)
  values (v_page_id, v_device, v_name, v_grid, true, now())
  on conflict (page_id, device, name) do update set grid_config = excluded.grid_config, updated_at = now()
  returning id into v_layout_id;

  -- replace slots (simple approach)
  delete from public.ad_slots where layout_id = v_layout_id and device = v_device;

  for v_record in select * from jsonb_array_elements(v_slots)
  loop
    insert into public.ad_slots(
      layout_id, slot_key, placement, device, x, y, w, h, order_index, config, is_active, updated_at
    ) values (
      v_layout_id,
      coalesce((v_record->>'slot_key'),'slot_'||floor(random()*100000)::text),
      coalesce((v_record->>'placement'),'inline'),
      v_device,
      coalesce((v_record->>'x')::int,0),
      coalesce((v_record->>'y')::int,0),
      coalesce((v_record->>'w')::int,12),
      coalesce((v_record->>'h')::int,2),
      coalesce((v_record->>'order_index')::int,0),
      coalesce((v_record->'config'),'{}'::jsonb),
      coalesce((v_record->>'is_active')::boolean, true),
      now()
    );
  end loop;

  return v_layout_id;
end;
$$;

-- Get an active layout with slots for a page+device
create or replace function public.get_ad_layout(p_page_key text, p_device text)
returns jsonb
language sql
stable
as $$
  with page as (
    select id from public.ad_pages where key = p_page_key
  ),
  layout as (
    select l.* from public.ad_layouts l
    join page p on p.id = l.page_id
    where l.device = p_device and l.is_active = true
    order by created_at desc
    limit 1
  )
  select jsonb_build_object(
    'layout_id', l.id,
    'grid_config', l.grid_config,
    'slots', coalesce(
      (select jsonb_agg(jsonb_build_object(
        'slot_id', s.id,
        'slot_key', s.slot_key,
        'placement', s.placement,
        'device', s.device,
        'x', s.x, 'y', s.y, 'w', s.w, 'h', s.h,
        'order_index', s.order_index,
        'config', s.config,
        'is_active', s.is_active
      ) order by s.order_index)
       from public.ad_slots s where s.layout_id = l.id and s.device = p_device and s.is_active = true),
      '[]'::jsonb
    )
  )
  from layout l;
$$;

grant execute on function public.upsert_ad_layout(jsonb) to authenticated;
grant execute on function public.get_ad_layout(text, text) to anon, authenticated;

-- Assign a campaign to a slot
create or replace function public.assign_campaign_to_slot(p_slot_id uuid, p_campaign_id uuid, p_rotation_index int default 0)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;
  insert into public.ad_slot_assignments(slot_id, campaign_id, rotation_index, is_active, updated_at)
  values (p_slot_id, p_campaign_id, coalesce(p_rotation_index,0), true, now())
  on conflict (slot_id, campaign_id) do update set rotation_index = excluded.rotation_index, is_active = true, updated_at = now();
end;
$$;

grant execute on function public.assign_campaign_to_slot(uuid, uuid, int) to authenticated;

-- Optional: clear assignments for a slot
create or replace function public.clear_slot_assignments(p_slot_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;
  delete from public.ad_slot_assignments where slot_id = p_slot_id;
end;
$$;

grant execute on function public.clear_slot_assignments(uuid) to authenticated;