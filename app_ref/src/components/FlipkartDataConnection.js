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
import ShopifyDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/ShopifyDataConnectionData";
import FlipkartDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/FlipkartDataConnectionData";

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

export default function FlipkartDataConnection({
  open,
  handleClose,
  handleOpen,
  dataConnectionID,
  dataConnectionName,
  shopName,
  accessToken,
}) {
  const [dataConnectionType, setDataConnectionType] = useState("Inventory");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [flipkartDataConnectionDataOpen, setFlipkartDataConnectionDataOpen] =
    useState(false);

  const handleOpenFlipkartDataConnectionData = () => {
    setFlipkartDataConnectionDataOpen(true);
  };
  const handleCloseFlipkartDataConnectionData = () => {
    setFlipkartDataConnectionDataOpen(false);
    handleClose();
  };

  const { loadFlipkartConnectionDataDetails } = useDataConnection();

  console.log("dataType" + dataConnectionType);

  const { userInfo, currentCompany } = useAuth();

  const handleConfirm = async () => {
    const dataConnectionPayload = {
      isPreview: true,
      accessToken,
      dataConnectionType,
      startDate: startDate || "Hi",
      endDate: endDate || "Hi",
    };
    console.log("Data Conn Payload", dataConnectionPayload);
    handleOpenFlipkartDataConnectionData();

    await loadFlipkartConnectionDataDetails(
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
            <Box sx={{ gap: "24px" }}>
              <CustomAutocomplete
                disableClearable
                values={shopifyConnectionOptions}
                selectedValues={dataConnectionType}
                setSelectedValues={setDataConnectionType}
                label={"Select Connection Type"}
                placeholder={"Select Connection Type"}
                showLabel
              />
            </Box>
            {dataConnectionType === "Sales" ? (
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
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleClose} title={"Cancel"} outlined />
          <CustomButton onClick={handleConfirm} title={"Confirm"} loadable />
        </DialogActions>
      </BootstrapDialog>
      {flipkartDataConnectionDataOpen && (
        <FlipkartDataConnectionData
          open={flipkartDataConnectionDataOpen}
          handleClose={handleCloseFlipkartDataConnectionData}
          dataConnectionName={dataConnectionName}
          accessToken={accessToken}
          dataConnectionType={dataConnectionType}
          startDate={startDate}
          endDate={endDate}
          dataConnectionID={dataConnectionID}
        />
      )}
    </Box>
  );
}
