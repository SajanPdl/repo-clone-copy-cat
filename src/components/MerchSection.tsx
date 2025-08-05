
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/currencyUtils';

interface MerchItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
}

const MerchSection = () => {
  const [featuredItems, setFeaturedItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('merch_store')
        .select('*')
        .eq('is_active', true)
        .limit(4)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeaturedItems(data || []);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-4xl font-bold text-gray-900">EduHub Merchandise</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Show your love for learning with our exclusive collection of educational merchandise
          </p>
        </div>

        {featuredItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow bg-white">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-purple-600">
                      {item.category}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(item.price)}
                      </span>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Buy Now
                      </Button>
                    </div>
                    {item.stock_quantity > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {item.stock_quantity} in stock
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/merch">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4">
                  <Package className="h-5 w-5 mr-2" />
                  View All Merchandise
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
            <p className="text-gray-600">
              We're preparing an amazing collection of educational merchandise for you.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
            <p className="text-gray-600">
              High-quality materials and printing for long-lasting products
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
            <p className="text-gray-600">
              Simple online ordering with secure payment options
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Quick and reliable delivery across Nepal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchSection;
