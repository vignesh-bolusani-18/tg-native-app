// utils/auth.js
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
} from "amazon-cognito-identity-js";

// Mock rate limiter if not available, or you can migrate rateLimiter.js later
// import { checkRateLimit } from "./rateLimiter"; 

const poolData = {
  UserPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || "ap-south-1_FuqhGcsAn", 
  ClientId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID || "2dulgjlqpkm0nug40qv7s5v03g",
};

const userPool = new CognitoUserPool(poolData);

// Initiates the custom authentication flow (like sending OTP)
export const initiateCustomAuth = (email) => {
  console.log(`[initiateCustomAuth] Initiating custom auth flow for email: ${email}`);

  // Rate limit check placeholder
  /*
  const rateLimitCheck = checkRateLimit(email);
  if (!rateLimitCheck.allowed) {
    return Promise.reject(new Error("Too many OTP requests."));
  }
  */

  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: "", 
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.initiateAuth(authDetails, {
      onSuccess: (result) => {
        console.log(`[initiateCustomAuth] Success: ${email}`);
        resolve({ result, session: null });
      },
      onFailure: (error) => {
        console.error(`[initiateCustomAuth] Failed:`, error);
        reject(error);
      },
      customChallenge: (challengeParameters) => {
        console.log(`[initiateCustomAuth] Challenge triggered`);
        resolve({ challengeParameters, session: cognitoUser.Session });
      },
    });
  });
};

// Verifies the OTP (custom challenge)
export const verifyCustomChallenge = (email, otp, session) => {
  console.log(`[verifyCustomChallenge] Verifying OTP for ${email}`);

  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.Session = session;

    cognitoUser.sendCustomChallengeAnswer(otp, {
      onSuccess: (result) => {
        console.log(`[verifyCustomChallenge] Success`);
        resolve(result);
      },
      onFailure: (error) => {
        console.error(`[verifyCustomChallenge] Failed:`, error);
        reject(error);
      },
    });
  });
};