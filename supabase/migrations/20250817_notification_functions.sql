-- Enhanced Notification System Migration - Part 2
-- RPC Functions and Security Policies

-- Get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_val INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_val
    FROM public.notifications
    WHERE user_id = auth.uid()
    AND is_read = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN COALESCE(count_val, 0);
END;
$$;

-- Get recent notifications with filtering
CREATE OR REPLACE FUNCTION public.get_recent_notifications(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_filter VARCHAR(20) DEFAULT 'all'
)
RETURNS TABLE (
    id UUID,
    type_name VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    priority VARCHAR(20),
    category VARCHAR(50),
    thumbnail_url TEXT,
    action_url TEXT,
    action_text VARCHAR(100),
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
        n.type_name,
        n.title,
        n.message,
        n.data,
        n.priority,
        n.category,
        n.thumbnail_url,
        n.action_url,
        n.action_text,
        n.is_read,
        n.created_at,
        nt.icon,
        nt.color
    FROM public.notifications n
    LEFT JOIN public.notification_types nt ON n.type_name = nt.name
    WHERE n.user_id = auth.uid()
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
    AND CASE 
        WHEN p_filter = 'unread' THEN n.is_read = FALSE
        WHEN p_filter = 'important' THEN n.priority IN ('high', 'urgent')
        ELSE TRUE
    END
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE id = p_notification_id
    AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = auth.uid()
    AND is_read = FALSE;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$;

-- Create notification (admin function)
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type_name VARCHAR(100),
    p_title VARCHAR(255),
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_priority VARCHAR(20) DEFAULT 'normal',
    p_category VARCHAR(50) DEFAULT 'messages',
    p_thumbnail_url TEXT DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_action_text VARCHAR(100) DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_group_id VARCHAR(100) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Check if user is admin or creating notification for themselves
    IF NOT (auth.uid() = p_user_id OR public.is_admin(auth.uid())) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can create notifications for other users';
    END IF;
    
    INSERT INTO public.notifications (
        user_id,
        type_name,
        title,
        message,
        data,
        priority,
        category,
        thumbnail_url,
        action_url,
        action_text,
        expires_at,
        group_id
    ) VALUES (
        p_user_id,
        p_type_name,
        p_title,
        p_message,
        p_data,
        p_priority,
        p_category,
        p_thumbnail_url,
        p_action_url,
        p_action_text,
        p_expires_at,
        p_group_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Archive old notifications
CREATE OR REPLACE FUNCTION public.archive_old_notifications(p_days_old INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- For now, we'll just delete old notifications
    -- In a production system, you might want to move them to an archive table
    DELETE FROM public.notifications
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_old
    AND is_read = TRUE;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$;

-- Get notification statistics
CREATE OR REPLACE FUNCTION public.get_notification_stats(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    total_sent INTEGER,
    total_read INTEGER,
    total_clicked INTEGER,
    read_rate NUMERIC,
    click_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total_sent,
            COUNT(*) FILTER (WHERE is_read) as total_read,
            COUNT(*) FILTER (WHERE data->>'clicked' = 'true') as total_clicked
        FROM public.notifications
        WHERE user_id = auth.uid()
        AND created_at >= NOW() - INTERVAL '1 day' * p_days
    )
    SELECT 
        total_sent,
        total_read,
        total_clicked,
        CASE WHEN total_sent > 0 THEN (total_read::NUMERIC / total_sent * 100) ELSE 0 END as read_rate,
        CASE WHEN total_sent > 0 THEN (total_clicked::NUMERIC / total_sent * 100) ELSE 0 END as click_rate
    FROM stats;
END;
$$;

-- Set up Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications" ON public.notifications
    FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for user_notification_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_notification_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_notification_preferences;
CREATE POLICY "Users can update their own preferences" ON public.user_notification_preferences
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all preferences" ON public.user_notification_preferences;
CREATE POLICY "Admins can view all preferences" ON public.user_notification_preferences
    FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for push_subscriptions
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notification_types (readable by all authenticated users)
DROP POLICY IF EXISTS "Notification types are viewable by authenticated users" ON public.notification_types;
CREATE POLICY "Notification types are viewable by authenticated users" ON public.notification_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.user_notification_preferences TO authenticated;
GRANT ALL ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.notification_types TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_notifications(INTEGER, INTEGER, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, VARCHAR, VARCHAR, TEXT, JSONB, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR, TIMESTAMP WITH TIME ZONE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_old_notifications(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_notification_stats(INTEGER) TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON public.user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON public.user_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean up expired notifications (can be called by a cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_notifications() TO authenticated;
