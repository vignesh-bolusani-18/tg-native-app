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
  loadCompanies,
  setCurrentCompany,
} from "../../redux/slices/authSlice";
import { getCompaniesList } from "../../utils/getCompaniesList";
import { createCompany } from "../../utils/createCompany";
import { getRefreshToken } from "../../utils/getRefreshToken";
import { getUserById } from "../../utils/getUserById";

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

        // 🏢 FETCH AND AUTO-SELECT COMPANY
        setStatus("Loading workspaces...");
        console.log("\n🏢 FETCHING COMPANIES...");
        
        try {
          const companiesResponse = await getCompaniesList();
          let companies = companiesResponse?.companies || companiesResponse?.data?.companies || [];
          
          if (!Array.isArray(companies)) {
            companies = [];
          }
          
          console.log("✅ Companies fetched:", companies.length);
          
          // Auto-create default workspace if none exists
          if (companies.length === 0) {
            console.log("🏗️ NO COMPANIES - Auto-creating default workspace...");
            
            const emailPrefix = userPayload.email.split('@')[0];
            const defaultWorkspaceName = emailPrefix.replace(/[^a-zA-Z0-9]/g, '') + 'Workspace';
            const encodedName = encodeURIComponent(defaultWorkspaceName.trim().replace(/ /g, "\u200B"));
            
            const payload = {
              companyName: encodedName,
              userID: userPayload.userID,
            };
            
            try {
              // Get fresh token for company creation
              let freshToken = accessToken;
              if (typeof refreshToken === 'string') {
                try {
                  freshToken = await getUserById(refreshToken);
                } catch (_e) {
                  console.warn("⚠️ Using access token for company creation");
                }
              }
              
              const createdCompany = await createCompany(payload, null);
              if (createdCompany) {
                console.log("✅ Default workspace created:", createdCompany);
                companies.push(createdCompany);
              }
            } catch (createError: any) {
              console.error("❌ Failed to auto-create workspace:", createError.message);
              // Try to refetch in case some exist
              const refetchedResponse = await getCompaniesList();
              const refetchedCompanies = refetchedResponse?.companies || [];
              if (refetchedCompanies.length > 0) {
                companies.push(...refetchedCompanies);
              }
            }
          }
          
          // Sort by lastAccessed
          const sortedCompanies = [...companies].sort((a, b) => {
            const aLast = a.lastAccessed ?? 0;
            const bLast = b.lastAccessed ?? 0;
            return bLast - aLast;
          });
          
          // Store in Redux
          dispatch(loadCompanies(sortedCompanies));
          console.log("✅ Companies stored in Redux:", sortedCompanies.length);
          
          // Auto-select most recent company
          if (sortedCompanies.length > 0) {
            const mostRecent = sortedCompanies[0];
            const companyId = mostRecent.id || mostRecent.companyID;
            
            console.log("📍 AUTO-SELECTING:", mostRecent.companyName || mostRecent.name);
            
            // ⭐ CRITICAL: Get company refresh token - this is needed for conversation APIs
            // Wait for this to complete before navigating
            try {
              console.log("🔐 Getting company refresh token...");
              await getRefreshToken(companyId);
              console.log("✅ Company refresh token stored successfully");
            } catch (refreshTokenError: any) {
              console.warn("⚠️ Company refresh token failed:", refreshTokenError.message);
              console.warn("   Will fall back to refresh_token for API calls");
              // Don't block navigation - getAuthToken will fall back to refresh_token
            }
            
            dispatch(setCurrentCompany({
              ...mostRecent,
              id: companyId,
              companyName: mostRecent.companyName || mostRecent.name,
            }));
            
            console.log("✅ Company auto-selected");
          }
        } catch (companyError: any) {
          console.error("❌ Company fetch error:", companyError.message);
          dispatch(loadCompanies([]));
        }

        // ⭐ Mark auth as completed BEFORE navigation
        await SecureStore.setItemAsync("auth_completed", "true");
        
        setStatus("Redirecting...");
        
        // 5. Navigate to Vibe/Agent (not tabs)
        router.replace("/vibe" as Href); 

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