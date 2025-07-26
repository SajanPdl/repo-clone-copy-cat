
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  featured_image: string;
  created_at: string;
  is_published: boolean;
}

const BlogSection = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (postId: number) => {
    navigate(`/blog/${postId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading blog posts...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with educational insights, study tips, and academic resources
          </p>
        </div>

        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogPosts.map((post) => (
              <Card 
                key={post.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleCardClick(post.id)}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="text-blue-600 text-4xl font-bold">
                      {post.title.charAt(0)}
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
                  </Badge>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
                    <span>Read More</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available at the moment.</p>
          </div>
        )}

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/blog')}
          >
            View All Posts
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
