"use client";

import { useState, useEffect, useMemo } from "react";
import React from "react";
import {
  Stack,
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  Collapse,
  Card,
  Divider,
} from "@mui/material";
import {
  MoreHoriz as MoreIcon,
  KeyboardArrowLeft as CollapseIcon,
  ConstructionOutlined,
} from "@mui/icons-material";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../../../components/CustomButton";
import useDashboard from "../../../../hooks/useDashboard";
import useExperiment from "../../../../hooks/useExperiment";
import useAuth from "../../../../hooks/useAuth";
import useConfig from "../../../../hooks/useConfig";
import ScenarioBuilderBox from "./ScenarioBuilderBox";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomTooltip from "../../../../components/CustomToolTip";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { parallelChunkMap } from "../../../../utils/parallelChunkMap";
import { Skeleton, Alert, AlertTitle } from "@mui/material";
import { fetchCSVData, fetchParquetData } from "../../../../utils/s3Utils";
import { set } from "lodash";
import { callQueryEngineQuery } from "../../../../utils/queryEngine";
import FilterBlock from "../../../../components/FilterBlockNew";
import ForecastChartPromo from "../../../../components/ForecastChartPromo";
import ScenarioBuilderMultiFilter from "./ScenarioBuilderMultiFilterBox";
import CustomTable from "../../../../components/TanStackCustomTable";
import {
  TrendingUp,
  TrendingDown,
  GpsFixed,
  BarChart,
  AttachMoney,
  FlashOn,
} from "@mui/icons-material";
import { current } from "@reduxjs/toolkit";

// Chart Header with Controls Component
const ChartHeaderWithControls = ({
  title,
  primaryControls = [],
  secondaryControls = [],
  showMoreButton = false,
}) => {
  const [showMore, setShowMore] = useState(false);

  const handleMoreClick = () => {
    setShowMore(!showMore);
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
          overflow: "hidden",
          flex: 1,
          justifyContent: "flex-end",
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
                  }}
                />
              }
              label={control.label}
            />
          ))}
        </Box>

        {/* Secondary Controls - Slide in from right */}
        <Collapse
          in={showMore}
          orientation="horizontal"
          sx={{
            "& .MuiCollapse-wrapperInner": {
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              paddingLeft: showMore ? 1 : 0,
              borderLeft: showMore ? "1px solid #EAECF0" : "none",
              marginLeft: showMore ? 1 : 0,
              transition: "all 0.3s ease-in-out",
              maxWidth: showMore ? "400px" : "0px",
              whiteSpace: "nowrap",
            }}
          >
            {secondaryControls.map((control, index) => (
              <FormControlLabel
                key={index}
                sx={{
                  margin: 0,
                  flexShrink: 0,
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
                    }}
                  />
                }
                label={control.label}
              />
            ))}
          </Box>
        </Collapse>

        {/* More/Less Button */}
        {showMoreButton && secondaryControls.length > 0 && (
          <IconButton
            onClick={handleMoreClick}
            sx={{
              padding: "4px",
              border: "1px solid #D0D5DD",
              borderRadius: "4px",
              backgroundColor: showMore ? "#F9FAFB" : "transparent",
              marginLeft: 0.8,
              flexShrink: 0,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#F9FAFB",
                borderColor: "#98A2B3",
              },
            }}
          >
            {showMore ? (
              <CollapseIcon sx={{ fontSize: 14, color: "#667085" }} />
            ) : (
              <MoreIcon sx={{ fontSize: 14, color: "#667085" }} />
            )}
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

// Helper function to format X-axis
const formatXAxis = (tickItem) => {
  return format(parseISO(tickItem), "MMM yyyy");
};

const MainContentSkeleton = () => (
  <Grid container spacing={1} paddingX={"12px"} paddingY={"6px"}>
    {/* Enrichment Box Skeleton */}
    <Grid
      item
      xs={12}
      md={3.5}
      sx={{
        padding: "6px 8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 2px 2px #1018280D",
          height: "460px",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
        }}
      >
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={120}
          sx={{ mb: 2 }}
        />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={80}
          sx={{ mb: 2 }}
        />
        <Skeleton variant="rectangular" width="40%" height={32} />
      </Box>
    </Grid>

    {/* Chart Section Skeleton */}
    <Grid
      item
      xs={12}
      md={8.5}
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

const DateValidationError = () => (
  <Alert
    severity="error"
    sx={{
      margin: "8px 12px",
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      borderRadius: "8px",
      "& .MuiAlert-icon": {
        color: "#DC2626",
      },
    }}
  >
    <AlertTitle sx={{ color: "#991B1B", fontWeight: 600 }}>
      Invalid Date Range
    </AlertTitle>
    <Box sx={{ color: "#7F1D1D" }}>
      Start date cannot be greater than end date. Please select a valid date
      range.
    </Box>
  </Alert>
);
// Custom tooltip component
const CustomTooltipComponent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedLabel = format(parseISO(label), "MMM dd, yyyy");
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          padding: "4px",
          borderRadius: "4px",
        }}
      >
        <Typography
          sx={{
            color: "#626F86",
            fontFamily: "Inter",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "20px",
          }}
        >
          {formattedLabel}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            style={{
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "20px",
              color: "#344054",
            }}
          >
            {entry.name !== "value" && entry.name !== "pred_upper_bound" && (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    backgroundColor: entry.color || "#000",
                    borderRadius: "50%",
                    marginRight: "4px",
                  }}
                ></span>
                {entry.name}:{" "}
                {Number.isInteger(Number.parseFloat(entry.value))
                  ? Number.parseFloat(entry.value)
                  : Number.parseFloat(entry.value).toFixed(4)}
              </>
            )}
          </Typography>
        ))}
      </div>
    );
  }
  return null;
};

// Extract keys function
const extractKeys = (data, dateColumn) => {
  const keysToExtract = Object.keys(data).filter(
    (key) => !["feature", "value"].includes(key)
  );
  const length = data[keysToExtract[0]].length;
  const extractedData = [];

  for (let i = 0; i < length; i++) {
    const dataPoint = {};
    keysToExtract.forEach((key) => {
      if (data.hasOwnProperty(key)) {
        const value = data[key][i];
        if (value !== null && value !== undefined) {
          dataPoint[key] =
            key === dateColumn || key === "split"
              ? value
              : Number.parseFloat(value, 10);
        }
      }
    });
    if (Object.keys(dataPoint).length > 0) {
      extractedData.push(dataPoint);
    }
  }
  return extractedData;
};

// Apply enrichment function
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
      let cumulativeForecast = item.ml_forecast;

      enrichmentByDate.forEach((enrich) => {
        const enrichmentType = enrich.enrichment_type;
        const startDate = new Date(enrich.date_range[0]);
        const endDate = new Date(enrich.date_range[1]);
        const itemDate = new Date(item[dateColumn]);

        if (itemDate >= startDate && itemDate <= endDate) {
          if (
            enrich.dimension === "None" ||
            (enrich.dimension === currentDimension &&
              enrich.value === currentValue)
          ) {
            const upliftAmount =
              (cumulativeForecast * enrich.enrichment_value) / 100;

            switch (enrichmentType) {
              case "uplift":
                cumulativeForecast += upliftAmount;
                break;
              case "upper_bound":
                cumulativeForecast = item.pred_upper_bound;
                break;
              case "lower_bound":
                cumulativeForecast = item.pred_lower_bound;
                break;
              case "offset":
                cumulativeForecast = item.offset_forecast;
                break;
              default:
                break;
            }
          }
        }
      });

      item.enrichment_forecast = cumulativeForecast;
      return item;
    },
    10
  );
  return result;
}

// Apply price enrichment function - only to future data
async function applyPriceEnrichmentParallel(
  transformedData,
  enrichmentByDate,
  currentDimension,
  currentValue,
  dateColumn,
  priceField
) {
  const result = await parallelChunkMap(
    transformedData,
    (item) => {
      let cumulativePrice = item[priceField];

      // Only apply price changes to future data
      if (item.split === "future") {
        // Only consider enrichments with changed_price_percent
        const priceEnrichments = enrichmentByDate.filter(
          (enrich) =>
            enrich.changed_price_percent !== null &&
            enrich.changed_price_percent !== undefined
        );

        priceEnrichments.forEach((enrich) => {
          const startDate = new Date(enrich.date_range[0]);
          const endDate = new Date(enrich.date_range[1]);
          const itemDate = new Date(item[dateColumn]);

          if (itemDate >= startDate && itemDate <= endDate) {
            if (
              enrich.dimension === "None" ||
              (enrich.dimension === currentDimension &&
                enrich.value === currentValue)
            ) {
              // Apply price change percentage
              const priceChangeAmount =
                (cumulativePrice * enrich.changed_price_percent) / 100;
              cumulativePrice += priceChangeAmount;
            }
          }
        });
      }

      item.price_scenario = cumulativePrice;
      return item;
    },
    10
  );
  return result;
}

// Get graph data function
const get_graph_data = async (
  data,
  enrichment_bydate,
  currentDimension,
  currentValue,
  dateColumn,
  priceField
) => {
  const transformedData1 = [];
  let lastTestPoint;

  data.forEach((item) => {
    if (item.split === "test") {
      lastTestPoint = item;
    }
  });

  await parallelChunkMap(
    data,
    (item) => {
      const transformedItem = {
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
          item.split !== "future" && item.actual > 0 ? item.actual : undefined,
        pred: item.split === "future" ? item.pred : undefined,
        offset_forecast:
          item.split === "future" ? item.offset_forecast : undefined,
        ml_forecast: item.split === "future" ? item.ml_forecast : undefined,
        out_of_time_validation:
          item.split === "test" && item.pred !== undefined
            ? item.pred
            : item.out_of_time_validation,
      };

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

  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
  };

  // Apply forecast enrichment
  const enriched_data = await applyEnrichmentParallel(
    transformedData1,
    enrichment_bydate,
    convert(currentDimension),
    currentValue,
    dateColumn
  );

  // Apply price enrichment
  const price_enriched_data = await applyPriceEnrichmentParallel(
    enriched_data,
    enrichment_bydate,
    convert(currentDimension),
    currentValue,
    dateColumn,
    priceField
  );

  return price_enriched_data;
};

const formatNumberShort = (num) => {
  if (num == null) return null;

  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";

  if (absNum >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";

  if (absNum >= 1_000) return (num / 1_000).toFixed(1) + "K";

  return num.toFixed(2);
};

const renderValue = (percentValue, rawValue, label, isElasticity = false) => {
  if (percentValue == null) return "-";

  // Elasticity stays unchanged
  if (isElasticity) return `${parseFloat(percentValue).toFixed(2)}`;

  const percent = `${parseFloat(percentValue).toFixed(2)}%`;

  // If raw value does NOT exist → return only percent (NO brackets)
  if (rawValue == null) {
    return `${percentValue >= 0 ? "+" : ""}${percent}`;
  }

  // Format raw numeric value
  const num = parseFloat(rawValue);
  const basSum = Math.abs(num);
  let formattedNum = formatNumberShort(basSum);

  // Dollar prefix for revenue + margin
  if (
    label.toLowerCase().includes("revenue") ||
    label.toLowerCase().includes("margin")
  ) {
    formattedNum = `$${formattedNum}`;
  }

  // Arrow icon
  const arrow =
    num > 0 && label === "Unit Lift"
      ? "↑ "
      : num < 0 && label === "Unit Lift"
      ? "↓ "
      : "";

  return `${formattedNum} (${percentValue >= 0 ? "+" : ""}${percent})`;
};

const valueColor = (value) => {
  if (value === null || value === undefined) return "text.primary";
  return parseFloat(value) >= 0 ? "success.main" : "error.main";
};

const coloredSpan = (
  num,
  suffix = "",
  isCompact = false,
  showDollar = false
) => {
  if (num === null || num === undefined || isNaN(num))
    return `<span style="color: gray">N/A</span>`;

  const color = num >= 0 ? "green" : "red";

  const prefix = suffix === "%" ? (num > 0 ? "+" : "-") : "";

  // remove negative sign
  const absNum = suffix !== "elasticity" ? Math.abs(num) : num;

  const value = isCompact ? formatNumberShort(absNum) : absNum.toFixed(2);

  const dollar = showDollar ? "$" : "";

  return `<span style="color:${color}; font-weight:600;">${prefix}${dollar}${value}${
    suffix !== "elasticity" ? suffix : ""
  }</span>`;
};

const StrategicGrowthStrip = ({
  unitLift,
  marginLift,
  revenueLift,

  elasticity,
  netElasticity,
  unitLiftValue,

  valueMetrics,
}) => {
  const {
    forecastLiftValue,
    revenueLiftValue,
    marginLiftValue,
    netForecastLift,
    netMarginLift,
    netRevenueLift,
    netForecastLiftValue,
    netRevenueLiftValue,
    netMarginLiftValue,
  } = valueMetrics;
  const metricsRow1 = [
    {
      label: "Unit Lift",
      value: unitLift,
      rawValue: forecastLiftValue,
      netRawValue: netForecastLiftValue,
      netLift: netForecastLift,
      icon: GpsFixed,
      isElasticity: false,
    },
    
    {
      label: "Revenue Lift",
      value: revenueLift,
      rawValue: revenueLiftValue,
      netRawValue: netRevenueLiftValue,
      netLift: netRevenueLift,
      icon: AttachMoney,
      isElasticity: false,
    },
    {
      label: "Margin Lift",
      value: marginLift,
      rawValue: marginLiftValue,
      netRawValue: netMarginLiftValue,
      netLift: netMarginLift,
      icon: BarChart,
      isElasticity: false,
    },
    {
      label: "Elasticity",
      value: elasticity,
      rawValue: null,
      netRawValue: netElasticity,
      netLift: null,
      icon: FlashOn,
      isElasticity: true,
    },
  ];

  console.log(metricsRow1);
  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: "white",
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "grey.300",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          backgroundColor: "white",
        }}
      >
        {metricsRow1.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <React.Fragment key={index}>
              <CustomTooltip
                  title={
                    metric.isElasticity ? (
                      // =========================
                      //   Elasticity Tooltip
                      // =========================
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `<strong>Post Promo Elasticity:</strong> ${
                            metric.netRawValue !== null &&
                            metric.netRawValue !== undefined
                              ? coloredSpan(metric.netRawValue, "elasticity")
                              : coloredSpan(null)
                          }`,
                        }}
                      />
                    ) : (
                      // =========================
                      //   Normal Metrics Tooltip
                      // =========================
                      <div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `<strong>Net ${metric.label} :</strong> ${
                              metric.netLift !== null &&
                              metric.netLift !== undefined
                                ? coloredSpan(metric.netLift, "%")
                                : coloredSpan(null)
                            }`,
                          }}
                        />

                        <div
                          style={{ marginTop: 4 }}
                          dangerouslySetInnerHTML={{
                            __html: `<strong>Net ${
                              metric.label
                            } Value:</strong> ${
                              metric.netRawValue !== null &&
                              metric.netRawValue !== undefined
                                ? coloredSpan(
                                    metric.netRawValue,
                                    "",
                                    true,
                                    metric.label === "Revenue Lift" ||
                                      metric.label === "Margin Lift"
                                  )
                                : coloredSpan(null)
                            }`,
                          }}
                        />
                      </div>
                    )
                  }
                  placement="top"
                  arrow
                >
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  py: 0.75,
                  px: 1.5,
                  position: "relative",
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 16,
                    color: "text.secondary",
                    opacity: 0.7,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "text.secondary",
                    fontSize: "0.8rem",
                  }}
                >
                  {metric.label}:
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: valueColor(metric.value),
                    fontSize: "0.85rem",
                  }}
                >
                  {renderValue(
                    metric.value,
                    metric.rawValue,
                    metric.label,
                    metric.isElasticity
                  )}
                </Typography>
                
                  
                
              </Box>
              </CustomTooltip>

              {index < metricsRow1.length - 1 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    borderColor: "grey.300",
                    opacity: 0.5,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Card>
  );
};

const PromoPlanning = () => {
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
    elasticityDimensionFilterData,
    applyDimensionFilters,
    setFilterOptions,
    experimentBasePath,
    tablesFilterData,
    InvPriceFilterData,
    filterData,
  } = useDashboard();

  const { hasParquetFiles } = useExperiment();

  const { userInfo } = useAuth();
  const { experiment_config } = useExperiment();
  const {
    enrichment_bydate,
    enrichment_bydate_pricing,
    enrichment_bydate_pricing_multi_filter,
    configState,
    removeEnrichmentPricingByIndex,
    addEnrichmentPricing,
    setTabFilterColumns,

    promoPlanningFilterColumns,
    resetPreviewEnrichment,
    setIsTGScenario,
    previewEnrichment,
  } = useConfig();

  const dateColumn = experiment_config.data.timestamp_column;

  // State for toggles
  const [showFutureActuals, setShowFutureActuals] = useState(false);
  const [showMLForecast, setShowMLForecast] = useState(false);
  const [showEnrichForecast, setShowEnrichForecast] = useState(true);
  const [showPredictionInterval, setShowPredictionInterval] = useState(false);
  const [showOffsetForecast, setShowOffsetForecast] = useState(false);
  const [showPriceScenario, setShowPriceScenario] = useState(false);
  const [forecastLift, setForecastLift] = useState(null);
  const [revenueLift, setRevenueLift] = useState(null);
  const [marginLift, setMarginLift] = useState(null);
  const [netUnitLift, setNetUnitLift] = useState(null);
  const [totalDip, setTotalDip] = useState(null);
  const [netMarginLift, setNetMarginLift] = useState(null);
  const [netRevenueLift, setNetRevenueLift] = useState(null);
  const [salesForecastAndPriceColumns, setSalesForecastAndPriceColumns] =
    useState([]);
  const [isPromoPlanningMetrics, setIsPromoPlanningMetrics] = useState(false);
  const [promoPlanningForecastData, setPromoPlanningForecastData] = useState(
    []
  );

  const [valueMetrics, setValueMetrics] = useState(null);

  const [liftComparison, setLiftComparison] = useState({});
  const [isLoadingPromoPlanningData, setIsLoadingPromoPlanningData] =
    useState(true);
  const [promoPlanningForecastRan, setPromoPlanningForecastRan] =
    useState(false);
  const [isUpdatedData, setIsUpdatedData] = useState(null);
  const [multiFilterElasticity, setMultiFilterElasticity] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState([]);
  const [filtersChanged, setFiltersChanged] = useState(false);
  const [commonKeys, setCommonKeys] = useState([]);
  const [promoDimensionToFilter, setPromoDimensionToFilter] = useState(
    Object.keys(InvPriceFilterData).filter((key) => key !== "all") || []
  );

  const [promoStartDate, setPromoStartDate] = useState(null);
  const [promoEndDate, setPromoEndDate] = useState(null);
  const [promoDipMetrics, setPromoDipMetrics] = useState(null);
  console.log(promoEndDate, promoStartDate);

  // State for data
  const [data, setData] = useState([]);
  const [values, setValues] = useState([]);

  // State for current elasticity value
  const [currentElasticity, setCurrentElasticity] = useState(null);

  // Set oscillator to pricing constraints price automatically
  const priceField =
    experiment_config?.scenario_plan?.pricing_constraints?.price || "price";

  // Initialize data
  useEffect(() => {
    if (demandForecastingData && dateColumn) {
      setCurrentStartDate(demandForecastingData[dateColumn][0]);
      const length = demandForecastingData[dateColumn].length;
      setCurrentEndDate(demandForecastingData[dateColumn][length - 1]);

      const fetchGraphData = async () => {
        const graphData = await get_graph_data(
          extractKeys(demandForecastingData, dateColumn),
          enrichment_bydate_pricing,
          currentDimension,
          currentValue,
          dateColumn,
          priceField
        );
        setData(graphData);
      };
      fetchGraphData();
    }
  }, [demandForecastingData]);

  // Update values when dimension changes
  useEffect(() => {
    if (dimensionFilterData && currentDimension) {
      setValues(dimensionFilterData[currentDimension]);
      setCurrentValue(dimensionFilterData[currentDimension][0]);
    }
  }, [currentDimension]);

  // Update elasticity when currentValue or currentDimension changes
  useEffect(() => {
    if (elasticityDimensionFilterData && currentDimension && currentValue) {
      // Find the elasticity value for the current selected item
      const dimensionElasticityData =
        elasticityDimensionFilterData[currentDimension];
      console.log(dimensionElasticityData);
      if (dimensionElasticityData) {
        const elasticityItem = dimensionElasticityData.find(
          (item) => item.item === currentValue
        );
        console.log(elasticityItem);
        setCurrentElasticity(elasticityItem ? elasticityItem.elasticity : null);
      } else {
        setCurrentElasticity(null);
      }
    }
  }, [currentValue, currentDimension, elasticityDimensionFilterData]);

  // Apply filters when value or dimension changes
  useEffect(() => {
    if (dimensionFilterData && currentDimension && currentValue) {
      const CurrentValue = dimensionFilterData[currentDimension].includes(
        currentValue
      )
        ? currentValue
        : dimensionFilterData[currentDimension][0];

      setCurrentValue(CurrentValue);
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
    }
  }, [currentValue, currentDimension]);

  // Update graph data when enrichment changes
  useEffect(() => {
    if (data.length > 0) {
      const fetchGraphData = async () => {
        const graphData = await get_graph_data(
          data,
          enrichment_bydate_pricing,
          currentDimension,
          currentValue,
          dateColumn,
          priceField
        );
        setData(graphData);
      };
      fetchGraphData();
    }
  }, [enrichment_bydate_pricing]);

  const getPricingColumns = (data) => {
    // Only allow "Sales" or "Forecast" after the date
    if (!data) return [];

    const priceCol = configState?.scenario_plan?.pricing_constraints?.price;

    // Escape regex metacharacters in priceCol
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const tokens = ["Sales", "Forecast"];
    if (priceCol) tokens.push(priceCol);

    const regex = new RegExp(
      `^\\d{4}-\\d{2}-\\d{2}\\s+(${tokens.map(escapeRegExp).join("|")})$`
    );

    // Match only Sales & Forecast date columns
    let cols = Object.keys(data).filter((col) => regex.test(col));

    // Add pricing column from config
    if (priceCol && data.hasOwnProperty(priceCol)) {
      cols.push(priceCol);
    }

    // Add elasticity column if present
    const elasticityCol = `${priceCol}_elasticity`;
    if (priceCol && data.hasOwnProperty(elasticityCol)) {
      cols.push(elasticityCol);
    }

    // Add strategic_%price_change if present
    const strategicCol = "strategic_%price_change";
    if (data.hasOwnProperty(strategicCol)) {
      cols.push(strategicCol);
    }

    console.log(data);

    const margin_perc = "Margin%";
    if (data.hasOwnProperty(margin_perc)) {
      cols.push(margin_perc);
    }

    // Add additional fixed columns if present
    const fixedCols = [
      "Forecast_Per_Day",
      "strategic_forecast_per_day",
      "current_revenue_per_day",
      "strategic_revenue_per_day",
      "current_margin",
      "strategic_margin_per_day",
      "current_margin",
    ];

    fixedCols.forEach((col) => {
      if (data.hasOwnProperty(col)) {
        cols.push(col);
      }
    });

    return cols;
  };

  const convertFilePathToFileName = (filePath) => {
    if (!filePath) return "";
    const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
    const pathComponents = withoutExtension.split("/");
    return pathComponents.join("_");
  };

  const fetchData = async () => {
    setIsLoadingPromoPlanningData(true);
    const data = await (hasParquetFiles
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
        }));

    const forecastColumns = getPricingColumns(data);
    console.log(forecastColumns);
    setSalesForecastAndPriceColumns(forecastColumns);

    console.log("forecastColumnsData", data);
    console.log("SupplyPlanData", forecastColumns);

    if (data) {
      const filterOptions = {
        dimensions: InvPriceFilterData,
        columns: Object.keys(data),
      };

      const dataKeys = Object.keys(data ?? {});
      const invKeys = Object.keys(InvPriceFilterData ?? {});

      // Find common keys, excluding "all"
      const commonKeys = invKeys.filter(
        (key) => key !== "all" && dataKeys.includes(key)
      );

      setCommonKeys(commonKeys);
      if (promoPlanningFilterColumns.length === 0) {
        setTabFilterColumns(commonKeys, "promo");
      }

      // setFilterOpen(false);
    }
    if (forecastColumns.length === 0) {
      setIsUpdatedData(false);
    } else {
      setIsUpdatedData(true);
    }
    setIsLoadingPromoPlanningData(false);
  };

  useEffect(() => {
    if (true) {
      fetchData();
    }

    resetPreviewEnrichment();
    setIsTGScenario(false);
  }, []);

  const calculateNetMetricsFromTimeSeries = (
    results,
    enrichments,
    dimensionFilters,
    priceCol
  ) => {
    console.log("hello");

    // Find matching enrichment based on selectors
    const matchingEnrichment = findMatchingEnrichment(
      results,
      enrichments,
      dimensionFilters
    );

    if (!matchingEnrichment && (!promoStartDate || !promoEndDate)) {
      return {};
    }

    console.log("hello");

    // Extract elasticity and margin %
    const elasticity = results[`mean_${priceCol}_elasticity`]?.[0] || 0;
    const margin_perc = results["mean_Margin%"]?.[0] || 0;
    const basePriceValue = results[`mean_${priceCol}`]?.[0] || 0;
    const strategicPriceChange =
      results["mean_strategic_%price_change"]?.[0] || 0;
    // Get promo configuration

    console.log(strategicPriceChange);
    const promoFactorValue =
      configState?.scenario_plan?.pricing_constraints?.postpromo_e_factor ||
      0.2;
    const priceDipTenure =
      configState?.scenario_plan?.pricing_constraints?.postpromo_dip || 3;

    // STEP 1: Extract all forecast periods and their corresponding prices
    const forecastPeriods = [];
    const enrichmentValue = strategicPriceChange * elasticity;
    // Get all forecast keys and sort by date
    const forecastKeys = Object.keys(results)
      .filter((key) => key.includes("sum_") && key.includes("Forecast"))
      .sort(); // Sort to ensure chronological order
    console.log(forecastKeys);
    forecastKeys.forEach((forecastKey) => {
      const dateMatch = forecastKey.match(/sum_(\d{4}-\d{2}-\d{2}) Forecast/);
      if (dateMatch) {
        const date = dateMatch[1];
        const priceKey = `mean_${date} ${priceCol}`;
        const forecast = results[forecastKey]?.[0] || 0;
        const price = results[priceKey]?.[0] || basePriceValue;

        if (forecast > 0) {
          forecastPeriods.push({
            date,
            forecast,
            price,
            isPromoPeriod: date >= promoStartDate && date <= promoEndDate,
            index: forecastPeriods.length, // Add index for reference
          });
        }
      }
    });

    console.log(forecastPeriods);

    if (forecastPeriods.length === 0) {
      return { netUnitLift: null, netRevenueLift: null, netMarginLift: null };
    }

    // STEP 2: Calculate base scenario (no enrichment)
    let baseTotalUnits = 0;
    let baseTotalRevenue = 0;
    let baseTotalMargin = 0;

    forecastPeriods.forEach((period) => {
      const cost = period.price * (1 - margin_perc / 100);
      baseTotalUnits += period.forecast;
      baseTotalRevenue += period.forecast * period.price;
      baseTotalMargin += period.forecast * (period.price - cost);
    });

    // STEP 3: Apply promotion effects and calculate dip
    const enrichedPeriods = forecastPeriods.map((period) => ({
      ...period,
      // Apply promotion effects
      enrichedForecast: period.isPromoPeriod
        ? period.forecast * (1 + enrichmentValue / 100)
        : period.forecast,
      enrichedPrice: period.isPromoPeriod
        ? period.price * (1 + strategicPriceChange / 100)
        : period.price,
    }));

    console.log("hello");
    // STEP 4: Apply dip effect to post-promotion periods
    const calculateDipEffect = (
      periods,
      promoEndDate,
      basePriceValue,
      elasticity,
      promoFactor,
      dipTenure
    ) => {
      // Find the index of the last promotion period
      const lastPromoIndex = [...periods]
        .map((period, index) => ({ index, date: parseISO(period.date) }))
        .filter((item) => item.date <= parseISO(promoEndDate))
        .map((item) => item.index)
        .pop();
      if (lastPromoIndex === -1) return periods;
      console.log(lastPromoIndex);
      const result = [...periods];

      // For each week in the dip tenure, apply the dip effect
      for (let dipWeek = 1; dipWeek <= dipTenure; dipWeek++) {
        const currentIndex = lastPromoIndex + dipWeek;
        if (currentIndex >= result.length) break;

        const currentPeriod = result[currentIndex];
        const lastPromoPeriod = result[lastPromoIndex];

        console.log(lastPromoPeriod);

        if (!currentPeriod || !lastPromoPeriod) continue;

        // Calculate price change from last promo period to current period
        const lastPrice =
          lastPromoPeriod.enrichedPrice ||
          lastPromoPeriod.price ||
          basePriceValue;
        const currentPrice = currentPeriod.price || basePriceValue;

        if (!lastPrice || !currentPrice) continue;

        const priceChangePercent =
          ((currentPrice - lastPrice) / lastPrice) * 100;

        console.log(currentPrice, lastPrice, priceChangePercent);

        // Calculate effective elasticity for this dip week
        const remainingWeeks = dipTenure - (dipWeek - 1);
        const elasticityEffective =
          promoFactor * (remainingWeeks / dipTenure) * elasticity;

        // Calculate sales impact
        const salesImpactPercent = elasticityEffective * priceChangePercent;

        console.log(promoFactor, elasticity, remainingWeeks, dipTenure);
        // Apply dip effect to the forecast
        // Start from base forecast and apply the dip impact

        const dipForecast = Math.max(
          0,
          currentPeriod.forecast * (1 + salesImpactPercent / 100)
        );
        console.log(dipForecast, salesImpactPercent);
        // Update the period with dip-adjusted forecast
        result[currentIndex] = {
          ...currentPeriod,
          dipAdjustedForecast: dipForecast,
          isDipPeriod: true,
          dipWeek: dipWeek,
        };
      }

      return result;
    };

    // Apply dip effect
    const periodsWithDip = calculateDipEffect(
      enrichedPeriods,
      promoEndDate,
      basePriceValue,
      elasticity,
      promoFactorValue,
      priceDipTenure
    );

    console.log(periodsWithDip);

    // STEP 5: Calculate enriched scenario (with promotion + dip effects)
    let enrichedTotalUnits = 0;
    let enrichedTotalRevenue = 0;
    let enrichedTotalMargin = 0;
    let totalDipUnits = 0;
    let totalDipMargin = 0;
    let totalDipRevenue = 0;
    periodsWithDip.forEach((period) => {
      // Use dip-adjusted forecast if available, otherwise use enriched forecast, otherwise base forecast
      const finalForecast =
        period.dipAdjustedForecast !== undefined
          ? period.dipAdjustedForecast
          : period.enrichedForecast;

      const finalPrice = period.enrichedPrice;
      const cost = period.price * (1 - margin_perc / 100); // Cost remains same based on original price

      enrichedTotalUnits += finalForecast;
      enrichedTotalRevenue += finalForecast * finalPrice;
      enrichedTotalMargin += finalForecast * (finalPrice - cost);
      if (period.dipAdjustedForecast) {
        totalDipUnits += (period.forecast - period.dipAdjustedForecast);
        console.log(period.forecast , period.dipAdjustedForecast)
      }
    });

    console.log(totalDipUnits);
    // STEP 6: Calculate net lifts
    const netUnitLift =
      ((enrichedTotalUnits - baseTotalUnits) / baseTotalUnits) * 100;
    const netRevenueLift =
      ((enrichedTotalRevenue - baseTotalRevenue) / baseTotalRevenue) * 100;
    const netMarginLift =
      ((enrichedTotalMargin - baseTotalMargin) / baseTotalMargin) * 100;

    console.log("Net Metrics:", { netUnitLift, netRevenueLift, netMarginLift });

    return {
      netUnitLift,
      netRevenueLift,
      netMarginLift,
      baseTotalUnits,
      baseTotalRevenue,
      baseTotalMargin,
      enrichedTotalUnits,
      enrichedTotalRevenue,
      enrichedTotalMargin,
      totalDipUnits,
    };
  };

  function processResultsWithEnrichment(
    result,
    enrichments,
    dimensionFilters,
    priceCol
  ) {
    if (!enrichments.length || !dimensionFilters) {
      return {};
    }
    console.log(dimensionFilters);
    // Find matching enrichment based on selectors
    const matchingEnrichment = findMatchingEnrichment(
      result,
      enrichments,
      dimensionFilters
    );
    console.log(matchingEnrichment, result);

    if (!matchingEnrichment) {
      return {}; // No enrichment found, return original result
    }

    // Extract values from result with fallbacks
    const oldForecastPerDay = result.sum_Forecast_Per_Day?.[0] || 0;
    const elasticity = result[`mean_${priceCol}_elasticity`]?.[0] || 0;
    const currentPrice = result[`mean_${priceCol}`]?.[0] || 0;
    const currentRevenue = result.sum_current_revenue_per_day?.[0] || 0;
    const currentMargin = result.sum_current_margin?.[0] || 0;
    const margin_perc = result["mean_Margin%"]?.[0] || 0;
    const strategicPriceChange =
      result["mean_strategic_%price_change"]?.[0] || 0;
    console.log(strategicPriceChange);

    console.log(margin_perc);

    if (margin_perc === 0) {
      return {};
    }

    // Calculate cost from current revenue and margin

    const cost = currentPrice * (1 - margin_perc / 100);

    // Enrichment values
    const priceChangePercent = matchingEnrichment.changed_price_percent || 0;
    const enrichmentValue = matchingEnrichment.enrichment_value || 0;
    if (
      Number(strategicPriceChange.toFixed(2)) ===
        Number(priceChangePercent.toFixed(2)) &&
      matchingEnrichment?.isTGScenario
    ) {
      console.log("hi");
      return "TGScenario";
    }

    // Calculate new values based on your formulas
    const newForecastPerDay = calculateNewForecast(
      oldForecastPerDay,
      elasticity,
      priceChangePercent
    );
    const newPrice = calculateNewPrice(currentPrice, priceChangePercent);
    const newRevenue = calculateNewRevenue(newForecastPerDay, newPrice);
    const newMargin = calculateNewMargin(newForecastPerDay, newPrice, cost);

    const liftForecastPercent = calculateLiftPercent(
      oldForecastPerDay,
      newForecastPerDay
    );

    console.log(
      elasticity,
      priceChangePercent,
      elasticity * priceChangePercent
    );

    const liftRevenuePercent = calculateLiftPercent(currentRevenue, newRevenue);
    console.log(
      newForecastPerDay,
      newPrice,
      currentRevenue,
      newRevenue,
      elasticity,
      priceChangePercent,
      liftRevenuePercent
    );
    const liftMarginPercent = calculateLiftPercent(currentMargin, newMargin);

    // Return enriched result
    return {
      // Original values

      lift_perc_forecast: [liftForecastPercent],
      lift_perc_revenue: [liftRevenuePercent],
      lift_perc_margin: [liftMarginPercent],
      strategic_price_change: [strategicPriceChange],
      price_change_percent: [priceChangePercent],

      // Enrichment info for reference
    };
  }

  function calculateLiftPercent(oldValue, newValue) {
    if (oldValue === 0) {
      // If old value is zero, we can't calculate percentage change meaningfully
      // Return 0 or handle as appropriate for your use case
      return newValue > 0 ? 100 : 0;
    }

    console.log("oldValue", oldValue, "newValue", newValue);

    return ((newValue - oldValue) / oldValue) * 100;
  }
  function calculateNewForecast(oldForecast, elasticity, priceChangePercent) {
    const priceChangeDecimal = priceChangePercent / 100;
    return oldForecast + elasticity * priceChangeDecimal * oldForecast;
  }

  function calculateNewPrice(currentPrice, priceChangePercent) {
    const priceChangeDecimal = priceChangePercent / 100;
    console.log(
      priceChangeDecimal,
      currentPrice,
      priceChangePercent,
      currentPrice * (1 + priceChangeDecimal)
    );
    return currentPrice * (1 + priceChangeDecimal);
  }

  function calculateNewRevenue(newForecast, newPrice) {
    return newForecast * newPrice;
  }

  function calculateNewMargin(newForecast, newPrice, cost) {
    return newForecast * (newPrice - cost);
  }

  function findMatchingEnrichment(result, enrichments, dimensionFilters) {
    console.log("Dimension Filters:", dimensionFilters);
    console.log("Enrichments:", enrichments);

    const arraysEqual = (a, b) => {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;

      const aSorted = [...a].sort();
      const bSorted = [...b].sort();

      return aSorted.every((value, index) => value === bSorted[index]);
    };

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

    return enrichments.find((enrichment) =>
      objectsEqual(enrichment.selectors || {}, dimensionFilters || {})
    );
  }

  // 🔹 Helper function to calculate lift values
  const calculateLifts = (results, enrichments, dimensionFilters) => {
    if (!results)
      return {
        forecastLift: null,
        revenueLift: null,
        marginLift: null,
        forecastLiftValue: null,
        revenueLiftValue: null,
        marginLiftValue: null,
      };

    console.log(results);

    const freq = configState?.data?.frequency || "M";

    const promoFactorValue =
      configState?.scenario_plan?.pricing_constraints?.postpromo_e_factor ||
      0.2;
    const priceDipTenure =
      configState?.scenario_plan?.pricing_constraints?.postpromo_dip || 3;

    const price =
      results[
        `mean_${configState?.scenario_plan?.pricing_constraints?.price}`
      ]?.[0] || 0;
    const elasticity =
      results[
        `mean_${configState?.scenario_plan?.pricing_constraints?.price}_elasticity`
      ]?.[0] || 0;
    const forecastPerDay = results[`sum_Forecast_Per_Day`]?.[0] || 0;
    const margin_perc = results["mean_Margin%"]?.[0] || 0;

    const cost = price * (1 - margin_perc / 100);
    console.log(price, elasticity);
    const matchingEnrichment = findMatchingEnrichment(
      results,
      enrichments,
      dimensionFilters
    );

    let forecastLift = null;
    let revenueLift = null;
    let marginLift = null;
    let forecastDip = null;

    let forecastLiftValue = null;
    let revenueLiftValue = null;
    let marginLiftValue = null;
    let forecastDipValue = null;
    // --- FORECAST ---
    const forecast = results?.sum_Forecast_Per_Day?.[0];
    const strategicForecast = results?.sum_strategic_forecast_per_day?.[0];

    if (forecast && forecast > 0 && strategicForecast !== undefined) {
      forecastLift = (100 * (strategicForecast / forecast - 1)).toFixed(2);
      forecastLiftValue = strategicForecast - forecast; // per-day raw difference
    }

    // --- REVENUE ---
    const currentRevenue = results?.sum_current_revenue_per_day?.[0];
    const strategicRevenue = results?.sum_strategic_revenue_per_day?.[0];

    if (
      currentRevenue &&
      currentRevenue > 0 &&
      strategicRevenue !== undefined
    ) {
      revenueLift = (100 * (strategicRevenue / currentRevenue - 1)).toFixed(2);
      revenueLiftValue = strategicRevenue - currentRevenue;
    }

    // --- MARGIN ---
    const currentMargin = results?.sum_current_margin?.[0];
    const strategicMargin = results?.sum_strategic_margin_per_day?.[0];

    if (currentMargin && currentMargin > 0 && strategicMargin !== undefined) {
      marginLift = (100 * (strategicMargin / currentMargin - 1)).toFixed(2);
      marginLiftValue = strategicMargin - currentMargin;
    }

    // -------------------------------------------------------
    //  DECIDE NUMBER OF DAYS USING ENRICHMENT OR PROMO DATES
    // -------------------------------------------------------
    let totalDays = null;

    // 1️⃣ Take from enrichment if present
    if (matchingEnrichment?.date_range?.length === 2) {
      const [start, end] = matchingEnrichment.date_range;
      totalDays = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
    }
    // 2️⃣ Else fallback to promo dates
    else if (promoStartDate && promoEndDate) {
      const start = promoStartDate;
      const end = promoEndDate;
      totalDays = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
    }

    console.log(totalDays, promoStartDate);

    // 3️⃣ If no valid date range → return null for values
    if (!totalDays || totalDays <= 0) {
      return {
        forecastLift,
        revenueLift,
        marginLift,
        forecastLiftValue: null,
        revenueLiftValue: null,
        marginLiftValue: null,
        netForecastLift: null,
        netRevenueLift: null,
        netMarginLift: null,
        netForecastLiftValue: null,
        netRevenueLiftValue: null,
        netMarginLiftValue: null,
      };
    }

    console.log(
      forecastLiftValue,
      revenueLiftValue,
      marginLiftValue,
      totalDays,
      totalDip
    );

    if (price && elasticity && forecast) {
      // Calculate strategic price from the percentage change
      const strategicPercentChange =
        results?.["mean_strategic_%price_change"]?.[0] || 0;

      // Strategic price = original price * (1 + strategicPercentChange/100)
      const strategicPrice = price * (1 + strategicPercentChange / 100);

      // Calculate the percentage change needed to go from strategic price back to original price
      // This is the price change that will cause the dip effect
      const priceChangePercent =
        ((price - strategicPrice) / strategicPrice) * 100;

      // Calculate forecast dip using your formula
      // dipForecast = Forecast + (promoFactor * current_price_elasticity * (perc_change/100)) * Forecast
      const dipEffect =
        promoFactorValue * elasticity * (priceChangePercent / 100);
      const dipForecast = forecast * (1 + dipEffect);

      forecastDip = (100 * (dipForecast / forecast - 1)).toFixed(2);
      forecastDipValue = dipForecast - forecast;

      console.log("Dip Calculation:", {
        originalPrice: price,
        strategicPercentChange,
        strategicPrice,
        priceChangePercent, // This is now the % change back to original price
        elasticity,
        forecast,
        promoFactorValue,
        dipEffect,
        dipForecast,
        forecastDip,
        forecastDipValue,
      });
    }

    let dipDays = 0;

    if (freq === "D") {
      dipDays = priceDipTenure; // tenure already in days
    } else if (freq === "W") {
      dipDays = priceDipTenure * 7; // convert weeks → days
    } else if (freq === "M") {
      dipDays = priceDipTenure * 30; // convert months → days (approx)
    }

    let forecastDipValuePerDay = 0;
    console.log(dipDays, totalDip);
    if (totalDip) {
      forecastDipValuePerDay = totalDip / dipDays;
    }
    let netForecastLift = null; // NEW
    let netForecastLiftValue = null;

    if (
      forecast &&
      forecast > 0 &&
      strategicForecast !== undefined &&
      totalDip &&
      dipDays > 0
    ) {
      // Existing gross forecast lift

      // --- Net Lift calculation ---

      const grossLift = (strategicForecast - forecast) / forecast;

      const dipEffect = totalDip / dipDays; // dipped per-day value
      const dipLift = (dipEffect) / forecast;

      const netLift = grossLift - dipLift; // core formula
      console.log(grossLift, dipEffect, dipLift, netLift);
      netForecastLift = (netLift * 100).toFixed(2);
      netForecastLiftValue =
        strategicForecast - forecast - dipEffect  // optional, depends on your needs
    }

    console.log(
      forecastLiftValue,
      strategicForecast,
      netForecastLiftValue,
      forecast
    );

    console.log(netForecastLift, netForecastLiftValue);

    let netRevenueLift = null; // NEW
    let netRevenueLiftValue = null; // NEW (optional raw value)

    if (
      currentRevenue &&
      currentRevenue > 0 &&
      strategicRevenue !== undefined &&
      totalDip &&
      dipDays > 0 &&
      price
    ) {
      // Existing gross revenue lift

      // ---- Net Revenue Lift calculation ----

      const grossLift = (strategicRevenue - currentRevenue) / currentRevenue;

      // Dip revenue per day = (DipUnitsTotal * Price) / DipDays
      const dipRevenuePerDay = (totalDip / dipDays) * price;
      console.log(totalDip*price)
      const dipLift = (dipRevenuePerDay) / currentRevenue;
      
      const netLift = grossLift - dipLift;

      netRevenueLift = (netLift * 100).toFixed(2);
      console.log(
        grossLift,
        dipRevenuePerDay,
        dipLift,
        netLift,
        price,
        currentRevenue,
        forecast,
        totalDip
      );
      // Optional raw net effect if you need it
      netRevenueLiftValue =
        strategicRevenue - currentRevenue - dipRevenuePerDay
    }

    console.log(
      netRevenueLift,
      netRevenueLiftValue,
      revenueLift,
      revenueLiftValue,
      strategicRevenue
    );

    let netMarginLift = null; // NEW
    let netMarginLiftValue = null; // NEW (optional raw net value)
    let marginPerUnit = null;
    if (
      currentMargin &&
      currentMargin > 0 &&
      strategicMargin !== undefined &&
      totalDip &&
      dipDays > 0 &&
      price !== undefined &&
      cost !== undefined
    ) {
      // Existing gross margin lift

      // ---- Net Margin Lift calculation ----

      const grossLift = (strategicMargin - currentMargin) / currentMargin;

      // margin per unit = price - cost
      marginPerUnit = price - cost;

      // dip margin per day = (dipUnitsTotal * marginPerUnit) / dipDays
      const dipMarginPerDay = (totalDip * marginPerUnit) / dipDays;

      const dipLift = (dipMarginPerDay) / currentMargin;

      const netLift = grossLift - dipLift;

      netMarginLift = (netLift * 100).toFixed(2);

      // Optional raw difference
      netMarginLiftValue =
        strategicMargin - currentMargin - dipMarginPerDay;

      console.log(
        grossLift,
        marginPerUnit,
        netLift,
        dipMarginPerDay,
        currentMargin,
        strategicMargin,
        netMarginLift
      );
    }

    // -------------------------------------------------------
    //  MULTIPLY ORIGINAL VALUES BY DAYS (override same states)
    // -------------------------------------------------------
    if (forecastLiftValue !== null) {
      forecastLiftValue *= totalDays;
    }

    if (revenueLiftValue !== null) {
      revenueLiftValue *= totalDays;
    }

    if (marginLiftValue !== null) {
      marginLiftValue *= totalDays;
    }
    if (netForecastLiftValue !== null) {
      netForecastLiftValue = forecastLiftValue - totalDip;
    }
    if (netRevenueLiftValue !== null) {
      netRevenueLiftValue = revenueLiftValue - totalDip*price;
    }
    if (netMarginLiftValue !== null) {
      netMarginLiftValue = marginLiftValue - totalDip*marginPerUnit;
    }
    console.log(netForecastLiftValue, forecastLiftValue);

    return {
      forecastLift,
      revenueLift,
      marginLift,
      forecastLiftValue,
      revenueLiftValue,
      marginLiftValue,
      netForecastLift,
      netRevenueLift,
      netMarginLift,
      netForecastLiftValue,
      netRevenueLiftValue,
      netMarginLiftValue,
    };
  };

  const path = `${experimentBasePath}/scenario_planning/K_best/scenario_plan/data_pivot_metrics.csv`;
  console.log(
    enrichment_bydate_pricing_multi_filter,
    tablesFilterData[`${convertFilePathToFileName(path)}_promo`]?.Default
      ?.filterData.dimensionFilters
  );

  const filterDataKey = useMemo(() => {
  return `${convertFilePathToFileName(path)}_promo`;
}, [path]);

const filterDataMemo = useMemo(() => {
  return tablesFilterData?.[filterDataKey]?.Default?.filterData || null;
}, [tablesFilterData, filterDataKey]);
  useEffect(() => {
    const calculateAllSums = async () => {
      try {
        // Start loading
         if (!filterData || 
        !salesForecastAndPriceColumns || 
        salesForecastAndPriceColumns.length === 0) {
      return;
    }

        const priceCol = configState?.scenario_plan?.pricing_constraints?.price;
        const elasticityCol = priceCol ? `${priceCol}_elasticity` : null;

        const aggregationColumnsProp = salesForecastAndPriceColumns.reduce(
          (acc, columnName) => {
            // elasticity column → mean
            if (elasticityCol && columnName === elasticityCol) {
              acc[columnName] = "mean";
            }
            // date-prefixed price column → mean
            else if (priceCol && columnName.endsWith(priceCol)) {
              acc[columnName] = "mean";
            }
            // strategic_%price_change → mean
            else if (columnName === "strategic_%price_change") {
              acc[columnName] = "mean";
            } else if (columnName === "Margin%") {
              console.log("Hi");
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

        const hasPricingAndElasticity = (() => {
          const priceCol =
            configState?.scenario_plan?.pricing_constraints?.price;
          if (!priceCol) return false;

          const elasticityCol = `${priceCol}_elasticity`;

          return (
            salesForecastAndPriceColumns.includes(priceCol) &&
            salesForecastAndPriceColumns.includes(elasticityCol)
          );
        })();

        setIsPromoPlanningMetrics(hasPricingAndElasticity);

        const payload = {
          fileName: convertFilePathToFileName(path),
          filePath: path,
          filterData:
            tablesFilterData[`${convertFilePathToFileName(path)}_promo`]
              ?.Default?.filterData,

          sortingData: null,
          groupByColumns: [],
          aggregationColumns: aggregationColumnsProp,
          filterConditions: [],
          paginationData: null,
          time: Date.now(),
        };

        if (
          salesForecastAndPriceColumns &&
          salesForecastAndPriceColumns.length > 0
        ) {
          const overallStart = performance.now();
          console.log(`[calculateAllSums]All parallel`);
          const results = await callQueryEngineQuery(payload);
          console.log(results);
          setPromoPlanningForecastData(results || []);
          const {
            netUnitLift,
            netRevenueLift,
            netMarginLift,
            baseTotalUnits,
            enrichedTotalUnits,
            totalDipUnits,
          } = calculateNetMetricsFromTimeSeries(
            results || [],
            enrichment_bydate_pricing_multi_filter,
            tablesFilterData[`${convertFilePathToFileName(path)}_promo`]
              ?.Default?.filterData?.dimensionFilters,
            priceCol
          );
          console.log(totalDipUnits);
          setTotalDip(totalDipUnits);
          setNetUnitLift(netUnitLift);
          setNetRevenueLift(netRevenueLift);
          setNetMarginLift(netMarginLift);
          const { forecastLift, revenueLift, marginLift, ...liftValues } =
            calculateLifts(
              results,
              enrichment_bydate_pricing_multi_filter,
              tablesFilterData[`${convertFilePathToFileName(path)}_promo`]
                ?.Default?.filterData?.dimensionFilters
            );

          setValueMetrics(liftValues);

          const processedResults = processResultsWithEnrichment(
            results || [],
            enrichment_bydate_pricing_multi_filter,
            tablesFilterData[`${convertFilePathToFileName(path)}_promo`]
              ?.Default?.filterData?.dimensionFilters,
            priceCol
          );

          let liftComparison;

          if (Object.keys(processedResults).length === 0) {
            // object is
            liftComparison = {};
          } else if (processedResults === "TGScenario") {
            liftComparison = {
              TGScenarioLift: {
                lift_perc_forecast: forecastLift,
                lift_perc_revenue: revenueLift,
                lift_perc_margin: marginLift,
                price_change_percent:
                  results["mean_strategic_%price_change"]?.[0] || 0,
              },
              timestamp: new Date().toISOString(),
            };
          } else {
            liftComparison = {
              TGScenarioLift: {
                lift_perc_forecast: forecastLift,
                lift_perc_revenue: revenueLift,
                lift_perc_margin: marginLift,
                price_change_percent:
                  processedResults.strategic_price_change?.[0] || 0,
              },
              CustomScenarioLift: {
                lift_perc_forecast:
                  processedResults.lift_perc_forecast?.[0] || 0,
                lift_perc_revenue: processedResults.lift_perc_revenue?.[0] || 0,
                lift_perc_margin: processedResults.lift_perc_margin?.[0] || 0,
                price_change_percent:
                  processedResults.price_change_percent?.[0] || 0,
              },
              timestamp: new Date().toISOString(),
            };
          }

          setLiftComparison(liftComparison);

          console.log("processedResults:", processedResults);
          console.log(forecastLift, revenueLift, marginLift);

          // 🔹 Store in state
          setForecastLift(forecastLift);
          setRevenueLift(revenueLift);
          setMarginLift(marginLift);

          const elasticityValue = results[`mean_${priceCol}_elasticity`][0];
          setMultiFilterElasticity(elasticityValue);

          console.log("[calculateAllSums]Results:", results);

          const overallEnd = performance.now();
          console.log(
            `[calculateAllSums]All parallel calculations completed in ${(
              overallEnd - overallStart
            ).toFixed(2)} ms`
          );
        }
      } catch (err) {
        console.error("[calculateAllSums]Unexpected error:", err);
      } finally {
        if (salesForecastAndPriceColumns !== null) {
          setPromoPlanningForecastRan(true);
        }
      }
    };

    calculateAllSums();
  }, [
    // tablesFilterData[`${convertFilePathToFileName(path)}_promo`]?.Default
    //   ?.filterData?.dimensionFilters,
     filterDataMemo,
    salesForecastAndPriceColumns,
    enrichment_bydate_pricing_multi_filter,
    promoStartDate,
    promoEndDate,
    totalDip,
  ]);

  useEffect(() => {
    const dimensionFilters =
      tablesFilterData[`${convertFilePathToFileName(path)}_promo`]?.Default
        ?.filterData?.dimensionFilters;

    if (dimensionFilters) {
      let filtersArray = [];
      Object.keys(dimensionFilters).forEach((key) => {
        filtersArray = filtersArray.concat(dimensionFilters[key]);
      });
      setFiltersApplied(filtersArray);

      console.log("Filters Applied:", filtersArray);
    }
  }, [tablesFilterData]);

  const promoFactorValue =
    configState?.scenario_plan?.pricing_constraints?.postpromo_e_factor || 0.2;

  // Filter data by date range
  const setDateFilter = (startDate, endDate, data) => {
    if (startDate && endDate) {
      const filteredData = data.filter(
        (d) => d[dateColumn] >= startDate && d[dateColumn] <= endDate
      );
      setData(filteredData);
    }
  };

  // Handle date filter changes
  useEffect(() => {
    if (currentStartDate && currentEndDate && demandForecastingData) {
      const fetchGraphData = async () => {
        const graphData = await get_graph_data(
          extractKeys(demandForecastingData, dateColumn),
          enrichment_bydate_pricing,
          currentDimension,
          currentValue,
          dateColumn,
          priceField
        );
        setDateFilter(currentStartDate, currentEndDate, graphData);
      };
      fetchGraphData();
    }
  }, [currentStartDate, currentEndDate]);

  const handleClearFilter = () => {
    setCurrentDimension("all");
    setCurrentElasticity(null);
    if (demandForecastingData && dateColumn) {
      setCurrentStartDate(demandForecastingData[dateColumn][0]);
      const length = demandForecastingData[dateColumn].length;
      setCurrentEndDate(demandForecastingData[dateColumn][length - 1]);
    }
  };

  // Define colors for different data series
  const colors = {
    actual: "#1f77b4",
    pred: "#2ca02c",
    out_of_time_validation: "#ff7f0e",
    enrichment_forecast: "#6f6f00",
    ml_forecast: "#d62728",
    offset_forecast: "#d6a74d",
    future_actual: "#1f77b4",
    price_scenario: "#9333ea",
    [priceField]: "#d6a74d",
  };

  // Check if price field exists in data
  const hasPriceData = data.length > 0 && priceField in data[0];

  // Define controls for combined chart
  const combinedPrimaryControls = [
    {
      label: "Preview Enrichment",
      checked: showEnrichForecast,
      onChange: (e) => setShowEnrichForecast(e.target.checked),
    },

    ...(hasPriceData
      ? [
          {
            label: "Preview Price Scenario",
            checked: showPriceScenario,
            onChange: (e) => setShowPriceScenario(e.target.checked),
          },
        ]
      : []),
  ];

  const combinedSecondaryControls = [
    {
      label: "Future Actuals",
      checked: showFutureActuals,
      onChange: (e) => setShowFutureActuals(e.target.checked),
    },
    {
      label: "Prediction Interval",
      checked: showPredictionInterval,
      onChange: (e) => setShowPredictionInterval(e.target.checked),
    },
    {
      label: "ML Forecast",
      checked: showMLForecast,
      onChange: (e) => setShowMLForecast(e.target.checked),
    },
    ...(data.length > 0 && "offset_forecast" in data[0]
      ? [
          {
            label: "Offset Forecast",
            checked: showOffsetForecast,
            onChange: (e) => setShowOffsetForecast(e.target.checked),
          },
        ]
      : []),
  ];

  const isDateRangeInvalid =
    currentStartDate &&
    currentEndDate &&
    new Date(currentStartDate) > new Date(currentEndDate);

  // Determine what to show in main content area
  const shouldShowSkeleton =
    (!data.length && !isDateRangeInvalid) || !promoPlanningForecastRan;
  const shouldShowError = isDateRangeInvalid;
  const shouldShowContent = data.length && !isDateRangeInvalid;

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Filter Controls */}
      {isUpdatedData !== null && !isUpdatedData && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          padding={"8px 12px"}
          gap={1.5}
        >
          <CustomAutocomplete
            disableClearable
            showLabel
            label="Dimension"
            placeholder="select option.."
            values={Object.keys(dimensionFilterData)}
            selectedValues={currentDimension}
            setSelectedValues={setCurrentDimension}
          />
          <CustomAutocomplete
            disableClearable
            showLabel
            label="Select value within dimension"
            placeholder="select option.."
            values={values}
            selectedValues={currentValue}
            setSelectedValues={setCurrentValue}
            path={null}
          />

          <Stack
            direction={"row"}
            spacing={1.5}
            justifyContent={"flex-end"}
            alignItems={"flex-end"}
          >
            <CustomButton
              title="Clear"
              onClick={handleClearFilter}
              backgroundColor="#FFFF"
              borderColor="#D0D5DD"
              textColor="#344054"
            />
          </Stack>
        </Stack>
      )}
      {shouldShowError && <DateValidationError />}

      {shouldShowSkeleton ||
        (isUpdatedData === null && <MainContentSkeleton />)}

      {/* Main Content */}
      {!isPromoPlanningMetrics &&
        !isLoadingPromoPlanningData &&
        !isUpdatedData &&
        isUpdatedData !== null && (
          <Grid container spacing={1} paddingX={"12px"} paddingY={"6px"}>
            {/* Enrichment Box */}
            <Grid
              item
              xs={12}
              md={3.5}
              sx={{
                padding: "6px 8px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 2px 2px #1018280D",
                  height: "460px",
                  display: "flex",
                  flexDirection: "column",
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
                  <ScenarioBuilderBox
                    dimensionFilterData={dimensionFilterData}
                    currentDimension={currentDimension}
                    currentValue={currentValue}
                    setStartDate={setPromoStartDate}
                    setEndDate={setPromoEndDate}
                    startDate={promoStartDate}
                    endDate={promoEndDate}
                    elasticity={currentElasticity}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Split Chart Section */}
            <Grid
              item
              xs={12}
              md={8.5}
              sx={{
                padding: "6px 8px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Combined Chart Container */}
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
                <ChartHeaderWithControls
                  title="Promo Planning - Forecast & Price Analysis"
                  primaryControls={combinedPrimaryControls}
                  secondaryControls={combinedSecondaryControls}
                  showMoreButton={true}
                />

                <Box sx={{ padding: "12px", height: "calc(100% - 42px)" }}>
                  {/* Forecast Chart - Top Chart */}
                  <Box sx={{ marginBottom: "12px" }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart
                        data={data}
                        syncId="promoPlanning"
                        margin={{ top: 5, right: 20, left: 15, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey={dateColumn}
                          stroke="#475467"
                          tickFormatter={formatXAxis}
                          interval={Math.floor(data.length / 7)}
                          allowDataOverflow
                          type="category"
                          tick={{
                            fill: "#475467",
                            fontSize: 0, // Hide X-axis labels on top chart
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
                          tick={{
                            fill: "#475467",
                            fontSize: 12,
                            fontWeight: 400,
                            fontFamily: "Inter",
                          }}
                          label={{
                            value: "Forecast",
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
                        <Tooltip content={<CustomTooltipComponent />} />

                        {/* Forecast data */}
                        <Area
                          type="linear"
                          dataKey="pred"
                          strokeWidth={2}
                          stroke={colors.pred}
                          fill="none"
                          dot={{
                            fill: colors.pred,
                            stroke: colors.pred,
                            strokeWidth: 1,
                          }}
                        />
                        <Area
                          type="linear"
                          dataKey="out_of_time_validation"
                          strokeWidth={2}
                          stroke={colors.out_of_time_validation}
                          fill="none"
                          dot={{
                            fill: colors.out_of_time_validation,
                            stroke: colors.out_of_time_validation,
                            strokeWidth: 1,
                          }}
                        />
                        <Area
                          type="linear"
                          dataKey="actual"
                          strokeWidth={2}
                          stroke={colors.actual}
                          fill="none"
                          dot={{
                            fill: colors.actual,
                            stroke: colors.actual,
                            strokeWidth: 1,
                          }}
                        />
                        {showFutureActuals && (
                          <Area
                            type="linear"
                            dataKey="future_actual"
                            strokeWidth={2}
                            stroke={colors.future_actual}
                            fill="none"
                            strokeDasharray="2 2"
                            dot={{
                              fill: colors.future_actual,
                              stroke: colors.future_actual,
                              strokeWidth: 1,
                            }}
                          />
                        )}
                        {showMLForecast && (
                          <Area
                            type="linear"
                            dataKey="ml_forecast"
                            strokeWidth={2}
                            stroke={colors.ml_forecast}
                            fill="none"
                            strokeDasharray="2 2"
                            dot={{
                              fill: colors.ml_forecast,
                              stroke: colors.ml_forecast,
                              strokeWidth: 1,
                            }}
                          />
                        )}
                        {showEnrichForecast && (
                          <Area
                            type="linear"
                            dataKey="enrichment_forecast"
                            strokeWidth={2}
                            stroke={colors.enrichment_forecast}
                            fill="none"
                            strokeDasharray="2 2"
                            dot={{
                              fill: colors.enrichment_forecast,
                              stroke: colors.enrichment_forecast,
                              strokeWidth: 1,
                            }}
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
                        {showOffsetForecast && (
                          <Area
                            type="linear"
                            dataKey="offset_forecast"
                            strokeWidth={2}
                            stroke={colors.offset_forecast}
                            fill="none"
                            strokeDasharray="2 2"
                            dot={{
                              fill: colors.offset_forecast,
                              stroke: colors.offset_forecast,
                              strokeWidth: 1,
                            }}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Price Chart - Bottom Chart */}
                  {hasPriceData && (
                    <Box>
                      <ResponsiveContainer width="100%" height={170}>
                        <LineChart
                          data={data}
                          syncId="promoPlanning"
                          margin={{ top: 0, right: 20, left: 15, bottom: 5 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                          />
                          <XAxis
                            dataKey={dateColumn}
                            stroke="#475467"
                            tickFormatter={formatXAxis}
                            interval={Math.floor(data.length / 7)}
                            allowDataOverflow
                            type="category"
                            tick={{
                              fill: "#475467",
                              fontSize: 12, // Show X-axis labels on bottom chart
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
                            tick={{
                              fill: "#475467",
                              fontSize: 12,
                              fontWeight: 400,
                              fontFamily: "Inter",
                            }}
                            label={{
                              value: "Price",
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
                          <Tooltip content={<CustomTooltipComponent />} />

                          {/* Price data */}
                          <Line
                            type="linear"
                            dataKey={priceField}
                            strokeWidth={2}
                            stroke="#d6a74d"
                            dot={{
                              fill: "#d6a74d",
                              stroke: "#d6a74d",
                              strokeWidth: 1,
                            }}
                          />
                          {showPriceScenario && (
                            <Line
                              type="linear"
                              dataKey="price_scenario"
                              strokeWidth={2}
                              stroke="#9333ea"
                              strokeDasharray="2 2"
                              dot={{
                                fill: "#9333ea",
                                stroke: "#9333ea",
                                strokeWidth: 1,
                              }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}

      <Grid paddingX={"12px"}>
        {forecastLift != null && marginLift != null && revenueLift != null && (
          <StrategicGrowthStrip
            unitLift={forecastLift}
            marginLift={marginLift}
            revenueLift={revenueLift}
            netUnitLift={netUnitLift}
            netMarginLift={netMarginLift}
            netRevenueLift={netRevenueLift}
            elasticity={multiFilterElasticity}
            netElasticity={multiFilterElasticity * promoFactorValue}
            valueMetrics={valueMetrics}
          />
        )}
      </Grid>
      {isUpdatedData === true && promoPlanningForecastData && (
        <Grid container spacing={1} paddingX={"12px"} paddingY={"6px"}>
          <Grid
            item
            xs={12}
            md={2.5}
            sx={{
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Box
              sx={{
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 2px 2px #1018280D",
                height: "460px",
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <FilterBlock
                filtersApplied={filtersApplied}
                dimensionsToFilter={promoPlanningFilterColumns}
                setDimensionsToFilter={(value) =>
                  setTabFilterColumns(value, "promo")
                }
                dimensionOptions={commonKeys}
                fileName={`${convertFilePathToFileName(path)}_promo`}
                fileName1={`${convertFilePathToFileName(
                  `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`
                )}_promo`}
                reportName1={"Elasticity Detailed View Promo"}
                reportName="Promo Planning"
                filterOptions={InvPriceFilterData}
                filterData={filterData}
                path={path}
                sizeGiven={true}
                isPromo={true}
              />
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Combined Chart Container */}

            {promoPlanningForecastData.length !== 0 && (
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
                <ForecastChartPromo
                  data={promoPlanningForecastData}
                  filterData={
                    tablesFilterData[`${convertFilePathToFileName(path)}_promo`]
                      ?.Default?.filterData?.dimensionFilters
                  }
                  showEnrichment={true}
                  priceColumn={priceField}
                  unitLift={forecastLift}
                  liftComparison={liftComparison}
                  setPromoDipMetrics={setPromoDipMetrics}
                />
              </Box>
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={2.5}
            sx={{
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 2px 2px #1018280D",
                height: "460px",
                display: "flex",
                flexDirection: "column",
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
                <ScenarioBuilderMultiFilter
                  dimensionFilterData={dimensionFilterData}
                  currentDimension={currentDimension}
                  currentValue={currentValue}
                  elasticity={multiFilterElasticity}
                  isMultiFilter={true}
                  fileNameDefault={`${convertFilePathToFileName(path)}_promo`}
                  forecastLift={forecastLift}
                  marginLift={marginLift}
                  revenueLift={revenueLift}
                  priceChangeAmount={
                    promoPlanningForecastData[
                      "mean_strategic_%price_change"
                    ]?.[0] || 0
                  }
                  filterData={
                    tablesFilterData[`${convertFilePathToFileName(path)}_promo`]
                      ?.Default?.filterData?.dimensionFilters
                  }
                  setStartDate={setPromoStartDate}
                  setEndDate={setPromoEndDate}
                  startDate={promoStartDate}
                  endDate={promoEndDate}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
      <CustomTable
        // data={priceOptimizationData}
        title="Elasticity Detailed View Promo"
        fileNamePromo={`${convertFilePathToFileName(
          `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`
        )}_promo`}
      />
    </Stack>
  );
};

export default PromoPlanning;
