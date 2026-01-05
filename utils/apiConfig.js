// utils/apiConfig.js

// Environment-aware configuration
export const getApiConfig = () => {
  // In React Native, we don't have window.location.hostname
  // You should use environment variables (expo-constants)
  
  if (__DEV__) {
    // Development Config
    const vibeBaseUrl = process.env.EXPO_PUBLIC_VIBE_BASE_URL ? `https://${process.env.EXPO_PUBLIC_VIBE_BASE_URL}` : "https://vibe-backend.truegradient.ai";
    
    return {
      identityGateway: process.env.EXPO_PUBLIC_IDENTITY_GATEWAY_URL || "http://localhost:8080",
      clientUrl: "myapp://",
      callbackPath: "auth/callback",
      baseURL: vibeBaseUrl,
      apiBaseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://api-staging-ap-south-1.truegradient.ai",
      apiKey: process.env.EXPO_PUBLIC_API_KEY,
    };
  }

  // Production Config
  return {
    identityGateway: process.env.EXPO_PUBLIC_IDENTITY_GATEWAY_URL || "https://identity-gateway.truegradient.ai",
    clientUrl: "https://app.truegradient.ai",
    callbackPath: "auth/callback",
    baseURL: process.env.EXPO_PUBLIC_VIBE_BASE_URL ? `https://${process.env.EXPO_PUBLIC_VIBE_BASE_URL}` : "https://vibe-backend.truegradient.ai",
    apiBaseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://api-staging-ap-south-1.truegradient.ai",
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  };
};

export const apiConfig = getApiConfig();

// Export commonly used constants for convenience
export const API_BASE_URL = apiConfig.apiBaseURL;
export const API_KEY = apiConfig.apiKey;
export const VIBE_BASE_URL = apiConfig.baseURL;
export const IDENTITY_GATEWAY_URL = apiConfig.identityGateway;

export const sendOTP = async (email) => {
  console.log("⚠️ sendOTP: Identity Gateway OTP endpoints do not exist.");
  console.log("📧 Email:", email);
  console.log("💡 NOTE: This app uses AWS Cognito Custom Auth Challenge for OTP.");
  console.log("💡 The Cognito flow is handled by amazon-cognito-identity-js library.");
  
  // Return error to prevent confusion
  return { 
    success: false, 
    error: "OTP via Identity Gateway is not available. Use Cognito Custom Auth Challenge instead." 
  };
};

export const verifyOTP = async (email, otp) => {
  console.log("⚠️ verifyOTP: Identity Gateway OTP endpoints do not exist.");
  console.log("📧 Email:", email, "OTP:", otp);
  console.log("💡 NOTE: This app uses AWS Cognito Custom Auth Challenge for OTP.");
  console.log("💡 The Cognito flow is handled by amazon-cognito-identity-js library.");
  
  // Return error to prevent confusion
  return { 
    success: false, 
    error: "OTP via Identity Gateway is not available. Use Cognito Custom Auth Challenge instead." 
  };
};
