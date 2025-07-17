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

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
}