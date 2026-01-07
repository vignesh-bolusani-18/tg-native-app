import axios from "axios";

import { Token } from "aws-sdk";
import { generateToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";

// Function to make a POST request with JWT token in the request body
export const startInstance = async (tokenPayload, currentCompany, userID) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  console.log(
    "Condition: ",
    currentCompany.unlimited_experiments ||
      currentCompany.allowed_total_experiments > 0
  );
  if (
    currentCompany.unlimited_experiments ||
    currentCompany.allowed_total_experiments > 0
  ) {
    console.log("Entered in start instance");
    try {
      const response = await axios.get(
        `${baseURL}/startinstance/${token}?t=${Date.now()}`,

        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

      return response.data; // Return the response data
    } catch (error) {
      if (error.response) {
        // The request was made, and the server responded with a status code that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made, but no response was received
        console.error("Error request data:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      throw error; // Throw the error for handling in the caller function
    }
  } else {
    console.log("You are not authorized to start an instance");
  }
};

// Function to make a POST request with JWT token in the request body
export const triggerExperiment = async (tokenPayload, currentCompany) => {
  const Token = await getAuthToken();
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  console.log(
    "Condition: ",
    currentCompany.unlimited_experiments ||
      currentCompany.allowed_total_experiments > 0
  );
  if (
    currentCompany.unlimited_experiments ||
    currentCompany.allowed_total_experiments > 0
  ) {
    console.log("Entered in trigger instance");
    try {
      const response = await axios.get(
        `${baseURL}/executeExperiment/${token}?t=${Date.now()}`,

        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

      return response.data; // Return the response data
    } catch (error) {
      if (error.response) {
        // The request was made, and the server responded with a status code that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made, but no response was received
        console.error("Error request data:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      throw error; // Throw the error for handling in the caller function
    }
  } else {
    console.log("You are not authorized to start an instance");
  }
};

// export const triggerExperimentTaskManager = async (tokenPayload, currentCompany) => {
//   const Token = await getAuthToken();
//   // const token = await generateToken(tokenPayload, Token);
//   const baseURL = process.env.REACT_APP_TASK_MANAGER_API_BASE_URL;
//   console.log("Base URL for task manager: ", baseURL);
//   console.log(
//     "Condition: ",
//     currentCompany.unlimited_experiments ||
//       currentCompany.allowed_total_experiments > 0
//   );
//   if (
//     currentCompany.unlimited_experiments ||
//     currentCompany.allowed_total_experiments > 0
//   ) {
//     console.log("Entered in trigger instance");
//     try {
//       const response = await axios.post(
//         `${baseURL}/tasks?t=${Date.now()}`,
//         // Start Generation Here
//         {
//           experimentID: tokenPayload.experimentID,
//           experimentModuleName: tokenPayload.experimentModuleName,
//           experimentPath: tokenPayload.experimentPath,
//           experimentBucketName: tokenPayload.experimentBucketName,
//           experimentRegion: tokenPayload.experimentRegion,
//           experimentRunType: tokenPayload.experimentRunType,
//           commandType: tokenPayload.commandType,
//           refreshAuthToken: tokenPayload.refreshAuthToken,
//         },

//         {
//           headers: {
//             "x-api-key": process.env.REACT_APP_TASK_MANAGER_API_KEY, // API key in the header
//             "Content-Type": "application/json", // Assuming the data is JSON
//             "Authorization": `Bearer ${Token}`, // JWT bearer token in the authorization header
//           },  
//         }
//       );
//       console.log("Response:-->", response.data);

//       return response.data; // Return the response data
//     } catch (error) {
//       if (error.response) {
//         // The request was made, and the server responded with a status code that falls out of the range of 2xx
//         console.error("Error response data:", error.response.data);
//         console.error("Error response status:", error.response.status);
//         console.error("Error response headers:", error.response.headers);
//       } else if (error.request) {
//         // The request was made, but no response was received
//         console.error("Error request data:", error.request);
//       } else {
//         // Something happened in setting up the request that triggered an Error
//         console.error("Error message:", error.message);
//       }
//       console.error("Error config:", error.config);
//       throw error; // Throw the error for handling in the caller function
//     }
//   } else {
//     console.log("You are not authorized to start an instance");
//   }
// };

// Utility function for sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 5,
  initialDelay: 1000, // 1 second
  maxDelay: 16000,    // 10 seconds
  backoffFactor: 2,   // Double the delay each time
  retryableStatusCodes: [500, 502, 503, 504, 429] // Retry on these status codes
};

export const triggerExperimentTaskManager = async (tokenPayload, currentCompany) => {
  const Token = await getAuthToken();
  const baseURL = process.env.REACT_APP_TASK_MANAGER_API_BASE_URL;
  
  if (!currentCompany.unlimited_experiments && currentCompany.allowed_total_experiments <= 0) {
    console.log("You are not authorized to start an instance");
    throw new Error("Insufficient experiment quota");
  }

  console.log("Base URL for task manager: ", baseURL);
  console.log("Entered in trigger instance");

  let lastError = null;
  let lastRequestId = null;

  for (let attempt = 0; attempt <= DEFAULT_RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const requestConfig = {
        headers: {
          "x-api-key": process.env.REACT_APP_TASK_MANAGER_API_KEY,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Token}`,
        },
        timeout: 30000, // 30 second timeout
      };

      // If this is a retry, add the previous request ID
      if (lastRequestId) {
        requestConfig.headers['X-Retry-Request-ID'] = lastRequestId;
      }

      const response = await axios.post(
        `${baseURL}/enqueue-task?t=${Date.now()}`,
        {
          experimentID: tokenPayload.experimentID,
          experimentModuleName: tokenPayload.experimentModuleName,
          experimentPath: tokenPayload.experimentPath,
          experimentBucketName: tokenPayload.experimentBucketName,
          experimentRegion: tokenPayload.experimentRegion,
          experimentRunType: tokenPayload.experimentRunType,
          commandType: tokenPayload.commandType,
          refreshAuthToken: tokenPayload.refreshAuthToken,
        },
        requestConfig
      );

      // Store the request ID from the response
      lastRequestId = response.headers['x-request-id'];
      console.log("Response:-->", response.data);
      return response.data;

    } catch (error) {
      lastError = error;

      // Log detailed error information
      if (error.response) {
        console.error(`Attempt ${attempt + 1}/${DEFAULT_RETRY_CONFIG.maxRetries + 1} failed:`, {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          requestId: error.response.headers['x-request-id']
        });
        
        // Store the request ID from the error response
        lastRequestId = error.response.headers['x-request-id'];
      } else if (error.request) {
        console.error(`Attempt ${attempt + 1}/${DEFAULT_RETRY_CONFIG.maxRetries + 1} failed:`, {
          request: error.request,
          message: error.message
        });
      } else {
        console.error(`Attempt ${attempt + 1}/${DEFAULT_RETRY_CONFIG.maxRetries + 1} failed:`, {
          message: error.message
        });
      }

      // Check if we should retry
      if (attempt === DEFAULT_RETRY_CONFIG.maxRetries) {
        break; // Don't retry on the last attempt
      }

      const statusCode = error.response?.status;
      if (!DEFAULT_RETRY_CONFIG.retryableStatusCodes.includes(statusCode || 0)) {
        break; // Don't retry on non-retryable status codes
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        DEFAULT_RETRY_CONFIG.initialDelay * Math.pow(DEFAULT_RETRY_CONFIG.backoffFactor, attempt),
        DEFAULT_RETRY_CONFIG.maxDelay
      );

      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // If we get here, all retries failed
  throw new Error(`Failed after ${DEFAULT_RETRY_CONFIG.maxRetries + 1} attempts. Last error: ${lastError?.message}`);
};

export const executeExperiment = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  console.log("Token at execute experiment:", token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (
    currentCompany.unlimited_experiments ||
    currentCompany.allowed_total_experiments > 0
  ) {
    try {
      const response = await axios.get(
        `${baseURL}/executecommands/${token}?t=${Date.now()}`,

        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

      return response.data; // Return the response data
    } catch (error) {
      if (error.response) {
        // The request was made, and the server responded with a status code that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made, but no response was received
        console.error("Error request data:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      throw error; // Throw the error for handling in the caller function
    }
  } else {
    console.log("You are not authorized to execute an experiment");
  }
};
