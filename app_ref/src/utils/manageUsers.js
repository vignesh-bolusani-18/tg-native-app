import axios from "axios";

import { generateToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";

// Function to make a POST request with JWT token in the request body
export const getUsersByCompany = async (currentCompany, userID) => {
  const Token = await getAuthToken();
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (currentCompany.access_users_by_company) {
    try {
      const response = await axios.get(
        `${baseURL}/userByCompany/hi?t=${Date.now()}&sendHash=true`,

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
    console.log("You are not authorized to get Users");
  }
};

export const deleteUser = async (tokenPayload, currentCompany, userID) => {
  const Token = await getAuthToken();
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  if (currentCompany.delete_user) {
    try {
      const response = await axios.delete(`${baseURL}/user?t=${Date.now()}`, {
        params: { removeUserToken: token }, // Token in the query parameters
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
        },
      });
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
    console.log("You are not authorized to delete a user");
  }
};

export const enableUser = async (tokenPayload, currentCompany, userID) => {
  const Token = await getAuthToken();
  console.log("Token:-->", Token);
  console.log("entered in the enableUser");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (currentCompany.enable_disable_user) {
    try {
      const response = await axios.post(
        `${baseURL}/user/enable?t=${Date.now()}`,
        {
          enableUserToken: token, // Token in the body
        },
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
    console.log("You are not authorized to enableUser");
  }
};

export const adminRoleTransfer = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken();
  console.log("Token:-->", Token);
  console.log("entered in the enableUser");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (currentCompany.transfer_admin_role) {
    try {
      const response = await axios.post(
        `${baseURL}/user/adminRoleTransfer?t=${Date.now()}`,
        {
          adminRoleTransferToken: token, // Token in the body
        },
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
    console.log("You are not authorized to transfer admin role");
  }
};

export const disableUser = async (tokenPayload, currentCompany, userID) => {
  const Token = await getAuthToken();
  console.log("Token:-->", Token);
  console.log("entered in the disableUser");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (currentCompany.enable_disable_user) {
    try {
      const response = await axios.post(
        `${baseURL}/user/disable?t=${Date.now()}`,
        {
          disableUserToken: token, // Token in the body
        },
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
    console.log("You are not authorized to disableUser");
  }
};
