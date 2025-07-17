import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MaterialsFilterProps {
  selectedGrade: string;
  selectedSubject: string;
  selectedCategory: string;
  onGradeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  filterOptions: {
    grades: string[];
    subjects: string[];
    categories: string[];
  };
}

const MaterialsFilter = ({
  selectedGrade,
  selectedSubject,
  selectedCategory,
  onGradeChange,
  onSubjectChange,
  onCategoryChange,
  filterOptions
}: MaterialsFilterProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Select value={selectedGrade} onValueChange={onGradeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Grade" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.grades.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSubject} onValueChange={onSubjectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Subject" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.subjects.map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MaterialsFilter;