import React, { useCallback } from "react";
import {
  Skeleton,
  Stack,
  Box,
  Typography,
  Grid,
  CardContent,
  Card,
  FormControlLabel,
  Checkbox,
   IconButton,
  Popover,
 
  Paper,
} from "@mui/material";
import CustomButton from "../../../../components/CustomButton";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";

import InfoIcon from "@mui/icons-material/Info";
import { ReactComponent as DataSet } from "../../../../assets/Icons/DataSet.svg";

import { useState } from "react";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import useDashboard from "../../../../hooks/useDashboard";
import { demandForecastingCards } from "./FocusView/ExecutiveCards";
import CustomTable from "../../../../components/TanStackCustomTable";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useEffect } from "react";
import ForecastingPivot from "./ForecastingPivot";
import useExperiment from "../../../../hooks/useExperiment";
import NMetricCard from "../../../../components/Metric Cards/NMetricCard";
import useAuth from "../../../../hooks/useAuth";
import {
  ConstructionOutlined,
  KeyboardDoubleArrowDown,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { last } from "lodash";
import EnrichmentBox from "./EnrichmentBox";
import useConfig from "../../../../hooks/useConfig";
import { parallelChunkMap } from "../../../../utils/parallelChunkMap";
import { downloadParquetFileUsingPreSignedURL } from "../../../../redux/actions/dashboardActions";
import SimpleTable from "../../../../components/SimpleTable";
import TablePopoverButton from "../../../../components/TablePopoverButton";
const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
  whiteSpace: "pre-line",
};

const contentStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
};

const BoxComponent = ({ data }) => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        // boxShadow: "none",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0,
        },
        "& .MuiCardContent-root": {
          paddingBottom: "0px",
        },
        boxShadow: "0px 2px 2px #1018280D",

        // "&:hover": {
        //   boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        //   transform: "translateY(-2px)",
        //   transition: "all 0.3s ease-in-out",
        // },
      }}
    >
      <NMetricCard data={data} />
    </Card>
  );
};
// Helper function to format the date with suffix
const formatDateWithSuffix = (dateString) => {
  // Normalize the date string to 'YYYY-MM-DD' using regex
  const normalizeDateString = (dateStr) => {
    // Match the most common formats (YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY)
    let normalizedDateStr = dateStr;

    // Check if it's in 'YYYY-DD-MM' format (swap to 'YYYY-MM-DD')
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split("-");
      if (parseInt(parts[1], 10) > 12) {
        // Swap day and month if day is > 12 (meaning it's DD-MM instead of MM-DD)
        normalizedDateStr = `${parts[0]}-${parts[2]}-${parts[1]}`;
      }
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      // Convert 'DD-MM-YYYY' or 'MM-DD-YYYY' to 'YYYY-MM-DD'
      const parts = dateStr.split("-");
      if (parseInt(parts[1], 10) > 12) {
        // It's in 'DD-MM-YYYY' format
        normalizedDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        // It's in 'MM-DD-YYYY' format
        normalizedDateStr = `${parts[2]}-${parts[0]}-${parts[1]}`;
      }
    }

    return normalizedDateStr;
  };

  const normalizedDate = normalizeDateString(dateString);
  const date = new Date(normalizedDate);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Handle invalid date
  }

  const day = date.getDate();
  // Get the month in 3-letter format like 'Jan', 'Feb'
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  // Function to determine the ordinal suffix
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th"; // handles 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};



// const TablePopoverButton = ({ title, filePath }) => {
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const open = Boolean(anchorEl);
//   const id = open ? "table-popover" : undefined;

//   return (
//     <>
      
//         <IconButton
//           size="small"
//           onClick={handleClick}
//           sx={{
//             color: "primary.main",
//             "&:hover": {
//               backgroundColor: "rgba(25, 118, 210, 0.04)",
//             },
//           }}
//         >
//           <InfoIcon fontSize="small" />
//         </IconButton>
     

//       Hello

//       <Popover
//         id={id}
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handleClose}
//         anchorOrigin={{
//           vertical: "bottom",
//           horizontal: "center",
//         }}
//         transformOrigin={{
//           vertical: "top",
//           horizontal: "center",
//         }}
//         PaperProps={{
//           sx: {
//             width: "80vw",
//             maxWidth: "1200px",
//             maxHeight: "70vh",
//             overflow: "hidden",
//           },
//         }}
//       >
//         <Box sx={{ p: 2 }}>
//           <Typography variant="h6" gutterBottom>
//             {title}
//           </Typography>
//           <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
//             <SimpleTable title={title} filePath={filePath} />
//           </Box>
//         </Box>
//       </Popover>
//     </>
//   );
// };

// Helper function to calculate future accuracy
const calculateFutureAccuracy = (data) => {
  // Filter data
  const metricsDataFuture = data.filter(
    (entry) => entry.split === "future" && entry.date_rank === 1.0
  );

  // Calculate future accuracy
  const totalTsActual = metricsDataFuture.reduce(
    (sum, entry) => sum + entry.ts_actual,
    0
  );
  const totalTsError = metricsDataFuture.reduce(
    (sum, entry) => sum + Math.abs(entry.ts_error),
    0
  );

  return 1 - totalTsError / totalTsActual;
};

// Helper function to calculate number of weeks between two dates
const calculateDateDifference = (startDate, endDate, frequency) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid Date(s)";
  }

  // Calculate the time difference in milliseconds
  const diffTime = Math.abs(end - start);
  console.log("Fre1: " + frequency);
  switch (frequency) {
    case "Weeks":
      return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)); // Weeks
    case "Days":
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
    case "Months":
      console.log(
        "123456",
        (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth())
      );
      return (
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth())
      ); // Months
    case "Quarters":
      return Math.floor(
        ((end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth())) /
          3
      ); // Quarters (3 months)
    case "Years":
      return end.getFullYear() - start.getFullYear(); // Years
    case "Hour":
      return Math.floor(diffTime / (1000 * 60 * 60)); // Hours
    case "30 minute":
      return Math.floor(diffTime / (1000 * 60 * 30)); // 30-minute intervals
    case "15 minute":
      return Math.floor(diffTime / (1000 * 60 * 15)); // 15-minute intervals
    case "10 minute":
      return Math.floor(diffTime / (1000 * 60 * 10)); // 15-minute intervals
    case "5 minute":
      return Math.floor(diffTime / (1000 * 60 * 5)); // 15-minute intervals
    default:
      return "Invalid Frequency"; // If frequency is not recognized
  }
};

// // Helper function to increment a date by one day
const incrementDateByOneDay = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
};

const formatToPercent = (numberStr) => {
  // Convert string to number
  const value = parseFloat(numberStr);

  // Determine if value is a fraction or already a percentage
  // const percentageValue = value<1?value*100:value;
  const percentageValue = value;

  // Format the percentage value
  return new Intl.NumberFormat("default", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
    .format(percentageValue / 100)
    .toString();
};

const get_metrics = (
  data,
  dateColumn,
  frequency,
  executiveViewData,
  showFutureActuals,
  rawSalesData,
  currency
) => {
  console.log("Fre: ", frequency);
  if (!data.hasOwnProperty("error")) {
    data["error"] = data.pred.map((value, index) =>
      Math.abs(parseFloat(value) - parseFloat(data.actual[index]))
    );
  }
  const isNew = rawSalesData !== null && rawSalesData !== undefined;
  console.log("isNew", isNew);
  if (!data.hasOwnProperty("ly_actual")) {
    data["ly_actual"] = ["actual"];
  }

  if (!data.hasOwnProperty("date_rank")) {
    data["date_rank"] = 1.0;
    data["ts_actual"] = data["actual"];
    data["ts_pred"] = data["pred"];
    data["ts_error"] = data["error"];
  }

  const graphData = extractKeys(data, dateColumn);

  // Extract Validation Period
  let testEntries = graphData.filter((entry) => entry.split === "test");
  const trainEntries = graphData.filter((entry) => entry.split === "train");
  if (trainEntries.length > 0) {
    // Add the last entry of testEntries as the first entry in forecastEntries
    const lastTrainEntry = trainEntries[trainEntries.length - 1];
    testEntries = [lastTrainEntry, ...testEntries];
  }

  let Validation_Period = null;
  if (testEntries.length > 0) {
    const originalStartDate = testEntries[0][dateColumn];
    const startDate = formatDateWithSuffix(
      incrementDateByOneDay(originalStartDate)
    );
    const endDate = formatDateWithSuffix(
      testEntries[testEntries.length - 1][dateColumn]
    );
    Validation_Period = `${startDate} - ${endDate}`;
  }

  // Extract Forecast Horizon
  let forecastEntries = graphData.filter((entry) => entry.split === "future");

  if (testEntries.length > 0) {
    // Add the last entry of testEntries as the first entry in forecastEntries
    const lastTestEntry = testEntries[testEntries.length - 1];
    forecastEntries = [lastTestEntry, ...forecastEntries];
  }
  let Forecast_Period = null;
  let Forecast_Horizon = null;
  if (forecastEntries.length > 0) {
    const originalStartDate = forecastEntries[0][dateColumn];
    const startDate = formatDateWithSuffix(
      incrementDateByOneDay(originalStartDate)
    );
    const endDate = formatDateWithSuffix(
      forecastEntries[forecastEntries.length - 1][dateColumn]
    );
    Forecast_Horizon = calculateDateDifference(
      forecastEntries[0][dateColumn],
      forecastEntries[forecastEntries.length - 1][dateColumn],
      frequency
    );
    console.log("Forecast_Horizon", Forecast_Horizon);
    Forecast_Period = `${startDate} - ${endDate} (${Forecast_Horizon} ${frequency})`;
  }

  const lastCardBottomMetricTitle = showFutureActuals
    ? "Future Accuracy"
    : "Total Combinations";
  const new_lastCardBottomMetricTitle = showFutureActuals
    ? "Future Accuracy"
    : "Forecast Period";

  let Future_Accuracy = null;
  if (showFutureActuals) Future_Accuracy = calculateFutureAccuracy(graphData);

  const lastCardBottomMetric = showFutureActuals
    ? formatToPercent(Future_Accuracy * 100)
    : executiveViewData.total_combinations;
  const new_lastCardBottomMetric = showFutureActuals
    ? formatToPercent(Future_Accuracy * 100)
    : Forecast_Period;

  let predicted_sales_ts = 0;
  let predicted_sales_mean = 0;

  let actual_sales_ts = 0;

  let error_sales_ts = 0;

  // Check if 'date_rank' is in data columns
  if (data.hasOwnProperty("date_rank")) {
    const indices = data.split.reduce((acc, value, index) => {
      if (value === "test" && data.date_rank[index] === "1.0") {
        acc.push(index);
      }
      return acc;
    }, []);

    predicted_sales_ts = indices.reduce(
      (acc, index) => acc + parseFloat(data.ts_pred[index]),
      0
    );
    predicted_sales_mean =
      indices.reduce((acc, index) => acc + parseFloat(data.pred[index]), 0) /
      indices.length;

    actual_sales_ts = indices.reduce(
      (acc, index) => acc + parseFloat(data.ts_actual[index]),
      0
    );

    error_sales_ts = indices.reduce(
      (acc, index) => acc + parseFloat(data.ts_error[index]),
      0
    );
  }

  const future_indices = data.split.reduce((acc, value, index) => {
    if (value === "future") {
      acc.push(index);
    }
    return acc;
  }, []);

  // Calculate metrics for future split
  let predicted_sales_f = future_indices.reduce(
    (acc, index) => acc + parseFloat(data.pred[index]),
    0
  );
  let predicted_sales_f_mean = predicted_sales_f / future_indices.length;
  let actual_sales_ly = future_indices.reduce(
    (acc, index) => acc + parseFloat(data.ly_actual[index]),
    0
  );

  let predicted_sales_f_value;
  try {
    predicted_sales_f_value = future_indices.reduce(
      (acc, index) => acc + parseFloat(data.sales_value_by_amount_[index]),
      0
    );
  } catch (error) {
    predicted_sales_f_value = null;
  }

  let accuracy = (1 - error_sales_ts / actual_sales_ts) * 100;

  let bias =
    Math.abs((predicted_sales_ts - actual_sales_ts) / actual_sales_ts) * 100;
  // const overall_accuracy = (1 - Math.abs(bias))
  const overall_accuracy =
    (1 - Math.abs((predicted_sales_ts - actual_sales_ts) / actual_sales_ts)) *
    100;

  let latest_period_gap =
    ((predicted_sales_f_mean - predicted_sales_mean) / predicted_sales_mean) *
    100;

  let yoy = ((predicted_sales_f - actual_sales_ly) / actual_sales_ly) * 100;
  const currentGrowth = parseFloat(
    executiveViewData["Current_Growth%"]
  ).toFixed(2);
  if (!isNew) {
    return {
      predicted_sales_f,
      predicted_sales_f_mean,
      actual_sales_ly,
      predicted_sales_f_value,
      accuracy,
      bias,
      overall_accuracy,
      latest_period_gap,
      yoy,
      Validation_Period,
      Forecast_Period,
      lastCardBottomMetricTitle,
      lastCardBottomMetric,
      isNew,
      new_lastCardBottomMetric,
      new_lastCardBottomMetricTitle,
      currentGrowth,
      currency,
    };
  }
  const Forecast_Per_Day = Math.round(
    parseFloat(rawSalesData["Forecast_Per_Day"])
  );
  const sales_last30days = Math.round(
    parseFloat(rawSalesData["sales_last30days"])
  );
  const sales_last60days = Math.round(
    parseFloat(rawSalesData["sales_last60days"])
  );
  const sales_last90days = Math.round(
    parseFloat(rawSalesData["sales_last90days"])
  );
  const sales_value_last30days = Math.round(
    parseFloat(rawSalesData["sales_value_last30days"])
  );
  const sales_value_last60days = Math.round(
    parseFloat(rawSalesData["sales_value_last60days"])
  );
  const sales_value_last90days = Math.round(
    parseFloat(rawSalesData["sales_value_last90days"])
  );

  const Sales_Per_Day = Math.round(parseFloat(rawSalesData["Sales_Per_Day"]));

  return {
    predicted_sales_f,
    predicted_sales_f_mean,
    actual_sales_ly,
    predicted_sales_f_value,
    accuracy,
    bias,
    overall_accuracy,
    latest_period_gap,
    yoy,
    Validation_Period,
    Forecast_Period,
    lastCardBottomMetricTitle,
    lastCardBottomMetric,
    isNew,
    new_lastCardBottomMetric,
    new_lastCardBottomMetricTitle,
    currentGrowth,
    Forecast_Per_Day,
    sales_last30days,
    sales_last60days,
    sales_last90days,
    sales_value_last30days,
    sales_value_last60days,
    sales_value_last90days,
    Sales_Per_Day,
    currency,
  };
};

const extractKeys = (data, dateColumn) => {
  console.log("Input graph: ", data);
  const keysToExtract = Object.keys(data).filter(
    (key) => !["feature", "value"].includes(key)
  );
  console.log(keysToExtract);

  const length = data[keysToExtract[0]].length;

  const extractedData = [];

  for (let i = 0; i < length; i++) {
    const dataPoint = {};

    keysToExtract.forEach((key) => {
      if (data.hasOwnProperty(key)) {
        const value = data[key][i];

        const columnName = key;

        if (value !== null && value !== undefined) {
          // console.log(columnName,[dateColumn]);

          dataPoint[columnName] =
            key === dateColumn || columnName === "split"
              ? value
              : parseFloat(value, 10);
        }
      }
    });
    if (Object.keys(dataPoint).length > 0) {
      extractedData.push(dataPoint);
    }
  }
  console.log("extracted Data ", extractedData);

  // Return the extracted data
  return extractedData;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedLabel = format(parseISO(label), "MMM dd, yyyy");
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          padding: "5px",
          borderRadius: "5px",
        }}
      >
        <Typography
          sx={{
            color: "#626F86",
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "24px",
          }}
        >
          {formattedLabel}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            style={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "24px",
              color: "#344054",
            }}
          >
            {(entry.name !== "value" || entry.name !== "pred_upper_bound") && (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    backgroundColor: entry.color || "#000", // Use entry.color if available, fallback to black
                    borderRadius: "50%",
                    marginRight: "5px",
                  }}
                ></span>
                {entry.name}:{" "}
                {Number.isInteger(parseFloat(entry.value))
                  ? parseFloat(entry.value)
                  : parseFloat(entry.value).toFixed(4)}
              </>
            )}
          </Typography>
        ))}
      </div>
    );
  }
  return null;
};
const formatXAxis = (tickItem) => {
  return format(parseISO(tickItem), "MMM yyyy");
};

const CustomLegend = ({ dimensions }) => {
  const displayLabels = [];

  dimensions.forEach(({ label, color }) => {
    if (label === "pred") {
      displayLabels.push({ label: "pred", color });
      displayLabels.push({ label: "out_of_time_validation", color: "#ff7f0e" });
      displayLabels.push({ label: "actual", color: "#1f77b4" });
    } else {
      displayLabels.push({ label, color });
    }
  });

  return (
    <Box mt={2} display="flex" justifyContent="center">
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap" // Enables wrapping when content overflows
        justifyContent="flex-start"
      >
        {displayLabels.map(({ label, color }) => (
          <Stack
            key={label}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ marginBottom: "8px" }} // Adds a small margin to handle vertical spacing in wrap
          >
            <Box width={12} height={12} bgcolor={color} borderRadius="50%" />
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "24px",
                color: "#344054",
              }}
            >
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};
const createDomains = (data, dateColumn) => {
  return Object.keys(data).reduce((acc, key) => {
    if (key !== dateColumn) {
      acc[key] = { top: "dataMax", bottom: "dataMin" };
    }
    return acc;
  }, {});
};

function chunkArray(array, chunkSize) {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

function applyEnrichment(
  transformedData,
  enrichmentByDate,
  currentDimension,
  currentValue,
  dateColumn
) {
  return transformedData.map((item) => {
    let cumulativeForecast = item.ml_forecast; // Start with the initial forecast
    console.log("enrichmentByDate", enrichmentByDate);
    enrichmentByDate.forEach((enrich) => {
      const enrichmentType = enrich.enrichment_type;
      const startDate = new Date(enrich.date_range[0]);
      const endDate = new Date(enrich.date_range[1]);
      const itemDate = new Date(item[dateColumn]);

      // Check if the item's date falls within the enrichment date range
      if (itemDate >= startDate && itemDate <= endDate) {
        console.log(
          "condition2:",
          enrich.dimension === "None" ||
            (enrich.dimension === currentDimension &&
              enrich.value === currentValue)
        );
        if (
          enrich.dimension === "None" ||
          (enrich.dimension === currentDimension &&
            enrich.value === currentValue)
        ) {
          console.log("Enrichment Type::", enrichmentType);
          // Apply the uplift recursively
          const upliftAmount =
            (cumulativeForecast * enrich.enrichment_value) / 100;
          switch (enrichmentType) {
            case "uplift":
              cumulativeForecast += upliftAmount; // Update the forecast with the uplift
              break;
            case "upper_bound":
              console.log("cumulativeForecast Before::", cumulativeForecast);
              cumulativeForecast = item.pred_upper_bound;
              console.log("cumulativeForecast After::", cumulativeForecast);
              // Update the forecast with the upper bound
              break;
            case "lower_bound":
              cumulativeForecast = item.pred_lower_bound; // Update the forecast with the lower bound
              break;
            case "offset":
              cumulativeForecast = item.offset_forecast; // Update the forecast with the offset
              break;
            default:
              break;
          }
        } else {
          console.log("enrichment.dimension::", enrich.dimension);
          console.log("currentDimension::", currentDimension);
          console.log("enrich.value::", enrich.value);
          console.log("currentValue::", currentValue);
          console.log(
            "enrichment.dimension === currentDimension::",
            enrich.dimension === currentDimension
          );
          console.log(
            "enrich.value === currentValue::",
            enrich.value === currentValue
          );
          console.log(
            "enrichment.dimension === currentDimension && enrich.value === currentValue::",
            enrich.dimension === currentDimension &&
              enrich.value === currentValue
          );
        }
      }
    });

    // Set the final cumulative forecast to the enrichment_forecast

    item.enrichment_forecast = cumulativeForecast;

    return item;
  });
}

async function applyEnrichmentParallel(
  transformedData,
  enrichmentByDate,
  currentDimension,
  currentValue,
  dateColumn
) {
  const result = await parallelChunkMap(
    transformedData,
    (item) => {
      let cumulativeForecast = item.ml_forecast; // Start with the initial forecast
      // console.log("enrichmentByDate", enrichmentByDate);
      enrichmentByDate.forEach((enrich) => {
        const enrichmentType = enrich.enrichment_type;
        const startDate = new Date(enrich.date_range[0]);
        const endDate = new Date(enrich.date_range[1]);
        const itemDate = new Date(item[dateColumn]);

        // Check if the item's date falls within the enrichment date range
        if (itemDate >= startDate && itemDate <= endDate) {
          // console.log(
          //   "condition2:",
          //   enrich.dimension === "None" ||
          //     (enrich.dimension === currentDimension &&
          //       enrich.value === currentValue)
          // );
          if (
            enrich.dimension === "None" ||
            (enrich.dimension === currentDimension &&
              enrich.value === currentValue)
          ) {
            // console.log("Enrichment Type::", enrichmentType);
            // Apply the uplift recursively
            const upliftAmount =
              (cumulativeForecast * enrich.enrichment_value) / 100;
            switch (enrichmentType) {
              case "uplift":
                cumulativeForecast += upliftAmount; // Update the forecast with the uplift
                break;
              case "upper_bound":
                console.log("cumulativeForecast Before::", cumulativeForecast);
                cumulativeForecast = item.pred_upper_bound;
                console.log("cumulativeForecast After::", cumulativeForecast);
                // Update the forecast with the upper bound
                break;
              case "lower_bound":
                cumulativeForecast = item.pred_lower_bound; // Update the forecast with the lower bound
                break;
              case "offset":
                cumulativeForecast = item.offset_forecast; // Update the forecast with the offset
                break;
              default:
                break;
            }
          } else {
            // console.log("enrichment.dimension::", enrich.dimension);
            // console.log("currentDimension::", currentDimension);
            // console.log("enrich.value::", enrich.value);
            // console.log("currentValue::", currentValue);
            // console.log(
            //   "enrichment.dimension === currentDimension::",
            //   enrich.dimension === currentDimension
            // );
            // console.log(
            //   "enrich.value === currentValue::",
            //   enrich.value === currentValue
            // );
            // console.log(
            //   "enrichment.dimension === currentDimension && enrich.value === currentValue::",
            //   enrich.dimension === currentDimension &&
            //     enrich.value === currentValue
            // );
          }
        }
      });

      // Set the final cumulative forecast to the enrichment_forecast

      item.enrichment_forecast = cumulativeForecast;

      return item;
    },
    10
  );
  return result;
}

const get_graph_data = async (
  data,
  enrichment_bydate,
  currentDimension,
  currentValue,
  dateColumn
) => {
  const transformedData1 = [];
  // Find the last point in the "test" split
  let lastTestPoint;

  console.log(data);

  data.forEach((item) => {
    if (item.split === "test") {
      lastTestPoint = item;
    }
  });

  await parallelChunkMap(
    data,
    (item) => {
      let transformedItem;
      if (
        item.pred_lower_bound !== undefined &&
        item.pred_upper_bound !== undefined
      ) {
        transformedItem = {
          ...item,
          pred_lower_bound_range:
            item.split === "future" && item.pred_lower_bound !== 0
              ? [item.pred_lower_bound, item.pred]
              : undefined,
          pred_upper_bound_range:
            item.split === "future" && item.pred_upper_bound !== 0
              ? [item.pred_upper_bound, item.pred]
              : undefined,
          future_actual: item.split === "future" ? item.actual : undefined,
          actual:
            item.split !== "future" && item.actual > 0
              ? item.actual
              : undefined,
          ...(item.actual_raw !== undefined && {
            actual_raw:
              item.split !== "future" && item.actual_raw > 0
                ? item.actual_raw
                : undefined,
          }),
          pred: item.split === "future" ? item.pred : undefined,
          offset_forecast:
            item.split === "future" ? item.offset_forecast : undefined,
          ml_forecast: item.split === "future" ? item.ml_forecast : undefined,
          out_of_time_validation:
            item.split === "test" && item.pred !== undefined
              ? item.pred
              : item.out_of_time_validation,
        };
      } else {
        transformedItem = {
          ...item,
          future_actual:
            item.split === "future" && item.actual !== 0
              ? item.actual
              : undefined,
          actual:
            item.split !== "future" && item.actual > 0
              ? item.actual
              : undefined,
          ...(item.actual_raw !== undefined && {
            actual_raw:
              item.split !== "future" && item.actual_raw > 0
                ? item.actual_raw
                : undefined,
          }),
          pred: item.split === "future" ? item.pred : undefined,
          offset_forecast:
            item.split === "future" ? item.offset_forecast : undefined,
          ml_forecast: item.split === "future" ? item.ml_forecast : undefined,
          out_of_time_validation:
            item.split === "test" && item.pred !== undefined
              ? item.pred
              : item.out_of_time_validation,
        };
      }
      // Check if the current item is the last point in the "test" split
      if (item === lastTestPoint) {
        transformedItem.future_actual = transformedItem.actual;
        transformedItem.pred_lower_bound_range = [
          transformedItem.actual,
          transformedItem.actual,
        ];
        transformedItem.pred_upper_bound_range = [
          transformedItem.actual,
          transformedItem.actual,
        ];
      }

      transformedData1.push(transformedItem);
    },
    10
  );
  // data.forEach((item) => {
  //   let transformedItem;
  //   if (
  //     item.pred_lower_bound !== undefined &&
  //     item.pred_upper_bound !== undefined
  //   ) {
  //     transformedItem = {
  //       ...item,
  //       pred_lower_bound_range:
  //         item.split === "future" && item.pred_lower_bound !== 0
  //           ? [item.pred_lower_bound, item.pred]
  //           : undefined,
  //       pred_upper_bound_range:
  //         item.split === "future" && item.pred_upper_bound !== 0
  //           ? [item.pred_upper_bound, item.pred]
  //           : undefined,
  //       future_actual: item.split === "future" ? item.actual : undefined,
  //       actual:
  //         item.split !== "future" && item.actual > 0 ? item.actual : undefined,
  //       ...(item.actual_raw !== undefined && {
  //         actual_raw:
  //           item.split !== "future" && item.actual_raw > 0
  //             ? item.actual_raw
  //             : undefined,
  //       }),
  //       pred: item.split === "future" ? item.pred : undefined,
  //       offset_forecast:
  //         item.split === "future" ? item.offset_forecast : undefined,
  //       ml_forecast: item.split === "future" ? item.ml_forecast : undefined,
  //       out_of_time_validation:
  //         item.split === "test" && item.pred !== undefined
  //           ? item.pred
  //           : item.out_of_time_validation,
  //     };
  //   } else {
  //     transformedItem = {
  //       ...item,
  //       future_actual:
  //         item.split === "future" && item.actual !== 0
  //           ? item.actual
  //           : undefined,
  //       actual:
  //         item.split !== "future" && item.actual > 0 ? item.actual : undefined,
  //       ...(item.actual_raw !== undefined && {
  //         actual_raw:
  //           item.split !== "future" && item.actual_raw > 0
  //             ? item.actual_raw
  //             : undefined,
  //       }),
  //       pred: item.split === "future" ? item.pred : undefined,
  //       offset_forecast:
  //         item.split === "future" ? item.offset_forecast : undefined,
  //       ml_forecast: item.split === "future" ? item.ml_forecast : undefined,
  //       out_of_time_validation:
  //         item.split === "test" && item.pred !== undefined
  //           ? item.pred
  //           : item.out_of_time_validation,
  //     };
  //   }
  //   // Check if the current item is the last point in the "test" split
  //   if (item === lastTestPoint) {
  //     transformedItem.future_actual = transformedItem.actual;
  //     transformedItem.pred_lower_bound_range = [
  //       transformedItem.actual,
  //       transformedItem.actual,
  //     ];
  //     transformedItem.pred_upper_bound_range = [
  //       transformedItem.actual,
  //       transformedItem.actual,
  //     ];
  //   }

  //   transformedData1.push(transformedItem);
  // });
  // console.log("Enrichment By Date", enrichment_bydate);
  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
  };
  const enriched_data = await applyEnrichmentParallel(
    transformedData1,
    enrichment_bydate,
    convert(currentDimension),
    currentValue,
    dateColumn
  );
  console.log("Enriched Data", enriched_data);
  console.log("Transformed data5: ", transformedData1);
  return enriched_data;
};

const extractExecutiveData = (executiveViewData, currentValue) => {
  if (!executiveViewData) {
    return {};
  }

  console.log("Current Value", currentValue);

  const valueKey = "value";
  let valueIndex = -1;

  if (executiveViewData.hasOwnProperty(valueKey)) {
    valueIndex = executiveViewData[valueKey].indexOf(currentValue);
  }

  const extractedData = {};

  Object.keys(executiveViewData).forEach((key) => {
    extractedData[key] = executiveViewData[key][0] || "";
  });

  if (!extractedData.hasOwnProperty("Fill_rate")) {
    extractedData.Fill_rate = "NA";
  }
  console.log("extracted Data", extractedData);
  return extractedData;
};

const DashForecastSummary = () => {
  const {
    demandForecastingData,
    currentDimension,
    currentValue,
    currentStartDate,
    currentEndDate,
    setCurrentEndDate,
    setCurrentStartDate,
    setCurrentDimension,
    setCurrentValue,
    dimensionFilterData,
    forecastingPivotData,
    forecastingDisagg,
    applyDimensionFilters,
    loadExecutiveViewData,
    loadRawSalesData,
    rawSalesData,
    experimentBasePath,
    executiveViewData,
    setForecastingDisagg,
    showRawActuals,
    setShowRawActuals,
    showOffsetForecast,
    setShowOffsetForecast,
  } = useDashboard();
  const { userInfo, currentCompany } = useAuth();
  const { experiment_config, hasParquetFiles } = useExperiment();
  const frequencyDict = {
    W: "Weeks",
    M: "Months",
    Q: "Quarters",
    D: "Days",
    Y: "Year",
    H: "Hour",
    "30T": "30 minute",
    "15T": "15 minute",
    "10T": "10 minute",
    "5T": "5 minute",
  };
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
  };
  const fileNamePathDict = {
    "Forecasting Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    "Forecasting Pivot Disaggregated": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
  };
  const [loading, setLoading] = useState(false);
  const handleDownload = async (title) => {
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

    const fileName = fileNameDict[title];
    const filterData = {
      dimensionFilters: {},
      columnFilter: [],
      selectAllColumns: true,
    };
    const tokenPayload = {
      fileName,
      companyName: currentCompany.companyName,
      filterData,
    };

    const tokenPayloadForParquet = {
      filePath: fileNamePathDict[title],
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

      console.log("File download initiated :", tokenPayload);
    } catch (error) {
      console.error("Error during file download:", error);
    } finally {
      setLoading(false); // Set loading state to false when download finishes
    }
  };

  console.log("Demand Data: " + demandForecastingData);
  const dateColumn = experiment_config.data.timestamp_column;
  console.log(dateColumn);
  const [extractedExecutiveViewData, setExtractedExecutiveViewData] = useState(
    extractExecutiveData(executiveViewData, currentValue)
  );
  const currencyDict = {
    USD: "$",
    INR: "₹",
  };
  const forecast_data_pivot_fileName =
    `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");
  const forecast_data_value_pivot_filename =
    `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_value_pivot.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");
  const forecast_data_disaggregated_pivot_filename =
    `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");
  const {
    showFutureActuals,
    setShowFutureActuals,
    showMLForecast,
    setShowMLForecast,
    showEnrichForecast,
    setShowEnrichForecast,
    showPredictionInterval,
    setShowPredictionInterval,
    tablesFilterData,
    setFilterData,
    setForecastingPivotData,
  } = useDashboard();
  const { enrichment_bydate } = useConfig();
  const [transformedData, setTransformedData] = useState(
    get_metrics(
      demandForecastingData,
      dateColumn,
      frequencyDict[experiment_config.data.frequency],
      extractedExecutiveViewData,
      showFutureActuals,
      rawSalesData,
      experiment_config.scenario_plan.pricing_constraints.currency !==
        undefined &&
        experiment_config.scenario_plan.pricing_constraints.currency
        ? currencyDict[
            experiment_config.scenario_plan.pricing_constraints.currency
          ]
        : null
    )
  );
  console.log(transformedData);
  console.log(demandForecastingData);
  const [featureGraphData, setfeatureGraphData] = useState(
    extractKeys(demandForecastingData, dateColumn)
  );

  console.log(featureGraphData);

  const handleToggleFutureActuals = () => {
    setShowFutureActuals(!showFutureActuals);
  };
  const handleToggleMLForecast = () => {
    setShowMLForecast(!showMLForecast);
  };
  const handleToggleEnrichForecast = () => {
    setShowEnrichForecast(!showEnrichForecast);
  };
  const handleTogglePredictionInterval = () => {
    setShowPredictionInterval(!showPredictionInterval);
  };
  const handleToggleOffsetForecast = () => {
    setShowOffsetForecast(!showOffsetForecast);
  };
  console.log("Featuregraphdata", featureGraphData);
  const [data, setData] = useState(featureGraphData);
  useEffect(() => {
    const fetchGraphData = async () => {
      setData(
        await get_graph_data(
          data,
          enrichment_bydate,
          currentDimension,
          currentValue,
          dateColumn
        )
      );
    };
    fetchGraphData();
  }, [enrichment_bydate]);

  console.log("TransformedData2:", executiveViewData);

  console.log("TransformedData3:", extractedExecutiveViewData);

  const [boxContent, setboxContent] = useState(
    demandForecastingCards(transformedData, DataSet)
  );
  const [values, setvalues] = useState(dimensionFilterData[currentDimension]);
  const [selectedDimensions, setSelectedDimensions] = useState(["pred"]);
  useEffect(() => {
    setCurrentStartDate(demandForecastingData[dateColumn][0]);
    const length = demandForecastingData[dateColumn].length;
    setCurrentEndDate(demandForecastingData[dateColumn][length - 1]);
  }, []);
  useEffect(() => {
    console.log("dt1: ", extractedExecutiveViewData);
    setboxContent(
      demandForecastingCards(
        get_metrics(
          demandForecastingData,
          dateColumn,
          frequencyDict[experiment_config.data.frequency],
          extractedExecutiveViewData,
          showFutureActuals,
          rawSalesData,
          experiment_config.scenario_plan.pricing_constraints.currency !==
            undefined &&
            experiment_config.scenario_plan.pricing_constraints.currency
            ? currencyDict[
                experiment_config.scenario_plan.pricing_constraints.currency
              ]
            : null
        ),
        DataSet
      )
    );
    console.log("BoxContent1", boxContent);
  }, [showFutureActuals]);
  useEffect(() => {
    const CurrentValue = dimensionFilterData[currentDimension].includes(
      currentValue
    )
      ? currentValue
      : dimensionFilterData[currentDimension][0];
    setCurrentValue(CurrentValue);
    const fetchExecutiveViewData = async () => {
      const dict = { Forecast_Granularity: "ts_id", Cluster: "cluster" };
      const changable = ["Forecast_Granularity", "Cluster"];
      const dimension = changable.includes(currentDimension)
        ? dict[currentDimension]
        : currentDimension;
      await loadExecutiveViewData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
            value: [CurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );
      const filterData = {
        dimensionFilters: {
          [dimension]: [CurrentValue],
        },
        columnFilter:
          tablesFilterData[`${forecast_data_pivot_fileName}`]?.["Default"]
            ?.filterData?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData[`${forecast_data_pivot_fileName}`]?.["Default"]
            ?.filterData?.selectAllColumns ?? true,
      };

      const allFilterData = {
        dimensionFilters: {},
        columnFilter:
          tablesFilterData[`${forecast_data_pivot_fileName}`]?.["Default"]
            ?.filterData?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData[`${forecast_data_pivot_fileName}`]?.["Default"]
            ?.filterData?.selectAllColumns ?? true,
      };
      await setFilterData(
        CurrentValue === "all" ? allFilterData : filterData,
        "Forecasting Pivot",
        `${forecast_data_pivot_fileName}`,
        "Default"
      );
      await setFilterData(
        CurrentValue === "all" ? allFilterData : filterData,
        "Forecast Pivot",
        `${forecast_data_pivot_fileName}`,
        "Default"
      );
      await setFilterData(
        CurrentValue === "all" ? allFilterData : filterData,
        "Forecasting Pivot Disaggregated",
        `${forecast_data_disaggregated_pivot_filename}`,
        "Default"
      );
      await setFilterData(
        CurrentValue === "all" ? allFilterData : filterData,
        "Forecast Value Pivot",
        `${forecast_data_value_pivot_filename}`,
        "Default"
      );
      await loadRawSalesData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
            value: [CurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );

      if (
        tablesFilterData[`${forecast_data_pivot_fileName}`]?.["Default"]
          ?.filterData
      ) {
        // await setForecastingPivotData(
        //   `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
        //   tablesFilterData[`${forecast_data_pivot_fileName}`]["Default"].filterData,
        //   userInfo.userID
        // );
      } else {
        console.error(
          'tablesFilterData[`${forecast_data_pivot_fileName}`]["Default"].filterData is undefined'
        );
        // await setForecastingPivotData(
        //   `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
        //   {
        //     dimensionFilters: {
        //       [currentDimension]: [currentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
        // Handle error accordingly (e.g., show a message, fallback data, etc.)
      }
    };
    fetchExecutiveViewData();
    setExtractedExecutiveViewData(
      extractExecutiveData(executiveViewData, currentValue)
    );
  }, [currentValue, currentDimension]);
  useEffect(() => {
    setTransformedData(
      get_metrics(
        demandForecastingData,
        dateColumn,
        frequencyDict[experiment_config.data.frequency],
        extractedExecutiveViewData,
        showFutureActuals,
        rawSalesData,
        experiment_config.scenario_plan.pricing_constraints.currency !==
          undefined &&
          experiment_config.scenario_plan.pricing_constraints.currency
          ? currencyDict[
              experiment_config.scenario_plan.pricing_constraints.currency
            ]
          : null
      )
    );

    console.log("currentValueOne " + currentValue + " " + currentDimension);
    setboxContent(
      demandForecastingCards(
        get_metrics(
          demandForecastingData,
          dateColumn,
          frequencyDict[experiment_config.data.frequency],
          extractedExecutiveViewData,
          showFutureActuals,
          rawSalesData,
          experiment_config.scenario_plan.pricing_constraints.currency !==
            undefined &&
            experiment_config.scenario_plan.pricing_constraints.currency
            ? currencyDict[
                experiment_config.scenario_plan.pricing_constraints.currency
              ]
            : null
        ),
        DataSet
      )
    );
    console.log("BoxContent", boxContent);
    setfeatureGraphData(extractKeys(demandForecastingData, dateColumn));
    const fetchGraphData = async () => {
      setData(
        await get_graph_data(
          extractKeys(demandForecastingData, dateColumn),
          enrichment_bydate,
          currentDimension,
          currentValue,
          dateColumn
        )
      );
    };
    fetchGraphData();
    if (currentStartDate && currentEndDate) {
      const fetchGraphData = async () => {
        setDateFilter(
          currentStartDate,
          currentEndDate,
          await get_graph_data(
            extractKeys(demandForecastingData, dateColumn),
            enrichment_bydate,
            currentDimension,
            currentValue,
            dateColumn
          )
        );
      };
      fetchGraphData();
    } else {
      const fetchGraphData = async () => {
        setData(
          await get_graph_data(
            extractKeys(demandForecastingData, dateColumn),
            enrichment_bydate,
            currentDimension,
            currentValue,
            dateColumn
          )
        );
      };
      fetchGraphData();
    }
  }, [demandForecastingData]);

  useEffect(() => {
    setboxContent(
      demandForecastingCards(
        get_metrics(
          demandForecastingData,
          dateColumn,
          frequencyDict[experiment_config.data.frequency],
          extractedExecutiveViewData,
          showFutureActuals,
          rawSalesData,
          experiment_config.scenario_plan.pricing_constraints.currency !==
            undefined &&
            experiment_config.scenario_plan.pricing_constraints.currency
            ? currencyDict[
                experiment_config.scenario_plan.pricing_constraints.currency
              ]
            : null
        ),
        DataSet
      )
    );
  }, [rawSalesData]);

  useEffect(() => {
    setvalues(dimensionFilterData[currentDimension]);
    setCurrentValue(dimensionFilterData[currentDimension][0]);
  }, [currentDimension]);
  useEffect(() => {
    const CurrentValue = dimensionFilterData[currentDimension].includes(
      currentValue
    )
      ? currentValue
      : dimensionFilterData[currentDimension][0];
    setCurrentValue(CurrentValue);
    console.log(`[${new Date().toLocaleTimeString()}] :Applying the `);
    applyDimensionFilters(
      {
        dimensionFilters: {
          feature: [currentDimension],
          value: [CurrentValue],
        },
        columnFilter: [],
        selectAllColumns: true,
      },
      CurrentValue
    );
  }, [currentValue, currentDimension]);
  useEffect(() => {
    if (currentStartDate && currentEndDate) {
      setDateFilter(currentStartDate, currentEndDate, data);
    } else {
      const fetchGraphData = async () => {
        setData(
          await get_graph_data(
            extractKeys(demandForecastingData, dateColumn),
            enrichment_bydate,
            currentDimension,
            currentValue,
            dateColumn
          )
        );
      };
      fetchGraphData();
    }
  }, [currentStartDate, currentEndDate]);

  const getAxisYDomain = (from, to, ref, offset) => {
    const refData = data.filter(
      (d) => d[dateColumn] >= from && d[dateColumn] <= to
    );
    console.log("refff", refData);
    setData(refData);

    if (refData.length === 0) {
      console.warn(`No data available in the range from ${from} to ${to}`);
      return [0, 0];
    }

    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });

    return [(bottom | 0) - offset, (top | 0) + offset];
  };

  const setDateFilter = (startDate, endDate, data) => {
    console.log(
      "Filtering with the Dates",
      "Start->",
      startDate,
      "End:->",
      endDate
    );
    console.log("setDateFilter Data", data);
    if (startDate && endDate) {
      const newRefData = data.filter(
        (d) => d[dateColumn] >= startDate && d[dateColumn] <= endDate
      );
      setData(newRefData);
      console.log("New Ref Data", newRefData);
    }
  };

  const [zoomSettings, setZoomSettings] = useState({
    left: "dataMin",
    right: "dataMax",
    refAreaLeft: "",
    refAreaRight: "",
    domains: createDomains(data, dateColumn),
  });
  const handleClearFilter = async () => {
    setCurrentDimension("all");
    setCurrentStartDate(demandForecastingData[dateColumn][0]);
    const length = demandForecastingData[dateColumn].length;
    setCurrentEndDate(demandForecastingData[dateColumn][length - 1]);
  };

  const zoom = () => {
    if (
      zoomSettings.refAreaLeft === zoomSettings.refAreaRight ||
      zoomSettings.refAreaRight === ""
    ) {
      setZoomSettings((prev) => ({
        ...prev,
        refAreaLeft: "",
        refAreaRight: "",
      }));
      return;
    }

    let [newLeft, newRight] =
      zoomSettings.refAreaLeft > zoomSettings.refAreaRight
        ? [zoomSettings.refAreaRight, zoomSettings.refAreaLeft]
        : [zoomSettings.refAreaLeft, zoomSettings.refAreaRight];

    const newDomains = {};
    Object.keys(featureGraphData).forEach((key) => {
      if (key !== dateColumn) {
        const [newBottom, newTop] = getAxisYDomain(newLeft, newRight, key, 10);
        newDomains[key] = { bottom: newBottom, top: newTop };
      }
    });

    setZoomSettings((prev) => ({
      ...prev,
      left: newLeft,
      right: newRight,
      domains: newDomains,
      refAreaLeft: "",
      refAreaRight: "",
    }));
  };
  const isEditableColumn = (columnName) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(columnName);
  };
  const getTimeStamp = (columnName) => {
    const time_stamp = columnName.split(" ")[0];
    return time_stamp;
  };
  const colors = [
    "#c55b5d",
    "#4ab56e",
    "#d6a74d",
    "#5b7bbf",
    "#c88d5a",
    "#8b3f9f",
    "#5fd0d0",
    "#c88bcc",
    "#9baf5a",
    "#d59cb3",
    "#008585",
    "#c6b2d1",
    "#8e5a2d",
    "#d3d8a7",
    "#404080",
    "#8fd8a7",
    "#6f6f00",
    "#d0b89c",
    "#6f0000",
    "#6e6e6e",
    "#6f6f00",
  ];

  const dimensions = Object.keys(data[0])
    .filter((key) => key !== dateColumn)
    .map((key, index) => {
      let color;
      if (key === "actual") {
        color = "#1f77b4";
      } else if (key === "pred") {
        color = "#2ca02c";
      } else if (key === "out_of_time_validation") {
        color = "#ff7f0e";
      } else if (key === "enrichment_forecast") {
        color = "#6f6f00";
      } else {
        color = colors[index % colors.length];
      }
      return {
        label: key,
        key: key,
        color,
      };
    });

  const handleDimensionChange = (newValue) => {
    console.log("newDemandValue " + newValue);
    const updatedDimensions = newValue.includes("pred")
      ? newValue
      : ["pred", ...newValue];
    setSelectedDimensions(updatedDimensions);
  };

  /*   useEffect(() => {
    console.log("useEffect");

    const fetchForecastingPivotData = async () => {
      const data = await setForecastingPivotData(
        `${experimentBasePath}/${pivotPath}`,
        {
          dimensionFilters: {
            [currentDimension]: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );

      console.log("Pivot data:", data);
    };
    if (forecastingPivotData == null) {
      fetchForecastingPivotData();
    }
  }, [forecastingPivotData]); */

  const filteredDimensions = dimensions.filter(
    (dim) =>
      dim.label !== "pred" &&
      dim.label !== "actual" &&
      dim.label !== "split" &&
      dim.label !== "out_of_time_validation"
  );

  const availableDimensions = filteredDimensions.filter(
    (dim) => !selectedDimensions.includes(dim.label)
  );

  const handleToggleRawActuals = () => {
    setShowRawActuals(!showRawActuals);
  };

  if (!experimentBasePath) return;

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        padding={"12px 16px"}
        gap={2}
      >
        <CustomDatePicker
          showLabel
          label="View start date:"
          initialDate={new Date()} // Initial date
          selectedValue={currentStartDate}
          setSelectedValue={setCurrentStartDate}
          // Callback function to handle date change
        />
        <CustomDatePicker
          showLabel
          label="View end date:"
          initialDate={new Date()} // Initial date
          selectedValue={currentEndDate}
          setSelectedValue={setCurrentEndDate}
          // Callback function to handle date change
        />
        <CustomAutocomplete
          disableClearable
          showLabel
          label="Dimension"
          placeholder="select option.."
          values={Object.keys(dimensionFilterData)}
          // isMultiSelect={true}
          selectedValues={currentDimension}
          setSelectedValues={setCurrentDimension}
        />
        <CustomAutocomplete
          disableClearable
          showLabel
          label="Select value within dimension"
          placeholder="select option.."
          values={values}
          // isMultiSelect={true}
          selectedValues={currentValue}
          setSelectedValues={setCurrentValue}
          path={null}
        />

        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"flex-end"}
          alignItems={"flex-end"}
          // border={"1px solid"}
        >
          <CustomButton
            title="Clear"
            onClick={() => {
              handleClearFilter();
            }}
            backgroundColor="#FFFF"
            borderColor="#D0D5DD"
            textColor="#344054"
          />
        </Stack>
      </Stack>
      <Grid container spacing={3} padding={"12px 16px 12px 16px"}>
        {boxContent.map((box) => {
          return (
            <Grid item xs={12} md={4} key={box.id}>
              <BoxComponent
                icon={box.icon}
                title={box.title}
                lables={box.lables}
                id={box.id}
                data={box}
                onHoverBackgroundColor={"#F9F5FF"}
              />
            </Grid>
          );
        })}
      </Grid>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        padding={"0px 16px"}
        gap={2}
        alignItems={"flex-end"}
        justifyContent={"space-between"}
      >
        <CustomAutocomplete
          disableClearable
          showLabel
          label="Demand Pattern Oscillator"
          placeholder="Select Dimension"
          values={availableDimensions
            .filter((dim) => dim.label !== "future_actual")
            .map((dim) => dim.label)} // Corrected closing parenthesis here
          isMultiSelect={true}
          selectedValues={selectedDimensions.filter(
            (d) => d !== "pred" && d !== "actual"
          )}
          setSelectedValues={handleDimensionChange}
        />

        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"flex-end"}
          alignItems={"flex-end"}
          // border={"1px solid"}
        >
          <CustomButton
            title={"Zoom out"}
            onClick={async () => {
              if (currentStartDate && currentEndDate) {
                const graph_data = await get_graph_data(
                  extractKeys(demandForecastingData, dateColumn),
                  enrichment_bydate,
                  currentDimension,
                  currentValue,
                  dateColumn
                );
                setDateFilter(currentStartDate, currentEndDate, graph_data);
              } else {
                const graph_data = await get_graph_data(
                  extractKeys(demandForecastingData, dateColumn),
                  enrichment_bydate,
                  currentDimension,
                  currentValue,
                  dateColumn
                );
                setData(graph_data);
              }
            }}
          />
        </Stack>
      </Stack>

      <Box sx={{ height: "100%" }}>
        {/* <Grid container spacing={1} paddingX={"16px"}>
          <Grid item xs={0} md={2.5}></Grid>
          <Grid item xs={12} md={9.5}>
            {" "}
          </Grid>
        </Grid> */}

        <Grid
          container
          spacing={1}
          paddingX={"16px"}
          paddingY={"16px"}
          // border={"1px solid"}
          maxHeight={"100%"}
        >
          <Grid
            item
            xs={12}
            md={3.5}
            sx={{
              padding: "12px 32px",
              // border: "1px solid",
              marginTop: "1.2rem",
              overflowY: "auto", // Enable scrolling if content exceeds height
              minHeight: "560px",
              // Match height with second Grid item
            }}
          >
            <Box
              sx={{
                flex: 1,
                overflow: "scroll",
                border: "1px solid #10B981",
                boxShadow:
                  "0px 4px 6px -2px rgba(16, 185, 129, 0.05), 0px 12px 16px -4px rgba(16, 185, 129, 0.1)",
                borderRadius: "12px",
              }}
            >
              <EnrichmentBox
                dimensionFilterData={dimensionFilterData}
                currentDimension={currentDimension}
                currentValue={currentValue}
              />
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={8.5}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%", // Make sure this item takes up the available height
            }}
          >
            <Stack
              sx={{
                flexDirection: { xs: "column", md: "row" },
                padding: "12px 32px",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "16px",
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              <Stack direction={"row"} spacing={"0.5rem"}>
                <FormControlLabel
                  sx={{
                    whiteSpace: "nowrap", // Prevents the label from wrapping
                    flexShrink: 0, // Prevents it from shrinking or moving to a new line
                    ".MuiFormControlLabel-label": {
                      fontSize: "12px", // Reduces the font size of the label
                      fontFamily: "Inter", // You can specify the font family if needed
                      fontWeight: 500,
                      color: "#344054", // Optional, sets the label text color
                    },
                  }}
                  control={
                    <Checkbox
                      checked={showEnrichForecast}
                      onChange={handleToggleEnrichForecast}
                      color="primary"
                      sx={{
                        transform: "scale(0.8)",
                      }}
                    />
                  }
                  label="Preview Enrichment"
                />
                <FormControlLabel
                  sx={{
                    whiteSpace: "nowrap", // Prevents the label from wrapping
                    flexShrink: 0, // Prevents it from shrinking or moving to a new line
                    ".MuiFormControlLabel-label": {
                      fontSize: "12px", // Reduces the font size of the label
                      fontFamily: "Inter", // You can specify the font family if needed
                      fontWeight: 500,
                      color: "#344054", // Optional, sets the label text color
                    },
                  }}
                  control={
                    <Checkbox
                      checked={showPredictionInterval}
                      onChange={handleTogglePredictionInterval}
                      color="primary"
                      sx={{
                        transform: "scale(0.8)",
                      }}
                    />
                  }
                  label="Prediction Interval"
                />
                <FormControlLabel
                  sx={{
                    whiteSpace: "nowrap", // Prevents the label from wrapping
                    flexShrink: 0, // Prevents it from shrinking or moving to a new line
                    ".MuiFormControlLabel-label": {
                      fontSize: "12px", // Reduces the font size of the label
                      fontFamily: "Inter", // You can specify the font family if needed
                      fontWeight: 500,
                      color: "#344054", // Optional, sets the label text color
                    },
                  }}
                  control={
                    <Checkbox
                      checked={showFutureActuals}
                      onChange={handleToggleFutureActuals}
                      color="primary"
                      sx={{
                        transform: "scale(0.8)",
                      }}
                    />
                  }
                  label="Future Actuals"
                />
                {data.length > 0 && "actual_raw" in data[0] && (
                  <FormControlLabel
                    sx={{
                      whiteSpace: "nowrap", // Prevents the label from wrapping
                      flexShrink: 0, // Prevents it from shrinking or moving to a new line
                      ".MuiFormControlLabel-label": {
                        fontSize: "12px", // Reduces the font size of the label
                        fontFamily: "Inter", // You can specify the font family if needed
                        fontWeight: 500,
                        color: "#344054", // Optional, sets the label text color
                      },
                    }}
                    control={
                      <Checkbox
                        checked={showRawActuals}
                        onChange={handleToggleRawActuals}
                        color="primary"
                        sx={{
                          transform: "scale(0.8)",
                        }}
                      />
                    }
                    label="Imputed Actuals"
                  />
                )}
                <FormControlLabel
                  sx={{
                    whiteSpace: "nowrap", // Prevents the label from wrapping
                    flexShrink: 0, // Prevents it from shrinking or moving to a new line
                    ".MuiFormControlLabel-label": {
                      fontSize: "12px", // Reduces the font size of the label
                      fontFamily: "Inter", // You can specify the font family if needed
                      fontWeight: 500,
                      color: "#344054", // Optional, sets the label text color
                    },
                  }}
                  control={
                    <Checkbox
                      checked={showMLForecast}
                      onChange={handleToggleMLForecast}
                      color="primary"
                      sx={{
                        transform: "scale(0.8)",
                      }}
                    />
                  }
                  label="ML Forecast"
                />
                {data.length > 0 && "offset_forecast" in data[0] && (
                  <FormControlLabel
                    sx={{
                      whiteSpace: "nowrap", // Prevents the label from wrapping
                      flexShrink: 0, // Prevents it from shrinking or moving to a new line
                      ".MuiFormControlLabel-label": {
                        fontSize: "12px", // Reduces the font size of the label
                        fontFamily: "Inter", // You can specify the font family if needed
                        fontWeight: 500,
                        color: "#344054", // Optional, sets the label text color
                      },
                    }}
                    control={
                      <Checkbox
                        checked={showOffsetForecast}
                        onChange={handleToggleOffsetForecast}
                        color="primary"
                        sx={{
                          transform: "scale(0.8)",
                        }}
                      />
                    }
                    label="Offset Forecast"
                  />
                )}
              </Stack>
            </Stack>
            {selectedDimensions.map((dimension, index) => {
              const dimensionInfo = dimensions.find(
                (dim) => dim.label === dimension
              );
              const key = dimensionInfo?.key;
              const color = dimensionInfo?.color;
              const isDashed =
                dimension === "Potential sales loss" ||
                dimension === "Excess stock";

              // Filter out data points where both pred and actual are zero

              // Separate the combined 'pred' and 'actual' chart
              if (dimension === "pred") {
                const actualInfo = dimensions.find(
                  (dim) => dim.label === "actual"
                );
                const mlForecastInfo = dimensions.find(
                  (dim) => dim.label === "ml_forecast"
                );
                const enrichmentForecastInfo = dimensions.find(
                  (dim) => dim.label === "enrichment_forecast"
                );
                const outofTimeInfo = dimensions.find(
                  (dim) => dim.label === "out_of_time_validation"
                );

                const actualKey = actualInfo?.key;
                const actualColor = actualInfo?.color;
                const mlForecastColor = mlForecastInfo?.color;
                const enrichmentForecastColor = enrichmentForecastInfo?.color;
                const outofTimeKey = outofTimeInfo?.key;
                const outofTimeColor = outofTimeInfo?.color;

                console.log(
                  "outofTimeKey: " + outofTimeInfo + " actualKey: " + actualKey
                );
                let updatedData = data;
                const testData = data.filter((d) => d.split === "test");
                const futureData = data.filter((d) => d.split === "future");
                if (testData.length * futureData.length > 0) {
                  const lastTestPoint = testData[testData.length - 1];
                  console.log("Last train point:", lastTestPoint);
                  const firstFuturePoint = futureData[0];

                  // Add the new 'value' key
                  console.log("ffp", firstFuturePoint);
                  lastTestPoint.value = lastTestPoint.actual;
                  firstFuturePoint.value = firstFuturePoint.pred;

                  // Update the data with the modified points
                  updatedData = data.map((d) => {
                    if (d === lastTestPoint) {
                      return { ...lastTestPoint };
                    } else if (d === firstFuturePoint) {
                      return { ...firstFuturePoint };
                    }
                    return d;
                  });
                }

                console.log("Updated data:", updatedData);

                return (
                  key &&
                  actualKey &&
                  outofTimeKey && (
                    <Box sx={{ marginBottom: "20px" }} key="pred-actual">
                      <ResponsiveContainer
                        width="100%"
                        height={500}
                        sx={{ border: "1px solid red" }}
                      >
                        <AreaChart
                          data={updatedData}
                          syncId="anyId"
                          margin={{ right: 30, left: 30 }}
                          onMouseDown={(e) =>
                            setZoomSettings((prev) => ({
                              ...prev,
                              refAreaLeft: e.activeLabel,
                            }))
                          }
                          onMouseMove={(e) =>
                            zoomSettings.refAreaLeft &&
                            setZoomSettings((prev) => ({
                              ...prev,
                              refAreaRight: e.activeLabel,
                            }))
                          }
                          onMouseUp={zoom}
                        >
                          <defs>
                            {/* Gradient for the area between pred_upper_bound and pred */}
                            <linearGradient
                              id="colorPredUpper"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#6f6f00"
                                stopOpacity={0.6}
                              />
                              <stop
                                offset="100%"
                                stopColor="#FFFFFF"
                                stopOpacity={0}
                              />
                            </linearGradient>

                            {/* Gradient for the area between pred_lower_bound and pred */}
                            <linearGradient
                              id="colorPredLower"
                              x1="0"
                              y1="1"
                              x2="0"
                              y2="0"
                            >
                              <stop
                                offset="0%"
                                stopColor="#8fd8a7"
                                stopOpacity={0.6}
                              />
                              <stop
                                offset="100%"
                                stopColor="#FFFFFF"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                          />
                          {index === selectedDimensions.length - 1 ? (
                            <XAxis
                              dataKey={dateColumn}
                              stroke="#475467"
                              tickFormatter={formatXAxis}
                              interval={Math.floor(data.length / 7)}
                              allowDataOverflow
                              type="category"
                              tick={{
                                fill: "#475467",
                                fontSize: 12,
                                fontWeight: 400,
                                fontFamily: "Inter",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                          ) : (
                            <XAxis
                              dataKey={dateColumn}
                              stroke="#475467"
                              tickFormatter={formatXAxis}
                              interval={Math.floor(data.length / 7)}
                              allowDataOverflow
                              type="category"
                              tick={{
                                fill: "#475467",
                                fontSize: 0,
                                fontWeight: 400,
                                fontFamily: "Inter",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                          )}
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            allowDataOverflow
                            domain={["auto", "auto"]}
                            type="number"
                            tick={{
                              fill: "#475467",
                              fontSize: 12,
                              fontWeight: 400,
                              fontFamily: "Inter",
                            }}
                            label={{
                              value: "Predicted vs Actual",
                              angle: -90,
                              position: "left",
                              style: {
                                textAnchor: "middle",
                                fill: "#475467",
                                fontSize: 14,
                                fontWeight: 400,
                                fontFamily: "Inter",
                              },
                            }}
                          />
                          <Tooltip
                            content={<CustomTooltip dimensions={dimensions} />}
                          />
                          <CustomLegend
                            dimensions={dimensions.filter((dim) =>
                              [key, actualKey].includes(dim.key)
                            )}
                          />
                          <Area
                            type="linear"
                            dataKey={key}
                            strokeWidth={2}
                            stroke={color}
                            fill="none"
                            dot={{ fill: color, stroke: color, strokeWidth: 1 }}
                          />
                          <Area
                            type="linear"
                            dataKey={outofTimeKey}
                            strokeWidth={2}
                            stroke={outofTimeColor}
                            fill="none"
                            dot={{
                              fill: outofTimeColor,
                              stroke: outofTimeColor,
                              strokeWidth: 1,
                            }}
                          />
                          <Area
                            type="linear"
                            dataKey={"value"}
                            strokeWidth={2}
                            stroke={color}
                            fill="none"
                            dot={{
                              fill: color,
                              stroke: color,
                              strokeWidth: 1,
                            }}
                            strokeDasharray="2 2"
                          />
                          {showFutureActuals && (
                            <Area
                              type="linear"
                              dataKey={"future_actual"}
                              strokeWidth={2}
                              stroke={actualColor}
                              fill="none"
                              dot={{
                                fill: actualColor,
                                stroke: actualColor,
                                strokeWidth: 1,
                              }}
                              strokeDasharray="2 2"
                            />
                          )}
                          {showMLForecast && (
                            <Area
                              type="linear"
                              dataKey={"ml_forecast"}
                              strokeWidth={2}
                              stroke={mlForecastColor}
                              fill="none"
                              dot={{
                                fill: mlForecastColor,
                                stroke: mlForecastColor,
                                strokeWidth: 1,
                              }}
                              strokeDasharray="2 2"
                            />
                          )}
                          {showEnrichForecast && (
                            <Area
                              type="linear"
                              dataKey={"enrichment_forecast"}
                              strokeWidth={2}
                              stroke={enrichmentForecastColor}
                              fill="none"
                              dot={{
                                fill: enrichmentForecastColor,
                                stroke: enrichmentForecastColor,
                                strokeWidth: 1,
                              }}
                              strokeDasharray="2 2"
                            />
                          )}
                          {showPredictionInterval && (
                            <>
                              <Area
                                type="linear"
                                dataKey="pred_upper_bound_range"
                                stroke="#8fd8a7"
                                fill="#8fd8a750"
                                fillOpacity={1}
                              />
                              <Area
                                type="linear"
                                dataKey="pred_lower_bound_range"
                                stroke="#8fd8a7"
                                fill="#8fd8a750"
                                fillOpacity={1}
                              />
                            </>
                          )}
                          {showRawActuals && (
                            <Area
                              type="linear"
                              dataKey={"actual_raw"}
                              strokeWidth={2}
                              stroke="#9ecae1"
                              fill="none"
                              dot={{
                                fill: "#9ecae1",
                                stroke: "#9ecae1",
                                strokeWidth: 1,
                              }}
                              strokeDasharray="2 2"
                            />
                          )}
                          {showOffsetForecast && (
                            <Area
                              type="linear"
                              dataKey={"offset_forecast"}
                              strokeWidth={2}
                              stroke="#d6a74d"
                              fill="none"
                              dot={{
                                fill: "#d6a74d",
                                stroke: "#9ecae1",
                                strokeWidth: 1,
                              }}
                              strokeDasharray="2 2"
                            />
                          )}
                          <Area
                            type="linear"
                            dataKey={actualKey}
                            strokeWidth={2}
                            stroke={actualColor}
                            fill="none"
                            dot="{{
                          fill: actualColor,
                          stroke: actualColor,
                          strokeWidth: 1,
                        }}"
                          />
                          {zoomSettings.refAreaLeft &&
                          zoomSettings.refAreaRight ? (
                            <ReferenceArea
                              x1={zoomSettings.refAreaLeft}
                              x2={zoomSettings.refAreaRight}
                              strokeOpacity={0.3}
                            />
                          ) : null}
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  )
                );
              }

              // Render remaining individual graphs
              return (
                key && (
                  <Box sx={{ marginBottom: "20px" }} key={key}>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart
                        data={data}
                        syncId="anyId"
                        margin={{ right: 30, left: 30 }}
                        onMouseDown={(e) =>
                          setZoomSettings((prev) => ({
                            ...prev,
                            refAreaLeft: e.activeLabel,
                          }))
                        }
                        onMouseMove={(e) =>
                          zoomSettings.refAreaLeft &&
                          setZoomSettings((prev) => ({
                            ...prev,
                            refAreaRight: e.activeLabel,
                          }))
                        }
                        onMouseUp={zoom}
                      >
                        <defs>
                          <linearGradient
                            id={`colorSeries-${color}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={color}
                              stopOpacity={0}
                            />
                            <stop
                              offset="95%"
                              stopColor={color}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey={dateColumn}
                          stroke="#475467"
                          tickFormatter={formatXAxis}
                          interval={Math.floor(featureGraphData.length / 7)}
                          allowDataOverflow
                          type="category"
                          tick={{
                            fill: "#475467",
                            fontSize:
                              index === selectedDimensions.length - 1 ? 12 : 0,
                            fontWeight: 400,
                            fontFamily: "Inter",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          allowDataOverflow
                          domain={["auto", "auto"]}
                          type="number"
                          tick={{
                            fill: "#475467",
                            fontSize: 12,
                            fontWeight: 400,
                            fontFamily: "Inter",
                          }}
                          label={{
                            value: dimension,
                            angle: -90,
                            position: "left",
                            style: {
                              textAnchor: "middle",
                              fill: "#475467",
                              fontSize: 14,
                              fontWeight: 400,
                              fontFamily: "Inter",
                            },
                          }}
                        />
                        <Tooltip
                          content={<CustomTooltip dimensions={dimensions} />}
                        />
                        <CustomLegend
                          dimensions={dimensions.filter((dim) =>
                            selectedDimensions.includes(dim.label)
                          )}
                        />
                        <Area
                          type="linear"
                          dataKey={key}
                          strokeWidth={2}
                          stroke={color}
                          fill="none"
                          strokeDasharray={isDashed ? "3 3" : "0"}
                          dot={{ fill: color, stroke: color, strokeWidth: 1 }}
                        />
                        {zoomSettings.refAreaLeft &&
                        zoomSettings.refAreaRight ? (
                          <ReferenceArea
                            x1={zoomSettings.refAreaLeft}
                            x2={zoomSettings.refAreaRight}
                            strokeOpacity={0.3}
                          />
                        ) : null}
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )
              );
            })}
          </Grid>
        </Grid>
      </Box>

      

      {/* <ForecastingPivot /> */}
      {!experiment_config.dashboard_settings?.hide_forecasting_pivot_table ? (
        <CustomTable
          enableAggregation={
            experiment_config.scenario_plan.demand_alignment_report
              .enable_aggregation
          }
          //data={forecastingPivotData}
          title={
            experiment_config.data.ts_id_columns_disagg?.length > 0 &&
            experiment_config.dashboard_settings
              ?.show_forecasting_pivot_disaggregated
              ? "Forecasting Pivot Disaggregated"
              : "Forecasting Pivot"
          }
          isEditable
          isEditableColumn={isEditableColumn}
          getTimeStamp={getTimeStamp}
          showMetrics = {true}
          valueFileTitle={
            experiment_config.data.ts_id_columns_disagg?.length === 0
              ? experiment_config.scenario_plan.pricing_constraints.price !==
                  "None" &&
                experiment_config.scenario_plan.pricing_constraints.price !==
                  null
                ? "Forecast Value Pivot"
                : null
              : null
          }
          oc_path={
            experiment_config.data.ts_id_columns_disagg?.length > 0 &&
            experiment_config.dashboard_settings
              ?.show_forecasting_pivot_disaggregated
              ? "scenario_planning/K_best/forecast/forecast_disaggregated.csv"
              : "scenario_planning/K_best/forecast/original_forecast_data_pivot.csv"
          }
          multiDownloadFiles={{
            "Future Granular Metrics": `${experimentBasePath}/scenario_planning/K_best/forecast/future_data_metrics.csv`,
    "Future Time Metrics": `${experimentBasePath}/scenario_planning/K_best/forecast/time_metrics.csv`,
          }}
          enableFileUpload
        />
      ) : (
        <Box
          sx={{
            margin: "16px",
            padding: "24px",
            border: "1px solid #EAECF0",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 2px 4px rgba(16, 24, 40, 0.05)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "24px",
                color: "#344054",
              }}
            >
              Large Dataset Notice
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "20px",
                color: "#667085",
              }}
            >
              The forecasting pivot{" "}
              {experiment_config.data.ts_id_columns_disagg?.length > 0 &&
              experiment_config.dashboard_settings
                ?.show_forecasting_pivot_disaggregated
                ? "disaggregated"
                : ""}{" "}
              table is too large to display. Would you like to download it
              instead?
            </Typography>
          </Stack>
          <CustomButton
            outlined
            title={loading ? "Downloading..." : "Download"}
            disabled={loading}
            onClick={() =>
              handleDownload(
                experiment_config.data.ts_id_columns_disagg?.length > 0 &&
                  experiment_config.dashboard_settings
                    ?.show_forecasting_pivot_disaggregated
                  ? "Forecasting Pivot Disaggregated"
                  : "Forecasting Pivot"
              )
            }
            CustomStartAdornment={
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
            sx={{
              minWidth: "120px",
              whiteSpace: "nowrap",
            }}
          />
        </Box>
      )}
    </Stack>
  );
};

export default DashForecastSummary;
