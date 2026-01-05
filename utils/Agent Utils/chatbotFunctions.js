/**
 * 🔧 CHATBOT FUNCTIONS - API utilities for chatbot
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\ChatbotFunctions.js
 * Note: Can copy directly - pure JS logic, no UI components
 */

import axios from 'axios';
import { getAuthToken } from '../../redux/actions/authActions';
import { API_BASE_URL, API_KEY } from '../../utils/apiConfig';
import { generateToken, processToken } from '../../utils/jwtUtils';

export const fetchRelatedQueries = async (
  userID,
  query,
  selectedModel,
  conversationId
) => {
  try {
    console.log('The fetchrelated function is hit');
    const Token = await getAuthToken(userID);
    const relatedLambdaUrl = `${API_BASE_URL}/aiSummary?t=${Date.now()}`;

    if (!query) return [];
    
    const promptLabel = 'related';
    const s3FilePath = 'analyst-RelatedQuestions.txt';
    
    const relatedPayload = {
      llmModel: selectedModel,
      conversationId,
      promptLabel: promptLabel,
      s3FilePath: s3FilePath,
      query: query,
    };
    
    const relatedPayloadToken = await generateToken(relatedPayload, Token);
    
    const response = await axios.post(
      relatedLambdaUrl,
      { relatedPayloadToken },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    const bot4MessageToken = response.bot4Message;
    const relatedMessage = await processToken(bot4MessageToken);
    const parsedBot4Message = JSON.parse(relatedMessage);
    return parsedBot4Message;
  } catch (error) {
    console.error('Error fetching related queries:', error);
    return [];
  }
};
