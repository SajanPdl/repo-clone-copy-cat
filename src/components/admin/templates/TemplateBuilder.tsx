import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Plus, Trash2, MonitorSmartphone } from 'lucide-react';

type Device = 'desktop'|'tablet'|'mobile';
type ElementVM = { id: string; type: 'image' | 'text' | 'button' | 'html' | 'divider'; x:number;y:number;w:number;h:number; z:number; visible:boolean; props:any };
type LayoutVM = { devices: Record<Device,{ elements: ElementVM[]; meta:{ grid:{ cols:number; rowHeight:number; gap:number }}}>; vars?: any; conditions?: any };

const defaultLayout: LayoutVM = {
  devices: {
    desktop: { elements: [], meta: { grid: { cols: 12, rowHeight: 40, gap: 8 } } },
    tablet:  { elements: [], meta: { grid: { cols: 8,  rowHeight: 40, gap: 8 } } },
    mobile:  { elements: [], meta: { grid: { cols: 4,  rowHeight: 40, gap: 8 } } },
  },
  vars: {},
  conditions: {}
};

const TemplateBuilder: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [device, setDevice] = useState<Device>('desktop');
  const [layout, setLayout] = useState<LayoutVM>(defaultLayout);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cols = useMemo(()=> layout.devices[device].meta.grid.cols, [layout, device]);

  const load = useCallback(async () => {
    // Load last published or last version doc if available; fallback to default
    const { data: vers } = await supabase
      .from('ad_template_versions')
      .select('id,is_published')
      .eq('template_id', templateId)
      .order('is_published', { ascending:false })
      .order('created_at', { ascending:false })
      .limit(1)
      .maybeSingle();
    if (vers?.id) {
      const { data: doc } = await supabase
        .from('ad_template_docs')
        .select('layout')
        .eq('template_version_id', vers.id)
        .maybeSingle();
      if (doc?.layout) {
        setLayout(doc.layout as LayoutVM);
        return;
      }
    }
  }, [templateId]);

  useEffect(()=>{ load(); }, [load]);

  const addElement = (type: ElementVM['type']) => {
    const key = `el_${Math.floor(Math.random()*100000)}`;
    setLayout(prev => {
      const next = { ...prev };
      const els = next.devices[device].elements.slice();
      els.push({ id:key, type, x:0, y:0, w: Math.max(4, Math.floor(cols/3)), h:2, z:els.length, visible:true, props:{} });
      next.devices[device].elements = els;
      return next;
    });
    setSelectedId(key);
  };

  const removeElement = () => {
    if (!selectedId) return;
    setLayout(prev => {
      const next = { ...prev };
      next.devices[device].elements = next.devices[device].elements.filter(e=>e.id!==selectedId);
      return next;
    });
    setSelectedId(null);
  };

  const onDrag = (e: React.DragEvent, id: string) => {
    const gridEl = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const { left, top, width } = gridEl;
    const gap = layout.devices[device].meta.grid.gap;
    const colWidth = (width - gap*(cols-1)) / cols;
    const x = Math.max(0, Math.min(cols-1, Math.round((e.clientX - left) / (colWidth + gap))));
    const y = Math.max(0, Math.round((e.clientY - top) / (layout.devices[device].meta.grid.rowHeight + gap)));
    setLayout(prev => {
      const next = { ...prev };
      next.devices[device].elements = next.devices[device].elements.map(el=> el.id===id ? { ...el, x, y } : el);
      return next;
    });
  };

  const save = async (publish=false) => {
    try {
      const { data, error } = await supabase.rpc('save_template_version', { p_template_id: templateId, p_layout: layout as any, p_publish: publish });
      if (error) throw error;
      toast({ title: publish? 'Published':'Saved', description: publish? 'Template published':'Draft version saved' });
      navigate('/admin/ads/templates');
    } catch (e:any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const selected = layout.devices[device].elements.find(e=>e.id===selectedId) || null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Template Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Toolbox */}
            <div className="lg:col-span-1 space-y-3">
              <div>
                <Label>Device</Label>
                <Select value={device} onValueChange={(v)=>setDevice(v as Device)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={()=>save(false)} variant="outline"><Save className="w-4 h-4 mr-2"/>Save</Button>
                <Button onClick={()=>save(true)}><MonitorSmartphone className="w-4 h-4 mr-2"/>Publish</Button>
              </div>
              <div className="pt-2">
                <Label>Add Element</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={()=>addElement('image')}>Image</Button>
                  <Button size="sm" variant="outline" onClick={()=>addElement('text')}>Text</Button>
                  <Button size="sm" variant="outline" onClick={()=>addElement('button')}>Button</Button>
                  <Button size="sm" variant="outline" onClick={()=>addElement('divider')}>Divider</Button>
                  <Button size="sm" variant="outline" onClick={()=>addElement('html')}>HTML</Button>
                </div>
              </div>
              {selected && (
                <div className="mt-3 space-y-2">
                  <Label>Selected Element</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Input type="number" value={selected.x} onChange={e=>setLayout(prev=>{const n={...prev};n.devices[device].elements=n.devices[device].elements.map(el=>el.id===selected.id?{...el,x:Number(e.target.value)}:el);return n;})}/>
                    <Input type="number" value={selected.y} onChange={e=>setLayout(prev=>{const n={...prev};n.devices[device].elements=n.devices[device].elements.map(el=>el.id===selected.id?{...el,y:Number(e.target.value)}:el);return n;})}/>
                    <Input type="number" value={selected.w} onChange={e=>setLayout(prev=>{const n={...prev};n.devices[device].elements=n.devices[device].elements.map(el=>el.id===selected.id?{...el,w:Number(e.target.value)}:el);return n;})}/>
                    <Input type="number" value={selected.h} onChange={e=>setLayout(prev=>{const n={...prev};n.devices[device].elements=n.devices[device].elements.map(el=>el.id===selected.id?{...el,h:Number(e.target.value)}:el);return n;})}/>
                  </div>
                  <Button variant="destructive" onClick={removeElement}><Trash2 className="w-4 h-4 mr-2"/>Remove</Button>
                </div>
              )}
            </div>

            {/* Canvas */}
            <div className="lg:col-span-3">
              <div className="border rounded-md p-2 bg-white" style={{ height: 520, position:'relative' }}>
                {/* Grid */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundSize: `${100/cols}% ${layout.devices[device].meta.grid.rowHeight + (layout.devices[device].meta.grid.gap||8)}px`,
                  backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)'
                }}/>
                <div className="absolute inset-0">
                  {layout.devices[device].elements.map(el => {
                    const gap = layout.devices[device].meta.grid.gap;
                    const width = (100/cols) * el.w;
                    const left = (100/cols) * el.x;
                    const top = (el.y * (layout.devices[device].meta.grid.rowHeight + gap));
                    const height = (el.h * layout.devices[device].meta.grid.rowHeight) + (el.h-1)*gap;
                    return (
                      <div
                        key={el.id}
                        draggable
                        onDragEnd={(e)=>onDrag(e, el.id)}
                        onClick={()=>setSelectedId(el.id)}
                        className={`absolute rounded border cursor-move ${selectedId===el.id? 'border-blue-600 ring-2 ring-blue-200':'border-gray-300'}`}
                        style={{ left: `${left}%`, width: `${width}%`, top, height, background: 'rgba(59,130,246,0.06)', zIndex: el.z }}
                        title={`${el.type} • ${el.id}`}
                      >
                        <div className="p-2 text-[11px] text-gray-700">{el.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateBuilder;


