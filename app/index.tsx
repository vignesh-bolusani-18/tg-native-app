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
  const hasRestoredState = React.useRef(false); // ⭐ Prevent infinite restoration loop
  const retryCount = React.useRef(0);
  const MAX_RETRIES = 3;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ⭐ CRITICAL: Check if this is truly initial load or just app coming back from background
  useEffect(() => {
    const checkInitialLoad = async () => {
      const hasCompletedAuth = await getItem('auth_completed');
      if (hasCompletedAuth === 'true') {
        // console.log('✅ Auth already completed - skipping redirect');
        hasRedirected.current = true;
        setIsInitialLoad(false);
        // User is already authenticated, just stay on current route
        return;
      }
      setIsInitialLoad(true);
    };
    checkInitialLoad();
  }, []);

  useEffect(() => {
    // Skip if not initial load (coming back from background/file picker)
    if (!isInitialLoad) {
      // console.log('⚠️ Not initial load - skipping auth check');
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    // Add overall timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!hasRedirected.current) {
        // console.error('⏱️ AUTH CHECK TIMEOUT - Redirecting to signup');
        hasRedirected.current = true;
        router.replace('/auth/signup');
      }
    }, 10000); // 10 second timeout

    const performAuthCheck = async () => {
      try {
        // console.log('🔍 INDEX: Checking authentication...');
        // console.log('📊 Redux state:', { isAuthenticated, hasCompany: !!currentCompany, hasUserInfo: !!userInfo });
        
        const token = await getItem('token');
        const refreshTokenCompany = await getItem('refresh_token_company');
        const refreshAuthToken = await getItem('refresh_auth_token');
        
        // console.log('📊 Stored Tokens:', {
        //   hasToken: !!token,
        //   tokenPreview: token ? token.substring(0, 30) + '...' : 'none',
        //   hasRefreshTokenCompany: !!refreshTokenCompany,
        //   hasRefreshAuthToken: !!refreshAuthToken,
        // });
        
        if (!token) {
          // console.log('❌ NO TOKEN - Redirecting to /auth/signup');
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
              // console.warn('⚠️ DETECTED COGNITO JWT TOKEN');
              
              // If we have refresh_auth_token, the auth flow is complete but token wasn't replaced
              // This means validateUser succeeded but getAccessToken failed
              if (refreshAuthToken) {
                // console.log('✅ Found refresh_auth_token - exchanging for valid token...');
                try {
                  const { getUserById } = await import('../utils/getUserById');
                  const backendToken = await getUserById(refreshAuthToken);
                  
                  // Store the backend token
                  const { setItem } = await import('../utils/storage');
                  await setItem('token', backendToken);
                  
                  // console.log('✅ Token exchanged successfully - continuing auth check');
                  
                  // Retry auth check with new token
                  setTimeout(() => performAuthCheck(), 50);
                  return;
                } catch (exchangeError) {
                  // console.error('❌ Failed to exchange token:', exchangeError);
                  throw new Error('Invalid token type');
                }
              } else {
                // No refresh_auth_token means auth flow is still in progress
                // Wait for auth flow to complete (but limit retries)
                retryCount.current += 1;
                if (retryCount.current >= MAX_RETRIES) {
                  // console.error('❌ Max retries reached - Auth flow incomplete');
                  throw new Error('Auth flow incomplete');
                }
                // console.log(`⏳ Auth flow in progress - waiting... (attempt ${retryCount.current}/${MAX_RETRIES})`);
                setTimeout(() => performAuthCheck(), 500);
                return;
              }
            }
            
            // Check if token is expired
            if (payload.exp) {
              const now = Math.floor(Date.now() / 1000);
              if (payload.exp < now) {
                // console.error('❌ TOKEN EXPIRED');
                // console.error(`   Expired at: ${new Date(payload.exp * 1000).toISOString()}`);
                // console.error(`   Current time: ${new Date(now * 1000).toISOString()}`);
                throw new Error('Token expired');
              }
            }
            
            // Check if token has required fields
            if (!payload.email && !payload.userEmail) {
              // console.error('❌ TOKEN MISSING EMAIL FIELD');
              throw new Error('Invalid token structure');
            }
            
            // console.log('✅ Token is valid Backend JWT');
            // console.log(`   Email: ${payload.email || payload.userEmail}`);
            // console.log(`   Expires: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown'}`);
            isValidToken = true;
          } else {
            // console.error('❌ INVALID TOKEN FORMAT');
            throw new Error('Invalid token format');
          }
        } catch (tokenError) {
          const error = tokenError as Error;
          if (error.message === 'Invalid token type' || error.message === 'Invalid token format' || error.message === 'Token expired' || error.message === 'Invalid token structure') {
            // console.error('❌ TOKEN VALIDATION FAILED:', error.message);
            // console.error('   Clearing storage and forcing re-login...');
            
            // Clear all storage
            const { removeItem } = await import('../utils/storage');
            await removeItem('token');
            await removeItem('refresh_token');
            await removeItem('refresh_auth_token');
            await removeItem('refresh_token_company');
            
            hasRedirected.current = true;
            // console.log('✅ Storage cleared - Redirecting to login');
            router.replace('/auth/signup');
            setIsChecking(false);
            return;
          }
          throw tokenError;
        }
        
        if (!isValidToken) {
          hasRedirected.current = true;
          // console.log('❌ Token validation failed - Redirecting to login');
          router.replace('/auth/signup');
          setIsChecking(false);
          return;
        }
        
        // console.log('✅ TOKEN VALID');
        
        // ⭐ CRITICAL: If Redux state is empty, restore it from token + fetch companies
        // Only run ONCE per session to prevent infinite loops
        if ((!userInfo || !userInfo.email || !currentCompany) && !hasRestoredState.current) {
          // console.log('⚠️ Redux state incomplete - Restoring from token and storage...');
          // console.log('   Missing userInfo:', !userInfo || !userInfo.email);
          // console.log('   Missing currentCompany:', !currentCompany);
          hasRestoredState.current = true; // Mark as restored to prevent re-runs
          
          try {
            // Import Redux dispatch and actions
            const { store } = await import('../redux/store');
            const { setUserInfo, setIsAuthenticated, setIsLoggedIn, loadCompanies, setCurrentCompany } = await import('../redux/slices/authSlice');
            
            // Restore userInfo from token
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const restoredUserInfo = {
                email: payload.email || payload.userEmail,
                userID: payload.userID || payload.sub,
                name: payload.name || payload.given_name || null,
              };
              
              console.log('📦 Restoring userInfo from token:', restoredUserInfo.email);
              store.dispatch(setUserInfo(restoredUserInfo));
              store.dispatch(setIsAuthenticated(true));
              store.dispatch(setIsLoggedIn(true));
            }
            
            // Fetch and restore companies
            console.log('🏢 Fetching companies from backend...');
            const { getCompaniesList } = await import('../utils/getCompaniesList');
            const { getRefreshToken } = await import('../utils/getRefreshToken');
            
            try {
              const companiesResponse = await getCompaniesList();
              let companies = companiesResponse?.companies || companiesResponse?.data?.companies || [];
              
              if (!Array.isArray(companies)) {
                companies = [];
              }
              
              console.log('✅ Companies fetched:', companies.length);
              
              // Sort by lastAccessed
              const sortedCompanies = [...companies].sort((a, b) => {
                const aLastAccessed = a.lastAccessed ?? 0;
                const bLastAccessed = b.lastAccessed ?? 0;
                return bLastAccessed - aLastAccessed;
              });
              
              // Store in Redux
              store.dispatch(loadCompanies(sortedCompanies));
              
              // Auto-select most recent company
              if (sortedCompanies.length > 0) {
                const mostRecent = sortedCompanies[0];
                const companyId = mostRecent.id || mostRecent.companyID;
                
                console.log('📍 Auto-selecting company:', mostRecent.companyName || mostRecent.name);
                
                // Get company refresh token
                try {
                  await getRefreshToken(companyId);
                  console.log('✅ Company refresh token obtained');
                } catch (tokenErr) {
                  console.warn('⚠️ Failed to get company refresh token:', tokenErr);
                }
                
                // Set in Redux
                store.dispatch(setCurrentCompany({
                  ...mostRecent,
                  id: companyId,
                  companyName: mostRecent.companyName || mostRecent.name,
                }));
                
                console.log('✅ Redux state restored successfully');
              } else {
                console.log('⚠️ No companies found - user will see workspace selector');
              }
            } catch (companyError) {
              console.error('❌ Failed to fetch companies:', companyError);
              store.dispatch(loadCompanies([]));
            }
          } catch (restoreError) {
            console.error('❌ Failed to restore Redux state:', restoreError);
          }
        }
        
        // Check if userInfo exists in Redux (set during login)
        if (userInfo && userInfo.email) {
          console.log('✅ UserInfo loaded:', userInfo.email);
          console.log('   UserID:', userInfo.userID || 'not set');
        } else {
          console.log('⚠️ UserInfo not in Redux after restore attempt');
        }
        
        // Always redirect to /vibe (agent page)
        // If no company, user will see workspace selector dropdown (matches web app)
        if (currentCompany && currentCompany.id) {
          console.log('✅ Company selected - Redirecting to /vibe (Agent)');
          console.log('   Company:', currentCompany.companyName || currentCompany.name);
        } else if (refreshTokenCompany) {
          console.log('✅ Company token in storage - Redirecting to /vibe (Agent)');
        } else {
          console.log('⚠️ No company selected - Redirecting to /vibe (Agent will show workspace selector)');
        }
        
        hasRedirected.current = true;
        // ⭐ Mark auth as completed to prevent re-redirects on app focus
        const { setItem } = await import('../utils/storage');
        await setItem('auth_completed', 'true');
        router.replace('/vibe');
        
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
    // ⭐ CRITICAL: Depend on isInitialLoad to prevent running on app focus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isInitialLoad]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#0C66E4" />
    </View>
  );
}