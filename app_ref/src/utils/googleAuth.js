// Direct Google OAuth implementation without Cognito domain
export const initiateGoogleAuth = () => {
  console.log("🟢 initiateGoogleAuth: Starting Google OAuth flow");

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    "http://localhost:3000/auth/callback/google"
  );
  const scope = encodeURIComponent("openid email profile");
  const state = generateRandomState(); // Generate random state for security

  console.log("🟢 initiateGoogleAuth: Configuration", {
    clientId: clientId ? `${clientId.substring(0, 20)}...` : "NOT_SET",
    redirectUri: "http://localhost:3000/auth/callback/google",
    scope: "openid email profile",
    state: state ? `${state.substring(0, 10)}...` : "NOT_GENERATED",
  });

  // Store state in localStorage for verification
  localStorage.setItem("google_oauth_state", state);
  console.log("🟢 initiateGoogleAuth: State stored in localStorage");

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scope}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${state}`;

  console.log("🟢 initiateGoogleAuth: Google Auth URL generated", {
    url: googleAuthUrl.substring(0, 100) + "...",
    hasClientId: !!clientId,
    hasRedirectUri: !!redirectUri,
    hasState: !!state,
  });

  // Redirect to Google OAuth
  console.log("🟢 initiateGoogleAuth: Redirecting to Google OAuth");
  window.location.href = googleAuthUrl;
};

const generateRandomState = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Verify state parameter for security
export const verifyGoogleState = (receivedState) => {
  console.log("🔵 verifyGoogleState: Verifying state parameter");
  const storedState = localStorage.getItem("google_oauth_state");
  console.log("🔵 verifyGoogleState: State comparison", {
    receivedState: receivedState
      ? `${receivedState.substring(0, 10)}...`
      : "NULL",
    storedState: storedState ? `${storedState.substring(0, 10)}...` : "NULL",
    match: storedState === receivedState,
  });

  localStorage.removeItem("google_oauth_state");
  console.log("🔵 verifyGoogleState: Stored state removed from localStorage");

  const isValid = storedState === receivedState;
  console.log(
    isValid
      ? "✅ verifyGoogleState: State verification successful"
      : "🔴 verifyGoogleState: State verification failed"
  );

  return isValid;
};
