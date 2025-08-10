
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Crown, 
  Calendar, 
  Search, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import type { UserSubscription, SubscriptionPlan } from '@/types/subscription';

interface SubscriptionWithPlan extends UserSubscription {
  plan_code: string;
  plan_name: string;
  days_remaining: number;
}

const SubscriptionManager = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Fetch all user subscriptions with plan details
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans!inner (
            plan_code,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include plan details and calculate days remaining
      const transformedData: SubscriptionWithPlan[] = (data || []).map((sub: any) => ({
        ...sub,
        plan_code: sub.subscription_plans.plan_code,
        plan_name: sub.subscription_plans.name,
        days_remaining: Math.max(0, Math.floor((new Date(sub.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      }));

      setSubscriptions(transformedData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSubscriptionStats = () => {
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active' && s.days_remaining > 0).length;
    const expiredSubscriptions = subscriptions.filter(s => s.status === 'active' && s.days_remaining <= 0).length;
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled').length;
    
    return { totalSubscriptions, activeSubscriptions, expiredSubscriptions, cancelledSubscriptions };
  };

  const getStatusColor = (status: string, daysRemaining: number) => {
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    if (status === 'active' && daysRemaining <= 0) return 'bg-orange-100 text-orange-800';
    if (status === 'active' && daysRemaining <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (status: string, daysRemaining: number) => {
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'active' && daysRemaining <= 0) return 'Expired';
    if (status === 'active' && daysRemaining <= 7) return `Expires in ${daysRemaining} days`;
    return 'Active';
  };

  const { totalSubscriptions, activeSubscriptions, expiredSubscriptions, cancelledSubscriptions } = getSubscriptionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Manage user subscriptions and monitor their status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold">{totalSubscriptions}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{activeSubscriptions}</p>
              </div>
              <Crown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold">{expiredSubscriptions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold">{cancelledSubscriptions}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user ID or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button onClick={fetchSubscriptions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {subscription.plan_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{subscription.plan_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(subscription.status, subscription.days_remaining)}>
                          {getStatusText(subscription.status, subscription.days_remaining)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          User: {subscription.user_id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Started: {new Date(subscription.starts_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires: {new Date(subscription.expires_at).toLocaleDateString()}
                    </div>
                    {subscription.status === 'active' && (
                      <div className="text-sm font-medium">
                        {subscription.days_remaining > 0 
                          ? `${subscription.days_remaining} days remaining`
                          : 'Expired'
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
