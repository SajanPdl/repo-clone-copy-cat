
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Gift, Star, TrendingUp } from 'lucide-react';

const DashboardRewards = () => {
  // Mock rewards data - replace with real data later
  const rewards = [
    {
      id: 1,
      title: "Study Streak Bonus",
      description: "7-day study streak completed",
      points: 50,
      type: "bonus",
      claimed: false,
      date: "2024-01-20"
    },
    {
      id: 2,
      title: "Top Contributor",
      description: "Most uploads this month",
      points: 100,
      type: "achievement",
      claimed: true,
      date: "2024-01-15"
    }
  ];

  const totalPoints = 150;
  const availableRewards = rewards.filter(r => !r.claimed);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Rewards & Points</h2>
        <p className="text-gray-600">Earn points and redeem rewards</p>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Keep earning more points!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableRewards.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to claim
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">+75</div>
            <p className="text-xs text-muted-foreground">
              Points earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableRewards.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rewards available</h3>
              <p className="text-gray-600">
                Keep using the platform to earn more rewards!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{reward.title}</h4>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {reward.points} points
                      </Badge>
                      <Badge variant={reward.type === 'bonus' ? 'default' : 'outline'}>
                        {reward.type}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm">
                    Claim Reward
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reward History */}
      <Card>
        <CardHeader>
          <CardTitle>Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewards.filter(r => r.claimed).map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{reward.title}</h4>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {reward.points} points
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {new Date(reward.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardRewards;
