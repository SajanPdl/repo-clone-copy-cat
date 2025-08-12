-- Migration: Comprehensive Notification System
-- This migration creates a complete notification system with real-time capabilities

-- 1. Create notification_types table for categorization
CREATE TABLE IF NOT EXISTS public.notification_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT 'blue',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type_id INTEGER NOT NULL REFERENCES public.notification_types(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create user_notification_preferences table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type_id INTEGER NOT NULL REFERENCES public.notification_types(id),
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, type_id)
);

-- 4. Create notification_templates table for reusable messages
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type_id INTEGER NOT NULL REFERENCES public.notification_types(id),
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type_id ON public.notifications(type_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_type_id ON public.user_notification_preferences(type_id);

-- 6. Enable RLS
ALTER TABLE public.notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Notification types: readable by all authenticated users
DROP POLICY IF EXISTS "Notification types are viewable by authenticated users" ON public.notification_types;
CREATE POLICY "Notification types are viewable by authenticated users" ON public.notification_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- Notifications: users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, archive)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all notifications
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.is_admin(auth.uid()));

-- User preferences: users can manage their own preferences
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "Users can view own notification preferences" ON public.user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON public.user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all preferences
DROP POLICY IF EXISTS "Admins can view all notification preferences" ON public.user_notification_preferences;
CREATE POLICY "Admins can view all notification preferences" ON public.user_notification_preferences
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Templates: readable by all authenticated users, manageable by admins
DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON public.notification_templates;
CREATE POLICY "Templates are viewable by authenticated users" ON public.notification_templates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage templates" ON public.notification_templates;
CREATE POLICY "Admins can manage templates" ON public.notification_templates
  FOR ALL USING (public.is_admin(auth.uid()));

-- 8. Insert default notification types
INSERT INTO public.notification_types (name, description, icon, color) VALUES
  ('system_alert', 'System notifications and alerts', 'bell', 'red'),
  ('marketplace_update', 'Marketplace activity updates', 'shopping-cart', 'green'),
  ('study_alert', 'Study material and academic updates', 'book-open', 'blue'),
  ('event_reminder', 'Event reminders and deadlines', 'calendar', 'purple'),
  ('promotion', 'Promotional offers and bonuses', 'gift', 'orange'),
  ('payment', 'Payment and financial updates', 'credit-card', 'emerald'),
  ('achievement', 'Achievement and reward notifications', 'award', 'yellow'),
  ('admin_announcement', 'Administrative announcements', 'megaphone', 'indigo')
ON CONFLICT (name) DO NOTHING;

-- 9. Insert default notification templates
INSERT INTO public.notification_templates (name, type_id, title_template, message_template, variables) VALUES
  ('pro_plan_expiry', 1, 'Pro Plan Expiring Soon', 'Your Pro plan will expire on {{expiry_date}}. Renew now to continue enjoying premium features!', '{"expiry_date": "date"}'),
  ('book_sold', 2, 'Book Sold!', 'Congratulations! Your book "{{book_title}}" has been sold for ₹{{price}}.', '{"book_title": "string", "price": "number"}'),
  ('new_material', 3, 'New Study Material Available', 'New {{subject}} material for Grade {{grade}} has been uploaded by {{uploader}}.', '{"subject": "string", "grade": "string", "uploader": "string"}'),
  ('event_reminder', 4, 'Event Reminder: {{event_name}}', 'Don''t forget! {{event_name}} is starting in {{time_until}}.', '{"event_name": "string", "time_until": "string"}'),
  ('promo_discount', 5, 'Special Discount: {{discount}}% Off', 'Limited time offer! Get {{discount}}% off on Pro plan upgrade. Use code: {{code}}', '{"discount": "number", "code": "string"}'),
  ('payment_approved', 6, 'Payment Approved', 'Your payment of ₹{{amount}} has been approved and credited to your wallet.', '{"amount": "number"}'),
  ('achievement_unlocked', 7, 'Achievement Unlocked: {{achievement_name}}', 'Congratulations! You''ve earned the {{achievement_name}} achievement!', '{"achievement_name": "string"}'),
  ('admin_announcement', 8, 'Announcement: {{title}}', '{{message}}', '{"title": "string", "message": "string"}')
ON CONFLICT (name) DO NOTHING;

-- 10. Create functions for notification management
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type_name VARCHAR(100),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_priority VARCHAR(20) DEFAULT 'normal',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_type_id INTEGER;
  v_notification_id UUID;
BEGIN
  -- Get notification type ID
  SELECT id INTO v_type_id FROM public.notification_types WHERE name = p_type_name AND is_active = true;
  
  IF v_type_id IS NULL THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type_name;
  END IF;
  
  -- Check if user has enabled this notification type
  IF NOT EXISTS (
    SELECT 1 FROM public.user_notification_preferences 
    WHERE user_id = p_user_id AND type_id = v_type_id AND in_app_enabled = true
  ) THEN
    -- Create default preference if none exists
    INSERT INTO public.user_notification_preferences (user_id, type_id, in_app_enabled)
    VALUES (p_user_id, v_type_id, true)
    ON CONFLICT (user_id, type_id) DO NOTHING;
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type_id, title, message, data, priority, expires_at)
  VALUES (p_user_id, v_type_id, p_title, p_message, p_data, p_priority, p_expires_at)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE user_id = auth.uid() AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.notifications
  WHERE user_id = auth.uid() AND is_read = false AND (expires_at IS NULL OR expires_at > now());
  
  RETURN v_count;
END;
$$;

-- Function to get recent notifications
CREATE OR REPLACE FUNCTION public.get_recent_notifications(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  type_name VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  data JSONB,
  priority VARCHAR(20),
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  icon VARCHAR(50),
  color VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    nt.name as type_name,
    n.title,
    n.message,
    n.data,
    n.priority,
    n.is_read,
    n.created_at,
    nt.icon,
    nt.color
  FROM public.notifications n
  JOIN public.notification_types nt ON n.type_id = nt.id
  WHERE n.user_id = auth.uid() 
    AND n.is_archived = false
    AND (n.expires_at IS NULL OR n.expires_at > now())
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Function to archive old notifications
CREATE OR REPLACE FUNCTION public.archive_old_notifications(p_days_old INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_archived = true, updated_at = now()
  WHERE user_id = auth.uid() 
    AND created_at < now() - INTERVAL '1 day' * p_days_old
    AND is_archived = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 11. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_updated_at();

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_types TO authenticated;
GRANT ALL ON public.user_notification_preferences TO authenticated;
GRANT ALL ON public.notification_templates TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, VARCHAR, VARCHAR, TEXT, JSONB, VARCHAR, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_notifications(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_old_notifications(INTEGER) TO authenticated;
