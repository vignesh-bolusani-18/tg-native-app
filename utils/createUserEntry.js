// utils/createUserEntry.js
import { getAuthToken } from "../redux/actions/authActions";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export const addUserToDatabase = async (token, authToken, userID) => {
  console.log("🔵 addUserToDatabase: Adding user");
  // Use the passed token or get a fresh auth token
  const Token = token || authToken || await getAuthToken(); 

  try {
    const response = await fetch(
      `${API_BASE_URL}/user?t=${Date.now()}`,
      {
        method: 'POST',
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
        body: JSON.stringify({ userDataToken: token }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ User added to database");
    return data;
  } catch (error) {
    console.error("❌ addUserToDatabase Error:", error.message);
    throw error;
  }
};

export const updateUserInDatabase = async (userID, userName, userTableName, invitationTableName) => {
  console.log("🔵 updateUserInDatabase: Updating user");

  try {
    const response = await fetch(
      `${API_BASE_URL}/user?t=${Date.now()}`,
      {
        method: 'PUT',
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID, userName, userTableName, invitationTableName }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ User updated in database");
    return data;
  } catch (error) {
    console.error("❌ updateUserInDatabase Error:", error.message);
    throw error;
  }
};