import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Box, Button, DialogActions, Stack } from "@mui/material";
import { ReactComponent as CloudUploadIcon } from "../../../../../assets/Icons/cloud-upload-dark.svg";
import { ThemeContext } from "../../../../../theme/config/ThemeContext";
import CustomAutocomplete from "./../../../../../components/CustomInputControls/CustomAutoComplete";
import DeleteIcon from "@mui/icons-material/Delete";
import Papa from "papaparse";
import { transformCsv } from "../../../../../utils/csvUtils";
import PreviewTable from "./PreviewData";
import useModule from "../../../../../hooks/useModule";
import CustomButton from "./../../../../../components/CustomButton";
import { getFieldTags } from "../../../../../utils/getFieldTags";
import { generateMetadata } from "../../../../../utils/generateMetadataConfigurable";
import useAuth from "../../../../../hooks/useAuth";
import { uploadCSVToS3, uploadJsonToS3 } from "../../../../../utils/s3Utils";
import useDataset from "../../../../../hooks/useDataset";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput";
import ConfirmationDialog from "../../../../../components/ConfirmationDialog";
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

export default function UploadDataDialog({ open, handleClose }) {
  const fileInputRef = React.useRef(null);
  const { currentDatasetTag, renderDatasets, uploadMetadataToS3, ui_config } =
    useModule();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [previewData, setPreviewData] = React.useState(null);
  const [tags, setTags] = React.useState([currentDatasetTag]);
  const [dragOver, setDragOver] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState("");

  const { addDataset, loadDatasetsList } = useDataset();
  const [allDatasetTags, setallDatasetTags] = React.useState([]);
  React.useEffect(() => {
    console.log("currentTag", currentDatasetTag);
    if (currentDatasetTag !== "none") {
      setTags([currentDatasetTag]);
      const combinedDatasets = Object.values(renderDatasets).reduce(
        (acc, datasets) => {
          return [...acc, ...datasets];
        },
        []
      );
      setallDatasetTags(combinedDatasets.map((dataset) => dataset.tag));
    } else {
      setTags([]);
      setallDatasetTags(AllDatasetTags);
    }
  }, [currentDatasetTag]);
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
    refreshCurrentCompnay,
  } = useAuth();

  React.useEffect(() => {
    if (selectedFile) {
      setNewFileName(selectedFile.name);
    }
  }, [selectedFile]);
  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleConfirm = async () => {
    const fileName = newFileName.replace(".csv", "");

    const metadata = await generateMetadata(
      previewData,
      tags,
      fileName,
      "File Upload",
      "",
      JSON.parse(JSON.stringify(ui_config.datasets.dataset_info))
    );
    console.log(metadata);

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
    handleClose();
    const response = await addDataset(userInfo, currentCompany, datasetInfo);
    if (response) {
      handleClose();
      setSelectedFile(null);
      setPreviewData(null);
      setTags([currentDatasetTag]);
      setNewFileName("");
      setIsEditingName(false);
      setDragOver(false);
    } else {
      console.log(response);
    }
  };
  React.useEffect(() => {
    refreshCurrentCompnay();
  }, []);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxSizeInBytes = 100 * 1024 * 1024; // Maximum file size: 100MB

    if (file) {
      if (file.type === "text/csv") {
        if (!currentCompany.unlimited_data_upload) {
          if (file.size > maxSizeInBytes) {
            setIsContactSalesDialogOpen(true);
            setSelectedFile(null);
            event.target.value = ""; // Clear the input field
          } else {
            parseCSV(file);
            setSelectedFile(file);
          }
        } else {
          parseCSV(file);
          setSelectedFile(file);
        }
      } else {
        alert("Please select a CSV file.");
        setSelectedFile(null);
        event.target.value = ""; // Clear the input field
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      parseCSV(file);
      setSelectedFile(file);
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
      // header: true,
      // dynamicTyping: true,
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

        // You can store the parsed JSON data in a state or handle it as needed
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
      },
    });
  };

  const confirmDisabled = !selectedFile || tags.length === 0;

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
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
            Upload Datasets
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
                          // endAdornment={
                          //   <Typography sx={{ marginRight: "8px" }}>
                          //     .csv
                          //   </Typography>
                          // }
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
                      {` ${(selectedFile.size / 1024).toFixed(2)} KB`}
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
                    <Box onClick={handleUploadClick} sx={{ cursor: "pointer" }}>
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
          </Stack>
        </Box>
        <DialogActions>
          <CustomButton onClick={handleClose} title={"Cancel"} outlined />
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
            isPremiumFeature={currentCompany.allowed_total_datasets}
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
