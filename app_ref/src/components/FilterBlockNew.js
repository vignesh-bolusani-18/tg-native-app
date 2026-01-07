import React, { useEffect, useRef, useState } from "react";

// Material UI - Core Components
import {
  Grid,
  Stack,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Collapse,
  Button,
  Chip,
} from "@mui/material";

// Material UI - Icons
import SettingsIcon from "@mui/icons-material/Settings";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Custom Components (adjust the paths as per your project structure)
import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import CustomButton from "./CustomButton";
import useDashboard from "../hooks/useDashboard";
import { callQueryEngineQuery } from "../utils/queryEngine";
import useConfig from "../hooks/useConfig";

function FilterBlock({
  filtersApplied,
  dimensionsToFilter,
  setDimensionsToFilter,
  dimensionOptions,
  fileName,
  reportName,
  fileName1,
  reportName1,
  filterOptions,
  path,
  path1,
  autoCompleteKey,
  setAutoCompleteKey,
  sizeGiven = false,
  isPromo = false
}) {
  const [showDimensionSettings, setShowDimensionSettings] =
    React.useState(false);
  const [parallelApiResults, setParallelApiResults] = useState({});
  const [isLoadingParallelApi, setIsLoadingParallelApi] = useState(false);
  const { applyFilter, clearFilters, tablesFilterData, filterData } =
    useDashboard();
  const {resetPreviewEnrichment , setIsTGScenario} = useConfig();
  const isFirstRender = useRef(true);
  const prevFilterDataRef = useRef();
  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };
  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }

    return dimension;
  };

  const executeParallelApiCalls = async () => {
    if (!filterData || !filterData.dimensionFilters) {
      console.log("No filter data available for parallel API calls");
      return;
    }

    setIsLoadingParallelApi(true);
    try {
      const apiCalls = [];
      const callMetadata = [];

      // 1. Create API calls for each filtered dimension
      Object.keys(filterData.dimensionFilters || {}).forEach((dimension) => {
        if (filterData.dimensionFilters[dimension]?.length >= 0) {
          const modifiedFilterData = {
            ...filterData,
            dimensionFilters: {
              ...filterData.dimensionFilters,
              [dimension]: [], // Remove current dimension from filters
            },
          };

          const payload = {
            fileName: fileName,
            filePath: path,
            filterData: modifiedFilterData,
            sortingData: null,
            groupByColumns: [convert(dimension)],
            aggregationColumns: {},
            filterConditions: [],
            paginationData: null,
            fetchAllRows: true,
            time: Date.now(),
          };

          apiCalls.push(callQueryEngineQuery(payload));
          callMetadata.push({
            type: "dimensionFilter",
            dimension: dimension,
            groupByColumns: [convert(dimension)],
          });
        }
      });

      // 2. Create API call for remaining dimensions
      if (dimensionsToFilter?.length > 0) {
        const remainingDimensions = dimensionsToFilter
          .map((dim) => convert(dim))
          .filter(
            (dim) =>
              !Object.keys(filterData.dimensionFilters || {}).includes(
                convert(dim)
              )
          );

        if (remainingDimensions.length > 0) {
          const payload = {
            fileName: fileName,
            filePath: path,
            filterData: filterData,
            sortingData: null,
            groupByColumns: remainingDimensions,
            aggregationColumns: {},
            filterConditions: [],
            paginationData: null,
            fetchAllRows: true,
            time: Date.now(),
          };

          apiCalls.push(callQueryEngineQuery(payload));
          callMetadata.push({
            type: "remainingDimensions",
            dimensions: remainingDimensions,
            groupByColumns: remainingDimensions,
          });
        }
      }

      console.log(`Executing ${apiCalls.length} parallel API calls`);
      const results = await Promise.all(apiCalls);
      const processedResults = {};

      // Process results
      results.forEach((result, index) => {
        const metadata = callMetadata[index];
        const dimensionColumns = Array.isArray(metadata.groupByColumns)
          ? metadata.groupByColumns
          : [metadata.groupByColumns];

        dimensionColumns.forEach((dimensionColumn) => {
          let uniqueValues = [];

          // Case 1: Result is an array of objects
          if (Array.isArray(result)) {
            uniqueValues = [
              ...new Set(
                result
                  .map((row) => row[dimensionColumn])
                  .filter((value) => value != null && value !== "")
              ),
            ];
          }
          // Case 2: Result is an object with dimension keys
          else if (
            result &&
            typeof result === "object" &&
            result[dimensionColumn]
          ) {
            uniqueValues = [
              ...new Set(
                result[dimensionColumn].filter(
                  (value) => value != null && value !== ""
                )
              ),
            ];
          }
          // Case 3: Result has a data property with array
          else if (result?.data && Array.isArray(result.data)) {
            uniqueValues = [
              ...new Set(
                result.data
                  .map((row) => row[dimensionColumn])
                  .filter((value) => value != null && value !== "")
              ),
            ];
          }

          console.log(`Processed ${dimensionColumn}:`, uniqueValues);
          if (uniqueValues.length > 0) {
            processedResults[dimensionColumn] = uniqueValues;
          }
        });
      });
 

      setParallelApiResults(processedResults);
      console.log("Parallel API Results:", processedResults);
    } catch (error) {
      console.error("Error in parallel API calls:", error);
    } finally {
      setIsLoadingParallelApi(false);
    }
  };

 useEffect(() => {
  // Skip on first render
  if (prevFilterDataRef.current === undefined) {
    prevFilterDataRef.current = filterData;
    return;
  }

  // Only run if filterData actually changed
  if (
    filterData &&
    Object.keys(filterData.dimensionFilters || {}).length > 0 &&
    JSON.stringify(prevFilterDataRef.current) !== JSON.stringify(filterData)
  ) {
    executeParallelApiCalls();
  }

  prevFilterDataRef.current = filterData;
}, [filterData]);

  const convertFilePathToFileName = (filePath) => {
    if (!filePath) return "";
    const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
    const pathComponents = withoutExtension.split("/");
    return pathComponents.join("_");
  };

  const executeParallelApiCalls1 = async () => {
    const filterData = {
    dimensionFilters: {},
    columnFilter: [],
    frozenColumns: [],
    selectAllColumns: true,
  }
    if (!filterData || !filterData.dimensionFilters) {
      console.log("No filter data available for parallel API calls");
      return;
    }

    setIsLoadingParallelApi(true);
    try {
      const apiCalls = [];
      const callMetadata = [];

      // 1. Create API calls for each filtered dimension
      Object.keys(filterData.dimensionFilters || {}).forEach((dimension) => {
        if (filterData.dimensionFilters[dimension]?.length >= 0) {
          const modifiedFilterData = {
            ...filterData,
            dimensionFilters: {
              ...filterData.dimensionFilters,
              [dimension]: [], // Remove current dimension from filters
            },
          };

          const payload = {
            fileName: fileName,
            filePath: path,
            filterData: modifiedFilterData,
            sortingData: null,
            groupByColumns: [convert(dimension)],
            aggregationColumns: {},
            filterConditions: [],
            paginationData: null,
            fetchAllRows: true,
            time: Date.now(),
          };

          apiCalls.push(callQueryEngineQuery(payload));
          callMetadata.push({
            type: "dimensionFilter",
            dimension: dimension,
            groupByColumns: [convert(dimension)],
          });
        }
      });

      // 2. Create API call for remaining dimensions
      if (dimensionsToFilter?.length > 0) {
        const remainingDimensions = dimensionsToFilter
          .map((dim) => convert(dim))
          .filter(
            (dim) =>
              !Object.keys(filterData.dimensionFilters || {}).includes(
                convert(dim)
              )
          );

        if (remainingDimensions.length > 0) {
          const payload = {
            fileName: fileName,
            filePath: path,
            filterData: filterData,
            sortingData: null,
            groupByColumns: remainingDimensions,
            aggregationColumns: {},
            filterConditions: [],
            paginationData: null,
            fetchAllRows: true,
            time: Date.now(),
          };

          apiCalls.push(callQueryEngineQuery(payload));
          callMetadata.push({
            type: "remainingDimensions",
            dimensions: remainingDimensions,
            groupByColumns: remainingDimensions,
          });
        }
      }

      console.log(`Executing ${apiCalls.length} parallel API calls`);
      const results = await Promise.all(apiCalls);
      const processedResults = {};


      // Process results
      results.forEach((result, index) => {
        const metadata = callMetadata[index];
        const dimensionColumns = Array.isArray(metadata.groupByColumns)
          ? metadata.groupByColumns
          : [metadata.groupByColumns];

        dimensionColumns.forEach((dimensionColumn) => {
          let uniqueValues = [];

          // Case 1: Result is an array of objects
          if (Array.isArray(result)) {
            uniqueValues = [
              ...new Set(
                result
                  .map((row) => row[dimensionColumn])
                  .filter((value) => value != null && value !== "")
              ),
            ];
          }
          // Case 2: Result is an object with dimension keys
          else if (
            result &&
            typeof result === "object" &&
            result[dimensionColumn]
          ) {
            uniqueValues = [
              ...new Set(
                result[dimensionColumn].filter(
                  (value) => value != null && value !== ""
                )
              ),
            ];
          }
          // Case 3: Result has a data property with array
          else if (result?.data && Array.isArray(result.data)) {
            uniqueValues = [
              ...new Set(
                result.data
                  .map((row) => row[dimensionColumn])
                  .filter((value) => value != null && value !== "")
              ),
            ];
          }

          console.log(`Processed ${dimensionColumn}:`, uniqueValues);
          if (uniqueValues.length > 0) {
            processedResults[dimensionColumn] = uniqueValues;
          }
        });
      });

      setParallelApiResults(processedResults);
      console.log("Parallel API Results:", processedResults);
    } catch (error) {
      console.error("Error in parallel API calls:", error);
    } finally {
      setIsLoadingParallelApi(false);
    }
  };

  function checkFiltersMatchSet(filtersApplied, filtersData) {
    if (!filtersData || !filtersData.dimensionFilters) return true;
    
    // Get all values from dimensionFilters
    const dimensionFilterValues = [];

    for (const key in filtersData.dimensionFilters) {
      if (filtersData.dimensionFilters.hasOwnProperty(key)) {
        dimensionFilterValues.push(...filtersData.dimensionFilters[key]);
      }
    }

    // Convert to Sets for comparison
    const appliedSet = new Set(filtersApplied);
    const dimensionSet = new Set(dimensionFilterValues);

    // Check if sets have same size and all elements match
    if (appliedSet.size !== dimensionSet.size) {
      return false;
    }

    for (const item of appliedSet) {
      if (!dimensionSet.has(item)) {
        return false;
      }
    }

    return true;
  }

  // Apply filters to both files
  const applyFiltersToBoth = async () => {
    if(isPromo){
     resetPreviewEnrichment();
     setIsTGScenario(false);
    }
    if(fileName1){
      await applyFilter(fileName1, reportName1, "Default");
    }
    await applyFilter(fileName, reportName, "Default");
    
  };

  // Clear filters from both files
  const clearFiltersFromBoth = async () => {
    if(isPromo){
     resetPreviewEnrichment();
     setIsTGScenario(false);
    }
    if(fileName1){
      await clearFilters(fileName1, reportName1, "Default");
    }
    await clearFilters(fileName, reportName, "Default");
    await executeParallelApiCalls1();
    if (setAutoCompleteKey) {
      setAutoCompleteKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <Grid item {...(!sizeGiven && { xs: 12, lg: 3.2, xl: 3 })}>
      <Box>
        {(filtersApplied.length + dimensionsToFilter.length > 0 ||
          true) && (
          <Stack spacing={"1rem"}>
            <Stack
              spacing={1}
              sx={{
                border: "1px solid #D0D5DD",
                borderRadius: "8px",
                padding: "1rem",
                height: "450px", // Fixed height to match chart
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    marginRight: "0.2rem",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#101828",
                      textAlign: "left",
                      lineHeight: "30px",
                    }}
                  >
                    Filters
                  </Typography>

                  {/* Settings Icon with Tooltip */}
                  <Tooltip title="Configure filter dimensions">
                    <IconButton
                      onClick={() =>
                        setShowDimensionSettings(!showDimensionSettings)
                      }
                      sx={{
                        padding: "0px",
                        color: "#0C66E4",
                        "&:hover": {
                          backgroundColor: "rgba(99, 102, 241, 0.04)",
                        },
                      }}
                    >
                      <SettingsIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack direction={"row"} spacing={1}>
                  {filtersApplied.length > 0 && (
                    <Tooltip title="Remove all filters">
                      <IconButton
                        onClick={clearFiltersFromBoth}
                        sx={{
                          padding: "8px",
                          color: "#DC2626",
                          backgroundColor: "#FEF2F2",
                          border: "1px solid #FECACA",
                          borderRadius: "6px",
                          flexShrink: 0,
                          "&:hover": {
                            backgroundColor: "#FEE2E2",
                            borderColor: "#FCA5A5",
                          },
                        }}
                      >
                        <FilterAltOffIcon sx={{ fontSize: "18px" }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <Tooltip
                      title={
                        checkFiltersMatchSet(filtersApplied, filterData)
                          ? "No new filters to apply"
                          : "Click to apply updated filters to both datasets"
                      }
                      arrow
                    >
                      <span>
                        <CustomButton
                          title="Apply Filter"
                          outlined
                          disabled={checkFiltersMatchSet(
                            filtersApplied,
                            filterData
                          )}
                          onClick={applyFiltersToBoth}
                        />
                      </span>
                    </Tooltip>
                  </Box>
                </Stack>
              </Stack>

              {/* Collapsible Dimension Settings */}
              <Collapse in={showDimensionSettings}>
                <Stack
                  spacing={2}
                  sx={{
                    pt: 1,
                    borderTop: "1px solid #E4E7EC",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475467",
                    }}
                  >
                    Filter Configuration
                  </Typography>
                  <CustomAutocomplete
                    label={"Choose Dimensions to Filter"}
                    showLabel
                    isMultiSelect
                    selectedValues={dimensionsToFilter}
                    setSelectedValues={setDimensionsToFilter}
                    values={dimensionOptions.filter((val) => val !== "all")}
                    placeholder={`Select dimensions to filter...`}
                    fileName={fileName}
                    toRefresh={true}
                    maxHeight={"200px"}
                    filterBlock = {true}
                    
                  />
                </Stack>
              </Collapse>

              {/* Filter Dimensions - Scrollable Container */}
              {dimensionsToFilter.length > 0 && (
                <Box
                  sx={{
                    pt: 1,
                    flex: 1, // Takes remaining space in the container
                    overflowY: "auto",
                    maxHeight: "350px", // Adjust based on available space
                    pr: "4px", // Small padding for scrollbar
                  }}
                >
                  <Stack spacing={2}>
                    {dimensionsToFilter.map(
                      (dimension, index) => (
                        <CustomAutocomplete
                          key={`${dimension}-${autoCompleteKey || index}`}
                          label={dimension}
                          showLabel
                          isMultiSelect
                          target={"filter"}
                          path={convert(dimension)}
                          values={(() => {
                            const originalValues =
                              filterOptions[dimension] || [];
                            const availableValues =
                              parallelApiResults[convert(dimension)] || [];

                            // If no parallel API results yet, show all original values
                            if (
                              !parallelApiResults ||
                              Object.keys(parallelApiResults).length === 0
                            ) {
                              return originalValues;
                            }

                            // Filter to only show values that exist in parallel API results
                            return originalValues.filter((value) =>
                              availableValues.includes(value)
                            );
                          })()}
                          placeholder={`Select filters for ${dimension}...`}
                          reportName={reportName}
                          loading={isLoadingParallelApi}
                          showFormattedLabel = {true}
                        />
                      )
                    )}
                  </Stack>
                </Box>
              )}

              {/* Applied Filters at Bottom */}
              {filtersApplied.length > 0 && (
                <Stack
                  spacing={1}
                  sx={{
                    pt: 1,
                    borderTop: "1px solid #E4E7EC",
                    marginTop: "auto", // Push to bottom
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6B7280",
                    }}
                  >
                    Applied Filters:
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {filtersApplied.map((filter, index) => (
                      <Chip
                        label={filter}
                        key={index}
                        sx={{
                          padding: "0px 6px 0px 8px",
                          backgroundColor: "#F2F4F7",
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "12px",
                          lineHeight: "16px",
                          color: "#344054",
                          "& .MuiChip-deleteIcon": {
                            color: "#344054",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        )}
      </Box>
    </Grid>
  );
}

export default FilterBlock;