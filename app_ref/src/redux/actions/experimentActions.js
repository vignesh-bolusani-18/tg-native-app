import {
  loadExperiments,
  setError,
  setExperimentConfig,
  setLoadedDataCSV,
  setLoading,
  setMetadata,
  setExperimentStatus as SetExperimentStatus,
  setTabValue as SetTabValue,
  setPreprocessMetadata,
} from "../slices/experimentSlice";
import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchJsonFromS3,
  listBuckets,
  uploadJsonToS3,
} from "../../utils/s3Utils";
import { decryptData, encryptData } from "../../utils/cryptoUtils";
import useAuth from "../../hooks/useAuth";
import { ConstructionOutlined } from "@mui/icons-material";
import { getExperiments } from "../../utils/getExperiments";
import {
  generateToken,
  processTokens,
  verifyExperimentsResponse,
  verifyResponseSecurity,
} from "../../utils/jwtUtils";
import { loadFieldTags } from "../../utils/loadFieldTags";
import { removeUnnecessaryFieldTags } from "../../utils/Formating/loadedDatasetFormating";
import { terminateExperiment } from "../../utils/terminateExperiment";
import { deleteExperiment } from "../../utils/createDBEntry";
import { cleanUpEditsConfig } from "../../utils/cleanUpEditsConfig";
import { setEditsConfig } from "../slices/configSlice";
import { syncConfigWithEdits } from "../../utils/syncConfigWithEdits";
import { addConversationIdToExp } from "../../utils/addConversationIdToExp";

export const loadMetadata =
  ({ path, currentDatasetTag, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log("loadedDataset path:", path);
      const data = await fetchJsonFromS3(path, userID);
      // const lists = await listBuckets();
      // console.log("NewLOG:",lists);
      const decryptedData = data;
      console.log("Decrypted Loaded Dataset", data);
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      const newData = loadFieldTags(decryptedData, currentDatasetTag);
      console.log("Aggregations :", newData.data_steps[0].kwargs.aggregations);
      const filteredData = removeUnnecessaryFieldTags(
        newData,
        currentDatasetTag
      );
      console.log("Filtered Data", data);

      await dispatch(
        setMetadata({ loadedDataset: filteredData, currentDatasetTag })
      );
      console.log("MetaData Fetched:", filteredData);
      return filteredData;
    } catch (error) {
      console.log("Error at experiment Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadExistingMetadata =
  ({ loadedData, tag }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const newData = loadFieldTags(loadedData, tag);
      console.log("Aggregations :", newData.data_steps[0].kwargs.aggregations);
      const filteredData = removeUnnecessaryFieldTags(newData, tag);
      console.log("Filtered Data", filteredData);

      await dispatch(
        setMetadata({ loadedDataset: filteredData, currentDatasetTag: tag })
      );
      console.log("Existing MetaData Setted at actions:", filteredData);
      return filteredData;
    } catch (error) {
      console.log("Error at experiment Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const loadPreprocessMetadata =
  ({ path, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log("loadedDataset path:", path);
      const data = await fetchJsonFromS3(path, userID);
      // const lists = await listBuckets();
      // console.log("NewLOG:",lists);

      await dispatch(setPreprocessMetadata(data));
      console.log("MetaData Fetched:", data);
      return data;
    } catch (error) {
      console.log("Error at experiment Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadExperimentList = (userInfo) => async (dispatch) => {
  console.log("loadExperimentList called");

  try {
    const response = await getExperiments(userInfo.userID);
    // console.log("response: ", response);

    // Verify security and get invitation data
    const verifiedExperiments = await verifyExperimentsResponse(
      response,
      userInfo.userID
    );

    // console.log("DecodedExperiments:", decodedExperiments);
    // Function to format date to local format
    const formatDate = (date) => {
      // If it's a valid timestamp (milliseconds since epoch)
      if (!isNaN(date)) {
        const dateObj = new Date(date);
        // Format the date part
        const datePart = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(dateObj);

        // Format the time part, including seconds
        const timePart = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(dateObj);

        // Combine the date and time parts with "at"
        const formattedDateTime = `${datePart}, at ${timePart}`;
        return formattedDateTime;
      }

      // If the date is already a formatted string, parse it and format it again
      try {
        return formatDateString(date);
      } catch (error) {
        console.error("Invalid date string:", error);
      }

      return date; // Return the original string if parsing fails
    };

    function convertToTimestamp(dateString) {
      // Create a new Date object from the input date string
      const date = new Date(dateString.replace(/ at /, " "));

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }

      // Return the timestamp in milliseconds
      return date.getTime();
    }

    // Function to convert full month names to abbreviated month names
    const formatDateString = (dateString) => {
      const monthMap = {
        January: "Jan",
        February: "Feb",
        March: "Mar",
        April: "Apr",
        May: "May",
        June: "Jun",
        July: "Jul",
        August: "Aug",
        September: "Sep",
        October: "Oct",
        November: "Nov",
        December: "Dec",
      };

      // Use a regular expression to match the full date format
      const regex =
        /(\w+) (\d{1,2}), (\d{4}) at (\d{1,2}:\d{2}:\d{2} [APM]{2})/;
      const match = dateString.match(regex);

      if (match) {
        const fullMonth = match[1];
        const day = match[2];
        const year = match[3];
        const time = match[4];

        const abbreviatedMonth = monthMap[fullMonth];
        return `${abbreviatedMonth} ${day}, ${year} at ${time}`;
      }

      return dateString;
    };

    // Update dates in decoded experiments
    const updatedExperiments = verifiedExperiments.map((experiment) => ({
      ...experiment,
      updatedAt: formatDate(experiment.updatedAt),
      createdAt: formatDate(experiment.createdAt),
    }));

    // Function to sort experiments based on updatedAt (most recent first)
    const sortExperiments = (experiments) => {
      return experiments.sort(
        (a, b) =>
          convertToTimestamp(b.updatedAt) - convertToTimestamp(a.updatedAt)
      );
    };

    const sortedExperiments = sortExperiments(updatedExperiments);

    // console.log("decoded: ", decodedExperiments);
    // console.log("sorted: ", sortedExperiments);

    dispatch(loadExperiments(sortedExperiments));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const deleteTheExperiment =
  (currentCompany, userInfo, payload, loadExperimentsList) =>
  async (dispatch) => {
    deleteExperiment(payload, currentCompany, userInfo.userID)
      .then(async (response) => {
        console.log("Experiment deleted successfully", response);
        await loadExperimentsList(userInfo);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
  };

export const terminateTheExperiment =
  (currentCompany, userInfo, payload, loadExperimentsList) =>
  async (dispatch) => {
    await loadExperimentsList(userInfo);
    terminateExperiment(payload, currentCompany, userInfo.userID)
      .then(async (response) => {
        console.log("Experiment terminated successfully", response);
        await loadExperimentsList(userInfo);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
  };
export const saveMetadata = (path, metaData) => async (dispatch) => {
  const filePath = path;
  try {
    const encryptedData = metaData;
    console.log("data before going to S3", encryptedData);
    // const encryptedData = encryptData(
    //   metaData,
    //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
    // );
    await uploadJsonToS3(filePath, encryptedData);

    console.log("hi");
  } catch (error) {
    console.log(error);
    dispatch(setError(error.toString()));
  }
};

export const loadDatasetCSV =
  ({ path, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchCSVData({
        filePath: path,
        filterData: null,
        paginationData: { batchNo: 1, batchSize: 50 },
        sortingData: null,
      });
      const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      console.log(path);
      await dispatch(setLoadedDataCSV(decryptedData));
      console.log(" Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at experiment Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadExperimentConfig =
  ({ experimentId, moduleName, currentCompany }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchJsonFromS3(
        `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${moduleName}/${experimentId}/config.json`
      );
      console.log("config fetched from s3", data);
      let finalConfig = data;
      const experimentID = finalConfig.common.job_id;
      const parentExperimentID = finalConfig.common.parent_job_id;
      let editsConfig = null;
      if (experimentID && experimentID.length > 10) {
        try {
          editsConfig = await fetchJsonFromS3(
            `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${moduleName}/${experimentID}/edits_config.json`
          );
        } catch (error) {
          console.error("Error fetching edits config:", error);
        }

        if (editsConfig) {
          console.log("editsConfig", editsConfig);
          const cleanEditsConfig = cleanUpEditsConfig(
            editsConfig,
            experimentID,
            parentExperimentID
          );
          await dispatch(setEditsConfig(cleanEditsConfig));
          finalConfig = syncConfigWithEdits(
            finalConfig,
            cleanEditsConfig,
            experimentID,
            parentExperimentID
          );
        } else {
          const newEditsConfig = {
            editedFiles: finalConfig?.editedFiles ?? {},
            newRows: finalConfig?.stacking?.newRows ?? {},
            deletedRows:{},
            editHistories: finalConfig?.editHistories ?? {},
          };
          const cleanEditsConfig = cleanUpEditsConfig(
            newEditsConfig,
            experimentID,
            parentExperimentID
          );
            console.log("New Edits Config", newEditsConfig);
            console.log("Clean Edits Config", cleanEditsConfig);
          await dispatch(setEditsConfig(cleanEditsConfig));
        }
      }

      console.log("finalConfig", finalConfig);
      await dispatch(setExperimentConfig(finalConfig));
      console.log("config.json Fetched:", finalConfig);
      return finalConfig;
    } catch (error) {
      console.error("Error at experiment Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const syncExperimentConfigFromS3WithEdits =
  ({ moduleName, currentCompany, config }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let finalConfig = config;
      const experimentID = finalConfig.common.job_id;
      const parentExperimentID = finalConfig.common.parent_job_id;
      let editsConfig = null;
      if (experimentID && experimentID.length > 10) {
        try {
          editsConfig = await fetchJsonFromS3(
            `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${moduleName}/${experimentID}/edits_config.json`
          );
        } catch (error) {
          console.error("Error fetching edits config:", error);
        }

        if (editsConfig) {
          console.log("editsConfig", editsConfig);
          const cleanEditsConfig = cleanUpEditsConfig(
            editsConfig,
            experimentID,
            parentExperimentID
          );
          await dispatch(setEditsConfig(cleanEditsConfig));
          finalConfig = syncConfigWithEdits(
            finalConfig,
            cleanEditsConfig,
            experimentID,
            parentExperimentID
          );
        } else {
          const newEditsConfig = {
            editedFiles: finalConfig?.editedFiles?? {},
            newRows: finalConfig?.stacking?.newRows?? {},
            deletedRows:{},
            editHistories: finalConfig?.editHistories?? {},
          };
          const cleanEditsConfig = cleanUpEditsConfig(
            newEditsConfig,
            experimentID,
            parentExperimentID
          );
            console.log("New Edits Config", newEditsConfig);
            console.log("Clean Edits Config", cleanEditsConfig);
          await dispatch(setEditsConfig(cleanEditsConfig));
        }
      }

      console.log("finalConfig", finalConfig);
      await dispatch(setExperimentConfig(finalConfig));
      console.log("config.json Fetched:", finalConfig);
      return finalConfig;
    } catch (error) {
      console.log(
        "Error at syncExperimentConfigFromS3WithEdits in experimentActions!"
      );
      dispatch(setError(error.toString()));
      return config;
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setExperimentStatus =
  ({ experimentStatus }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await dispatch(SetExperimentStatus(experimentStatus));
      console.log("current Experiment Status", experimentStatus);
      return experimentStatus;
    } catch (error) {
      console.log("Error at experiment Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const addConversationIdToExperiment =  
  (experiment_id, conversationID,userInfo) => 
    async (dispatch) => {
    
    try {
      const tokenPayload = { experimentID: experiment_id, conversationID: conversationID };
      const response = await addConversationIdToExp(tokenPayload, userInfo.currentCompany, userInfo.userID);
      console.log("Conversation ID added to experiment:", response);
      // Refresh the experiments list in client state so the newly added conversationID
      // is immediately available in `experiments_list` selectors.
      try {
        await dispatch(loadExperimentList(userInfo));
      } catch (e) {
        console.error("Error reloading experiments list after adding conversation ID:", e);
      }

      return response;
    } catch (error) {
      console.error("Error adding conversation ID to experiment:", error);
      throw error;
    }
  };