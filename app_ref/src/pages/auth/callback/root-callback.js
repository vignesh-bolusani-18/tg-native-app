import React, { useEffect, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setLoading,
  setError,
  setLoggedInUser,
  setUserInfo,
  setIsAuthenticated,
  loadCompanies,
} from "../../../redux/slices/authSlice";
import { Box, Typography } from "@mui/material";
import Cookies from "js-cookie";
import { getApiConfig } from "../../../utils/apiConfig";
import TGLogo from "../../../assets/Images/tg_logo6.svg";
import { getCompaniesList } from "../../../utils/getCompaniesList";
import { verifyCompaniesResponse } from "../../../utils/jwtUtils";
import { setCurrCompany } from "../../../redux/actions/authActions";
// Removed processToken import - using direct JWT decoding instead

const RootCallback = () => {
  const [loadingMessage, setLoadingMessage] = useState("Signing you in...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Persistent logging that survives page reloads
  const logToStorage = useCallback((message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    const existingLogs = JSON.parse(
      localStorage.getItem("oauth-debug-logs") || "[]"
    );
    existingLogs.push(logEntry);
    localStorage.setItem("oauth-debug-logs", JSON.stringify(existingLogs));
    console.log(message, data);
  }, []);

  logToStorage("🔵 RootCallback: Component mounted");

  console.log(
    "🔵 RootCallback: Component mounted with URL:",
    window.location.href
  );

  // Function to decode JWT token (same as url-test.js)
  const decodeJWT = useCallback(
    (token) => {
      try {
        logToStorage("🔵 RootCallback: Attempting to decode JWT token");

        // JWT has 3 parts separated by dots: header.payload.signature
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid JWT format - should have 3 parts");
        }

        // Decode the payload (middle part)
        const payload = parts[1];

        // Add padding if needed for base64 decoding
        const paddedPayload =
          payload + "=".repeat((4 - (payload.length % 4)) % 4);

        // Decode base64
        const decodedPayload = atob(paddedPayload);
        const userData = JSON.parse(decodedPayload);

        logToStorage("✅ RootCallback: JWT token decoded successfully", {
          hasEmail: !!userData.email,
          hasName: !!userData.name,
          hasSub: !!userData.sub,
          hasGivenName: !!userData.given_name,
          hasFamilyName: !!userData.family_name,
          hasPicture: !!userData.picture,
          hasEmailVerified: !!userData.email_verified,
          hasAud: !!userData.aud,
          hasIss: !!userData.iss,
          hasExp: !!userData.exp,
          hasIat: !!userData.iat,
        });

        return userData;
      } catch (error) {
        logToStorage("🔴 RootCallback: JWT decoding failed", error);
        throw error;
      }
    },
    [logToStorage]
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent re-processing if already processed or currently processing
    if (hasProcessed || isProcessing) {
      logToStorage("🔵 RootCallback: Already processed or processing, skipping");
      return;
    }

    logToStorage("🔵 RootCallback: useEffect triggered");
    const handleAuthCallback = async () => {
      setIsProcessing(true);
      try {
        logToStorage("🔵 RootCallback: Starting callback processing");
        logToStorage("🔵 RootCallback: Current URL", window.location.href);
        logToStorage(
          "🔵 RootCallback: URL search params",
          window.location.search
        );
        logToStorage("🔵 RootCallback: URL hash", window.location.hash);
        dispatch(setLoading(true));

        // Check for access token in URL hash (Identity Gateway pattern)
        const hash = window.location.hash;
        logToStorage("🔵 RootCallback: URL hash", hash);

        if (hash.includes("access_token=")) {
          logToStorage("🔵 RootCallback: Found access_token in hash");
          const params = new URLSearchParams(hash.substring(1));

          // Extract all three tokens
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          const refreshAuthToken = params.get("refresh_auth_token");
          const userParam = params.get("user");

          logToStorage("🔵 RootCallback: Tokens extracted", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasRefreshAuthToken: !!refreshAuthToken,
            hasUser: !!userParam,
            accessTokenLength: accessToken?.length,
            refreshTokenLength: refreshToken?.length,
            refreshAuthTokenLength: refreshAuthToken?.length,
          });

          logToStorage("🔵 RootCallback: Token found", {
            hasToken: !!accessToken,
            hasUser: !!userParam,
            tokenLength: accessToken?.length,
            userLength: userParam?.length,
          });

          if (accessToken) {
            logToStorage("✅ RootCallback: Access token received");

            // Decode JWT token to get user data
            let userData = null;
            try {
              userData = decodeJWT(accessToken);
              logToStorage("✅ RootCallback: User data extracted from JWT", {
                email: userData.email,
                name: userData.name,
                sub: userData.sub,
              });
            } catch (decodeError) {
              logToStorage(
                "🔴 RootCallback: Failed to decode JWT token",
                decodeError
              );
              // Continue without user data - will use fallback
            }

            // Store all three tokens in cookies
            logToStorage(
              "🔵 RootCallback: About to store all tokens in cookies"
            );
            try {
              // Use less restrictive settings for localhost development
              const isLocalhost =
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";

              // Store access_token as 'token' (main token)
              Cookies.set("token", accessToken, {
                expires: 1 / 24, // 1 hour
                secure: !isLocalhost, // Only secure on HTTPS
                sameSite: "strict", // Less restrictive for development
              });
              logToStorage("✅ RootCallback: Access token stored in cookies");

              // // Store refresh_token
              // if (refreshToken) {
              //   Cookies.set("refresh_token", refreshToken, {
              //     expires: 1, // 1 day
              //     secure: !isLocalhost,
              //     sameSite: "strict",
              //   });
              //   logToStorage(
              //     "✅ RootCallback: Refresh token stored in cookies"
              //   );
              // } else {
              //   logToStorage("⚠️ RootCallback: No refresh_token found");
              // }

              // Store refresh_auth_token
              if (refreshAuthToken) {
                Cookies.set("refresh_auth_token", refreshAuthToken, {
                  expires: 1, // 1 day
                  secure: !isLocalhost,
                  sameSite: "strict",
                });
                logToStorage(
                  "✅ RootCallback: Refresh auth token stored in cookies"
                );
              } else {
                logToStorage("⚠️ RootCallback: No refresh_auth_token found");
              }

              // Verify cookie was set
              const storedToken = Cookies.get("token");
              logToStorage("🔵 RootCallback: Cookie verification", {
                stored: !!storedToken,
                length: storedToken?.length,
                isLocalhost: isLocalhost,
              });
            } catch (cookieError) {
              logToStorage(
                "🔴 RootCallback: Cookie storage failed",
                cookieError
              );
              throw cookieError;
            }

            // Store user data in cookies
            if (userData) {
              const isLocalhost =
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";
              Cookies.set("userToken", JSON.stringify(userData), {
                expires: 1 / (24 * 12), // 2 hours
                secure: !isLocalhost, // Only secure on HTTPS
                sameSite: "strict", // Less restrictive for development
              });
              logToStorage("✅ RootCallback: User data stored in cookies");
            }

            // Set session flag
            localStorage.setItem("session_expired", "false");
            logToStorage("✅ RootCallback: Session flag set");

            // Process user token for Redux state
            logToStorage("🔵 RootCallback: Processing user data for Redux");
            let userPayload = null;
            if (userData) {
              // Use direct JWT decoding (same as url-test.js)
              logToStorage("🔵 RootCallback: Using direct JWT decoding");
              logToStorage("🔵 RootCallback: userData from JWT:", userData);
              userPayload = {
                email: userData.email || "user@example.com",
                userID: userData.userID || "unknown",
                userName:
                  userData.name ||
                  `${userData.given_name || ""} ${
                    userData.family_name || ""
                  }`.trim() ||
                  "User",
                firstName:
                  userData.given_name || userData.name?.split(" ")[0] || "User",
                lastName:
                  userData.family_name || userData.name?.split(" ")[1] || "",
                picture: userData.picture || null,
                emailVerified: userData.email_verified || false,
              };
              logToStorage(
                "🔵 RootCallback: JWT user data processed",
                userPayload
              );
              logToStorage(
                "🔵 RootCallback: userPayload.userID:",
                userPayload.userID
              );
            } else {
              // Fallback if no user data
              userPayload = {
                email: "user@example.com",
                userID: "unknown",
                userName: "User",
                firstName: "User",
                lastName: "",
                picture: null,
                emailVerified: false,
              };
              logToStorage(
                "🔵 RootCallback: No user data, using default",
                userPayload
              );
            }

            // Update Redux state
            logToStorage("🔵 RootCallback: Updating Redux state");
            try {
              // Dispatch actions one by one with delays to ensure they complete
              dispatch(
                setLoggedInUser({
                  email: userPayload.email,
                  token: accessToken,
                })
              );
              logToStorage("🔵 RootCallback: setLoggedInUser dispatched");

              // Small delay to ensure first dispatch completes
              await new Promise((resolve) => setTimeout(resolve, 100));

              dispatch(setUserInfo(userPayload));
              logToStorage(
                "🔵 RootCallback: setUserInfo dispatched with userID:",
                userPayload.userID
              );

              // Small delay to ensure second dispatch completes
              await new Promise((resolve) => setTimeout(resolve, 100));

              dispatch(setIsAuthenticated(true));
              logToStorage("🔵 RootCallback: setIsAuthenticated dispatched");

              // Small delay to ensure third dispatch completes
              await new Promise((resolve) => setTimeout(resolve, 100));

              logToStorage("✅ RootCallback: Redux state updated");
            } catch (reduxError) {
              logToStorage("🔴 RootCallback: Redux update failed", reduxError);
              throw reduxError;
            }

            // Session management is handled by the existing app infrastructure
            logToStorage("✅ RootCallback: Session management ready");

            // Clean up URL
            logToStorage("🔵 RootCallback: Cleaning up URL");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            logToStorage("✅ RootCallback: URL cleaned");

            // Verify all cookies were set
            const finalTokenCheck = Cookies.get("token");
            const finalUserCheck = Cookies.get("userToken");
            const finalRefreshTokenCheck = Cookies.get("refresh_token");
            const finalRefreshAuthTokenCheck =
              Cookies.get("refresh_auth_token");
            logToStorage("🔵 RootCallback: Final cookie verification", {
              hasToken: !!finalTokenCheck,
              hasUser: !!finalUserCheck,
              hasRefreshToken: !!finalRefreshTokenCheck,
              hasRefreshAuthToken: !!finalRefreshAuthTokenCheck,
              tokenLength: finalTokenCheck?.length,
              refreshTokenLength: finalRefreshTokenCheck?.length,
              refreshAuthTokenLength: finalRefreshAuthTokenCheck?.length,
            });

            // Clean up URL immediately
            logToStorage("🔵 RootCallback: Cleaning up URL");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            logToStorage("✅ RootCallback: URL cleaned");

            // Exchange Identity Gateway token for backend token
            logToStorage(
              "🔵 RootCallback: Exchanging Identity Gateway token for backend token"
            );
            const config = getApiConfig();
            try {
              const exchangeResponse = await fetch(
                `${config.identityGateway}/exchange-token`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({
                    token: accessToken,
                    refreshToken: refreshToken,
                    refreshAuthToken: refreshAuthToken,
                    userData: userData,
                  }),
                }
              );

              if (exchangeResponse.ok) {
                const exchangeData = await exchangeResponse.json();
                logToStorage("✅ RootCallback: Token exchange successful", {
                  hasBackendToken: !!exchangeData.backendToken,
                  hasBackendUser: !!exchangeData.backendUser,
                });

                // Store backend-compatible token
                const isLocalhost =
                  window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1";
                Cookies.set("token", exchangeData.backendToken, {
                  expires: 1 / 24, // 1 hour
                  secure: !isLocalhost,
                  sameSite: "strict",
                });

                if (exchangeData.backendUser) {
                  Cookies.set(
                    "userToken",
                    JSON.stringify(exchangeData.backendUser),
                    {
                      expires: 1 / (24 * 12), // 2 hours
                      secure: !isLocalhost,
                      sameSite: "strict",
                    }
                  );
                }

                logToStorage("✅ RootCallback: Backend token stored");
              } else {
                logToStorage(
                  "⚠️ RootCallback: Token exchange failed, using Identity Gateway token",
                  {
                    status: exchangeResponse.status,
                    statusText: exchangeResponse.statusText,
                  }
                );
              }
            } catch (exchangeError) {
              logToStorage(
                "⚠️ RootCallback: Token exchange error, using Identity Gateway token",
                exchangeError
              );
            }

            // Wait briefly for Redux state to settle
            logToStorage("🔵 RootCallback: Waiting for Redux state to settle");
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Auto-redirect to most recently accessed company
            try {
              logToStorage("🔵 RootCallback: Starting auto-selection of company");
              
              // Extract userID from userPayload
              let actualUserID = userPayload.userID;
              if (userPayload.userID === "unknown" || !userPayload.userID) {
                logToStorage(
                  "🔧 RootCallback: userID is unknown, extracting from token"
                );
                // Try to extract from accessToken if it's a JWT
                try {
                  const tokenParts = accessToken.split(".");
                  if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    actualUserID = payload.userID || payload.sub || payload.id;
                    logToStorage(
                      "🔧 RootCallback: Extracted userID from token:",
                      actualUserID
                    );
                  }
                } catch (error) {
                  logToStorage("🔴 RootCallback: Failed to extract userID", error);
                }
              }

              // Get companies list
              logToStorage("🔵 RootCallback: Fetching companies list");
              const companiesResponse = await getCompaniesList();
              const verifiedCompaniesList = await verifyCompaniesResponse(
                companiesResponse,
                actualUserID
              );

              // Sort companies by lastAccessed (most recent first)
              const sortedCompanies = verifiedCompaniesList
                ? [...verifiedCompaniesList].sort((a, b) => {
                    const aLastAccessed = a.lastAccessed ?? 0;
                    const bLastAccessed = b.lastAccessed ?? 0;
                    return bLastAccessed - aLastAccessed;
                  })
                : [];

              // If there are companies, set the most recently accessed one
              if (sortedCompanies.length > 0) {
                const mostRecentCompany = sortedCompanies[0];
                
                // Process company name for routing (decode and get routing name)
                const replaceEncodedSlashes = (encodedStr) => {
                  const decodedSlashes = encodedStr?.replace(/&#x2F;/g, "/");
                  return decodedSlashes?.replace(/&#x200B;/g, "\u200B");
                };
                
                const decodeCompanyName = (encodedName) => {
                  try {
                    const decodedFromValidator = encodedName?.replace(/&#x200B;/g, "\u200B");
                    return decodeURIComponent(decodedFromValidator).replace(/\u200B/g, " ");
                  } catch (error) {
                    console.error("Error decoding company name:", error);
                    return encodedName;
                  }
                };
                
                const getRoutingName = (name) => {
                  const trimmed = name?.trim();
                  return trimmed?.replace(/\s/g, "");
                };
                
                const decodedName = decodeCompanyName(
                  replaceEncodedSlashes(mostRecentCompany.companyName)
                );
                const routingName = getRoutingName(decodedName);
                
                logToStorage(
                  "🔧 RootCallback: Auto-selecting most recently accessed company:",
                  {
                    decodedName,
                    routingName,
                    companyID: mostRecentCompany.companyID,
                  }
                );

                // Store companies in Redux
                dispatch(loadCompanies(verifiedCompaniesList));

                // Set the most recent company as current
                await dispatch(
                  setCurrCompany({
                    ...mostRecentCompany,
                    companyName: routingName,
                  })
                );
                
                logToStorage("✅ RootCallback: Company auto-selected successfully");
                
                // Mark as processed before navigation
                setHasProcessed(true);
                
                // Clear the hash from URL to prevent re-processing
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname
                );
                
                // Navigate to root to trigger routing logic
                // The routing will automatically redirect to the company path
                logToStorage("🔵 RootCallback: Navigating to root to trigger redirect");
                navigate("/", { replace: true });
              } else {
                // Still load companies list (even if empty) for the company selection page
                dispatch(loadCompanies(verifiedCompaniesList));
                logToStorage("⚠️ RootCallback: No companies available");
                
                // Mark as processed before navigation
                setHasProcessed(true);
                
                // Clear the hash from URL to prevent re-processing
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname
                );
                
                // Navigate to company selection page
                logToStorage("🔵 RootCallback: Navigating to /sso/listCompany");
                navigate("/sso/listCompany", { replace: true });
              }
            } catch (error) {
              logToStorage(
                "🔧 RootCallback: Error auto-selecting company:",
                error
              );
              // Don't block login if company selection fails
              // Mark as processed before navigation
              setHasProcessed(true);
              
              // Clear the hash from URL to prevent re-processing
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
              
              // Navigate to company selection page
              logToStorage("🔵 RootCallback: Navigating to /sso/listCompany after error");
              navigate("/sso/listCompany", { replace: true });
            }
          } else {
            throw new Error("No access token found in callback");
          }
        } else {
          // Check for error parameters
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get("error");
          const errorDescription = urlParams.get("error_description");

          if (error) {
            logToStorage("🔴 RootCallback: OAuth error received", {
              error,
              errorDescription,
            });
            throw new Error(`OAuth error: ${error} - ${errorDescription}`);
          } else {
            logToStorage("🔴 RootCallback: No access token or error found");
            throw new Error(
              "No authentication token or error found in callback"
            );
          }
        }
      } catch (error) {
        logToStorage("🔴 RootCallback: Processing failed", error);
        dispatch(setError(error.message));
        setHasProcessed(true);
        navigate("/auth/login?error=oauth_failed");
      } finally {
        setIsProcessing(false);
        dispatch(setLoading(false));
      }
    };

    handleAuthCallback();
  }, [dispatch, navigate, decodeJWT, logToStorage]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 3,
        backgroundColor: "white",
      }}
    >
      {/* Rotating Logo Container */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          border: "2px solid #e9ecef",
          animation: "rotate 3s linear infinite",
          "@keyframes rotate": {
            "0%": {
              transform: "rotate(0deg)",
            },
            "100%": {
              transform: "rotate(360deg)",
            },
          },
        }}
      >
        <img
          src={TGLogo}
          alt="TrueGradient"
          style={{
            width: "45px",
            height: "45px",
            animation: "counterRotate 3s linear infinite",
          }}
        />
      </Box>

      {/* Loading Text */}
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "18px",
          fontWeight: "500",
          color: "#344054",
        }}
      >
        {loadingMessage}
      </Typography>

      {/* CSS for counter-rotation animation */}
      <style>
        {`
          @keyframes counterRotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(-360deg);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default RootCallback;
