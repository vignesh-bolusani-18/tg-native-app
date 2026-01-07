import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Stack,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { STYLES } from "../../constants";
import { useWorkflowWebSocket } from "../../../../hooks/useWorkflowWebSocket";
import { useVibe } from "../../../../hooks/useVibe";
import Papa from "papaparse";
import PreviewTable from "../../../../pages/main/ExperimentFlow/CreateExperimentPage/AddData/PreviewData";
import useExperiment from "../../../../hooks/useExperiment";
import useAuth from "../../../../hooks/useAuth";
import { uploadCSVToS3 } from "../../../../utils/s3Utils";
import useDataset from "../../../../hooks/useDataset";
import { generateMetadata as generateMetadataOld } from "../../../../utils/generateMetadata";
import { generateMetadata as generateMetadataNew } from "../../../../utils/generateMetadataConfigurable";
import { AllDatasetTags } from "../../../../utils/allDatasetTags";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomTextInput from "../../../../components/CustomInputControls/CustomTextInput";
import { SUCCESS, WARNING } from "../../../../theme/custmizations/colors";
import { GridCheckCircleIcon } from "@mui/x-data-grid";
import SampleDataLibrary from "./SampleDataLibrary";
import { fetchSampleDataAsFile } from "../../../../utils/sampleDataUtils";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import useModule from "../../../../hooks/useModule";
import NDADisclosure from "../../../../components/NDADisclosure";
const DataUploadSection = ({ uploadData, messageId }) => {
  console.log("UploadData", uploadData);
  const currentDataTag = Object.keys(uploadData.data)[0];

  console.log("currentDataTag", currentDataTag);
  console.log("DataUploadSection Rendered");
  const { sendQuery } = useWorkflowWebSocket();
  const {
    setProcessingStepText,
    setIsWaitingForAI,
    editMessage,
    currentConversation,
    setDataUploaded,
    creditScore,
  } = useVibe();
  const { ui_config } = useModule();

  const dataUploaded = currentConversation.dataUploaded;
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [tags, setTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [allDatasetTags, setAllDatasetTags] = useState([]);
  const [selectedSampleDataset, setSelectedSampleDataset] = useState(null);

  // State for collapsible section - collapsed if data uploaded, expanded if not
  const [isExpanded, setIsExpanded] = useState(!dataUploaded);
  const { currentDatasetTag, renderDatasets, uploadMetadataToS3 } =
    useExperiment();
  const { addDataset } = useDataset();
  const { userInfo, currentCompany } = useAuth();

  // Check if data is already uploaded
  const isDataUploaded = uploadData?.next_step?.user === "uploaded_data";
  const generateMetadata = (previewData, tags, fileName) => {
    return oldFlowModules.includes(uploadData.determined_module)
      ? generateMetadataOld(previewData, tags, fileName, "File Upload", "", {})
      : generateMetadataNew(
          previewData,
          tags,
          fileName,
          "File Upload",
          "",
          JSON.parse(JSON.stringify(ui_config.datasets.dataset_info))
        );
  };

  // Toggle expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Update expansion state when dataUploaded changes
  useEffect(() => {
    setIsExpanded(!dataUploaded);
  }, [dataUploaded]);

  // Initialize dataset tags
  useEffect(() => {
    if (currentDatasetTag !== "none") {
      setTags([currentDatasetTag]);
      const combinedDatasets = Object.values(renderDatasets).reduce(
        (acc, datasets) => {
          return [...acc, ...datasets];
        },
        []
      );
      setAllDatasetTags(combinedDatasets.map((dataset) => dataset.tag));
    } else {
      setTags(uploadData.mandatory_data_tags);
      setAllDatasetTags(AllDatasetTags);
    }
  }, [currentDatasetTag, renderDatasets, uploadData.mandatory_data_tags]);

  useEffect(() => {
    if (selectedFile) {
      setNewFileName(selectedFile.name);
    }
  }, [selectedFile]);

  // Function to get preview data
  function getPreviewData(data, limit = 10) {
    const headings = data[0];
    const result = {};

    headings.forEach((heading) => {
      result[heading] = [];
    });

    data.slice(1).forEach((row) => {
      if (
        row.length === headings.length &&
        row.every((value) => value !== "")
      ) {
        row.forEach((value, index) => {
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
        setError("Error parsing CSV file");
      },
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    const maxSizeInBytes = 100 * 1024 * 1024; // 100MB

    if (file) {
      if (file.type === "text/csv") {
        if (
          !currentCompany.unlimited_data_upload &&
          file.size > maxSizeInBytes
        ) {
          setError(
            "File size exceeds limit. Please contact sales for unlimited upload."
          );
          setSelectedFile(null);
          event.target.value = "";
        } else {
          parseCSV(file);
          setSelectedFile(file);
          setError(null);
        }
      } else {
        setError("Please select a CSV file.");
        setSelectedFile(null);
        event.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setNewFileName("");
    setSelectedSampleDataset(null);
    setError(null);
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

  const handleUpload = async () => {
    if (!selectedFile || tags.length === 0) {
      setError("Please select a file and at least one tag");
      return;
    }

    setIsUploading(true);
    setError(null);
    setProcessingStepText("Uploading data...");
    setIsWaitingForAI(true);

    try {
      const fileName = newFileName.replace(".csv", "");
      const metadata = await generateMetadata(previewData, tags, fileName);

      const metaDataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${fileName}.json`;
      const uploadCSVPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/uploads/${fileName}.csv`;

      await uploadMetadataToS3({ metaData: metadata, path: metaDataPath });
      await uploadCSVToS3(uploadCSVPath, selectedFile);

      const datasetInfo = {
        datasetName: fileName,
        datasetTag: tags[0],
        metaDataPath: metaDataPath,
        sourceName: "File Upload",
        dataConnectionName: "",
      };

      const response = await addDataset(userInfo, currentCompany, datasetInfo);

      if (response) {
        setUploadSuccess(true);
        setProcessingStepText("Data uploaded successfully");
        console.log("Data added successfully");
        // Update the message's langgraphState to mark it as uploaded
        if (messageId) {
          editMessage(messageId, {
            langgraphState: {
              ...uploadData,
              workflow_status: {
                ...uploadData.workflow_status,
                data_loaded: true,
              },
              next_step: { user: "uploaded_data", ai: "tags_generator" },
              data: {
                ...uploadData.data,
                [currentDataTag]: {
                  ...uploadData.data[currentDataTag],
                  sample_data_path: uploadCSVPath,
                  metadata_path: metaDataPath,
                  dataset_info: datasetInfo,
                  ...(selectedSampleDataset && {
                    sample_data_key: selectedSampleDataset.id,
                  }),
                },
              },
            },
          });
          console.log("Message edited successfully");
        }

        // Send the upload confirmation to the workflow
        const uploadState = {
          ...uploadData,
          workflow_status: { ...uploadData.workflow_status, data_loaded: true },
          next_step: { user: "", ai: "tags_generator" },
          data: {
            ...uploadData.data,
            [currentDataTag]: {
              ...uploadData.data[currentDataTag],
              sample_data_path: uploadCSVPath,
              metadata_path: metaDataPath,
              dataset_info: datasetInfo,
              ...(selectedSampleDataset && {
                sample_data_key: selectedSampleDataset.id,
              }),
            },
          },
        };
        setIsWaitingForAI(true);
        setProcessingStepText("Fetching Sample data...");
        setDataUploaded(true);
        sendQuery({query: "", updated_state: uploadState});
        console.log("Upload state sent successfully");

        // Reset form
        setSelectedFile(null);
        setPreviewData(null);
        setTags([currentDatasetTag]);
        setNewFileName("");
        setSelectedSampleDataset(null);
        setIsEditingName(false);
      } else {
        throw new Error("Failed to add dataset");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
      setProcessingStepText("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();

    // Check if it's a sample dataset being dropped
    const sampleDatasetData = event.dataTransfer.getData(
      "application/sample-dataset"
    );
    if (sampleDatasetData) {
      try {
        const dataset = JSON.parse(sampleDatasetData);
        setProcessingStepText(`Loading ${dataset.name} sample data...`);
        const file = await fetchSampleDataAsFile(
          dataset.path,
          `${dataset.name}.csv`
        );
        parseCSV(file);
        setSelectedFile(file);
        setSelectedSampleDataset(dataset);
        setError(null);
        setProcessingStepText("");
      } catch (err) {
        console.error("Error loading sample data:", err);
        const dataset = JSON.parse(sampleDatasetData);
        setError(
          `Failed to load ${dataset.name} sample data. Please try again.`
        );
        setProcessingStepText("");
      }
      return;
    }

    // Handle regular file drop
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
      if (!currentCompany.unlimited_data_upload && file.size > maxSizeInBytes) {
        setError(
          "File size exceeds limit. Please contact sales for unlimited upload."
        );
      } else {
        parseCSV(file);
        setSelectedFile(file);
        setError(null);
      }
    } else {
      setError("Please drop a valid CSV file");
    }
  };

  const handleSampleDataSelect = (file, dataset) => {
    parseCSV(file);
    setSelectedFile(file);
    setSelectedSampleDataset(dataset);
    setError(null);
  };

  return (
    <Box
      sx={{
        mt: 3,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        borderLeft: `4px solid ${SUCCESS[500]}`,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          backgroundColor: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor:
              "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
          },
        }}
        onClick={toggleExpansion}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isDataUploaded ? (
            <GridCheckCircleIcon sx={{ color: SUCCESS[500], fontSize: 20 }} />
          ) : (
            <CloudUploadIcon sx={{ color: WARNING[500], fontSize: 20 }} />
          )}
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#374151",
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            {isDataUploaded
              ? "Data Uploaded Successfully"
              : "Data Upload Required"}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            color: STYLES.COLORS.SUCCESS,
            "&:hover": {
              backgroundColor: "rgba(16, 185, 129, 0.1)",
            },
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 3 }}>
          {isDataUploaded ? (
            // Show uploaded data metadata
            <Box
              sx={{
                p: 3,
                backgroundColor: "#f0fdf4",
                border: `1px solid ${SUCCESS[500]}`,
                borderRadius: "8px",
                mb: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: SUCCESS[500],
                    fontFamily: STYLES.FONTS.PRIMARY,
                    mb: 1,
                  }}
                >
                  Dataset Information:
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#374151",
                      fontFamily: STYLES.FONTS.PRIMARY,
                    }}
                  >
                    <strong>Name:</strong>{" "}
                    {uploadData?.data?.[currentDataTag]?.dataset_info
                      ?.datasetName || "N/A"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#374151",
                      fontFamily: STYLES.FONTS.PRIMARY,
                    }}
                  >
                    <strong>Tag:</strong>{" "}
                    {uploadData?.data?.[currentDataTag]?.dataset_info
                      ?.datasetTag || "N/A"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#374151",
                      fontFamily: STYLES.FONTS.PRIMARY,
                    }}
                  >
                    <strong>Source:</strong>{" "}
                    {uploadData?.data?.[currentDataTag]?.dataset_info
                      ?.sourceName || "File Upload"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ) : (
            // Show upload interface with improved layout
            <Box>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  mb: 3,
                  lineHeight: 1.6,
                  fontFamily: STYLES.FONTS.PRIMARY,
                }}
              >
                Please upload a CSV file containing the required data to
                continue with the analysis. You can either upload your own file
                or use our sample datasets below.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {uploadSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  File uploaded successfully!
                </Alert>
              )}

              {/* Main Upload Section */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: selectedFile ? "1fr" : "1fr 1fr",
                    lg: selectedFile ? "2fr 1fr" : "1fr 1fr",
                    xl: selectedFile ? "3fr 2fr" : "1fr 1fr",
                  },
                  gap: { xs: 2, md: 3 },
                  mb: 3,
                }}
              >
                {/* Left Column - Upload Area */}
                <Box sx={{ width: "100%", minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      mb: 2,
                      fontFamily: STYLES.FONTS.PRIMARY,
                    }}
                  >
                    Upload Your Data
                  </Typography>

                  <Stack spacing={3}>
                    {/* Dataset Tags Selection */}
                    <Box>
                      <CustomAutocomplete
                        label="Dataset Tags"
                        isMultiSelect
                        showLabel
                        values={allDatasetTags}
                        selectedValues={tags}
                        setSelectedValues={setTags}
                        placeholder="Select Tags.."
                      />
                    </Box>

                    {selectedFile ? (
                      <Box
                        sx={{
                          border: "1px solid #EAECF0",
                          borderRadius: "8px",
                          padding: { xs: "16px", md: "20px" },
                          width: "100%",
                          maxWidth: { xs: "100%", md: "100%", lg: "100%" },
                          backgroundColor: "#FfFFFf",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                          overflow: "hidden",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          sx={{
                            justifyContent: "space-between",
                            mb: 2,
                            gap: { xs: 1, sm: 0 },
                          }}
                        >
                          <Stack
                            direction="column"
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            {!isEditingName ? (
                              <Stack
                                direction="row"
                                gap={1}
                                alignItems="center"
                                sx={{ flexWrap: "wrap" }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: { xs: "14px", sm: "16px" },
                                    lineHeight: "20px",
                                    color: "#101828",
                                    wordBreak: "break-word",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: {
                                      xs: "200px",
                                      sm: "300px",
                                      md: "400px",
                                    },
                                  }}
                                >
                                  {newFileName === "" || !newFileName
                                    ? selectedFile.name
                                    : newFileName}
                                </Typography>
                                <IconButton
                                  aria-label="edit"
                                  onClick={handleEditClick}
                                  sx={{
                                    color: "#1570EF",
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            ) : (
                              <Stack
                                direction="row"
                                gap={1}
                                alignItems="center"
                              >
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
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            )}
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: { xs: "11px", sm: "12px" },
                                lineHeight: "20px",
                                color: "#10182870",
                              }}
                            >
                              {`${(selectedFile.size / 1024).toFixed(2)} KB`}
                            </Typography>
                          </Stack>
                          <IconButton
                            aria-label="remove"
                            onClick={handleRemoveFile}
                            sx={{
                              color: "#FF0000",
                              alignSelf: { xs: "flex-start", sm: "center" },
                              mt: { xs: 1, sm: 0 },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>

                        {/* Preview Table */}
                        {previewData && (
                          <Box
                            sx={{
                              width: "100%",
                              maxWidth: {
                                xs: "100%",
                                sm: "100%",
                                md: "100%",
                                lg: "100%",
                                xl: "100%",
                              },
                              overflow: "auto",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              maxHeight: {
                                xs: "300px",
                                sm: "400px",
                                md: "500px",
                              },
                              // Ensure the container doesn't grow beyond its parent
                              boxSizing: "border-box",
                              // Force the table to respect container bounds
                              "& > *": {
                                maxWidth: "100%",
                                overflow: "hidden",
                              },
                              "&::-webkit-scrollbar": {
                                height: "8px",
                                width: "8px",
                              },
                              "&::-webkit-scrollbar-track": {
                                backgroundColor: "#f1f5f9",
                                borderRadius: "4px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#cbd5e1",
                                borderRadius: "4px",
                                "&:hover": {
                                  backgroundColor: "#94a3b8",
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                overflow: "auto",
                                maxWidth: "100%",
                              }}
                            >
                              <PreviewTable previewData={previewData} />
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        sx={{
                          border: "2px dashed #D1D5DB",
                          borderRadius: "12px",
                          padding: "40px 20px",
                          backgroundColor: "#FAFAFA",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: STYLES.COLORS.PRIMARY,
                            backgroundColor: "#F8FAFC",
                          },
                        }}
                        onClick={() =>
                          document.getElementById("file-input").click()
                        }
                      >
                        <input
                          id="file-input"
                          type="file"
                          accept=".csv"
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                        />

                        <Stack
                          spacing={1.5}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Box
                            sx={{
                              border: "4px solid #F3F4F6",
                              backgroundColor: "#F9FAFB",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "60px",
                              width: "60px",
                            }}
                          >
                            <CloudUploadIcon
                              sx={{ fontSize: 28, color: "#6B7280" }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 600,
                              fontSize: "16px",
                              lineHeight: "24px",
                              color: "#374151",
                              textAlign: "center",
                            }}
                          >
                            Drop your CSV file here
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 400,
                              fontSize: "14px",
                              lineHeight: "20px",
                              color: "#6B7280",
                              textAlign: "center",
                            }}
                          >
                            or click to browse
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 400,
                              fontSize: "12px",
                              lineHeight: "18px",
                              color: "#9CA3AF",
                              textAlign: "center",
                            }}
                          >
                            CSV files only • Max 100MB
                          </Typography>
                        </Stack>
                      </Box>
                    )}

                    {/* Upload Button */}
                    <Button
                      variant="contained"
                      aria-label="Upload Data"
                      
                      onClick={handleUpload}
                      disabled={
                        !selectedFile || isUploading || tags.length === 0|| creditScore <= 0
                      }
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        width: "100%",
                        py: { xs: 1.2, sm: 1.5 },
                        textTransform: "none",
                        fontWeight: 600,
                        backgroundColor: STYLES.COLORS.PRIMARY,
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: STYLES.COLORS.SECONDARY,
                        },
                        "&:disabled": {
                          backgroundColor: "#d1d5db",
                          color: "#6b7280",
                        },
                      }}
                    >
                      {isUploading ? "Uploading..." : "Upload Data"}
                    </Button>
                    <NDADisclosure />
                  </Stack>
                </Box>

                {/* Right Column - Sample Data Library */}
                <Box
                  sx={{
                    display: {
                      xs: selectedFile ? "none" : "block",
                      md: "block",
                    },
                    minHeight: { xs: "auto", md: "400px" },
                  }}
                >
                  <SampleDataLibrary
                    onSampleDataSelect={handleSampleDataSelect}
                    moduleName={uploadData.determined_module}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default DataUploadSection;
