import axios from "axios";

import { generateToken } from "../jwtUtils";
import { getAuthToken } from "../../redux/actions/authActions";

// Function to make a POST request with JWT token in the request body
export const fetchAmazonVendorSampleData = async (tokenPayload, userID) => {
  const Token = await getAuthToken(userID);
  console.log("Token:-->", Token);
  console.log("entered in the add experiment");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/amazonVendorConnections?t=${Date.now()}`,
      {
        dataConnectionToken: token, // Token in the body
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
};
