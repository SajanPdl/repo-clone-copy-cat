
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/StudentSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';
import Navbar from '@/components/Navbar';
import {
  Heart,
  BookOpen,
  FileText,
  ExternalLink,
  Calendar,
  Download
} from 'lucide-react';

const StudentSavedPage = () => {
  const navigate = useNavigate();
  const { bookmarks, loading: bookmarksLoading, removeBookmark } = useBookmarks();

  const handleItemClick = (bookmark: any) => {
    if (bookmark.content_type === 'study_material' && bookmark.materialData?.slug) {
      navigate(`/content/study-material/${bookmark.materialData.slug}`);
    } else if (bookmark.content_type === 'past_paper' && bookmark.materialData?.slug) {
      navigate(`/content/past-paper/${bookmark.materialData.slug}`);
    }
  };

  const handleRemoveBookmark = async (bookmark: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeBookmark(bookmark.content_type, bookmark.content_id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SidebarProvider>
        <div className="flex w-full">
          <StudentSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Saved Materials
                </h1>
              </div>
            </header>
            <main className="p-6">
              <div className="space-y-6">
                {bookmarksLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookmarks...</p>
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No saved materials yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start bookmarking study materials and past papers to see them here.
                    </p>
                    <div className="space-x-4">
                      <Button onClick={() => navigate('/study-materials')}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Study Materials
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/past-papers')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Browse Past Papers
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">
                        {bookmarks.length} saved {bookmarks.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bookmarks.map((bookmark) => (
                        <Card 
                          key={bookmark.id} 
                          className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleItemClick(bookmark)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {bookmark.content_type === 'study_material' ? (
                                  <BookOpen className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <FileText className="h-5 w-5 text-green-500" />
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {bookmark.content_type === 'study_material' ? 'Study Material' : 'Past Paper'}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleRemoveBookmark(bookmark, e)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h3 className="font-semibold mb-2 line-clamp-2">
                              {bookmark.materialData?.title || 'Unknown Material'}
                            </h3>
                            
                            <div className="space-y-2 mb-4">
                              {bookmark.materialData?.subject && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Subject:</span> {bookmark.materialData.subject}
                                </p>
                              )}
                              {bookmark.materialData?.grade && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Grade:</span> {bookmark.materialData.grade}
                                </p>
                              )}
                              {bookmark.materialData?.category && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Category:</span> {bookmark.materialData.category}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Saved {new Date(bookmark.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                <span>{bookmark.materialData?.downloads || 0}</span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <Button size="sm" className="w-full">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                View Material
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
