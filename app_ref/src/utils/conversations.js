
import axios from "axios";
import { getAuthToken } from "../redux/actions/authActions";
import { generateToken } from "./jwtUtils";

const BASE = process.env.REACT_APP_API_BASE_URL;

export const createConversation = async (tokenPayload) => {
    const Token = await getAuthToken();
    const conversationDataToken = await generateToken(tokenPayload, Token);

    try {
        const response = await axios.post(`${BASE}/conversation?t=${Date.now()}`, {
            conversationDataToken: conversationDataToken,
        }, {
            headers: {
                "x-api-key": process.env.REACT_APP_API_KEY,
                "Content-Type": "application/json",
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
    }
}


export const getConversationByID = async (tokenPayload) => {
    const Token = await getAuthToken();
    const conversationByIdToken = await generateToken(tokenPayload,Token);
    try{
        const response = await axios.post(`${BASE}/conversation/get?t=${Date.now()}`, {
            conversationByIdToken: conversationByIdToken,
        },{
            headers: {
                "x-api-key": process.env.REACT_APP_API_KEY,
                "Content-Type": "application/json",
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching conversation by ID:", error);
        throw error;
    }
}

export const deleteConversation = async (tokenPayload) => { 
  const Token = await getAuthToken();
  const deleteConversationToken = await generateToken(tokenPayload, Token);

  try {
    const response = await axios.delete(
      `${BASE}/conversation?deleteConversationToken=${deleteConversationToken}&t=${Date.now()}`,
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
    console.error("Error deleting conversation:", error);
    throw error;
  }
};


   export const renameConversation = async (tokenPayload) => {
    const Token = await getAuthToken();
    const conversationDataToken = await generateToken(tokenPayload,Token);

    try{
        const response = await axios.post(`${BASE}/renameConversation?t=${Date.now()}`, {
            conversationDataToken: conversationDataToken,
        },{
            headers: {
                "x-api-key": process.env.REACT_APP_API_KEY,
                "Content-Type": "application/json",
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error renaming conversation:", error);
        throw error;
    }
   }

   export const getAllConversations = async () => {
      const Token = await getAuthToken();
      
      try{
          const response = await axios.get(`${BASE}/conversations/any?t=${Date.now()}`, {
              headers: {
                  "x-api-key": process.env.REACT_APP_API_KEY,
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Token}`,
              },
          });
          return response.data;
      }
      catch (error) {
          console.error("Error fetching all conversations:", error);
          throw error;
      }
   }

   export const getConversationsByCompany = async () => {
    const Token = await getAuthToken();

    try{
        const response = await axios.get(`${BASE}/conversationByCompany?t=${Date.now()}&sendHash=true`, {
            headers: {
                "x-api-key": process.env.REACT_APP_API_KEY,
                "Content-Type": "application/json",
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching conversations by company:", error);
        throw error;
    }
   }

   export const getConversationsByUser = async () => {
    const Token = await getAuthToken();
    try{
        const response = await axios.get(`${BASE}/conversationByUser?t=${Date.now()}`, {
            headers: {
                "x-api-key": process.env.REACT_APP_API_KEY,
                "Content-Type": "application/json",
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching conversations by user:", error);
        throw error;
    }
   }