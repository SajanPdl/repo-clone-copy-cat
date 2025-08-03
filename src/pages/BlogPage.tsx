
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  category: string;
  featured_image?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const BlogPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blog-posts', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return data || [];
    }
  });

  const categories = Array.from(new Set(blogPosts.map(post => post.category)));
  const featuredPosts = blogPosts.slice(0, 3);
  const regularPosts = blogPosts.slice(3);

  const truncateContent = (content: string, maxLength: number = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Education Blog
            </h1>
            <p className="text-gray-600 text-lg">Insights, tips, and stories from the world of education</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {blogPosts.length} articles found
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-8">
            {/* Featured posts skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            {/* Regular posts skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : blogPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="cursor-pointer"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-lg bg-white/80 border-0">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden rounded-t-lg">
                          {post.featured_image ? (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-blue-500" />
                            </div>
                          )}
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500">
                            Featured
                          </Badge>
                        </div>
                        
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{post.category}</Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          <CardTitle className="text-xl line-clamp-2 hover:text-blue-600 transition-colors">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {post.excerpt || truncateContent(post.content)}
                          </p>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{post.author}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="cursor-pointer"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-lg bg-white/80 border-0">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{post.category}</Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 hover:text-blue-600 transition-colors">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {post.excerpt || truncateContent(post.content)}
                          </p>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{post.author}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
