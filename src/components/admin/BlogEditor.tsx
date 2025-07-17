
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Image as ImageIcon,
  Save, 
  Eye,
  FilePlus,
  FileCheck,
  Calendar,
  User,
  Tag,
  AlignLeft,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Sample blog posts data for demo
const initialBlogPosts = [
  {
    id: 1,
    title: "10 Effective Study Techniques for Better Retention",
    excerpt: "Discover scientifically-proven study methods that can help you remember information longer and perform better in exams.",
    content: "Learning how to study effectively is crucial for academic success. This article explores evidence-based study techniques including spaced repetition, active recall, the Pomodoro technique, and mind mapping. We'll dive into the science behind each method and provide practical tips for implementation.",
    author: "Dr. Ananya Sharma",
    date: "May 15, 2023",
    category: "Study Tips",
    tags: ["study methods", "memory", "exam preparation"],
    image: "/placeholder.svg",
    status: "published",
    featured: true,
    readTime: "7 min read"
  },
  {
    id: 2,
    title: "How to Prepare for Competitive Exams While in School",
    excerpt: "Balance your school studies with competitive exam preparation using these time-management and productivity strategies.",
    content: "Preparing for competitive exams alongside regular schoolwork can be challenging. This comprehensive guide provides practical strategies for time management, creating effective study schedules, prioritizing topics, and maintaining mental health during intensive preparation periods.",
    author: "Rajat Verma",
    date: "Jun 2, 2023",
    category: "Exam Preparation",
    tags: ["competitive exams", "time management", "study plan"],
    image: "/placeholder.svg",
    status: "published",
    featured: false,
    readTime: "9 min read"
  },
  {
    id: 3,
    title: "The Ultimate Guide to Choosing Your College Major",
    excerpt: "Confused about which subject to pursue in college? This comprehensive guide will help you make an informed decision.",
    content: "Selecting a college major is one of the most important decisions in a student's academic journey. This guide helps you evaluate your interests, strengths, career goals, and market demand to make an informed choice. We also discuss common myths about certain majors and provide resources for further exploration.",
    author: "Priya Malhotra",
    date: "Apr 12, 2023",
    category: "Career Guidance",
    tags: ["college", "career planning", "majors"],
    image: "/placeholder.svg",
    status: "draft",
    featured: false,
    readTime: "8 min read"
  }
];

// Available categories and tags for selection
const availableCategories = [
  "Study Tips", "Exam Preparation", "Career Guidance", "Technology", 
  "Academic Research", "Student Life", "Higher Education", "Learning Resources"
];

const availableTags = [
  "study methods", "memory", "exam preparation", "competitive exams", 
  "time management", "study plan", "college", "career planning", 
  "majors", "technology", "learning tools", "productivity", 
  "motivation", "research skills", "academic writing"
];

const BlogEditor = () => {
  const [posts, setPosts] = useState(initialBlogPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // New post template
  const newPostTemplate = {
    id: 0,
    title: "",
    excerpt: "",
    content: "",
    author: "Admin User",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    category: "",
    tags: [],
    image: "/placeholder.svg",
    status: "draft",
    featured: false,
    readTime: "0 min read"
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleAddNewPost = () => {
    setSelectedPost({...newPostTemplate, id: Math.max(0, ...posts.map(post => post.id)) + 1});
    setEditMode(true);
    setIsDialogOpen(true);
    setIsPreviewMode(false);
    setSelectedTags([]);
    setSelectedCategory('');
  };

  const handleEditPost = (post: any) => {
    setSelectedPost({...post});
    setEditMode(true);
    setIsDialogOpen(true);
    setIsPreviewMode(false);
    setSelectedTags(post.tags);
    setSelectedCategory(post.category);
  };

  const handleViewPost = (post: any) => {
    setSelectedPost({...post});
    setEditMode(false);
    setIsDialogOpen(true);
    setIsPreviewMode(true);
    setSelectedTags(post.tags);
    setSelectedCategory(post.category);
  };

  const handleDeletePost = (id: number) => {
    setPosts(posts.filter(post => post.id !== id));
    toast('Post deleted successfully');
  };

  const handleSavePost = () => {
    if (!selectedPost.title || !selectedPost.excerpt || !selectedPost.content) {
      toast('Please fill in all required fields');
      return;
    }

    // Update read time based on content length
    const updatedPost = {
      ...selectedPost,
      readTime: calculateReadTime(selectedPost.content),
      tags: selectedTags,
      category: selectedCategory
    };

    if (posts.some(post => post.id === selectedPost.id)) {
      // Update existing post
      setPosts(posts.map(post => post.id === selectedPost.id ? updatedPost : post));
      toast('Post updated successfully');
    } else {
      // Add new post
      setPosts([...posts, updatedPost]);
      toast('New post created successfully');
    }

    setIsDialogOpen(false);
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handlePublishPost = (id: number) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, status: post.status === 'published' ? 'draft' : 'published' } : post
    ));
    toast(`Post ${posts.find(p => p.id === id)?.status === 'published' ? 'unpublished' : 'published'} successfully`);
  };

  const handleToggleFeatured = (id: number) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, featured: !post.featured } : post
    ));
    toast(`Post ${posts.find(p => p.id === id)?.featured ? 'removed from' : 'marked as'} featured`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedPost({
      ...selectedPost,
      [name]: value
    });
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'published' && post.status === 'published') ||
      (activeTab === 'drafts' && post.status === 'draft') ||
      (activeTab === 'featured' && post.featured);
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Input
              type="search"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <Button onClick={handleAddNewPost} className="gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Card key={post.id} className="overflow-hidden transition-all hover:shadow-md">
              <div 
                className="h-40 overflow-hidden relative cursor-pointer" 
                onClick={() => handleViewPost(post)}
              >
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Badge 
                    className={
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }
                  >
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                  {post.featured && (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{post.category}</Badge>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                <CardTitle 
                  className="line-clamp-2 hover:text-primary cursor-pointer"
                  onClick={() => handleViewPost(post)}
                >
                  {post.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${post.author.replace(/\s+/g, '+')}&background=random`} alt={post.author} />
                      <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-xs font-medium">{post.author}</p>
                      <p className="text-xs text-gray-500">{post.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleViewPost(post)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditPost(post)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeletePost(post.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <FilePlus className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-center max-w-md mb-4">
              {searchQuery 
                ? `No posts match your search "${searchQuery}". Try different keywords.` 
                : "Start creating your first blog post by clicking the 'New Post' button."}
            </p>
            <Button onClick={handleAddNewPost}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </Button>
          </div>
        )}
      </div>
      
      {/* Post Editor/Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? (selectedPost?.id ? 'Edit Post' : 'Create New Post') : 'View Post'}
            </DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Make changes to your blog post and hit save when you\'re done.' 
                : 'Preview how your post will look to readers.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={selectedPost?.title || ''}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Enter a compelling title..."
                  />
                </div>
                
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
                    Excerpt <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={selectedPost?.excerpt || ''}
                    onChange={handleInputChange}
                    className="w-full"
                    rows={2}
                    placeholder="Write a brief summary (1-2 sentences)..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border dark:bg-gray-800"
                    >
                      <option value="">Select a category</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedPost?.status === 'draft' ? 'default' : 'outline'}
                        onClick={() => setSelectedPost({...selectedPost, status: 'draft'})}
                      >
                        Draft
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedPost?.status === 'published' ? 'default' : 'outline'}
                        onClick={() => setSelectedPost({...selectedPost, status: 'published'})}
                      >
                        Published
                      </Button>
                      <div className="flex items-center gap-2 ml-4">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={selectedPost?.featured || false}
                          onChange={() => setSelectedPost({...selectedPost, featured: !selectedPost?.featured})}
                          className="rounded"
                        />
                        <label htmlFor="featured" className="text-sm">
                          Featured post
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && <Check className="ml-1 h-3 w-3" />}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="image" className="block text-sm font-medium mb-1">
                    Featured Image
                  </label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Drag and drop an image, or click to browse
                    </p>
                    <input type="file" className="hidden" />
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose Image
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <Tabs defaultValue="write">
                      <TabsList className="mb-2">
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="write">
                        <Textarea
                          id="content"
                          name="content"
                          value={selectedPost?.content || ''}
                          onChange={handleInputChange}
                          className="w-full min-h-[300px]"
                          placeholder="Write your blog post content here..."
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="border rounded-md p-4 min-h-[300px] prose dark:prose-invert max-w-none">
                          {selectedPost?.content ? (
                            <div>
                              {selectedPost.content.split('\n').map((paragraph: string, idx: number) => (
                                paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Content preview will appear here...</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative h-60 mb-6 overflow-hidden rounded-lg">
                  <img 
                    src={selectedPost?.image || '/placeholder.svg'} 
                    alt={selectedPost?.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {selectedPost?.featured && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Featured
                      </Badge>
                    )}
                    <Badge 
                      className={
                        selectedPost?.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }
                    >
                      {selectedPost?.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <Badge variant="outline">{selectedPost?.category}</Badge>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {selectedPost?.date}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <User className="h-4 w-4 mr-1" />
                    {selectedPost?.author}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {selectedPost?.readTime}
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold mb-2">{selectedPost?.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-8">{selectedPost?.excerpt}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost?.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  {selectedPost?.content.split('\n').map((paragraph: string, idx: number) => (
                    paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePost} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Post
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsPreviewMode(false);
                  setEditMode(true);
                }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Post
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogEditor;
