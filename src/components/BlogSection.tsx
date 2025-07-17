
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
    excerpt: "Learn how to set up a study space that boosts focus and productivity, from lighting to organization.",
    author: "Neha Singh",
    date: "Aug 3, 2023",
    category: "Study Tips",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "The Science Behind Effective Learning",
    excerpt: "Understand the cognitive processes that impact learning and how to optimize your study habits accordingly.",
    author: "Dr. Rohit Kapoor",
    date: "Sep 5, 2023",
    category: "Education",
    image: "/placeholder.svg",
  },
  {
    id: 7,
    title: "Tips for Tackling Math Anxiety",
    excerpt: "Practical strategies to overcome fear of mathematics and build confidence in solving complex problems.",
    author: "Aditya Ranjan",
    date: "Oct 18, 2023",
    category: "Mathematics",
    image: "/placeholder.svg",
  },
  {
    id: 8,
    title: "Understanding the New NEP 2020 Framework",
    excerpt: "A comprehensive breakdown of Nepal's National Education Policy and how it will impact students and teachers.",
    author: "Prof. Nisha Adhikari",
    date: "Nov 22, 2023",
    category: "Education Policy",
    image: "/placeholder.svg",
  },
];

const BlogSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const postsPerPage = 4;
  
  // Filter posts by category if selected
  const filteredPosts = selectedCategory 
    ? blogPosts.filter(post => post.category === selectedCategory) 
    : blogPosts;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage, 
    currentPage * postsPerPage
  );
  
  // Get unique categories for filter
  const categories = [...new Set(blogPosts.map(post => post.category))];
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (postId: number) => {
    navigate(`/blog/${postId}`);
  };

  const handleViewAllClick = () => {
    toast({
      title: "Blog Section",
      description: "Navigating to all articles page",
    });
    navigate("/blog");
  };
  
  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Educational Articles & Tips</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest educational insights, study techniques, and career guidance through our informative articles.
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            size="sm"
            onClick={() => handleCategoryFilter(null)}
          >
            All Categories
          </Button>
          
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedPosts.map(post => (
            <Card 
              key={post.id} 
              className="overflow-hidden group hover:shadow-neon transition-all duration-300 h-full cursor-pointer"
              onClick={() => handleCardClick(post.id)}
            >
              <div className="block h-full">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-edu-purple/90 text-white">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl group-hover:text-edu-purple transition-colors duration-300">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 pt-0">
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardContent>
                
                <CardFooter className="p-6 pt-0 mt-auto">
                  <div className="inline-flex items-center text-edu-purple hover:text-edu-indigo font-medium transition-colors duration-300">
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredPosts.length > postsPerPage && (
          <ContentPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredPosts.length}
            itemsPerPage={postsPerPage}
          />
        )}
        
        <div className="text-center mt-12">
          <Button 
            className="btn-primary" 
            onClick={handleViewAllClick}
          >
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
