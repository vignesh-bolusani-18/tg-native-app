// hooks/useGoogleAuth.ts
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {

  const redirectUri = makeRedirectUri({
    scheme: 'tgreactnativemobileapp',
    path: 'auth/oauth-callback',
    native: 'tgreactnativemobileapp://auth/oauth-callback'
  });

  const initiateGoogleAuth = async () => {
    const identityGatewayUrl = process.env.EXPO_PUBLIC_IDENTITY_GATEWAY_URL;
    
    if (!identityGatewayUrl) {
      console.error('EXPO_PUBLIC_IDENTITY_GATEWAY_URL not configured');
      throw new Error('Google OAuth not configured');
    }

    // Construct the OAuth URL for your Identity Gateway
    const authUrl = `${identityGatewayUrl}/login/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('🔵 Google OAuth: Opening URL:', authUrl);
    console.log('🔵 Google OAuth: Redirect URI:', redirectUri);

    try {
      // Open the auth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      console.log('🔵 Google OAuth Result:', result);

      if (result.type === 'success' && result.url) {
        // The OAuth callback route will handle the token extraction
        Linking.openURL(result.url);
      } else if (result.type === 'cancel') {
        console.log('🔵 Google OAuth: User cancelled');
      }

      return result;
    } catch (error) {
      console.error('🔴 Google OAuth Error:', error);
      throw error;
    }
  };

  return {
    initiateGoogleAuth,
    redirectUri,
  };
};
