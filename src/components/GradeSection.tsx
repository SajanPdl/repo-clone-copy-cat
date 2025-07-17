
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
              
              <h3 className="text-xl font-bold text-center mb-3">{grade.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">{grade.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                <div className="text-center p-3 bg-indigo-50 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Study Materials</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">{grade.materials}</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Past Papers</p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">{grade.papers}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  to={`/study-materials?grade=${grade.name}`}
                  className="text-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Materials
                </Link>
                <Link 
                  to={`/past-papers?grade=${grade.name}`}
                  className="text-center py-2 px-4 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded border border-indigo-600 dark:border-indigo-400 transition-colors"
                >
                  Past Papers
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GradeSection;
