import axios from "axios";
//
import { generateToken } from "./jwtUtils";

import { getAuthToken } from "../redux/actions/authActions";
import { getUserByIdInvite } from "./getUserById";

export const acceptInvite = async (
  userID,
  acceptInvitationPayload,
  refreshToken
) => {
  console.log("entered in the invitePeople");
  const authToken = await getAuthToken();
  console.log("token at Token : " + authToken);
  const invitationDataToken = await generateToken(
    acceptInvitationPayload,
    authToken
  );
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  try {
    const response = await axios.post(
      `${baseURL}/acceptInvitation?t=${Date.now()}`,
      {
        invitationDataToken, // Token in the body
      },
      {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${authToken}`, // JWT bearer token in the authorization header
        },
      }
    );
    console.log("Add Dataset Response:-->", response.data);
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

export const acceptInviteOutSide = async (
  userID,
  acceptInvitationPayload,
  refreshToken
) => {
  console.log("entered in the invitePeople");
  const authToken = await getUserByIdInvite(refreshToken);
  console.log("token at Token : " + authToken);
  const invitationDataToken = await generateToken(
    acceptInvitationPayload,
    authToken
  );
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  try {
    const response = await axios.post(
      `${baseURL}/acceptInvitation?t=${Date.now()}`,
      {
        invitationDataToken, // Token in the body
      },
      {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
          "Content-Type": "application/json", // Assuming the data is JSON
          Authorization: `Bearer ${authToken}`, // JWT bearer token in the authorization header
        },
      }
    );
    console.log("Add Dataset Response:-->", response.data);
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
