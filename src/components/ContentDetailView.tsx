import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  Download, 
  BookOpen, 
  FileText, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft,
  BookText,
  Brain,
  Calculator,
  Lightbulb,
  Link as LinkIcon,
  User as UserIcon // Import the User icon from lucide-react
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import PdfViewer from '@/components/PdfViewer';
import { toast } from 'sonner';

// Sample study materials data (would come from an API in a real app)
const studyMaterialsData = [
  {
    id: 1,
    title: "Mathematics for Grade 10",
    category: "High School",
    subject: "Mathematics",
    downloads: 2458,
    rating: 4.8,
    views: 5620,
    image: "/placeholder.svg",
    description: "Comprehensive notes covering all essential topics for Grade 10 Mathematics, aligned with the CBSE curriculum. These notes provide clear explanations, step-by-step solutions, and practice problems for each concept.",
    detailedDescription: `These comprehensive mathematics notes are designed specifically for Grade 10 students following the CBSE curriculum, though they're equally valuable for students of other boards as the fundamental concepts remain the same.

The material is structured to build a solid foundation in algebra, geometry, trigonometry, and statistics - all crucial areas for higher studies in mathematics and science.

What makes these notes exceptional:

- Concept explanations using everyday examples that make abstract ideas concrete
- Step-by-step solutions that show the complete working process
- Highlighting of common mistakes and misconceptions
- Gradual progression from basic to advanced problems
- Special focus on board examination pattern questions

These notes have been compiled by experienced educators with over 15 years of teaching experience and have helped thousands of students achieve excellent results in their examinations.`,
    keyPoints: [
      "Complete explanation of algebraic expressions and equations",
      "Geometric proofs and constructions with step-by-step solutions",
      "Trigonometric functions and their applications",
      "Statistics and probability concepts with real-world examples",
      "Practice problems with solutions for exam preparation",
      "Tips and tricks for solving complex problems quickly",
      "Memory aids for important formulas and theorems"
    ],
    importantFormulas: [
      "Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a",
      "Pythagorean Theorem: a² + b² = c²",
      "Area of a Circle: A = πr²",
      "Sine Law: a/sin(A) = b/sin(B) = c/sin(C)",
      "Cosine Law: c² = a² + b² - 2ab·cos(C)",
      "Sum of n terms of AP: Sn = n/2[2a + (n-1)d]",
      "Sum of n terms of GP: Sn = a(1-r^n)/(1-r)"
    ],
    chapters: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Introduction to Trigonometry",
      "Circles",
      "Constructions",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability"
    ],
    author: "Dr. Rajesh Sharma",
    publishDate: "July 15, 2023",
    fileSize: "4.2 MB",
    pages: 148,
    fileType: "PDF",
    language: "English",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [2, 3, 5]
  },
  {
    id: 2,
    title: "Physics Notes - Mechanics",
    category: "Bachelor's",
    subject: "Physics",
    downloads: 1879,
    rating: 4.6,
    views: 3450,
    image: "/placeholder.svg",
    description: "Detailed notes on Classical Mechanics covering Newton's Laws, Conservation of Energy, and more.",
    detailedDescription: `These comprehensive physics notes focus on classical mechanics, providing a thorough understanding of how objects move and the forces that affect them. Perfect for first-year college students or advanced high school students preparing for competitive examinations.

The notes are structured to build intuition first, then develop the mathematical framework, ensuring that students understand the physical principles before diving into equations and problem-solving.

Key features of these notes:

- Historical context for major discoveries and principles
- Intuitive explanations followed by rigorous mathematical treatment
- Numerous examples ranging from everyday phenomena to advanced applications
- Clear diagrams and illustrations to visualize concepts
- Detailed derivations of all important equations
- Practice problems with varying difficulty levels`,
    keyPoints: [
      "Vector analysis and Newton's three laws of motion",
      "Work, energy, and power principles",
      "Momentum and impulse concepts",
      "Rotational dynamics and angular momentum",
      "Oscillatory motion and mechanical waves",
      "Gravitational fields and celestial mechanics",
      "Fluid mechanics fundamentals"
    ],
    importantFormulas: [
      "F = ma (Newton's Second Law)",
      "E = mc² (Einstein's Mass-Energy Equivalence)",
      "KE = ½mv² (Kinetic Energy)",
      "p = mv (Linear Momentum)",
      "L = Iω (Angular Momentum)",
      "F = -kx (Hooke's Law)",
      "T = 2π√(l/g) (Period of a Simple Pendulum)"
    ],
    chapters: [
      "Introduction to Mechanics",
      "Vectors in Physics",
      "Kinematics in One Dimension",
      "Kinematics in Two Dimensions",
      "Newton's Laws of Motion",
      "Applications of Newton's Laws",
      "Work and Energy",
      "Conservation of Energy",
      "Linear Momentum and Collisions",
      "Rotational Kinematics",
      "Rotational Dynamics",
      "Equilibrium and Elasticity",
      "Gravitation",
      "Fluid Mechanics"
    ],
    author: "Prof. Sunil Verma",
    publishDate: "May 22, 2023",
    fileSize: "5.8 MB",
    pages: 205,
    fileType: "PDF",
    language: "English",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [1, 4, 6]
  },
  {
    id: 3,
    title: "Chemistry Formulas Handbook",
    category: "High School",
    subject: "Chemistry",
    downloads: 3120,
    rating: 4.9,
    views: 7890,
    image: "/placeholder.svg",
    description: "A comprehensive handbook containing all essential chemistry formulas and equations.",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [1, 2, 8]
  },
  {
    id: 4,
    title: "Computer Science Algorithms",
    category: "Engineering",
    subject: "Computer Science",
    downloads: 1547,
    rating: 4.5,
    views: 2980,
    image: "/placeholder.svg",
    description: "In-depth coverage of essential algorithms and data structures for CS students.",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [2, 7, 8]
  },
  {
    id: 5,
    title: "English Grammar Guide",
    category: "High School",
    subject: "English",
    downloads: 4205,
    rating: 4.7,
    views: 8750,
    image: "/placeholder.svg",
    description: "Complete grammar guide with examples and practice exercises for students.",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [1, 3, 7]
  },
  {
    id: 6,
    title: "Biology - Human Anatomy",
    category: "Medical",
    subject: "Biology",
    downloads: 2873,
    rating: 4.8,
    views: 5240,
    image: "/placeholder.svg",
    description: "Detailed diagrams and notes on human anatomical systems for medical students.",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [2, 3, 8]
  },
  {
    id: 7,
    title: "History - Modern World",
    category: "Bachelor's",
    subject: "History",
    downloads: 1054,
    rating: 4.3,
    views: 2130,
    image: "/placeholder.svg",
    description: "Comprehensive notes on modern world history from 1900 to present.",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [4, 5, 8]
  },
  {
    id: 8,
    title: "Economics Principles",
    category: "Bachelor's",
    subject: "Economics",
    downloads: 1732,
    rating: 4.6,
    views: 3650,
    image: "/placeholder.svg",
    description: "Fundamental economic principles explained with real-world case studies.",
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    suggestedMaterials: [3, 6, 7]
  },
];

const ContentDetailView = () => {
  const { id } = useParams<{id: string}>();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [suggestedMaterials, setSuggestedMaterials] = useState<any[]>([]);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    // Simulate fetching data from API
    setLoading(true);
    const materialId = parseInt(id || '1');
    const foundMaterial = studyMaterialsData.find(m => m.id === materialId);
    
    if (foundMaterial) {
      setMaterial(foundMaterial);
      
      // Get suggested materials
      if (foundMaterial.suggestedMaterials) {
        const suggested = studyMaterialsData.filter(m => 
          foundMaterial.suggestedMaterials.includes(m.id)
        );
        setSuggestedMaterials(suggested);
      }
    }
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [id]);

  const handleDownload = () => {
    toast('Download started. The file will be saved to your downloads folder.');
    // In a real app, this would trigger the actual download
    if (material) {
      // Increment download count
      setMaterial({
        ...material,
        downloads: material.downloads + 1
      });
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      toast('Material added to your saved items');
    } else {
      toast('Material removed from your saved items');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('Link copied to clipboard');
  };

  const getIcon = (subject: string) => {
    switch (subject) {
      case "Mathematics":
        return <BookText className="h-6 w-6 text-edu-purple" />;
      case "Physics":
        return <Calculator className="h-6 w-6 text-edu-blue" />;
      case "Chemistry":
        return <Brain className="h-6 w-6 text-edu-orange" />;
      default:
        return <FileText className="h-6 w-6 text-teal-500" />;
    }
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

  if (!material) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Study Material Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The study material you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/study-materials">Back to Study Materials</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/study-materials" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Study Materials
            </Link>
          </Button>
          
          <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getIcon(material.subject)}
                <Badge className="bg-edu-purple/90 text-white">
                  {material.subject}
                </Badge>
                <Badge variant="outline">
                  {material.category}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{material.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {material.author && (
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{material.author}</span>
                  </div>
                )}
                
                {material.publishDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{material.publishDate}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{material.views.toLocaleString()} views</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{material.downloads.toLocaleString()} downloads</span>
                </div>
                
                {material.rating && (
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{material.rating}/5 ({Math.round(material.downloads * 0.15)} ratings)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              <Button 
                onClick={handleBookmark}
                variant="outline"
                className={`gap-2 ${bookmarked ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-700' : ''}`}
              >
                <Bookmark className="h-4 w-4" />
                {bookmarked ? 'Saved' : 'Save'}
              </Button>
              
              <Button 
                onClick={handleShare}
                variant="outline"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button 
                onClick={handleDownload}
                className="gap-2 bg-gradient-to-r from-edu-purple to-edu-blue hover:from-edu-blue hover:to-edu-purple transition-all duration-300 transform hover:scale-105"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Material description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">About This Study Material</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {material.detailedDescription || material.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {material.fileSize && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">File Size</span>
                  <span className="font-medium">{material.fileSize}</span>
                </div>
              )}
              
              {material.pages && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">Pages</span>
                  <span className="font-medium">{material.pages}</span>
                </div>
              )}
              
              {material.fileType && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">Format</span>
                  <span className="font-medium">{material.fileType}</span>
                </div>
              )}
              
              {material.language && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">Language</span>
                  <span className="font-medium">{material.language}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* PDF Viewer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Preview Material</h2>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <PdfViewer 
                  fileUrl={material.pdfUrl}
                  height={500}
                />
              </div>
              <div className="mt-6 text-center">
                <Button 
                  onClick={handleDownload}
                  className="gap-2 bg-gradient-to-r from-edu-purple to-edu-blue hover:from-edu-blue hover:to-edu-purple transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                  Download Full Material
                </Button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Downloaded {material.downloads.toLocaleString()} times by students
                </p>
              </div>
            </div>

            {/* Key points and formulas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {material.keyPoints && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-edu-purple" />
                    <h2 className="text-lg font-bold">Key Points Covered</h2>
                  </div>
                  
                  <ul className="space-y-2">
                    {material.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-edu-purple"></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {material.importantFormulas && (
                <Collapsible 
                  open={showFormulas} 
                  onOpenChange={setShowFormulas}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-edu-blue" />
                        <h2 className="text-lg font-bold">Important Formulas</h2>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${showFormulas ? 'transform rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pt-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                        {material.importantFormulas.map((formula: string, index: number) => (
                          <div 
                            key={index} 
                            className="text-sm text-gray-800 dark:text-gray-200 p-2 bg-white/60 dark:bg-gray-800/60 rounded border border-blue-100 dark:border-blue-800"
                          >
                            {formula}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
            </div>
            
            {/* Chapters list */}
            {material.chapters && (
              <Collapsible 
                open={showChapters} 
                onOpenChange={setShowChapters}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-edu-orange" />
                      <h2 className="text-lg font-bold">Chapters & Topics</h2>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${showChapters ? 'transform rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {material.chapters.map((chapter: string, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 text-edu-purple flex-shrink-0" />
                          <span className="text-sm">{chapter}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Suggested materials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended Materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedMaterials.map((item) => (
                  <Link key={item.id} to={`/content/${item.id}`} className="block group">
                    <div className="flex gap-3">
                      <div className="h-14 w-14 rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                        {getIcon(item.subject)}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm group-hover:text-edu-purple transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Badge variant="outline" className="text-xs h-5 mr-2">
                            {item.subject}
                          </Badge>
                          <Download className="h-3 w-3 mr-1" />
                          <span>{item.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/study-materials">Browse All Materials</Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Advertisement */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-medium">Sponsored</h3>
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
                  <h4 className="font-medium text-sm mb-1">Online Tutoring - First Session Free!</h4>
                  <p className="text-xs text-gray-500 mb-2">Connect with top tutors for personalized help with this subject.</p>
                  <div className="flex items-center text-xs text-edu-purple">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    <span>TopTutors.com</span>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Author info if available */}
            {material.author && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${material.author.replace(/\s+/g, '+')}&background=random`} />
                      <AvatarFallback>{material.author.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Created by</h3>
                      <p className="text-gray-900 dark:text-gray-100 font-bold">{material.author}</p>
                      <Button variant="link" className="p-0 h-auto text-edu-purple">
                        View all materials
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Help box */}
            <Card className="bg-edu-purple text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Need Help With This Topic?</h3>
                <p className="text-white/80 text-sm mb-4">Our AI tutoring assistant can answer your questions about this material.</p>
                <Button className="w-full bg-white text-edu-purple hover:bg-white/90">
                  Ask AI Tutor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailView;
