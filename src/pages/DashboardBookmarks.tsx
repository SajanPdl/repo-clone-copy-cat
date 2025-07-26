
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, BookOpen, FileText } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';

const DashboardBookmarks = () => {
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  const handleRemoveBookmark = async (bookmark: any) => {
    await removeBookmark(bookmark.content_type, bookmark.content_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookmarks</h1>
      
      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">No bookmarks yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start bookmarking study materials and past papers to see them here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {bookmark.content_type === 'study_material' ? (
                      <BookOpen className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                    <span>{bookmark.materialData?.title || 'Unknown Item'}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBookmark(bookmark)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  {bookmark.materialData?.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Type: {bookmark.content_type === 'study_material' ? 'Study Material' : 'Past Paper'}
                  </span>
                  <span>
                    Bookmarked: {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardBookmarks;
