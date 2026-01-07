// src/redux/actions/authActions.js
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import { validateUser } from "../../utils/validateUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  setLoggedInUser,
  signOut,
  setError,
  setUserInfo,
  setLoading,
  setIsAuthenticated,
  loadCompanies,
  setNewCompany,
  setCurrentCompany,
  setIsSsoDone,
  setIsContactSalesDialogOpen,
  resetCurrentCompany,
  loadPendingInvites,
} from "../slices/authSlice";
import Cookies from "js-cookie";
import axios from "axios";
import {
  generateToken,
  generateTokens,
  processToken,
  processTokens,
  verifyCompaniesResponse,
  verifyInvitationsResponse,
  verifyResponseSecurity,
} from "../../utils/jwtUtils";

import { invitePeople } from "../../utils/createDBEntry";
import { dialogActionsClasses } from "@mui/material";
import { resetStore, store } from "../store";
import { clearCache } from "../../utils/s3Utils";
import { initiateCustomAuth, verifyCustomChallenge } from "../../utils/auth";
import { getCompaniesList } from "../../utils/getCompaniesList";
import { createCompany } from "../../utils/createCompany";
import { getRefreshToken } from "../../utils/getRefreshToken";
import { getUserById } from "../../utils/getUserById";
import { acceptInvite } from "../../utils/acceptInvitation";
import { denyInvite } from "../../utils/denyInvitation";
import { getPendingInvitesList } from "../../utils/getPendingInvites";
import { expireRefreshToken } from "../../utils/expireRefreshToken";
import { initiateGoogleAuth } from "../../utils/googleAuth";

const poolData = {
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
};

const poolData1 = {
  UserPoolId: process.env.REACT_APP_USER_POOL_ID_1,
  ClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID_1,
};

const cognitoPoolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);
console.log(userPool);

const userPool1 = new CognitoUserPool(poolData1);
console.log(userPool1);

const cognitoUserPool = new CognitoUserPool(cognitoPoolData);
let refreshInterval = null;

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
        cognitoUser.refreshSession(refreshToken, (err, newSession) => {
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
          Cookies.set("token", idToken, { expires: 1 / 24, secure: true });
          console.log("New Session Fetched!");
          resolve(newSession);
        });
      } else {
        const idToken = session.getIdToken().getJwtToken();
        Cookies.set("token", idToken, { expires: 1 / 24, secure: true });
        console.log("Session is Valid!");
        resolve(session);
      }
    });
  });
};
const getCookie = async (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  // console.log("Parts:", parts);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
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
          Cookies.set("token", idToken, { expires: 1 / 24, secure: true });
          console.log("ID Token", idToken);

          const TokenF = getCookie("token");
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
        // console.log("Session refreshed successfully");
      } catch (error) {
        console.error("Error refreshing session:", error);
        dispatch(setError(error.message));
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes
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

export const signUpUser = (email, password) => async (dispatch) => {
  const attributeList = [
    new CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
  ];

  console.log("signUpUser payload:", {
    Username: email,
    Password: password,
    UserAttributes: attributeList,
  });

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
        onSuccess: (result) => {
          const token = result.getIdToken().getJwtToken();
          dispatch(
            setLoggedInUser({
              email: result.idToken.payload.email,
              token,
            })
          );
          Cookies.set("token", token, { expires: 1 / 24, secure: true });
          dispatch(setLoading(false));

          startPeriodicSessionRefresh(dispatch); // Start periodic refresh on signup
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
  await resetStore();
  await dispatch(setLoading(true));

  // Email mappings dictionary
  const emailMappings = {
    "anshuman.agrawal@revvity.com": "Anshuman.Agrawal@revvity.com",
    "girish.oak@revvity.com": "Girish.Oak@revvity.com",
    "michael.andreitchenko@revvity.com": "Michael.Andreitchenko@revvity.com",
    "marc-andre.roy@revvity.com": "Marc-Andre.Roy@revvity.com",
  };

  // Check if the email exists in the dictionary and use the mapped email if available
  const mappedEmail = emailMappings[email] || email; // Use mapped email if found, otherwise use original

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
        Cookies.set("token", token, {
          expires: 1 / 24,
          secure: true,
          sameSite: "strict",
        });
        Cookies.set("userToken", response.user, {
          expires: 1 / (24 * 12),
          secure: true,
          sameSite: "strict",
        });
        Cookies.set("refresh_token", response.refreshToken, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });

        localStorage.setItem("session_expired", "false");
        startPeriodicSessionRefresh(dispatch);

        const userPayload = await processToken(response.user);
        dispatch(setUserInfo(userPayload));

        // Auto-redirect to most recently accessed company
        try {
          // Extract userID from JWT token if needed
          let actualUserID = userPayload.userID;
          if (userPayload.userID === "unknown" || !userPayload.userID) {
            console.log(
              "🔧 loginUser: userID is unknown, extracting from JWT token"
            );
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              actualUserID = payload.userID || payload.sub || payload.id;
              console.log(
                "🔧 loginUser: Extracted userID from JWT:",
                actualUserID
              );
            }
          }

          // Get companies list
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

            // Process company name for routing (same as listCompany2.js)
            const decodedName = decodeCompanyName(
              replaceEncodedSlashes(mostRecentCompany.companyName)
            );
            const routingName = getRoutingName(decodedName);

            console.log(
              "🔧 loginUser: Auto-selecting most recently accessed company:",
              decodedName,
              "routing name:",
              routingName
            );

            // Store companies in Redux
            dispatch(loadCompanies(verifiedCompaniesList));

            // Set the most recent company as current with processed routing name
            await dispatch(
              setCurrCompany({
                ...mostRecentCompany,
                companyName: routingName,
              })
            );
          } else {
            // Still load companies list (even if empty) for the company selection page
            dispatch(loadCompanies(verifiedCompaniesList));
          }
        } catch (error) {
          console.error("🔧 loginUser: Error auto-selecting company:", error);
          // Don't block login if company selection fails
        }

        // sessionStorage.setItem('login-initiated', 'true');
        // localStorage.setItem('login', Date.now());
      } else {
        dispatch(setError(response.message));
      }
    } catch (error) {
      dispatch(setError(error.message));
    }

    dispatch(setLoading(false));
  };

  try {
    const userName = `${mappedEmail}-${companyName}`; // Use the mapped email
    const primaryResult = await authenticate(userName, userPool);
    await handleSuccess(primaryResult, companyName);
  } catch (primaryError) {
    try {
      const fallbackResult = await authenticate(mappedEmail, userPool1); // Use the mapped email for fallback as well
      await handleSuccess(fallbackResult, companyName);
    } catch (fallbackError) {
      dispatch(setError(fallbackError.message));
      dispatch(setLoading(false));
      console.error("Both authentication methods failed!");
    }
  }
};

// Function to initiate OTP login
export const initiateOtpLogin = (email) => async (dispatch) => {
  await dispatch(setLoading(true));

  try {
    // Step 1: Initiate Custom Auth to trigger the OTP
    const { challengeParameters, session } = await initiateCustomAuth(
      email.toLowerCase()
    );
    console.log(`OTP has been sent to the user ${email}`);
    console.log("Challenge parameters: " + challengeParameters);

    // Store the session and email in local storage or state for later use
    localStorage.setItem("otpSession", session);
    localStorage.setItem("otpEmail", email);

    dispatch(setLoading(false));
    // Notify the user to check their email for the OTP
    toast.success("OTP has been sent to your email. Please check and verify.");
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    console.error("Error initiating OTP login process:", error);
  }
};

// Function to verify OTP and complete login
export const verifyOtpAndLogin = (otp) => async (dispatch) => {
  await resetStore();
  await dispatch(setLoading(true));

  // Retrieve the session from local storage or state
  const session = localStorage.getItem("otpSession");
  const email = localStorage.getItem("otpEmail");

  if (!session) {
    dispatch(setError("Session not found. Please initiate login again."));
    dispatch(setLoading(false));
    return Promise.reject("Session not found");
  }

  try {
    // Step 2: Verify the OTP
    const verificationResult = await verifyCustomChallenge(email, otp, session);
    const token = verificationResult.getIdToken().getJwtToken();
    const userEmail = verificationResult.getIdToken().payload.email;
    console.log("Signed in with " + token, " + ", userEmail);

    const response = await validateUser(token);
    if (response.isValidUser) {
      Cookies.set("token", token, {
        expires: 1 / 24,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("userToken", response.user, {
        expires: 1 / (24 * 12),
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("refresh_token", response.refreshToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      localStorage.setItem("session_expired", "false");
      startPeriodicSessionRefresh(dispatch);
      const userPayload = await processToken(response.user);
      console.log(
        "User Email: " + userPayload.email,
        " userID : " + userPayload.userID
      );
      dispatch(setUserInfo(userPayload));
      dispatch(setIsAuthenticated(true));

      // Auto-redirect to most recently accessed company
      try {
        // Extract userID from JWT token if needed
        let actualUserID = userPayload.userID;
        if (userPayload.userID === "unknown" || !userPayload.userID) {
          console.log(
            "🔧 verifyOtpAndLogin: userID is unknown, extracting from JWT token"
          );
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            actualUserID = payload.userID || payload.sub || payload.id;
            console.log(
              "🔧 verifyOtpAndLogin: Extracted userID from JWT:",
              actualUserID
            );
          }
        }

        // Get companies list
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

          // Process company name for routing (same as listCompany2.js)
          const decodedName = decodeCompanyName(
            replaceEncodedSlashes(mostRecentCompany.companyName)
          );
          const routingName = getRoutingName(decodedName);

          console.log(
            "🔧 verifyOtpAndLogin: Auto-selecting most recently accessed company:",
            decodedName,
            "routing name:",
            routingName
          );

          // Store companies in Redux
          dispatch(loadCompanies(verifiedCompaniesList));

          // Set the most recent company as current with processed routing name
          await dispatch(
            setCurrCompany({
              ...mostRecentCompany,
              companyName: routingName,
            })
          );
        } else {
          // Still load companies list (even if empty) for the company selection page
          dispatch(loadCompanies(verifiedCompaniesList));
        }
      } catch (error) {
        console.error(
          "🔧 verifyOtpAndLogin: Error auto-selecting company:",
          error
        );
        // Don't block login if company selection fails
      }

      dispatch(setLoading(false));
      // Clear the session from local storage
      localStorage.removeItem("otpSession");
      localStorage.removeItem("otpEmail");
      return Promise.resolve("OTP verified successfully");
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    console.error("Error verifying OTP:", error);
    return Promise.reject(error.message);
  }
};

export const signOutUser =
  (reason = "logout") =>
  async (dispatch) => {
    const user = userPool.getCurrentUser();
    const user1 = userPool1.getCurrentUser();
    const cognitoUser = cognitoUserPool.getCurrentUser();

    const signOutCognitoUser = (cognitoUser) => {
      if (cognitoUser) {
        cognitoUser.signOut();
      }
    };

    signOutCognitoUser(user);
    signOutCognitoUser(user1);
    signOutCognitoUser(cognitoUser);

    dispatch(setError(null));
    dispatch(signOut());
    const refresh_token = await getCookie("refresh_token");
    const refresh_token_company = await getCookie("refresh_token_company");
    const refresh_auth_token = await getCookie("refresh_auth_token");
    if (refresh_auth_token) {
      try {
        await expireRefreshToken(refresh_auth_token);
      } catch (error) {
        console.log("Error expiring refreshAuthToken:", error);
      }
    }
    if (refresh_token) {
      try {
        await expireRefreshToken(refresh_token);
      } catch (error) {
        console.log("Error expiring refreshToken:", error);
      }
    }
    if (refresh_token_company) {
      try {
        await expireRefreshToken(refresh_token_company);
      } catch (error) {
        console.log("Error expiring refreshTokenCompany:", error);
      }
    }
    Cookies.remove("token");
    Cookies.remove("userToken");
    Cookies.remove("refresh_token");
    Cookies.remove("refresh_auth_token");
    Cookies.remove("refresh_token_company");
    resetStore();

    stopPeriodicSessionRefresh();

    sessionStorage.setItem(`${reason}-initiated`, "true");
    localStorage.setItem(reason, Date.now());
  };

export const fetchUserAttributes = (email) => async (dispatch) => {
  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  cognitoUser.getSession(async (err, session) => {
    if (err) {
      dispatch(setError(err.message));
      return;
    }

    try {
      const refreshedSession = await refreshSession(cognitoUser, dispatch);
      const accessToken = refreshedSession.getAccessToken().getJwtToken();
      dispatch(
        setLoggedInUser({
          email: email,
          token: accessToken,
        })
      );
    } catch (error) {
      dispatch(setError(error.message));
    }
  });
};

// Helper function for API calls that require a valid session
export const makeAuthenticatedRequest = (apiCall) => async (dispatch) => {
  const user = userPool.getCurrentUser();
  if (!user) {
    dispatch(setError("User is not logged in"));
    return;
  }

  try {
    const session = await refreshSession(user, dispatch);
    const token = session.getIdToken().getJwtToken();
    // Make the API call with the valid token
    await apiCall(token);
  } catch (error) {
    console.error("Error making authenticated request:", error);
    dispatch(setError(error.message));
  }
};

export const sendInvite =
  (userInfo, currentCompany, inviteEmail) => async (dispatch) => {
    const invitePayload = {
      companyID: currentCompany.companyID,
      companyName: currentCompany.companyName,
      userEmail: inviteEmail,
      senderEmail: userInfo.userEmail || userInfo.email,
      senderName: userInfo.userName,
      time: performance.now(),
    };
    console.log("invitePayload", invitePayload);
    const response = invitePeople(
      invitePayload,
      currentCompany,
      userInfo.userID
    )
      .then(async (response) => {
        console.log("response of invite people: ", response);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
    return response;
  };

export const acceptInvitation =
  (userID, acceptInvitationPayload, authToken) => async (dispatch) => {
    try {
      console.log("authToken at authAction: ", authToken);

      const response = await acceptInvite(
        userID,
        acceptInvitationPayload,
        authToken
      );
      console.log("response of accept invitation: ", response);

      const refresh_token = await getCookie("refresh_token");
      const userInfo = await processToken(response.user);
      resetStore();
      dispatch(setUserInfo(userInfo));
      Cookies.set("refresh_token", refresh_token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      localStorage.setItem("session_expired", "false");
      dispatch(setIsAuthenticated(true));

      return Promise.resolve(response);
    } catch (error) {
      resetStore();

      dispatch(setError(error.message));

      return Promise.reject(error.message);
    }
  };
export const denyInvitation =
  (userID, denyInvitationPayload, refreshToken) => async (dispatch) => {
    try {
      const response = await denyInvite(
        userID,
        denyInvitationPayload,
        refreshToken
      );
      const refresh_token = await getCookie("refresh_token");
      const userInfo = await processToken(response.user);
      // const refresh_token = response.refreshToken;
      await resetStore();
      dispatch(setUserInfo(userInfo));
      Cookies.set("refresh_token", refresh_token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
      localStorage.setItem("session_expired", "false");
      dispatch(setIsAuthenticated(true));

      console.log("Response of invite people: ", response);

      return Promise.resolve(response);
    } catch (error) {
      resetStore();
      dispatch(setError(error.message));

      return Promise.reject(error.message);
    }
  };

export const getCompanies = (userID) => async (dispatch) => {
  try {
    const response = await getCompaniesList();

    // 🔧 FIX: Extract userID from stored JWT token if userID is "unknown"
    let actualUserID = userID;
    if (userID === "unknown" || !userID) {
      console.log(
        "🔧 getCompanies: userID is unknown, extracting from JWT token"
      );
      const token = await getCookie("token");
      if (token) {
        try {
          // Decode JWT token to get userID
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            actualUserID = payload.userID || payload.sub || payload.id;
            console.log(
              "🔧 getCompanies: Extracted userID from JWT:",
              actualUserID
            );
          }
        } catch (error) {
          console.error("🔧 getCompanies: Failed to decode JWT token:", error);
        }
      }
    }

    const verifiedCompaniesList = await verifyCompaniesResponse(
      response,
      actualUserID
    );
    console.log("verifiedCompaniesList " + verifiedCompaniesList);

    dispatch(loadCompanies(verifiedCompaniesList));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Utility function to flatten DynamoDB AttributeValue objects
const flattenAttributes = (item) => {
  const flattened = {};
  for (const key in item) {
    if (item[key]?.S !== undefined) {
      flattened[key] = item[key].S; // String
    } else if (item[key]?.N !== undefined) {
      flattened[key] = parseFloat(item[key].N); // Number
    } else if (item[key]?.BOOL !== undefined) {
      flattened[key] = item[key].BOOL; // Boolean
    } else if (item[key]?.NULL !== undefined) {
      flattened[key] = null; // Null
    } else {
      flattened[key] = item[key]; // Other (unchanged)
    }
  }
  return flattened;
};

// export const getPendingInvites = (userInfo) => async (dispatch) => {
//   try {
//     const response = await getPendingInvitesList(userInfo.userID);

//     const rawInvitations = await processTokens(response);

//     const decodedPendingInvitesList = rawInvitations.map(flattenAttributes);

//     console.log("decodedPendingInvitesList " + decodedPendingInvitesList);

//     dispatch(loadPendingInvites(decodedPendingInvitesList));
//   } catch (error) {
//     dispatch(setError(error.message));
//   }
// };

export const getPendingInvites = (userInfo) => async (dispatch) => {
  try {
    // 🔧 FIX: Extract userID from stored JWT token if userInfo.userID is "unknown"
    let actualUserID = userInfo.userID;
    if (userInfo.userID === "unknown" || !userInfo.userID) {
      console.log(
        "🔧 getPendingInvites: userID is unknown, extracting from JWT token"
      );
      const token = await getCookie("token");
      if (token) {
        try {
          // Decode JWT token to get userID
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            actualUserID = payload.userID || payload.sub || payload.id;
            console.log(
              "🔧 getPendingInvites: Extracted userID from JWT:",
              actualUserID
            );
          }
        } catch (error) {
          console.error(
            "🔧 getPendingInvites: Failed to decode JWT token:",
            error
          );
        }
      }
    }

    const response = await getPendingInvitesList(actualUserID);

    // Verify security and get invitation data
    const verifiedInvitations = await verifyInvitationsResponse(
      response,
      actualUserID
    );

    console.log("verifiedInvitations " + JSON.stringify(verifiedInvitations));

    dispatch(loadPendingInvites(verifiedInvitations));
  } catch (error) {
    console.error("Error getting pending invites:", error);
    dispatch(setError(error.message));
  }
};
export const createNewCompany = (userInfo, companyName) => async (dispatch) => {
  try {
    const response = await createCompany({
      companyName: companyName,
      userID: userInfo.userID,
    });
    if (response) {
      console.log("createCompany" + JSON.stringify(response));

      dispatch(setNewCompany(response));
    } else {
      dispatch(setIsContactSalesDialogOpen(true));
    }
  } catch (error) {
    console.error("Error creating company:", error);
  }
};

export const refreshCurrentCompnay = () => async (dispatch) => {
  try {
    const Token = await getAuthToken();
    const currentCompanyDetails = await processToken(Token);
    dispatch(
      setCurrentCompany({
        ...currentCompanyDetails,
        companyName: processCompanyName(currentCompanyDetails.companyName),
      })
    );
  } catch (error) {
    console.error("Error refreshing company:", error);
  }
};

export const handleLogoutWithMessage = (message) => async (dispatch) => {
  console.log("handleLogoutWithMessage: Starting logout process");
  const user = userPool.getCurrentUser();
  const user1 = userPool1.getCurrentUser();
  const cognitoUser = cognitoUserPool.getCurrentUser();

  const signOutCognitoUser = (cognitoUser) => {
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  };

  signOutCognitoUser(user);
  signOutCognitoUser(user1);
  signOutCognitoUser(cognitoUser);

  dispatch(setError(null));
  dispatch(signOut());
  const refresh_token = await getCookie("refresh_token");
  const refresh_token_company = await getCookie("refresh_token_company");
  const refresh_auth_token = await getCookie("refresh_auth_token");
  if (refresh_auth_token) {
    try {
      await expireRefreshToken(refresh_auth_token);
    } catch (error) {
      console.log("Error expiring refreshAuthToken:", error);
    }
  }
  if (refresh_token) {
    try {
      await expireRefreshToken(refresh_token);
    } catch (error) {
      console.log("Error expiring refreshToken:", error);
    }
  }
  if (refresh_token_company) {
    try {
      await expireRefreshToken(refresh_token_company);
    } catch (error) {
      console.log("Error expiring refreshTokenCompany:", error);
    }
  }
  Cookies.remove("token");
  Cookies.remove("userToken");
  Cookies.remove("refresh_token");
  Cookies.remove("refresh_auth_token");
  Cookies.remove("refresh_token_company");
  resetStore();
  stopPeriodicSessionRefresh();
  sessionStorage.setItem(`logout-initiated`, "true");
  localStorage.setItem("logout", Date.now());
  // localStorage.setItem("session_expired", "false");
  // Show a toast message
  if (localStorage.getItem("session_expired") === "false") {
    toast.error(message);
    localStorage.setItem("session_expired", "true");
  }
};

export const getAuthToken = async () => {
  const refreshToken = await getCookie("refresh_token");
  const refreshCompanyToken = await getCookie("refresh_token_company");
  const accessToken = await getCookie("refresh_auth_token");

  // 🔍 DEBUG: Log all available cookies
  console.log("🔍 getAuthToken Debug - Available Cookies:");
  console.log("📊 refresh_token:", refreshToken);
  console.log("📊 refresh_token_company:", refreshCompanyToken);
  console.log("📊 refresh_auth_token:", accessToken);
  console.log("📊 token (main):", await getCookie("token"));
  console.log("📊 userToken:", await getCookie("userToken"));

  if (refreshCompanyToken) {
    try {
      const authToken = await getUserById(refreshCompanyToken);
      // console.log("got auth token: " + authToken);
      return authToken;
    } catch (error) {
      const errorMessage = error.message || "";
      const lastWord = errorMessage.split(" ").pop(); // Get the last word of the error message

      if (lastWord === "405") {
        console.log(
          "handleLogoutWithMessage: Session expired. Please sign in again."
        );
        store.dispatch(
          handleLogoutWithMessage("Session expired. Please sign in again.")
        );
      } else {
        setError(errorMessage);
      }
    }
  } else if (refreshToken) {
    try {
      const authToken = await getUserById(refreshToken);
      // console.log("got auth token: " + authToken);
      return authToken;
    } catch (error) {
      const errorMessage = error.message || "";
      const lastWord = errorMessage.split(" ").pop(); // Get the last word of the error message

      if (lastWord === "405") {
        store.dispatch(
          handleLogoutWithMessage("Session expired. Please sign in again.")
        );
      } else {
        setError(errorMessage);
      }
    }
  } else if (accessToken) {
    try {
      console.log(
        "🔍 getAuthToken Debug - Using refresh_auth_token:",
        accessToken
      );
      console.log("📊 Token type:", typeof accessToken);
      console.log("📊 Token length:", accessToken?.length);
      const authToken = await getUserById(accessToken);
      console.log("📊 getUserById result:", authToken);
      return authToken;
    } catch (error) {
      const errorMessage = error.message || "";
      const lastWord = errorMessage.split(" ").pop(); // Get the last word of the error message

      if (lastWord === "405") {
        store.dispatch(
          handleLogoutWithMessage("Session expired. Please sign in again.")
        );
      } else {
        setError(errorMessage);
      }
    }
  } else {
    await store.dispatch(
      handleLogoutWithMessage("Session expired. Please sign in again.")
    );
    await signOutUser();
  }
};
// Update the replaceEncodedSlashes function to handle both encodings
const replaceEncodedSlashes = (encodedStr) => {
  // First replace encoded slashes
  const decodedSlashes = encodedStr?.replace(/&#x2F;/g, "/");
  // Then replace encoded zero-width spaces
  return decodedSlashes?.replace(/&#x200B;/g, "\u200B");
};

// Update this utility function
const getRoutingName = (name) => {
  // First trim any leading/trailing spaces
  const trimmed = name?.trim();
  // Then replace any remaining spaces with empty string
  return trimmed?.replace(/\s/g, "");
};
const decodeCompanyName = (encodedName) => {
  // Decode URI component and replace zero-width spaces with regular spaces
  try {
    // First replace validator's encoded zero-width space with actual zero-width space
    const decodedFromValidator = encodedName?.replace(/&#x200B;/g, "\u200B");
    // Then decode URI component and replace zero-width spaces with regular spaces
    return decodeURIComponent(decodedFromValidator).replace(/\u200B/g, " ");
  } catch (error) {
    console.error("Error decoding company name:", error);
    return encodedName; // Return original if decoding fails
  }
};
export const setCurrCompany = (companyDetails) => async (dispatch) => {
  try {
    try {
      const response = await getRefreshToken(companyDetails.companyID);
      Cookies.set("refresh_token_company", response.refreshToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
      const Token = await getAuthToken();
      const currentCompanyDetails = await processToken(Token);

      dispatch(
        setCurrentCompany({
          ...currentCompanyDetails,
          companyName: companyDetails.companyName,
        })
      );
    } catch (error) {
      const errorMessage = error.message || "";
      const lastWord = errorMessage.split(" ").pop(); // Get the last word of the error message

      if (lastWord === "405") {
        store.dispatch(
          handleLogoutWithMessage("Session expired. Please sign in again.")
        );
      } else {
        setError(errorMessage);
      }
    }
  } catch (error) {
    console.error("Error creating company:", error);
  }
};

export const selectAnotherCompany = (userInfo) => async (dispatch) => {
  try {
    const refresh_token_company = await getCookie("refresh_token_company");

    if (refresh_token_company) {
      try {
        await expireRefreshToken(refresh_token_company);
      } catch (error) {
        console.log("Error expiring refreshTokenCompany:", error);
      }
    }
    Cookies.remove("refresh_token_company");
    //currentCompany intialState
    //redux store to be in initial state except isAuthenticated should be true
    const tempUserInfo = userInfo;
    resetStore();
    dispatch(setIsAuthenticated(true));
    dispatch(setUserInfo(tempUserInfo));
    // Reset currentCompany so user can select a new one
    dispatch(resetCurrentCompany());
  } catch (error) {
    console.error("Error creating company:", error);
  }
};

export const setuserInfo = (userInfo) => async (dispatch) => {
  dispatch(setUserInfo(userInfo));
};

const processCompanyName = (encodedName) => {
  try {
    // Step 1: Replace encoded special characters
    const decodedFromValidator = encodedName
      ?.replace(/&#x200B;/g, "\u200B")
      .replace(/&#x2F;/g, "/");

    // Step 2: Decode URI and replace zero-width spaces with regular spaces
    const decodedName = decodeURIComponent(decodedFromValidator).replace(
      /\u200B/g,
      " "
    );

    // Step 3: Get routing name by trimming and removing spaces
    return decodedName?.trim().replace(/\s/g, "");
  } catch (error) {
    console.error("Error processing company name:", error);
    // If decoding fails, try to at least get a routing name from original
    return encodedName?.trim().replace(/\s/g, "");
  }
};

// // Google Sign-In Action
// export const signInWithGoogle = () => async (dispatch) => {
//   console.log("🟢 signInWithGoogle: Starting Google sign-in process");

//   await resetStore();
//   console.log("🟢 signInWithGoogle: Store reset completed");

//   await dispatch(setLoading(true));
//   console.log("🟢 signInWithGoogle: Loading state set to true");

//   try {
//     // Direct redirect to Google OAuth
//     console.log("🟢 signInWithGoogle: Calling initiateGoogleAuth");
//     initiateGoogleAuth();
//     console.log("🟢 signInWithGoogle: initiateGoogleAuth called successfully");
//   } catch (error) {
//     console.error("🔴 signInWithGoogle: Error occurred", error);
//     dispatch(setError(error.message));
//     dispatch(setLoading(false));
//   }
// };

// Handle Google Callback Action
export const handleGoogleCallback = (authorizationCode) => async (dispatch) => {
  try {
    console.log(
      "🟡 handleGoogleCallback: Starting with authorization code",
      authorizationCode.substring(0, 10) + "..."
    );

    const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/auth/google/callback`;
    console.log("🟡 handleGoogleCallback: API URL", apiUrl);
    console.log("🟡 handleGoogleCallback: Environment variables", {
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    const requestBody = {
      code: authorizationCode,
      redirectUri: "http://localhost:3000/auth/callback/google",
    };
    console.log("🟡 handleGoogleCallback: Request body", {
      code: authorizationCode.substring(0, 10) + "...",
      redirectUri: requestBody.redirectUri,
    });

    // Call your backend API to exchange code for tokens
    console.log("🟡 handleGoogleCallback: Making fetch request to backend");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("🟡 handleGoogleCallback: Response received", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔴 handleGoogleCallback: Response not OK", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });
      throw new Error(
        `Failed to exchange authorization code: ${response.status} ${response.statusText}`
      );
    }

    const responseData = await response.json();
    console.log("✅ handleGoogleCallback: Response data received", {
      hasIdToken: !!responseData.idToken,
      hasRefreshToken: !!responseData.refreshToken,
      hasUser: !!responseData.user,
      idTokenLength: responseData.idToken?.length,
      refreshTokenLength: responseData.refreshToken?.length,
    });

    const { idToken, refreshToken, user } = responseData;

    // Validate user with your existing validateUser function
    console.log(
      "🟡 handleGoogleCallback: Validating user with validateUser function"
    );
    const validationResponse = await validateUser(idToken);
    console.log("🟡 handleGoogleCallback: Validation response", {
      isValidUser: validationResponse.isValidUser,
      hasUser: !!validationResponse.user,
      hasRefreshToken: !!validationResponse.refreshToken,
      message: validationResponse.message,
    });

    if (validationResponse.isValidUser) {
      console.log(
        "✅ handleGoogleCallback: User validation successful, setting up session"
      );

      // Set up session like your existing OTP flow
      Cookies.set("token", idToken, {
        expires: 1 / 24,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("userToken", validationResponse.user, {
        expires: 1 / (24 * 12),
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("refresh_token", validationResponse.refreshToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      localStorage.setItem("session_expired", "false");
      console.log("✅ handleGoogleCallback: Cookies and localStorage set");

      // Process user info
      console.log("🟡 handleGoogleCallback: Processing user token");
      const userPayload = await processToken(validationResponse.user);
      console.log("✅ handleGoogleCallback: User payload processed", {
        email: userPayload.email,
        userID: userPayload.userID,
        userName: userPayload.userName,
      });

      dispatch(setUserInfo(userPayload));
      dispatch(setIsAuthenticated(true));
      console.log("✅ handleGoogleCallback: Redux state updated");

      // Start periodic session refresh
      console.log("🟡 handleGoogleCallback: Starting periodic session refresh");
      startPeriodicSessionRefresh(dispatch);
      console.log("✅ handleGoogleCallback: Periodic session refresh started");

      // Auto-redirect to most recently accessed company
      try {
        // Extract userID from JWT token if needed
        let actualUserID = userPayload.userID;
        if (userPayload.userID === "unknown" || !userPayload.userID) {
          console.log(
            "🔧 handleGoogleCallback: userID is unknown, extracting from JWT token"
          );
          const tokenParts = idToken.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            actualUserID = payload.userID || payload.sub || payload.id;
            console.log(
              "🔧 handleGoogleCallback: Extracted userID from JWT:",
              actualUserID
            );
          }
        }

        // Get companies list
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

          // Process company name for routing (same as listCompany2.js)
          const decodedName = decodeCompanyName(
            replaceEncodedSlashes(mostRecentCompany.companyName)
          );
          const routingName = getRoutingName(decodedName);

          console.log(
            "🔧 handleGoogleCallback: Auto-selecting most recently accessed company:",
            decodedName,
            "routing name:",
            routingName
          );

          // Store companies in Redux
          dispatch(loadCompanies(verifiedCompaniesList));

          // Set the most recent company as current with processed routing name
          await dispatch(
            setCurrCompany({
              ...mostRecentCompany,
              companyName: routingName,
            })
          );
        } else {
          // Still load companies list (even if empty) for the company selection page
          dispatch(loadCompanies(verifiedCompaniesList));
        }
      } catch (error) {
        console.error(
          "🔧 handleGoogleCallback: Error auto-selecting company:",
          error
        );
        // Don't block login if company selection fails
      }

      dispatch(setLoading(false));
      return Promise.resolve("Google authentication successful");
    } else {
      console.error(
        "🔴 handleGoogleCallback: User validation failed",
        validationResponse.message
      );
      throw new Error(validationResponse.message);
    }
  } catch (error) {
    console.error("🔴 handleGoogleCallback: Error occurred", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    return Promise.reject(error.message);
  }
};
