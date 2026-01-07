
import axios from "axios";
import { getAuthToken } from "../redux/actions/authActions";
import { generateToken } from "./jwtUtils";
import ENV from "./env";

const BASE = ENV.API_BASE_URL;

export const createConversation = async (tokenPayload) => {
    const Token = await getAuthToken();
    const conversationDataToken = await generateToken(tokenPayload, Token);

    try {
        const url = `${BASE}/conversation?t=${Date.now()}`;
        console.log("🔵 createConversation - URL:", url);
        console.log("🔵 createConversation - BASE:", BASE);
        console.log("🔵 createConversation - Payload:", tokenPayload);
        
        const response = await axios.post(url, {
            conversationDataToken: conversationDataToken,
        }, {
            headers: {
                "x-api-key": ENV.API_KEY,
                "Content-Type": "application/json",
                Authorization: `Bearer ${Token}`,
            },
        });
        console.log("✅ createConversation - Success:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ createConversation - Error:", error.message);
        console.error("❌ createConversation - Status:", error.response?.status);
        console.error("❌ createConversation - Response data:", error.response?.data);
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
                "x-api-key": ENV.API_KEY,
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
    const url = `${BASE}/conversation?deleteConversationToken=${deleteConversationToken}&t=${Date.now()}`;
    console.log("🔵 deleteConversation - URL:", url);
    console.log("🔵 deleteConversation - BASE:", BASE);
    console.log("🔵 deleteConversation - Payload:", tokenPayload);
    
    const response = await axios.delete(url, {
      headers: {
        "x-api-key": ENV.API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    });
    console.log("✅ deleteConversation - Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ deleteConversation - Error:", error.message);
    console.error("❌ deleteConversation - Status:", error.response?.status);
    console.error("❌ deleteConversation - Response data:", error.response?.data);
    throw error;
  }
};


   export const renameConversation = async (tokenPayload) => {
    const Token = await getAuthToken();
    const conversationDataToken = await generateToken(tokenPayload,Token);

    try{
        const url = `${BASE}/renameConversation?t=${Date.now()}`;
        console.log("🔵 renameConversation - URL:", url);
        console.log("🔵 renameConversation - API_BASE_URL (BASE):", BASE);
        console.log("🔵 renameConversation - ENV.API_BASE_URL:", ENV.API_BASE_URL);
        console.log("🔵 renameConversation - Payload:", tokenPayload);
        console.log("🔵 renameConversation - Token present:", !!Token);
        console.log("🔵 renameConversation - API Key present:", !!ENV.API_KEY);
        
        const response = await axios.post(url, {
            conversationDataToken: conversationDataToken,
        },{
            headers: {
                "x-api-key": ENV.API_KEY,
                "Content-Type": "application/json",
                Authorization: `Bearer ${Token}`,
            },
        });
        console.log("✅ renameConversation - Success:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("❌ renameConversation - Error:", error.message);
        console.error("❌ renameConversation - Status:", error.response?.status);
        console.error("❌ renameConversation - URL attempted:", `${BASE}/renameConversation?t=${Date.now()}`);
        console.error("❌ renameConversation - Response data:", error.response?.data);
        throw error;
    }
   }

   export const getAllConversations = async () => {
      const Token = await getAuthToken();
      
      try{
          const response = await axios.get(`${BASE}/conversations/any?t=${Date.now()}`, {
              headers: {
                  "x-api-key": ENV.API_KEY,
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
                "x-api-key": ENV.API_KEY,
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
                "x-api-key": ENV.API_KEY,
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