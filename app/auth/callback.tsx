import { Buffer } from "buffer";
import * as Linking from "expo-linking";
import { useRouter, type Href } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { Text } from "react-native-paper";
import { useDispatch } from "react-redux";

// Actions & Slices
import {
  setError,
  setIsAuthenticated,
  setLoggedInUser,
  setUserInfo,
} from "../../redux/slices/authSlice";

// Assets
// 🔧 FIX: Pointing to the default Expo icon for now so the app loads.
// Make sure you add 'tg_logo6.png' to your 'assets/images' folder later!
const TGIcon = require("../../assets/images/icon.png"); 

export default function AuthCallback() {
  const [status, setStatus] = useState("Finalizing login...");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;

      try {
        // 1. Parse the URL
        // Example: myapp://auth/callback#access_token=xyz&id_token=abc...
        const { queryParams } = Linking.parse(url.replace("#", "?")); // Expo parses ? better than #

        const accessToken = queryParams?.access_token;
        const refreshToken = queryParams?.refresh_token;

        if (!accessToken || typeof accessToken !== 'string') {
          throw new Error("No access token found in URL");
        }

        setStatus("Saving secure session...");

        // 2. Store Tokens Securely
        await SecureStore.setItemAsync("token", accessToken);
        if (typeof refreshToken === 'string') {
          await SecureStore.setItemAsync("refresh_token", refreshToken);
        }

        // 3. Decode JWT to get user info
        const parts = accessToken.split('.');
        const base64Payload = parts[1];
        const decoded = Buffer.from(base64Payload, 'base64').toString('utf-8');
        const payload = JSON.parse(decoded);

        const userPayload = {
          email: payload.email,
          userID: payload.sub,
          userName: payload.name || payload.email,
        };

        // 4. Dispatch to Redux
        dispatch(setLoggedInUser({ email: userPayload.email, token: accessToken }));
        dispatch(setUserInfo(userPayload));
        dispatch(setIsAuthenticated(true));

        setStatus("Redirecting...");
        
        // 5. Navigate to Main App
        router.replace("/(tabs)"); 

      } catch (error: any) {
        console.error("Callback Error:", error);
        dispatch(setError(error.message));
        router.replace("/auth/login" as Href);
      }
    };

    // Get the initial URL that opened the app
    Linking.getInitialURL().then(handleDeepLink);

    // Listen for new links while app is open
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
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