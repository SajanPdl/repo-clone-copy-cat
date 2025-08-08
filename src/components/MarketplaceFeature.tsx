
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Users, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MarketplaceFeature = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: ShoppingBag,
      title: 'Buy & Sell Materials',
      description: 'Trade study materials, notes, and resources with students worldwide'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Connect with verified students and educators from top universities'
    },
    {
      icon: TrendingUp,
      title: 'Earn Money',
      description: 'Monetize your knowledge by selling quality educational content'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Safe and secure platform with buyer and seller protection'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            New Feature
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            MeroAcademy Marketplace
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our thriving academic marketplace where students and educators buy, sell, 
            and share educational resources in a secure environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample listings preview */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h3 className="text-2xl font-bold text-center mb-8">Popular Listings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Advanced Physics Notes',
                price: '$15',
                category: 'Science',
                rating: '4.8',
                downloads: '234'
              },
              {
                title: 'Calculus Problem Sets',
                price: '$12',
                category: 'Mathematics',
                rating: '4.9',
                downloads: '189'
              },
              {
                title: 'Chemistry Lab Reports',
                price: '$18',
                category: 'Science',
                rating: '4.7',
                downloads: '156'
              }
            ].map((listing, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{listing.title}</h4>
                  <span className="text-blue-600 font-bold">{listing.price}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <Badge variant="outline" className="text-xs">
                    {listing.category}
                  </Badge>
                  <div className="flex gap-2">
                    <span>⭐ {listing.rating}</span>
                    <span>↓ {listing.downloads}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/marketplace')}
            className="px-8 py-3"
          >
            Explore Marketplace
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Join thousands of students already trading on our platform
          </p>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceFeature;
