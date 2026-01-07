import React, { useState, useMemo, useEffect, useRef } from "react";
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
import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  IconButton,
  Collapse,
  Tooltip as HeaderTooltip,
} from "@mui/material";
import {
  format,
  parseISO,
  isWithinInterval,
  addMonths,
  differenceInDays,
  addDays,
  addWeeks,
} from "date-fns";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import useConfig from "../hooks/useConfig";
import {
  MoreHoriz as MoreIcon,
  KeyboardArrowLeft as CollapseIcon,
  ConstructionOutlined,
} from "@mui/icons-material";

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
            <Box key={index} sx={{ position: "relative" }}>
              <HeaderTooltip
                title={control.tooltip || ""}
                arrow
                placement="top"
                disableHoverListener={!control.disabled} // Only show for disabled
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "#FEF3C7", // Light yellow/cream
                      color: "#78350F", // Dark text for contrast
                      fontSize: "12px",
                      fontWeight: 500,
                      padding: "6px 10px",
                      borderRadius: "6px",
                      boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                    },
                  },
                  arrow: {
                    sx: {
                      color: "#FEF3C7",
                    },
                  },
                }}
              >
                <FormControlLabel
                  sx={{
                    margin: 0,
                    ".MuiFormControlLabel-label": {
                      fontSize: "11px",
                      fontFamily: "Inter",
                      fontWeight: 500,
                      color: control.disabled ? "#9CA3AF" : "#344054",
                      whiteSpace: "nowrap",
                    },
                  }}
                  control={
                    <Checkbox
                      checked={control.checked}
                      onChange={control.disabled ? undefined : control.onChange}
                      color="primary"
                      size="small"
                      disabled={control.disabled}
                      sx={{
                        padding: "3px",
                        "& .MuiSvgIcon-root": { fontSize: 14 },
                        "&.Mui-disabled": {
                          color: "#D1D5DB",
                        },
                      }}
                    />
                  }
                  label={control.label}
                />
              </HeaderTooltip>
            </Box>
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

const ForecastChartPromo = ({
  data = {},
  showEnrichment = false,
  filterData = {},
  priceColumn = "price",
  liftComparison = {},
  setPromoDipMetrics,
}) => {
  console.log(data);
  // State for toggling different forecast and price types
  const [showSales, setShowSales] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showPriceScenario, setShowPriceScenario] = useState(true);
  const [showEnrichmentLines, setShowEnrichmentLines] = useState(true);
  const hasMounted = useRef(false);
  console.log(liftComparison);
  const {
    enrichment_bydate_pricing_multi_filter = [],
    setIsTGScenario,
    setPreviewEnrichment,
    setPreviewEnrichmentDateRange,
    setPreviewEnrichmentValue,
    setPreviewChangedPricePercent,
    previewEnrichment,
    isTGScenario,
    configState,
  } = useConfig();
  const [showTGScenario, setShowTGScenario] = useState(isTGScenario);
  console.log(showTGScenario);

  console.log(enrichment_bydate_pricing_multi_filter);

  // Extract strategic price change and elasticity from data
  const { strategicPriceChange, elasticity } = useMemo(() => {
    const strategicPriceChangeValue =
      data["mean_strategic_%price_change"]?.[0] || 0;
    const elasticityValue = data[`mean_${priceColumn}_elasticity`]?.[0] || 0;

    return {
      strategicPriceChange: strategicPriceChangeValue,
      elasticity: elasticityValue,
    };
  }, [data]);

  useEffect(() => {
    setShowTGScenario(isTGScenario);
  }, [isTGScenario]);

  // Calculate enrichment value (elasticity × strategic price change)
  const calculatedEnrichmentValue = useMemo(() => {
    return Number((elasticity * strategicPriceChange).toFixed(2));
  }, [elasticity, strategicPriceChange]);

  console.log(data);

  // Get forecast start date from data
  const extractDates = (data) => {
    return Object.keys(data)
      .filter((k) => /sum_\d{4}-\d{2}-\d{2}/.test(k))
      .map((k) => {
        const match = k.match(/sum_(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
      .sort();
  };

  const detectFrequency = (sortedDates) => {
    if (sortedDates.length < 2) return "monthly"; // default fallback

    const d1 = parseISO(sortedDates[0]);
    const d2 = parseISO(sortedDates[1]);
    const diff = differenceInDays(d2, d1);

    if (diff >= 27 && diff <= 33) return "monthly"; // 1 month gap
    if (diff >= 6 && diff <= 8) return "weekly"; // 1 week gap
    if (diff === 1) return "daily"; // 1 day gap

    return "monthly"; // fallback
  };

  const forecastStartDate = useMemo(() => {
    const forecastKeys = Object.keys(data).filter(
      (key) => key.includes("sum_") && key.includes("Forecast")
    );

    if (forecastKeys.length > 0) {
      const match = forecastKeys[0].match(/sum_(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }

    return format(new Date(), "yyyy-MM-dd");
  }, [data]);

  const forecastEndDate = useMemo(() => {
    if (!forecastStartDate) return null;

    const allDates = extractDates(data);
    const frequency = detectFrequency(allDates);

    const start = parseISO(forecastStartDate);
    let baseEndDate;

    if (frequency === "monthly") {
      baseEndDate = addMonths(start, 1);
    } else if (frequency === "weekly") {
      baseEndDate = addWeeks(start, 4);
    } else if (frequency === "daily") {
      baseEndDate = addDays(start, 8);
    } else {
      baseEndDate = addMonths(start, 2);
    }

    // Add **one real day** (automatically rolls the date correctly)
    const finalEndDate = addDays(baseEndDate, 1);

    return format(finalEndDate, "yyyy-MM-dd");
  }, [data, forecastStartDate]);

  console.log(forecastStartDate, forecastEndDate);

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

  // Check if there's already a TG Scenario for current filter combination
  const hasExistingTGScenario = useMemo(() => {
    console.log(enrichment_bydate_pricing_multi_filter, filterData);
    return enrichment_bydate_pricing_multi_filter.some((enrichment) =>
      objectsEqual(enrichment.selectors || {}, filterData)
    );
  }, [enrichment_bydate_pricing_multi_filter, filterData]);

  // Enhanced promo dip metrics calculation

  // Function to handle TG Scenario toggle
  const handleToggleTGScenario = (prop = {}) => {
    // If there's already a TG scenario for this filter combination, prevent toggling
    if (hasExistingTGScenario) {
      return;
    }

    const newTGScenarioState = prop.defaultTGScenario ?? !showTGScenario;
    setShowTGScenario(newTGScenarioState);

    // Update TG Scenario state
    setIsTGScenario(newTGScenarioState);

    if (newTGScenarioState && forecastStartDate && forecastEndDate) {
      // Set preview enrichment when TG Scenario is enabled
      setPreviewEnrichment({
        date_range: [forecastStartDate, forecastEndDate],
        enrichment_value: Number(calculatedEnrichmentValue.toFixed(2)),
        changed_price_percent: Number(strategicPriceChange.toFixed(2)),
      });

      // Also set individual properties
    } else {
      // Reset preview enrichment when TG Scenario is disabled
      setPreviewEnrichment({
        date_range: [null, null],
        enrichment_value: 0,
        changed_price_percent: null,
      });
    }
  };

  useEffect(() => {
    console.log(filterData);
    if (!hasMounted.current) {
      // First mount - always run
      handleToggleTGScenario({ defaultTGScenario: true });
      hasMounted.current = true;
    } else if (filterData && Object.keys(filterData).length > 0) {
      // Subsequent updates - only run if filterData is not empty
      // This handles the case where filterData starts empty and becomes populated
      handleToggleTGScenario({ defaultTGScenario: true });
    }
  }, [filterData]); // Add hasExistingTGScenario to dependencies

  const calculateCarryOverEffects = (
    chartData,
    enrichmentData,
    elasticity,
    basePrice
  ) => {
    if (!enrichmentData.length || !elasticity) return chartData;

    const enrichedData = [...chartData];
    const enrichmentPeriods = [];

    console.log(enrichedData);

    enrichmentData.forEach((enrichment) => {
      const { date_range, enrichment_value, changed_price_percent } =
        enrichment;
      const [startDate, endDate] = date_range;
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      enrichmentPeriods.push({
        start,
        end,
        enrichment_value,
        changed_price_percent,
        lastEnrichedDate: endDate,
      });
    });

    // Sort enrichment periods by end date
    console.log("hello");
    enrichmentPeriods.sort(
      (a, b) => new Date(a.lastEnrichedDate) - new Date(b.lastEnrichedDate)
    );

    // Process each data point for carry-over effects
    enrichedData.forEach((entry, index) => {
      const currentDate = parseISO(entry.date);

      // Find if this date is immediately after any enrichment period
      enrichmentPeriods.forEach((period) => {
        const periodEnd = parseISO(period.lastEnrichedDate);
        const nextDate =
          index < enrichedData.length - 1
            ? parseISO(enrichedData[index + 1]?.date)
            : null;

        // Check if current date is the first date after enrichment period ends
        if (
          currentDate > periodEnd &&
          (!nextDate ||
            isWithinInterval(nextDate, {
              start: period.start,
              end: period.end,
            }))
        ) {
          // Find the last enriched value (from the end of enrichment period)
          const lastEnrichedEntry = enrichedData.find(
            (e) => e.date === period.lastEnrichedDate && e.enrichmentForecast
          );

          if (lastEnrichedEntry && lastEnrichedEntry.enrichmentForecast) {
            // Calculate price change from last enriched period to current period
            const lastPrice =
              lastEnrichedEntry.priceScenario ||
              lastEnrichedEntry.price ||
              basePrice;
            const currentPrice = entry.price || basePrice;

            if (lastPrice && currentPrice && lastPrice > 0) {
              const priceChangePercent =
                ((currentPrice - lastPrice) / lastPrice) * 100;

              // Calculate sales impact using elasticity: %ΔSales = Elasticity × %ΔPrice
              const salesImpactPercent = elasticity * priceChangePercent;

              // Apply carry-over effect to forecast
              if (entry.forecast) {
                entry.carryOverForecast =
                  entry.forecast * (1 + salesImpactPercent / 100);

                // Connect this point with the last enriched point and next point
                entry.isCarryOverPoint = true;
                entry.connectedFromDate = period.lastEnrichedDate;
              }
            }
          }
        }
      });

      console.log(entry.carryOverForecast);
      // For subsequent periods after carry-over, gradually diminish the effect
      if (entry.carryOverForecast && index > 0) {
        const prevEntry = enrichedData[index - 1];
        if (prevEntry.carryOverForecast) {
          // Gradually reduce carry-over effect (you can adjust the decay rate)
          const decayFactor = 0.7; // 30% reduction each period
          const baseForecast = entry.forecast || 0;
          const prevCarryOver = prevEntry.carryOverForecast;

          // Diminish the carry-over effect
          entry.carryOverForecast =
            baseForecast + (prevCarryOver - baseForecast) * decayFactor;
        }
      }
    });

    return enrichedData;
  };

  // =============================
  // MULTI-WEEK CARRYOVER FUNCTION
  // =============================
  const applyMultiWeekCarryover = (
    resultArray,
    lastIndex,
    basePriceValue,
    elasticity,
    promoFactor,
    priceDipTenure
  ) => {
    const totalWeeks = priceDipTenure; // e.g., 3

    if (lastIndex < 0 || lastIndex >= resultArray.length - 1) return;

    const lastEntry = resultArray[lastIndex];

    for (let offset = 1; offset <= totalWeeks; offset++) {
      const targetIndex = lastIndex + offset;
      if (targetIndex >= resultArray.length) break;

      const carryEntry = resultArray[targetIndex];
      if (!carryEntry?.forecast) continue;

      // ----- Prices for elasticity -----
      const lastPrice =
        lastEntry.priceScenario || lastEntry.price || basePriceValue;
      const nextPrice = carryEntry.price || basePriceValue;
      if (!lastPrice || !nextPrice) continue;

      // ----- Price Δ -----
      const priceChangePercent = ((nextPrice - lastPrice) / lastPrice) * 100;

      // ----- Elasticity weighting -----
      const remaining = totalWeeks - (offset - 1);
      const elasticityEffective =
        promoFactor * (remaining / totalWeeks) * elasticity;

      const salesImpactPercent = elasticityEffective * priceChangePercent;

      // ----- Apply multi-week carryover -----
      carryEntry.carryOverForecast =
        carryEntry.forecast * (1 + salesImpactPercent / 100);

      carryEntry.isCarryover = true;
    }
  };

  // Transform data into chart format
  const chartData = useMemo(() => {
    const dataMap = new Map();
    let basePriceValue = null;

    const promoFactorValue =
      configState.scenario_plan.pricing_constraints.postpromo_e_factor;
    const priceDipTenure =
      configState.scenario_plan.pricing_constraints.postpromo_dip;

    // ---------------------------------------------
    //            BUILD DATA MAP
    // ---------------------------------------------
    Object.entries(data).forEach(([key, valueArray]) => {
      const value =
        Array.isArray(valueArray) && valueArray.length > 0
          ? parseFloat(valueArray[0]) || 0
          : 0;

      if (key === `mean_${priceColumn}`) {
        basePriceValue = value > 0 ? value : null;
        return;
      }

      if (key.startsWith("sum_") || key.startsWith("mean_")) {
        const isSum = key.startsWith("sum_");
        const isMean = key.startsWith("mean_");

        const cleanKey = key.replace(/^(sum_|mean_)/, "");
        const [date, ...rest] = cleanKey.split(" ");
        const type = rest.join(" ");

        if (!dataMap.has(date)) dataMap.set(date, { date });

        const entry = dataMap.get(date);
        console.log(entry);
        if (isSum) {
          if (type === "Sales") entry.sales = value > 0 ? value : undefined;
          if (type === "Forecast")
            entry.forecast = value > 0 ? value : undefined;
        }

        if (isMean && type === priceColumn) {
          entry.price = value > 0 ? value : undefined;
        }
      }
    });

    // ---------------------------------------------
    //       FILL MISSING PRICES WITH BASE PRICE
    // ---------------------------------------------
    if (basePriceValue) {
      dataMap.forEach((entry) => {
        if (entry.forecast && !entry.price) entry.price = basePriceValue;
      });
    }

    // ---------------------------------------------
    //      APPLY ENRICHMENT ON FORECAST PERIOD
    // ---------------------------------------------
    if (showEnrichment && enrichment_bydate_pricing_multi_filter.length > 0) {
      const enrichmentResults = new Map();

      enrichment_bydate_pricing_multi_filter.forEach((enrichment) => {
        const {
          selectors,
          date_range,
          enrichment_value,
          changed_price_percent,
        } = enrichment;
        if (!objectsEqual(selectors, filterData)) return;

        const [startDate, endDate] = date_range;
        const start = parseISO(startDate);
        const end = parseISO(endDate);

        dataMap.forEach((entry, dateStr) => {
          const date = parseISO(dateStr);
          if (!isWithinInterval(date, { start, end }) || !entry.forecast)
            return;

          if (!enrichmentResults.has(dateStr)) {
            enrichmentResults.set(dateStr, {
              forecastValue: entry.forecast,
              priceValue: entry.price || basePriceValue || 0,
              hasData: true,
            });
          }

          const row = enrichmentResults.get(dateStr);

          if (enrichment_value && row.forecastValue > 0)
            row.forecastValue *= 1 + enrichment_value / 100;

          if (changed_price_percent && row.priceValue > 0)
            row.priceValue *= 1 + changed_price_percent / 100;
        });
      });

      enrichmentResults.forEach((res, dateStr) => {
        if (!res.hasData || !dataMap.has(dateStr)) return;
        const entry = dataMap.get(dateStr);

        if (res.forecastValue > 0) entry.enrichmentForecast = res.forecastValue;
        if (res.priceValue > 0) entry.priceScenario = res.priceValue;
      });
    }

    // ---------------------------------------------
    //      APPLY TG SCENARIO PREVIEW CHANGES
    // ---------------------------------------------
    if (
      isTGScenario &&
      previewEnrichment &&
      previewEnrichment.date_range &&
      previewEnrichment.date_range[0] &&
      previewEnrichment.date_range[1]
    ) {
      const [startDate, endDate] = previewEnrichment.date_range;
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      const resultArray = Array.from(dataMap.values()).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      console.log(resultArray);
      resultArray.forEach((entry) => {
        const date = parseISO(entry.date);
        if (!isWithinInterval(date, { start, end }) || !entry.forecast) return;

        if (previewEnrichment.enrichment_value)
          entry.tgScenarioForecast =
            entry.forecast * (1 + previewEnrichment.enrichment_value / 100);

        if (
          previewEnrichment.changed_price_percent &&
          (entry.price || basePriceValue)
        )
          entry.tgScenarioPrice =
            (entry.price || basePriceValue) *
            (1 + previewEnrichment.changed_price_percent / 100);
      });
    }

    // ---------------------------------------------
    //   CARRYOVER LOGIC (MULTI-WEEK DIP FUNCTION)
    // ---------------------------------------------
    const applyMultiWeekCarryover = (
      resultArray,
      lastIndex,
      basePriceValue,
      elasticity,
      promoFactorValue,
      priceDipTenure
    ) => {
      if (lastIndex < 0) return;

      const totalWeeks = priceDipTenure;
      const lastEntry = resultArray[lastIndex];

      for (let offset = 1; offset <= totalWeeks; offset++) {
        const idx = lastIndex + offset;
        if (idx >= resultArray.length) break;

        const carryEntry = resultArray[idx];
        if (!carryEntry?.forecast) continue;

        const lastPrice =
          lastEntry.priceScenario ||
          lastEntry.tgScenarioPrice ||
          lastEntry.price ||
          basePriceValue;

        const nextPrice = carryEntry.price || basePriceValue;
        if (!lastPrice || !nextPrice) continue;

        const priceChangePercent = ((nextPrice - lastPrice) / lastPrice) * 100;

        const remaining = totalWeeks - (offset - 1);
        const elasticityEffective =
          promoFactorValue * (remaining / totalWeeks) * elasticity;

        const salesImpactPercent = elasticityEffective * priceChangePercent;

        carryEntry.carryOverForecast = Math.max(
          0,
          carryEntry.forecast * (1 + salesImpactPercent / 100)
        );

        carryEntry.isCarryover = true;
      }

      // ---------------------
      // BRIDGE POINTS
      // ---------------------

      // A) Last enrichment week → use enriched forecast
      const lastE = resultArray[lastIndex];
      if (lastE) {
        lastE.carryOverForecast =
          lastE.enrichmentForecast ||
          lastE.tgScenarioForecast ||
          lastE.forecast;
      }

      // B) First week AFTER dip → normal forecast
      const afterDipIdx = lastIndex + totalWeeks + 1;
      if (afterDipIdx < resultArray.length) {
        const afterDipEntry = resultArray[afterDipIdx];
        if (afterDipEntry?.forecast)
          afterDipEntry.carryOverForecast = afterDipEntry.forecast;
      }
    };

    // ---------------------------------------------
    //   APPLY CARRYOVER FOR TG SCENARIO
    // ---------------------------------------------
    if (isTGScenario && previewEnrichment?.date_range) {
      const [startDate, endDate] = previewEnrichment.date_range;
      const resultArray = Array.from(dataMap.values()).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const lastTGIndex = [...resultArray]
        .map((e, i) => ({ i, date: parseISO(e.date) }))
        .filter((e) => e.date <= parseISO(endDate))
        .map((e) => e.i)
        .pop();

      applyMultiWeekCarryover(
        resultArray,
        lastTGIndex,
        basePriceValue,
        elasticity,
        promoFactorValue,
        priceDipTenure
      );
    }

    // ---------------------------------------------
    //   APPLY CARRYOVER FOR NORMAL ENRICHMENT
    // ---------------------------------------------
    if (showEnrichment && enrichment_bydate_pricing_multi_filter.length > 0) {
      const resultArray = Array.from(dataMap.values()).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      enrichment_bydate_pricing_multi_filter.forEach((e) => {
        if (!objectsEqual(e.selectors, filterData)) return;

        const [startDate, endDate] = e.date_range;

        const lastEnrichmentIndex = [...resultArray]
          .map((row, i) => ({ i, date: parseISO(row.date) }))
          .filter((row) => row.date <= parseISO(endDate))
          .map((row) => row.i)
          .pop();

        applyMultiWeekCarryover(
          resultArray,
          lastEnrichmentIndex,
          basePriceValue,
          elasticity,
          promoFactorValue,
          priceDipTenure
        );
      });
    }

    // ---------------------------------------------
    //        FINAL ARRAY OUTPUT
    // ---------------------------------------------
    let resultArray = Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const firstSalesEntry = resultArray.find((e) => e.sales !== undefined);
    if (firstSalesEntry) {
      const firstSalesDate = new Date(firstSalesEntry.date);
      resultArray = resultArray.filter(
        (entry) => new Date(entry.date) >= firstSalesDate
      );
    }

    return resultArray;
  }, [
    data,
    showEnrichment,
    enrichment_bydate_pricing_multi_filter,
    filterData,
    isTGScenario,
    previewEnrichment,
  ]);

  console.log(chartData);

  // Colors for different data types
  const colors = {
    sales: "#1f77b4", // Blue
    forecast: "#2ca02c", // Green
    price: "#d6a74d", // Gold/Orange for price
    priceScenario: "#9333ea", // Purple for price scenario
    enrichmentForecast: "#9467bd", // Purple for enrichment forecast
    tgScenarioForecast: "#ff7f0e", // Orange for TG Scenario forecast
    tgScenarioPrice: "#ff7f0e",
    carryOverForecast: "#17becf", // Orange for TG Scenario price
  };

  // Toggle handlers
  const handleToggleSales = () => setShowSales(!showSales);
  const handleToggleForecast = () => setShowForecast(!showForecast);
  const handleTogglePrice = () => setShowPrice(!showPrice);
  const handleTogglePriceScenario = () =>
    setShowPriceScenario(!showPriceScenario);
  const handleToggleEnrichment = () =>
    setShowEnrichmentLines(!showEnrichmentLines);

  // Header controls configuration
  const primaryControls = [
    {
      label: "Enrichment",
      checked: showEnrichmentLines,
      onChange: handleToggleEnrichment,
      color: colors.enrichmentForecast,
    },
    {
      label: "Preview Price Scenario",
      checked: showPriceScenario,
      onChange: handleTogglePriceScenario,
      color: colors.priceScenario,
    },
  ];

  if (strategicPriceChange && strategicPriceChange !== 0) {
    primaryControls.push({
      label: "TG Scenario",
      checked: showTGScenario,
      onChange: handleToggleTGScenario,
      color: colors.tgScenarioForecast,
      disabled: hasExistingTGScenario,
      tooltip: hasExistingTGScenario
        ? "You already have a TG Scenario. Remove it to view the preview."
        : "",
    });
  }

  const secondaryControls = [];

  // Check if any enrichment matches exactly with filterData
  const hasMatchingEnrichment = useMemo(() => {
    if (!showEnrichment || enrichment_bydate_pricing_multi_filter.length === 0)
      return false;

    return enrichment_bydate_pricing_multi_filter.some((enrichment) =>
      objectsEqual(enrichment.selectors, filterData)
    );
  }, [showEnrichment, enrichment_bydate_pricing_multi_filter, filterData]);

  // Add enrichment control if there are exactly matching enrichments
  if (hasMatchingEnrichment) {
    secondaryControls.push();
  }

  // Check if we have price data
  const hasPriceData = chartData.some((entry) => entry.price !== undefined);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formattedLabel = format(parseISO(label), "MMM dd, yyyy");
      console.log(payload);
      // Check if we have enrichment data (either TG Scenario or Custom Scenario)
      const hasEnrichmentData = payload.some(
        (entry) =>
          entry.name === "enrichmentForecast" ||
          entry.name === "tgScenarioForecast"
      );

      // Only show lift comparison if we have enrichment and liftComparison has data
      const shouldShowLiftComparison =
        hasEnrichmentData &&
        liftComparison &&
        (liftComparison.TGScenarioLift || liftComparison.CustomScenarioLift);

      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            padding: "8px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "400px",
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

          {payload
            .filter(
              (entry) =>
                !(
                  entry.name === "carryOverForecast" &&
                  payload.some(
                    (p) =>
                      p.payload.enrichmentForecast ||
                      p.payload.tgScenarioForecast
                  )
                )
            )
            .map((entry, index) => (
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
                {entry.name === "sales" && "Sales"}
                {entry.name === "forecast" && "Forecast"}
                {entry.name === "enrichmentForecast" && "Enrichment Forecast"}
                {entry.name === "price" && "Price"}
                {entry.name === "priceScenario" && "Price Scenario"}
                {entry.name === "tgScenarioForecast" && "TG Scenario Forecast"}
                {entry.name === "carryOverForecast" && "Enrichment Forecast"}
                {entry.name === "tgScenarioPrice" && "TG Scenario Price"}:{" "}
                {Number.isInteger(parseFloat(entry.value))
                  ? parseFloat(entry.value).toLocaleString()
                  : parseFloat(entry.value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </Typography>
            ))}

          {/* Lift Comparison Section */}
          {shouldShowLiftComparison && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #EAECF0",
              }}
            >
              {liftComparison.TGScenarioLift && (
                <div
                  style={{
                    marginBottom: "6px",
                    padding: "6px 8px",
                    backgroundColor: "#FEF3C7",
                    borderRadius: "4px",
                  }}
                >
                  <Typography
                    style={{
                      fontFamily: "Inter",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#78350F",
                      marginBottom: "3px",
                    }}
                  >
                    TG Scenario Lift
                  </Typography>
                  <Typography
                    style={{
                      fontFamily: "Inter",
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "#92400E",
                      lineHeight: "14px",
                    }}
                  >
                    Unit:{" "}
                    {parseFloat(
                      liftComparison.TGScenarioLift.lift_perc_forecast
                    ).toFixed(2)}
                    % | Revenue:{" "}
                    {parseFloat(
                      liftComparison.TGScenarioLift.lift_perc_revenue
                    ).toFixed(2)}
                    % | Margin:{" "}
                    {parseFloat(
                      liftComparison.TGScenarioLift.lift_perc_margin
                    ).toFixed(2)}
                    % | Price Change:{" "}
                    {parseFloat(
                      liftComparison.TGScenarioLift.price_change_percent
                    ).toFixed(2)}
                    %
                  </Typography>
                </div>
              )}

              {liftComparison.CustomScenarioLift && (
                <div
                  style={{
                    padding: "6px 8px",
                    backgroundColor: "#EDE9FE",
                    borderRadius: "4px",
                  }}
                >
                  <Typography
                    style={{
                      fontFamily: "Inter",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#5B21B6",
                      marginBottom: "3px",
                    }}
                  >
                    Your Scenario Lift
                  </Typography>
                  <Typography
                    style={{
                      fontFamily: "Inter",
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "#6B21A8",
                      lineHeight: "14px",
                    }}
                  >
                    Unit:{" "}
                    {parseFloat(
                      liftComparison.CustomScenarioLift.lift_perc_forecast
                    ).toFixed(2)}
                    % | Revenue:{" "}
                    {parseFloat(
                      liftComparison.CustomScenarioLift.lift_perc_revenue
                    ).toFixed(2)}
                    | Margin:{" "}
                    {parseFloat(
                      liftComparison.CustomScenarioLift.lift_perc_margin
                    ).toFixed(2)}
                    % | Price Change:{" "}
                    {parseFloat(
                      liftComparison.CustomScenarioLift.price_change_percent
                    ).toFixed(2)}
                    %
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Format X-axis
  const formatXAxis = (tickItem) => {
    if (!tickItem) return ""; // handle null/undefined/empty

    const parsed = parseISO(tickItem);

    // Check valid date
    if (isNaN(parsed.getTime())) {
      // Not a valid date → return original tick or fallback
      return tickItem;
    }

    // Valid date → format it
    return format(parsed, "MMM yyyy");
  };
  const formateYAxis = (value) => {
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

  //   useEffect(() => {
  //   if (!chartData.length || !setPromoDipMetrics) return;

  //   let totalDipDifference = 0;
  //   let maxSingleDip = 0;
  //   let dipStartDate = null;
  //   let dipEndDate = null;
  //   let dipDataPoints = [];
  //   let cumulativeDipOverTime = [];

  //   let cumulativeDip = 0;

  //   // Sort chartData by date to ensure chronological order
  //   const sortedData = [...chartData].sort((a, b) => new Date(a.date) - new Date(b.date));
  //   console.log("hello")

  //   console.log(sortedData)
  //   sortedData.forEach((entry, index) => {
  //     if (entry.carryOverForecast !== undefined && entry.forecast !== undefined) {
  //       const dipDifference = entry.forecast - entry.carryOverForecast;

  //       if (true) {
  //         totalDipDifference += dipDifference;
  //         cumulativeDip += dipDifference;

  //         // Track max single dip
  //         if (dipDifference > maxSingleDip) {
  //           maxSingleDip = dipDifference;
  //         }

  //         // Track dip period
  //         if (!dipStartDate) {
  //           dipStartDate = entry.date;
  //         }
  //         dipEndDate = entry.date;

  //         dipDataPoints.push({
  //           date: entry.date,
  //           forecast: entry.forecast,
  //           carryOverForecast: entry.carryOverForecast,
  //           dipDifference: dipDifference,
  //           cumulativeDip: cumulativeDip
  //         });
  //       }
  //     }

  //     // Track cumulative dip over time for all points
  //     cumulativeDipOverTime.push({
  //       date: entry.date,
  //       cumulativeDip: cumulativeDip,
  //       hasDip: entry.carryOverForecast !== undefined && entry.forecast !== undefined && !entry.enrichmentForecast && !entry.tgScenarioForecast
  //     });
  //   });

  //   // Calculate additional metrics
  //   const totalForecastWithoutDip = sortedData.reduce((sum, entry) => sum + (entry.forecast || 0), 0);
  //   const totalForecastWithDip = sortedData.reduce((sum, entry) => sum + (entry.carryOverForecast || entry.forecast || 0), 0);
  //   const overallDipPercentage = totalForecastWithoutDip > 0 ? ((totalForecastWithoutDip - totalForecastWithDip) / totalForecastWithoutDip) * 100 : 0;

  //   const metrics = {
  //     // Basic metrics
  //     totalDipDifference: totalDipDifference,
  //     averageDipPerPeriod: dipDataPoints.length > 0 ? totalDipDifference / dipDataPoints.length : 0,
  //     maxSingleDip: maxSingleDip,

  //     // Time metrics
  //     dipDuration: dipDataPoints.length,
  //     dipStartDate: dipStartDate,
  //     dipEndDate: dipEndDate,

  //     // Forecast comparison
  //     totalForecastWithoutDip: totalForecastWithoutDip,
  //     totalForecastWithDip: totalForecastWithDip,
  //     overallDipPercentage: overallDipPercentage,
  //     forecastReduction: totalForecastWithoutDip - totalForecastWithDip,

  //     // Detailed data
  //     dipDataPoints: dipDataPoints,
  //     cumulativeDipOverTime: cumulativeDipOverTime,

  //     // Summary statistics
  //     summary: {
  //       totalUnitsLost: totalDipDifference,
  //       percentageReduction: overallDipPercentage,
  //       dipPeriod: `${dipStartDate ? format(parseISO(dipStartDate), 'MMM dd, yyyy') : 'N/A'} to ${dipEndDate ? format(parseISO(dipEndDate), 'MMM dd, yyyy') : 'N/A'}`,
  //       affectedWeeks: dipDataPoints.length
  //     }
  //   };

  //   console.log('Enhanced Promo Dip Metrics:', metrics);
  //   setPromoDipMetrics(metrics);

  // }, [chartData, setPromoDipMetrics]);

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header with Controls */}
      <ChartHeaderWithControls
        title="Promo Planning - Forecast & Price Analysis"
        primaryControls={primaryControls}
        secondaryControls={secondaryControls}
        showMoreButton={true}
      />

      {/* Chart Container */}
      <Box sx={{ flex: 1, padding: "12px 0px", minHeight: 0 }}>
        {/* Forecast Chart - Top Chart */}
        <Box sx={{ marginBottom: "12px" }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              syncId="promoPlanning"
              margin={{ top: 5, right: 20, left: 15, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#475467"
                tickFormatter={formatXAxis}
                interval={Math.floor(chartData.length / 7)}
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
                tickFormatter={formateYAxis}
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
              <Tooltip content={<CustomTooltip />} />

              {showSales && (
                <Area
                  type="linear"
                  dataKey="sales"
                  strokeWidth={2}
                  stroke={colors.sales}
                  fill="none"
                  dot={{
                    fill: colors.sales,
                    stroke: colors.sales,
                    strokeWidth: 1,
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                    fill: colors.sales,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              )}

              {showForecast && (
                <Area
                  type="linear"
                  dataKey="forecast"
                  strokeWidth={2}
                  stroke={colors.forecast}
                  fill="none"
                  dot={{
                    fill: colors.forecast,
                    stroke: colors.forecast,
                    strokeWidth: 1,
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                    fill: colors.forecast,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              )}

              {showEnrichment &&
                showEnrichmentLines &&
                hasMatchingEnrichment && (
                  <Area
                    type="linear"
                    dataKey="enrichmentForecast"
                    strokeWidth={2}
                    stroke={colors.enrichmentForecast}
                    fill="none"
                    dot={{
                      fill: colors.enrichmentForecast,
                      stroke: colors.enrichmentForecast,
                      strokeWidth: 1,
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                      fill: colors.enrichmentForecast,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    strokeDasharray="4 4"
                    connectNulls={false}
                  />
                )}

              <Area
                type="linear"
                dataKey="carryOverForecast"
                strokeWidth={2}
                stroke={colors.carryOverForecast}
                fill="none"
                dot={{
                  fill: colors.carryOverForecast,
                  stroke: colors.carryOverForecast,
                  strokeWidth: 1,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  fill: colors.carryOverForecast,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                strokeDasharray="2 4"
                connectNulls={true}
              />

              {/* TG Scenario Forecast Line */}
              {isTGScenario && (
                <Area
                  type="linear"
                  dataKey="tgScenarioForecast"
                  strokeWidth={3}
                  stroke={colors.tgScenarioForecast}
                  fill="none"
                  dot={{
                    fill: colors.tgScenarioForecast,
                    stroke: colors.tgScenarioForecast,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: colors.tgScenarioForecast,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  strokeDasharray="3 3"
                  connectNulls={false}
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
                data={chartData}
                syncId="promoPlanning"
                margin={{ top: 0, right: 20, left: 15, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#475467"
                  tickFormatter={formatXAxis}
                  interval={Math.floor(chartData.length / 7)}
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
                <Tooltip content={<CustomTooltip />} />

                {showPrice && (
                  <Line
                    type="linear"
                    dataKey="price"
                    strokeWidth={2}
                    stroke={colors.price}
                    dot={{
                      fill: colors.price,
                      stroke: colors.price,
                      strokeWidth: 1,
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                      fill: colors.price,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                )}

                {showPriceScenario && hasMatchingEnrichment && (
                  <Line
                    type="linear"
                    dataKey="priceScenario"
                    strokeWidth={2}
                    stroke={colors.priceScenario}
                    strokeDasharray="2 2"
                    dot={{
                      fill: colors.priceScenario,
                      stroke: colors.priceScenario,
                      strokeWidth: 1,
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                      fill: colors.priceScenario,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                )}

                {/* TG Scenario Price Line */}
                {isTGScenario && (
                  <Line
                    type="linear"
                    dataKey="tgScenarioPrice"
                    strokeWidth={3}
                    stroke={colors.tgScenarioPrice}
                    strokeDasharray="3 3"
                    dot={{
                      fill: colors.tgScenarioPrice,
                      stroke: colors.tgScenarioPrice,
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      fill: colors.tgScenarioPrice,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default ForecastChartPromo;
