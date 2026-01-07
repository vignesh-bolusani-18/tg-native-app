// utils/jwtUtils.js
import CryptoJS from "crypto-js";
import { KJUR, jws, KEYUTIL } from "jsrsasign";
import forge from "node-forge";
import "react-native-get-random-values"; // Required for crypto logic in RN
import axios from "axios";
// import forge from "node-forge";
// import CryptoJS from "crypto-js";

// Constants for environment variables
// import { KJUR, jws, KEYUTIL, b64utoutf8 } from "jsrsasign";
const JWKS_URL = `https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_ZeyBLLbgv/.well-known/jwks.json`;

// RSA public key (used for verification)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpOG5xBrQxXnWgzL1M+fC47E8M
YHEqjIN5VeHeohHigoGbj4AZdvTNfd/Ezcck/QE2luKuDcbk4eMvq2dUi3ifbfBr
tnRZy/sRJLN6md7Rbd1ULSVcwTKxduMZ2c660PoaVlDxYJ4aWNwUF197ASBqnPtN
nPUIzxmgjOxMzREZLQIDAQAB
-----END PUBLIC KEY-----`;

/**

 */ /**
 * Encrypts a payload using hybrid encryption (AES + RSA).
 * @param {Object} payload - The payload to encrypt.
 * @param {string} publicKey - The RSA public key in PEM format.
 * @returns {Object} Encrypted data containing AES-encrypted payload and RSA-encrypted AES key.
 */
export function encryptHybrid(payload, publicKey) {
  // Step 1: Generate a random AES key and IV
  const aesKey = forge.random.getBytesSync(16); // 16 bytes = 128-bit key
  const iv = forge.random.getBytesSync(16); // 16 bytes IV for AES-CBC

  // Step 2: Encrypt the payload with AES
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(JSON.stringify(payload), "utf8"));
  cipher.finish();
  const encryptedPayload = forge.util.encode64(cipher.output.getBytes());

  // Step 3: Encrypt the AES key with RSA
  const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);
  const encryptedAesKey = forge.util.encode64(
    rsaPublicKey.encrypt(aesKey, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    })
  );

  // Step 4: Return the encrypted data and IV
  return {
    encryptedPayload,
    encryptedAesKey,
    iv: forge.util.encode64(iv),
  };
}

/**
 * Function to generate, decode, and verify JWT tokens
 * @param {Array<string>} tokens - Array of JWT tokens
 * @returns {Promise<Array<Object>>} - Array of decoded JWT payloads
 */
export const processTokens = async (tokens) => {
  // console.log("Processing tokens: ", tokens);
  const decodedTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // console.log(token);
    try {
      const payload = decodeToken(token);
      decodedTokens.push(payload);
    } catch (err) {
      console.error(`Failed to decode token ${i + 1}:`, err);
    }
  }

  return decodedTokens;
};

export const processToken = async (token) => {
  try {
    return decodeToken(token);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

// Function to fetch the JWKS and find the matching key
async function getSigningKey(kid) {
  const response = await axios.get(JWKS_URL);
  const keys = response.data.keys;
  const signingKey = keys.find((key) => key.kid === kid);

  if (!signingKey) {
    throw new Error(`Unable to find a signing key that matches '${kid}'`);
  }

  // Convert the JWKS to PEM format
  return KEYUTIL.getKey(signingKey);
}

// // Function to get the value of a cookie by its name
// const getCookie = (name) => {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(";").shift();
//   return null;
// };

// // Function to verify the Cognito token and use it as a key
// async function verifyCognitoToken(token) {
//   try {
//     const decodedHeader = KJUR.jws.JWS.readSafeJSONString(
//       b64utoutf8(token.split(".")[0])
//     );

//     if (!decodedHeader.kid) {
//       throw new Error("JWT does not contain 'kid'");
//     }

//     const kid = decodedHeader.kid;
//     const publicKey = await getSigningKey(kid);

//     const isValid = KJUR.jws.JWS.verifyJWT(token, publicKey, {
//       alg: ["RS256"],
//     });

//     if (!isValid) {
//       throw new Error("Invalid or expired JWT");
//     }

//     const decodedToken = KJUR.jws.JWS.parse(token).payloadObj;
//     return { decodedToken, token };
//   } catch (error) {
//     console.error("Failed to verify Cognito token:", error);
//     throw error;
//   }
// }

// Function to sign a new JWT using HS256 and the verified Cognito token as the key
export const signToken = (payload, key) => {
  const header = { alg: "HS256", typ: "JWT" };
  return jws.JWS.sign(null, header, payload, key);
};

export const generateToken = async (payload, authToken) => {
  try {
    if (!authToken) {
      throw new Error("generateToken: authToken is required but was null/undefined");
    }
    console.log("authToken: ", authToken);
    // const { token } = await verifyCognitoToken(authToken);
    // const newToken = signToken(payload, token);

    const newToken = signToken(payload, authToken);
    console.log("newToken: ", newToken);
    return newToken;
  } catch (error) {
    console.error("Error generating JWT Token:", error);
    throw error;
  }
};

export const generateTokens = async (payloads) => {
  const tokens = [];

  for (const [index, payload] of payloads.entries()) {
    try {
      const token = await generateToken(payload);
      // console.log(`Generated JWT Token ${index + 1}:`, token);
      tokens.push(token);
    } catch (error) {
      console.error(`Error generating JWT Token ${index + 1}:`, error);
      throw error;
    }
  }

  return tokens;
};
const decodeToken = (token) => {
  // console.log(`Decoded JWT Token`, token);
  try {
    if (typeof token !== "string") {
      throw new Error("Token must be a string", typeof token, "##", token);
    }

    const isValid = KJUR.jws.JWS.verifyJWT(token, PUBLIC_KEY, {
      alg: ["RS256"],
    });
    if (!isValid) {
      console.log("Invalid or expired JWT");
    }
  } catch (error) {
    console.log("Error at validation of token : ", error);
  }

  try {
    if (typeof token !== "string") {
      throw new Error("Token must be a string");
    }

    const decoded = KJUR.jws.JWS.parse(token).payloadObj || {};
    return decoded;
  } catch (error) {
    console.log("Error at parsing token : ", error);
  }
};

/**
 * Generalized secure response verification function
 * @param response - The secure response from the server
 * @param dataKey - The key name for the actual data (e.g., "invitations", "experiments", "datasets")
 * @param expectedUserID - The user ID to verify against (optional, will use response.data.userID if not provided)
 * @returns The verified data array/object
 */
export const verifyResponseSecurity = async (
  response,
  dataKey,
  expectedUserID = null
) => {
  try {
    // 🔍 DEBUG: Log the token being used for verification
    console.log("🔍 JWT Security Debug - Token Verification:");
    console.log(
      "📊 response.security.signedAuthToken:",
      response.security.signedAuthToken
    );
    console.log("📊 Token type:", typeof response.security.signedAuthToken);
    console.log("📊 Token length:", response.security.signedAuthToken?.length);

    // Step 1: Verify RSA signature
    const authPayload = await verifyRSAToken(response.security.signedAuthToken);

    console.log(
      "📊 Decoded authPayload:",
      JSON.stringify(authPayload, null, 2)
    );

    // Step 2: Verify data integrity using crypto-js
    // Extract the data that was actually hashed (excluding security fields)
    const dataToHash = extractDataForHashing(response.data, dataKey);

    const dataString = JSON.stringify(
      dataToHash,
      Object.keys(dataToHash).sort()
    );
    const expectedHash = CryptoJS.SHA512(dataString).toString();

    if (expectedHash !== authPayload.dataHash) {
      throw new Error(
        "Data integrity check failed - possible tampering detected"
      );
    }

    // Step 3: Verify user context
    const userIDToVerify = expectedUserID || response.data.userID;

    // 🔍 DEBUG: Log all user context details
    console.log("🔍 JWT Security Debug - User Context Verification:");
    console.log("📊 authPayload.userID:", authPayload.userID);
    console.log("📊 userIDToVerify:", userIDToVerify);
    console.log("📊 expectedUserID:", expectedUserID);
    console.log("📊 response.data.userID:", response.data.userID);
    console.log("📊 authPayload:", JSON.stringify(authPayload, null, 2));
    console.log("📊 response.data:", JSON.stringify(response.data, null, 2));

    if (authPayload.userID !== userIDToVerify) {
      console.error("❌ User context mismatch details:");
      console.error(
        "❌ authPayload.userID:",
        authPayload.userID,
        "(type:",
        typeof authPayload.userID,
        ")"
      );
      console.error(
        "❌ userIDToVerify:",
        userIDToVerify,
        "(type:",
        typeof userIDToVerify,
        ")"
      );
      console.error(
        "❌ Are they equal?",
        authPayload.userID === userIDToVerify
      );
      console.error(
        "❌ String comparison:",
        String(authPayload.userID) === String(userIDToVerify)
      );
      throw new Error("User context mismatch");
    }

    // Step 4: Verify timestamp (optional replay protection)
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - authPayload.timestamp);
    if (timeDiff > 300000) {
      // 5 minutes tolerance
      throw new Error("Response too old - possible replay attack");
    }

    console.log("Security verification passed");
    const data = flattenAttributes(response.data[dataKey]);
    // console.log("data: ", data);
    return data;
  } catch (error) {
    console.error("Security verification failed:", error);
    throw error;
  }
};

/**
 * Extract the data that was hashed on the server side
 * @param responseData - The data object from the response
 * @param dataKey - The key name for the actual data
 * @returns Object containing the data that was hashed
 */
const extractDataForHashing = (responseData, dataKey) => {
  // Start with the main data
  const dataToHash = {
    [dataKey]: responseData[dataKey],
  };

  // Add count if it exists
  if (responseData.count !== undefined) {
    dataToHash.count = responseData.count;
  }

  const metadataFields = Object.keys(responseData).filter(
    (key) => key !== dataKey && key !== "count"
  );

  metadataFields.forEach((field) => {
    dataToHash[field] = responseData[field];
  });
  // console.log("dataToHash: ", dataToHash);
  return dataToHash;
};

/**
 * Verify RSA token (unchanged from your original)
 */
const verifyRSAToken = (signedToken) => {
  try {
    if (typeof signedToken !== "string") {
      throw new Error("Token must be a string");
    }

    // Verify the JWT signature
    const isValid = KJUR.jws.JWS.verifyJWT(signedToken, PUBLIC_KEY, {
      alg: ["RS256"],
    });

    if (!isValid) {
      throw new Error("Invalid authentication token");
    }

    // Extract and return the payload
    const decoded = KJUR.jws.JWS.parse(signedToken).payloadObj || {};
    return decoded;
  } catch (error) {
    console.error("Error verifying RSA token:", error);
    throw error;
  }
};

// Utility function to flatten DynamoDB AttributeValue objects
const flattenAttributes = (item) => {
  // If item is an array, process each element
  if (Array.isArray(item)) {
    return item.map((singleItem) => flattenAttributes(singleItem));
  }

  // If item is not an object, return as is
  if (typeof item !== "object" || item === null) {
    return item;
  }

  // Check if the item is already flattened (doesn't have DynamoDB AttributeValue structure)
  const hasDynamoDBStructure = Object.values(item).some(
    (value) =>
      value &&
      typeof value === "object" &&
      (value.S !== undefined ||
        value.N !== undefined ||
        value.BOOL !== undefined ||
        value.NULL !== undefined)
  );

  // If already flattened, return as is
  if (!hasDynamoDBStructure) {
    return item;
  }

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

// Convenience functions for specific data types
export const verifyInvitationsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "invitations", expectedUserID);
};

export const verifyExportPipelinesResponse = (
  response,
  expectedUserID = null
) => {
  return verifyResponseSecurity(response, "exportPipelines", expectedUserID);
};

export const verifyImpactPipelinesResponse = (
  response,
  expectedUserID = null
) => {
  return verifyResponseSecurity(response, "impactPipelines", expectedUserID);
};

export const verifyExportJobsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "exportJobs", expectedUserID);
};

export const verifySessionsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "sessions", expectedUserID);
};

export const verifyScheduledJobsResponse = (
  response,
  expectedUserID = null
) => {
  return verifyResponseSecurity(response, "scheduledJobs", expectedUserID);
};

export const verifyWorkflowsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "workflows", expectedUserID);
};

export const verifyDataConnectionsResponse = (
  response,
  expectedUserID = null
) => {
  return verifyResponseSecurity(response, "dataConnections", expectedUserID);
};

export const verifyExperimentsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "experiments", expectedUserID);
};

export const verifyDatasetsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "datasets", expectedUserID);
};

export const verifyCompaniesResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "companies", expectedUserID);
};

export const verifyUsersResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "users", expectedUserID);
};

export const verifyConversationsResponse = (
  response,
  expectedUserID = null
) => {
  return verifyResponseSecurity(response, "conversations", expectedUserID);
};

// For single item responses
export const verifyItemResponse = (
  response,
  dataKey,
  expectedUserID = null
) => {
  return verifyResponseSecurity(response, dataKey, expectedUserID);
};
// const verifyRSAToken = (signedToken) => {
//   try {
//     if (typeof signedToken !== "string") {
//       throw new Error("Token must be a string");
//     }

//     // Verify the JWT signature
//     const isValid = KJUR.jws.JWS.verifyJWT(signedToken, PUBLIC_KEY, {
//       alg: ["RS256"],
//     });

//     if (!isValid) {
//       throw new Error('Invalid authentication token');
//     }

//     // Extract and return the payload
//     const decoded = KJUR.jws.JWS.parse(signedToken).payloadObj || {};
//     return decoded;

//   } catch (error) {
//     console.error('Error verifying RSA token:', error);
//     throw error;
//   }
// };
