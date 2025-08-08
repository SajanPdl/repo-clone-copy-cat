-- Create study materials table
CREATE TABLE public.study_materials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  downloads INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create past papers table
CREATE TABLE public.past_papers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  year INTEGER NOT NULL,
  board TEXT DEFAULT 'CBSE',
  file_url TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'MeroAcademy Team',
  category TEXT DEFAULT 'Education',
  featured_image TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user queries table
CREATE TABLE public.user_queries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create grades table
CREATE TABLE public.grades (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advertisements table
CREATE TABLE public.advertisements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT DEFAULT 'sidebar',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for educational content)
CREATE POLICY "Study materials are viewable by everyone" ON public.study_materials FOR SELECT USING (true);
CREATE POLICY "Past papers are viewable by everyone" ON public.past_papers FOR SELECT USING (true);
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Grades are viewable by everyone" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Active ads are viewable by everyone" ON public.advertisements FOR SELECT USING (is_active = true);

-- User queries policies
CREATE POLICY "Users can insert their own queries" ON public.user_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own queries" ON public.user_queries FOR SELECT USING (true);

-- Create function to increment downloads
CREATE OR REPLACE FUNCTION public.increment_download_count(material_id INTEGER, table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF table_name = 'study_materials' THEN
    UPDATE public.study_materials SET downloads = downloads + 1 WHERE id = material_id;
  ELSIF table_name = 'past_papers' THEN
    UPDATE public.past_papers SET downloads = downloads + 1 WHERE id = material_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON public.study_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_past_papers_updated_at BEFORE UPDATE ON public.past_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo categories
INSERT INTO public.categories (name, description) VALUES
('Notes', 'Comprehensive study notes for all subjects'),
('Question Banks', 'Practice questions and problem sets'),
('Lab Manuals', 'Practical lab guides and experiments'),
('Reference Books', 'Additional reference materials'),
('Worksheets', 'Practice worksheets and assignments');

-- Insert demo grades
INSERT INTO public.grades (name, description) VALUES
('Grade 9', 'Class 9 materials'),
('Grade 10', 'Class 10 CBSE board materials'),
('Grade 11', 'Class 11 intermediate level'),
('Grade 12', 'Class 12 CBSE board materials'),
('Undergraduate', 'University level materials');

-- Insert demo study materials
INSERT INTO public.study_materials (title, description, subject, grade, category, file_url, downloads, is_featured) VALUES
('Mathematics Class 10 Complete Notes', 'Comprehensive mathematics notes covering all chapters for CBSE Class 10', 'Mathematics', 'Grade 10', 'Notes', '/sample-materials/math-10-notes.pdf', 245, true),
('Physics Lab Manual Grade 12', 'Complete physics lab manual with all experiments for Class 12', 'Physics', 'Grade 12', 'Lab Manuals', '/sample-materials/physics-lab-12.pdf', 189, true),
('Chemistry Organic Compounds Notes', 'Detailed notes on organic chemistry for Grade 11 students', 'Chemistry', 'Grade 11', 'Notes', '/sample-materials/chemistry-organic.pdf', 156, false),
('Biology NCERT Solutions Class 10', 'Complete NCERT solutions for Biology Class 10', 'Biology', 'Grade 10', 'Question Banks', '/sample-materials/bio-ncert-10.pdf', 203, true),
('Computer Science Programming Guide', 'Python programming guide for Class 12 students', 'Computer Science', 'Grade 12', 'Reference Books', '/sample-materials/cs-python-12.pdf', 167, false),
('English Grammar Worksheets Grade 9', 'Practice worksheets for English grammar', 'English', 'Grade 9', 'Worksheets', '/sample-materials/english-grammar-9.pdf', 134, false),
('History Modern India Notes', 'Comprehensive notes on Modern Indian History', 'History', 'Grade 10', 'Notes', '/sample-materials/history-modern-india.pdf', 112, false),
('Geography Map Work Guide', 'Complete guide for geography map work and practical', 'Geography', 'Grade 10', 'Lab Manuals', '/sample-materials/geo-mapwork.pdf', 98, false);

-- Insert demo past papers
INSERT INTO public.past_papers (title, subject, grade, year, board, file_url, downloads) VALUES
('CBSE Mathematics Board Paper 2023', 'Mathematics', 'Grade 10', 2023, 'CBSE', '/sample-papers/math-2023-cbse.pdf', 342),
('CBSE Physics Board Paper 2023', 'Physics', 'Grade 12', 2023, 'CBSE', '/sample-papers/physics-2023-cbse.pdf', 298),
('CBSE Chemistry Board Paper 2022', 'Chemistry', 'Grade 12', 2022, 'CBSE', '/sample-papers/chemistry-2022-cbse.pdf', 256),
('CBSE Biology Board Paper 2023', 'Biology', 'Grade 12', 2023, 'CBSE', '/sample-papers/biology-2023-cbse.pdf', 234),
('CBSE English Board Paper 2023', 'English', 'Grade 10', 2023, 'CBSE', '/sample-papers/english-2023-cbse.pdf', 189),
('CBSE Computer Science Paper 2022', 'Computer Science', 'Grade 12', 2022, 'CBSE', '/sample-papers/cs-2022-cbse.pdf', 167),
('CBSE History Board Paper 2023', 'History', 'Grade 10', 2023, 'CBSE', '/sample-papers/history-2023-cbse.pdf', 145),
('CBSE Geography Board Paper 2022', 'Geography', 'Grade 10', 2022, 'CBSE', '/sample-papers/geography-2022-cbse.pdf', 123);

-- Insert demo blog posts
INSERT INTO public.blog_posts (title, content, excerpt, author, category, featured_image) VALUES
('How to Prepare for CBSE Board Exams 2024', 'Board exams are a crucial milestone in every student''s academic journey. Here are some effective strategies to help you prepare...', 'Essential tips and strategies for CBSE board exam preparation', 'Dr. Priya Sharma', 'Exam Preparation', '/blog-images/board-exam-prep.jpg'),
('Top 10 Study Tips for Mathematics', 'Mathematics can be challenging, but with the right approach, it becomes much easier. Here are our top 10 study tips...', 'Proven strategies to excel in mathematics', 'Prof. Rajesh Kumar', 'Study Tips', '/blog-images/math-tips.jpg'),
('Career Options After 12th Science', 'Choosing the right career path after 12th grade is crucial. Explore various options in science stream...', 'Comprehensive guide to career choices in science stream', 'Career Counselor Team', 'Career Guidance', '/blog-images/career-science.jpg'),
('Importance of Regular Practice in Studies', 'Regular practice is the key to academic success. Learn how consistent study habits can transform your performance...', 'Why regular practice is essential for academic success', 'MeroAcademy Team', 'Study Habits', '/blog-images/regular-practice.jpg'),
('Digital Learning vs Traditional Learning', 'Compare the benefits and challenges of digital and traditional learning methods...', 'Analysis of modern vs traditional education approaches', 'Dr. Meera Patel', 'Education Technology', '/blog-images/digital-vs-traditional.jpg');

-- Insert demo advertisements
INSERT INTO public.advertisements (title, content, image_url, link_url, position) VALUES
('Nepal Education Fair 2024', 'Join the biggest education fair in Nepal. Explore opportunities in higher education.', '/ads/education-fair.jpg', 'https://example.com/education-fair', 'banner'),
('Online Tutoring Services', 'Get personalized online tutoring from expert teachers. Free trial available.', '/ads/online-tutoring.jpg', 'https://example.com/tutoring', 'sidebar'),
('CBSE Reference Books', 'Complete collection of CBSE reference books at discounted prices.', '/ads/reference-books.jpg', 'https://example.com/books', 'sidebar');