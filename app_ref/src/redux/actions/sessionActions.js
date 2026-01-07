import { setError } from "../slices/experimentSlice";
import { processTokens, verifySessionsResponse } from "../../utils/jwtUtils";
import {
  loadSessions,
  setCurrentSession,
  updateCurrentSessionID,
} from "../../redux/slices/sessionSlice";
import { addSession as AddSession } from "../../utils/createDBEntry";
import { v4 as uuidv4 } from "uuid";
import { terminateSession as TerminateSession } from "../../utils/createDBEntry";
// import {
//   addSessionToDatabase,
// } from "../../utils/createDBEntry";
// import { getSessions } from "../../utils/getSessions";
// import { getSessionById } from "../../utils/getSessionById";

import { uploadJsonToS3, uploadTxtToS3 } from "../../utils/s3Utils";
import { getSessions } from "../../utils/getSessions";

export const loadSessionsList = (userInfo) => async (dispatch) => {
  try {
    const response = await getSessions(userInfo.userID);
    console.log("Response at Action:", response);
    const verifiedSessions = await verifySessionsResponse(response, userInfo.userID);
    console.log("Verified Sessions", verifiedSessions);
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

    // Update dates in decoded sessions
    const updatedSessions = verifiedSessions.map((session) => ({
      ...session,
      updated_at: formatDate(session.updated_at),
      created_at: formatDate(session.created_at),
    }));
    console.log("Updated Sessions", updatedSessions);

    // Function to sort sessions based on updated_at (most recent first)
    const sortSessions = (sessions) => {
      const sortedList = sessions.sort(
        (a, b) =>
          convertToTimestamp(b.updated_at) - convertToTimestamp(a.updated_at)
      );
      console.log("Sorted", sortedList);
      return sortedList;
    };

    const sortedSessions = sortSessions(updatedSessions);
    console.log("Sorted Sessions", sortedSessions);

    dispatch(loadSessions(sortedSessions));
  } catch (error) {
    console.error(error);
    dispatch(setError(error.message));
  }
};

// export const loadSessionById = (userInfo, sessionID) => async (dispatch) => {
//   try {
//     const response = await getSessionById(userInfo.userID, sessionID);
//     const decodedSession = await processTokens(response);

//     // Function to format date
//     const formatDate = (date) => {
//       if (!isNaN(date)) {
//         const dateObj = new Date(date);
//         const datePart = new Intl.DateTimeFormat("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         }).format(dateObj);

//         const timePart = new Intl.DateTimeFormat("en-US", {
//           hour: "numeric",
//           minute: "numeric",
//           second: "numeric",
//           hour12: true,
//         }).format(dateObj);

//         return `${datePart}, at ${timePart}`;
//       }
//       return date;
//     };

//     // Update dates in decoded session
//     const updatedSession = {
//       ...decodedSession,
//       updated_at: formatDate(decodedSession.updated_at),
//       created_at: formatDate(decodedSession.created_at),
//     };

//     dispatch(setCurrentSession(updatedSession));
//     return updatedSession;
//   } catch (error) {
//     console.error(error);
//     dispatch(setError(error.message));
//     return null;
//   }
// };

const getSessionPaths = (currentCompany, userID, sessionID) => {
  const basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userID}`;
  const sessionPath = `${basePath}/${sessionID}`;

  return {
    basePath,
    sessionPath,
    configPath: `${sessionPath}/session_config.json`,
    codePath: `${sessionPath}/code.txt`,
    outputJsonPath: `${sessionPath}/output.json`,
    outputCsvPath: `${sessionPath}/output.csv`,
    errorPath: `${sessionPath}/error.txt`,
  };
};


export const addSession =
  (
    userInfo,
    currentCompany,
    sessionInfo,
    code,
    providedSessionID = null,
    instanceID,
    isBYOR,
    isSave,
    datasetName,
    attached_experiment_args
  ) =>

  async (dispatch) => {
    // Generate sessionID if not provided
    const sessionID = providedSessionID || uuidv4();
    console.log("addSession with ID:", sessionID);
    dispatch(updateCurrentSessionID(sessionID));
    const paths = getSessionPaths(currentCompany, userInfo.userID, sessionID);

    try {
      // Prepare session configuration
      let session_config;
  
      if (isBYOR) {
        // Create BYOR specific configuration when isSave is true
        session_config = {
          sessionID: sessionID,
          userID: userInfo.userID,
          company_s3_prefix: `${currentCompany.companyName}_${currentCompany.companyID}`,
          process_type: "BYOR",
          dir_path: "byor_base_datasets",

          ...(isSave && {
            base_dataset_name: datasetName || "base_dataset_name_given_by_user",
          }),
          save_base_dataset: isSave,
          attached_experiment_args: attached_experiment_args,
          stop_instance: isSave,
          instanceId: instanceID || null,

          language: sessionInfo.language || "python",
          datasets: sessionInfo.datasets.datasets || sessionInfo.datasets || [],
          model_datasets: sessionInfo.datasets.model_datasets || sessionInfo.model_datasets ||  [],
          status: sessionInfo.status || "initializing",
          created_at: sessionInfo.created_at || Date.now(),
          updated_at: Date.now(),
        };
      } else {
        // Use original configuration when isSave is false
        session_config = {
          sessionID: sessionID,
          userID: userInfo.userID,
          company_s3_prefix: `${currentCompany.companyName}_${currentCompany.companyID}`,
          process_type: "custom",
          stop_instance: false,
          instanceId: instanceID || null,
          language: sessionInfo.language || "python",
          datasets: sessionInfo.datasets || [],
          status: "initializing",
          created_at: sessionInfo.created_at || Date.now(),
          updated_at: Date.now(),
        };
      }

      // Upload session config to S3
      await uploadJsonToS3(paths.configPath, session_config);

      // Initialize empty code file
      await uploadTxtToS3(paths.codePath, code);

      dispatch(setCurrentSession(session_config));

      // Prepare payload with updated structure - use session_config directly since it contains all necessary fields
      const sessionPayload = 
         {
            sessionID: sessionID,
            userID: userInfo.userID,
            companyName: currentCompany.companyName,
            companyID: currentCompany.companyID,
            status: !sessionInfo.status
              ? "Initializing..."
              : sessionInfo.status,
            created_at: sessionInfo.created_at || Date.now(),
            updated_at: Date.now(),
          };

      console.log("sessionPayload", sessionPayload);

      const response = AddSession(
        sessionPayload,
        currentCompany,
        userInfo.userID
      )
        .then(async (response) => {
          console.log("response of impact pipeline adding: ", response);
          return response;
        })
        .catch((error) => {
          console.log("error: ", error);
        });
      return response;

      // Return success and sessionID
      return { success: true, sessionID };
    } catch (error) {
      console.error("Error creating session:", error);
      dispatch(setError(error.message));
      return { success: false, message: error.message };
    }
  };

export const terminateSession =
  (currentCompany, userInfo, payload) => async (dispatch) => {
    TerminateSession(payload, currentCompany, userInfo.userID)
      .then(async (response) => {
        console.log("Session deleted successfully", response);

        return response;
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };
