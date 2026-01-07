import axios from "axios";

import { generateToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";

export const updateExperimentDescription = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  console.log("Token:-->", Token);
  console.log("entered in update experiment description");

  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  if (
    currentCompany.unlimited_experiments ||
    currentCompany.allowed_total_experiments > 0
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/updateExperimentDescription?t=${Date.now()}`,
        {
          experimentDataToken: token,
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      console.log("Response:-->", response.data);
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
  } else {
    console.log("You are not authorized to update experiment description");
  }
};
