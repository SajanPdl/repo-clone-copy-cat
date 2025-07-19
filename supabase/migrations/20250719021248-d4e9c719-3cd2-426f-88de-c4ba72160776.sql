-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('Notes', 'Study notes and summaries for various subjects'),
('Worksheets', 'Practice worksheets and exercises'),
('Question Banks', 'Collection of practice questions'),
('Reference Materials', 'Reference books and guides'),
('Lab Manuals', 'Laboratory experiment guides'),
('Sample Papers', 'Sample question papers for practice');

-- Insert sample grades
INSERT INTO public.grades (name, description) VALUES
('Grade 6', 'Class 6 materials and resources'),
('Grade 7', 'Class 7 materials and resources'),
('Grade 8', 'Class 8 materials and resources'),
('Grade 9', 'Class 9 materials and resources'),
('Grade 10', 'Class 10 board examination materials'),
('Grade 11', 'Class 11 intermediate level materials'),
('Grade 12', 'Class 12 board examination materials');

-- Insert sample study materials
INSERT INTO public.study_materials (title, description, subject, grade, category, file_type, downloads, is_featured) VALUES
('Algebra Fundamentals', 'Complete guide to algebraic expressions and equations', 'Mathematics', 'Grade 9', 'Notes', 'pdf', 245, true),
('Photosynthesis Process', 'Detailed explanation of photosynthesis in plants', 'Biology', 'Grade 10', 'Notes', 'pdf', 189, false),
('Chemical Reactions', 'Types of chemical reactions with examples', 'Chemistry', 'Grade 10', 'Notes', 'pdf', 156, true),
('World War II History', 'Comprehensive study of World War II events', 'History', 'Grade 9', 'Notes', 'pdf', 132, false),
('Physics Laws of Motion', 'Newton''s laws and their applications', 'Physics', 'Grade 11', 'Notes', 'pdf', 298, true),
('English Grammar Rules', 'Complete grammar guide with exercises', 'English', 'Grade 8', 'Worksheets', 'pdf', 178, false),
('Trigonometry Basics', 'Introduction to trigonometric functions', 'Mathematics', 'Grade 11', 'Notes', 'pdf', 267, true),
('Cell Structure', 'Plant and animal cell structures comparison', 'Biology', 'Grade 9', 'Reference Materials', 'pdf', 145, false),
('Organic Chemistry', 'Introduction to organic compounds', 'Chemistry', 'Grade 12', 'Notes', 'pdf', 234, true),
('Indian Geography', 'Physical and political geography of India', 'Geography', 'Grade 10', 'Notes', 'pdf', 167, false),
('Computer Programming', 'Basic programming concepts in Python', 'Computer Science', 'Grade 11', 'Notes', 'pdf', 198, true),
('Economics Principles', 'Fundamental economic concepts', 'Economics', 'Grade 12', 'Notes', 'pdf', 156, false),
('Physics Practical Lab', 'Laboratory experiments and procedures', 'Physics', 'Grade 12', 'Lab Manuals', 'pdf', 189, false),
('Chemistry Lab Manual', 'Complete chemistry lab experiments', 'Chemistry', 'Grade 11', 'Lab Manuals', 'pdf', 145, false),
('Biology Diagrams', 'Important biological diagrams with labels', 'Biology', 'Grade 12', 'Reference Materials', 'pdf', 223, true);

-- Insert sample past papers
INSERT INTO public.past_papers (title, subject, grade, year, board, downloads) VALUES
('Mathematics Final Exam 2023', 'Mathematics', 'Grade 10', 2023, 'CBSE', 345),
('Physics Board Paper 2023', 'Physics', 'Grade 12', 2023, 'CBSE', 289),
('Chemistry Sample Paper 2023', 'Chemistry', 'Grade 11', 2023, 'CBSE', 234),
('Biology Annual Exam 2022', 'Biology', 'Grade 10', 2022, 'CBSE', 198),
('English Literature 2023', 'English', 'Grade 12', 2023, 'CBSE', 167),
('History Model Paper 2023', 'History', 'Grade 9', 2023, 'CBSE', 145),
('Geography Final 2022', 'Geography', 'Grade 10', 2022, 'CBSE', 178),
('Computer Science 2023', 'Computer Science', 'Grade 12', 2023, 'CBSE', 256),
('Economics Board Paper 2022', 'Economics', 'Grade 12', 2022, 'CBSE', 189),
('Mathematics Pre-Board 2023', 'Mathematics', 'Grade 12', 2023, 'CBSE', 312),
('Physics Practical 2023', 'Physics', 'Grade 11', 2023, 'CBSE', 167),
('Chemistry Theory 2022', 'Chemistry', 'Grade 10', 2022, 'CBSE', 198),
('Biology Practical 2023', 'Biology', 'Grade 12', 2023, 'CBSE', 234),
('English Grammar 2023', 'English', 'Grade 9', 2023, 'CBSE', 145),
('Political Science 2022', 'Political Science', 'Grade 11', 2022, 'CBSE', 156);

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, content, excerpt, author, category, is_published, featured_image) VALUES
('How to Prepare for Board Exams', 'Board exams are crucial for every student''s academic journey. Here are some effective strategies to help you prepare better...

## Create a Study Schedule
The first step towards effective preparation is creating a well-structured study schedule. Divide your syllabus into manageable chunks and allocate specific time slots for each subject.

## Practice Previous Year Papers
Solving previous year question papers gives you insight into the exam pattern and helps identify important topics.

## Take Regular Breaks
Don''t forget to take regular breaks during your study sessions. This helps maintain focus and prevents burnout.', 'Essential tips and strategies for effective board exam preparation', 'Dr. Priya Sharma', 'Study Tips', true, null),

('Benefits of Regular Study', 'Consistency is key when it comes to academic success. Regular study habits can transform your learning experience...

## Improved Retention
When you study regularly, information gets transferred from short-term to long-term memory more effectively.

## Reduced Stress
Regular study eliminates the need for last-minute cramming, significantly reducing exam stress.

## Better Understanding
Consistent practice helps in developing a deeper understanding of concepts rather than rote learning.', 'Why maintaining consistent study habits is crucial for academic success', 'Prof. Raj Kumar', 'Study Tips', true, null),

('Science Fair Project Ideas', 'Looking for innovative science fair project ideas? Here are some exciting experiments you can try...

## Physics Projects
- Build a simple electric motor
- Create a periscope using mirrors
- Demonstrate electromagnetic induction

## Chemistry Projects
- Grow crystals at home
- Test pH levels of household items
- Create a volcano eruption model

## Biology Projects
- Study plant growth under different conditions
- Observe microscopic organisms
- Create a food chain model', 'Creative and educational science fair project ideas for students', 'Dr. Anita Verma', 'Science', true, null),

('Time Management for Students', 'Effective time management is a skill that every student should master for academic and personal success...

## Prioritize Tasks
Learn to identify urgent and important tasks. Use the Eisenhower Matrix to categorize your activities.

## Use Technology Wisely
Leverage apps and tools for scheduling, note-taking, and time tracking, but avoid digital distractions.

## Set Realistic Goals
Break down large tasks into smaller, achievable goals to maintain motivation and track progress.', 'Essential time management strategies for academic success', 'Ms. Sunita Joshi', 'Study Tips', true, null),

('Career Guidance After 12th', 'Choosing the right career path after completing 12th grade is one of the most important decisions in a student''s life...

## Engineering and Technology
Explore various branches of engineering like Computer Science, Mechanical, Civil, and Electrical engineering.

## Medical and Healthcare
Consider careers in medicine, nursing, pharmacy, physiotherapy, and other healthcare professions.

## Commerce and Management
Business administration, chartered accountancy, and finance offer excellent career opportunities.

## Arts and Humanities
Psychology, journalism, teaching, and social work are rewarding career options in humanities.', 'Comprehensive guide to career options available after completing 12th grade', 'Career Counselor Team', 'Career Guidance', true, null);

-- Insert sample advertisements
INSERT INTO public.advertisements (title, content, image_url, link_url, position, is_active) VALUES
('Online Tutoring Services', 'Get personalized online tutoring from expert teachers. All subjects available.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop', 'https://example.com/tutoring', 'sidebar', true),
('CBSE Study Materials', 'Complete CBSE study materials for all grades. Download now!', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop', 'https://example.com/cbse-materials', 'header', true),
('Educational Apps', 'Download our mobile app for on-the-go learning. Available on Play Store.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop', 'https://example.com/mobile-app', 'footer', true),
('Test Preparation', 'JEE, NEET, and board exam preparation courses. Join now!', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop', 'https://example.com/test-prep', 'content', true),
('Summer Courses', 'Special summer courses for skill development. Enroll today!', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop', 'https://example.com/summer-courses', 'sidebar', false);

-- Insert sample user queries
INSERT INTO public.user_queries (name, email, subject, message, status) VALUES
('Rahul Sharma', 'rahul.sharma@email.com', 'Missing Study Material', 'I cannot find the Physics notes for Grade 12. Can you please help me locate them?', 'open'),
('Priya Patel', 'priya.patel@email.com', 'Download Issue', 'I am facing issues while downloading PDF files. The download keeps failing.', 'closed'),
('Amit Kumar', 'amit.kumar@email.com', 'New Subject Request', 'Can you add Computer Science materials for Grade 9? It would be very helpful.', 'open'),
('Sneha Gupta', 'sneha.gupta@email.com', 'Thank You', 'Thank you for providing such excellent study materials. They helped me score well in my exams!', 'closed'),
('Vikash Singh', 'vikash.singh@email.com', 'Website Feedback', 'The website is very user-friendly. Could you add more past papers for Grade 11?', 'open'),
('Kavita Joshi', 'kavita.joshi@email.com', 'Login Problem', 'I am unable to login to my account. Please help me reset my password.', 'open'),
('Ravi Verma', 'ravi.verma@email.com', 'Content Suggestion', 'Please add more video tutorials for Mathematics. Visual learning would be great!', 'open'),
('Anjali Nair', 'anjali.nair@email.com', 'Mobile App', 'When will you launch the mobile app? I would love to use it for studying on the go.', 'closed');