import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setLoading,
  setError,
  setLoggedInUser,
  setUserInfo,
  setIsAuthenticated,
} from "../../../redux/slices/authSlice";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import Cookies from "js-cookie";
import { processToken } from "../../../utils/jwtUtils";

const GoogleOAuthCallback = () => {
  // Persistent logging that survives page reloads
  const logToStorage = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    const existingLogs = JSON.parse(
      localStorage.getItem("oauth-debug-logs") || "[]"
    );
    existingLogs.push(logEntry);
    localStorage.setItem("oauth-debug-logs", JSON.stringify(existingLogs));
    console.log(message, data);
  };

  logToStorage("🔵 GoogleOAuthCallback: Component mounted");

  // Immediate alert to see if callback is reached
  alert(
    "Google OAuth Callback reached! Check console and localStorage for logs."
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    logToStorage("🔵 GoogleOAuthCallback: useEffect triggered");
    const handleAuthCallback = async () => {
      try {
        logToStorage("🔵 Google OAuth Callback: Starting callback processing");
        logToStorage(
          "🔵 Google OAuth Callback: Current URL",
          window.location.href
        );
        logToStorage(
          "🔵 Google OAuth Callback: URL search params",
          window.location.search
        );
        logToStorage(
          "🔵 Google OAuth Callback: URL hash",
          window.location.hash
        );
        dispatch(setLoading(true));

        // Check for access token in URL hash (Identity Gateway pattern)
        const hash = window.location.hash;
        console.log("🔵 Google OAuth Callback: URL hash", hash);

        if (hash.includes("access_token=")) {
          console.log("🔵 Google OAuth Callback: Found access_token in hash");
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");
          const userParam = params.get("user");

          console.log("🔵 Google OAuth Callback: Token found", {
            hasToken: !!accessToken,
            hasUser: !!userParam,
            tokenLength: accessToken?.length,
            userLength: userParam?.length,
          });

          if (accessToken) {
            console.log("✅ Google OAuth Callback: Access token received");

            // Parse user data if provided
            let userData = null;
            if (userParam) {
              try {
                userData = JSON.parse(decodeURIComponent(userParam));
                console.log("✅ Google OAuth Callback: User data parsed", {
                  email: userData.email,
                  name: userData.name,
                });
              } catch (parseError) {
                console.warn(
                  "⚠️ Google OAuth Callback: Could not parse user data",
                  parseError
                );
              }
            }

            // Store tokens in cookies (like OTP flow)
            console.log(
              "🔵 Google OAuth Callback: About to store token in cookies"
            );
            try {
              // Use less restrictive settings for localhost development
              const isLocalhost =
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";

              Cookies.set("token", accessToken, {
                expires: 1 / 24, // 1 hour
                secure: !isLocalhost, // Only secure on HTTPS
                sameSite: "strict", // Less restrictive for development
              });
              console.log(
                "✅ Google OAuth Callback: Access token stored in cookies"
              );

              // Verify cookie was set
              const storedToken = Cookies.get("token");
              console.log("🔵 Google OAuth Callback: Cookie verification", {
                stored: !!storedToken,
                length: storedToken?.length,
                isLocalhost: isLocalhost,
              });
            } catch (cookieError) {
              console.error(
                "🔴 Google OAuth Callback: Cookie storage failed",
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
              console.log(
                "✅ Google OAuth Callback: User data stored in cookies"
              );
            }

            // Store refresh token if provided
            const refreshToken = params.get("refresh_token");
            if (refreshToken) {
              const isLocalhost =
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";
              Cookies.set("refresh_token", refreshToken, {
                expires: 1, // 1 day
                secure: !isLocalhost, // Only secure on HTTPS
                sameSite: "strict", // Less restrictive for development
              });
              console.log(
                "✅ Google OAuth Callback: Refresh token stored in cookies"
              );
            }

            // Set session flag
            localStorage.setItem("session_expired", "false");
            console.log("✅ Google OAuth Callback: Session flag set");

            // Process user token for Redux state
            console.log(
              "🔵 Google OAuth Callback: Processing user data for Redux"
            );
            let userPayload = null;
            if (userData) {
              try {
                console.log(
                  "🔵 Google OAuth Callback: Attempting to process user token"
                );
                userPayload = await processToken(JSON.stringify(userData));
                console.log(
                  "✅ Google OAuth Callback: User payload processed",
                  {
                    email: userPayload.email,
                    userID: userPayload.userID,
                    userName: userPayload.userName,
                  }
                );
              } catch (processError) {
                console.warn(
                  "⚠️ Google OAuth Callback: Could not process user token",
                  processError
                );
                // Fallback user data
                userPayload = {
                  email: userData.email || "user@example.com",
                  userID: userData.id || "unknown",
                  userName: userData.name || "User",
                };
                console.log(
                  "🔵 Google OAuth Callback: Using fallback user data",
                  userPayload
                );
              }
            } else {
              // Fallback if no user data
              userPayload = {
                email: "user@example.com",
                userID: "unknown",
                userName: "User",
              };
              console.log(
                "🔵 Google OAuth Callback: No user data, using default",
                userPayload
              );
            }

            // Update Redux state
            console.log("🔵 Google OAuth Callback: Updating Redux state");
            try {
              dispatch(
                setLoggedInUser({
                  email: userPayload.email,
                  token: accessToken,
                })
              );
              console.log(
                "🔵 Google OAuth Callback: setLoggedInUser dispatched"
              );

              dispatch(setUserInfo(userPayload));
              console.log("🔵 Google OAuth Callback: setUserInfo dispatched");

              dispatch(setIsAuthenticated(true));
              console.log(
                "🔵 Google OAuth Callback: setIsAuthenticated dispatched"
              );

              console.log("✅ Google OAuth Callback: Redux state updated");
            } catch (reduxError) {
              console.error(
                "🔴 Google OAuth Callback: Redux update failed",
                reduxError
              );
              throw reduxError;
            }

            // Session management is handled by the existing app infrastructure
            console.log("✅ Google OAuth Callback: Session management ready");

            // Clean up URL
            console.log("🔵 Google OAuth Callback: Cleaning up URL");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            console.log("✅ Google OAuth Callback: URL cleaned");

            // Redirect to company selection
            console.log(
              "🔵 Google OAuth Callback: Redirecting to /sso/listCompany"
            );
            try {
              navigate("/sso/listCompany");
              console.log("✅ Google OAuth Callback: Navigation initiated");
            } catch (navError) {
              console.error(
                "🔴 Google OAuth Callback: Navigation failed",
                navError
              );
              throw navError;
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
            console.error("🔴 Google OAuth Callback: OAuth error received", {
              error,
              errorDescription,
            });
            throw new Error(`OAuth error: ${error} - ${errorDescription}`);
          } else {
            console.error(
              "🔴 Google OAuth Callback: No access token or error found"
            );
            throw new Error(
              "No authentication token or error found in callback"
            );
          }
        }
      } catch (error) {
        console.error("🔴 Google OAuth Callback: Processing failed", error);
        dispatch(setError(error.message));
        navigate("/auth/login?error=oauth_failed");
      } finally {
        dispatch(setLoading(false));
      }
    };

    handleAuthCallback();
  }, [dispatch, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "16px",
          fontWeight: "500",
          color: "#344054",
        }}
      >
        Processing Google authentication...
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "12px",
          color: "#666",
        }}
      >
        URL: {window.location.href}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => (window.location.href = "/auth/debug-logs")}
        sx={{ mt: 2 }}
      >
        View Debug Logs
      </Button>
    </Box>
  );
};

export default GoogleOAuthCallback;
