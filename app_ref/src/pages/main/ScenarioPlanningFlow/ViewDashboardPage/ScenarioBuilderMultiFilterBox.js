"use client";
import {
  Box,
  Chip,
  Stack,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Alert,
  Fade,
  Tooltip,
} from "@mui/material";
import { useMemo, useEffect, useState } from "react";
import useConfig from "../../../../hooks/useConfig";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import CustomTooltip from "../../../../components/CustomToolTip";
import { Close as CloseIcon } from "@mui/icons-material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useDashboard from "../../../../hooks/useDashboard";
import { filter } from "lodash";

const ScenarioBuilderMultiFilter = ({
  currentDimension,
  currentValue,
  dimensionFilterData,
  elasticity = -0.5,
  onNavigate,
  isMultiFilter = true,
  fileNameDefault,
  forecastLift = null,
  priceChangeAmount = null,
  filterData = null,
  setStartDate,
  setEndDate,
  startDate,
  endDate,
}) => {
  const {
    enrichment,
    setEnrichmentDimension,
    setEnrichmentValue,
    addEnrichment,
    enrichment_bydate,
    enrichment_bydate_pricing,
    removeEnrichmentByIndex,
    removeEnrichmentPricingByIndex,
    setEnrichmentStartDate,
    setEnrichmentEndDate,
    setEnrichmentEnrichmentValue,
    setEnrichment_bydate,
    addEnrichmentPricingMultifilter,
    removeEnrichmentPricingMultifilter,
    enrichment_bydate_pricing_multi_filter,
    // TG Scenario related
    isTGScenario,
    setIsTGScenario,
    previewEnrichment,
    setPreviewEnrichment,
    setPreviewEnrichmentDateRange,
    setPreviewEnrichmentValue,
    setPreviewChangedPricePercent,
  } = useConfig();

  console.log(forecastLift, priceChangeAmount);

  const { setCurrentValue, tablesFilterData } = useDashboard();

  const [refresh, setRefresh] = useState(true);
  const [showFirstScenarioMessage, setShowFirstScenarioMessage] =
    useState(false);
  const [previousScenarioCount, setPreviousScenarioCount] = useState(0);
  const [currentValueIndex, setCurrentValueIndex] = useState(0);

  // Multi-filter specific states
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  const [enrichmentType, setEnrichmentType] = useState("uplift");
  const [changedPricePercent, setChangedPricePercent] = useState(0);

  // Helper function to compare numbers with precision
  const areNumbersEqual = (num1, num2, precision = 2) => {
    const rounded1 = Number(Number(num1).toFixed(precision));
    const rounded2 = Number(Number(num2).toFixed(precision));
    return rounded1 === rounded2;
  };

  // Helper function to safely convert to number with 2 decimal precision
  const toPreciseNumber = (value, precision = 2) => {
    if (value === null || value === undefined) return 0;
    return Number(Number(value).toFixed(precision));
  };

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  }

  // Get available values for the current dimension
  const availableValues = useMemo(() => {
    if (!dimensionFilterData || currentDimension === "all") {
      return [];
    }

    const dimensionValues = dimensionFilterData[currentDimension];
    return Array.isArray(dimensionValues) ? dimensionValues : [];
  }, [dimensionFilterData, currentDimension]);

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

  const hasExistingScenario = useMemo(() => {
    console.log(enrichment_bydate_pricing_multi_filter, filterData);
    return enrichment_bydate_pricing_multi_filter.some((enrichment) =>
      objectsEqual(enrichment.selectors || {}, filterData)
    );
  }, [enrichment_bydate_pricing_multi_filter, filterData]);

  // Update current value index when currentValue changes
  useEffect(() => {
    if (availableValues.length > 0) {
      const index = availableValues.findIndex(
        (value) => value === currentValue
      );
      setCurrentValueIndex(index >= 0 ? index : 0);
    }
  }, [currentValue, availableValues]);

  // Effect to sync with TG Scenario state
  useEffect(() => {
    if (isTGScenario && previewEnrichment) {
      // When TG Scenario is enabled, populate the form with preview enrichment values
      if (
        previewEnrichment.date_range &&
        previewEnrichment.date_range[0] &&
        previewEnrichment.date_range[1]
      ) {
        setStartDate(previewEnrichment.date_range[0]);
        setEndDate(previewEnrichment.date_range[1]);
      }

      if (
        previewEnrichment.changed_price_percent !== null &&
        previewEnrichment.changed_price_percent !== undefined &&
        priceChangeAmount
      ) {
        console.log(previewEnrichment.changed_price_percent);
        
        setChangedPricePercent(Number(priceChangeAmount.toFixed(2)));
      }
    } else if (!isTGScenario) {
      // When TG Scenario is disabled, reset form to initial state
      console.log("Resetting form");

      setChangedPricePercent(0);
    }
  }, [isTGScenario, priceChangeAmount]);

  // Effect to update preview enrichment when form values change (only when TG Scenario is active)
  useEffect(() => {
    if (isTGScenario && startDate && endDate) {
      const formatDateToString = (date) => {
        if (!date) return null;
        if (typeof date === "string") return date.split("T")[0];
        if (date instanceof Date) return date.toISOString().split("T")[0];
        if (date && typeof date.format === "function")
          return date.format("YYYY-MM-DD");
        try {
          return new Date(date).toISOString().split("T")[0];
        } catch (error) {
          console.warn("Could not format date:", date, error);
          return null;
        }
      };

      // Calculate enrichment value based on the condition
      let calculatedEnrichmentValue;

      // Check if priceChangeAmount and changedPricePercent are equal (with 2 decimal precision)
      const preciseChangedPricePercentProp = toPreciseNumber(priceChangeAmount);
      const preciseChangedPricePercent = toPreciseNumber(changedPricePercent);

      if (
        areNumbersEqual(
          preciseChangedPricePercentProp,
          preciseChangedPricePercent
        )
      ) {
        // Use forecastLift if the numbers match
        calculatedEnrichmentValue = toPreciseNumber(forecastLift);
      } else {
        // Use the elasticity calculation if they don't match
        calculatedEnrichmentValue = toPreciseNumber(
          changedPricePercent * elasticity
        );
      }

      console.log(preciseChangedPricePercent)

      setPreviewEnrichment({
        date_range: [
          formatDateToString(startDate),
          formatDateToString(endDate),
        ],
        enrichment_value: calculatedEnrichmentValue,
        changed_price_percent: preciseChangedPricePercent,
      });
    }
  }, [
    isTGScenario,
    startDate,
    endDate,
    filterData,
    changedPricePercent,
    priceChangeAmount,
    forecastLift,
    elasticity,
  ]);

  const handlePrevValue = () => {
    if (currentValueIndex > 0) {
      const prevValue = availableValues[currentValueIndex - 1];
      setCurrentValue(prevValue);
    }
  };

  const handleNextValue = () => {
    if (currentValueIndex < availableValues.length - 1) {
      const nextValue = availableValues[currentValueIndex + 1];
      setCurrentValue(nextValue);
    }
  };

  const canNavigatePrev = currentValueIndex > 0 && currentDimension !== "all";
  const canNavigateNext =
    currentValueIndex < availableValues.length - 1 &&
    currentDimension !== "all";

  useEffect(() => {
    if (currentDimension === "all") {
      setEnrichmentDimension("None");
    } else {
      setEnrichmentDimension(currentDimension);
    }
  }, [currentDimension]);

  useEffect(() => {
    if (currentValue === "all") {
      setEnrichmentValue("None");
    } else {
      setEnrichmentValue(currentValue);
    }
  }, [currentValue]);

  // Calculate enrichment value from price change percent based on condition
  useEffect(() => {
    if (changedPricePercent !== null && changedPricePercent !== undefined) {
      const preciseChangedPricePercentProp = toPreciseNumber(priceChangeAmount);
      const preciseChangedPricePercent = toPreciseNumber(changedPricePercent);

      let calculatedValue;

      if (
        areNumbersEqual(
          preciseChangedPricePercentProp,
          preciseChangedPricePercent
        )
      ) {
        // Use forecastLift if the numbers match
        calculatedValue = toPreciseNumber(forecastLift);
      } else {
        // Use the elasticity calculation if they don't match
        calculatedValue = toPreciseNumber(changedPricePercent * elasticity);
      }

      setEnrichmentValue(calculatedValue);
    }
  }, [changedPricePercent, priceChangeAmount, forecastLift, elasticity]);

  const maxRange = 1000;
  const minRange = -1000;

  // Track when first scenario is added
  useEffect(() => {
    const currentCount = enrichment_bydate_pricing_multi_filter?.length || 0;
    if (previousScenarioCount === 0 && currentCount === 1) {
      setShowFirstScenarioMessage(true);
      setTimeout(() => {
        setShowFirstScenarioMessage(false);
      }, 3000);
    }
    setPreviousScenarioCount(currentCount);
  }, [enrichment_bydate_pricing_multi_filter?.length, previousScenarioCount]);

  const handleAddScenario = async () => {
    const filterDataMultiFilter =
      tablesFilterData[`${fileNameDefault}`]?.Default?.filterData
        ?.dimensionFilters;
    console.log(filterDataMultiFilter);
    const formatDateToString = (date) => {
      if (!date) return new Date().toISOString().split("T")[0];
      if (typeof date === "string") return date.split("T")[0];
      if (date instanceof Date) return date.toISOString().split("T")[0];
      if (date && typeof date.format === "function")
        return date.format("YYYY-MM-DD");
      try {
        return new Date(date).toISOString().split("T")[0];
      } catch (error) {
        console.warn("Could not format date:", date, error);
        return new Date().toISOString().split("T")[0];
      }
    };

    // Convert to precise numbers for comparison
    const preciseChangedPricePercentProp = toPreciseNumber(priceChangeAmount);
    const preciseChangedPricePercent = toPreciseNumber(changedPricePercent);

    // Determine which enrichment value to use
    let enrichmentValue;

    if (
      areNumbersEqual(
        preciseChangedPricePercentProp,
        preciseChangedPricePercent
      )
    ) {
      // Use forecastLift if the numbers match
      enrichmentValue = toPreciseNumber(forecastLift);
    } else {
      // Use the elasticity calculation if they don't match
      enrichmentValue = toPreciseNumber(changedPricePercent * elasticity);
    }

    const enrichmentObj = {
      selectors: filterDataMultiFilter ?? {},
      date_range: [formatDateToString(startDate), formatDateToString(endDate)],
      enrichment_type: "uplift",
      enrichment_value: enrichmentValue,
      changed_price_percent: preciseChangedPricePercent,
      isTGScenario: isTGScenario, // Add the TG Scenario flag
      // Store which logic was used for debugging/transparency
    };

    console.log("Enrichment object:", enrichmentObj);
    console.log("Comparison details:", {
      priceChangeAmount: preciseChangedPricePercentProp,
      changedPricePercent: preciseChangedPricePercent,
      areEqual: areNumbersEqual(
        preciseChangedPricePercentProp,
        preciseChangedPricePercent
      ),
      forecastLift: toPreciseNumber(forecastLift),
      usedForecastLift: areNumbersEqual(
        preciseChangedPricePercentProp,
        preciseChangedPricePercent
      ),
      finalEnrichmentValue: enrichmentValue,
    });

    await addEnrichmentPricingMultifilter(enrichmentObj);

    // Reset form and TG Scenario state

    setChangedPricePercent(0);

    // Reset preview enrichment and disable TG Scenario
    setPreviewEnrichment({
      date_range: [null, null],
      enrichment_value: 0,
      changed_price_percent: null,
    });
    setIsTGScenario(false);

    setRefresh(!refresh);
  };

  return (
    <Stack
      sx={{
        borderRadius: "12px",
        padding: "1rem",
        gap: "0.75rem",
        backgroundColor: "#FFFFFF",
        overflow: "scroll",
        position: "relative",
        height: "100%",
      }}
    >
      {/* Header */}
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
          Scenario Builder
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isTGScenario && (
            <Chip
              label="TG Active"
              size="small"
              sx={{
                backgroundColor: "#FFF3CD",
                color: "#856404",
                fontSize: "0.625rem",
                fontWeight: 500,
                height: "18px",
                border: "1px solid #FFE69C",
              }}
            />
          )}
          <Chip
            label={`${
              enrichment_bydate_pricing_multi_filter?.length || 0
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
      </Box>

      {/* Current Context Card */}
      <Card
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ padding: "0rem !important" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          ></Box>
        </CardContent>
      </Card>

      {/* Scenario Builder Form */}
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
                  borderRadius: "6px",
                  border: "none",
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.6875rem",
                  padding: "6px 8px",
                  border: "none",
                },
              }}
            />
          </Box>
        </Box>

        {/* Price Change Input */}
        <CustomCounter
          showLabel
          placeholder="Enter percentage value"
          label="Price Change (%)"
          value={changedPricePercent}
          setValue={setChangedPricePercent}
          maxRange={maxRange}
          minRange={minRange}
          labelSx={{
            fontSize: "0.6875rem",
            fontWeight: 500,
            color: "#374151",
            fontFamily: "Inter",
          }}
          sx={{
            height: "16px",
            minHeight: "16px",
            "& .MuiInputBase-root": {
              height: "16px",
              minHeight: "16px",
              fontSize: "0.6875rem",
            },
            "& .MuiInputBase-input": {
              fontSize: "0.6875rem",
              padding: "0px",
              height: "16px",
              lineHeight: "16px",
            },
            "& .MuiOutlinedInput-root": {
              height: "16px",
              minHeight: "16px",
            },
            "& .MuiOutlinedInput-input": {
              height: "16px",
              padding: "0px",
            },
          }}
          isTGScenario={isTGScenario}
        />

        {/* Add Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            padding: "2px 0",
            width: "100%",
          }}
        >
          <Tooltip
            title={
              hasExistingScenario
                ? "You already added a scenario for this dimension"
                : ""
            }
            placement="top"
            arrow
          >
            <Button
              onClick={handleAddScenario}
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: "14px" }} />}
              disabled={hasExistingScenario}
              sx={{
                backgroundColor: hasExistingScenario ? "#9CA3AF" : "#10B981",
                color: "white",
                fontFamily: "Inter",
                fontSize: "0.625rem",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "6px",
                boxShadow: hasExistingScenario
                  ? "none"
                  : "0px 1px 2px rgba(16, 185, 129, 0.2)",
                height: "32px",
                width: "100%",
                "&:hover": {
                  backgroundColor: hasExistingScenario ? "#9CA3AF" : "#059669",
                  boxShadow: hasExistingScenario
                    ? "none"
                    : "0px 2px 4px rgba(16, 185, 129, 0.3)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#9CA3AF",
                  color: "white",
                },
              }}
            >
              Add Scenario
            </Button>
          </Tooltip>
          {/* <Button
            onClick={handleAddScenario}
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: "14px" }} />}
            sx={{
              backgroundColor: "#10B981",
              color: "white",
              fontFamily: "Inter",
              fontSize: "0.625rem",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "6px",
              boxShadow: "0px 1px 2px rgba(16, 185, 129, 0.2)",
              height: "32px",
              width: "100%",
              "&:hover": {
                backgroundColor: "#059669",
                boxShadow: "0px 2px 4px rgba(16, 185, 129, 0.3)",
              },
            }}
          >
            Add Scenario
          </Button> */}
        </Box>
      </Stack>

      {/* Active Scenarios */}
      <Stack spacing={0.5} flex={1} minHeight={0}>
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#101828",
            paddingTop: "0.25rem",
          }}
        >
          Active Scenarios
        </Typography>
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
          {enrichment_bydate_pricing_multi_filter &&
          enrichment_bydate_pricing_multi_filter.length > 0 ? (
            <Stack spacing={0.375}>
              {enrichment_bydate_pricing_multi_filter.map(
                (enrichment, index) => {
                  const isPositive = enrichment.changed_price_percent > 0;
                  const salesImpact = enrichment.elasticity
                    ? (
                        enrichment.changed_price_percent * enrichment.elasticity
                      ).toFixed(1)
                    : null;

                  // Build tooltip content from selectors

                  console.log(enrichment);
                  // const tooltipContent = Object.entries(
                  //   enrichment.selectors || {}
                  // )
                  //   .map(
                  //     ([dimension, values]) =>
                  //       `${dimension}: ${values.join(", ")}`
                  //   )
                  //   .join("\n");

                  return (
                    <CustomTooltip
                      key={index}
                      title={
                        <Box>
                          {Object.entries(enrichment.selectors || {})
                            .filter(
                              ([dimension, values]) =>
                                values && values.length > 0
                            )
                            .map(([dimension, values]) => (
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
                          transition: "all 0.15s ease-in-out",
                        }}
                      >
                        <Stack spacing={0.25} flex={1}>
                          {/* Scenario Header */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: "#344054",
                                lineHeight: 1.2,
                              }}
                            >
                              {enrichment.enrichment_type}:{" "}
                              {enrichment.enrichment_type === "uplift" &&
                                `${Number(enrichment.enrichment_value).toFixed(
                                  2
                                )}%`}
                            </Typography>
                            {enrichment.isTGScenario && (
                              <Chip
                                label="TG"
                                size="small"
                                sx={{
                                  height: "14px",
                                  fontSize: "0.5rem",
                                  fontWeight: 600,
                                  backgroundColor: "#FFF3CD",
                                  color: "#856404",
                                  border: "1px solid #FFE69C",
                                }}
                              />
                            )}
                          </Box>

                          {/* Metrics Row */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {/* Price Change */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.125rem",
                              }}
                            >
                              {isPositive ? (
                                <TrendingUpIcon
                                  sx={{ fontSize: "10px", color: "#059669" }}
                                />
                              ) : (
                                <TrendingDownIcon
                                  sx={{ fontSize: "10px", color: "#DC2626" }}
                                />
                              )}
                              <Chip
                                label={`${isPositive ? "+" : ""}${
                                  enrichment.changed_price_percent
                                }%`}
                                size="small"
                                sx={{
                                  height: "16px",
                                  fontSize: "0.5625rem",
                                  fontWeight: 600,
                                  backgroundColor: isPositive
                                    ? "#ECFDF3"
                                    : "#FEF2F2",
                                  color: isPositive ? "#059669" : "#DC2626",
                                  border: `1px solid ${
                                    isPositive ? "#A7F3D0" : "#FECACA"
                                  }`,
                                }}
                              />
                            </Box>

                            {/* Sales Impact */}
                            {salesImpact && (
                              <Typography
                                sx={{
                                  fontSize: "0.5625rem",
                                  color: "#6B7280",
                                  fontWeight: 500,
                                }}
                              >
                                Impact: {salesImpact}%
                              </Typography>
                            )}

                            {/* Date Range */}
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
                          </Box>
                        </Stack>

                        {/* Remove Button */}
                        <IconButton
                          onClick={() =>
                            removeEnrichmentPricingMultifilter(index)
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
                            transition: "all 0.15s ease-in-out",
                          }}
                        >
                          <CloseIcon sx={{ fontSize: "12px" }} />
                        </IconButton>
                      </Box>
                    </CustomTooltip>
                  );
                }
              )}
            </Stack>
          ) : (
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
                <ShowChartIcon sx={{ fontSize: "1.5rem", color: "#D1D5DB" }} />
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  No scenarios created yet
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.5625rem",
                    fontWeight: 400,
                    color: "#9CA3AF",
                    textAlign: "center",
                  }}
                >
                  Add price changes to build scenarios
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default ScenarioBuilderMultiFilter;
