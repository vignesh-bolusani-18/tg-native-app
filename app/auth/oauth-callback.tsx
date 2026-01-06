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
    loadCompanies,
    setCurrentCompany,
} from "../../redux/slices/authSlice";
import { getCompaniesList } from "../../utils/getCompaniesList";
import { createCompany } from "../../utils/createCompany";
import { getRefreshToken } from "../../utils/getRefreshToken";
import { getUserById } from "../../utils/getUserById";

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
              if (refreshAuthToken) {
                try {
                  freshToken = await getUserById(refreshAuthToken);
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
            
            // Get company refresh token
            try {
              await getRefreshToken(companyId);
            } catch (_e) {
              console.warn("⚠️ No company refresh token");
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

        setStatus("Redirecting...");
        
        // Navigate to vibe/agent (not home)
        router.replace("/vibe");

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
