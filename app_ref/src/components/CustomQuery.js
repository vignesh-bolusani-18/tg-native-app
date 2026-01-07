"use client";

import { useState, useEffect } from "react";
import { Box, Stack, Typography, Alert, Chip } from "@mui/material";
import { Editor } from "@monaco-editor/react";
import { useDispatch } from "react-redux";
import { loadSessionsList } from "../redux/actions/sessionActions";
import { fetchCSVData, fetchCSVFromS3, fetchTxtFromS3 } from "../utils/s3Utils";
import PreviewTable from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/PreviewData";
import CustomButton from "./CustomButton";
import useSession from "../hooks/useSession"; // Import useSession hook

const CustomQueryEditor = ({
  detail,
  setDetail,
  row,
  userInfo,
  currentCompany,
  datasets_list,
  onClose,
  onSave,
  readOnly = false,
}) => {
  const [previewResult, setPreviewResult] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPreviewButtonDisabled, setIsPreviewButtonDisabled] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("");
  const [currentSessionData, setCurrentSessionData] = useState(null);
  const [previewTimestamp, setPreviewTimestamp] = useState(Date.now())
  const [nextPreview, setNextPreview] = useState(false);
  const reduxDispatch = useDispatch();

  // Import session hooks and functions
  const {
    addSession,
    currentSession,
    updateSessionStatus,
    addSessionDataset,
    clearSession,
    sessionsList,
    terminateSession,
  } = useSession();
  function replaceEncodedSlashes(encodedStr) {
    return encodedStr.replace(/&#x2F;/g, "/");
  }
  // Function to start polling with better error handling
  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);
    console.log("Starting polling for session updates...");

    // Immediately fetch the session list once before starting the interval
    try {
      reduxDispatch(loadSessionsList(userInfo));
    } catch (error) {
      console.error("Error during initial polling:", error);
    }

    // Start the interval and save the interval ID
    const intervalId = setInterval(() => {
      try {
        reduxDispatch(loadSessionsList(userInfo));
      } catch (error) {
        console.error("Error during polling:", error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(intervalId);
  };

  // Function to stop polling with proper cleanup
  const stopPolling = () => {
    console.log("Stopping polling...");
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsPolling(false);
  };

  // Handle terminate session
  const handleTerminate = () => {
    if (currentSession?.sessionID) {
      
      const payload = {
        sessionID: currentSession.sessionID,
      };
      terminateSession(currentCompany, userInfo, payload);
    }
  };

  // Extract dataset names from the code
  const extractDatasetsFromCode = (code) => {
    // Look for patterns like __get_object__('dataset_name') or similar dataset references
    const regex = /__get_object__$$['"]([^'"]+)['"]$$/g;
    const matches = [];
    let match;

    while ((match = regex.exec(code)) !== null) {
      matches.push(match[1]); // Extract the dataset name from the regex match
    }

    // If no matches found, try to find variable assignments that might indicate datasets
    if (matches.length === 0) {
      // Look for df = or df1 = patterns that might indicate dataset assignments
      const assignmentRegex = /\b(df\d*)\s*=\s*.*?['"]([^'"]+)['"]/g;
      while ((match = assignmentRegex.exec(code)) !== null) {
        if (match[2] && !match[2].includes("/")) {
          // Avoid paths, just get dataset names
          matches.push(match[2]);
        }
      }
    }

    return matches;
  };

  // Handle preview for custom query
  const handlePreviewCustomQuery = async () => {
    try {
      setIsPreviewLoading(true);
      setIsPreviewButtonDisabled(true);
      setNextPreview(true);
      setErrorMessage(null);
      setPreviewResult(null); // Clear previous results
      
      // Extract dataset names from the code
      const datasetNames = extractDatasetsFromCode(detail);

      if (datasetNames.length === 0) {
        // If no datasets found in code, use the current dataset as fallback
        datasetNames.push(row.name);
      }

      console.log("Extracted dataset names:", datasetNames);

      // Clear any existing session data
      clearSession();

      // Start polling for updates
      startPolling();

      // Update session status
      updateSessionStatus("Initializing...");
      setSessionStatus("Initializing...");

      // Create dataset objects for all referenced datasets
      const datasetObjects = datasetNames.map((datasetName) => {
        // Find the dataset in the datasets_list if possible
        const datasetObj = datasets_list.find(
          (d) => d.datasetName === datasetName
        );

        return {
          dataset_name: datasetName,
          api_req_args_path: `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/${datasetName}.json`,
          dataset_path: datasetObj?.datasetPath
            ? replaceEncodedSlashes(datasetObj.datasetPath)
            : "",
          last_modified: datasetObj?.updatedAt || new Date().toISOString(),
          is_loaded: false,
        };
      });

      // Add the datasets to the session
      
      await addSessionDataset(datasetObjects);

      // Call addSession with the required parameters
      try {
        const response = await addSession(
          userInfo,
          currentCompany,
          currentSession, // Ensure we're passing the datasets here
          detail, // Using the custom query code
          currentSession?.sessionID,
          currentSessionData?.instanceID
        );

        console.log("Preview session created:", response);
        // We'll keep polling until the session completes
      } catch (error) {
        console.error("Error in addSession:", error);
        // Don't show error to user, just log it
        // Continue polling to see if the session was created anyway
      }
    } catch (error) {
      console.error("Error in preview process:", error);
      // Don't show error to user, just log it
    }
  };


  const handleOutputData = async ( status) => {
    try {
      const sessionId = currentSession.sessionID
      let basePath;
      // Use a cache-busting parameter with a random value
      setPreviewResult(null)
      const cacheBuster = `?t=${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
     
        basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/output.csv`
        
        // Clear previous data before fetching new
        console.log("basePath " + currentSession)
        
        const outputData = await fetchCSVData({
          filePath: basePath,
          filterData: null,
          paginationData: null,
          sortingData: null,
        })
  
        if (outputData) {
          setPreviewResult(outputData);
        }
      }
     catch (error) {
      console.error(`Error fetching data:`, error);
    }
  };
  // Fetch session data when status changes
  const fetchSessionData = async (sessionId, status) => {
    try {
      let basePath;
      // Use a cache-busting parameter with a random value
      const cacheBuster = `?t=${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
      if (status === "Failed") {
        basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/error.txt`;
        // ... rest of your error handling code ...
      } else if (status === "Completed") {
        basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/output.csv`
        
        // Clear previous data before fetching new
        
        console.log("output data called")
        const outputData = await fetchCSVFromS3(basePath, "", true, userInfo.userID, false, false)
  
        if (outputData) {
          setPreviewResult(outputData);
        }
      }
    } catch (error) {
      console.error(`Error fetching data:`, error);
    }
  };

  // Monitor session status changes
  useEffect(() => {
    if (sessionsList && sessionsList.length > 0 && currentSession?.sessionID) {
      // Find the current session data from sessionsList
      const sessionData = sessionsList.find(
        (session) => session.sessionID === currentSession.sessionID
      );

      if (sessionData) {
        console.log("Current session status:", sessionData.status);
        setCurrentSessionData(sessionData);
        // Update the session status
        updateSessionStatus(sessionData.status);
        setSessionStatus(sessionData.status);

        // Check if we need to stop polling
        if (["Completed", "Failed"].includes(sessionData.status)) {

          if(!nextPreview){
          stopPolling()
          setIsPreviewLoading(false);
          setIsPreviewButtonDisabled(false);

          fetchSessionData(sessionData.sessionID, sessionData.status);
          }
        }else if([["Initiated"].includes(sessionData.status)]){
          setNextPreview(false)
        }
      }
    }
  }, [sessionsList]);

  // Add cleanup for polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Terminate any active session when unmounting
      if (currentSession?.sessionID) {
        const payload = {
          sessionID: currentSession.sessionID,
        };
        terminateSession(currentCompany, userInfo, payload);
        clearSession();
      }
    };
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
      case "Running":
        return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
      case "Failed":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Terminated":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Initiating...":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
      case "Initializing...":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
      case "Executing":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
      case "Initiated":
        return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started, stable
      case "Terminating":
        return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
      case "On Hold":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
      case "Queued":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
      case "Retrying...":
        return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying in progress
      case "Executed":
        return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue: Intermediate status
      case "Launching...":
        return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue: Launching in progress
      case "DataProcessCompleted":
        return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green: Intermediate completion
      default:
        return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Neutral/unknown
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(detail);
      handleTerminate()
      setEditMode(false);
    }
  };

  const handleClose = () => {
    // Terminate any active session when closing
    if (currentSession?.sessionID) {
      const payload = {
        sessionID: currentSession.sessionID,
      };
      terminateSession(currentCompany, userInfo, payload);
      clearSession();
    }
    stopPolling()
    if (onClose) {
      onClose();
    }
  };

  return (
    <Stack width="90vw" padding={"0.5rem"}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        padding={"0.5rem"}
      >
        <Typography
          sx={{
            color: "#344054",
            fontFamily: "Inter",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          Custom Query
        </Typography>
        <Box sx={{ display: "flex", gap: "8px" }}>
          {sessionStatus && (
            <Chip
              label={sessionStatus}
              size="small"
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "14px",
                ...getStatusStyles(sessionStatus),
              }}
            />
          )}
          <CustomButton
            title={"Preview"}
            outlined
            disabled={isPreviewButtonDisabled || !detail.trim()}
            onClick={handlePreviewCustomQuery}
          />
          <CustomButton
            title={"Terminate"}
            outlined
            disabled={
              !currentSession?.sessionID ||
              [
                "Completed",
                "Failed",
                "Terminated",
                "Initializing...",
                "Initializing",
              ].includes(sessionStatus)
            }
            onClick={handleTerminate}
            sx={{
              backgroundColor: "#d32f2f",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
              color: "white",
            }}
          />
          {!readOnly && (
            <CustomButton
              title={editMode ? "Save" : "Edit"}
              loadable={editMode}
              onClick={editMode ? handleSave : () => setEditMode(true)}
            />
          )}
          <CustomButton title={"Close"} outlined onClick={handleClose} />
          <CustomButton
            title={"Refresh"}
            outlined
           
            onClick={handleOutputData}
          />
        </Box>
      </Stack>
      <Box
        sx={{
          borderRadius: "0px",
          border: "1px solid #EAECF0",
          padding: "2px",
        }}
      >
        <Editor
          height="250px"
          loading={false}
          language="python"
          theme="light"
          value={detail}
          onChange={(value) => setDetail(value)}
          options={{
            readOnly: readOnly || !editMode,
            padding: {
              top: 18,
              bottom: 18,
              left: 18,
              right: 18,
            },
            borderRadius: "8px",
          }}
          style={{
            width: "80%",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            marginBottom: "20px",
          }}
        />
      </Box>

      {/* Error message display */}
      {errorMessage && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert
            severity="error"
            sx={{
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FCA5A5",
              fontFamily: "Inter",
              "& .MuiAlert-icon": {
                color: "#B91C1C",
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              Error in Execution
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {errorMessage}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Preview results */}
      {previewResult && (
        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{
              color: "#344054",
              fontFamily: "Inter",
              fontWeight: "500",
              fontSize: "14px",
              lineHeight: "20px",
              marginBottom: "8px",
            }}
          >
            Preview Results
          </Typography>
          <PreviewTable previewData={previewResult} />
        </Box>
      )}
    </Stack>
  );
};

export default CustomQueryEditor;
