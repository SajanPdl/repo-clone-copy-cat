export interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  grade: string;
  category: string;
  description: string;
  downloadUrl: string;
  size: string;
  downloads: number;
  rating: number;
  uploadDate: string;
  tags: string[];
}

export const studyMaterialsData: StudyMaterial[] = [
  {
    id: 1,
    title: "Mathematics Algebra Notes",
    subject: "Mathematics",
    grade: "Grade 10",
    category: "Notes",
    description: "Comprehensive notes covering all algebra topics for Grade 10",
    downloadUrl: "/materials/math-algebra-notes.pdf",
    size: "2.3 MB",
    downloads: 1245,
    rating: 4.8,
    uploadDate: "2023-05-15",
    tags: ["algebra", "equations", "factoring"]
  },
  {
    id: 2,
    title: "Physics Motion Practice Tests",
    subject: "Physics",
    grade: "Grade 11",
    category: "Practice Tests",
    description: "Practice tests for motion and kinematics topics",
    downloadUrl: "/materials/physics-motion-tests.pdf",
    size: "1.8 MB",
    downloads: 987,
    rating: 4.6,
    uploadDate: "2023-06-02",
    tags: ["motion", "kinematics", "practice"]
  },
  {
    id: 3,
    title: "Chemistry Organic Compounds Guide",
    subject: "Chemistry",
    grade: "Grade 12",
    category: "Guides",
    description: "Complete guide to organic chemistry compounds and reactions",
    downloadUrl: "/materials/chemistry-organic-guide.pdf",
    size: "3.1 MB",
    downloads: 1567,
    rating: 4.9,
    uploadDate: "2023-04-20",
    tags: ["organic", "compounds", "reactions"]
  },
  {
    id: 4,
    title: "Biology Cell Structure Worksheets",
    subject: "Biology",
    grade: "Grade 10",
    category: "Worksheets",
    description: "Interactive worksheets for cell structure and functions",
    downloadUrl: "/materials/biology-cell-worksheets.pdf",
    size: "1.5 MB",
    downloads: 856,
    rating: 4.5,
    uploadDate: "2023-07-10",
    tags: ["cell", "structure", "functions"]
  }
];