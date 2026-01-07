// src/redux/slices/dashboardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getColumnKey } from "../../utils/Agent Utils/getColumnKey";
import { getDefaultEnrichmentColumnKeys } from "../../utils/Agent Utils/getDefaultEnrichmentColumnKeys";
import { file } from "jszip";

const initialState = {
  selectedModel: "OpenAi",
  clearChat: false,
  dashboardData: null,
  executiveViewData: null,
  demandForecastingData: null,
  inventoryOptimizationData: null,
  priceOptimizationData: null,
  dimensionFilterData: null,
  elasticityDimensionFilterData:null,
  currentDimension: "all",
  currentValue: "all",
  currentDimensionOptimize:"Forecast_Granularity",
  InvCurrentDimension: "all",
  InvCurrentValue: "all",
  PriceCurrentDimension: "all",
  PriceCurrentValue: "all",
  currentStartDate: null,
  currentEndDate: null,
  forecastingPivotData: null,
  forecastingDisagg: null,
  experimentBasePath: null,
  dashboardLoading: true,
  reports: null,
  reportsTab: "1",
  reportToShow: null,
  subReportsTab: "1",
  inventoryOptimizationFilterData: null,
  priceOptimizationFilterData: null,
  InvPriceFilterData: null,
  supplyPlanFilterData: null,
  showFutureActuals: false,
  showMLForecast: false,
  showEnrichForecast: false,
  showAdjustHistoricalData: false,
  showPredictionInterval: false,
  InventoryMetricsData: null,
  filterOptions: { dimensions: {}, columns: [] },
  RiskColumn: null,
  filterData: {
    dimensionFilters: {},
    columnFilter: [],
    frozenColumns: [],
    selectAllColumns: true,
  },
  BYORData: {
    groupByColumns: [],
    aggregationColumns: {},
    filterConditions: [],
    byorFilterData: {
      selectAllColumns: true,
      columnsFilter: [],
      dimensionFilters: {},
    },
  },
  BYORConfig: {},
  tablesFilterData: {},
  filterOpen: false,
  saveReportOpen: false,
  rawSalesData: null,
  priceMetricsData: null,
  SnOPDimensionsToFilter: [],
  SnOPDimensionsToFilterView1: [],
  productionPlanningDimensionsToFilter: [],
  showRawActuals: false,
  showOffsetForecast: false,
  autoCalculateSums: true,
  searchLineFilter: null,
  currentRLAgentEnrichmentSuggestion: null,
  rlAgentEnrichmentSuggestions: [],
  approvedRLAgentEnrichmentSuggestions: [],
  currentRLAgentEnrichmentRisk: "All",
  currentRLAgentEnrichmentDimension: "all",
  currentRLAgentEnrichmentValue: "all",
  currentRLAgentEnrichmentKeys: [],
  rlEnrichmentsGlobalEndDate: "",
  rlEnrichmentsGlobalStartDate: "",
  currentRLAgentEnrichmentSuggestionCardIndex: 0,
  lastSyncedTime: null,
  
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearChat: (state) => {
      state.clearChat = false;
    },
    resetClearChat: (state) => {
      state.clearChat = false;
    },
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload;
    },
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
      console.log("dashboardData Updated to: ", state.dashboardData);
    },
    setReportsTab: (state, action) => {
      state.reportsTab = action.payload;
      state.subReportsTab = "1";
    },

    setSubReportsTab: (state, action) => {
      state.subReportsTab = action.payload;
    },
    setReportToShow: (state, action) => {
      state.reportToShow = action.payload;
    },
    setCurrentRLAgentEnrichmentSuggestion: (state, action) => {
      state.currentRLAgentEnrichmentSuggestion = action.payload;
      if(action.payload?.Dimension){
        if(action.payload?.Dimension !== state.currentDimension){
          state.currentDimension = action.payload?.Dimension;
        }
      }
      if(action.payload?.Value){
        if(action.payload?.Value !== state.currentValue){
          state.currentValue = action.payload?.Value;
        }
      }
      state.currentRLAgentEnrichmentKeys = getDefaultEnrichmentColumnKeys(
        action.payload
      );
    },
    setCurrentRLAgentEnrichmentSuggestionCardIndex: (state, action) => {
      state.currentRLAgentEnrichmentSuggestionCardIndex = action.payload;
    },
    addCurrentRLAgentEnrichmentKey: (state, action) => {
      const type = action.payload;
      const key = getColumnKey(type);
      if (key && !state.currentRLAgentEnrichmentKeys.includes(key)) {
        state.currentRLAgentEnrichmentKeys.push(key);
      } else {
        console.log("Invalid enrichment type: ", type);
      }
    },
    removeCurrentRLAgentEnrichmentKey: (state, action) => {
      const type = action.payload;
      const key = getColumnKey(type);
      if (key) {
        state.currentRLAgentEnrichmentKeys =
          state.currentRLAgentEnrichmentKeys.filter(
            (currentKey) => currentKey !== key
          );
      }
    },
    setDashboardLoading: (state, action) => {
      state.dashboardLoading = action.payload;
      console.log("dashboardLoading updated to: ", state.dashboardLoading);
    },
    setShowFutureActuals: (state, action) => {
      state.showFutureActuals = action.payload;
    },
    setShowMLForecast: (state, action) => {
      state.showMLForecast = action.payload;
    },
    setShowEnrichForecast: (state, action) => {
      state.showEnrichForecast = action.payload;
    },
    setShowAdjustHistoricalData: (state, action) => {
      state.showAdjustHistoricalData = action.payload;
    },
    setShowPredictionInterval: (state, action) => {
      state.showPredictionInterval = action.payload;
    },
    setForecastingPivotData: (state, action) => {
      state.forecastingPivotData = action.payload;

      console.log("forecastingDiss Updated to: ", state.forecastingPivotData);
    },
    setRLAgentEnrichmentSuggestions: (state, action) => {
      state.rlAgentEnrichmentSuggestions = action.payload;
    },
    setApprovedRLAgentEnrichmentSuggestions: (state, action) => {
      state.approvedRLAgentEnrichmentSuggestions = action.payload;
    },
    updateApprovedRLAgentEnrichmentSuggestions: (state, action) => {
      state.approvedRLAgentEnrichmentSuggestions = action.payload;
    },
    updateRLAgentEnrichmentSuggestions: (state, action) => {
      state.rlAgentEnrichmentSuggestions = action.payload;
    },
    setCurrentRLAgentEnrichmentRisk: (state, action) => {
      state.currentRLAgentEnrichmentRisk = action.payload;
    },
    setForecastingDisagg: (state, action) => {
      state.forecastingDisagg = action.payload;

      console.log(
        "forecastingDisaggData Updated to: ",
        state.forecastingDisagg
      );
    },
    setCurrentStartDate: (state, action) => {
      state.currentStartDate = action.payload;
      console.log("currentStartDate Updated to: ", state.currentStartDate);
    },
    setCurrentEndDate: (state, action) => {
      state.currentEndDate = action.payload;
      console.log("currentEndDate Updated to: ", state.currentEndDate);
    },
    setCurrentDimension: (state, action) => {
      state.currentDimension = action.payload;
      console.log("currentDimension Updated to: ", state.currentDimension);
    },
    setCurrentValue: (state, action) => {
      state.currentValue = action.payload;
      console.log("currentValue Updated to: ", state.currentValue);
    },
    setCurrentRLAgentEnrichmentDimension: (state, action) => {
      state.currentRLAgentEnrichmentDimension = action.payload;
    },
    setCurrentRLAgentEnrichmentValue: (state, action) => {
      state.currentRLAgentEnrichmentValue = action.payload;
    },
    setCurrentInvDimension: (state, action) => {
      state.InvCurrentDimension = action.payload;
      // console.log("currentDimension Updated to: ", state.currentDimension);
    },
    setCurrentInvValue: (state, action) => {
      state.InvCurrentValue = action.payload;
      // console.log("currentValue Updated to: ", state.currentValue);
    },
    setCurrentPriceDimension: (state, action) => {
      state.PriceCurrentDimension = action.payload;
      // console.log("currentDimension Updated to: ", state.currentDimension);
    },
    setCurrentPriceValue: (state, action) => {
      state.PriceCurrentValue = action.payload;
      // console.log("currentValue Updated to: ", state.currentValue);
    },
    setRlEnrichmentsGlobalStartDate: (state, action) => {
      state.rlEnrichmentsGlobalStartDate = action.payload;
    },
    setRlEnrichmentsGlobalEndDate: (state, action) => {
      state.rlEnrichmentsGlobalEndDate = action.payload;
    },
    setDimensionFilterData: (state, action) => {
      state.dimensionFilterData = action.payload;
      console.log(
        "dimensionFilterData Updated to: ",
        state.dimensionFilterData
      );
    },

    setElasticityDimensionFilterData: (state, action) => {
      state.elasticityDimensionFilterData = action.payload;
      console.log(
        "dimensionFilterData Updated to: ",
        state.elasticityDimensionFilterData 
      );
    },
    // change this for exevutive view
    setExecutiveViewData: (state, action) => {
      state.executiveViewData = action.payload;
      console.log("executiveViewData Updated to: ", state.executiveViewData);
    },
    // change this for exevutive view
    setRawSalesData: (state, action) => {
      state.rawSalesData = action.payload;
      console.log("rawSalesData Updated to: ", state.rawSalesData);
    },
    setPriceMetricsData: (state, action) => {
      state.priceMetricsData = action.payload;
      console.log("priceMetrics Data Updated to: ", state.priceMetricsData);
    },
    // change this for exevutive view
    setInventoryMetricsData: (state, action) => {
      state.InventoryMetricsData = action.payload;
      console.log("InventoryMetrics Updated to: ", state.InventoryMetricsData);
    },
    // change this for exevutive view
    setInvPriceFilterData: (state, action) => {
      const dict = { ts_id: "Forecast_Granularity", cluster: "Cluster" };
      let data = action.payload;
      let newData = { all: ["all"] };
      Object.keys(data).forEach((key) => {
        let newKey = key;
        if (["ts_id", "cluster"].includes(key)) {
          newKey = dict[key];
        }
        newData[newKey] = data[key].filter((value) => value !== "UNKNOWN");
      });

      state.InvPriceFilterData = newData;
      console.log(
        "Inv Price Filter Data Updated to: ",
        state.InvPriceFilterData
      );
    },

     setSupplyPlanFilterData: (state, action) => {
      const dict = { ts_id: "Forecast_Granularity", cluster: "Cluster" };
      let data = action.payload;
      let newData = { all: ["all"] };
      Object.keys(data).forEach((key) => {
        let newKey = key;
        if (["ts_id", "cluster"].includes(key)) {
          newKey = dict[key];
        }
        newData[newKey] = data[key].filter((value) => value !== "UNKNOWN");
      });

      state.supplyPlanFilterData = newData;
      console.log(
        "supplyPlan Filter Data Updated to: ",
        state.supplyPlanFilterData
      );
    },
    setDemandForecastingData: (state, action) => {
      state.demandForecastingData = action.payload;
      console.log(
        "demandForecastingData Updated to: ",
        state.demandForecastingData
      );
    },
    setInventoryOptimizationData: (state, action) => {
      state.inventoryOptimizationData = action.payload.data;
      const dimensionColumns = action.payload.dimensionColumns;
      const removeDuplicates = (arr) => {
        return [...new Set(arr)].filter((item) => item);
      };
      let newInvFilterData = {
        all: ["all"],
        Lifestage: removeDuplicates(action.payload.data.Lifestage),
        Cluster: removeDuplicates(action.payload.data.cluster),
        Forecast_Granularity: removeDuplicates(action.payload.data.ts_id),
      };
      dimensionColumns.forEach((dimensionColumn) => {
        newInvFilterData[dimensionColumn] = removeDuplicates(
          action.payload.data[dimensionColumn]
        );
      });
      state.inventoryOptimizationFilterData = newInvFilterData;
      console.log(
        "inventoryOptimizationData Updated to: ",
        state.inventoryOptimizationData
      );
    },
    setPriceOptimizationData: (state, action) => {
      console.log("entered in setPriceOptimization Data", action.payload.data);
      state.priceOptimizationData = action.payload.data;
      const dimensionColumns = action.payload.dimensionColumns;
      console.log("Slice dim", dimensionColumns);
      const removeDuplicates = (arr) => {
        return [...new Set(arr)].filter((item) => item);
      };
      let newPriceFilterData = {
        all: ["all"],
        Lifestage: removeDuplicates(action.payload.data.Lifestage),
        Cluster: removeDuplicates(action.payload.data.cluster),
        Forecast_Granularity: removeDuplicates(action.payload.data.ts_id),
      };
      dimensionColumns.forEach((dimensionColumn) => {
        newPriceFilterData[dimensionColumn] = removeDuplicates(
          action.payload.data[dimensionColumn]
        );
      });
      console.log("FilterPriceData", newPriceFilterData);
      state.priceOptimizationFilterData = newPriceFilterData;
      console.log(
        "priceOptimizationData Updated to: ",
        state.priceOptimizationData
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setExperimentBasePath: (state, action) => {
      console.log("entered in setExperimentBasePath", action.payload);
      state.experimentBasePath = action.payload;
    },

    setReports: (state, action) => {
      const reports = action.payload;
      state.reports = reports;
    },
    setRiskColumn: (state, action) => {
      state.RiskColumn = action.payload;
    },
    setFilterOptions: (state, action) => {
      
      const filterOptions = action.payload.filterOptions;
      const fileName = action.payload.fileName;
      const reportId = action.payload.reportId;
      const silent = action.payload.silent;
     

      console.log(filterOptions , fileName, reportId);
      console.log("Silent", silent);

      if (reportId !== "Default") {
        const dimensions = {};
        Object.keys(
          state.tablesFilterData[fileName][reportId].filterData
            .dimensionFilterData
        ).forEach((dimension) => {
          dimensions[dimension] = filterOptions.dimensions[dimension];
        });
        const columns = filterOptions.columns;
        state.filterOptions = { dimensions, columns };
        state.filterData =
          state.tablesFilterData[fileName][reportId].filterData;
      } else {
        // Safely get default filter data
        const defaultFilterData =
          state.tablesFilterData?.[fileName]?.["Default"]?.filterData;
        if (defaultFilterData) {
          console.log(
            "Default Filter Data",
            JSON.stringify(defaultFilterData, null, 2)
          );

          

          // Get columns data with fallbacks
          const allColumns = filterOptions?.columns || [];
          let columnFilter = defaultFilterData?.columnFilter || [];
          const frozenColumns = defaultFilterData?.frozenColumns || [];
          const selectAllColumns = defaultFilterData?.selectAllColumns ?? true;

          if (selectAllColumns && columnFilter.length === 0) {
            columnFilter = allColumns;
          }

          console.log("Frozen Columns", JSON.stringify(frozenColumns, null, 2));
          console.log("Column Filter", JSON.stringify(columnFilter, null, 2));
          console.log("Select All Columns", selectAllColumns);

          // Only process if allColumns exists
          let newColumns = [];
          let removedColumns = [];
          let remainingColumns = [];
          let remainingFrozenColumns = [];

          if (Array.isArray(allColumns) && Array.isArray(columnFilter)) {
            newColumns = allColumns.filter(
              (col) => !columnFilter.includes(col)
            );
            console.log("New Columns", newColumns);

            removedColumns = columnFilter.filter(
              (col) => !allColumns.includes(col)
            );
            console.log("Removed Columns", removedColumns);

            remainingColumns = columnFilter.filter((col) =>
              allColumns.includes(col)
            );
            console.log("Remaining Columns", remainingColumns);
          }

          remainingFrozenColumns = frozenColumns.filter((col) =>
            remainingColumns.includes(col)
          );
          console.log("Remaining Frozen Columns", remainingFrozenColumns);

          // Safely update state only if all parent objects exist
          if (state.tablesFilterData?.[fileName]?.["Default"]?.filterData) {
            state.tablesFilterData[fileName]["Default"].filterData = {
              ...state.tablesFilterData[fileName]["Default"].filterData,
              selectAllColumns: Array.isArray(newColumns)
                ? newColumns.length === 0
                : true,
              columnFilter: remainingColumns,
              frozenColumns: remainingFrozenColumns,
            };
          }
        }

        state.filterOptions = filterOptions;
        const dimensionFilters = {};
        Object.keys(filterOptions.dimensions).forEach((dimension) => {
          dimensionFilters[dimension] = [];
        });

        state.filterData = {
          dimensionFilters:
            state.tablesFilterData[fileName]?.["Default"]?.filterData
              ?.dimensionFilters ?? {},
          frozenColumns:
            state.tablesFilterData[fileName]?.["Default"]?.filterData
              ?.frozenColumns ?? [],
          columnFilter:
            state.tablesFilterData[fileName]?.["Default"]?.filterData
              ?.columnFilter ?? [],
          selectAllColumns:
            state.tablesFilterData[fileName]?.["Default"]?.filterData
              ?.selectAllColumns ?? true,
        };
        if (!silent) {
          state.filterOpen = true;
        }
      }
    },

    updateFilterDataDimension: (state, action) => {
      state.filterData.dimensionFilters = action.payload;
    },

    setFilterColumns: (state, action) => {
      state.filterData.columnFilter = action.payload;
    },
    setFrozenColumns: (state, action) => {
      state.filterData.frozenColumns = action.payload;
    },
    deleteCustomReport: (state, action) => {
      const { fileName, reportId } = action.payload;
      const updatedFileData = { ...state.tablesFilterData[fileName] };
      delete updatedFileData[reportId];
      state.tablesFilterData = {
        ...state.tablesFilterData,
        [fileName]: updatedFileData,
      };
    },
    setFilterData: (state, action) => {
      const { fileName, reportId, filterData, reportName } = action.payload;

      console.log(fileName , reportId, filterData, reportName);
      state.tablesFilterData = {
        ...state.tablesFilterData,
        [fileName]: {
          ...(state.tablesFilterData[fileName] || {}), // Fallback to an empty object if fileName doesn't exist
          [reportId]: {
            reportName,
            filterData: {
              ...filterData,
              frozenColumns: [
                ...(state.tablesFilterData[fileName]?.[reportId]?.filterData
                  ?.frozenColumns || []),
              ],
            },
          },
        },
      };
      // state.tablesFilterData[fileName][reportId] = { reportName, filterData };
    },
    setSelectAllColumns: (state, action) => {
      state.filterData.selectAllColumns = action.payload;
      if (action.payload) {
        state.filterData.columnFilter = state.filterOptions.columns;
      } else {
        // state.filterData.columnFilter = [];
      }
    },
    clearFilters: (state, action) => {
      // Preserve existing columnFilter
      const existingColumnFilter = state.filterData.columnFilter;
      const existingFrozenColumns = state.filterData.frozenColumns;
      const existingSelectAllColumns = state.filterData.selectAllColumns;

      // Reset filterData but keep columnFilter
      state.filterData = {
        ...initialState.filterData,
        columnFilter: existingColumnFilter,
        frozenColumns: existingFrozenColumns,
        selectAllColumns: existingSelectAllColumns,
      };

      const fileName = action.payload.fileName;
      const reportName = action.payload.reportName;
      const reportId = action.payload.reportId;

      if (reportId) {
        // Preserve existing aggregatedValuesHistory if it exists
        const existingHistory =
          state.tablesFilterData[fileName]?.[reportId]
            ?.aggregatedValuesHistory || [];

        // Get existing report filterData
        const existingReportFilterData =
          state.tablesFilterData[fileName]?.[reportId]?.filterData;

        state.tablesFilterData = {
          ...state.tablesFilterData,
          [fileName]: {
            ...(state.tablesFilterData[fileName] || {}),
            [reportId]: {
              reportName,
              filterData: {
                ...initialState.filterData,
                columnFilter: existingReportFilterData?.columnFilter || [],
                frozenColumns: existingReportFilterData?.frozenColumns || [],
                selectAllColumns:
                  existingReportFilterData?.selectAllColumns || true,
              },
              aggregatedValuesHistory: existingHistory,
            },
          },
        };
      }
    },

    setBYORData: (state, action) => {
      state.BYORData = action.payload;
    },

    setBYORConfig: (state, action) => {
      state.BYORConfig = action.payload;
    },

    updateBYORGroupByColumns: (state, action) => {
      state.BYORData.groupByColumns = action.payload;
    },

    updateBYORAggregationColumns: (state, action) => {
      state.BYORData.aggregationColumns = action.payload;
    },
    updateBYORFilterData: (state, action) => {
      state.BYORData.byorFilterData = action.payload;
    },

    updateBYORFilterConditions: (state, action) => {
      state.BYORData.filterConditions = action.payload;
    },

    addBYORFilterCondition: (state, action) => {
      state.BYORData.filterConditions.push(action.payload);
    },

    removeBYORFilterCondition: (state, action) => {
      const index = action.payload;
      state.BYORData.filterConditions = state.BYORData.filterConditions.filter(
        (_, i) => i !== index
      );
    },

    updateBYORFilterCondition: (state, action) => {
      const { index, condition } = action.payload;
      state.BYORData.filterConditions[index] = condition;
    },

    // Save BYOR configuration
    saveBYORConfig: (state, action) => {
      const { reportName, config } = action.payload;
  
      state.BYORConfig[reportName] = {
        ...config,
        timestamp: new Date().toISOString(),
      };
    },

    // Delete BYOR configuration
    deleteBYORConfig: (state, action) => {
      const reportName = action.payload;
      const updatedConfig = { ...state.BYORConfig };
      delete updatedConfig[reportName];
      state.BYORConfig = updatedConfig;
    },

    // Set BYOR configurations from external source (e.g., API)
    setBYORConfigurations: (state, action) => {
      state.BYORConfig = action.payload || {};
    },

    // Load a specific BYOR configuration into the current BYORData
    loadBYORConfig: (state, action) => {
      const reportName = action.payload;
      
      if (state.BYORConfig[reportName]) {
        const config = state.BYORConfig[reportName];
        state.BYORData = {
          groupByColumns: config.groupByColumns || [],
          aggregationColumns: config.aggregationColumns || {},
          filterConditions: config.filterConditions || [],
          byorFilterData: config.byorFilterData || {},
        };
      }
    },

    // Clear current BYOR data
    clearBYORData: (state) => {
      state.BYORData = {
        groupByColumns: [],
        aggregationColumns: {},
        filterConditions: [],
        byorFilterData: {},
      };
    },
    setSnOPDimensionsToFilter: (state, action) => {
      state.SnOPDimensionsToFilter = action.payload;
    },
    setSnOPDimensionsToFilterView1: (state, action) => {
      state.SnOPDimensionsToFilterView1 = action.payload;
    },
    setProductionPlanningDimensionsToFilter: (state, action) => {
      state.productionPlanningDimensionsToFilter = action.payload;
    },
    applyFilter: (state, action) => {
  const fileName = action.payload.fileName;
  const reportName = action.payload.reportName;
  const reportId = action.payload.reportId;
  const columnsOnly = action.payload.columnsOnly;
  const updateColumns = action.payload.updateColumns;

  console.log("▶️ Action Payload:", action.payload);
  console.log("▶️ Initial State.filterData:", JSON.parse(JSON.stringify(state.filterData)));
  console.log("▶️ Initial State.tablesFilterData:", JSON.parse(JSON.stringify(state.tablesFilterData)));
  console.log("▶️ Initial State.filterOptions:", updateColumns);

  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
  };

  const dimensionFilters = state.filterData.dimensionFilters;
  console.log("▶️ dimensionFilters before convert:", JSON.parse(JSON.stringify(dimensionFilters)));

  const updatedDimensionFilters = {};
  Object.keys(dimensionFilters).forEach((dimension) => {
    updatedDimensionFilters[convert(dimension)] = dimensionFilters[dimension];
  });

  console.log("▶️ updatedDimensionFilters after convert:", JSON.parse(JSON.stringify(updatedDimensionFilters)));

  state.filterData.dimensionFilters = updatedDimensionFilters;
  console.log("▶️ State.filterData after dimensionFilters update:", JSON.parse(JSON.stringify(state.filterData)));
  
  if (reportId) {
    const existingHistory =
      state.tablesFilterData[fileName]?.[reportId]?.aggregatedValuesHistory || [];

    const existingFilterData =
      state.tablesFilterData[fileName]?.[reportId]?.filterData || {
        dimensionFilters: {},
        frozenColumns: [],
        columnFilter: [],
        selectAllColumns: true,
      };

    console.log("▶️ existingHistory:", JSON.parse(JSON.stringify(existingHistory)));
    console.log("▶️ existingFilterData:", JSON.parse(JSON.stringify(existingFilterData)));

    state.tablesFilterData = {
      ...state.tablesFilterData,
      [fileName]: {
        ...(state.tablesFilterData[fileName] || {}),
        [reportId]: {
          reportName,
          filterData: !columnsOnly
            ? {
          ...state.filterData,
          columnFilter: updateColumns
            ? state.filterData.columnFilter
            : existingFilterData?.columnFilter,
        }
            : {
                ...existingFilterData,
                frozenColumns: state.filterData.frozenColumns,
              },
          aggregatedValuesHistory: existingHistory,
        },
      },
    };

    console.log("▶️ State.tablesFilterData after update:", JSON.parse(JSON.stringify(state.tablesFilterData)));
  }

  state.filterOpen = false;
  console.log("▶️ Final State:", JSON.parse(JSON.stringify(state)));
},

    setFilterOpen: (state, action) => {
      state.filterOpen = action.payload;
    },

    setSaveReportOpen: (state, action) => {
      state.saveReportOpen = action.payload;
    },
    setTablesFilterData: (state, action) => {
      state.tablesFilterData =
        action.payload !== undefined ? action.payload : {};
    },
    saveReport: (state, action) => {
      const fileName = action.payload.fileName;
      const reportName = action.payload.reportName;
      const reportId = uuidv4();
      state.tablesFilterData[fileName][reportId] = {
        reportName,
        filterData: state.tablesFilterData[fileName]["Default"].filterData,
      };
      // state.filterData = initialState.filterData;
      state.filterOpen = false;
      state.saveReportOpen = false;
    },
    updateFilterByPath: (state, action) => {
      const { path, value } = action.payload;
      const updateNestedByPath = (obj, path, value) => {
        const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
        const updateRecursively = (currentObj, keys) => {
          const [firstKey, ...remainingKeys] = keys;

          // Check if firstKey is a numeric index
          const index = Number(firstKey);
          if (!isNaN(index)) {
            // Handle array case
            if (remainingKeys.length === 0) {
              currentObj[index] = castValue(currentObj[index], value);
            } else {
              currentObj[index] = updateRecursively(
                currentObj[index],
                remainingKeys
              );
            }
          } else {
            // Handle object case
            if (remainingKeys.length === 0) {
              currentObj[firstKey] = castValue(currentObj[firstKey], value);
            } else {
              currentObj[firstKey] = updateRecursively(
                currentObj[firstKey],
                remainingKeys
              );
            }
          }
          return currentObj;
        };

        return updateRecursively(obj, pathParts);
      };

      const castValue = (existingValue, newValue) => {
        if (
          existingValue === null ||
          existingValue === undefined ||
          newValue === null
        ) {
          return newValue;
        }

        const typeOfExistingValue = typeof existingValue;
        switch (typeOfExistingValue) {
          case "number":
            return Number(newValue);
          case "boolean":
            return newValue === "true" || newValue === true;
          case "object":
            if (Array.isArray(existingValue)) {
              return Array.isArray(newValue) ? newValue : [newValue];
            }
            return typeof newValue === "object" ? newValue : {};
          case "string":
            return String(newValue);
          default:
            return newValue;
        }
      };

      state.filterData.dimensionFilters = updateNestedByPath(
        state.filterData.dimensionFilters,
        path,
        value
      );
    },

    clearCache(state) {
      state.dashboardData = initialState.dashboardData;
      state.executiveViewData = initialState.executiveViewData;
      state.demandForecastingData = initialState.demandForecastingData;
      state.inventoryOptimizationData = initialState.inventoryOptimizationData;
      state.priceOptimizationData = initialState.priceOptimizationData;
      state.dimensionFilterData = initialState.dimensionFilterData;
      state.elasticityDimensionFilterData = initialState.elasticityDimensionFilterData;
      state.currentDimension = initialState.currentDimension;
      state.forecastingPivotData = initialState.forecastingPivotData;
      state.forecastingDisagg = initialState.forecastingDisagg;
      state.experimentBasePath = initialState.experimentBasePath;

      state.currentValue = initialState.currentValue;
      state.currentStartDate = initialState.currentStartDate;

      state.currentEndDate = initialState.currentEndDate;
      state.dashboardLoading = initialState.dashboardLoading;
      state.reports = initialState.reports;
      state.reportToShow = initialState.reportToShow;

      state.inventoryOptimizationFilterData =
        initialState.inventoryOptimizationFilterData;
      state.InvCurrentDimension = initialState.InvCurrentDimension;
      state.InvCurrentValue = initialState.InvCurrentValue;
      state.PriceCurrentDimension = initialState.PriceCurrentDimension;
      state.PriceCurrentValue = initialState.PriceCurrentValue;

      state.priceOptimizationFilterData =
        initialState.priceOptimizationFilterData;
      state.InvPriceFilterData = initialState.InvPriceFilterData;
      state.supplyPlanFilterData = initialState.supplyPlanFilterData;
      state.InventoryMetricsData = initialState.InventoryMetricsData;

      state.filterData = initialState.filterData;
      state.filterOptions = initialState.filterOptions;
      state.tablesFilterData = initialState.tablesFilterData;
      state.rawSalesData = initialState.rawSalesData;
      state.priceMetricsData = initialState.priceMetricsData;
      state.showMLForecast = initialState.showMLForecast;
      state.showEnrichForecast = initialState.showEnrichForecast;
      state.showAdjustHistoricalData = initialState.showAdjustHistoricalData;
      state.SnOPDimensionsToFilter = initialState.SnOPDimensionsToFilter;
      state.SnOPDimensionsToFilterView1 =
        initialState.SnOPDimensionsToFilterView1;
      state.productionPlanningDimensionsToFilter =
        initialState.productionPlanningDimensionsToFilter;
      state.reportsTab = initialState.reportsTab;
      state.showRawActuals = initialState.showRawActuals;
      state.showOffsetForecast = initialState.showOffsetForecast;
      state.BYORData = initialState.BYORData;
      state.BYORConfig = initialState.BYORConfig;
      state.currentRLAgentEnrichmentSuggestion =
        initialState.currentRLAgentEnrichmentSuggestion;
      state.currentRLAgentEnrichmentRisk =
        initialState.currentRLAgentEnrichmentRisk;
      state.rlAgentEnrichmentSuggestions =
        initialState.rlAgentEnrichmentSuggestions;
      state.approvedRLAgentEnrichmentSuggestions =
        initialState.approvedRLAgentEnrichmentSuggestions;
      state.currentRLAgentEnrichmentDimension =
        initialState.currentRLAgentEnrichmentDimension;
      state.currentRLAgentEnrichmentValue =
        initialState.currentRLAgentEnrichmentValue;
      state.currentRLAgentEnrichmentKeys =
        initialState.currentRLAgentEnrichmentKeys;
      state.rlEnrichmentsGlobalEndDate =
        initialState.rlEnrichmentsGlobalEndDate;
      state.rlEnrichmentsGlobalStartDate =
        initialState.rlEnrichmentsGlobalStartDate;
      state.RiskColumn = initialState.RiskColumn;
      state.currentRLAgentEnrichmentSuggestionCardIndex =
        initialState.currentRLAgentEnrichmentSuggestionCardIndex;
      state.lastSyncedTime = initialState.lastSyncedTime;
    },
    setShowRawActuals: (state, action) => {
      state.showRawActuals = action.payload;
    },
    setLastSyncedTime: (state, action) => {
      state.lastSyncedTime = action.payload;
    },
    setShowOffsetForecast: (state, action) => {
      state.showOffsetForecast = action.payload;
    },
    setAggregatedValues: (state, action) => {
      const fileName = action.payload.fileName;
      const reportId = action.payload.reportId;
      const aggregatedValues = action.payload.aggregatedValues || {};
      const filterData = action.payload.filterData || {};

      if (
        reportId &&
        fileName &&
        state.tablesFilterData[fileName]?.[reportId]
      ) {
        const currentHistory =
          state.tablesFilterData[fileName][reportId].aggregatedValuesHistory ||
          [];

        const dimensionFilters = filterData.dimensionFilters || {};

        // Add new entry
        // Find if there's a matching entry in history
        const matchingEntryIndex = currentHistory.findIndex((entry) => {
          // Compare each dimension filter
          const entryFilters = entry.dimensionFilters || {};
          return Object.keys(dimensionFilters).every(
            (key) => dimensionFilters[key] === entryFilters[key]
          );
        });

        let newHistory;
        if (matchingEntryIndex >= 0) {
          // Update existing entry
          newHistory = [...currentHistory];
          newHistory[matchingEntryIndex] = {
            ...newHistory[matchingEntryIndex],
            aggregated_values: aggregatedValues,
            // timestamp: new Date().toISOString()
          };
        } else {
          // Add new entry
          newHistory = [
            ...currentHistory.filter(
              (entry) =>
                !Object.values(entry.aggregated_values || {}).some(
                  (value) => value === "-"
                )
            ),
            {
              dimensionFilters,
              aggregated_values: aggregatedValues,
              // timestamp: new Date().toISOString()
            },
          ];
        }

        state.tablesFilterData = {
          ...state.tablesFilterData,
          [fileName]: {
            ...state.tablesFilterData[fileName],
            [reportId]: {
              ...state.tablesFilterData[fileName][reportId],
              aggregatedValuesHistory: newHistory,
            },
          },
        };
      }
    },
    clearAggregatedValuesHistory: (state) => {
      // Create new object with same structure but clear aggregatedValuesHistory
      const clearedTablesFilterData = {};

      Object.keys(state.tablesFilterData).forEach((fileName) => {
        clearedTablesFilterData[fileName] = {};

        Object.keys(state.tablesFilterData[fileName]).forEach((reportId) => {
          clearedTablesFilterData[fileName][reportId] = {
            ...state.tablesFilterData[fileName][reportId],
            aggregatedValuesHistory: [],
          };
        });
      });

      state.tablesFilterData = clearedTablesFilterData;
    },
    setAutoCalculateSums: (state, action) => {
      state.autoCalculateSums = action.payload;
    },
  },
});

export const {
  setSelectedModel,
  clearChat,
  resetClearChat,
  setDashboardData,
  setExecutiveViewData,
  setDemandForecastingData,
  setInventoryOptimizationData,
  setPriceOptimizationData,
  setDimensionFilterData,
  setElasticityDimensionFilterData,
  setCurrentDimension,
  setCurrentValue,
  currentDimensionOptimize,
  setCurrentStartDate,
  setCurrentEndDate,
  setForecastingPivotData,
  setLoading,
  setError,
  setExperimentBasePath,
  clearCache,
  setDashboardLoading,
  setReports,
  setReportsTab,
  setReportToShow,
  setSubReportsTab,
  setCurrentInvDimension,
  setCurrentInvValue,
  setCurrentPriceDimension,
  setCurrentPriceValue,
  setInvPriceFilterData,
  setShowFutureActuals,
  setShowPredictionInterval,
  setInventoryMetricsData,
  setForecastingDisagg,
  updateFilterByPath,
  setFilterColumns,
  setFilterOptions,
  updateFilterDataDimension,
  setFrozenColumns,
  setSelectAllColumns,
  saveReport,
  applyFilter,
  clearFilters,
  setFilterOpen,
  setFilterData,
  setSaveReportOpen,
  setTablesFilterData,
  deleteCustomReport,
  setRawSalesData,
  setPriceMetricsData,
  setShowMLForecast,
  setShowEnrichForecast,
  setShowAdjustHistoricalData,
  setSnOPDimensionsToFilter,
  setSnOPDimensionsToFilterView1,
  setProductionPlanningDimensionsToFilter,
  setShowRawActuals,
  setShowOffsetForecast,
  setAggregatedValues,
  setAutoCalculateSums,
  clearAggregatedValuesHistory,
  setBYORData,
  updateBYORGroupByColumns,
  updateBYORAggregationColumns,
  updateBYORFilterConditions,
  updateBYORFilterData,
  addBYORFilterCondition,
  removeBYORFilterCondition,
  updateBYORFilterCondition,
  saveBYORConfig,
  setBYORConfig,
  deleteBYORConfig,
  setBYORConfigurations,
  loadBYORConfig,
  clearBYORData,
  setRLAgentEnrichmentSuggestions,
  setCurrentRLAgentEnrichmentRisk,
  setCurrentRLAgentEnrichmentSuggestion,
  setCurrentRLAgentEnrichmentDimension,
  setCurrentRLAgentEnrichmentValue,
  addCurrentRLAgentEnrichmentKey,
  removeCurrentRLAgentEnrichmentKey,
  updateRLAgentEnrichmentSuggestions,
  setRlEnrichmentsGlobalStartDate,
  setRlEnrichmentsGlobalEndDate,
  setApprovedRLAgentEnrichmentSuggestions,
  updateApprovedRLAgentEnrichmentSuggestions,
  setRiskColumn,
  setCurrentRLAgentEnrichmentSuggestionCardIndex,
  setSupplyPlanFilterData,
  setLastSyncedTime,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
