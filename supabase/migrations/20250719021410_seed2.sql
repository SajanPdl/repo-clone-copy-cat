-- Add more study materials
INSERT INTO public.study_materials (title, description, subject, grade, category, file_type, downloads, is_featured) VALUES
('Advanced Calculus', 'Differential and integral calculus concepts', 'Mathematics', 'Grade 12', 'Notes', 'pdf', 298, true),
('Atomic Structure', 'Structure of atoms and periodic table', 'Chemistry', 'Grade 11', 'Notes', 'pdf', 245, false),
('Human Anatomy', 'Human body systems and functions', 'Biology', 'Grade 12', 'Reference Materials', 'pdf', 189, true),
('Modern History of India', 'Freedom struggle and independence movement', 'History', 'Grade 10', 'Notes', 'pdf', 167, false),
('Quadratic Equations', 'Solving quadratic equations and applications', 'Mathematics', 'Grade 10', 'Worksheets', 'pdf', 234, true),
('Acids and Bases', 'Properties and reactions of acids and bases', 'Chemistry', 'Grade 10', 'Lab Manuals', 'pdf', 156, false),
('Genetics and Evolution', 'Heredity and evolutionary biology', 'Biology', 'Grade 12', 'Notes', 'pdf', 278, true),
('Data Structures', 'Arrays, stacks, queues and linked lists', 'Computer Science', 'Grade 12', 'Notes', 'pdf', 198, false),
('Business Studies', 'Principles of business management', 'Commerce', 'Grade 11', 'Notes', 'pdf', 167, false),
('Political Science', 'Indian constitution and government', 'Political Science', 'Grade 11', 'Notes', 'pdf', 145, true),
('Statistics', 'Probability and statistical analysis', 'Mathematics', 'Grade 11', 'Question Banks', 'pdf', 189, false),
('Environmental Science', 'Ecology and environmental conservation', 'Environmental Science', 'Grade 12', 'Notes', 'pdf', 134, false);

-- Add more past papers
INSERT INTO public.past_papers (title, subject, grade, year, board, downloads) VALUES
('Mathematics Sample Paper 2024', 'Mathematics', 'Grade 12', 2024, 'CBSE', 245),
('Physics Model Test 2024', 'Physics', 'Grade 11', 2024, 'CBSE', 198),
('Chemistry Annual 2023', 'Chemistry', 'Grade 12', 2023, 'CBSE', 267),
('Biology Mock Test 2024', 'Biology', 'Grade 11', 2024, 'CBSE', 189),
('English Core 2023', 'English', 'Grade 12', 2023, 'CBSE', 156),
('History Pre-Board 2024', 'History', 'Grade 10', 2024, 'CBSE', 145),
('Geography Sample 2023', 'Geography', 'Grade 11', 2023, 'CBSE', 167),
('Commerce Mock 2024', 'Commerce', 'Grade 12', 2024, 'CBSE', 178),
('Sanskrit Board 2023', 'Sanskrit', 'Grade 10', 2023, 'CBSE', 123),
('French Final 2024', 'French', 'Grade 12', 2024, 'CBSE', 134);

-- Add more blog posts
INSERT INTO public.blog_posts (title, content, excerpt, author, category, is_published, featured_image) VALUES
('Digital Learning Revolution', 'The education sector has undergone a massive transformation with the advent of digital technology...

## Online Learning Platforms
Students now have access to world-class education through online platforms that offer interactive content, videos, and assessments.

## AI-Powered Learning
Artificial Intelligence is personalizing education by adapting to individual learning styles and providing customized study paths.

## Virtual Reality in Education
VR technology is making learning immersive and engaging, especially for subjects like history, geography, and science.

## Future of Education
The future of education lies in blended learning models that combine the best of traditional and digital approaches.', 'How digital technology is transforming the way we learn and teach', 'Tech Education Team', 'Technology', true, null),

('Effective Note-Taking Methods', 'Good note-taking is essential for academic success. Here are proven methods to improve your note-taking skills...

## Cornell Note-Taking System
Divide your page into three sections: notes, cues, and summary. This method helps in better organization and review.

## Mind Mapping
Create visual representations of information using diagrams, colors, and connections between concepts.

## Digital Note-Taking
Use apps like Notion, Evernote, or OneNote for organizing and searching through your notes efficiently.

## Review and Revision
Regular review of notes within 24 hours helps in better retention and understanding of concepts.', 'Master the art of effective note-taking with these proven techniques', 'Study Skills Expert', 'Study Tips', true, null),

('STEM Education Importance', 'Science, Technology, Engineering, and Mathematics (STEM) education is crucial for preparing students for future careers...

## Career Opportunities
STEM fields offer abundant career opportunities with high growth potential and competitive salaries.

## Problem-Solving Skills
STEM education develops critical thinking and problem-solving abilities that are valuable in any field.

## Innovation and Creativity
Students learn to think innovatively and develop creative solutions to real-world problems.

## Global Competitiveness
Countries with strong STEM education programs maintain competitive advantages in the global economy.', 'Why STEM education is essential for students in the modern world', 'STEM Advocate', 'Science', true, null);

-- Add user queries
INSERT INTO public.user_queries (name, email, subject, message, status) VALUES
('Deepak Mehta', 'deepak.mehta@email.com', 'Grade 12 Physics Help', 'I need help understanding electromagnetic induction. Are there any video tutorials available?', 'open'),
('Pooja Singh', 'pooja.singh@email.com', 'Mathematics Doubts', 'Can someone explain the difference between permutations and combinations with examples?', 'open'),
('Arjun Reddy', 'arjun.reddy@email.com', 'Chemistry Lab Safety', 'What are the safety precautions to follow during chemistry lab experiments?', 'closed'),
('Meera Iyer', 'meera.iyer@email.com', 'Biology Diagrams', 'The biology diagrams are not clear in the PDF. Can you provide better quality images?', 'open'),
('Karan Agarwal', 'karan.agarwal@email.com', 'Study Schedule', 'How can I create an effective study schedule for board exams preparation?', 'closed'),
('Nisha Jain', 'nisha.jain@email.com', 'Career Guidance', 'I am confused between medical and engineering streams. Can you provide guidance?', 'open'),
('Sanjay Kumar', 'sanjay.kumar@email.com', 'Online Classes', 'Are there any live online classes available for doubt clearing sessions?', 'open'),
('Riddhi Sharma', 'riddhi.sharma@email.com', 'Assignment Help', 'I need help with my chemistry project on organic compounds. Any suggestions?', 'open'),
('Manish Gupta', 'manish.gupta@email.com', 'Sample Papers', 'When will the 2024 sample papers be available for download?', 'closed'),
('Ananya Das', 'ananya.das@email.com', 'Study Group', 'Is there a way to connect with other students for group study sessions?', 'open');