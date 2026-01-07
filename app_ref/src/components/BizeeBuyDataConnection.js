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
  Grid,
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
import BizeeBuyDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/BizeeBuyDataConnectionData";
import CustomCounter from "./CustomInputControls/CustomCounter";

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

export default function BizeeBuyDataConnection({
  open,
  handleClose,
  dataConnectionID,
  dataConnectionName,
  accessToken,
}) {
  const [dataConnectionType, setDataConnectionType] = useState("Sales");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [version, setVersion] = useState(null);
  const [limit, setLimit] = useState(null);
  const [date, setDate] = useState(null);
  const [dataConnectionPayload, setDataConnectionPayload] = useState({});
  const [bizeeBuyDataConnectionDataOpen, setBizeeBuyDataConnectionDataOpen] =
    useState(false);

  const handleOpenBizeeBuyDataConnectionData = () => {
    setBizeeBuyDataConnectionDataOpen(true);
  };
  const handleCloseBizeeBuyDataConnectionData = () => {
    setBizeeBuyDataConnectionDataOpen(false);
    handleClose();
  };

  const { loadBizeeBuyConnectionDataDetails } = useDataConnection();

  console.log("dataType" + dataConnectionType);

  const { userInfo, currentCompany } = useAuth();

  const handleConfirm = async () => {
    const basePayload = {
      accessToken,
      dataConnectionType,
    };

    let dataConnectionPayload;
    if (dataConnectionType === "Inventory") {
      dataConnectionPayload = {
        ...basePayload,
        date: date || "None",
        warehouse: warehouse || "None",
        limit: limit ? Number(limit) : "None",
      };
    } else if (dataConnectionType === "Item Master - FG") {
      dataConnectionPayload = {
        ...basePayload,

        itemType: itemType || "None",
        limit: limit ? Number(limit) : "None",
        warehouse: warehouse || "None",
      };
    } else if (dataConnectionType === "Sales") {
      dataConnectionPayload = {
        ...basePayload,
        startDate: startDate || "None",
        endDate: endDate || "None",
        version: version || "None",
      };
    } else if (dataConnectionType === "Open PO") {
      dataConnectionPayload = {
        ...basePayload,
        warehouse: warehouse || "None",
      };
    } else if (dataConnectionType === "Item Master - Materials") {
      dataConnectionPayload = {
        ...basePayload,

        itemType: itemType || "None",
        limit: limit ? Number(limit) : "None",
        warehouse: warehouse || "None",
      };
    } else if (dataConnectionType === "BOM") {
      dataConnectionPayload = {
        ...basePayload,
        warehouse: warehouse || "None",
      };
    }
    setDataConnectionPayload(dataConnectionPayload);
    console.log("Data Conn Payload", dataConnectionPayload);
    handleOpenBizeeBuyDataConnectionData();

    await loadBizeeBuyConnectionDataDetails(
      dataConnectionID,
      dataConnectionPayload,
      userInfo.userID
    );
  };

  const bizeeBuyConnectionOptions = [
    "Sales",
    "Inventory",
    "Item Master - FG",
    "Open PO",
    "Item Master - Materials",
    "BOM",
  ];
  const confirmDisabled =
    (dataConnectionType === "Sales" &&
      (!startDate ||
        !endDate ||
        !version ||
        startDate === "None" ||
        endDate === "None" ||
        version === "None")) ||
    (dataConnectionType === "Inventory" &&
      (!date || !limit || date === "None" || limit === "None")) ||
    (dataConnectionType === "Item Master - FG" &&
      (!itemType || !limit || itemType === "None" || limit === "None")) ||
    (dataConnectionType === "Open PO" && false) ||
    (dataConnectionType === "Item Master - Materials" &&
      (!itemType || !limit || itemType === "None" || limit === "None")) ||
    (dataConnectionType === "BOM" && false);

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
          <Grid container spacing={2} padding={"16px 0px"}>
            <Grid item xs={12} md={12}>
              <CustomAutocomplete
                disableClearable
                values={bizeeBuyConnectionOptions}
                selectedValues={dataConnectionType}
                setSelectedValues={setDataConnectionType}
                label={"Select Connection Type"}
                placeholder={"Select Connection Type"}
                showLabel
              />
            </Grid>
          </Grid>

          {dataConnectionType === "Sales" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CustomDatePicker
                  showLabel
                  label="Select start date:"
                  initialDate={new Date()} // Initial date
                  selectedValue={startDate}
                  setSelectedValue={setStartDate}
                  // Callback function to handle date change
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomDatePicker
                  showLabel
                  label="Select end date:"
                  initialDate={new Date()} // Initial date
                  selectedValue={endDate}
                  setSelectedValue={setEndDate}
                  // Callback function to handle date change
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Version"}
                  placeholder="Enter your version"
                  name="version"
                  value={version}
                  onChange={(e) => {
                    const { value } = e.target;
                    setVersion(value);
                  }}
                />
              </Grid>
            </Grid>
          ) : dataConnectionType === "Item Master - FG" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Warehouse"}
                  placeholder="Enter your warehouse"
                  name="warehouse"
                  value={warehouse}
                  onChange={(e) => {
                    const { value } = e.target;
                    setWarehouse(value);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Item Type"}
                  placeholder="Enter your item type"
                  name="itemType"
                  value={itemType}
                  onChange={(e) => {
                    const { value } = e.target;
                    setItemType(value);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Limit"}
                  placeholder="Enter your limit"
                  name="limit"
                  value={limit}
                  onChange={(e) => {
                    const { value } = e.target;
                    setLimit(value);
                  }}
                />
              </Grid>
            </Grid>
          ) : dataConnectionType === "Inventory" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Warehouse"}
                  placeholder="Enter your warehouse"
                  name="warehouse"
                  value={warehouse}
                  onChange={(e) => {
                    const { value } = e.target;
                    setWarehouse(value);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomDatePicker
                  showLabel
                  label="Date:"
                  initialDate={new Date()} // Initial date
                  selectedValue={date}
                  setSelectedValue={setDate}
                  // Callback function to handle date change
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Limit"}
                  placeholder="Enter your limit"
                  name="limit"
                  value={limit}
                  onChange={(e) => {
                    const { value } = e.target;
                    setLimit(value);
                  }}
                />
              </Grid>
            </Grid>
          ) : dataConnectionType === "Open PO" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Warehouse"}
                  placeholder="Enter your warehouse"
                  name="warehouse"
                  value={warehouse}
                  onChange={(e) => {
                    const { value } = e.target;
                    setWarehouse(value);
                  }}
                />
              </Grid>
            </Grid>
          ) : dataConnectionType === "Item Master - Materials" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Warehouse"}
                  placeholder="Enter your warehouse"
                  name="warehouse"
                  value={warehouse}
                  onChange={(e) => {
                    const { value } = e.target;
                    setWarehouse(value);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Item Type"}
                  placeholder="Enter your item type"
                  name="itemType"
                  value={itemType}
                  onChange={(e) => {
                    const { value } = e.target;
                    setItemType(value);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Limit"}
                  placeholder="Enter your limit"
                  name="limit"
                  value={limit}
                  onChange={(e) => {
                    const { value } = e.target;
                    setLimit(value);
                  }}
                />
              </Grid>
            </Grid>
          ) : dataConnectionType === "BOM" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <CustomTextInput
                  required
                  showLabel
                  label={"Warehouse"}
                  placeholder="Enter your warehouse"
                  name="warehouse"
                  value={warehouse}
                  onChange={(e) => {
                    const { value } = e.target;
                    setWarehouse(value);
                  }}
                />
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleClose} title={"Cancel"} outlined />
          <CustomButton
            onClick={handleConfirm}
            title={"Confirm"}
            loadable
            disabled={confirmDisabled}
          />
        </DialogActions>
      </BootstrapDialog>
      {bizeeBuyDataConnectionDataOpen && (
        <BizeeBuyDataConnectionData
          open={bizeeBuyDataConnectionDataOpen}
          handleClose={handleCloseBizeeBuyDataConnectionData}
          dataConnectionName={dataConnectionName}
          dataConnectionID={dataConnectionID}
          dataConnectionPayload={dataConnectionPayload}
        />
      )}
    </Box>
  );
}
