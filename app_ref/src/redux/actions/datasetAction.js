import { setError } from "../slices/experimentSlice";

import { generateToken, processTokens, verifyDatasetsResponse } from "../../utils/jwtUtils";
import { getDatasets } from "../../utils/getDatasets";
import {
  loadDatasets,
  setDatasetNameList,
  addPreprocessMetaData,
  removePreprocessMetaData,
  updatePreprocessMetaData,
  addDetails,
  removeDetail,
  updateDetail,
  addQuery,
  removeQuery,
  updateQuery,
} from "../../redux/slices/datasetSlice";
import useDataset from "../../hooks/useDataset";
import { addDatasetToDatabase, deleteDataset } from "../../utils/createDBEntry";
import { fetchJsonFromS3, fetchTxtFromS3 } from "../../utils/s3Utils";

export const loadDatasetList = (userInfo) => async (dispatch) => {

  try {
    const response = await getDatasets(userInfo.userID);
    const verifiedDatasets = await verifyDatasetsResponse(response, userInfo.userID);

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
        console.error("Invalid date string:", date);
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
      // Define an object mapping full month names to abbreviated names
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

      // If the format matches, replace the full month with its abbreviation
      if (match) {
        const fullMonth = match[1]; // The full month name
        const day = match[2]; // The day
        const year = match[3]; // The year
        const time = match[4]; // The time

        // Replace full month with abbreviated month
        const abbreviatedMonth = monthMap[fullMonth];

        // Return the formatted date string
        return `${abbreviatedMonth} ${day}, ${year} at ${time}`;
      }

      // Return original string if the format doesn't match
      return dateString;
    };

    // Update dates in decoded datasets
    const updatedDatasets = verifiedDatasets.map((dataset) => ({
      ...dataset,
      updatedAt: formatDate(dataset.updatedAt), // Update to formatted date
      createdAt: formatDate(dataset.createdAt), // Update createdAt similarly
    }));

    // Function to sort datasets based on updatedAt (most recent first)
    const sortDatasets = (datasets) => {
      return datasets.sort(
        (a, b) =>
          convertToTimestamp(b.updatedAt) - convertToTimestamp(a.updatedAt) // Sort by updatedAt, most recent first
      );
    };

    const sortedDatasets = sortDatasets(updatedDatasets);
    const datasetsNames = sortedDatasets.map((dataset) => dataset.datasetName);

    // console.log("dataSetNames", datasetsNames);
    // console.log("decoded: ", decodedDatasets);
    // console.log("sorted: ", sortedDatasets);

    dispatch(loadDatasets(sortedDatasets));
    dispatch(setDatasetNameList(datasetsNames));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const deleteTheDataset =
  (currentCompany, userInfo, payload, loadDatasetsList) => async (dispatch) => {
    
    deleteDataset(payload, currentCompany, userInfo.userID)
      .then(async (response) => {
        //console.log("Dataset deleted successfully", response);
        await loadDatasetsList(userInfo);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
  };

export const AddDataset =
  (userInfo, currentCompany, datasetInfo, datasetId) => async (dispatch) => {
    // const { userInfo, currentCompany } = useAuth();
    // const { datasets_list} = useDataset();
    console.log("addDataset " + currentCompany);

    const formatCurrentDateTime = () => {
      return new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true, // Use 12-hour format with AM/PM
      });
    };
    const datasetPayload = {
      companyID: currentCompany.companyID,
      userID: userInfo.userID,
      datasetTableName: `DATASETS`,
      datasetName: datasetInfo.datasetName,
      datasetTag: datasetInfo.datasetTag,
      datasetSourceName: datasetInfo.sourceName,
      datasetID: datasetId,
      createdAt: Date.now(), // Set createdAt to the current date and time
      updatedAt: Date.now(), // Set updatedAt to the current date and time
      createdBy: userInfo.userName,
      datasetPath: datasetInfo.metaDataPath,
      dataConnectionName: datasetInfo?.dataConnectionName || "",
      inTrash: false,
      time: Date.now(),
    };
    console.log("datasetPayload", datasetPayload);

   
    const response = addDatasetToDatabase(
      datasetPayload,
      currentCompany,
      userInfo.userID
    )
      .then(async (response) => {
        console.log("response of dataset adding: ", response);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
    return response;
  };
export const AddPreprocessMetadata =
  (path, datasetID, userID) => async (dispatch) => {
    try {
      const data = await fetchJsonFromS3(path, userID);
      await dispatch(addPreprocessMetaData({ datasetID, metadata: data }));
    } catch (error) {
      throw error;
    }
  };
export const AddDetails =
  (datasetID, source, companyName, fileName, currentCompany) => async (dispatch) => {
    try {
      const PreFixpath = `accounts/${companyName}_${currentCompany.companyID}/customer_data/data_library`;
      let path = "";
      if (source === "Custom") {
        path = `${PreFixpath}/custom_data_args/${fileName}.txt`;
      }
      const data = await fetchTxtFromS3(path);
      await dispatch(addDetails({ datasetID, detail: data }));
    } catch (error) {
      throw error;
    }
  };
export const AddQuery =
  (datasetID, source, companyName, fileName, dataConnectionName, currentCompany) =>
  async (dispatch) => {
    try {
      const PreFixpath = `accounts/${companyName}_${currentCompany.companyID}/customer_data/data_library`;
      let path = "";
      if (source === "Snowflake" || source === "Azure SQL" || source === "Google BigQuery") {
        path = `${PreFixpath}/data_queries/${fileName}||${dataConnectionName}.txt`;
      }
      const data = await fetchTxtFromS3(path);
      await dispatch(addQuery({ datasetID, query: data }));
    } catch (error) {
      throw error;
    }
  };

export const RemovePreprocessMetaData = (datasetID) => async (dispatch) => {
  await dispatch(removePreprocessMetaData({ datasetID }));
};
export const RemoveDetail = (datasetID) => async (dispatch) => {
  await dispatch(removeDetail({ datasetID }));
};
export const RemoveQuery = (datasetID) => async (dispatch) => {
  await dispatch(removeQuery({ datasetID }));
};
export const UpdatePreprocessMetaData =
  (data_preprocess_args, datasetID) => async (dispatch) => {
    await dispatch(
      updatePreprocessMetaData({ datasetID, data_preprocess_args })
    );
  };
export const UpdateDetail = (detail, datasetID) => async (dispatch) => {
  await dispatch(updateDetail({ datasetID, detail }));
};
export const UpdateQuery = (query, datasetID) => async (dispatch) => {
  await dispatch(updateQuery({ datasetID, query }));
};
