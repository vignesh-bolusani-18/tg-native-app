import { Box, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomAutocomplete from "../../../components/CustomInputControls/CustomAutoComplete";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import useImpact from "../../../hooks/useImpact";
import { parallelChunkMap } from "../../../utils/parallelChunkMap";

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
              {formatKey(entry.name)}:{" "}
              {Number.isInteger(parseFloat(entry.value))
                ? parseFloat(entry.value)
                : parseFloat(entry.value).toFixed(4)}
            </>
          </Typography>
        ))}
      </div>
    );
  }
  return <Typography>Hi</Typography>;
};
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
const CustomLegend = ({ dimensions }) => {
  const displayLabels = [];

  dimensions.forEach(({ label, color }) => {
    displayLabels.push({ label, color });
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
const MetricsAnalysisGraph = ({ metricsAnalysisData }) => {
  const [graphData, setGraphData] = useState([]);
  const {
    setMetricsAnalysisGraphMetrics,
    clearMetricsAnalysisGraphMetrics,
    metricsAnalysisGraphMetrics,
  } = useImpact();
  const metrics = metricsAnalysisData.metric
    .filter((metric) => {
      // Get all values for this metric across different dates
      const metricValues = Object.keys(metricsAnalysisData)
        .filter((key) => key !== "metric") // Exclude the metrics array itself
        .map(
          (date) =>
            metricsAnalysisData[date][
              metricsAnalysisData.metric.indexOf(metric)
            ]
        );

      // Check if any value for this metric is numeric
      return metricValues.some((value) => {
        // Remove % sign if present and try to convert to number
        const cleanValue = String(value).replace("%", "");
        return !isNaN(cleanValue) && cleanValue.trim() !== "";
      });
    })
    .map((metric, index) => {
      let color;
      color = colors[index % colors.length];
      return {
        label: formatKey(metric),
        key: metric,
        color,
      };
    });

  const createDomains = (data, dateColumn) => {
    return Object.keys(data).reduce((acc, key) => {
      if (key !== dateColumn) {
        acc[key] = { top: "dataMax", bottom: "dataMin" };
      }
      return acc;
    }, {});
  };
  const [zoomSettings, setZoomSettings] = useState({
    left: "dataMin",
    right: "dataMax",
    refAreaLeft: "",
    refAreaRight: "",
    domains: createDomains(graphData, "time_stamp"),
  });

  const getAxisYDomain = (from, to, ref, offset) => {
    const refData = graphData.filter(
      (d) => d["time_stamp"] >= from && d["time_stamp"] <= to
    );
    console.log("refff", refData);
    setGraphData(refData);

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
  const formatXAxis = (tickItem) => {
    return format(parseISO(tickItem), "MMM yyyy");
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
    metricsAnalysisData.metric.forEach((key) => {
      const [newBottom, newTop] = getAxisYDomain(newLeft, newRight, key, 10);
      newDomains[key] = { bottom: newBottom, top: newTop };
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
  const get_graph_data = async (data) => {
    console.log("Get Graph Input Data: ", data);
    const transformedData1 = [];

    await parallelChunkMap(
      data,
      (item) => {
        let transformedItem = {};

        // Check each key-value pair in the item
        Object.entries(item).forEach(([key, value]) => {
          // Keep time_stamp as is
          if (key === "time_stamp") {
            transformedItem[key] = value;
          } else {
            // Check for invalid values: non-numerical, empty string, null, "None", undefined
            const isInvalid =
              value === null ||
              value === undefined ||
              value === "" ||
              value === "None" ||
              value === "null" ||
              isNaN(parseFloat(value));

            transformedItem[key] = isInvalid ? undefined : value;
          }
        });

        transformedData1.push(transformedItem);
      },
      10
    );
    // Sort transformedData1 by time_stamp in ascending order
    transformedData1.sort((a, b) => {
      const dateA = new Date(a.time_stamp);
      const dateB = new Date(b.time_stamp);
      return dateA - dateB;
    });

    console.log("Get Graph Output Data: ", transformedData1);

    return transformedData1;
  };
  const transformMetricsAnalysisData = (data) => {
    const transformedData = [];
    const metrics = data.metric;

    // Get all timestamps (keys that aren't "metric")
    const timestamps = Object.keys(data).filter(
      (key) => key !== "metric" && /^\d{4}-\d{2}-\d{2}$/.test(key)
    );

    // For each timestamp, create an object with metrics and their values
    timestamps.forEach((timestamp) => {
      const transformedItem = {
        time_stamp: timestamp,
      };

      // Add each metric and its corresponding value
      metrics.forEach((metric, index) => {
        transformedItem[metric] = data[timestamp][index];
      });

      transformedData.push(transformedItem);
    });

    return transformedData;
  };

  const calculateYAxisDomain = (data, metricKey) => {
    const values = data
      .map((item) => parseFloat(item[metricKey]))
      .filter((val) => !isNaN(val));
    if (values.length === 0) return [0, 100];

    const min = Math.min(...values);
    const max = Math.max(...values);
    console.log("Min", min);
    console.log("Max", max);

    // If the range is very small, add some padding
    if (max - min < 1) {
      return [Number(Math.min(0, min)), Number(max)];
    }

    // For larger ranges, use the actual min and max
    return [Math.min(0, Number(min)), Number(max)];
  };

  const calculateTicks = (domain) => {
    console.log("Domain", domain);
    const [min, max] = domain;
    const range = max - min;
    const step = range / 4; // Create 4 equal intervals (5 ticks including min and max)
    const ticks = [];

    for (let i = 0; i <= 4; i++) {
      ticks.push(Number((min + step * i).toFixed(0)));
    }

    return ticks;
  };

  const shouldTiltTicks = (data, metricKey) => {
    return data.some((item) => {
      const value = item[metricKey];
      if (value === undefined) {
        return false;
      }
      return value.toString().length >= 6;
    });
  };

  useEffect(() => {
    if (metricsAnalysisData) {
      const transformedMetricsAnalysisData =
        transformMetricsAnalysisData(metricsAnalysisData);
      console.log(
        "Transformed Metrics Analysis Data: ",
        transformedMetricsAnalysisData
      );
      const fetchGraphData = async () => {
        const graphData = await get_graph_data(transformedMetricsAnalysisData);
        console.log("Metrics Graph Data: ", graphData);
        setGraphData(graphData);
      };
      fetchGraphData();
    }
  }, [metricsAnalysisData]);
  return (
    <Box>
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
          label="Metrics to Visualize"
          placeholder="Select metrics to visualize"
          values={metrics.map((metric) => metric.label)} // Corrected closing parenthesis here
          isMultiSelect={true}
          selectedValues={metricsAnalysisGraphMetrics}
          setSelectedValues={setMetricsAnalysisGraphMetrics}
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
              setGraphData(
                await get_graph_data(
                  transformMetricsAnalysisData(metricsAnalysisData)
                )
              );
            }}
          />
        </Stack>
      </Stack>
      <Box>
        <Grid container spacing={1} padding={"16px"}>
          <Grid item xs={12} md={12}>
            {metricsAnalysisGraphMetrics.map((metric, index) => {
              const metricInfo = metrics.find((met) => met.label === metric);
              console.log("metricInfo", metricInfo);
              const key = metricInfo?.key;

              const color = metricInfo?.color;
              const isDashed =
                metric === "Potential sales loss" || metric === "Excess stock";
              console.log("key", key);

              // Calculate domain for this specific metric
              const yAxisDomain = calculateYAxisDomain(graphData, key);

              return (
                key && (
                  <Box sx={{ marginBottom: "20px" }} key={key}>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart
                        data={graphData}
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
                          dataKey={"time_stamp"}
                          stroke="#475467"
                          tickFormatter={formatXAxis}
                          interval={Math.floor(
                            Object.keys(metricsAnalysisData).filter(
                              (key) =>
                                key !== "metric" &&
                                /^\d{4}-\d{2}-\d{2}$/.test(key)
                            ).length / 7
                          )}
                          allowDataOverflow
                          type="category"
                          tick={{
                            fill: "#475467",
                            fontSize:
                              index === metricsAnalysisGraphMetrics.length - 1
                                ? 12
                                : 0,
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
                          interval="preserveStartEnd"
                          domain={yAxisDomain}
                          type="number"
                          ticks={calculateTicks(yAxisDomain)}
                          tick={({ x, y, payload, index }) => {
                            const shouldTilt = shouldTiltTicks(graphData, key);
                            // Don't tilt the first tick (index 0)
                            const isFirstTick = index === 0;
                            return (
                              <g transform={`translate(${x},${y})`}>
                                <text
                                  x={-10}
                                  y={0}
                                  dy={4}
                                  textAnchor="end"
                                  fill="#475467"
                                  fontSize={shouldTilt ? 11 : 12}
                                  fontWeight={400}
                                  fontFamily="Inter"
                                  transform={
                                    shouldTilt && !isFirstTick
                                      ? `rotate(-50, -10, 0)`
                                      : shouldTilt && isFirstTick
                                      ? "rotate(-50,-20,0)"
                                      : ""
                                  }
                                >
                                  {payload.value}
                                </text>
                              </g>
                            );
                          }}
                          label={{
                            value: metric,
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
                          content={<CustomTooltip dimensions={metrics} />}
                        />
                        <CustomLegend
                          dimensions={metrics.filter((metric) =>
                            metricsAnalysisGraphMetrics.includes(metric.label)
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
    </Box>
  );
};

export default MetricsAnalysisGraph;
