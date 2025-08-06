
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MerchItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_active: boolean;
  stock_quantity: number;
}

const MerchSection = () => {
  const { toast } = useToast();
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchItems();
  }, []);

  const fetchMerchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('merch_store')
        .select('*')
        .eq('is_active', true)
        .limit(6)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMerchItems(data || []);
    } catch (error) {
      console.error('Error fetching merch items:', error);
      // Fallback to demo data if fetch fails
      setMerchItems([
        {
          id: '1',
          name: 'EduHub Nepal T-Shirt',
          description: 'Premium quality cotton t-shirt with EduHub Nepal logo',
          price: 899,
          image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dCUyMHNoaXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          category: 'Clothing',
          is_active: true,
          stock_quantity: 50
        },
        {
          id: '2',
          name: 'Study Planner',
          description: 'Weekly study planner to organize your academic goals',
          price: 299,
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbm5lcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          category: 'Stationery',
          is_active: true,
          stock_quantity: 100
        },
        {
          id: '3',
          name: 'EduHub Mug',
          description: 'Perfect companion for your study sessions',
          price: 599,
          image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVnfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          category: 'Accessories',
          is_active: true,
          stock_quantity: 30
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MerchItem) => {
    toast({
      title: 'Added to Cart',
      description: `${item.name} has been added to your cart`
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading merchandise...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            EduHub Merchandise
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Show your EduHub pride with our exclusive merchandise collection. 
            Quality products designed for students by students.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Easy Ordering</h3>
            <p className="text-gray-600 text-sm">Simple and secure online ordering process</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600 text-sm">Premium quality materials and printing</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">Quick delivery across Nepal</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {merchItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold">Rs. {item.price}</span>
                  <span className="text-sm text-gray-500">
                    {item.stock_quantity} in stock
                  </span>
                </div>
                <Button 
                  onClick={() => handleAddToCart(item)} 
                  className="w-full"
                  disabled={item.stock_quantity === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {item.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="px-8">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MerchSection;
