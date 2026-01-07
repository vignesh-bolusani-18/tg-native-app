"use client";

import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  Chip,
  DialogActions,
  Stack,
  Alert,
  CircularProgress,
  Switch,
} from "@mui/material";
import { ReactComponent as CloudUploadIcon } from "../assets/Icons/cloud-upload-dark.svg";
import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import Papa from "papaparse";
import PreviewTable from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/PreviewData";
import useExperiment from "../hooks/useExperiment";
import CustomButton from "./CustomButton";
import { generateMetadata } from "../utils/generateMetadata";
import { useDispatch } from "react-redux";
import useAuth from "../hooks/useAuth";
import {
  fetchJsonFromS3,
  uploadCSVToS3,
  uploadTxtToS3,
  fetchTxtFromS3,
  fetchCSVFromS3,
  uploadJsonToS3,
} from "../utils/s3Utils";

import useDataset from "../hooks/useDataset";
import useDashboard from "../hooks/useDashboard";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextInput from "./CustomInputControls/CustomTextInput";
import { useEffect, useState, useRef } from "react";
import useConfig from "../hooks/useConfig";

import Editor, { loader } from "@monaco-editor/react";

import useSession from "../hooks/useSession";
import { loadSessionsList } from "../redux/actions/sessionActions";
import BYORDialog from "./BYOR";
import { store } from "../redux/store";
import { clearQueryEngineCache } from "../utils/queryEngine";

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

export default function CustomQueryBYORDialog({
  open,
  handleClose,
  initialDatasets = [],
  initialModelDatasets = [],
  initialCode = "",
  initialFileName = "",
  isEditMode = false,
}) {
  const fileInputRef = useRef(null);
  const { currentDatasetTag, renderDatasets, uploadMetadataToS3 } =
    useExperiment();
  const { configState, addBaseDataset, baseDatasets } = useConfig();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [tags, setTags] = useState([currentDatasetTag]);
  const [code, setCode] = useState(initialCode);
  const [datasets, setDatasets] = useState(initialDatasets);
  const [modelDatasets, setModelDatasets] = useState(initialModelDatasets); // New state for model datasets
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
  const [dataSource, setDataSource] = useState("both");
  const [datasetName, setDatasetName] = useState(initialFileName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const [isSavingDialogOpen, setIsSavingDialogOpen] = useState(false);
  const [byorDialogOpen, setBYORDialogOpen] = useState(false);
  const [addedFilenames, setAddedFilenames] = useState(new Set());
  const [updateSameFile, setUpdateSameFile] = useState(true);

  // Function to generate the dataset part of the code
  function generateDatasetString(datasets, modelDatasets) {
    // Generate code for regular datasets
    const regularDatasetsCode = datasets
      .map((dataset, index) => `df${index + 1} = __get_object__('${dataset}')`)
      .join("\n");

    // Generate code for model datasets
    const modelDatasetsCode = modelDatasets
      .map(
        (dataset, index) =>
          `model_df${index + 1} = __get_model_object__('${dataset}')`
      )
      .join("\n");

    // Combine both types of code
    return (
      regularDatasetsCode +
      (regularDatasetsCode && modelDatasetsCode ? "\n\n" : "") +
      modelDatasetsCode
    );
  }

  // Static part of the code (instructions)
  const staticCodePart = `
# You can create a custom dataset here using any dataset present in the data library
# The dataset is loaded in as a pandas dataframe, where pandas alias is 'pd'
# To import any table within the environment just write df = __get_object__('dataset_name')
# For model outputs, use model_df = __get_model_object__('dataset_name')
# Apply transformations across multiple datasets that are imported and finally save the data in a variable 'df_final'
`;

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

  useEffect(() => {
    if ((datasets.length > 0 || modelDatasets.length > 0) && !isEditMode) {
      const dynamicPart = generateDatasetString(datasets, modelDatasets);

      const extraCode =
        code.split(staticCodePart)[1] !== undefined
          ? code.split(staticCodePart)[1]
          : "";

      const nonChangableCode = `${staticCodePart}${extraCode}`;

      setCode(`${dynamicPart}\n${nonChangableCode}`);
    }
  }, [datasets, modelDatasets]);

  const parseCodeForDatasets = (code) => {
    console.log("Parsing code:", code);

    // Corrected regex patterns - using \( and \) to match literal parentheses
    const regularDatasetPattern = /__get_object__\(['"`]([^'"`]+)['"`]\)/g;
    const modelDatasetPattern = /__get_model_object__\(['"`]([^'"`]+)['"`]\)/g;

    const foundRegularDatasets = [];
    const foundModelDatasets = [];

    // Extract regular datasets
    let match;
    while ((match = regularDatasetPattern.exec(code)) !== null) {
      const datasetName = match[1];
      console.log("Found regular dataset:", datasetName);
      // Check if dataset name is not already in the array
      if (!foundRegularDatasets.includes(datasetName)) {
        foundRegularDatasets.push(datasetName);
      } else {
        console.log("Regular dataset already exists, skipping:", datasetName);
      }
    }

    // Reset regex lastIndex for model datasets
    modelDatasetPattern.lastIndex = 0;

    // Extract model datasets
    while ((match = modelDatasetPattern.exec(code)) !== null) {
      const datasetName = match[1];
      console.log("Found model dataset:", datasetName);
      // Check if dataset name is not already in the array
      if (!foundModelDatasets.includes(datasetName)) {
        foundModelDatasets.push(datasetName);
      } else {
        console.log("Model dataset already exists, skipping:", datasetName);
      }
    }

    console.log("foundRegularDatasets:", foundRegularDatasets);
    console.log("foundModelDatasets:", foundModelDatasets);

    return { foundRegularDatasets, foundModelDatasets };
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const { addDataset, loadDatasetsList, datasets_name_list, datasets_list } =
    useDataset();
  const { experimentBasePath } = useDashboard();
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

  const dataTypes = {
    "Forecasting Pivot": `scenario_planning/K_best/forecast/forecast_data_pivot`,
    "Forecasting Pivot Disaggregated": `scenario_planning/K_best/forecast/forecast_disaggregated`,
    "DOI Details": `scenario_planning/K_best/inventory_plan/soh_data`,
    "Elasticity Detailed View": `scenario_planning/K_best/scenario_plan/scenario_planner_data`, // p
    "Metrics Deep dive": `scenario_planning/K_best/post_model_demand_pattern/post_model_metrics`, // dimension: "feature", value: cd
    Forecast: `scenario_planning/K_best/forecast/forecast_data`,
    "Forecast Pivot": `scenario_planning/K_best/forecast/forecast_data_pivot`,
    "Prediction Interval": `scenario_planning/K_best/forecast/forecast_prediction_interval`,
    "Disaggregated Forecast": `scenario_planning/K_best/forecast/forecast_disaggregated`,
    "Forecast Distribution": `scenario_planning/K_best/forecast/forecast_distribution`,
    "DOI Detailed View": `scenario_planning/K_best/inventory_plan/soh_data`,
    "Inventory Reorder Plan": `scenario_planning/K_best/inventory_plan/reorder_table`,
    "Stock Transfer": `scenario_planning/K_best/inventory_plan/stock_transfer_df`,
    "Potential Stock Wastage": `scenario_planning/K_best/inventory_plan/potential_stock_wastage`,
    "Raw Inventory": `etl_data/202110/inv_data`,
    "SOH Pivot": `scenario_planning/K_best/forecast/soh_data_pivot`,
    "Bill Of Materials": `scenario_planning/K_best/inventory_plan/bill_of_material_inv_details`,
    "Bill Of Materials Time Forecast": `scenario_planning/K_best/inventory_plan/bom_forecast`,
    "Price Optimization": `scenario_planning/K_best/scenario_plan/scenario_planner_data`,
    "Driver Elasticity": `stacking/future/K_best/coeffs`,
    "Model Metrics": `stacking/future/K_best/metric`,
    "Final DA Data": `scenario_planning/K_best/forecast/final_da_data_backup`,

    "Feature Importance": `feature_score/feature_score`,
    "Future Granular Metrics": `scenario_planning/K_best/forecast/future_data_metrics`,
    "Future Time Metrics": `scenario_planning/K_best/forecast/time_metrics`,
    "Demand Alignment Report": `scenario_planning/K_best/forecast/demand_alignment_report`,
    "Supply Plan": `scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods`,
    "Production Plan": `scenario_planning/K_best/post_model_demand_pattern/production_plan_forecast`,
    "Forecast Value Pivot": `scenario_planning/K_best/forecast/forecast_data_value_pivot`,
    "Overall Metrics": `stacking/future/K_best/metric`,
    "Xgboost Metrics": `training/cluster/future/Xgboost/metrics`,
    "LGBM Metrics": `training/cluster/future/Lgbm/metrics`,
    "Random Forest Metrics": `training/cluster/future/RandomForest/metrics`,
    "Xgblinear Metrics": `training/cluster/future/Xgblinear/metrics`,
    "MLP Metrics": `training/cluster/future/MLP/metrics`,
    "LSTM Metrics": `training/cluster/future/LSTM/metrics`,
    "GRU Metrics": `training/cluster/future/GRU/metrics`,

  };

  const mergedDataTypes = {
    ...dataTypes,
    ...Object.fromEntries(
      baseDatasets.map((name) => [
        `${name}`,
        `byor_base_datasets/${name}/output`,
      ])
    ),
  };

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
        ["custom"], // Default tag since we removed the tags field
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
            // Escape quotes and wrap in quotes if the value contains commas
            let value = previewData[header][i];
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
        datasetTag: "custom",
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
    setModelDatasets([]);
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
    !selectedFile || (datasets.length === 0 && modelDatasets.length === 0);

  // Fetch output data when session is completed
  const fetchOutputData = async (sessionId) => {
    try {
      const basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/output.csv`;

      console.log("Fetching output data from:", basePath);
      const outputData = await fetchCSVFromS3(
        basePath,
        "",
        true,
        userInfo.userID,
        false,
        false
      );

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
    // Set nextPreview to true to prevent stopping polling prematurely
    setNextPreview(true);
    // This function is now just a wrapper for handleRun
    // since the preview functionality is handled by the run process
    handleRun();
  };

  function replaceEncodedSlashes(encodedStr) {
    return encodedStr.replace(/&#x2F;/g, "/");
  }

  const handleRemoveDataset = (datasetName) => {
    // Check if the dataset is in regular datasets or model datasets
    if (datasets.includes(datasetName)) {
      // Remove the dataset from the local state
      setDatasets((prevDatasets) =>
        prevDatasets.filter((name) => name !== datasetName)
      );

      // Update session datasets
      const transformedDatasets = datasets
        .filter((name) => name !== datasetName)
        .map((dataset) => {
          const datasetObj = datasets_list.find(
            (d) => d.datasetName === dataset
          );
          return {
            dataset_name: dataset,
            api_req_args_path: `accounts/${currentCompany.companyName}_${
              currentCompany.companyID
            }/customer_data/data_library/api_request_args/${
              datasetObj?.datasetName ||
              datasetObj?.dataConnectionName ||
              dataset
            }.json`,
            dataset_path: datasetObj?.datasetPath
              ? replaceEncodedSlashes(datasetObj.datasetPath)
              : "",
            last_modified: datasetObj?.updatedAt || new Date().toISOString(),
            is_loaded: false,
          };
        });

      // Add the transformed datasets to currentDatasets using addSessionDataset
      addSessionDataset({ datasets: transformedDatasets, model_datasets: [] });
    } else if (modelDatasets.includes(datasetName)) {
      // Remove the dataset from the model datasets
      setModelDatasets((prevDatasets) =>
        prevDatasets.filter((name) => name !== datasetName)
      );

      // Update session model datasets
      const transformedModelDatasets = modelDatasets
        .filter((name) => name !== datasetName)
        .map((dataset) => ({
          dataset_name: dataset,
          relative_dataset_path: `${mergedDataTypes[dataset]}.csv`,
        }));

      // Get current regular datasets
      const transformedRegularDatasets = datasets.map((dataset) => {
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

      // Add both types of datasets to the session
      addSessionDataset({
        datasets: transformedRegularDatasets,
        model_datasets: transformedModelDatasets,
      });
    }
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

      // Don't reset nextPreview here - we'll reset it when we detect a new status

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

      const attached_experiment_args = {
        module_name: configState.common.module_name,
        job_id: configState.common.job_id,

        config_path: `s3://tg-app-bucket-ap-south-1/accounts/${configState.common.user_name}/customer_data/configs/${configState.common.module_name}/${configState.common.job_id}/config.json`,
        run_type: "None",
      };

      // Call addSession with the required parameters plus isSave and name
      const response = await addSession(
        userInfo,
        currentCompany,
        currentSession,
        code,
        currentSession?.sessionID,
        currentSessionData?.instanceID,
        true,
        false,
        "",
        attached_experiment_args
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

  const handleSave = async () => {
    try {
      setNextPreview(true);
      setIsSavingDialogOpen(true);
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

      const attached_experiment_args = {
        module_name: configState.common.module_name,
        job_id: configState.common.job_id,
        config_path: `s3://tg-app-bucket-ap-south-1/accounts/${configState.common.user_name}/customer_data/configs/${configState.common.module_name}/${configState.common.job_id}/config.json`,
        run_type: "None",
      };

      // Call addSession with the required parameters plus isSave and name
      const response = await addSession(
        userInfo,
        currentCompany,
        currentSession,
        code,
        currentSession?.sessionID,
        currentSessionData?.instanceID,
        true,
        true,
        datasetName,
        attached_experiment_args
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

  const handleContinue = () => {
    setIsSavingDialogOpen(false);
    setSaveCompleted(false);
    setBYORDialogOpen(true);
  };

  const handleDone = () => {
    setIsSavingDialogOpen(false);
    setSaveCompleted(false);
    handleClose();
  };

  // Add this effect to handle session completion for the saving dialog

  useEffect(() => {
    const runSaveProcess = async () => {
      if (
        isSavingDialogOpen &&
        currentSession.status === "Completed" &&
        !nextPreview
      ) {
        setSaveCompleted(true);
        addBaseDataset(datasetName);
        const updatedBaseDatasets =
          store.getState().config?.config?.deleted_base_datasets;
        await uploadJsonToS3(
          `${experimentBasePath}/custom_report/deletedBaseDatasets.json`,
          updatedBaseDatasets
        );
        await clearQueryEngineCache(configState.common.job_id);
      }
    };

    runSaveProcess();
  }, [currentSession.status, isSavingDialogOpen]);

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
      (currentSession.status === "Failed" ||
        currentSession.status === "Completed") &&
      !nextPreview
    ) {
      setIsPreviewButtonDisabled(false);
      setIsPreviewLoading(false);
    } else if (currentSession.status === "Terminated" && !nextPreview) {
      setIsPreviewButtonDisabled(false);
      setIsPreviewLoading(false);
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

        if (errorData && !nextPreview) {
          // Instead of setting selectedFile, set errorMessage
          setErrorMessage(errorData.substring(0, 1000));
          console.log("Error data fetched successfully");
        } else {
          console.error("No error data returned");
          setErrorMessage(
            "An error occurred, but no error details were found."
          );
        }
      } else if (status === "Completed" && !nextPreview) {
        // Fetch output.csv for completed sessions
        basePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/sessions/${userInfo.userID}/${sessionId}/output.csv`;

        const outputData = await fetchCSVFromS3(
          basePath,
          "",
          true,
          userInfo.userID,
          false,
          false
        );

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

  const handleToggleChange = (event) => {
    const isChecked = event.target.checked;
    setUpdateSameFile(isChecked);

    // Reset datasetName if creating new file, otherwise set to initial name
    setDatasetName(isChecked ? initialFileName : "");
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
        } else if (["Initiated"].includes(sessionData.status)) {
          // Reset nextPreview when we detect the session has actually started processing
          setNextPreview(false);
        }
      }
    }
  }, [sessionsList, currentSession.status]);

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

  const Label = styled("label")({
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#475467",
  });

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
        {/* Existing dialog content */}
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

        {/* Add dataset name field at the top */}
        <Box
          sx={{
            padding: "24px 32px 12px 32px",
            borderBottom: "1px solid #EAECF0",
          }}
        >
          {/* Dataset name and toggle in same row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: "24px",
              marginBottom: "16px",
            }}
          >
            {/* Dataset Name Field */}
            <Box sx={{ flex: 1 }}>
              <CustomTextInput
                required
                showLabel
                label={"Dataset Name"}
                placeholder="Enter dataset name"
                name="datasetName"
                value={datasetName}
                onChange={(e) => {
                  const { value } = e.target;
                  setDatasetName(value);
                }}
                disabled={isEditMode ? updateSameFile : false}
              />
            </Box>

            {/* Toggle section - only show when not in edit mode */}
            {isEditMode && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minWidth: "150px",

                  border: "1px solid #E4E7EC",
                  borderRadius: "8px",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: `2px solid ${
                      updateSameFile ? "#7F56D9" : "#D0D5DD"
                    }`,
                    backgroundColor: updateSameFile ? "#F4F3FF" : "#FFFFFF",
                    transition: "all 0.2s ease-in-out",
                    minHeight: "40px",
                    width: "100%",
                    "&:hover": {
                      borderColor: updateSameFile ? "#7F56D9" : "#98A2B3",
                      backgroundColor: updateSameFile ? "#F4F3FF" : "#F9FAFB",
                    },
                  }}
                  onClick={() =>
                    handleToggleChange({ target: { checked: !updateSameFile } })
                  }
                >
                  <Box
                    sx={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "3px",
                      border: `2px solid ${
                        updateSameFile ? "#7F56D9" : "#D0D5DD"
                      }`,
                      backgroundColor: updateSameFile ? "#7F56D9" : "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease-in-out",
                      flexShrink: 0,
                    }}
                  >
                    {updateSameFile && (
                      <Box
                        sx={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#FFFFFF",
                          borderRadius: "1px",
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "11px",
                      fontWeight: 500,
                      lineHeight: "14px",
                      color: updateSameFile ? "#7F56D9" : "#344054",
                      transition: "color 0.2s ease-in-out",
                    }}
                  >
                    Update Existing
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Alert below the fields - only show when not in edit mode */}
          {isEditMode && (
            <Alert
              severity="warning"
              sx={{
                backgroundColor: "#FEF3C7",
                border: "1px solid #F59E0B",
                borderRadius: "8px",
                fontSize: "12px",
                "& .MuiAlert-message": {
                  fontFamily: "Inter",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#92400E",
                },
                "& .MuiAlert-icon": {
                  color: "#F59E0B",
                  fontSize: "18px",
                },
              }}
            >
              Updating Existing base Dataset can also affect your BYOR reports
              created using this dataset.
            </Alert>
          )}
        </Box>

        {/* Rest of the existing dialog content */}
        <Box
          sx={{
            padding: "24px 32px 48px 32px",
            gap: "24px",
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ gap: "24px", mb: 2 }}>
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
                Data Source
              </Typography>
            </Box>
            {dataSource === "both" && (
              <Box sx={{ gap: "24px", mb: 2 }}>
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
                  Import Model Datasets
                </Typography>
                <CustomAutocomplete
                  isMultiSelect
                  showLabel={false}
                  values={Object.keys(mergedDataTypes)}
                  selectedValues={modelDatasets}
                  setSelectedValues={(selectedNames) => {
                    setModelDatasets(selectedNames);

                    // Transform model datasets
                    const transformedModelDatasets = selectedNames.map(
                      (datasetName) => ({
                        dataset_name: datasetName,
                        relative_dataset_path: `${mergedDataTypes[datasetName]}.csv`,
                      })
                    );

                    // Get current regular datasets
                    const transformedRegularDatasets = datasets.map(
                      (dataset) => {
                        const datasetObj = datasets_list.find(
                          (d) => d.datasetName === dataset
                        );
                        return {
                          dataset_name: dataset,
                          api_req_args_path: `accounts/${
                            currentCompany.companyName
                          }_${
                            currentCompany.companyID
                          }/customer_data/data_library/api_request_args/${
                            datasetObj?.datasetName ||
                            datasetObj?.dataConnectionName ||
                            dataset
                          }.json`,
                          dataset_path: datasetObj?.datasetPath
                            ? replaceEncodedSlashes(datasetObj.datasetPath)
                            : "",
                          last_modified:
                            datasetObj?.updatedAt || new Date().toISOString(),
                          is_loaded: false,
                        };
                      }
                    );

                    // Add both types of datasets to the session
                    addSessionDataset({
                      datasets: transformedRegularDatasets,
                      model_datasets: transformedModelDatasets,
                    });
                  }}
                  onTagClose={handleRemoveDataset}
                  placeholder="Import Model Datasets..."
                />
              </Box>
            )}

            {(dataSource === "data-library" || dataSource === "both") && (
              <Box sx={{ gap: "24px" }}>
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
                  Import Data Library Datasets
                </Typography>
                <CustomAutocomplete
                  isMultiSelect
                  showLabel={false}
                  values={datasets_name_list}
                  selectedValues={datasets}
                  setSelectedValues={(selectedNames) => {
                    setDatasets(selectedNames);

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
                        dataset_path: replaceEncodedSlashes(
                          dataset.datasetPath
                        ),
                        last_modified: dataset.updatedAt,
                        is_loaded: false,
                      })
                    );

                    // Get current model datasets
                    const transformedModelDatasets = modelDatasets.map(
                      (datasetName) => ({
                        dataset_name: datasetName,
                        relative_dataset_path: `${mergedDataTypes[datasetName]}.csv`,
                      })
                    );

                    // Add both types of datasets to the session
                    addSessionDataset({
                      datasets: transformedDatasets,
                      model_datasets: transformedModelDatasets,
                    });
                  }}
                  onTagClose={handleRemoveDataset}
                  placeholder="Import Data Library Datasets..."
                />
              </Box>
            )}

            {
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
                        label={
                          nextPreview ? "Initiating..." : currentSession.status
                        }
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
                        (datasets.length === 0 && modelDatasets.length === 0) ||
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
            }

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
              {1 === 1 ? (
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
                  ></Stack>
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
            onClick={handleSave}
            title={"Save"}
            disabled={!datasetName.trim()}
            loadable
          />
        </DialogActions>
      </BootstrapDialog>

      {/* Saving Dialog */}
      <BootstrapDialog
        open={isSavingDialogOpen}
        aria-labelledby="saving-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid #EAECF0",
            padding: "24px",
            minWidth: "400px",
          },
        }}
      >
        <DialogTitle id="saving-dialog-title" sx={{ textAlign: "center" }}>
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsSavingDialogOpen(false);
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
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 500,
              lineHeight: "28px",
              color: "#101828",
            }}
          >
            {saveCompleted ? "File Saved Successfully" : "Saving File"}
          </Typography>
        </DialogTitle>
        <Box sx={{ p: 3 }}>
          {!saveCompleted ? (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <CircularProgress />
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textAlign: "center",
                  color: "#475467",
                  mt: 2,
                }}
              >
                {datasetName}
              </Typography>
              {currentSession.status && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CheckIcon sx={{ color: "#027A48", fontSize: "48px" }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textAlign: "center",
                  color: "#475467",
                  mt: 2,
                }}
              >
                {datasetName}
              </Typography>
            </Box>
          )}
        </Box>
        {saveCompleted && (
          <DialogActions sx={{ justifyContent: "center", pt: 2, gap: 2 }}>
            <CustomButton onClick={handleDone} title={"Done"} outlined />
            <CustomButton onClick={handleContinue} title={"Customize"} />
          </DialogActions>
        )}
      </BootstrapDialog>

      {byorDialogOpen && (
        <BYORDialog
          open={byorDialogOpen}
          handleClose={() => setBYORDialogOpen(false)}
          data={previewData}
          title={datasetName || ""}
          fileName={datasetName || ""}
          filePath={`${experimentBasePath}/byor_base_datasets/${datasetName}/output.csv`}
        />
      )}
    </Box>
  );
}
