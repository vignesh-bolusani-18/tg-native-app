"use client";

import React, { useRef, useState } from "react";
import useDashboard from "../../../../hooks/useDashboard";
import useAuth from "../../../../hooks/useAuth";
import { fetchCSVData, fetchParquetData } from "../../../../utils/s3Utils";
import { useEffect } from "react";
import CustomTable from "../../../../components/TanStackCustomTable";
import {
  Box,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../../../components/CustomButton";
import useExperiment from "../../../../hooks/useExperiment";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Collapse, Tooltip, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { callQueryEngineQuery } from "../../../../utils/queryEngine";

import useConfig from "../../../../hooks/useConfig";
import SawtoothChart from "../../../../components/SawtoothChart";
import SupplyPlanMetrics from "../../../../components/SupplyPlanMetrics";
import { set } from "lodash";

const ViewModeToggle = ({ viewMode, setViewMode }) => {
  console.log(viewMode);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        border: "1px solid #D0D5DD",
        borderRadius: "8px",
        padding: "6px", // Increased padding for more height
        width: "fit-content",
        height: "38px", // Match the SalesMetricsStrip height
        boxSizing: "border-box",
      }}
    >
      <Button
        onClick={() => setViewMode("unit")}
        sx={{
          backgroundColor: viewMode === "unit" ? "#0C66E4" : "transparent",
          color: viewMode === "unit" ? "white" : "#475467",
          fontFamily: "Inter",
          fontSize: "14px", // Restored original font size
          fontWeight: 500,
          textTransform: "none",
          borderRadius: "6px",
          px: 2, // Restored original padding
          py: 1, // Increased vertical padding for height
          minWidth: "auto",
          height: "32px", // Fixed height for buttons
          "&:hover": {
            backgroundColor: viewMode === "unit" ? "#0C66E4" : "#F3F4F6",
          },
          transition: "all 0.2s ease",
        }}
      >
        Unit
      </Button>
      <Button
        onClick={() => setViewMode("revenue")}
        sx={{
          backgroundColor: viewMode === "revenue" ? "#0C66E4" : "transparent",
          color: viewMode === "revenue" ? "white" : "#475467",
          fontFamily: "Inter",
          fontSize: "14px", // Restored original font size
          fontWeight: 500,
          textTransform: "none",
          borderRadius: "6px",
          px: 2, // Restored original padding
          py: 1, // Increased vertical padding for height
          minWidth: "auto",
          height: "32px", // Fixed height for buttons
          "&:hover": {
            backgroundColor: viewMode === "revenue" ? "#0C66E4" : "#F3F4F6",
          },
          transition: "all 0.2s ease",
        }}
      >
        Revenue
      </Button>
    </Box>
  );
};

const ProductionPlanningScreen = () => {
  const {
    experimentBasePath,
    reports,
    InvPriceFilterData,
    supplyPlanFilterData,
    setFilterOptions,
    setFilterOpen,
    filterOptions,
    applyFilter,
    productionPlanningDimensionsToFilter,
    setProductionPlanningDimensionsToFilter,
    tablesFilterData,
    clearFilters,
    filterData,
    setFilterData,
  } = useDashboard();
  const {
    setTabFilterColumns,
    supplyPlanningFilterColumns,
    supplyPlanDataType: viewMode,
    setSupplyPlanDataType: setViewMode,
  } = useConfig();

  const { experiment_config } = useExperiment();
  const production_plan_dimensions =
    experiment_config?.scenario_plan?.production_plan
      ?.production_plan_dimensions || [];
  const { userInfo, currentCompany } = useAuth();
  const [newData, setNewData] = useState(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [autoCompleteKey, setAutoCompleteKey] = useState(0);
  const [showDimensionSettings, setShowDimensionSettings] = useState(false);
  const [parallelApiResults, setParallelApiResults] = useState({});
  const [isLoadingParallelApi, setIsLoadingParallelApi] = useState(false);
  const [Try, setTry] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState([]);
  const [isValueData, setIsValueData] = useState(false);
  const forecastStartDateRef = useRef(null);
  const [unitOrRevenue, setUnitsOrRevenue] = useState("unit");

  const isRowEditable = (rowDimensionValue) => {
    return (
      rowDimensionValue === "Production Plan Add-on" ||
      rowDimensionValue === "Safety Stock Days"
    );
  };

  const isMetricsRow = (rowDimensionValue) => {
    return (
      rowDimensionValue === "Reorder Plan"
    );
  }
  const rowDimension = "Variable";
  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };
  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
  };

  const path =
    production_plan_dimensions.length > 0
      ? `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods.csv`
      : `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods.csv`;
  const fileName = path.split(".csv")[0].split("/").join("_");
  const valuePath = `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods_value.csv`;
  const fileNameValue = valuePath.split(".csv")[0].split("/").join("_");
  const soh_data_fileName =
    `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");

  const checkFiltersMatchSet = (filtersApplied, filtersData) => {
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
  };

  const executeParallelApiCalls = async () => {
    if (!filterData || !filterData.dimensionFilters) {
      console.log("No filter data available for parallel API calls");
      return;
    }

    setIsLoadingParallelApi(true);
    const convertFilePathToFileName = (filePath) => {
      if (!filePath) return "";
      const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
      const pathComponents = withoutExtension.split("/");
      return pathComponents.join("_");
    };

    try {
      const apiCalls = [];
      const callMetadata = [];

      const dimensionFilterKeys = Object.keys(
        filterData.dimensionFilters || {}
      );
      const dimensionsWithValues = dimensionFilterKeys.filter(
        (dimension) =>
          filterData.dimensionFilters[dimension] &&
          filterData.dimensionFilters[dimension].length > 0
      );

      for (const dimension of dimensionsWithValues) {
        // Create a copy of filterData without the current dimension
        const modifiedFilterData = {
          ...filterData,
          dimensionFilters: {
            ...filterData.dimensionFilters,
          },
        };

        // Remove current dimension from dimensionFilters
        delete modifiedFilterData.dimensionFilters[dimension];

        const payload = {
          fileName: convertFilePathToFileName(path),
          filePath: path,
          filterData: modifiedFilterData,
          sortingData: null,
          groupByColumns: [convert(dimension)], // Use converted dimension name
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

      if (
        supplyPlanningFilterColumns &&
        supplyPlanningFilterColumns.length > 0
      ) {
        // Get dimensions that are NOT in dimensionsWithValues (includes empty ones)
        const remainingDimensions = supplyPlanningFilterColumns.filter(
          (dim) => !dimensionsWithValues.includes(convert(dim))
        );

        if (remainingDimensions.length > 0) {
          // Create payload with all remaining dimensions as groupByColumns
          const remainingGroupByColumns = remainingDimensions.map((dim) =>
            convert(dim)
          );

          const payload = {
            fileName: convertFilePathToFileName(path),
            filePath: path,
            filterData: filterData, // Use original filterData
            sortingData: null,
            groupByColumns: remainingGroupByColumns,
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
            groupByColumns: remainingGroupByColumns,
          });
        }
      }

      console.log(`Executing ${apiCalls.length} parallel API calls...`);
      console.log("Call metadata:", callMetadata);

      // Execute all API calls in parallel
      const results = await Promise.all(apiCalls);

      const processedResults = {};

      results.forEach((result, index) => {
        const metadata = callMetadata[index];

        console.log(`Processing result ${index}:`, result);
        console.log(`Metadata:`, metadata);

        if (metadata.type === "dimensionFilter") {
          // Extract unique values from the result data for this dimension
          const dimensionColumn = convert(metadata.dimension);

          // Handle different result structures
          let dataArray = null;
          if (result && Array.isArray(result)) {
            // If result is directly an array
            dataArray = result;
          } else if (result && result.data && Array.isArray(result.data)) {
            // If result has a data property
            dataArray = result.data;
          } else if (result && typeof result === "object") {
            // If result is an object, look for the dimension column directly
            const resultKeys = Object.keys(result);
            if (
              resultKeys.includes(dimensionColumn) &&
              Array.isArray(result[dimensionColumn])
            ) {
              const uniqueValues = [
                ...new Set(
                  result[dimensionColumn].filter(
                    (value) =>
                      value !== null && value !== undefined && value !== ""
                  )
                ),
              ];
              processedResults[dimensionColumn] = uniqueValues;
              return;
            }
          }

          if (dataArray && Array.isArray(dataArray)) {
            const uniqueValues = [
              ...new Set(
                dataArray
                  .map((row) => row[dimensionColumn])
                  .filter(
                    (value) =>
                      value !== null && value !== undefined && value !== ""
                  )
              ),
            ];
            processedResults[dimensionColumn] = uniqueValues;
          } else {
            processedResults[dimensionColumn] = [];
          }
        } else if (metadata.type === "remainingDimensions") {
          // Handle remaining dimensions - extract unique values for each dimension
          let dataArray = null;
          if (result && Array.isArray(result)) {
            dataArray = result;
          } else if (result && result.data && Array.isArray(result.data)) {
            dataArray = result.data;
          } else if (result && typeof result === "object") {
            // If result is an object with dimension keys directly
            metadata.groupByColumns.forEach((columnName) => {
              if (result[columnName] && Array.isArray(result[columnName])) {
                const uniqueValues = [
                  ...new Set(
                    result[columnName].filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                  ),
                ];
                processedResults[columnName] = uniqueValues;
              } else {
                processedResults[columnName] = [];
              }
            });
            return;
          }

          if (dataArray && Array.isArray(dataArray)) {
            metadata.groupByColumns.forEach((columnName) => {
              const uniqueValues = [
                ...new Set(
                  dataArray
                    .map((row) => row[columnName])
                    .filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ""
                    )
                ),
              ];
              processedResults[columnName] = uniqueValues;
            });
          } else {
            // Initialize empty arrays for remaining dimensions if no data
            metadata.groupByColumns.forEach((columnName) => {
              processedResults[columnName] = [];
            });
          }
        }
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
    const updateFilterData = async () => {
      const allFilterData = {
        dimensionFilters:
          tablesFilterData?.[fileName]?.Default?.filterData?.dimensionFilters ??
          [],
        columnFilter:
          tablesFilterData?.[fileNameValue]?.Default?.filterData
            ?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData?.[fileNameValue]?.Default?.filterData
            ?.selectAllColumns ?? true,
      };

      await setFilterData(
        allFilterData,
        "Supply Plan Value",
        fileNameValue,
        "Default"
      );
    };

    updateFilterData();
  }, [tablesFilterData?.[fileName]?.Default?.filterData?.dimensionFilters]);

  useEffect(() => {
    const filtersData = tablesFilterData[`${fileName}`]
      ? tablesFilterData[`${fileName}`].Default.filterData.dimensionFilters
      : null;

    const columnFilterData = tablesFilterData[`${fileName}`]
      ? tablesFilterData[`${fileName}`].Default.filterData.columnFilter
      : null;
    if (filtersData) {
      const tempData = Object.entries(filtersData)
        .filter(([key, value]) => Array.isArray(value) && value.length > 0)
        .map(([key]) => (key === "cluster" ? "Cluster" : key));

      let filtersArray = [];
      Object.keys(filtersData).forEach((key) => {
        filtersArray = filtersArray.concat(filtersData[key]);
      });

      if (
        productionPlanningDimensionsToFilter &&
        productionPlanningDimensionsToFilter.length > 0
      ) {
        setProductionPlanningDimensionsToFilter(
          Array.isArray(columnFilterData) && columnFilterData.length > 0
            ? productionPlanningDimensionsToFilter.filter((dim) =>
                columnFilterData.includes(convert(dim))
              )
            : productionPlanningDimensionsToFilter
        );
      }

      if (
        supplyPlanningFilterColumns &&
        supplyPlanningFilterColumns.length > 0
      ) {
        setTabFilterColumns(
          Array.isArray(columnFilterData) && columnFilterData.length > 0
            ? supplyPlanningFilterColumns.filter((dim) =>
                columnFilterData.includes(convert(dim))
              )
            : supplyPlanningFilterColumns,
          "supplyPlanning"
        );
      }

      setFiltersApplied(filtersArray);
      console.log("Filter Array:", filtersArray);
    }
  }, [tablesFilterData]);

  useEffect(() => {
    const updateFilterData = async () => {
      const allFilterData = {
        dimensionFilters:
          tablesFilterData?.[fileName]?.Default?.filterData?.dimensionFilters ??
          [],
        columnFilter:
          tablesFilterData?.[soh_data_fileName]?.Default?.filterData
            ?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData?.[soh_data_fileName]?.Default?.filterData
            ?.selectAllColumns ?? true,
      };

      await setFilterData(
        allFilterData,
        "DOI Details",
        soh_data_fileName,
        "Default"
      );
    };

    updateFilterData();
  }, [tablesFilterData?.[fileName]?.Default?.filterData?.dimensionFilters]);

  useEffect(() => {
    if (
      filterData &&
      Object.keys(filterData.dimensionFilters || {}).length > 0
    ) {
      executeParallelApiCalls();
    }
  }, [filterData, supplyPlanningFilterColumns]);

  const isEditableColumn = (columnName) => {
    const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2})$/;
    return regex.test(columnName);
  };
  const getTimeStamp = (columnName) => {
    const time_stamp = columnName.split(" ")[0];
    return time_stamp;
  };
  const { hasParquetFiles } = useExperiment();
  const fetchData = async () => {
    const fetchFn = hasParquetFiles ? fetchParquetData : fetchCSVData;

    const commonPayload = {
      filterData: null,
      paginationData: { batchNo: 1, batchSize: 1 },
      sortingData: null,
    };

    const [data, valueData] = await Promise.allSettled([
      fetchFn({ ...commonPayload, filePath: path }),
      fetchFn({ ...commonPayload, filePath: valuePath }),
    ]);

    console.log("SupplyPlanData", data, Object.keys(data.value), valueData);
    console.log("SupplyPlanFilterData", supplyPlanFilterData);

    if (valueData.value) {
      setIsValueData(true);
    }

    setNewData(data?.value);
    if (data) {
      const filterOptions = {
        dimensions: supplyPlanFilterData
          ? supplyPlanFilterData
          : InvPriceFilterData,
        columns: Object.keys(data.value),
      };
      setFilterOptions(filterOptions, `${fileName}`, "Default", true);
      // setFilterOpen(false);
    }

    setTry(Try + 1);
  };

  console.log(isValueData);

  useEffect(() => {
    if (
      newData &&
      (!productionPlanningDimensionsToFilter ||
        productionPlanningDimensionsToFilter.length === 0)
    ) {
      setProductionPlanningDimensionsToFilter(
        Object.keys(
          supplyPlanFilterData ? supplyPlanFilterData : InvPriceFilterData
        ).filter(
          (value) =>
            Object.keys(newData).includes(convert(value)) &&
            value !== "Cluster" &&
            value !== "Lifestage"
        )
      );
    }

    if (
      newData &&
      (!supplyPlanningFilterColumns || supplyPlanningFilterColumns.length === 0)
    ) {
      const filteredColumns = Object.keys(
        supplyPlanFilterData ? supplyPlanFilterData : InvPriceFilterData
      ).filter(
        (value) =>
          Object.keys(newData).includes(convert(value)) &&
          value !== "Cluster" &&
          value !== "Lifestage"
      );

      setTabFilterColumns(filteredColumns, "supplyPlanning");
    }
  }, [newData]);

  useEffect(() => {
    if (!newData && Try < 3) {
      fetchData();
    }
  }, [newData, Try]);

  if (!newData) {
    if (Try === 0) {
      return (
        <Stack
          sx={{
            width: "100%",
            padding: "16px",
            height: "100%",
          }}
          spacing={2} // Add more spacing between the title and table
        >
          {/* Skeleton for the title */}
          <Skeleton variant="text" width={"30%"} height={"40px"} />

          {/* Simulating the table with 5x5 grid */}
          <Stack spacing={1}>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <Stack key={rowIndex} direction="row" spacing={1}>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    variant="text"
                    width={"100%"}
                    height={"50px"}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
      );
    } else {
      return (
        <Stack
          sx={{
            width: "100%",
            padding: "16px",
            height: "100%",
          }}
          justifyContent={"center"}
        >
          <Typography
            sx={{
              color: "#667085",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              textAlign: "center",
            }}
          >
            No data available
          </Typography>
        </Stack>
      );
    }
  }
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Stack padding="3px 12px 10px 12px" spacing={2}>
            <Stack>
              <Grid item xs={12} marginBottom={"5px"}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // spreads them nicely
                    width: "100%",
                    gap: "3px",
                  }}
                >
                  {/* SupplyPlanMetrics takes left side */}
                  <Box sx={{ flex: 1 }}>
                    <SupplyPlanMetrics unitOrRevenue={unitOrRevenue} />
                  </Box>

                  {/* ViewModeToggle sticks to right side */}
                  {isValueData && (
                    <Box sx={{ flexShrink: 0 }}>
                      <ViewModeToggle
                        viewMode={unitOrRevenue}
                        setViewMode={setUnitsOrRevenue}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Main Content Container - Side by Side Layout */}
              <Grid container spacing={3}>
                {/* Filters Section */}
                <Grid item xs={12} lg={3.2} xl={3}>
                  <Box>
                    {(filtersApplied.length +
                      supplyPlanningFilterColumns.length >
                      0 ||
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
                                    setShowDimensionSettings(
                                      !showDimensionSettings
                                    )
                                  }
                                  sx={{
                                    padding: "0px",
                                    color: "#0C66E4",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(99, 102, 241, 0.04)",
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
                                    onClick={async () => {
                                      await clearFilters(
                                        `${fileName}`,
                                        "Supply Plan",
                                        "Default"
                                      );
                                      setAutoCompleteKey(
                                        (prevKey) => prevKey + 1
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
                                    <FilterAltOffIcon
                                      sx={{ fontSize: "18px" }}
                                    />
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
                                    checkFiltersMatchSet(
                                      filtersApplied,
                                      filterData
                                    )
                                      ? "No new filters to apply"
                                      : "Click to apply updated filters"
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
                                      onClick={async () => {
                                        await applyFilter(
                                          `${fileName}`,
                                          "Supply Plan",
                                          "Default"
                                        );
                                        await applyFilter(
                                          `${fileName}`,
                                          "DOI Details",
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
                                selectedValues={supplyPlanningFilterColumns}
                                setSelectedValues={(value) =>
                                  setTabFilterColumns(value, "supplyPlanning")
                                }
                                values={Object.keys(
                                  supplyPlanFilterData
                                    ? supplyPlanFilterData
                                    : InvPriceFilterData
                                ).filter((value) =>
                                  Object.keys(newData).includes(convert(value))
                                )}
                                placeholder={`Select dimensions to filter...`}
                              />
                            </Stack>
                          </Collapse>

                          {/* Filter Dimensions - Scrollable Container */}
                          {supplyPlanningFilterColumns.length > 0 && (
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
                                {supplyPlanningFilterColumns.map(
                                  (dimension, index) => (
                                    <CustomAutocomplete
                                      key={`${dimension}-${autoCompleteKey}`}
                                      label={dimension}
                                      showLabel
                                      isMultiSelect
                                      target={"filter"}
                                      path={convert(dimension)}
                                      values={(() => {
                                        const originalValues =
                                          filterOptions.dimensions[dimension] ||
                                          [];
                                        const availableValues =
                                          parallelApiResults[
                                            convert(dimension)
                                          ] || [];

                                        if (
                                          !parallelApiResults ||
                                          Object.keys(parallelApiResults)
                                            .length === 0
                                        ) {
                                          return originalValues;
                                        }

                                        return originalValues.filter((value) =>
                                          availableValues.includes(value)
                                        );
                                      })()}
                                      placeholder={`Select filters for ${dimension}...`}
                                      showFormattedLabel={true}
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

                {/* Chart Section */}
                <Grid item xs={12} lg={8.8} xl={9}>
                  <Box
                    sx={{
                      border: "1px solid #E4E7EC",
                      borderRadius: "8px",
                      height: "450px", // Same fixed height as filter container
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <SawtoothChart
                      filePath={path}
                      valueFilePath={valuePath}
                      isValueData={isValueData}
                      unitOrRevenue={unitOrRevenue}
                      reportName="Supply Plan"
                      forecastStartDateRef = {forecastStartDateRef}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <CustomTable
        title={
          production_plan_dimensions.length > 0 ? "Supply Plan" : "Supply Plan"
        }
        //data={newData}

        alternateTitle={"DOI Details"}
        showAlternate={viewMode === "analytical"}
        valueFileTitle={"Supply Plan Value"}
        isPlannerData={true}
        isEditable
        isEditableColumn={isEditableColumn}
        isRowEditable={isRowEditable}
        isMetricsRow={isMetricsRow}
        rowDimension={rowDimension}
        getTimeStamp={getTimeStamp}
        isRevenue={unitOrRevenue === "revenue"}
        enableFileUpload
        unitOrRevenue={unitOrRevenue}
        forecastStartDateRef = {forecastStartDateRef}
        editableRowDimensionValues={[
          "Production Plan Add-on",
          "Safety Stock Days",
        ]}
        multiDownloadFiles={{
          "DOI Detailed View": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
          "Inventory Reorder Plan": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/reorder_table.csv`,
          "Stock Transfer": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/stock_transfer_df.csv`,
          "Potential Stock Wastage": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/potential_stock_wastage.csv`,
          "Raw Inventory": `${experimentBasePath}/etl_data/202110/inv_data.csv`,
          "SOH Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/soh_data_pivot.csv`,
        }}
        // enableAggregation
      />
    </>
  );
};

export default ProductionPlanningScreen;
