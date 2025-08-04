
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

      // Fetch referral transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('referral_transactions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;
      setTransactions(transactionData || []);

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
    const shareText = `Join MeroAcademy using my referral code ${stats.referral_code} and get started with amazing study resources! ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join MeroAcademy',
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

  const getRankBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-100 text-yellow-800">🥇 Champion</Badge>;
    if (position === 2) return <Badge className="bg-gray-100 text-gray-800">🥈 Expert</Badge>;
    if (position === 3) return <Badge className="bg-orange-100 text-orange-800">🥉 Pro</Badge>;
    if (position <= 10) return <Badge className="bg-blue-100 text-blue-800">⭐ Top 10</Badge>;
    return <Badge variant="outline">Ambassador</Badge>;
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

          {stats?.rank_position && (
            <div className="text-center">
              {getRankBadge(stats.rank_position)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reward Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900">Friend Signs Up</h3>
              <p className="text-2xl font-bold text-blue-600">Rs. {REWARD_AMOUNTS.SIGNUP}</p>
              <p className="text-sm text-blue-700">When they verify email</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Gift className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900">First Upload</h3>
              <p className="text-2xl font-bold text-green-600">Rs. {REWARD_AMOUNTS.FIRST_UPLOAD}</p>
              <p className="text-sm text-green-700">When they upload content</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900">First Purchase</h3>
              <p className="text-2xl font-bold text-purple-600">Rs. {REWARD_AMOUNTS.FIRST_PURCHASE}</p>
              <p className="text-sm text-purple-700">When they make a purchase</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Ambassadors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-800">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{entry.referral_code}</p>
                      <p className="text-sm text-gray-500">{entry.total_referrals} referrals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">Rs. {entry.total_rewards_earned}</p>
                    {index < 3 && (
                      <p className="text-xs text-orange-500">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No rewards yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.reward_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+Rs. {transaction.reward_amount}</p>
                      <Badge variant={
                        transaction.status === 'approved' ? 'default' :
                        transaction.status === 'pending' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralProgram;
