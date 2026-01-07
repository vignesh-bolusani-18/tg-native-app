import { createConnection as CreateConnection } from "../../utils/Data Connections/createConnection";
import { createSnowflakeConnection as CreateSnowflakeConnection } from "../../utils/Data Connections/createSnowflakeConnection";
import { fetchAmazonSellerSampleData } from "../../utils/Data Connections/fetchAmazonSellerSampleData";
import { fetchAmazonVendorSampleData } from "../../utils/Data Connections/fetchAmazonVendorSampleData";
import { fetchBizeeBuySampleData } from "../../utils/Data Connections/fetchBizeeBuySampleData";
import { fetchMS365BusinessCentralSampleData } from "../../utils/Data Connections/fetchMS365BusinessCentralSampleData";
import { fetchFlipkartSampleData } from "../../utils/Data Connections/fetchFlipkartSampleData";
import { fetchGoogleBigQuerySampleData } from "../../utils/Data Connections/fetchGoogleBigQuerySampleData";
import { fetchSampleData } from "../../utils/Data Connections/fetchSampleData";
import { fetchShopifySampleData } from "../../utils/Data Connections/fetchShopifySampleData";
import { fetchTGInternalSampleData } from "../../utils/Data Connections/fetchTGInternalSampleData";
import { getConnectionDetails } from "../../utils/Data Connections/getConnectionDetails";
import { getConnections } from "../../utils/Data Connections/getConnections";
import { processToken, processTokens, verifyDataConnectionsResponse } from "../../utils/jwtUtils";
import {
  loadConnections,
  setConnecting,
  setConnectionDetails,
  setConnectionResponse,
  setError,
  setFileName,
  setGoogleDriveDataConnectionDetails,
  setGoogleDriveSampleData,
  setGoogleDriveSampleDataFetchFailed,
  setSampleData,
} from "../slices/dataConnectionSlice";

// export const checkConnection =
//   (gSheetSpreadSheetId, gSheetConnectionName) => async (dispatch) => {
//     dispatch(checkConnection({ gSheetSpreadSheetId, gSheetConnectionName }));
//   };

export const createConnection =
  (
    dataConnectionName,
    dataConnectionType,
    dataConnectionPayload,
    userInfo,
    currentCompany,
    postCreation
  ) =>
  async (dispatch) => {
    try {
      await dispatch(setConnecting(true));
      const connectionPayload = {
        dataConnectionName,
        dataConnectionType,
        dataConnectionPayload,
        time: Date.now(),
      };
      console.log("Connection Payload", connectionPayload);

      let response;
      if (dataConnectionType === "snowflake") {
        response = await CreateSnowflakeConnection(
          connectionPayload,
          currentCompany,
          userInfo.userID
        );
      } else {
        response = await CreateConnection(
          connectionPayload,
          currentCompany,
          userInfo.userID
        );
      }

      await dispatch(setConnectionResponse(response));
      await postCreation();

      await dispatch(setConnecting(false));
    } catch (error) {
      await dispatch(setError(error));
      await dispatch(setConnecting(false));
    }
  };

export const loadConnectionsList = (userID) => async (dispatch) => {
  console.log("loadConnections called");
  getConnections(userID)
    .then(async (response) => {
      const verifiedConnections = await verifyDataConnectionsResponse(response, userID);
      const parseDate = (dateString) => {
        const parts = dateString.split(" at ");
        const datePart = parts[0];
        const timePart = parts[1] ? ` ${parts[1]}` : "";
        return new Date(`${datePart}${timePart}`);
      };
      const transformDate = (dateString) => {
        const parts = dateString.split("at");
        const date = `${parts[0]},${parts[1]}`;
        return date;
      };

      const formatDateTime = (timestamp) => {
        return new Date(timestamp).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true, // Use 12-hour format with AM/PM
        });
      };

      const sortAndTransformConnections = (connections) => {
        return connections
          .sort(
            (a, b) =>
              parseDate(formatDateTime(b.updatedAt)) -
              parseDate(formatDateTime(a.updatedAt))
          )
          .map((connection) => ({
            ...connection,
            updatedAt: transformDate(formatDateTime(connection.updatedAt)),
            createdAt: transformDate(formatDateTime(connection.createdAt)),
          }));
      };
      const sortedConnections = sortAndTransformConnections(verifiedConnections);

      console.log("verified: ", verifiedConnections);
      console.log("sorted: ", sortedConnections);
      dispatch(loadConnections(sortedConnections));
    })
    .catch((error) => {
      console.log(error);
      dispatch(setError(error));
    });
};
export const loadConnectionDetails =
  (dataConnectionID, userID) => async (dispatch) => {
    console.log("loadConnectionDetails called");
    const connectionPayload = {
      dataConnectionID,
      time: Date.now(),
    };
    getConnectionDetails(connectionPayload, userID)
      .then(async (response) => {
        const decodedConnections = await processTokens(response);

        console.log("decoded: ", decodedConnections);
        // console.log("sorted: ", sortedConnections);
        dispatch(setConnectionDetails(decodedConnections));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

// Function to recursively process tokens in Google Drive file structure
const processGoogleDriveTokens = async (obj) => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const processed = { ...obj };

  // Process token field if it exists
  if (processed.token && typeof processed.token === "string") {
    try {
      const decodedToken = await processToken(processed.token);
      // Remove the token key and spread the decoded object properties
      delete processed.token;
      Object.assign(processed, decodedToken);
    } catch (error) {
      console.error("Failed to decode token:", error);
      // Keep the original token if decoding fails
    }
  }

  // Recursively process children array
  if (Array.isArray(processed.children)) {
    processed.children = await Promise.all(
      processed.children.map((child) => processGoogleDriveTokens(child))
    );
  }

  return processed;
};

export const loadGoogleDriveConnectionDataDetails =
  (dataConnectionID, userID) => async (dispatch) => {
    console.log("loadGoogleDriveConnectionDataDetails called");
    const connectionPayload = {
      dataConnectionID,
      time: Date.now(),
    };
    getConnectionDetails(connectionPayload, userID)
      .then(async (response) => {
        try {
          // Process all tokens in the Google Drive response
          const processedResponse = {
            ...response,
            fileStructure: response.fileStructure
              ? await processGoogleDriveTokens(response.fileStructure)
              : null,
          };

          console.log("Processed Google Drive response:", processedResponse);
          dispatch(setGoogleDriveDataConnectionDetails(processedResponse));
        } catch (error) {
          console.error("Error processing Google Drive tokens:", error);
          // If token processing fails, dispatch the original response
          dispatch(setGoogleDriveDataConnectionDetails(response));
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };
export const loadConnectionDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };
    fetchSampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

export const loadGoogleDriveSampleDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadGoogleDriveSampleDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    // Reset the failure flag first
    dispatch(setGoogleDriveSampleDataFetchFailed(false));

    fetchSampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setGoogleDriveSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
        // Set the failure flag when the API call fails
        dispatch(setGoogleDriveSampleDataFetchFailed(true));
      });
  };

export const loadShopifyConnectionDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadShopifyConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    fetchShopifySampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };
export const loadBizeeBuyConnectionDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadBizeeBuyConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    fetchBizeeBuySampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

export const loadMS365BusinessCentralConnectionDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadMS365BusinessCentralConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    fetchMS365BusinessCentralSampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

export const loadGoogleBigQueryConnectionDataDetails =
  (
    dataConnectionName,
    companyName,
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) =>
  async (dispatch) => {
    console.log("loadGoogleBigQueryConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionName,
      companyName,
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    fetchGoogleBigQuerySampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

export const loadAmazonVendorConnectionDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadAmazonVendorConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    fetchAmazonVendorSampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

export const loadTGInternalConnectionDataDetails =
  (dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadTGInternalConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionPayload,

      time: Date.now(),
    };

    fetchTGInternalSampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

export const loadAmazonSellerConnectionDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadAmazonVendorConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    fetchAmazonSellerSampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };

export const loadFlipkartConnectionDataDetails =
  (dataConnectionID, dataConnectionPayload, userID) => async (dispatch) => {
    console.log("loadAmazonVendorConnectionDataDetails called");
    const connectionDatasetPayload = {
      dataConnectionID,
      dataConnectionPayload,
      time: Date.now(),
    };

    fetchFlipkartSampleData(connectionDatasetPayload, userID)
      .then(async (response) => {
        const decodedSampleData = await processToken(response);

        //         parseDate(formatDateTime(a.updatedAt))
        //     )
        //     .map((connection) => ({
        //       ...connection,
        //       updatedAt: transformDate(formatDateTime(connection.updatedAt)),
        //       createdAt: transformDate(formatDateTime(connection.createdAt)),
        //     }));
        // };
        // const sortedConnections =
        //   sortAndTransformConnections(decodedConnections);
        console.log("fileName", decodedSampleData?.fileName);
        console.log("decoded: ", decodedSampleData);
        // console.log("sorted: ", sortedConnections);
        dispatch(setSampleData(decodedSampleData.data));
        dispatch(setFileName(decodedSampleData?.fileName || ""));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setError(error));
      });
  };
