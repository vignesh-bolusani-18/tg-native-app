import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {
  GRAY,
  BRAND,
  SUCCESS,
  WARNING,
} from "../../../../../theme/custmizations/colors";
import CustomButton from "../../../../../components/CustomButton";
import useAuth from "../../../../../hooks/useAuth";
import { ReactComponent as CloudUploadIcon } from "../../../../../assets/Icons/cloud-upload-dark.svg";
import { ThemeContext } from "../../../../../theme/config/ThemeContext";
import CustomAutocomplete from "./../../../../../components/CustomInputControls/CustomAutoComplete";
import DeleteIcon from "@mui/icons-material/Delete";
import Papa from "papaparse";
import { transformCsv } from "../../../../../utils/csvUtils";
import PreviewTable from "./PreviewData";
import useExperiment from "../../../../../hooks/useExperiment";
import { getFieldTags } from "../../../../../utils/getFieldTags";
import { generateMetadata } from "../../../../../utils/generateMetadata";
import { uploadCSVToS3, uploadJsonToS3 } from "../../../../../utils/s3Utils";
import useDataset from "../../../../../hooks/useDataset";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput";
import useDataConnection from "../../../../../hooks/useDataConnection";
import { useEffect } from "react";
import { generateAPIReqArg } from "../../../../../utils/generateAPIReqArg";
import { setSampleData } from "../../../../../redux/slices/dataConnectionSlice";
import ConfirmationDialog from "../../../../../components/ConfirmationDialog";
import { current } from "@reduxjs/toolkit";
import ContactSalesDialog from "../../../../../components/ContactSalesDialog";
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

export default function GoogleDriveDataConnectionData({
  open,
  handleClose,
  dataConnectionName,
  googleDriveDataConnectionPayload,
  dataConnectionID,
  sampleDataFetchFailed = false,
}) {
  const fileInputRef = React.useRef(null);
  const { currentDatasetTag, uploadMetadataToS3 } =
    useExperiment();
  const { googleDriveSampleData, SetSampleData, ClearData } =
    useDataConnection();
  const [previewData, setPreviewData] = React.useState(googleDriveSampleData);
  const [tags, setTags] = React.useState([currentDatasetTag]);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState("GoogleDrive_Dataset");
  const [allDatasetTags, setallDatasetTags] = React.useState(AllDatasetTags);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(false);

  const {
    currentCompany,
    userInfo,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
    refreshCurrentCompnay,
  } = useAuth();
  const { addDataset } = useDataset();

  // Initialize component
  React.useEffect(() => {
    console.log(
      "Google Drive Data Connection Payload:",
      googleDriveDataConnectionPayload
    );
    refreshCurrentCompnay();

    // Set initial filename based on connection name only if not in upload mode
    if (dataConnectionName && !sampleDataFetchFailed) {
      setNewFileName(`${dataConnectionName}_Dataset`);
    }
  }, [
    googleDriveDataConnectionPayload,
    dataConnectionName,
    sampleDataFetchFailed,
  ]);


  // Update preview data when googleDriveSampleData changes
  useEffect(() => {
    if (googleDriveSampleData) {
      setPreviewData(googleDriveSampleData);
    }
  }, [googleDriveSampleData]);

  // Debug allDatasetTags changes
  useEffect(() => {
    console.log("allDatasetTags state changed:", allDatasetTags);
  }, [allDatasetTags]);

  const handleContactSales = () => {
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const convertToCSV = (obj) => {
    const escapeCSVValue = (value) => {
      if (value == null) return "";
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    const keys = Object.keys(obj);
    const numRows = Math.max(...keys.map((key) => obj[key].length));

    const csvRows = [keys.map(escapeCSVValue).join(",")];

    for (let i = 0; i < numRows; i++) {
      const row = keys
        .map((key) => escapeCSVValue(obj[key][i] || ""))
        .join(",");
      csvRows.push(row);
    }

    return csvRows.join("\n");
  };

  const handleConfirm = async () => {
    const filename = newFileName.replace(".csv", "");

    // Use uploaded preview data if sample data fetch failed, otherwise use googleDriveSampleData
    const dataToUse = sampleDataFetchFailed
      ? previewData
      : googleDriveSampleData;

    const metadata = await generateMetadata(
      dataToUse,
      tags,
      filename,
      "gdrive",
      dataConnectionName
    );
    console.log(metadata);

    const api_req_args = googleDriveDataConnectionPayload;
    console.log(api_req_args);

    const apiArgPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/${filename}||${dataConnectionName}.json`;
    const metaDataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${filename}.json`;
    const uploadCSVPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/samples/${filename}.csv`;

    await uploadMetadataToS3({ metaData: metadata, path: metaDataPath });
    await uploadMetadataToS3({ metaData: api_req_args, path: apiArgPath });

    // Upload the appropriate data
    if (sampleDataFetchFailed && selectedFile) {
      // Upload the selected file directly
      await uploadCSVToS3(uploadCSVPath, selectedFile);
    } else {
      // Upload the converted sample data
      await uploadCSVToS3(uploadCSVPath, convertToCSV(googleDriveSampleData));
    }

    const datasetInfo = {
      datasetName: filename,
      datasetTag: tags[0],
      metaDataPath: metaDataPath,
      sourceName: "gdrive",
      dataConnectionName: dataConnectionName,
    };

    handleClose();
    const response = await addDataset(userInfo, currentCompany, datasetInfo);
    if (response) {
      handleClose();
      setPreviewData(null);
      setTags([currentDatasetTag]);
      setNewFileName("GoogleDrive_Dataset");
      setIsEditingName(false);
      setSelectedFile(null);
      setDragOver(false);
      ClearData();
      SetSampleData(null);
    } else {
      console.log(response);
    }
  };

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (event) => {
    setNewFileName(event.target.value);
    console.log("Name changed to:", event.target.value);
  };

  const handleConfirmNameChange = () => {
    console.log("Confirming name change. Current name:", newFileName);
    setIsEditingName(false);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      parseCSV(file);
      setSelectedFile(file);
      // Set editing name to true when file is uploaded so user can enter dataset name
      setIsEditingName(true);
      // Set default filename based on the uploaded file
      const fileName = file.name.replace(".csv", "");
      setNewFileName(fileName);
      console.log("File uploaded, setting filename to:", fileName);
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
      // Set editing name to true when file is uploaded so user can enter dataset name
      setIsEditingName(true);
      // Set default filename based on the uploaded file
      const fileName = file.name.replace(".csv", "");
      setNewFileName(fileName);
      console.log("File dropped, setting filename to:", fileName);
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
  };

  function getPreviewData(data, limit = 10) {
    // When using columns: true, data is an array of objects
    if (data.length === 0) return {};

    // Get the column names from the first object
    const columns = Object.keys(data[0]);

    // Initialize the result object with empty arrays for each column
    const result = {};
    columns.forEach((column) => {
      result[column] = [];
    });

    // Fill the arrays with values from each row, filtering out empty or invalid rows
    data.forEach((row, rowIndex) => {
      if (rowIndex < limit) {
        // Check if this row has any meaningful data (not just empty strings or nulls)
        const hasData = columns.some((column) => {
          const value = row[column];
          return (
            value !== null &&
            value !== undefined &&
            value.toString().trim() !== ""
          );
        });

        if (hasData) {
          columns.forEach((column) => {
            result[column].push(row[column] || "");
          });
        }
      }
    });

    return result;
  }

  const parseCSV = (file) => {
    Papa.parse(file, {
      // header: true,
      // dynamicTyping: true,
      dynamicTyping: false,
      columns: false, // Don't use columns: true, parse as raw data first
      skip_empty_lines: true,
      transform: (value) => {
        // Force every value to remain a string
        return value.toString();
      },
      complete: (result) => {
        console.log("Raw CSV Data: ", result.data);

        // Remove the first row if it's just sequential numbers
        let filteredData = result.data;
        if (result.data.length > 0) {
          const firstRow = result.data[0];
          const isIndexRow = firstRow.every((value, index) => {
            const str = value.toString().trim();
            return str === index.toString();
          });

          if (isIndexRow && firstRow.length >= 3) {
            console.log("Removing index row:", firstRow);
            filteredData = result.data.slice(1); // Remove first row
          }
        }

        // Now convert to object format for getPreviewData
        if (filteredData.length > 0) {
          const headers = filteredData[0];
          const dataRows = filteredData.slice(1);

          const objectData = dataRows.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || "";
            });
            return obj;
          });

          console.log("Converted to object format:", objectData);
          const previewCSVData = getPreviewData(objectData);
          console.log("Transformed CSV Data: ", previewCSVData);
          setPreviewData(previewCSVData);
        } else {
          setPreviewData({});
        }

        // You can store the parsed JSON data in a state or handle it as needed
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
      },
    });
  };

  const formatFileSize = (size) => {
    if (!size) return "N/A";
    const bytes = parseInt(size);
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderSelectedItems = () => {
    if (!googleDriveDataConnectionPayload?.selectedItems) {
      return (
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "20px",
            color: GRAY[500],
            textAlign: "center",
          }}
        >
          No items selected
        </Typography>
      );
    }

    // Group items by their path hierarchy
    const groupItemsByHierarchy = () => {
      const hierarchy = {};

      googleDriveDataConnectionPayload.selectedItems.forEach((item) => {
        const pathParts = item.path ? item.path.split("/") : [item.name];
        let currentLevel = hierarchy;

        pathParts.forEach((part, index) => {
          if (!currentLevel[part]) {
            const currentPath = pathParts.slice(0, index + 1).join("/");
            const actualItem =
              googleDriveDataConnectionPayload.selectedItems.find(
                (selected) =>
                  selected.path === currentPath ||
                  (index === 0 && selected.name === part && !selected.path)
              );

            currentLevel[part] = {
              item: actualItem || {
                name: part,
                type: "folder",
                path: currentPath,
              },
              children: {},
            };
          }
          currentLevel = currentLevel[part].children;
        });
      });

      return hierarchy;
    };

    const countDirectChildrenUnderFolder = (folderPath) => {
      return googleDriveDataConnectionPayload.selectedItems.filter((item) => {
        if (!item.path || !folderPath) return false;
        const folderPathParts = folderPath.split("/");
        const itemPathParts = item.path.split("/");
        return (
          itemPathParts.length === folderPathParts.length + 1 &&
          item.path.startsWith(folderPath + "/")
        );
      }).length;
    };

    const getEffectiveDirectChildrenCount = (folderPath) => {
      const folderIsSelected =
        googleDriveDataConnectionPayload.selectedItems.some(
          (item) => item.path === folderPath && item.type === "folder"
        );

      if (folderIsSelected) {
        const folderItem = findFolderInStructure(folderPath);
        if (folderItem && folderItem.children) {
          return folderItem.children.length;
        }
      } else {
        return countDirectChildrenUnderFolder(folderPath);
      }

      return 0;
    };

    const findFolderInStructure = (folderPath) => {
      const searchInChildren = (children) => {
        for (const child of children) {
          if (child.file.path === folderPath) {
            return child;
          }
          if (child.children) {
            const found = searchInChildren(child.children);
            if (found) return found;
          }
        }
        return null;
      };

      if (googleDriveDataConnectionPayload?.fileStructure?.children) {
        return searchInChildren(
          googleDriveDataConnectionPayload.fileStructure.children
        );
      }
      return null;
    };

    const renderHierarchy = (hierarchy, level = 0) => {
      return Object.entries(hierarchy).map(([name, data]) => {
        const item = data.item;
        const hasChildren = Object.keys(data.children).length > 0;
        const isFolder = item?.type === "folder" || hasChildren;
        const directChildrenCount = item?.path
          ? getEffectiveDirectChildrenCount(item.path)
          : 0;

        return (
          <Box key={item?.id || name}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1,
                pl: level * 3,
                pr: 2,
                border: `1px solid ${GRAY[200]}`,
                borderRadius: "6px",
                margin: "2px 0",
                backgroundColor: "#FFFFFF",
                "&:hover": {
                  backgroundColor: GRAY[50],
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
              >
                {isFolder ? (
                  <FolderIcon sx={{ color: "#0C66E4", fontSize: 18 }} />
                ) : (
                  <InsertDriveFileIcon
                    sx={{
                      color:
                        item.fileExtension?.toLowerCase() === "xlsx" ||
                        item.fileExtension?.toLowerCase() === "xls"
                          ? SUCCESS[600]
                          : item.fileExtension?.toLowerCase() === "csv"
                          ? WARNING[600]
                          : GRAY[500],
                      fontSize: 18,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: GRAY[700],
                    fontWeight: isFolder ? 500 : 400,
                  }}
                >
                  {name}
                </Typography>
                {!isFolder && item?.fileExtension && (
                  <Chip
                    label={item.fileExtension.toUpperCase()}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      height: 16,
                      backgroundColor: BRAND[50],
                      color: BRAND[700],
                      fontFamily: "Inter",
                      fontWeight: 500,
                    }}
                  />
                )}
                {!isFolder && item?.size && (
                  <Chip
                    label={formatFileSize(item.size)}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.6rem",
                      height: 16,
                      borderColor: GRAY[300],
                      color: GRAY[600],
                      fontFamily: "Inter",
                    }}
                  />
                )}
                {isFolder && directChildrenCount > 0 && (
                  <Chip
                    label={`${directChildrenCount} items`}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      height: 16,
                      backgroundColor: GRAY[100],
                      color: GRAY[600],
                      fontFamily: "Inter",
                      fontWeight: 400,
                    }}
                  />
                )}
              </Box>
              {!isFolder && item?.modifiedTime && (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "11px",
                    lineHeight: "16px",
                    color: GRAY[500],
                    minWidth: "80px",
                    textAlign: "right",
                  }}
                >
                  {new Date(item.modifiedTime).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            {hasChildren && (
              <Box sx={{ pl: 1 }}>
                {renderHierarchy(data.children, level + 1)}
              </Box>
            )}
          </Box>
        );
      });
    };

    const hierarchy = groupItemsByHierarchy();
    return <Box>{renderHierarchy(hierarchy)}</Box>;
  };

  const confirmDisabled =
    (!googleDriveSampleData && !selectedFile) ||
    tags.length === 0 ||
    newFileName.length === 0;

  // Debug logging
  console.log("Debug confirmDisabled:", {
    googleDriveSampleData: !!googleDriveSampleData,
    selectedFile: !!selectedFile,
    tagsLength: tags.length,
    newFileName: newFileName,
    newFileNameLength: newFileName.length,
    confirmDisabled: confirmDisabled,
  });

  return (
    <Box>
      <BootstrapDialog
        onClose={() => {
          handleClose();
          SetSampleData(null);
        }}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="lg"
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
            Add Google Drive Dataset
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => {
              handleClose();
              SetSampleData(null);
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
            {/* Connection Info */}
            <Box
              sx={{
                p: 2,
                bgcolor: BRAND[50],
                borderRadius: "8px",
                border: `1px solid ${BRAND[200]}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: "16px",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  lineHeight: "24px",
                  color: BRAND[700],
                }}
              >
                Google Drive Connection
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                <Chip
                  label={`Connection: ${dataConnectionName}`}
                  size="small"
                  sx={{
                    backgroundColor: BRAND[100],
                    color: BRAND[700],
                    fontFamily: "Inter",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label={`Files: ${
                    googleDriveDataConnectionPayload?.fileCount || 0
                  }`}
                  size="small"
                  sx={{
                    backgroundColor: SUCCESS[100],
                    color: SUCCESS[700],
                    fontFamily: "Inter",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label={`Folders: ${
                    googleDriveDataConnectionPayload?.folderCount || 0
                  }`}
                  size="small"
                  sx={{
                    backgroundColor: WARNING[100],
                    color: WARNING[700],
                    fontFamily: "Inter",
                    fontWeight: 500,
                  }}
                />
              </Stack>
            </Box>

            {/* Dataset Tags */}
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
              {/* Debug info */}
              <Typography variant="caption" sx={{ color: GRAY[500], mt: 1 }}>
                Debug: {allDatasetTags.length} tags available, {tags.length}{" "}
                selected
              </Typography>
            </Box>

            {/* Selected Items Preview */}
            <Box
              sx={{
                p: 2,
                bgcolor: GRAY[50],
                borderRadius: "8px",
                border: `1px solid ${GRAY[200]}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontSize: "16px",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  lineHeight: "24px",
                  color: GRAY[700],
                }}
              >
                Selected Google Drive Items
              </Typography>
              {renderSelectedItems()}
            </Box>

            {/* Path Patterns Summary */}
            {googleDriveDataConnectionPayload?.pathPatterns &&
              googleDriveDataConnectionPayload.pathPatterns.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: SUCCESS[50],
                    borderRadius: "8px",
                    border: `1px solid ${SUCCESS[200]}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontSize: "16px",
                      fontFamily: "Inter",
                      fontWeight: 600,
                      lineHeight: "24px",
                      color: SUCCESS[700],
                    }}
                  >
                    Generated Path Patterns
                  </Typography>
                  <Stack spacing={1}>
                    {googleDriveDataConnectionPayload.pathPatterns.map(
                      (pattern, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1.5,
                            bgcolor: "#FFFFFF",
                            borderRadius: "6px",
                            border: `1px solid ${SUCCESS[300]}`,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: SUCCESS[800],
                                backgroundColor: SUCCESS[100],
                                px: 1,
                                py: 0.5,
                                borderRadius: "4px",
                              }}
                            >
                              {pattern.pattern}
                            </Typography>
                            <Chip
                              label={pattern.type}
                              size="small"
                              sx={{
                                fontSize: "0.6rem",
                                height: 20,
                                backgroundColor:
                                  pattern.type === "wildcard"
                                    ? BRAND[100]
                                    : pattern.type === "specific"
                                    ? WARNING[100]
                                    : SUCCESS[100],
                                color:
                                  pattern.type === "wildcard"
                                    ? BRAND[700]
                                    : pattern.type === "specific"
                                    ? WARNING[700]
                                    : SUCCESS[700],
                                fontFamily: "Inter",
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "Inter",
                              fontSize: "12px",
                              lineHeight: "16px",
                              color: GRAY[600],
                            }}
                          >
                            {pattern.description}
                            {pattern.fileCount &&
                              ` (${pattern.fileCount} files)`}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Stack>

                  {/* Selection Summary */}
                  {googleDriveDataConnectionPayload?.selectionSummary && (
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${SUCCESS[300]}`,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          fontSize: "14px",
                          fontFamily: "Inter",
                          fontWeight: 600,
                          lineHeight: "20px",
                          color: SUCCESS[700],
                        }}
                      >
                        Selection Summary
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={2}
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Chip
                          label={`${googleDriveDataConnectionPayload.selectionSummary.totalPatterns} Patterns`}
                          size="small"
                          sx={{
                            backgroundColor: SUCCESS[100],
                            color: SUCCESS[700],
                            fontFamily: "Inter",
                            fontWeight: 500,
                          }}
                        />
                        {googleDriveDataConnectionPayload.selectionSummary
                          .wildcardPatterns > 0 && (
                          <Chip
                            label={`${googleDriveDataConnectionPayload.selectionSummary.wildcardPatterns} Wildcard`}
                            size="small"
                            sx={{
                              backgroundColor: BRAND[100],
                              color: BRAND[700],
                              fontFamily: "Inter",
                              fontWeight: 500,
                            }}
                          />
                        )}
                        {googleDriveDataConnectionPayload.selectionSummary
                          .specificPatterns > 0 && (
                          <Chip
                            label={`${googleDriveDataConnectionPayload.selectionSummary.specificPatterns} Specific`}
                            size="small"
                            sx={{
                              backgroundColor: WARNING[100],
                              color: WARNING[700],
                              fontFamily: "Inter",
                              fontWeight: 500,
                            }}
                          />
                        )}
                        {googleDriveDataConnectionPayload.selectionSummary
                          .folderPatterns > 0 && (
                          <Chip
                            label={`${googleDriveDataConnectionPayload.selectionSummary.folderPatterns} Folders`}
                            size="small"
                            sx={{
                              backgroundColor: GRAY[100],
                              color: GRAY[700],
                              fontFamily: "Inter",
                              fontWeight: 500,
                            }}
                          />
                        )}
                        {googleDriveDataConnectionPayload.selectionSummary
                          .extensions.length > 0 && (
                          <Chip
                            label={`Extensions: ${googleDriveDataConnectionPayload.selectionSummary.extensions.join(
                              ", "
                            )}`}
                            size="small"
                            sx={{
                              backgroundColor: GRAY[100],
                              color: GRAY[700],
                              fontFamily: "Inter",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )}

            {/* Sample Data Preview */}
            {googleDriveSampleData ? (
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
                              ? "GoogleDrive_Dataset"
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
                  </Stack>
                </Stack>
                <PreviewTable previewData={previewData} />
              </Box>
            ) : sampleDataFetchFailed ? (
              // Show upload interface when sample data fetch failed
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
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Stack direction={"row"} gap={1} alignItems={"center"}>
                        {!isEditingName ? (
                          <Stack
                            direction={"row"}
                            gap={1}
                            alignItems={"center"}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "16px",
                                lineHeight: "20px",
                                color: "#101828",
                              }}
                            >
                              {newFileName || "Enter dataset name"}
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
                          <Stack
                            direction={"row"}
                            gap={1}
                            alignItems={"center"}
                          >
                            <CustomTextInput
                              value={newFileName}
                              onChange={handleNameChange}
                              placeholder="Enter dataset name"
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
                    <PreviewTable previewData={previewData} />
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
            ) : (
              <Stack
                direction={"row"}
                justifyContent={"center"}
                sx={{
                  border: "1px solid #EAECF0",
                  borderRadius: "8px",
                  padding: "16px 24px 16px 24px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <CircularProgress size={25} />
                <Typography
                  sx={{
                    ml: 2,
                    fontFamily: "Inter",
                    fontSize: "14px",
                    color: GRAY[600],
                  }}
                >
                  Loading sample data from Google Drive...
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
        <DialogActions>
          <CustomButton
            onClick={() => {
              handleClose();
              SetSampleData(null);
            }}
            title={"Cancel"}
            outlined
          />
          <CustomButton
            onClick={
              currentCompany.unlimited_datasets ||
              currentCompany.allowed_total_datasets > 0
                ? () => handleConfirm()
                : () => setIsContactSalesDialogOpen(true)
            }
            title={"Confirm"}
            disabled={confirmDisabled}
            loadable
          />
        </DialogActions>
        <ContactSalesDialog
          open={isContactSalesDialogOpen}
          handleClose={() => setIsContactSalesDialogOpen(false)}
          handleConfirm={handleContactSales}
          WarningText="Upgrade Your Subscription"
          ResultText="Upgrade your subscription or contact sales for more access."
          ConfirmButtonTitle="Contact Sales"
        />
      </BootstrapDialog>
    </Box>
  );
}
