import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setLoading,
  setError,
  setLoggedInUser,
  setUserInfo,
  setIsAuthenticated,
} from "../../../redux/slices/authSlice";
import { handleGoogleCallback } from "../../../redux/actions/authActions";
import { verifyGoogleState } from "../../../utils/googleAuth";
import { Box, Typography, CircularProgress } from "@mui/material";

const GoogleCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("🔵 Google Callback: Starting callback processing");
        dispatch(setLoading(true));

        // Extract authorization code and state from URL
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        console.log("🔵 Google Callback: URL parameters", {
          code: code ? `${code.substring(0, 10)}...` : null,
          state: state ? `${state.substring(0, 10)}...` : null,
          error: error,
        });

        if (error) {
          console.error("🔴 Google Callback: OAuth error received", error);
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code) {
          console.error("🔴 Google Callback: No authorization code received");
          throw new Error("No authorization code received");
        }

        // Verify state parameter for security
        console.log("🔵 Google Callback: Verifying state parameter");
        if (!verifyGoogleState(state)) {
          console.error("🔴 Google Callback: Invalid state parameter");
          throw new Error("Invalid state parameter");
        }
        console.log(
          "✅ Google Callback: State parameter verified successfully"
        );

        // Process the authorization code
        console.log(
          "🔵 Google Callback: Calling handleGoogleCallback with code"
        );
        const result = await dispatch(handleGoogleCallback(code));
        console.log(
          "✅ Google Callback: handleGoogleCallback completed",
          result
        );

        // Routing will automatically redirect to company path if company is auto-selected,
        // or to /sso/listCompany if no company is available
        // No explicit navigation needed
      } catch (error) {
        console.error("🔴 Google Callback: Processing failed", error);
        dispatch(setError(error.message));
        navigate("/auth/login?error=google_auth_failed");
      } finally {
        dispatch(setLoading(false));
      }
    };

    processCallback();
  }, [dispatch, navigate, searchParams]);

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
    </Box>
  );
};

export default GoogleCallback;
