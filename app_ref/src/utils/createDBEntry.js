import axios from "axios";

import { generateToken } from "./jwtUtils";
import { getAuthToken } from "../redux/actions/authActions";



// Function to make a POST request with JWT token in the request body
export const addExperimentToDatabase = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  console.log("Token:-->", Token);
  console.log("entered in the add experiment");
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (
    currentCompany.unlimited_experiments ||
    currentCompany.allowed_total_experiments > 0
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/experiment?t=${Date.now()}`,
        {
          experimentDataToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

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
  } else {
    console.log("You are not authorized to add an experiment");
  }
};


// Function to make a POST request with JWT token in the request body
export const addWorkflowToDatabase = async (
  tokenPayload
) => {
  const Token = await getAuthToken();
  const token = await generateToken(tokenPayload, Token);
  console.log("entered in the add workflow");
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/workflow?t=${Date.now()}`,
      {
        workflowDataToken: token,
      },
      {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    console.log("Add Workflow Response:", response.data);
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
export const addScheduledJobToDatabase = async (
  tokenPayload
) => {
  const Token = await getAuthToken();
  const token = await generateToken(tokenPayload, Token);
  console.log("entered in the add workflow");
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/scheduledJob?t=${Date.now()}`,
      {
        jobDataToken: token,
      },
      {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    console.log("Add Workflow Response:", response.data);
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

export const deleteScheduledJob = async (
  scheduledJobID,
  workflowID
) => {
  const Token = await getAuthToken();
  const payload = {
    scheduledJobID: scheduledJobID,
    workflowID: workflowID
  }
  const token = await generateToken(payload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  if (1 === 1) {
    try {
      const response = await axios.delete(
        `${baseURL}/scheduledJob?t=${Date.now()}`,
        {
          params: { deleteScheduledJobToken: token }, // Token in the query parameters
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

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
  } else {
    console.log("You are not authorized to delete an schedulesJob");
  }
};

export const deleteExperiment = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  if (currentCompany.delete_experiments) {
    try {
      const response = await axios.delete(
        `${baseURL}/experiment?t=${Date.now()}`,
        {
          params: { deleteExperimentToken: token }, // Token in the query parameters
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

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
  } else {
    console.log("You are not authorized to delete an experiment");
  }
};

export const deleteImpactPipeline = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  if (currentCompany.delete_experiments) {
    try {
      const response = await axios.delete(
        `${baseURL}/impactPipeline?t=${Date.now()}`,
        {
          data: { deletePipelineToken: token }, // Token in the query parameters
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

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
  } else {
    console.log("You are not authorized to delete an impact pipeline");
  }
};


export const terminateSession = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  

  if (1 === 1) {
    try {
      const response = await axios.delete(
        `${baseURL}/session?t=${Date.now()}`,
        {
          data: { deleteSessionToken: token }, // Token in the query parameters
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Response:-->", response.data);

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
  } else {
    console.log("You are not authorized to delete an impact pipeline");
  }
};

export const addImpactPipeline = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  console.log("entered in the add impact pipeline");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (
    currentCompany.unlimited_datasets ||
    currentCompany.allowed_total_datasets > 0
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/impactPipeline?t=${Date.now()}`,
        {
          impactPipelineIDataToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Add Impact Pipeline Response:-->", response.data);
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
  } else {
    console.log("You are not authorized to add an impact pipeline");
  }
};

export const addSession = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  console.log("entered in the add session");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
 
  if (
    1 === 1
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/session?t=${Date.now()}`,
        {
          sessionDataToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Add Session Response:-->", response.data);
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
  } else {
    console.log("You are not authorized to add an impact pipeline");
  }
};

export const deleteDataset = async (tokenPayload, currentCompany, userID) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  if (currentCompany.delete_datasets) {
    try {
      const response = await axios.delete(
        `${baseURL}/dataset?t=${Date.now()}`,
        {
          params: { deleteDatasetToken: token }, // Token in the query parameters
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      //console.log("Response:-->", response.data);

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
  } else {
    //console.log("You are not authorized to delete a dataset.");
  }
};
export const addDatasetToDatabase = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  console.log("entered in the add experiment");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (
    currentCompany.unlimited_datasets ||
    currentCompany.allowed_total_datasets > 0
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/dataset?t=${Date.now()}`,
        {
          datasetDataToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
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
  } else {
    console.log("You are not authorized to add an dataset");
  }
};

export const invitePeople = async (tokenPayload, currentCompany, userID) => {
  console.log("entered in the invitePeople");
  const Token = await getAuthToken(userID);
  console.log("token at TOken : " + Token);
  const token = await generateToken(tokenPayload, Token);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (currentCompany.invite_users) {
    try {
      const response = await axios.post(
        `${baseURL}/createInvitation?t=${Date.now()}`,
        {
          invitationDataToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
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
  } else {
    console.log("You are not authorized to send Invite");
  }
};
export const addExportPipelineToDatabase = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  console.log("entered in the add pipeline");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (
    1 == 1
    // currentCompany.unlimited_export_pipelines ||
    // currentCompany.allowed_total_export_pipelines > 0
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/exportPipeline?t=${Date.now()}`,
        {
          exportPipelineToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Add Export Pipeline Response:-->", response.data);
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
  } else {
    console.log("You are not authorized to add an export pipeline");
  }
};

export const addExportJobToDatabase = async (
  tokenPayload,
  currentCompany,
  userID
) => {
  const Token = await getAuthToken(userID);
  const token = await generateToken(tokenPayload, Token);
  console.log("entered in the add job");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  if (
    currentCompany.unlimited_export_jobs ||
    currentCompany.allowed_total_export_jobs > 0
  ) {
    try {
      const response = await axios.post(
        `${baseURL}/exportJob?t=${Date.now()}`,
        {
          exportJobToken: token, // Token in the body
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
            "Content-Type": "application/json", // Assuming the data is JSON
            Authorization: `Bearer ${Token}`, // JWT bearer token in the authorization header
          },
        }
      );
      console.log("Add Export Job Response:-->", response.data);
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
  } else {
    console.log("You are not authorized to add an export job");
  }
};
