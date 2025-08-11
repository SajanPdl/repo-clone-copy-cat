import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Calendar, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionStatus = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userSubscription, loading, refreshSubscription } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const handleRefresh = async () => {
    await refreshSubscription();
    toast({
      title: 'Refreshed',
      description: 'Subscription status updated'
    });
  };

  const getSubscriptionProgress = () => {
    if (!userSubscription) return 0;
    
    const totalDays = Math.floor(
      (new Date(userSubscription.expires_at).getTime() - new Date(userSubscription.starts_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const remainingDays = userSubscription.days_remaining;
    const usedDays = totalDays - remainingDays;
    
    return Math.max(0, Math.min(100, (usedDays / totalDays) * 100));
  };

  const getStatusColor = () => {
    if (!userSubscription) return 'bg-gray-100 text-gray-800';
    if (userSubscription.days_remaining <= 0) return 'bg-red-100 text-red-800';
    if (userSubscription.days_remaining <= 7) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!userSubscription) return 'No Active Subscription';
    if (userSubscription.days_remaining <= 0) return 'Expired';
    if (userSubscription.days_remaining <= 7) return `Expires in ${userSubscription.days_remaining} days`;
    return 'Active';
  };

  const getPlanIcon = () => {
    if (!userSubscription) return <AlertCircle className="h-5 w-5" />;
    if (userSubscription.plan_code.includes('premium')) return <Crown className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlanIcon()}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userSubscription ? (
          <>
            {/* Current Plan Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{userSubscription.plan_name}</h3>
                <p className="text-sm text-gray-600">{userSubscription.plan_code}</p>
              </div>
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subscription Progress</span>
                <span>{userSubscription.days_remaining} days remaining</span>
              </div>
              <Progress value={getSubscriptionProgress()} className="h-2" />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Started</p>
                  <p className="text-gray-600">
                    {new Date(userSubscription.starts_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Expires</p>
                  <p className="text-gray-600">
                    {new Date(userSubscription.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Refresh Status
              </Button>
              <Button onClick={handleUpgrade} className="flex-1">
                Renew Subscription
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* No Subscription */}
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">
                Upgrade to access premium features and unlimited downloads
              </p>
              <Button onClick={handleUpgrade} className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
