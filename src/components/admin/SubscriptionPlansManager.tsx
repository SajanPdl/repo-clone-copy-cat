import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, RefreshCw, Search } from 'lucide-react';

interface PlanForm {
  id?: string;
  name: string;
  plan_code: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string; // comma separated in form; saved as string[]
  is_active: boolean;
}

interface SubscriptionPlanRow {
  id: string;
  plan_code: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const emptyForm: PlanForm = {
  name: '',
  plan_code: '',
  description: '',
  price: 0,
  currency: 'NPR',
  duration_days: 30,
  features: '',
  is_active: true,
};

const SubscriptionPlansManager: React.FC = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPlans((data || []) as unknown as SubscriptionPlanRow[]);
    } catch (error: any) {
      console.error('Error loading plans:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load plans', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
  };

  const startEdit = (plan: SubscriptionPlanRow) => {
    setForm({
      id: plan.id,
      name: plan.name,
      plan_code: plan.plan_code,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency,
      duration_days: plan.duration_days,
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      is_active: plan.is_active,
    });
    setIsEditing(true);
  };

  const parseFeatures = (features: string): string[] => {
    return features
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: form.name,
        plan_code: form.plan_code,
        description: form.description || null,
        price: Number(form.price),
        currency: form.currency || 'NPR',
        duration_days: Number(form.duration_days),
        features: parseFeatures(form.features),
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && form.id) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
        toast({ title: 'Plan updated', description: `${form.name} updated successfully` });
      } else {
        const insertPayload = { ...payload, created_at: new Date().toISOString() };
        const { error } = await supabase
          .from('subscription_plans')
          .insert(insertPayload);
        if (error) throw error;
        toast({ title: 'Plan created', description: `${form.name} created successfully` });
      }
      resetForm();
      fetchPlans();
    } catch (error: any) {
      console.error('Save plan error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save plan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (plan: SubscriptionPlanRow) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !plan.is_active, updated_at: new Date().toISOString() })
        .eq('id', plan.id);
      if (error) throw error;
      toast({ title: 'Updated', description: `${plan.name} is now ${!plan.is_active ? 'active' : 'inactive'}` });
      fetchPlans();
    } catch (error: any) {
      console.error('Toggle active error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to update plan', variant: 'destructive' });
    }
  };

  const deletePlan = async (plan: SubscriptionPlanRow) => {
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', plan.id);
      if (error) throw error;
      toast({ title: 'Deleted', description: `${plan.name} has been deleted` });
      fetchPlans();
    } catch (error: any) {
      console.error('Delete plan error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete plan', variant: 'destructive' });
    }
  };

  const filteredPlans = useMemo(() => {
    const s = search.toLowerCase();
    return plans.filter((p) =>
      [p.name, p.plan_code, p.description || ''].some((v) => v.toLowerCase().includes(s))
    );
  }, [plans, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-7 h-7 text-yellow-600" /> Subscription Plans
          </h1>
          <p className="text-gray-600 mt-1">Create, edit, enable/disable, and remove plans users can purchase.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPlans} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); }}>
            <Plus className="w-4 h-4 mr-2" /> New Plan
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input className="pl-9" placeholder="Search by name, code, description" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Plan' : 'Create New Plan'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePlan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Plan Code</Label>
              <Input value={form.plan_code} onChange={(e) => setForm({ ...form, plan_code: e.target.value })} placeholder="e.g., pro_monthly" required />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div>
              <Label>Duration (days)</Label>
              <Input type="number" min={1} step="1" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })} required />
            </div>
            <div>
              <Label>Features (comma separated)</Label>
              <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="e.g., Ad-free, Priority support" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {isEditing ? 'Update Plan' : 'Create Plan'}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Plans list */}
      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Duration</th>
                  <th className="py-2 pr-4">Features</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">{p.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{p.plan_code}</td>
                    <td className="py-2 pr-4">{p.currency} {p.price}</td>
                    <td className="py-2 pr-4">{p.duration_days} days</td>
                    <td className="py-2 pr-4 max-w-md">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(p.features) ? p.features : []).map((f, idx) => (
                          <Badge key={idx} variant="secondary">{f}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      {p.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-2 pr-0">
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleActive(p)}>
                          {p.is_active ? (
                            <><ToggleLeft className="w-4 h-4 mr-1" /> Disable</>
                          ) : (
                            <><ToggleRight className="w-4 h-4 mr-1" /> Enable</>
                          )}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deletePlan(p)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">No plans found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPlansManager;
