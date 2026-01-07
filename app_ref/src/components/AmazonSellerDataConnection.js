import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";
import { ReactComponent as CloudUploadIcon } from "../assets/Icons/cloud-upload-dark.svg";

import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import DeleteIcon from "@mui/icons-material/Delete";

import PreviewTable from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/PreviewData";
import useExperiment from "../hooks/useExperiment";
import CustomButton from "./CustomButton";

import { generateMetadata } from "../utils/generateMetadata";
import useAuth from "../hooks/useAuth";
import { Papa } from "papaparse";
import { uploadCSVToS3, uploadJsonToS3, uploadTxtToS3 } from "../utils/s3Utils";
import useDataset from "../hooks/useDataset";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextInput from "./CustomInputControls/CustomTextInput";
import { useEffect } from "react";
import useDataConnection from "../hooks/useDataConnection";

import { Editor } from "@monaco-editor/react";

import { useState } from "react";

import SnowflakesDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/SnowflakeDataConnectionData";
import CustomDatePicker from "./CustomInputControls/CustomDatePicker";

import AmazonSellerDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/AmazonSellerDataConnectionData";

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

export default function AmazonSellerDataConnection({
  open,
  handleClose,
  handleOpen,
  dataConnectionID,
  dataConnectionName,
  accessToken,
  endpoint,
  appVersion,
  appId,
}) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [
    amazonSellerDataConnectionDataOpen,
    setAmazonSellerDataConnectionDataOpen,
  ] = useState(false);

  const handleOpenAmazonSellerDataConnectionData = () => {
    setAmazonSellerDataConnectionDataOpen(true);
  };
  const handleCloseAmazonSellerDataConnectionData = () => {
    setAmazonSellerDataConnectionDataOpen(false);
    handleClose();
  };

  const { loadAmazonSellerConnectionDataDetails } = useDataConnection();

  const { userInfo, currentCompany } = useAuth();

  const handleConfirm = async () => {
    const dataConnectionPayload = {
      isPreview: true,
      accessToken,
      endpoint,
      appVersion,
      appId,
      startDate: startDate || "Hi",
      endDate: endDate || "Hi",
    };
    console.log("Data Conn Payload", dataConnectionPayload);
    handleOpenAmazonSellerDataConnectionData();

    await loadAmazonSellerConnectionDataDetails(
      dataConnectionID,
      dataConnectionPayload,
      userInfo.userID
    );
  };

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
            {dataConnectionName}
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
        <DialogContent>
          <Stack spacing={2} padding={"16px 0px"}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <CustomDatePicker
                showLabel
                label="Select start date:"
                initialDate={new Date()} // Initial date
                selectedValue={startDate}
                setSelectedValue={setStartDate}
                // Callback function to handle date change
              />
              <CustomDatePicker
                showLabel
                label="Select end date:"
                initialDate={new Date()} // Initial date
                selectedValue={endDate}
                setSelectedValue={setEndDate}
                // Callback function to handle date change
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleClose} title={"Cancel"} outlined />
          <CustomButton onClick={handleConfirm} title={"Confirm"} loadable />
        </DialogActions>
      </BootstrapDialog>
      {amazonSellerDataConnectionDataOpen && (
        <AmazonSellerDataConnectionData
          open={amazonSellerDataConnectionDataOpen}
          handleClose={handleCloseAmazonSellerDataConnectionData}
          dataConnectionName={dataConnectionName}
          accessToken={accessToken}
          endpoint={endpoint}
          appVersion={appVersion}
          appId={appId}
          startDate={startDate}
          endDate={endDate}
          dataConnectionID={dataConnectionID}
        />
      )}
    </Box>
  );
}
