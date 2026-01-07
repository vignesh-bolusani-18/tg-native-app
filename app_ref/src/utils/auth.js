import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { checkRateLimit } from "./rateLimiter";

const userPoolId = process.env.REACT_APP_COGNITO_USER_POOL_ID;
const clientId = process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID;

const userPool = new CognitoUserPool({
  UserPoolId: userPoolId, // Replace with your user pool ID
  ClientId: clientId, // Replace with your app client ID
});

// Initiates the custom authentication flow (like sending OTP)
export const initiateCustomAuth = (email) => {
  console.log(
    `[initiateCustomAuth] Initiating custom auth flow for email: ${email}`
  );

  // Check rate limit before proceeding
  const rateLimitCheck = checkRateLimit(email);
  if (!rateLimitCheck.allowed) {
    const error = new Error(
      `Too many OTP requests. Please wait ${rateLimitCheck.retryAfter} seconds before requesting another OTP.`
    );
    error.code = "RATE_LIMIT_EXCEEDED";
    error.retryAfter = rateLimitCheck.retryAfter;
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: "", // Password can be left empty for custom auth flows
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.initiateAuth(authDetails, {
      onSuccess: (result) => {
        console.log(
          `[initiateCustomAuth] Custom auth flow started successfully for email: ${email}`
        );
        resolve({ result, session: null }); // No custom challenge, normal auth flow
      },
      onFailure: (error) => {
        console.error(
          `[initiateCustomAuth] Failed to initiate custom auth for email: ${email}. Error:`,
          error
        );
        reject(error); // Handle the error
      },
      customChallenge: (challengeParameters) => {
        console.log(
          `[initiateCustomAuth] Custom challenge triggered for email: ${email}. Challenge Parameters:`,
          challengeParameters
        );
        resolve({ challengeParameters, session: cognitoUser.Session }); // Return challenge parameters and session
      },
    });
  });
};

// Verifies the OTP (custom challenge) during the custom auth flow
export const verifyCustomChallenge = (email, otp, session) => {
  console.log(
    `[verifyCustomChallenge] Verifying custom challenge for email: ${email} with OTP: ${otp} whose session: ${session}`
  );

  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    // Set the session value in the cognitoUser object
    cognitoUser.Session = session;

    // Respond to the custom challenge with the OTP
    cognitoUser.sendCustomChallengeAnswer(otp, {
      onSuccess: (result) => {
        console.log(
          `[verifyCustomChallenge] Custom challenge verified successfully for email: ${email}`
        );
        resolve(result); // Custom challenge verified successfully
      },
      onFailure: (error) => {
        console.error(
          `[verifyCustomChallenge] Failed to verify custom challenge for email: ${email}. Error:`,
          error
        );
        reject(error); // Handle the error
      },
    });
  });
};
