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
  Grid,
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
import { ThemeContext } from "../theme/config/ThemeContext";
import { Editor } from "@monaco-editor/react";

import { useState } from "react";

import SnowflakesDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/SnowflakeDataConnectionData";
import CustomDatePicker from "./CustomInputControls/CustomDatePicker";
import TGInternalDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/TGInternalDataConnectionData";

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

export default function TGInternalDataConnection({
  open,
  handleClose,
  handleOpen,
}) {
  const [experimentID, setExperimentID] = useState(null);
  const [payload, setPayload] = useState(null);
  const [dataType, setDataType] = useState(null);
  const confirmDisabled = !experimentID || !dataType;
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

  const [
    tgInternalDataConnectionDataOpen,
    setTGInternalDataConnectionDataOpen,
  ] = useState(false);
  const { theme } = React.useContext(ThemeContext);
  const handleOpenTGInternalDataConnectionData = (dataConnectionPayload) => {
    setPayload(dataConnectionPayload);
    setTGInternalDataConnectionDataOpen(true);
  };
  const handleCloseTGInternalDataConnectionData = () => {
    setPayload(null);
    setTGInternalDataConnectionDataOpen(false);
    handleClose();
  };

  const { loadTGInternalConnectionDataDetails } = useDataConnection();
  useEffect(() => {
    loadExperiementsList(userInfo);
  }, []);

  const { userInfo, currentCompany } = useAuth();
  function formatYearMonth(dateString) {
    // Split the string to extract date part
    const datePart = dateString.split(" at ")[0];

    // Create a new Date object with the date part
    const date = new Date(datePart);

    // Check if the date is valid
    if (isNaN(date)) {
      throw new Error("Invalid date format");
    }

    // Extract year and month
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Concatenate year and month
    console.log("Run Date", `${year}${month}`);
    return `${year}${month}`;
  }

  const getRunDate = (experimentID) => {
    const experiment = experiments_list.find(
      (experiment) => experiment.experimentID === experimentID
    );
    return experiment ? formatYearMonth(experiment.createdAt) : undefined;
  };

  const getModule = (experimentID) => {
    const experiment = experiments_list.find(
      (experiment) => experiment.experimentID === experimentID
    );
    return experiment ? experiment.experimentModuleName : undefined;
  };
  const handleConfirm = async () => {
    const moduleName = getModule(experimentID);
    const experimentBasePath = `accounts/${currentCompany.companyName}_${
      currentCompany.companyID
    }/data_bucket/${moduleName}/${getRunDate(experimentID)}/${experimentID}`;
    const dataConnectionPayload = {
      filePath: `${experimentBasePath}/${dataTypes[dataType]}.csv`,
    };
    console.log("Data Conn Payload", dataConnectionPayload);
    await handleOpenTGInternalDataConnectionData(dataConnectionPayload);

    await loadTGInternalConnectionDataDetails(
      dataConnectionPayload,
      userInfo.userID
    );
    setExperimentID(null);
    setDataType(null);
  };
  const { experiments_list, loadExperiementsList } = useExperiment();

  const experimentComponentDict = Object.fromEntries(
    experiments_list
      .filter((experiment) => {
        try {
          const statusObj = JSON.parse(experiment.experimentStatus);
          return statusObj && statusObj.status === "Completed";
        } catch (e) {
          return false;
        }
      })
      .map((experiment) => [
        experiment.experimentID,
        () => (
          <Stack spacing={0.1} width={"30%"}>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "18px",
                textAlign: "left",
                color: theme.palette.text.modalHeading,
              }}
            >
              {experiment.experimentName}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "20px",
                color: "#475467",
                textAlign: "left",
              }}
            >
              {experiment.experimentID}
            </Typography>
          </Stack>
        ),
      ])
  );

  const experimentIDList = experiments_list
    .filter((experiment) => {
      let statusObj;

      // Attempt to parse experiment.experimentStatus
      try {
        statusObj = JSON.parse(experiment.experimentStatus);
      } catch (e) {
        // If parsing fails, assume it's not a valid JSON string
        statusObj = null;
      }

      // Check if the parsed object has "status" as "Completed"
      if (statusObj && statusObj.status === "Completed") {
        return true;
      }

      // Exclude other statuses
      return false;
    })
    .map((experiment) => experiment.experimentID);
  console.log("Experiments ID List", experimentIDList);

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
            TG Internal Dataset
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
          <Grid container padding="24px 16px 24px 16px" spacing={2}>
            <Grid item md={12}>
              <CustomAutocomplete
                disableClearable
                values={experimentIDList}
                selectedValues={experimentID}
                setSelectedValues={setExperimentID}
                optionComponentDict={experimentComponentDict}
                label={"Select Experiment ID"}
                placeholder={"Select Experiment ID"}
                showLabel
              />
            </Grid>
            <Grid item md={12}>
              <CustomAutocomplete
                disableClearable
                values={Object.keys(dataTypes)}
                selectedValues={dataType}
                setSelectedValues={setDataType}
                label={"Select Data Type"}
                placeholder={"Select Data Type"}
                showLabel
              />
            </Grid>
          </Grid>
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
      {tgInternalDataConnectionDataOpen && (
        <TGInternalDataConnectionData
          open={tgInternalDataConnectionDataOpen}
          handleClose={handleCloseTGInternalDataConnectionData}
          dataConnectionPayload={payload}
        />
      )}
    </Box>
  );
}
