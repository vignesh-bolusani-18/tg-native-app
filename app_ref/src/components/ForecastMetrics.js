import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Grid, CircularProgress, Box, Typography, Card } from "@mui/material";
import { callQueryEngineQuery } from "../utils/queryEngine";
import { fetchCSVData, fetchParquetData } from "../utils/s3Utils";
import useDashboard from "../hooks/useDashboard";
import useAuth from "../hooks/useAuth";
import useExperiment from "../hooks/useExperiment";

import { ReactComponent as DataSet } from "../assets/Icons/DataSet.svg";
import NMetricCard from "./Metric Cards/NMetricCard";
import useConfig from "../hooks/useConfig";

const BoxComponent = ({ data }) => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0,
        },
        "& .MuiCardContent-root": {
          paddingBottom: "0px",
        },
        boxShadow: "0px 2px 2px #1018280D",
      }}
    >
      <NMetricCard data={data} />
    </Card>
  );
};

const ForecastMetrics = ({
  filePath,
  reportName,
  title = "Forecast Metrics",
  chartDataProp = null,
}) => {
  const { tablesFilterData } = useDashboard();
  const { userInfo } = useAuth();
  const { hasParquetFiles } = useExperiment();
  const { configState } = useConfig();
  const priceCol = configState?.scenario_plan?.pricing_constraints?.price;
  const frequency = configState.data.frequency;
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dateColumns, setDateColumns] = useState([]);

  // Helper function to get data points based on frequency for different time periods
  const getDataPointsForPeriod = useCallback((days, frequency) => {
    switch (frequency?.toUpperCase()) {
      case "M": // Monthly
        return Math.ceil(days / 30); // 30 days = 1 month, 60 days = 2 months, 90 days = 3 month
      case "W": // Weekly
        return Math.ceil(days / 7); // 7 days = 1 week, 30 days ≈ 4 weeks, etc.
      case "D": // Daily
        return days; // 30 days = 30 data points, etc.
      default:
        return Math.ceil(days / 30); // Default to monthly if frequency not specified
    }
  }, []);

  // Helper function to get period label based on frequency
  const getPeriodLabel = useCallback((days, frequency) => {
    switch (frequency?.toUpperCase()) {
      case "M": // Monthly
        const months = Math.ceil(days / 30);
        return `${months} month${months > 1 ? "s" : ""}`;
      case "W": // Weekly
        const weeks = Math.ceil(days / 7);
        return `${weeks} week${weeks > 1 ? "s" : ""}`;
      case "D": // Daily
        return `${days} day${days > 1 ? "s" : ""}`;
      default:
        const defaultMonths = Math.ceil(days / 30);
        return `${defaultMonths} month${defaultMonths > 1 ? "s" : ""}`;
    }
  }, []);

  // Helper function to get divisor for per-day calculations
  const getDivisorForPerDay = useCallback((dataPoints, frequency) => {
    switch (frequency?.toUpperCase()) {
      case "M": // Monthly
        return dataPoints * 30; // Convert months to days
      case "W": // Weekly
        return dataPoints * 7; // Convert weeks to days
      case "D": // Daily
        return dataPoints; // Already in days
      default:
        return dataPoints * 30; // Default to monthly
    }
  }, []);

  // Helper function to format numbers
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

  // Helper function to format percentages
  const formatToPercent = (value) => {
    if (value == null || isNaN(value)) return "0%";
    return `${Number(value).toFixed(1)}%`;
  };

  // Convert file path to file name for filter lookup
  const convertFilePathToFileName = (filePath) => {
    if (!filePath) return "";
    const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
    const pathComponents = withoutExtension.split("/");
    return pathComponents.join("_");
  };

  // Function to get date columns from data
  const getDateColumns = useCallback((data) => {
    const regex =
      /^\d{4}-\d{2}-\d{2}(?:\s+(Sales|Forecast|Consensus Forecast|Locked ML Forecast|Raw Actual|P\d+|PI High|PI Low|.*))?$/;
    return Object.keys(data)?.filter((col) => regex.test(col));
  }, []);

  // Fetch column structure to identify date columns
  const fetchColumnStructure = useCallback(async () => {
    if (!filePath) return;

    try {
      setIsLoading(true);
      const data = await (hasParquetFiles
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
          }));

      const dateCols = [...getDateColumns(data), priceCol];
      setDateColumns(dateCols);

      return dateCols;
    } catch (error) {
      console.error("Error fetching column structure:", error);
      return [];
    }
  }, []);

  // Fetch aggregated chart data
  const fetchChartData = useCallback(
    async (dateColumns) => {
      if (!filePath || !dateColumns || dateColumns.length === 0) return;

      try {
        const fileName = convertFilePathToFileName(filePath);
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
          filePath: filePath,
          filterData: filterData,
          sortingData: null,
          groupByColumns: [],
          aggregationColumns: aggregationColumns,
          filterConditions: [],
          paginationData: null,
          time: Date.now(),
        };

        const results = await callQueryEngineQuery(payload);
        setChartData(results || {});
        console.log("Chart Data:", results);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filePath, tablesFilterData, priceCol]
  );

  // Fetch data when component mounts or filters change
  useEffect(() => {
    const loadData = async () => {
      if (!filePath) return;

      setIsLoading(true);
      try {
        // First fetch column structure to identify date columns
        const dateCols = await fetchColumnStructure();

        // Then fetch aggregated data for those columns
        if (dateCols && dateCols.length > 0) {
          await fetchChartData(dateCols);
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!chartDataProp) {
      loadData();
    } else {
      setChartData(chartDataProp || {});
    }
  }, [
    tablesFilterData[convertFilePathToFileName(filePath)]?.["Default"]
      ?.filterData?.dimensionFilters, chartDataProp
  ]);

  // Transform chart data into structured format
  const transformedChartData = useMemo(() => {
    const dataMap = new Map();

    // Process sum data (volumes)
    Object.entries(chartData).forEach(([key, valueArray]) => {
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
          : 0;

      entry[type] = value > 0 ? value : 0;
    });

    // Process mean data (prices)
    Object.entries(chartData).forEach(([key, valueArray]) => {
      if (!key.startsWith("mean_")) return;

      const cleanKey = key.replace(/^mean_/, "");
      const parts = cleanKey.split(" ");
      const date = parts[0];
      const priceType = parts.slice(1).join(" ");

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const entry = dataMap.get(date);
      const value =
        Array.isArray(valueArray) && valueArray.length > 0
          ? parseFloat(valueArray[0]) || 0
          : 0;

      entry[`price_${priceType}`] = value;
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [chartData]);

  // Calculate metrics
  const calculatedMetrics = useMemo(() => {
    if (!transformedChartData || transformedChartData.length === 0) {
      return {
        predicted_sales_f: 0,
        predicted_sales_f_value: 0,
        accuracy: 76.6,
        bias: 2.4,
        Forecast_Per_Day: 0,
        sales_last30days: 0,
        sales_value_last30days: 0,
        sales_last60days: 0,
        sales_value_last60days: 0,
        sales_last90days: 0,
        sales_value_last90days: 0,
        Sales_Per_Day: 0,
        currentGrowth: 0,
        yoy: 0,
        new_lastCardBottomMetricTitle: "Forecast Period",
        new_lastCardBottomMetric: "No data available",
      };
    }

    // Calculate data points needed for each period based on frequency
    const dataPoints30Days = getDataPointsForPeriod(30, frequency);
    const dataPoints60Days = getDataPointsForPeriod(60, frequency);
    const dataPoints90Days = getDataPointsForPeriod(90, frequency);

    console.log(`Frequency: ${frequency}`);
    console.log(`Data points for 30 days: ${dataPoints30Days}`);
    console.log(`Data points for 60 days: ${dataPoints60Days}`);
    console.log(`Data points for 90 days: ${dataPoints90Days}`);

    // Find data with actual sales (Sales, Raw Actual, or Actual)
    const salesData = transformedChartData.filter(
      (d) =>
        (d.Sales && d.Sales > 0) ||
        (d["Raw Actual"] && d["Raw Actual"] > 0) ||
        (d.Actual && d.Actual > 0)
    );

    // Find forecast data
    const forecastData = transformedChartData.filter(
      (d) => d.Forecast && d.Forecast > 0
    );

    // Helper function to get price for a date
    const getPriceForDate = (item) => {
      const priceKeys = Object.keys(item).filter((key) =>
        key.startsWith("price_")
      );
      if (priceKeys.length > 0) {
        return item[priceKeys[0]] || 0;
      }
      return 0;
    };

    // Calculate predicted demand (sum of all forecast values)
    const predictedDemand = forecastData.reduce(
      (sum, item) => sum + (item.Forecast || 0),
      0
    );

    // Calculate predicted forecast value (volume * price)
    const predictedForecastValue = forecastData.reduce((sum, item) => {
      const volume = item.Forecast || 0;
      const price = chartData[`mean_${priceCol}`] || 0;
      return sum + volume * price;
    }, 0);

    // Calculate forecast per day based on frequency
    const forecastDivisor = getDivisorForPerDay(forecastData.length, frequency);
    const forecastPerDay =
      forecastDivisor > 0 ? predictedDemand / forecastDivisor : 0;

    // Get sales values (prefer Sales over Raw Actual over Actual)
    const getSalesValue = (item) =>
      item.Sales || item["Raw Actual"] || item.Actual || 0;

    // Calculate historical sales metrics based on frequency
    // Get the required number of data points for each period
    const sales30DaysData = salesData.slice(-dataPoints30Days);
    const sales60DaysData = salesData.slice(-dataPoints60Days);
    const sales90DaysData = salesData.slice(-dataPoints90Days);

    // Calculate sales totals
    const sales30days = sales30DaysData.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );
    const salesValue30days = sales30DaysData.reduce(
      (sum, item) => sum + getSalesValue(item) * getPriceForDate(item),
      0
    );

    const sales60days = sales60DaysData.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );
    const salesValue60days = sales60DaysData.reduce(
      (sum, item) => sum + getSalesValue(item) * getPriceForDate(item),
      0
    );

    const sales90days = sales90DaysData.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );
    const salesValue90days = sales90DaysData.reduce(
      (sum, item) => sum + getSalesValue(item) * getPriceForDate(item),
      0
    );

    // Calculate sales per day based on frequency
    const sales30DaysDivisor = getDivisorForPerDay(dataPoints30Days, frequency);
    const salesPerDay =
      sales30DaysDivisor > 0 ? sales30days / sales30DaysDivisor : 0;

    // Calculate Year-on-Year change
    const forecastDates = forecastData.map((d) => new Date(d.date));
    const minForecastDate =
      forecastDates.length > 0
        ? new Date(Math.min(...forecastDates))
        : new Date();
    const maxForecastDate =
      forecastDates.length > 0
        ? new Date(Math.max(...forecastDates))
        : new Date();

    // Get same period last year
    const lastYearStart = new Date(minForecastDate);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
    const lastYearEnd = new Date(maxForecastDate);
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);

    // Find sales data for the same period last year
    const lastYearSales = salesData.filter((d) => {
      const date = new Date(d.date);
      return date >= lastYearStart && date <= lastYearEnd;
    });

    const lastYearTotal = lastYearSales.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );
    const yoyChange =
      lastYearTotal > 0
        ? ((predictedDemand - lastYearTotal) / lastYearTotal) * 100
        : 0;

    // Calculate current growth (comparing forecast period to same historical period)
    const forecastPeriodDataPoints = forecastData.length;
    const historicalSalesForComparison = salesData.slice(
      -forecastPeriodDataPoints
    );
    const historicalTotal = historicalSalesForComparison.reduce(
      (sum, item) => sum + getSalesValue(item),
      0
    );
    const currentGrowth =
      historicalTotal > 0
        ? ((predictedDemand - historicalTotal) / historicalTotal) * 100
        : 0;

    // Calculate forecast period description
    const forecastPeriodStart =
      forecastDates.length > 0
        ? minForecastDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
    const forecastPeriodEnd =
      forecastDates.length > 0
        ? maxForecastDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
    const forecastPeriodLabel = getPeriodLabel(
      forecastData.length *
        (frequency === "M" ? 30 : frequency === "W" ? 7 : 1),
      frequency
    );

    return {
      predicted_sales_f: predictedDemand,
      predicted_sales_f_value: predictedForecastValue,
      accuracy: "-",
      bias: "-",
      Forecast_Per_Day: forecastPerDay,
      sales_last30days: sales30days,
      sales_value_last30days: salesValue30days,
      sales_last60days: sales60days,
      sales_value_last60days: salesValue60days,
      sales_last90days: sales90days,
      sales_value_last90days: salesValue90days,
      Sales_Per_Day: salesPerDay,
      currentGrowth: currentGrowth,
      yoy: yoyChange,
      new_lastCardBottomMetricTitle: "Forecast Period",
      new_lastCardBottomMetric:
        forecastDates.length > 0
          ? `${forecastPeriodStart} - ${forecastPeriodEnd} (${forecastPeriodLabel})`
          : "No forecast data available",
      currency: "$",
      // Additional info for debugging
      frequency: frequency,
      dataPoints30: dataPoints30Days,
      dataPoints60: dataPoints60Days,
      dataPoints90: dataPoints90Days,
    };
  }, [
    transformedChartData,
    frequency,
    getDataPointsForPeriod,
    getPeriodLabel,
    getDivisorForPerDay,
    chartData,
    priceCol,
    chartDataProp
  ]);

  console.log("calculatedMetrics", calculatedMetrics);

  // Generate box content for Grid layout with frequency-aware labels
  const boxContent = useMemo(() => {
    const transformedData = calculatedMetrics;

    return [
      {
        id: "forecast-metrics",
        icon: DataSet,
        title: "Forecast",
        type: "n-metrics",
        metric1title: "Predicted demand",
        metric1: formatNumber(transformedData.predicted_sales_f),
        subMetric1:
          transformedData.predicted_sales_f_value > 0
            ? `${transformedData.currency} ${formatNumber(
                transformedData.predicted_sales_f_value
              )}`
            : null,
        metric2title: "Accuracy",
        metric2: "_",
        metric3title: "Bias",
        metric3: "_",
        bottomMetricTitle: "Forecast Per Day",
        bottomMetric: formatNumber(
          Math.floor(transformedData.Forecast_Per_Day)
        ),
      },
      {
        id: "historical-sales-metrics",
        icon: DataSet,
        title: "Historical Sales",
        type: "n-metrics",
        metric1title: "30 Days",
        metric1: formatNumber(transformedData.sales_last30days),
        subMetric1:
          transformedData.sales_value_last30days > 0
            ? `${transformedData.currency} ${formatNumber(
                transformedData.sales_value_last30days
              )}`
            : null,
        metric2title: "60 Days",
        metric2: formatNumber(transformedData.sales_last60days),
        subMetric2:
          transformedData.sales_value_last60days > 0
            ? `${transformedData.currency} ${formatNumber(
                transformedData.sales_value_last60days
              )}`
            : null,
        metric3title: "90 Days",
        metric3: formatNumber(transformedData.sales_last90days),
        subMetric3:
          transformedData.sales_value_last90days > 0
            ? `${transformedData.currency} ${formatNumber(
                transformedData.sales_value_last90days
              )}`
            : null,
        bottomMetricTitle: "Sales Per Day",
        bottomMetric: formatNumber(Math.floor(transformedData.Sales_Per_Day)),
      },
      {
        id: "growth-metrics",
        icon: DataSet,
        title: "Growth",
        type: "n-metrics",
        metric1title: "Year-On-Year Change",
        metric1:
          formatToPercent(transformedData.yoy)[0] !== "-"
            ? `+ ${formatToPercent(transformedData.yoy)}`
            : formatToPercent(transformedData.yoy),
        metric2title: "Current Growth",
        metric2:
          formatToPercent(transformedData.currentGrowth)[0] !== "-"
            ? `+ ${formatToPercent(transformedData.currentGrowth)}`
            : formatToPercent(transformedData.currentGrowth),
        bottomMetricTitle: transformedData.new_lastCardBottomMetricTitle,
        bottomMetric: transformedData.new_lastCardBottomMetric,
      },
    ];
  }, [calculatedMetrics, getPeriodLabel, frequency]);

  console.log("Box content:", boxContent);

  // Show loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          padding: "",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (!filePath) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          padding: "",
        }}
      >
        <Typography color="textSecondary">No file path provided</Typography>
      </Box>
    );
  }

  // Render metrics in Grid layout
  return (
    <Grid container spacing={3} padding={"12px 16px 12px 16px"}>
      {boxContent.map((box) => {
        return (
          <Grid item xs={12} md={4} key={box.id}>
            <BoxComponent data={box} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ForecastMetrics;
