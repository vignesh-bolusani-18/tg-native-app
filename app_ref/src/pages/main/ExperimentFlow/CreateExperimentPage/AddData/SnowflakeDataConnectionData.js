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
} from "@mui/material";
import { ReactComponent as CloudUploadIcon } from "../../../../../assets/Icons/cloud-upload-dark.svg";
import { ThemeContext } from "../../../../../theme/config/ThemeContext";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import DeleteIcon from "@mui/icons-material/Delete";
import Papa from "papaparse";
import { transformCsv } from "../../../../../utils/csvUtils";
import PreviewTable from "./PreviewData";
import useExperiment from "../../../../../hooks/useExperiment";
import CustomButton from "../../../../../components/CustomButton";
import { getFieldTags } from "../../../../../utils/getFieldTags";
import { generateMetadata } from "../../../../../utils/generateMetadata";
import useAuth from "../../../../../hooks/useAuth";
import {
  uploadCSVToS3,
  uploadJsonToS3,
  uploadTxtToS3,
} from "../../../../../utils/s3Utils";
import useDataset from "../../../../../hooks/useDataset";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput";
import useDataConnection from "../../../../../hooks/useDataConnection";
import { useEffect } from "react";
import { generateAPIReqArg } from "../../../../../utils/generateAPIReqArg";
import { setSampleData } from "../../../../../redux/slices/dataConnectionSlice";
import { terminateExperiment } from "../../../../../utils/terminateExperiment";
import Snowflake from "./Snowflake";
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

export default function SnowflakesDataConnectionData({
  open,
  handleClose,
  dataConnectionName,
  query,
}) {
  const { currentDatasetTag, renderDatasets, uploadMetadataToS3 } =
    useExperiment();
  //   const [selectedFile, setSelectedFile] = React.useState(null);
  const { sampleData, SetSampleData, ClearData, fileName } =
    useDataConnection();
  const [previewData, setPreviewData] = React.useState(sampleData);
  const [tags, setTags] = React.useState([currentDatasetTag]);
  const [isEditingName, setIsEditingName] = React.useState(true);
  const [newFileName, setNewFileName] = React.useState(fileName);
  React.useEffect(() => {
    console.log("File name", fileName);
    console.log("Data Connection Name", dataConnectionName);
  }, []);
  const { addDataset } = useDataset();
  const [allDatasetTags, setallDatasetTags] = React.useState([]);
  React.useEffect(() => {
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
  }, [currentDatasetTag]);
  const { userInfo, currentCompany } = useAuth();

  React.useEffect(() => {
    setNewFileName(fileName);
  }, []);
  useEffect(() => {
    setPreviewData(sampleData);
  }, [sampleData]);

const convertToCSV = (obj) => {
    const escapeCSVValue = (value) => {
      if (value == null) return '';
      const str = String(value);
      // If value contains comma, quote, or newline, wrap in double quotes and escape quotes
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    const keys = Object.keys(obj);
    const numRows = Math.max(...keys.map((key) => obj[key].length));

    // Create CSV header
    const csvRows = [keys.map(escapeCSVValue).join(",")];

    // Create CSV rows
    for (let i = 0; i < numRows; i++) {
      const row = keys.map((key) => escapeCSVValue(obj[key][i] || "")).join(",");
      csvRows.push(row);
    }

    // Join rows with newlines
    return csvRows.join("\n");
  };

  const handleConfirm = async () => {
    const filename = newFileName.replace(".csv", "");
    console.log(newFileName);
    const metadata = await generateMetadata(
      previewData,
      tags,
      filename,
      "Snowflake",
      dataConnectionName
    );
    console.log("Metadata", metadata);

    const metaDataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${filename}.json`;
    const queryPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/data_queries/${filename}||${dataConnectionName}.txt`;
    const uploadCSVPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/samples/${filename}.csv`;
    await uploadMetadataToS3({ metaData: metadata, path: metaDataPath });

    await uploadCSVToS3(uploadCSVPath, convertToCSV(sampleData));
    await uploadTxtToS3(queryPath, query);
    const datasetInfo = {
      datasetName: filename,
      datasetTag: tags[0],
      metaDataPath: metaDataPath,
      sourceName: "Snowflake",
      dataConnectionName: dataConnectionName,
    };

    const response = await addDataset(userInfo, currentCompany, datasetInfo);
    if (response) {
      handleClose();
      ClearData();
      SetSampleData(null);
      setPreviewData(null);
      setTags([currentDatasetTag]);
      setNewFileName("");
      setIsEditingName(false);
    } else {
      console.log(response);
    }
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

  const confirmDisabled = tags.length === 0 || newFileName.length === 0;

  return (
    <Box>
      <BootstrapDialog
        onClose={() => {
          handleClose();
          SetSampleData(null);
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
            Add Dataset
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

            {sampleData ? (
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
                              ? fileName
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
                          placeholder={"Enter the dataset name.."}
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
                          disabled={newFileName.length === 0}
                        >
                          <CheckIcon fontSize={"small"} />
                        </IconButton>
                      </Stack>
                    )}
                    {/* <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "20px",
                        color: "#10182870",
                      }}
                    >
                      {` ${(selectedFile.size / 1024).toFixed(2)} KB`}
                    </Typography> */}
                  </Stack>
                  {/* <IconButton
                    aria-label="remove"
                    onClick={handleRemoveFile}
                    sx={{
                      color: "#FF0000",
                    }}
                  >
                    <DeleteIcon />
                  </IconButton> */}
                </Stack>
                <PreviewTable previewData={previewData} />
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
