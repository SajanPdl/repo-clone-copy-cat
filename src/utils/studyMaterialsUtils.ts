import { StudyMaterial } from '@/data/studyMaterialsData';

export const filterMaterials = (
  materials: StudyMaterial[],
  category: string,
  subject: string,
  searchTerm: string
): StudyMaterial[] => {
  return materials.filter(material => {
    const matchesCategory = category === "All" || material.category === category;
    const matchesSubject = subject === "All" || material.subject === subject;
    const matchesSearch = searchTerm === "" || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSubject && matchesSearch;
  });
};