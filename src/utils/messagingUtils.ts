
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    email: string;
  };
}

export const fetchUserMessages = async (userId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform notifications to message format for compatibility
    return (data || []).map(notification => ({
      id: notification.id,
      sender_id: 'system',
      recipient_id: notification.user_id,
      subject: notification.title,
      message: notification.message,
      is_read: notification.is_read,
      created_at: notification.created_at,
      updated_at: notification.created_at,
      sender_profile: {
        email: 'System'
      }
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
