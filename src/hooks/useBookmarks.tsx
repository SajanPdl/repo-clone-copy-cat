
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addStudentActivity } from '@/utils/studentDashboardUtils';

export interface BookmarkItem {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
  materialData?: any;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch material data for each bookmark
      const bookmarksWithData = await Promise.all(
        (data || []).map(async (bookmark) => {
          let materialData = null;
          
          if (bookmark.content_type === 'study_material') {
            const { data: material } = await supabase
              .from('study_materials')
              .select('*')
              .eq('id', parseInt(bookmark.content_id))
              .single();
            materialData = material;
          } else if (bookmark.content_type === 'past_paper') {
            const { data: paper } = await supabase
              .from('past_papers')
              .select('*')
              .eq('id', parseInt(bookmark.content_id))
              .single();
            materialData = paper;
          }
          
          return { ...bookmark, materialData };
        })
      );

      setBookmarks(bookmarksWithData);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bookmarks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (contentType: string, contentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId
        });

      if (error) throw error;

      // Add points for bookmarking
      await addStudentActivity(user.id, 'bookmark', 1, `Bookmarked ${contentType}`);

      toast({
        title: 'Bookmarked!',
        description: 'Item added to your saved collection (+1 point)'
      });

      fetchBookmarks();
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to bookmark item',
        variant: 'destructive'
      });
      return false;
    }
  };

  const removeBookmark = async (contentType: string, contentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) throw error;

      toast({
        title: 'Bookmark removed',
        description: 'Item removed from your saved collection'
      });

      fetchBookmarks();
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark',
        variant: 'destructive'
      });
      return false;
    }
  };

  const isBookmarked = (contentType: string, contentId: string): boolean => {
    return bookmarks.some(bookmark => 
      bookmark.content_type === contentType && bookmark.content_id === contentId
    );
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refetch: fetchBookmarks
  };
};
