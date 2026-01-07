import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Typography, Button } from "@mui/material";
import MUIDataTable, { TableFilterList } from "mui-datatables";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/material";
import CustomPagination from "./CustomPagination";
import { ReactComponent as Refresh } from "../../src/assets/Icons/refresh.svg";
import { ReactComponent as FilterIcon } from "../assets/Icons/Filters lines.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Download as DownloadIcon,
  Search as SearchIcon,
  // FilterList as FilterIcon,
  ViewColumn as ColumnsIcon,
  RefreshOutlined,
  KeyboardDoubleArrowDown,
} from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { format, parseISO } from "date-fns";
import ErrorWrapper from "./ErrorWrapper";
import useDashboard from "../hooks/useDashboard";
import useAuth from "../hooks/useAuth";
import {
  fetchCSVData,
  fetchParquetData,
  loadBatchData,
} from "../utils/s3Utils";
import {
  downloadFileUsingPreSignedURL,
  downloadParquetFileUsingPreSignedURL,
} from "../redux/actions/dashboardActions";
import CustomFilterDialog from "./CustomFilterDialog";

import DeleteIcon from "@mui/icons-material/Delete";
import CustomScrollbar from "./CustomScrollbar";
import ContactSalesDialog from "./ContactSalesDialog";
import useExperiment from "../hooks/useExperiment";
import PushPinIcon from "@mui/icons-material/PushPin";
import { SUCCESS } from "../theme/custmizations/colors";
import useImpact from "../hooks/useImpact";

const transformData = (data) => {
  console.log("TransformedData Input Report", data);
  const keys = Object.keys(data);
  const length = data[keys[0]].length;
  const transformedData = [];

  for (let i = 0; i < length; i++) {
    const newObj = {};
    keys.forEach((key) => {
      const value = data[key][i];
      if (value === "") {
        newObj[key] = "None";
      } else if (value === " ") {
        newObj[key] = "";
      } else if (value === null) {
        // Skip this key-value pair if the value is null
        return;
      } else if (!isNaN(value)) {
        newObj[key] = parseFloat(value).toFixed(2);
      } else {
        newObj[key] = value;
      }
    });
    if (Object.keys(newObj).length > 0) {
      transformedData.push(newObj);
    }
  }

  console.log("Transformed Data", transformedData);

  return transformedData;
};

// const fileNameDict = {
//   "Forecasting Pivot": "forecast_data_pivot",
//   "DOI Details": "soh_data",
//   "Elasticity Detailed View": "scenario_planner_data",
//   "Metrics Deep dive": "post_model_metrics",
//   Forecast: "forecast_data",
//   "Forecast Pivot": "forecast_data_pivot",
//   "Prediction Interval": "forecast_prediction_interval",
//   "Disaggregated Forecast": "forecast_disaggregated",
//   "DOI Detailed View": "soh_data",
//   "Inventory Reorder Plan": "reorder_table",
//   "Stock Transfer": "stock_transfer_df",
//   "Potential Stock Wastage": "potential_stock_wastage",
//   "Raw Inventory": "inv_data",
//   "SOH Pivot": "soh_data_pivot",
//   "Bill Of Materials": "bill_of_material_inv_details",
//   "Price Optimization": "scenario_planner_data",
//   "Driver Elasticity": "coeffs",
//   "Model Metrics": "metric",
//   "Feature Importance": "feature_score",
//   "Future Granular Metrics": "future_data_metrics",
//   "Future Time Metrics": "time_metrics",
//   "Demand Alignment Report": "demand_alignment_report",
//   "Supply Plan": "production_plan_finished_goods",
//   "Forecast Value Pivot": "forecast_data_value_pivot",
// };

// const reverseFileNameDict = {
//   forecast_data_pivot: "Forecasting Pivot",
//   soh_data: "DOI Details", // Note: "DOI Detailed View" also maps to this, so it's the last occurrence
//   scenario_planner_data: "Price Optimization", // Note: "Elasticity Detailed View" also maps to this
//   post_model_metrics: "Metrics Deep dive",
//   forecast_data: "Forecast",
//   forecast_prediction_interval: "Prediction Interval",
//   forecast_disaggregated: "Disaggregated Forecast",
//   reorder_table: "Inventory Reorder Plan",
//   stock_transfer_df: "Stock Transfer",
//   potential_stock_wastage: "Potential Stock Wastage",
//   inv_data: "Raw Inventory",
//   soh_data_pivot: "SOH Pivot",
//   bill_of_material_inv_details: "Bill Of Materials",
//   coeffs: "Driver Elasticity",
//   metric: "Model Metrics",
//   feature_score: "Feature Importance",
//   future_data_metrics: "Future Granular Metrics",
//   time_metrics: "Future Time Metrics",
//   demand_alignment_report: "Demand Alignment Report",
//   production_plan_finished_goods: "Supply Plan",
//   forecast_data_value_pivot: "Forecast Value Pivot",
// };

const formatKey = (key) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (dateRegex.test(key)) {
    return format(parseISO(key), "MMM dd, yyyy");
  }
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

const CustomChip = ({ label, onDelete }) => {
  return (
    <Chip
      variant="outlined"
      label={label}
      onDelete={onDelete}
      sx={{
        fontFamily: "Inter",
        fontWeight: "400",
        "& .MuiChip-deleteIcon": {
          color: "#101828",
        },
      }}
    />
  );
};

const CustomFilterList = (props) => {
  return <TableFilterList {...props} ItemComponent={CustomChip} />;
};

const CustomReport = ({
  data,
  reportId,
  isAlreadyTransformed,
  title = "Table name",
  isFilterable,
  fileName,
}) => {
  const theme = useTheme();
  // console.log(data);
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();

  const customTheme = useMemo(
    () =>
      createTheme({
        ...theme,
        components: {
          MuiDialog: {
            styleOverrides: {
              root: {
                width: "100%",
                maxWidth: "unset", // Remove the default max width
                flex: 1, // This will make it occupy the full width
              },
            },
          },
          MUIDataTable: {
            styleOverrides: {
              root: {
                backgroundColor: "#fff",
                border: "none",
                boxShadow: "none",
                padding: "8px",
                paddingTop: "0px",
              },
            },
          },
          MUIDataTableSelectCell: {
            styleOverrides: {
              headerCell: {
                backgroundColor: "#FFF",
              },
              root: {
                backgroundColor: "#FFFFFF",
              },
            },
          },
          MUIDataTableHeadCell: {
            styleOverrides: {
              root: {
                backgroundColor: "#fff",
                textTransform: "none",
                whiteSpace: "nowrap", // Prevents wrapping
                overflow: "hidden", // Hides overflowed content
                textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                color: "#626F86",
                fontFamily: "Inter",
                fontSize: "14px",
                // fontWeight: 900,
                lineHeight: "24px",
                // textAlign: "center",
                // borderBottom: "1px solid #E0E0E0", // Add bottom border for grid
                padding: "2px 8px", // Reduce padding for denser appearance
              },
            },
          },
          MUIDataTableBodyCell: {
            styleOverrides: {
              root: {
                padding: "0px 4px", // Reduce padding for density
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#101828",
                lineHeight: "14px",
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&:nth-of-type(odd)": {
                  backgroundColor: "aliceblue",
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "#ffffff",
                },
                "&:hover": {
                  transition: "all 0.3s ease-in-out",
                  borderBottom: "1px solid #D6BBFB",
                  cursor: "pointer",
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                border: "1px solid #E0E0E0", // Add borders to simulate grid lines
                padding: "0px 4px", // Reduce padding for cleaner appearance
              },
            },
          },
        },
      }),
    [theme]
  );

  // const fileName = fileNameDict[title];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [tableData, setTableData] = useState(data);

  const {
    currentDimension,
    currentValue,
    InvCurrentDimension,
    InvCurrentValue,
    PriceCurrentDimension,
    PriceCurrentValue,
    setFilterOpen,
    filterOpen,
    setFilterOptions,
    dimensionFilterData,
    InvPriceFilterData,
    tablesFilterData,
    deleteCustomReport,
    experimentBasePath,
    setFrozenColumns,
    applyFilter,
  } = useDashboard();

  const reverseFileNameDict = {
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Forecasting Pivot",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Forecasting Pivot Disaggregated",
    [`${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "DOI Details",
    [`${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Elasticity Detailed View", // p
    [`${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Metrics Deep dive", // dimension: "feature", value: cd
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Forecast",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Forecast Pivot",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_prediction_interval`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Prediction Interval",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Disaggregated Forecast",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_distribution`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Forecast Distribution",
    [`${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "DOI Detailed View",
    [`${experimentBasePath}/scenario_planning/K_best/inventory_plan/reorder_table`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Inventory Reorder Plan",
    [`${experimentBasePath}/scenario_planning/K_best/inventory_plan/stock_transfer_df`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Stock Transfer",
    [`${experimentBasePath}/scenario_planning/K_best/inventory_plan/potential_stock_wastage`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Potential Stock Wastage",
    [`${experimentBasePath}/etl_data/202110/inv_data`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Raw Inventory",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/soh_data_pivot`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "SOH Pivot",
    [`${experimentBasePath}/scenario_planning/K_best/inventory_plan/bill_of_material_inv_details`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Bill Of Materials",
    [`${experimentBasePath}/scenario_planning/K_best/inventory_plan/bom_forecast`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Bill Of Materials Time Forecast",
    [`${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Price Optimization",
    [`${experimentBasePath}/stacking/future/K_best/coeffs`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Driver Elasticity",
    [`${experimentBasePath}/stacking/future/K_best/metric`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Model Metrics",
    [`${experimentBasePath}/feature_score/feature_score`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Feature Importance",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/future_data_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Future Granular Metrics",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/time_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Future Time Metrics",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Demand Alignment Report",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Demand Alignment Value Report",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_view1`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Demand Alignment View1 Report",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value_view1`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Demand Alignment Value View1 Report",
    [`${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Supply Plan",
    [`${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_forecast`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Production Plan",
    [`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_value_pivot`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Forecast Value Pivot",
    [`${experimentBasePath}/stacking/future/K_best/metric`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Overall Metrics",
    [`${experimentBasePath}/training/cluster/future/Xgboost/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Xgboost Metrics",
    [`${experimentBasePath}/training/cluster/future/Lgbm/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "LGBM Metrics",
    [`${experimentBasePath}/training/cluster/future/RandomForest/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Random Forest Metrics",
    [`${experimentBasePath}/training/cluster/future/Xgblinear/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Xgblinear Metrics",
    [`${experimentBasePath}/training/cluster/future/MLP/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "MLP Metrics",
    [`${experimentBasePath}/training/cluster/future/LSTM/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "LSTM Metrics",
    [`${experimentBasePath}/training/cluster/future/GRU/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "GRU Metrics",
    [`accounts/${currentCompany.companyName}_${currentCompany.companyID}/impact_pipelines/${impactPipeline.impactPipelineName}_${impactPipeline.impactPipelineID}/${currentImpactMetricsFeature}.csv`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Metrics Analysis",
    [`${experimentBasePath}/optimization/score_predictions`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Propensity Score",
    [`${experimentBasePath}/optimization/propensity_predictions`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Probability Score",
    [`${experimentBasePath}/optimization/actions`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Recommended Actions",
    [`${experimentBasePath}/optimization/customer_profile`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Customer Profile",
    [`${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Accuracy Scorecard",
    [`${experimentBasePath}/optimization/threshold_df`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "F1 Threshold",
    [`${experimentBasePath}/scenario_planning/predictions/final_predictions`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Binary Classification Predictions",
    [`${experimentBasePath}/scenario_planning/predictions/final_predictions`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Regression Predictions",
    [`${experimentBasePath}/training/virtual_future_run/Xgboost/ts_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "XgBoost",
    [`${experimentBasePath}/training/virtual_future_run/Lgbm/ts_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "Lgbm",
    [`${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_")]: "MLP",
  };
  const { experiment_config } = useExperiment();

  const fileNamePathDict = {
    "Forecasting Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    "Forecasting Pivot Disaggregated": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
    "DOI Details": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
    "Elasticity Detailed View": `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`, // p
    "Metrics Deep dive": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`, // dimension: "feature", value: cd
    Forecast: `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`,
    "Forecast Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    "Prediction Interval": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_prediction_interval.csv`,
    "Disaggregated Forecast": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
    "Forecast Distribution": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_distribution.csv`,
    "DOI Detailed View": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
    "Inventory Reorder Plan": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/reorder_table.csv`,
    "Stock Transfer": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/stock_transfer_df.csv`,
    "Potential Stock Wastage": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/potential_stock_wastage.csv`,
    "Raw Inventory": `${experimentBasePath}/etl_data/202110/inv_data.csv`,
    "SOH Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/soh_data_pivot.csv`,
    "Bill Of Materials": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/bill_of_material_inv_details.csv`,
    "Bill Of Materials Time Forecast": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/bom_forecast.csv`,
    "Price Optimization": `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
    "Driver Elasticity": `${experimentBasePath}/stacking/future/K_best/coeffs.csv`,
    "Model Metrics": `${experimentBasePath}/stacking/future/K_best/metric.csv`,
    "Feature Importance": `${experimentBasePath}/feature_score/feature_score.csv`,
    "Future Granular Metrics": `${experimentBasePath}/scenario_planning/K_best/forecast/future_data_metrics.csv`,
    "Future Time Metrics": `${experimentBasePath}/scenario_planning/K_best/forecast/time_metrics.csv`,
    "Demand Alignment Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report.csv`,
    "Demand Alignment Value Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value.csv`,
    "Supply Plan": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods.csv`,
    "Production Plan": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_forecast.csv`,
    "Forecast Value Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_value_pivot.csv`,
    "Overall Metrics": `${experimentBasePath}/stacking/future/K_best/metric.csv`,
    "Xgboost Metrics": `${experimentBasePath}/training/cluster/future/Xgboost/metrics.csv`,
    "LGBM Metrics": `${experimentBasePath}/training/cluster/future/Lgbm/metrics.csv`,
    "Random Forest Metrics": `${experimentBasePath}/training/cluster/future/RandomForest/metrics.csv`,
    "Xgblinear Metrics": `${experimentBasePath}/training/cluster/future/Xgblinear/metrics.csv`,
    "MLP Metrics": `${experimentBasePath}/training/cluster/future/MLP/metrics.csv`,
    "LSTM Metrics": `${experimentBasePath}/training/cluster/future/LSTM/metrics.csv`,
    "GRU Metrics": `${experimentBasePath}/training/cluster/future/GRU/metrics.csv`,
    "Metrics Analysis": `accounts/${currentCompany.companyName}_${currentCompany.companyID}/impact_pipelines/${impactPipeline.impactPipelineName}_${impactPipeline.impactPipelineID}/${currentImpactMetricsFeature}.csv`,
    "Propensity Score": `${experimentBasePath}/optimization/score_predictions.csv`,
    "Probability Score": `${experimentBasePath}/optimization/propensity_predictions.csv`,
    "Recommended Actions": `${experimentBasePath}/optimization/actions.csv`,
    "Customer Profile": `${experimentBasePath}/optimization/customer_profile.csv`,
    "Accuracy Scorecard": `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics.csv`,
    "F1 Threshold": `${experimentBasePath}/optimization/threshold_df.csv`,
    "Binary Classification Predictions": `${experimentBasePath}/scenario_planning/predictions/final_predictions.csv`,
    "Regression Predictions": `${experimentBasePath}/scenario_planning/predictions/final_predictions.csv`,
    XgBoost: `${experimentBasePath}/training/virtual_future_run/Xgboost/ts_metrics.csv`,
    Lgbm: `${experimentBasePath}/training/virtual_future_run/Lgbm/ts_metrics.csv`,
    MLP: `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics.csv`,
  };

  const newTitle = reverseFileNameDict[fileName];
  const filePath = fileNamePathDict[newTitle];

  const { hasParquetFiles } = useExperiment();
  const { impactPipeline, currentImpactMetricsFeature } = useImpact();

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const loadBatch = useCallback(
    async (batch_no, fileName, reportId) => {
      // setLoading(true); // Set loading state to true when download starts
      // console.log("Downloading file...");

      const changables = ["Cluster", "Forecast_Granularity"];
      const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

      const convert = (dimension) => {
        if (changables.includes(dimension)) {
          return dict[dimension];
        }
        return dimension;
      };

      let myCurrentDimension;
      let myCurrentValue;

      switch (reverseFileNameDict[fileName]) {
        case "Forecasting Pivot":
          myCurrentDimension =
            currentDimension === "Forecast_Granularity"
              ? "all"
              : convert(currentDimension);
          myCurrentValue = currentValue;
          break;

        case "Forecasting Pivot Disaggregated":
          myCurrentDimension =
            currentDimension === "Forecast_Granularity"
              ? "all"
              : convert(currentDimension);
          myCurrentValue = currentValue;
          break;

        case "DOI Details":
          myCurrentDimension = convert(InvCurrentDimension);
          myCurrentValue = InvCurrentValue;
          break;
        case "Elasticity Detailed View":
          myCurrentDimension = convert(PriceCurrentDimension);
          myCurrentValue = PriceCurrentValue;
          break;

        case "Metrics Deep dive":
          myCurrentDimension = "feature";
          myCurrentValue = currentDimension;
          break;

        default:
          myCurrentDimension = "all";
          myCurrentValue = "all";
          break;
      }
      const filterData = tablesFilterData[fileName]?.[reportId]?.filterData ?? {
        dimensionFilters: {
          [myCurrentDimension]: [myCurrentValue],
        },
        columnFilter: [],
        selectAllColumns: true,
      };
      try {
        const data = await (hasParquetFiles
          ? fetchParquetData({
              filePath: filePath,
              filterData: filterData,
              paginationData: { batchNo: batch_no, batchSize: 50 },
              sortingData: null,
            })
          : fetchCSVData({
              filePath: filePath,
              filterData: filterData,
              paginationData: { batchNo: batch_no, batchSize: 50 },
              sortingData: null,
            }));
        return data;
      } catch (error) {
        console.error("Error during batch loading:", error);
      }
    },
    [
      title,
      userInfo.userID,
      currentCompany.companyName,
      currentDimension,
      currentValue,
      InvCurrentDimension,
      InvCurrentValue,
      PriceCurrentDimension,
      PriceCurrentValue,
      tablesFilterData,
    ]
  );

  useEffect(() => {
    const loadBatchData = async (batchNo, reportId) => {
      // Load the new data for the current batch
      console.log("Load Batch Data Called At report");
      const newData = await loadBatch(batchNo, fileName, reportId);

      if (newData) {
        setTableData((prevData) => {
          // Assuming the data structure is consistent
          const updatedData = { ...prevData };

          console.log("Initial Updated Data", updatedData);

          console.log(updatedData);
          const keys = Object.keys(newData);
          console.log("keys", keys);

          // Range for the new batch
          const start = 50 * (batchNo - 1);
          const end = Math.min(50 * batchNo, start + newData[keys[0]].length);
          console.log("start", start);
          console.log("end", end);
          // Iterate through each key and set values outside the batch to ""
          keys.forEach((key) => {
            const newDataArray = newData[key];
            console.log("key", key);
            console.log("New Data Array", newDataArray);
            let n = updatedData[Object.keys(updatedData)[0]].length;
            if (n < end) {
              n = n + newDataArray.length;
            }
            console.log("N", n);

            const newArray = Array.from({ length: n }).fill(" ");
            for (let index = start; index < end; index++) {
              newArray[index] = newDataArray[index - start];
            }
            const maxLength = (batchNo - 1) * 50 + newDataArray.length;
            let finalArray = [];
            for (let i = 0; i < maxLength; i++) {
              finalArray[i] = newArray[i];
            }

            // });

            newData[key] = finalArray; // Update the key with the new array
          });
          console.log("Updated Data Paginated", updatedData);
          return newData;
        });
        return true;
      } else {
        // toast.error("No data found at this filter");
        // console.log("No data found");
      }
      return false;
      // Create a copy of the existing table data, and replace data for the current batch
    };

    // Trigger loading of new batch when moving to a new batch range
    if (currentPage % 5 === 1 || currentPage % 5 === 0) {
      const batchNo = Math.ceil(currentPage / 5);
      const result = loadBatchData(batchNo, reportId);
      if (result) {
        setCurrentBatch(batchNo);
      } else {
        toast.error("No data found at this filter");
        console.log("No data found");
      }
    }
  }, [currentPage, fileName, tablesFilterData]);
  const transformedData = useMemo(() => {
    return isAlreadyTransformed ? tableData : transformData(tableData);
  }, [tableData, isAlreadyTransformed]);

  // Get frozen columns from filterData
  const frozenColumns = useMemo(() => {
    return (
      tablesFilterData[fileName]?.[reportId]?.filterData?.frozenColumns || []
    );
  }, [tablesFilterData, fileName, reportId]);

  // Add getLeftPosition calculation
  const getLeftPosition = useCallback(
    (columnKey) => {
      if (!frozenColumns.includes(columnKey)) return 0;

      const frozenIndex = frozenColumns.indexOf(columnKey);
      let position = 48; // Initial position for checkbox column

      for (let i = 0; i < frozenIndex; i++) {
        const prevColumn = frozenColumns[i];
        const startIdx = (currentPage - 1) * 10;
        const endIdx = startIdx + 10;
        const visibleRows = transformedData.slice(startIdx, endIdx);
        const columnValues = visibleRows.map((row) =>
          String(row[prevColumn] || "")
        );
        const headerWidth = formatKey(prevColumn).length * 8;
        const contentWidth = Math.max(
          ...columnValues.map((val) => val.length * 8)
        );
        const columnWidth = Math.max(
          149,
          Math.min(300, Math.max(headerWidth, contentWidth) + 32)
        );
        position += columnWidth;
      }
      return position;
    },
    [frozenColumns, currentPage, transformedData]
  );

  const columns = useMemo(() => {
    if (transformedData.length === 0) return [];

    const fileFilterData =
      tablesFilterData[fileName]?.[reportId]?.filterData || {};
    const orderedColumns = fileFilterData.columnFilter || [];

    const columnOrder =
      Object.keys(fileFilterData).length === 0 ||
      fileFilterData.columnFilter.length === 0
        ? Object.keys(transformedData[0])
        : [...orderedColumns];

    return columnOrder.map((key, colIndex) => {
      const isNumeric = !transformedData
        .slice(0, Math.min(3, transformedData.length))
        .some((row) => {
          const value = row[key];
          return value !== null && value !== "" && isNaN(value);
        });

      const leftPosition = getLeftPosition(key);

      return {
        name: key,
        label: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              cursor: "default",
            }}
          >
            {formatKey(key)}
            <IconButton
              onClick={async (e) => {
                e.stopPropagation();
                const currentFrozen = frozenColumns;
                const isAlreadyFrozen = currentFrozen.includes(key);

                let newFrozenColumns;
                if (isAlreadyFrozen) {
                  newFrozenColumns = currentFrozen.slice(
                    0,
                    currentFrozen.indexOf(key)
                  );
                } else {
                  if (columnOrder.indexOf(key) === currentFrozen.length) {
                    newFrozenColumns = [...currentFrozen, key];
                  } else {
                    return;
                  }
                }
                await setFrozenColumns(newFrozenColumns);
                await applyFilter(fileName, title, reportId);
              }}
              size="medium"
              sx={{
                visibility:
                  columnOrder.indexOf(key) > frozenColumns.length
                    ? "hidden"
                    : "visible",
                padding: 0,
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              <PushPinIcon
                sx={{
                  fontSize: "20px",
                  color: frozenColumns.includes(key)
                    ? SUCCESS[700]
                    : "#66708550",
                  transform: "rotate(45deg)",
                }}
              />
            </IconButton>
          </div>
        ),
        options: {
          sort: false,
          setCellHeaderProps: () => ({
            style: frozenColumns.includes(key)
              ? {
                  position: "sticky",
                  left: leftPosition,
                  zIndex: 102,
                  backgroundColor: "#fff",
                  color: "#626F86",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  lineHeight: "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "none",
                  // Single border and shadow definition
                  boxShadow: "rgba(224, 224, 224, 1) 2px 0px 0px 0px",
                }
              : {
                  backgroundColor: "#fff",
                  color: "#626F86",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  lineHeight: "14px",
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "none",
                  // borderRight: "1px solid #E0E0E0",
                  // borderBottom: "1px solid #E0E0E0",
                },
          }),
          setCellProps: (cellData, dataIndex) => ({
            style: {
              minWidth: "150px",
              maxWidth: "300px",
              textAlign: isNumeric ? "right" : "left",
              color: "#101828",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              backgroundColor: dataIndex % 2 === 1 ? "#fff" : "aliceblue",
              fontFamily: "Inter",
              fontSize: "14px",
              lineHeight: "14px",
              ...(frozenColumns.includes(key) && {
                position: "sticky",
                left: leftPosition,
                zIndex: 101,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "2px",
                  backgroundColor: "#E0E0E0",
                  boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)",
                  zIndex: 105,
                },
              }),
            },
          }),
        },
      };
    });
  }, [transformedData, frozenColumns, getLeftPosition, currentPage]);

  const [loading, setLoading] = useState(false); // State to track loading

  const handleDownload = useCallback(async () => {
    setLoading(true); // Set loading state to true when download starts
    console.log("Downloading file...");

    const changables = ["Cluster", "Forecast_Granularity"];
    const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

    const convert = (dimension) => {
      if (changables.includes(dimension)) {
        return dict[dimension];
      }
      return dimension;
    };

    let tokenPayload = {};

    let filterData;
    switch (reverseFileNameDict[fileName]) {
      case "Forecasting Pivot":
        filterData = tablesFilterData[fileName]?.[reportId]?.filterData ?? {
          dimensionFilters: {
            [currentDimension]: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      case "Forecasting Pivot Disaggregated":
        filterData = tablesFilterData[fileName]?.[reportId]?.filterData ?? {
          dimensionFilters: {
            [currentDimension]: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      case "DOI Details":
        filterData = tablesFilterData[fileName]?.[reportId]?.filterData ?? {
          dimensionFilters: {
            [convert(InvCurrentDimension)]: [InvCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      case "Elasticity Detailed View":
        filterData = tablesFilterData[fileName]?.[reportId]?.filterData ?? {
          dimensionFilters: {
            [convert(PriceCurrentDimension)]: [PriceCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      case "Metrics Deep dive":
        filterData = tablesFilterData[fileName]?.[reportId]?.filterData ?? {
          dimensionFilters: {
            feature: [convert(currentDimension)],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      default:
        filterData = tablesFilterData[fileName]?.[reportId]?.filterData ?? {
          dimensionFilters: {},
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
    }
    const tokenPayloadForParquet = {
      filePath,
      fileName,
      companyName: currentCompany.companyName,
      filterData,
      paginationData: null,
      sortingData: null,
    };
    try {
      await downloadParquetFileUsingPreSignedURL(
        tokenPayloadForParquet,
        title,
        userInfo.userID
      );

      console.log("File download initiated");
    } catch (error) {
      console.error("Error during file download:", error);
    } finally {
      setLoading(false); // Set loading state to false when download finishes
    }
  }, [
    title,
    currentCompany.companyName,
    currentDimension,
    currentValue,
    InvCurrentDimension,
    InvCurrentValue,
    PriceCurrentDimension,
    PriceCurrentValue,
    tablesFilterData,
  ]);

  const handleFilterOpen = useCallback(async () => {
    const wholeData = (await hasParquetFiles)
      ? fetchParquetData({
          filePath: filePath,
          filterData: null,
          paginationData: { batchNo: 1, batchSize: 1 },
          sortingData: null,
        })
      : fetchCSVData({
          filePath: filePath,
          filterData: null,
          paginationData: { batchNo: 1, batchSize: 1 },
          sortingData: null,
        });
    let filterOptions = { columns: Object.keys(wholeData) };

    switch (reverseFileNameDict[fileName]) {
      case "Forecasting Pivot":
        filterOptions["dimensions"] = dimensionFilterData;
        break;

      case "DOI Details":
        filterOptions["dimensions"] = InvPriceFilterData;
        break;

      case "Elasticity Detailed View":
        filterOptions["dimensions"] = InvPriceFilterData;
        break;

      case "Metrics Deep dive":
        filterOptions["dimensions"] = dimensionFilterData;
        break;

      default:
        filterOptions["dimensions"] = {};
    }

    try {
      await setFilterOptions(filterOptions, fileName, reportId);
      console.log("filter opened");
    } catch (error) {
      console.error("Error setting filterOptions:", error);
    }
  }, [title]);
  const handleDeleteCustomReport = async () => {
    //delete custom report
    await deleteCustomReport(fileName, reportId);
  };
  const options = useMemo(
    () => ({
      selectableRows: "multiple",
      selectableRowsOnClick: true,
      resizableColumns: false,
      rowHover: false,
      draggable: true,
      filter: false,
      print: false,
      download: false,
      viewColumns: false, // Disable default CSV download button

      customToolbar: () => {
        return (
          <React.Fragment>
            {/* Show loading animation when downloading */}
            <IconButton
              onClick={
                currentCompany.download_reports
                  ? handleDownload
                  : () => setIsContactSalesDialogOpen(true)
              }
            >
              {loading ? (
                <KeyboardDoubleArrowDown
                  sx={{
                    animation: "arrowMove 1.5s linear infinite",
                    "@keyframes arrowMove": {
                      "0%": { transform: "translateY(-50%)" }, // Move from a position slightly above
                      "100%": { transform: "translateY(50%)" }, // Move down, but not fully out of view
                    },
                  }}
                />
              ) : (
                <DownloadIcon />
              )}
            </IconButton>
            <IconButton onClick={handleDeleteCustomReport}>
              <DeleteIcon />
            </IconButton>
          </React.Fragment>
        );
      },

      customFooter: (
        count,
        page,
        rowsPerPage,
        changeRowsPerPage,
        changePage
      ) => (
        <Box
          sx={{ padding: "24px", justifyContent: "flex-end", display: "flex" }}
        >
          <CustomPagination
            count={Math.ceil(count / 10)}
            page={currentPage}
            batch={currentBatch}
            onPageChange={(event, newPage) => {
              console.log("New page", newPage);
              setCurrentPage(newPage);
              changePage(newPage - 1);
            }}
          />
        </Box>
      ),
    }),
    [
      title,
      isFilterable,
      handleDownload,
      loading,
      currentPage,
      currentBatch,
      handleFilterOpen,
    ]
  );

  return (
    <ErrorWrapper>
      <ThemeProvider theme={customTheme}>
        <ToastContainer />
        <CustomScrollbar>
          <MUIDataTable
            title={
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#101828",
                  textAlign: "left",
                  lineHeight: "30px",
                }}
              >
                {title}
              </Typography>
            }
            data={transformedData}
            columns={columns}
            options={options}
          />
        </CustomScrollbar>
        <CustomFilterDialog
          fileName={fileName}
          reportId={reportId}
          reportName={title}
          open={filterOpen}
          handleClose={() => setFilterOpen(false)}
        />
        <ContactSalesDialog
          open={isContactSalesDialogOpen}
          handleClose={() => setIsContactSalesDialogOpen(false)}
          handleConfirm={handleContactSales}
          WarningText="Upgrade Your Subscription"
          ResultText="Upgrade your subscription or contact sales for more access."
          ConfirmButtonTitle="Contact Sales"
        />
      </ThemeProvider>
    </ErrorWrapper>
  );
};

export default CustomReport;
