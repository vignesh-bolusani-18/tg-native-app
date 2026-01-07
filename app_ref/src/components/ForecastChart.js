import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  format,
  parseISO,
  isWithinInterval,
  endOfMonth,
  isSameMonth,
} from "date-fns";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useConfig from "../hooks/useConfig";

// Utility function to format numbers with K, M, B suffixes
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0";

  const num = parseFloat(value);
  const absNum = Math.abs(num);

  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(2) + "B";
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  } else {
    return num.toFixed(2);
  }
};
const FormateYAxis = (value) => {
  if (value === 0) return "0";
  if (!value || isNaN(value)) return "0";

  const num = parseFloat(value);
  const absValue = Math.abs(num);

  if (absValue >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (absValue >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (absValue >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  // For numbers less than 1000, show as integers if whole number, otherwise 1 decimal
  return Number.isInteger(num) ? num.toString() : num.toFixed(1);
};

// Calculate accuracy and bias
const calculateMetrics = (sales, forecast, absError) => {
  if (!sales || sales === 0) return null;

  const absoluteError = absError;

  const accuracy = (1 - absoluteError / sales) * 100;
  const bias = (forecast / sales) * 100;

  return { accuracy, bias };
};

const ChartHeaderWithControls = ({
  title,
  primaryControls = [],
  secondaryControls = [],
  onMenuControlChange,
  isLoading,
  metricsDisplay,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        padding: "10px 14px",
        borderBottom: "1px solid #EAECF0",
        backgroundColor: "#FAFAFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "42px",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          color: "#344054",
          flexShrink: 0,
          marginRight: "12px",
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Metrics Display */}

        {/* Primary Controls - Always visible */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          {primaryControls.map((control, index) => (
            <FormControlLabel
              key={index}
              sx={{
                margin: 0,
                ".MuiFormControlLabel-label": {
                  fontSize: "11px",
                  fontFamily: "Inter",
                  fontWeight: 500,
                  color: "#344054",
                  whiteSpace: "nowrap",
                },
              }}
              control={
                <Checkbox
                  checked={control.checked}
                  onChange={control.onChange}
                  color="primary"
                  size="small"
                  sx={{
                    padding: "3px",
                    "& .MuiSvgIcon-root": { fontSize: 14 },
                    color: control.color,
                    "&.Mui-checked": {
                      color: control.color,
                    },
                  }}
                />
              }
              label={
                control.label === "Raw Actual"
                  ? "Imputed Actuals"
                  : control.label
              }
            />
          ))}
        </Box>

        {/* Menu for secondary controls */}
        {secondaryControls.length > 0 && (
          <>
            <IconButton
              onClick={handleMenuClick}
              sx={{
                padding: "4px",
                border: "1px solid #D0D5DD",
                borderRadius: "4px",
                backgroundColor: anchorEl ? "#F9FAFB" : "transparent",
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#98A2B3",
                },
              }}
            >
              <MoreVertIcon sx={{ fontSize: 14, color: "#667085" }} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  minWidth: 180,
                  maxWidth: 200,
                  backgroundColor: "#FFF",
                  boxShadow: "0px 8px 32px rgba(16, 24, 40, 0.16)",
                  p: 0,
                  marginTop: "6px",
                  maxHeight: 250,
                },
              }}
              MenuListProps={{
                sx: {
                  p: 0,
                  margin: "0px",
                  maxHeight: 220,
                  overflowY: "auto",
                },
              }}
            >
              <Typography
                sx={{
                  padding: "8px 12px 6px 12px",
                  fontFamily: "Inter",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#344054",
                  borderBottom: "1px solid #EAECF0",
                  margin: 0,
                }}
              >
                Chart Series
              </Typography>

              {secondaryControls.map((control, index) => (
                <Box key={index}>
                  <MenuItem
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#344054",
                      px: 1.5,
                      py: "6px",
                      minHeight: "unset",
                      borderRadius: 0,
                      display: "flex",
                      alignItems: "center",
                      "&:hover": {
                        backgroundColor: "#F9F5FF",
                        color: "#7F56D9",
                      },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={control.checked}
                      onChange={(e) => {
                        control.onChange(e);
                        onMenuControlChange?.();
                      }}
                      size="small"
                      sx={{
                        m: 0,
                        p: 0,
                        mr: 1,
                        "& .MuiSvgIcon-root": { fontSize: 14 },
                        color: control.color,
                        "&.Mui-checked": {
                          color: control.color,
                        },
                      }}
                    />
                    {control.label}
                  </MenuItem>
                  {index < secondaryControls.length - 1 && (
                    <Box sx={{ borderBottom: "1px solid #EAECF0", mx: 0 }} />
                  )}
                </Box>
              ))}
            </Menu>
          </>
        )}

        {isLoading && (
          <CircularProgress size={16} sx={{ color: "#667085", ml: 1 }} />
        )}
      </Box>
    </Box>
  );
};

const ForecastChart = ({
  data = {},
  showEnrichment = false,
  filterData = {},
}) => {
  const {
    enrichment_bydate_multi_filter,
    toggleChartMetric,
    initializeChartMetrics,
    metricVisibility
  } = useConfig();
  console.log(enrichment_bydate_multi_filter, filterData);

  // Define primary metrics that should always be visible (forecast moved to secondary)
  const primaryMetrics = [
    "sales",
    "lockedMlForecast",
    "consensusForecast",
    "enrichment",
    "rawActual",
    "lySales",
  ];

  // Dynamic state for all metrics
  

  // Check if two arrays have exactly the same values (order doesn't matter)
  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort();
    const bSorted = [...b].sort();

    return aSorted.every((value, index) => value === bSorted[index]);
  };

  // Check if two objects have exactly the same keys and values
  const objectsEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1 ?? {});
    const keys2 = Object.keys(obj2 ?? {});

    // Only consider keys where values are non-empty arrays
    const filteredKeys1 = keys1.filter(
      (key) => !(Array.isArray(obj1[key]) && obj1[key].length === 0)
    );
    const filteredKeys2 = keys2.filter(
      (key) => !(Array.isArray(obj2[key]) && obj2[key].length === 0)
    );

    if (filteredKeys1.length !== filteredKeys2.length) return false;

    return filteredKeys1.every((key) => {
      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        return arraysEqual(obj1[key], obj2[key]);
      }
      return obj1[key] === obj2[key];
    });
  };

  // Extract available metrics from data and set up colors
  const { availableMetrics, colors, metricKeyMap } = useMemo(() => {
    const metrics = new Set();
    const dataMap = new Map();
    const keyToMetricMap = new Map();

    // Generate dynamic color palette
    const generateColor = (index) => {
      const colors = [
        "#FF6B6B",
        "#7f7f7f",
        "#d62728",
        "#FFD166",
        "#6A0572",
        "#FF00FF",
        "#073B4C",
        "#EF476F",
        "#F78C6B",
        "#7DDF64",
      ];
      return colors[index % colors.length];
    };

    // Process data to extract all available metric types dynamically
    Object.entries(data).forEach(([key, valueArray]) => {
      const cleanKey = key.replace(/^sum_/, "");
      const parts = cleanKey.split(" ");
      const date = parts[0];
      const type = parts.slice(1).join(" ");

      if (!type) return;

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const entry = dataMap.get(date);
      const value =
        Array.isArray(valueArray) && valueArray.length > 0
          ? parseFloat(valueArray[0]) || 0
          : 0;

      let metricKey = type
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+(.)/g, (match, char) => char.toUpperCase())
        .replace(/\s+/g, "");

      keyToMetricMap.set(metricKey, type);

      if (metricKey && value > 0) {
        metrics.add(metricKey);
        entry[metricKey] = value;
      }
    });

    // Add enrichment if available
    if (showEnrichment && enrichment_bydate_multi_filter.length > 0) {
      const hasMatchingEnrichment = enrichment_bydate_multi_filter.some(
        (enrichment) => objectsEqual(enrichment.selectors, filterData)
      );
      if (hasMatchingEnrichment) {
        console.log(hasMatchingEnrichment);
        metrics.add("enrichment");
        keyToMetricMap.set("enrichment", "Enrichment");
      }
    }

    // Generate dynamic colors for all metrics
    const colorMap = {};
    const metricArray = Array.from(metrics);

    const predefinedColors = {
      sales: "#1f77b4",
      forecast: "#2ca02c", // Keep green for forecast
      lockedMlForecast: "#ff7f0e",
      consensusForecast: "#6f6f00",
      enrichment: "#9467bd",
      rawActual: "#6A0572",
      lySales: "#4ECDC4",
    };

    let customColorIndex = 0;
    metricArray.forEach((metric) => {
      if (predefinedColors[metric]) {
        colorMap[metric] = predefinedColors[metric];
      } else {
        colorMap[metric] = generateColor(customColorIndex++);
      }
    });

    return {
      availableMetrics: metricArray,
      colors: colorMap,
      metricKeyMap: keyToMetricMap,
    };
  }, [data, showEnrichment, enrichment_bydate_multi_filter, filterData]);

  // Initialize visibility state for all metrics
  React.useEffect(() => {
    // const newVisibility = {};
    // availableMetrics.forEach((metric) => {
    //   if (!(metric in metricVisibility)) {
    //     // forecast should be true by default even though it's in secondary
    //     const isVisibleByDefault =
    //       (primaryMetrics.includes(metric) &&
    //         metric !== "rawActual" &&
    //         metric !== "lySales") ||
    //       metric === "forecast";
    //     newVisibility[metric] = isVisibleByDefault;
    //   } else {
    //     newVisibility[metric] = metricVisibility[metric];
    //   }
    // });
    // setMetricVisibility((prev) => ({ ...prev, ...newVisibility }));
    if (availableMetrics.length > 0 && !Object.keys(metricVisibility).length > 0) {
      initializeChartMetrics( availableMetrics, primaryMetrics );
    }
  }, [availableMetrics]);

  // Transform data into chart format
  const chartData = useMemo(() => {
    const dataMap = new Map();

    Object.entries(data).forEach(([key, valueArray]) => {
      const cleanKey = key.replace(/^sum_/, "");
      const parts = cleanKey.split(" ");
      const date = parts[0];
      const type = parts.slice(1).join(" ");

      if (!type) return;

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const entry = dataMap.get(date);
      const value =
        Array.isArray(valueArray) && valueArray.length > 0
          ? parseFloat(valueArray[0]) || 0
          : 0;

      const metricKey = type
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+(.)/g, (match, char) => char.toUpperCase())
        .replace(/\s+/g, "");

      if (metricKey && value > 0) {
        entry[metricKey] = value;
      }
    });

    // Apply enrichments
    if (showEnrichment && enrichment_bydate_multi_filter.length > 0) {
      const enrichmentResults = new Map();

      enrichment_bydate_multi_filter.forEach((enrichment) => {
        const { selectors, date_range, enrichment_type, enrichment_value } =
          enrichment;

        const shouldApplyEnrichment = objectsEqual(selectors, filterData);

        if (shouldApplyEnrichment) {
          const [startDate, endDate] = date_range;
          const start = parseISO(startDate);
          const end = parseISO(endDate);

          dataMap.forEach((entry, dateStr) => {
            const date = parseISO(dateStr);
            if (isWithinInterval(date, { start, end })) {
              if (!enrichmentResults.has(dateStr)) {
                enrichmentResults.set(dateStr, {
                  value: entry.forecast || entry.lockedmlforecast || 0,
                  hasData: true,
                });
              }

              const currentResult = enrichmentResults.get(dateStr);

              if (enrichment_type === "uplift") {
                currentResult.value =
                  currentResult.value * (1 + enrichment_value / 100);
              } else if (
                enrichment_type === "upper_bound" ||
                enrichment_type === "lower_bound"
              ) {
                const enrichmentField = enrichment_type
                  .toLowerCase()
                  .replace(/_([a-z])/g, (_, char) => char.toUpperCase());

                currentResult.value =
                  entry[enrichmentField] ?? currentResult.value;
              } else {
                const enrichmentField = enrichment_type
                  .toLowerCase()
                  .replace(" ", "");
                currentResult.value =
                  entry[enrichmentField] || currentResult.value;
              }
            }
          });
        }
      });

      enrichmentResults.forEach((result, dateStr) => {
        if (result.hasData && dataMap.has(dateStr)) {
          const entry = dataMap.get(dateStr);
          entry.enrichment = result.value;
        }
      });
    }

    // Process lySales to only show for forecast points
    dataMap.forEach((entry, dateStr) => {
      if (entry.lySales && !entry.forecast) {
        delete entry.lySales;
      }
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [data, showEnrichment, enrichment_bydate_multi_filter, filterData]);

  // Filter chart data based on sales visibility
  const filteredChartData = useMemo(() => {
    if (!metricVisibility.sales) {
      const firstForecastIndex = chartData.findIndex(
        (item) =>
          item.forecast ||
          item.lockedMlForecast ||
          item.consensusForecast ||
          item.enrichment
      );

      if (firstForecastIndex !== -1) {
        return chartData.slice(firstForecastIndex);
      }
    }
    return chartData;
  }, [chartData, metricVisibility.sales]);

  // Calculate metrics for the last sales timestamp
  const metricsDisplay = useMemo(() => {
    let mlAccuracy = null;
    let consensusAccuracy = null;

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Find all data points with sales
    const salesDataPoints = chartData
      .map((item, index) => ({ ...item, index }))
      .filter((item) => item.sales)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

    if (salesDataPoints.length === 0) {
      return null;
    }

    // Check if the most recent sales point is current month
    const mostRecentSalesPoint = salesDataPoints[0];
    const mostRecentDate = new Date(mostRecentSalesPoint.date);
    const isMostRecentCurrentMonth =
      mostRecentDate.getMonth() === currentMonth &&
      mostRecentDate.getFullYear() === currentYear;

    // Determine which data point to use for metrics
    let targetDataPoint;
    if (isMostRecentCurrentMonth && salesDataPoints.length > 1) {
      // Use second last timestamp if current month and we have previous data
      targetDataPoint = salesDataPoints[1];
    } else {
      // Use last timestamp otherwise
      targetDataPoint = mostRecentSalesPoint;
    }

    const item = targetDataPoint;

    console.log(item)

    // Calculate ML accuracy if lockedMlForecast exists
    if (item.lockedMlForecast && item.lockedMlForecastAbsError) {
      const metrics = calculateMetrics(
        item.sales,
        item.lockedMlForecast,
        item.lockedMlForecastAbsError
      );
      if (metrics) mlAccuracy = metrics.accuracy;
    }

    // Calculate Consensus accuracy if consensusForecast exists
    if (item.consensusForecast && item.consensusForecastAbsError) {
      const metrics = calculateMetrics(
        item.sales,
        item.consensusForecast,
        item.consensusForecastAbsError
      );
      if (metrics) consensusAccuracy = metrics.accuracy;
    }

    // Only return if we have at least one metric to display
    if (mlAccuracy !== null || consensusAccuracy !== null) {
      return { mlAccuracy, consensusAccuracy };
    }

    return null;
  }, [chartData]);

  // Generate metric labels
  const getMetricLabel = (metric) => {
    return metricKeyMap.get(metric) || metric;
  };

  // Toggle handler for metrics
  const handleToggleMetric = (metric) => {
    // setMetricVisibility((prev) => ({
    //   ...prev,
    //   [metric]: !prev[metric],
    // }));
    toggleChartMetric(metric)
  };

  const absoluteErrorMetrics = [
    "lockedMlForecastAbsError",
    "consensusForecastAbsError",
    "forecastAbsError",
  ];

  // Separate primary and secondary controls (forecast moved to secondary)
  const primaryControls = primaryMetrics
    .filter((metric) => availableMetrics.includes(metric))
    .map((metric) => ({
      label: getMetricLabel(metric),
      checked: metricVisibility[metric] || false,
      onChange: () => handleToggleMetric(metric),
      color: colors[metric],
    }));

  const secondaryControls = availableMetrics
    .filter(
      (metric) => ![...primaryMetrics, ...absoluteErrorMetrics].includes(metric)
    )
    .map((metric) => ({
      label: getMetricLabel(metric),
      checked: metricVisibility[metric] || false,
      onChange: () => handleToggleMetric(metric),
      color: colors[metric],
    }));

  // Custom tooltip with accuracy and bias
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formattedLabel = format(parseISO(label), "MMM dd, yyyy");
      console.log(filteredChartData)
      const dataPoint = filteredChartData.find((item) => item.date === label);
      console.log(dataPoint)
      console.log(payload);
      // Find sales, lockedMlForecast, and consensusForecast in payload
      const salesData = payload.find((p) => p.name === "sales");
      const mlForecastData = payload.find((p) => p.name === "lockedMlForecast");
      const consensusForecastData = payload.find(
        (p) => p.name === "consensusForecast"
      );
      const forecastData = payload.find(
        (p) => p.name === "forecast"
      );

      console.log(dataPoint.lockedMlForecastAbsError);

      let mlMetrics = null;
      let consensusMetrics = null;
      let forecastMetrics = null;

      if (salesData && mlForecastData && dataPoint.lockedMlForecastAbsError) {
        mlMetrics = calculateMetrics(
          salesData.value,
          mlForecastData.value,
          dataPoint.lockedMlForecastAbsError
        );
      }

      if (
        salesData &&
        consensusForecastData &&
        dataPoint.consensusForecastAbsError
      ) {
        consensusMetrics = calculateMetrics(
          salesData.value,
          consensusForecastData.value,
          dataPoint.consensusForecastAbsError
        );
      }
      if (
        salesData &&
        forecastData &&
        dataPoint.forecastAbsError
      ) {
        forecastMetrics = calculateMetrics(
          salesData.value,
          forecastData.value,
          dataPoint.forecastAbsError
        );
      }

      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            padding: "8px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            sx={{
              color: "#626F86",
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "20px",
              marginBottom: "4px",
            }}
          >
            {formattedLabel}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              style={{
                fontFamily: "Inter",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "20px",
                color: "#344054",
                display: "flex",
                alignItems: "center",
                marginBottom: "2px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: entry.color || "#000",
                  borderRadius: "50%",
                  marginRight: "8px",
                }}
              ></span>
              {getMetricLabel(entry.name) === "Raw Actual"
                ? "Imputed Actuals"
                : getMetricLabel(entry.name)}
              : {formatNumber(entry.value)}
            </Typography>
          ))}

          {/* Display ML Accuracy and Bias */}
          {mlMetrics && (
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #EAECF0" }}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#667085",
                  mb: 0.5,
                }}
              >
                ML Metrics
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#344054",
                }}
              >
                Accuracy: {mlMetrics.accuracy.toFixed(2)}%
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#344054",
                }}
              >
                Bias: {mlMetrics.bias.toFixed(2)}%
              </Typography>
            </Box>
          )}

          {/* Display Consensus Accuracy and Bias */}
          {consensusMetrics && (
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #EAECF0" }}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#667085",
                  mb: 0.5,
                }}
              >
                Consensus Metrics
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#344054",
                }}
              >
                Accuracy: {consensusMetrics.accuracy.toFixed(2)}%
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#344054",
                }}
              >
                Bias: {consensusMetrics.bias.toFixed(2)}%
              </Typography>
            </Box>
          )}
          {forecastMetrics && (
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #EAECF0" }}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#667085",
                  mb: 0.5,
                }}
              >
                Forecast Metrics
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#344054",
                }}
              >
                Accuracy: {forecastMetrics.accuracy.toFixed(2)}%
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#344054",
                }}
              >
                Bias: {forecastMetrics.bias.toFixed(2)}%
              </Typography>
            </Box>
          )}
        </div>
      );
    }
    return null;
  };

  // Format X-axis
  const formatXAxis = (tickItem) => {
    return format(parseISO(tickItem), "MMM yyyy");
  };

  // Get stroke dash array for different metric types
  const getStrokeDashArray = (metric) => {
    if (metric === "sales" || metric === "forecast") {
      return "0";
    }
    if (metric === "enrichment") {
      return "4 4";
    }
    return "2 2";
  };

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header with Controls */}
      <ChartHeaderWithControls
        title="Sales vs Forecast"
        primaryControls={primaryControls}
        secondaryControls={secondaryControls}
      />

      {/* Metrics Display */}

      {/* Chart Container */}
      <Box sx={{ flex: 1, py: 2, minHeight: 0, position: "relative" }}>
        {metricsDisplay && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 8,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 1, // smaller gap
              px: 1, // smaller horizontal padding
              py: 0.5, // smaller vertical padding
              borderRadius: 1,
              // optional subtle shadow
            }}
          >
            {metricsDisplay.mlAccuracy !== null && (
              <Box sx={{ textAlign: "right", display: "flex" }}>
                <Typography
                  sx={{
                    fontSize: "11px", // smaller font
                    fontWeight: 600,
                    fontFamily: "Inter",
                    color: "#101828",
                    mb: "1px",
                  }}
                >
                  ML Accuracy -
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "Inter",
                    color:
                      metricsDisplay.mlAccuracy >= 0 ? "#027A48" : "#B42318",
                    ml: 0.5,
                  }}
                >
                  {metricsDisplay.mlAccuracy.toFixed(2)}%
                </Typography>
              </Box>
            )}

            {metricsDisplay.consensusAccuracy !== null && (
              <Box sx={{ textAlign: "right", display: "flex" }}>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 600,
                    fontFamily: "Inter",
                    color: "#101828",
                    mb: "1px",
                  }}
                >
                  Consensus Accuracy -
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "Inter",
                    color:
                      metricsDisplay.consensusAccuracy > 0
                        ? "#027A48"
                        : "#B42318",
                    ml: 0.5,
                  }}
                >
                  {metricsDisplay.consensusAccuracy.toFixed(2)}%
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredChartData}
            margin={{ right: 3, left: 3, top: 10, bottom: 10 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#475467"
              tickFormatter={formatXAxis}
              interval={Math.floor(filteredChartData.length / 7)}
              tick={{
                fill: "#475467",
                fontSize: 12,
                fontWeight: 400,
                fontFamily: "Inter",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              tickFormatter={FormateYAxis}
              tick={{
                fill: "#475467",
                fontSize: 12,
                fontWeight: 400,
                fontFamily: "Inter",
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Dynamically render metrics */}
            {availableMetrics.map(
              (metric) =>
                metricVisibility[metric] && (
                  <Area
                    key={metric}
                    type="linear"
                    dataKey={metric}
                    strokeWidth={2}
                    stroke={colors[metric]}
                    fill="none"
                    dot={{
                      fill: colors[metric],
                      stroke: colors[metric],
                      strokeWidth: 1,
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                      fill: colors[metric],
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    strokeDasharray={getStrokeDashArray(metric)}
                  />
                )
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  );
};

export default ForecastChart;
