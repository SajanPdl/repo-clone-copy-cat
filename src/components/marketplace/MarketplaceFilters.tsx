
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Filter, X } from 'lucide-react';

interface MarketplaceFiltersProps {
  filters: {
    search: string;
    category: string;
    subject: string;
    university: string;
    condition: string;
    priceMin: number;
    priceMax: number;
    freeOnly: boolean;
    sortBy: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  categories: string[];
  subjects: string[];
  universities: string[];
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  subjects,
  universities
}) => {
  const hasActiveFilters = 
    filters.search || 
    filters.category !== 'all' || 
    filters.subject !== 'all' || 
    filters.university !== 'all' || 
    filters.condition !== 'all' || 
    filters.freeOnly || 
    filters.priceMin > 0 || 
    filters.priceMax < 10000;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-900/50"
                />
              </div>
              <Select value={filters.sortBy} onValueChange={(value) => onFilterChange('sortBy', value)}>
                <SelectTrigger className="w-full md:w-48 bg-white/50 dark:bg-gray-900/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-900/50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Subject</Label>
                <Select value={filters.subject} onValueChange={(value) => onFilterChange('subject', value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-900/50">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">University</Label>
                <Select value={filters.university} onValueChange={(value) => onFilterChange('university', value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-900/50">
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Universities</SelectItem>
                    {universities.map(uni => (
                      <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Condition</Label>
                <Select value={filters.condition} onValueChange={(value) => onFilterChange('condition', value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-900/50">
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Condition</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range and Free Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Free Items Only</Label>
                  <Switch
                    checked={filters.freeOnly}
                    onCheckedChange={(checked) => onFilterChange('freeOnly', checked)}
                  />
                </div>
              </div>

              {!filters.freeOnly && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Price Range: ${filters.priceMin} - ${filters.priceMax}
                  </Label>
                  <Slider
                    value={[filters.priceMin, filters.priceMax]}
                    onValueChange={(values) => {
                      onFilterChange('priceMin', values[0]);
                      onFilterChange('priceMax', values[1]);
                    }}
                    max={10000}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Active Filters and Clear */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {filters.search}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => onFilterChange('search', '')}
                      />
                    </Badge>
                  )}
                  {filters.category !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {filters.category}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => onFilterChange('category', 'all')}
                      />
                    </Badge>
                  )}
                  {filters.freeOnly && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Free Only
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => onFilterChange('freeOnly', false)}
                      />
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketplaceFilters;
