"use client";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import BYORDialog from "./BYOR";
import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchParquetData,
} from "../utils/s3Utils";
import useAuth from "../hooks/useAuth";
import useExperiment from "../hooks/useExperiment";
import useDashboard from "../hooks/useDashboard";
import CustomButton from "../components/CustomButton";
import CustomAutocomplete from "../components/CustomInputControls/CustomAutoComplete";

// Styled Dialog component to match TGInternalDataConnection style
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

export default function CreateReportButton() {
  const [open, setOpen] = useState(false);
  const [byorDialogOpen, setBYORDialogOpen] = useState(false);
  const [dataType, setDataType] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { userInfo } = useAuth();
  const { hasParquetFiles } = useExperiment();
  const { experimentBasePath } = useDashboard();

  // Predefined data types with their file paths
  const dataTypes = {
    "Forecasting Pivot": `scenario_planning/K_best/forecast/forecast_data_pivot`,
    "Forecasting Pivot Disaggregated": `scenario_planning/K_best/forecast/forecast_disaggregated`,
    "DOI Details": `scenario_planning/K_best/inventory_plan/soh_data`,
    "Elasticity Detailed View": `scenario_planning/K_best/scenario_plan/scenario_planner_data`,
    "Metrics Deep dive": `scenario_planning/K_best/post_model_demand_pattern/post_model_metrics`,
    Forecast: `scenario_planning/K_best/forecast/forecast_data`,
    "Prediction Interval": `scenario_planning/K_best/forecast/forecast_prediction_interval`,
    "Forecast Distribution": `scenario_planning/K_best/forecast/forecast_distribution`,
    "Inventory Reorder Plan": `scenario_planning/K_best/inventory_plan/reorder_table`,
    "Stock Transfer": `scenario_planning/K_best/inventory_plan/stock_transfer_df`,
    "Potential Stock Wastage": `scenario_planning/K_best/inventory_plan/potential_stock_wastage`,
    "Raw Inventory": `etl_data/202110/inv_data`,
    "SOH Pivot": `scenario_planning/K_best/forecast/soh_data_pivot`,
    "Bill Of Materials": `scenario_planning/K_best/inventory_plan/bill_of_material_inv_details`,
    "Price Optimization": `scenario_planning/K_best/scenario_plan/scenario_planner_data`,
    "Driver Elasticity": `stacking/future/K_best/coeffs`,
    "Model Metrics": `stacking/future/K_best/metric`,
    "Feature Importance": `feature_score/feature_score`,
    "Future Granular Metrics": `scenario_planning/K_best/forecast/future_data_metrics`,
    "Future Time Metrics": `scenario_planning/K_best/forecast/time_metrics`,
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setDataType(null);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Construct the file path using experimentBasePath and dataType
      const filePath = `${experimentBasePath}/${dataTypes[dataType]}.csv`;
      console.log("Fetching data from:", filePath);

      // Fetch sample data from the selected dataset
      const fetchedData = await (hasParquetFiles
        ? fetchParquetData({
            filePath: filePath,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 100 }, // Get first 100 rows
            sortingData: null,
          })
        : fetchCSVData({
            filePath: filePath,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 100 }, // Get first 100 rows
            sortingData: null,
          }));

      console.log(
        "Sample data fetched:",
        fetchedData ? "Data available" : "No data"
      );

      // Make sure we have data before proceeding
      if (
        !fetchedData ||
        (Array.isArray(fetchedData) && fetchedData.length === 0)
      ) {
        setLoading(false);
        console.error("No data returned from the dataset");
        setLoading(false);
        alert(
          "No data available in the selected dataset. Please choose another dataset."
        );

        return;
      }

      setSampleData(fetchedData);
      setLoading(false);
      setOpen(false);

      // Add a small delay before opening the BYOR dialog to ensure state updates
      setTimeout(() => {
        console.log("Opening BYOR dialog");
        setBYORDialogOpen(true);
      }, 100);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch dataset sample:", error);
      alert(
        "Failed to fetch dataset data. Please try again or select another dataset."
      );
    }
  };

  const handleCloseBYORDialog = () => {
    setBYORDialogOpen(false);
    setDataType(null);
    setSampleData(null);
  };

  // Check if confirm button should be disabled
  const confirmDisabled = !dataType;

  return (
    <Box>
      <CustomButton
        onClick={handleOpenDialog}
        title="Create New Report"
        startIcon={<AddIcon />}
      />

      {/* Dataset Selection Dialog */}
      <BootstrapDialog
        onClose={handleCloseDialog}
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
            Create New Report
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
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
                values={Object.keys(dataTypes)}
                selectedValues={dataType}
                setSelectedValues={setDataType}
                label={"Select Data Type"}
                placeholder={"Select Data Type"}
                showLabel
              />
            </Grid>

            {loading && (
              <Grid
                item
                md={12}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <CircularProgress />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <CustomButton onClick={handleCloseDialog} title={"Cancel"} outlined />
          <CustomButton
            onClick={handleConfirm}
            title={"Confirm"}
            loadable
            loading={loading}
            disabled={confirmDisabled}
          />
        </DialogActions>
      </BootstrapDialog>

      {/* BYOR Dialog */}
      {byorDialogOpen && (
        <BYORDialog
          open={byorDialogOpen}
          handleClose={handleCloseBYORDialog}
          data={sampleData}
          title={dataType || ""}
          fileName={dataType || ""}
          filePath={
            dataType ? `${experimentBasePath}/${dataTypes[dataType]}.csv` : ""
          }
        />
      )}
    </Box>
  );
}
