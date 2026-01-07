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
  Table,
  TableBody,
  TableContainer,
  TableHead,
  CircularProgress,
  Tooltip,
} from "@mui/material";
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
  Calculate as CalculateIcon,
  TableChart as TableChartIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  GetApp as GetAppIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon,
  AutoFixHigh as AutoFixHighIcon,
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
import { setExperimentBasePath } from "../redux/actions/dashboardActions";
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
import { oldFlowModules } from "../utils/oldFlowModules";
import { parallelChunkMap } from "../utils/parallelChunkMap";
import store from "../redux/store";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

// Styled components for toolbar buttons
const ToolbarButton = styled(Button)(
  ({ theme, active, variant = "primary" }) => ({
    minWidth: "auto",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    "& .MuiButton-startIcon": {
      marginRight: "4px",
    },
    ...(variant === "primary" && {
      backgroundColor: active ? "#3b82f6" : "transparent",
      color: active ? "#ffffff" : "#64748b",
      "&:hover": {
        backgroundColor: active ? "#2563eb" : "#f1f5f9",
      },
    }),
    ...(variant === "success" && {
      backgroundColor: active ? "#10b981" : "transparent",
      color: active ? "#ffffff" : "#64748b",
      border: "1px solid #e2e8f0",
      "&:hover": {
        backgroundColor: active ? "#059669" : "#f1f5f9",
      },
    }),
  })
);

// Styled component for toggle state indicator
const ToggleStateIndicator = styled(Box)(
  ({ theme, active, variant = "success" }) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ...(variant === "success" && {
      backgroundColor: active ? "#f0fdf4" : "#f8fafc",
      color: active ? "#166534" : "#64748b",
      border: `1px solid ${active ? "#bbf7d0" : "#e2e8f0"}`,
      "&:hover": {
        backgroundColor: active ? "#dcfce7" : "#f1f5f9",
        borderColor: active ? "#86efac" : "#cbd5e1",
      },
    }),
    ...(variant === "primary" && {
      backgroundColor: active ? "#eff6ff" : "#f8fafc",
      color: active ? "#1d4ed8" : "#64748b",
      border: `1px solid ${active ? "#bfdbfe" : "#e2e8f0"}`,
      "&:hover": {
        backgroundColor: active ? "#dbeafe" : "#f1f5f9",
        borderColor: active ? "#93c5fd" : "#cbd5e1",
      },
    }),
    "& .MuiSvgIcon-root": {
      fontSize: "14px",
    },
  })
);

const ToolbarIconButton = styled(IconButton)(({ theme }) => ({
  color: "#374151",
  fontSize: "5px",
  "&:hover": {
    backgroundColor: "#f3f4f6",
  },
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "0px",
  padding: "4px 8px 6px 8px",
  marginTop: "8px",
  width: "100%",
}));

const ToolbarToggleGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: "transparent",
  borderRadius: "12px",
  padding: "4px",
  border: "none",
  gap: "4px",
}));

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
  showValueDescription = null,
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
    loadBYORConfig,
    clearBYORData,
    BYORConfig,
    BYORData,
    experimentBasePath,
    updateBYORFilterData,
    saveBYORConfig,
    lastSyncedTime,
  } = useDashboard();
  const { hasParquetFiles } = useModule();
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
    setNewRows,
    newRows,
  } = useModule();
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
    Lgbm:
      `${experimentBasePath}/training/virtual_future_run/Lgbm/ts_metrics`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    MLP:
      `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics`
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

  const [editorOpen, setEditorOpen] = useState(false);
  const [showValueFile, setShowValueFile] = useState(false);
  const [requiredKeys, setRequiredKeys] = useState(null);
  const [fileName, setFileName] = useState(() => {
    if (isBaseData) {
      return parseDatasetPath(datasetPath);
    }
    return showValueFile ? fileNameDict[valueFileTitle] : fileNameDict[title];
  });

  const [filePath, setFilePath] = useState(
    showValueFile ? fileNamePathDict[valueFileTitle] : fileNamePathDict[title]
  );
  const [editedCells, setEditedCells] = useState([
    ...(editedFiles[fileName] || []),
  ]); // Track edited cells
  const [editHistory, setEditHistory] = useState([
    ...(editHistories[fileName] || []),
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [tableData, setTableData] = useState(data);
  const [editState, setEditState] = useState(true);
  const [isCalculatingAllSums, setIsCalculatingAllSums] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  // Add this near other state declarations
  const [columnSums, setColumnSums] = useState({});
  const [transformedData, setTransformedData] = useState([]);
  const [loading, setLoading] = useState(false); // State to track loading
  const [loadingOC, setLoadingOC] = useState(false);
  const [groupAggregationOpen, setGroupAggregationOpen] = useState(false); // State to track loading

  // TanStack Table Configuration
  const TANSTACK_TABLE_CONFIG = {
    ROW_HEIGHT: 36,
    HEADER_HEIGHT: 36,
    DEFAULT_COLUMN_WIDTH: 150,
    MIN_COLUMN_WIDTH: 80,
    MAX_COLUMN_WIDTH: 500,
    COLUMN_PADDING: "4px 8px",
  };

  // Calculate optimal column width based on number of columns
  const calculateOptimalColumnWidth = (columnCount) => {
    if (columnCount <= 0) return TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;

    // For fewer columns, distribute width more generously
    if (columnCount <= 3) {
      return Math.max(250, 900 / columnCount); // Minimum 250px, distribute 900px total
    } else if (columnCount <= 5) {
      return Math.max(200, 1000 / columnCount); // Minimum 200px, distribute 1000px total
    } else if (columnCount <= 8) {
      return Math.max(150, 1200 / columnCount); // Minimum 150px, distribute 1200px total
    } else if (columnCount <= 12) {
      return Math.max(120, 1440 / columnCount); // Minimum 120px, distribute 1440px total
    } else {
      return TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;
    }
  };

  // Get frozen columns configuration
  const frozenColumns = useMemo(() => {
    if (!transformedData || transformedData.length === 0) return [];

    const BYORFilterData = reportTitle
      ? BYORConfig[reportTitle].byorFilterData
      : {} || {};

    const fileFilterData = reportTitle
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

    const frozenCols = fileFilterData.frozenColumns || [];
    console.log("Frozen Columns", frozenCols);
    return frozenCols;
  }, [transformedData, reportTitle, fileName, tablesFilterData, BYORConfig]);

  // Create columns for TanStack Table
  const tanStackColumns = useMemo(() => {
    if (!transformedData || transformedData.length === 0) return [];
    const BYORFilterData = reportTitle
      ? BYORConfig[reportTitle].byorFilterData
      : {} || {};

    const fileFilterData = reportTitle
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

    const columnHelper = createColumnHelper();
    const isNumeric = (key) =>
      !transformedData
        .slice(0, Math.min(3, transformedData.length))
        .some((row) => {
          const value = row[key];
          return value !== null && value !== "" && isNaN(value);
        });

    let leftPosition = (key) => getLeftPosition(key);
    return Object.keys(transformedData[0] || {})
      .filter((key) => key && key.trim() !== "")
      .map((key) =>
        columnHelper.accessor(key, {
          header: (
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
                    whiteSpace: "nowrap", // Add this to ensure text truncates
                  }}
                >
                  <Typography
                    noWrap // Ensures text truncates with ellipsis
                    sx={{
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "12px",
                      fontWeight: "600",
                      color:
                        isEditableColumn(key) && editState
                          ? SUCCESS[700]
                          : key.startsWith("Risk_")
                          ? WARNING[700]
                          : "#626F86",
                    }}
                  >
                    {formatKey(key)}
                  </Typography>
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
                        fontSize: "18px",
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
              isNumeric(key) &&
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
                        textAlign: isNumeric(key) ? "right" : "left",
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
                        textAlign: isNumeric(key) ? "right" : "left",
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
          size: calculateOptimalColumnWidth(mergedColumns.length), // Dynamic column width based on actual columns
          minSize: TANSTACK_TABLE_CONFIG.MIN_COLUMN_WIDTH, // Add minSize property
          maxSize: TANSTACK_TABLE_CONFIG.MAX_COLUMN_WIDTH, // Add maxSize property
          cell: ({ row, column }) => {
            const value = row.getValue(column.id);
            // Calculate absolute row index in full dataset
            const absoluteRowIndex = (currentPage - 1) * 10 + row.index;
            const isNumeric = !isNaN(value);
            const inLoadingState = absoluteRowIndex >= transformedData.length;
            if (inLoadingState) {
              return (
                <Skeleton
                  variant="text"
                  width={(Math.random() * 0.9 + 0.1) * column.getSize()}
                  height="32px" // Fixed height to match actual cells
                  sx={{
                    padding: "2px",
                  }}
                />
              );
            }
            const ts_id = getTSID(transformedData, absoluteRowIndex);
            const rowDimensionValue = row.original[rowDimension];
            const prevValue = transformedData[absoluteRowIndex]?.[column.id];

            return (
              <EditableCell
                value={value || ""}
                prevValue={prevValue} // Add missing prevValue prop
                rowIndex={absoluteRowIndex} // Use absolute row index
                colIndex={column.id}
                columnKey={column.id}
                isNumeric={isNumeric}
                currentPage={currentPage}
                batchNo={Math.ceil(currentPage / 5)}
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
        })
      )
      .filter((column) => column && column.header);
  }, [
    transformedData,
    currentPage,
    rowDimension,
    editedCells,
    editState,
    editHistory,
    fileName,
    showValueFile,
    rowDimension,
    isRowEditable,
    TANSTACK_TABLE_CONFIG,
    formatKey,
    currentBatch,
  ]);

  // Direct slicing function for current page data
  const getCurrentPageData = () => {
    if (!transformedData || transformedData.length === 0) return [];

    const pageSize = 10;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    let result = transformedData.slice(startIndex, endIndex);

    // Handle empty results by filling with empty rows
    if (result.length === 0 && transformedData.length > 0) {
      const emptyRow = Object.keys(transformedData[0]).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {});
      result = Array(10).fill(emptyRow);
    }

    return result;
  };

  // TanStack Table instance
  const table = useReactTable({
    data: getCurrentPageData(), // Direct slicing for current page data
    columns: tanStackColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Remove getPaginationRowModel since we handle pagination manually
    manualPagination: true, // We handle pagination manually due to batch loading
    pageCount: Math.ceil(transformedData.length / 10),
    columnResizeMode: "onChange", // Enable column resizing
    columnPinning: {
      left: frozenColumns,
    },
  });

  // Column virtualization setup
  const parentRef = useRef(null);
  const columnHeaders = table.getHeaderGroups()[0]?.headers || [];

  // Separate pinned columns from virtualized columns
  const pinnedHeaders = columnHeaders.filter((header) =>
    frozenColumns.includes(header.id)
  );
  const nonPinnedHeaders = columnHeaders.filter(
    (header) => !frozenColumns.includes(header.id)
  );
  const pinnedColumnCount = pinnedHeaders.length;
  const nonPinnedColumnCount = nonPinnedHeaders.length;

  // Column resizing state
  const [columnResizing, setColumnResizing] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);

  // Calculate total width of pinned columns for offset
  const pinnedColumnsWidth = pinnedHeaders.reduce((total, header) => {
    const resizedWidth = columnResizing[header.id];
    const width =
      resizedWidth ||
      header.getSize() ||
      TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;
    return total + width;
  }, 0);

  // Virtualizer only for non-pinned columns
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: nonPinnedColumnCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const header = nonPinnedHeaders[index];
      if (!header) return TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;

      // Use resized width if available, otherwise use original size
      const resizedWidth = columnResizing[header.id];
      return (
        resizedWidth ||
        header.getSize() ||
        TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH
      );
    },
    overscan: 3, // Reduced from 5 for better performance
  });

  const virtualColumns = columnVirtualizer.getVirtualItems();
  const totalWidth = columnVirtualizer.getTotalSize() + pinnedColumnsWidth;

  // Calculate virtual padding for smooth scrolling (adjusted for pinned columns)
  let virtualPaddingLeft = 0;
  let virtualPaddingRight = 0;

  if (columnVirtualizer && virtualColumns?.length) {
    virtualPaddingLeft = virtualColumns[0]?.start ?? 0;
    virtualPaddingRight =
      columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1]?.end ?? 0);
  }

  // Reusable table styles
  const tanStackTableStyles = useMemo(
    () => ({
      container: {
        // border: "1px solid #D0D5DD",
        // borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fff",
        width: "100%",
        minWidth: "100%",
      },
      table: {
        // Optimize table rendering
        willChange: "transform",
        transform: "translateZ(0)", // Force hardware acceleration
        width: "100%",
        tableLayout: "fixed", // Use fixed layout for better column distribution
        "& .MuiTableCell-root": {
          height: `${TANSTACK_TABLE_CONFIG.ROW_HEIGHT}px`,
          padding: TANSTACK_TABLE_CONFIG.COLUMN_PADDING,
          lineHeight: "1.2", // Added for tighter line spacing
          // Optimize cell rendering
          willChange: "transform",
          transform: "translateZ(0)",
        },
        "& .MuiTableHead-root .MuiTableCell-root": {
          height: `${TANSTACK_TABLE_CONFIG.HEADER_HEIGHT}px`,
          fontFamily: "Inter",
          fontSize: "13px", // Reduced from 14px
          fontWeight: "500",
          borderBottom: "1px solid #E0E0E0",
          position: "relative",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          // Optimize header rendering
          willChange: "transform",
          transform: "translateZ(0)",
          zIndex: 1, // Lower z-index for regular headers
        },
        // Styling for pinned columns
        "& .MuiTableHead-root .MuiTableCell-root[data-pinned='left']": {
          position: "sticky",
          left: "var(--pinned-left)",
          zIndex: 100,
          //backgroundColor: "#fff",
          borderRight: "2px solid #e0e0e0",
        },
        "& .MuiTableBody-root .MuiTableCell-root[data-pinned='left']": {
          position: "sticky",
          left: "var(--pinned-left)",
          zIndex: 5,
          borderRight: "2px solid #e0e0e0",
          // Ensure pinned cells have the same styling as regular cells
          fontFamily: "Inter",
          fontSize: "13px",
          color: "#101828",
          borderBottom: "1px solid #E0E0E0",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          // Use the same background as the row to maintain consistency
          backgroundColor: "inherit",
        },
        "& .MuiTableBody-root .MuiTableCell-root": {
          fontFamily: "Inter",
          fontSize: "13px", // Reduced from 14px
          color: "#101828",
          borderBottom: "1px solid #E0E0E0",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          // Optimize body cell rendering
          willChange: "transform",
          transform: "translateZ(0)",
        },
        // Ensure table takes full width when there are fewer columns
        "& .MuiTable-root": {
          width: "100%",
          minWidth: "100%",
        },
      },
      headerCell: (width, columnKey = "") => ({
        backgroundColor:
          isEditableColumn(columnKey) && editState
            ? SUCCESS[100]
            : columnKey.startsWith("Risk_")
            ? WARNING[100]
            : "#fff",
        color:
          isEditableColumn(columnKey) && editState
            ? SUCCESS[700]
            : columnKey.startsWith("Risk_")
            ? WARNING[700]
            : "#626F86",
        fontFamily: "Inter",
        fontSize: "13px", // Reduced from 14px
        fontWeight: "600",
        padding: "4px 6px", // Reduced from "8px"
        borderBottom: "1px solid #E0E0E0",
        width: width,
        minWidth: Math.max(width, TANSTACK_TABLE_CONFIG.MIN_COLUMN_WIDTH),
        maxWidth: TANSTACK_TABLE_CONFIG.MAX_COLUMN_WIDTH,
      }),
      bodyCell: (width, textAlign = "left") => ({
        fontFamily: "Inter",
        fontSize: "13px", // Reduced from 14px
        color: "#101828",
        padding: "2px 4px", // Reduced from "2px"
        borderBottom: "1px solid #E0E0E0",
        textAlign: textAlign,
        width: width,
        minWidth: Math.max(width, TANSTACK_TABLE_CONFIG.MIN_COLUMN_WIDTH),
        maxWidth: TANSTACK_TABLE_CONFIG.MAX_COLUMN_WIDTH,
      }),
      row: (rowIndex) => ({
        backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa", // Lighter alternating color
        "&:hover": {
          transition: "all 0.3s ease-in-out",
          borderBottom: "1px solid #D6BBFB",
        },
      }),
    }),
    [editState]
  );

  // Column resize handlers
  const handleColumnResizeStart = useCallback(
    (headerId, event) => {
      setResizingColumn(headerId);
      const startX = event.clientX;
      const startWidth =
        columnResizing[headerId] ||
        columnHeaders.find((h) => h.id === headerId)?.getSize() ||
        TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(
          TANSTACK_TABLE_CONFIG.MIN_COLUMN_WIDTH,
          Math.min(TANSTACK_TABLE_CONFIG.MAX_COLUMN_WIDTH, startWidth + deltaX)
        );

        setColumnResizing((prev) => ({
          ...prev,
          [headerId]: newWidth,
        }));

        // Force virtualizer to recalculate
        columnVirtualizer.measure();
      };

      const handleMouseUp = () => {
        setResizingColumn(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnResizing, columnHeaders, columnVirtualizer]
  );

  // Memoized row renderer for better performance
  const renderTableRow = useCallback(
    (row, rowIndex) => {
      return (
        <TableRow key={row.id} sx={tanStackTableStyles.row(rowIndex)}>
          {/* Always render pinned columns first */}
          {pinnedHeaders.map((header, pinnedIndex) => {
            const cell = row
              .getVisibleCells()
              .find((cell) => cell.column.id === header.id);
            if (!cell) return null;

            const resizedWidth = columnResizing[cell.column.id];
            const currentWidth = resizedWidth || cell.column.getSize();

            // Calculate pinned position
            const pinnedLeft = (() => {
              let position = 0;
              for (let i = 0; i < pinnedIndex; i++) {
                const prevHeader = pinnedHeaders[i];
                if (prevHeader) {
                  const prevWidth =
                    columnResizing[prevHeader.id] ||
                    prevHeader.getSize() ||
                    TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;
                  position += prevWidth;
                }
              }
              return position;
            })();

            return (
              <TableCell
                key={cell.id}
                data-pinned="left"
                sx={{
                  ...tanStackTableStyles.bodyCell(
                    currentWidth,
                    cell.column.columnDef.meta?.isNumeric ? "right" : "left"
                  ),
                  width: currentWidth,
                  minWidth: currentWidth,
                  maxWidth: currentWidth,
                  borderRight: "1px solid #e0e0e0",
                  "--pinned-left": `${pinnedLeft}px`,
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          })}

          {/* Virtual padding for non-pinned columns */}
          {virtualPaddingLeft > 0 && (
            <TableCell
              sx={{
                width: virtualPaddingLeft,
                minWidth: virtualPaddingLeft,
                maxWidth: virtualPaddingLeft,
                padding: 0,
                border: "none",
                backgroundColor: "transparent",
              }}
            />
          )}

          {/* Render virtualized non-pinned columns */}
          {virtualColumns.map((vc) => {
            const header = nonPinnedHeaders[vc.index];
            if (!header) return null;

            const cell = row
              .getVisibleCells()
              .find((cell) => cell.column.id === header.id);
            if (!cell) return null;

            const resizedWidth = columnResizing[cell.column.id];
            const currentWidth = resizedWidth || cell.column.getSize();

            return (
              <TableCell
                key={cell.id}
                sx={{
                  ...tanStackTableStyles.bodyCell(
                    currentWidth,
                    cell.column.columnDef.meta?.isNumeric ? "right" : "left"
                  ),
                  width: currentWidth,
                  minWidth: currentWidth,
                  maxWidth: currentWidth,
                  borderRight: "1px solid #e0e0e0",
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          })}

          {virtualPaddingRight > 0 && (
            <TableCell
              sx={{
                width: virtualPaddingRight,
                minWidth: virtualPaddingRight,
                maxWidth: virtualPaddingRight,
                padding: 0,
                border: "none",
                backgroundColor: "transparent",
              }}
            />
          )}
        </TableRow>
      );
    },
    [
      pinnedHeaders,
      virtualColumns,
      virtualPaddingLeft,
      virtualPaddingRight,
      tanStackTableStyles,
      nonPinnedHeaders,
      columnResizing,
    ]
  );

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

  const oc_fileName = oc_path
    ? `${experimentBasePath}/${oc_path}`.split(".csv")[0].split("/").join("_")
    : null;
  const oc_filePath = `${experimentBasePath}/${oc_path}`;

  // Function to handle pop operation safely
  const handlePop = () => {
    const newHistory = [...editHistory]; // Create a clone of the array
    const last_ele = newHistory.pop(); // Safely modify the cloned array
    setEditHistory(newHistory); // Update local state
    return last_ele;
  };
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
                height: "32px", // Fixed height to match non-editable
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
                fontSize: "13px",
                color: "#101828",
                lineHeight: "14px",
                textAlign: isTSID ? "left" : isNumericValue ? "right" : "left",
                textTransform: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: theme.transitions.create("width"),
                padding: "4px 4px", // Reduced padding to match non-editable
                height: "32px", // Fixed height to prevent expansion
                boxSizing: "border-box",
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
              minHeight: "32px", // Consistent height with non-editable cells
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
              padding: "4px 4px", // Reduced padding to match non-editable
              fontFamily: "Inter",
              fontSize: "13px",
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
            padding: isEditableRowDimension ? "4px 4px" : "4px 4px", // Consistent padding
            minHeight: "32px", // Consistent height
            display: "flex",
            alignItems: "center",
            fontFamily: "Inter",
            fontSize: "13px",
            color: isEditableRowDimension ? SUCCESS[700] : "#101828",
            justifyContent: isTSID
              ? "flex-start"
              : isNumericValue
              ? "flex-end"
              : "flex-start",
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

  const handleCommit = (
    newValue,
    rowIdx,
    colKey,
    rowDimension,
    rowDimensionValue
  ) => {
    console.log("Commit called");

    const prevValueFromTable = transformedData[rowIdx][colKey];
    const existingCell = editedCells.find(
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
        tanStackColumns.map((col) => col.accessorKey)
      );

      const numericColumns = tanStackColumns
        .filter((col) => {
          const isNumeric = transformedData.some(
            (row) =>
              !isNaN(row[col.accessorKey]) &&
              row[col.accessorKey] !== null &&
              row[col.accessorKey] !== ""
          );
          const isNotTsId = [
            "Demand Alignment View1 Report",
            "Demand Alignment Value View1 Report",
          ].includes(title)
            ? !configState?.scenario_plan?.demand_alignment_report?.ts_id_view1?.includes(
                col.accessorKey
              )
            : !configState.data.ts_id_columns.includes(col.accessorKey);
          return isNumeric && isNotTsId;
        })
        .map((col) => col.accessorKey);
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

  const undoAllChanges = async () => {
    await setEditedCells([]);
    await setEditHistory([]);
    await setNewRows(fileName, []);
  };
  // Add this ref to track if we need to calculate
  const pendingCalculationRef = useRef(false);
  function parseDatasetPath(datasetPath) {
    if (typeof datasetPath !== "string") return "";

    return datasetPath
      .split(".csv")[0] // remove .csv extension
      .split("/") // split by slash
      .join("_"); // join with underscore
  }
  const UploadIcon = () => {
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
      <>
        {enableFileUpload && editState && (
          <CustomTooltip placement="top" title="Upload edited data" arrow>
            <Button
              startIcon={<FileUploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              variant="outlined"
              size="small"
              sx={{
                color: "#374151",
                borderColor: "#d1d5db",
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Upload
            </Button>
          </CustomTooltip>
        )}

        {uploadDialogOpen && (
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
        )}
      </>
    );
  };

  // Add this function near the top of your component, after other utility functions
  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
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

  useEffect(() => {
    if (isEditable) {
      console.log("New Edited Cells", editedFiles[fileName]);
      setEditedCells([...(editedFiles[fileName] || [])]);
      setEditHistory([...(editHistories[fileName] || [])]);
    }
  }, [lastSyncedTime]);

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
    console.log("transformedData length:", transformedData?.length);
    if (transformedData && transformedData.length > 0) {
      console.log("transformedData sample:", transformedData.slice(0, 2));
    }
  }, [transformedData]);
  useEffect(() => {
    handleFilterOpen(true);
  }, []);

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

  // Add a new useEffect to handle the actual calculation
  // This breaks the circular dependency
  useEffect(() => {
    // Only run if columns are available AND we have a pending calculation

    if (tanStackColumns.length > 0 && pendingCalculationRef.current) {
      console.log(
        "Executing pending calculation with columns:",
        tanStackColumns.length
      );
      calculateAllSums(false);
      pendingCalculationRef.current = false;
    }
  }, [tanStackColumns, pendingCalculationRef.current]); // Remove pendingCalculationRef.current from dependency array

  // Add this effect to log column sums whenever they change
  useEffect(() => {
    console.log("Column sums changed:", columnSums);
  }, [columnSums]);

  return (
    <ErrorWrapper>
      <ThemeProvider theme={customTheme}>
        <ToastContainer />
        <CustomScrollbar>
          {transformedData.length > 0 ? (
            <ErrorWrapper>
              {/* TanStack Table with MUI Integration */}

              <Box sx={{ mt: 4, padding: "0px 24px" }}>
                {/* Title */}
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#101828",
                    textAlign: "left",
                    lineHeight: "28px",
                    marginBottom: "8px",
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

                {/* Excel-like Toolbar - Full Width */}
                <ToolbarContainer>
                  {/* Left Section - Display Modes */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    {/* Mode Toggle Group - OneNote/Figma Style */}
                    <ToolbarToggleGroup>
                      {valueFileTitle && (
                        <CustomTooltip
                          placement="bottom"
                          title={
                            showValueDescription
                              ? showValueDescription
                              : "Show data by values instead of units"
                          }
                          arrow
                        >
                          <ToggleStateIndicator
                            active={showValueFile}
                            variant="primary"
                            onClick={async () => {
                              // If already active, deactivate all
                              if (showValueFile) {
                                await setShowValueFile(false); // Set showValueFile to false
                                await setShowOriginal(false); // Set ML Forecast to false
                                await setEditState(true); // Set editState to false
                              } else {
                                // Toggle showValueFile and editState together (like original switch)
                                await setShowValueFile(true); // Set showValueFile to true
                                await setEditState(false); // Set editState to true
                                await setShowOriginal(false); // Set ML Forecast to false
                              }
                            }}
                          >
                            <ShowChartIcon />
                            {showValueLable ? showValueLable : "Values"}
                          </ToggleStateIndicator>
                        </CustomTooltip>
                      )}

                      {oc_path && (
                        <CustomTooltip
                          placement="bottom"
                          title="Display ML forecast data instead of actual data"
                          arrow
                        >
                          <ToggleStateIndicator
                            active={showOriginal}
                            variant="primary"
                            onClick={async () => {
                              // If already active, deactivate all
                              if (showOriginal) {
                                // await setShowValueFile(false);
                                await setShowOriginal(false);
                                await setEditState(true);
                              } else {
                                // Set this to true, set editState to false (like original switch)
                                await setShowValueFile(false);
                                await setShowOriginal(true);
                                await setEditState(false);
                              }
                            }}
                          >
                            <TimelineIcon />
                            ML Forecast
                          </ToggleStateIndicator>
                        </CustomTooltip>
                      )}

                      {isEditable && (
                        <CustomTooltip
                          placement="bottom"
                          title="Enable editing of table cells"
                          arrow
                        >
                          <ToggleStateIndicator
                            active={editState}
                            variant="primary"
                            onClick={async () => {
                              // If already active, deactivate all
                              if (editState) {
                                await setShowValueFile(false);
                                await setShowOriginal(false);
                                await setEditState(false);
                              } else {
                                // Set this to true and others to false
                                await setShowValueFile(false);
                                await setShowOriginal(false);
                                await setEditState(true);
                              }
                            }}
                          >
                            <EditIcon />
                            Edit
                          </ToggleStateIndicator>
                        </CustomTooltip>
                      )}
                    </ToolbarToggleGroup>
                  </Stack>

                  {/* Right Section - Actions */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* Auto Calculate Toggle */}
                    {enableAggregation && (
                      <CustomTooltip
                        placement="top"
                        title="Automatically calculate sums when data changes"
                        arrow
                      >
                        <ToggleStateIndicator
                          active={autoCalculateSums}
                          onClick={() =>
                            setAutoCalculateSums(!autoCalculateSums)
                          }
                        >
                          <AutoFixHighIcon />
                          Auto Sum
                        </ToggleStateIndicator>
                      </CustomTooltip>
                    )}

                    {/* Manual Calculate Button */}
                    {enableAggregation && !autoCalculateSums && (
                      <CustomTooltip
                        placement="top"
                        title="Manually calculate sums for all columns"
                        arrow
                      >
                        <Button
                          startIcon={<FunctionsIcon />}
                          onClick={() => calculateAllSums(false)}
                          disabled={isCalculatingAllSums}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#374151",
                            borderColor: "#d1d5db",
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 500,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#9ca3af",
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        >
                          {isCalculatingAllSums
                            ? "Calculating..."
                            : "Calculate"}
                        </Button>
                      </CustomTooltip>
                    )}

                    {/* Undo Button */}
                    {/* {editState && editHistory.length > 0 && (
                      <CustomTooltip
                        placement="top"
                        title="Undo last edit"
                        arrow
                      >
                        <Button
                          startIcon={<UndoRoundedIcon />}
                          onClick={handleUndo}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#374151",
                            borderColor: "#d1d5db",
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 500,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#9ca3af",
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        >
                          Undo
                        </Button>
                      </CustomTooltip>
                    )} */}

                    {/* Undo All Changes */}
                    {/* {editState &&
                      (newRows[fileName]?.length > 0 ||
                        deletedRows[fileName]?.length > 0 ||
                        editHistory.length > 0) && (
                        <CustomTooltip
                          placement="top"
                          title="Undo all changes"
                          arrow
                        >
                          <Button
                            startIcon={<UndoRoundedIcon />}
                            onClick={undoAllChanges}
                            variant="outlined"
                            size="small"
                            sx={{
                              color: "#374151",
                              borderColor: "#d1d5db",
                              fontFamily: "Inter",
                              fontSize: "12px",
                              fontWeight: 500,
                              textTransform: "none",
                            }}
                          >
                            Undo All
                          </Button>
                        </CustomTooltip>
                      )} */}

                    {/* Upload */}
                    <UploadIcon />

                    {/* Download */}
                    <CustomTooltip
                      placement="top"
                      title="Download current data as CSV file"
                      arrow
                    >
                      <Button
                        startIcon={
                          loading ? (
                            <KeyboardDoubleArrowDown
                              sx={{
                                animation: "arrowMove 1.5s linear infinite",
                                "@keyframes arrowMove": {
                                  "0%": { transform: "translateY(-50%)" },
                                  "100%": { transform: "translateY(50%)" },
                                },
                              }}
                            />
                          ) : (
                            <DownloadIcon />
                          )
                        }
                        onClick={
                          currentCompany.download_reports
                            ? showOriginal
                              ? handleOCDownload
                              : handleDownload
                            : () => setIsContactSalesDialogOpen(true)
                        }
                        variant="outlined"
                        size="small"
                        sx={{
                          color: "#374151",
                          borderColor: "#d1d5db",
                          fontFamily: "Inter",
                          fontSize: "12px",
                          fontWeight: 500,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#9ca3af",
                            backgroundColor: "#f9fafb",
                          },
                        }}
                      >
                        Download
                      </Button>
                    </CustomTooltip>
                    {/* Build Your Own Report */}
                    {isBYOREnabled && (
                      <CustomTooltip
                        placement="top"
                        title="Build custom reports and configurations"
                        arrow
                      >
                        <Button
                          startIcon={<BuildIcon />}
                          onClick={() => {
                            if (reportTitle && !groupAggregationOpen) {
                              loadBYORConfig(reportTitle);
                            }
                            setGroupAggregationOpen(!groupAggregationOpen);
                          }}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#374151",
                            borderColor: "#d1d5db",
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 500,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#9ca3af",
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        >
                          Build
                        </Button>
                      </CustomTooltip>
                    )}

                    {/* Code */}
                    {isBaseData && (
                      <CustomTooltip
                        placement="top"
                        title="Open code editor for advanced data manipulation"
                        arrow
                      >
                        <Button
                          startIcon={<CodeIcon />}
                          onClick={() => setEditorOpen(true)}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#374151",
                            borderColor: "#d1d5db",
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 500,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#9ca3af",
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        >
                          Code
                        </Button>
                      </CustomTooltip>
                    )}

                    {/* Filter */}
                    {isFilterable && (
                      <CustomTooltip
                        placement="top"
                        title="Filter and sort table data"
                        arrow
                      >
                        <Button
                          startIcon={<FilterIcon />}
                          onClick={() => {
                            if (reportTitle) {
                              loadBYORConfig(reportTitle);
                            }
                            handleFilterOpen(false);
                          }}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#374151",
                            borderColor: "#d1d5db",
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 500,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#9ca3af",
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        >
                          Filter
                        </Button>
                      </CustomTooltip>
                    )}

                    {/* Save Custom Report */}
                    {tablesFilterData[fileName]?.["Default"] !== undefined && (
                      <CustomTooltip
                        placement="top"
                        title="Save current report configuration"
                        arrow
                      >
                        <Button
                          startIcon={<SaveIcon />}
                          onClick={() => setSaveReportOpen(true)}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#374151",
                            borderColor: "#d1d5db",
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 500,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#9ca3af",
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        >
                          Save
                        </Button>
                      </CustomTooltip>
                    )}
                  </Stack>
                </ToolbarContainer>
                {transformedData && transformedData.length > 0 && (
                  <>
                    {/* TanStack Table Setup with Column Virtualization */}
                    {(() => {
                      // Check if we're loading a new batch
                      const isTanStackLoading =
                        table.getRowModel().rows.length === 0 && loading;

                      return (
                        <Box sx={tanStackTableStyles.container}>
                          <TableContainer
                            ref={parentRef}
                            sx={{
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                              width: "100%",
                              minWidth: "100%",
                              position: "relative", // Needed for proper virtualization
                              //height: "600px", // Fixed height for better performance
                              "&::-webkit-scrollbar": {
                                height: "8px",
                              },
                              "&::-webkit-scrollbar-track": {
                                backgroundColor: "#f1f1f1",
                                borderRadius: "4px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#c1c1c1",
                                borderRadius: "4px",
                                "&:hover": {
                                  backgroundColor: "#a8a8a8",
                                },
                              },
                              // Optimize scroll performance
                              scrollBehavior: "smooth",
                              willChange: "scroll-position",
                            }}
                          >
                            <Table
                              sx={{
                                ...tanStackTableStyles.table,
                                width: "100%",
                                minWidth: "100%",
                                tableLayout: "fixed",
                              }}
                              stickyHeader
                              size="small"
                            >
                              <TableHead>
                                <TableRow>
                                  {/* Always render pinned columns first */}
                                  {pinnedHeaders.map((header, pinnedIndex) => {
                                    const resizedWidth =
                                      columnResizing[header.id];
                                    const currentWidth =
                                      resizedWidth || header.getSize();
                                    const isResizing =
                                      resizingColumn === header.id;

                                    // Calculate pinned position
                                    const pinnedLeft = (() => {
                                      let position = 0;
                                      for (let i = 0; i < pinnedIndex; i++) {
                                        const prevHeader = pinnedHeaders[i];
                                        if (prevHeader) {
                                          const prevWidth =
                                            columnResizing[prevHeader.id] ||
                                            prevHeader.getSize() ||
                                            TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;
                                          position += prevWidth;
                                        }
                                      }
                                      return position;
                                    })();

                                    return (
                                      <TableCell
                                        key={header.id}
                                        data-pinned="left"
                                        sx={{
                                          ...tanStackTableStyles.headerCell(
                                            currentWidth,
                                            header.id
                                          ),
                                          width: currentWidth,
                                          minWidth: currentWidth,
                                          maxWidth: currentWidth,
                                          position: "relative",
                                          userSelect: "none",
                                          borderRight: "1px solid #e0e0e0",
                                          "--pinned-left": `${pinnedLeft}px`,

                                          ...(isResizing && {
                                            backgroundColor:
                                              isEditableColumn(header.id) &&
                                              editState
                                                ? SUCCESS[100]
                                                : header.id.startsWith("Risk_")
                                                ? WARNING[100]
                                                : "#f8f9fa",
                                            borderRight: "2px solid #1976d2",
                                            boxShadow:
                                              "2px 0 4px rgba(25, 118, 210, 0.2)",
                                          }),
                                        }}
                                      >
                                        {header.isPlaceholder
                                          ? null
                                          : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                            )}

                                        {/* Resize handle */}
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            right: "-2px",
                                            top: 0,
                                            bottom: 0,
                                            width: "4px",
                                            cursor: "col-resize",
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                              backgroundColor:
                                                "rgba(25, 118, 210, 0.1)",
                                            },
                                            "&::before": {
                                              content: '""',
                                              position: "absolute",
                                              left: "50%",
                                              top: "50%",
                                              transform:
                                                "translate(-50%, -50%)",
                                              width: "1px",
                                              height: "20px",
                                              backgroundColor: isResizing
                                                ? "#e0e0e0"
                                                : "#e0e0e0",
                                              borderRadius: "0.5px",
                                            },
                                            "&::after": {
                                              content: '""',
                                              position: "absolute",
                                              left: "50%",
                                              top: "50%",
                                              transform:
                                                "translate(-50%, -50%)",
                                              width: "3px",
                                              height: "20px",
                                              backgroundColor: isResizing
                                                ? "transparent"
                                                : "transparent",
                                              borderRadius: "1.5px",
                                            },
                                          }}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleColumnResizeStart(
                                              header.id,
                                              e
                                            );
                                          }}
                                        />
                                      </TableCell>
                                    );
                                  })}

                                  {/* Virtual padding for non-pinned columns */}
                                  {virtualPaddingLeft > 0 && (
                                    <TableCell
                                      sx={{
                                        width: virtualPaddingLeft,
                                        minWidth: virtualPaddingLeft,
                                        maxWidth: virtualPaddingLeft,
                                        padding: 0,
                                        border: "none",
                                        backgroundColor: "transparent",
                                      }}
                                    />
                                  )}

                                  {/* Render virtualized non-pinned columns */}
                                  {virtualColumns.map((vc) => {
                                    const header = nonPinnedHeaders[vc.index];
                                    if (!header) return null;

                                    const resizedWidth =
                                      columnResizing[header.id];
                                    const currentWidth =
                                      resizedWidth || header.getSize();
                                    const isResizing =
                                      resizingColumn === header.id;

                                    return (
                                      <TableCell
                                        key={header.id}
                                        sx={{
                                          ...tanStackTableStyles.headerCell(
                                            currentWidth,
                                            header.id
                                          ),
                                          width: currentWidth,
                                          minWidth: currentWidth,
                                          maxWidth: currentWidth,
                                          position: "relative",
                                          userSelect: "none",
                                          borderRight: "1px solid #e0e0e0",

                                          ...(isResizing && {
                                            backgroundColor:
                                              isEditableColumn(header.id) &&
                                              editState
                                                ? SUCCESS[100]
                                                : header.id.startsWith("Risk_")
                                                ? WARNING[100]
                                                : "#f8f9fa",
                                            borderRight: "2px solid #1976d2",
                                            boxShadow:
                                              "2px 0 4px rgba(25, 118, 210, 0.2)",
                                          }),
                                        }}
                                      >
                                        {header.isPlaceholder
                                          ? null
                                          : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                            )}

                                        {/* Resize handle */}
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            right: "-2px",
                                            top: 0,
                                            bottom: 0,
                                            width: "4px",
                                            cursor: "col-resize",
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                              backgroundColor:
                                                "rgba(25, 118, 210, 0.1)",
                                            },
                                            "&::before": {
                                              content: '""',
                                              position: "absolute",
                                              left: "50%",
                                              top: "50%",
                                              transform:
                                                "translate(-50%, -50%)",
                                              width: "1px",
                                              height: "20px",
                                              backgroundColor: isResizing
                                                ? "#e0e0e0"
                                                : "#e0e0e0",
                                              borderRadius: "0.5px",
                                            },
                                            "&::after": {
                                              content: '""',
                                              position: "absolute",
                                              left: "50%",
                                              top: "50%",
                                              transform:
                                                "translate(-50%, -50%)",
                                              width: "3px",
                                              height: "20px",
                                              backgroundColor: isResizing
                                                ? "transparent"
                                                : "transparent",
                                              borderRadius: "1.5px",
                                            },
                                          }}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleColumnResizeStart(
                                              header.id,
                                              e
                                            );
                                          }}
                                        />
                                      </TableCell>
                                    );
                                  })}

                                  {virtualPaddingRight > 0 && (
                                    <TableCell
                                      sx={{
                                        width: virtualPaddingRight,
                                        minWidth: virtualPaddingRight,
                                        maxWidth: virtualPaddingRight,
                                        padding: 0,
                                        border: "none",
                                        backgroundColor: "transparent",
                                      }}
                                    />
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {isTanStackLoading
                                  ? // Show loading state with skeleton rows
                                    Array.from(
                                      { length: 10 },
                                      (_, rowIndex) => (
                                        <TableRow
                                          key={`loading-${rowIndex}`}
                                          sx={tanStackTableStyles.row(rowIndex)}
                                        >
                                          {/* Always render pinned columns first */}
                                          {pinnedHeaders.map(
                                            (header, pinnedIndex) => {
                                              const resizedWidth =
                                                columnResizing[header.id];
                                              const currentWidth =
                                                resizedWidth ||
                                                header.getSize() ||
                                                TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;

                                              // Calculate pinned position
                                              const pinnedLeft = (() => {
                                                let position = 0;
                                                for (
                                                  let i = 0;
                                                  i < pinnedIndex;
                                                  i++
                                                ) {
                                                  const prevHeader =
                                                    pinnedHeaders[i];
                                                  if (prevHeader) {
                                                    const prevWidth =
                                                      columnResizing[
                                                        prevHeader.id
                                                      ] ||
                                                      prevHeader.getSize() ||
                                                      TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;
                                                    position += prevWidth;
                                                  }
                                                }
                                                return position;
                                              })();

                                              return (
                                                <TableCell
                                                  key={`loading-pinned-cell-${header.id}-${rowIndex}`}
                                                  data-pinned="left"
                                                  sx={{
                                                    ...tanStackTableStyles.bodyCell(
                                                      currentWidth,
                                                      header.column.columnDef
                                                        .meta?.isNumeric
                                                        ? "right"
                                                        : "left"
                                                    ),
                                                    width: currentWidth,
                                                    minWidth: currentWidth,
                                                    maxWidth: currentWidth,
                                                    borderRight:
                                                      "1px solid #e0e0e0",
                                                    backgroundColor: "#f5f5f5",
                                                    "--pinned-left": `${pinnedLeft}px`,
                                                    animation:
                                                      "pulse 1.5s ease-in-out infinite",
                                                    "@keyframes pulse": {
                                                      "0%": { opacity: 0.6 },
                                                      "50%": { opacity: 1 },
                                                      "100%": { opacity: 0.6 },
                                                    },
                                                  }}
                                                >
                                                  <Box
                                                    sx={{
                                                      height: "16px",
                                                      backgroundColor:
                                                        "#e0e0e0",
                                                      borderRadius: "4px",
                                                      width: `${Math.min(
                                                        80,
                                                        Math.max(
                                                          30,
                                                          ((currentWidth - 20) /
                                                            currentWidth) *
                                                            100
                                                        )
                                                      )}%`,
                                                    }}
                                                  />
                                                </TableCell>
                                              );
                                            }
                                          )}

                                          {/* Virtual padding for non-pinned columns */}
                                          {virtualPaddingLeft > 0 && (
                                            <TableCell
                                              sx={{
                                                width: virtualPaddingLeft,
                                                minWidth: virtualPaddingLeft,
                                                maxWidth: virtualPaddingLeft,
                                                padding: 0,
                                                border: "none",
                                                backgroundColor: "transparent",
                                              }}
                                            />
                                          )}

                                          {/* Render virtualized non-pinned columns */}
                                          {virtualColumns.map((vc) => {
                                            const header =
                                              nonPinnedHeaders[vc.index];
                                            if (!header) return null;

                                            const resizedWidth =
                                              columnResizing[header.id];
                                            const currentWidth =
                                              resizedWidth ||
                                              header.getSize() ||
                                              TANSTACK_TABLE_CONFIG.DEFAULT_COLUMN_WIDTH;

                                            return (
                                              <TableCell
                                                key={`loading-virtual-cell-${header.id}-${rowIndex}`}
                                                sx={{
                                                  ...tanStackTableStyles.bodyCell(
                                                    currentWidth,
                                                    header.column.columnDef.meta
                                                      ?.isNumeric
                                                      ? "right"
                                                      : "left"
                                                  ),
                                                  width: currentWidth,
                                                  minWidth: currentWidth,
                                                  maxWidth: currentWidth,
                                                  borderRight:
                                                    "1px solid #e0e0e0",
                                                  backgroundColor: "#f5f5f5",
                                                  animation:
                                                    "pulse 1.5s ease-in-out infinite",
                                                  "@keyframes pulse": {
                                                    "0%": { opacity: 0.6 },
                                                    "50%": { opacity: 1 },
                                                    "100%": { opacity: 0.6 },
                                                  },
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    height: "16px",
                                                    backgroundColor: "#e0e0e0",
                                                    borderRadius: "4px",
                                                    width: `${Math.min(
                                                      80,
                                                      Math.max(
                                                        30,
                                                        ((currentWidth - 20) /
                                                          currentWidth) *
                                                          100
                                                      )
                                                    )}%`,
                                                  }}
                                                />
                                              </TableCell>
                                            );
                                          })}

                                          {virtualPaddingRight > 0 && (
                                            <TableCell
                                              sx={{
                                                width: virtualPaddingRight,
                                                minWidth: virtualPaddingRight,
                                                maxWidth: virtualPaddingRight,
                                                padding: 0,
                                                border: "none",
                                                backgroundColor: "transparent",
                                              }}
                                            />
                                          )}
                                        </TableRow>
                                      )
                                    )
                                  : table
                                      .getRowModel()
                                      .rows.map((row, rowIndex) =>
                                        renderTableRow(row, rowIndex)
                                      )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      );
                    })()}

                    {/* Custom Pagination for TanStack Table */}
                    <Box
                      sx={{
                        padding: "16px 0px",
                        justifyContent: "flex-end",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CustomPagination
                        count={Math.ceil(transformedData.length / 10)}
                        page={currentPage}
                        batch={currentBatch}
                        onPageChange={(event, newPage) => {
                          console.log("New page", newPage);
                          setCurrentPage(newPage);
                        }}
                      />
                    </Box>
                  </>
                )}
              </Box>

              {/* <ErrorWrapper>
                {/* New Rows Table */}
                {/* <NewDeletedRowsTable
                  data={newRows}
                  title="New Rows Added"
                  type="new"
                  fileName={fileName}
                /> */}
              {/* </ErrorWrapper>  */}

              {/* Deleted Rows Table */}
              {/* <ErrorWrapper>
                <NewDeletedRowsTable
                  data={deletedRows}
                  title="Deleted Rows"
                  type="deleted"
                  fileName={fileName}
                />
              </ErrorWrapper> */}
            </ErrorWrapper>
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
