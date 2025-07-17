
import { useState, useEffect, useCallback } from 'react';

// Mock data for suggestions based on different categories
const studyMaterialsSuggestions = [
  "Grade 10 Science Notes",
  "Engineering Mathematics",
  "Grade 11 History Notes",
  "Computer Science Fundamentals",
  "Physics Formula Sheet",
  "Chemistry Lab Manual",
  "Mathematics Problem Solving",
  "Biology Diagrams and Illustrations"
];

const pastPapersSuggestions = [
  "Grade 10 Mathematics Final Exam 2023",
  "Engineering Physics Mid-Term 2022",
  "Grade 12 Chemistry Final Exam 2023",
  "Computer Science Algorithm Test",
  "Biology Practical Exam Papers",
  "History Mid-Term Papers Grade 11",
  "Geography Final Exam Grade 9",
  "Literature Final Paper Grade 12"
];

const blogSuggestions = [
  "Study Techniques",
  "Exam Preparation",
  "Memory Improvement",
  "Career Guidance",
  "Engineering Entrance Exams",
  "Medical Entrance Preparation",
  "Digital Learning Tools",
  "Mental Health for Students"
];

// All suggestions combined
const allSuggestions = [
  ...studyMaterialsSuggestions,
  ...pastPapersSuggestions,
  ...blogSuggestions
];

interface UseSuggestionsProps {
  category?: 'all' | 'materials' | 'papers' | 'blog';
  minQueryLength?: number;
  maxSuggestions?: number;
}

const useSearchSuggestions = ({
  category = 'all',
  minQueryLength = 2,
  maxSuggestions = 5
}: UseSuggestionsProps = {}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const getSuggestionsSource = useCallback(() => {
    switch (category) {
      case 'materials':
        return studyMaterialsSuggestions;
      case 'papers':
        return pastPapersSuggestions;
      case 'blog':
        return blogSuggestions;
      case 'all':
      default:
        return allSuggestions;
    }
  }, [category]);
  
  useEffect(() => {
    if (query.length >= minQueryLength) {
      const source = getSuggestionsSource();
      const filtered = source
        .filter(item => 
          item.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, maxSuggestions);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, minQueryLength, maxSuggestions, getSuggestionsSource]);
  
  const clearSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  const hideSuggestions = () => {
    setShowSuggestions(false);
  };
  
  return {
    query,
    setQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    clearSuggestions,
    hideSuggestions
  };
};

export default useSearchSuggestions;
