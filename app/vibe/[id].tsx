/**
 * 🚀 VIBE DYNAMIC CONVERSATION ROUTE
 * Displays specific conversation by ID
 * Replaces: path=":conversationId" from web router
 * 
 * Usage: /vibe/abc123 -> loads conversation with id "abc123"
 */

import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import ChatPage from '../../components/agent/ChatPage';
import { useVibe } from '../../hooks/useVibe';

export default function VibeConversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addConversationFromSidebar } = useVibe();

  // Sync URL ID with Redux state when this screen loads
  useEffect(() => {
    if (id && typeof id === 'string') {
      console.log('📱 Route changed to conversation:', id);
      addConversationFromSidebar(id);
    }
  }, [id, addConversationFromSidebar]);

  return <ChatPage />;
}
