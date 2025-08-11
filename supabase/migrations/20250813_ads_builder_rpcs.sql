-- RPCs to manage slot assignments (reorder/remove) for the DnD builder

create or replace function public.update_slot_assignment_order(p_slot_id uuid, p_campaign_id uuid, p_rotation_index int)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;
  update public.ad_slot_assignments
     set rotation_index = p_rotation_index,
         updated_at = now()
   where slot_id = p_slot_id and campaign_id = p_campaign_id;
end;
$$;

grant execute on function public.update_slot_assignment_order(uuid, uuid, int) to authenticated;

create or replace function public.remove_slot_assignment(p_slot_id uuid, p_campaign_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'admin only';
  end if;
  delete from public.ad_slot_assignments where slot_id = p_slot_id and campaign_id = p_campaign_id;
end;
$$;

grant execute on function public.remove_slot_assignment(uuid, uuid) to authenticated;


