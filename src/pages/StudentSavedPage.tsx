
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  BookOpen,
  FileText,
  ExternalLink,
  Calendar,
  Download,
  Sparkles
} from 'lucide-react';

const StudentSavedPage = () => {
  const navigate = useNavigate();
  const { bookmarks, loading: bookmarksLoading, removeBookmark } = useBookmarks();

  const handleItemClick = (bookmark: any) => {
    if (bookmark.content_type === 'study_material') {
      navigate(`/content/${bookmark.content_id}`);
    } else if (bookmark.content_type === 'past_paper') {
      navigate(`/past-paper/${bookmark.content_id}`);
    }
  };

  const handleRemoveBookmark = async (bookmark: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeBookmark(bookmark.content_type, bookmark.content_id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-4 px-6 py-4">
                <SidebarTrigger className="lg:hidden" />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Saved Materials
                    </h1>
                    <p className="text-gray-600 text-sm">Your bookmarked study resources</p>
                  </div>
                </motion.div>
              </div>
            </header>
            <main className="p-6">
              <div className="space-y-8 max-w-7xl mx-auto">
                {bookmarksLoading ? (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-gray-600 text-lg">Loading your saved materials...</p>
                  </div>
                ) : bookmarks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <div className="relative mb-8">
                      <Heart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2"
                      >
                        <Sparkles className="h-8 w-8 text-purple-400" />
                      </motion.div>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                      No saved materials yet
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                      Start bookmarking study materials and past papers to create your personal collection.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        onClick={() => navigate('/study-materials')}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-3 text-lg"
                      >
                        <BookOpen className="h-5 w-5 mr-2" />
                        Browse Study Materials
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/past-papers')}
                        className="border-2 border-gray-200 hover:border-gray-300 px-8 py-3 text-lg"
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Browse Past Papers
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">
                            Your Collection
                          </h2>
                          <p className="text-gray-600">
                            {bookmarks.length} saved {bookmarks.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
                        {bookmarks.length} items
                      </Badge>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <AnimatePresence>
                        {bookmarks.map((bookmark, index) => (
                          <motion.div
                            key={bookmark.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group"
                          >
                            <Card className="h-full cursor-pointer backdrop-blur-lg bg-white/80 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                              <div className="relative">
                                <div className={`absolute inset-0 bg-gradient-to-r ${
                                  bookmark.content_type === 'study_material' 
                                    ? 'from-blue-500/10 to-cyan-500/10' 
                                    : 'from-green-500/10 to-emerald-500/10'
                                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                
                                <CardContent className="p-6 relative z-10">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                      {bookmark.content_type === 'study_material' ? (
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                          <BookOpen className="h-4 w-4 text-blue-600" />
                                        </div>
                                      ) : (
                                        <div className="p-2 bg-green-100 rounded-lg">
                                          <FileText className="h-4 w-4 text-green-600" />
                                        </div>
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        {bookmark.content_type === 'study_material' ? 'Study Material' : 'Past Paper'}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleRemoveBookmark(bookmark, e)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Heart className="h-4 w-4 fill-current" />
                                    </Button>
                                  </div>
                                  
                                  <h3 className="font-semibold mb-3 line-clamp-2 text-gray-800 text-lg">
                                    {bookmark.materialData?.title || 'Unknown Material'}
                                  </h3>
                                  
                                  <div className="space-y-2 mb-4">
                                    {bookmark.materialData?.subject && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject:</span>
                                        <span className="text-sm text-gray-700 font-medium">{bookmark.materialData.subject}</span>
                                      </div>
                                    )}
                                    {bookmark.materialData?.grade && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grade:</span>
                                        <span className="text-sm text-gray-700 font-medium">{bookmark.materialData.grade}</span>
                                      </div>
                                    )}
                                    {bookmark.materialData?.category && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category:</span>
                                        <span className="text-sm text-gray-700 font-medium">{bookmark.materialData.category}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Saved {new Date(bookmark.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Download className="h-3 w-3" />
                                      <span>{bookmark.materialData?.downloads || 0}</span>
                                    </div>
                                  </div>

                                  <Button 
                                    size="sm" 
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                                    onClick={() => handleItemClick(bookmark)}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-2" />
                                    View Material
                                  </Button>
                                </CardContent>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudentSavedPage;
