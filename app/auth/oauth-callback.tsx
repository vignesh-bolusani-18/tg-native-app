// app/auth/oauth-callback.tsx
import { Buffer } from "buffer";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { Text } from "react-native-paper";
import { useDispatch } from "react-redux";

import {
    setError,
    setIsAuthenticated,
    setLoggedInUser,
    setUserInfo,
} from "../../redux/slices/authSlice";

const TGIcon = require("../../assets/images/icon.png");

export default function OAuthCallback() {
  const [status, setStatus] = useState("Processing authentication...");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOAuthCallback = async (url: string | null) => {
      if (!url) return;

      try {
        console.log("🔵 OAuth Callback URL:", url);
        
        // Parse URL - handle both query params and hash fragments
        const { queryParams } = Linking.parse(url);
        
        // Try hash first (Identity Gateway pattern: #access_token=...)
        let params = queryParams;
        if (url.includes("#")) {
          const hashString = url.split("#")[1];
          params = Object.fromEntries(new URLSearchParams(hashString));
        }

        const accessToken = params?.access_token as string;
        const refreshToken = params?.refresh_token as string;
        const refreshAuthToken = params?.refresh_auth_token as string;

        console.log("🔵 Extracted tokens:", {
          hasAccess: !!accessToken,
          hasRefresh: !!refreshToken,
          hasRefreshAuth: !!refreshAuthToken,
        });

        if (!accessToken) {
          throw new Error("No access token found in OAuth callback");
        }

        setStatus("Saving session...");

        // Store tokens securely
        await SecureStore.setItemAsync("token", accessToken);
        if (refreshToken) {
          await SecureStore.setItemAsync("refresh_token", refreshToken);
        }
        if (refreshAuthToken) {
          await SecureStore.setItemAsync("refresh_auth_token", refreshAuthToken);
        }

        // Decode JWT to extract user info
        const parts = accessToken.split(".");
        const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(decoded);

        console.log("🔵 JWT payload:", {
          hasEmail: !!payload.email,
          hasSub: !!payload.sub,
          hasName: !!payload.name,
        });

        const userPayload = {
          email: payload.email || "user@example.com",
          userID: payload.sub || payload.userID || "unknown",
          userName: payload.name || payload.given_name || "User",
          firstName: payload.given_name || "User",
          lastName: payload.family_name || "",
          picture: payload.picture || null,
        };

        // Update Redux
        dispatch(setLoggedInUser({ email: userPayload.email, token: accessToken }));
        dispatch(setUserInfo(userPayload));
        dispatch(setIsAuthenticated(true));

        console.log("✅ OAuth: Redux state updated");

        setStatus("Redirecting...");
        
        // Navigate to home screen
        router.replace("/(tabs)/home");

      } catch (error: any) {
        console.error("🔴 OAuth Callback Error:", error);
        dispatch(setError(error.message));
        router.replace("/auth/login");
      }
    };

    // Get initial URL
    Linking.getInitialURL().then(handleOAuthCallback);

    // Listen for new deep links
    const subscription = Linking.addEventListener("url", (event) => {
      handleOAuthCallback(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white gap-6">
      <View className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center border border-gray-200">
        <Image 
          source={TGIcon} 
          style={{ width: 45, height: 45, resizeMode: 'contain' }} 
        />
      </View>
      <ActivityIndicator size="large" color="#0C66E4" />
      <Text className="text-gray-700 font-medium text-lg">{status}</Text>
    </View>
  );
}
