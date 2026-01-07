import axios from "axios";

// Function to make a POST request with JWT token in the request body
export const postDataWithToken = async (token) => {
  try {
    const response = await axios.post(
      `https://fba9reowk0.execute-api.ap-south-1.amazonaws.com/prod/validateUser/${token}`,
      {
        headers: {
          "x-api-key": "U8gTDssPab7M9B1fxcyWh92cK3trlqVN5i5Bwwxj", // JWT token in the Authorization header
          "Content-Type": "application/json", // Assuming the data is JSON
        },
      }
    );
    return response.data; // Return the response data
  } catch (error) {
    console.error("Error while making POST request:", error);
    throw error; // Throw the error for handling in the caller function
  }
};

// Example usage
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyUm9sZSI6InN1cGVyLWFkbWluIiwiY29tcGFueUlEIjoiMSIsInVzZXJFbWFpbCI6InZpc2hudUB0cnVlZ3JhZGllbnQuYWkiLCJjb21wYW55TmFtZSI6IlRlc3QgQ29tcGFueSIsInVzZXJJRCI6IjEiLCJ1c2VyTmFtZSI6IlZpc2hudSBCaGFuZGVyaSIsImNyZWF0ZWRBdCI6MTcyMDAxNTM5NzEwMiwiaWF0IjoxNzIwMDE1Mzk3fQ.Vg076mbb1wNyBNoUXe2zlxLUrgpg2hE2UFUsoZZNhXo";
// Replace with your actual data object
postDataWithToken(token)
  .then((response) => {
    console.log("Response from server:", response);
    // Handle the response data here
  })
  .catch((error) => {
    console.error("Error handling:", error);
    // Handle error scenarios here
  });
