-- Enhanced Notification System Migration - Part 1
-- Core tables and basic functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enhanced notifications table with all new features
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'messages' CHECK (category IN ('study', 'payment', 'marketplace', 'ads', 'ai', 'events', 'messages', 'orders', 'approvals')),
    thumbnail_url TEXT,
    action_url TEXT,
    action_text VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    group_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification types table
CREATE TABLE IF NOT EXISTS public.notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    category VARCHAR(50) DEFAULT 'messages',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type_id INTEGER REFERENCES public.notification_types(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    muted_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, type_id)
);

-- Create push subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_group_id ON public.notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_type_id ON public.user_notification_preferences(type_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Insert default notification types
INSERT INTO public.notification_types (name, description, icon, color, category) VALUES
('study_material_added', 'New study material notifications', '📚', 'blue', 'study'),
('payment_approved', 'Payment approval notifications', '💰', 'green', 'payment'),
('withdrawal_approved', 'Withdrawal approval notifications', '✅', 'green', 'payment'),
('book_sold', 'Book sale notifications', '🛒', 'orange', 'marketplace'),
('order_status_update', 'Order status update notifications', '📦', 'yellow', 'orders'),
('event_reminder', 'Event reminder notifications', '📅', 'red', 'events'),
('achievement_unlocked', 'Achievement unlock notifications', '🏆', 'indigo', 'ai'),
('pro_plan_expiry', 'Pro plan expiry notifications', '⚠️', 'red', 'payment'),
('promo_discount', 'Promotional discount notifications', '🎉', 'purple', 'ads'),
('admin_announcement', 'Admin announcement notifications', '📢', 'gray', 'messages'),
('ai_tip', 'AI assistant tip notifications', '🤖', 'indigo', 'ai'),
('system_alert', 'System alert notifications', '🔧', 'red', 'messages'),
('test_notification', 'Test notification type', '🧪', 'gray', 'messages')
ON CONFLICT (name) DO NOTHING;
