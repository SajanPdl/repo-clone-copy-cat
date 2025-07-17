import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for study materials, past papers, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-edu-purple focus:border-transparent transition-all duration-300"
          />
        </div>
        <Button 
          type="submit"
          className="ml-3 px-8 py-4 bg-gradient-to-r from-edu-purple to-edu-blue text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;