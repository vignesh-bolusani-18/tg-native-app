import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Box, DialogActions, DialogContent, Grid } from "@mui/material";

import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import CustomButton from "./CustomButton";
import useAuth from "../hooks/useAuth";
import useDataConnection from "../hooks/useDataConnection";

import { useState } from "react";

import CustomDatePicker from "./CustomInputControls/CustomDatePicker";
import MS365BusinessCentralDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/MS365BusinessCentralDataConnectionData";
import CustomCounter from "./CustomInputControls/CustomCounter";

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

export default function MS365BusinessCentralDataConnection({
  open,
  handleClose,
  dataConnectionID,
  dataConnectionName,
  baseURL,
  userID,
  password,
}) {
  const [dataConnectionType, setDataConnectionType] = useState("Sales");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dataConnectionPayload, setDataConnectionPayload] = useState({});
  const [
    ms365BusinessCentralDataConnectionDataOpen,
    setMS365BusinessCentralDataConnectionDataOpen,
  ] = useState(false);

  const handleOpenMS365BusinessCentralDataConnectionData = () => {
    setMS365BusinessCentralDataConnectionDataOpen(true);
  };
  const handleCloseMS365BusinessCentralDataConnectionData = () => {
    setMS365BusinessCentralDataConnectionDataOpen(false);
    handleClose();
  };

  const { loadMS365BusinessCentralConnectionDataDetails } = useDataConnection();

  console.log("dataType" + dataConnectionType);

  const { userInfo } = useAuth();

  const handleConfirm = async () => {
    const basePayload = {
      baseURL,
      userID,
      password,
      dataConnectionType,
    };

    let dataConnectionPayload;
    if (dataConnectionType === "Sales") {
      dataConnectionPayload = {
        ...basePayload,
        startDate: startDate || "None",
        endDate: endDate || "None",
      };
    }
    setDataConnectionPayload(dataConnectionPayload);
    console.log("Data Conn Payload", dataConnectionPayload);
    handleOpenMS365BusinessCentralDataConnectionData();

    await loadMS365BusinessCentralConnectionDataDetails(
      dataConnectionID,
      dataConnectionPayload,
      userInfo.userID
    );
  };

  const ms365BusinessCentralConnectionOptions = ["Sales"];
  const confirmDisabled =
    dataConnectionType === "Sales" &&
    (!startDate || !endDate || startDate === "None" || endDate === "None");

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
                values={ms365BusinessCentralConnectionOptions}
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
      {ms365BusinessCentralDataConnectionDataOpen && (
        <MS365BusinessCentralDataConnectionData
          open={ms365BusinessCentralDataConnectionDataOpen}
          handleClose={handleCloseMS365BusinessCentralDataConnectionData}
          dataConnectionName={dataConnectionName}
          dataConnectionID={dataConnectionID}
          dataConnectionPayload={dataConnectionPayload}
        />
      )}
    </Box>
  );
}
