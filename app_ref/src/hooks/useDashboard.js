import { useSelector, useDispatch } from "react-redux";
import { loadDashboardData as loadDashboardDataCSV } from "../redux/actions/dashboardActions";
import { loadExecutiveViewData as loadExecutiveViewDataCSV } from "../redux/actions/dashboardActions";
import { loadRawSalesData as loadRawSalesDataCSV } from "../redux/actions/dashboardActions";
import { loadPriceMetricsData as loadPriceMetricsDataCSV } from "../redux/actions/dashboardActions";
import { loadInventoryMetricsData as loadInventoryMetricsDataCSV } from "../redux/actions/dashboardActions";
import { loadDemandForecastingData as loadDemandForecastingDataCSV } from "../redux/actions/dashboardActions";
import { loadInventoryOptimizationData as loadInventoryOptimizationDataCSV } from "../redux/actions/dashboardActions";
import { loadPriceOptimizationData as loadPriceOptimizationDataCSV } from "../redux/actions/dashboardActions";
import { loadDimensionFilterData as loadDimensionFilterDataCSV } from "../redux/actions/dashboardActions";
import { loadElasticityDimensionFilterData as loadElasticityDimensionFilterDataCSV } from "../redux/actions/dashboardActions";
import { loadInvPriceFilterData as loadInvPriceFilterDataCSV } from "../redux/actions/dashboardActions";
import { loadSupplyPlanFilterData as loadSupplyPlanFilterDataCSV } from "../redux/actions/dashboardActions";
import { setCurrentDimension as SetCurrentDimension } from "../redux/actions/dashboardActions";
import { setCurrentValue as SetCurrentValue } from "../redux/actions/dashboardActions";
import { setCurrentInvDimension as SetCurrentInvDimension } from "../redux/actions/dashboardActions";
import { setCurrentInvValue as SetCurrentInvValue } from "../redux/actions/dashboardActions";
import { setCurrentPriceDimension as SetCurrentPriceDimension } from "../redux/actions/dashboardActions";
import { setCurrentPriceValue as SetCurrentPriceValue } from "../redux/actions/dashboardActions";
import { setExperimentBasePath as SetExperimentBasePath } from "../redux/actions/dashboardActions";
import { setForecastingPivotData as SetForecastingPivotData } from "../redux/actions/dashboardActions";
import { setRLAgentEnrichmentSuggestions as SetRLAgentEnrichmentSuggestions } from "../redux/actions/dashboardActions";
import { setForecastingDisagg as SetForecastingDisagg } from "../redux/actions/dashboardActions";
import { setDashboardLoading as SetDashboardLoading } from "../redux/actions/dashboardActions";
import { loadReports as LoadReports } from "../redux/actions/dashboardActions";
import { setReportsTab as SetReportsTab } from "../redux/actions/dashboardActions";
import { setReportToShow as SetReportToShow } from "../redux/actions/dashboardActions";
import { setSubReportsTab as SetSubReportsTab } from "../redux/actions/dashboardActions";
import { loadTablesFilterData as LoadTablesFilterData } from "../redux/actions/dashboardActions";
import { setApprovedRLAgentEnrichmentSuggestions as SetApprovedRLAgentEnrichmentSuggestions } from "../redux/actions/dashboardActions";
import { setCurrentEndDate as SetCurrentEndDate } from "../redux/actions/dashboardActions";
import {
  setShowFutureActuals as SetShowFutureActuals,
  setTablesFilterData,
  setBYORData as setBYORDataAction,
  updateBYORGroupByColumns as updateBYORGroupByColumnsAction,
  updateBYORAggregationColumns as updateBYORAggregationColumnsAction,
  updateBYORFilterData as updateBYORFilterDataAction,
  updateBYORFilterConditions as updateBYORFilterConditionsAction,
  addBYORFilterCondition as addBYORFilterConditionAction,
  removeBYORFilterCondition as removeBYORFilterConditionAction,
  updateBYORFilterCondition as updateBYORFilterConditionAction,
  saveBYORConfig as saveBYORConfigAction,
  deleteBYORConfig as deleteBYORConfigAction,
  setBYORConfigurations as setBYORConfigurationsAction,
  loadBYORConfig as loadBYORConfigAction,
  clearBYORData as clearBYORDataAction,
  setCurrentRLAgentEnrichmentRisk as SetCurrentRLAgentEnrichmentRisk,
  setCurrentRLAgentEnrichmentSuggestion as SetCurrentRLAgentEnrichmentSuggestion,
  addCurrentRLAgentEnrichmentKey as AddCurrentRLAgentEnrichmentKey,
  removeCurrentRLAgentEnrichmentKey as RemoveCurrentRLAgentEnrichmentKey,
  updateRLAgentEnrichmentSuggestions as UpdateRLAgentEnrichmentSuggestions,
  updateApprovedRLAgentEnrichmentSuggestions as UpdateApprovedRLAgentEnrichmentSuggestions,
  setRlEnrichmentsGlobalStartDate as SetRlEnrichmentsGlobalStartDate,
  setRlEnrichmentsGlobalEndDate as SetRlEnrichmentsGlobalEndDate,
  setRiskColumn as SetRiskColumn,
  setCurrentRLAgentEnrichmentSuggestionCardIndex as SetCurrentRLAgentEnrichmentSuggestionCardIndex,
  setLastSyncedTime as SetLastSyncedTime,
} from "../redux/slices/dashboardSlice";
import { setShowMLForecast as SetShowMLForecast } from "../redux/slices/dashboardSlice";
import { setShowEnrichForecast as SetShowEnrichForecast } from "../redux/slices/dashboardSlice";
import { setShowAdjustHistoricalData as SetShowAdjustHistoricalData } from "../redux/slices/dashboardSlice";
import { setShowPredictionInterval as SetShowPredictionInterval } from "../redux/slices/dashboardSlice";
import { setFilterOptions as SetFilterOptions } from "../redux/slices/dashboardSlice";
import { updateFilterDataDimension as UpdateFilterDataDimension } from "../redux/slices/dashboardSlice";

import { setFilterColumns as SetFilterColumns } from "../redux/slices/dashboardSlice";
import { setFrozenColumns as SetFrozenColumns } from "../redux/slices/dashboardSlice";
import { setCurrentRLAgentEnrichmentDimension as SetCurrentRLAgentEnrichmentDimension } from "../redux/slices/dashboardSlice";
import { setCurrentRLAgentEnrichmentValue as SetCurrentRLAgentEnrichmentValue } from "../redux/slices/dashboardSlice";

import { setFilterData as SetFilterData } from "../redux/slices/dashboardSlice";
import { setSelectAllColumns as SetSelectAllColumns } from "../redux/slices/dashboardSlice";
import { applyFilter as ApplyFilter } from "../redux/slices/dashboardSlice";
import { clearFilters as ClearFilters } from "../redux/slices/dashboardSlice";
import { saveReport as SaveReport } from "../redux/slices/dashboardSlice";
import { updateFilterByPath as UpdateFilterByPath } from "../redux/slices/dashboardSlice";
import { setFilterOpen as SetFilterOpen } from "../redux/slices/dashboardSlice";
import { setSaveReportOpen as SetSaveReportOpen } from "../redux/slices/dashboardSlice";
import { deleteCustomReport as DeleteCustomReport } from "../redux/slices/dashboardSlice";
import { setSnOPDimensionsToFilter as SetSnOPDimensionsToFilter } from "../redux/slices/dashboardSlice";
import { setSnOPDimensionsToFilterView1 as SetSnOPDimensionsToFilterView1 } from "../redux/slices/dashboardSlice";
import { setProductionPlanningDimensionsToFilter as SetProductionPlanningDimensionsToFilter } from "../redux/slices/dashboardSlice";
import { setCurrentStartDate as SetCurrentStartDate } from "../redux/actions/dashboardActions";
import { downloadFileUsingPreSignedURL as DownloadFileUsingPreSignedURL } from "../redux/actions/dashboardActions";
import { clearCache } from "../redux/slices/dashboardSlice";
import { selectModel } from "../redux/actions/dashboardActions";
import useExperiment from "./useExperiment";
import useExperimentAuxillary from "./useExperimentsAuxillary";
import useAuth from "./useAuth";
import { SettingsRoundedIcon } from "@mui/icons-material/SettingsRounded";
import { setShowRawActuals as SetShowRawActuals } from "../redux/slices/dashboardSlice";
import { setShowOffsetForecast as SetShowOffsetForecast } from "../redux/slices/dashboardSlice";
import { setAggregatedValues as SetAggregatedValues } from "../redux/slices/dashboardSlice";
import { setAutoCalculateSums as SetAutoCalculateSums } from "../redux/slices/dashboardSlice";
import { clearAggregatedValuesHistory as ClearAggregatedValuesHistory } from "../redux/slices/dashboardSlice";
import useConfig from "./useConfig";
import { useEffect, useState } from "react";
import { uploadCSVToS3, uploadJsonToS3 } from "../utils/s3Utils";
import { transformRLEnrichmentSuggestionsToCSV } from "../utils/Agent Utils/transformRLEnrichmentSuggestionsToCSV";
import { clearQueryEngineCache } from "../utils/queryEngine";
import { useParams } from "react-router-dom";
import { update } from "lodash";
const reverseShortFileNameDict = {
  [`scenario_planning/K_best/forecast/forecast_data_pivot`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Forecasting Pivot",
  [`scenario_planning/K_best/forecast/forecast_disaggregated.csv`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Forecasting Pivot Disaggregated",
  [`scenario_planning/K_best/inventory_plan/soh_data`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "DOI Details",
  [`scenario_planning/K_best/scenario_plan/scenario_planner_data`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Elasticity Detailed View", // p
  [`scenario_planning/K_best/post_model_demand_pattern/post_model_metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Metrics Deep dive", // dimension: "feature", value: cd
  [`scenario_planning/K_best/forecast/forecast_data`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Forecast",
  [`scenario_planning/K_best/forecast/forecast_data_pivot`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Forecast Pivot",
  [`scenario_planning/K_best/forecast/forecast_prediction_interval`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Prediction Interval",
  [`scenario_planning/K_best/forecast/forecast_disaggregated`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Disaggregated Forecast",
  [`scenario_planning/K_best/forecast/forecast_distribution`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Forecast Distribution",
  [`scenario_planning/K_best/inventory_plan/soh_data`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "DOI Detailed View",
  [`scenario_planning/K_best/inventory_plan/reorder_table`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Inventory Reorder Plan",
  [`scenario_planning/K_best/inventory_plan/stock_transfer_df`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Stock Transfer",
  [`scenario_planning/K_best/inventory_plan/potential_stock_wastage`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Potential Stock Wastage",
  [`etl_data/202110/inv_data`.split(".csv")[0].split("/").join("_")]:
    "Raw Inventory",
  [`scenario_planning/K_best/forecast/soh_data_pivot`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "SOH Pivot",
  [`scenario_planning/K_best/inventory_plan/bill_of_material_inv_details`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Bill Of Materials",
  [`scenario_planning/K_best/inventory_plan/bom_forecast`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Bill Of Materials Time Forecast",
  [`scenario_planning/K_best/scenario_plan/scenario_planner_data`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Price Optimization",
  [`stacking/future/K_best/coeffs`.split(".csv")[0].split("/").join("_")]:
    "Driver Elasticity",
  [`stacking/future/K_best/metric`.split(".csv")[0].split("/").join("_")]:
    "Model Metrics",
  [`feature_score/feature_score`.split(".csv")[0].split("/").join("_")]:
    "Feature Importance",
  [`scenario_planning/K_best/forecast/future_data_metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Future Granular Metrics",
  [`scenario_planning/K_best/forecast/time_metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Future Time Metrics",
  [`scenario_planning/K_best/forecast/demand_alignment_report`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Demand Alignment Report",
  [`scenario_planning/K_best/forecast/demand_alignment_report_value`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Demand Alignment Value Report",
  [`scenario_planning/K_best/forecast/demand_alignment_report_view1`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Demand Alignment View1 Report",
  [`scenario_planning/K_best/forecast/demand_alignment_report_value_view1`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Demand Alignment Value View1 Report",
  [`scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Supply Plan",
  [`scenario_planning/K_best/post_model_demand_pattern/production_plan_forecast`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Production Plan",
  [`scenario_planning/K_best/forecast/forecast_data_value_pivot`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Forecast Value Pivot",
  [`stacking/future/K_best/metric`.split(".csv")[0].split("/").join("_")]:
    "Overall Metrics",
  [`training/cluster/future/Xgboost/metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Xgboost Metrics",
  [`training/cluster/future/Lgbm/metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "LGBM Metrics",
  [`training/cluster/future/RandomForest/metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Random Forest Metrics",
  [`training/cluster/future/Xgblinear/metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "Xgblinear Metrics",
  [`training/cluster/future/MLP/metrics`.split(".csv")[0].split("/").join("_")]:
    "MLP Metrics",
  [`training/cluster/future/LSTM/metrics`
    .split(".csv")[0]
    .split("/")
    .join("_")]: "LSTM Metrics",
  [`training/cluster/future/GRU/metrics`.split(".csv")[0].split("/").join("_")]:
    "GRU Metrics",
};
const useDashboard = () => {
  const dispatch = useDispatch();
  const dashboardData = useSelector((state) => state.dashboard.dashboardData);
  const executiveViewData = useSelector(
    (state) => state.dashboard.executiveViewData
  );
  const demandForecastingData = useSelector(
    (state) => state.dashboard.demandForecastingData
  );
  const inventoryOptimizationData = useSelector(
    (state) => state.dashboard.inventoryOptimizationData
  );
  const inventoryOptimizationFilterData = useSelector(
    (state) => state.dashboard.inventoryOptimizationFilterData
  );

  const priceOptimizationFilterData = useSelector(
    (state) => state.dashboard.priceOptimizationFilterData
  );

  const priceOptimizationData = useSelector(
    (state) => state.dashboard.priceOptimizationData
  );
  const dimensionFilterData = useSelector(
    (state) => state.dashboard.dimensionFilterData
  );
  const elasticityDimensionFilterData = useSelector(
    (state) => state.dashboard.elasticityDimensionFilterData
  );
  const SnOPDimensionsToFilter = useSelector(
    (state) => state.dashboard.SnOPDimensionsToFilter
  );

  const SnOPDimensionsToFilterView1 = useSelector(
    (state) => state.dashboard.SnOPDimensionsToFilterView1
  );
  const productionPlanningDimensionsToFilter = useSelector(
    (state) => state.dashboard.productionPlanningDimensionsToFilter
  );
  const currentDimension = useSelector(
    (state) => state.dashboard.currentDimension
  );

  const currentDimensionOptimize = useSelector(
    (state) => state.dashboard.currentDimensionOptimize
  );
  const currentValue = useSelector((state) => state.dashboard.currentValue);

  const InvCurrentValue = useSelector(
    (state) => state.dashboard.InvCurrentValue
  );
  const InvCurrentDimension = useSelector(
    (state) => state.dashboard.InvCurrentDimension
  );
  const PriceCurrentDimension = useSelector(
    (state) => state.dashboard.PriceCurrentDimension
  );
  const PriceCurrentValue = useSelector(
    (state) => state.dashboard.PriceCurrentValue
  );
  const currentStartDate = useSelector(
    (state) => state.dashboard.currentStartDate
  );
  const currentEndDate = useSelector((state) => state.dashboard.currentEndDate);
  const forecastingPivotData = useSelector(
    (state) => state.dashboard.forecastingPivotData
  );
  const forecastingDisagg = useSelector(
    (state) => state.dashboard.forecastingDisagg
  );
  const showFutureActuals = useSelector(
    (state) => state.dashboard.showFutureActuals
  );
  const showMLForecast = useSelector((state) => state.dashboard.showMLForecast);
  const showEnrichForecast = useSelector(
    (state) => state.dashboard.showEnrichForecast
  );
  const showAdjustHistoricalData = useSelector(
    (state) => state.dashboard.showAdjustHistoricalData
  );
  const showPredictionInterval = useSelector(
    (state) => state.dashboard.showPredictionInterval
  );
  const experimentBasePath = useSelector(
    (state) => state.dashboard.experimentBasePath
  );
  const dashboardLoading = useSelector(
    (state) => state.dashboard.dashboardLoading
  );
  const rlAgentEnrichmentSuggestions = useSelector(
    (state) => state.dashboard.rlAgentEnrichmentSuggestions
  );
  const currentRLAgentEnrichmentRisk = useSelector(
    (state) => state.dashboard.currentRLAgentEnrichmentRisk
  );

  const currentRLAgentEnrichmentSuggestion = useSelector(
    (state) => state.dashboard.currentRLAgentEnrichmentSuggestion
  );
  const currentRLAgentEnrichmentSuggestionCardIndex = useSelector(
    (state) => state.dashboard.currentRLAgentEnrichmentSuggestionCardIndex
  );
  const approvedRLAgentEnrichmentSuggestions = useSelector(
    (state) => state.dashboard.approvedRLAgentEnrichmentSuggestions
  );
  const RiskColumn = useSelector((state) => state.dashboard.RiskColumn);

  const BYORData = useSelector((state) => state.dashboard.BYORData);
  const BYORConfig = useSelector((state) => state.dashboard.BYORConfig);
  const reports = useSelector((state) => state.dashboard.reports);
  const filterOpen = useSelector((state) => state.dashboard.filterOpen);
  const saveReportOpen = useSelector((state) => state.dashboard.saveReportOpen);
  const reportsTab = useSelector((state) => state.dashboard.reportsTab);
  const subReportsTab = useSelector((state) => state.dashboard.subReportsTab);
  const reportToShow = useSelector((state) => state.dashboard.reportToShow);
  const InvPriceFilterData = useSelector(
    (state) => state.dashboard.InvPriceFilterData
  );
  const supplyPlanFilterData = useSelector(
    (state) => state.dashboard.supplyPlanFilterData
  );
  const InventoryMetricsData = useSelector(
    (state) => state.dashboard.InventoryMetricsData
  );
  const filterOptions = useSelector((state) => state.dashboard.filterOptions);
  const filterData = useSelector((state) => state.dashboard.filterData);
  const tablesFilterData = useSelector(
    (state) => state.dashboard.tablesFilterData
  );
  const rawSalesData = useSelector((state) => state.dashboard.rawSalesData);
  const priceMetricsData = useSelector(
    (state) => state.dashboard.priceMetricsData
  );
  const { userInfo, currentCompany } = useAuth();
  const selectedModel = useSelector((state) => state.dashboard.selectedModel);
  const userID = userInfo.userID;
  const showRawActuals = useSelector((state) => state.dashboard.showRawActuals);
  const showOffsetForecast = useSelector(
    (state) => state.dashboard.showOffsetForecast
  );
  const autoCalculateSums = useSelector(
    (state) => state.dashboard.autoCalculateSums
  );

  const currentRLAgentEnrichmentDimension = useSelector(
    (state) => state.dashboard.currentRLAgentEnrichmentDimension
  );
  const currentRLAgentEnrichmentValue = useSelector(
    (state) => state.dashboard.currentRLAgentEnrichmentValue
  );
  const currentRLAgentEnrichmentKeys = useSelector(
    (state) => state.dashboard.currentRLAgentEnrichmentKeys
  );
  const rlEnrichmentsGlobalStartDate = useSelector(
    (state) => state.dashboard.rlEnrichmentsGlobalStartDate
  );
  const rlEnrichmentsGlobalEndDate = useSelector(
    (state) => state.dashboard.rlEnrichmentsGlobalEndDate
  );
  const lastSyncedTime = useSelector((state) => state.dashboard.lastSyncedTime);

  const loadReports = async (module_name, basePath, havePrice) => {
    return dispatch(
      LoadReports({
        basePath,
        module_name,
        userID,
        havePrice,
      })
    )
      .then((loadedReports) => {
        console.log("Reports Loaded:", loadedReports);

        return loadedReports; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading reports:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const clearAggregatedValuesHistory = async () => {
    return dispatch(ClearAggregatedValuesHistory());
  };
  const setRiskColumn = async (riskColumn) => {
    return dispatch(SetRiskColumn(riskColumn));
  };
  const setReportsTab = async (reportsTab) => {
    return dispatch(SetReportsTab(reportsTab));
  };
  const setSnOPDimensionsToFilter = async (dimensions) => {
    return dispatch(SetSnOPDimensionsToFilter(dimensions));
  };
  const setSnOPDimensionsToFilterView1 = async (dimensions) => {
    return dispatch(SetSnOPDimensionsToFilterView1(dimensions));
  };
  const setProductionPlanningDimensionsToFilter = async (dimensions) => {
    return dispatch(SetProductionPlanningDimensionsToFilter(dimensions));
  };
  const setShowFutureActuals = async (showFutureActuals) => {
    return dispatch(SetShowFutureActuals(showFutureActuals));
  };
  const setShowMLForecast = async (showMLForecast) => {
    return dispatch(SetShowMLForecast(showMLForecast));
  };
  const setShowEnrichForecast = async (showEnrichForecast) => {
    return dispatch(SetShowEnrichForecast(showEnrichForecast));
  };
  const setShowAdjustHistoricalData = async (showAdjustHistoricalData) => {
    return dispatch(SetShowAdjustHistoricalData(showAdjustHistoricalData));
  };
  const setShowPredictionInterval = async (showPredictionInterval) => {
    return dispatch(SetShowPredictionInterval(showPredictionInterval));
  };
  const setSubReportsTab = async (subReportsTab) => {
    return dispatch(SetSubReportsTab(subReportsTab));
  };
  const setReportToShow = async (report) => {
    return dispatch(SetReportToShow(report));
  };
  const addCurrentRLAgentEnrichmentKey = async (key) => {
    return dispatch(AddCurrentRLAgentEnrichmentKey(key));
  };
  const removeCurrentRLAgentEnrichmentKey = async (key) => {
    return dispatch(RemoveCurrentRLAgentEnrichmentKey(key));
  };

  const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
  const setLastSyncedTime = async (time) => {
    return dispatch(SetLastSyncedTime(time));
  };

  const updateRLAgentEnrichmentSuggestions = async (
    new_suggestion,
    index,
    experiment_id
  ) => {
    // Update the suggestions array
    const updatedSuggestions = rlAgentEnrichmentSuggestions.map(
      (og_suggestion, i) => (i === index ? new_suggestion : og_suggestion)
    );

    
   
    // Dispatch the update to the suggestions list
    await dispatch(UpdateRLAgentEnrichmentSuggestions(updatedSuggestions));
    // Handle approvedRLAgentEnrichmentSuggestions: update if exists, else add
    let updatedApprovedSuggestions = [];

    const newApprovedSuggestion = {
      Dimension: new_suggestion.Dimension,
      Value: new_suggestion.Value,
      "Start Date": new_suggestion["Start Date"],
      "End Date": new_suggestion["End Date"],
      "Current Accuracy": new_suggestion["Current Accuracy"],
      Error_Contribution: new_suggestion["Error_Contribution"],
      "Reviewed By": new_suggestion["Reviewed By"],
      Reviewed: new_suggestion["Reviewed"],
      "Approved Enrichment": new_suggestion["Approved Enrichment"],
      Risk: new_suggestion.Risk,
      Comment: new_suggestion.Comment,
    };

    console.log(new_suggestion , newApprovedSuggestion , updatedApprovedSuggestions , index);

    if (Array.isArray(approvedRLAgentEnrichmentSuggestions)) {
      const foundIndex = approvedRLAgentEnrichmentSuggestions.findIndex(
        (suggestion) =>
          suggestion.Dimension === newApprovedSuggestion.Dimension &&
          suggestion.Value === newApprovedSuggestion.Value
      );
      if (foundIndex !== -1) {
        // Update the existing suggestion
        updatedApprovedSuggestions = approvedRLAgentEnrichmentSuggestions.map(
          (sugg, i) => (i === foundIndex ? newApprovedSuggestion : sugg)
        );
      } else {
        // Add the new suggestion
        updatedApprovedSuggestions = [
          ...approvedRLAgentEnrichmentSuggestions,
          newApprovedSuggestion,
        ];
      }
    } else {
      // If not an array, initialize with the new suggestion
      updatedApprovedSuggestions = [newApprovedSuggestion];
    }

    
    //Convert this to csv
    //and upload it to the path we want
    updatedApprovedSuggestions = updatedApprovedSuggestions.filter(
      (sugg) =>
        sugg.Reviewed &&
        sugg["Approved Enrichment"] &&
        sugg["Approved Enrichment"]["Rank"] !== null &&
        sugg.Reviewed !== "false"

    );
    console.log(updatedApprovedSuggestions);
    
    const csv = transformRLEnrichmentSuggestionsToCSV(
      updatedApprovedSuggestions
    );

    console.log(csv)
    const csvPath = `${experimentBasePath}/rl_agent/approved_enrichments.csv`;
    await uploadCSVToS3(csvPath, csv);
    await clearQueryEngineCache(experiment_id);
    await dispatch(
      UpdateApprovedRLAgentEnrichmentSuggestions(updatedApprovedSuggestions)
    );
  };

  const clearDashboardCache = () => {
    console.log("The dashboard cache is cleared");
    return dispatch(clearCache());
  };

  const setFilterOptions = async (
    filterOptions,
    fileName,
    reportId,
    silent = false
  ) => {
    return dispatch(
      SetFilterOptions({ filterOptions, fileName, reportId, silent })
    );
  };

  const updateFilterDataDimension = async (dimensionData) => {
    return dispatch(UpdateFilterDataDimension(dimensionData));
  };
  const setFilterData = async (filterData, reportName, fileName, reportId) => {
    return dispatch(
      SetFilterData({ filterData, fileName, reportId, reportName })
    );
  };
  const setFilterColumns = async (columnFilter) => {
    return dispatch(SetFilterColumns(columnFilter));
  };
  const setFrozenColumns = async (frozenColumns) => {
    return dispatch(SetFrozenColumns(frozenColumns));
  };
  const setSelectAllColumns = async (selectAllColumns) => {
    return dispatch(SetSelectAllColumns(selectAllColumns));
  };
  const setFilterOpen = async (filterOpen) => {
    return dispatch(SetFilterOpen(filterOpen));
  };
  const setCurrentRLAgentEnrichmentDimension = async (dimension) => {
    return dispatch(SetCurrentRLAgentEnrichmentDimension(dimension));
  };
  const setCurrentRLAgentEnrichmentValue = async (value) => {
    return dispatch(SetCurrentRLAgentEnrichmentValue(value));
  };
  const setSaveReportOpen = async (saveReportOpen) => {
    return dispatch(SetSaveReportOpen(saveReportOpen));
  };
  const applyFilter = async (
    fileName,
    reportName,
    reportId,
    columnsOnly = false,
    updateColumns = true
  ) => {
    return dispatch(
      ApplyFilter({ fileName, reportName, reportId, columnsOnly, updateColumns })
    );
  };
  const deleteCustomReport = async (fileName, reportId) => {
    return dispatch(DeleteCustomReport({ fileName, reportId }));
  };
  const clearFilters = async (fileName, reportName, reportId) => {
    return dispatch(ClearFilters({ fileName, reportName, reportId }));
  };
  const saveReport = async (fileName, reportName) => {
    return dispatch(SaveReport({ fileName, reportName }));
  };
  const updateFilterByPath = async (path, value) => {
    return dispatch(UpdateFilterByPath({ path, value }));
  };

  const getFilterDataByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = filterData.dimensionFilters;

    for (let i = 0; i < pathParts.length; i++) {
      const key = pathParts[i];

      // Check if key is a numeric index
      const index = Number(key);
      if (!isNaN(index)) {
        // Handle array case
        if (!Array.isArray(current) || index >= current.length) {
          console.log(path, "not found!!!!!!!!!!!!!!!!!", "The index:=>>", key);
          return null;
        }
        current = current[index];
      } else {
        // Handle object case
        if (current[key] === undefined) {
          console.log(path, "not found!!!!!!!!!!!!!!!!!", "The key:=>>", key);
          return null;
        }
        current = current[key];
      }
    }

    // console.log("default value at :", path, "is ---> ", current);
    return current;
  };

  const setBYORData = (data) => dispatch(setBYORDataAction(data));
  const updateBYORGroupByColumns = (columns) =>
    dispatch(updateBYORGroupByColumnsAction(columns));
  const updateBYORAggregationColumns = (columns) =>
    dispatch(updateBYORAggregationColumnsAction(columns));

  const updateBYORFilterData = (columns) =>
    dispatch(updateBYORFilterDataAction(columns));
  const updateBYORFilterConditions = (conditions) =>
    dispatch(updateBYORFilterConditionsAction(conditions));
  const addBYORFilterCondition = (condition) =>
    dispatch(addBYORFilterConditionAction(condition));
  const removeBYORFilterCondition = (index) =>
    dispatch(removeBYORFilterConditionAction(index));
  const updateBYORFilterCondition = (index, condition) =>
    dispatch(updateBYORFilterConditionAction({ index, condition }));
  const saveBYORConfig = (reportName, config) =>
    dispatch(saveBYORConfigAction({ reportName, config }));
  const deleteBYORConfig = (reportName) =>
    dispatch(deleteBYORConfigAction(reportName));
  const setBYORConfigurations = (configs) =>
    dispatch(setBYORConfigurationsAction(configs));
  const loadBYORConfig = (reportName) =>
    dispatch(loadBYORConfigAction(reportName));
  const clearBYORData = () => dispatch(clearBYORDataAction());

  const loadDashboardData = async (path) => {
    return dispatch(
      loadDashboardDataCSV({
        path,
        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv",
        userID,
      })
    )
      .then((loadedData) => {
        console.log("Dashboard Data loaded:", loadedData);
        console.log("Loaded the dashboard data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const loadTablesFilterData = async (path, userID) => {
    return dispatch(
      LoadTablesFilterData({
        path,
        userID,
      })
    )
      .then((tablesFilterData) => {
        console.log(
          "Table Filter Data loaded at hook level:",
          tablesFilterData
        );
        console.log("Path at hook level:", path);

        const keyToCheck = path.split("/custom_report")[0].split("/").join("_");
        console.log("Key to check at hook level:", keyToCheck);
        const filteredTablesFilterData = Object.entries(
          tablesFilterData || {}
        ).reduce((acc, [key, value]) => {
          if (key.includes(keyToCheck)) {
            acc[key] = value;
          }
          return acc;
        }, {});

        console.log("Filtered tables filter data:", filteredTablesFilterData);
        tablesFilterData = filteredTablesFilterData;
        return filteredTablesFilterData || {}; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const loadExecutiveViewData = async (
    path,
    filterData,
    userID,
    hasParquetFiles
  ) => {
    return dispatch(
      loadExecutiveViewDataCSV({
        path,

        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv",
        filterData,
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log("Executive View Data loaded:", loadedData);
        console.log("Loaded the executive data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const loadRawSalesData = async (
    path,
    filterData,
    userID,
    hasParquetFiles
  ) => {
    return dispatch(
      loadRawSalesDataCSV({
        path,
        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv",
        filterData,
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log("Raw Sales View Data loaded:", loadedData);
        return loadedData; // Pass the loaded data downstream if needed
      })

      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const loadPriceMetricsData = async (
    path,
    filterData,
    userID,
    hasParquetFiles
  ) => {
    return dispatch(
      loadPriceMetricsDataCSV({
        path,

        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv",
        filterData,
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log("Price Metrics View Data loaded:", loadedData);
        return loadedData; // Pass the loaded data downstream if needed
      })

      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const loadInventoryMetricsData = async (path, filterData, userID) => {
    return dispatch(
      loadInventoryMetricsDataCSV({
        path,
        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/inventory_metrics.csv",
        filterData,
        userID,
      })
    )
      .then((loadedData) => {
        console.log("Inventory Metrics Data loaded:", loadedData);
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const loadDimensionFilterData = async (path, hasParquetFiles) => {
    return dispatch(
      loadDimensionFilterDataCSV({
        path,
        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv",
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log(
          "dimension filtered Forecasting Forecasting Data loaded:",
          loadedData
        );
        console.log("dimension filtered  data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const loadElasticityDimensionFilterData = async (path, hasParquetFiles,priceColumn) => {
    console.log("priceColumn",priceColumn);
    return dispatch(
      loadElasticityDimensionFilterDataCSV({
        path,
        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv",
        userID,
        hasParquetFiles,
        priceColumn,
      })
    )
      .then((loadedData) => {
        console.log("elasticity dimension filtered Data loaded:", loadedData);
        console.log(
          "elasticity dimension filtered data from useDashboard Level"
        );
        return loadedData;
      })
      .catch((error) => {
        console.error("Error loading elasticity dimension filter data:", error);
        throw error;
      });
  };
  const loadInvPriceFilterData = async (path, hasParquetFiles) => {
    return dispatch(
      loadInvPriceFilterDataCSV({
        path,
        userID,
      })
    )
      .then((loadedData) => {
        console.log("Inv Price filtered  Data loaded:", loadedData);
        console.log("Inv Price filtered  data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const loadSupplyPlanFilterData = async (path, hasParquetFiles) => {
    return dispatch(
      loadSupplyPlanFilterDataCSV({
        path,
        userID,
      })
    )
      .then((loadedData) => {
        console.log("Inv Price filtered  Data loaded:", loadedData);
        console.log("Inv Price filtered  data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const loadDemandForecastingData = async (
    path,
    filterData,
    hasParquetFiles
  ) => {
    return dispatch(
      loadDemandForecastingDataCSV({
        path,
        fallBackPath: `accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
        userID,
        filterData,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log("Demand Forecasting Forecasting Data loaded:", loadedData);
        console.log(
          "Loaded the Demand Forecasting data from useDashboard Level"
        );
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const removeDuplicates = (arr) => {
    return [...new Set(arr)].filter((item) => item);
  };
  const loadInventoryOptimizationData = async (
    path,
    experiment_config,
    filterData,
    userID,
    hasParquetFiles
  ) => {
    console.log("exp_config", experiment_config);
    const dimensionColumns = removeDuplicates([
      ...experiment_config.scenario_plan.post_model_demand_pattern.dimensions,
      ...experiment_config.data.ts_id_columns,
    ]);
    return dispatch(
      loadInventoryOptimizationDataCSV({
        path,
        dimensionColumns,
        filterData,
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log("Inventory optimization data  loaded:", loadedData);
        console.log("Inventory optimization data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const loadPriceOptimizationData = async (
    path,
    experiment_config,
    filterData,
    userID,
    hasParquetFiles
  ) => {
    console.log("exp_config price", experiment_config);
    const dimensionColumns = removeDuplicates([
      ...experiment_config.scenario_plan.post_model_demand_pattern.dimensions,
      ...experiment_config.data.ts_id_columns,
    ]);
    console.log("Price dimensionColumns", dimensionColumns);
    return dispatch(
      loadPriceOptimizationDataCSV({
        path,
        fallBackPath:
          "accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv",
        dimensionColumns,
        filterData,
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log(
          `[${new Date().toLocaleTimeString()}] : entered  loadprice`
        );

        console.log("Price optimization data  loaded:", loadedData);
        console.log("Price optimization data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const setForecastingPivotData = async (
    path,
    filterData,
    userID,
    hasParquetFiles
  ) => {
    return dispatch(
      SetForecastingPivotData({
        path,
        fallBackPath: `accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
        filterData,
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log("forecastingPivotData data  loaded:", loadedData);
        console.log("forecastingPivotData data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const setRLAgentEnrichmentSuggestions = async (
    path,
    filterData,
    hasParquetFiles,
    approvedRLAgentEnrichmentSuggestions,
    forecastDeviation,
    batchNo,
    enableRLAgent = false
  ) => {
    return dispatch(
      SetRLAgentEnrichmentSuggestions({
        path,
        filterData,
        hasParquetFiles,
        approvedRLAgentEnrichmentSuggestions,
        forecastDeviation,
        batchNo,
        enableRLAgent
      })
    )
      .then((loadedData) => {
        console.log("RLAgentEnrichmentSuggestions data  loaded:", loadedData);
        console.log(
          "RLAgentEnrichmentSuggestions data from useDashboard Level"
        );
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const setApprovedRLAgentEnrichmentSuggestions = async (
    path,
    filterData,
    hasParquetFiles
  ) => {
    return dispatch(
      SetApprovedRLAgentEnrichmentSuggestions({
        path,
        filterData,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log(
          "Approved RLAgentEnrichmentSuggestions data  loaded:",
          loadedData
        );
        console.log(
          "Approved RLAgentEnrichmentSuggestions data from useDashboard Level"
        );
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const setCurrentRLAgentEnrichmentRisk = async (risk) => {
    return dispatch(SetCurrentRLAgentEnrichmentRisk(risk));
  };

  const setForecastingDisagg = async (
    path,
    filterData,
    userID,
    hasParquetFiles
  ) => {
    return dispatch(
      SetForecastingDisagg({
        path,
        fallBackPath: `accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
        filterData,
        userID,
        hasParquetFiles,
      })
    )
      .then((loadedData) => {
        console.log("forecastingPivotData data  loaded:", loadedData);
        console.log("forecastingPivotData data from useDashboard Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const setCurrentDimension = async (dimension) => {
    if (dimension) {
      return dispatch(SetCurrentDimension({ dimension }))
        .then((data) => {
          console.log("current dimension data", data);
          return data; // Pass the loaded data downstream if needed
        })
        .catch((error) => {
          console.error("Error loading dashboard:", error);
          throw error; // Re-throw the error to handle it in the calling component if necessary
        });
    } else {
      return dispatch(SetCurrentDimension({ dimension: "all" }))
        .then((data) => {
          console.log("current dimension data", data);
          return data; // Pass the loaded data downstream if needed
        })
        .catch((error) => {
          console.error("Error loading dashboard:", error);
          throw error; // Re-throw the error to handle it in the calling component if necessary
        });
    }
  };
  const setCurrentValue = async (value) => {
    return dispatch(SetCurrentValue({ value }))
      .then((data) => {
        console.log("current value data:", data);
        return data; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const setCurrentInvDimension = async (dimension) => {
    if (dimension) {
      return dispatch(SetCurrentInvDimension({ dimension }))
        .then((data) => {
          console.log("current dimension data", data);
          return data; // Pass the loaded data downstream if needed
        })
        .catch((error) => {
          console.error("Error loading dashboard:", error);
          throw error; // Re-throw the error to handle it in the calling component if necessary
        });
    } else {
      return dispatch(SetCurrentInvDimension({ dimension: "all" }))
        .then((data) => {
          console.log("current dimension data", data);
          return data; // Pass the loaded data downstream if needed
        })
        .catch((error) => {
          console.error("Error loading dashboard:", error);
          throw error; // Re-throw the error to handle it in the calling component if necessary
        });
    }
  };
  const setCurrentInvValue = async (value) => {
    return dispatch(SetCurrentInvValue({ value }))
      .then((data) => {
        console.log("current value data:", data);
        return data; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const setCurrentPriceDimension = async (dimension) => {
    if (dimension) {
      return dispatch(SetCurrentPriceDimension({ dimension }))
        .then((data) => {
          console.log("current dimension data", data);
          return data; // Pass the loaded data downstream if needed
        })
        .catch((error) => {
          console.error("Error loading dashboard:", error);
          throw error; // Re-throw the error to handle it in the calling component if necessary
        });
    } else {
      return dispatch(SetCurrentPriceDimension({ dimension: "all" }))
        .then((data) => {
          console.log("current dimension data", data);
          return data; // Pass the loaded data downstream if needed
        })
        .catch((error) => {
          console.error("Error loading dashboard:", error);
          throw error; // Re-throw the error to handle it in the calling component if necessary
        });
    }
  };
  const setCurrentPriceValue = async (value) => {
    return dispatch(SetCurrentPriceValue({ value }))
      .then((data) => {
        console.log("current value data:", data);
        return data; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const setCurrentStartDate = async (startDate) => {
    return dispatch(SetCurrentStartDate({ startDate }))
      .then((data) => {
        console.log("current start date data:", data);
        return data; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const setCurrentEndDate = async (endDate) => {
    return dispatch(SetCurrentEndDate({ endDate }))
      .then((data) => {
        console.log("current end date data:", data);
        return data; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const setExperimentBasePath = async (experimentBasePath) => {
    return dispatch(SetExperimentBasePath({ experimentBasePath }))
      .then((data) => {
        console.log("current Experiment base path data:", data);
        return data; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const applyDimensionFilters = async (filterData, CurrentValue) => {
    const path = `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/${CurrentValue}.csv`;
    return dispatch(
      loadDemandForecastingDataCSV({
        path,
        fallBackPath: `accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/${CurrentValue}.csv`,
        userID,
        filterData,
      })
    )
      .then((loadedData) => {
        console.log("filtered df data loaded:", loadedData);
        console.log(
          "Loaded the Demand Forecasting data from useDashboard Level"
        );
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const setDashboardLoading = (dashboardLoading) => {
    return dispatch(SetDashboardLoading({ dashboardLoading }));
  };

  const downloadFileUsingPreSignedURL = async (
    tokenPayload,
    fileName,
    tableName,
    userID
  ) => {
    await DownloadFileUsingPreSignedURL(
      tokenPayload,
      fileName,
      tableName,
      userID
    );
  };
  const setSelectedModel = (model) => {
    dispatch(selectModel(model)); // Dispatch action to update Redux store
  };

  const setShowRawActuals = async (showRawActuals) => {
    return dispatch(SetShowRawActuals(showRawActuals));
  };

  const setShowOffsetForecast = async (showOffsetForecast) => {
    return dispatch(SetShowOffsetForecast(showOffsetForecast));
  };

  const setAggregatedValues = async (
    fileName,
    reportId,
    aggregatedValues,
    filterData
  ) => {
    return dispatch(
      SetAggregatedValues({
        fileName,
        reportId,
        aggregatedValues,
        filterData,
      })
    );
  };

  const setAutoCalculateSums = async (value) => {
    return dispatch(SetAutoCalculateSums(value));
  };

  const syncExperimentConfigWithTablesFilter = (
    tablesFilterData,
    configState,
    experimentBasePath
  ) => {
    console.log(
      "[syncExperimentConfigWithTablesFilter]: tablesFilterData",
      tablesFilterData
    );
    console.log(
      "[syncExperimentConfigWithTablesFilter]: configState",
      configState
    );
    console.log(
      "[syncExperimentConfigWithTablesFilter]: experimentBasePath",
      experimentBasePath
    );
    if (
      !configState?.tables_filter_data ||
      !experimentBasePath
      /* || Object.keys(tablesFilterData).length > 0 */
    )
      return;

    // Get current filter data from experiment_config
    const configFilterData = configState.tables_filter_data;
    console.log(
      "[syncExperimentConfigWithTablesFilter]: configFilterData",
      configFilterData
    );

    // Create a new object to hold updated tables filter data
    const updatedTablesFilterData = { ...tablesFilterData };

    // Process each key in the config filter data
    Object.keys(configFilterData).forEach((configKey) => {
      // Create the new key format: experimentBasePath_replaced + "_" + configKey
      const basePath = experimentBasePath.replace(/\//g, "_");
      const newKey = `${basePath}_${configKey}`;

      // If this key doesn't exist in tablesFilterData, add it
      if (!updatedTablesFilterData[newKey]) {
        console.log("[syncExperimentConfigWithTablesFilter]: newKey", newKey);
        updatedTablesFilterData[newKey] = {
          Default: {
            reportName: reverseShortFileNameDict[configKey],
            filterData: {
              // Copy all filter data except dimensionFilters
              columnFilter: configFilterData[configKey].columnFilter || [],
              frozenColumns: configFilterData[configKey].frozenColumns || [],
              selectAllColumns:
                configFilterData[configKey].selectAllColumns !== undefined
                  ? configFilterData[configKey].selectAllColumns
                  : true,
              // Initialize empty dimensionFilters
              dimensionFilters: {},
            },
            aggregatedValuesHistory: [],
          },
        };
      }
      // else {
      //   // If the key exists, update non-dimensionFilters properties if they differ from initial state
      //   const currentFilterData =
      //     updatedTablesFilterData[newKey].Default.filterData;

      //   // Update columnFilter if it's different from initial state
      //   if (
      //     configFilterData[configKey].columnFilter &&
      //     JSON.stringify(currentFilterData.columnFilter) !==
      //       JSON.stringify(configFilterData[configKey].columnFilter)
      //   ) {
      //     currentFilterData.columnFilter =
      //       configFilterData[configKey].columnFilter;
      //   }

      //   // Update frozenColumns if it's different from initial state
      //   if (
      //     configFilterData[configKey].frozenColumns &&
      //     JSON.stringify(currentFilterData.frozenColumns) !==
      //       JSON.stringify(configFilterData[configKey].frozenColumns)
      //   ) {
      //     currentFilterData.frozenColumns =
      //       configFilterData[configKey].frozenColumns;
      //   }

      //   // Update selectAllColumns if it's different from initial state
      //   if (
      //     configFilterData[configKey].selectAllColumns !== undefined &&
      //     currentFilterData.selectAllColumns !==
      //       configFilterData[configKey].selectAllColumns
      //   ) {
      //     currentFilterData.selectAllColumns =
      //       configFilterData[configKey].selectAllColumns;
      //   }
      // }
    });

    // Update Redux store with the new tablesFilterData
    if (
      JSON.stringify(updatedTablesFilterData) !==
      JSON.stringify(tablesFilterData)
    ) {
      console.log(
        "[syncExperimentConfigWithTablesFilter]: Syncing experiment config with tables filter data"
      );
      dispatch(setTablesFilterData(updatedTablesFilterData));
      uploadJsonToS3(
        `${experimentBasePath}/custom_report/tablesFilterData.json`,
        updatedTablesFilterData
      );
    }
  };

  const syncExperimentConfigWithBYOR = (
    BYORconfig,
    configState,
    experimentBasePath
  ) => {
    if (!configState?.byor_config || !experimentBasePath) {
      return; // Return original byor_config if conditions not met
    }

    // Create a deep copy of just the byor_config
    const updatedBYORConfig = JSON.parse(
      JSON.stringify(configState.byor_config)
    );

    // Convert the base path to underscore format for fileName
    const basePathUnderscore = experimentBasePath.replace(/\//g, "_");

    // Process each report
    Object.keys(updatedBYORConfig).forEach((reportKey) => {
      const report = updatedBYORConfig[reportKey];

      // Restore filePath if needed
      if (report.filePath && !report.filePath.startsWith(experimentBasePath)) {
        report.filePath = `${experimentBasePath}/${report.filePath}`;
      }

      // Restore fileName (skip special cases)
      if (report.fileName && !report.fileName.startsWith(basePathUnderscore)) {
        report.fileName = `${basePathUnderscore}_${report.fileName}`;
      }
    });

    dispatch(setBYORConfigurations(updatedBYORConfig));
    uploadJsonToS3(
      `${experimentBasePath}/custom_report/BYORDataConfig.json`,
      updatedBYORConfig
    );
  };

  // useEffect(() => {
  //   if (configState?.tables_filter_data && experimentBasePath && Object.keys(tablesFilterData).length === 0) {
  //     syncExperimentConfigWithTablesFilter();
  //   }
  // }, [configState?.tables_filter_data, experimentBasePath]);
  const setCurrentRLAgentEnrichmentSuggestion = (suggestion) => {
    return dispatch(SetCurrentRLAgentEnrichmentSuggestion(suggestion));
  };
  const setRlEnrichmentsGlobalStartDate = async (startDate) => {
    return dispatch(SetRlEnrichmentsGlobalStartDate(startDate));
  };
  const setRlEnrichmentsGlobalEndDate = async (endDate) => {
    return dispatch(SetRlEnrichmentsGlobalEndDate(endDate));
  };
  const setCurrentRLAgentEnrichmentSuggestionCardIndex = (index) => {
    return dispatch(SetCurrentRLAgentEnrichmentSuggestionCardIndex(index));
  };
  return {
    loadDashboardData,
    loadExecutiveViewData,
    loadDemandForecastingData,
    loadInventoryOptimizationData,
    loadPriceOptimizationData,
    loadDimensionFilterData,
    loadElasticityDimensionFilterData,
    elasticityDimensionFilterData,
    setCurrentDimension,
    setCurrentValue,
    setCurrentInvDimension,
    setCurrentInvValue,
    setCurrentPriceDimension,
    setCurrentPriceValue,
    setCurrentStartDate,
    setCurrentEndDate,
    setForecastingPivotData,
    applyDimensionFilters,
    selectedModel,
    setSelectedModel,
    executiveViewData,
    dashboardData,
    demandForecastingData,
    inventoryOptimizationData,
    priceOptimizationData,
    dimensionFilterData,
    currentDimension,
    currentValue,
    InvCurrentDimension,
    InvCurrentValue,
    PriceCurrentDimension,
    PriceCurrentValue,
    currentStartDate,
    currentEndDate,
    forecastingPivotData,
    forecastingDisagg,
    setExperimentBasePath,
    experimentBasePath,
    setDashboardLoading,
    setForecastingDisagg,
    currentDimensionOptimize,
    dashboardLoading,
    loadReports,
    reports,
    reportsTab,
    setReportsTab,
    reportToShow,
    setReportToShow,
    subReportsTab,
    setSubReportsTab,
    clearDashboardCache,
    updateBYORFilterData,
    downloadFileUsingPreSignedURL,
    inventoryOptimizationFilterData,
    setShowFutureActuals,
    showFutureActuals,
    setShowPredictionInterval,
    showPredictionInterval,
    priceOptimizationFilterData,
    InvPriceFilterData,
    loadInvPriceFilterData,
    loadInventoryMetricsData,
    InventoryMetricsData,
    updateFilterByPath,
    setFilterColumns,
    setFrozenColumns,
    setFilterOptions,
    updateFilterDataDimension,
    setSelectAllColumns,
    saveReport,
    applyFilter,
    clearFilters,
    getFilterDataByPath,
    filterData,
    filterOptions,
    tablesFilterData,
    filterOpen,
    setFilterOpen,
    setFilterData,
    saveReportOpen,
    setSaveReportOpen,
    loadTablesFilterData,
    deleteCustomReport,
    loadRawSalesData,
    rawSalesData,
    loadPriceMetricsData,
    priceMetricsData,
    showMLForecast,
    setShowMLForecast,
    showEnrichForecast,
    showAdjustHistoricalData,
    setShowEnrichForecast,
    setShowAdjustHistoricalData,
    setSnOPDimensionsToFilter,
    setSnOPDimensionsToFilterView1,
    SnOPDimensionsToFilter,
    SnOPDimensionsToFilterView1,
    supplyPlanFilterData,
    loadSupplyPlanFilterData,
    setProductionPlanningDimensionsToFilter,
    productionPlanningDimensionsToFilter,
    showRawActuals,
    setShowRawActuals,
    showOffsetForecast,
    setShowOffsetForecast,
    setAggregatedValues,
    autoCalculateSums,
    setAutoCalculateSums,
    clearAggregatedValuesHistory,
    syncExperimentConfigWithTablesFilter,
    BYORData,
    setBYORData,
    updateBYORGroupByColumns,
    updateBYORAggregationColumns,
    updateBYORFilterConditions,
    addBYORFilterCondition,
    removeBYORFilterCondition,
    updateBYORFilterCondition,
    syncExperimentConfigWithBYOR,
    saveBYORConfig,
    deleteBYORConfig,
    setBYORConfigurations,
    loadBYORConfig,
    clearBYORData,
    BYORConfig,
    rlAgentEnrichmentSuggestions,
    setRLAgentEnrichmentSuggestions,
    setApprovedRLAgentEnrichmentSuggestions,
    approvedRLAgentEnrichmentSuggestions,
    currentRLAgentEnrichmentRisk,
    setCurrentRLAgentEnrichmentRisk,
    currentRLAgentEnrichmentSuggestion,
    setCurrentRLAgentEnrichmentSuggestion,
    currentRLAgentEnrichmentDimension,
    setCurrentRLAgentEnrichmentDimension,
    currentRLAgentEnrichmentValue,
    setCurrentRLAgentEnrichmentValue,
    currentRLAgentEnrichmentKeys,
    addCurrentRLAgentEnrichmentKey,
    removeCurrentRLAgentEnrichmentKey,
    updateRLAgentEnrichmentSuggestions,
    rlEnrichmentsGlobalStartDate,
    setRlEnrichmentsGlobalStartDate,
    rlEnrichmentsGlobalEndDate,
    setRlEnrichmentsGlobalEndDate,
    RiskColumn,
    setRiskColumn,
    loadSupplyPlanFilterData,
    currentRLAgentEnrichmentSuggestionCardIndex,
    setCurrentRLAgentEnrichmentSuggestionCardIndex,
    lastSyncedTime,
    setLastSyncedTime,
    useDebounce,
  };
};

export default useDashboard;
