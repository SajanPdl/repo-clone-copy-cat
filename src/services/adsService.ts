import { supabase } from '@/integrations/supabase/client';

export interface ActiveAdCreative {
  creative_id: string;
  campaign_id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: 'image' | 'video' | 'html';
  link_url: string | null;
  priority: number;
}

export async function fetchActiveAds(params: {
  placement: string;
  userRole?: string | null;
  category?: string | null;
  country?: string | null;
  device?: 'desktop' | 'mobile' | null;
  limit?: number;
}): Promise<ActiveAdCreative[]> {
  const { placement, userRole, category, country, device, limit = 5 } = params;
  const { data, error } = await supabase.rpc('get_active_ads', {
    p_placement: placement,
    p_user_role: userRole ?? null,
    p_category: category ?? null,
    p_country: country ?? null,
    p_device: device ?? null,
    p_limit: limit,
  });
  if (error) throw error;
  return (data || []) as ActiveAdCreative[];
}

export async function logImpression(args: {
  creativeId: string;
  campaignId: string;
  userId?: string | null;
  country?: string | null;
  device?: string | null;
}) {
  const { creativeId, campaignId, userId = null, country = null, device = null } = args;
  await supabase.rpc('log_ad_impression', {
    p_creative: creativeId,
    p_campaign: campaignId,
    p_user: userId,
    p_country: country,
    p_device: device,
  });
}

export async function logClick(args: {
  creativeId: string;
  campaignId: string;
  userId?: string | null;
  country?: string | null;
  device?: string | null;
}) {
  const { creativeId, campaignId, userId = null, country = null, device = null } = args;
  await supabase.rpc('log_ad_click', {
    p_creative: creativeId,
    p_campaign: campaignId,
    p_user: userId,
    p_country: country,
    p_device: device,
  });
}


