import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  Box,
  IconButton,
  Typography,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControlLabel,
  Checkbox,
  Switch,
  TableCell,
  Divider,
  TableRow,
  TableFooter,
  Skeleton,
} from "@mui/material";
import MUIDataTable, { TableFilterList } from "mui-datatables";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/material";
import CustomPagination from "./CustomPagination";
import { ReactComponent as Refresh } from "../../src/assets/Icons/refresh.svg";
import { ReactComponent as FilterIcon } from "../assets/Icons/Filters lines.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import BuildIcon from "@mui/icons-material/Build";
import CodeIcon from "@mui/icons-material/Code";
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  // FilterList as FilterIcon,
  ViewColumn as ColumnsIcon,
  KeyboardDoubleArrowDown,
  BorderColor,
} from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { format, parseISO } from "date-fns";
import ErrorWrapper from "./ErrorWrapper";
import useDashboard from "../hooks/useDashboard";
import useAuth from "../hooks/useAuth";
import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchParquetData,
  getAggregatedValue,
  fetchTxtFromS3,
  loadBatchData,
  uploadJsonToS3,
} from "../utils/s3Utils";
import {
  downloadFileUsingPreSignedURL,
  downloadParquetFileUsingPreSignedURL,
} from "../redux/actions/dashboardActions";

import CustomFilterDialog from "./CustomFilterDialog";

import SaveReportDialog from "./SaveReportDialog";

import CustomReportWrapper from "./CustomReportWrapper";
import SaveIcon from "@mui/icons-material/Save";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomScrollbar from "./CustomScrollbar";
import { SUCCESS, WARNING } from "../theme/custmizations/colors";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CustomTooltip from "./CustomToolTip";
import { styled } from "@mui/material";
import useConfig from "../hooks/useConfig";
import { setExperimentBasePath } from "./../redux/actions/dashboardActions";
import ContactSalesDialog from "./ContactSalesDialog";
import CustomButton from "./CustomButton";
import useExperiment from "../hooks/useExperiment";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import UploadFileDialog from "./UploadFileDialog";
import PushPinIcon from "@mui/icons-material/PushPin";
import FunctionsIcon from "@mui/icons-material/Functions";
import useImpact from "../hooks/useImpact";
import BYORDialog from "./BYOR";
import { callQueryEngineQuery } from "../utils/queryEngine";
import EditorDialog from "./EditorDialog";
import CustomBYORFilterDialog from "./CustomBYORFilterDialog";
import { config } from "aws-sdk";
import useModule from "../hooks/useModule";
import { useParams } from "react-router-dom";
import { oldFlowModules } from "./../utils/oldFlowModules";
import { parallelChunkMap } from "../utils/parallelChunkMap";
import store from "../redux/store";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 32,
  height: 16,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "500ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: SUCCESS[700],
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: SUCCESS[700],
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: SUCCESS[700],
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 12,
    height: 12,
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));
function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

function isFloat(str) {
  const num = Number(str);
  return !isNaN(num) && !Number.isInteger(num);
}

const formatKey = (key) => {
  const dateRegex = /\d{4}-\d{2}-\d{2}/;

  // Find any date pattern in the key
  const dateMatch = key.match(dateRegex);

  if (dateMatch) {
    const date = dateMatch[0];
    const formattedDate = format(parseISO(date), "MMM dd, yyyy");
    // Replace the date pattern with formatted date while keeping rest of the key
    return key
      .replace(date, formattedDate)
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  }

  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
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

// Add this component before CustomTable
const FrozenColumnBorder = ({ left }) => (
  <Box
    sx={{
      position: "fixed",
      left: left - 2,
      top: "auto", // Remove fixed top
      bottom: "auto", // Remove fixed bottom
      width: "2px",
      backgroundColor: "#E0E0E0",
      zIndex: 105,
      pointerEvents: "none",
      height: "inherit", // Inherit parent's height
      ".MUIDataTable-tableContainer &": {
        // Target when inside table container
        height: "100%",
        position: "absolute",
        top: 0,
        bottom: 0,
      },
    }}
  />
);

const CustomTable = ({
  data = {},
  isAlreadyTransformed,
  title = "Table name",
  alternateTitle = null,
  isFilterable = true,
  isEditable,
  valueFileTitle = null,
  isEditableColumn = (value) => {
    return false;
  },
  isRowEditable = (rowDimensionValue) => {
    return false;
  },
  editableRowDimensionValues = [],
  rowDimension = null,
  getTimeStamp,
  oc_path = null,
  enableFileUpload,
  enableAggregation = false,
  datasetPath = null, // Add this prop
  reportTitle = null,
  customColumns = null,
  isBaseData = false,
  showValueLable = null,
  isBYOREnabled = true,
}) => {
  const theme = useTheme();
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
    supplyPlanFilterData,
    tablesFilterData,
    saveReportOpen,
    setSaveReportOpen,
    setFrozenColumns,
    applyFilter,
    setAggregatedValues,
    autoCalculateSums,
    setAutoCalculateSums,
    filterOptions,
    setSelectAllColumns,
    loadBYORConfig,
    clearBYORData,
    BYORConfig,
    BYORData,
    lastSyncedTime,
  } = useDashboard();
  const { hasParquetFiles } = useExperiment();
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  // State to manage table data
  const {
    editedFiles,
    editHistories,
    setEditHistories,
    setEditedFile,
    configState,
    loadFilterToConfig,
  } = useConfig();

  const [editorOpen, setEditorOpen] = useState(false);
  const setOCCache = async () => {
    if (oc_path) {
      const path = `${experimentBasePath}/${oc_path}`;
      try {
        const oc_data = await fetchCSVFromS3(
          path,
          "",
          true,
          userInfo.userID,
          true
        );
        return true;
      } catch (error) {
        return false;
      }
    }
  };
  /*  useEffect(() => {
    if (!hasParquetFiles) {
      setOCCache();
    }
    //console.log("origional data", data);
  }, []); */

  // useEffect(() => {
  //   if(!experimentBasePath) return;
  //   const filterData = tablesFilterData?.[fileName]?.["Default"]?.filterData
  //     ? {
  //         ...tablesFilterData[fileName]["Default"].filterData,
  //         aggregatedValuesHistory: []
  //       }
  //     : null;
  //   const convertedExperimentBasePath = experimentBasePath.split("/").join("_");
  //   console.log("ConvertedExpBasePath: ",convertedExperimentBasePath)
  //   const shortFileName = fileName.split(`${convertedExperimentBasePath}_`).pop();
  //   console.log("ShortFileName: ",shortFileName)
  //   if (filterData) {
  //     loadFilterToConfig(filterData,shortFileName)
  //   }
  // }, [tablesFilterData]);

  const transformData = async (data, editedCells, editState) => {
    if (Object.keys(data).length === 0) return [];
    console.log("TransformedData Input", data);
    const keys = Object.keys(data);

    const length = data[keys[0]].length;
    const ts_id_cols = ["Metrics Analysis"].includes(title)
      ? []
      : [
          "Demand Alignment View1 Report",
          "Demand Alignment Value View1 Report",
        ].includes(title)
      ? configState.scenario_plan.demand_alignment_report.ts_id_view1
      : configState.data.ts_id_columns;

    const transformedData = [];

    // Iterate over each row
    for (let i = 0; i < length; i++) {
      const ts_id_array = ts_id_cols.map(
        (ts_id_col) => data[ts_id_col]?.[i] ?? null
      );
      const ts_id = ts_id_array.join("_");
      const rowDimensionValue = rowDimension
        ? data[rowDimension]?.[i] ?? null
        : null;
      const newObj = {};

      // Iterate over each column (key)
      await parallelChunkMap(
        keys,
        (key) => {
          let value = data[key][i];
          if (editState) {
            const editedCell = editedCells.find(
              (cell) =>
                cell.ts_id === ts_id &&
                cell.columnName === key &&
                (rowDimensionValue === null ||
                  cell.rowDimensionValue === rowDimensionValue)
            );

            if (editedCell) {
              if (editState) {
                value = editedCell.finalValue.toString();
              } else {
                value = editedCell.initialValue;
              }
            }
          }

          if (value === "") {
            newObj[key] = "None";
          } else if (value === " ") {
            newObj[key] = "";
          } else if (value === null) {
            newObj[key] = "";
            return;
          } else if (!isNaN(value)) {
            if (isFloat(value)) {
              newObj[key] = parseFloat(value).toFixed(2);
            } else {
              newObj[key] = value;
            }
          } else {
            newObj[key] = value;
          }
        },
        10
      );
      // keys.forEach((key) => {
      //   let value = data[key][i];
      //   if (editState) {
      //     const editedCell = editedCells.find(
      //       (cell) =>
      //         cell.ts_id === ts_id &&
      //         cell.columnName === key &&
      //         (rowDimensionValue === null ||
      //           cell.rowDimensionValue === rowDimensionValue)
      //     );

      //     if (editedCell) {
      //       if (editState) {
      //         value = editedCell.finalValue.toString();
      //       } else {
      //         value = editedCell.initialValue;
      //       }
      //     }
      //   }

      //   if (value === "") {
      //     newObj[key] = "None";
      //   } else if (value === " ") {
      //     newObj[key] = "";
      //   } else if (value === null) {
      //     newObj[key] = "";
      //     return;
      //   } else if (!isNaN(value)) {
      //     if (isFloat(value)) {
      //       newObj[key] = parseFloat(value).toFixed(2);
      //     } else {
      //       newObj[key] = value;
      //     }
      //   } else {
      //     newObj[key] = value;
      //   }
      // });

      // If the object has any values, add it to the transformed data
      if (Object.keys(newObj).length > 0) {
        transformedData.push(newObj);
      }
    }

    console.log("Transformed Data at function", transformedData);
    return transformedData;
  };
  const getTSID = (data, row) => {
    const ts_id_cols = ["Metrics Analysis"].includes(title)
      ? []
      : [
          "Demand Alignment View1 Report",
          "Demand Alignment Value View1 Report",
        ].includes(title)
      ? configState.scenario_plan.demand_alignment_report.ts_id_view1
      : configState.data.ts_id_columns;
    const ts_id_array = ts_id_cols.map((ts_id_col) => data[row][ts_id_col]);
    return ts_id_array.join("_");
  };
  const { experimentBasePath, updateBYORFilterData, saveBYORConfig } =
    useDashboard();
  const { impactPipeline, currentImpactMetricsFeature } = useImpact();
  const fileNameDict = {
    "Forecasting Pivot":
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Forecasting Pivot Disaggregated":
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "DOI Details":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Elasticity Detailed View":
      `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data`
        .split(".csv")[0]
        .split("/")
        .join("_"), // p
    "Metrics Deep dive":
      `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"), // dimension: "feature", value: cd
    Forecast:
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Forecast Pivot":
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Prediction Interval":
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_prediction_interval`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Disaggregated Forecast":
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Forecast Distribution":
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_distribution`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "DOI Detailed View":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Inventory Reorder Plan":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/reorder_table`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Stock Transfer":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/stock_transfer_df`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Potential Stock Wastage":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/potential_stock_wastage`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Raw Inventory": `${experimentBasePath}/etl_data/202110/inv_data`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "SOH Pivot":
      `${experimentBasePath}/scenario_planning/K_best/forecast/soh_data_pivot`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Bill Of Materials":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/bill_of_material_inv_details`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Bill Of Materials Time Forecast":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/bom_forecast`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Price Optimization":
      `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Driver Elasticity": `${experimentBasePath}/stacking/future/K_best/coeffs`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Model Metrics": `${experimentBasePath}/stacking/future/K_best/metric`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Overall Metrics": `${experimentBasePath}/stacking/future/K_best/metric`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Feature Importance": `${experimentBasePath}/feature_score/feature_score`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Future Granular Metrics":
      `${experimentBasePath}/scenario_planning/K_best/forecast/future_data_metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Future Time Metrics":
      `${experimentBasePath}/scenario_planning/K_best/forecast/time_metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Demand Alignment Report":
      `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Demand Alignment Value Report":
      `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value`
        .split(".csv")[0]
        .split("/")
        .join("_"),

    "Demand Alignment View1 Report":
      `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_view1`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Demand Alignment Value View1 Report":
      `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value_view1`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Supply Plan":
      `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Production Plan":
      `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_forecast`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Forecast Value Pivot":
      `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_value_pivot`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Overall Metrics": `${experimentBasePath}/stacking/future/K_best/metric`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Xgboost Metrics":
      `${experimentBasePath}/training/cluster/future/Xgboost/metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "LGBM Metrics": `${experimentBasePath}/training/cluster/future/Lgbm/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Random Forest Metrics":
      `${experimentBasePath}/training/cluster/future/RandomForest/metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Xgblinear Metrics":
      `${experimentBasePath}/training/cluster/future/Xgblinear/metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "MLP Metrics": `${experimentBasePath}/training/cluster/future/MLP/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "LSTM Metrics": `${experimentBasePath}/training/cluster/future/LSTM/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "GRU Metrics": `${experimentBasePath}/training/cluster/future/GRU/metrics`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Metrics Analysis":
      `accounts/${currentCompany.companyName}_${currentCompany.companyID}/impact_pipelines/${impactPipeline.impactPipelineName}_${impactPipeline.impactPipelineID}/${currentImpactMetricsFeature}.csv`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Propensity Score": `${experimentBasePath}/optimization/score_predictions`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Probability Score":
      `${experimentBasePath}/optimization/propensity_predictions`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Recommended Actions": `${experimentBasePath}/optimization/actions`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Customer Profile": `${experimentBasePath}/optimization/customer_profile`
      .split(".csv")[0]
      .split("/")
      .join("_"),

    "Accuracy Scorecard":
      `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "F1 Threshold": `${experimentBasePath}/optimization/threshold_df`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    "Binary Classification Predictions":
      `${experimentBasePath}/scenario_planning/predictions/final_predictions`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Regression Predictions":
      `${experimentBasePath}/scenario_planning/predictions/final_predictions`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    XgBoost:
      `${experimentBasePath}/training/virtual_future_run/Xgboost/ts_metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    Lgbm: `${experimentBasePath}/training/virtual_future_run/Lgbm/ts_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_"),
    MLP: `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics`
      .split(".csv")[0]
      .split("/")
      .join("_"),
  };
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
    "Demand Alignment View1 Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_view1.csv`,
    "Demand Alignment Value View1 Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value_view1.csv`,
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
  const [showValueFile, setShowValueFile] = useState(false);
  const [requiredKeys, setRequiredKeys] = useState(null);
  const oc_fileName = oc_path
    ? `${experimentBasePath}/${oc_path}`.split(".csv")[0].split("/").join("_")
    : null;
  const oc_filePath = `${experimentBasePath}/${oc_path}`;
  const [fileName, setFileName] = useState(() => {
    if (isBaseData) {
      return parseDatasetPath(datasetPath);
    }
    return showValueFile ? fileNameDict[valueFileTitle] : fileNameDict[title];
  });

  const [filePath, setFilePath] = useState(
    showValueFile ? fileNamePathDict[valueFileTitle] : fileNamePathDict[title]
  );
  const { setNewRows, setDeletedRows, newRows } = useConfig();

  useEffect(() => {
    setFileName(
      isBaseData
        ? parseDatasetPath(datasetPath)
        : showValueFile
        ? fileNameDict[valueFileTitle]
        : fileNameDict[title]
    );
    setFilePath(
      showValueFile ? fileNamePathDict[valueFileTitle] : fileNamePathDict[title]
    );
    console.log("fileName " + valueFileTitle + " " + title + " " + filePath);
  }, [showValueFile]);
  const [editedCells, setEditedCells] = useState([
    ...(editedFiles[fileName] || []),
  ]); // Track edited cells
  const [editHistory, setEditHistory] = useState([
    ...(editHistories[fileName] || []),
  ]);

  // Function to handle pop operation safely
  const handlePop = () => {
    const newHistory = [...editHistory]; // Create a clone of the array
    const last_ele = newHistory.pop(); // Safely modify the cloned array
    setEditHistory(newHistory); // Update local state
    return last_ele;
  };
  useEffect(() => {
    if (isEditable) {
      console.log("editedCells", editedCells);
      setEditedFile(fileName, editedCells);
    }
  }, [editedCells, fileName]);

  useEffect(() => {
    if (isEditable) {
      setEditHistories(fileName, editHistory);
    }
  }, [editHistory, fileName]);

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
                lineHeight: "14px",
                // textAlign: "center",
                // borderBottom: "1px solid #E0E0E0", // Add bottom border for grid
                padding: "2px 8px", // Reduce padding for denser appearance
                "&.editable-header": {
                  backgroundColor: SUCCESS[100], // Light blue background for editable headers
                  color: SUCCESS[700], // Optional: Change text color
                  // borderColor:SUCCESS[700]
                },
              },
            },
          },
          MUIDataTableBodyCell: {
            styleOverrides: {
              root: {
                padding: "0px 2px", // Reduce padding for density
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
  useEffect(() => {
    if (isEditable) {
      console.log("New Edited Cells", editedFiles[fileName]);
      setEditedCells([...(editedFiles[fileName] || [])]);
      setEditHistory([...(editHistories[fileName] || [])]);
    }
  }, [lastSyncedTime]);

  // const fileName = fileNameDict[title];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [tableData, setTableData] = useState(data);
  const [editState, setEditState] = useState(true);
  const [isCalculatingAllSums, setIsCalculatingAllSums] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  // Add this near other state declarations
  const [columnSums, setColumnSums] = useState({});

  /*   useEffect(() => {
    setTableData(data);
  }, [data]); */
  useEffect(() => {
    console.log("Show Original Changed to:", showOriginal);
  }, [showOriginal]);
  // const loadBatch = async (batch_no, fileName) => {
  //   const data = await loadBatchData(
  //     userInfo.userID,
  //     currentCompany.companyName,
  //     batch_no,
  //     fileName
  //   );
  //   return data;
  // };

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const loadBatch = useCallback(
    async (batch_no, fileName) => {
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

      switch (showValueFile ? valueFileTitle : title) {
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
        case "Forecast Value Pivot":
          myCurrentDimension =
            currentDimension === "Forecast_Granularity"
              ? "all"
              : convert(currentDimension);
          myCurrentValue = currentValue;
          break;

        case "Forecast Value Disaggregated":
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
          myCurrentDimension = null;
          myCurrentValue = null;
          break;
      }

      try {
        console.log("filePath " + filePath);
        const finalFileName = showOriginal ? oc_fileName : fileName;
        const finalFilePath = showOriginal ? oc_filePath : filePath;
        const filterData = tablesFilterData[fileName]?.["Default"]
          ?.filterData ?? {
          dimensionFilters: !myCurrentDimension
            ? {}
            : {
                [myCurrentDimension]: [myCurrentValue],
              },
          columnFilter: [],

          selectAllColumns: true,
        };

        console.log("Filter data on loadBatch: ", filterData);
        let data;
        if (reportTitle) {
          // If editing an existing report, use callQueryEngineQuery with BYORConfig
          const config = BYORConfig[reportTitle];
          const payload = {
            fileName: config.fileName,
            filePath: config.filePath,
            filterData: config.filterData || null,
            byorFilterData: config.byorFilterData || null,
            sortingData: config.sortingData || null,
            groupByColumns: config.groupByColumns || [],
            aggregationColumns: config.aggregationColumns || {},
            filterConditions: config.filterConditions || [],
            paginationData: { batchNo: batch_no, batchSize: 50 },
            isBYOR: true,
            time: Date.now(),
          };

          const result = await callQueryEngineQuery(payload);

          data = result;
        } else {
          data = await (hasParquetFiles
            ? fetchParquetData({
                filePath: finalFilePath,
                filterData: filterData,
                paginationData: { batchNo: batch_no, batchSize: 50 },
                sortingData: null,
              })
            : fetchCSVData({
                filePath: finalFilePath ? finalFilePath : datasetPath,
                filterData: filterData,
                paginationData: { batchNo: batch_no, batchSize: 50 },
                sortingData: null,
              }));
        }
        console.log("Data Table", data);
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
      BYORConfig,
      currentValue,
      InvCurrentDimension,
      InvCurrentValue,
      PriceCurrentDimension,
      PriceCurrentValue,
      tablesFilterData,
      showOriginal,
      fileName,
      showValueFile,
      hasParquetFiles,
    ]
  );
  useEffect(() => {
    const loadBatchData = async (batchNo) => {
      // Load the new data for the current batch

      const newData = await loadBatch(batchNo, fileName);
      console.log("Use effect for loading Batch Data called");
      console.log("fileName " + fileName);

      if (newData) {
        const fetchNewTableData = async (prevData) => {
          if (Object.keys(prevData).length === 0) return newData;
          // Assuming the data structure is consistent
          const updatedData = { ...prevData };
          const newUpdatedData = {};
          // console.log("Initial Updated Data", updatedData);

          console.log(updatedData);
          const keys = Object.keys(newData);
          console.log("keys", keys);

          // Range for the new batch
          const start = 50 * (batchNo - 1);
          const end = Math.min(50 * batchNo, start + newData[keys[0]].length);
          // console.log("start", start);
          // console.log("end", end);
          // Iterate through each key and set values outside the batch to ""
          await parallelChunkMap(
            keys,
            (key) => {
              const newDataArray = newData[key];
              // console.log("key", key);
              // console.log("New Data Array", newDataArray);
              let n = updatedData[Object.keys(updatedData)[0]].length;
              if (n < end) {
                n = n + newDataArray.length;
              }
              // console.log("N", n);

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
            },
            10
          );
          console.log("Updated New Data", updatedData);
          return newData;
        };
        const newTableData = await fetchNewTableData(tableData);
        console.log("New Table Data", newTableData);
        setTableData(newTableData);
        // console.log("Table Data Keys:", Object.keys(newData));
        return true;
      } else {
      }
      return false;
      // Create a copy of the existing table data, and replace data for the current batch
    };

    // Trigger loading of new batch when moving to a new batch range
    if (currentPage % 5 === 1 || currentPage % 5 === 0) {
      const batchNo = Math.ceil(currentPage / 5);
      const result = loadBatchData(batchNo);
      if (result) {
        setCurrentBatch(batchNo);
      } else {
        toast.error("No data found at this filter :: NewBatch problem");
        console.log("No data found");
      }
    }
  }, [
    currentPage,
    fileName,
    tablesFilterData,
    //data,
    BYORConfig,
    showOriginal,
    showValueFile,
  ]);

  // Trigger loading of new batch when moving to a new batch range

  // Use useState instead of useRef + useMemo for async data transformation
  const [transformedData, setTransformedData] = useState([]);

  useEffect(() => {
    const getTransformedData = async () => {
      if (isAlreadyTransformed) {
        console.log("Transformation: isAlreadyTransformed");
        return tableData;
      }
      if (tableData && Object.keys(tableData).length > 0) {
        console.log("Transformation: tableData");
        return await transformData(tableData, editedCells, editState);
      } else {
        console.log("Transformation: return []");
        return [];
      }
    };

    const updateTransformedData = async () => {
      const result = await getTransformedData();
      console.log("Setting transformedData to:", result);
      setTransformedData(result);
    };

    updateTransformedData();
  }, [tableData, editedCells, editState, isAlreadyTransformed]);

  useEffect(() => {
    console.log("transformedData Final", transformedData);
  }, [transformedData]);

  //Undo function

  const handleUndo = () => {
    if (editHistory.length > 0) {
      const cellToUndo = handlePop();
      console.log("cellToUndo:", cellToUndo);
      const existingCell = editedCells.find(
        (cell) => cell.row === cellToUndo.row && cell.col === cellToUndo.col
      );
      console.log("existingCell:", existingCell);
      const colKey = cellToUndo.col;
      const rowIdx = cellToUndo.row;
      let newEditsArray = [...existingCell.edits];
      newEditsArray.pop();
      const newFinalValue = newEditsArray.slice(-1)[0];
      if (newEditsArray.length === 1) {
        setTableData((prevData) => {
          console.log("STDC");
          const updatedData = { ...prevData };
          updatedData[colKey] = [...updatedData[colKey]];
          updatedData[colKey][rowIdx] = newFinalValue;
          return updatedData;
        });
      }
      setEditedCells((prevEditedCells) => {
        console.log("SECC");

        return prevEditedCells
          .map((cell) =>
            cell.row === cellToUndo.row && cell.col === cellToUndo.col
              ? {
                  ...cell,
                  edits: newEditsArray,
                  finalValue: newFinalValue === "" ? "0" : newFinalValue,
                }
              : cell
          )
          .filter((cell) => cell.edits.length > 1);
      });
    }
  };
  const EditableCell = ({
    value,
    prevValue,
    rowIndex,
    colIndex,
    columnKey,
    isNumeric,
    currentPage,
    batchNo,
    ts_id,
    onCommit,
    rowDimensionValue,
  }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const [isTextFieldRendered, setIsTextFieldRendered] = useState(false);
    const textFieldRef = useRef(null);

    const isEditableCol = isEditableColumn(columnKey);
    const isEditableRow = isRowEditable(rowDimensionValue);
    const isEditableRowDimension =
      rowDimension !== null ? isEditableRow && !isEditableCol : false;

    const editedCell = editedCells.find(
      (cell) =>
        cell.ts_id === ts_id &&
        cell.columnName === columnKey &&
        (!rowDimensionValue || cell.rowDimensionValue === rowDimensionValue)
    );

    const isTSID = ["Metrics Analysis"].includes(title)
      ? false
      : [
          "Demand Alignment View1 Report",
          "Demand Alignment Value View1 Report",
        ].includes(title)
      ? configState?.scenario_plan?.demand_alignment_report?.ts_id_view1?.includes(
          columnKey
        )
      : configState.data.ts_id_columns.includes(columnKey);

    const isEdited =
      editedCell && parseFloat(editedCell.initialValue) !== parseFloat(value);

    // Focus the TextField when it's rendered
    useEffect(() => {
      if (isTextFieldRendered && textFieldRef.current) {
        textFieldRef.current.focus();
      }
    }, [isTextFieldRendered]);

    const handleChange = (event) => {
      setCurrentValue(event.target.value);
    };

    const handleBlur = async () => {
      if (isEditing) {
        await onCommit(currentValue, rowIndex, columnKey, currentPage, batchNo);
        setIsEditing(false);
        setIsTextFieldRendered(false); // Reset TextField rendering after editing
      }
    };

    const handleKeyDown = async (event) => {
      if (event.key === "Enter") {
        if (isEditing) {
          await onCommit(
            currentValue,
            rowIndex,
            columnKey,
            currentPage,
            batchNo
          );
          setIsEditing(false);
          setIsTextFieldRendered(false); // Reset TextField rendering after editing
        }
      }
      if (event.key === "Escape") {
        setIsEditing(false);
        setIsTextFieldRendered(false);
        setCurrentValue(value); // Reset to original value
      }
    };

    const handlePlaceholderClick = () => {
      setIsTextFieldRendered(true);
      setIsEditing(true);
    };

    // Convert value to string before rendering
    const displayValue =
      currentValue === null || currentValue === undefined
        ? ""
        : String(currentValue);

    // Enhanced numeric detection for better right-alignment in editable cells
    const isNumericValue =
      !isNaN(displayValue) &&
      !isNaN(parseFloat(displayValue)) &&
      displayValue.trim() !== "";
    // console.log("isNumericValue", isNumericValue);

    const shouldShowEditable =
      isEditable &&
      isEditableCol &&
      editState &&
      (isEditableRow || rowDimension === null);

    if (shouldShowEditable) {
      if (true) {
        // Render actual TextField when editing
        return (
          <TextField
            ref={textFieldRef}
            value={displayValue}
            onFocus={() => setIsEditing(true)}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            variant="outlined"
            size="small"
            style={{ width: "100%" }}
            type={"text"}
            textAlign={isTSID ? "left" : isNumericValue ? "right" : "left"}
            sx={{
              "& .MuiOutlinedInput-root": {
                padding: "0px",
                border: "1px solid lightgray",
                backgroundColor: isEdited ? WARNING[100] : "transparent",
                "& fieldset": {
                  border: isEditing ? "2px solid #0C66E4" : "none",
                  transition: "border-color 0.3s, border-width 0.3s",
                },
                "&:hover fieldset": {
                  border: "1px solid black",
                },
              },
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                border: "2px solid #0C66E4",
              },
              "& .MuiInputBase-input": {
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#101828",
                lineHeight: "14px",
                textAlign: isTSID ? "left" : isNumericValue ? "right" : "left",
                textTransform: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: theme.transitions.create("width"),
                padding: "8px 4px",
              },
            }}
          />
        );
      } else {
        // Render lightweight placeholder that looks like TextField
        return (
          <Typography
            onClick={handlePlaceholderClick}
            sx={{
              width: "100%",
              height: "36px", // TextField height
              border: "1px solid lightgray",
              borderRadius: "4px",
              backgroundColor: isEdited ? WARNING[100] : "transparent",
              cursor: "text",
              display: "flex",
              alignItems: "center",
              justifyContent: isTSID
                ? "flex-start"
                : isNumericValue
                ? "flex-end"
                : "flex-start",
              padding: "8px 4px",
              fontFamily: "Inter",
              fontSize: "14px",
              color: "#101828",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "border-color 0.3s",
              "&:hover": {
                border: "1px solid black",
              },
            }}
          >
            {displayValue}
          </Typography>
        );
      }
    } else {
      // Non-editable cell
      return (
        <Typography
          sx={{
            padding: isEditableRowDimension ? "8px 4px" : "0px 4px",
            fontFamily: "Inter",
            fontSize: "14px",
            color: isEditableRowDimension ? SUCCESS[700] : "#101828",
            textAlign: isTSID ? "left" : isNumericValue ? "right" : "left",
            textTransform: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: theme.transitions.create("width"),
            backgroundColor: isEditableRowDimension
              ? SUCCESS[100]
              : "transparent",
          }}
        >
          {displayValue}
        </Typography>
      );
    }
  };
  // Columns configuration with editable cells
  const EditableCellOld = ({
    value,
    prevValue,
    rowIndex,
    colIndex,
    columnKey,
    isNumeric,
    currentPage,
    batchNo,
    ts_id,
    onCommit,
    rowDimensionValue,
  }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const isEditableCol = isEditableColumn(columnKey);
    const isEditableRow = isRowEditable(rowDimensionValue);
    const isEditableRowDimension =
      rowDimension !== null ? isEditableRow && !isEditableCol : false;
    if (isEditableRow) {
      /*   console.log(
        "isEditableRow",
        isEditableRow,
        "For rowDimensionValue",
        rowDimensionValue
      ); */
    }
    const editedCell = editedCells.find(
      (cell) =>
        cell.ts_id === ts_id &&
        cell.columnName === columnKey &&
        (!rowDimensionValue || cell.rowDimensionValue === rowDimensionValue)
    );
    const isTSID = ["Metrics Analysis"].includes(title)
      ? false
      : [
          "Demand Alignment View1 Report",
          "Demand Alignment Value View1 Report",
        ].includes(title)
      ? configState?.scenario_plan?.demand_alignment_report?.ts_id_view1?.includes(
          columnKey
        )
      : configState.data.ts_id_columns.includes(columnKey);
    const isEdited =
      editedCell && parseFloat(editedCell.initialValue) !== parseFloat(value);
    if (isEdited) {
      console.log("Edited: editedCell", editedCell);
      console.log("Edited: value", value);
      console.log("Edited: initialValue", editedCell.initialValue);
    }

    const handleChange = (event) => {
      setCurrentValue(event.target.value);
    };

    const handleBlur = async () => {
      if (isEditing) {
        await onCommit(currentValue, rowIndex, columnKey, currentPage, batchNo);
        setIsEditing(false);
      }
    };

    const handleKeyDown = async (event) => {
      if (event.key === "Enter") {
        // Commit the value when Enter is pressed
        console.log("isEditing1", isEditing);
        if (isEditing) {
          console.log("calling commit on Enter");
          await onCommit(
            currentValue,
            rowIndex,
            columnKey,
            currentPage,
            batchNo
          );
          setIsEditing(false);
        } else {
          console.log("isEditing", isEditing);
        }
      }
    };

    // Convert value to string before rendering
    const displayValue =
      currentValue === null || currentValue === undefined
        ? ""
        : String(currentValue);

    return isEditable &&
      isEditableCol &&
      editState &&
      (isEditableRow || rowDimension === null) ? (
      <TextField
        value={displayValue}
        onFocus={() => setIsEditing(true)}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        variant="outlined"
        size="small"
        style={{ width: "100%" }}
        type={"text"}
        textAlign={isTSID ? "left" : isNumeric ? "right" : "left"}
        sx={{
          "& .MuiOutlinedInput-root": {
            padding: "0px",
            border: "1px solid lightgray",
            backgroundColor: isEdited ? WARNING[100] : "transparent",
            "& fieldset": {
              border: isEditing ? "2px solid #0C66E4" : "none",
              transition: "border-color 0.3s, border-width 0.3s",
            },
            "&:hover fieldset": {
              border: "1px solid black",
            },
          },
          "& .MuiOutlinedInput-root.Mui-focused fieldset": {
            border: "2px solid #0C66E4",
          },
          "& .MuiInputBase-input": {
            fontFamily: "Inter",
            fontSize: "14px",
            color: "#101828",
            lineHeight: "14px",
            textAlign: isTSID ? "left" : isNumeric ? "right" : "left",
            textTransform: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: theme.transitions.create("width"),
            padding: "8px 4px",
          },
        }}
      />
    ) : (
      <Typography
        sx={{
          padding: isEditableRowDimension ? "8px 4px" : "0px 4px",
          fontFamily: "Inter",
          fontSize: "14px",
          color: isEditableRowDimension ? SUCCESS[700] : "#101828",
          textAlign: isTSID ? "left" : isNumeric ? "right" : "left",
          textTransform: "none",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: theme.transitions.create("width"),
          backgroundColor: isEditableRowDimension
            ? SUCCESS[100]
            : "transparent",
        }}
      >
        {displayValue}
      </Typography>
    );
  };
  const handleCommit = (
    newValue,
    rowIdx,
    colKey,
    rowDimension,
    rowDimensionValue
  ) => {
    console.log("Commit called");
    console.log(
      "newValue :",
      newValue,
      "| rowIdx :",
      rowIdx,
      "| colKey :",
      colKey,
      "| rowDimension :",
      rowDimension,
      "| rowDimensionValue :",
      rowDimensionValue
    );

    const prevValueFromTable = transformedData[rowIdx][colKey];

    console.log("prevValueFromTable :", prevValueFromTable);
    console.log("editedCells :", editedCells);
    const existingCell = editedCells.find(
      (cell) => cell.row === rowIdx && cell.col === colKey
    );
    console.log("existingCell :", existingCell);

    let prevValue = prevValueFromTable;

    if (existingCell) {
      prevValue = existingCell.edits[existingCell.edits.length - 1];
    }

    // Normalize values
    const normalizeValue = (value) =>
      typeof value === "number"
        ? value
        : isNaN(value)
        ? value
        : parseFloat(value);

    const normalizedPrevValue = normalizeValue(prevValue);
    const normalizedNewValue = normalizeValue(newValue);
    setTableData((prevData) => {
      console.log("STDC");
      const updatedData = { ...prevData };
      updatedData[colKey] = [...updatedData[colKey]];
      updatedData[colKey][rowIdx] = newValue;
      return updatedData;
    });
    if (normalizedPrevValue === normalizedNewValue) {
      return;
    }
    // Update table data

    // Update edited cells
    setEditedCells((prevEditedCells) => {
      console.log("SECC");
      const prevValueFromTable = transformedData[rowIdx][colKey];
      const existingCell = prevEditedCells.find(
        (cell) => cell.row === rowIdx && cell.col === colKey
      );

      let prevValue = prevValueFromTable;

      if (existingCell) {
        prevValue = existingCell.edits[existingCell.edits.length - 1];
      }

      // Normalize values
      const normalizeValue = (value) =>
        typeof value === "number"
          ? value
          : isNaN(value)
          ? value
          : parseFloat(value);

      const normalizedPrevValue = normalizeValue(prevValue);
      const normalizedNewValue = normalizeValue(newValue);

      if (normalizedPrevValue === normalizedNewValue) {
        return prevEditedCells;
      }

      const editedCell = {
        row: rowIdx,
        col: colKey,
        columnName: colKey,
        rowDimensionValue: rowDimensionValue,
        rowDimension: rowDimension,
        edits: existingCell
          ? [...existingCell.edits, newValue]
          : [prevValue, newValue],
        initialValue: existingCell ? existingCell.initialValue : prevValue,
        finalValue: newValue,
        ts_id: getTSID(transformedData, rowIdx),
        timestamp: getTimeStamp(colKey),
      };
      console.log("new editedCell", editedCell);
      if (existingCell) {
        return prevEditedCells.map((cell) =>
          cell.row === rowIdx && cell.col === colKey
            ? {
                ...cell,
                edits: [...cell.edits, newValue],
                finalValue: newValue,
              }
            : cell
        );
      } else {
        return [...prevEditedCells, editedCell];
      }
    });

    setEditHistory((previousHistory) => {
      const newHistory = [...previousHistory, { row: rowIdx, col: colKey }];
      return newHistory;
    });
  };

  // // Calculate total width of frozen columns
  // const getFrozenColumnsWidth = (frozenColumns) => {
  //   return 48 + frozenColumns.length * 150; // 48px for checkbox + width of each frozen column
  // };
  const getTextWidth = (text, fontSize = 14, fontFamily = "Inter") => {
    // Use canvas to measure text width
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
  };
  const columns = useMemo(() => {
    if (transformedData == null) return [];
    if (transformedData.length === 0) return [];

    const BYORFilterData = reportTitle
      ? BYORConfig[reportTitle].byorFilterData
      : {} || {};

    const isBYORDataValid =
      reportTitle && BYORFilterData && Object.keys(BYORFilterData).length > 0;

    const fileFilterData = isBYORDataValid
      ? {
          // Use BYORFilterData when reportTitle is present
          dimensionFilters: BYORFilterData.dimensionFilters ?? {},
          frozenColumns: BYORFilterData.frozenColumns ?? [],
          columnFilter: BYORFilterData.columnsFilter ?? [], // Note: using 'columnsFilter' from BYOR
          selectAllColumns: BYORFilterData.selectAllColumns ?? true,
        }
      : {
          // Use tablesFilterData when reportTitle is not present
          dimensionFilters:
            tablesFilterData[fileName]?.["Default"]?.filterData
              ?.dimensionFilters ?? {},
          frozenColumns:
            tablesFilterData[fileName]?.["Default"]?.filterData
              ?.frozenColumns ?? [],
          columnFilter:
            tablesFilterData[fileName]?.["Default"]?.filterData?.columnFilter ??
            [],
          selectAllColumns:
            tablesFilterData[fileName]?.["Default"]?.filterData
              ?.selectAllColumns ?? true,
        };

    const config = BYORConfig[reportTitle];
    const allColumns = filterOptions.columns;
    const orderedColumns = fileFilterData.columnFilter || [];

    const frozenColumns = fileFilterData.frozenColumns || [];
    console.log("Frozen Columns", frozenColumns);
    console.log("File Filter Data", fileFilterData);
    console.log("Transformed Data", transformedData);
    //     console.log("All Columns", allColumns);
    //     console.log("Ordered Columns", orderedColumns);
    //   if(allColumns.length !== orderedColumns.length){
    //     const missedColumns = allColumns.filter(col => !orderedColumns.includes(col));
    //     console.log("Missed Columns", missedColumns);
    //     const missedColumns1 = orderedColumns.filter(col => !allColumns.includes(col));
    //     console.log("Missed Columns", missedColumns1);
    // setSelectAllColumns(false);
    //   }

    const columnOrder =
      Object.keys(fileFilterData).length === 0 ||
      fileFilterData.columnFilter.length === 0 ||
      reportTitle
        ? Object.keys(transformedData[0])
        : orderedColumns.filter((col) =>
            Object.keys(transformedData[0]).includes(col)
          );

    const mergedColumns = [
      ...orderedColumns,
      ...columnOrder.filter((col) => !orderedColumns.includes(col)),
    ];

    const isTSIDColumn = (columnName) => {
      const ts_id_cols = ["Metrics Analysis"].includes(title)
        ? []
        : [
            "Demand Alignment View1 Report",
            "Demand Alignment Value View1 Report",
          ].includes(title)
        ? configState.scenario_plan.demand_alignment_report.ts_id_view1
        : configState.data.ts_id_columns;
      return ts_id_cols.includes(columnName);
    };
    // Add this utility function to get accurate text width
    const getTextWidth = (text, fontSize = 14, fontFamily = "Inter") => {
      // Use canvas to measure text width
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = `${fontSize}px ${fontFamily}`;
      return context.measureText(text).width;
    };

    // Then update the getLeftPosition function
    const getLeftPosition = (columnKey) => {
      // console.log(`getLeftPosition called for column: ${columnKey}`);

      if (!frozenColumns.includes(columnKey)) {
        // console.log(`${columnKey} is not a frozen column, returning 0`);
        return 0;
      }

      const frozenIndex = frozenColumns.indexOf(columnKey);
      // console.log(`Frozen index for ${columnKey}: ${frozenIndex}`);

      let position = 48; // Initial position for checkbox column
      // console.log(`Starting position: ${position}px (checkbox column width)`);

      // Add widths of all previous frozen columns
      for (let i = 0; i < frozenIndex; i++) {
        const prevColumn = frozenColumns[i];
        // console.log(`Processing previous frozen column: ${prevColumn}`);

        // Get visible rows for current page (10 rows per page)
        const startIdx = (currentPage - 1) * 10;
        const endIdx = startIdx + 10;
        const visibleRows = transformedData.slice(startIdx, endIdx);

        const columnValues = visibleRows.map((row) =>
          String(row[prevColumn] || "")
        );
        // console.log(`Column values for ${prevColumn}:`, columnValues);

        // Get accurate header text width using canvas
        const headerText = formatKey(prevColumn);
        const headerTextWidth = getTextWidth(headerText);
        const pinIconWidth = 8; // Width of pin icon
        const headerPadding = 0; // Padding around header text
        const headerWidth = headerTextWidth + pinIconWidth + headerPadding;
        console
          .log
          // `Header width for ${prevColumn}: ${headerWidth}px (text: ${headerTextWidth}px, icon: ${pinIconWidth}px, padding: ${headerPadding}px)`
          ();

        // Get accurate content width for the widest value
        const contentWidths = columnValues.map((val) => getTextWidth(val));
        const contentWidth =
          contentWidths.length > 0 ? Math.max(...contentWidths) : 0;
        // console.log(`Content width for ${prevColumn}: ${contentWidth}px`);

        // Check if this column has aggregation
        const isNumericColumn = transformedData.some(
          (row) =>
            !isNaN(row[prevColumn]) &&
            row[prevColumn] !== null &&
            row[prevColumn] !== ""
        );
        const isNotTSIDColumn = [
          "Demand Alignment View1 Report",
          "Demand Alignment Value View1 Report",
        ].includes(title)
          ? !configState?.scenario_plan?.demand_alignment_report?.ts_id_view1?.includes(
              prevColumn
            )
          : !configState.data.ts_id_columns.includes(prevColumn);
        const hasAggregation =
          enableAggregation && isNumericColumn && isNotTSIDColumn;
        // console.log(`Column ${prevColumn} has aggregation: ${hasAggregation}`);

        // Use 149 as the base minimum width to avoid extra space
        const minWidth = 149;
        // console.log(`Base minimum width: ${minWidth}px`);

        // Calculate the width based on content and header
        let columnWidth = Math.max(
          minWidth,
          Math.min(300, Math.max(headerWidth, contentWidth) + 18)
        );
        // console.log(`Initial column width calculation: ${columnWidth}px`);

        position += columnWidth;
        // console.log(`Position after adding ${prevColumn}: ${position}px`);
      }

      // console.log(`Final position for ${columnKey}: ${position}px`);
      return position;
    };

    return columnOrder.map((key, colIndex) => {
      const isNumeric = !transformedData
        .slice(0, Math.min(3, transformedData.length))
        .some((row) => {
          const value = row[key];
          return value !== null && value !== "" && isNaN(value);
        });

      let leftPosition = getLeftPosition(key);

      return {
        name: key,
        label: (
          <Stack
            spacing={0.3}
            sx={{
              flexDirection: "column",
              alignItems: "stretch",
              width: "100%",
              cursor: "default",
              height: "100%",
              paddingTop: "8px",
            }}
          >
            {/* Always render the key Stack first */}
            <Stack
              alignItems={"center"}
              width={"100%"}
              justifyContent={"space-between"}
              direction={"row"}
              alignSelf={"flex-start"}
              sx={{
                minWidth: 0,
                display: "flex",
                alignItems: "flex-start", // Align to top
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  alignItems: "center",
                  paddingBottom: "2px",
                }}
              >
                {formatKey(key)}
              </Box>
              {columnOrder.indexOf(key) <=
                (fileFilterData.frozenColumns || []).length && (
                <IconButton
                  onClick={async (e) => {
                    e.stopPropagation();
                    const currentFrozen = fileFilterData.frozenColumns || [];
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

                    if (reportTitle) {
                      // Store in BYORConfig if reportTitle is present
                      updateBYORFilterData({
                        ...BYORFilterData,
                        frozenColumns: newFrozenColumns,
                      });

                      // Save to BYORConfig and upload to S3
                      await saveBYORConfig(reportTitle, {
                        ...BYORData,
                        byorFilterData: {
                          ...BYORFilterData,
                          frozenColumns: newFrozenColumns,
                        },
                        filterData: null,
                        sortingData: null,
                        fileName: config?.fileName,
                        title: config?.title,
                        filePath: config?.filePath,
                      });

                      // Get updated config from store and upload to S3
                      const updatedBYORConfig =
                        store.getState().dashboard.BYORConfig;
                      await uploadJsonToS3(
                        `${experimentBasePath}/custom_report/BYORDataConfig.json`,
                        updatedBYORConfig
                      );
                    } else {
                      // Apply filter if no reportTitle
                      await applyFilter(
                        fileName,
                        showValueFile ? valueFileTitle : title,
                        "Default",
                        true
                      );
                    }
                  }}
                  size="medium"
                  sx={{
                    // visibility:
                    //   columnOrder.indexOf(key) <=
                    //   (fileFilterData.frozenColumns || []).length
                    //     ? "visible"
                    //     : "hidden",
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
              )}
            </Stack>

            {/* Flexible spacer */}
            {/* <Box sx={{ flex: 1 }} /> */}

            {/* Show column sum if it exists */}
            {((columnSums[key] && Object.keys(columnSums).length > 0) ||
              isCalculatingAllSums) &&
            isNumeric &&
            !isTSIDColumn(key) ? (
              columnSums[key] === "Calculating..." || isCalculatingAllSums ? (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#626F86",
                    width: "100%",
                    fontWeight: "600",
                    borderTop: "2px solid",
                    borderColor: SUCCESS[700],
                    textAlign: "center",
                    fontStyle: "italic",
                    paddingTop: "2px",
                  }}
                >
                  Calculating...
                </Typography>
              ) : (
                <Stack
                  alignItems={"center"}
                  width={"100%"}
                  justifyContent={"space-between"}
                  direction={"row"}
                  alignSelf={"flex-start"}
                  sx={{
                    minWidth: 0,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color:
                        isEditableColumn(key) && editState
                          ? SUCCESS[700]
                          : "#626F86",
                      textAlign: isNumeric ? "right" : "left",
                      width: "100%",
                      fontWeight: "600",
                      borderTop: "2px solid",
                      borderColor: SUCCESS[700],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      marginLeft: "auto",
                      paddingTop: "2px",
                    }}
                  >
                    Sum
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color:
                        isEditableColumn(key) && editState
                          ? SUCCESS[700]
                          : "#626F86",
                      textAlign: isNumeric ? "right" : "left",
                      width: "100%",
                      fontWeight: "600",
                      borderTop: "2px solid",
                      borderColor: SUCCESS[700],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      marginLeft: "auto",
                      paddingTop: "2px",
                    }}
                  >
                    {!isNaN(columnSums[key])
                      ? parseFloat(columnSums[key]).toFixed(0)
                      : columnSums[key]}
                  </Typography>
                </Stack>
              )
            ) : Object.keys(columnSums).length > 0 ? (
              <Box sx={{ height: "16px" }} />
            ) : null}
          </Stack>
        ),
        options: {
          display: orderedColumns.length === 0 || mergedColumns.includes(key),
          draggable: !frozenColumns.includes(key),
          filter: true,
          sort: false, // Disable sorting for this column
          setCellHeaderProps: () => ({
            style: frozenColumns.includes(key)
              ? {
                  position: "sticky",
                  left: leftPosition,
                  zIndex: 102,
                  backgroundColor:
                    isEditableColumn(key) && editState
                      ? SUCCESS[100]
                      : key.startsWith("Risk_")
                      ? WARNING[100]
                      : "#fff",
                  color:
                    isEditableColumn(key) && editState
                      ? SUCCESS[700]
                      : key.startsWith("Risk_")
                      ? WARNING[700]
                      : "#626F86",
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
                  backgroundColor:
                    isEditableColumn(key) && editState
                      ? SUCCESS[100]
                      : key.startsWith("Risk_")
                      ? WARNING[100]
                      : "#fff",
                  color:
                    isEditableColumn(key) && editState
                      ? SUCCESS[700]
                      : key.startsWith("Risk_")
                      ? WARNING[700]
                      : "#626F86",
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
          customBodyRender: (value, tableMeta) => {
            const rowIndex = tableMeta.rowIndex;
            const batchNo = Math.ceil(currentPage / 5);
            const isNumeric = !isNaN(value);
            const prevValue = transformedData[rowIndex][key];
            const ts_id = getTSID(transformedData, rowIndex);
            const rowDimensionValue = transformedData[rowIndex][rowDimension];

            return (
              <EditableCell
                value={value || ""}
                rowIndex={rowIndex}
                colIndex={colIndex}
                columnKey={key}
                isNumeric={isNumeric}
                currentPage={currentPage}
                batchNo={batchNo}
                ts_id={ts_id}
                rowDimensionValue={rowDimensionValue}
                onCommit={(newValue, rowIdx, colKey, page, batch) => {
                  handleCommit(
                    newValue,
                    rowIdx,
                    colKey,
                    rowDimension,
                    rowDimensionValue
                  );
                }}
              />
            );
          },
        },
      };
    });
  }, [
    transformedData,
    currentPage,
    fileName,
    showValueFile,
    tablesFilterData,
    columnSums,
    rowDimension,
    isRowEditable,
  ]);

  // Check if data is large (more than 60 columns)
  const isLargeData = useMemo(() => {
    if (!transformedData || transformedData.length === 0) return false;
    return Object.keys(transformedData[0]).length > 60;
  }, [transformedData]);

  const [loading, setLoading] = useState(false); // State to track loading
  const [loadingOC, setLoadingOC] = useState(false);
  const [groupAggregationOpen, setGroupAggregationOpen] = useState(false); // State to track loading

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
    let fileName;
    let filterData;
    const filePath = showValueFile
      ? fileNameDict[valueFileTitle]
      : fileNameDict[title];
    switch (showValueFile ? valueFileTitle : title) {
      case "Forecasting Pivot":
        fileName = fileNameDict["Forecasting Pivot"];

        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
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
        fileName = fileNameDict["Forecasting Pivot Disaggregated"];

        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
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
      case "Forecast Value Pivot":
        fileName = fileNameDict["Forecast Value Pivot"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
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
        fileName = fileNameDict["DOI Details"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
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
        fileName = fileNameDict["Elasticity Detailed View"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
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
        fileName = fileNameDict["Metrics Deep dive"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
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
        fileName = isBaseData
          ? parseDatasetPath(datasetPath)
          : showValueFile
          ? fileNameDict[valueFileTitle]
          : fileNameDict[title];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
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

    let tokenPayloadForParquet;

    if (reportTitle) {
      // If editing an existing report, use BYORConfig to create payload
      const config = BYORConfig[reportTitle];
      tokenPayloadForParquet = {
        fileName: config.fileName,
        filePath: config.filePath,
        byorFilterData: config.byorFilterData || null,
        filterData: config.filterData || null,
        sortingData: config.sortingData || null,
        isBYOR: true,
        groupByColumns: config.groupByColumns || [],
        aggregationColumns: config.aggregationColumns || {},
        filterConditions: config.filterConditions || [],
        paginationData: null,
        time: Date.now(),
      };
    } else {
      // For new downloads, use the existing logic
      const config = BYORConfig[reportTitle];
      tokenPayloadForParquet = {
        filePath: fileNamePathDict[showValueFile ? valueFileTitle : title]
          ? fileNamePathDict[showValueFile ? valueFileTitle : title]
          : datasetPath,
        fileName,
        companyName: currentCompany.companyName,
        filterData,

        paginationData: null,
        sortingData: null,
      };
    }

    try {
      await downloadParquetFileUsingPreSignedURL(
        tokenPayloadForParquet,
        reportTitle
          ? reportTitle
          : showValueFile
          ? valueFileTitle
          : alternateTitle
          ? alternateTitle
          : title,
        userInfo.userID
      );

      console.log("File download initiated :", tokenPayload);
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
    BYORConfig,
    InvCurrentDimension,
    InvCurrentValue,
    PriceCurrentDimension,
    PriceCurrentValue,
    tablesFilterData,
    showValueFile,
  ]);
  const handleOCDownload = useCallback(async () => {
    setLoading(true); // Set loading state to true when download starts
    //const hasCache = await setOCCache();
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
    let fileName;
    let filterData;
    const filePath = showValueFile
      ? fileNameDict[valueFileTitle]
      : fileNameDict[title];
    const oc_fileName = `${experimentBasePath}/${oc_path}`
      .split(".csv")[0]
      .split("/")
      .join("_");
    switch (title) {
      case "Forecasting Pivot":
        fileName = fileNameDict["Forecasting Pivot"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
          dimensionFilters: {
            [currentDimension]: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName: oc_fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;
      case "Forecasting Pivot Disaggregated":
        fileName = fileNameDict["Forecasting Pivot Disaggregated"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
          dimensionFilters: {
            [currentDimension]: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName: oc_fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;
      case "Forecast Value Pivot":
        fileName = fileNameDict["Forecast Value Pivot"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
          dimensionFilters: {
            [currentDimension]: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName: oc_fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;
      case "DOI Details":
        fileName = fileNameDict["DOI Details"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
          dimensionFilters: {
            [convert(InvCurrentDimension)]: [InvCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName: oc_fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      case "Elasticity Detailed View":
        fileName = fileNameDict["Elasticity Detailed View"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
          dimensionFilters: {
            [convert(PriceCurrentDimension)]: [PriceCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName: oc_fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      case "Metrics Deep dive":
        fileName = fileNameDict["Metrics Deep dive"];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
          dimensionFilters: {
            feature: [convert(currentDimension)],
          },
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName: oc_fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
        break;

      default:
        fileName = fileNameDict[title];
        filterData = tablesFilterData[fileName]?.["Default"]?.filterData ?? {
          dimensionFilters: {},
          columnFilter: [],
          selectAllColumns: true,
        };
        tokenPayload = {
          fileName: oc_fileName,
          companyName: currentCompany.companyName,
          filterData,
        };
    }
    const tokenPayloadForParquet = {
      filePath: `${experimentBasePath}/${oc_path}`,
      fileName: oc_fileName,
      companyName: currentCompany.companyName,
      filterData,
      paginationData: null,
      sortingData: null,
    };

    try {
      await downloadParquetFileUsingPreSignedURL(
        tokenPayloadForParquet,
        showValueFile
          ? `Original ${valueFileTitle}`
          : `Original ${alternateTitle ? alternateTitle : title}`,
        userInfo.userID
      );

      console.log("File download initiated :", tokenPayload);
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
  const handleFilterOpen = useCallback(
    async (silent = false) => {
      let wholeData;
      if (reportTitle) {
        // If editing an existing report, use callQueryEngineQuery with BYORConfig
        const config = BYORConfig[reportTitle];
        const payload = {
          fileName: config.fileName,
          filePath: config.filePath,
          filterData: config.filterData || null,

          sortingData: config.sortingData || null,
          groupByColumns: config.groupByColumns || [],
          aggregationColumns: config.aggregationColumns || {},
          filterConditions: config.filterConditions || [],
          paginationData: null,

          time: Date.now(),
        };

        const result = await callQueryEngineQuery(payload);

        wholeData = result;
      } else {
        wholeData = await (hasParquetFiles
          ? fetchParquetData({
              filePath: filePath,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            })
          : fetchCSVData({
              filePath: filePath ? filePath : datasetPath,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            }));
      }

      let filterOptions = { columns: Object.keys(wholeData) };
      let fileName;

      switch (showValueFile ? valueFileTitle : title) {
        case "Forecasting Pivot":
          fileName = fileNameDict["Forecasting Pivot"];
          filterOptions["dimensions"] = dimensionFilterData;
          break;
        case "Forecasting Pivot Disaggregated":
          fileName = fileNameDict["Forecasting Pivot Disaggregated"];
          filterOptions["dimensions"] = dimensionFilterData;
          break;
        case "Forecast Value Pivot":
          fileName = fileNameDict["Forecast Value Pivot"];
          filterOptions["dimensions"] = dimensionFilterData;
          break;

        case "DOI Details":
          fileName = fileNameDict["DOI Details"];
          filterOptions["dimensions"] = InvPriceFilterData;
          break;

        case "Elasticity Detailed View":
          fileName = fileNameDict["Elasticity Detailed View"];
          filterOptions["dimensions"] = InvPriceFilterData;
          break;

        case "Demand Alignment Report":
          fileName = fileNameDict["Demand Alignment Report"];
          filterOptions["dimensions"] = {
            ...InvPriceFilterData,
            ...Object.keys(wholeData)
              .filter((col) => col.startsWith("Risk_"))
              .reduce((acc, col) => {
                acc[col] = ["all", "High", "Medium", "Low"];
                return acc;
              }, {}),
          };
          break;
        case "Demand Alignment Value Report":
          fileName = fileNameDict["Demand Alignment Value Report"];
          filterOptions["dimensions"] = {
            ...InvPriceFilterData,
            ...Object.keys(wholeData)
              .filter((col) => col.startsWith("Risk_"))
              .reduce((acc, col) => {
                acc[col] = ["all", "High", "Medium", "Low"];
                return acc;
              }, {}),
          };
          break;

        case "Demand Alignment View1 Report":
          fileName = fileNameDict["Demand Alignment View1 Report"];
          filterOptions["dimensions"] = {
            ...InvPriceFilterData,
            ...Object.keys(wholeData)
              .filter((col) => col.startsWith("Risk_"))
              .reduce((acc, col) => {
                acc[col] = ["all", "High", "Medium", "Low"];
                return acc;
              }, {}),
          };
          break;
        case "Demand Alignment Value View1 Report":
          fileName = fileNameDict["Demand Alignment Value View1 Report"];
          filterOptions["dimensions"] = {
            ...InvPriceFilterData,
            ...Object.keys(wholeData)
              .filter((col) => col.startsWith("Risk_"))
              .reduce((acc, col) => {
                acc[col] = ["all", "High", "Medium", "Low"];
                return acc;
              }, {}),
          };
          break;

        case "Supply Plan":
          fileName = fileNameDict["Supply Plan"];
          filterOptions["dimensions"] = supplyPlanFilterData
            ? supplyPlanFilterData
            : InvPriceFilterData;
          break;
        case "Production Plan":
          fileName = fileNameDict["Production Plan"];
          filterOptions["dimensions"] = InvPriceFilterData;
          break;

        case "Metrics Deep dive":
          fileName = fileNameDict["Metrics Deep dive"];
          filterOptions["dimensions"] = dimensionFilterData;
          break;

        default:
          fileName = isBaseData
            ? parseDatasetPath(datasetPath)
            : showValueFile
            ? fileNameDict[valueFileTitle]
            : fileNameDict[title];
          filterOptions["dimensions"] = {};
      }
      const changables = ["Cluster", "Forecast_Granularity"];
      const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

      const convert = (dimension) => {
        if (changables.includes(dimension)) {
          return dict[dimension];
        }
        return dimension;
      };
      //  Remove dimension keys that are not present in columns
      if (filterOptions["dimensions"] && filterOptions["columns"]) {
        const columnKeys = filterOptions["columns"];
        filterOptions["dimensions"] = Object.fromEntries(
          Object.entries(filterOptions["dimensions"]).filter(([key]) =>
            columnKeys.includes(convert(key))
          )
        );
      }

      if (reportTitle) {
        loadBYORConfig(reportTitle);
      }

      try {
        await setFilterOptions(filterOptions, fileName, "Default", silent);
      } catch (error) {
        console.error("Error setting filterOptions:", error);
      }
    },
    [title, showValueFile, fileName, BYORConfig]
  );

  useEffect(() => {
    handleFilterOpen(true);
  }, []);
  // Add this state for auto-calculate toggle
  // const [autoCalculateSums, setAutoCalculateSums] = useState(false);

  // Instead, use the value from Redux
  // const { autoCalculateSums, setAutoCalculateSums } = useDashboard();

  // Then in the customToolbar function, keep the toggle but ensure it only shows when enableAggregation is true
  const calculateAllSums = async (silent = false, retryCount = 0) => {
    console.log(
      `[calculateAllSums]Starting calculateAllSums - Retry count: ${retryCount}`
    );

    if (isCalculatingAllSums) {
      console.log(
        "[calculateAllSums]Calculation already in progress, returning early"
      );
      return;
    }

    setIsCalculatingAllSums(true);
    console.log("[calculateAllSums]Set isCalculatingAllSums to true");

    try {
      const currentFilterData =
        tablesFilterData[showOriginal ? oc_fileName : fileName]?.["Default"]
          ?.filterData || {};
      const dimensionFilters = currentFilterData.dimensionFilters || {};
      console.log("[calculateAllSums]Current filter data:", {
        currentFilterData,
        dimensionFilters,
      });

      // Get all numeric columns that aren't ts_id columns
      console.log("[calculateAllSums]Starting numeric columns filtering");
      console.log(
        "[calculateAllSums]Calculating NumericColumns:",
        columns.map((col) => col.name)
      );

      const numericColumns = columns
        .filter((col) => {
          const isNumeric = transformedData.some(
            (row) =>
              !isNaN(row[col.name]) &&
              row[col.name] !== null &&
              row[col.name] !== ""
          );
          const isNotTsId = [
            "Demand Alignment View1 Report",
            "Demand Alignment Value View1 Report",
          ].includes(title)
            ? !configState?.scenario_plan?.demand_alignment_report?.ts_id_view1?.includes(
                col.name
              )
            : !configState.data.ts_id_columns.includes(col.name);
          return isNumeric && isNotTsId;
        })
        .map((col) => col.name);
      console.log(
        "[calculateAllSums]Filtered numeric columns:",
        numericColumns
      );

      // Show "Calculating..." indicators
      const initialSums = {};
      await parallelChunkMap(
        numericColumns,
        (col) => {
          initialSums[col] = "Calculating...";
        },
        10
      );
      setColumnSums(initialSums);
      console.log("[calculateAllSums]Set initial 'Calculating...' indicators");

      // Calculate base sums for all columns in parallel
      console.log(
        "[calculateAllSums]Starting parallel calculations for columns"
      );
      const promises = numericColumns.map(async (columnName) => {
        try {
          console.log(
            `[calculateAllSums]Calculating sum for column: ${columnName}`
          );
          // Get the base sum from API
          const baseSum = await getAggregatedValue({
            filePath: showOriginal ? oc_filePath : filePath,
            filterData: currentFilterData,
            columnName,
            userID: userInfo.userID,
          });
          console.log(
            `[calculateAllSums]Received base sum for ${columnName}:`,
            baseSum
          );

          // Calculate offset from edited cells
          const editOffset = await calculateEditedCellsOffset(columnName);
          console.log(
            `[calculateAllSums]Edit offset for ${columnName}:`,
            editOffset
          );

          // Add the offset to the base sum for display
          const totalSum = (parseFloat(baseSum) + editOffset).toFixed(2);
          console.log(
            `[calculateAllSums]Total sum for ${columnName}:`,
            totalSum
          );

          return {
            columnName,
            sum: totalSum,
            baseSum: parseFloat(baseSum).toFixed(2),
          };
        } catch (error) {
          console.error(
            `[calculateAllSums]Error calculating sum for ${columnName}:`,
            error
          );
          return { columnName, sum: "-", baseSum: "-" };
        }
      });

      // Wait for all calculations to complete
      const results = await Promise.all(promises);
      console.log(
        "[calculateAllSums]All parallel calculations completed. Results:",
        results
      );

      // Check if any results have "-" values and retry if needed
      const hasFailedResults = results.every((result) => result.sum === "-");
      if (hasFailedResults && retryCount < 3) {
        console.log(
          `[calculateAllSums]All calculations failed. Initiating retry ${
            retryCount + 1
          } of 3`
        );
        setIsCalculatingAllSums(false);
        setTimeout(() => {
          calculateAllSums(silent, retryCount + 1);
        }, 1000);
        return;
      }

      // Update state with all results
      const newSums = {};
      const baseSums = {};
      await parallelChunkMap(
        results,
        ({ columnName, sum, baseSum }) => {
          newSums[columnName] = sum;
          baseSums[columnName] = baseSum;
        },
        10
      );
      console.log("[calculateAllSums]Processed results:", {
        newSums,
        baseSums,
      });

      // Update displayed sums with the totals (including offsets)
      setColumnSums(newSums);
      console.log("[calculateAllSums]Updated column sums in state");

      // Store only the base sums in the cache (without offsets)
      if (!Object.values(baseSums).some((value) => value === "-")) {
        console.log("[calculateAllSums]Storing base sums in cache");
        await setAggregatedValues(
          showOriginal ? oc_fileName : fileName,
          "Default",
          baseSums,
          currentFilterData
        );
        console.log("[calculateAllSums]Successfully stored base sums in cache");
      } else {
        console.log(
          "[calculateAllSums]Skipping cache storage due to invalid values"
        );
      }

      console.log("[calculateAllSums]Final calculation results:", {
        displaySums: newSums,
        baseSums: baseSums,
        editedCells: editedCells,
      });
    } catch (error) {
      console.error("[calculateAllSums]Error in calculateAllSums:", error);
    } finally {
      setIsCalculatingAllSums(false);
      console.log(
        "[calculateAllSums]Calculation completed, reset isCalculatingAllSums to false"
      );
    }
  };

  // Add this ref to track if we need to calculate
  const pendingCalculationRef = useRef(false);

  /*   useEffect(() => {
    if (tableData && Object.keys(tableData).length > 0 && !requiredKeys) {
      const keys = Object.keys(tableData);
      const fileFilterData = {
        dimensionFilters:
          tablesFilterData[fileName]?.["Default"]?.filterData
            ?.dimensionFilters ?? {},
        frozenColumns:
          tablesFilterData[fileName]?.["Default"]?.filterData?.frozenColumns ??
          [],
        columnFilter:
          tablesFilterData[fileName]?.["Default"]?.filterData?.columnFilter ??
          [],
        selectAllColumns:
          tablesFilterData[fileName]?.["Default"]?.filterData
            ?.selectAllColumns ?? true,
      };
      const orderedColumns = fileFilterData.columnFilter || [];
      console.log("orderedColumns", orderedColumns);
      if (orderedColumns.length > 0) {
        setRequiredKeys(orderedColumns);
      } else {
        setRequiredKeys(keys);
      }
      console.log("Setting requiredKeys to:", keys); // Log the keys you're setting, not the state variable
    }
  }, [
    tableData,
    requiredKeys,
    tablesFilterData[fileName]?.["Default"]?.filterData,
  ]); */

  // Add another useEffect to log when requiredKeys changes
  /*  useEffect(() => {
    if (requiredKeys) {
      console.log("requiredKeys updated:", requiredKeys);
    }
  }, [requiredKeys]); */

  // Then modify the useEffect to use the ref
  useEffect(() => {
    console.log("======= useEffect triggered =======");

    // Only proceed if enableAggregation is true
    if (!enableAggregation) {
      console.log("Early return: enableAggregation=", enableAggregation);
      return;
    }

    // Get the current filter data
    const currentFilterData =
      tablesFilterData[showOriginal ? oc_fileName : fileName]?.["Default"]
        ?.filterData || {};
    const dimensionFilters = currentFilterData.dimensionFilters || {};

    // Check if we have aggregated values for these dimension filters
    const aggregatedValuesHistory =
      tablesFilterData[showOriginal ? oc_fileName : fileName]?.["Default"]
        ?.aggregatedValuesHistory || [];

    console.log("Current dimension filters:", dimensionFilters);
    console.log("Aggregated values history:", aggregatedValuesHistory);

    // Find a matching cached entry using robust comparison
    let cachedEntry = null;

    // Check if we have any history entries
    if (aggregatedValuesHistory.length > 0) {
      // Try to find a match using a more lenient comparison
      const currentKeys = Object.keys(dimensionFilters).sort();

      for (const entry of aggregatedValuesHistory) {
        if (!entry.dimensionFilters) continue;

        const entryKeys = Object.keys(entry.dimensionFilters).sort();

        // Check if they have the same keys
        if (JSON.stringify(currentKeys) === JSON.stringify(entryKeys)) {
          // Check if all values match
          let allMatch = true;
          for (const key of currentKeys) {
            if (
              JSON.stringify(dimensionFilters[key]) !==
              JSON.stringify(entry.dimensionFilters[key])
            ) {
              allMatch = false;
              break;
            }
          }

          if (allMatch && entry.aggregated_values) {
            if (
              Object.values(entry.aggregated_values).some(
                (value) => value === "-"
              )
            ) {
              continue;
            } else {
              cachedEntry = entry;
              break;
            }
          }
        }
      }
    }

    console.log("Found cached entry with robust comparison:", cachedEntry);

    if (
      cachedEntry?.aggregated_values &&
      Object.keys(cachedEntry.aggregated_values).length > 0
    ) {
      console.log("Using cached aggregated values for filter change");
      console.log("Cached values:", cachedEntry.aggregated_values);

      // Apply edited cells offset to cached values when we have editedCells
      const updatedSums = {};
      const fetchUpdatedSums = async () => {
        await parallelChunkMap(
          Object.entries(cachedEntry.aggregated_values),
          async ([columnName, baseSum]) => {
            if (baseSum === "-") {
              updatedSums[columnName] = "-";
            } else {
              // Apply offset from edited cells if any
              const editOffset = await calculateEditedCellsOffset(columnName);
              console.log("Edit offset:", editOffset);
              console.log("Base sum:", baseSum);
              console.log("Column name:", columnName);
              updatedSums[columnName] = (
                parseFloat(baseSum) + editOffset
              ).toFixed(2);
            }
          },
          10
        );
      };
      fetchUpdatedSums();
      // Object.entries(cachedEntry.aggregated_values).forEach(
      //   async ([columnName, baseSum]) => {
      //     if (baseSum === "-") {
      //       updatedSums[columnName] = "-";
      //     } else {
      //       // Apply offset from edited cells if any
      //       const editOffset = await calculateEditedCellsOffset(columnName);
      //       console.log("Edit offset:", editOffset);
      //       console.log("Base sum:", baseSum);
      //       console.log("Column name:", columnName);
      //       updatedSums[columnName] = (
      //         parseFloat(baseSum) + editOffset
      //       ).toFixed(2);
      //     }
      //   }
      // );

      // Make sure we're setting a new object to trigger a re-render
      setColumnSums(updatedSums);

      // If auto-calculate is enabled, check if we need to recalculate
      if (autoCalculateSums) {
        // Check if all values are "-" or "0.00" or 0
        const cachedValues = Object.values(updatedSums);
        const allValuesAreEmpty =
          cachedValues.length > 0 &&
          cachedValues.every(
            (value) => value === "-" || value === "0.00" || value === 0
          );

        if (allValuesAreEmpty) {
          console.log(
            "All cached values are empty, scheduling recalculation..."
          );
          pendingCalculationRef.current = true;
        }
      }
    } else {
      // Clear column sums if no cached values exist for this filter
      console.log("No cached values found, clearing column sums");
      setColumnSums({});

      // If auto-calculate is enabled, schedule calculation
      if (autoCalculateSums) {
        console.log("Auto-calculate is enabled, scheduling calculation");
        pendingCalculationRef.current = true;
      }
    }
  }, [
    fileName,
    enableAggregation,
    autoCalculateSums,
    editedCells,
    showOriginal,
    oc_fileName,
    // Use a stable reference or a string representation of the filters
    JSON.stringify(
      tablesFilterData[showOriginal ? oc_fileName : fileName]?.["Default"]
        ?.filterData?.dimensionFilters || {}
    ),
  ]);

  function parseDatasetPath(datasetPath) {
    if (typeof datasetPath !== "string") return "";

    return datasetPath
      .split(".csv")[0] // remove .csv extension
      .split("/") // split by slash
      .join("_"); // join with underscore
  }

  // Add a new useEffect to handle the actual calculation
  // This breaks the circular dependency
  useEffect(() => {
    // Only run if columns are available AND we have a pending calculation

    if (columns.length > 0 && pendingCalculationRef.current) {
      console.log(
        "Executing pending calculation with columns:",
        columns.length
      );
      calculateAllSums(false);
      pendingCalculationRef.current = false;
    }
  }, [columns, pendingCalculationRef.current]); // Remove pendingCalculationRef.current from dependency array

  const EditingIcons = () => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    // Get the column names in order from the current table data
    const requiredColumns = useMemo(() => {
      console.log("Recalculating requiredColumns");
      if (transformedData && transformedData.length > 0) {
        let orderedColumns =
          tablesFilterData[fileName]?.["Default"]?.filterData?.columnFilter ||
          [];
        if (orderedColumns.length === 0) {
          console.log("No orderedColumns, using transformedData columns");
          orderedColumns = Object.keys(transformedData[0]);
        }

        console.log(
          "requiredColumns changed to orderedColumns:",
          orderedColumns
        );
        return orderedColumns;
      }
      console.log(
        "requiredColumns changed to tableData columns:",
        Object.keys(tableData)
      );
      return Object.keys(tableData);
    }, [
      transformedData,
      showValueFile,
      showOriginal,
      title,
      tablesFilterData[fileName]?.["Default"]?.filterData,
    ]); // Add dependencies that might affect transformedData

    // Get editable columns
    const editableColumns = useMemo(() => {
      if (!transformedData || transformedData.length === 0) return [];
      return Object.keys(transformedData[0]).filter((column) =>
        isEditableColumn(column)
      );
    }, [transformedData, isEditableColumn]);

    // Create the upload path using the correct format, including userID
    const getUploadPath = useMemo(() => {
      if (!filePath) return "";
      const filePathParts = filePath.split("/");
      const fileName = filePathParts[filePathParts.length - 1];
      return `${experimentBasePath}/scenario_planning/K_best/edits/${userInfo.userID}/${fileName}`;
    }, [filePath, experimentBasePath, userInfo.userID]);

    return (
      <Stack direction="row" spacing={1} alignItems={"center"}>
        {enableFileUpload && editState && (
          <>
            <Button
              startIcon={<FileUploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              //disabled={!transformedData || transformedData.length === 0}
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Upload
            </Button>

            <UploadFileDialog
              open={uploadDialogOpen}
              handleClose={() => setUploadDialogOpen(false)}
              uploadPath={getUploadPath}
              requiredColumns={requiredColumns || []}
              fileName={filePath}
              getTimeStamp={getTimeStamp}
              setEditedCells={setEditedCells}
              setEditHistory={setEditHistory}
              editableColumns={editableColumns}
              rowDimension={rowDimension}
              isRowEditable={isRowEditable}
              editedCells={editedCells}
              editHistory={editHistory}
              editableRowDimensionValues={editableRowDimensionValues}
              onNewRowsApproved={(newRows) => setNewRows(fileName, newRows)}
            />
          </>
        )}
        {valueFileTitle && (
          <FormControlLabel
            control={
              <IOSSwitch
                checked={showValueFile}
                onChange={async () => {
                  // Set the state first
                  await setShowValueFile((prevState) => !prevState);
                  await setEditState((prevState) => !prevState);
                  // Then reset the table data to force a refetch
                  // if (editState) {
                  //   setEditState(false);
                  // } else if (!showValueFile) {
                  //   // Note: using !showValueFile because the state hasn't updated yet
                  //   setEditState(true);
                  // }
                  if (showOriginal) {
                    setShowOriginal(false);
                  }
                }}
                size="small"
              />
            }
            label={
              <span
                style={{
                  color: "#667085",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "left",
                  paddingLeft: "0.5rem",
                  textTransform: "none",
                }}
              >
                {showValueLable ? showValueLable : "Show by Values"}
              </span>
            }
          />
        )}
        {oc_path && (
          <FormControlLabel
            control={
              <IOSSwitch
                checked={showOriginal}
                onChange={async () => {
                  await setShowOriginal((prevState) => !prevState);
                  if (editState) {
                    setEditState(false);
                  } else if (showOriginal) {
                    setEditState(true);
                  }
                  if (showValueFile) {
                    setShowValueFile(false);
                  }
                }}
                size="small"
              />
            }
            label={
              <span
                style={{
                  color: "#667085",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "left",
                  paddingLeft: "0.5rem",
                  textTransform: "none",
                }}
              >
                ML Forecast mode
              </span>
            }
          />
        )}

        {editHistory.length > 0 && editState && (
          <IconButton onClick={handleUndo} marginRight="2 px">
            <UndoRoundedIcon />
          </IconButton>
        )}
        {isEditable && (
          <FormControlLabel
            control={
              <IOSSwitch
                disabled={showOriginal}
                checked={editState}
                onChange={async () => {
                  await setEditState((prevState) => !prevState);
                  if (showOriginal) {
                    setShowOriginal(false);
                  } else if (editState) {
                    setShowOriginal(true);
                  }
                  if (showValueFile) {
                    setShowValueFile(false);
                  }
                }}
                size="small"
              />
            }
            label={
              <span
                style={{
                  color: "#667085",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "left",
                  paddingLeft: "0.5rem",
                  textTransform: "none",
                }}
              >
                Edit Mode
              </span>
            }
          />
        )}
      </Stack>
    );
  };

  const options = useMemo(
    () => ({
      selectableRows: "multiple",
      // selectableRowsOnClick: false,
      // resizableColumns: true,
      // rowHover: false,
      // draggable: true,
      filter: false,
      print: false,
      download: false,
      viewColumns: false, // Disable default CSV download button
      search: false,
      // sort: false,
      setTableProps: () => ({
        style: {
          backgroundColor: "#fff",
        },
      }),
      setRowProps: (row, dataIndex) => ({
        style: {
          backgroundColor: dataIndex % 2 === 1 ? "#fff" : "aliceblue",
        },
      }),
      customToolbar: () => {
        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
          >
            {/* Keep manual calculate button as an option when auto-calculate is disabled */}
            {enableAggregation && !autoCalculateSums && (
              <Button
                startIcon={<FunctionsIcon />}
                onClick={() => calculateAllSums(false)}
                disabled={isCalculatingAllSums}
                sx={{
                  color: "#667085",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {isCalculatingAllSums ? "Calculating..." : "Calculate Sums"}
              </Button>
            )}
            {/* Only show Auto Calculate toggle if enableAggregation is true */}
            {enableAggregation && (
              <FormControlLabel
                control={
                  <IOSSwitch
                    checked={autoCalculateSums}
                    onChange={() => setAutoCalculateSums(!autoCalculateSums)}
                    size="small"
                  />
                }
                label={
                  <span
                    style={{
                      color: "#667085",
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: "20px",
                      textAlign: "left",
                      paddingLeft: "0.5rem",
                      textTransform: "none",
                    }}
                  >
                    Auto Calculate
                  </span>
                }
              />
            )}

            {(isEditable || valueFileTitle) && <EditingIcons />}

            <IconButton
              onClick={
                currentCompany.download_reports
                  ? showOriginal
                    ? handleOCDownload
                    : handleDownload
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
            {isBYOREnabled && (
              <IconButton
                onClick={() => {
                  if (reportTitle && !groupAggregationOpen) {
                    loadBYORConfig(reportTitle);
                  }
                  setGroupAggregationOpen(!groupAggregationOpen);
                }}
              >
                <BuildIcon />
              </IconButton>
            )}
            {isBaseData && (
              <IconButton onClick={() => setEditorOpen(true)}>
                <CodeIcon />
              </IconButton>
            )}
            {isFilterable && (
              <IconButton
                onClick={() => {
                  if (reportTitle) {
                    loadBYORConfig(reportTitle);
                  }
                  handleFilterOpen(false);
                }}
              >
                <FilterIcon />
              </IconButton>
            )}
            {tablesFilterData[fileName]?.["Default"] !== undefined && (
              <IconButton onClick={() => setSaveReportOpen(true)}>
                <SaveIcon />
              </IconButton>
            )}
          </Stack>
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
      sort: false, // Disable sorting for all columns
      sortAction: false, // Disable sort action completely
    }),
    [
      title,
      isFilterable,
      handleDownload,
      transformedData,
      requiredKeys,
      loading,
      currentPage,
      currentBatch,
      handleFilterOpen,
      editHistory,
      editState,
      showOriginal,
      loadingOC,
      showValueFile,
      columnSums,
      isCalculatingAllSums,
      enableAggregation,
      autoCalculateSums, // Add this dependency
    ]
  );

  // Add this effect to log column sums whenever they change
  useEffect(() => {
    console.log("Column sums changed:", columnSums);
  }, [columnSums]);

  // Add this function near the top of your component, after other utility functions
  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
  };
  const getCurrentValue = async (columnName, row) => {
    console.log(
      "Getting current value for column:",
      columnName,
      "and row:",
      row
    );
    const payload = {
      fileName: showOriginal ? oc_fileName : fileName,
      filePath: showOriginal ? oc_filePath : filePath,
      filterData: {
        dimensionFilters: {},
        columnFilter: [`${columnName}`],
        selectAllColumns: false,
      },
      sortingData: null,
      groupByColumns: null,
      aggregationColumns: null,
      filterConditions: null,
      paginationData: { batchNo: row, batchSize: 1 },
      time: Date.now(),
    };
    const response = await fetchCSVData(payload);
    console.log("Current Value Response:", response);
    const currentValue = parseFloat(response[columnName][0]);
    console.log("Current Value:", currentValue);
    return currentValue;
  };
  const getCurrentData = async (columns) => {
    const payload = {
      fileName: showOriginal ? oc_fileName : fileName,
      filePath: showOriginal ? oc_filePath : filePath,
      filterData: {
        dimensionFilters: {},
        columnFilter: columns,
        selectAllColumns: false,
      },
      sortingData: null,
      groupByColumns: null,
      aggregationColumns: null,
      filterConditions: null,
      paginationData: null,

      time: Date.now(),
    };
    const response = await fetchCSVData(payload);
    return response;
  };
  // Helper function to check if a cell matches current dimension filters
  const matchesDimensionFilters = (cell) => {
    const currentFilters =
      tablesFilterData[showOriginal ? oc_fileName : fileName]?.["Default"]
        ?.filterData?.dimensionFilters || {};
    console.log("[matchesDimensionFilters] Starting check for cell:", cell);
    console.log("[matchesDimensionFilters] Current filters:", currentFilters);

    // Filter out dimensions that have empty arrays as values
    const activeFilters = Object.entries(currentFilters).filter(
      ([_, values]) => values && values.length > 0
    );

    // If no active filters (all are empty arrays), include all edits
    if (activeFilters.length === 0) {
      return true;
    }

    // Find the row that matches this cell's ts_id
    // Log title and configState to debug
    console.log("[matchesDimensionFilters] Title:", title);
    console.log("[matchesDimensionFilters] ConfigState:", configState);

    const ts_id_cols = [
      "Demand Alignment View1 Report",
      "Demand Alignment Value View1 Report",
    ].includes(title)
      ? configState?.scenario_plan?.demand_alignment_report
          ?.ts_id_columns_view1 || []
      : configState?.data?.ts_id_columns || [];

    console.log("[matchesDimensionFilters] TS ID Cols:", ts_id_cols);
    const matchingRow = transformedData.find((row) => {
      const rowTsId = ts_id_cols.map((col) => row[col]).join("_");
      return rowTsId === cell.ts_id;
    });

    if (!matchingRow) return false;

    // Check if the row matches all active dimension filters
    return activeFilters.every(([dimension, values]) => {
      const convertedDim = convert(dimension);
      const rowValue = matchingRow[convertedDim];
      return values.includes(rowValue);
    });
  };

  // Add helper function to calculate edited cells offset
  const calculateEditedCellsOffset = async (columnName) => {
    console.log("Calculating edited cells offset for column:", columnName);
    if (!editState || showOriginal) {
      console.log("No edit state or showing original data, returning 0");
      return 0;
    }

    let offset = 0;
    // Use for...of to handle async/await properly
    const filteredCells = editedCells.filter((cell) => cell.col === columnName);
    for (const cell of filteredCells) {
      if (cell.col === columnName && matchesDimensionFilters(cell)) {
        console.log("Cell:", cell);
        const initialValue = parseFloat(cell.initialValue) || 0;
        const finalValue = parseFloat(cell.finalValue) || 0;
        //const currentValue = await getCurrentValue(columnName, cell.row);
        const currentValue = finalValue;

        console.log("Current Value:", currentValue);
        console.log("Final Value:", finalValue);
        if (finalValue !== currentValue) {
          console.log("Difference:", finalValue - currentValue);
          offset += finalValue - currentValue;
        } else {
          console.log("No Difference");
          offset += 0;
        }
      }
    }
    console.log("Edited Cells Offset:", offset, "Column:", columnName);
    return offset;
  };

  return (
    <ErrorWrapper>
      <ThemeProvider theme={customTheme}>
        <ToastContainer />
        <CustomScrollbar>
          {transformedData.length > 0 ? (
            <>
              <MUIDataTable
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                      {reportTitle
                        ? reportTitle
                        : showValueFile
                        ? valueFileTitle
                        : alternateTitle
                        ? alternateTitle
                        : title}
                    </Typography>
                    {isLargeData && (
                      <CustomTooltip
                        title="Data is too large. If you are facing any difficulties, download the data and view in your own system."
                        arrow
                        placement="top"
                      >
                        <Chip
                          icon={<WarningRoundedIcon />}
                          label="Large Data"
                          size="small"
                          sx={{
                            backgroundColor: WARNING.light,
                            color: WARNING.dark,
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: "500",
                            "& .MuiChip-icon": {
                              color: WARNING.dark,
                            },
                          }}
                        />
                      </CustomTooltip>
                    )}
                  </Box>
                }
                data={transformedData}
                columns={columns}
                options={options}
                // style={tableStyles}
              />

              {/* New Rows Table */}
              {(() => {
                console.log("Checking newRows condition:");
                console.log("newRows exists:", !!newRows);
                console.log(
                  "newRows[fileName] exists:",
                  !!(newRows && newRows[fileName])
                );
                console.log(
                  "newRows[fileName].length > 0:",
                  !!(
                    newRows &&
                    newRows[fileName] &&
                    newRows[fileName].length > 0
                  )
                );
                return (
                  newRows && newRows[fileName] && newRows[fileName].length > 0
                );
              })() && (
                <Box sx={{ mt: 1 }}>
                  <MUIDataTable
                    title={
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#027A48",
                          textAlign: "left",
                          lineHeight: "28px",
                        }}
                      >
                        New Rows Added ({newRows[fileName]?.length || 0})
                      </Typography>
                    }
                    data={(newRows[fileName] || []).map(async (row) => {
                      const transformedRow = {};
                      await parallelChunkMap(
                        Object.keys(row.rowData),
                        (key) => {
                          const value = row.rowData[key];
                          if (value === "") {
                            transformedRow[key] = "None";
                          } else if (value === " ") {
                            transformedRow[key] = "";
                          } else if (value === null) {
                            transformedRow[key] = "";
                          } else if (!isNaN(value)) {
                            if (isFloat(value)) {
                              transformedRow[key] =
                                parseFloat(value).toFixed(2);
                            } else {
                              transformedRow[key] = value;
                            }
                          } else {
                            transformedRow[key] = value;
                          }
                        },
                        10
                      );
                      return transformedRow;
                    })}
                    columns={Object.keys(
                      newRows[fileName] && newRows[fileName][0]
                        ? newRows[fileName][0].rowData
                        : {}
                    ).map((key) => ({
                      name: key,
                      label: formatKey(key),
                      options: {
                        filter: false,
                        sort: false,
                        setCellHeaderProps: () => ({
                          style: {
                            backgroundColor: "#ECFDF3",
                            color: "#027A48",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            lineHeight: "14px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textTransform: "none",
                            padding: "12px 16px",
                            border: "1px solid #D1FADF",
                          },
                        }),
                        setCellProps: (cellData, dataIndex) => ({
                          style: {
                            minWidth: "150px",
                            maxWidth: "300px",
                            color: "#027A48",
                            backgroundColor:
                              dataIndex % 2 === 1 ? "#F6FEF9" : "#ECFDF3",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            lineHeight: "14px",
                            textAlign: !isNaN(cellData) ? "right" : "left",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            padding: "8px 16px",
                            border: "1px solid #D1FADF",
                          },
                        }),
                      },
                    }))}
                    options={{
                      selectableRows: "none",
                      filter: false,
                      print: false,
                      download: false,
                      viewColumns: false,
                      search: false,
                      sort: false,
                      pagination: true,
                      rowsPerPage: 5,
                      rowsPerPageOptions: [5, 10, 20],
                      customToolbar: null,
                      setTableProps: () => ({
                        style: {
                          backgroundColor: "#F6FEF9",
                        },
                      }),
                      setRowProps: (row, dataIndex) => ({
                        style: {
                          backgroundColor:
                            dataIndex % 2 === 1 ? "#F6FEF9" : "#ECFDF3",
                        },
                      }),
                      customFooter: (
                        count,
                        page,
                        rowsPerPage,
                        changeRowsPerPage,
                        changePage
                      ) => (
                        <Box
                          sx={{
                            padding: "16px",
                            backgroundColor: "#FFFFFF",
                            display: "flex",
                            justifyContent: "flex-end",
                            borderTop: "1px solid #D1FADF",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                color: "#344054",
                              }}
                            >
                              Rows per page:
                            </Typography>
                            <select
                              value={rowsPerPage}
                              onChange={(e) =>
                                changeRowsPerPage(parseInt(e.target.value))
                              }
                              style={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                padding: "4px 8px",
                                border: "1px solid #D1FADF",
                                borderRadius: "4px",
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                color: "#344054",
                              }}
                            >
                              {`${page * rowsPerPage + 1}-${Math.min(
                                (page + 1) * rowsPerPage,
                                count
                              )} of ${count}`}
                            </Typography>
                            <IconButton
                              onClick={() => changePage(page - 1)}
                              disabled={page === 0}
                              sx={{ color: "#344054" }}
                            >
                              ‹
                            </IconButton>
                            <IconButton
                              onClick={() => changePage(page + 1)}
                              disabled={(page + 1) * rowsPerPage >= count}
                              sx={{ color: "#344054" }}
                            >
                              ›
                            </IconButton>
                          </Stack>
                        </Box>
                      ),
                    }}
                  />
                </Box>
              )}

              {/* Deleted Rows Table
              {(() => {
                console.log("Checking deletedRows condition:");
                console.log("deletedRows exists:", !!deletedRows);
                console.log(
                  "deletedRows[fileName] exists:",
                  !!(deletedRows && deletedRows[fileName])
                );
                console.log(
                  "deletedRows[fileName].length > 0:",
                  !!(
                    deletedRows &&
                    deletedRows[fileName] &&
                    deletedRows[fileName].length > 0
                  )
                );
                return (
                  deletedRows &&
                  deletedRows[fileName] &&
                  deletedRows[fileName].length > 0
                );
              })() && (
                <Box sx={{ mt: 1 }}>
                  <MUIDataTable
                    title={
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#D92D20",
                          textAlign: "left",
                          lineHeight: "28px",
                        }}
                      >
                        Deleted Rows ({deletedRows[fileName]?.length || 0})
                      </Typography>
                    }
                    data={(deletedRows[fileName] || []).map(async (row) => {
                      const transformedRow = {};
                      await parallelChunkMap(
                        Object.keys(row.rowData),
                        (key) => {
                          const value = row.rowData[key];
                          if (value === "") {
                            transformedRow[key] = "None";
                          } else if (value === " ") {
                            transformedRow[key] = "";
                          } else if (value === null) {
                            transformedRow[key] = "";
                          } else if (!isNaN(value)) {
                            if (isFloat(value)) {
                              transformedRow[key] =
                                parseFloat(value).toFixed(2);
                            } else {
                              transformedRow[key] = value;
                            }
                          } else {
                            transformedRow[key] = value;
                          }
                        },
                        10
                      );
                      return transformedRow;
                    })}
                    columns={Object.keys(
                      deletedRows[fileName] &&
                        deletedRows[fileName][0] &&
                        deletedRows[fileName][0].rowData !== undefined
                        ? deletedRows[fileName][0].rowData
                        : {}
                    ).map((key) => ({
                      name: key,
                      label: formatKey(key),
                      options: {
                        filter: false,
                        sort: false,
                        setCellHeaderProps: () => ({
                          style: {
                            backgroundColor: "#FEF3F2",
                            color: "#B42318",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            lineHeight: "14px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textTransform: "none",
                            padding: "12px 16px",
                            border: "1px solid #FECDCA",
                          },
                        }),
                        setCellProps: (cellData, dataIndex) => ({
                          style: {
                            minWidth: "150px",
                            maxWidth: "300px",
                            color: "#B42318",
                            backgroundColor:
                              dataIndex % 2 === 1 ? "#FFFBFA" : "#FEF3F2",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            lineHeight: "14px",
                            textAlign: !isNaN(cellData) ? "right" : "left",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textDecoration: "line-through",
                            padding: "8px 16px",
                            border: "1px solid #FECDCA",
                          },
                        }),
                      },
                    }))}
                    options={{
                      selectableRows: "none",
                      filter: false,
                      print: false,
                      download: false,
                      viewColumns: false,
                      search: false,
                      sort: false,
                      pagination: true,
                      rowsPerPage: 5,
                      rowsPerPageOptions: [5, 10, 20],
                      customToolbar: null,
                      setTableProps: () => ({
                        style: {
                          backgroundColor: "#FFFBFA",
                        },
                      }),
                      setRowProps: (row, dataIndex) => ({
                        style: {
                          backgroundColor:
                            dataIndex % 2 === 1 ? "#FFFBFA" : "#FEF3F2",
                        },
                      }),
                      customFooter: (
                        count,
                        page,
                        rowsPerPage,
                        changeRowsPerPage,
                        changePage
                      ) => (
                        <Box
                          sx={{
                            padding: "16px",
                            backgroundColor: "#FFFFFF",
                            display: "flex",
                            justifyContent: "flex-end",
                            borderTop: "1px solid #FECDCA",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                color: "#344054",
                              }}
                            >
                              Rows per page:
                            </Typography>
                            <select
                              value={rowsPerPage}
                              onChange={(e) =>
                                changeRowsPerPage(parseInt(e.target.value))
                              }
                              style={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                padding: "4px 8px",
                                border: "1px solid #FECDCA",
                                borderRadius: "4px",
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                color: "#344054",
                              }}
                            >
                              {`${page * rowsPerPage + 1}-${Math.min(
                                (page + 1) * rowsPerPage,
                                count
                              )} of ${count}`}
                            </Typography>
                            <IconButton
                              onClick={() => changePage(page - 1)}
                              disabled={page === 0}
                              sx={{ color: "#344054" }}
                            >
                              ‹
                            </IconButton>
                            <IconButton
                              onClick={() => changePage(page + 1)}
                              disabled={(page + 1) * rowsPerPage >= count}
                              sx={{ color: "#344054" }}
                            >
                              ›
                            </IconButton>
                          </Stack>
                        </Box>
                      ),
                    }}
                  />
                </Box>
              )} */}
            </>
          ) : (
            <Stack
              sx={{ width: "100%", padding: "16px", height: "100%" }}
              spacing={2}
            >
              {/* Skeleton Loader */}
              <Skeleton variant="text" width="30%" height="40px" />
              <Stack spacing={1}>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <Stack key={rowIndex} direction="row" spacing={1}>
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <Skeleton
                        key={colIndex}
                        variant="text"
                        width="100%"
                        height="50px"
                      />
                    ))}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}
        </CustomScrollbar>

        {Object.keys(tablesFilterData).includes(fileName) && (
          <Stack
            sx={{
              margin: "16px 20px",
              border: "1px solid #D0D5DD",
              borderRadius: "8px",
            }}
          >
            {tablesFilterData[fileName] && (
              <Accordion
                disableGutters
                sx={{
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  // maxHeight: "50vh", // Adjust as necessary
                  overflow: "hidden", // Prevent overflow from affecting layout
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={"0.5rem"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    // flex={1}
                    // display={'flex'}
                    // paddingRight={"4px"}
                  >
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
                      Custom Reports
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "16px",
                        fontWeight: "400",
                        color: "#101828",
                        textAlign: "left",
                        lineHeight: "20px",
                      }}
                    >
                      ({Object.keys(tablesFilterData[fileName]).length - 1})
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {Object.keys(tablesFilterData[fileName]).map((reportId) => {
                      return (
                        <React.Fragment key={reportId}>
                          {reportId !== "Default" && (
                            <CustomReportWrapper
                              reportId={reportId}
                              fileName={fileName}
                              filePath={filePath}
                              reportTitle={reportTitle}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        )}

        {!reportTitle ? (
          <CustomFilterDialog
            fileName={
              isBaseData
                ? parseDatasetPath(datasetPath)
                : fileNameDict[showValueFile ? valueFileTitle : title]
            }
            childFiles={
              valueFileTitle
                ? [
                    {
                      fileName:
                        fileNameDict[showValueFile ? title : valueFileTitle],
                      reportName: showValueFile ? title : valueFileTitle,
                    },
                  ]
                : []
            }
            reportId={"Default"}
            reportName={showValueFile ? valueFileTitle : title}
            open={filterOpen}
            handleClose={() => setFilterOpen(false)}
          />
        ) : (
          filterOpen && (
            <CustomBYORFilterDialog
              reportName={showValueFile ? valueFileTitle : reportTitle}
              open={true}
              handleClose={() => setFilterOpen(false)}
            />
          )
        )}
        <BYORDialog
          open={groupAggregationOpen}
          handleClose={() => {
            clearBYORData();
            setGroupAggregationOpen(false);
          }}
          data={tableData}
          title={showValueFile ? valueFileTitle : title}
          isAlreadyTransformed={isAlreadyTransformed}
          fileName={fileNameDict[showValueFile ? valueFileTitle : title]}
          filePath={filePath ? filePath : datasetPath}
          reportTitle={reportTitle}
          customColumns={customColumns}
        />

        <EditorDialog
          open={editorOpen}
          handleClose={() => setEditorOpen(false)}
          title={title}
        />
        <SaveReportDialog
          handleClose={() => setSaveReportOpen(false)}
          fileName={fileNameDict[showValueFile ? valueFileTitle : title]}
          open={saveReportOpen}
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

export default CustomTable;
