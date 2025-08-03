
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, User, Clock, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
}

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for blog posts
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Effective Study Techniques for Better Academic Performance',
      excerpt: 'Discover proven study methods that can help you improve your grades and retain information better.',
      content: 'Full blog post content would go here...',
      author: 'Dr. Sarah Johnson',
      publishedAt: '2024-01-15',
      readTime: 8,
      category: 'Study Tips',
      tags: ['study', 'education', 'productivity'],
      image: 'https://placehold.co/800x400/f5f5f5/6A26A9?text=Study+Techniques',
      featured: true
    },
    {
      id: '2',
      title: 'Preparing for Competitive Exams: A Complete Guide',
      excerpt: 'Everything you need to know about preparing for competitive exams in Nepal.',
      content: 'Full blog post content would go here...',
      author: 'Prof. Ram Sharma',
      publishedAt: '2024-01-10',
      readTime: 12,
      category: 'Exam Preparation',
      tags: ['exams', 'preparation', 'tips'],
      image: 'https://placehold.co/800x400/f5f5f5/6A26A9?text=Competitive+Exams',
      featured: false
    },
    {
      id: '3',
      title: 'Career Opportunities After +2 in Nepal',
      excerpt: 'Explore various career paths and educational opportunities available after completing +2.',
      content: 'Full blog post content would go here...',
      author: 'Maya Patel',
      publishedAt: '2024-01-05',
      readTime: 10,
      category: 'Career Guidance',
      tags: ['career', 'guidance', 'education'],
      image: 'https://placehold.co/800x400/f5f5f5/6A26A9?text=Career+Opportunities',
      featured: true
    },
    {
      id: '4',
      title: 'The Importance of Mental Health for Students',
      excerpt: 'Understanding and maintaining good mental health during your academic journey.',
      content: 'Full blog post content would go here...',
      author: 'Dr. Lisa Chen',
      publishedAt: '2024-01-01',
      readTime: 6,
      category: 'Wellness',
      tags: ['mental health', 'wellness', 'students'],
      image: 'https://placehold.co/800x400/f5f5f5/6A26A9?text=Mental+Health',
      featured: false
    }
  ];

  const { data: posts = mockPosts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      return mockPosts;
    }
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Study Tips': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Exam Preparation': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Career Guidance': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Wellness': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            MeroAcademy Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Educational insights, study tips, and career guidance to help you succeed
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search articles..."
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
              <SelectItem value="Study Tips">Study Tips</SelectItem>
              <SelectItem value="Exam Preparation">Exam Preparation</SelectItem>
              <SelectItem value="Career Guidance">Career Guidance</SelectItem>
              <SelectItem value="Wellness">Wellness</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {/* Featured posts skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-t"
                        />
                        <Badge className="absolute top-2 left-2 bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      </div>
                      
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getCategoryColor(post.category)}>
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {post.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {post.readTime} min read
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button>Read More</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Latest Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-40 object-cover rounded-t"
                      />
                      
                      <CardHeader>
                        <Badge className={getCategoryColor(post.category)} style={{ width: 'fit-content' }}>
                          {post.category}
                        </Badge>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {post.author}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {post.readTime} min
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <Button size="sm" variant="outline" className="w-full">
                          Read Article
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {filteredPosts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Search className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No articles found
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

export default BlogPage;
