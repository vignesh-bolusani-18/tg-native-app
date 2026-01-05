// utils/jwtUtils.js
import CryptoJS from "crypto-js";
import { KJUR, jws } from "jsrsasign";
import forge from "node-forge";
import "react-native-get-random-values"; // Required for crypto logic in RN

// RSA public key (used for verification)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpOG5xBrQxXnWgzL1M+fC47E8M
YHEqjIN5VeHeohHigoGbj4AZdvTNfd/Ezcck/QE2luKuDcbk4eMvq2dUi3ifbfBr
tnRZy/sRJLN6md7Rbd1ULSVcwTKxduMZ2c660PoaVlDxYJ4aWNwUF197ASBqnPtN
nPUIzxmgjOxMzREZLQIDAQAB
-----END PUBLIC KEY-----`;

/**
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
  const decodedTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
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
// Commented out as it's not currently used
// async function getSigningKey(kid) {
//   const response = await axios.get(JWKS_URL);
//   const keys = response.data.keys;
//   const signingKey = keys.find((key) => key.kid === kid);
//
//   if (!signingKey) {
//     throw new Error(`Unable to find a signing key that matches '${kid}'`);
//   }
//
//   // Convert the JWKS to PEM format
//   return KEYUTIL.getKey(signingKey);
// }

// Function to sign a new JWT using HS256 and the verified Cognito token as the key
export const signToken = (payload, key) => {
  const header = { alg: "HS256", typ: "JWT" };
  return jws.JWS.sign(null, header, payload, key);
};

export const generateToken = async (payload, authToken) => {
  try {
    console.log("authToken: ", authToken);
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
      tokens.push(token);
    } catch (error) {
      console.error(`Error generating JWT Token ${index + 1}:`, error);
      throw error;
    }
  }

  return tokens;
};

const decodeToken = (token) => {
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
 */
export const verifyResponseSecurity = async (
  response,
  dataKey,
  expectedUserID = null
) => {
  try {
    console.log("🔍 JWT Security Debug - Token Verification:");

    // Step 1: Verify RSA signature
    const authPayload = await verifyRSAToken(response.security.signedAuthToken);

    // Step 2: Verify data integrity using crypto-js
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

    if (authPayload.userID !== userIDToVerify) {
      console.error("User context mismatch");
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
    return data;
  } catch (error) {
    console.error("Security verification failed:", error);
    throw error;
  }
};

const extractDataForHashing = (responseData, dataKey) => {
  const dataToHash = {
    [dataKey]: responseData[dataKey],
  };

  if (responseData.count !== undefined) {
    dataToHash.count = responseData.count;
  }

  const metadataFields = Object.keys(responseData).filter(
    (key) => key !== dataKey && key !== "count"
  );

  metadataFields.forEach((field) => {
    dataToHash[field] = responseData[field];
  });
  return dataToHash;
};

const verifyRSAToken = (signedToken) => {
  try {
    if (typeof signedToken !== "string") {
      throw new Error("Token must be a string");
    }

    const isValid = KJUR.jws.JWS.verifyJWT(signedToken, PUBLIC_KEY, {
      alg: ["RS256"],
    });

    if (!isValid) {
      throw new Error("Invalid authentication token");
    }

    const decoded = KJUR.jws.JWS.parse(signedToken).payloadObj || {};
    return decoded;
  } catch (error) {
    console.error("Error verifying RSA token:", error);
    throw error;
  }
};

const flattenAttributes = (item) => {
  if (Array.isArray(item)) {
    return item.map((singleItem) => flattenAttributes(singleItem));
  }

  if (typeof item !== "object" || item === null) {
    return item;
  }

  const hasDynamoDBStructure = Object.values(item).some(
    (value) =>
      value &&
      typeof value === "object" &&
      (value.S !== undefined ||
        value.N !== undefined ||
        value.BOOL !== undefined ||
        value.NULL !== undefined)
  );

  if (!hasDynamoDBStructure) {
    return item;
  }

  const flattened = {};
  for (const key in item) {
    if (item[key]?.S !== undefined) {
      flattened[key] = item[key].S;
    } else if (item[key]?.N !== undefined) {
      flattened[key] = parseFloat(item[key].N);
    } else if (item[key]?.BOOL !== undefined) {
      flattened[key] = item[key].BOOL;
    } else if (item[key]?.NULL !== undefined) {
      flattened[key] = null;
    } else {
      flattened[key] = item[key];
    }
  }
  return flattened;
};

// Convenience functions for specific data types
export const verifyInvitationsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "invitations", expectedUserID);
};

export const verifyCompaniesResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "companies", expectedUserID);
};

export const verifyUsersResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "users", expectedUserID);
};

export const verifyConversationsResponse = (response, expectedUserID = null) => {
  return verifyResponseSecurity(response, "conversations", expectedUserID);
};

export const verifyItemResponse = (
  response,
  dataKey,
  expectedUserID = null
) => {
  return verifyResponseSecurity(response, dataKey, expectedUserID);
};