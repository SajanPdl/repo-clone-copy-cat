import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save, RefreshCw, Image as ImageIcon } from 'lucide-react';

type Campaign = {
  id: string;
  advertiser_id: string | null;
  name: string;
  placement: string;
  start_at: string | null;
  end_at: string | null;
  priority: number;
  daily_cap: number | null;
  hourly_cap: number | null;
  targeting: any;
  is_active: boolean;
  source: string;
  external_placement_id: string | null;
  budget_usd: number | null;
  pacing: string | null;
  frequency_caps: any;
  objectives: any;
  revenue_model: string;
  behavior_tags: string[] | null;
  created_at: string;
  updated_at: string;
};

type Creative = {
  id: string;
  campaign_id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: 'image' | 'video' | 'html';
  link_url: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

const emptyCampaign: Partial<Campaign> = {
  name: '',
  placement: 'header',
  start_at: new Date().toISOString(),
  end_at: null,
  priority: 1,
  daily_cap: null,
  hourly_cap: null,
  targeting: {},
  is_active: true,
  source: 'internal',
  external_placement_id: '',
  budget_usd: null,
  pacing: 'standard',
  frequency_caps: { per_session: 1, per_day: 3 },
  objectives: { view: 'cpm' },
  revenue_model: 'cpm',
  behavior_tags: [],
};

const AdCampaignManager: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Partial<Campaign>>(emptyCampaign);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [newCreative, setNewCreative] = useState<Partial<Creative>>({ title: '', description: '', media_url: '', media_type: 'image', link_url: '' });
  const [loading, setLoading] = useState(false);

  const placements = ['header','footer','sidebar','inline_1','inline_2','inline_3','popup','pdf_sidebar','floater'];
  const sources = ['internal','adsterra','adsense','house'];

  useEffect(() => { refresh(); }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('ad_campaigns').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadCreatives = async (campaignId: string) => {
    const { data, error } = await supabase.from('ad_creatives').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });
    if (!error) setCreatives((data || []) as Creative[]);
  };

  const selectCampaign = async (c: Campaign) => {
    setSelected(c);
    setForm({ ...c });
    await loadCreatives(c.id);
  };

  const resetForm = () => { setSelected(null); setForm(emptyCampaign); setCreatives([]); };

  const saveCampaign = async () => {
    try {
      const payload = {
        name: form.name,
        placement: form.placement,
        start_at: form.start_at,
        end_at: form.end_at,
        priority: Number(form.priority || 1),
        daily_cap: form.daily_cap,
        hourly_cap: form.hourly_cap,
        targeting: form.targeting || {},
        is_active: !!form.is_active,
        source: form.source,
        external_placement_id: form.external_placement_id || null,
        budget_usd: form.budget_usd,
        pacing: form.pacing,
        frequency_caps: form.frequency_caps || {},
        objectives: form.objectives || {},
        revenue_model: form.revenue_model || 'cpm',
        behavior_tags: form.behavior_tags || [],
        updated_at: new Date().toISOString(),
      } as any;

      if (selected?.id) {
        const { error } = await supabase.from('ad_campaigns').update(payload).eq('id', selected.id);
        if (error) throw error;
        toast({ title: 'Saved', description: 'Campaign updated' });
      } else {
        const { data, error } = await supabase.from('ad_campaigns').insert([{ ...payload, created_at: new Date().toISOString() }]).select('*').single();
        if (error) throw error;
        setSelected(data as Campaign);
        toast({ title: 'Created', description: 'Campaign created' });
      }
      refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign and all creatives?')) return;
    const { error } = await supabase.from('ad_campaigns').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); resetForm(); refresh(); }
  };

  const uploadCreativeImage = async (file: File) => {
    const ext = file.name.split('.').pop();
    const name = `creative-${Date.now()}.${ext}`;
    // Ensure bucket exists and is public: handled by SQL policies earlier
    const { data, error } = await supabase.storage.from('ad-images').upload(name, file, { upsert: false, cacheControl: '3600', contentType: file.type });
    if (error && error.message && !error.message.includes('already exists')) throw error;
    const { data: url } = supabase.storage.from('ad-images').getPublicUrl(name);
    if (!url?.publicUrl) throw new Error('Failed to resolve public URL');
    return url.publicUrl as string;
  };

  const addCreative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?.id) { toast({ title: 'Select a campaign first', variant: 'destructive' }); return; }
    try {
      const payload = {
        campaign_id: selected.id,
        title: newCreative.title || null,
        description: newCreative.description || null,
        media_url: newCreative.media_url!,
        media_type: newCreative.media_type || 'image',
        link_url: newCreative.link_url || null,
        width: null,
        height: null,
      };
      const { error } = await supabase.from('ad_creatives').insert([payload]);
      if (error) throw error;
      setNewCreative({ title: '', description: '', media_url: '', media_type: 'image', link_url: '' });
      loadCreatives(selected.id);
      toast({ title: 'Creative added' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const deleteCreative = async (id: string) => {
    const { error } = await supabase.from('ad_creatives').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); selected && loadCreatives(selected.id); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ad Campaign Manager</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}><RefreshCw className="w-4 h-4 mr-2"/>Refresh</Button>
          <Button onClick={() => { resetForm(); }}><Plus className="w-4 h-4 mr-2"/>New Campaign</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[540px] overflow-auto">
              {campaigns.map(c => (
                <div key={c.id} className={`p-3 border rounded cursor-pointer ${selected?.id===c.id?'bg-blue-50 border-blue-300':''}`} onClick={()=>selectCampaign(c)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-600">{c.placement} • {c.source}</div>
                    </div>
                    <Badge variant={c.is_active?'default':'secondary'}>{c.is_active?'Active':'Paused'}</Badge>
                  </div>
                </div>
              ))}
              {campaigns.length===0 && <div className="text-sm text-gray-500">No campaigns yet</div>}
            </div>
          </CardContent>
        </Card>

        {/* Middle: editor */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{selected? 'Edit Campaign':'Create Campaign'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name||''} onChange={e=>setForm({...form, name:e.target.value})}/>
              </div>
              <div>
                <Label>Placement</Label>
                <Select value={form.placement as string} onValueChange={v=>setForm({...form, placement:v})}>
                  <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                  <SelectContent>
                    {placements.map(p=>(<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source</Label>
                <Select value={form.source as string} onValueChange={v=>setForm({...form, source:v})}>
                  <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                  <SelectContent>
                    {sources.map(s=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>External Placement ID (if external)</Label>
                <Input value={form.external_placement_id||''} onChange={e=>setForm({...form, external_placement_id:e.target.value})}/>
              </div>
              <div>
                <Label>Start</Label>
                <Input type="datetime-local" value={form.start_at? new Date(form.start_at).toISOString().slice(0,16):''} onChange={e=>setForm({...form, start_at:new Date(e.target.value).toISOString()})}/>
              </div>
              <div>
                <Label>End</Label>
                <Input type="datetime-local" value={form.end_at? new Date(form.end_at).toISOString().slice(0,16):''} onChange={e=>setForm({...form, end_at:e.target.value? new Date(e.target.value).toISOString(): null})}/>
              </div>
              <div>
                <Label>Priority</Label>
                <Input type="number" value={form.priority??1} onChange={e=>setForm({...form, priority:Number(e.target.value)})}/>
              </div>
              <div>
                <Label>Budget (USD)</Label>
                <Input type="number" step="0.01" value={form.budget_usd??''} onChange={e=>setForm({...form, budget_usd:e.target.value? Number(e.target.value): null})}/>
              </div>
              <div>
                <Label>Frequency Caps (per session)</Label>
                <Input type="number" value={(form.frequency_caps as any)?.per_session ?? 1} onChange={e=>setForm({...form, frequency_caps:{ ...(form.frequency_caps||{}), per_session:Number(e.target.value)}})}/>
              </div>
              <div>
                <Label>Frequency Caps (per day)</Label>
                <Input type="number" value={(form.frequency_caps as any)?.per_day ?? 3} onChange={e=>setForm({...form, frequency_caps:{ ...(form.frequency_caps||{}), per_day:Number(e.target.value)}})}/>
              </div>
              <div className="md:col-span-2">
                <Label>Targeting JSON</Label>
                <Textarea rows={4} value={JSON.stringify(form.targeting||{}, null, 2)} onChange={e=>{
                  try { setForm({...form, targeting: JSON.parse(e.target.value)});} catch { /* ignore */ }
                }}/>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!form.is_active} onCheckedChange={(v)=>setForm({...form, is_active:v})}/>
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveCampaign}><Save className="w-4 h-4 mr-2"/>Save</Button>
              {selected?.id && <Button variant="destructive" onClick={()=>deleteCampaign(selected.id)}><Trash2 className="w-4 h-4 mr-2"/>Delete</Button>}
            </div>

            {/* Creatives */}
            {selected?.id && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Creatives</h3>
                <form onSubmit={addCreative} className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded p-3 mb-3">
                  <div>
                    <Label>Title</Label>
                    <Input value={newCreative.title as string || ''} onChange={e=>setNewCreative({...newCreative, title:e.target.value})}/>
                  </div>
                  <div>
                    <Label>Media Type</Label>
                    <Select value={newCreative.media_type||'image'} onValueChange={v=>setNewCreative({...newCreative, media_type: v as any})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={2} value={newCreative.description as string || ''} onChange={e=>setNewCreative({...newCreative, description:e.target.value})}/>
                  </div>
                  <div>
                    <Label>Media URL</Label>
                    <Input value={newCreative.media_url as string || ''} onChange={e=>setNewCreative({...newCreative, media_url:e.target.value})} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Link URL</Label>
                    <Input value={newCreative.link_url as string || ''} onChange={e=>setNewCreative({...newCreative, link_url:e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Upload Image</Label>
                    <Input type="file" accept="image/*" onChange={async (e)=>{
                      const f = e.target.files?.[0]; if (!f) return;
                      try { const url = await uploadCreativeImage(f); setNewCreative({...newCreative, media_url:url, media_type:'image'}); toast({ title:'Uploaded' }); } catch (err:any){ toast({ title:'Upload failed', description:err.message, variant:'destructive'}); }
                    }}/>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit"><Plus className="w-4 h-4 mr-2"/>Add Creative</Button>
                  </div>
                </form>
                <div className="grid md:grid-cols-2 gap-3">
                  {creatives.map(cr => (
                    <div key={cr.id} className="border rounded p-3">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{cr.title || 'Creative'}</div>
                        <Button size="sm" variant="destructive" onClick={()=>deleteCreative(cr.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                      {cr.media_type==='image' && cr.media_url && (
                        <img src={cr.media_url} alt={cr.title||''} className="rounded mt-2 max-h-40 object-cover w-full" />
                      )}
                      {cr.media_type==='html' && (
                        <div className="mt-2 text-xs text-gray-600">HTML creative</div>
                      )}
                    </div>
                  ))}
                  {creatives.length===0 && <div className="text-sm text-gray-500">No creatives yet</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdCampaignManager;


