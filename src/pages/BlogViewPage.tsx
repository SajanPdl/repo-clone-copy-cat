import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import Footer from '@/components/Footer';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { fetchBlogPostBySlug } from '@/utils/queryUtils';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  featured_image: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

const BlogViewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyNewStudyMaterial } = useNotificationTrigger();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogPost = async () => {
      if (!slug) {
        setError("Blog post not found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch by slug
        try {
          const post = await fetchBlogPostBySlug(slug);
          if (post) {
            setPost(post);
            setLoading(false);
            return;
          }
        } catch (err) {
          setError("Blog post not found");
        }
        setError("Blog post not found");
      } catch (err) {
        console.error("Error loading blog post:", err);
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };
    loadBlogPost();
  }, [slug]);

  // Show blog welcome notification on first visit
  useEffect(() => {
    if (user && post) {
      const hasVisited = localStorage.getItem(`blog_${slug}_visited`);
      if (!hasVisited) {
        notifyNewStudyMaterial(post.title, 'Blog Article');
        localStorage.setItem(`blog_${slug}_visited`, 'true');
      }
    }
  }, [user, post, slug, notifyNewStudyMaterial]);

  const createSlug = (title: string, id: number) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + id;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog Post Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{error || "The blog post you're looking for doesn't exist or has been removed."}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Button>
        </div>
        
        <article className="max-w-4xl mx-auto">
          {post.featured_image && (
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}
          
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              <Tag className="h-3 w-3 mr-1" />
              {post.category}
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
            
            {post.excerpt && (
              <p className="text-lg text-gray-600 dark:text-gray-300 italic mb-8">
                {post.excerpt}
              </p>
            )}
          </div>
          
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogViewPage;
