import axios from "axios";
import { getAuthToken } from "../../redux/actions/authActions";

// Function to get the value of a cookie by its name
const getCookie = async (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Function to make a POST request with JWT token in the request body
export const getConnections = async (userID) => {
  console.log("entered in the get connection");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  // Get the authToken from the cookie named "token"
  const Token = await getAuthToken(userID);
  // console.log("TokenExp: " + Token);
  try {
    console.log("Calling dataconenctions");
    const response = await axios.get(
      `${baseURL}/dataConnection?t=${Date.now()}&sendHash=true`,

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
