-- ============================================
-- Migration 00010: Remove in-app chat system
-- ============================================

-- Remove realtime publication for messages and conversations
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.conversations;

-- Drop triggers on messages
DROP TRIGGER IF EXISTS on_new_message_update_conversation ON public.messages;
DROP FUNCTION IF EXISTS public.update_conversation_on_new_message();

-- Drop the messages table (depends on conversations)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Drop triggers on conversations
DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;

-- Drop the conversations table
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Drop the unread count RPC function
DROP FUNCTION IF EXISTS public.get_unread_count(UUID);

-- NOTE: update_updated_at() is NOT dropped — it is shared by profiles and listings
