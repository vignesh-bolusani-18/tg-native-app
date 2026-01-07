import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  FormGroup,
  CircularProgress,
  Skeleton,
  Grid,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { callQueryEngineQuery } from "../utils/queryEngine";
import { fetchCSVData, fetchParquetData } from "../utils/s3Utils";
import useDashboard from "../hooks/useDashboard";
import useAuth from "../hooks/useAuth";
import useExperiment from "../hooks/useExperiment";
import useConfig from "../hooks/useConfig";

const ChartHeaderWithControls = ({
  title,
  primaryControls = [],
  secondaryControls = [],
  onMenuControlChange,
  isLoading,
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
              label={control.label === "Raw Actual" ? "Imputed Actuals" : control.label}
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


const MainContentSkeleton = () => (
  <Grid container spacing={1} paddingX={"12px"} paddingY={"6px"}>
    {/* Enrichment Box Skeleton */}
    

    {/* Chart Section Skeleton */}
    <Grid
      item
      xs={12}
      md={12}
      sx={{
        padding: "6px 8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          border: "1px solid #EAECF0",
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 2px 2px #1018280D",
          height: "460px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Chart Header Skeleton */}
        <Box
          sx={{
            padding: "12px",
            borderBottom: "1px solid #EAECF0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width={300} height={24} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width={60} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={100} height={32} />
          </Stack>
        </Box>

        {/* Charts Skeleton */}
        <Box sx={{ padding: "12px", height: "calc(100% - 60px)" }}>
          {/* Top Chart Skeleton */}
          <Box sx={{ marginBottom: "12px", height: "220px" }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>

          {/* Bottom Chart Skeleton */}
          <Box sx={{ height: "170px" }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
        </Box>
      </Box>
    </Grid>
  </Grid>
);

const ForecastChart = ({
  filePath,
  reportName,
  title = "Sales vs Forecast",
  chartDataProp = null,
}) => {
  const { tablesFilterData } = useDashboard();
  const { userInfo } = useAuth();
  const { hasParquetFiles } = useExperiment();

  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState({});
  const [availableSeries, setAvailableSeries] = useState([]);
  const [dateColumns, setDateColumns] = useState([]);
   const {configState} = useConfig();
    const priceCol = configState?.scenario_plan?.pricing_constraints?.price;
  // Function to get line style and color for each series
  const getLineStyle = (seriesName) => {
    const lowerName = seriesName.toLowerCase();

    // Sales: Blue color, solid line
    if (lowerName === "sales") {
      return {
        color: "#1f77b4", // Blue
        strokeDasharray: undefined, // Solid line
      };
    }

    

    // Forecast: Green color, solid line
    if (lowerName === "forecast") {
      return {
        color: "#2ca02c", // Green
        strokeDasharray: undefined, // Solid line
      };
    }
    if (lowerName === "inventory") {
      return {
        color: "#1f77b4", // Green
        strokeDasharray: undefined, // Solid line
      };
    }


    // Actual: Solid line with orange color
    if (lowerName === "actual") {
      return {
        color: "#ff7f0e", // Orange
        strokeDasharray: undefined, // Solid line
      };
    }

    // Raw Actual: Purple color, dotted line
    if (lowerName === "raw actual") {
      return {
        color: "#9467bd", // Purple
        strokeDasharray: "2 2", // Dotted line
      };
    }

    // All others: Dotted lines with default colors
    return {
      color:
        colorPalette[availableSeries.indexOf(seriesName) % colorPalette.length],
      strokeDasharray: "2 2", // Dotted line
    };
  };

  // Colors for different series
  const colorPalette = [
    "#1f77b4",
    "#2ca02c",
    "#ff7f0e",
    "#6f6f00",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#d62728",
    "#1a9850",
  ];

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
      /^\d{4}-\d{2}-\d{2}(?:\s+(Sales|Forecast|Consensus Forecast|Locked ML Forecast|.*))?$/;
    return Object.keys(data).filter((col) => regex.test(col));
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

      console.log("data", data);

      const dateCols = getDateColumns(data);
      setDateColumns(dateCols);

      console.log("dateCols", dateCols);

      // Extract available series from date columns
      const series = dateCols
        .map((col) => {
          const parts = col.split(" ");
          return parts.slice(1).join(" ") || (title === "Sawtooth" ? "Inventory" : "Forecast");
        })
        .filter((type, index, self) => type && self.indexOf(type) === index);

      setAvailableSeries(series);

      // Initialize visibility - first two series visible, others hidden
      const initialVisibility = series.reduce((acc, seriesName, index) => {
        acc[seriesName] = index < 3;
        return acc;
      }, {});

      setVisibleSeries(initialVisibility);

      return dateCols;
    } catch (error) {
      console.error("Error fetching column structure:", error);
      return [];
    }
  }, [filePath, hasParquetFiles, getDateColumns]);

  // Fetch aggregated chart data
  const fetchChartData = useCallback(
    async (dateColumns) => {
      if (!filePath || !dateColumns || dateColumns.length === 0) return;

      try {
        const fileName = convertFilePathToFileName(filePath);
        console.log("fileName", fileName);
        const filterData =
          tablesFilterData[fileName]?.Default?.filterData || {};

        console.log(tablesFilterData);
        console.log("filterData", filterData);
        const aggregationColumns = dateColumns.reduce(
          (acc, columnName) => {
            // date-prefixed price column → mean
            if (priceCol && columnName.endsWith(priceCol)) {
              acc[columnName] = "mean";
            }
            // everything else → sum
            else {
              acc[columnName] = "sum";
            }
            return acc;
          },
          {}
        );

        const payload = {
          fileName: fileName,
          filePath: filePath,
          filterData: filterData,
          sortingData: null,
          groupByColumns: [],
          aggregationColumns: aggregationColumns,
          filterConditions:
            title === "Sawtooth"
              ? [
                  {
                    column: "Variable",
                    type: "string",
                    operator: "equals",
                    value: "Beginning Inventory",
                    valueTo: "",
                    multiValues: [],
                  },
                ]
              : [],
          paginationData: null,
          time: Date.now(),
        };

        const results = await callQueryEngineQuery(payload);
        console.log("results", results);
        setChartData(results || {});
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filePath, tablesFilterData]
  );

  console.log(chartDataProp)

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


    if(!chartDataProp){
       loadData();
    }else{

      console.log(chartDataProp)
      setChartData(chartDataProp || {});
    }

    loadData();
  }, [tablesFilterData[convertFilePathToFileName(filePath)]?.["Default"]?.filterData?.dimensionFilters]);

  // Transform data into chart format
  const transformedData = useMemo(() => {
    const dataMap = new Map();

    Object.entries(chartData).forEach(([key, valueArray]) => {
      if (!key.startsWith("sum_")) return;

      const cleanKey = key.replace(/^sum_/, "");
      const parts = cleanKey.split(" ");
      const date = parts[0];
      const type = parts.slice(1).join(" ") || (title === "Sawtooth" ? "Inventory" : "Forecast");

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const entry = dataMap.get(date);
      const value =
        Array.isArray(valueArray) && valueArray.length > 0
          ? parseFloat(valueArray[0]) || 0
          : 0;

      entry[type] = value > 0 ? value : undefined;
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [chartData]);

  // Toggle series visibility
  const toggleSeriesVisibility = (seriesName) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [seriesName]: !prev[seriesName],
    }));
  };

  // Get controls for the chart header
  const { primaryControls, secondaryControls } = useMemo(() => {
    const allSeries = availableSeries.map((seriesName, index) => {
      const lineStyle = getLineStyle(seriesName);

      return {
        label: seriesName,
        checked: visibleSeries[seriesName] || false,
        onChange: () => toggleSeriesVisibility(seriesName),
        color: lineStyle.color,
      };
    });

    // First two series as primary, rest as secondary
    return {
      primaryControls: allSeries.slice(0, 2),
      secondaryControls: allSeries.slice(2),
    };
  }, [availableSeries, visibleSeries]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    let formattedLabel = label;
    try {
      if (label) {
        formattedLabel = format(parseISO(label), "MMM dd, yyyy");
      }
    } catch (e) {
      console.warn("Tooltip label parsing failed:", label, e);
      formattedLabel = label || ""; // fallback to raw label
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
        {formattedLabel && (
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
        )}
        {payload.map((entry, index) => {
          if (!entry || entry.value == null) return null; // guard

          const valueNum = parseFloat(entry.value);
          const displayValue = Number.isInteger(valueNum)
            ? valueNum.toLocaleString()
            : valueNum.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

          return (
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
              {entry.dataKey === "Raw Actual" ? "Imputed Actuals" : entry.dataKey } : {displayValue}
            </Typography>
          );
        })}
      </div>
    );
  };

  // Format X-axis
  const formatXAxis = (tickItem) => {
    return format(parseISO(tickItem), "MMM yyyy");
  };

  if (!filePath) {
    return (
      <Box
        sx={{
          border: "1px solid #E4E7EC",
          borderRadius: "8px",
          height: "450px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFBFC",
        }}
      >
        <Typography color="textSecondary">No file path provided</Typography>
      </Box>
    );
  }

  if(isLoading && transformedData.length === 0) {
    return <MainContentSkeleton/>
  }

  return (
    <Stack
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Header with Controls */}
      <ChartHeaderWithControls
        title={title}
        primaryControls={primaryControls}
        secondaryControls={secondaryControls}
        isLoading={isLoading}
      />

      {/* Chart Container */}
      <Box sx={{ flex: 1, padding: "16px 6px", minHeight: 0, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={transformedData}
            margin={{ right: 30, left: 30, top: 10, bottom: 10 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#475467"
              tickFormatter={formatXAxis}
              interval={Math.max(1, Math.floor(transformedData.length / 7))}
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
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Render areas for each visible series */}
            {availableSeries.map((seriesName, index) => {
              if (!visibleSeries[seriesName]) return null;

              const lineStyle = getLineStyle(seriesName);

              return (
                <Area
                  key={seriesName}
                  type="linear"
                  dataKey={seriesName}
                  strokeWidth={2}
                  stroke={lineStyle.color}
                  fill="none"
                  dot={{
                    fill: lineStyle.color,
                    stroke: lineStyle.color,
                    strokeWidth: 1,
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                    fill: lineStyle.color,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  strokeDasharray={lineStyle.strokeDasharray}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  );
};

export default ForecastChart;
