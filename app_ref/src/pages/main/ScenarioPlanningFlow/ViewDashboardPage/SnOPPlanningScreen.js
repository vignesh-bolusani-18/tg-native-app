import React, { useCallback, useContext, useState } from "react";
import useDashboard from "../../../../hooks/useDashboard";
import useAuth from "../../../../hooks/useAuth";
import { reportGroups } from "../../../../utils/Other Reports/reportGroups";
import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchParquetData,
  getAggregatedValue,
} from "../../../../utils/s3Utils";
import { useEffect } from "react";
import CustomTable from "../../../../components/TanStackCustomTable";
import LoadingScreen from "../../../../components/LoadingScreen";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";
import {
  TrendingUp,
  CompareArrows,
  ShowChart,
  CalendarToday,
  DateRange,
  EventNote,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
  Tab,
  Button,
  CircularProgress,
  Card,
} from "@mui/material";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../../../components/CustomButton";
import useExperiment from "../../../../hooks/useExperiment";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { ThemeContext } from "../../../../theme/config/ThemeContext";
import useConfig from "../../../../hooks/useConfig";
import { format, parseISO } from "date-fns";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Collapse, Tooltip, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { callQueryEngineQuery } from "../../../../utils/queryEngine";
import ForecastChart from "../../../../components/ForecastChart";
import store from "../../../../redux/store";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import CustomTooltip from "../../../../components/CustomToolTip";
import html2canvas from 'html2canvas';
import { uploadImageToS3 } from "../../../../utils/s3Utils";
import { useRef } from 'react';


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
const TableSkeleton = () => (
  <Stack spacing={2} sx={{ padding: "24px 32px" }}>
    {/* Skeleton for the table title */}
    <Skeleton variant="text" width={"30%"} height={"40px"} />

    {/* Simulating the table with 5x5 grid */}
    <Stack spacing={1}>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={1}>
          {Array.from({ length: 5 }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width={"100%"}
              height={"50px"}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  </Stack>
);

// Component to render no data message
const NoDataMessage = () => (
  <Stack
    sx={{
      width: "100%",
      padding: "16px",
      height: "100%",
    }}
    justifyContent={"center"}
  >
    <Typography
      sx={{
        color: "#667085",
        fontFamily: "Inter",
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: "20px",
        textAlign: "center",
      }}
    >
      No data available
    </Typography>
  </Stack>
);

const SalesMetricsStrip = ({
  totalForecast,
  yoyGrowth,
  currentGrowth,
  sales30Days,
  sales60Days,
  sales90Days,
  viewMode,
}) => {
  const formatNumber = (value) => {
    if (value == null || isNaN(value)) return "0";

    const num = Math.abs(Number(value));
    if (num >= 1000000000) {
      return (Number(value) / 1000000000).toFixed(1) + "B";
    }
    if (num >= 1000000) {
      return (Number(value) / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (Number(value) / 1000).toFixed(1) + "K";
    }
    return Number(value).toLocaleString();
  };

  const renderValue = (value, isGrowth = false, isCurrency = false) => {
    if (value === null || value === undefined) return "-";

    if (isCurrency) {
      return `$${formatNumber(value)}`;
    }

    if (isGrowth) {
      const num = parseFloat(value).toFixed(1);
      return `${num >= 0 ? "+" : ""}${num}%`;
    }

    return formatNumber(value);
  };

  const valueColor = (value, isGrowth = false) => {
    if (value === null || value === undefined) return "text.primary";
    if (!isGrowth) return "text.primary";
    return parseFloat(value) >= 0 ? "success.main" : "error.main";
  };

  const metrics = [
    {
      label: "Total Forecast",
      value: totalForecast,
      icon: TrendingUp,
      isGrowth: false,
      isCurrency: viewMode === "revenue", // 👈 Add this
    },
    {
      label: "YoY Growth",
      value: yoyGrowth,
      icon: CompareArrows,
      isGrowth: true,
      isCurrency: false,
    },
    {
      label: "30Days Sales",
      value: sales30Days,
      icon: CalendarToday,
      isGrowth: false,
      isCurrency: viewMode === "revenue", // 👈 Add this
    },
    {
      label: "90Days Sales",
      value: sales90Days,
      icon: EventNote,
      isGrowth: false,
      isCurrency: viewMode === "revenue", // 👈 Add this
    },
  ];
  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "grey.300",
        minHeight: 38,
        overflow: "hidden",
      }}
    >
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <React.Fragment key={index}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                py: 0.6,
                px: 1.5,
              }}
            >
              <IconComponent
                sx={{
                  fontSize: 17,
                  color: "text.primary",
                  opacity: 0.8,
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "text.secondary" }}
              >
                {metric.label}:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: valueColor(metric.value, metric.isGrowth),
                }}
              >
                {renderValue(metric.value, metric.isGrowth, metric.isCurrency)}
              </Typography>
            </Box>

            {index < metrics.length - 1 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "grey.400", opacity: 0.8 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Card>
  );
};

const ViewModeToggle = ({ viewMode, setViewMode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        border: "1px solid #D0D5DD",
        borderRadius: "8px",
        padding: "6px", // Increased padding for more height
        width: "fit-content",
        height: "38px", // Match the SalesMetricsStrip height
        boxSizing: "border-box",
      }}
    >
      <Button
        onClick={() => setViewMode("units")}
        sx={{
          backgroundColor: viewMode === "units" ? "#0C66E4" : "transparent",
          color: viewMode === "units" ? "white" : "#475467",
          fontFamily: "Inter",
          fontSize: "14px", // Restored original font size
          fontWeight: 500,
          textTransform: "none",
          borderRadius: "6px",
          px: 2, // Restored original padding
          py: 1, // Increased vertical padding for height
          minWidth: "auto",
          height: "32px", // Fixed height for buttons
          "&:hover": {
            backgroundColor: viewMode === "units" ? "#0C66E4" : "#F3F4F6",
          },
          transition: "all 0.2s ease",
        }}
      >
        Units
      </Button>
      <Button
        onClick={() => setViewMode("revenue")}
        sx={{
          backgroundColor: viewMode === "revenue" ? "#0C66E4" : "transparent",
          color: viewMode === "revenue" ? "white" : "#475467",
          fontFamily: "Inter",
          fontSize: "14px", // Restored original font size
          fontWeight: 500,
          textTransform: "none",
          borderRadius: "6px",
          px: 2, // Restored original padding
          py: 1, // Increased vertical padding for height
          minWidth: "auto",
          height: "32px", // Fixed height for buttons
          "&:hover": {
            backgroundColor: viewMode === "revenue" ? "#0C66E4" : "#F3F4F6",
          },
          transition: "all 0.2s ease",
        }}
      >
        Revenue
      </Button>
    </Box>
  );
};

const SnOPPlanningScreen = () => {
  const {
    experimentBasePath,
    reports,
    InvPriceFilterData,
    setFilterOptions,
    setFilterOpen,
    filterOptions,
    filterData,
    applyFilter,
    SnOPDimensionsToFilter,
    SnOPDimensionsToFilterView1,
    setSnOPDimensionsToFilter,
    setSnOPDimensionsToFilterView1,
    updateFilterDataDimension,
    tablesFilterData,
    clearFilters,
    RiskColumn,
    setRiskColumn,
    setFilterData,
  } = useDashboard();
  const {
    configState,
    addEnrichmentMultiFilter,
    removeEnrichmentMultiFilter,
    enrichment_bydate_multi_filter,
    setTabFilterColumns,
    snopFilterColumns,
  } = useConfig();
  const { userInfo, currentCompany } = useAuth();
  const [newData, setNewData] = useState(null);
  const [tableViewMode, setTableViewMode] = useState("grid");
  const [view1Data, setView1Data] = useState(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [tabValue, setTabValue] = useState("0");
  const [autoCompleteKey, setAutoCompleteKey] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState([]);
  const [isUpdatedData, setIsUpdatedData] = useState(false);
  const [dataColumn, setDataColumn] = useState([]);
  const [salesAndForecastColumnsDefault, setSalesAndForecastColumnsDefault] =
    useState([]);

  const [salesAndForecastColumnsView1, setSalesAndForecastColumnsView1] =
    useState([]);
  const [showDimensionSettings, setShowDimensionSettings] = useState(false);
  const [showDimensionSettingsView1, setShowDimensionSettingsView1] =
    useState(false);
  const [parallelApiResultsView0, setParallelApiResultsView0] = useState({});
  const [parallelApiResultsView1, setParallelApiResultsView1] = useState({});
  const [isLoadingParallelApi, setIsLoadingParallelApi] = useState(false);
  const [tabSwitched, setTabSwitched] = useState("0");
  const [defaultViewGraphData, setDefaultViewGraphData] = useState({});
  const [view1ViewGraphData, setView1ViewGraphData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [enrichmentValue, setEnrichmentValue] = useState(0);
  const [enrichmentType, setEnrichmentType] = useState("uplift");
  const [maxRange, setMaxRange] = useState(1000); // Adjust as needed
  const [minRange, setMinRange] = useState(-1000);
  const [isMetricData, setIsMetricData] = useState(false);
  const [salesMetrics, setSalesMetrics] = useState({
    totalForecast: null,
    yoyGrowth: null,
    currentGrowth: null,
    sales30Days: null,
    sales60Days: null,
    sales90Days: null,
  });
  const [viewMode, setViewMode] = useState("units");
  const [viewModeView1, setViewModeView1] = useState("units");
  const [isPlannerData, setIsPlannerData] = useState(false);
    const chartRef = useRef(null);
  

  const frequency = configState.data.frequency;

  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };
  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }

    return dimension;
  };

  const path = `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report.csv`;
  const valuePath = `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value.csv`;
  const view1Path = `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_view1.csv`;
  const view1ValuePath = `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value_view1.csv`;
  const updatedPath = `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_backup.csv`;
  const updatedPathView1 = `${experimentBasePath}/scenario_planning/K_best/forecast/dar_aggregated_backup.csv`;
  const revenuePathView1 = `${experimentBasePath}/scenario_planning/K_best/forecast/dar_val_aggregated_backup.csv`;
  const revenuePath = `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_value_backup.csv`;
  const plannerViewPath = `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_wide.csv`;
  const plannerViewValuePath = `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_value_wide.csv`;
  const fileName =
    tabValue === "0"
      ? path.split(".csv")[0].split("/").join("_")
      : view1Path.split(".csv")[0].split("/").join("_");

  const valueFileName =
    tabValue === "0"
      ? valuePath.split(".csv")[0].split("/").join("_")
      : view1ValuePath.split(".csv")[0].split("/").join("_");

  const view1FileName = view1Path.split(".csv")[0].split("/").join("_");
  const fileNameDefault = path.split(".csv")[0].split("/").join("_");
  const plannerViewFileName = plannerViewPath
    .split(".csv")[0]
    .split("/")
    .join("_");
  const plannerViewValueFileName = plannerViewValuePath
    .split(".csv")[0]
    .split("/")
    .join("_");

  const { experiment_config } = useExperiment();

  const [Try, setTry] = useState(0);

  const { theme } = useContext(ThemeContext);

  const dimensions =
    configState?.scenario_plan?.demand_alignment_report
      ?.dimensions_for_accuracy || [];
  const calculateDimension =
    configState.scenario_plan?.demand_alignment_report
      ?.calc_dimensions_accuracy || false;
  const tsIdColumns = configState?.data?.ts_id_columns || [];

  const tsIdView1 =
    configState?.scenario_plan?.demand_alignment_report?.ts_id_view1 || [];

  const dimensionsView1 = dimensions.filter((col) => {
    // if column is a ts_id column AND not allowed in view1 → remove it
    if (tsIdColumns.includes(col) && !tsIdView1.includes(col)) {
      return false;
    }

    // otherwise keep it
    return true;
  });

  // Create the multiDownloadFiles object for dimension accuracy reports
  const dimensionAccuracyReports =
    dimensions.length > 0 && calculateDimension
      ? dimensions.reduce((acc, dimension) => {
          acc[
            `${dimension} Accuracy Report`
          ] = `${experimentBasePath}/scenario_planning/K_best/Dimension_Accuracy/${dimension}_accuracy.csv`;
          return acc;
        }, {})
      : {};

  console.log(dimensionsView1, tsIdColumns, tsIdView1);

  const dimensionAccuracyReportsView1 =
    dimensionsView1.length > 0 && calculateDimension
      ? dimensionsView1.reduce((acc, dimension) => {
          acc[
            `${dimension} Accuracy Report`
          ] = `${experimentBasePath}/scenario_planning/K_best/Dimension_Accuracy/view1/${dimension}_accuracy_view1.csv`;
          return acc;
        }, {})
      : {};

  console.log(dimensionAccuracyReportsView1);

  const multiDownloadFiles = {
    ...dimensionAccuracyReports,
    Forecast: `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`,
    "Forecast Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    "Prediction Interval": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_prediction_interval.csv`,
    "Disaggregated Forecast": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
    "Forecast Distribution": `${experimentBasePath}/experimentBasePath/scenario_planning/K_best/forecast/forecast_distribution.csv`,
    "Forecast Value Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_value_pivot.csv`,
    "Planner View": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_wide.csv`,
    "Final DA Data": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_backup.csv`,
    // Spread the dimension accuracy reports here
  };
  // const filtersApplied = useMemo(() => {
  //   const dimensionFilters = tablesFilterData[fileName]?.["Default"]?.filterData?.dimensionFilters || {};
  //   return [...new Set(Object.values(dimensionFilters).flat())].filter(Boolean);
  // }, [tablesFilterData, fileName]);

  const calculateSalesMetrics = (queryResults, frequency = "M") => {
    console.log("Raw query results:", queryResults);

    if (!queryResults || Object.keys(queryResults).length === 0) {
      return {
        totalForecast: 0,
        yoyGrowth: 0,
        currentGrowth: 0,
        sales30Days: 0,
        sales60Days: 0,
        sales90Days: 0,
      };
    }


    // Add this function inside your SnOPPlanningScreen component, after your state declarations and before the return statement.



    // Helper function to get data points based on frequency for different time periods
    const getDataPointsForPeriod = (days, freq) => {
      switch (freq?.toUpperCase()) {
        case "M": // Monthly
          return Math.ceil(days / 30);
        case "W": // Weekly
          return Math.ceil(days / 7);
        case "D": // Daily
          return days;
        default:
          return Math.ceil(days / 30);
      }
    };

    // Transform query results into structured format similar to your component
    const dataMap = new Map();

    // Process sum data
    Object.entries(queryResults).forEach(([key, valueArray]) => {
      if (!key.startsWith("sum_")) return;

      const cleanKey = key.replace(/^sum_/, "");
      const parts = cleanKey.split(" ");
      const date = parts[0];
      const type = parts.slice(1).join(" ") || "Forecast";

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const entry = dataMap.get(date);
      const value =
        Array.isArray(valueArray) && valueArray.length > 0
          ? parseFloat(valueArray[0]) || 0
          : parseFloat(valueArray) || 0;

      entry[type] = value > 0 ? value : 0;
    });

    // Convert to sorted array
    const transformedData = Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    console.log("Transformed data:", transformedData);

    // Helper function to get sales value (prefer Sales over Raw Actual over Actual)
    const getSalesValue = (item) =>
      item.Sales || item["Raw Actual"] || item.Actual || 0;

    // Find data with actual sales and forecasts
    const salesData = transformedData.filter(
      (d) =>
        (d.Sales && d.Sales > 0) ||
        (d["Raw Actual"] && d["Raw Actual"] > 0) ||
        (d.Actual && d.Actual > 0)
    );

    const forecastData = transformedData.filter(
      (d) => d.Forecast && d.Forecast > 0
    );
    const lyData = transformedData.filter(
      (d) => d["LY Sales"] && d["LY Sales"] > 0
    );

    console.log("Sales data:", salesData);
    console.log("Forecast data:", forecastData);
    console.log("LY data:", lyData);

    // Calculate total forecast
    const totalForecast = forecastData.reduce(
      (sum, item) => sum + (item.Forecast || 0),
      0
    );

    // Calculate data points needed for each period based on frequency
    const dataPoints30Days = getDataPointsForPeriod(30, frequency);
    const dataPoints60Days = getDataPointsForPeriod(60, frequency);
    const dataPoints90Days = getDataPointsForPeriod(90, frequency);

    // Calculate historical sales for different periods
    const sales30DaysData = salesData.slice(-dataPoints30Days);
    const sales60DaysData = salesData.slice(-dataPoints60Days);
    const sales90DaysData = salesData.slice(-dataPoints90Days);

    const sales30Days = sales30DaysData.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );
    const sales60Days = sales60DaysData.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );
    const sales90Days = sales90DaysData.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );

    // Calculate YoY growth (forecast vs LY Sales for same periods)
    let yoyGrowth = 0;
    if (forecastData.length > 0 && lyData.length > 0) {
      const totalLYSales = lyData.reduce(
        (sum, item) => sum + (item["LY Sales"] || 0),
        0
      );
      if (totalLYSales > 0) {
        yoyGrowth = ((totalForecast - totalLYSales) / totalLYSales) * 100;
      }
    }

    // Calculate current growth (forecast vs recent sales)
    let currentGrowth = 0;
    if (forecastData.length > 0 && salesData.length > 0) {
      const forecastPeriodLength = forecastData.length;
      const recentSalesData = salesData.slice(-forecastPeriodLength);
      const recentSalesTotal = recentSalesData.reduce(
        (sum, item) => sum + getSalesValue(item),
        0
      );

      if (recentSalesTotal > 0) {
        currentGrowth =
          ((totalForecast - recentSalesTotal) / recentSalesTotal) * 100;
      }
    }

    const results = {
      totalForecast: Math.round(totalForecast),
      yoyGrowth: parseFloat(yoyGrowth.toFixed(2)),
      currentGrowth: parseFloat(currentGrowth.toFixed(2)),
      sales30Days: Math.round(sales30Days),
      sales60Days: Math.round(sales60Days),
      sales90Days: Math.round(sales90Days),
    };

    console.log("Calculated metrics:", results);
    return results;
  };
//   const captureChartScreenshot = async () => {
//   if (!chartRef.current) {
//     console.warn("Chart reference not found.");
//     return;
//   }

//   try {
//     // 1️⃣ Capture chart
//     const canvas = await html2canvas(chartRef.current, {
//       allowTaint: true,
//       useCORS: true,
//       backgroundColor: "#ffffff",
//     });

//     // 2️⃣ Convert canvas → Blob
//     const blob = await new Promise((resolve) =>
//       canvas.toBlob(resolve, "image/png", 1.0)
//     );

//     if (!blob) {
//       throw new Error("Failed to generate image blob");
//     }

//     // 3️⃣ Build S3 path
//     const fileName = `chart-screenshot-${Date.now()}.png`;
//     const s3Path = `accounts/${companyPrefix}/meeting_notes/assets/images/${fileName}`;

//     // 4️⃣ 🔥 Use your existing uploader
//     await uploadImageToS3(s3Path, blob);

//     console.log("Chart screenshot uploaded to S3:", s3Path);
//   } catch (error) {
//     console.error("Error capturing/uploading chart screenshot:", error);
//   }
// };

  const handleChange = async (event, newValue) => {
    setTabValue(newValue);
    if (filterData) {
      console.log(`Tab changed to ${newValue}, forcing filter refresh`);
      await executeParallelApiCalls(newValue);
    }
    console.log("newValue", newValue);
    if (newValue === "0" && newData) {
      setTabSwitched("0");
      const riskColumns = Object.keys(newData).filter((col) =>
        col.startsWith("Risk_")
      );
      const defaultRiskColumn = riskColumns[riskColumns.length - 1];
      setRiskColumn(defaultRiskColumn);
      const filterOptions = {
        dimensions: {
          ...InvPriceFilterData,
          ...riskColumns.reduce((acc, col) => {
            acc[col] = ["all", "High", "Medium", "Low"];
            return acc;
          }, {}),
        },
        columns: Object.keys(newData),
      };
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
      setFilterOptions(filterOptions, `${fileNameDefault}`, "Default", true);
      // setFilterOpen(false);
    } else if (newValue === "1" && view1Data) {
      setTabSwitched("1");
      const riskColumns = Object.keys(view1Data).filter((col) =>
        col.startsWith("Risk_")
      );
      const defaultRiskColumn = riskColumns[riskColumns.length - 1];
      setRiskColumn(defaultRiskColumn);
      const filterOptions = {
        dimensions: {
          ...InvPriceFilterData,
          ...riskColumns.reduce((acc, col) => {
            acc[col] = ["all", "High", "Medium", "Low"];
            return acc;
          }, {}),
        },
        columns: Object.keys(view1Data),
      };
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
      setFilterOptions(filterOptions, `${view1FileName}`, "Default", true);
      // setFilterOpen(false);
    }
    // Call setFilterOptions based on the active tab
  };

  console.log(isMetricData, "isMetricData");

  useEffect(() => {
    const debugId = "[US Filter BUG]";

    console.log(`${debugId} === useEffect Debug Start ===`);
    console.log(`${debugId} fileName:`, fileName);
    console.log(`${debugId} fileNameDefault:`, fileNameDefault);
    console.log(`${debugId} tablesFilterData:`, tablesFilterData);

    const filtersData = tablesFilterData[`${fileName}`]
      ? tablesFilterData[`${fileName}`].Default.filterData.dimensionFilters
      : null;

    console.log(`${debugId} filtersData:`, filtersData);

    const columnFilterData = tablesFilterData[`${fileNameDefault}`]
      ? tablesFilterData[`${fileNameDefault}`].Default.filterData.columnFilter
      : null;

    console.log(`${debugId} columnFilterData:`, columnFilterData);

    if (filtersData) {
      console.log(`${debugId} Inside filtersData condition`);

      const tempData = Object.entries(filtersData)
        .filter(([key, value]) => Array.isArray(value) && value.length > 0)
        .map(([key]) => (key === "cluster" ? "Cluster" : key));

      console.log(`${debugId} tempData:`, tempData);

      let filtersArray = [];
      Object.keys(filtersData).forEach((key) => {
        console.log(
          `${debugId} Processing key: ${key}, value:`,
          filtersData[key]
        );
        filtersArray = filtersArray.concat(filtersData[key]);
      });

      console.log(`${debugId} filtersArray before condition:`, filtersArray);

      if (snopFilterColumns && snopFilterColumns.length > 0 && newData) {
        console.log(`${debugId} Inside SnOPDimensionsToFilter condition`);
        console.log(
          `${debugId} SnOPDimensionsToFilter before:`,
          SnOPDimensionsToFilter
        );
        console.log(`${debugId} newData:`, newData);
        console.log(
          `${debugId} columnFilterData is array:`,
          Array.isArray(columnFilterData)
        );
        console.log(
          `${debugId} columnFilterData length:`,
          columnFilterData?.length
        );

        const filteredDimensions =
          Array.isArray(columnFilterData) && columnFilterData.length > 0
            ? SnOPDimensionsToFilter.filter((dim) => {
                const convertedDim = convert(dim);
                const isIncluded = columnFilterData.includes(convertedDim);
                console.log(
                  `${debugId} Checking dim: ${dim}, converted: ${convertedDim}, included: ${isIncluded}`
                );
                return isIncluded;
              })
            : SnOPDimensionsToFilter;

        const filteredDimensionsTab =
          Array.isArray(columnFilterData) && columnFilterData.length > 0
            ? snopFilterColumns.filter((dim) => {
                const convertedDim = convert(dim);
                const isIncluded = columnFilterData.includes(convertedDim);
                console.log(
                  `${debugId} Checking dim: ${dim}, converted: ${convertedDim}, included: ${isIncluded}`
                );
                return isIncluded;
              })
            : snopFilterColumns;

        console.log(filteredDimensionsTab);

        console.log(`${debugId} filteredDimensions:`, filteredDimensions);
        setSnOPDimensionsToFilter(filteredDimensions);
        setTabFilterColumns(filteredDimensionsTab, "snop");
      } else {
        console.log(`${debugId} SnOPDimensionsToFilter condition failed:`);
        console.log(
          `${debugId} SnOPDimensionsToFilter:`,
          SnOPDimensionsToFilter
        );
        console.log(
          `${debugId} SnOPDimensionsToFilter length:`,
          SnOPDimensionsToFilter?.length
        );
        console.log(`${debugId} newData:`, newData);
      }

      console.log(`${debugId} Filter Array:`, filtersArray);
    } else {
      console.log(`${debugId} filtersData is null/undefined`);
    }

    console.log(`${debugId} === useEffect Debug End ===`);
  }, [
    tablesFilterData[`${fileNameDefault}`]?.Default?.filterData?.columnFilter,
  ]);

  useEffect(() => {
    const filtersData = tablesFilterData[`${fileName}`]
      ? tablesFilterData[`${fileName}`].Default.filterData.dimensionFilters
      : null;

    const columnFilterData = tablesFilterData[`${view1FileName}`]
      ? tablesFilterData[`${view1FileName}`].Default.filterData.columnFilter
      : null;
    if (filtersData) {
      const tempData = Object.entries(filtersData)
        .filter(([key, value]) => Array.isArray(value) && value.length > 0)
        .map(([key]) => (key === "cluster" ? "Cluster" : key));

      let filtersArray = [];
      Object.keys(filtersData).forEach((key) => {
        filtersArray = filtersArray.concat(filtersData[key]);
      });

      if (
        SnOPDimensionsToFilterView1 &&
        SnOPDimensionsToFilterView1.length > 0 &&
        newData
      ) {
        setSnOPDimensionsToFilterView1(
          Array.isArray(columnFilterData) && columnFilterData.length > 0
            ? SnOPDimensionsToFilterView1.filter((dim) =>
                columnFilterData.includes(convert(dim))
              )
            : SnOPDimensionsToFilterView1
        );
      }

      console.log("Filter Array:", filtersArray);
    }
  }, [tablesFilterData[`${view1FileName}`]?.Default?.filterData?.columnFilter]);

  useEffect(() => {
    if (newData && (!snopFilterColumns || snopFilterColumns.length === 0)) {
      const filteredDimensions = Object.keys(InvPriceFilterData).filter(
        (value) =>
          Object.keys(newData).includes(convert(value)) &&
          value !== "Cluster" &&
          value !== "Lifestage"
      );

      console.log("US East One FilterDimension", filteredDimensions);
      console.log("US East One newData", newData);

      setSnOPDimensionsToFilter(filteredDimensions);
      if (snopFilterColumns.length === 0) {
        setTabFilterColumns(filteredDimensions, "snop");
      }
    }

    if (
      view1Data &&
      (!SnOPDimensionsToFilterView1 || SnOPDimensionsToFilterView1.length === 0)
    ) {
      setSnOPDimensionsToFilterView1(
        Object.keys(InvPriceFilterData).filter(
          (value) =>
            Object.keys(view1Data).includes(convert(value)) &&
            value !== "Cluster" &&
            value !== "Lifestage"
        )
      );
    }
  }, [newData, view1Data]);

  const executeParallelApiCalls = useCallback(
    async (currentTab) => {
      if (!filterData || !filterData.dimensionFilters) {
        console.log("No filter data available for parallel API calls");
        return;
      }

      console.log(filterData);

      const tablesFilterData = store.getState().dashboard.tablesFilterData;

      setIsLoadingParallelApi(true);
      const currentData = currentTab === "0" ? newData : view1Data;
      const currentPath = currentTab === "0" ? path : view1Path;
      const currentDimensionsToFilter =
        currentTab === "0" ? snopFilterColumns : SnOPDimensionsToFilterView1;

      const convertFilePathToFileName = (filePath) => {
        if (!filePath) return "";
        const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
        const pathComponents = withoutExtension.split("/");
        return pathComponents.join("_");
      };

      try {
        const apiCalls = [];
        const callMetadata = [];

        const filterData = tablesFilterData[
          `${convertFilePathToFileName(currentPath)}`
        ]
          ? tablesFilterData[`${convertFilePathToFileName(currentPath)}`]
              .Default.filterData
          : null;

        const dimensionFilterKeys = Object.keys(
          filterData.dimensionFilters || {}
        );
        const dimensionsWithValues = dimensionFilterKeys.filter(
          (dimension) =>
            filterData.dimensionFilters[dimension] &&
            filterData.dimensionFilters[dimension].length > 0
        );

        console.log(filterData);

        // 1. Create API calls for each filtered dimension
        for (const dimension of dimensionsWithValues) {
          const modifiedFilterData = {
            ...filterData,
            dimensionFilters: {
              ...filterData.dimensionFilters,
              [dimension]: [], // Remove current dimension from filters
            },
          };

          const payload = {
            fileName: convertFilePathToFileName(currentPath),
            filePath: currentPath,
            filterData: modifiedFilterData,
            sortingData: null,
            groupByColumns: [convert(dimension)],
            aggregationColumns: {},
            filterConditions: [],
            paginationData: null,
            fetchAllRows: true,
            time: Date.now(),
          };

          apiCalls.push(callQueryEngineQuery(payload));
          callMetadata.push({
            type: "dimensionFilter",
            dimension: dimension,
            groupByColumns: [convert(dimension)],
          });
        }

        // 2. Create API call for remaining dimensions
        if (currentDimensionsToFilter && currentDimensionsToFilter.length > 0) {
          const remainingDimensions = currentDimensionsToFilter
            .map((dim) => convert(dim))
            .filter((dim) => !dimensionsWithValues.includes(dim));

          if (remainingDimensions.length > 0) {
            const payload = {
              fileName: convertFilePathToFileName(currentPath),
              filePath: currentPath,
              filterData: filterData,
              sortingData: null,
              groupByColumns: remainingDimensions,
              aggregationColumns: {},
              filterConditions: [],
              paginationData: null,
              fetchAllRows: true,
              time: Date.now(),
            };

            apiCalls.push(callQueryEngineQuery(payload));
            callMetadata.push({
              type: "remainingDimensions",
              dimensions: remainingDimensions,
              groupByColumns: remainingDimensions,
            });
          }
        }

        console.log(
          `Executing ${apiCalls.length} parallel API calls for tab ${currentTab}...`
        );
        const results = await Promise.all(apiCalls);
        const processedResults = {};

        // Process all results
        results.forEach((result, index) => {
          const metadata = callMetadata[index];

          if (metadata.type === "remainingDimensions") {
            // Handle multiple groupByColumns
            metadata.groupByColumns.forEach((groupByColumn) => {
              let uniqueValues = [];

              if (result && Array.isArray(result)) {
                uniqueValues = [
                  ...new Set(
                    result
                      .map((row) => row[groupByColumn])
                      .filter(
                        (value) =>
                          value !== null && value !== undefined && value !== ""
                      )
                  ),
                ];
              } else if (result?.data && Array.isArray(result.data)) {
                uniqueValues = [
                  ...new Set(
                    result.data
                      .map((row) => row[groupByColumn])
                      .filter(
                        (value) =>
                          value !== null && value !== undefined && value !== ""
                      )
                  ),
                ];
              } else if (
                result?.[groupByColumn] &&
                Array.isArray(result[groupByColumn])
              ) {
                uniqueValues = [
                  ...new Set(
                    result[groupByColumn].filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                  ),
                ];
              }

              console.log(
                `Processed groupByColumn ${groupByColumn}:`,
                uniqueValues
              );

              processedResults[groupByColumn] = uniqueValues;
            });
          } else {
            // Handle single dimension case
            const dimensionColumn = metadata.groupByColumns[0];
            let uniqueValues = [];

            if (result && Array.isArray(result)) {
              uniqueValues = [
                ...new Set(
                  result
                    .map((row) => row[dimensionColumn])
                    .filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                ),
              ];
            } else if (result?.data && Array.isArray(result.data)) {
              uniqueValues = [
                ...new Set(
                  result.data
                    .map((row) => row[dimensionColumn])
                    .filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                ),
              ];
            } else if (
              result?.[dimensionColumn] &&
              Array.isArray(result[dimensionColumn])
            ) {
              uniqueValues = [
                ...new Set(
                  result[dimensionColumn].filter(
                    (value) =>
                      value !== null && value !== undefined && value !== ""
                  )
                ),
              ];
            }

            console.log(
              `Processed dimension ${dimensionColumn}:`,
              uniqueValues
            );
            processedResults[dimensionColumn] = uniqueValues;
          }
        });

        console.log("All processed results:", processedResults);

        // Update state based on current tab
        console.log("currentTab", currentTab);

        if (currentTab === "0") {
          setParallelApiResultsView0((prev) => ({
            ...prev,
            ...processedResults,
          }));
        } else {
          setParallelApiResultsView1((prev) => ({
            ...prev,
            ...processedResults,
          }));
        }
      } catch (error) {
        console.error(
          `Error in parallel API calls for tab ${currentTab}:`,
          error
        );
      } finally {
        setIsLoadingParallelApi(false);
      }
    },
    [
      filterData,
      newData,
      view1Data,
      SnOPDimensionsToFilter,
      SnOPDimensionsToFilterView1,
      viewMode,
    ]
  );

  const executeParallelApiCalls1 = useCallback(
    async (currentTab) => {
      if (!filterData || !filterData.dimensionFilters) {
        console.log("No filter data available for parallel API calls");
        return;
      }

      console.log(filterData);

      setIsLoadingParallelApi(true);
      const currentData = currentTab === "0" ? newData : view1Data;
      const currentPath = currentTab === "0" ? path : view1Path;
      const currentDimensionsToFilter =
        currentTab === "0" ? snopFilterColumns : SnOPDimensionsToFilterView1;

      const convertFilePathToFileName = (filePath) => {
        if (!filePath) return "";
        const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
        const pathComponents = withoutExtension.split("/");
        return pathComponents.join("_");
      };

      try {
        const apiCalls = [];
        const callMetadata = [];

        const dimensionFilterKeys = Object.keys(
          filterData.dimensionFilters || {}
        );
        const dimensionsWithValues = dimensionFilterKeys.filter(
          (dimension) =>
            filterData.dimensionFilters[dimension] &&
            filterData.dimensionFilters[dimension].length > 0
        );

        // 1. Create API calls for each filtered dimension
        for (const dimension of dimensionsWithValues) {
          const modifiedFilterData = {
            ...filterData,
            dimensionFilters: {
              ...filterData.dimensionFilters,
              [dimension]: [], // Remove current dimension from filters
            },
          };

          const payload = {
            fileName: convertFilePathToFileName(currentPath),
            filePath: currentPath,
            filterData: modifiedFilterData,
            sortingData: null,
            groupByColumns: [convert(dimension)],
            aggregationColumns: {},
            filterConditions: [],
            paginationData: null,
            fetchAllRows: true,
            time: Date.now(),
          };

          apiCalls.push(callQueryEngineQuery(payload));
          callMetadata.push({
            type: "dimensionFilter",
            dimension: dimension,
            groupByColumns: [convert(dimension)],
          });
        }

        // 2. Create API call for remaining dimensions
        if (currentDimensionsToFilter && currentDimensionsToFilter.length > 0) {
          const remainingDimensions = currentDimensionsToFilter
            .map((dim) => convert(dim))
            .filter((dim) => !dimensionsWithValues.includes(dim));

          if (remainingDimensions.length > 0) {
            const payload = {
              fileName: convertFilePathToFileName(currentPath),
              filePath: currentPath,
              filterData: filterData,
              sortingData: null,
              groupByColumns: remainingDimensions,
              aggregationColumns: {},
              filterConditions: [],
              paginationData: null,
              fetchAllRows: true,
              time: Date.now(),
            };

            apiCalls.push(callQueryEngineQuery(payload));
            callMetadata.push({
              type: "remainingDimensions",
              dimensions: remainingDimensions,
              groupByColumns: remainingDimensions,
            });
          }
        }

        console.log(
          `Executing ${apiCalls.length} parallel API calls for tab ${currentTab}...`
        );
        const results = await Promise.all(apiCalls);
        const processedResults = {};

        // Process all results
        results.forEach((result, index) => {
          const metadata = callMetadata[index];

          if (metadata.type === "remainingDimensions") {
            // Handle multiple groupByColumns
            metadata.groupByColumns.forEach((groupByColumn) => {
              let uniqueValues = [];

              if (result && Array.isArray(result)) {
                uniqueValues = [
                  ...new Set(
                    result
                      .map((row) => row[groupByColumn])
                      .filter(
                        (value) =>
                          value !== null && value !== undefined && value !== ""
                      )
                  ),
                ];
              } else if (result?.data && Array.isArray(result.data)) {
                uniqueValues = [
                  ...new Set(
                    result.data
                      .map((row) => row[groupByColumn])
                      .filter(
                        (value) =>
                          value !== null && value !== undefined && value !== ""
                      )
                  ),
                ];
              } else if (
                result?.[groupByColumn] &&
                Array.isArray(result[groupByColumn])
              ) {
                uniqueValues = [
                  ...new Set(
                    result[groupByColumn].filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                  ),
                ];
              }

              console.log(
                `Processed groupByColumn ${groupByColumn}:`,
                uniqueValues
              );
              processedResults[groupByColumn] = uniqueValues;
            });
          } else {
            // Handle single dimension case
            const dimensionColumn = metadata.groupByColumns[0];
            let uniqueValues = [];

            if (result && Array.isArray(result)) {
              uniqueValues = [
                ...new Set(
                  result
                    .map((row) => row[dimensionColumn])
                    .filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                ),
              ];
            } else if (result?.data && Array.isArray(result.data)) {
              uniqueValues = [
                ...new Set(
                  result.data
                    .map((row) => row[dimensionColumn])
                    .filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                ),
              ];
            } else if (
              result?.[dimensionColumn] &&
              Array.isArray(result[dimensionColumn])
            ) {
              uniqueValues = [
                ...new Set(
                  result[dimensionColumn].filter(
                    (value) =>
                      value !== null && value !== undefined && value !== ""
                  )
                ),
              ];
            }

            console.log(
              `Processed dimension ${dimensionColumn}:`,
              uniqueValues
            );
            processedResults[dimensionColumn] = uniqueValues;
          }
        });

        console.log("All processed results:", processedResults);

        // Update state based on current tab
        console.log("currentTab", currentTab);
        if (currentTab === "0") {
          setParallelApiResultsView0((prev) => ({
            ...prev,
            ...processedResults,
          }));
        } else {
          setParallelApiResultsView1((prev) => ({
            ...prev,
            ...processedResults,
          }));
        }
      } catch (error) {
        console.error(
          `Error in parallel API calls for tab ${currentTab}:`,
          error
        );
      } finally {
        setIsLoadingParallelApi(false);
      }
    },
    [
      filterData,
      newData,
      view1Data,
      SnOPDimensionsToFilter,
      SnOPDimensionsToFilterView1,
    ]
  );

  // Update the useEffect that triggers parallel API calls
  useEffect(() => {
    console.log(filterData, filterOptions);

    if (
      filterData &&
      Object.keys(filterData.dimensionFilters || {}).length > 0
    ) {
      executeParallelApiCalls1(tabValue);
    }
  }, [filterData]);

  // useEffect(() => {
  //   if (
  //     filterData

  //   ) {
  //     executeParallelApiCalls(tabValue);
  //   }
  // }, [tablesFilterData[`${view1FileName}`]?.Default?.filterData?.dimensionFilters,
  //     tablesFilterData[`${fileNameDefault}`]?.Default?.filterData?.dimensionFilters]);
  const handlePrevTab = () => {
    setTabValue((parseInt(tabValue) - 1).toString());
  };

  function checkFiltersMatchSet(filtersApplied, filtersData) {
    const dimensionFilterValues = [];

    for (const key in filtersData.dimensionFilters) {
      if (filtersData.dimensionFilters.hasOwnProperty(key)) {
        const value = filtersData.dimensionFilters[key];

        if (Array.isArray(value)) {
          dimensionFilterValues.push(...value);
        } else {
          dimensionFilterValues.push(value);
        }
      }
    }

    // Convert to Sets for comparison
    const appliedSet = new Set(filtersApplied);
    const dimensionSet = new Set(dimensionFilterValues);

    console.log("appliedSet", appliedSet);
    console.log("dimensionSet", dimensionSet);

    // Check if sets have same size and all elements match
    if (appliedSet.size !== dimensionSet.size) {
      return false;
    }

    for (const item of appliedSet) {
      if (!dimensionSet.has(item)) {
        return false;
      }
    }

    return true;
  }

  const handleNextTab = async () => {
    setTabValue((parseInt(tabValue) + 1).toString());
  };

  useEffect(() => {
    console.log("filterData" + JSON.stringify(filterData));
  }, [filterData]);

  useEffect(() => {
    console.log("tablesFilterData", tablesFilterData);
    console.log("fileName", fileName);
    const filtersData = {
      dimensionFilters:
        tablesFilterData[fileName]?.["Default"]?.filterData?.dimensionFilters ??
        {},
      frozenColumns:
        tablesFilterData[fileName]?.["Default"]?.filterData?.frozenColumns ??
        [],
      columnFilter:
        tablesFilterData[fileName]?.["Default"]?.filterData?.columnFilter ?? [],
      selectAllColumns:
        tablesFilterData[fileName]?.["Default"]?.filterData?.selectAllColumns ??
        true,
    };
    console.log("filtersData", filtersData);
    const dimensionFilters = filtersData.dimensionFilters;
    console.log("dimensionFilters", dimensionFilters);
    const tempData = Object.entries(dimensionFilters)
      .filter(([key, value]) => Array.isArray(value) && value.length > 0)
      .map(([key]) => (key === "cluster" ? "Cluster" : key));

    if (dimensionFilters) {
      let filtersArray = [];
      Object.keys(dimensionFilters).forEach((key) => {
        filtersArray = filtersArray.concat(dimensionFilters[key]);
      });
      setFiltersApplied(filtersArray);

      console.log("Filters Applied:", filtersArray);
    }
  }, [tablesFilterData, tabValue, fileName]);
  const isEditableColumn = (columnName) => {
    if (columnName === "SnOP Comments" || columnName === "Forecast_Per_Day") {
      return true;
    }

    const regex = /^\d{4}-\d{2}-\d{2} Forecast$/;
    return regex.test(columnName);
  };
  const isEditableColumnView1 = (columnName) => {
    if (columnName === "SnOP Comments" || columnName === "Forecast_Per_Day") {
      return true;
    }
  };
  const getTimeStamp = (columnName) => {
    const time_stamp = columnName.split(" ")[0];
    return time_stamp;
  };
  const { hasParquetFiles } = useExperiment();
  const getDateColumns = (data) => {
    const regex = /^\d{4}-\d{2}-\d{2}\s+.+$/;
    return Object.keys(data).filter((col) => regex.test(col));
  };

  const fetchData = async () => {
    const [dataResult, updatedDataResult, plannerDataResult] =
      await Promise.allSettled([
        hasParquetFiles
          ? fetchParquetData({
              filePath: path,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            })
          : fetchCSVData({
              filePath: path,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            }),

        hasParquetFiles
          ? fetchParquetData({
              filePath: updatedPath,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            })
          : fetchCSVData({
              filePath: updatedPath,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            }),
        hasParquetFiles
          ? fetchParquetData({
              filePath: plannerViewPath,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            })
          : fetchCSVData({
              filePath: plannerViewPath,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            }),
      ]);

    // Extract values safely
    const data = dataResult.status === "fulfilled" ? dataResult.value : null;
    const updatedData =
      updatedDataResult.status === "fulfilled" ? updatedDataResult.value : null;

    if (data) {
      const dataColumns = Object.keys(data || {});

      console.log(dataColumns); // if data is an array of objects
      setDataColumn(dataColumns);
    }

    console.log(updatedData);

    console.log(plannerDataResult);
    setIsPlannerData(plannerDataResult.value !== undefined);
    // Use updatedData if available, otherwise fallback to data
    if (updatedData) {
      const forecastColumns = getDateColumns(updatedData);
      setSalesAndForecastColumnsDefault(forecastColumns);
      console.log(forecastColumns);
      setIsUpdatedData(true); // mark that updatedData is being used
    } else if (data) {
      const forecastColumns = getDateColumns(data);
      setSalesAndForecastColumnsDefault(forecastColumns);
      setIsUpdatedData(false); // fallback
    }

    setNewData(data);

    if (data) {
      const riskColumns = Object.keys(data).filter((col) =>
        col.startsWith("Risk_")
      );
      const defaultRiskColumn = riskColumns[riskColumns.length - 1];
      setRiskColumn(defaultRiskColumn);

      const filterOptions = {
        dimensions: {
          ...InvPriceFilterData,
          ...riskColumns.reduce((acc, col) => {
            acc[col] = ["all", "High", "Medium", "Low"];
            return acc;
          }, {}),
        },
        columns: Object.keys(data),
      };

      setFilterOptions(filterOptions, `${fileName}`, "Default", true);
      // setFilterOpen(false);
    }

    setTry(Try + 1);
  };

  const fetchDataFinalDA = async () => {
    const data = await (hasParquetFiles
      ? fetchParquetData({
          filePath: updatedPath,
          filterData: null,
          paginationData: { batchNo: 1, batchSize: 1 },
          sortingData: null,
        })
      : fetchCSVData({
          filePath: updatedPath,
          filterData: null,
          paginationData: { batchNo: 1, batchSize: 1 },
          sortingData: null,
        }));
    // const valueData = await (hasParquetFiles
    //   ? null
    //   : fetchCSVFromS3(valuePath, "", true, userInfo.userID, true)

    const forecastColumns = getDateColumns(data);
    setSalesAndForecastColumnsDefault(forecastColumns);

    console.log("forecastColumnsData", data);
  };

  useEffect(() => {
    const calculateAllSums = async () => {
      try {
        // const promises = salesAndForecastColumnsDefault.map(
        //   async (columnName) => {
        //     try {
        //       console.log(
        //         `[calculateAllSums]Calculating sum for column: ${columnName}`
        //       );

        //       // Get the base sum from API
        //       const baseSum = await getAggregatedValue({
        //         filePath: path,
        //         filterData:
        //           tablesFilterData[`${fileNameDefault}`]?.Default?.filterData,
        //         columnName,
        //         userID: userInfo.userID,
        //       });

        //       const end = performance.now();
        //       console.log(
        //         `[calculateAllSums]Time taken for ${columnName}: ${(end - start).toFixed(2)} ms`
        //       );

        //       console.log(
        //         `[calculateAllSums]Received base sum for ${columnName}:`,
        //         baseSum
        //       );

        //       const totalSum = parseFloat(baseSum).toFixed(2);

        //       return {
        //         columnName,
        //         sum: totalSum,
        //         baseSum: totalSum,
        //       };
        //     } catch (error) {
        //       console.error(
        //         `[calculateAllSums]Error calculating sum for ${columnName}:`,
        //         error
        //       );
        //       return { columnName, sum: "-", baseSum: "-" };
        //     }
        //   }
        // );

        const aggregationColumnsProp = salesAndForecastColumnsDefault.reduce(
          (acc, columnName) => {
            acc[columnName] = "sum";
            return acc;
          },
          {}
        );

        const hasBounds = salesAndForecastColumnsDefault.some(
          (col) => col.endsWith("Upper Bound") || col.endsWith("Lower Bound")
        );

        setIsMetricData(hasBounds);
        const convertFilePathToFileName = (filePath) => {
          if (!filePath) return "";
          const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
          const pathComponents = withoutExtension.split("/");
          return pathComponents.join("_");
        };

        let dataPath;

        if (isUpdatedData) {
          dataPath = viewMode === "revenue" ? revenuePath : updatedPath;
        } else {
          dataPath = path;
        }

        const payload = {
          fileName: convertFilePathToFileName(path),
          filePath: dataPath,
          filterData:
            tablesFilterData[`${fileNameDefault}`]?.Default?.filterData,

          sortingData: null,
          groupByColumns: [],
          aggregationColumns: aggregationColumnsProp,
          filterConditions: [],
          paginationData: null,
          time: Date.now(),
        };

        if (
          salesAndForecastColumnsDefault &&
          salesAndForecastColumnsDefault.length > 0
        ) {
          const overallStart = performance.now();
          console.log(`[calculateAllSums]All parallel`);
          const results = await callQueryEngineQuery(payload);
          const calculatedMetrics = calculateSalesMetrics(results, frequency);
          setSalesMetrics(calculatedMetrics);
          console.log(calculatedMetrics);

          console.log("[calculateAllSums]Results:", results);
          setDefaultViewGraphData(results);
          const overallEnd = performance.now();
          console.log(
            `[calculateAllSums]All parallel calculations completed in ${(
              overallEnd - overallStart
            ).toFixed(2)} ms`
          );
        }
      } catch (err) {
        console.error("[calculateAllSums]Unexpected error:", err);
      }
    };

    calculateAllSums();
  }, [
    tablesFilterData[`${fileNameDefault}`]?.Default?.filterData
      ?.dimensionFilters,
    salesAndForecastColumnsDefault,
    viewMode,
  ]);

  useEffect(() => {
    const updateFilterData = async () => {
      const allFilterData = {
        dimensionFilters:
          tablesFilterData?.[fileNameDefault]?.Default?.filterData
            ?.dimensionFilters ?? [],
        columnFilter:
          tablesFilterData?.[plannerViewFileName]?.Default?.filterData
            ?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData?.[plannerViewFileName]?.Default?.filterData
            ?.selectAllColumns ?? true,
      };

      await setFilterData(
        allFilterData,
        "Planner View",
        plannerViewFileName,
        "Default"
      );
      await setFilterData(
        allFilterData,
        "Planner View Value",
        plannerViewValueFileName,
        "Default"
      );
    };

    updateFilterData();
  }, [
    tablesFilterData?.[fileNameDefault]?.Default?.filterData?.dimensionFilters,
  ]);

  useEffect(() => {
    const calculateAllSums = async () => {
      try {
        // const promises = salesAndForecastColumnsDefault.map(
        //   async (columnName) => {
        //     try {
        //       console.log(
        //         `[calculateAllSums]Calculating sum for column: ${columnName}`
        //       );

        //       // Get the base sum from API
        //       const baseSum = await getAggregatedValue({
        //         filePath: path,
        //         filterData:
        //           tablesFilterData[`${fileNameDefault}`]?.Default?.filterData,
        //         columnName,
        //         userID: userInfo.userID,
        //       });

        //       const end = performance.now();
        //       console.log(
        //         `[calculateAllSums]Time taken for ${columnName}: ${(end - start).toFixed(2)} ms`
        //       );

        //       console.log(
        //         `[calculateAllSums]Received base sum for ${columnName}:`,
        //         baseSum
        //       );

        //       const totalSum = parseFloat(baseSum).toFixed(2);

        //       return {
        //         columnName,
        //         sum: totalSum,
        //         baseSum: totalSum,
        //       };
        //     } catch (error) {
        //       console.error(
        //         `[calculateAllSums]Error calculating sum for ${columnName}:`,
        //         error
        //       );
        //       return { columnName, sum: "-", baseSum: "-" };
        //     }
        //   }
        // );

        const aggregationColumnsProp = salesAndForecastColumnsView1.reduce(
          (acc, columnName) => {
            acc[columnName] = "sum";
            return acc;
          },
          {}
        );
        console.log(aggregationColumnsProp);
        const convertFilePathToFileName = (filePath) => {
          if (!filePath) return "";
          const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
          const pathComponents = withoutExtension.split("/");
          return pathComponents.join("_");
        };
        let dataPath;
        if (isUpdatedData) {
          dataPath =
            viewModeView1 === "revenue" ? revenuePathView1 : updatedPathView1;
        } else {
          dataPath = updatedPathView1;
        }

        const payload = {
          fileName: convertFilePathToFileName(updatedPathView1),
          filePath: dataPath,
          filterData: tablesFilterData[`${view1FileName}`]?.Default?.filterData,

          sortingData: null,
          groupByColumns: [],
          aggregationColumns: aggregationColumnsProp,
          filterConditions: [],
          paginationData: null,
          time: Date.now(),
        };

        if (
          salesAndForecastColumnsView1 &&
          salesAndForecastColumnsView1.length > 0
        ) {
          const overallStart = performance.now();
          console.log(`[calculateAllSums]All parallel`);
          const results = await callQueryEngineQuery(payload);

          console.log("[calculateAllSums]Results View1:", results);
          setView1ViewGraphData(results);
          const overallEnd = performance.now();
          console.log(
            `[calculateAllSums]All parallel calculations completed in ${(
              overallEnd - overallStart
            ).toFixed(2)} ms`
          );
        }
      } catch (err) {
        console.error("[calculateAllSums]Unexpected error:", err);
      }
    };

    calculateAllSums();
  }, [
    tablesFilterData[`${view1FileName}`]?.Default?.filterData?.dimensionFilters,
    salesAndForecastColumnsView1,
    viewModeView1,
  ]);

  const fetchViewOneData = async () => {
    const [dataResult, updatedDataResult] = await Promise.allSettled([
      hasParquetFiles
        ? fetchParquetData({
            filePath: view1Path,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 1 },
            sortingData: null,
          })
        : fetchCSVData({
            filePath: view1Path,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 1 },
            sortingData: null,
          }),

      hasParquetFiles
        ? fetchParquetData({
            filePath: updatedPathView1,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 1 },
            sortingData: null,
          })
        : fetchCSVData({
            filePath: updatedPathView1,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 1 },
            sortingData: null,
          }),
    ]);

    // const valueData = await (hasParquetFiles
    //   ? null
    //   : fetchCSVFromS3(view1ValuePath, "", true, userInfo.userID, true));

    const data = dataResult.status === "fulfilled" ? dataResult.value : null;
    const updatedData =
      updatedDataResult.status === "fulfilled" ? updatedDataResult.value : null;
    const getDateColumns = (data) => {
      const regex = /^\d{4}-\d{2}-\d{2}\s+.+$/;
      return Object.keys(data).filter((col) => regex.test(col));
    };
    console.log("view1Data Fetched:", updatedData);

    if (data) {
      setView1Data(data);
    }
    if (updatedData) {
      const forecastColumns = getDateColumns(updatedData);
      console.log(forecastColumns);
      setSalesAndForecastColumnsView1(forecastColumns);
      console.log(forecastColumns);
      // mark that updatedData is being used
    } else if (data) {
      const forecastColumns = getDateColumns(data);
      setSalesAndForecastColumnsView1(forecastColumns);
      // fallback
    }
    // if (data) {
    //   const filterOptions = {
    //     dimensions: {...InvPriceFilterData,...Object.keys(data).filter(col => col.startsWith('Risk_')).reduce((acc, col) => {
    //       acc[col] = ["all","High","Medium","Low"];
    //       return acc;
    //     }, {})},
    //     columns: Object.keys(data),
    //   };
    //   setFilterOptions(filterOptions, `${view1FileName}`, "Default");
    //   setFilterOpen(false);
    // }

    setTry(Try + 1);
  };

  useEffect(() => {
    if (salesAndForecastColumnsDefault.length === 0) {
      fetchData();
    }
  }, []);
  // useEffect(() => {
  //   if (true) {
  //     fetchDataFinalDA();
  //   }
  // }, []);

  useEffect(() => {
    if (
      experiment_config?.scenario_plan?.demand_alignment_report?.ts_id_view1
        ?.length > 0
    ) {
      fetchViewOneData();
    }
  }, []);

  console.log("salesAndForecastColumnsView1", salesAndForecastColumnsView1);

  const reportName =
    tabValue === "0"
      ? "Demand Alignment Report"
      : "Demand Alignment View1 Report";
  const reportNameValue =
    tabValue === "0"
      ? "Demand Alignment Value Report"
      : "Demand Alignment Value View1 Report";

  return (
    <Box paddingX="15px">
      <TabContext value={tabValue}>
        <Box padding="12px 16px 12px 16px">
          <TabList
            onChange={handleChange}
            aria-label="create experiment tablist"
          >
            <Tab
              label={
                configState.scenario_plan?.demand_alignment_report
                  ?.view0_report_name || "Default View"
              }
              value="0"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
              // Remove the disabled property to make tab clickable
            />
            {view1Data && (
              <Tab
                label={
                  configState.scenario_plan?.demand_alignment_report
                    ?.view1_report_name || "View One"
                }
                value="1"
                sx={{
                  color: "#667085",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "left",
                  textTransform: "none",
                  "&.Mui-selected": {
                    color: theme.palette.button.textOnHover, // Color for selected tab
                    borderBottom: "2px solid #0C66E4",
                  },
                }}
                // Remove the disabled property to make tab clickable
              />
            )}
          </TabList>
        </Box>
        {newData && (
          <TabPanel sx={{ padding: "1px 0px", marginX: "-16px" }} value="0">
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sx={{ px: "25px", py: 0, ml: "22px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      {/* SalesMetricsStrip takes most of the width */}
                      <Box sx={{ flex: 1 }}>
                        <SalesMetricsStrip
                          totalForecast={salesMetrics.totalForecast}
                          yoyGrowth={salesMetrics.yoyGrowth}
                          currentGrowth={salesMetrics.currentGrowth}
                          sales30Days={salesMetrics.sales30Days}
                          sales60Days={salesMetrics.sales60Days}
                          sales90Days={salesMetrics.sales90Days}
                          viewMode={viewMode}
                        />
                      </Box>

                      {/* ViewModeToggle takes minimal space */}

                      {isUpdatedData && (
                        <Box sx={{ flexShrink: 0 }}>
                          <ViewModeToggle
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                          />
                        </Box>
                      )}
                        {/* <Button
      onClick={captureChartScreenshot}
      variant="outlined"
   // You may need to import this icon from @mui/icons-material
      sx={{
        marginRight: '8px', // Add some spacing
        flexShrink: 0,
      }}
    >
      Save Chart
    </Button> */}
                    </Box>
                  </Grid>
                </Grid>
                <Stack padding="0px 32px 0px 12px" spacing={2}>
                  <Stack spacing={"2rem"}>
                    {/* Main Content Container - Side by Side Layout */}
                    <Grid container spacing={1}  ref={chartRef}>
                      {/* Filters Section */}
                      <Grid item xs={12} lg={isMetricData ? 2.6 : 3.2}>
                        <Box>
                          {(filtersApplied.length + snopFilterColumns.length >
                            0 ||
                            true ||
                            RiskColumn) && (
                            <Stack spacing={"1rem"}>
                              <Stack
                                spacing={1}
                                sx={{
                                  border: "1px solid #D0D5DD",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  height: "450px", // Fixed height to match chart
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{
                                      flex: 1,
                                      overflow: "hidden",
                                      marginRight: "0.2rem",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Inter",
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: "#101828",
                                        textAlign: "left",
                                        lineHeight: "30px",
                                      }}
                                    >
                                      Filters
                                    </Typography>

                                    {/* Settings Icon with Tooltip */}
                                    <Tooltip title="Configure filter dimensions">
                                      <IconButton
                                        onClick={() =>
                                          setShowDimensionSettings(
                                            !showDimensionSettings
                                          )
                                        }
                                        sx={{
                                          padding: "0px",
                                          color: "#0C66E4",
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(99, 102, 241, 0.04)",
                                          },
                                        }}
                                      >
                                        <SettingsIcon
                                          sx={{ fontSize: "18px" }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                  <Stack direction={"row"} spacing={1}>
                                    {filtersApplied.length > 0 && (
                                      <Tooltip title="Remove all filters">
                                        <IconButton
                                          onClick={async () => {
                                            await clearFilters(
                                              `${fileName}`,
                                              reportName,
                                              "Default"
                                            );
                                            await clearFilters(
                                              `${valueFileName}`,
                                              reportNameValue,
                                              "Default"
                                            );
                                            await executeParallelApiCalls("0");

                                            setAutoCompleteKey(
                                              (prevKey) => prevKey + 1
                                            );
                                          }}
                                          sx={{
                                            padding: "8px",
                                            color: "#DC2626",
                                            backgroundColor: "#FEF2F2",
                                            border: "1px solid #FECACA",
                                            borderRadius: "6px",
                                            flexShrink: 0,
                                            "&:hover": {
                                              backgroundColor: "#FEE2E2",
                                              borderColor: "#FCA5A5",
                                            },
                                          }}
                                        >
                                          <FilterAltOffIcon
                                            sx={{ fontSize: "18px" }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                    )}

                                    <Box
                                      sx={{
                                        position: "relative",
                                        display: "inline-block",
                                      }}
                                    >
                                      <Tooltip
                                        title={
                                          checkFiltersMatchSet(
                                            filtersApplied,
                                            filterData
                                          )
                                            ? "No new filters to apply"
                                            : "Click to apply updated filters"
                                        }
                                        arrow
                                      >
                                        <span>
                                          <CustomButton
                                            title="Apply Filter"
                                            outlined
                                            disabled={checkFiltersMatchSet(
                                              filtersApplied,
                                              filterData
                                            )}
                                            onClick={async () => {
                                              await applyFilter(
                                                `${fileName}`,
                                                reportName,
                                                "Default",
                                                false,
                                                false
                                              );
                                              await applyFilter(
                                                `${valueFileName}`,
                                                reportNameValue,
                                                "Default",
                                                false,
                                                false
                                              );
                                            }}
                                          />
                                        </span>
                                      </Tooltip>
                                    </Box>
                                  </Stack>
                                </Stack>

                                {/* Collapsible Dimension Settings */}
                                <Collapse in={showDimensionSettings}>
                                  <Stack
                                    spacing={2}
                                    sx={{
                                      pt: 1,
                                      borderTop: "1px solid #E4E7EC",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Inter",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#475467",
                                      }}
                                    >
                                      Filter Configuration
                                    </Typography>
                                    <CustomAutocomplete
                                      label={"Choose Dimensions to Filter"}
                                      showLabel
                                      isMultiSelect
                                      selectedValues={snopFilterColumns}
                                      setSelectedValues={(value) =>
                                        setTabFilterColumns(value, "snop")
                                      }
                                      values={
                                        Object.keys(
                                          Object.keys(
                                            filterOptions.dimensions || {}
                                          ).length
                                            ? filterOptions.dimensions
                                            : { temp: "useColumns" } // dummy key to trigger fallback
                                        )[0] === "useColumns"
                                          ? filterOptions.columns.filter(
                                              (value) =>
                                                Object.keys(newData).includes(
                                                  convert(value)
                                                )
                                            )
                                          : Object.keys(
                                              filterOptions.dimensions
                                            ).filter((value) =>
                                              Object.keys(newData).includes(
                                                convert(value)
                                              )
                                            )
                                      }
                                      placeholder={`Select dimensions to filter...`}
                                      maxHeight="200px"
                                    />
                                  </Stack>
                                </Collapse>

                                {/* Filter Dimensions - Scrollable Container */}
                                {(RiskColumn ||
                                  snopFilterColumns.length > 0) && (
                                  <Box
                                    sx={{
                                      pt: 1,
                                      flex: 1, // Takes remaining space in the container
                                      overflowY: "auto",
                                      maxHeight: "350px", // Adjust based on available space
                                      pr: "4px", // Small padding for scrollbar
                                    }}
                                  >
                                    <Stack spacing={2}>
                                      {/* Regular Filter Dimensions */}
                                      {snopFilterColumns.map(
                                        (dimension, index) => (
                                          <CustomAutocomplete
                                            key={`${dimension}-${filtersApplied.length}`}
                                            label={dimension}
                                            showLabel
                                            isMultiSelect
                                            target={"filter"}
                                            path={convert(dimension)}
                                            values={(() => {
                                              const originalValues =
                                                filterOptions.dimensions[
                                                  dimension
                                                ] || [];
                                              const availableValues =
                                                parallelApiResultsView0[
                                                  convert(dimension)
                                                ] || [];

                                              console.log(
                                                availableValues,
                                                originalValues.filter((value) =>
                                                  availableValues.includes(
                                                    value
                                                  )
                                                )
                                              );

                                              if (
                                                !parallelApiResultsView0 ||
                                                Object.keys(
                                                  parallelApiResultsView0
                                                ).length === 0
                                              ) {
                                                return originalValues;
                                              }

                                              if (originalValues.length === 0) {
                                                return availableValues;
                                              }
                                              return originalValues.filter(
                                                (value) =>
                                                  availableValues.includes(
                                                    value
                                                  )
                                              );
                                            })()}
                                            placeholder={`Select filters for ${dimension}...`}
                                            showFormattedLabel={true}
                                          />
                                        )
                                      )}

                                      {/* Risk Columns */}
                                      {/* {RiskColumn && (
                                        <>
                                          <CustomAutocomplete
                                            label={"Risk & Opportunity Tenure"}
                                            disableClearable
                                            showLabel
                                            selectedValues={RiskColumn}
                                            setSelectedValues={setRiskColumn}
                                            values={Object.keys(
                                              newData || {}
                                            ).filter((value) =>
                                              value.startsWith("Risk_")
                                            )}
                                            placeholder={`Select risk column...`}
                                            labelColor="#D97706"
                                          />
                                          <CustomAutocomplete
                                            disableClearable
                                            key={filtersApplied.length}
                                            label={"Risk & Opportunity Segment"}
                                            showLabel
                                            target={"filter"}
                                            path={convert(RiskColumn)}
                                            values={
                                              filterOptions.dimensions[
                                                RiskColumn
                                              ]
                                            }
                                            placeholder={`Select filters for ${RiskColumn}...`}
                                            defaultValueByUser="all"
                                            labelColor="#D97706"
                                          />
                                        </>
                                      )} */}
                                    </Stack>
                                  </Box>
                                )}

                                {/* Applied Filters at Bottom */}
                                {filtersApplied.length > 0 && (
                                  <Stack
                                    spacing={1}
                                    sx={{
                                      pt: 1,
                                      borderTop: "1px solid #E4E7EC",
                                      marginTop: "auto", // Push to bottom
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Inter",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        color: "#6B7280",
                                      }}
                                    >
                                      Applied Filters:
                                    </Typography>
                                    <Stack
                                      direction="row"
                                      spacing={0.5}
                                      sx={{
                                        overflowX: "auto",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {filtersApplied.map((filter, index) => (
                                        <Chip
                                          label={filter}
                                          key={index}
                                          sx={{
                                            padding: "0px 6px 0px 8px",
                                            backgroundColor: "#F2F4F7",
                                            fontFamily: "Inter",
                                            fontWeight: 500,
                                            fontSize: "12px",
                                            lineHeight: "16px",
                                            color: "#344054",
                                            "& .MuiChip-deleteIcon": {
                                              color: "#344054",
                                            },
                                          }}
                                        />
                                      ))}
                                    </Stack>
                                  </Stack>
                                )}
                              </Stack>
                            </Stack>
                          )}
                        </Box>
                      </Grid>

                      {/* Chart Section */}
                      <Grid item xs={12} lg={isMetricData ? 7.2 : 8.8}>
                        <Box
                        
                          sx={{
                            border: "1px solid #E4E7EC",
                            borderRadius: "8px",
                            height: "450px", // Same fixed height as filter container
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {defaultViewGraphData &&
                          Object.keys(defaultViewGraphData).length > 0 ? (
                            <Box sx={{ width: "100%", height: "100%" }}>
                              <ForecastChart
                                data={defaultViewGraphData}
                                showEnrichment={true}
                                filterData={
                                  tablesFilterData[`${fileNameDefault}`]
                                    ?.Default?.filterData?.dimensionFilters
                                }
                              />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                p: 3, // Padding for the skeleton content
                                backgroundColor: "#FAFBFC",
                              }}
                            >
                              {/* Chart Header Skeleton */}
                              <Box sx={{ mb: 3 }}>
                                <Skeleton
                                  variant="text"
                                  width="40%"
                                  height={32}
                                  sx={{ mb: 1 }}
                                />
                                <Skeleton
                                  variant="text"
                                  width="25%"
                                  height={20}
                                />
                              </Box>

                              {/* Chart Area Skeleton */}
                              <Box
                                sx={{
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {/* Main chart skeleton */}
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "end",
                                    gap: 2,
                                    mb: 2,
                                  }}
                                >
                                  {/* Y-axis labels */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                      height: "100%",
                                      justifyContent: "space-between",
                                      width: 40,
                                    }}
                                  >
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                      <Skeleton
                                        key={i}
                                        variant="text"
                                        width={30}
                                        height={16}
                                      />
                                    ))}
                                  </Box>

                                  {/* Chart area with grid and lines */}
                                  <Box
                                    sx={{
                                      flex: 1,
                                      height: "100%",
                                      position: "relative",
                                      backgroundColor: "white",
                                      borderRadius: 1,
                                    }}
                                  >
                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          position: "absolute",
                                          left: 0,
                                          right: 0,
                                          top: `${i * 20}%`,
                                          height: "1px",
                                          backgroundColor: "#F0F0F0",
                                        }}
                                      />
                                    ))}

                                    {/* Animated chart lines */}
                                    <svg
                                      width="100%"
                                      height="100%"
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                      }}
                                    >
                                      <path
                                        d="M0,60% Q25%,20% 50%,40% T100%,30%"
                                        stroke="#6366F1"
                                        strokeWidth="2"
                                        fill="none"
                                        style={{
                                          strokeDasharray: "1000",
                                          strokeDashoffset: "1000",
                                          animation:
                                            "drawLine 3s ease-in-out infinite",
                                        }}
                                      />
                                      <path
                                        d="M0,70% Q25%,80% 50%,60% T100%,50%"
                                        stroke="#8B5CF6"
                                        strokeWidth="2"
                                        fill="none"
                                        style={{
                                          strokeDasharray: "1000",
                                          strokeDashoffset: "1000",
                                          animation:
                                            "drawLine 3s ease-in-out 0.5s infinite",
                                        }}
                                      />
                                      <style>
                                        {`
                    @keyframes drawLine {
                      0%, 100% { stroke-dashoffset: 1000; }
                      50% { stroke-dashoffset: 0; }
                    }
                  `}
                                      </style>
                                    </svg>
                                  </Box>
                                </Box>

                                {/* X-axis labels */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    ml: 5,
                                  }}
                                >
                                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton
                                      key={i}
                                      variant="text"
                                      width={50}
                                      height={16}
                                    />
                                  ))}
                                </Box>
                              </Box>

                              {/* Loading text */}
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {isMetricData && (
                        <Grid item xs={12} lg={2.2}>
                          <Stack
                            sx={{
                              height: "450px",
                              gap: "0.75rem",
                              backgroundColor: "#FFFFFF",
                              overflow: "hidden",

                              flex: 1,
                              overflow: "scroll",
                              border: "1px solid #10B981",
                              boxShadow:
                                "0px 4px 6px -2px rgba(16, 185, 129, 0.05), 0px 12px 16px -4px rgba(16, 185, 129, 0.1)",
                              borderRadius: "12px",
                              padding: "10px",
                            }}
                          >
                            {/* Enrichment Header */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingBottom: "0.5rem",
                                borderBottom: "1px solid #F2F4F7",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Inter",
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  lineHeight: "1.25rem",
                                  color: "#101828",
                                }}
                              >
                                Enrichment Panel
                              </Typography>
                              <Chip
                                label={`${
                                  enrichment_bydate_multi_filter?.length || 0
                                } Active`}
                                size="small"
                                sx={{
                                  backgroundColor: "#F0FDF4",
                                  color: "#065F46",
                                  fontSize: "0.625rem",
                                  fontWeight: 500,
                                  height: "18px",
                                  border: "1px solid #10B981",
                                }}
                              />
                            </Box>

                            {/* Enrichment Form - Compact */}
                            <Stack spacing={0.5}>
                              {/* Date Range Row */}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.75,
                                  width: "100%",
                                }}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <CustomDatePicker
                                    showLabel
                                    label="Start Date"
                                    selectedValue={startDate}
                                    setSelectedValue={setStartDate}
                                    labelSx={{
                                      fontSize: "0.6875rem",
                                      fontWeight: 500,
                                      color: "#374151",
                                      fontFamily: "Inter",
                                    }}
                                    sx={{
                                      "& .MuiInputBase-root": {
                                        height: "35px",
                                        fontSize: "0.6875rem",
                                      },
                                      "& .MuiInputBase-input": {
                                        fontSize: "0.6875rem",
                                        padding: "6px 8px",
                                      },
                                    }}
                                  />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <CustomDatePicker
                                    showLabel
                                    label="End Date"
                                    selectedValue={endDate}
                                    setSelectedValue={setEndDate}
                                    labelSx={{
                                      fontSize: "0.6875rem",
                                      fontWeight: 500,
                                      color: "#374151",
                                      fontFamily: "Inter",
                                    }}
                                    sx={{
                                      "& .MuiInputBase-root": {
                                        height: "35px",
                                        fontSize: "0.6875rem",
                                      },
                                      "& .MuiInputBase-input": {
                                        fontSize: "0.6875rem",
                                        padding: "6px 8px",
                                      },
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* Enrichment Type and Value Row */}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.75,
                                  width: "100%",
                                }}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <CustomAutocomplete
                                    showLabel
                                    placeholder="Type"
                                    label="Enrichment Type"
                                    values={[
                                      "uplift",
                                      "upper_bound",
                                      "lower_bound",
                                      "offset",
                                      "P10",
                                      "P20",
                                      "P30",
                                      "P40",
                                      "P50",
                                      "P60",
                                      "P70",
                                      "P80",
                                      "P90",
                                      "P99",
                                    ]}
                                    isMultiSelect={false}
                                    selectedValues={enrichmentType}
                                    setSelectedValues={setEnrichmentType}
                                    disableClearable
                                    labelSx={{
                                      fontSize: "0.6875rem",
                                      fontWeight: 500,
                                      color: "#374151",
                                      fontFamily: "Inter",
                                    }}
                                    sx={{
                                      "& .MuiInputBase-root": {
                                        height: "35px",
                                        fontSize: "0.6875rem",
                                      },
                                    }}
                                  />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <CustomCounter
                                    disabled={enrichmentType !== "uplift"}
                                    showLabel
                                    placeholder="Value"
                                    label="Percentage"
                                    value={enrichmentValue}
                                    setValue={setEnrichmentValue}
                                    maxRange={maxRange}
                                    minRange={minRange}
                                    labelSx={{
                                      fontSize: "0.6875rem",
                                      fontWeight: 500,
                                      color: "#374151",
                                      fontFamily: "Inter",
                                      marginBottom: "0.25rem",
                                    }}
                                    containerSx={{
                                      height: "35px",
                                    }}
                                    sx={{
                                      "& .MuiInputBase-root": {
                                        height: "32px",
                                        fontSize: "0.6875rem",
                                      },
                                      "& .MuiInputBase-input": {
                                        fontSize: "0.6875rem",
                                      },
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* Add Button */}
                              <Button
                                onClick={async () => {
                                  const filterDataMultiFilter =
                                    tablesFilterData[`${fileNameDefault}`]
                                      ?.Default?.filterData?.dimensionFilters;

                                  const formatDateToString = (date) => {
                                    if (!date)
                                      return new Date()
                                        .toISOString()
                                        .split("T")[0];
                                    if (typeof date === "string")
                                      return date.split("T")[0];
                                    if (date instanceof Date)
                                      return date.toISOString().split("T")[0];
                                    if (
                                      date &&
                                      typeof date.format === "function"
                                    )
                                      return date.format("YYYY-MM-DD");
                                    try {
                                      return new Date(date)
                                        .toISOString()
                                        .split("T")[0];
                                    } catch (error) {
                                      console.warn(
                                        "Could not format date:",
                                        date,
                                        error
                                      );
                                      return new Date()
                                        .toISOString()
                                        .split("T")[0];
                                    }
                                  };

                                  const enrichmentObj = {
                                    selectors: filterDataMultiFilter,
                                    date_range: [
                                      formatDateToString(startDate),
                                      formatDateToString(endDate),
                                    ],
                                    enrichment_type: enrichmentType,
                                    enrichment_value: enrichmentValue || 0,
                                  };

                                  console.log(
                                    "Enrichment object:",
                                    enrichmentObj
                                  );
                                  await addEnrichmentMultiFilter(enrichmentObj);
                                }}
                                variant="contained"
                                startIcon={
                                  <AddIcon sx={{ fontSize: "14px" }} />
                                }
                                sx={{
                                  backgroundColor: "#10B981",
                                  color: "white",
                                  fontFamily: "Inter",
                                  fontSize: "0.625rem",
                                  fontWeight: 500,
                                  textTransform: "none",
                                  borderRadius: "6px",
                                  boxShadow:
                                    "0px 1px 2px rgba(16, 185, 129, 0.2)",
                                  height: "32px",
                                  "&:hover": {
                                    backgroundColor: "#059669",
                                    boxShadow:
                                      "0px 2px 4px rgba(16, 185, 129, 0.3)",
                                  },
                                }}
                              >
                                Add Enrichment
                              </Button>
                            </Stack>

                            {/* Active Enrichments - Scrollable */}
                            <Box
                              sx={{
                                flex: 1,
                                overflow: "auto",
                                backgroundColor: "#FAFAFA",
                                borderRadius: "6px",
                                border: "1px solid #EAECF0",
                                padding: "0.375rem",
                                minHeight: "60px",
                                "&::-webkit-scrollbar": {
                                  width: "4px",
                                },
                                "&::-webkit-scrollbar-track": {
                                  backgroundColor: "#F9FAFB",
                                  borderRadius: "2px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                  backgroundColor: "#D0D5DD",
                                  borderRadius: "2px",
                                  "&:hover": {
                                    backgroundColor: "#98A2B3",
                                  },
                                },
                              }}
                            >
                              {enrichment_bydate_multi_filter &&
                              enrichment_bydate_multi_filter.length > 0 ? (
                                <Stack spacing={0.375}>
                                  {enrichment_bydate_multi_filter.map(
                                    (enrichment, index) => {
                                      // Build tooltip content from selectors
                                      const tooltipContent = Object.entries(
                                        enrichment.selectors || {}
                                      )
                                        .map(
                                          ([dimension, values]) =>
                                            `${dimension}: ${values.join(", ")}`
                                        )
                                        .join("\n");

                                      return (
                                        <CustomTooltip
                                          key={index}
                                          title={
                                            <Box>
                                              {Object.entries(
                                                enrichment.selectors || {}
                                              ).map(([dimension, values]) => (
                                                <Typography
                                                  key={dimension}
                                                  sx={{ fontSize: "0.625rem" }}
                                                >
                                                  <strong>{dimension}</strong>:{" "}
                                                  {values.join(", ")}
                                                </Typography>
                                              ))}
                                            </Box>
                                          }
                                          arrow
                                          placement="top"
                                        >
                                          <Box
                                            sx={{
                                              backgroundColor: "#FFFFFF",
                                              border: "1px solid #EAECF0",
                                              borderRadius: "6px",
                                              padding: "0.5rem",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              "&:hover": {
                                                borderColor: "#10B981",
                                                transform: "translateX(1px)",
                                                boxShadow:
                                                  "0px 1px 3px -1px rgba(16, 185, 129, 0.1)",
                                              },
                                              transition:
                                                "all 0.15s ease-in-out",
                                            }}
                                          >
                                            <Stack spacing={0.25} flex={1}>
                                              <Typography
                                                sx={{
                                                  fontSize: "0.6875rem",
                                                  fontWeight: 600,
                                                  color: "#344054",
                                                  lineHeight: 1.2,
                                                }}
                                              >
                                                {enrichment.enrichment_type}:{" "}
                                                {enrichment.enrichment_type ===
                                                  "uplift" &&
                                                  `${enrichment.enrichment_value}%`}
                                              </Typography>
                                              <Typography
                                                sx={{
                                                  fontSize: "0.5625rem",
                                                  color: "#9CA3AF",
                                                  fontWeight: 400,
                                                }}
                                              >
                                                {enrichment.date_range[0]} -{" "}
                                                {enrichment.date_range[1]}
                                              </Typography>
                                            </Stack>
                                            <IconButton
                                              onClick={() =>
                                                removeEnrichmentMultiFilter(
                                                  index
                                                )
                                              }
                                              size="small"
                                              sx={{
                                                padding: "2px",
                                                color: "#6B7280",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "4px",
                                                marginLeft: "0.375rem",
                                                width: "20px",
                                                height: "20px",
                                                "&:hover": {
                                                  backgroundColor: "#FEF2F2",
                                                  borderColor: "#FECACA",
                                                  color: "#DC2626",
                                                },
                                                transition:
                                                  "all 0.15s ease-in-out",
                                              }}
                                            >
                                              <CloseIcon
                                                sx={{ fontSize: "12px" }}
                                              />
                                            </IconButton>
                                          </Box>
                                        </CustomTooltip>
                                      );
                                    }
                                  )}
                                </Stack>
                              ) : (
                                // your "no enrichments" empty state remains same
                                <Stack
                                  alignItems="center"
                                  justifyContent="center"
                                  sx={{ height: "100%", minHeight: "60px" }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: "0.375rem",
                                      color: "#9CA3AF",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "0.6875rem",
                                        fontWeight: 500,
                                        color: "#6B7280",
                                        textAlign: "center",
                                      }}
                                    >
                                      No enrichments created yet
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.5625rem",
                                        fontWeight: 400,
                                        color: "#9CA3AF",
                                        textAlign: "center",
                                      }}
                                    >
                                      Add enrichments to modify data
                                    </Typography>
                                  </Box>
                                </Stack>
                              )}
                            </Box>
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>

            {/* Show skeleton while loading for Tab 0 */}

            <CustomTable
              title="Demand Alignment Report"
              valueFileTitle={
                experiment_config.scenario_plan.pricing_constraints.price !==
                  "None" &&
                experiment_config.scenario_plan.pricing_constraints.price !==
                  null
                  ? "Demand Alignment Value Report"
                  : null
              }
              //data={newData}
              isEditable
              isEditableColumn={isEditableColumn}
              getTimeStamp={getTimeStamp}
              oc_path="scenario_planning/K_best/forecast/original_demand_alignment_report.csv"
              enableFileUpload
              enableAggregation={
                experiment_config.scenario_plan?.demand_alignment_report
                  ?.enable_aggregation ?? false
              }
              isRevenue={viewMode === "revenue"}
              multiDownloadFiles={multiDownloadFiles}
              showAlternate={tableViewMode === "planner"}
              alternateTitle={
                viewMode === "revenue" ? "Planner View Value" : "Planner View"
              }
              viewMode={tableViewMode}
              setViewMode={setTableViewMode}
              isPlannerData={isPlannerData}
              dataColumn={dataColumn}
            />

            {/* Removed the Next button Stack */}
          </TabPanel>
        )}
        {view1Data && (
          <TabPanel sx={{ padding: "1px 0px" }} value="1">
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Grid item xs={12} md={12}>
                  {isUpdatedData && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <ViewModeToggle
                        viewMode={viewModeView1}
                        setViewMode={setViewModeView1}
                      />
                    </Box>
                  )}
                </Grid>
                <Stack padding="0px 12px 0px 12px" spacing={2}>
                  <Stack spacing={"2rem"}>
                    {/* Main Content Container - Side by Side Layout */}

                    <Grid container spacing={1}>
                      {/* Filters Section */}

                      <Grid item xs={12} lg={3.2} xl={3}>
                        <Box>
                          {(filtersApplied.length +
                            SnOPDimensionsToFilterView1.length >
                            0 ||
                            showDimensionSettingsView1 ||
                            RiskColumn) && (
                            <Stack spacing={"1rem"}>
                              <Stack
                                spacing={1}
                                sx={{
                                  border: "1px solid #D0D5DD",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  height: "450px", // Fixed height to match chart
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{
                                      flex: 1,
                                      overflow: "hidden",
                                      marginRight: "0.2rem",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Inter",
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: "#101828",
                                        textAlign: "left",
                                        lineHeight: "30px",
                                      }}
                                    >
                                      Filters
                                    </Typography>

                                    {/* Settings Icon with Tooltip */}
                                    <Tooltip title="Configure filter dimensions">
                                      <IconButton
                                        onClick={() =>
                                          setShowDimensionSettingsView1(
                                            !showDimensionSettingsView1
                                          )
                                        }
                                        sx={{
                                          padding: "0px",
                                          color: "#0C66E4",
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(99, 102, 241, 0.04)",
                                          },
                                        }}
                                      >
                                        <SettingsIcon
                                          sx={{ fontSize: "18px" }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                  <Stack direction={"row"} spacing={1}>
                                    {filtersApplied.length > 0 && (
                                      <Tooltip title="Remove all filters">
                                        <IconButton
                                          onClick={async () => {
                                            await clearFilters(
                                              `${fileName}`,
                                              reportName,
                                              "Default"
                                            );
                                            await clearFilters(
                                              `${valueFileName}`,
                                              reportNameValue,
                                              "Default"
                                            );

                                            await executeParallelApiCalls("1");

                                            setAutoCompleteKey(
                                              (prevKey) => prevKey + 1
                                            );
                                          }}
                                          sx={{
                                            padding: "8px",
                                            color: "#DC2626",
                                            backgroundColor: "#FEF2F2",
                                            border: "1px solid #FECACA",
                                            borderRadius: "6px",
                                            flexShrink: 0,
                                            "&:hover": {
                                              backgroundColor: "#FEE2E2",
                                              borderColor: "#FCA5A5",
                                            },
                                          }}
                                        >
                                          <FilterAltOffIcon
                                            sx={{ fontSize: "18px" }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                    )}

                                    <Box
                                      sx={{
                                        position: "relative",
                                        display: "inline-block",
                                      }}
                                    >
                                      <Tooltip
                                        title={
                                          checkFiltersMatchSet(
                                            filtersApplied,
                                            filterData
                                          )
                                            ? "No new filters to apply"
                                            : "Click to apply updated filters"
                                        }
                                        arrow
                                      >
                                        <span>
                                          <CustomButton
                                            title="Apply Filter"
                                            outlined
                                            disabled={checkFiltersMatchSet(
                                              filtersApplied,
                                              filterData
                                            )}
                                            onClick={async () => {
                                              await applyFilter(
                                                `${fileName}`,
                                                reportName,
                                                "Default"
                                              );
                                              await applyFilter(
                                                `${valueFileName}`,
                                                reportNameValue,
                                                "Default"
                                              );
                                            }}
                                          />
                                        </span>
                                      </Tooltip>
                                    </Box>
                                  </Stack>
                                </Stack>

                                {/* Collapsible Dimension Settings */}
                                <Collapse in={showDimensionSettingsView1}>
                                  <Stack
                                    spacing={2}
                                    sx={{
                                      pt: 1,
                                      borderTop: "1px solid #E4E7EC",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Inter",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#475467",
                                      }}
                                    >
                                      Filter Configuration
                                    </Typography>
                                    <CustomAutocomplete
                                      label={"Choose Dimensions to Filter"}
                                      showLabel
                                      isMultiSelect
                                      selectedValues={
                                        SnOPDimensionsToFilterView1
                                      }
                                      setSelectedValues={
                                        setSnOPDimensionsToFilterView1
                                      }
                                      values={Object?.keys(
                                        InvPriceFilterData
                                      )?.filter((value) =>
                                        Object.keys(view1Data).includes(
                                          convert(value)
                                        )
                                      )}
                                      placeholder={`Select dimensions to filter...`}
                                    />
                                  </Stack>
                                </Collapse>

                                {/* Filter Dimensions - Scrollable Container */}
                                {(RiskColumn ||
                                  SnOPDimensionsToFilterView1.length > 0) && (
                                  <Box
                                    sx={{
                                      pt: 1,
                                      flex: 1, // Takes remaining space in the container
                                      overflowY: "auto",
                                      maxHeight: "350px", // Adjust based on available space
                                      pr: "4px", // Small padding for scrollbar
                                    }}
                                  >
                                    <Stack spacing={2}>
                                      {/* Regular Filter Dimensions */}
                                      {SnOPDimensionsToFilterView1.map(
                                        (dimension, index) => (
                                          <CustomAutocomplete
                                            key={`${dimension}-${filtersApplied.length}`}
                                            label={dimension}
                                            showLabel
                                            isMultiSelect
                                            target={"filter"}
                                            path={convert(dimension)}
                                            values={(() => {
                                              const originalValues =
                                                filterOptions.dimensions[
                                                  dimension
                                                ] || [];
                                              const availableValues =
                                                parallelApiResultsView1[
                                                  convert(dimension)
                                                ] || [];

                                              if (
                                                !parallelApiResultsView1 ||
                                                Object.keys(
                                                  parallelApiResultsView1
                                                ).length === 0
                                              ) {
                                                return originalValues;
                                              }

                                              return originalValues.filter(
                                                (value) =>
                                                  availableValues.includes(
                                                    value
                                                  )
                                              );
                                            })()}
                                            placeholder={`Select filters for ${dimension}...`}
                                          />
                                        )
                                      )}

                                      {/* Risk Columns */}
                                      {RiskColumn && (
                                        <>
                                          <CustomAutocomplete
                                            label={"Risk & Opportunity Tenure"}
                                            disableClearable
                                            showLabel
                                            selectedValues={RiskColumn}
                                            setSelectedValues={setRiskColumn}
                                            values={Object.keys(
                                              view1Data || {}
                                            ).filter((value) =>
                                              value.startsWith("Risk_")
                                            )}
                                            placeholder={`Select risk column...`}
                                            labelColor="#D97706"
                                          />
                                          <CustomAutocomplete
                                            disableClearable
                                            key={filtersApplied.length}
                                            label={"Risk & Opportunity Segment"}
                                            showLabel
                                            target={"filter"}
                                            path={convert(RiskColumn)}
                                            values={
                                              filterOptions.dimensions[
                                                RiskColumn
                                              ]
                                            }
                                            placeholder={`Select filters for ${RiskColumn}...`}
                                            defaultValueByUser="all"
                                            labelColor="#D97706"
                                          />
                                        </>
                                      )}
                                    </Stack>
                                  </Box>
                                )}

                                {/* Applied Filters at Bottom */}
                                {filtersApplied.length > 0 && (
                                  <Stack
                                    spacing={1}
                                    sx={{
                                      pt: 1,
                                      borderTop: "1px solid #E4E7EC",
                                      marginTop: "auto", // Push to bottom
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: "Inter",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        color: "#6B7280",
                                      }}
                                    >
                                      Applied Filters:
                                    </Typography>
                                    <Stack
                                      direction="row"
                                      spacing={0.5}
                                      sx={{
                                        overflowX: "auto",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {filtersApplied.map((filter, index) => (
                                        <Chip
                                          label={filter}
                                          key={index}
                                          sx={{
                                            padding: "0px 6px 0px 8px",
                                            backgroundColor: "#F2F4F7",
                                            fontFamily: "Inter",
                                            fontWeight: 500,
                                            fontSize: "12px",
                                            lineHeight: "16px",
                                            color: "#344054",
                                            "& .MuiChip-deleteIcon": {
                                              color: "#344054",
                                            },
                                          }}
                                        />
                                      ))}
                                    </Stack>
                                  </Stack>
                                )}
                              </Stack>
                            </Stack>
                          )}
                        </Box>
                      </Grid>

                      {/* Chart Section */}
                      <Grid item xs={12} lg={8.8} xl={9}>
                        <Box
                          sx={{
                            border: "1px solid #E4E7EC",
                            borderRadius: "8px",
                            height: "450px", // Same fixed height as filter container
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {view1ViewGraphData &&
                          Object.keys(view1ViewGraphData).length > 0 ? (
                            <Box sx={{ width: "100%", height: "100%" }}>
                              <ForecastChart data={view1ViewGraphData} />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                p: 3, // Padding for the skeleton content
                                backgroundColor: "#FAFBFC",
                              }}
                            >
                              {/* Chart Header Skeleton */}
                              <Box sx={{ mb: 3 }}>
                                <Skeleton
                                  variant="text"
                                  width="40%"
                                  height={32}
                                  sx={{ mb: 1 }}
                                />
                                <Skeleton
                                  variant="text"
                                  width="25%"
                                  height={20}
                                />
                              </Box>

                              {/* Chart Area Skeleton */}
                              <Box
                                sx={{
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {/* Main chart skeleton */}
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "end",
                                    gap: 2,
                                    mb: 2,
                                  }}
                                >
                                  {/* Y-axis labels */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                      height: "100%",
                                      justifyContent: "space-between",
                                      width: 40,
                                    }}
                                  >
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                      <Skeleton
                                        key={i}
                                        variant="text"
                                        width={30}
                                        height={16}
                                      />
                                    ))}
                                  </Box>

                                  {/* Chart area with grid and lines */}
                                  <Box
                                    sx={{
                                      flex: 1,
                                      height: "100%",
                                      position: "relative",
                                      backgroundColor: "white",
                                      borderRadius: 1,
                                    }}
                                  >
                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          position: "absolute",
                                          left: 0,
                                          right: 0,
                                          top: `${i * 20}%`,
                                          height: "1px",
                                          backgroundColor: "#F0F0F0",
                                        }}
                                      />
                                    ))}

                                    {/* Animated chart lines */}
                                    <svg
                                      width="100%"
                                      height="100%"
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                      }}
                                    >
                                      <path
                                        d="M0,60% Q25%,20% 50%,40% T100%,30%"
                                        stroke="#6366F1"
                                        strokeWidth="2"
                                        fill="none"
                                        style={{
                                          strokeDasharray: "1000",
                                          strokeDashoffset: "1000",
                                          animation:
                                            "drawLine 3s ease-in-out infinite",
                                        }}
                                      />
                                      <path
                                        d="M0,70% Q25%,80% 50%,60% T100%,50%"
                                        stroke="#8B5CF6"
                                        strokeWidth="2"
                                        fill="none"
                                        style={{
                                          strokeDasharray: "1000",
                                          strokeDashoffset: "1000",
                                          animation:
                                            "drawLine 3s ease-in-out 0.5s infinite",
                                        }}
                                      />
                                      <style>
                                        {`
                    @keyframes drawLine {
                      0%, 100% { stroke-dashoffset: 1000; }
                      50% { stroke-dashoffset: 0; }
                    }
                  `}
                                      </style>
                                    </svg>
                                  </Box>
                                </Box>

                                {/* X-axis labels */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    ml: 5,
                                  }}
                                >
                                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton
                                      key={i}
                                      variant="text"
                                      width={50}
                                      height={16}
                                    />
                                  ))}
                                </Box>
                              </Box>

                              {/* Loading text */}
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>

            <CustomTable
              title="Demand Alignment View1 Report"
              valueFileTitle={
                experiment_config.scenario_plan.pricing_constraints.price !==
                  "None" &&
                experiment_config.scenario_plan.pricing_constraints.price !==
                  null
                  ? "Demand Alignment Value View1 Report"
                  : null
              }
              multiDownloadFiles={dimensionAccuracyReportsView1}
              isRevenue={viewModeView1 === "revenue"}
              oc_path="scenario_planning/K_best/forecast/original_demand_alignment_report.csv"
              enableAggregation={
                experiment_config.scenario_plan?.demand_alignment_report
                  ?.enable_aggregation ?? false
              }
            />
          </TabPanel>
        )}
      </TabContext>
    </Box>
  );
};

export default SnOPPlanningScreen;
