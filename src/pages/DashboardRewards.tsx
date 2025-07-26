
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Coins, Star, Trophy } from 'lucide-react';

const DashboardRewards = () => {
  const rewards = [
    {
      id: 1,
      title: "Premium Access (1 Month)",
      description: "Remove ads and get priority support",
      points: 500,
      available: true,
      icon: Star
    },
    {
      id: 2,
      title: "Study Guide Bundle",
      description: "Collection of premium study materials",
      points: 300,
      available: true,
      icon: Gift
    },
    {
      id: 3,
      title: "Certificate of Excellence",
      description: "Digital certificate for top contributors",
      points: 1000,
      available: false,
      icon: Trophy
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rewards Store</h1>
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <Badge variant="secondary" className="text-lg px-4 py-2">
            300 Points
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const Icon = reward.icon;
          const canAfford = 300 >= reward.points; // Current points: 300
          
          return (
            <Card key={reward.id} className={!reward.available ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{reward.title}</CardTitle>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{reward.points} points</span>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!reward.available || !canAfford}
                    className={canAfford && reward.available ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {!reward.available ? 'Coming Soon' : 
                     !canAfford ? 'Not Enough Points' : 'Redeem'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Upload study material</span>
              <Badge variant="outline">+50 points</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Material gets downloaded</span>
              <Badge variant="outline">+10 points</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Daily login streak</span>
              <Badge variant="outline">+5 points</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Help other students</span>
              <Badge variant="outline">+25 points</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardRewards;
