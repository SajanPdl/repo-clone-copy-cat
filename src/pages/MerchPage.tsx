
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Star, Search, Filter, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';

interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'clothing' | 'accessories' | 'stationery' | 'tech';
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
}

const MerchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Mock data for merchandise
  const mockMerch: MerchItem[] = [
    {
      id: '1',
      name: 'MeroAcademy T-Shirt',
      description: 'Premium quality cotton t-shirt with MeroAcademy logo',
      price: 1500,
      originalPrice: 2000,
      category: 'clothing',
      image: 'https://placehold.co/300x300/f5f5f5/6A26A9?text=T-Shirt',
      rating: 4.5,
      reviews: 24,
      inStock: true,
      featured: true
    },
    {
      id: '2',
      name: 'Study Notebook Set',
      description: 'Set of 3 premium notebooks for all your study needs',
      price: 800,
      category: 'stationery',
      image: 'https://placehold.co/300x300/f5f5f5/6A26A9?text=Notebooks',
      rating: 4.8,
      reviews: 15,
      inStock: true,
      featured: true
    },
    {
      id: '3',
      name: 'MeroAcademy Hoodie',
      description: 'Comfortable hoodie perfect for study sessions',
      price: 3500,
      originalPrice: 4000,
      category: 'clothing',
      image: 'https://placehold.co/300x300/f5f5f5/6A26A9?text=Hoodie',
      rating: 4.7,
      reviews: 31,
      inStock: true,
      featured: false
    },
    {
      id: '4',
      name: 'Smart Study Lamp',
      description: 'LED study lamp with adjustable brightness and USB charging',
      price: 2500,
      category: 'tech',
      image: 'https://placehold.co/300x300/f5f5f5/6A26A9?text=Study+Lamp',
      rating: 4.3,
      reviews: 18,
      inStock: false,
      featured: false
    },
    {
      id: '5',
      name: 'Academy Water Bottle',
      description: 'Eco-friendly water bottle to stay hydrated while studying',
      price: 1200,
      category: 'accessories',
      image: 'https://placehold.co/300x300/f5f5f5/6A26A9?text=Water+Bottle',
      rating: 4.6,
      reviews: 12,
      inStock: true,
      featured: true
    }
  ];

  const { data: merchItems = mockMerch, isLoading } = useQuery({
    queryKey: ['merch'],
    queryFn: async () => {
      return mockMerch;
    }
  });

  const filteredItems = merchItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      default: return 0;
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clothing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'accessories': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'stationery': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'tech': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            MeroAcademy Store
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get official MeroAcademy merchandise and study essentials
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="stationery">Stationery</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t"
                  />
                  {item.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                  
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        {item.rating} ({item.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Rs. {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          Rs. {item.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      disabled={!item.inStock}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sortedItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <ShoppingBag className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or browse different categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchPage;
