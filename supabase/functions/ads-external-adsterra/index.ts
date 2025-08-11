// Supabase Edge Function: fetch external ads from Adsterra and normalize
// Environment variable required: ADSTERRA_API_KEY
// Docs referenced: https://docs.adsterratools.com/public/v3/publishers-api

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const placement = url.searchParams.get('placement') ?? 'sidebar';
    const limit = Number(url.searchParams.get('limit') ?? '3');

    const apiKey = Deno.env.get('ADSTERRA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing ADSTERRA_API_KEY' }), { status: 500 });
    }

    // Example call (placeholder endpoint; adapt to actual Adsterra placement endpoint from docs)
    const res = await fetch(`https://api.adsterratools.com/public/v3/publishers-api?placement=${encodeURIComponent(placement)}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: 'Upstream error', details: text }), { status: 502 });
    }
    const upstream = await res.json();

    // Normalize to ActiveAdCreative[]
    const items = Array.isArray(upstream?.data) ? upstream.data : []; // adapt to real shape
    const normalized = items.slice(0, limit).map((it: any) => ({
      creative_id: String(it.id ?? crypto.randomUUID()),
      campaign_id: `adsterra:${placement}`,
      title: it.title ?? null,
      description: it.description ?? null,
      media_url: it.image_url ?? it.html_snippet ?? '',
      media_type: it.image_url ? 'image' : 'html',
      link_url: it.click_url ?? null,
      priority: 0
    }));

    return new Response(JSON.stringify(normalized), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=60' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
});


