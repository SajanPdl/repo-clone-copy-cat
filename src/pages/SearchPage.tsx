import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen, FileText, ShoppingCart, FileText as BlogIcon, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'study_material' | 'past_paper' | 'marketplace' | 'blog';
  slug?: string;
  category?: string;
  grade?: string;
  price?: number;
  created_at: string;
  thumbnail_url?: string;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  const { notifyNewStudyMaterial } = useNotificationTrigger();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    category: '',
    grade: '',
    type: 'all',
    sortBy: 'relevance'
  });
  const [dbStatus, setDbStatus] = useState<{connected: boolean, tables: string[]}>({connected: false, tables: []});

  // Test database connection and table existence
  useEffect(() => {
    const testDatabase = async () => {
      try {
        console.log('Testing database connection...');
        
        // Test basic connection
        const { data, error } = await supabase.from('study_materials').select('id').limit(1);
        if (error) {
          console.error('Database connection error:', error);
          setDbStatus({connected: false, tables: []});
        } else {
          console.log('Database connected successfully');
          setDbStatus({connected: true, tables: ['study_materials']});
        }
        
        // Test other tables
        const tables = ['past_papers', 'marketplace_items', 'blog_posts'];
        for (const table of tables) {
          try {
            const { error: tableError } = await supabase.from(table).select('id').limit(1);
            if (!tableError) {
              setDbStatus(prev => ({...prev, tables: [...prev.tables, table]}));
            }
          } catch (e) {
            console.log(`Table ${table} not accessible:`, e);
          }
        }
      } catch (error) {
        console.error('Database test failed:', error);
        setDbStatus({connected: false, tables: []});
      }
    };
    
    testDatabase();
  }, []);

  // Show search welcome notification on first visit
  useEffect(() => {
    if (user) {
      const hasVisited = localStorage.getItem('search_visited');
      if (!hasVisited) {
        notifyNewStudyMaterial('Search Functionality', 'Find study materials, past papers, and more!');
        localStorage.setItem('search_visited', 'true');
      }
    }
  }, [user, notifyNewStudyMaterial]);

  useEffect(() => {
    console.log('SearchPage useEffect triggered, query:', query);
    if (query) {
      performSearch();
    } else {
      console.log('No query provided, showing default state');
      setResults([]);
      setLoading(false);
    }
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    console.log('Starting search for:', query);
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      const results: SearchResult[] = [];
      
      // Search study materials
      if (filters.type === 'all' || filters.type === 'study_material') {
        console.log('Searching study materials...');
        try {
          let queryBuilder = supabase
            .from('study_materials')
            .select('id, title, description, slug, category, grade, created_at, featured_image')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(20);
          
          // Try to filter by approval_status if the column exists
          try {
            const { data: materials, error: materialsError } = await queryBuilder.eq('approval_status', 'approved');
            if (materialsError) {
              console.log('approval_status column not found, searching without approval filter...');
              // Fallback: search without approval filter
              const { data: materialsFallback, error: fallbackError } = await queryBuilder;
              if (fallbackError) {
                console.error('Study materials search fallback error:', fallbackError);
              } else {
                console.log('Study materials found (fallback):', materialsFallback?.length || 0);
                if (materialsFallback) {
                  results.push(...materialsFallback.map(m => ({
                    ...m,
                    type: 'study_material' as const,
                    thumbnail_url: m.featured_image
                  })));
                }
              }
            } else {
              console.log('Study materials found:', materials?.length || 0);
              if (materials) {
                results.push(...materials.map(m => ({
                  ...m,
                  type: 'study_material' as const,
                  thumbnail_url: m.featured_image
                })));
              }
            }
          } catch (e) {
            console.log('approval_status filter failed, searching without it...');
            const { data: materialsFallback, error: fallbackError } = await queryBuilder;
            if (fallbackError) {
              console.error('Study materials search fallback error:', fallbackError);
            } else {
              console.log('Study materials found (fallback):', materialsFallback?.length || 0);
              if (materialsFallback) {
                results.push(...materialsFallback.map(m => ({
                  ...m,
                  type: 'study_material' as const,
                  thumbnail_url: m.featured_image
                })));
              }
            }
          }
        } catch (e) {
          console.error('Study materials search failed:', e);
        }
      }
      
      // Search past papers
      if (filters.type === 'all' || filters.type === 'past_paper') {
        console.log('Searching past papers...');
        const { data: papers, error: papersError } = await supabase
          .from('past_papers')
          .select('id, title, description, slug, category, grade, created_at, thumbnail_url')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20);
        
        if (papersError) {
          console.error('Past papers search error:', papersError);
        } else {
          console.log('Past papers found:', papers?.length || 0);
          if (papers) {
            results.push(...papers.map(p => ({
              ...p,
              type: 'past_paper' as const
            })));
          }
        }
      }
      
      // Search marketplace items
      if (filters.type === 'all' || filters.type === 'marketplace') {
        console.log('Searching marketplace items...');
        try {
          const { data: items, error: itemsError } = await supabase
            .from('marketplace_items')
            .select('id, title, description, slug, category, price, created_at, thumbnail_url')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .eq('status', 'active')
            .limit(20);
          
          if (itemsError) {
            console.error('Marketplace items search error:', itemsError);
            // Skip marketplace search if table doesn't exist
          } else {
            console.log('Marketplace items found:', items?.length || 0);
            if (items) {
              results.push(...items.map(i => ({
                ...i,
                type: 'marketplace' as const
              })));
            }
          }
        } catch (e) {
          console.log('Marketplace items table not accessible, skipping...');
        }
      }
      
      // Search blog posts
      if (filters.type === 'all' || filters.type === 'blog') {
        console.log('Searching blog posts...');
        const { data: posts, error: postsError } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, category, created_at, featured_image')
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .eq('status', 'published')
          .limit(20);
        
        if (postsError) {
          console.error('Blog posts search error:', postsError);
        } else {
          console.log('Blog posts found:', posts?.length || 0);
          if (posts) {
            results.push(...posts.map(p => ({
              ...p,
              type: 'blog' as const,
              description: p.excerpt,
              thumbnail_url: p.featured_image
            })));
          }
        }
      }
      
      console.log('Total results before filtering:', results.length);
      
      // Apply filters
      let filteredResults = results;
      
      if (filters.category) {
        filteredResults = filteredResults.filter(r => r.category === filters.category);
      }
      
      if (filters.grade) {
        filteredResults = filteredResults.filter(r => r.grade === filters.grade);
      }
      
      // Apply sorting
      if (filters.sortBy === 'newest') {
        filteredResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (filters.sortBy === 'oldest') {
        filteredResults.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
      
      console.log('Final filtered results:', filteredResults.length);
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      grade: '',
      type: 'all',
      sortBy: 'relevance'
    });
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'study_material':
        return `/content/study-material/${result.slug}`;
      case 'past_paper':
        return `/content/past-paper/${result.slug}`;
      case 'marketplace':
        return `/marketplace/${result.slug}`;
      case 'blog':
        return `/blog/${result.slug}`;
      default:
        return '#';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study_material':
        return <BookOpen className="h-4 w-4" />;
      case 'past_paper':
        return <FileText className="h-4 w-4" />;
      case 'marketplace':
        return <ShoppingCart className="h-4 w-4" />;
      case 'blog':
        return <BlogIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'study_material':
        return 'Study Material';
      case 'past_paper':
        return 'Past Paper';
      case 'marketplace':
        return 'Marketplace';
      case 'blog':
        return 'Blog Post';
      default:
        return 'Content';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search Results
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  name="search"
                  type="text"
                  placeholder="Search materials, papers, marketplace, blog posts..."
                  defaultValue={query}
                  className="pl-10 pr-4 py-3 text-lg"
                />
                <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </div>
            </form>
            
            {query && (
              <p className="text-gray-600">
                Showing results for: <span className="font-semibold">"{query}"</span>
              </p>
            )}

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Database Connected: {dbStatus.connected ? '✅ Yes' : '❌ No'}</p>
                  <p>Available Tables: {dbStatus.tables.join(', ') || 'None'}</p>
                  <p>Current Query: {query || 'None'}</p>
                  <p>Results Count: {results.length}</p>
                  <p>Loading State: {loading ? 'Yes' : 'No'}</p>
                </div>
                
                {/* Test Search Button */}
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchParams({ q: 'test' })}
                    className="mr-2"
                  >
                    Test Search "test"
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchParams({ q: 'mathematics' })}
                  >
                    Test Search "mathematics"
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Filters and Results */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Content Type</label>
                    <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="study_material">Study Materials</SelectItem>
                        <SelectItem value="past_paper">Past Papers</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                        <SelectItem value="blog">Blog Posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="nepali">Nepali</SelectItem>
                        <SelectItem value="social_studies">Social Studies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grade Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Grade</label>
                    <Select value={filters.grade} onValueChange={(value) => setFilters(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Grades</SelectItem>
                        <SelectItem value="1">Grade 1</SelectItem>
                        <SelectItem value="2">Grade 2</SelectItem>
                        <SelectItem value="3">Grade 3</SelectItem>
                        <SelectItem value="4">Grade 4</SelectItem>
                        <SelectItem value="5">Grade 5</SelectItem>
                        <SelectItem value="6">Grade 6</SelectItem>
                        <SelectItem value="7">Grade 7</SelectItem>
                        <SelectItem value="8">Grade 8</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                    <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0">
                            {result.thumbnail_url ? (
                              <img
                                src={result.thumbnail_url}
                                alt={result.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                {getTypeIcon(result.type)}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
                              {result.category && (
                                <Badge variant="outline" className="text-xs">
                                  {result.category}
                                </Badge>
                              )}
                              {result.grade && (
                                <Badge variant="outline" className="text-xs">
                                  Grade {result.grade}
                                </Badge>
                              )}
                              {result.price && (
                                <Badge variant="default" className="text-xs">
                                  ₹{result.price}
                                </Badge>
                              )}
                            </div>
                            
                            <Link to={getResultLink(result)} className="block">
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                                {result.title}
                              </h3>
                            </Link>
                            
                            {result.description && (
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {result.description}
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-500">
                              {new Date(result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : query ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Search</h3>
                  <p className="text-gray-600 mb-6">
                    Enter a search term above to find study materials, past papers, marketplace items, and blog posts.
                  </p>
                  
                  {/* Quick Search Suggestions */}
                  <div className="max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Popular searches:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['mathematics', 'science', 'english', 'grade 10', 'past papers', 'study notes'].map((term) => (
                        <Button
                          key={term}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchParams({ q: term })}
                          className="text-xs"
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchPage;
