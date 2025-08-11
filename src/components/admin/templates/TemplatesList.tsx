import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type Template = {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  category_id: string | null;
  created_at: string;
};

const TemplatesList: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState('New Premium Template');
  const [category, setCategory] = useState('General');

  const load = async () => {
    const { data, error } = await supabase.from('ad_templates').select('*').order('created_at', { ascending: false });
    if (!error) setTemplates((data || []) as Template[]);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      const { data, error } = await supabase.rpc('create_template', { p_name: name, p_category: category });
      if (error) throw error;
      toast({ title: 'Created', description: 'Template created' });
      navigate(`/admin/ads/templates/${data}`);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Premium Ad Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e)=>setCategory(e.target.value)} />
            </div>
            <div>
              <Button onClick={create} className="w-full">Create Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="cursor-pointer" onClick={()=>navigate(`/admin/ads/templates/${t.id}`)}>
            <CardHeader>
              <CardTitle className="text-base">{t.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Status: {t.status}</div>
              <div className="text-xs text-gray-500">Created: {new Date(t.created_at).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <div className="text-sm text-gray-500">No templates yet. Create one above.</div>
        )}
      </div>
    </div>
  );
};

export default TemplatesList;


