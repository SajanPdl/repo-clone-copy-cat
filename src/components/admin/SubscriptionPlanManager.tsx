import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Eye, DollarSign, Users, Calendar, Settings } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  plan_code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  active_subscriptions_count: number;
}

interface PlanStats {
  total_plans: number;
  active_plans: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_revenue: number;
  monthly_revenue: number;
}

const SubscriptionPlanManager = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    plan_code: '',
    name: '',
    description: '',
    price: '',
    currency: 'NPR',
    duration_days: '',
    features: '',
    is_active: true
  });

  useEffect(() => {
    fetchPlans();
    fetchStats();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_subscription_plans');
      
      if (error) throw error;
      
      // Transform features from JSONB to string array
      const transformedPlans = (data || []).map((plan: any) => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : []
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_subscription_plan_stats');
      
      if (error) throw error;
      
      setStats(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      plan_code: '',
      name: '',
      description: '',
      price: '',
      currency: 'NPR',
      duration_days: '',
      features: '',
      is_active: true
    });
  };

  const handleCreatePlan = async () => {
    try {
      const features = formData.features.split(',').map(f => f.trim()).filter(f => f);
      
      const { data, error } = await supabase.rpc('create_subscription_plan', {
        plan_code: formData.plan_code,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration_days: parseInt(formData.duration_days),
        features: features,
        is_active: formData.is_active
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subscription plan created successfully'
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchPlans();
      fetchStats();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create subscription plan',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const features = formData.features.split(',').map(f => f.trim()).filter(f => f);
      
      const { data, error } = await supabase.rpc('update_subscription_plan', {
        plan_id: editingPlan.id,
        plan_code: formData.plan_code || undefined,
        name: formData.name || undefined,
        description: formData.description || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency || undefined,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : undefined,
        features: features.length > 0 ? features : undefined,
        is_active: formData.is_active
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subscription plan updated successfully'
      });

      setIsEditDialogOpen(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
      fetchStats();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription plan',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      const { data, error } = await supabase.rpc('delete_subscription_plan', {
        plan_id: planToDelete.id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subscription plan deleted successfully'
      });

      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
      fetchPlans();
      fetchStats();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete subscription plan',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_code: plan.plan_code,
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      currency: plan.currency,
      duration_days: plan.duration_days.toString(),
      features: plan.features.join(', '),
      is_active: plan.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plan Management</h1>
          <p className="text-gray-600">Manage subscription plans and pricing</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
              <DialogDescription>
                Add a new subscription plan with pricing and features
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan_code">Plan Code *</Label>
                  <Input
                    id="plan_code"
                    value={formData.plan_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, plan_code: e.target.value }))}
                    placeholder="e.g., pro_monthly"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Pro Monthly"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Plan description..."
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="999"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    placeholder="NPR"
                  />
                </div>
                <div>
                  <Label htmlFor="duration_days">Duration (Days) *</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="unlimited_downloads, priority_support, advanced_features"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active Plan</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_plans}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_plans} active plans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_subscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_subscriptions} active subscriptions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_revenue, 'NPR')}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.monthly_revenue, 'NPR')} this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Plan</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Subscribers</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-500">{plan.plan_code}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">
                        {formatCurrency(plan.price, plan.currency)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{plan.duration_days} days</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{plan.active_subscriptions_count}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(plan)}
                          disabled={plan.active_subscriptions_count > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_plan_code">Plan Code</Label>
                <Input
                  id="edit_plan_code"
                  value={formData.plan_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan_code: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_name">Plan Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_price">Price</Label>
                <Input
                  id="edit_price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_currency">Currency</Label>
                <Input
                  id="edit_currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_duration_days">Duration (Days)</Label>
                <Input
                  id="edit_duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_features">Features (comma-separated)</Label>
              <Input
                id="edit_features"
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit_is_active">Active Plan</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>
              Update Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlanManager;
