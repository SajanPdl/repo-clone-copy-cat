
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { Calendar, User, Tag, ArrowRight, Clock } from 'lucide-react';

// Mock data for blog posts
const initialPosts = [
  {
    id: 1,
    title: "10 Effective Study Techniques for Better Exam Results",
    excerpt: "Discover research-backed study techniques that can help you retain information better and improve your exam performance.",
    author: "Dr. Ananya Singh",
    date: "June 15, 2023",
    readTime: "8 min read",
    category: "Study Tips",
    tags: ["Exam Preparation", "Study Techniques", "Memory"],
    thumbnailUrl: "/placeholder.svg",
    featured: true
  },
  {
    id: 2,
    title: "How to Prepare for Engineering Entrance Exams",
    excerpt: "A comprehensive guide for students preparing for engineering entrance examinations with tips from toppers.",
    author: "Prof. Rajiv Kumar",
    date: "May 23, 2023",
    readTime: "12 min read",
    category: "Career Guidance",
    tags: ["Engineering", "Entrance Exams", "JEE"],
    thumbnailUrl: "/placeholder.svg",
    featured: false
  },
  {
    id: 3,
    title: "The Science of Memory: How to Remember What You Study",
    excerpt: "Learn about the cognitive science behind memory and practical techniques to improve your ability to retain information.",
    author: "Dr. Meera Patel",
    date: "April 10, 2023",
    readTime: "10 min read",
    category: "Learning Science",
    tags: ["Memory", "Cognitive Science", "Learning Techniques"],
    thumbnailUrl: "/placeholder.svg",
    featured: false
  },
  {
    id: 4,
    title: "Choosing the Right Career Path After High School",
    excerpt: "Guidance on making informed decisions about your future career based on your interests, aptitude, and market demand.",
    author: "Sarah Johnson",
    date: "March 28, 2023",
    readTime: "7 min read",
    category: "Career Guidance",
    tags: ["Career Planning", "Higher Education", "Decision Making"],
    thumbnailUrl: "/placeholder.svg",
    featured: false
  },
  {
    id: 5,
    title: "Digital Tools for Modern Students: Apps That Boost Productivity",
    excerpt: "Review of the best digital tools and applications that can help students organize their studies and boost productivity.",
    author: "Rohan Mehta",
    date: "February 15, 2023",
    readTime: "6 min read",
    category: "Technology",
    tags: ["Apps", "Productivity", "Digital Learning"],
    thumbnailUrl: "/placeholder.svg",
    featured: false
  },
  {
    id: 6,
    title: "The Importance of Mental Health for Academic Success",
    excerpt: "Understanding the connection between mental wellbeing and academic performance, with strategies for maintaining balance.",
    author: "Dr. Lisa Chen",
    date: "January 20, 2023",
    readTime: "9 min read",
    category: "Wellbeing",
    tags: ["Mental Health", "Stress Management", "Academic Performance"],
    thumbnailUrl: "/placeholder.svg",
    featured: false
  }
];

const categories = [
  "All Categories", "Study Tips", "Career Guidance", "Learning Science", 
  "Technology", "Wellbeing", "Exam Strategies", "Student Life"
];

const BlogPage = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  
  const featuredPost = posts.find(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  const filterPosts = () => {
    return initialPosts.filter(post => {
      const matchesCategory = selectedCategory === 'All Categories' ? true : post.category === selectedCategory;
      const matchesSearch = searchQuery 
        ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesCategory && matchesSearch;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = filterPosts();
    setPosts(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    
    if (category === 'All Categories') {
      setPosts(initialPosts);
    } else {
      setPosts(initialPosts.filter(post => post.category === category));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-edu-lightgray to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 gradient-text">Educational Blog</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Explore insightful articles on exam preparation, study techniques, career guidance, and educational trends to help you excel in your academic journey.
          </p>
          
          <form onSubmit={handleSearch} className="mb-10">
            <SearchBar 
              placeholder="Search articles..." 
              className="max-w-3xl mx-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-edu-purple text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {featuredPost && (
            <div className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gray-200 dark:bg-gray-700">
                  <img 
                    src={featuredPost.thumbnailUrl} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-8 md:w-1/2">
                  <div className="flex items-center mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-edu-purple/10 text-edu-purple">
                      Featured
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-edu-blue/10 text-edu-blue ml-2">
                      {featuredPost.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <User className="h-4 w-4 mr-1" />
                    <span>{featuredPost.author}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{featuredPost.date}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  
                  <button className="flex items-center text-edu-purple hover:text-edu-indigo transition-colors">
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map(post => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img 
                  src={post.thumbnailUrl} 
                  alt={post.title} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-edu-blue/10 text-edu-blue">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{post.author}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <button className="flex items-center text-edu-purple hover:text-edu-indigo transition-colors">
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPage;
