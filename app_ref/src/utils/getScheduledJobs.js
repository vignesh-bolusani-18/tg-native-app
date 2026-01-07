import axios from "axios";
import { getAuthToken } from "../redux/actions/authActions";

export const getScheduledJobsByCompany = async (userID) => {
  const Token = await getAuthToken(userID);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  try {
    const response = await axios.get(
      `${baseURL}/scheduledJobsByCompany?t=${Date.now()}&sendHash=true`,
      {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY,
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