import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, Plus, Trash2, MoreHorizontal, ArrowUp, ArrowDown, X } from 'lucide-react';

type SlotVM = {
  slot_id?: string;
  slot_key: string;
  placement: string;
  device: 'desktop'|'tablet'|'mobile';
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

const COLS_BY_DEVICE = { desktop: 12, tablet: 8, mobile: 4 } as const;

const AdsLayoutBuilder: React.FC = () => {
  const { toast } = useToast();
  const [pageKey, setPageKey] = useState('home');
  const [pageKeys, setPageKeys] = useState<string[]>(['home','past_papers','pdf_viewer','global_header','dashboard']);
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [gridConfig, setGridConfig] = useState<any>({ cols: 12, rowHeight: 40, gap: 8 });
  const [slots, setSlots] = useState<SlotVM[]>([]);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const layoutIdRef = useRef<string | null>(null);
  const [draggingCampaignId, setDraggingCampaignId] = useState<string | null>(null);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [slotAssignments, setSlotAssignments] = useState<Record<string, {campaign_id:string,name:string,rotation_index:number}[]>>({});
  const [libraryFilter, setLibraryFilter] = useState<{q:string; placement:string|undefined}>({ q:'', placement: undefined });

  const cols = useMemo(() => COLS_BY_DEVICE[device], [device]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewPaths: Record<string, string> = {
    home: '/',
    past_papers: '/past-papers',
    pdf_viewer: '/past-papers',
    global_header: '/',
    dashboard: '/dashboard'
  };

  const loadCampaigns = useCallback(async () => {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .select('id, name, placement, is_active, priority')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    if (!error) setCampaigns((data || []) as Campaign[]);
  }, []);

  const loadPageKeys = useCallback(async () => {
    const { data, error } = await supabase.from('ad_pages').select('key').order('key');
    if (!error && Array.isArray(data) && data.length > 0) {
      setPageKeys(data.map((d:any)=>d.key));
      if (!data.find((d:any)=>d.key===pageKey)) setPageKey(data[0].key);
    }
  }, [pageKey]);

  const ensureLayoutExists = useCallback(async () => {
    // Create a base layout with a starter slot to avoid blank canvas
    const baseCols = COLS_BY_DEVICE[device];
    const payload = {
      page_key: pageKey,
      route_pattern: null,
      device,
      name: 'default',
      grid_config: { cols: baseCols, rowHeight: 40, gap: 8 },
      slots: [
        { slot_key: 'header_top', placement: 'header', x: 0, y: 0, w: baseCols, h: 2, order_index: 0, config: {}, is_active: true }
      ]
    };
    const { data, error } = await supabase.rpc('upsert_ad_layout', { p_payload: payload });
    if (error) throw error;
    layoutIdRef.current = data as string;
  }, [device, pageKey]);

  const loadLayout = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_ad_layout', { p_page_key: pageKey, p_device: device });
      if (error) throw error;
      if (!data || !data.layout_id) {
        await ensureLayoutExists();
        const again = await supabase.rpc('get_ad_layout', { p_page_key: pageKey, p_device: device });
        if (!again.error) {
          layoutIdRef.current = (again.data as any)?.layout_id ?? null;
          const inc2: SlotVM[] = Array.isArray((again.data as any)?.slots) ? (again.data as any).slots.map((s: any) => ({
            slot_id: s.slot_id,
            slot_key: s.slot_key,
            placement: s.placement,
            device: s.device,
            x: s.x, y: s.y, w: s.w, h: s.h,
            order_index: s.order_index,
            config: s.config,
            is_active: s.is_active,
          })) : [];
          setSlots(inc2);
          toast({ title: 'Layout initialized' });
          return;
        }
      }
      layoutIdRef.current = data?.layout_id ?? null;
      const incoming: SlotVM[] = Array.isArray(data?.slots) ? data.slots.map((s: any) => ({
        slot_id: s.slot_id,
        slot_key: s.slot_key,
        placement: s.placement,
        device: s.device,
        x: s.x, y: s.y, w: s.w, h: s.h,
        order_index: s.order_index,
        config: s.config,
        is_active: s.is_active,
      })) : [];
      setSlots(incoming);
      toast({ title: 'Layout loaded' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  }, [device, pageKey, toast, ensureLayoutExists]);

useEffect(() => { loadCampaigns(); }, [loadCampaigns]);
useEffect(() => { loadPageKeys(); }, [loadPageKeys]);
useEffect(() => { loadLayout(); }, [loadLayout]);

  const saveLayout = async () => {
    try {
      const payload = {
        page_key: pageKey,
        route_pattern: null,
        device,
        name: 'default',
        grid_config: gridConfig,
        slots: slots.map(s => ({
          slot_key: s.slot_key,
          placement: s.placement,
          x: s.x, y: s.y, w: s.w, h: s.h,
          order_index: s.order_index,
          config: s.config,
          is_active: s.is_active,
        }))
      };
      const { data, error } = await supabase.rpc('upsert_ad_layout', { p_payload: payload });
      if (error) throw error;
      layoutIdRef.current = data as string;
      toast({ title: 'Saved', description: 'Layout updated' });
      loadLayout();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const addSlot = () => {
    const key = `slot_${Math.floor(Math.random() * 100000)}`;
    setSlots(prev => [...prev, { slot_key: key, placement: 'inline', device, x: 0, y: 0, w: Math.max(4, Math.floor(cols/3)), h: 2, order_index: prev.length, config: {}, is_active: true }]);
    setSelectedSlotKey(key);
  };

  const removeSlot = () => {
    if (!selectedSlotKey) return;
    setSlots(prev => prev.filter(s => s.slot_key !== selectedSlotKey));
    setSelectedSlotKey(null);
  };

  const onDragStartSlot = (e: React.DragEvent, key: string) => {
    e.dataTransfer.setData('text/slot-key', key);
  };

  const onDropGrid = (e: React.DragEvent) => {
    e.preventDefault();
    const key = e.dataTransfer.getData('text/slot-key');
    if (!key) return;
    const grid = e.currentTarget.getBoundingClientRect();
    const gap = gridConfig.gap ?? 8;
    const colWidth = (grid.width - gap*(cols-1)) / cols;
    const relX = e.clientX - grid.left;
    const relY = e.clientY - grid.top;
    const gx = Math.max(0, Math.min(cols-1, Math.round(relX / (colWidth + gap))));
    const gy = Math.max(0, Math.round(relY / (gridConfig.rowHeight + gap)));
    setSlots(prev => prev.map(s => s.slot_key === key ? { ...s, x: gx, y: gy } : s));
  };

  const onDragOverGrid = (e: React.DragEvent) => e.preventDefault();

  const startAssignCampaignDrag = (e: React.DragEvent, campaignId: string) => {
    e.dataTransfer.setData('text/campaign-id', campaignId);
    setDraggingCampaignId(campaignId);
  };

  const onDropOnSlot = async (e: React.DragEvent, slot: SlotVM) => {
    e.preventDefault();
    const campaignId = e.dataTransfer.getData('text/campaign-id');
    if (!campaignId) return;
    try {
      // Ensure we have a layout saved, then find slot_id by reloading or saving
      if (!layoutIdRef.current) await saveLayout();
      // reload to get slot ids
      await loadLayout();
      const fresh = slots.find(s => s.slot_key === slot.slot_key);
      // After reload, slot_id may still be undefined locally; fetch once more from RPC
      const { data } = await supabase.rpc('get_ad_layout', { p_page_key: pageKey, p_device: device });
      const match = (data?.slots || []).find((s: any) => s.slot_key === slot.slot_key);
      if (!match?.slot_id) throw new Error('Could not resolve slot id. Save layout then try again.');
      const { error } = await supabase.rpc('assign_campaign_to_slot', { p_slot_id: match.slot_id, p_campaign_id: campaignId, p_rotation_index: 0 });
      if (error) throw error;
      toast({ title: 'Assigned', description: 'Campaign assigned to slot' });
      setDraggingCampaignId(null);
      setHoveredSlotKey(null);
      await fetchAssignmentsForSlot(match.slot_id, slot.slot_key);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const selected = slots.find(s => s.slot_key === selectedSlotKey) || null;

  // Load assignments for a given slot
  const fetchAssignmentsForSlot = useCallback(async (slotId: string, slotKey: string) => {
    const { data, error } = await supabase
      .from('ad_slot_assignments')
      .select('campaign_id, rotation_index, ad_campaigns!inner(name)')
      .eq('slot_id', slotId)
      .eq('is_active', true)
      .order('rotation_index', { ascending: true });
    if (!error) {
      setSlotAssignments(prev => ({ ...prev, [slotKey]: (data || []).map((r:any)=>({ campaign_id:r.campaign_id, name:r.ad_campaigns.name, rotation_index:r.rotation_index })) }));
    }
  }, []);

  // When a slot is selected, resolve its id and pull assignments
  useEffect(() => {
    (async () => {
      if (!selected) return;
      const { data } = await supabase.rpc('get_ad_layout', { p_page_key: pageKey, p_device: device });
      const match = (data?.slots || []).find((s: any) => s.slot_key === selected.slot_key);
      if (match?.slot_id) await fetchAssignmentsForSlot(match.slot_id, selected.slot_key);
    })();
  }, [selected, pageKey, device, fetchAssignmentsForSlot]);

  const moveAssignment = async (slotKey: string, index: number, dir: -1 | 1) => {
    const list = slotAssignments[slotKey] || [];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= list.length) return;
    // swap rotation_index in DB using two calls
    const { data } = await supabase.rpc('get_ad_layout', { p_page_key: pageKey, p_device: device });
    const match = (data?.slots || []).find((s: any) => s.slot_key === slotKey);
    if (!match?.slot_id) return;
    const a = list[index];
    const b = list[newIndex];
    await supabase.rpc('update_slot_assignment_order', { p_slot_id: match.slot_id, p_campaign_id: a.campaign_id, p_rotation_index: newIndex });
    await supabase.rpc('update_slot_assignment_order', { p_slot_id: match.slot_id, p_campaign_id: b.campaign_id, p_rotation_index: index });
    await fetchAssignmentsForSlot(match.slot_id, slotKey);
  };

  const removeAssignment = async (slotKey: string, campaignId: string) => {
    const { data } = await supabase.rpc('get_ad_layout', { p_page_key: pageKey, p_device: device });
    const match = (data?.slots || []).find((s: any) => s.slot_key === slotKey);
    if (!match?.slot_id) return;
    await supabase.rpc('remove_slot_assignment', { p_slot_id: match.slot_id, p_campaign_id: campaignId });
    await fetchAssignmentsForSlot(match.slot_id, slotKey);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const qok = libraryFilter.q ? c.name.toLowerCase().includes(libraryFilter.q.toLowerCase()) : true;
    const pok = libraryFilter.placement ? c.placement === libraryFilter.placement : true;
    return qok && pok;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Layout Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-3">
              <div>
                <Label>Page Key</Label>
                <Select value={pageKey} onValueChange={(v)=>setPageKey(v)}>
                  <SelectTrigger><SelectValue placeholder="Select page"/></SelectTrigger>
                  <SelectContent>
                    {pageKeys.map(k => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Device</Label>
                <Select value={device} onValueChange={(v)=>setDevice(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadLayout} variant="outline"><RefreshCw className="w-4 h-4 mr-2"/>Reload</Button>
                <Button onClick={saveLayout}><Save className="w-4 h-4 mr-2"/>Save</Button>
              </div>
              <div className="pt-2">
                <Button onClick={addSlot} variant="outline"><Plus className="w-4 h-4 mr-2"/>Add Slot</Button>
                {selected && (
                  <Button onClick={removeSlot} variant="destructive" className="ml-2"><Trash2 className="w-4 h-4 mr-2"/>Remove</Button>
                )}
              </div>
              {selected && (
                <div className="mt-3 space-y-2">
                  <Label>Selected Slot</Label>
                  <div className="text-sm"><Badge>{selected.slot_key}</Badge> • {selected.placement}</div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input type="number" value={selected.x} onChange={e=>setSlots(prev=>prev.map(s=>s.slot_key===selected.slot_key?{...s,x:Number(e.target.value)}:s))} />
                    <Input type="number" value={selected.y} onChange={e=>setSlots(prev=>prev.map(s=>s.slot_key===selected.slot_key?{...s,y:Number(e.target.value)}:s))} />
                    <Input type="number" value={selected.w} onChange={e=>setSlots(prev=>prev.map(s=>s.slot_key===selected.slot_key?{...s,w:Number(e.target.value)}:s))} />
                    <Input type="number" value={selected.h} onChange={e=>setSlots(prev=>prev.map(s=>s.slot_key===selected.slot_key?{...s,h:Number(e.target.value)}:s))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Placement</Label>
                      <Select value={selected.placement} onValueChange={(v)=>setSlots(prev=>prev.map(s=>s.slot_key===selected.slot_key?{...s,placement:v}:s))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                          {['header','footer','sidebar','inline','popup','pdf_sidebar','floater'].map(p=> (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Carousel Rotation (ms)</Label>
                      <Input type="number" value={selected.config?.rotationMs || 5000} onChange={e=>setSlots(prev=>prev.map(s=>s.slot_key===selected.slot_key?{...s,config:{...s.config, rotationMs:Number(e.target.value)}}:s))}/>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Label>Assigned Campaigns</Label>
                    <div className="border rounded p-2 space-y-2">
                      {(slotAssignments[selected.slot_key]||[]).map((a, idx) => (
                        <div key={a.campaign_id} className="flex items-center justify-between border rounded p-2">
                          <div className="text-sm">{idx+1}. {a.name}</div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={()=>moveAssignment(selected.slot_key!, idx, -1)}><ArrowUp className="w-4 h-4"/></Button>
                            <Button size="sm" variant="outline" onClick={()=>moveAssignment(selected.slot_key!, idx, 1)}><ArrowDown className="w-4 h-4"/></Button>
                            <Button size="sm" variant="destructive" onClick={()=>removeAssignment(selected.slot_key!, a.campaign_id)}><X className="w-4 h-4"/></Button>
                          </div>
                        </div>
                      ))}
                      {(slotAssignments[selected.slot_key]||[]).length===0 && (
                        <div className="text-xs text-gray-500">No campaigns assigned. Drag one from the right.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live website preview with overlay grid */}
            <div className="lg:col-span-2">
              <div className="border rounded-md overflow-hidden" style={{ height: 480, position: 'relative' }}>
                {/* Website iframe */}
                <iframe ref={iframeRef} title="site-preview" src={previewPaths[pageKey] || '/'} className="w-full h-full" />
                {/* Overlay grid for drag-and-drop */}
                <div
                  className="absolute inset-0 p-2"
                  style={{ pointerEvents: 'auto' }}
                  onDragOver={onDragOverGrid}
                  onDrop={onDropGrid}
                >
                  <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundSize: `${100/cols}% ${gridConfig.rowHeight + (gridConfig.gap||8)}px`,
                    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)'
                  }}/>
                  {slots.map((s) => {
                  const gap = gridConfig.gap ?? 8;
                  const width = (100/cols) * s.w;
                  const left = (100/cols) * s.x;
                  const top = (s.y * (gridConfig.rowHeight + gap));
                  const height = (s.h * gridConfig.rowHeight) + (s.h-1)*gap;
                  return (
                    <div
                      key={s.slot_key}
                      draggable
                      onDragStart={(e)=>onDragStartSlot(e, s.slot_key)}
                      onClick={()=>setSelectedSlotKey(s.slot_key)}
                      className={`absolute rounded border cursor-move ${selectedSlotKey===s.slot_key? 'border-blue-600 ring-2 ring-blue-200':'border-gray-300'}`}
                      style={{ left: `${left}%`, width: `${width}%`, top, height, background: 'rgba(59,130,246,0.06)' }}
                      onDragOver={(e)=>e.preventDefault()}
                      onDrop={(e)=>onDropOnSlot(e, s)}
                      title={`${s.slot_key} • ${s.placement}`}
                    >
                      <div className="p-2 text-xs text-gray-700 flex items-center justify-between">
                        <span>{s.slot_key}</span>
                        <Badge variant={s.is_active?'default':'secondary'}>{s.placement}</Badge>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            </div>

            {/* Campaign library */}
            <div className="lg:col-span-1">
              <Label>Active Campaigns</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input placeholder="Search..." value={libraryFilter.q} onChange={(e)=>setLibraryFilter(prev=>({...prev, q:e.target.value}))} />
                <Select value={libraryFilter.placement || 'all'} onValueChange={(v)=>setLibraryFilter(prev=>({...prev, placement: v==='all'? undefined : v}))}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Placement"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {['header','footer','sidebar','inline','popup','pdf_sidebar','floater'].map(p=> (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2 space-y-2 max-h-96 overflow-auto border rounded p-2 bg-white">
                {filteredCampaigns.map(c => (
                  <div key={c.id} draggable onDragStart={(e)=>startAssignCampaignDrag(e, c.id)} className="p-2 border rounded hover:bg-gray-50 cursor-grab">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.placement} • prio {c.priority}</div>
                  </div>
                ))}
                {filteredCampaigns.length===0 && <div className="text-xs text-gray-500">No matching campaigns</div>}
              </div>
              <div className="text-xs text-gray-500 mt-2">Tip: Drag a campaign onto a slot to assign</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsLayoutBuilder;


