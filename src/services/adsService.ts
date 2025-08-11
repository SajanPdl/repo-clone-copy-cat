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

// Unified resolver: no slots, no manual assignments
// Pulls directly from active campaigns by placement and their creatives
export async function fetchActiveAds(params: {
  placement: string;
  device?: 'desktop' | 'mobile' | null;
  limit?: number;
}): Promise<ActiveAdCreative[]> {
  const { placement, limit = 5 } = params;

  // Prefer direct join via PostgREST to avoid RPC dependency
  const { data, error } = await supabase
    .from('ad_creatives')
    .select(`
      id, campaign_id, title, description, media_url, media_type, link_url,
      ad_campaigns!inner(id, placement, is_active, start_at, end_at, priority)
    `)
    .eq('ad_campaigns.is_active', true)
    .eq('ad_campaigns.placement', placement)
    .order('ad_campaigns.priority', { ascending: false })
    .limit(limit);

  if (error) {
    // Fallback to legacy RPC if available
    try {
      const { data: rpcData } = await supabase.rpc('get_active_ads', {
        p_placement: placement,
        p_user_role: null,
        p_category: null,
        p_country: null,
        p_device: null,
        p_limit: limit,
      });
      return ((rpcData || []) as any[]).map((r) => ({
        creative_id: r.creative_id ?? r.id,
        campaign_id: r.campaign_id,
        title: r.title ?? null,
        description: r.description ?? null,
        media_url: r.media_url,
        media_type: r.media_type,
        link_url: r.link_url ?? null,
        priority: r.priority ?? 0,
      }));
    } catch {
      return [];
    }
  }

  const now = new Date();
  const rows = (data || []) as any[];
  const filtered = rows.filter((row) => {
    const c = row.ad_campaigns;
    if (!c?.is_active) return false;
    if (c.start_at && new Date(c.start_at) > now) return false;
    if (c.end_at && new Date(c.end_at) < now) return false;
    return true;
  });

  return filtered.map((row) => ({
    creative_id: String(row.id),
    campaign_id: row.campaign_id,
    title: row.title ?? null,
    description: row.description ?? null,
    media_url: row.media_url,
    media_type: row.media_type,
    link_url: row.link_url ?? null,
    priority: row.ad_campaigns?.priority ?? 0,
  }));
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


