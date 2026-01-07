import Cookies from "js-cookie";

// Environment-aware configuration for Identity Gateway
export const getApiConfig = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return {
      identityGateway: "http://localhost:8080",
      clientUrl: "http://localhost:3000",
      callbackPath: "/auth/callback/oauth",
    };
  } else if (hostname === "staging.truegradient.ai") {
    return {
      identityGateway: "https://identity-gateway-dev.truegradient.ai",
      clientUrl: "https://staging.truegradient.ai",
      callbackPath: "/auth/callback/oauth",
    };
  } else if (hostname === "app.truegradient.ai") {
    return {
      identityGateway: "https://identity-gateway.truegradient.ai",
      clientUrl: "https://app.truegradient.ai",
      callbackPath: "/auth/callback/oauth",
    };
  }

  // Default to development
  return {
    identityGateway: "http://localhost:8080",
    clientUrl: "http://localhost:3000",
    callbackPath: "/auth/callback/oauth",
  };
};

// Identity Gateway API Functions
export const sendOTP = async (email) => {
  const config = getApiConfig();

  try {
    console.log("🟡 sendOTP: Sending OTP to", email);
    const response = await fetch(`${config.identityGateway}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log("🟡 sendOTP: Response received", {
      status: response.status,
      data,
    });

    if (response.ok) {
      console.log("✅ sendOTP: OTP sent successfully");
      return { success: true, data };
    } else {
      console.error("🔴 sendOTP: Failed to send OTP:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("🔴 sendOTP: Network error:", error);
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (email, otp) => {
  const config = getApiConfig();

  try {
    console.log("🟡 verifyOTP: Verifying OTP for", email);
    const response = await fetch(`${config.identityGateway}/login/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    console.log("🟡 verifyOTP: Response received", {
      status: response.status,
      data,
    });

    if (response.ok) {
      // Store token and user data in cookies (consistent with Google OAuth)
      Cookies.set("token", data.accessToken, {
        expires: 1 / 24, // 1 hour
        secure: true,
        sameSite: "strict",
      });

      Cookies.set("userToken", JSON.stringify(data.user), {
        expires: 1 / (24 * 12), // 2 hours
        secure: true,
        sameSite: "strict",
      });

      // Also store in localStorage for backward compatibility
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("✅ verifyOTP: Login successful:", data);
      return { success: true, data };
    } else {
      console.error("🔴 verifyOTP: OTP verification failed:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("🔴 verifyOTP: Network error:", error);
    return { success: false, error: error.message };
  }
};

export const startGoogleAuth = () => {
  const config = getApiConfig();
  console.log(
    "🟢 startGoogleAuth: Redirecting to",
    `${config.identityGateway}/login/google`
  );
  window.location.href = `${config.identityGateway}/login/google`;
};

export const checkHealth = async () => {
  const config = getApiConfig();

  try {
    const response = await fetch(`${config.identityGateway}/health`);
    const data = await response.json();
    console.log("Service health:", data);
    return data;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
};

// Token management utilities
export const isAuthenticated = () => {
  // Check cookies first, then localStorage for backward compatibility
  const token = Cookies.get("token") || localStorage.getItem("accessToken");
  return !!token;
};

export const getCurrentUser = () => {
  // Check cookies first, then localStorage for backward compatibility
  const user = Cookies.get("userToken") || localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  // Clear cookies
  Cookies.remove("token");
  Cookies.remove("userToken");
  Cookies.remove("refresh_token");

  // Clear localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("session_expired");

  window.location.href = "/auth/login";
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  // Check cookies first, then localStorage for backward compatibility
  const token = Cookies.get("token") || localStorage.getItem("accessToken");

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};
