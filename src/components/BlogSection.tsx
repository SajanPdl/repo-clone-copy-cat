
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  featured_image: string;
  created_at: string;
}

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
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

      if (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback to dummy data if database fetch fails
        setPosts([
          {
            id: 1,
            title: "Effective Study Techniques for Better Learning",
            excerpt: "Discover proven study methods that can help you retain information better and improve your academic performance.",
            author: "Dr. Sarah Johnson",
            category: "Study Tips",
            featured_image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop",
            content: "",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Digital Note-Taking: Tools and Strategies",
            excerpt: "Explore the best digital tools for note-taking and learn strategies to organize your study materials effectively.",
            author: "Mark Thompson",
            category: "Technology",
            featured_image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop",
            content: "",
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "Preparing for Competitive Exams: A Complete Guide",
            excerpt: "A comprehensive guide to help you prepare for competitive exams with confidence and achieve your goals.",
            author: "Priya Sharma",
            category: "Exam Prep",
            featured_image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&h=300&fit=crop",
            content: "",
            created_at: new Date().toISOString()
          }
        ]);
        return;
      }

      if (data && data.length > 0) {
        setPosts(data);
      } else {
        // Use fallback data if no posts in database
        setPosts([
          {
            id: 1,
            title: "Welcome to EduSanskriti Blog",
            excerpt: "Stay updated with the latest educational insights, study tips, and academic resources.",
            author: "EduSanskriti Team",
            category: "Announcements",
            featured_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop",
            content: "Welcome to our educational platform!",
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Convert to Nepali time (UTC+5:45)
    const nepaliTime = new Date(date.getTime() + (5 * 60 + 45) * 60 * 1000);
    return nepaliTime.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest educational insights, study tips, and academic resources.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest educational insights, study tips, and academic resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => (
            <Card key={post.id} className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <Link to={`/blog/post/${post.id}`} className="block h-full">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={post.featured_image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop"} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop";
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link to="/blog" className="inline-flex items-center gap-2">
              View All Posts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
