import { setError } from "../slices/experimentSlice";

import { processTokens, verifyExportJobsResponse, verifyExportPipelinesResponse } from "../../utils/jwtUtils";

import {
  loadExportJobs,
  loadExportPipelines,
} from "../../redux/slices/exportsSlice";

import {
  addExportPipelineToDatabase,
  addExportJobToDatabase,
} from "../../utils/createDBEntry";
import { getExportJobs } from "../../utils/getExportJobs";
import { getExportPipelines } from "./../../utils/getExportPipelines";

import { uploadJsonToS3 } from "../../utils/s3Utils";

export const loadExportPipelinesList = (userInfo) => async (dispatch) => {
  try {
    const response = await getExportPipelines(); // change this function
    console.log("Response at Action:", response);
    const verifiedPipelines = await verifyExportPipelinesResponse(response, userInfo.userID);
    console.log("Verified Pipelines", verifiedPipelines);
    console.log("Called at Actions");
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

    // Update dates in decoded exportPipelines
    const updatedExportPipelines = verifiedPipelines.map((exportPipeline) => ({
      ...exportPipeline,

      createdAt: formatDate(exportPipeline.createdAt), // Update createdAt similarly
    }));
    console.log("Updated Pipelines", updatedExportPipelines);
    // Function to sort exportPipelines based on updatedAt (most recent first)
    const sortExportPipelines = (exportPipelines) => {
      const pipelines = exportPipelines.sort(
        (a, b) =>
          convertToTimestamp(b.createdAt) - convertToTimestamp(a.createdAt) // Sort by updatedAt, most recent first
      );
      console.log("Sorted", pipelines);
      return pipelines;
    };

    const sortedExportPipelines = sortExportPipelines(updatedExportPipelines);
    console.log("Sorted Pipelines", sortedExportPipelines);
    console.log("verified Pipelines: ", verifiedPipelines);
    console.log("sorted: ", sortedExportPipelines);

    dispatch(loadExportPipelines(sortedExportPipelines));
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message));
  }
};

export const AddExportPipeline =
  (userInfo, currentCompany, exportPipelineInfo, exportPipelineId) =>
  async (dispatch) => {
    // const { userInfo, currentCompany } = useAuth();
    // const { exportPipelines_list} = useExportPipeline();
    console.log("addExportPipeline " + currentCompany);

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
    const exportPipelinePayload = {
      companyID: currentCompany.companyID,
      userID: userInfo.userID,
      exportPipelinesTableName: `EXPORTPIPELINES`,
      exportPipelineName: exportPipelineInfo.name,
      exportPipelineID: exportPipelineId,
      exportDataset: exportPipelineInfo.dataset,
      exportDestination: exportPipelineInfo.dataConnection.conn_name,
      exportDestinationType: exportPipelineInfo.dataConnection.source_type,
      exportPipelineStatus: "Created",
      createdAt: Date.now(), // Set createdAt to the current date and time
      createdBy: userInfo.userName,
      inTrash: false,
      time: Date.now(),
    };
    console.log("exportPipelinePayload", exportPipelinePayload);

    const response = addExportPipelineToDatabase(
      exportPipelinePayload,
      currentCompany,
      userInfo.userID
    )
      .then(async (response) => {
        console.log("response of exportPipeline adding: ", response);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
    return response;
  };

export const loadExportJobsList = (userInfo) => async (dispatch) => {
  try {
    const response = await getExportJobs(userInfo.userID); // change this function
    const verifiedJobs = await verifyExportJobsResponse(response, userInfo.userID);

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

    // Update dates in decoded exportJobs
    const updatedExportJobs = verifiedJobs.map((exportJob) => ({
      ...exportJob,
      updatedAt: formatDate(exportJob.updatedAt), // Update to formatted date
      createdAt: formatDate(exportJob.createdAt), // Update createdAt similarly
    }));

    // Function to sort exportJobs based on updatedAt (most recent first)
    const sortExportJobs = (exportJobs) => {
      return exportJobs.sort(
        (a, b) =>
          convertToTimestamp(b.updatedAt) - convertToTimestamp(a.updatedAt) // Sort by updatedAt, most recent first
      );
    };

    const sortedExportJobs = sortExportJobs(updatedExportJobs);

    console.log("verified: ", verifiedJobs);
    console.log("sorted: ", sortedExportJobs);

    dispatch(loadExportJobs(sortedExportJobs));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const AddExportJob =
  (userInfo, currentCompany, exportJobInfo, exportJobId) =>
  async (dispatch) => {
    // const { userInfo, currentCompany } = useAuth();
    // const { exportJobs_list} = useExportJob();
    console.log("addExportJob " + currentCompany);

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
    const export_job_config = {
      exportJobID: exportJobId,
      exportPipelinePath: exportJobInfo.exportPipelinePath,
      datasetPath: exportJobInfo.datasetPath,
      exportPipelineStatus: exportJobInfo.exportPipelineStatus,
    };
    const export_job_config_path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/exports/jobs/${exportJobId}.json`;
    await uploadJsonToS3(export_job_config_path, export_job_config);
    const exportJobPayload = {
      companyID: currentCompany.companyID,
      userID: userInfo.userID,
      exportJobsTableName: `EXPORTJOBS`,
      exportJobID: exportJobId,
      exportPipelineName: exportJobInfo.exportPipelineName,
      exportJobExperimentName: exportJobInfo.experimentName,
      exportJobExperimentID: exportJobInfo.experimentID,
      exportJobSource: exportJobInfo.exportJobSource,
      exportJobDestination: exportJobInfo.exportJobDestination,
      exportJobDestinationType: exportJobInfo.exportJobDestinationType,
      exportJobStatus: "Initializing...",
      createdAt: Date.now(), // Set createdAt to the current date and time
      updatedAt: Date.now(), // Set updatedAt to the current date and time
      createdBy: userInfo.userName,
      //   dataConnectionName: exportPipelineInfo.dataConnectionName,
      inTrash: false,
      time: Date.now(),
    };
    console.log("exportJobPayload", exportJobPayload);

    const response = addExportJobToDatabase(
      exportJobPayload,
      currentCompany,
      userInfo.userID
    )
      .then(async (response) => {
        console.log("response of exportJob adding: ", response);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
    return response;
  };
