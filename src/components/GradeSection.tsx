import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Award } from 'lucide-react';

const GradeSection = () => {
  const grades = [
    {
      id: 'grade10',
      name: 'Grade 10',
      icon: BookOpen,
      description: 'Foundation materials covering key subjects for 10th grade students.',
      materials: 48,
      papers: 24
    },
    {
      id: 'grade11',
      name: 'Grade 11',
      icon: FileText,
      description: 'Advanced study resources and past papers for 11th grade preparation.',
      materials: 56,
      papers: 32
    },
    {
      id: 'grade12',
      name: 'Grade 12',
      icon: Award,
      description: 'Comprehensive exam preparation materials for 12th grade students.',
      materials: 64,
      papers: 40
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Resources by Grade</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our educational materials are organized by grade level to help you find exactly what you need for your studies.
            Select your grade to explore relevant study materials and past papers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {grades.map((grade) => (
            <div key={grade.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 dark:border-gray-700 flex flex-col">
              <div className="mb-4 flex items-center justify-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                  <grade.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center mb-3 text-gray-900 dark:text-gray-100">
                {grade.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 flex-grow">
                {grade.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {grade.materials}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Materials</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {grade.papers}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Past Papers</div>
                </div>
              </div>

              <Link
                to={`/grade/${grade.id}`}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg text-center font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Explore {grade.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GradeSection;