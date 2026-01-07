import * as React from "react";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BYORDialog from "./BYOR";
import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchParquetData,
} from "../utils/s3Utils";
import useAuth from "../hooks/useAuth";
import useExperiment from "../hooks/useExperiment";
import useDashboard from "../hooks/useDashboard";
import CustomButton from "./CustomButton";
import CustomAutocomplete from "../components/CustomInputControls/CustomAutoComplete";
import CustomDataset from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/CustomDataset";
import NewCustomDataset from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/NewCustomDataset";
import CustomQueryBYORDialog from "./CustomQueryBYORDialog";
import useSession from "../hooks/useSession";

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

const cardData = [
  {
    title: "Select from Existing Reports",
    description:
      "Choose from your available reports to perform group and aggregated actions. Access pre-configured datasets and visualizations quickly.",
    optionType: "existing-reports",
    disabled: false,
  },
  {
    title: "Create a Custom Query",
    description:
      "Build a custom query to fetch and transform data according to your specific requirements. Perfect for advanced analysis and specialized use cases.",
    optionType: "custom-query",

    disabled: false,
  },
];

export default function DataFetchingDialog({ open, handleClose, baseDatasets , baseDataFetchToggle }) {
  const [openExistingReportsDialog, setOpenExistingReportsDialog] =
    useState(false);
  const [openCustomQueryDialog, setOpenCustomQueryDialog] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState("");
  const [byorDialogOpen, setBYORDialogOpen] = useState(false);
  const [dataType, setDataType] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { clearSession, terminateSession, currentSession } = useSession();
  const { userInfo, currentCompany } = useAuth()
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
  

  const mergedDataTypes = {
  ...dataTypes,
  ...Object.fromEntries(
    baseDatasets.map(name => [
      `BYOR: ${name}`, 
      `byor_base_datasets/${name}/output`
    ])
  )
};









  const handleCardSelection = (optionType, disabled) => {
    if (disabled) return;

    setSelectedOption(optionType);

    if (optionType === "existing-reports") {
      setOpenExistingReportsDialog(true);
      handleClose(); // Close the main dialog
    } else if (optionType === "custom-query") {
      setOpenCustomQueryDialog(true);
      handleClose(); // Close the main dialog
    }
  };

  const handleExistingReportsDialogClose = () => {
    setOpenExistingReportsDialog(false);
    setDataType(null);
  };

  const handleCustomQueryDialogClose = () => {
    if (currentSession?.sessionID) {
      const payload = {
        sessionID: currentSession.sessionID,
      };
      terminateSession(currentCompany, userInfo, payload);
      clearSession();
    }
    baseDataFetchToggle()
    setOpenCustomQueryDialog(false);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Construct the file path using experimentBasePath and dataType
      const filePath = `${experimentBasePath}/${mergedDataTypes[dataType]}.csv`;
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
      setOpenExistingReportsDialog(false);

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

  console.log("mergedDataTypes:", JSON.stringify(mergedDataTypes, null, 2));

  // Check if confirm button should be disabled
  const confirmDisabled = !dataType;

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
            Choose Data Fetching Method
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

        <DialogContent dividers>
          <Grid
            container
            fullWidth
            sx={{
              padding: "0px 0px 0px 0px",
              gap: "12px",
              marginTop: "-4px",
            }}
            justifyContent={"center"}
            alignContent={"center"}
          >
            {cardData.map((card, index) => {
              return (
                <Grid
                  item
                  md={5.7}
                  xs={12}
                  key={index}
                  sx={{
                    borderRadius: "8px",
                    border: "1px solid #D0D5DD",
                    padding: "16px",
                    flex: 1,
                    display: "flex",
                    cursor: card.disabled ? "default" : "pointer",
                    "&:hover": {
                      boxShadow: card.disabled
                        ? "none"
                        : "0px 4px 8px rgba(0, 0, 0, 0.1)",
                      transform: card.disabled ? "none" : "translateY(-2px)",
                      transition: "all 0.3s ease-in-out",
                    },
                    opacity: card.disabled ? 0.7 : 1,
                  }}
                >
                  <Stack
                    justifyContent={"space-between"}
                    spacing={1}
                    width="100%"
                  >
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "18px",
                          fontWeight: "600",
                          lineHeight: "18px",
                          textAlign: "left",
                          color: "#101828",
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          fontWeight: "400",
                          lineHeight: "18px",
                          textAlign: "left",
                          color: "#44546F",
                        }}
                      >
                        {card.description}
                      </Typography>
                    </Stack>
                    <Stack
                      direction={"row"}
                      justifyContent={"flex-end"}
                      alignItems={"center"}
                    >
                      <Box>
                        {card.disabled ? (
                          <Tooltip title="This feature is not available yet">
                            <span>
                              <CustomButton
                                title={"Select"}
                                outlined
                                disabled={card.disabled}
                              />
                            </span>
                          </Tooltip>
                        ) : (
                          <CustomButton
                            title={"Select"}
                            outlined
                            onClick={() =>
                              handleCardSelection(
                                card.optionType,
                                card.disabled
                              )
                            }
                          />
                        )}
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions>
          <CustomButton title="Cancel" onClick={handleClose} outlined />
        </DialogActions>
      </BootstrapDialog>

      {/* Existing Reports Dialog */}
      <BootstrapDialog
        onClose={handleExistingReportsDialogClose}
        aria-labelledby="existing-reports-dialog-title"
        open={openExistingReportsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            padding: "20px 26px 19px 26px",
            borderBottom: "1px solid #EAECF0",
          }}
          id="existing-reports-dialog-title"
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
            onClick={handleExistingReportsDialogClose}
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
                values={Object.keys(mergedDataTypes)}
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
          <CustomButton
            onClick={handleExistingReportsDialogClose}
            title={"Cancel"}
            outlined
          />
          <CustomButton
            onClick={handleConfirm}
            title={"Confirm"}
            loadable
            loading={loading}
            disabled={confirmDisabled}
          />
        </DialogActions>
      </BootstrapDialog>

      {/* Custom Query Dialog */}
      {openCustomQueryDialog && (
        <CustomQueryBYORDialog
          open={openCustomQueryDialog}
          handleClose={handleCustomQueryDialogClose}
          baseDatasets = {baseDatasets}
        />
      )}

      {/* BYOR Dialog */}
      {byorDialogOpen && (
        <BYORDialog
          open={byorDialogOpen}
          handleClose={handleCloseBYORDialog}
          data={sampleData}
          title={dataType || ""}
          fileName={dataType || ""}
          filePath={
            dataType ? `${experimentBasePath}/${mergedDataTypes[dataType]}.csv` : ""
          }
        />
      )}
    </Box>
  );
}
