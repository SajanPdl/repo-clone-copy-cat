import { FileText, Calendar, Clock, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Sample data for past papers
const pastPapersData = [
  {
    id: 1,
    title: "Mathematics Final Exam 2023",
    subject: "Mathematics",
    year: 2023,
    grade: "Grade 12",
    difficulty: "Medium",
    duration: "3 hours",
    downloads: 1234,
  },
  {
    id: 2,
    title: "Physics Mid-Term Exam 2023",
    subject: "Physics",
    year: 2023,
    grade: "Grade 11",
    difficulty: "Hard",
    duration: "2 hours",
    downloads: 956,
  },
  {
    id: 3,
    title: "Chemistry Final Exam 2022",
    subject: "Chemistry",
    year: 2022,
    grade: "Grade 12",
    difficulty: "Medium",
    duration: "3 hours",
    downloads: 1789,
  },
  {
    id: 4,
    title: "Computer Science Practical Exam 2023",
    subject: "Computer Science",
    year: 2023,
    grade: "Bachelor's",
    difficulty: "Hard",
    duration: "4 hours",
    downloads: 678,
  },
  {
    id: 5,
    title: "English Literature Final Exam 2023",
    subject: "English",
    year: 2023,
    grade: "Grade 12",
    difficulty: "Easy",
    duration: "2.5 hours",
    downloads: 1045,
  },
  {
    id: 6,
    title: "Biology Final Exam 2022",
    subject: "Biology",
    year: 2022,
    grade: "Grade 11",
    difficulty: "Medium",
    duration: "3 hours",
    downloads: 867,
  },
];

// Filter options
const years = [2023, 2022, 2021, 2020, 2019];
const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English"];
const difficulties = ["Easy", "Medium", "Hard"];

const PastPapers = () => {
  const { toast } = useToast();

  const handleDownload = (paperId: number, paperTitle: string) => {
    // In a real application, this would trigger a file download
    // For now, we'll just show a toast notification
    toast({
      title: "Download Started",
      description: `${paperTitle} is being downloaded.`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "Medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
      case "Hard": return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <section id="past-papers" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Past Papers</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Practice with authentic exam papers from previous years. Perfect for exam preparation and understanding question patterns.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPapersData.map((paper) => (
              <div key={paper.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-edu-blue mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                        {paper.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{paper.subject}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Grade:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{paper.grade}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Year:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{paper.year}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty:</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(paper.difficulty)}`}>
                      {paper.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{paper.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Downloads:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{paper.downloads.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(paper.id, paper.title)}
                  className="w-full bg-gradient-to-r from-edu-blue to-edu-purple text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Paper
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-edu-purple to-edu-blue text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
              View All Past Papers
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PastPapers;