import axios from "axios";
import { getAuthToken } from "../redux/actions/authActions";
import { generateToken } from "./jwtUtils";

// Function to make a POST request with JWT token in the request body
export const editWorkflowToDatabase = async (
    tokenPayload
  ) => {
    const Token = await getAuthToken();
    const token = await generateToken(tokenPayload, Token);
    console.log("entered in the edit workflow");
    const baseURL = process.env.REACT_APP_API_BASE_URL;
  
    try {
      const response = await axios.put(
        `${baseURL}/workflow/${tokenPayload.workflowID}?t=${Date.now()}`,
        {
          workflowDataToken: token,
          operation: "edit",
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      console.log("Edit Workflow Response:", response.data);
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

// Function to make a POST request with JWT token in the request body
export const extendWorkflowToDatabase = async (
    tokenPayload
  ) => {
    const Token = await getAuthToken();
    const token = await generateToken(tokenPayload, Token);
    console.log("entered in the edit workflow");
    const baseURL = process.env.REACT_APP_API_BASE_URL;
  
    try {
      const response = await axios.put(
        `${baseURL}/workflow/${tokenPayload.workflowID}?t=${Date.now()}`,
        {
          workflowDataToken: token,
          operation: "extend",
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      console.log("Extend Workflow Response:", response.data);
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

  // Function to make a POST request with JWT token in the request body
export const deleteWorkflowToDatabase = async (
    tokenPayload
  ) => {
    const Token = await getAuthToken();
    console.log("entered in the delete workflow");
    const baseURL = process.env.REACT_APP_API_BASE_URL;
  
    try {
      const response = await axios.delete(
        `${baseURL}/workflow/${tokenPayload.workflowID}?t=${Date.now()}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      console.log("Delete Workflow Response:", response.data);
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