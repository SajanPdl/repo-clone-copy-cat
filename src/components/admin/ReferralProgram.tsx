
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, Gift, Trophy, Share2, Copy, Star } from 'lucide-react';

interface ReferralStats {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  current_month_referrals: number;
  total_rewards_earned: number;
  rank_position: number;
  created_at: string;
  updated_at: string;
}

interface ReferralTransaction {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  reward_amount: number;
  reward_type: string;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
}

interface Leaderboard {
  user_id: string;
  referral_code: string;
  total_referrals: number;
  total_rewards_earned: number;
  rank_position: number;
  user_email?: string;
}

const ReferralProgram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  const REWARD_AMOUNTS = {
    SIGNUP: 50,
    FIRST_UPLOAD: 100,
    FIRST_PURCHASE: 200
  };

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Fetch user's referral stats
      const { data: referralData, error: referralError } = await supabase
        .from('referral_program')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (referralError && referralError.code !== 'PGRST116') {
        // Create referral record if doesn't exist
        const referralCode = generateReferralCode();
        const { data: newReferral, error: createError } = await supabase
          .from('referral_program')
          .insert({
            user_id: user.id,
            referral_code: referralCode,
            total_referrals: 0,
            current_month_referrals: 0,
            total_rewards_earned: 0,
            rank_position: null
          })
          .select()
          .single();

        if (createError) throw createError;
        setStats(newReferral);
      } else {
        setStats(referralData);
      }

      // Fetch referral transactions with proper type conversion
      const { data: transactionData, error: transactionError } = await supabase
        .from('referral_transactions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;
      
      // Convert the data to proper types with explicit type assertion
      const typedTransactions: ReferralTransaction[] = (transactionData || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'paid'
      }));
      
      setTransactions(typedTransactions);

      // Fetch leaderboard
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('referral_program')
        .select('user_id, referral_code, total_referrals, total_rewards_earned, rank_position')
        .order('total_referrals', { ascending: false })
        .limit(10);

      if (leaderboardError) throw leaderboardError;
      setLeaderboard(leaderboardData || []);

    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = () => {
    return user?.email?.split('@')[0]?.toUpperCase().slice(0, 6) + Math.random().toString(36).substring(2, 6).toUpperCase() || 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const copyReferralLink = () => {
    if (!stats) return;
    
    const referralLink = `${window.location.origin}/?ref=${stats.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    
    toast({
      title: 'Success',
      description: 'Referral link copied to clipboard!',
    });
  };

  const shareReferralLink = () => {
    if (!stats) return;
    
    const referralLink = `${window.location.origin}/?ref=${stats.referral_code}`;
    const shareText = `Join EduSanskriti using my referral code ${stats.referral_code} and get started with amazing study resources! ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join EduSanskriti',
        text: shareText,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Success',
        description: 'Share text copied to clipboard!',
      });
    }
  };

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
        <h1 className="text-3xl font-bold">Ambassador Program</h1>
        <p className="text-gray-600 mt-2">Refer friends and earn rewards!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.total_referrals || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-green-600">{stats?.current_month_referrals || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-3xl font-bold text-purple-600">Rs. {stats?.total_rewards_earned || 0}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rank</p>
                <p className="text-3xl font-bold text-orange-600">#{stats?.rank_position || '-'}</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code & Sharing */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                value={stats?.referral_code || ''}
                readOnly
                className="text-center text-lg font-mono"
              />
            </div>
            <Button onClick={copyReferralLink} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button onClick={shareReferralLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            Share your code and earn rewards when friends sign up and engage!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralProgram;
