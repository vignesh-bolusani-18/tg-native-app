// app/index.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getItem } from '../utils/storage';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, currentCompany, userInfo } = useSelector((state: any) => state.auth);
  const [, setIsChecking] = useState(true);
  const hasRedirected = React.useRef(false);
  const retryCount = React.useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    // Add overall timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!hasRedirected.current) {
        console.error('⏱️ AUTH CHECK TIMEOUT - Redirecting to signup');
        hasRedirected.current = true;
        router.replace('/auth/signup');
      }
    }, 10000); // 10 second timeout

    const performAuthCheck = async () => {
      try {
        console.log('🔍 INDEX: Checking authentication...');
        console.log('📊 Redux state:', { isAuthenticated, hasCompany: !!currentCompany, hasUserInfo: !!userInfo });
        
        const token = await getItem('token');
        const refreshTokenCompany = await getItem('refresh_token_company');
        const refreshAuthToken = await getItem('refresh_auth_token');
        
        console.log('📊 Stored Tokens:', {
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 30) + '...' : 'none',
          hasRefreshTokenCompany: !!refreshTokenCompany,
          hasRefreshAuthToken: !!refreshAuthToken,
        });
        
        if (!token) {
          console.log('❌ NO TOKEN - Redirecting to /auth/signup');
          hasRedirected.current = true;
          router.replace('/auth/signup');
          setIsChecking(false);
          return;
        }
        
        // 🚨 CRITICAL: Validate token structure and expiry
        let isValidToken = false;
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const header = JSON.parse(atob(tokenParts[0]));
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Check if Cognito JWT (might be temporary during login flow)
            if (header.kid) {
              console.warn('⚠️ DETECTED COGNITO JWT TOKEN');
              
              // If we have refresh_auth_token, the auth flow is complete but token wasn't replaced
              // This means validateUser succeeded but getAccessToken failed
              if (refreshAuthToken) {
                console.log('✅ Found refresh_auth_token - exchanging for valid token...');
                try {
                  const { getUserById } = await import('../utils/getUserById');
                  const backendToken = await getUserById(refreshAuthToken);
                  
                  // Store the backend token
                  const { setItem } = await import('../utils/storage');
                  await setItem('token', backendToken);
                  
                  console.log('✅ Token exchanged successfully - continuing auth check');
                  
                  // Retry auth check with new token
                  setTimeout(() => performAuthCheck(), 50);
                  return;
                } catch (exchangeError) {
                  console.error('❌ Failed to exchange token:', exchangeError);
                  throw new Error('Invalid token type');
                }
              } else {
                // No refresh_auth_token means auth flow is still in progress
                // Wait for auth flow to complete (but limit retries)
                retryCount.current += 1;
                if (retryCount.current >= MAX_RETRIES) {
                  console.error('❌ Max retries reached - Auth flow incomplete');
                  throw new Error('Auth flow incomplete');
                }
                console.log(`⏳ Auth flow in progress - waiting... (attempt ${retryCount.current}/${MAX_RETRIES})`);
                setTimeout(() => performAuthCheck(), 500);
                return;
              }
            }
            
            // Check if token is expired
            if (payload.exp) {
              const now = Math.floor(Date.now() / 1000);
              if (payload.exp < now) {
                console.error('❌ TOKEN EXPIRED');
                console.error(`   Expired at: ${new Date(payload.exp * 1000).toISOString()}`);
                console.error(`   Current time: ${new Date(now * 1000).toISOString()}`);
                throw new Error('Token expired');
              }
            }
            
            // Check if token has required fields
            if (!payload.email && !payload.userEmail) {
              console.error('❌ TOKEN MISSING EMAIL FIELD');
              throw new Error('Invalid token structure');
            }
            
            console.log('✅ Token is valid Backend JWT');
            console.log(`   Email: ${payload.email || payload.userEmail}`);
            console.log(`   Expires: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown'}`);
            isValidToken = true;
          } else {
            console.error('❌ INVALID TOKEN FORMAT');
            throw new Error('Invalid token format');
          }
        } catch (tokenError) {
          const error = tokenError as Error;
          if (error.message === 'Invalid token type' || error.message === 'Invalid token format' || error.message === 'Token expired' || error.message === 'Invalid token structure') {
            console.error('❌ TOKEN VALIDATION FAILED:', error.message);
            console.error('   Clearing storage and forcing re-login...');
            
            // Clear all storage
            const { removeItem } = await import('../utils/storage');
            await removeItem('token');
            await removeItem('refresh_token');
            await removeItem('refresh_auth_token');
            await removeItem('refresh_token_company');
            
            hasRedirected.current = true;
            console.log('✅ Storage cleared - Redirecting to login');
            router.replace('/auth/signup');
            setIsChecking(false);
            return;
          }
          throw tokenError;
        }
        
        if (!isValidToken) {
          hasRedirected.current = true;
          console.log('❌ Token validation failed - Redirecting to login');
          router.replace('/auth/signup');
          setIsChecking(false);
          return;
        }
        
        console.log('✅ TOKEN VALID');
        
        // Check if userInfo exists in Redux (set during login)
        if (userInfo && userInfo.email) {
          console.log('✅ UserInfo loaded:', userInfo.email);
          console.log('   UserID:', userInfo.userID || 'not set');
        } else {
          console.log('⚠️ UserInfo not in Redux - may need to re-login');
        }
        
        // Check Redux state for company (more reliable than storage)
        if (currentCompany && currentCompany.id) {
          console.log('✅ Company selected in Redux - Redirecting to /vibe (Agent)');
          console.log('   Company:', currentCompany.companyName || currentCompany.name);
          hasRedirected.current = true;
          router.replace('/vibe');
        } else if (refreshTokenCompany) {
          console.log('✅ Company token in storage - Redirecting to /vibe (Agent)');
          hasRedirected.current = true;
          router.replace('/vibe');
        } else {
          // No company - redirect to agent page anyway (user will see workspace selector dropdown)
          // This matches web app behavior - user goes to agent and can create workspace from dropdown
          console.log('⚠️ No company selected - Redirecting to /vibe (Agent will show workspace selector)');
          hasRedirected.current = true;
          router.replace('/vibe');
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check error:', error);
        hasRedirected.current = true;
        router.replace('/auth/signup');
        setIsChecking(false);
      }
    };
    
    performAuthCheck();

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [router, isAuthenticated, currentCompany, userInfo]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#0C66E4" />
    </View>
  );
}