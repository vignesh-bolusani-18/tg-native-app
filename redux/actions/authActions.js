// redux/actions/authActions.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { getItem, removeItem, setItem } from '../../utils/storage';

import {
  loadCompanies,
  setCurrentCompany,
  setError,
  setIsAuthenticated,
  setIsLoggedIn,
  setLoading,
  setLoggedInUser,
  setNewCompany,
  setUserInfo,
  signOut,
} from "../slices/authSlice";

// Import your utilities
import { createCompany } from "../../utils/createCompany";
import { getCompaniesList } from "../../utils/getCompaniesList";
import { getRefreshToken } from "../../utils/getRefreshToken";
import { getUserById } from "../../utils/getUserById";
import { processToken } from "../../utils/jwtUtils";
import { validateUser } from "../../utils/validateUser";
// Allow consumers to import setError via actions layer
export { setError } from "../slices/authSlice";

// Export setUserInfo as setuserInfo for backward compatibility
export const setuserInfo = (userInfo) => (dispatch) => {
  dispatch(setUserInfo(userInfo));
};

// --- ENV VARS CONFIGURATION ---
// We now access process.env.EXPO_PUBLIC_... variables directly
const poolData = {
  UserPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID,
  ClientId: process.env.EXPO_PUBLIC_USER_POOL_WEB_CLIENT_ID,
};

const poolData1 = {
  UserPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID_1,
  ClientId: process.env.EXPO_PUBLIC_USER_POOL_WEB_CLIENT_ID_1,
};

const cognitoPoolData = {
  UserPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
  ClientId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID,
};

// Debug log to verify keys are loaded
console.log("Auth Config Loaded:", { 
  MainPool: poolData.UserPoolId ? "OK" : "MISSING",
  ClientId: poolData.ClientId ? "OK" : "MISSING" 
});

const userPool = new CognitoUserPool(poolData);
const userPool1 = new CognitoUserPool(poolData1);
const cognitoUserPool = new CognitoUserPool(cognitoPoolData);

let refreshInterval = null;

// --- Storage Helpers (Platform-Agnostic) ---
const setSecureItem = async (key, value) => {
  try {
    if (value) await setItem(key, value);
  } catch (e) {
    console.error(`Error setting storage item ${key}:`, e);
  }
};

const getSecureItem = async (key) => {
  try {
    return await getItem(key);
  } catch (e) {
    console.error(`Error getting SecureStore item ${key}:`, e);
    return null;
  }
};

// --- Refresh Session Logic ---
const refreshSession = (cognitoUser, dispatch) => {
  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err, session) => {
      if (err) {
        dispatch(setError(err.message));
        reject(err);
        return;
      }

      if (!session.isValid()) {
        const refreshToken = session.getRefreshToken();
        cognitoUser.refreshSession(refreshToken, async (err, newSession) => {
          if (err) {
            dispatch(setError(err.message));
            reject(err);
            return;
          }

          const idToken = newSession.getIdToken().getJwtToken();
          dispatch(
            setLoggedInUser({
              email: newSession.getIdToken().payload.email,
              token: idToken,
            })
          );
          await setSecureItem("token", idToken);
          console.log("New Session Fetched!");
          resolve(newSession);
        });
      } else {
        const idToken = session.getIdToken().getJwtToken();
        setSecureItem("token", idToken);
        console.log("Session is Valid!");
        resolve(session);
      }
    });
  });
};

export const refreshSessionToken = async () => {
  const cognitoUser = userPool.getCurrentUser();
  const cognitoUser1 = userPool1.getCurrentUser();

  const getCognitoUserSession = (user) => {
    return new Promise((resolve, reject) => {
      user.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        const refreshToken = session.getRefreshToken();
        user.refreshSession(refreshToken, async (err, newSession) => {
          if (err) {
            reject(err);
            return;
          }

          const idToken = newSession.getIdToken().getJwtToken();
          await setSecureItem("token", idToken);
          console.log("ID Token refreshed");

          const TokenF = await getSecureItem("token");
          resolve(TokenF);
        });
      });
    });
  };

  if (cognitoUser) {
    return getCognitoUserSession(cognitoUser);
  } else if (cognitoUser1) {
    return getCognitoUserSession(cognitoUser1);
  } else {
    return Promise.reject(new Error("No Cognito user found"));
  }
};

const startPeriodicSessionRefresh = (dispatch) => {
  const cognitoUser = userPool.getCurrentUser();
  const cognitoUser1 = userPool1.getCurrentUser();

  const startSessionRefresh = (user) => {
    refreshInterval = setInterval(async () => {
      try {
        await refreshSession(user, dispatch);
      } catch (error) {
        console.error("Error refreshing session:", error);
        dispatch(setError(error.message));
      }
    }, 15 * 60 * 1000); 
  };

  if (cognitoUser) {
    startSessionRefresh(cognitoUser);
  } else if (cognitoUser1) {
    startSessionRefresh(cognitoUser1);
  }
};

const stopPeriodicSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// --- Actions ---

export const signUpUser = (email, password) => async (dispatch) => {
  const attributeList = [
    new CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
  ];

  console.log("signUpUser payload:", { Username: email });

  userPool.signUp(email, password, attributeList, null, async (err, result) => {
    await dispatch(setLoading(true));
    if (err) {
      console.error("Error signing up:", err);
      dispatch(setError(err.message));
      dispatch(setLoading(false));
      return;
    }
    console.log("signUpUser result:", result);

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(
      new AuthenticationDetails({
        Username: email,
        Password: password,
      }),
      {
        onSuccess: async (result) => {
          const token = result.getIdToken().getJwtToken();
          dispatch(
            setLoggedInUser({
              email: result.idToken.payload.email,
              token,
            })
          );
          await setSecureItem("token", token);
          dispatch(setLoading(false));
          startPeriodicSessionRefresh(dispatch);
        },
        onFailure: (err) => {
          dispatch(setError(err.message));
          dispatch(setLoading(false));
        },
      }
    );
  });
};

export const loginUser = (email, password, companyName) => async (dispatch) => {
  await dispatch(setLoading(true));

  const emailMappings = {
    "anshuman.agrawal@revvity.com": "Anshuman.Agrawal@revvity.com",
    "girish.oak@revvity.com": "Girish.Oak@revvity.com",
    "michael.andreitchenko@revvity.com": "Michael.Andreitchenko@revvity.com",
    "marc-andre.roy@revvity.com": "Marc-Andre.Roy@revvity.com",
  };

  const mappedEmail = emailMappings[email] || email;

  const authenticate = (username, userPool) => {
    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });
    const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  };

  const handleSuccess = async (result, companyName) => {
    const token = result.getIdToken().getJwtToken();
    const email = result.idToken.payload.email;

    dispatch(setLoggedInUser({ email, token, companyName }));

    try {
      const response = await validateUser(token);
      
      if (response.isValidUser) {
        await setSecureItem("token", token);
        await setSecureItem("userToken", response.user);
        await setSecureItem("refresh_token", response.refreshToken);

        await AsyncStorage.setItem("session_expired", "false");
        startPeriodicSessionRefresh(dispatch);

        const userPayload = await processToken(response.user);
        dispatch(setUserInfo(userPayload));

        // Auto-redirect logic
        try {
          const verifiedCompaniesList = await getCompaniesList(); // Use mock/real util
          dispatch(loadCompanies(verifiedCompaniesList));
        } catch (error) {
          console.error("Error auto-selecting company:", error);
        }
      } else {
        dispatch(setError(response.message));
      }
    } catch (error) {
      dispatch(setError(error.message));
    }

    dispatch(setLoading(false));
  };

  try {
    const userName = `${mappedEmail}-${companyName}`;
    const primaryResult = await authenticate(userName, userPool);
    await handleSuccess(primaryResult, companyName);
  } catch (_primaryError) {
    try {
      const fallbackResult = await authenticate(mappedEmail, userPool1);
      await handleSuccess(fallbackResult, companyName);
    } catch (fallbackError) {
      dispatch(setError(fallbackError.message));
      dispatch(setLoading(false));
      console.error("Both authentication methods failed!");
    }
  }
};

// ... (OTP functions remain the same, just ensure they use setSecureItem/AsyncStorage)

export const initiateOtpLogin = (email) => async (dispatch) => {
  await dispatch(setLoading(true));
  try {
    console.log("\n" + "=".repeat(60));
    console.log("📧 INITIATING OTP LOGIN");
    console.log("=".repeat(60));
    console.log("📨 Sending OTP to:", email);
    console.log("🔐 Method: AWS Cognito Custom Challenge");
    
    // Use Cognito Custom Auth Challenge
    const { initiateCustomAuth } = await import('../../utils/auth');
    const result = await initiateCustomAuth(email);
    
    if (!result.session) {
      throw new Error("Failed to initiate custom auth challenge");
    }
    
    // Store email and session for OTP verification
    await AsyncStorage.setItem("otpEmail", email);
    await AsyncStorage.setItem("cognitoSession", result.session);
    
    console.log("✅ OTP SENT SUCCESSFULLY!");
    console.log("📱 Check your email for the 6-digit OTP code");
    console.log("🔑 Session stored for verification");
    console.log("=".repeat(60) + "\n");

    dispatch(setLoading(false));
  } catch (error) {
    console.error("\n❌ OTP SEND ERROR:", error.message);
    console.error("=".repeat(60) + "\n");
    dispatch(setError(error.message || "Failed to send OTP. Please try again."));
    dispatch(setLoading(false));
  }
};

export const verifyOtpAndLogin = (otp) => async (dispatch) => {
  await dispatch(setLoading(true));
  const email = await AsyncStorage.getItem("otpEmail");
  const session = await AsyncStorage.getItem("cognitoSession");

  if (!email || !session) {
    dispatch(setError("Session expired. Please request OTP again."));
    dispatch(setLoading(false));
    return { success: false, error: "Session expired" };
  }

  try {
    console.log("\n");
    console.log("=".repeat(60));
    console.log("🔐 VERIFYING OTP VIA COGNITO");
    console.log("📧 Email:", email);
    console.log("🔢 OTP:", otp);
    console.log("=".repeat(60));
    
    // Use Cognito Custom Challenge verification
    const { verifyCustomChallenge } = await import('../../utils/auth');
    const result = await verifyCustomChallenge(email, otp, session);
    
    const accessToken = result.getIdToken().getJwtToken();
    const refreshToken = result.getRefreshToken().getToken();
    
    console.log("\n");
    console.log("█".repeat(60));
    console.log("🎉 LOGIN SUCCESSFUL!");
    console.log("█".repeat(60));
    console.log("\n📦 RECEIVED TOKENS FROM COGNITO:\n");
    console.log("  🔑 Access Token (JWT):");
    console.log("     " + accessToken?.substring(0, 50) + "...");
    console.log("\n  🔑 Refresh Token:");
    console.log("     " + refreshToken?.substring(0, 50) + "...");
    
    // Store tokens in SecureStore
    console.log("\n💾 STORING TOKENS IN SECURE STORAGE...");
    await setSecureItem("token", accessToken);
    await setSecureItem("refresh_token", refreshToken);
    console.log("✅ Tokens stored successfully in SecureStore!\n");
    
    // Note: User registration will be attempted after backend validation with proper token
    
    // Validate token with backend (EXACTLY like web app)
    let validationResult;
    try {
      console.log("\n🔵 VALIDATING TOKEN WITH BACKEND...");
      console.log("   Endpoint: /validateUser");
      validationResult = await validateUser(accessToken);
      
      if (validationResult && validationResult.isValidUser) {
        console.log("✅ Backend validation successful!");
        
        // Store refresh_auth_token from validateUser
        if (validationResult.refreshToken) {
          await setSecureItem("refresh_auth_token", validationResult.refreshToken);
          console.log("  🔑 Refresh Token (from validateUser):");
          console.log("     " + validationResult.refreshToken.substring(0, 50) + "...");
          
          // ⭐ CRITICAL STEP 3: Exchange refreshToken for accessToken
          console.log("\n🔵 STEP 3: EXCHANGING REFRESH TOKEN FOR ACCESS TOKEN...");
          console.log("   Endpoint: POST /getAccessToken");
          
          try {
            const { getAccessToken } = await import('../../utils/getAccessToken');
            const realAccessToken = await getAccessToken(validationResult.refreshToken);
            
            console.log("✅ ACCESS TOKEN OBTAINED!");
            console.log("  🔑 Access Token (THE REAL TOKEN):");
            console.log("     " + realAccessToken.substring(0, 50) + "...");
            
            // CRITICAL: Verify token has email field (required by backend)
            try {
              const tokenParts = realAccessToken.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log("\n📋 TOKEN PAYLOAD VERIFICATION:");
                console.log("   email:", payload.email || payload.userEmail || "❌ MISSING!");
                console.log("   userID:", payload.userID || payload.sub || "unknown");
                console.log("   exp:", payload.exp ? new Date(payload.exp * 1000).toISOString() : "unknown");
                
                if (!payload.email && !payload.userEmail) {
                  console.error("\n⚠️⚠️⚠️ CRITICAL WARNING ⚠️⚠️⚠️");
                  console.error("Token is missing 'email' field!");
                  console.error("Backend /companies call WILL FAIL with 500 error!");
                  console.error("This token came from: POST /getAccessToken");
                  console.error("⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n");
                } else {
                  console.log("   ✅ Token has email - backend calls should work!\n");
                }
              }
            } catch (_decodeErr) {
              console.warn("   ⚠️ Could not decode token to verify email field");
            }
            
            // CRITICAL: Store accessToken as "token" for all API calls
            await setSecureItem("token", realAccessToken);
            // CRITICAL: Update Redux userData.token with accessToken
            dispatch(setLoggedInUser({ email, token: realAccessToken }));
            console.log("  ✅ Updated 'token' storage with accessToken");
            console.log("  ✅ Updated Redux userData.token with accessToken");
            console.log("  ✅ This accessToken will be used for ALL API calls\n");
          } catch (tokenExchangeError) {
            console.error("❌ FAILED TO EXCHANGE TOKEN:", tokenExchangeError.message);
            console.error("   Falling back to refreshToken (may not work)");
            await setSecureItem("token", validationResult.refreshToken);
            dispatch(setLoggedInUser({ email, token: validationResult.refreshToken }));
          }
        } else {
          console.warn("  ⚠️ validateUser succeeded but no refreshToken returned!");
          console.warn("  ⚠️ Using Cognito token as fallback");
          dispatch(setLoggedInUser({ email, token: accessToken }));
        }
      } else {
        console.warn("⚠️ Token validation returned invalid result, continuing without validation");
      }
    } catch (validationError) {
      console.error("❌❌❌ CRITICAL: Backend validation FAILED ❌❌❌");
      console.error("   Error:", validationError.message);
      console.error("   Error type:", validationError.constructor?.name);
      console.error("   Error stack:", validationError.stack);
      console.error("⚠️ THIS WILL CAUSE ISSUES - Cognito JWT won't work with /companies endpoint");
      console.error("⚠️ Possible causes:");
      console.error("   1. Network/CORS issue");
      console.error("   2. Backend endpoint down");
      console.error("   3. Invalid Cognito token");
      console.error("   4. API key issue");
      console.log("\n⚠️ FALLBACK: Continuing with Cognito token (may cause /companies to fail)");
      // Fallback: Use Cognito token if validation fails
      dispatch(setLoggedInUser({ email, token: accessToken }));
      console.log("  🔑 Using Cognito token in Redux (NOT RECOMMENDED)\n");
    }
    
    // Process user token to extract userInfo (EXACTLY like web app)
    let userPayload = null;
    try {
      if (validationResult && validationResult.user) {
        console.log("\n📦 PROCESSING USER TOKEN...");
        userPayload = await processToken(validationResult.user);
        console.log("✅ User payload extracted:");
        console.log("   Email:", userPayload.email);
        console.log("   UserID:", userPayload.userID);
      }
    } catch (processError) {
      console.warn("⚠️ Failed to process user token:", processError.message);
    }
    
    // Extract user info from Cognito token
    const cognitoPayload = result.getIdToken().payload;
    const userInfo = {
      email: cognitoPayload.email || userPayload?.email || email,
      userID: userPayload?.userID || cognitoPayload.sub,
      name: cognitoPayload.name || userPayload?.name,
    };
    
    console.log("\n👤 USER INFO EXTRACTED FROM TOKEN:");
    console.log("   📧 Email:", userInfo.email);
    console.log("   🆔 User ID:", userInfo.userID);
    console.log("   👤 Name:", userInfo.name || "Not provided");
    
    // Update Redux state - setLoggedInUser will be called after validateUser with correct token
    // For now, just set user info and auth status
    dispatch(setUserInfo(userInfo));
    dispatch(setIsAuthenticated(true));
    dispatch(setIsLoggedIn(true));
    
    console.log("\n✅ REDUX STATE UPDATED");
    console.log("   - User logged in");
    console.log("   - User info set");
    console.log("   - Authentication: TRUE");
    console.log("\n⭐ CORE LOGIN SUCCESSFUL - Additional features loading...\n");
    
    // AUTO-FETCH AND AUTO-SELECT COMPANY (EXACTLY like web app)
    console.log("\n" + "=".repeat(60));
    console.log("🏢 FETCHING COMPANIES FROM BACKEND...");
    console.log("=".repeat(60));
    
    try {
      // CRITICAL: Use the real backend access token (with email) for API calls
      // realAccessToken was stored as "token" above; fall back to validationResult.refreshToken only if missing
      const apiToken = (await getSecureItem("token")) || validationResult?.refreshToken || accessToken;
      const usingAccessToken = !!(await getSecureItem("token"));
      
      console.log("   Using token type:", usingAccessToken ? "✅ backend access token (CORRECT)" : "⚠️ fallback token (may fail)");
      console.log("   Token:", apiToken.substring(0, 30) + "...");
      
      // WARN if not using the backend access token
      if (!usingAccessToken) {
        console.warn("⚠️⚠️⚠️ WARNING: Using fallback token - /companies call may FAIL");
        console.warn("   validateUser must have failed earlier - check logs above");
      }
      
      // Get companies list from backend (pass refresh_auth_token)
      const companiesResponse = await getCompaniesList(apiToken);
      console.log("📊 Backend response:", JSON.stringify(companiesResponse, null, 2));
      
      let companies = companiesResponse?.companies || companiesResponse?.data?.companies || [];
      
      // If companies is not an array, try to extract it
      if (!Array.isArray(companies)) {
        console.warn("⚠️ Companies is not an array:", typeof companies);
        companies = [];
      }
      
      console.log("✅ Companies fetched:", companies.length);
      
      // ⭐ MATCHES WEB APP: Auto-create default workspace if none exists
      // User gets redirected to agent page immediately, can select/create workspace from there
      if (companies.length === 0) {
        console.log("\n🏗️ NO COMPANIES FOUND - Attempting to auto-create default workspace...");
        
        // Generate default workspace name from email (matches web app)
        const emailPrefix = userInfo.email.split('@')[0];
        const defaultWorkspaceName = emailPrefix.replace(/[^a-zA-Z0-9]/g, '') + 'Workspace';
        const encodedName = encodeURIComponent(defaultWorkspaceName.trim().replace(/ /g, "\u200B"));
        
        const payload = {
          companyName: encodedName,
          userID: userInfo.userID,
        };
        
        console.log("   Default workspace name:", defaultWorkspaceName);
        console.log("   Payload:", JSON.stringify(payload, null, 2));
        
        let createdCompany = null;
        try {
          // Get FRESH token before creating (prevents 401 errors)
          console.log("🔄 Fetching FRESH access token before creating default workspace...");
          const refreshTokenForCreate = await getSecureItem("refresh_auth_token") || 
                                       await getSecureItem("refresh_token");
          let freshTokenForCreate = apiToken;
          
          if (refreshTokenForCreate) {
            try {
              freshTokenForCreate = await getUserById(refreshTokenForCreate);
              console.log("✅ Fresh token obtained for workspace creation");
            } catch (tokenError) {
              console.warn("⚠️ Failed to get fresh token, using login token:", tokenError.message);
            }
          }
          
          // Create default workspace
          createdCompany = await createCompany(payload, freshTokenForCreate);
          
          // Check if freemium limit reached (405) - will return null
          if (createdCompany === null) {
            console.warn("⚠️ FREEMIUM LIMIT REACHED - Cannot auto-create workspace");
            console.log("   Checking if there are existing workspaces to auto-select...");
            
            // Re-fetch companies in case some were created earlier
            const refetchedResponse = await getCompaniesList();
            const refetchedCompanies = refetchedResponse?.companies || refetchedResponse?.data?.companies || [];
            
            if (refetchedCompanies.length > 0) {
              console.log("✅ Found existing workspaces:", refetchedCompanies.length);
              // Fall through to auto-select existing workspace below
              companies.push(...refetchedCompanies);
            } else {
              console.log("   No existing workspaces found either");
              console.log("   User will see workspace selector on agent page");
              // Store empty companies so user sees workspace selector on agent
              dispatch(loadCompanies([]));
            }
          } else {
            console.log("✅ Default workspace auto-created:", createdCompany);
            companies.push(createdCompany);
          }
        } catch (createError) {
          console.error("❌ Failed to auto-create workspace:", createError.message);
          console.log("   Checking if there are existing workspaces to auto-select...");
          
          // Even if creation fails, check for existing workspaces
          try {
            const refetchedResponse = await getCompaniesList();
            const refetchedCompanies = refetchedResponse?.companies || refetchedResponse?.data?.companies || [];
            
            if (refetchedCompanies.length > 0) {
              console.log("✅ Found existing workspaces:", refetchedCompanies.length);
              companies.push(...refetchedCompanies);
            } else {
              console.log("   No existing workspaces found");
              console.log("   User will see workspace selector on agent page");
              dispatch(loadCompanies([]));
            }
          } catch (refetchError) {
            console.error("❌ Failed to refetch companies:", refetchError.message);
            dispatch(loadCompanies([]));
          }
        }
      }
      
      // Sort companies by lastAccessed (most recent first)
      const sortedCompanies = [...companies].sort((a, b) => {
        const aLastAccessed = a.lastAccessed ?? 0;
        const bLastAccessed = b.lastAccessed ?? 0;
        return bLastAccessed - aLastAccessed;
      });
      
      // ALWAYS store companies in Redux (even if empty)
      dispatch(loadCompanies(sortedCompanies));
      console.log("✅ Companies stored in Redux:", sortedCompanies.length);
      
      // Auto-select most recently accessed company if exists
      if (sortedCompanies.length > 0) {
        const mostRecentCompany = sortedCompanies[0];
        console.log("\n📍 AUTO-SELECTING MOST RECENT COMPANY:");
        console.log("   Name:", mostRecentCompany.companyName || mostRecentCompany.name);
        console.log("   ID:", mostRecentCompany.id || mostRecentCompany.companyID);
        
        // Get company-specific refresh token
        const companyId = mostRecentCompany.id || mostRecentCompany.companyID;
        
        try {
          const refreshTokenData = await getRefreshToken(companyId);
          console.log("✅ Company refresh token retrieved!", refreshTokenData ? 'Success' : 'No data');
          
          // Set current company in Redux
          dispatch(setCurrentCompany({
            ...mostRecentCompany,
            id: companyId,
            companyName: mostRecentCompany.companyName || mostRecentCompany.name,
          }));
          
          console.log("✅ Current company set in Redux");
          console.log("\n" + "=".repeat(60));
          console.log("✅ AUTHENTICATION COMPLETE - READY FOR CHATBOT!");
          console.log("=".repeat(60) + "\n");
        } catch (tokenError) {
          console.error("❌ Failed to get company refresh token:", tokenError.message);
          // Still set company but without refresh token
          dispatch(setCurrentCompany({
            ...mostRecentCompany,
            id: companyId,
            companyName: mostRecentCompany.companyName || mostRecentCompany.name,
          }));
          console.log("⚠️ Company set without refresh token - may need to select manually");
        }
      } else {
        console.log("\n⚠️ No companies available after all attempts");
        console.log("   User will need to create a company");
        console.log("=".repeat(60) + "\n");
      }
    } catch (companyError) {
      console.error("\n❌ COMPANY FETCH/SELECT ERROR:", companyError.message);
      console.error("   Error type:", companyError.constructor?.name);
      console.error("   Error stack:", companyError.stack);
      // Store empty array in Redux so UI doesn't break
      dispatch(loadCompanies([]));
      console.warn("⚠️ Continuing without company - user can select/create later");
    }
    
    dispatch(setLoading(false));
    await AsyncStorage.removeItem("otpEmail");
    await AsyncStorage.removeItem("cognitoSession");
    
    return { success: true, user: userInfo };
  } catch (error) {
    console.error("\n");
    console.error("█".repeat(60));
    console.error("❌ OTP VERIFICATION FAILED");
    console.error("█".repeat(60));
    console.error("Error:", error.message);
    console.error("Error type:", error.constructor?.name || "Unknown");
    console.error("Error stack:", error.stack);
    
    // Provide user-friendly error message based on error type
    let userMessage = "Invalid OTP. Please try again.";
    if (error.message?.includes("Failed to fetch") || error.message?.includes("Network")) {
      userMessage = "Network error. Please check your connection and try again.";
    } else if (error.message?.includes("401")) {
      userMessage = "Authentication failed. Please try again.";
    } else if (error.message?.includes("Session expired")) {
      userMessage = "Session expired. Please request a new OTP.";
    } else if (error.code === "UserNotFoundException") {
      userMessage = "User not found. Please check your email and try again.";
    } else if (error.code === "NotAuthorizedException") {
      userMessage = "Invalid OTP. Please check and try again.";
    }
    
    console.error("User message:", userMessage);
    console.error("=".repeat(60) + "\n");
    dispatch(setError(userMessage));
    dispatch(setLoading(false));
    return { success: false, error: error.message };
  }
};

// --- COMPANY SELECTION ACTIONS ---

export const getCompanies = (userID) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log("🔵 getCompanies: Fetching companies for user");
    
    const data = await getCompaniesList();
    const companies = data.companies || data || [];
    
    dispatch(loadCompanies(companies));
    dispatch(setLoading(false));
    
    console.log("✅ Companies loaded:", companies.length);
    return { success: true, companies };
  } catch (error) {
    console.error("❌ getCompanies Error:", error);
    dispatch(setError(error.message || "Failed to fetch companies"));
    dispatch(setLoading(false));
    return { success: false, error: error.message };
  }
};

export const createNewCompany = (userInfo, companyName) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log("🔵 createNewCompany:", companyName);
    
    // Encode company name (replace spaces with zero-width spaces and encode URI)
    const encodedName = encodeURIComponent(companyName.trim().replace(/ /g, "\u200B"));
    
    const payload = {
      companyName: encodedName,
      userID: userInfo.userID,
    };
    
    const response = await createCompany(payload);
    
    dispatch(setNewCompany(response));
    dispatch(setLoading(false));
    
    console.log("✅ Company created:", response);
    
    // Refresh companies list
    await dispatch(getCompanies(userInfo?.userID));
    
    return { success: true, company: response };
  } catch (error) {
    console.error("❌ createNewCompany Error:", error);
    dispatch(setError(error.message || "Failed to create company"));
    dispatch(setLoading(false));
    return { success: false, error: error.message };
  }
};

export const setCurrCompany = (companyDetails) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    console.log("🔵 setCurrCompany:", companyDetails);
    
    // Get company-specific refresh token
    if (companyDetails?.id || companyDetails?.companyID) {
      const companyID = companyDetails.id || companyDetails.companyID;
      await getRefreshToken(companyID);
      
      // Store company ID in SecureStore
      await setSecureItem("companyID", companyID);
      
      console.log("✅ Company-specific refresh token stored");
    }
    
    dispatch(setCurrentCompany(companyDetails));
    dispatch(setLoading(false));
    
    return { success: true };
  } catch (error) {
    console.error("❌ setCurrCompany Error:", error);
    dispatch(setError(error.message || "Failed to set company"));
    dispatch(setLoading(false));
    return { success: false, error: error.message };
  }
};

export const selectAnotherCompany = (userInfo) => async (dispatch) => {
  try {
    console.log("🔵 selectAnotherCompany: Resetting company selection");
    
    // Clear company-specific tokens
    await removeItem("refresh_token_company");
    await removeItem("companyID");
    
    dispatch(setCurrentCompany(null));
    
    console.log("✅ Company selection reset");
    return { success: true };
  } catch (error) {
    console.error("❌ selectAnotherCompany Error:", error);
    return { success: false, error: error.message };
  }
};

export const refreshCurrentCompnay = async () => {
  try {
    const companyID = await getSecureItem("companyID");
    if (companyID) {
      await getRefreshToken(companyID);
      console.log("✅ Company token refreshed");
    }
    return { success: true };
  } catch (error) {
    console.error("❌ refreshCurrentCompnay Error:", error);
    return { success: false, error: error.message };
  }
};

export const sendInvite = async (userInfo, currentCompany, inviteEmail) => {
  // TODO: Implement invite functionality
  console.log("📧 sendInvite called - not yet implemented");
  return { success: false, message: "Not implemented" };
};

export const acceptInvitation = async (userID, payload, authToken) => {
  // TODO: Implement accept invitation
  console.log("✅ acceptInvitation called - not yet implemented");
  return { success: false, message: "Not implemented" };
};

export const denyInvitation = async (userID, payload, authToken) => {
  // TODO: Implement deny invitation
  console.log("❌ denyInvitation called - not yet implemented");
  return { success: false, message: "Not implemented" };
};

export const getPendingInvites = async (userInfo) => {
  // TODO: Implement get pending invites
  console.log("📬 getPendingInvites called - not yet implemented");
  return [];
};

export const handleLogoutWithMessage = async (message) => {
  // TODO: Implement logout with message
  console.log("🚪 handleLogoutWithMessage:", message);
  return { success: true };
};

// --- SIGN OUT ---

export const signOutUser = (reason = "logout") => async (dispatch) => {
    const user = userPool.getCurrentUser();
    const user1 = userPool1.getCurrentUser();
    const cognitoUser = cognitoUserPool.getCurrentUser();

    if (user) user.signOut();
    if (user1) user1.signOut();
    if (cognitoUser) cognitoUser.signOut();

    dispatch(setError(null));
    dispatch(signOut());

    // Clear all tokens
    await removeItem("token");
    await removeItem("userToken");
    await removeItem("refresh_token");
    await removeItem("refresh_auth_token");
    await removeItem("refresh_token_company");
    await removeItem("companyID");
    
    stopPeriodicSessionRefresh();
    await AsyncStorage.setItem("logout", Date.now().toString());
};

export const getAuthToken = async () => {
  const refreshToken = await getSecureItem("refresh_token");
  const refreshCompanyToken = await getSecureItem("refresh_token_company");
  const accessToken = await getSecureItem("refresh_auth_token");

  console.log("🔑 getAuthToken Debug - Available tokens:");
  console.log("📊 refresh_token:", !!refreshToken);
  console.log("📊 refresh_token_company:", !!refreshCompanyToken);
  console.log("📊 refresh_auth_token:", !!accessToken);
  console.log("📊 token (main):", !!(await getSecureItem("token")));

  if (refreshCompanyToken) {
    try {
      console.log("✅ Using refresh_token_company");
      const authToken = await getUserById(refreshCompanyToken);
      return authToken;
    } catch (error) {
      console.error("❌ Error with refresh_token_company:", error.message);
      const errorMessage = error.message || "";
      if (errorMessage.includes("401") || errorMessage.includes("405")) {
        console.log("Session expired. Need to re-login.");
      }
    }
  } else if (refreshToken) {
    try {
      console.log("✅ Using refresh_token");
      const authToken = await getUserById(refreshToken);
      return authToken;
    } catch (error) {
      console.error("❌ Error with refresh_token:", error.message);
    }
  } else if (accessToken) {
    try {
      console.log("✅ Using refresh_auth_token");
      const authToken = await getUserById(accessToken);
      return authToken;
    } catch (error) {
      console.error("❌ Error with refresh_auth_token:", error.message);
    }
  }

  console.error("❌ No tokens available or all tokens failed!");
  return null;
};

// --- LOGOUT ACTION ---
export const logoutUser = () => async (dispatch) => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🚪 LOGGING OUT...");
    console.log("=".repeat(60));
    
    // Clear all tokens from storage
    await removeItem("token");
    await removeItem("refresh_token");
    await removeItem("refresh_auth_token");
    await removeItem("refresh_token_company");
    await removeItem("companyID");
    
    // Clear AsyncStorage items
    await AsyncStorage.removeItem("otpEmail");
    await AsyncStorage.removeItem("cognitoSession");
    
    // Reset Redux state
    dispatch(signOut());
    
    console.log("✅ Logout complete - all tokens cleared");
    console.log("=".repeat(60) + "\n");
    
    return { success: true };
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Still reset Redux even if storage clear fails
    dispatch(signOut());
    return { success: false, error: error.message };
  }
};
