import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Skeleton,
} from "@mui/material";
import { ReactComponent as DataSet } from "../../../../../assets/Icons/DataSet.svg";
import useDashboard from "../../../../../hooks/useDashboard";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../../../../components/CustomButton";

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { ExecutiveCardsContent } from "./ExecutiveCards";
import { format, parseISO } from "date-fns";
import useExperiment from "../../../../../hooks/useExperiment";
import useAuth from "../../../../../hooks/useAuth";
import CustomTooltip from "./../../../../../components/CustomToolTip";
import { convertDimension } from "../../../../../utils/convertDimension";

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
};

const contentStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  color: "#626F86",
  textAlign: "justify",
  whiteSpace: "pre-line",
};
const BoxComponent = ({
  data,
  id,
  setSelectedId,
  graphComponentProps,
  moduleName,
}) => {
  const submetricTitleStyle = {
    fontFamily: "Inter",
    fontSize: "0.8rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
    textAlign: "left",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    color: "#626F86",
  };
  const submetricStyle = {
    fontFamily: "Inter",
    fontSize: "0.8rem",
    fontWeight: 600,
    lineHeight: "1.25rem",
    textAlign: "left",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    color: "#101828",
  };
  const extraMetricStyle = {
    fontFamily: "Inter",
    fontSize: "clamp(1rem, 1.3vw, 1.3rem)", // Reduced by 80%
    lineHeight: "clamp(1.2rem, 1.6vw, 2.2rem)", // Reduced by 80%
    fontWeight: 500,
    textAlign: "left",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    color: "#912018",
  };
  const extraMetricGreenStyle = {
    fontFamily: "Inter",
    fontSize: "clamp(1rem, 1.3vw, 1.3rem)", // Reduced by 80%
    lineHeight: "clamp(1.2rem, 1.6vw, 2.2rem)", // Reduced by 80%
    fontWeight: 500,
    textAlign: "left",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    color: "#101828",
  };
  const extraSubMetricStyle = {
    fontFamily: "Inter",
    fontSize: "0.8rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
    textAlign: "left",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    color: "#626F86",
  };

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    handleResize(); // Set initial dimensions
    window.addEventListener("resize", handleResize); // Update on window resize
    return () => window.removeEventListener("resize", handleResize); // Cleanup on unmount
  }, []);

  return (
    <Card
      ref={containerRef}
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

        "&:hover": {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
          transition: "all 0.3s ease-in-out",
        },
      }}
      onClick={() => setSelectedId(id)}
    >
      {data.type === "graph+metrics" ? (
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          sx={{
            borderRadius: "8px",
            padding: "1rem",
            gap: "1rem",
            border: "1px solid #EAECF0",
            boxShadow: "0px 1px 2px 0px #1018280D",
            backgroundColor: "#FFFFFF",
            height: "100%",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <Stack
            flex={1}
            // border={"1px solid"}
            sx={{ gap: "0.5rem", maxWidth: "100%", overflow: "hidden" }}
            justifyContent={"space-between"}
            spacing={"1.5rem"}
            display={"inline-block"}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "1rem",
                fontWeight: 600,
                lineHeight: "1rem",
                textAlign: "left",
                color: "#101828",
                textTransform: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {data.title}
            </Typography>
            <Stack
              sx={{ maxWidth: "100%", overflow: "hidden" }}
              spacing={"1rem"}
            >
              <Stack
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                spacing={"0.5rem"}
                alignItems={"flex-start"}
              >
                {data.title !== "Growth" ? (
                  <CustomTooltip title="Units" placement="right" arrow>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "clamp(1.2rem, 1.6vw, 1.6rem)", // Reduced by 80%
                        lineHeight: "clamp(1.2rem, 1.6vw, 2.2rem)", // Reduced by 80%
                        fontWeight: 600,
                        textAlign: "left",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        color: "#101828",
                      }}
                    >
                      {data.units}
                    </Typography>
                  </CustomTooltip>
                ) : (
                  <Stack
                    direction={"row"}
                    alignItems={"flex-end"}
                    spacing={"0.5rem"}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "clamp(1.2rem, 1.6vw, 1.6rem)", // Reduced by 80%
                        lineHeight: "clamp(1.2rem, 1.6vw, 2.2rem)", // Reduced by 80%
                        fontWeight: 600,
                        textAlign: "left",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        color: "#101828",
                      }}
                    >
                      {data.units}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "clamp(0.6rem, 0.8vw, 0.8rem)", // Reduced by 50%
                        lineHeight: "clamp(0.6rem, 0.8vw, 1.1rem)", // Reduced by 50%
                        fontWeight: 600,
                        textAlign: "left",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        color: "#101828",
                        paddingBottom: "0.25rem",
                      }}
                    >
                      Y-o-Y
                    </Typography>
                  </Stack>
                )}
                {data.value !== "0" ? (
                  <CustomTooltip title="Value" placement="right" arrow>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        lineHeight: "0.9rem",
                        textAlign: "left",
                        color: "#626F86",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {`${data.value}`}
                    </Typography>
                  </CustomTooltip>
                ) : (
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      lineHeight: "0.9rem",
                      textAlign: "left",
                      color: "transparent",
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {"--"}
                  </Typography>
                )}
              </Stack>
              <Stack
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                direction={"row"}
                justifyContent={"space-between"}
                flex={1}
              >
                <Stack sx={{ maxWidth: "100%", overflow: "hidden" }}>
                  <Typography sx={submetricTitleStyle}>
                    {data.subMetric1Title}
                  </Typography>
                  <Typography sx={submetricTitleStyle}>
                    {data.subMetric2Title}
                  </Typography>
                </Stack>
                <Stack sx={{ maxWidth: "100%", overflow: "hidden" }}>
                  <Typography sx={submetricStyle}>{data.subMetric1}</Typography>
                  <Typography sx={submetricStyle}>{data.subMetric2}</Typography>
                </Stack>
                {/* </Stack> */}
              </Stack>
            </Stack>
          </Stack>

          <Stack
            justifyContent={"space-between"}
            // alignItems={"center"}
            // flex={1.4}
            // border={"1px solid"}
            sx={{ maxWidth: "100%", overflow: "hidden" }}
          >
            {data.extraMetric !== undefined ? (
              <Stack
                direction={"row"}
                spacing={1}
                justifyContent={"space-between"}
              >
                {data.extraMetric.map((extraMetric, index) => {
                  if (data.extraMetric[index] !== undefined) {
                    return (
                      <Stack
                        // flex={1}

                        alignItems={"center"}
                        sx={{ maxWidth: "100%", overflow: "hidden" }}
                      >
                        <Typography sx={submetricTitleStyle}>
                          {data.extraMetrictitle[index]}
                        </Typography>
                        <Stack sx={{ maxWidth: "100%", overflow: "hidden" }}>
                          {data.title === "Predicted Demand" ? (
                            <Typography sx={extraMetricGreenStyle}>
                              {data.extraMetric[index]}
                            </Typography>
                          ) : (
                            <CustomTooltip
                              title={"Units"}
                              arrow
                              placement="left"
                            >
                              <Typography
                                sx={extraMetricStyle}
                              >{`${data.extraMetric[index]}`}</Typography>
                            </CustomTooltip>
                          )}
                          {data.extraSubMetric[index] !== "0" &&
                            data.extraSubMetric[index] && (
                              <CustomTooltip
                                title="Value"
                                arrow
                                placement="left"
                              >
                                <Typography
                                  sx={extraSubMetricStyle}
                                >{`${data.extraSubMetric[index]}`}</Typography>
                              </CustomTooltip>
                            )}
                        </Stack>
                      </Stack>
                    );
                  } else {
                    return null;
                  }
                })}
              </Stack>
            ) : (
              <Stack flex={1} sx={{ maxWidth: "100%", overflow: "hidden" }} />
            )}
            {moduleName === "-planning" ? null : (
              <GraphForCard
                {...graphComponentProps}
                graphWidth={dimensions.width * 0.4} // 40% width for graph
                graphHeight={dimensions.height * 0.4}
              />
            )}
          </Stack>
        </Stack>
      ) : null}
    </Card>
  );
};

const extractExecutiveData = async (executiveViewData, currentValue) => {
  if (!executiveViewData) {
    return {};
  }

  console.log("Current Value", currentValue);

  const valueKey = "value";
  let valueIndex = -1;

  if (executiveViewData.hasOwnProperty(valueKey)) {
    valueIndex = executiveViewData[valueKey].indexOf(currentValue);
  }

  // Process data extraction in parallel using Promise.all
  const extractedData = await Promise.all(
    Object.keys(executiveViewData).map(async (key) => {
      return [key, executiveViewData[key][0] || ""];
    })
  ).then((entries) => Object.fromEntries(entries));

  if (!extractedData.hasOwnProperty("Fill_rate")) {
    extractedData.Fill_rate = "NA";
  }
  console.log("extracted Data1", extractedData);
  return extractedData;
};

const extractKeys = async (data, dateColumn) => {
  const featureMapping = {
    [dateColumn]: `${dateColumn}`,
    pred: "Predicted Demand",
    in_transit_expanded: "In-transit",
    stock_on_hand_new: "Projected Stock",
    Excess_Stock: "Excess stock",
    Potential_Sales_Loss: "Potential sales loss",
    Reorder_Quantity: "Reorder Quantity",
  };

  const valueKey = "split";

  // Find future indices in parallel
  const futureIndices = await Promise.resolve(
    data.hasOwnProperty(valueKey)
      ? data[valueKey].reduce((acc, value, index) => {
          if (value === "future") acc.push(index);
          return acc;
        }, [])
      : []
  );

  // Process data points in parallel
  const extractedData = await Promise.all(
    futureIndices.map(async (index) => {
      const dataPoint = {};

      // Process all keys for this index in parallel
      await Promise.all(
        Object.entries(featureMapping).map(async ([key, newKey]) => {
          if (data.hasOwnProperty(key)) {
            const value = data[key][index];
            if (value !== null && value !== undefined) {
              dataPoint[newKey] =
                key === dateColumn
                  ? data[key][index]
                  : parseInt(data[key][index], 10);
            }
          }
        })
      );

      return dataPoint;
    })
  );

  console.log("Exe extracted Data", extractedData);
  return extractedData;
};

const CustomToolTip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let formattedLabel;
    if (label) {
      formattedLabel = format(parseISO(label), "MMM dd, yyyy");
    } else {
      formattedLabel = label;
    }

    return (
      <div
        style={{
          backgroundColor: "#ffffff",
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
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </div>
    );
  }
  return null;
};
const CustomTooltipForGraphCard = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let formattedLabel;
    if (label) {
      formattedLabel = format(parseISO(label), "MMM dd, yyyy");
    } else {
      formattedLabel = label;
    }

    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          padding: "0.1rem",
          borderRadius: "5px",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            color: "#626F86",
            fontFamily: "Inter",
            fontSize: "0.6rem",
            fontWeight: 500,
            lineHeight: "1rem",
            textAlign: "left",
            textTransform: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {formattedLabel}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            style={{
              fontFamily: "Inter",
              fontSize: "0.8rem",
              fontWeight: 500,
              lineHeight: "1rem",
              textAlign: "left",
              textTransform: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              color: "#344054",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "0.7rem",
                height: "0.7rem",
                backgroundColor: entry.color || "#000", // Use entry.color if available, fallback to black
                borderRadius: "50%",
                marginRight: "5px",
              }}
            ></span>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ dimensions }) => {
  return (
    <Box mt={2} display="flex" justifyContent="center">
      <Stack direction="row" spacing={2}>
        {dimensions.map(({ label, color }) => (
          <Stack key={label} direction="row" alignItems="center" spacing={1}>
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

const GraphForCard = ({
  dimension,
  data,
  dimensions,
  setZoomSettings,
  zoomSettings,
  selectedDimensions,
  zoom,
  formatXAxis,
  transformedDemanData,
  useCustomTooltip = false,
  useCustomLegend = false,
  dateColumn,
  graphWidth, // Added dynamic width
  graphHeight, // Added dynamic height
}) => {
  const dimensionInfo = dimensions.find((dim) => dim.label === dimension);

  const color = dimensionInfo?.color;
  const isDashed =
    dimension === "Potential sales loss" || dimension === "Excess stock";
  const dimKey = dimensionInfo?.key;

  const TooltipComponent = useCustomTooltip ? CustomTooltip : Tooltip;

  return (
    dimKey && (
      <Box key={dimKey}>
        <ResponsiveContainer width={graphWidth} height={graphHeight}>
          {dimension === "Reorder Quantity" ? (
            <BarChart data={data} syncId="anyId" margin={{ right: 0, left: 0 }}>
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                hide
                dataKey={`${dateColumn}`}
                stroke="#475467"
                tick={{
                  fill: "#475467",
                  fontSize: 0,
                  fontWeight: 400,
                  fontFamily: "Inter",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                hide
                axisLine={false}
                tickLine={false}
                tick={false} // Disable ticks on the Y-axis
                label={null} // Remove the label
                domain={["auto", "auto"]}
              />
              <TooltipComponent
                content={<CustomTooltipForGraphCard dimensions={dimensions} />}
              />
              <Bar
                dataKey={dimKey}
                stroke={color}
                fill={color}
                barSize={15}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={data}
              syncId="anyId"
              margin={{ right: 0, left: 0 }}
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
                  <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                hide
                dataKey={`${dateColumn}`}
                stroke="#475467"
                tickFormatter={formatXAxis}
                interval={Math.floor(transformedDemanData.length / 7)}
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
              <YAxis
                hide
                axisLine={false}
                tickLine={false}
                tick={false} // Disable ticks on the Y-axis
                label={null} // Remove the label
                allowDataOverflow
                domain={["auto", "auto"]}
                type="number"
              />
              <TooltipComponent
                content={<CustomTooltipForGraphCard dimensions={dimensions} />}
              />
              {/* <LegendComponent
                dimensions={dimensions.filter((dim) =>
                  selectedDimensions.includes(dim.label)
                )}
              /> */}

              {dimKey && (
                <Area
                  type="cardinal"
                  dataKey={dimKey}
                  strokeWidth={2}
                  stroke={color}
                  fill={`url(#colorSeries-${color})`}
                  // dot=null
                  strokeDasharray={isDashed ? "3 3" : "0"}
                />
              )}
              {zoomSettings.refAreaLeft && zoomSettings.refAreaRight ? (
                <ReferenceArea
                  x1={zoomSettings.refAreaLeft}
                  x2={zoomSettings.refAreaRight}
                  strokeOpacity={0.3}
                />
              ) : null}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </Box>
    )
  );
};
const FocusView = () => {
  const [selectedId, setSelectedId] = useState(1);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [executiveViewData, setExecutiveViewData] = useState(null);
  const [demandForecastingData, setDemandForecastingData] = useState(null);

  const [ready, setReady] = useState(false);
  const {
    // executiveViewData,
    // demandForecastingData,
    dimensionFilterData,
    currentDimension,
    currentValue,
    setCurrentDimension,
    setCurrentValue,
    loadExecutiveViewData,
    loadDemandForecastingData,
    experimentBasePath,
  } = useDashboard();
  const { experiment_config, hasParquetFiles } = useExperiment();

  const moduleName = experiment_config.common.module_name;
  useEffect(() => {
    switch (moduleName) {
      case "demand-planning":
        setSelectedDimensions(["Predicted Demand"]);
        break;
      case "pricing-promotion-optimization":
        setSelectedDimensions(["Predicted Demand"]);
        break;
      case "inventory-optimization":
        if (
          experiment_config.scenario_plan?.simple_disaggr
            ?.ts_id_columns_simple_disaggr?.length > 0 ||
          experiment_config.scenario_plan?.inventory_constraints
            ?.inventory_optimisation_granularity?.length > 0
        ) {
          setSelectedDimensions(["Predicted Demand"]);
        } else {
          setSelectedDimensions([
            "Predicted Demand",
            "Projected Stock",
            "In-transit",
            "Reorder Quantity",
            "Excess stock",
            "Potential sales loss",
          ]);
        }
        break;
      default:
        break;
    }
  }, []);
  useEffect(() => {
    if (executiveViewData) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [executiveViewData]);
  const dateColumn = experiment_config.data.timestamp_column;
  console.log(dateColumn);
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
  const [transformedData, setTransformedData] = useState(
    extractExecutiveData(executiveViewData, currentValue)
  );

  console.log("====================================");
  console.log("Frequency", frequencyDict[experiment_config.data.frequency]);
  console.log("====================================");

  const [values, setvalues] = useState(dimensionFilterData[currentDimension]);
  const { userInfo, currentCompany } = useAuth();
  const [boxContent, setBoxContent] = useState(
    ExecutiveCardsContent(
      transformedData,
      frequencyDict[experiment_config.data.frequency],
      moduleName,
      experiment_config.scenario_plan.pricing_constraints.currency !==
        undefined &&
        experiment_config.scenario_plan.pricing_constraints.currency
        ? currencyDict[
            experiment_config.scenario_plan.pricing_constraints.currency
          ]
        : null,
      experiment_config
    )
  );
  console.log("Box Content", boxContent);

  // useEffect(() => {
  //   setvalues(dimensionFilterData[currentDimension]);
  //   setCurrentValue(dimensionFilterData[currentDimension][0]);
  //   applyDimensionFilters();
  // }, [currentDimension, currentValue]);
  useEffect(() => {
    setvalues(dimensionFilterData[currentDimension]);
    setCurrentValue(dimensionFilterData[currentDimension][0]);
  }, [currentDimension]);
  // useEffect(() => {
  //   console.log(`[${new Date().toLocaleTimeString()}] :Applying the `);
  //   applyDimensionFilters({
  //     dimensionFilters: {
  //       feature: [currentDimension],
  //       value: [currentValue],
  //     },
  //     columnFilter: [],
  //     selectAllColumns: true,
  //   });
  // }, [currentDimension, currentValue]);
  useEffect(() => {
    const fetchExecutiveViewData = async () => {
      const executiveData = await loadExecutiveViewData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
            value: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );
      setExecutiveViewData(executiveData);
    };

    fetchExecutiveViewData();
  }, [currentValue]);
  useEffect(() => {
    const fetchDemandForecastingData = async () => {
      const demandForecasting = await loadDemandForecastingData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/${currentValue}.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
            value: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        hasParquetFiles
      );
      setDemandForecastingData(demandForecasting);
    };
    fetchDemandForecastingData();
  }, [currentValue]);

  const formatXAxis = (tickItem) => {
    if (!tickItem) {
      console.log("Unexpected tickItem:", tickItem);
      return "xx"; // or some fallback value
    }
    return format(parseISO(tickItem), "MMM yyyy");
  };
  let dimensions;
  switch (moduleName) {
    case "inventory-optimization":
      if (
        experiment_config.scenario_plan?.simple_disaggr
          ?.ts_id_columns_simple_disaggr?.length > 0 ||
        experiment_config.scenario_plan?.inventory_constraints
          ?.inventory_optimisation_granularity?.length > 0
      ) {
        dimensions = [
          {
            label: "Predicted Demand",
            key: "Predicted Demand",
            color: "#2ca02c",
          },
        ];
      } else {
        dimensions = [
          {
            label: "Projected Stock",
            key: "Projected Stock",
            color: "#1f77b4",
          },
          {
            label: "Predicted Demand",
            key: "Predicted Demand",
            color: "#2ca02c",
          },
          { label: "In-transit", key: "In-transit", color: "#03a1fc" },
          {
            label: "Reorder Quantity",
            key: "Reorder Quantity",
            color: "#2ca02c",
          },
          { label: "Excess stock", key: "Excess stock", color: "#ff7f0e" },
          {
            label: "Potential sales loss",
            key: "Potential sales loss",
            color: "#ef543b",
          },
        ];
      }
      break;
    case "demand-planning":
      dimensions = [
        // { label: "Projected Stock", key: "Projected Stock", color: "#1f77b4" },
        {
          label: "Predicted Demand",
          key: "Predicted Demand",
          color: "#2ca02c",
        },
        // { label: "In-transit", key: "In-transit", color: "#03a1fc" },
        // {
        //   label: "Reorder Quantity",
        //   key: "Reorder Quantity",
        //   color: "#2ca02c",
        // },
        // { label: "Excess stock", key: "Excess stock", color: "#ff7f0e" },
        // {
        //   label: "Potential sales loss",
        //   key: "Potential sales loss",
        //   color: "#ef543b",
        // },
      ];
      break;
    case "pricing-promotion-optimization":
      dimensions = [
        // { label: "Projected Stock", key: "Projected Stock", color: "#1f77b4" },
        {
          label: "Predicted Demand",
          key: "Predicted Demand",
          color: "#2ca02c",
        },
        // { label: "In-transit", key: "In-transit", color: "#03a1fc" },
        // {
        //   label: "Reorder Quantity",
        //   key: "Reorder Quantity",
        //   color: "#2ca02c",
        // },
        // { label: "Excess stock", key: "Excess stock", color: "#ff7f0e" },
        // {
        //   label: "Potential sales loss",
        //   key: "Potential sales loss",
        //   color: "#ef543b",
        // },
      ];
      break;
    default:
      break;
  }

  const handleDimensionChange = (newValue) => {
    const updatedDimensions = newValue.includes("Predicted Demand")
      ? newValue
      : ["Predicted Demand", ...newValue];
    setSelectedDimensions(updatedDimensions);
  };

  const filteredDimensions = dimensions.filter(
    (dim) => dim.label !== "Predicted Demand"
  );

  const availableDimensions = filteredDimensions.filter(
    (dim) => !selectedDimensions.includes(dim.label)
  );

  const [transformedDemanData, settransformedDemanData] = useState(null);
  console.log(transformedDemanData);

  const [data, setData] = useState(transformedDemanData);
  console.log(data);

  useEffect(() => {
    const fetchData = async () => {
      if (demandForecastingData) {
        const extractedKeys = await extractKeys(
          demandForecastingData,
          dateColumn
        );
        settransformedDemanData(extractedKeys);
        setData(extractedKeys);
        const extractedExecData = await extractExecutiveData(
          executiveViewData,
          dimensionFilterData[currentDimension][0]
        );
        setTransformedData(extractedExecData);
      }
    };

    fetchData();
  }, [demandForecastingData]);

  useEffect(() => {
    const updateBoxContent = async () => {
      const extractedExecData = await extractExecutiveData(
        executiveViewData,
        currentValue
      );
      setBoxContent(
        ExecutiveCardsContent(
          extractedExecData,
          frequencyDict[experiment_config.data.frequency],
          moduleName,
          experiment_config.scenario_plan.pricing_constraints.currency !==
            undefined &&
            experiment_config.scenario_plan.pricing_constraints.currency
            ? currencyDict[
                experiment_config.scenario_plan.pricing_constraints.currency
              ]
            : null,
          experiment_config
        )
      );
    };

    updateBoxContent();
  }, [currentValue, executiveViewData]);

  const handleClearFilter = async () => {
    setCurrentDimension("all");
  };

  const getAxisYDomain = (from, to, ref, offset) => {
    const refData = transformedDemanData.filter(
      (d) => d[dateColumn] >= from && d[dateColumn] <= to
    );
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

  const [zoomSettings, setZoomSettings] = useState({
    left: "dataMin",
    right: "dataMax",
    refAreaLeft: "",
    refAreaRight: "",
    domains: {
      "Predicted Demand": { top: "dataMax", bottom: "dataMin" },
      "Projected Stock ": { top: "dataMax", bottom: "dataMin" },
      "In-transit": { top: "dataMax", bottom: "dataMin" },
      "Reorder Quantity": { top: "dataMax", bottom: "dataMin" },
      "Excess stock": { top: "dataMax", bottom: "dataMin" },
      "Potential sales loss": { top: "dataMax", bottom: "dataMin" },
    },
  });

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
    [
      "Predicted Demand",
      "Projected Stock",
      "In-transit",
      "Reorder Quantity",
      "Excess stock",
      "Potential sales loss",
    ].forEach((key) => {
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

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        padding={"12px 16px"}
        gap={2}
      >
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
          label="Value"
          placeholder="select option.."
          values={values}
          // isMultiSelect={true}
          selectedValues={currentValue}
          setSelectedValues={setCurrentValue}
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
        {boxContent.map((box) => (
          <Grid item xs={12} md={12 / boxContent.length} key={box.id}>
            {(executiveViewData !== null) &
            (demandForecastingData !== null) &
            (transformedDemanData !== null) ? (
              <BoxComponent
                title={box.title}
                id={box.id}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                labels={box.labels}
                data={box}
                moduleName={moduleName}
                graphComponent={GraphForCard}
                graphComponentProps={{
                  dimension: box.dimension,
                  data,
                  dimensions,
                  setZoomSettings,
                  zoomSettings,
                  selectedDimensions,
                  zoom,
                  formatXAxis,
                  transformedDemanData,
                  dateColumn,
                }}
              />
            ) : (
              <Skeleton variant="rectangular" height={"200px"} />
            )}
          </Grid>
        ))}
      </Grid>
      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          padding={"12px 16px"}
          gap={2}
        >
          {moduleName !== "demand-planning" &&
            (moduleName !== "inventory-optimization" ||
              !(
                experiment_config.scenario_plan?.simple_disaggr
                  ?.ts_id_columns_simple_disaggr?.length > 0 ||
                experiment_config.scenario_plan?.inventory_constraints
                  ?.inventory_optimisation_granularity?.length > 0
              )) && (
              <CustomAutocomplete
                disableClearable
                showLabel
                label="Demand Pattern Oscillator"
                placeholder="Select Dimension"
                values={availableDimensions.map((dim) => dim.label)}
                isMultiSelect={true}
                selectedValues={selectedDimensions.filter(
                  (d) => d !== "Predicted Demand"
                )}
                setSelectedValues={handleDimensionChange}
              />
            )}
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent={"space-between"}
          spacing={2}
          padding={"12px 16px"}
          gap={2}
        >
          <CustomLegend
            dimensions={dimensions.filter((dim) =>
              selectedDimensions.includes(dim.label)
            )}
          />
          <CustomButton
            title={"Zoom out"}
            onClick={() => {
              setData(transformedDemanData);
            }}
          />
        </Stack>
        {(transformedDemanData !== null) &
        (executiveViewData !== null) &
        (demandForecastingData !== null) ? (
          <>
            {selectedDimensions.map((dimension, index) => {
              const dimensionInfo = dimensions.find(
                (dim) => dim.label === dimension
              );
              const key = dimensionInfo?.key;
              const color = dimensionInfo?.color;
              const isDashed =
                dimension === "Potential sales loss" ||
                dimension === "Excess stock";

              console.log("Data", data);
              console.log("dateColumn", dateColumn);
              console.log("dateColumn1", `${dateColumn}`);
              return (
                key && (
                  <Box sx={{ marginBottom: "20px" }} key={key}>
                    <ResponsiveContainer width="100%" height={200}>
                      {dimension === "Reorder Quantity" ||
                      dimension === "In-transit" ? (
                        <BarChart
                          data={data}
                          syncId="anyId"
                          margin={{ right: 30, left: 30 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                          />
                          {index === selectedDimensions.length - 1 ? (
                            <XAxis
                              dataKey={`${dateColumn}`}
                              stroke="#475467"
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
                              dataKey={`${dateColumn}`}
                              stroke="#475467"
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
                            domain={["auto", "auto"]}
                          />
                          <Tooltip
                            content={<CustomToolTip dimensions={dimensions} />}
                          />
                          <Bar
                            dataKey={key}
                            stroke={color}
                            fill={color}
                            barSize={15}
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      ) : (
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
                                stopOpacity={0.5}
                              />
                              <stop
                                offset="95%"
                                stopColor={color}
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
                              dataKey={`${dateColumn}`}
                              stroke="#475467"
                              tickFormatter={formatXAxis}
                              interval={Math.floor(
                                transformedDemanData.length / 7
                              )}
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
                              dataKey={`${dateColumn}`}
                              stroke="#475467"
                              tickFormatter={formatXAxis}
                              interval={Math.floor(
                                transformedDemanData.length / 7
                              )}
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
                            content={<CustomToolTip dimensions={dimensions} />}
                          />
                          <CustomLegend
                            dimensions={dimensions.filter((dim) =>
                              selectedDimensions.includes(dim.label)
                            )}
                          />

                          {key && (
                            <Area
                              type="cardinal"
                              dataKey={key}
                              strokeWidth={2}
                              stroke={color}
                              fill="none"
                              dot={{
                                fill: color,
                                stroke: color,
                                strokeWidth: 1,
                              }}
                              strokeDasharray={isDashed ? "3 3" : "0"}
                            />
                          )}
                          {zoomSettings.refAreaLeft &&
                          zoomSettings.refAreaRight ? (
                            <ReferenceArea
                              x1={zoomSettings.refAreaLeft}
                              x2={zoomSettings.refAreaRight}
                              strokeOpacity={0.3}
                            />
                          ) : null}
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                )
              );
            })}
          </>
        ) : (
          <Skeleton
            variant="rectangular"
            height={"200px"}
            width={"100%"}
            marginRight={30}
            marginLeft={30}
          />
        )}
      </Box>
    </Box>
  );
};

export default FocusView;
