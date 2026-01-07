import axios from "axios";
import { getAuthToken } from "../../redux/actions/authActions";
import { generateToken, processToken } from "../../utils/jwtUtils";

export const fetchRelatedQueries = async (
  userID,
  query,
  selectedModel,
  conversationId
) => {
  try {
    console.log("The fetchrelated function is hit");
    const Token = await getAuthToken(userID);
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    const relatedLambdaUrl = `${baseURL}/aiSummary?t=${Date.now()}`;
    // const userLatestMessage = messages
    //   .filter((msg) => msg.type === "user")
    //   .map((msg) => msg.text)
    //   .pop();

    if (!query) return [];
    const promptLabel = "related";
    const s3FilePath = "analyst-RelatedQuestions.txt";
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
          "x-api-key": process.env.REACT_APP_API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    // const { relatedQuestions } = response.data;
    // const  relatedQuestions  = response.data.body;
    // console.log("The raw response from related lambda is ",relatedQuestions);
    // const parsedrelatedQuestions = JSON.parse(relatedQuestions);

    // return (parsedrelatedQuestions);

    const bot4MessageToken = response.bot4Message;

    const relatedMessage = await processToken(bot4MessageToken);

    const parsedBot4Message = JSON.parse(relatedMessage);
    return parsedBot4Message;
  } catch (error) {
    console.error("Error fetching related queries:", error);
    return [];
  }
};
