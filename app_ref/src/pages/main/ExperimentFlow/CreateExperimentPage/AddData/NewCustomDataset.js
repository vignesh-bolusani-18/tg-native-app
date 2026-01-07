"use client";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";

import StopCircleIcon from "@mui/icons-material/StopCircle";
import {
  Box,
  Chip,
  DialogActions,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ReactComponent as CloudUploadIcon } from "../../../../../assets/Icons/cloud-upload-dark.svg";
import CustomAutocomplete from "./../../../../../components/CustomInputControls/CustomAutoComplete";
import DeleteIcon from "@mui/icons-material/Delete";
import Papa from "papaparse";
import PreviewTable from "./PreviewData";
import useExperiment from "../../../../../hooks/useExperiment";
import CustomButton from "./../../../../../components/CustomButton";
import { generateMetadata } from "../../../../../utils/generateMetadata";
import { useDispatch } from "react-redux";
import useAuth from "../../../../../hooks/useAuth";
import {
  fetchCSVFromS3,
  fetchJsonFromS3,
  uploadCSVToS3,
  uploadTxtToS3,
  fetchTxtFromS3,
  fetchCSVData,
} from "../../../../../utils/s3Utils";
import useDataset from "../../../../../hooks/useDataset";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput";
import { useEffect, useState, useRef } from "react";

import { Editor } from "@monaco-editor/react";

import useSession from "../../../../../hooks/useSession";
import { loadSessionsList } from "../../../../../redux/actions/sessionActions";
import { AllDatasetTags } from "../../../../../utils/allDatasetTags";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

export default function NewCustomDataset({ open, handleClose }) {
  const fileInputRef = useRef(null);
  const { currentDatasetTag, renderDatasets, uploadMetadataToS3 } =
    useExperiment();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [tags, setTags] = useState([currentDatasetTag]);
  const [code, setCode] = useState("");
  const [datasets, setDatasets] = useState([]);
  const [templateString, setTemplateString] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [isEditingName, setIsEditingName] = useState(true);
  const [newFileName, setNewFileName] = useState("");
  const [previewResult, setPreviewResult] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [currentSessionData, setCurrentSessionData] = useState(null);
  const [isPreviewButtonDisabled, setIsPreviewButtonDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [nextPreview, setNextPreview] = useState(false);
  const reduxDispatch = useDispatch();

  // Function to generate the dataset part of the code
  function generateDatasetString(datasets) {
    return datasets
      .map((dataset, index) => `df${index + 1} = __get_object__('${dataset}')`)
      .join("\n");
  }

  // Static part of the code (instructions)
  const staticCodePart = `
# You can create a custom dataset here using any dataset present in the data library
# The dataset is loaded in as a pandas dataframe, where pandas alias is 'pd'
# To import any table within the environment just write df = __get_object__('dataset_name')
# Apply transformations across multiple datasets that are imported and finally save the data in a variable 'df_final'
`;

  useEffect(() => {
    if (datasets.length > 0) {
      const dynamicPart = generateDatasetString(datasets);
      const extraCode =
        code.split(staticCodePart)[1] !== undefined
          ? code.split(staticCodePart)[1]
          : "";
      const nonChangableCode = `${staticCodePart}${extraCode}`;
      setCode(`${dynamicPart}\n${nonChangableCode}`);
    }
  }, [datasets]);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const { addDataset, loadDatasetsList, datasets_name_list, datasets_list } =
    useDataset();
  const {
    currentDatasets,
    addSessionDataset,
    clearSession,
    currentSession,
    addSession,
    updateLastModified,
    updateSessionStatus,
    sessionsList,
    terminateSession,
  } = useSession();

  const { userInfo, currentCompany } = useAuth();

  // Function to start polling with better error handling
  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);
    console.log("Starting polling for session updates...");

    // Start the interval and save the interval ID
    const intervalId = setInterval(() => {
      try {
        reduxDispatch(loadSessionsList(userInfo));
      } catch (error) {
        console.error("Error during polling:", error);
      }
    }, 5000); // Poll every 5 seconds

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

  const [allDatasetTags, setallDatasetTags] = useState([]);

  useEffect(() => {
    console.log("currentTag", currentDatasetTag);
    if (currentDatasetTag !== "none") {
      setTags([currentDatasetTag]);
      const combinedDatasets = Object.values(renderDatasets).reduce((acc, datasets) => {
        return [...acc, ...datasets];
      }, []);
      setallDatasetTags(combinedDatasets.map((dataset) => dataset.tag));
    } else {
      setTags([]);
      setallDatasetTags(AllDatasetTags);
    }
  }, [currentDatasetTag, renderDatasets]);

  useEffect(() => {
    if (selectedFile) {
      setNewFileName(selectedFile.name);
    }
  }, [selectedFile]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Helper function to convert File object to Blob for S3 upload
  const fileToBlob = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result], { type: "text/csv" });
        resolve(blob);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleConfirm = async () => {
    try {
      // Log the values to debug
      console.log("Preview Data:", previewData);
      console.log("Selected File:", selectedFile);

  

      // Check if previewData and selectedFile are defined
      if (!previewData || !selectedFile) {
        alert("Preview data or selected file is missing. Please try again.");
        return;
      }

      const fileName = newFileName.replace(".csv", "");

      const metadata = await generateMetadata(
        previewData,
        tags,
        fileName,
        "Custom"
      );
      console.log(metadata);
      const custom_data_args_path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/custom_data_args/${fileName}.txt`;
      const custom_data_args = code;
      const metaDataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${fileName}.json`;
      const uploadCSVPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/custom_data_args/samples/${fileName}.csv`;

      await uploadMetadataToS3({ metaData: metadata, path: metaDataPath });

      // Convert File to Blob if it's not already a Blob
      // This fixes the [object Object] issue when uploading to S3
      const isFile = selectedFile instanceof File;

      if (selectedFile instanceof File) {
        // This is a direct file upload
        await uploadCSVToS3(uploadCSVPath, selectedFile);
      } else {
        // This is data fetched from S3 - we need to properly convert it to CSV format
        const headers = Object.keys(previewData);
        const rows = [];

        // Add headers as first row
        rows.push(headers.join(","));

        // Add data rows
        const rowCount = previewData[headers[0]].length;
        for (let i = 0; i < rowCount; i++) {
          const row = headers.map((header) => {
            // Get the value and normalize null/undefined to empty string
            let value = previewData[header][i];
            value = value == null ? "" : String(value); // handles null and undefined

            // Escape quotes and wrap in quotes if the value contains commas or quotes
            if (value.includes(",") || value.includes('"')) {
              value = `"${value.replace(/"/g, '""')}"`;
            }

            return value;
          });
          rows.push(row.join(","));
        }

        // Create CSV content
        const csvContent = rows.join("\n");

        // Create file object
        const blob = new Blob([csvContent], { type: "text/csv" });
        const file = new File([blob], `${fileName}.csv`, { type: "text/csv" });

        await uploadCSVToS3(uploadCSVPath, file);
      }

      await uploadTxtToS3(custom_data_args_path, custom_data_args);

      const datasetInfo = {
        datasetName: fileName,
        datasetTag: tags[0],
        metaDataPath: metaDataPath,
        sourceName: "Custom",
        dataConnectionName: "",
      };

      const response = await addDataset(userInfo, currentCompany, datasetInfo);
      if (response) {
        handleClose();
        resetForm();
      } else {
        console.log("Failed to add dataset:", response);
        alert("Failed to add dataset. Please try again.");
      }
    } catch (error) {
      console.error("Error confirming dataset:", error);
      alert("An error occurred while confirming the dataset.");
    }
  };

  const resetForm = () => {
    setDatasets([]);
    setCode("");
    setSelectedFile(null);
    setPreviewData(null);
    setTags([currentDatasetTag]);
    setNewFileName("");
    setIsEditingName(false);
    setDragOver(false);
    setIsPreviewLoading(false);
    setIsPreviewButtonDisabled(false);
    setErrorMessage(null);
    stopPolling();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      parseCSV(file);
      setSelectedFile(file);
      setErrorMessage(null);
    } else {
      alert("Please select a CSV file.");
      setSelectedFile(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      parseCSV(file);
      setSelectedFile(file);
      setErrorMessage(null);
    } else {
      alert("Please select a CSV file.");
      setSelectedFile(null);
    }
    setDragOver(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setNewFileName("");
    setErrorMessage(null);
  };

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (event) => {
    setNewFileName(event.target.value);
  };

  const handleConfirmNameChange = () => {
    setIsEditingName(false);
  };

  function getPreviewData(data, limit = 10) {
    // Extract headings from the first array
    const headings = data[0];

    // Initialize an object to store the transformed data
    const result = {};

    // Initialize arrays for each heading in the result object
    headings.forEach((heading) => {
      result[heading] = [];
    });

    // Iterate over the rest of the data
    data.slice(1).forEach((row) => {
      // Skip rows that are empty or do not match the number of headings
      if (
        row.length === headings.length &&
        row.every((value) => value !== "")
      ) {
        row.forEach((value, index) => {
          // Add value to the respective heading's array, but only if the length is less than the limit
          if (result[headings[index]].length < limit) {
            result[headings[index]].push(value);
          }
        });
      }
    });

    return result;
  }

  const parseCSV = (file) => {
    Papa.parse(file, {
      dynamicTyping: false,
      columns: true,
      skip_empty_lines: true,
      transform: (value) => {
        // Force every value to remain a string
        return value.toString();
      },
      complete: (result) => {
        console.log("Parsed CSV Data: ", result.data);
        const previewCSVData = getPreviewData(result.data);
        console.log("Transformed CSV Data: ", previewCSVData);
        setPreviewData(previewCSVData);
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
        alert("Error parsing CSV file. Please check the file format.");
      },
    });
  };

  const confirmDisabled =
    !selectedFile || tags.length === 0 || datasets.length === 0;

  // Fetch output data when session is completed
  const fetchOutputData = async (sessionId) => {
    try {
      const basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/output.csv`;

      console.log("Fetching output data from:", basePath);
      const outputData = await fetchCSVData({
        filePath: basePath,
        filterData: null,
        paginationData: null,
        sortingData: null,
      });

      if (outputData) {
        setSelectedFile(outputData);
        setPreviewData(outputData);
        console.log("Output data fetched successfully");
      } else {
        console.error("No output data returned");
      }
    } catch (error) {
      console.error("Error fetching output data:", error);
    }
  };

  const handlePreviewCode = () => {
    // This function is now just a wrapper for handleRun
    // since the preview functionality is handled by the run process
    handleRun();
  };

  function replaceEncodedSlashes(encodedStr) {
    return encodedStr.replace(/&#x2F;/g, "/");
  }

  const handleRemoveDataset = (datasetName) => {
    // Remove the dataset from the local state
    setDatasets((prevDatasets) =>
      prevDatasets.filter((name) => name !== datasetName)
    );

    // Update session datasets
    const transformedDatasets = datasets
      .filter((name) => name !== datasetName)
      .map((dataset) => {
        const datasetObj = datasets_list.find((d) => d.datasetName === dataset);
        return {
          dataset_name: dataset,
          api_req_args_path: `accounts/${currentCompany.companyName}_${
            currentCompany.companyID
          }/customer_data/data_library/api_request_args/${
            datasetObj?.datasetName || datasetObj?.dataConnectionName || dataset
          }.json`,
          dataset_path: datasetObj?.datasetPath
            ? replaceEncodedSlashes(datasetObj.datasetPath)
            : "",
          last_modified: datasetObj?.updatedAt || new Date().toISOString(),
          is_loaded: false,
        };
      });

    // Add the transformed datasets to currentDatasets using addSessionDataset
    addSessionDataset(transformedDatasets);
  };

  // Update the handleRun function to properly start polling and handle errors
  const handleRun = async () => {
    try {
      setIsPreviewLoading(true);
      setIsPreviewButtonDisabled(true);
      updateSessionStatus("Initializing...");
      setErrorMessage(null);
      setPreviewData(null);

      // Start polling for updates
      startPolling();

      // Prepare session information
      const fetchPromises = datasets.map((fileName) => {
        const metaDataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${fileName}.json`;
        return fetchJsonFromS3(metaDataPath);
      });

      // Fetch all JSON files from S3
      const fetchedData = await Promise.all(fetchPromises);

      // Update last modified dates if available
      if (currentSession.datasets && currentSession.datasets.length > 0) {
        fetchedData.forEach((data, index) => {
          if (data && data.last_modified_date) {
            updateLastModified(data.last_modified_date, index);
          }
        });
      }

      // Call addSession with the required parameters
      const response = await addSession(
        userInfo,
        currentCompany,
        currentSession,
        code,
        currentSession?.sessionID,
        currentSessionData?.instanceID
      );

      if (response.success) {
        console.log("Session created successfully:", response);
        // We'll keep polling until the session completes
      } else {
        console.error("Failed to create session:", response.message);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Add cleanup for polling when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Add this effect to stop polling when dialog closes
  useEffect(() => {
    if (!open && isPolling) {
      stopPolling();
    }
  }, [open, isPolling]);

  useEffect(() => {
    if (
      currentSession.status === "Failed" ||
      currentSession.status === "Completed"
    ) {
      stopPolling();

      setIsPreviewButtonDisabled(false);
    } else if (currentSession.status === "Terminated") {
      setIsPreviewButtonDisabled(false);
    }
  }, [currentSession]);

  const handleTerminate = () => {
    if (currentSession.sessionID) {
      startPolling();
      const payload = {
        sessionID: currentSession.sessionID,
      };
      terminateSession(currentCompany, userInfo, payload);
    }
  };

  const fetchSessionData = async (sessionId, status) => {
    try {
      let basePath;

      if (status === "Failed") {
        // Fetch error.txt instead of output.csv when status is Failed
        basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/error.txt`;

        // Fetch the error text file
        const errorData = await fetchTxtFromS3(
          basePath,
          "",
          true,
          userInfo.userID,
          true
        );

        if (errorData) {
          // Instead of setting selectedFile, set errorMessage
          setErrorMessage(errorData.substring(0, 1000));
          console.log("Error data fetched successfully");
        } else {
          console.error("No error data returned");
          setErrorMessage(
            "An error occurred, but no error details were found."
          );
        }
      } else if (status === "Completed") {
        // Fetch output.csv for completed sessions
        basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/output.csv`;

        const outputData = await fetchCSVData({
          filePath: basePath,
          filterData: null,
          paginationData: null,
          sortingData: null,
        });

        if (outputData) {
          setSelectedFile(outputData);
          setPreviewData(outputData);
          setNewFileName("output.csv");
          console.log("Output data fetched successfully");
        } else {
          console.error("No output data returned");
        }
      }
    } catch (error) {
      console.error(
        `Error fetching ${status === "Failed" ? "error" : "output"} data:`,
        error
      );
    }
  };

  // Fixed useEffect for monitoring session status
  useEffect(() => {
    if (currentSession?.sessionID) {
      // Find the current session data from sessionsList
      const sessionData = sessionsList.find(
        (session) => session.sessionID === currentSession.sessionID
      );

      if (sessionData) {
        console.log("Current session status:", sessionData.status);
        setCurrentSessionData(sessionData);
        // Update the session status
        updateSessionStatus(sessionData.status);

        // Check if we need to stop polling
        if (["Completed", "Failed"].includes(sessionData.status)) {
          if (!nextPreview) {
            stopPolling();
            setIsPreviewLoading(false);
            setIsPreviewButtonDisabled(false);

            fetchSessionData(sessionData.sessionID, sessionData.status);
          }
        } else if ([["Initiated"].includes(sessionData.status)]) {
          setNextPreview(false);
        }
      }
    }
  }, [sessionsList]);

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
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
      case "Executing":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
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

  return (
    <Box>
      <BootstrapDialog
        onClose={() => {
          stopPolling(); // Make sure to stop polling when dialog closes
          handleClose();
        }}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            padding: "20px 26px 19px 26px",
            borderBottom: "1px solid #EAECF0",
          }}
          id="customized-dialog-title"
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 500,
              lineHeight: "28px",
              color: "#101828",
              textAlign: "left",
            }}
          >
            Add Custom Dataset
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => {
              stopPolling(); // Stop polling when closing dialog
              handleClose();
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#667085",
              padding: "8px",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box
          sx={{
            padding: "24px 32px 48px 32px",
            gap: "24px",
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ gap: "24px" }}>
              <CustomAutocomplete
                label={"Dataset Tags"}
                isMultiSelect
                showLabel
                values={allDatasetTags}
                selectedValues={tags}
                setSelectedValues={setTags}
                placeholder="Select Tags.."
              />
            </Box>
            <Box sx={{ gap: "24px" }}>
              <CustomAutocomplete
                label={"Import Datasets"}
                isMultiSelect
                showLabel
                values={datasets_name_list} // Pass dataset names from currentDatasets
                selectedValues={datasets}
                setSelectedValues={(selectedNames) => {
                  // Find the selected datasets
                  const selectedDatasets = selectedNames
                    .map((datasetName) =>
                      datasets_list.find(
                        (dataset) => dataset.datasetName === datasetName
                      )
                    )
                    .filter(Boolean);

                  // Transform the selected datasets into the desired structure
                  const transformedDatasets = selectedDatasets.map(
                    (dataset) => ({
                      dataset_name: dataset.datasetName,
                      api_req_args_path: `accounts/${
                        currentCompany.companyName
                      }_${
                        currentCompany.companyID
                      }/customer_data/data_library/api_request_args/${
                        dataset.datasetName || dataset.dataConnectionName
                      }.json`,
                      dataset_path: replaceEncodedSlashes(dataset.datasetPath),
                      last_modified: dataset.updatedAt,
                      is_loaded: false,
                    })
                  );

                  // Add the transformed datasets to currentDatasets using addSessionDataset
                  addSessionDataset(transformedDatasets);

                  // Update the local state for rendering
                  setDatasets(selectedNames);
                }}
                onTagClose={handleRemoveDataset}
                placeholder="Import Datasets.."
              />
            </Box>

            {datasets.length > 0 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
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
                  <Box sx={{ display: "flex", gap: "12px" }}>
                    {currentSession.status && (
                      <Chip
                        label={currentSession.status}
                        size="small"
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          fontWeight: 500,
                          lineHeight: "14px",
                          ...getStatusStyles(currentSession.status),
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: "8px",
                    border: "1px solid #EAECF0",
                    padding: "2px",
                    marginBottom: "20px",
                  }}
                >
                  <Editor
                    height="250px"
                    loading={false}
                    language="python"
                    theme="light"
                    value={code}
                    onChange={(value) => handleCodeChange(value)}
                    options={{
                      padding: {
                        top: 18,
                        bottom: 18,
                        left: 18,
                        right: 18,
                      },
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      zIndex: 10,
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <CustomButton
                      variant="outlined"
                      onClick={handlePreviewCode}
                      title={isPreviewLoading ? "Processing..." : "Preview"}
                      disabled={
                        isPreviewButtonDisabled ||
                        datasets.length === 0 ||
                        !code.trim() ||
                        isPreviewLoading
                      }
                      sx={{
                        padding: "6px 12px", // Smaller padding
                        fontSize: "0.875rem", // Smaller font
                        minWidth: "80px", // Smaller width
                      }}
                    />
                    <CustomButton
                      variant="contained"
                      onClick={handleTerminate}
                      title={"Terminate"}
                      disabled={
                        !currentSession?.sessionID ||
                        [
                          "Completed",
                          "Failed",
                          "Terminated",
                          "Initializing...",
                          "Initializing",
                        ].includes(currentSession.status)
                      }
                      sx={{
                        padding: "6px 12px", // Smaller padding
                        fontSize: "0.875rem", // Smaller font
                        minWidth: "80px", // Smaller width
                        backgroundColor: "#d32f2f", // Red background for terminate
                        "&:hover": {
                          backgroundColor: "#b71c1c", // Darker red on hover
                        },
                        color: "white", // White text
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Error message display */}
            {errorMessage && (
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
            )}

            <Box>
              <Typography
                sx={{
                  color: "#344054",
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: "14px",
                  lineHeight: "20px",
                  marginBottom: "6px",
                }}
              >
                Sample Data
              </Typography>
              {selectedFile ? (
                <Box
                  sx={{
                    border: "1px solid #EAECF0",
                    borderRadius: "8px",
                    padding: "16px 24px 16px 24px",
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                  }}
                >
                  <Stack
                    direction={"row"}
                    sx={{
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack direction={"column"}>
                      {!isEditingName ? (
                        <Stack direction={"row"} gap={1} alignItems={"center"}>
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 500,
                              fontSize: "16px",
                              lineHeight: "20px",
                              color: "#101828",
                            }}
                          >
                            {`${
                              newFileName === "" || !newFileName
                                ? selectedFile.name
                                : newFileName
                            }`}
                          </Typography>
                          <IconButton
                            aria-label="edit"
                            onClick={handleEditClick}
                            sx={{
                              color: "#1570EF",
                            }}
                          >
                            <EditIcon fontSize={"small"} />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction={"row"} gap={1} alignItems={"center"}>
                          <CustomTextInput
                            value={newFileName}
                            onChange={handleNameChange}
                          />
                          <IconButton
                            aria-label="check"
                            onClick={handleConfirmNameChange}
                            sx={{
                              color: "#1570EF",
                            }}
                          >
                            <CheckIcon fontSize={"small"} />
                          </IconButton>
                        </Stack>
                      )}
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "12px",
                          lineHeight: "20px",
                          color: "#10182870",
                        }}
                      >
                        {selectedFile.size
                          ? ` ${(selectedFile.size / 1024).toFixed(2)} KB`
                          : ""}
                      </Typography>
                    </Stack>
                    <IconButton
                      aria-label="remove"
                      onClick={handleRemoveFile}
                      sx={{
                        color: "#FF0000",
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                  {isPreviewLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "200px", // Adjust height as needed
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        marginTop: "16px",
                      }}
                    >
                      <CircularProgress /> {/* MUI's loading spinner */}
                      <Typography sx={{ ml: 2 }}>Processing data...</Typography>
                    </Box>
                  ) : (
                    previewData && <PreviewTable previewData={previewData} />
                  )}
                </Box>
              ) : (
                <Box
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  sx={{
                    border: "1px solid #EAECF0",
                    borderRadius: "8px",
                    padding: "16px 24px 16px 24px",
                    backgroundColor: dragOver ? "#F2F4F7" : "#FFFFFF",
                  }}
                >
                  <Stack
                    spacing={0.5}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <IconButton onClick={handleUploadClick}>
                      <Box
                        sx={{
                          border: "6px solid #F9FAFB",
                          backgroundColor: "#F2F4F7",
                          borderRadius: "28px",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "40px",
                          width: "40px",
                        }}
                      >
                        <CloudUploadIcon />
                      </Box>
                      <VisuallyHiddenInput
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </IconButton>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        textAlign: "center",
                      }}
                    >
                      You can upload multiple files at a time
                    </Typography>
                    <Stack direction={"row"} spacing={0.3}>
                      <Box
                        onClick={handleUploadClick}
                        sx={{ cursor: "pointer" }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontWeight: 600,
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: "#0C66E4",
                          }}
                        >
                          Click to upload
                        </Typography>
                        <VisuallyHiddenInput
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "#475467",
                        }}
                      >
                        or drag and drop
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        textAlign: "center",
                      }}
                    >
                      CSV files only
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
        <DialogActions>
          <CustomButton
            onClick={() => {
              stopPolling(); // Stop polling when canceling
              handleClose();
            }}
            title={"Cancel"}
            outlined
          />
          <CustomButton
            onClick={handleConfirm}
            title={"Confirm"}
            disabled={confirmDisabled}
            loadable
          />
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
}
