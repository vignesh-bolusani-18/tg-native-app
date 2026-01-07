import axios from "axios";

import FormData from "form-data";
import { generateToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";
import { callQueryEngineQuery } from "./queryEngine";
import ENV from "./env";

// Function to make a POST request with JWT token in the request body
export const fetchJsonFromS3Endpoint = async (tokenPayload) => {
  const Token = await getAuthToken();
  console.log("Token:-->", Token);
  console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/fetchJsonFromS3?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    console.log("Response:-->", response.data);

    return response.data; // Return the response data
  } catch (error) {
    // Handle S3 "key does not exist" errors more gracefully (expected for new conversations)
    if (error.response?.status === 500 && error.response?.data?.error?.includes("does not exist")) {
      console.log("📄 S3 file not found:", tokenPayload.filePath);
      throw error; // Still throw but with less noise
    }
    
    // Log other errors with full details
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    throw error;
  }
};

// Function to make a POST request with JWT token in the request body
export const fetchCSVEndpoint = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/fetchCSV?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    // console.log("Response:-->", response.data);

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
};
// Function to make a POST request with JWT token in the request body
export const fetchAndModifyCSVEndpoint = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/fetchAndModifyCSV?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    // console.log("Response:-->", response.data);

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
};
// Function to make a POST request with JWT token in the request body
export const loadBatchEndpoint = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/getPaginatedDataFromS3?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    // console.log("Response:-->", response.data);

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
};

// Function to make a POST request with JWT token in the request body
export const loadBatchEndpoint1 = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/getPaginatedDataFromS31?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    // console.log("Response:-->", response.data);

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
};
// Function to make a POST request with JWT token in the request body
export const clearCacheEndpoint = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/clearCache?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    // console.log("Response:-->", response.data);

    return response; // Return the response data
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
};
export const fetchCSVWithFilterEndpoint = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/fetchCSVFilter?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    console.log("Response Filtered:-->", response);

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
};
export const fetchParquetFileEndpoint = async (tokenPayload) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/fetchParquetData?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      }
    );
    console.log("Response Filtered:-->", response);

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
};
export const detectCSVChangesEndpoint = async (tokenPayload) => {
  const Token = await getAuthToken();
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/detectCSVChanges?t=${Date.now()}`,
      {
        s3Token: token,
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    throw error;
  }
};
export const fetchCSVWithFilterEndpoint1 = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  // console.log("Token:-->", Token);
  // console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await callQueryEngineQuery(tokenPayload)
  
    console.log("Response Filtered:-->", response);
    return response // Return the response data
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
};

// Function to make a POST request with JWT token in the request body
export const listFilesInFolderEndpoint = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  console.log("Token:-->", Token);
  console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/listFilesInFolder?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
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
};

export const fetchFileFromS3Endpoint = async (tokenPayload, userID) => {
  const Token = await getAuthToken();
  console.log("Token:-->", Token);
  console.log("entered in the fetchJSON endpoint");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/fetchFileFromS3?t=${Date.now()}`,
      {
        s3Token: token, // Token in the body
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
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
};

export const uploadCSVToS3Endpoint = async (filePath, csvFile, userID) => {
  const Token = await getAuthToken();
  console.log("Entering uploadCSVToS3Endpoint");
  console.log("Token:-->", Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    // Create a FormData object
    const formData = new FormData();

    // Append the CSV file to the form data
    formData.append("file", csvFile, filePath); // 'file' is the field name at the backend
    console.log("formdata: " + formData);
    const response = await axios.post(
      `${baseURL}/uploadCSVToS3?t=${Date.now()}`,
      formData, // Pass the FormData object as the body
      {
        headers: {
          "x-api-key": ENV.API_KEY, // API key in the header
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          //   ...formData.getHeaders(), // Include the form-data headers
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    console.log("Response:-->", response.data);

    return response.data; // Return the response data
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    throw error; // Throw the error for handling in the caller function
  }
};

export const getAggregatedValueEndpoint = async (tokenPayload) => {
  const Token = await getAuthToken();
  const token = await generateToken(tokenPayload, Token);
  const baseURL = ENV.API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/getAggregatedValue?t=${Date.now()}`,
      {
        s3Token: token,
      },
      {
        headers: {
          "x-api-key": ENV.API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in getAggregatedValue endpoint:", error);
    throw error;
  }
};


