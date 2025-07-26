
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Heart, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardBookmarks = () => {
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  const handleRemoveBookmark = async (bookmarkId: string) => {
    await removeBookmark(bookmarkId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">My Bookmarks</h2>
        <p className="text-gray-600">Your saved materials and resources</p>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-gray-600">
              Start bookmarking materials to see them here.
            </p>
            <Button asChild className="mt-4">
              <Link to="/study-materials">Browse Materials</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {bookmark.materialData?.title || 'Unknown Material'}
                  </CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {bookmark.content_type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {bookmark.materialData?.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Saved on {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/content/${bookmark.content_id}`}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
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
