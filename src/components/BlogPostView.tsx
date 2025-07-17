import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Sample blog data - in a real app would come from an API
const blogPosts = [
  {
    id: 1,
    title: "10 Effective Study Techniques for Better Retention",
    excerpt: "Discover scientifically-proven study methods that can help you remember information longer and perform better in exams.",
    content: `
      Effective studying is not just about putting in the hours but about making those hours count. Here are ten evidence-based techniques that can improve your study efficiency and information retention.
      
      ## 1. Spaced Repetition
      
      Instead of cramming all your study into one session, space it out over time. Research shows that distributing your study time over multiple, shorter sessions improves long-term retention compared to one marathon session.
      
      ## 2. Active Recall
      
      Rather than passively re-reading your notes, actively test yourself on the material. Close your book and try to recall as much information as possible. This retrieval practice strengthens memory pathways in your brain.
      
      ## 3. The Pomodoro Technique
      
      Study in focused bursts of 25 minutes, followed by a 5-minute break. After completing four "pomodoros," take a longer break of 15-30 minutes. This technique helps maintain high concentration and prevents burnout.
      
      ## 4. Mind Mapping
      
      Create visual representations of information with the main concept in the center and related ideas branching out. This technique helps organize knowledge and see connections between different concepts.
      
      ## 5. Teaching Others
      
      Explaining concepts to others forces you to understand the material thoroughly and identify gaps in your knowledge. If you don't have someone to teach, pretend you're teaching an imaginary student.
      
      ## 6. Interleaved Practice
      
      Instead of focusing on one topic at a time (blocked practice), mix up different but related topics within a single study session. This approach improves your ability to discriminate between problems and select the appropriate strategy.
      
      ## 7. Elaborative Interrogation
      
      Ask yourself "why" questions as you study. Why does this fact make sense? Why is this true? This technique encourages you to think deeply about the material rather than memorizing it superficially.
      
      ## 8. Concrete Examples
      
      Connect abstract concepts to concrete, specific examples. This makes the information more meaningful and easier to remember.
      
      ## 9. Dual Coding
      
      Combine verbal and visual information. Drawing diagrams, creating charts, or visualizing processes while verbalizing them engages multiple neural pathways and strengthens memory.
      
      ## 10. Reflection
      
      At the end of each study session, take a few minutes to reflect on what you learned, how it connects to what you already know, and what questions you still have. This metacognitive practice enhances understanding and retention.
      
      Remember, the best study technique is the one that works for you. Experiment with these methods and adapt them to your learning style and the specific subject matter you're studying.
    `,
    author: "Dr. Ananya Sharma",
    authorBio: "Dr. Ananya Sharma is an educational psychologist specializing in cognitive learning strategies and memory enhancement techniques. She has published numerous research papers on effective study methodologies.",
    date: "May 15, 2023",
    readTime: "7 min read",
    category: "Study Tips",
    tags: ["memory techniques", "study methods", "productivity", "learning science"],
    image: "/placeholder.svg",
    views: 3240,
    likes: 187,
    comments: 42,
    relatedPosts: [2, 4]
  },
  {
    id: 2,
    title: "How to Prepare for Competitive Exams While in School",
    excerpt: "Balance your school studies with competitive exam preparation using these time-management and productivity strategies.",
    content: `
      Balancing school academics with competitive exam preparation can be challenging but highly rewarding with the right approach. This guide provides practical strategies to help you excel in both areas without burning out.
      
      ## Create a Realistic Schedule
      
      The foundation of successful parallel preparation is effective time management. Create a weekly schedule that allocates time for:
      - Regular school subjects
      - Competitive exam topics
      - Revision sessions
      - Practice tests
      - Breaks and leisure activities
      
      Be realistic about how much you can accomplish each day. Quality of study is more important than quantity.
      
      ## Identify Overlapping Topics
      
      Many topics in your school curriculum overlap with competitive exam syllabi. Identify these overlaps and study them simultaneously to save time. For example, if you're preparing for JEE or NEET, topics like:
      - Basic physics principles
      - Chemical reactions
      - Algebraic concepts
      
      Often appear in both school exams and competitive tests, though possibly at different difficulty levels.
      
      ## Prioritize Fundamentals
      
      Strong fundamentals are crucial for both school exams and competitive tests. Focus on building a solid foundation in core concepts before moving to advanced topics. This approach will serve you well in both arenas.
      
      ## Use the Right Resources
      
      Be selective about your study materials. Recommended resources include:
      - NCERT books for building fundamentals
      - Subject-specific reference books for in-depth understanding
      - Previous years' question papers for practice
      - Online video lectures for difficult concepts
      
      ## Develop Effective Note-Taking Habits
      
      Create concise, well-organized notes that combine school and competitive exam materials. These will be invaluable during revision periods. Use techniques like:
      - Mind maps for connecting concepts
      - Flashcards for formulas and definitions
      - Summary sheets for quick revision
      
      ## Practice Regularly with Tests
      
      Take regular practice tests under timed conditions to:
      - Build exam temperament
      - Identify weak areas
      - Improve time management during exams
      - Get familiar with different question patterns
      
      ## Maintain Your Health
      
      Physical and mental well-being are essential for effective studying. Ensure you:
      - Get adequate sleep (7-8 hours daily)
      - Eat nutritious meals
      - Exercise regularly
      - Take short breaks during study sessions
      
      ## Seek Guidance When Needed
      
      Don't hesitate to seek help from teachers, mentors, or peers when you're stuck on concepts. Joining a study group can also provide motivation and alternative perspectives on difficult topics.
      
      ## Stay Motivated
      
      Maintaining motivation through this challenging period is crucial. Keep your goals visible, celebrate small achievements, and remember why you started this journey.
      
      With careful planning, strategic studying, and consistent effort, you can successfully balance school academics with competitive exam preparation and achieve excellent results in both.
    `,
    author: "Rajat Verma",
    authorBio: "Rajat Verma is an education consultant with expertise in competitive exam preparation. A former IIT-JEE topper, he has been helping students prepare for various competitive exams for over 10 years.",
    date: "Jun 2, 2023",
    readTime: "9 min read",
    category: "Exam Preparation",
    tags: ["competitive exams", "time management", "study plan", "school academics"],
    image: "/placeholder.svg",
    views: 4567,
    likes: 251,
    comments: 64,
    relatedPosts: [1, 3]
  },
  {
    id: 3,
    title: "The Ultimate Guide to Choosing Your College Major",
    excerpt: "Confused about which subject to pursue in college? This comprehensive guide will help you make an informed decision.",
    content: `
      Choosing a college major is one of the most significant decisions you'll make in your academic journey. While it doesn't necessarily define your entire career path, it does influence your initial job prospects, graduate school options, and the knowledge base you'll develop. This guide aims to help you navigate this important decision with clarity.
      
      ## Self-Assessment: Know Yourself First
      
      Before exploring specific majors, take time for honest self-reflection:
      
      ### Interests and Passions
      - What subjects do you genuinely enjoy studying?
      - Which topics make you lose track of time when exploring them?
      - What issues or fields do you naturally read about or discuss with others?
      
      ### Strengths and Aptitudes
      - Which subjects have you consistently performed well in?
      - What skills come naturally to you? (analytical thinking, creative expression, problem-solving, communication, etc.)
      - What do others say you're good at?
      
      ### Values and Goals
      - What's important to you in a future career? (helping others, financial security, work-life balance, creativity, prestige, etc.)
      - Where do you see yourself in 10 years?
      - What kind of impact do you want to make through your work?
      
      ## Research Potential Majors
      
      Once you have some direction from your self-assessment, dive deeper into specific majors:
      
      ### Understand the Curriculum
      - What courses will you take?
      - What skills will you develop?
      - How rigorous is the program?
      
      ### Career Opportunities
      - What careers typically stem from this major?
      - What's the job outlook and salary potential?
      - Will graduate school be necessary for your desired career path?
      
      ### Talk to People in the Field
      - Connect with current students in the program
      - Speak with professors
      - Interview professionals who studied this major
      
      ## Practical Considerations
      
      While passion is important, also consider these practical factors:
      
      ### Program Availability and Quality
      - Does your chosen university offer this major?
      - Is the program well-regarded?
      - What resources and opportunities (internships, research, etc.) are available?
      
      ### Financial Implications
      - What's the return on investment for this degree?
      - Are there scholarship opportunities specific to this field?
      - Will you need additional certifications or advanced degrees?
      
      ### Personal Circumstances
      - How does this major align with your personal constraints or opportunities?
      - Will you be able to balance this program with other commitments?
      
      ## Common Myths to Avoid
      
      ### Myth 1: "Your major determines your entire career path"
      Reality: Many professionals work in fields unrelated to their college major. Skills like critical thinking, communication, and problem-solving are valuable across industries.
      
      ### Myth 2: "You should choose the major that leads to the highest-paying jobs"
      Reality: While earning potential matters, job satisfaction and personal interest significantly impact long-term career success and happiness.
      
      ### Myth 3: "Changing your major is a waste of time"
      Reality: It's better to change directions than to continue in a field that's not right for you. Many students change majors during their college years.
      
      ## Making the Decision
      
      After thorough research and reflection:
      
      1. Narrow down to 2-3 potential majors
      2. Try introductory courses in these areas if possible
      3. Consider a minor or electives to explore secondary interests
      4. Remember that most universities allow you to change majors
      5. Trust yourself and your decision-making process
      
      Choosing a college major is important, but it's also not irreversible. Many successful professionals have changed directions multiple times throughout their careers. Focus on developing transferable skills, pursuing your interests, and remaining open to new possibilities as they arise.
    `,
    author: "Priya Malhotra",
    authorBio: "Priya Malhotra is a career counselor with over 15 years of experience guiding students in higher education decisions. She holds a Master's degree in Educational Psychology and specializes in career development for young adults.",
    date: "Apr 12, 2023",
    readTime: "10 min read",
    category: "Career Guidance",
    tags: ["career planning", "college decisions", "major selection", "education choices"],
    image: "/placeholder.svg",
    views: 3872,
    likes: 198,
    comments: 57,
    relatedPosts: [2, 4]
  },
  {
    id: 4,
    title: "Digital Tools Every Student Should Use in 2023",
    excerpt: "Enhance your productivity and learning with these cutting-edge digital tools and applications designed for students.",
    content: `
      In today's digital age, students have access to countless tools and applications designed to enhance learning, improve productivity, and make academic life more manageable. This article highlights the most valuable digital tools that can transform your educational experience in 2023.
      
      ## Note-Taking and Organization
      
      ### Notion
      An all-in-one workspace that allows you to create notes, databases, kanban boards, wikis, calendars, and more. Perfect for organizing your entire academic life in one place.
      
      **Key features:**
      - Flexible page structure with blocks
      - Templates for class notes, reading lists, project planning
      - Collaboration features for group projects
      - Cross-platform synchronization
      
      ### OneNote
      Microsoft's digital notebook offers a canvas-like approach to note-taking, allowing you to type, write, draw, and clip content from the web.
      
      **Key features:**
      - Organization by notebooks, sections, and pages
      - Handwriting support for tablet users
      - Audio recording during note-taking
      - Seamless integration with other Microsoft tools
      
      ## Study Aids and Learning Tools
      
      ### Anki
      A powerful flashcard app that uses spaced repetition to optimize memorization and retention.
      
      **Key features:**
      - Customizable flashcards with text, images, audio
      - Smart scheduling algorithm
      - Shared decks for common subjects
      - Available offline on multiple platforms
      
      ### Quizlet
      Create study sets, flashcards, games, and quizzes to enhance your learning experience.
      
      **Key features:**
      - Multiple study modes (flashcards, learn, write, test)
      - Interactive games to make studying fun
      - Access to millions of study sets created by other users
      - Audio pronunciation for language learning
      
      ## Research and Writing Tools
      
      ### Zotero
      A free, easy-to-use tool to help you collect, organize, cite, and share research.
      
      **Key features:**
      - Browser extension for saving sources with one click
      - Automatic citation generation in various formats
      - PDF annotation and organization
      - Group libraries for collaborative research
      
      ### Grammarly
      An AI-powered writing assistant that helps you write clear, mistake-free text.
      
      **Key features:**
      - Grammar and spelling correction
      - Style and tone suggestions
      - Plagiarism detector
      - Integration with word processors and browsers
      
      ## Productivity and Time Management
      
      ### Forest
      A unique app that helps you stay focused by gamifying the process of avoiding phone distractions.
      
      **Key features:**
      - Plant virtual trees that grow while you focus
      - Wither if you leave the app to check social media
      - Build a forest representing your productivity
      - Partner with real tree-planting initiatives
      
      ### Todoist
      A powerful task manager that helps you organize and prioritize your academic and personal tasks.
      
      **Key features:**
      - Natural language input for quick task creation
      - Projects, sections, and tags for organization
      - Priority levels and due dates
      - Recurring tasks for regular assignments
      
      ## Collaboration and Communication
      
      ### Slack
      A messaging platform designed for team communication that's perfect for group projects.
      
      **Key features:**
      - Organized conversations in channels
      - Direct messaging and file sharing
      - Integration with Google Drive, Trello, and other tools
      - Audio and video calls
      
      ### Miro
      An online collaborative whiteboard platform that enables visual collaboration.
      
      **Key features:**
      - Infinite canvas for brainstorming
      - Templates for mind maps, diagrams, and project planning
      - Real-time collaboration
      - Presentation and sharing capabilities
      
      ## Specialized Academic Tools
      
      ### Wolfram Alpha
      A computational knowledge engine that provides answers and solutions to mathematical and scientific questions.
      
      **Key features:**
      - Step-by-step solutions for math problems
      - Data analysis and visualization
      - Information on various topics from chemistry to engineering
      - Natural language query processing
      
      ### Mendeley
      A reference manager and academic social network that helps you organize your research.
      
      **Key features:**
      - PDF reader with annotation tools
      - Citation generator
      - Collaboration with other researchers
      - Suggestion of relevant papers based on your library
      
      ## Getting Started with Digital Tools
      
      To make the most of these digital tools:
      
      1. **Start small** - Don't try to adopt all tools at once. Begin with one or two that address your most pressing needs.
      
      2. **Take advantage of student discounts** - Many premium tools offer free or discounted plans for students.
      
      3. **Invest time in learning** - Watch tutorials and read guides to fully understand the features available.
      
      4. **Integrate your tools** - Look for ways to connect your different tools for a smoother workflow.
      
      5. **Regularly review and adjust** - As your needs change, be willing to try new tools or adjust how you use existing ones.
      
      By thoughtfully incorporating these digital tools into your academic routine, you can enhance your learning experience, improve your productivity, and better prepare yourself for success in both education and your future career.
    `,
    author: "Vikram Aditya",
    authorBio: "Vikram Aditya is a technology educator and digital productivity consultant. With a background in computer science and education technology, he specializes in helping students and educators leverage digital tools for enhanced learning experiences.",
    date: "Jul 8, 2023",
    readTime: "12 min read",
    category: "Technology",
    tags: ["digital tools", "productivity", "student resources", "technology", "apps"],
    image: "/placeholder.svg",
    views: 5124,
    likes: 375,
    comments: 83,
    relatedPosts: [1, 3]
  }
];

interface BlogPostViewProps {
  blogPost?: any; // Optional prop to pass blog post data directly
}

const BlogPostView: React.FC<BlogPostViewProps> = ({ blogPost: passedBlogPost }) => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading from an API
    setLoading(true);
    
    // If a blog post was passed directly, use it
    if (passedBlogPost) {
      setPost(passedBlogPost);
      
      // Get related posts
      const related = blogPosts.filter(p => 
        passedBlogPost.relatedPosts && passedBlogPost.relatedPosts.includes(p.id)
      );
      setRelatedPosts(related);
      
      // Skip the delay if blog post is passed directly
      setLoading(false);
    } else {
      // Find the post with the matching ID
      const postId = parseInt(id || '1');
      const foundPost = blogPosts.find(p => p.id === postId);
      
      if (foundPost) {
        setPost(foundPost);
        
        // Get related posts
        const related = blogPosts.filter(p => 
          foundPost.relatedPosts && foundPost.relatedPosts.includes(p.id)
        );
        setRelatedPosts(related);
        
        // Simulate a delay for the API call
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } else {
        setLoading(false);
      }
    }
  }, [id, passedBlogPost]);

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      toast('Article added to your liked collection');
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      toast('Article saved to your bookmarks');
    } else {
      toast('Article removed from your bookmarks');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 w-3/4 mb-4 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/4 mb-8 rounded"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 mb-8 rounded"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-5/6 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/blog" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to All Articles
            </Link>
          </Button>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-edu-purple/90 text-white">
              {post.category}
            </Badge>
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${post.author.replace(/\s+/g, '+')}&background=random`} />
                <AvatarFallback>{post.author.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{post.author}</p>
                <p className="text-xs">Author</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments} comments</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md mb-8">
              <div className="h-80 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 md:p-8">
                <div className="prose dark:prose-invert max-w-none mb-8">
                  {post.content.split('\n').map((paragraph: string, idx: number) => {
                    if (paragraph.trim().startsWith('## ')) {
                      return <h2 key={idx} className="text-xl font-bold mt-6 mb-4">{paragraph.replace('## ', '')}</h2>
                    } else if (paragraph.trim().startsWith('### ')) {
                      return <h3 key={idx} className="text-lg font-bold mt-4 mb-2">{paragraph.replace('### ', '')}</h3>
                    } else if (paragraph.trim().startsWith('- ')) {
                      return <li key={idx} className="ml-4">{paragraph.replace('- ', '')}</li>
                    } else if (paragraph.trim()) {
                      return <p key={idx} className="mb-4">{paragraph}</p>
                    } else {
                      return <br key={idx} />
                    }
                  })}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLike}
                        className={`flex items-center gap-1 ${liked ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-800' : ''}`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{liked ? post.likes + 1 : post.likes}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBookmark}
                        className={`flex items-center gap-1 ${bookmarked ? 'bg-blue-50 text-blue-500 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}`}
                      >
                        <Bookmark className="h-4 w-4" />
                        <span>{bookmarked ? 'Saved' : 'Save'}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleShare}
                        className="flex items-center gap-1"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blog/${post.id > 1 ? post.id - 1 : blogPosts.length}`} className="flex items-center gap-1">
                          <ChevronLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blog/${post.id < blogPosts.length ? post.id + 1 : 1}`} className="flex items-center gap-1">
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${post.author.replace(/\s+/g, '+')}&background=random&size=64`} />
                    <AvatarFallback className="text-lg">{post.author.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold mb-1">About {post.author}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{post.authorBio}</p>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Comments ({post.comments})</h3>
              
              <div className="space-y-6 mb-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="https://ui-avatars.com/api/?name=Ravi+Kumar&background=random" />
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">Ravi Kumar</h4>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">These techniques have been so helpful for my board exam preparation. I've been using the Pomodoro technique and active recall, and I've noticed a significant improvement in my retention!</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <button className="text-gray-500 hover:text-edu-purple">Reply</button>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="https://ui-avatars.com/api/?name=Sunita+Patel&background=random" />
                    <AvatarFallback>SP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">Sunita Patel</h4>
                      <span className="text-xs text-gray-500">3 days ago</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">I'd love to see more examples of how mind mapping can be applied to specific subjects like biology or history. Great article otherwise!</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <button className="text-gray-500 hover:text-edu-purple">Reply</button>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="font-medium mb-3">Leave a Comment</h4>
                <textarea 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-3 bg-white dark:bg-gray-800"
                  rows={4}
                  placeholder="Share your thoughts on this article..."
                ></textarea>
                <Button>Post Comment</Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedPosts.map(relatedPost => (
                    <div key={relatedPost.id} className="group">
                      <Link to={`/blog/${relatedPost.id}`} className="flex gap-3 group">
                        <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={relatedPost.image} 
                            alt={relatedPost.title} 
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-edu-purple transition-colors">
                            {relatedPost.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{relatedPost.date}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/blog">View All Articles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['study methods', 'exam preparation', 'career planning', 'productivity', 'digital tools', 'memory techniques', 'college decisions'].map(tag => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-edu-purple text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Subscribe to Our Newsletter</h3>
                <p className="text-white/80 text-sm mb-4">Get the latest educational articles and updates delivered to your inbox.</p>
                <input 
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-md px-3 py-2 mb-3 placeholder-white/50 text-white"
                />
                <Button className="w-full bg-white text-edu-purple hover:bg-white/90">
                  Subscribe
                </Button>
              </CardContent>
            </Card>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">Sponsored</h3>
              </div>
              <div className="p-4">
                <a href="#" className="block">
                  <div className="mb-3 rounded overflow-hidden">
                    <img 
                      src="/placeholder.svg" 
                      alt="Advertisement" 
                      className="w-full h-auto"
                    />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Master Mathematics with Our Online Course</h4>
                  <p className="text-xs text-gray-500 mb-2">Learn from India's top educators. Special discount for students!</p>
                  <div className="flex items-center text-xs text-edu-purple">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    <span>Sponsored by MathMasters</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostView;
