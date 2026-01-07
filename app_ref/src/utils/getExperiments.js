import axios from "axios";

import { generateToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";

// Function to make a POST request with JWT token in the request body
export const getExperiments = async (userID) => {
  console.log("entered in the get experiments");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  // Get the authToken from the cookie named "token"
  const Token = await getAuthToken(userID);
  // console.log("TokenExp: " + Token);
  if (1 == 1) {
    try {
      const response = await axios.get(
        `${baseURL}/experimentByCompany?t=${Date.now()}&sendHash=true`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
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
  } else if (2 !== 2) {
    try {
      const response = await axios.get(
        `${baseURL}/experimentByUser?t=${Date.now()}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
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
  }
};

// Function to make a POST request with JWT token in the request body
export const getExperimentById = async (tokenPayload, currentCompany) => {
  const Token = await getAuthToken();
  console.log("Token:-->", Token);
  console.log("entered in the get an experiment by id");
  console.log("TokenPayload:", tokenPayload);
  const token = await generateToken(tokenPayload, Token);
  console.log("token:", token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  console.log(
    "Conditions: ",
    currentCompany,
    " $ ",
    currentCompany.access_experiments_by_user
  );
  if (
    currentCompany.access_experiments_by_company ||
    currentCompany.access_experiments_by_user
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/experiment/get?t=${Date.now()}`,
        {
          experimentByIdToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
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
  }
};
