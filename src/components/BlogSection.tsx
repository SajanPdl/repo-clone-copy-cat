import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import ContentPagination from './common/ContentPagination';

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "10 Effective Study Techniques for Better Retention",
    excerpt: "Discover scientifically-proven study methods that can help you remember information longer and perform better in exams.",
    author: "Dr. Ananya Sharma",
    date: "May 15, 2023",
    category: "Study Tips",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "How to Prepare for Competitive Exams While in School",
    excerpt: "Balance your school studies with competitive exam preparation using these time-management and productivity strategies.",
    author: "Rajat Verma",
    date: "Jun 2, 2023",
    category: "Exam Preparation",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "The Ultimate Guide to Choosing Your College Major",
    excerpt: "Confused about which subject to pursue in college? This comprehensive guide will help you make an informed decision.",
    author: "Priya Malhotra",
    date: "Apr 12, 2023",
    category: "Career Guidance",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Digital Tools Every Student Should Use in 2023",
    excerpt: "Enhance your productivity and learning with these cutting-edge digital tools and applications designed for students.",
    author: "Vikram Aditya",
    date: "Jul 8, 2023",
    category: "Technology",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "How to Create the Perfect Study Environment",
    excerpt: "Learn how to set up a study space that maximizes your focus and productivity for better academic performance.",
    author: "Neha Singh",
    date: "Mar 20, 2023",
    category: "Study Tips",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Understanding Mental Health During Exam Season",
    excerpt: "Important tips for maintaining good mental health and managing stress during intensive study periods and exams.",
    author: "Dr. Amit Joshi",
    date: "Aug 15, 2023",
    category: "Wellness",
    image: "/placeholder.svg",
  },
];

const BlogSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  // Calculate pagination
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);
  const paginatedPosts = blogPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleReadMore = (postId: number, postTitle: string) => {
    toast({
      title: "Opening Article",
      description: `Loading "${postTitle}"...`,
    });
    // Navigate to blog post detail page (you would implement this route)
    // navigate(`/blog/${postId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Educational Blog</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest educational insights, study tips, and academic guidance from our expert contributors.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {paginatedPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="aspect-video bg-gradient-to-r from-edu-purple/20 to-edu-blue/20 relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {post.category}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-edu-purple transition-colors">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => handleReadMore(post.id, post.title)}
                    className="group/button p-0 h-auto text-edu-purple hover:text-edu-blue transition-colors"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1 group-hover/button:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mb-8">
              <ContentPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          <div className="text-center">
            <Link to="/blog">
              <Button className="btn-gradient">
                View All Articles
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;