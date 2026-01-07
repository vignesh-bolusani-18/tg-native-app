import React, { useCallback } from "react";
import {
  Stack,
  Box,
  Typography,
  Grid,
  CardContent,
  Card,
  FormControlLabel,
  Checkbox,
  Skeleton,
} from "@mui/material";
import CustomButton from "../../../../components/CustomButton";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";

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
  ResponsiveContainer,
  ReferenceArea,
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
import { convertDimension } from "../../../../utils/convertDimension";
import { parallelChunkMap } from "../../../../utils/parallelChunkMap";
import { downloadParquetFileUsingPreSignedURL } from "../../../../redux/actions/dashboardActions";
import ForecastChart from "../../../../components/ForecastChartOptimized";
import FilterBlock from "../../../../components/FilterBlockNew";
import ForecastMetrics from "../../../../components/ForecastMetrics";
import { fetchCSVData, fetchParquetData } from "../../../../utils/s3Utils";
import useConfig from "../../../../hooks/useConfig";
import { callQueryEngineQuery } from "../../../../utils/queryEngine";
import { object } from "yup";
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
  // Early return if data is invalid
  if (!data || Object.keys(data).length === 0) {
    return {};
  }

  // Memoize frequently accessed values
  const isNew = rawSalesData !== null && rawSalesData !== undefined;

  // Calculate error array only if not present
  if (!data.hasOwnProperty("error")) {
    data.error = data.pred.map((value, index) =>
      Math.abs(parseFloat(value) - parseFloat(data.actual[index]))
    );
  }

  // Initialize required properties if not present
  if (!data.hasOwnProperty("ly_actual")) {
    data.ly_actual = ["actual"];
  }

  if (!data.hasOwnProperty("date_rank")) {
    data.date_rank = 1.0;
    data.ts_actual = data.actual;
    data.ts_pred = data.pred;
    data.ts_error = data.error;
  }

  // Extract graph data once
  const graphData = extractKeys(data, dateColumn);

  // Process test entries
  const testEntries = graphData.filter((entry) => entry.split === "test");
  const trainEntries = graphData.filter((entry) => entry.split === "train");

  if (trainEntries.length > 0) {
    testEntries.unshift(trainEntries[trainEntries.length - 1]);
  }

  // Calculate validation period
  const Validation_Period =
    testEntries.length > 0
      ? `${formatDateWithSuffix(
          incrementDateByOneDay(testEntries[0][dateColumn])
        )} - ${formatDateWithSuffix(
          testEntries[testEntries.length - 1][dateColumn]
        )}`
      : null;

  // Process forecast entries
  let forecastEntries = graphData.filter((entry) => entry.split === "future");
  if (testEntries.length > 0) {
    forecastEntries.unshift(testEntries[testEntries.length - 1]);
  }

  // Calculate forecast period and horizon
  let Forecast_Period = null;
  let Forecast_Horizon = null;

  if (forecastEntries.length > 0) {
    const startDate = formatDateWithSuffix(
      incrementDateByOneDay(forecastEntries[0][dateColumn])
    );
    const endDate = formatDateWithSuffix(
      forecastEntries[forecastEntries.length - 1][dateColumn]
    );
    Forecast_Horizon = calculateDateDifference(
      forecastEntries[0][dateColumn],
      forecastEntries[forecastEntries.length - 1][dateColumn],
      frequency
    );
    Forecast_Period = `${startDate} - ${endDate} (${Forecast_Horizon} ${frequency})`;
  }

  // Calculate metrics in parallel using Promise.all
  const metrics = {
    lastCardBottomMetricTitle: showFutureActuals
      ? "Future Accuracy"
      : "Total Combinations",
    new_lastCardBottomMetricTitle: showFutureActuals
      ? "Future Accuracy"
      : "Forecast Period",
    Validation_Period,
    Forecast_Period,
    isNew,
    currency,
  };

  // Calculate future accuracy if needed
  if (showFutureActuals) {
    const futureAccuracy = calculateFutureAccuracy(graphData);
    metrics.Future_Accuracy = futureAccuracy;
    metrics.lastCardBottomMetric = formatToPercent(futureAccuracy * 100);
    metrics.new_lastCardBottomMetric = formatToPercent(futureAccuracy * 100);
  } else {
    metrics.lastCardBottomMetric = executiveViewData.total_combinations;
    metrics.new_lastCardBottomMetric = Forecast_Period;
  }

  // Calculate sales metrics
  if (data.hasOwnProperty("date_rank")) {
    const testIndices = data.split.reduce((acc, value, index) => {
      if (value === "test" && data.date_rank[index] === "1.0") {
        acc.push(index);
      }
      return acc;
    }, []);

    metrics.predicted_sales_ts = testIndices.reduce(
      (acc, index) => acc + parseFloat(data.ts_pred[index]),
      0
    );
    metrics.predicted_sales_mean =
      metrics.predicted_sales_ts / testIndices.length;
    metrics.actual_sales_ts = testIndices.reduce(
      (acc, index) => acc + parseFloat(data.ts_actual[index]),
      0
    );
    metrics.error_sales_ts = testIndices.reduce(
      (acc, index) => acc + parseFloat(data.ts_error[index]),
      0
    );
  }

  // Calculate future metrics
  const future_indices = data.split.reduce((acc, value, index) => {
    if (value === "future") {
      acc.push(index);
    }
    return acc;
  }, []);

  metrics.predicted_sales_f = future_indices.reduce(
    (acc, index) => acc + parseFloat(data.pred[index]),
    0
  );
  metrics.predicted_sales_f_mean =
    metrics.predicted_sales_f / future_indices.length;
  metrics.actual_sales_ly = future_indices.reduce(
    (acc, index) => acc + parseFloat(data.ly_actual[index]),
    0
  );

  try {
    metrics.predicted_sales_f_value = future_indices.reduce(
      (acc, index) => acc + parseFloat(data.sales_value_by_amount_[index]),
      0
    );
  } catch (error) {
    metrics.predicted_sales_f_value = null;
  }

  // Calculate accuracy metrics
  metrics.accuracy =
    (1 - metrics.error_sales_ts / metrics.actual_sales_ts) * 100;
  metrics.bias =
    Math.abs(
      (metrics.predicted_sales_ts - metrics.actual_sales_ts) /
        metrics.actual_sales_ts
    ) * 100;
  metrics.overall_accuracy =
    (1 -
      Math.abs(
        (metrics.predicted_sales_ts - metrics.actual_sales_ts) /
          metrics.actual_sales_ts
      )) *
    100;
  metrics.latest_period_gap =
    ((metrics.predicted_sales_f_mean - metrics.predicted_sales_mean) /
      metrics.predicted_sales_mean) *
    100;
  metrics.yoy =
    ((metrics.predicted_sales_f - metrics.actual_sales_ly) /
      metrics.actual_sales_ly) *
    100;
  metrics.currentGrowth = parseFloat(
    executiveViewData["Current_Growth%"]
  ).toFixed(2);

  // Add raw sales data metrics if available
  if (isNew) {
    Object.assign(metrics, {
      Forecast_Per_Day: Math.round(
        parseFloat(rawSalesData["Forecast_Per_Day"])
      ),
      sales_last30days: Math.round(
        parseFloat(rawSalesData["sales_last30days"])
      ),
      sales_last60days: Math.round(
        parseFloat(rawSalesData["sales_last60days"])
      ),
      sales_last90days: Math.round(
        parseFloat(rawSalesData["sales_last90days"])
      ),
      sales_value_last30days: Math.round(
        parseFloat(rawSalesData["sales_value_last30days"])
      ),
      sales_value_last60days: Math.round(
        parseFloat(rawSalesData["sales_value_last60days"])
      ),
      sales_value_last90days: Math.round(
        parseFloat(rawSalesData["sales_value_last90days"])
      ),
      Sales_Per_Day: Math.round(parseFloat(rawSalesData["Sales_Per_Day"])),
    });
  }

  return metrics;
};

const extractKeys = (data, dateColumn) => {
  // Early return if data is empty or invalid
  if (!data || Object.keys(data).length === 0) {
    return [];
  }

  // Get keys once and memoize
  const keysToExtract = Object.keys(data).filter(
    (key) => !["feature", "value"].includes(key)
  );

  // Get length once
  const length = data[keysToExtract[0]].length;

  // Pre-allocate array for better performance
  const extractedData = new Array(length);

  // Process data in chunks for better performance
  const CHUNK_SIZE = 1000;
  const chunks = Math.ceil(length / CHUNK_SIZE);

  for (let chunk = 0; chunk < chunks; chunk++) {
    const start = chunk * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, length);

    for (let i = start; i < end; i++) {
      const dataPoint = {};

      for (const key of keysToExtract) {
        if (data.hasOwnProperty(key)) {
          const value = data[key][i];

          if (value !== null && value !== undefined) {
            dataPoint[key] =
              key === dateColumn || key === "split"
                ? value
                : parseFloat(value, 10);
          }
        }
      }

      if (Object.keys(dataPoint).length > 0) {
        extractedData[i] = dataPoint;
      }
    }
  }

  // Filter out any undefined entries
  return extractedData.filter(Boolean);
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

const get_graph_data = async (data) => {
  console.log("Get Graph Input Data: ", data);
  const transformedData1 = [];
  // Find the last point in the "test" split
  let lastTestPoint;

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
          out_of_time_validation: item.split === "test" ? item.pred : undefined,
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

  console.log("Get Graph Output Data: ", transformedData1);
  return transformedData1;
};

const extractExecutiveData = (executiveViewData, currentValue) => {
  // Early return if data is invalid
  if (!executiveViewData) {
    return {};
  }

  // Create a map of key-value pairs for faster lookups
  const extractedData = Object.keys(executiveViewData).reduce((acc, key) => {
    acc[key] = executiveViewData[key][0] || "";
    return acc;
  }, {});

  // Set default Fill_rate if not present
  if (!extractedData.hasOwnProperty("Fill_rate")) {
    extractedData.Fill_rate = "NA";
  }

  return extractedData;
};

const ChartSkeleton = () => {
  return (
    <Box
      sx={{
        border: "1px solid #E4E7EC",
        borderRadius: "8px",
        height: "450px",
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Skeleton variant="text" width={150} height={20} animation={false} />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "#e3f2fd",
                borderRadius: "50%",
              }}
            />
            <Skeleton variant="text" width={70} height={16} animation={false} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "#e8f5e8",
                borderRadius: "50%",
              }}
            />
            <Skeleton variant="text" width={50} height={16} animation={false} />
          </Box>
        </Box>
      </Box>

      {/* Chart with grid and skeleton lines */}
      <Box sx={{ position: "relative", height: 320 }}>
        {/* Y-axis labels */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            py: 1,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={50}
              height={14}
              animation={false}
            />
          ))}
        </Box>

        {/* Grid lines */}
        <Box
          sx={{
            position: "absolute",
            left: "70px",
            right: 0,
            top: "8px",
            bottom: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                height: "1px",
                bgcolor: "#f0f0f0",
                width: "100%",
              }}
            />
          ))}
        </Box>

        {/* Chart area with skeleton lines */}
        <Box
          sx={{
            position: "absolute",
            left: "70px",
            right: "20px",
            top: "8px",
            bottom: "40px",
          }}
        >
          {/* Blue line skeleton */}
          <svg style={{ width: "100%", height: "100%", position: "absolute" }}>
            <path
              d="M 0 80 L 50 60 L 100 70 L 150 40 L 200 90 L 250 45 L 300 85 L 350 30 L 400 75 L 450 50"
              stroke="#e3f2fd"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            {/* Data points for blue line */}
            {[
              { x: 0, y: 80 },
              { x: 50, y: 60 },
              { x: 100, y: 70 },
              { x: 150, y: 40 },
              { x: 200, y: 90 },
              { x: 250, y: 45 },
              { x: 300, y: 85 },
              { x: 350, y: 30 },
              { x: 400, y: 75 },
              { x: 450, y: 50 },
            ].map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="#e3f2fd"
                opacity="0.6"
              />
            ))}
          </svg>

          {/* Green line skeleton */}
          <svg style={{ width: "100%", height: "100%", position: "absolute" }}>
            <path
              d="M 280 95 L 300 85 L 320 75 L 340 80 L 360 70 L 380 90 L 400 85 L 420 95 L 440 88 L 460 82"
              stroke="#e8f5e8"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            {/* Data points for green line */}
            {[
              { x: 280, y: 95 },
              { x: 300, y: 85 },
              { x: 320, y: 75 },
              { x: 340, y: 80 },
              { x: 360, y: 70 },
              { x: 380, y: 90 },
              { x: 400, y: 85 },
              { x: 420, y: 95 },
              { x: 440, y: 88 },
              { x: 460, y: 82 },
            ].map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="#e8f5e8"
                opacity="0.6"
              />
            ))}
          </svg>
        </Box>

        {/* X-axis labels */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "70px",
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {[...Array(7)].map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={60}
              height={14}
              animation={false}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
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

    applyDimensionFilters,
    loadExecutiveViewData,
    loadRawSalesData,
    rawSalesData,
    experimentBasePath,
    executiveViewData,
    setForecastingPivotData,
    setForecastingDisagg,
    forecastingDisagg,

    loadDemandForecastingData,
    showFutureActuals,
    setShowFutureActuals,
    showMLForecast,
    setShowMLForecast,
    showPredictionInterval,
    setShowPredictionInterval,
    tablesFilterData,
    setFilterData,
    showRawActuals,
    setShowRawActuals,
    showOffsetForecast,
    setShowOffsetForecast,
    InvPriceFilterData,
    setFilterOptions,
  } = useDashboard();
  const { configState, demandForecastingFilterColumns, setTabFilterColumns } =
    useConfig();
  const priceCol = configState?.scenario_plan?.pricing_constraints?.price;
  const [filtersApplied, setFiltersApplied] = useState([]);
  const [dateColumns, setDateColumns] = useState([]);
  const [forecastDimensionToFilter, setForecastDimensionToFilter] = useState(
    Object.keys(dimensionFilterData).filter((key) => key !== "all") || []
  );

  const [chartDataProp, setChartDataProp] = useState({});

  const [isMetricsDataAvailable, setIsMetricsDataAvailable] = useState(null);

  const [filterData, setfilterData] = useState(InvPriceFilterData);

  const { userInfo, currentCompany } = useAuth();
  const { experiment_config, hasParquetFiles } = useExperiment();
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
  ];
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
  const currencyDict = {
    USD: "$",
    INR: "₹",
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

  const dateColumn = experiment_config.data.timestamp_column;

  if (experiment_config.ts_id_columns_disagg?.length === 0) {
  }

  const pivotPath =
    experiment_config.data.ts_id_columns_disagg?.length > 0 &&
    experiment_config.dashboard_settings?.show_forecasting_pivot_disaggregated
      ? "scenario_planning/K_best/forecast/forecast_disaggregated.csv"
      : "scenario_planning/K_best/forecast/forecast_data_pivot.csv";

  const forecast_data_pivot_fileName = `${experimentBasePath}/${pivotPath}`
    .split(".csv")[0]
    .split("/")
    .join("_");

  const forecast_data_pivot_metrics_filePath = `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`;
  const forecast_data_pivot_metrics_fileName =
    `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");
  const currentDatatype =
    experiment_config.data.ts_id_columns_disagg?.length > 0 &&
    experiment_config.dashboard_settings?.show_forecasting_pivot_disaggregated
      ? "Forecasting Pivot Disaggregated"
      : "Forecasting Pivot";
  useEffect(() => {
    const CurrentValue = dimensionFilterData[currentDimension].includes(
      currentValue
    )
      ? currentValue
      : dimensionFilterData[currentDimension][0];
    setCurrentValue(CurrentValue);
    const fetchDemandForecastingData = async () => {
      const demandForecasting = await loadDemandForecastingData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/${CurrentValue}.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
            value: [CurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        hasParquetFiles
      );
    };
    fetchDemandForecastingData();
  }, [currentValue, currentDimension]);

  useEffect(() => {
    console.log("Hello");
    if (demandForecastingFilterColumns.length === 0) {
      setTabFilterColumns(
        Object.keys(dimensionFilterData || {}).filter((key) => key !== "all"),
        "demandForecasting"
      );
    }
  }, []);

  const convertDimension = (dimension) => {
    const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };
    const changables = ["Cluster", "Forecast_Granularity"];

    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
  };
  useEffect(() => {
    const fileName = forecast_data_pivot_metrics_fileName;
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

    const dimensionFilters = filtersData.dimensionFilters;

    if (dimensionFilters) {
      let filtersArray = [];
      Object.keys(dimensionFilters).forEach((key) => {
        filtersArray = filtersArray.concat(dimensionFilters[key]);
      });
      setFiltersApplied(filtersArray);
    }
  }, [tablesFilterData]);

  useEffect(() => {
    const columnFilter =
      tablesFilterData[`${forecast_data_pivot_fileName}`]?.["Default"]
        ?.filterData?.columnFilter ?? [];

    setForecastDimensionToFilter((prev) =>
      Array.isArray(columnFilter) && columnFilter.length > 0
        ? prev.filter((dim) => columnFilter.includes(convertDimension(dim)))
        : prev
    );

    if (demandForecastingFilterColumns.length > 0) {
      setTabFilterColumns(
        Array.isArray(columnFilter) && columnFilter.length > 0
          ? (demandForecastingFilterColumns || []).filter((dim) =>
              columnFilter.includes(convertDimension(dim))
            )
          : demandForecastingFilterColumns || [],
        "demandForecasting"
      );
    }
  }, [
    tablesFilterData[`${forecast_data_pivot_fileName}`]?.["Default"]?.filterData
      ?.columnFilter,
  ]);
  console.log("Demand Data: " + demandForecastingData);

  console.log(dateColumn);
  const [extractedExecutiveViewData, setExtractedExecutiveViewData] = useState(
    extractExecutiveData(executiveViewData, currentValue)
  );

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
  console.log("forecastingType " + currentDatatype + pivotPath);
  const [featureGraphData, setfeatureGraphData] = useState(
    extractKeys(demandForecastingData, dateColumn)
  );
  console.log("Featuregraphdata", featureGraphData);
  const [data, setData] = useState(featureGraphData);

  const [boxContent, setboxContent] = useState(
    demandForecastingCards(transformedData, DataSet)
  );
  const [values, setvalues] = useState(dimensionFilterData[currentDimension]);
  const [selectedDimensions, setSelectedDimensions] = useState(["pred"]);
  console.log("dimension Filtered Data " + dimensionFilterData);
  useEffect(() => {
    const fetchGraphData = async () => {
      setData(await get_graph_data(data));
    };
    fetchGraphData();
    console.log("Featuregraphdata2", data);
  }, []);
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
  }, []); */

  console.log("TransformedData2:", executiveViewData);

  console.log("TransformedData3:", extractedExecutiveViewData);

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
        currentDatatype,
        `${forecast_data_pivot_fileName}`,
        "Default"
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
      }
    };

    if (isMetricsDataAvailable === false) {
      fetchExecutiveViewData();
      setExtractedExecutiveViewData(
        extractExecutiveData(executiveViewData, currentValue)
      );
    }
  }, [currentValue, currentDimension, isMetricsDataAvailable]);
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
        await get_graph_data(extractKeys(demandForecastingData, dateColumn))
      );
    };
    fetchGraphData();
    if (currentStartDate && currentEndDate) {
      const fetchDateFilter = async () => {
        setDateFilter(
          currentStartDate,
          currentEndDate,
          await get_graph_data(extractKeys(demandForecastingData, dateColumn))
        );
      };
      fetchDateFilter();
    } else {
      const fetchGraphData = async () => {
        setData(
          await get_graph_data(extractKeys(demandForecastingData, dateColumn))
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

  const getDateColumns = useCallback((data) => {
    const regex =
      /^\d{4}-\d{2}-\d{2}(?:\s+(Sales|Forecast|Consensus Forecast|Locked ML Forecast|Raw Actual|P\d+|PI High|PI Low|.*))?$/;
    return Object.keys(data).filter((col) => regex.test(col));
  }, []);

  const convertFilePathToFileName = (filePath) => {
    if (!filePath) return "";
    const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
    const pathComponents = withoutExtension.split("/");
    return pathComponents.join("_");
  };

  const filePathMetrics = `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`;
  const fetchChartData = useCallback(
    async (dateColumns) => {
      if (!filePathMetrics || !dateColumns || dateColumns.length === 0) return;

      try {
        const fileName = convertFilePathToFileName(filePathMetrics);
        const filterData =
          tablesFilterData[fileName]?.Default?.filterData || {};

        const aggregationColumns = dateColumns.reduce((acc, columnName) => {
          // date-prefixed price column → mean
          if (priceCol && columnName.endsWith(priceCol)) {
            acc[columnName] = "mean";
          }
          // everything else → sum
          else {
            acc[columnName] = "sum";
          }
          return acc;
        }, {});

        const payload = {
          fileName: fileName,
          filePath: filePathMetrics,
          filterData: filterData,
          sortingData: null,
          groupByColumns: [],
          aggregationColumns: aggregationColumns,
          filterConditions: [],
          paginationData: null,
          time: Date.now(),
        };

        const results = await callQueryEngineQuery(payload);
        setChartDataProp(results || {});
        console.log("Chart Data:", results);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
      }
    },
    [filePathMetrics, tablesFilterData, priceCol, dateColumns]
  );

  useEffect(() => {
    const loadData = async () => {
      if (!filePathMetrics) return;
      console.log("dateColumns", dateColumns);

      try {
        // First fetch column structure to identify date columns

        // Then fetch aggregated data for those columns
        if (dateColumns && dateColumns.length > 0) {
          await fetchChartData(dateColumns);
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
      }
    };

    loadData();
  }, [
    tablesFilterData[convertFilePathToFileName(filePathMetrics)]?.["Default"]
      ?.filterData?.dimensionFilters,
    dateColumns,
  ]);

  useEffect(() => {
    console.log("hello world");
    const fetchData = async () => {
      try {
        const data = await (hasParquetFiles
          ? fetchParquetData({
              filePath: `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            })
          : fetchCSVData({
              filePath: `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`,
              filterData: null,
              paginationData: { batchNo: 1, batchSize: 1 },
              sortingData: null,
            }));

        console.log("Metrics Data:", data);

        if (data && Object.keys(data).length > 0) {
          const dateCols = [...getDateColumns(data), priceCol];
          console.log(dateCols);
          setDateColumns(dateCols);
          setIsMetricsDataAvailable(true);
          const filterOptions = {
            dimensions: InvPriceFilterData,
            columns: Object.keys(data),
          };

          const fileName = `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`;
        } else {
          setIsMetricsDataAvailable(false);
        }
      } catch (error) {
        setIsMetricsDataAvailable(false);

        console.error("Error fetching metrics data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("currentValueOne " + currentValue + " " + currentDimension);
    setvalues(dimensionFilterData[currentDimension]);
    setCurrentValue(dimensionFilterData[currentDimension][0]);
  }, [currentDimension]);
  useEffect(() => {
    console.log("currentValueOne " + currentValue + " " + currentDimension);

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
  console.log("currentValueOne " + currentValue + " " + currentDimension);
  useEffect(() => {
    if (currentStartDate && currentEndDate) {
      setDateFilter(currentStartDate, currentEndDate, data);
    } else {
      const fetchGraphData = async () => {
        setData(
          await get_graph_data(extractKeys(demandForecastingData, dateColumn))
        );
      };
      fetchGraphData();
    }
  }, [currentStartDate, currentEndDate]);
  const handleToggleFutureActuals = () => {
    setShowFutureActuals(!showFutureActuals);
  };
  const handleToggleMLForecast = () => {
    setShowMLForecast(!showMLForecast);
  };
  const handleTogglePredictionInterval = () => {
    setShowPredictionInterval(!showPredictionInterval);
  };
  const handleToggleOffsetForecast = () => {
    setShowOffsetForecast(!showOffsetForecast);
  };
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
    const updatedDimensions = newValue.includes("pred")
      ? newValue
      : ["pred", ...newValue];
    setSelectedDimensions(updatedDimensions);
  };

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

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {isMetricsDataAvailable === false && (
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
      )}

      <Grid container spacing={3} padding={"12px 0px 12px 16px"}>
        {isMetricsDataAvailable === false && (
          <>
            {boxContent.map((box) => (
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
            ))}
          </>
        )}
        {chartDataProp && Object.keys(chartDataProp).length > 0 && (
          <Grid paddingLeft={"5px"} xs={12}>
            {" "}
            <ForecastMetrics
              filePath={`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`}
              reportName="Forecast Pivot Metrics"
              title="Predicted vs Actual"
              chartDataProp={chartDataProp}
            />
          </Grid>
        )}
      </Grid>

      {isMetricsDataAvailable === false && (
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
                  setDateFilter(
                    currentStartDate,
                    currentEndDate,
                    await get_graph_data(
                      extractKeys(demandForecastingData, dateColumn)
                    )
                  );
                } else {
                  setData(
                    await get_graph_data(
                      extractKeys(demandForecastingData, dateColumn)
                    )
                  );
                }
              }}
            />
          </Stack>
        </Stack>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Stack padding="10px 12px 10px 12px" spacing={2}>
            <Stack>
              {isMetricsDataAvailable && (
                <>
                  <Grid container spacing={3}>
                    {/* Filters Section */}

                    <FilterBlock
                      filtersApplied={filtersApplied}
                      dimensionsToFilter={demandForecastingFilterColumns}
                      setDimensionsToFilter={(value) => {
                        setTabFilterColumns(value, "demandForecasting");
                      }}
                      dimensionOptions={Object.keys(filterData)}
                      fileName={forecast_data_pivot_metrics_fileName}
                      reportName="Forecast Pivot Metrics"
                      fileName1={forecast_data_pivot_fileName}
                      reportName1="Forecasting Pivot"
                      filterOptions={dimensionFilterData}
                      filterData={tablesFilterData}
                      path={`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`}
                      path1={`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`}
                    />

                    {/* Chart Section */}
                    {chartDataProp && Object.keys(chartDataProp).length > 0 ? (
                      <>
                        <Grid item xs={12} lg={8.8} xl={9}>
                          <Box
                            sx={{
                              border: "1px solid #E4E7EC",
                              borderRadius: "8px",
                              height: "450px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <ForecastChart
                              filePath={`${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot_metrics.csv`}
                              reportName="Forecast Pivot Metrics"
                              title="Predicted vs Actual"
                              chartDataProp={chartDataProp}
                            />
                          </Box>
                        </Grid>
                      </>
                    ) : (
                      <Grid item xs={12} lg={8.8} xl={9}>
                        {" "}
                        <ChartSkeleton />{" "}
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      {isMetricsDataAvailable === false && (
        <Grid container spacing={1} paddingX={"16px"}>
          <Grid item xs={12} md={12}>
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
                const outofTimeInfo = dimensions.find(
                  (dim) => dim.label === "out_of_time_validation"
                );

                const actualKey = actualInfo?.key;
                const actualColor = actualInfo?.color;
                const mlForecastColor = mlForecastInfo?.color;
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
                  updatedData = updatedData.map((d) => {
                    if (d["pred"] === undefined) {
                      return { ...d, ml_forecast: undefined };
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
                          />{" "}
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
                          {showPredictionInterval && (
                            <>
                              <Area
                                type="linear"
                                dataKey="pred_upper_bound_range"
                                stroke="#8fd8a7"
                                fill="#8fd8a750" // Use the gradient for upper bound shadow
                                fillOpacity={1}
                              />

                              <Area
                                type="linear"
                                dataKey="pred_lower_bound_range"
                                stroke="#8fd8a7"
                                fill="#8fd8a750" // Use the gradient for lower bound shadow
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
                                stroke: "#d6a74d",
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
      )}

      {!experiment_config.dashboard_settings?.hide_forecasting_pivot_table ? (
        <CustomTable title={currentDatatype} needsVirtualization={true} />
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
            onClick={() => handleDownload(currentDatatype)}
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
