import {
  loadImpactPipelines as LoadImpactPipelines,
  setMetricsAnalysisGraphMetrics as SetMetricsAnalysisGraphMetrics,
  clearMetricsAnalysisGraphMetrics as ClearMetricsAnalysisGraphMetrics,
} from "../slices/impactSlice";

import {
  addImpactPipeline as AddImpactPipeline,
  deleteImpactPipeline as DeleteImpactPipeline,
} from "../../utils/createDBEntry";
import { processTokens, verifyImpactPipelinesResponse } from "../../utils/jwtUtils";
import { getImpactPipelines } from "../../utils/getImpactPipelines";
import { fetchJsonFromS3, uploadJsonToS3 } from "../../utils/s3Utils";

// Utility function to flatten DynamoDB AttributeValue objects
const flattenAttributes = (item) => {
  const flattened = {};
  for (const key in item) {
    if (item[key]?.S !== undefined) {
      flattened[key] = item[key].S; // String
    } else if (item[key]?.N !== undefined) {
      flattened[key] = parseFloat(item[key].N); // Number
    } else if (item[key]?.BOOL !== undefined) {
      flattened[key] = item[key].BOOL; // Boolean
    } else if (item[key]?.NULL !== undefined) {
      flattened[key] = null; // Null
    } else {
      flattened[key] = item[key]; // Other (unchanged)
    }
  }
  return flattened;
};

export const loadImpactPipelines = (userInfo) => async (dispatch) => {
  console.log("loadImpactPipelines called");

  try {
    const response = await getImpactPipelines(userInfo.userID);
    console.log("response: ", response);

    const verifiedImpactPipelines = await verifyImpactPipelinesResponse(response, userInfo.userID);

   
    console.log("Verified Impact Pipelines:", verifiedImpactPipelines);
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
    const updatedImpactPipelines = verifiedImpactPipelines.map(
      (impactPipeline) => ({
        ...impactPipeline,
        updatedAt: formatDate(impactPipeline.updatedAt),
        createdAt: formatDate(impactPipeline.createdAt),
      })
    );

    // Function to sort experiments based on updatedAt (most recent first)
    const sortImpactPipelines = (impactPipelines) => {
      return impactPipelines.sort(
        (a, b) =>
          convertToTimestamp(b.updatedAt) - convertToTimestamp(a.updatedAt)
      );
    };

    const sortedImpactPipelines = sortImpactPipelines(updatedImpactPipelines);

    console.log("verified: ", verifiedImpactPipelines);
    console.log("sorted: ", sortedImpactPipelines);

    dispatch(LoadImpactPipelines(sortedImpactPipelines));
  } catch (error) {
    console.log("error: ", error);
  }
};

export const addImpactPipeline =
  (userInfo, currentCompany, impactPipelineInfo, loadImpactPipelines) =>
  async (dispatch) => {
    console.log("addImpactPipeline " + currentCompany);

    const impactPipelinePayload = {
      impactPipelineName: impactPipelineInfo.impactPipelineName,
      impactPipelineTag: impactPipelineInfo.impactPipelineTag,
      impactPipelineStatus: impactPipelineInfo.impactPipelineStatus,
      impactPipelineID: impactPipelineInfo.impactPipelineID,
      createdAt: impactPipelineInfo.createdAt,
      updatedAt: impactPipelineInfo.updatedAt,
      createdBy: impactPipelineInfo.createdBy,
      inTrash: false,
      experimentIDs: impactPipelineInfo.experimentIDs,
    };
    console.log("impactPipelinePayload", impactPipelinePayload);

    const response = AddImpactPipeline(
      impactPipelinePayload,
      currentCompany,
      userInfo.userID
    )
      .then(async (response) => {
        console.log("response of impact pipeline adding: ", response);
        // await loadImpactPipelines(userInfo);
        return response;
      })
      .catch((error) => {
        console.log("error: ", error);
      });
    return response;
  };

export const deleteImpactPipeline =
  (currentCompany, userInfo, payload, loadImpactPipelines) =>
  async (dispatch) => {
    DeleteImpactPipeline(payload, currentCompany, userInfo.userID)
      .then(async (response) => {
        console.log("Impact Pipeline deleted successfully", response);
        await loadImpactPipelines(userInfo);
        return response;
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };

export const setMetricsAnalysisGraphMetrics =
  (metrics, currentCompany, impactPipelineID, impactPipelineName) =>
  async (dispatch) => {
    const metricJSON = { metricsAnalysisGraphMetrics: metrics };
    try {
      const path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/impact_pipelines/${impactPipelineName}_${impactPipelineID}/impact_pipeline_info.json`;

      const response = await uploadJsonToS3(path, metricJSON);
      console.log("response: ", response);
    } catch (e) {
      console.log("error uploading metrics to s3: ", e);
    }
    dispatch(SetMetricsAnalysisGraphMetrics(metrics));
  };

export const clearMetricsAnalysisGraphMetrics = () => async (dispatch) => {
  dispatch(ClearMetricsAnalysisGraphMetrics());
};

export const loadMetricsAnalysisGraphMetrics =
  (currentCompany, impactPipelineID, impactPipelineName) =>
  async (dispatch) => {
    try {
      const path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/impact_pipelines/${impactPipelineName}_${impactPipelineID}/impact_pipeline_info.json`;
      const response = await fetchJsonFromS3(path);
      console.log("response: ", response);
      dispatch(
        SetMetricsAnalysisGraphMetrics(
          response.metricsAnalysisGraphMetrics || []
        )
      );
    } catch (error) {
      console.log("error loading metrics from s3: ", error);
      dispatch(SetMetricsAnalysisGraphMetrics([]));
    }
  };
