/**
 * 🚀 VIBE INDEX ROUTE
 * Default chat page - shows new chat or redirects to active conversation
 * Replaces: path="/" and path="chat" from web router
 */

import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import ChatPage from '../../components/agent/ChatPage';
import useAuth from '../../hooks/useAuth';
import { useVibe } from '../../hooks/useVibe';
import { getItem } from '../../utils/storage';

export default function VibeIndex() {
  const { currentConversationId, navigating } = useVibe();
  const { currentCompany } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = React.useState(true);
  const hasRedirected = React.useRef(false);

  // Debug logging disabled for production
  // console.log('VibeIndex - State:', { checking, navigating, currentConversationId, hasCompany: !!currentCompany });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 VibeIndex: Starting auth check...');
      
      // Prevent multiple redirects
      if (hasRedirected.current) {
        console.log('⚠️ VibeIndex: Already redirected, skipping');
        return;
      }

      const token = await getItem('token');
      
      if (!token) {
        console.log('⚠️ No token found - redirecting to login');
        hasRedirected.current = true;
        router.replace('/auth/signup');
        return;
      }
      
      // 🚨 Check if token is Cognito JWT (invalid)
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const header = JSON.parse(atob(tokenParts[0]));
          if (header.kid) {
            console.error('❌ VIBE: Cognito JWT detected - cannot access vibe page');
            console.error('   Redirecting to login...');
            const { removeItem: removeStorageItem } = await import('../../utils/storage');
            await removeStorageItem('token');
            await removeStorageItem('refresh_token');
            await removeStorageItem('refresh_auth_token');
            await removeStorageItem('refresh_token_company');
            hasRedirected.current = true;
            router.replace('/auth/signup');
            return;
          }
        }
      } catch {
        // Error, continue
        console.log('⚠️ Could not decode token');
      }
      
      // Check if company is selected
      // Note: Allow agent page to load even without company (user will see workspace selector dropdown)
      if (!currentCompany || !currentCompany.id) {
        console.log('⚠️ No company selected - Agent page will show workspace selector dropdown');
        console.log('   Matches web app behavior - user can select/create workspace from agent');
      } else {
        console.log('✅ Auth check passed - company:', currentCompany.name || currentCompany.companyName);
      }
      
      setChecking(false);
      console.log('✅ VibeIndex: Auth check complete');
    };
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (checking) {
        console.log('⏱️ VibeIndex: Auth check timeout - completing anyway');
        setChecking(false);
      }
    }, 10000); // 10 second timeout to allow backend calls
    
    checkAuth();
    
    return () => clearTimeout(timeoutId);
    // ⭐ CRITICAL: Minimal dependencies to prevent infinite loops
    // Router is needed for navigation, others cause re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Redirect to active conversation if one exists
  useEffect(() => {
    if (!checking && currentConversationId) {
      console.log('📱 Redirecting to conversation:', currentConversationId);
      // router.replace(`/vibe/${currentConversationId}`); // Disabled for now to keep user on main chat page
    }
  }, [currentConversationId, checking]);

  if (checking || navigating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  
  // If no active conversation, show default new chat page
  return <ChatPage />;
}
