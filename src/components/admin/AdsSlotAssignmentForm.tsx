import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, ArrowUp, ArrowDown, X, Plus } from 'lucide-react';
import { fetchActiveAds, ActiveAdCreative } from '@/services/adsService';
import AdSlot from '@/components/ads/AdSlot';
import { supabase } from '@/integrations/supabase/client';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

type SlotVM = {
  slot_id: string;
  slot_key: string;
  placement: string;
  device: DeviceType;
  x: number; y: number; w: number; h: number;
  order_index: number;
  config: any;
  is_active: boolean;
};

type Campaign = {
  id: string;
  name: string;
  placement: string;
  is_active: boolean;
  priority: number;
};

type AssignmentVM = { campaign_id: string; name: string; rotation_index: number };

const AdsSlotAssignmentForm: React.FC = () => {
  const { toast } = useToast();
  const [pageKey, setPageKey] = useState<string>('home');
  const [pageKeys, setPageKeys] = useState<string[]>(['home']);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [slots, setSlots] = useState<SlotVM[]>([]);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [assignmentsBySlotKey, setAssignmentsBySlotKey] = useState<Record<string, AssignmentVM[]>>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignFilter, setCampaignFilter] = useState<{ q: string; placement: string | 'all' }>(() => ({ q: '', placement: 'all' }));
  const loadingRef = useRef(false);
  const [previewCreatives, setPreviewCreatives] = useState<ActiveAdCreative[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewTimerRef = useRef<number | null>(null);
  const placementsAll: Array<'header'|'inline'|'sidebar'|'footer'|'floater'> = ['header','inline','sidebar','footer','floater'];
  const [legacyPreview, setLegacyPreview] = useState<Record<string, any | null>>({});

  const selectedSlot: SlotVM | null = useMemo(
    () => slots.find(s => s.slot_key === selectedSlotKey) || null,
    [slots, selectedSlotKey]
  );

  const loadPageKeys = useCallback(async () => {
    const { data, error } = await supabase.from('ad_pages').select('key').order('key');
    if (!error && Array.isArray(data) && data.length > 0) {
      const keys = data.map((d: any) => d.key as string);
      setPageKeys(keys);
      if (!keys.includes(pageKey)) setPageKey(keys[0]);
    }
  }, [pageKey]);

  const loadLayout = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_ad_layout', { p_page_key: pageKey, p_device: device });
      if (error) throw error;
      const incoming: SlotVM[] = Array.isArray(data?.slots)
        ? (data!.slots as any[]).map((s: any) => ({
            slot_id: s.slot_id,
            slot_key: s.slot_key,
            placement: s.placement,
            device: s.device,
            x: s.x, y: s.y, w: s.w, h: s.h,
            order_index: s.order_index,
            config: s.config,
            is_active: s.is_active,
          }))
        : [];
      setSlots(incoming);
      if (incoming.length > 0 && !incoming.find(s => s.slot_key === selectedSlotKey)) {
        setSelectedSlotKey(incoming[0].slot_key);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [pageKey, device, selectedSlotKey, toast]);

  const loadAssignmentsForSlot = useCallback(async (slot: SlotVM) => {
    if (!slot?.slot_id) return;
    const { data, error } = await supabase
      .from('ad_slot_assignments')
      .select('campaign_id, rotation_index, ad_campaigns!inner(name)')
      .eq('slot_id', slot.slot_id)
      .eq('is_active', true)
      .order('rotation_index', { ascending: true });
    if (!error) {
      const items: AssignmentVM[] = (data || []).map((r: any) => ({
        campaign_id: r.campaign_id,
        name: r.ad_campaigns.name,
        rotation_index: r.rotation_index,
      }));
      setAssignmentsBySlotKey(prev => ({ ...prev, [slot.slot_key]: items }));
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .select('id, name, placement, is_active, priority')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    if (!error) setCampaigns((data || []) as Campaign[]);
  }, []);

  useEffect(() => { loadPageKeys(); }, [loadPageKeys]);
  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);
  useEffect(() => { loadLayout(); }, [loadLayout]);

  useEffect(() => {
    if (selectedSlot) loadAssignmentsForSlot(selectedSlot);
  }, [selectedSlot, loadAssignmentsForSlot]);

  const loadPreview = useCallback(async () => {
    if (!selectedSlot) { setPreviewCreatives([]); return; }
    try {
      const data = await fetchActiveAds({ placement: selectedSlot.placement, device, limit: 5 });
      setPreviewCreatives(data);
      setPreviewIndex(0);
    } catch (e) {
      setPreviewCreatives([]);
    }
  }, [selectedSlot, device]);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  useEffect(() => {
    if (previewCreatives.length <= 1) return;
    previewTimerRef.current = window.setInterval(() => {
      setPreviewIndex((i) => (i + 1) % previewCreatives.length);
    }, 5000);
    return () => { if (previewTimerRef.current) window.clearInterval(previewTimerRef.current); };
  }, [previewCreatives]);

  const loadLegacyPreview = useCallback(async () => {
    const results: Record<string, any | null> = {};
    for (const p of placementsAll) {
      const pos = p === 'inline' ? 'content' : p; // legacy names
      const { data } = await supabase
        .from('advertisements')
        .select('*')
        .eq('position', pos)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      results[p] = (data && data.length > 0) ? data[0] : null;
    }
    setLegacyPreview(results);
  }, []);

  useEffect(() => { loadLegacyPreview(); }, [loadLegacyPreview]);

  const filteredCampaigns = useMemo(() => {
    const q = campaignFilter.q.toLowerCase();
    return campaigns.filter(c => {
      const qok = q ? c.name.toLowerCase().includes(q) : true;
      const pok = campaignFilter.placement === 'all' ? true : c.placement === campaignFilter.placement;
      return qok && pok;
    });
  }, [campaigns, campaignFilter]);

  const assignCampaign = async () => {
    if (!selectedSlot || !selectedCampaignId) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const current = assignmentsBySlotKey[selectedSlot.slot_key] || [];
      const nextIndex = current.length;
      const { error } = await supabase.rpc('assign_campaign_to_slot', {
        p_slot_id: selectedSlot.slot_id,
        p_campaign_id: selectedCampaignId,
        p_rotation_index: nextIndex,
      });
      if (error) throw error;
      toast({ title: 'Assigned', description: 'Campaign assigned to slot' });
      await loadAssignmentsForSlot(selectedSlot);
      setSelectedCampaignId(null);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      loadingRef.current = false;
    }
  };

  const moveAssignment = async (slotKey: string, index: number, direction: -1 | 1) => {
    const list = assignmentsBySlotKey[slotKey] || [];
    const targetIndex = index + direction;
    if (!selectedSlot || targetIndex < 0 || targetIndex >= list.length) return;
    const a = list[index];
    const b = list[targetIndex];
    await supabase.rpc('update_slot_assignment_order', { p_slot_id: selectedSlot.slot_id, p_campaign_id: a.campaign_id, p_rotation_index: targetIndex });
    await supabase.rpc('update_slot_assignment_order', { p_slot_id: selectedSlot.slot_id, p_campaign_id: b.campaign_id, p_rotation_index: index });
    await loadAssignmentsForSlot(selectedSlot);
  };

  const removeAssignment = async (slotKey: string, campaignId: string) => {
    if (!selectedSlot) return;
    await supabase.rpc('remove_slot_assignment', { p_slot_id: selectedSlot.slot_id, p_campaign_id: campaignId });
    await loadAssignmentsForSlot(selectedSlot);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Slot Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="space-y-3">
              <div>
                <Label>Page</Label>
                <Select value={pageKey} onValueChange={v => setPageKey(v)}>
                  <SelectTrigger><SelectValue placeholder="Select page"/></SelectTrigger>
                  <SelectContent>
                    {pageKeys.map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Device</Label>
                <Select value={device} onValueChange={v => setDevice(v as DeviceType)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Slot</Label>
                <Select value={selectedSlotKey || ''} onValueChange={v => setSelectedSlotKey(v)}>
                  <SelectTrigger><SelectValue placeholder="Select slot"/></SelectTrigger>
                  <SelectContent>
                    {slots.map(s => (
                      <SelectItem key={s.slot_key} value={s.slot_key}>{s.slot_key} • {s.placement}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!slots.length && (
                  <div className="text-xs text-gray-500 mt-1">No slots found for this page/device.</div>
                )}
              </div>
              <div className="pt-1">
                <Button variant="outline" onClick={loadLayout}><RefreshCw className="w-4 h-4 mr-2"/>Reload</Button>
              </div>

              {selectedSlot && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge>{selectedSlot.slot_key}</Badge>
                    <span className="text-gray-600">{selectedSlot.placement} • {selectedSlot.device}</span>
                  </div>
                  {selectedSlot.config?.rotationMs && (
                    <div className="text-xs text-gray-500">Rotation: {selectedSlot.config.rotationMs} ms</div>
                  )}
                </div>
              )}
            </div>

            {/* Assignment form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="border rounded p-3 bg-white">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1">
                    <Label>Campaign</Label>
                    <Select value={selectedCampaignId || ''} onValueChange={v => setSelectedCampaignId(v)}>
                      <SelectTrigger><SelectValue placeholder="Select campaign"/></SelectTrigger>
                      <SelectContent>
                        {filteredCampaigns.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name} ({c.placement})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:w-48">
                    <Label>Filter placement</Label>
                    <Select value={campaignFilter.placement} onValueChange={v => setCampaignFilter(prev => ({ ...prev, placement: v as any }))}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {['header','footer','sidebar','inline','popup','pdf_sidebar','floater'].map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:w-60">
                    <Label>Search</Label>
                    <Input placeholder="Search campaigns..." value={campaignFilter.q} onChange={e => setCampaignFilter(prev => ({ ...prev, q: e.target.value }))}/>
                  </div>
                  <div className="md:w-36">
                    <Button className="w-full" disabled={!selectedSlot || !selectedCampaignId} onClick={assignCampaign}><Plus className="w-4 h-4 mr-2"/>Assign</Button>
                  </div>
                </div>
              </div>

              {/* Current assignments */}
              <div>
                <Label>Assigned Campaigns</Label>
                <div className="border rounded p-2 space-y-2 bg-white mt-1">
                  {(assignmentsBySlotKey[selectedSlotKey || ''] || []).map((a, idx) => (
                    <div key={a.campaign_id} className="flex items-center justify-between border rounded p-2">
                      <div className="text-sm">{idx + 1}. {a.name}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => moveAssignment(selectedSlotKey!, idx, -1)}><ArrowUp className="w-4 h-4"/></Button>
                        <Button size="sm" variant="outline" onClick={() => moveAssignment(selectedSlotKey!, idx, 1)}><ArrowDown className="w-4 h-4"/></Button>
                        <Button size="sm" variant="destructive" onClick={() => removeAssignment(selectedSlotKey!, a.campaign_id)}><X className="w-4 h-4"/></Button>
                      </div>
                    </div>
                  ))}
                  {(!assignmentsBySlotKey[selectedSlotKey || ''] || assignmentsBySlotKey[selectedSlotKey || ''].length === 0) && (
                    <div className="text-xs text-gray-500">No campaigns assigned to this slot.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            Live Preview: {selectedSlot ? `${selectedSlot.placement.charAt(0).toUpperCase()}${selectedSlot.placement.slice(1)} Slot` : 'Select a slot'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">Device: {device} {selectedSlot ? `• Slot: ${selectedSlot.slot_key}` : ''}</div>
            <Button variant="outline" size="sm" onClick={loadPreview}><RefreshCw className="w-4 h-4 mr-2"/>Refresh Preview</Button>
          </div>
          <div className={`border rounded bg-white flex items-center justify-center ${selectedSlot?.placement === 'sidebar' ? 'h-64 max-w-md' : 'h-24 w-full'}`}>
            {!selectedSlot && (
              <div className="text-xs text-gray-500">Select a slot to preview</div>
            )}
            {selectedSlot && previewCreatives.length === 0 && (
              <div className="text-xs text-gray-500">No active creatives resolved for this placement.</div>
            )}
            {selectedSlot && previewCreatives.length > 0 && (
              <PreviewCreative creative={previewCreatives[previewIndex]} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Placement Previews (All) */}
      <Card>
        <CardHeader>
          <CardTitle>Placement Previews (Campaigns + Legacy)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placementsAll.map((p) => (
              <div key={p} className="border rounded p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium capitalize">{p}</div>
                  <Button size="sm" variant="outline" onClick={() => { loadPreview(); loadLegacyPreview(); }}>
                    <RefreshCw className="w-4 h-4 mr-2"/>Refresh
                  </Button>
                </div>
                {/* Campaign-based preview */}
                <div className={`mb-2 ${p==='sidebar' ? 'max-w-sm' : ''}`}>
                  <AdSlot placement={p} />
                </div>
                {/* Legacy preview */}
                <div className="text-xs text-gray-500 mb-1">Legacy</div>
                <div className={`border rounded p-2 ${p==='sidebar' ? 'max-w-sm' : ''}`}>
                  {legacyPreview[p] ? (
                    <div>
                      {legacyPreview[p].image_url && (
                        <img src={legacyPreview[p].image_url} alt={legacyPreview[p].title} className="w-full h-auto rounded mb-2" />
                      )}
                      <div className="font-medium text-sm">{legacyPreview[p].title}</div>
                      {legacyPreview[p].content && (
                        <div className="text-xs text-gray-600 mt-1">{legacyPreview[p].content}</div>
                      )}
                      <div className="text-[10px] text-gray-400 mt-1">Advertisement</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">No legacy ad</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsSlotAssignmentForm;


// Lightweight preview renderer (supports image and html)
const PreviewCreative: React.FC<{ creative: ActiveAdCreative }> = ({ creative }) => {
  if (creative.media_type === 'image') {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        <img src={creative.media_url} alt={creative.title ?? 'Ad'} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }
  if (creative.media_type === 'html') {
    return (
      <div className="w-full h-full overflow-hidden px-2" dangerouslySetInnerHTML={{ __html: creative.media_url }} />
    );
  }
  return (
    <div className="text-sm text-gray-600 p-3 text-center">
      {creative.title || 'Ad'}
    </div>
  );
};

