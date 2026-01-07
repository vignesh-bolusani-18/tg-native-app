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
import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete"; // or wherever it's located
import CustomButton from "./CustomButton";
import useDashboard from "../hooks/useDashboard";
import { callQueryEngineQuery } from "../utils/queryEngine";

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
}) {
  const [showDimensionSettings, setShowDimensionSettings] =
    React.useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [parallelApiResults, setParallelApiResults] = useState({});
  const [isLoadingParallelApi, setIsLoadingParallelApi] = useState(false);
  const { applyFilter, clearFilters, tablesFilterData, filterData } =
    useDashboard();
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
    const filterData = tablesFilterData[`${convertFilePathToFileName(path)}`]
      ? tablesFilterData[`${convertFilePathToFileName(path)}`].Default
          .filterData
      : null;
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

  // useEffect(() => {
  //   debugger;
  //   if (
  //     filterData &&
  //     Object.keys(filterData.dimensionFilters || {}).length > 0
  //   ) {
  //     executeParallelApiCalls1();
  //   }
  // }, [fileName]);

  function checkFiltersMatchSet(filtersApplied, filtersData) {
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

    console.log("appliedSet", appliedSet);
    console.log("dimensionSet", dimensionSet);

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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Stack padding="12px 15px 12px 15px" spacing={2}>
          <Stack spacing={"2rem"}>
            <Box>
              {(filtersApplied.length + dimensionsToFilter.length > 0 ||
                showDimensionSettings) && (
                <Stack spacing={"1rem"}>
                  <Stack
                    spacing={1}
                    sx={{
                      border: "1px solid #D0D5DD",
                      borderRadius: "8px",
                      padding: "1rem",
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

                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{
                            flex: 1,
                            minWidth: 0,
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
                      <Stack direction={"row"} spacing={1}>
                        {filtersApplied.length > 0 && (
                          <Tooltip title="Remove all filters">
                            <IconButton
                              onClick={async () => {
                                if(fileName1){
                                  await clearFilters(
                                  `${fileName1}`,
                                  reportName1,
                                  "Default"
                                );
                                }
                                await clearFilters(
                                  `${fileName}`,
                                  reportName,
                                  "Default"
                                );
                                
                              }}
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
                                : "Click to apply updated filters"
                            }
                            arrow
                          >
                            <span>
                              {" "}
                              {/* span needed to make Tooltip work on disabled button */}
                              <CustomButton
                                title="Apply Filter"
                                outlined
                                disabled={checkFiltersMatchSet(
                                  filtersApplied,
                                  filterData
                                )} // disable when filters already applied
                                onClick={async () => {

                                   if(fileName1){
                                    await applyFilter(
                                      `${fileName1}`,
                                      reportName1,
                                      "Default"
                                    );
                                  }
                                  await applyFilter(
                                    `${fileName}`,
                                    reportName,
                                    "Default"
                                  );
                                 
                                }}
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
                        sx={{ pt: 1, borderTop: "1px solid #E4E7EC" }}
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
                        />
                      </Stack>
                    </Collapse>

                    {/* Filter Dimensions Grid */}
                    {dimensionsToFilter.length > 0 && (
                      <Grid container spacing={1} sx={{ pt: 1 }}>
                        {(() => {
                          const maxVisibleDimensions = showAllFilters
                            ? dimensionsToFilter.length
                            : 4;
                          const visibleDimensions = dimensionsToFilter.slice(
                            0,
                            maxVisibleDimensions
                          );
                          const totalItemsInGrid = visibleDimensions.length;

                          return visibleDimensions.map((dimension, index) => {
                            const itemsPerRow = 4;
                            const currentRow = Math.floor(index / itemsPerRow);

                            // Calculate items in current row
                            const startOfCurrentRow = currentRow * itemsPerRow;
                            const endOfCurrentRow = Math.min(
                              startOfCurrentRow + itemsPerRow,
                              totalItemsInGrid
                            );
                            const itemsInCurrentRow =
                              endOfCurrentRow - startOfCurrentRow;

                            // Calculate width based on items in current row
                            let md = 12 / itemsInCurrentRow;

                            // Ensure standard widths
                            if (itemsInCurrentRow === 4) md = 3;
                            else if (itemsInCurrentRow === 3) md = 4;
                            else if (itemsInCurrentRow === 2) md = 6;
                            else if (itemsInCurrentRow === 1) md = 12;

                            return (
                              <React.Fragment key={dimension}>
                                <Grid item md={md} xs={12}>
                                  <CustomAutocomplete
                                    label={dimension}
                                    key={filtersApplied.length}
                                    showLabel
                                    isMultiSelect
                                    target={"filter"}
                                    path={convert(dimension)}
                                    values={(() => {
                                      const originalValues =
                                        filterOptions[dimension] || [];
                                      const availableValues =
                                        parallelApiResults[
                                          convert(dimension)
                                        ] || [];

                                      // If no parallel API results yet, show all original values
                                      if (
                                        !parallelApiResults ||
                                        Object.keys(parallelApiResults)
                                          .length === 0
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
                                  />
                                </Grid>
                              </React.Fragment>
                            );
                          });
                        })()}
                      </Grid>
                    )}

                    {/* Show View More/View Less button only if there are more than 4 dimensions */}
                    {dimensionsToFilter.length > 4 && (
                      <Stack
                        direction="row"
                        justifyContent="center"
                        sx={{ mt: 2 }}
                      >
                        <Button
                          variant="text"
                          onClick={() => setShowAllFilters(!showAllFilters)}
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#0C66E4",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "rgba(99, 102, 241, 0.04)",
                            },
                          }}
                          endIcon={
                            showAllFilters ? (
                              <KeyboardArrowUpIcon sx={{ fontSize: "18px" }} />
                            ) : (
                              <KeyboardArrowDownIcon
                                sx={{ fontSize: "18px" }}
                              />
                            )
                          }
                        >
                          {showAllFilters
                            ? "View Less Filters"
                            : `View More Filters (${
                                dimensionsToFilter.length - 4
                              } more)`}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              )}
            </Box>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default FilterBlock;
