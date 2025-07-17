
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
    console.log(`Downloading paper ID: ${paperId}`);
  };

  return (
    <section id="past-papers" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Past Papers & Solutions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Prepare for your exams with our comprehensive collection of past papers, solutions, and model answers.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <option value="">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>

        {/* Past Papers Table */}
        <div className="overflow-x-auto">
          <table className="w-full glass-card">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Year</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Subject</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Difficulty</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Duration</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Download</th>
              </tr>
            </thead>
            <tbody>
              {pastPapersData.map((paper, index) => (
                <tr 
                  key={paper.id} 
                  className={`${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-900/50' : 'bg-gray-50 dark:bg-gray-800/30'
                  } hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-150`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-edu-blue mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{paper.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden">{paper.subject} • {paper.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{paper.year}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{paper.subject}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      paper.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      paper.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {paper.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{paper.duration}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="inline-flex items-center gap-1 bg-edu-blue/10 hover:bg-edu-blue/20 text-edu-blue px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300"
                      onClick={() => handleDownload(paper.id, paper.title)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              &laquo;
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-edu-purple text-white">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              3
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              &raquo;
            </button>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default PastPapers;
