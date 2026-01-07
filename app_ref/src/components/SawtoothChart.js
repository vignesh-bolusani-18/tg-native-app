import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import {
  FormControlLabel,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  FormGroup,
  Skeleton,
  Grid,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { callQueryEngineQuery } from "../utils/queryEngine";
import { fetchCSVData, fetchParquetData } from "../utils/s3Utils";
import useDashboard from "../hooks/useDashboard";
import useExperiment from "../hooks/useExperiment";
import useConfig from "../hooks/useConfig";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export const ChartHeaderWithControls = ({
  title,
  primaryControls = [],
  secondaryControls = [],
  onMenuControlChange,
  isLoading,
  showMoreButton = true,
  chartTypeControls = [], // New prop for chart type controls
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1, // Increased gap to accommodate chart type controls
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
      {chartTypeControls.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              
              paddingRight: 2,
              flexShrink: 0,
            }}
          >
          
            {chartTypeControls.map((control, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  backgroundColor: control.checked ? "#F9FAFB" : "transparent",
                  border: control.checked ? "1px solid #D0D5DD" : "1px solid transparent",
                  "&:hover": {
                    backgroundColor: "#F2F4F7",
                  },
                }}
                onClick={control.onChange}
              >
                {control.icon}
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 500,
                    fontFamily: "Inter",
                    color: control.checked ? "#344054" : "#667085",
                    whiteSpace: "nowrap",
                  }}
                >
                  {control.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2, // Increased gap to accommodate chart type controls
        }}
      >
        {/* Chart Type Controls (Units/DOI) */}
        

        {/* Primary Controls - Always visible */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
           {secondaryControls.map((control, index) => (
            control.label === "Days On Inventory" && (<FormControlLabel
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
            />)
          ))}
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
        {secondaryControls.length > 0 && showMoreButton && (
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
                {control.label !== "Days On Inventory" && (  <MenuItem
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
                  </MenuItem>)}
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

export const MainContentSkeleton = () => (
  <Grid container spacing={1} paddingX={"12px"} paddingY={"6px"}>
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

        <Box sx={{ padding: "12px", height: "calc(100% - 60px)" }}>
          <Box sx={{ marginBottom: "12px", height: "220px" }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>

          <Box sx={{ height: "170px" }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
        </Box>
      </Box>
    </Grid>
  </Grid>
);


const formatNumber = (value) => {
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

  return Number.isInteger(num) ? num.toString() : num.toFixed(1);
};

const SawtoothChart = ({ filePath, valueFilePath, isValueData, unitOrRevenue, reportName , forecastStartDateRef }) => {
  const { tablesFilterData } = useDashboard();
  const { hasParquetFiles } = useExperiment();
  const { configState , activeSeries, setActiveSeries, activeDaysSeries, setActiveDaysSeries } = useConfig();
  console.log(activeSeries , activeDaysSeries)
  const priceCol = configState?.scenario_plan?.pricing_constraints?.price;

  const [chartData, setChartData] = useState({});
  const [inventoryDaysData, setInventoryDaysData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [dateColumns, setDateColumns] = useState([]);
  // const [activeSeries, setActiveSeries] = useState(["Beginning Inventory"]);
  // const [activeDaysSeries, setActiveDaysSeries] = useState(["Days On Inventory"]); // Start with empty for Days series
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  const sawtoothOptions = [
    "Beginning Inventory",
    "In Transit",
    "Reorder Received",
    "Forecast",
   
  ];

  const inventoryDaysOptions = [
    "Days On Inventory",
    "Days On Inventory With Pending",
  ];

  const colorPalette = {
    "Beginning Inventory": "#1f77b4",
    "In Transit": "#ff7f0e",
    "Reorder Received": "#2ca02c",
    Forecast: "#9467bd",
    "Days On Inventory": "#d62728",
    "Days On Inventory With Pending": "#8c564b",
  };

  const getLineStyle = (seriesName) => {
    const styleMap = {
      "Beginning Inventory": { color: colorPalette[seriesName], strokeDasharray: undefined },
      "Days On Inventory": { color: colorPalette[seriesName], strokeDasharray: undefined },
      "Days On Inventory With Pending": { color: colorPalette[seriesName], strokeDasharray: "2 2" },
    };
    
    return styleMap[seriesName] || { 
      color: colorPalette[seriesName], 
      strokeDasharray: "2 2" 
    };
  };

  const convertFilePathToFileName = (filePath) => {
    if (!filePath) return "";
    const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
    const pathComponents = withoutExtension.split("/");
    return pathComponents.join("_");
  };

  const getDateColumns = useCallback((data) => {
    const regex = /^\d{4}-\d{2}-\d{2}(?:\s+.*)?$/;
    return Object.keys(data).filter((col) => regex.test(col));
  }, []);

  const fetchColumnStructure = useCallback(async () => {
    if (!filePath) return [];

    try {
      setIsLoading(true);
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 1 },
            sortingData: null,
          })
        : fetchCSVData({
            filePath,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 1 },
            sortingData: null,
          }));

      const dateCols = getDateColumns(data);
      console.log(dateCols);
      forecastStartDateRef.current = dateCols[0];
      setDateColumns(dateCols);
      return dateCols;
    } catch (error) {
      console.error("Error fetching column structure:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filePath, hasParquetFiles, getDateColumns]);

  const fetchChartData = useCallback(
    async (filterName, dateCols, useMean = false) => {
      if (!filePath || !dateCols?.length) return null;

      try {
        const fileName = convertFilePathToFileName(unitOrRevenue === "revenue" ? valueFilePath : filePath);
        const rawFilterData =
          tablesFilterData[fileName]?.Default?.filterData || {};

        const filterData = {
          ...rawFilterData,
          dimensionFilters: rawFilterData.dimensionFilters
            ? Object.fromEntries(
                Object.entries(rawFilterData.dimensionFilters).filter(
                  ([key]) => key !== "Variable"
                )
              )
            : {},
        };

        console.log(filterData)

        const aggregationColumns = dateCols.reduce((acc, columnName) => {
          // For inventory days metrics, always use mean
          // For other metrics, use mean for price columns, sum for others
          if (useMean || (priceCol && columnName.endsWith(priceCol))) {
            acc[columnName] = "mean";
          } else {
            acc[columnName] = "sum";
          }
          return acc;
        }, {});

        const payload = {
          fileName,
          filePath: unitOrRevenue === "revenue" ? valueFilePath : filePath,
          filterData,
          sortingData: null,
          groupByColumns: [],
          aggregationColumns,
          filterConditions: [
            {
              column: "Variable",
              type: "string",
              operator: "equals",
              value: filterName,
              valueTo: "",
              multiValues: [],
            },
          ],
          paginationData: null,
          time: Date.now(),
        };

        const results = await callQueryEngineQuery(payload);
        return results;
      } catch (error) {
        console.error("Error fetching chart data:", error);
        return null;
      }
    },
    [filePath, tablesFilterData, priceCol, unitOrRevenue]
  );

  // Initial load for main sawtooth chart
  useEffect(() => {
    const loadData = async () => {
      const dateCols = await fetchColumnStructure();
      if (dateCols?.length > 0) {
        // Load main sawtooth data
        const results = await fetchChartData("Beginning Inventory", dateCols);
        setChartData({ "Beginning Inventory": results });
        
        // Load inventory days data but don't activate it by default
        const daysResults = await fetchChartData("Days On Inventory", dateCols, true);
        setInventoryDaysData({ "Days On Inventory": daysResults });
        
        setHasInitiallyLoaded(true);
      }
    };
    loadData();
  }, [filePath, unitOrRevenue]);

  // Reload when filters change for main sawtooth chart
  useEffect(() => {
    const loadData = async () => {
      if (!filePath || dateColumns.length === 0) return;
      setIsLoading(true);

      try {
        const newChartData = {};
        for (const seriesName of activeSeries) {
          const results = await fetchChartData(seriesName, dateColumns);
          if (results) {
            newChartData[seriesName] = results;
          }
        }
        setChartData(newChartData);
      } catch (error) {
        console.error("Error reloading chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    tablesFilterData[convertFilePathToFileName(filePath)]?.["Default"]
      ?.filterData?.dimensionFilters,
    tablesFilterData[convertFilePathToFileName(valueFilePath)]?.["Default"]
      ?.filterData?.dimensionFilters,
    activeSeries,
    dateColumns,
    filePath,
    fetchChartData,
    unitOrRevenue,
  ]);

  // Reload when filters change for inventory days chart
  useEffect(() => {
    const loadData = async () => {
      if (!filePath || dateColumns.length === 0) return;
      setIsLoadingDays(true);

      try {
        const newInventoryDaysData = {};
        for (const seriesName of activeDaysSeries) {
          const results = await fetchChartData(seriesName, dateColumns, true);
          if (results) {
            newInventoryDaysData[seriesName] = results;
          }
        }
        setInventoryDaysData(newInventoryDaysData);
      } catch (error) {
        console.error("Error reloading inventory days data:", error);
      } finally {
        setIsLoadingDays(false);
      }
    };

    loadData();
  }, [
    tablesFilterData[convertFilePathToFileName(filePath)]?.["Default"]
      ?.filterData?.dimensionFilters,
    tablesFilterData[convertFilePathToFileName(valueFilePath)]?.["Default"]
      ?.filterData?.dimensionFilters,
    activeDaysSeries,
    dateColumns,
    filePath,
    fetchChartData,
    unitOrRevenue,
  ]);

  const transformedData = useMemo(() => {
    const dataMap = new Map();

    // Process main sawtooth data
    Object.entries(chartData).forEach(([seriesName, result]) => {
      if (!result) return;

      Object.entries(result).forEach(([key, valueArray]) => {
        if (!key.startsWith("sum_") && !key.startsWith("mean_")) return;
        const cleanKey = key.replace(/^(sum|mean)_/, "");
        const parts = cleanKey.split(" ");
        const date = parts[0];

        if (!dataMap.has(date)) {
          dataMap.set(date, { date });
        }

        const entry = dataMap.get(date);
        const value =
          Array.isArray(valueArray) && valueArray.length > 0
            ? parseFloat(valueArray[0]) || 0
            : 0;

        entry[seriesName] = value > 0 ? value : undefined;
      });
    });

    // Process inventory days data
    Object.entries(inventoryDaysData).forEach(([seriesName, result]) => {
      if (!result) return;

      Object.entries(result).forEach(([key, valueArray]) => {
        if (!key.startsWith("mean_")) return;
        const cleanKey = key.replace(/^mean_/, "");
        const parts = cleanKey.split(" ");
        const date = parts[0];

        if (!dataMap.has(date)) {
          dataMap.set(date, { date });
        }

        const entry = dataMap.get(date);
        const value =
          Array.isArray(valueArray) && valueArray.length > 0
            ? parseFloat(valueArray[0]) || 0
            : 0;

        entry[seriesName] = value > 0 ? value : undefined;
      });
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [chartData, inventoryDaysData]);

  const toggleSeries = async (seriesName) => {
  const isActive = activeSeries.includes(seriesName);

  // Compute the updated array (Redux can't use callback updaters)
  let updatedSeries;
  if (isActive) {
    updatedSeries = activeSeries.filter((s) => s !== seriesName);
  } else {
    updatedSeries = [...activeSeries, seriesName];
  }

  // Dispatch updated array to Redux
  setActiveSeries(updatedSeries);

  // Fetch chart data only when enabling a new series
  if (!isActive && !chartData[seriesName]) {
    const results = await fetchChartData(seriesName, dateColumns);
    if (results) {
      setChartData((prev) => ({ ...prev, [seriesName]: results }));
    }
  }
};


 const toggleDaysSeries = async (seriesName) => {
  const isActive = activeDaysSeries.includes(seriesName);

  let updated;
  if (isActive) {
    updated = activeDaysSeries.filter((s) => s !== seriesName);
  } else {
    updated = [...activeDaysSeries, seriesName];
  }

  setActiveDaysSeries(updated);   // <── pass payload, not updater fn

  if (!isActive && !inventoryDaysData[seriesName]) {
    const results = await fetchChartData(seriesName, dateColumns, true);
    if (results) {
      setInventoryDaysData((prev) => ({ ...prev, [seriesName]: results }));
    }
  }
};


  const mainControls = sawtoothOptions.map((opt) => {
    const lineStyle = getLineStyle(opt);
    return {
      label: opt,
      checked: activeSeries.includes(opt),
      onChange: () => toggleSeries(opt),
      color: lineStyle.color,
    };
  });

  const daysControls = inventoryDaysOptions.map((opt) => {
    const lineStyle = getLineStyle(opt);
    return {
      label: opt,
      checked: activeDaysSeries.includes(opt),
      onChange: () => toggleDaysSeries(opt),
      color: lineStyle.color,
    };
  });

  const formatYAxis = (value) => {
    return formatNumber(value);
  };

  const formatDaysYAxis = (value) => {
    return `${value.toFixed(1)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    let formattedLabel = label;
    try {
      if (label) {
        formattedLabel = format(parseISO(label), "MMM dd, yyyy");
      }
    } catch (e) {
      console.warn("Tooltip label parsing failed:", label, e);
      formattedLabel = label || "";
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
          if (!entry || entry.value == null) return null;

          const isDaysMetric = entry.dataKey.includes("Days");
          const formattedValue = isDaysMetric 
            ? `${entry.value.toFixed(1)} days`
            : formatNumber(entry.value);

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
              {entry.dataKey}: {unitOrRevenue === "revenue" && !isDaysMetric ? `$${formattedValue}` : formattedValue}
            </Typography>
          );
        })}
      </div>
    );
  };

  const formatXAxis = (tickItem) => {
    return format(parseISO(tickItem), "MMM yyyy");
  };

  if (isLoading && !hasInitiallyLoaded) {
    return <MainContentSkeleton />;
  }

  const hasInventoryDaysData = activeDaysSeries.some(series => 
    transformedData.some(item => item[series] != null)
  );

  const hasMainChartData = activeSeries.some(series => 
    transformedData.some(item => item[series] != null)
  );

  // Calculate chart heights dynamically
  const calculateChartHeight = () => {
    let chartsToShow = 0;
    if (hasMainChartData) chartsToShow++;
    if (hasInventoryDaysData) chartsToShow++;
    
    if (chartsToShow === 0) return { topHeight: 0, bottomHeight: 0 };
    
    // If both charts are shown, use original distribution (DOI on top, Units on bottom)
    if (hasMainChartData && hasInventoryDaysData) {
      return { topHeight: 220, bottomHeight: 170 };
    }
    // If only one chart is shown, give it full height
    return { 
      topHeight: hasInventoryDaysData ? 390 : 0, 
      bottomHeight: hasMainChartData ? 390 : 0 
    };
  };

  const chartHeights = calculateChartHeight();

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", height: "100%" ,width: "100%" }}>
      {/* Header with Controls */}
      <ChartHeaderWithControls
        title="Sawtooth Inventory Analysis"
        primaryControls={mainControls}
        secondaryControls={daysControls}
        showMoreButton={true}
        isLoading={isLoading || isLoadingDays}
      />

      {/* Chart Container */}
      <Box sx={{ flex: 1, padding: "12px 0px", minHeight: 0 }}>
        {/* Days of Inventory Chart - TOP Chart (when selected) */}
        {hasInventoryDaysData && (
          <Box sx={{ marginBottom: hasMainChartData ? "12px" : 0 }}>
            <ResponsiveContainer height={chartHeights.topHeight}>
              <LineChart
                data={transformedData}
                syncId="sawtooth"
                margin={{ top: 5, right: 20, left: 15, bottom: hasMainChartData ? 0 : 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#475467"
                  tickFormatter={formatXAxis}
                  interval={Math.floor(transformedData.length / 7)}
                  allowDataOverflow
                  type="category"
                  tick={{
                    fill: "#475467",
                    fontSize: hasMainChartData ? 0 : 12, // Hide labels if Units chart is below
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
                  type="number"
                  tickFormatter={formatDaysYAxis}
                  tick={{
                    fill: "#475467",
                    fontSize: 12,
                    fontWeight: 400,
                    fontFamily: "Inter",
                  }}
                  label={{
                    value: "Days",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "#475467",
                      fontSize: 14,
                      fontWeight: 400,
                      fontFamily: "Inter",
                    },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                {activeDaysSeries.map((series) => {
                  const lineStyle = getLineStyle(series);

                  return (
                    <Line
                      key={series}
                      type="linear"
                      dataKey={series}
                      strokeWidth={2}
                      stroke={lineStyle.color}
                      strokeDasharray={lineStyle.strokeDasharray}
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
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Main Sawtooth Chart - BOTTOM Chart (Units/Revenue) */}
        {hasMainChartData && (
          <Box>
            <ResponsiveContainer height={chartHeights.bottomHeight}>
              <AreaChart
                data={transformedData}
                syncId="sawtooth"
                margin={{ top: 0, right: 20, left: 15, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#475467"
                  tickFormatter={formatXAxis}
                  interval={Math.floor(transformedData.length / 7)}
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
                  domain={["auto", "auto"]}
                  type="number"
                  tickFormatter={formatYAxis}
                  tick={{
                    fill: "#475467",
                    fontSize: 12,
                    fontWeight: 400,
                    fontFamily: "Inter",
                  }}
                  label={{
                    value: unitOrRevenue === "revenue" ? "Revenue" : "Units",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "#475467",
                      fontSize: 14,
                      fontWeight: 400,
                      fontFamily: "Inter",
                    },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                {activeSeries.map((series) => {
                  const lineStyle = getLineStyle(series);

                  return (
                    <Area
                      key={series}
                      type="linear"
                      dataKey={series}
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
        )}
        
        {/* Message when no data is selected */}
        {!hasMainChartData && !hasInventoryDaysData && (
          <Box sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "100%",
            color: "#667085",
            fontSize: "14px",
            fontFamily: "Inter"
          }}>
            Select at least one series to view data.
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default SawtoothChart;