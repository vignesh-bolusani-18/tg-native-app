import axios from "axios";

import { generateToken, processToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";

// Function to get the value of a cookie by its name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Function to make a POST request with JWT token in the request body
export const createCompany = async (payload) => {
  const authToken = await getAuthToken();

  const token = await generateToken(payload, authToken);
  console.log("payload " + token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/company?t=${Date.now()}`,
      {
        companyDataToken: token,
      },
      {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${authToken}`, // JWT bearer token in the authorization header
        },
      }
    );
    console.log("Response:-->", response.data);

    return response.data; // Return the response data
  } catch (error) {
    if (error.response && error.response.status === 405) {
      // Return a specific error message for 403 errors
      return null;
    }
    // throw error; // Rethrow other errors for handling
  }
};
