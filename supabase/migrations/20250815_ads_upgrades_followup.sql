-- Follow-up migration consolidating RPCs and ensuring seeds, avoiding duplicate version conflicts
create extension if not exists pgcrypto;

-- Ensure admin helper exists
create or replace function public.is_admin(user_id uuid)
returns boolean language plpgsql security definer stable as $$
begin return exists (select 1 from public.users where id=user_id and role='admin'); exception when others then return false; end; $$;
grant execute on function public.is_admin(uuid) to authenticated;

-- Recreate RPCs (idempotent)
create or replace function public.update_slot_assignment_order(p_slot_id uuid, p_campaign_id uuid, p_rotation_index int)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'admin only'; end if;
  update public.ad_slot_assignments set rotation_index=p_rotation_index, updated_at=now()
   where slot_id=p_slot_id and campaign_id=p_campaign_id;
end; $$;
grant execute on function public.update_slot_assignment_order(uuid,uuid,int) to authenticated;

create or replace function public.remove_slot_assignment(p_slot_id uuid, p_campaign_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'admin only'; end if;
  delete from public.ad_slot_assignments where slot_id=p_slot_id and campaign_id=p_campaign_id;
end; $$;
grant execute on function public.remove_slot_assignment(uuid,uuid) to authenticated;

-- Ensure ad-images bucket and policies persist
do $$ begin
  insert into storage.buckets (id,name,public) values ('ad-images','ad-images',true);
exception when unique_violation then null; end $$;

drop policy if exists "public read ad-images" on storage.objects;
create policy "public read ad-images" on storage.objects
for select using (bucket_id='ad-images');

drop policy if exists "admin write ad-images" on storage.objects;
create policy "admin write ad-images" on storage.objects
for all using (public.is_admin(auth.uid()) and bucket_id='ad-images')
with check (public.is_admin(auth.uid()) and bucket_id='ad-images');


