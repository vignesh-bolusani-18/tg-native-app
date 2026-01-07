/**
 * S3 Utilities for File Operations
 * ⭐ MATCHES tg-application: Uses AWS SDK directly with Cognito Identity Pool
 */

import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { ENV } from './env';
import { getAuthToken } from '../redux/actions/authActions';
import { generateToken } from './jwtUtils';

// ⭐ MATCHES app_ref: Configure the S3 client with Cognito Identity Pool credentials
const s3Client = new S3Client({
  region: ENV.AWS_REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({
      region: ENV.AWS_REGION,
    }),
    identityPoolId: ENV.COGNITO_IDENTITY_POOL_ID,
  }),
});

/**
 * Helper: Convert stream to string (for React Native compatibility)
 */
const streamToString = async (stream) => {
  console.log("🔵 streamToString: Input type:", typeof stream, stream?.constructor?.name);
  
  // In React Native, the response body may be different
  if (typeof stream === 'string') {
    console.log("🔵 streamToString: Already a string");
    return stream;
  }
  
  // For Blob (React Native fetch response)
  if (stream instanceof Blob) {
    console.log("🔵 streamToString: Converting Blob to text");
    return await stream.text();
  }
  
  // For ArrayBuffer
  if (stream instanceof ArrayBuffer) {
    console.log("🔵 streamToString: Converting ArrayBuffer to text");
    return new TextDecoder().decode(stream);
  }
  
  // For Uint8Array
  if (stream instanceof Uint8Array) {
    console.log("🔵 streamToString: Converting Uint8Array to text");
    return new TextDecoder().decode(stream);
  }
  
  // For web/node streams with transformToString (AWS SDK v3)
  if (stream?.transformToString) {
    console.log("🔵 streamToString: Using transformToString");
    return await stream.transformToString();
  }
  
  // For ReadableStream (web)
  if (stream?.getReader) {
    console.log("🔵 streamToString: Reading from ReadableStream");
    const reader = stream.getReader();
    const chunks = [];
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(value);
      }
    }
    
    // Combine chunks and decode
    const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    return new TextDecoder().decode(combined);
  }
  
  // Fallback: try to convert directly
  console.log("🔵 streamToString: Fallback - converting to string");
  return String(stream);
};

/**
 * ⭐ MATCHES app_ref: Fetch JSON from S3 using API Endpoint (bypasses AWS SDK Blob issue in RN)
 * Path format: accounts/{companyName}_{companyID}/conversations/{conversationId}/conversation_state.json
 */
export const fetchJsonFromS3 = async (filePath) => {
  try {
    console.log("🔵 fetchJsonFromS3: Fetching from path:", filePath);
    
    // Get Request Token
    const Token = await getAuthToken();
    if (!Token) {
        console.warn("⚠️ fetchJsonFromS3: No auth token available");
        return null;
    }
    
    // Generate S3 Access Token
    const payload = { filePath, time: Date.now() };
    const s3Token = await generateToken(payload, Token); 
    
    const baseURL = ENV.API_BASE_URL;
    const url = `${baseURL}/fetchJsonFromS3?t=${Date.now()}`;
    
    console.log("🔵 fetchJsonFromS3: Calling endpoint:", url);

    const response = await axios.post(
      url,
      {
        s3Token: s3Token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${Token}`, 
        },
      }
    );
    
    console.log("✅ fetchJsonFromS3: Success for path:", filePath);
    console.log("✅ fetchJsonFromS3: Data keys:", Object.keys(response.data || {}));
    
    return response.data;
  } catch (error) {
    if (error.response) {
       // Log detailed error from server
       console.error("❌ fetchJsonFromS3: Server Error:", error.response.status, error.response.data);
       if (error.response.status === 404 || error.response.data?.error?.includes("NoSuchKey")) {
           console.log("📄 S3 file not found (via API):", filePath);
           return null;
       }
    } else {
       console.error("❌ fetchJsonFromS3: Network/Client Error:", error.message);
    }
    return null;
  }
};

/**
 * Helper functions for data processing (matches app_ref)
 */
const typecastValues = (data, excludeKeys = []) => {
  if (data === null) {
    return data;
  } else if (Array.isArray(data)) {
    return data.map((item) => typecastValues(item, excludeKeys));
  } else if (typeof data === "object" && data !== null) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (excludeKeys.includes(key)) {
        acc[key] = value;
      } else {
        acc[key] = typecastValues(value, excludeKeys);
      }
      return acc;
    }, {});
  } else if (!isNaN(data) && data !== "" && typeof data !== "boolean") {
    return Number(data);
  } else if (data === "true") {
    return true;
  } else if (data === "false") {
    return false;
  } else {
    return data;
  }
};

const removeNullKeysAndArrayNulls = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== null) // Remove null values from arrays
      .map((item) => removeNullKeysAndArrayNulls(item)); // Recursively handle nested arrays/objects
  } else if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (key !== "null") {
        // Remove entries where the key is null
        const cleanedValue = removeNullKeysAndArrayNulls(value);
        acc[key] = cleanedValue;
      }
      return acc;
    }, {});
  }
  return obj;
};

/**
 * ⭐ MATCHES app_ref: Upload JSON to S3 using AWS SDK
 * Path format: accounts/{companyName}_{companyID}/conversations/{conversationId}/conversation_state.json
 */
export const uploadJsonToS3 = async (path, data) => {
  try {
    console.log("🔵 uploadJsonToS3: Uploading to path:", path);
    
    // Typecast JSON values (matches app_ref)
    const typecastedData = typecastValues(data, ["raw_data_id", "run_date"]);
    const nullRemovedData = removeNullKeysAndArrayNulls(typecastedData);
    const formattedData = JSON.stringify(nullRemovedData, null, 2);
    
    console.log("🔵 uploadJsonToS3: Data size:", formattedData.length, "bytes");
    
    const putObjectParams = {
      Bucket: ENV.AWS_BUCKET_NAME,
      Key: path,
      Body: formattedData,
      ContentType: "application/json",
      CacheControl: "no-cache, no-store, must-revalidate",
      Expires: new Date(0), // Immediately expired
    };

    const response = await s3Client.send(new PutObjectCommand(putObjectParams));
    console.log("✅ uploadJsonToS3: Success for path:", path);
    return response;
  } catch (error) {
    console.error("❌ uploadJsonToS3: Error:", error.message);
    // Don't throw - saving to S3 is a background operation
    return null;
  }
};

/**
 * ⭐ MATCHES app_ref: Upload CSV to S3 using AWS SDK
 */
export const uploadCSVToS3 = async (fileUri, fileName, companyPath) => {
  try {
    console.log("🔵 uploadCSVToS3: Uploading file:", fileName);
    
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    
    const putObjectParams = {
      Bucket: ENV.AWS_BUCKET_NAME,
      Key: `${companyPath}/${fileName}`,
      Body: fileContent,
      ContentType: "text/csv",
      CacheControl: "no-cache, no-store, must-revalidate",
    };

    const response = await s3Client.send(new PutObjectCommand(putObjectParams));
    console.log("✅ uploadCSVToS3: Success");
    return response;
  } catch (error) {
    console.error("❌ uploadCSVToS3: Error:", error.message);
    throw error;
  }
};

/**
 * ⭐ MATCHES app_ref: Delete file from S3 using AWS SDK
 */
export const deleteFromS3 = async (s3Path) => {
  try {
    console.log("🔵 deleteFromS3: Deleting path:", s3Path);
    
    const deleteObjectParams = {
      Bucket: ENV.AWS_BUCKET_NAME,
      Key: s3Path,
    };

    const response = await s3Client.send(new DeleteObjectCommand(deleteObjectParams));
    console.log("✅ deleteFromS3: Success");
    return response;
  } catch (error) {
    console.error("❌ deleteFromS3: Error:", error.message);
    throw error;
  }
};

/**
 * ⭐ MATCHES app_ref: Fetch any file from S3 as text using AWS SDK
 */
export const fetchFileFromS3 = async (filePath) => {
  try {
    console.log("🔵 fetchFileFromS3: Fetching from path:", filePath);

    const getObjectParams = {
      Bucket: ENV.AWS_BUCKET_NAME,
      Key: filePath,
    };

    const response = await s3Client.send(new GetObjectCommand(getObjectParams));
    const bodyContents = await streamToString(response.Body);
    
    console.log("✅ fetchFileFromS3: Success for path:", filePath);
    return bodyContents;
  } catch (error) {
    console.warn('fetchFileFromS3: Error:', error.message);
    throw error;
  }
};

/**
 * ⭐ MATCHES app_ref: List files in S3 folder using AWS SDK
 */
export const listFilesInFolder = async (folderPath) => {
  try {
    console.log("🔵 listFilesInFolder: Listing path:", folderPath);

    const listParams = {
      Bucket: ENV.AWS_BUCKET_NAME,
      Prefix: folderPath,
    };

    const response = await s3Client.send(new ListObjectsV2Command(listParams));
    const files = response.Contents?.map(item => item.Key) || [];
    
    console.log("✅ listFilesInFolder: Found", files.length, "files");
    return files;
  } catch (error) {
    console.error("❌ listFilesInFolder: Error:", error.message);
    throw error;
  }
};

/**
 * ⭐ MATCHES app_ref: Fetch CSV from S3 and parse
 */
export const fetchCSVFromS3 = async (filePath) => {
  try {
    console.log("🔵 fetchCSVFromS3: Fetching from path:", filePath);

    const getObjectParams = {
      Bucket: ENV.AWS_BUCKET_NAME,
      Key: filePath,
    };

    const response = await s3Client.send(new GetObjectCommand(getObjectParams));
    const bodyContents = await streamToString(response.Body);
    
    console.log("✅ fetchCSVFromS3: Success for path:", filePath);
    return bodyContents;
  } catch (error) {
    console.warn('fetchCSVFromS3: Error:', error.message);
    throw error;
  }
};

/**
 * Clear cache - placeholder for compatibility
 */
export const clearCache = () => {
  console.log("clearCache: Cache clearing not needed with direct S3 SDK");
};

// Export the S3 client for advanced use cases
export { s3Client };

