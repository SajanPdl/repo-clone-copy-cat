
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Coins, Star, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  type: 'discount' | 'merchandise' | 'premium' | 'special';
  availability: number;
  image?: string;
}

const RewardsPage = () => {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(1250); // Mock data
  const [rewards] = useState<Reward[]>([
    {
      id: '1',
      name: '20% Discount Voucher',
      description: 'Get 20% off on any premium study material',
      points_cost: 500,
      type: 'discount',
      availability: 50
    },
    {
      id: '2',
      name: 'EduHub T-Shirt',
      description: 'Premium quality cotton t-shirt with EduHub logo',
      points_cost: 1000,
      type: 'merchandise',
      availability: 25
    },
    {
      id: '3',
      name: '1 Month Premium Access',
      description: 'Full access to premium features for one month',
      points_cost: 1500,
      type: 'premium',
      availability: 100
    },
    {
      id: '4',
      name: 'Study Buddy Badge',
      description: 'Exclusive badge showing your helpful nature',
      points_cost: 2000,
      type: 'special',
      availability: 10
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount': return 'bg-green-100 text-green-800';
      case 'merchandise': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return Coins;
      case 'merchandise': return Gift;
      case 'premium': return Crown;
      case 'special': return Star;
      default: return Gift;
    }
  };

  const canRedeem = (pointsCost: number) => userPoints >= pointsCost;

  const handleRedeem = (reward: Reward) => {
    if (canRedeem(reward.points_cost)) {
      setUserPoints(prev => prev - reward.points_cost);
      // In a real app, you would make an API call here
      alert(`Successfully redeemed: ${reward.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-gray-900">Rewards</h1>
              </div>
            </header>
            <main className="p-6">
              <div className="space-y-6">
                {/* Points Balance */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Your Points Balance</h2>
                        <p className="text-blue-100">Redeem points for exclusive rewards</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{userPoints.toLocaleString()}</div>
                        <div className="text-blue-100">Points</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rewards Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {rewards.map((reward) => {
                        const IconComponent = getTypeIcon(reward.type);
                        const redeemable = canRedeem(reward.points_cost);
                        
                        return (
                          <div
                            key={reward.id}
                            className={`p-6 rounded-lg border transition-all ${
                              redeemable 
                                ? 'border-blue-200 bg-blue-50' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-full ${
                                redeemable ? 'bg-blue-200' : 'bg-gray-200'
                              }`}>
                                <IconComponent 
                                  className={`h-6 w-6 ${
                                    redeemable ? 'text-blue-700' : 'text-gray-500'
                                  }`} 
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {reward.name}
                                </h3>
                                <p className="text-gray-600 mt-1">{reward.description}</p>
                                
                                <div className="flex items-center space-x-2 mt-3">
                                  <Badge 
                                    variant="outline" 
                                    className={getTypeColor(reward.type)}
                                  >
                                    {reward.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {reward.availability} left
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4">
                                  <div className="text-lg font-bold text-blue-600">
                                    {reward.points_cost.toLocaleString()} pts
                                  </div>
                                  <Button
                                    onClick={() => handleRedeem(reward)}
                                    disabled={!redeemable}
                                    variant={redeemable ? "default" : "outline"}
                                  >
                                    {redeemable ? 'Redeem' : 'Not Enough Points'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* How to Earn Points */}
                <Card>
                  <CardHeader>
                    <CardTitle>How to Earn Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">+50</span>
                        </div>
                        <span>Upload study materials</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">+10</span>
                        </div>
                        <span>Download materials</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold">+100</span>
                        </div>
                        <span>Sell materials</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 font-bold">+25</span>
                        </div>
                        <span>Daily login streak</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default RewardsPage;
