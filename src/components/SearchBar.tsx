
import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import useSearchSuggestions from '@/hooks/use-search-suggestions';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (query: string) => void;
  category?: 'all' | 'materials' | 'papers' | 'blog';
}

const SearchBar = ({ 
  placeholder = "Search for study materials, past papers...", 
  className = "",
  value,
  onChange,
  onSearch,
  category = 'all'
}: SearchBarProps) => {
  const isControlled = value !== undefined && onChange !== undefined;
  
  const [localQuery, setLocalQuery] = useState('');
  
  const {
    query: suggestionsQuery,
    setQuery: setSuggestionsQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    hideSuggestions
  } = useSearchSuggestions({ category });
  
  useEffect(() => {
    if (isControlled) {
      setSuggestionsQuery(value || '');
    } else {
      setSuggestionsQuery(localQuery);
    }
  }, [isControlled, value, localQuery, setSuggestionsQuery]);
  
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        hideSuggestions();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hideSuggestions]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (isControlled) {
      onChange(e);
    } else {
      setLocalQuery(inputValue);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuery = isControlled ? value : localQuery;
    
    if (onSearch) {
      onSearch(currentQuery || '');
    } else {
      console.log('Search query:', currentQuery);
    }
    
    hideSuggestions();
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    if (isControlled && onChange) {
      const syntheticEvent = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      setLocalQuery(suggestion);
    }
    
    if (onSearch) {
      onSearch(suggestion);
    }
    
    hideSuggestions();
    
    inputRef.current?.focus();
  };
  
  return (
    <div ref={searchBarRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={isControlled ? value : localQuery}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-100 dark:border-gray-700 focus:border-edu-purple dark:focus:border-edu-purple focus:ring-2 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-300"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-edu-purple hover:bg-edu-indigo text-white p-2 rounded-full transition-colors duration-300"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{suggestion}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
