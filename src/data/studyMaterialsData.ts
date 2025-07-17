
export interface StudyMaterial {
  id: number;
  title: string;
  category: string;
  subject: string;
  downloads: number;
  rating: number;
  views: number;
  image: string;
  description: string;
  keyPoints?: string[];
  importantFormulas?: string[];
  pdfUrl?: string;
}

export const categories = ["All", "High School", "Bachelor's", "Engineering", "Medical"];
export const subjects = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Economics"];

export const studyMaterialsData: StudyMaterial[] = [
  {
    id: 1,
    title: "Mathematics for Grade 10",
    category: "High School",
    subject: "Mathematics",
    downloads: 2458,
    rating: 4.8,
    views: 5620,
    image: "/placeholder.svg",
    description: "Comprehensive notes covering all essential topics for Grade 10 Mathematics.",
    keyPoints: [
      "Complete explanation of algebraic expressions and equations",
      "Geometric proofs and constructions with step-by-step solutions",
      "Trigonometric functions and their applications",
      "Statistics and probability concepts with real-world examples"
    ],
    importantFormulas: [
      "Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a",
      "Pythagorean Theorem: a² + b² = c²",
      "Area of a Circle: A = πr²",
      "Sine Law: a/sin(A) = b/sin(B) = c/sin(C)"
    ],
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf"
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
    keyPoints: [
      "Vector analysis and Newton's three laws of motion",
      "Work, energy, and power principles",
      "Momentum and impulse concepts",
      "Rotational dynamics and angular momentum"
    ],
    importantFormulas: [
      "F = ma (Newton's Second Law)",
      "E = mc² (Einstein's Mass-Energy Equivalence)",
      "KE = ½mv² (Kinetic Energy)",
      "p = mv (Linear Momentum)"
    ],
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf"
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
    description: "A comprehensive handbook containing all essential chemistry formulas and equations."
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
    description: "In-depth coverage of essential algorithms and data structures for CS students."
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
    description: "Complete grammar guide with examples and practice exercises for students."
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
    description: "Detailed diagrams and notes on human anatomical systems for medical students."
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
    description: "Comprehensive notes on modern world history from 1900 to present."
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
    description: "Fundamental economic principles explained with real-world case studies."
  },
];
