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
import { Box, Typography, CircularProgress } from "@mui/material";

const IdentityGatewayCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log(
          "🔵 Identity Gateway Callback: Starting callback processing"
        );
        dispatch(setLoading(true));

        // Extract parameters from URL
        const token = searchParams.get("token");
        const user = searchParams.get("user");
        const error = searchParams.get("error");

        console.log("🔵 Identity Gateway Callback: URL parameters", {
          hasToken: !!token,
          hasUser: !!user,
          error: error,
        });

        if (error) {
          console.error(
            "🔴 Identity Gateway Callback: OAuth error received",
            error
          );
          throw new Error(`OAuth error: ${error}`);
        }

        if (!token) {
          console.error("🔴 Identity Gateway Callback: No token received");
          throw new Error("No authentication token received");
        }

        // Parse user data if provided
        let userData = null;
        if (user) {
          try {
            userData = JSON.parse(decodeURIComponent(user));
            console.log("✅ Identity Gateway Callback: User data parsed", {
              email: userData.email,
              name: userData.name,
            });
          } catch (parseError) {
            console.warn(
              "⚠️ Identity Gateway Callback: Could not parse user data",
              parseError
            );
          }
        }

        // Store token and user data
        localStorage.setItem("accessToken", token);
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }

        console.log("✅ Identity Gateway Callback: Token and user data stored");

        // Update Redux state
        dispatch(
          setLoggedInUser({
            email: userData?.email || "user@example.com",
            token: token,
          })
        );

        if (userData) {
          dispatch(setUserInfo(userData));
        }

        dispatch(setIsAuthenticated(true));
        console.log("✅ Identity Gateway Callback: Redux state updated");

        // Redirect to company selection
        console.log(
          "🔵 Identity Gateway Callback: Redirecting to /sso/listCompany"
        );
        navigate("/sso/listCompany");
      } catch (error) {
        console.error("🔴 Identity Gateway Callback: Processing failed", error);
        dispatch(setError(error.message));
        navigate("/auth/login?error=oauth_failed");
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
        Processing authentication...
      </Typography>
    </Box>
  );
};

export default IdentityGatewayCallback;



















