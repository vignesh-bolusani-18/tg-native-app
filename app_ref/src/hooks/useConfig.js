import { useSelector, useDispatch } from "react-redux";
import {
  loadConfig,
  confirmAddData as ConfirmAddData,
  confirmPlannerCoding as ConfirmPlannerCoding,
  confirmAddContext as ConfirmAddContext,
  saveConfig,
  restoreToDefault as RestoreToDefault,
  restoreMLToDefault as RestoreMLToDefault,
  removeItem as RemoveItem,
  setCurrentBucket as SetCurrentBucket,
  setCurrentAdvanceSettingBucket as SetCurrentAdvanceSettingBucket,
  setFeatureGroup as SetFeatureGroup,
  confirmContextGroup as ConfirmContextGroup,
  confirmAdvanceSettingsGroup as ConfirmAdvanceSettingsGroup,
  addAdjustData as AddAdjustData,
  addEnrichment as AddEnrichment,
  addExogenousFeature as AddExogenousFeature,
  addDates as AddDates,
  deleteBaseDataset as DeleteBaseDataset,
  addBaseDataset as AddBaseDataset,
  setBaseDatasets as SetBaseDatasets,
  setDeletedBaseDatasets as SetDeletedBaseDatasets,
  confirmAdvancedSettings as ConfirmAdvancedSettings,
  resetAdvanceSettingToDefault as ResetAdvanceSettingToDefault,
  // retryExecution as RetryExecution,
  setAdvanceSettingBuckets as SetAdvanceSettingBuckets,
  setNewAdvanceSettingBucketsFilledFlags as SetNewAdvanceSettingBucketsFilledFlags,
  addTrialParams as AddTrialParams,
  editTrialParams as EditTrialParams,
} from "../redux/actions/configActions";
import {
  updateConfigByPath,
  updateContextConfigByPath,
  updateAdjustDataByPath as UpdateAdjustDataByPath,
  updateEnrichmentByPath as UpdateEnrichmentByPath,
  updateExogenousFeatureByPath as UpdateExogenousFeatureByPath,
  updateDatePairByPath as UpdateDatePairByPath,
  confirmMLAdvancedSettings as ConfirmMLAdvancedSettings,
  setShowBomDataset as SetShowBomDataset,
  addDisaggregateInventoryMetricsGranularity as AddDisaggregateInventoryMetricsGranularity,
  setShowFutureDataset as SetShowFutureDataset,
  setShowNewProductsDataset as SetShowNewProductsDataset,
  setShowTransitionItemDataset as SetShowTransitionItemDataset,
  setshowSimpleDisaggregateMappingDataset as SetShowSimpleDisaggregateMappingDataset,
  removeExogenousFeature,
  removePlannerAdjustment,
  removeEnrichment,
  removeEnrichmentPricing,
  removeRLAgentEnrichment as RemoveRLAgentEnrichment,
  setEnrichmentDimension as SetEnrichmentDimension,
  setEnrichmentValue as SetEnrichmentValue,
  setEnrichmentStartDate as SetEnrichmentStartDate,
  setEnrichmentEndDate as SetEnrichmentEndDate,
  setEnrichmentEnrichmentValue as SetEnrichmentEnrichmentValue,
  setAdjustmentDimension as SetAdjustmentDimension,
  setAdjustmentValue as SetAdjustmentValue,
  setAdjustmentAdjustValue as SetAdjustmentAdjustValue,
  setAdjustmentEndDate as SetAdjustmentEndDate,
  setAdjustmentStartDate as SetAdjustmentStartDate,
  setShowForecastDataset as SetShowForecastDataset,
  setEditHistories as SetEditHistories,
  setLastSavedEditAt as SetLastSavedEditAt,
  setEditedFile as SetEditedFile,
  setEditsConfig as SetEditsConfig,
  setNewRows as SetNewRows,
  setDeletedRows as SetDeletedRows,
  setHasConflict,
  toggleChartMetric as ToggleChartMetric,
  initializeChartMetrics as InitializeChartMetrics,
  setIsNoInstanceAvailable as SetIsNoInstanceAvailable,
  loadFilterToConfig as LoadFilterToConfig,
  clearConfigCache as ClearConfigCache,
  setEnrichment_bydate as SetEnrichment_bydate,
  setAdjustment_bydate as SetAdjustment_bydate,
  setShowForecastRewriteDataset as SetShowForecastRewriteDataset,
  setEnrichment as SetEnrichment,
  setAdjustment as SetAdjustment,
  addEnrichmentMultiFilter as AddEnrichmentMultiFilter,
  removeEnrichmentMultifilter as RemoveEnrichmentMultifilter,
  addEnrichmentPricingMultiFilter as AddEnrichmentPricingMultifilter,
  removeEnrichmentPricingMultifilter as RemoveEnrichmentPricingMultifilter,
  setTabFilterColumns as SetTabFilterColumns,
  setSupplyPlanDataType as SetSupplyPlanDataType,
  setShowUnitsChart as SetShowUnitsChart,
  setShowDOIChart as SetShowDOIChart,
  setActiveSeries as SetActiveSeries,
  setActiveDaysSeries as SetActiveDaysSeries,
  removeTabFilterColumns as RemoveTabFilterColumns,
  remove_new_product_operation,
  setPreviewEnrichment as SetPreviewEnrichment,
  resetPreviewEnrichment as ResetPreviewEnrichment,
  setPreviewEnrichmentField as SetPreviewEnrichmentField,
  setPreviewEnrichmentDateRange as SetPreviewEnrichmentDateRange,
  setPreviewEnrichmentValue as SetPreviewEnrichmentValue,
  setPreviewChangedPricePercent as SetPreviewChangedPricePercent,
  setIsTGScenario as SetIsTGScenario,
  setForecastDataReferenceItemExpPath as SetForecastDataReferenceItemExpPath,
  setForecastDataReferenceItemForecastType as SetForecastDataReferenceItemForecastType,
  setForecastDataReferenceItemColumnTag as SetForecastDataReferenceItemColumnTag,
  resetForecastDataReferenceItem as ResetForecastDataReferenceItem,
  addForecastDataReferenceItem as AddForecastDataReferenceItem,
  removeForecastDataReferenceItem as RemoveForecastDataReferenceItem,
  setExperimentsHistoryExpPath as SetExperimentsHistoryExpPath,
  setExperimentsHistoryDateTag as SetExperimentsHistoryDateTag,
  resetExperimentsHistoryItem as ResetExperimentsHistoryItem,
  addExperimentsHistoryItem as AddExperimentsHistoryItem,
  removeExperimentsHistoryItem as RemoveExperimentsHistoryItem,
  setIsArchive as SetIsArchive,
  setIsProduction as SetIsProduction,
  setExperimentDescription as SetExperimentDescription,
} from "../redux/slices/configSlice";

import useExperimentAuxillary from "./useExperimentsAuxillary";
import { addExogenousFeature } from "./../redux/actions/configActions";
import { addExperimentToDatabase } from "../utils/createDBEntry";
import { fetchJsonFromS3, uploadJsonToS3 } from "../utils/s3Utils";
import { remove, set, update } from "lodash";

const useConfig = () => {
  const {
    loadExperiementsList: loadExperimentList,
    experiments_list,
    joinsAdded,
    needToJoin,
    datasetsAdded,
  } = useExperimentAuxillary();
  const dispatch = useDispatch();
  const configState = useSelector((state) => state.config.config);
  const configHyperState = useSelector(
    (state) => state.config.config?.training?.models
  );
  const configStateSecond = useSelector((state) => state.config);
  const configLoading = useSelector((state) => state.config.loading);
  const configError = useSelector((state) => state.config.error);
  const allColumns = useSelector((state) => state.config.allColumns);
  const dateColumns = useSelector((state) => state.config.dateColumns);
  const numericColumns = useSelector((state) => state.config.numericColumns);
  const taggedOptions = useSelector((state) => state.config.taggedOptions);
  const previewEnrichment = useSelector(
    (state) => state.config.previewEnrichment
  );
  const isTGScenario = useSelector((state) => state.config.isTGScenario);
  const deletedBaseDatasets = useSelector(
    (state) => state.config?.config?.deleted_base_datasets
  );
  const promoPlanningFilterColumns = useSelector(
    (state) => state.config?.config?.promoPlanningFilterColumns
  );

  const supplyPlanDataType = useSelector(
    (state) => state.config?.config?.supplyPlanDataType
  );

  const showUnitsChart = useSelector(
    (state) => state.config?.config?.showUnitsChart
  );
  const showDOIChart = useSelector(
    (state) => state.config?.config?.showDOIChart
  );
  const activeSeries = useSelector(
    (state) => state.config?.config?.activeSeries
  )
  const activeDaysSeries = useSelector(
    (state) => state.config?.config?.activeDaysSeries
  )
  const snopFilterColumns = useSelector(
    (state) => state.config?.config?.snopFilterColumns
  );

  const supplyPlanningFilterColumns = useSelector(
    (state) => state.config?.config?.supplyPlanningFilterColumns
  );

  const demandForecastingFilterColumns = useSelector(
    (state) => state.config?.config?.demandForecastingFilterColumns
  );

  const metricVisibility = useSelector(
    (state) => state.config?.config?.chartMetricVisibility
  );
  const baseDatasets = useSelector(
    (state) => state.config?.config?.byor_base_datasets
  );
  const hasConflict = useSelector((state) => state.config.hasConflict);

  const isNoInstanceAvailable = useSelector(
    (state) => state.config.isNoInstanceAvailable
  );
  const categoricalColumns = useSelector(
    (state) => state.config.categoricalColumns
  );
  const contextConfig = useSelector((state) => state.config.contextConfig);
  const contextBuckets = useSelector((state) => state.config.contextBuckets);
  const advanceSettingBuckets = useSelector(
    (state) => state.config.advanceSettingBuckets
  );
  const currentBucket = useSelector((state) => state.config.currentBucket);
  const currentAdvanceSettingBucket = useSelector(
    (state) => state.config.currentAdvanceSettingBucket
  );
  const currentFeatureGroup = useSelector(
    (state) => state.config.currentFeatureGroup
  );
  const contextBucketsFilledFlags = useSelector(
    (state) => state.config.contextBucketsFilledFlags
  );
  const advanceSettingBucketsFilledFlags = useSelector(
    (state) => state.config.advanceSettingBucketsFilledFlags
  );
  const operations = useSelector((state) => state.config.operations);
  const adjust_data = useSelector((state) => state.config.adjust_data);
  const enrichment_bydate = useSelector(
    (state) => state.config.enrichment_bydate
  );
  const enrichment_bydate_multi_filter = useSelector(
    (state) => state.config.enrichment_bydate_multi_filter
  );
  const enrichment_bydate_pricing = useSelector(
    (state) => state.config.enrichment_bydate_pricing
  );
  const enrichment_bydate_pricing_multi_filter = useSelector(
    (state) => state.config.enrichment_bydate_pricing_multi_filter
  );
  const trial_params_mlp = useSelector(
    (state) => state.config.trial_params_mlp
  );
  const trial_params_lstm = useSelector(
    (state) => state.config.trial_params_lstm
  );
  const trial_params_gru = useSelector(
    (state) => state.config.trial_params_gru
  );

  const enrichment = useSelector((state) => state.config.enrichment);
  const exogenous_features = useSelector(
    (state) => state.config.exogenous_features
  );
  const exogenous_feature = useSelector(
    (state) => state.config.exogenous_feature
  );

  const datePair = useSelector((state) => state.config.datePair);

  const loadedDatasets = useSelector(
    (state) => state.experiment.loadedDatasets
  );

  const isMLSettingsDone = useSelector(
    (state) => state.config.isMLSettingsDone
  );
  const job_list = useSelector((state) => state.config.job_list);
  const showBomDataset = useSelector((state) => state.config.showBomDataset);
  const showForecastRewriteDataset = useSelector(
    (state) => state.config.showForecastRewriteDataset
  );
  const showFutureDataset = useSelector(
    (state) => state.config.showFutureDataset
  );
  const editedFiles = useSelector((state) => state.config.editedFiles);
  const editHistories = useSelector((state) => state.config.editHistories);
  const lastSavedEditAt = useSelector((state) => state.config.lastSavedEditAt);
  const newRows = useSelector((state) => state.config?.newRows || []);
  const deletedRows = [];

  const showForecastDataset = useSelector(
    (state) => state.config.showForecastDataset
  );
  const forecastDataReferenceItem = useSelector(
    (state) => state.config.forecast_data_reference_item
  );
  const showNewProductsDataset = useSelector(
    (state) => state.config.showNewProductsDataset
  );
  const showTransitionItemDataset = useSelector(
    (state) => state.config.showTransitionItemDataset
  );
  const showSimpleDisaggregateMappingDataset = useSelector(
    (state) => state.config.showSimpleDisaggregateMappingDataset
  );
  const experimentsHistoryItem = useSelector(
    (state) => state.config.experiments_history_item
  );
  const isPlannerAdjustmentAdded = operations?.length > 1;
  const isPlannerEnrichmentAdded = enrichment_bydate?.length > 0;
  const isExogenousFeatureAdded = exogenous_features?.length > 0;

  const isArchive = useSelector((state) => state.config.isArchive);
  const isProduction = useSelector((state) => state.config.isProduction);

  const exp_description = useSelector((state) => state.config.exp_description);

  const isAdvanceBucketFilled = (group) => {
    if (group === "APE" && isPlannerEnrichmentAdded) {
      return true;
    } else if (group === "APA" && isPlannerAdjustmentAdded) {
      return true;
    } else if (group === "AEF" && isExogenousFeatureAdded) {
      return true;
    } else {
      return false;
    }
  };

  const { currentCompany } = useSelector((state) => state.auth);
  const editsConfig = useSelector((state) => state.config.editsConfig);

  const getDataByArrayName = (arrayName) => {
    const data = configStateSecond[arrayName];
    console.log(data);

    return configStateSecond[arrayName] || [];
  };

  const getTrialParam = (modelType) => {
    if (modelType === "MLP") {
      return trial_params_mlp;
    } else if (modelType === "LSTM") {
      return trial_params_lstm;
    } else if (modelType === "GRU") {
      return trial_params_gru;
    }
  };
  const setShowBomDataset = (showBomDataset) => {
    dispatch(SetShowBomDataset(showBomDataset));
  };

  const setShowForecastRewriteDataset = (showForecastRewriteDataset) => {
    dispatch(SetShowForecastRewriteDataset(showForecastRewriteDataset));
  };

  const setIsNoInstanceAvailable = (isNoInstanceAvailable) => {
    dispatch(SetIsNoInstanceAvailable(isNoInstanceAvailable));
  };

  const setShowFutureDataset = (showFutureDataset) => {
    dispatch(SetShowFutureDataset(showFutureDataset));
  };

  const setShowNewProductsDataset = (showNewProductsDataset) => {
    dispatch(SetShowNewProductsDataset(showNewProductsDataset));
  };
  const setShowTransitionItemDataset = (showTransitionItemDataset) => {
    dispatch(SetShowTransitionItemDataset(showTransitionItemDataset));
  };

  const setshowSimpleDisaggregateMappingDataset = (
    showSimpleDisaggregateMappingDataset
  ) => {
    dispatch(
      SetShowSimpleDisaggregateMappingDataset(
        showSimpleDisaggregateMappingDataset
      )
    );
  };

  const setForecastDataReferenceItemExpPath = (exp_path) => {
    dispatch(SetForecastDataReferenceItemExpPath(exp_path));
  };
  const setForecastDataReferenceItemForecastType = (forecast_type) => {
    dispatch(SetForecastDataReferenceItemForecastType(forecast_type));
  };
  const setForecastDataReferenceItemColumnTag = (column_tag) => {
    dispatch(SetForecastDataReferenceItemColumnTag(column_tag));
  };
  const resetForecastDataReferenceItem = () => {
    dispatch(ResetForecastDataReferenceItem());
  };
  const addForecastDataReferenceItem = () => {
    dispatch(AddForecastDataReferenceItem());
  };
  const removeForecastDataReferenceItem = (index) => {
    dispatch(RemoveForecastDataReferenceItem({ index }));
  };

  const setExperimentsHistoryExpPath = (exp_path) => {
    dispatch(SetExperimentsHistoryExpPath(exp_path));
  };
  const setExperimentsHistoryDateTag = (date_tag) => {
    dispatch(SetExperimentsHistoryDateTag(date_tag));
  };
  const resetExperimentsHistoryItem = () => {
    dispatch(ResetExperimentsHistoryItem());
  };  
  const addExperimentsHistoryItem = () => {
    dispatch(AddExperimentsHistoryItem());
  };
  const removeExperimentsHistoryItem = (index) => {
    dispatch(RemoveExperimentsHistoryItem({ index }));
  };



  const setEnrichment = (enrichment) => {
    dispatch(SetEnrichment(enrichment));
  };
  const setAdjustment = (adjustment) => {
    dispatch(SetAdjustment(adjustment));
  };

  const clearConfigCache = () => {
    dispatch(ClearConfigCache());
  };

  const setShowForecastDataset = (showForecastDataset) => {
    dispatch(SetShowForecastDataset(showForecastDataset));
  };
  const resetAdvanceSettingToDefault = (arrayName, featureGroup) => {
    dispatch(ResetAdvanceSettingToDefault(arrayName, featureGroup));
  };

  const addEnrichmentMultiFilter = (enrichment) => {
    dispatch(AddEnrichmentMultiFilter(enrichment));
  };

  const removeEnrichmentMultiFilter = (index) => {
    dispatch(RemoveEnrichmentMultifilter(index));
  };

  const addEnrichmentPricingMultifilter = (enrichment) => {
    dispatch(AddEnrichmentPricingMultifilter(enrichment));
  };

  const removeEnrichmentPricingMultifilter = (enrichment) => {
    dispatch(RemoveEnrichmentPricingMultifilter(enrichment));
  };

  const setTabFilterColumns = (columns, tab) => {
    dispatch(SetTabFilterColumns({ columns, tab }));
  };

  const setSupplyPlanDataType = (dataType) => {
    dispatch(SetSupplyPlanDataType(dataType));
  };

  const setShowUnitsChart = (showUnitsChart) => {
    dispatch(SetShowUnitsChart(showUnitsChart));
  };

  const setShowDOIChart = (showDOIChart) => {
    dispatch(SetShowDOIChart(showDOIChart));
  };


  const setActiveSeries = (activeSeries) => {
    dispatch(SetActiveSeries(activeSeries));
  };

  const setActiveDaysSeries = (activeDaysSeries) => {
    dispatch(SetActiveDaysSeries(activeDaysSeries));
  };

  const toggleChartMetric = (metric) => {
    dispatch(ToggleChartMetric(metric));
  };

  const initializeChartMetrics = (availableMetrics, primaryMetrics) => {
    dispatch(InitializeChartMetrics({ availableMetrics, primaryMetrics }));
  };

  const setIsProduction = (value) => dispatch(SetIsProduction(value));
  const setIsArchive = (value) => dispatch(SetIsArchive(value));

  const setExperimentDescription = (description) => {
    dispatch(SetExperimentDescription(description));
  };

  const removeTabFilterColumns = (index) => {
    dispatch(RemoveTabFilterColumns(index));
  };

  const setNewAdvanceSettingBucketsFilledFlags = () => {
    dispatch(SetNewAdvanceSettingBucketsFilledFlags());
  };

  const setAdvanceSettingBuckets = () => {
    dispatch(SetAdvanceSettingBuckets());
  };
  const addTrialParams = (newParam, modelType) => {
    dispatch(AddTrialParams(newParam, modelType));
  };

  const editTrialParams = (newParam, index, modelType) => {
    dispatch(EditTrialParams(newParam, index, modelType));
  };

  const updateConfigFieldByPath = (path, value) => {
    dispatch(updateConfigByPath({ path, value }));
  };
  const updateContextConfigFieldByPath = (path, value) => {
    dispatch(updateContextConfigByPath({ path, value }));
  };
  const updateAdjustDataByPath = (path, value) => {
    dispatch(UpdateAdjustDataByPath({ path, value }));
  };
  const updateEnrichmentByPath = (path, value) => {
    dispatch(UpdateEnrichmentByPath({ path, value }));
  };
  const updateExogenousFeatureByPath = (path, value) => {
    dispatch(UpdateExogenousFeatureByPath({ path, value }));
  };
  const updateDatePairByPath = (path, value) => {
    dispatch(UpdateDatePairByPath({ path, value }));
  };
  const setCurrentBucket = (currentBucket) => {
    dispatch(SetCurrentBucket(currentBucket));
  };
  const setCurrentAdvanceSettingBucket = (currentBucket) => {
    dispatch(SetCurrentAdvanceSettingBucket(currentBucket));
  };
  const setFeatureGroup = (featureGroup) => {
    dispatch(SetFeatureGroup(featureGroup));
  };
  const setEnrichmentDimension = (dimension) => {
    dispatch(SetEnrichmentDimension(dimension));
  };
  const setEnrichmentValue = (value) => {
    dispatch(SetEnrichmentValue(value));
  };
  const setAdjustmentDimension = (dimension) => {
    dispatch(SetAdjustmentDimension(dimension));
  };
  const setAdjustmentValue = (value) => {
    dispatch(SetAdjustmentValue(value));
  };
  const setEnrichmentStartDate = (startDate) => {
    dispatch(SetEnrichmentStartDate(startDate));
  };
  const setEnrichmentEndDate = (endDate) => {
    dispatch(SetEnrichmentEndDate(endDate));
  };

  const setAdjustmentStartDate = (startDate) => {
    dispatch(SetAdjustmentStartDate(startDate));
  };
  const setAdjustmentEndDate = (endDate) => {
    dispatch(SetAdjustmentEndDate(endDate));
  };
  const setEnrichmentEnrichmentValue = (value) => {
    dispatch(SetEnrichmentEnrichmentValue(value));
  };
  const setAdjustmentAdjustValue = (value) => {
    dispatch(SetAdjustmentAdjustValue(value));
  };

  const setPreviewEnrichment = (previewData) => {
    dispatch(SetPreviewEnrichment(previewData));
  };

  const resetPreviewEnrichment = () => {
    dispatch(ResetPreviewEnrichment());
  };

  const setPreviewEnrichmentField = (field, value) => {
    dispatch(SetPreviewEnrichmentField({ field, value }));
  };

  const setPreviewEnrichmentDateRange = (startDate, endDate) => {
    dispatch(SetPreviewEnrichmentDateRange({ startDate, endDate }));
  };

  const setPreviewEnrichmentValue = (value) => {
    dispatch(SetPreviewEnrichmentValue(value));
  };

  const setPreviewChangedPricePercent = (value) => {
    dispatch(SetPreviewChangedPricePercent(value));
  };

  // TG Scenario actions
  const setIsTGScenario = (isTGScenario) => {
    dispatch(SetIsTGScenario(isTGScenario));
  };
  const setEditedFile = async (fileName, editedCells) => {
    if (fileName.includes(configState.common.job_id)) {
      await dispatch(SetEditedFile({ fileName, editedCells }));
    }
  };
  const uploadEditsConfig = async (editsConfig,userName="Unknown User") => {
    const editsConfigWithUserName = {
      ...editsConfig,
      last_edited_by: userName,
    };
    await uploadJsonToS3(
      `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${configState.common.module_name}/${configState.common.job_id}/edits_config.json`,
      editsConfigWithUserName
    );
  };
  const setNewRows = async (fileName, newRows) => {
    if (fileName.includes(configState.common.job_id)) {
      await dispatch(SetNewRows({ fileName, newRows }));
    }
  };

  const setDeletedRows = async (fileName, deletedRows) => {
    if (fileName.includes(configState.common.job_id)) {
      await dispatch(SetDeletedRows({ fileName, deletedRows }));
    }
  };
  const setEditHistories = async (fileName, editHistory) => {
    if (fileName.includes(configState.common.job_id)) {
      await dispatch(SetEditHistories({ fileName, editHistory }));
    }
  };
  const setLastSavedEditAt = async (fileName, lastSavedAt) => {
    if (fileName.includes(configState.common.job_id)) {
      await dispatch(SetLastSavedEditAt({ fileName, lastSavedAt }));
    }
  };

  const confirmContextGroup = (contextGroup) => {
    dispatch(ConfirmContextGroup(contextGroup));
  };
  const confirmAdvanceSettingsGroup = (advanceSettingGroup) => {
    dispatch(ConfirmAdvanceSettingsGroup(advanceSettingGroup));
  };
  const confirmMLAdvancedSettings = () => {
    dispatch(ConfirmMLAdvancedSettings());
  };

  const getConfigFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = configState;

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

    return current;
  };
  const getContextConfigFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = contextConfig;

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

    return current;
  };
  const getAdjustDataFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = adjust_data;

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

    return current;
  };
  const getEnrichmentFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = enrichment;

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

    return current;
  };
  const getExogenousFeatureFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = exogenous_feature;

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

    return current;
  };
  const getDatePairFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = datePair;

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

    return current;
  };
  const featureGroupTypeOptions = (modelType) => {
    if (
      modelType &&
      configHyperState[modelType] &&
      configHyperState[modelType].feature_group_type
    ) {
      return Object.keys(configHyperState[modelType].feature_group_type);
    }
    return [];
  };

  const loadConfigFromS3 = async (moduleName, userID) => {
    return dispatch(loadConfig({ moduleName, userID, currentCompany }))
      .then((loadedData) => {
        console.log("Config loaded:", loadedData);
        console.log("Loaded the config from useConfig Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading config:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const confirmAddData = async (loadedDatasets, datasetsLoaded) => {
    console.log("confirmAddData called");
    return dispatch(ConfirmAddData(loadedDatasets, datasetsLoaded))
      .then((newConfig) => {
        console.log("New Config at hook", newConfig);
        return newConfig;
      })
      .catch((error) => {
        throw error;
      });
  };
  const confirmAddContext = async () => {
    console.log("confirmAddContext called");
    return dispatch(ConfirmAddContext(loadedDatasets))
      .then((newConfig) => {
        console.log("New Config at hook", newConfig);
        return newConfig;
      })
      .catch((error) => {
        throw error;
      });
  };
  const confirmAdvancedSettings = async () => {
    console.log("confirmAdvancedSettings called");
    return dispatch(ConfirmAdvancedSettings())
      .then((newConfig) => {
        console.log("New Config at hook", newConfig);
        return newConfig;
      })
      .catch((error) => {
        throw error;
      });
  };
  const confirmPlannerCoding = async (loadedDatasets) => {
    console.log("confirmPlannerCoding called");
    return dispatch(ConfirmPlannerCoding(loadedDatasets));
  };

  const addDisaggregateInventoryMetricsGranularity = () => {
    console.log("confirmPlannerCoding called");
    return dispatch(AddDisaggregateInventoryMetricsGranularity());
  };
  const restoreToDefault = async (bucket, featureGroup) => {
    console.log("Restore To Default called");
    dispatch(RestoreToDefault(bucket, featureGroup));
  };
  const restoreMLToDefault = async (bucket, featureGroup) => {
    console.log("Restore To Default called");
    dispatch(RestoreMLToDefault(bucket, featureGroup));
  };

  const removeItem = async (index, arrayName, featureGroup) => {
    console.log("Restore To Default called");
    dispatch(RemoveItem(index, arrayName, featureGroup));
  };
  const addDates = async () => {
    console.log("Add Dates called");
    dispatch(AddDates());
  };

  const addBaseDataset = async (datasetName) => {
    console.log("Add Dates called");
    dispatch(AddBaseDataset(datasetName));
  };
  const deleteBaseDataset = async (datasetName) => {
    console.log("Add Dates called");
    dispatch(DeleteBaseDataset(datasetName));
  };

  const setBaseDatasets = async (datasetNames) => {
    console.log("Add Dates called");
    dispatch(SetBaseDatasets(datasetNames));
  };

  const setDeletedBaseDatasets = async (datasetNames) => {
    console.log("Add Dates called");
    dispatch(SetDeletedBaseDatasets(datasetNames));
  };
  const addAdjustData = async () => {
    console.log("Add Adjust Data called");
    dispatch(AddAdjustData());
  };
  const addEnrichment = async (elasticity = null) => {
    console.log("Add Enrichment called");
    dispatch(AddEnrichment(elasticity));
  };
  const addExogenousFeature = async () => {
    console.log("Add Exogenous Feature called");
    dispatch(AddExogenousFeature());
  };

  const uploadConfigToS3 = async ({
    config,
    clientName,
    moduleName,
    experimentId,
    userInfo,
    currentCompany,
    runType,
    isClone,
    runDEPipeline = true,
    silent = false,
    exp_description = "",
    isArchive = false,
    isProduction = false,
    // project_setup,
  }) => {

    console.log(isProduction , isArchive)
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() returns 0-based month
    const DATA_BUCKET_Base_PATH = `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/accounts/${clientName}_${currentCompany.companyID}/data_bucket`;

    // Create a shallow copy of the config object and the common object
    let newConfig;
    let createdAt = null;
    console.log("Run DE Pipeline:", runDEPipeline);
    if (runType === "run_training") {
      newConfig = {
        ...config,
        common: {
          ...config.common,
          base_path: `${DATA_BUCKET_Base_PATH}/${moduleName}/`,
          raw_data_id: `${currentYear}${currentMonth}`,
          run_date: `${currentYear}${currentMonth}`,
          job_id: experimentId,
          parent_job_id:
            config.common.job_id !== "job_id" ? config.common.job_id : null,
          module_name: moduleName,
          user_name: `${clientName}_${currentCompany.companyID}`,
        },
        project_setup: {
          ...config.project_setup,
          usecase_name: moduleName,
        },
        joinsAdded: joinsAdded,
        needToJoin: needToJoin,
        datasetsAdded: datasetsAdded,
      };
    } else {
      console.log("run type", runType);

      newConfig = {
        ...config,
        common: {
          ...config.common,
          user_name: `${clientName}_${currentCompany.companyID}`,
          base_path: `${DATA_BUCKET_Base_PATH}/${moduleName}/`,
        },
      };
      experiments_list.forEach((experiment) => {
        if (experiment.experimentID === experimentId) {
          createdAt = experiment.createdAt;
          return;
        }
        console.log("My created At", createdAt);
      });
    }

    // Now upload the transformed newConfig
    return dispatch(
      saveConfig(
        newConfig,
        clientName,
        moduleName,
        experimentId,
        userInfo,
        currentCompany,
        runType,
        loadExperimentList,
        createdAt,
        runDEPipeline,
        silent,
        isArchive,
        isProduction,
        exp_description,

      )
    );
  };

  const retryExecution = async ({
    clientName,
    moduleName,
    experimentId,
    userInfo,
    currentCompany,
    runType,
    createdAt,
    experimentName,
    filePath,
    // isClone,

    // project_setup,
  }) => {
    // Create a shallow copy of the config object and the common object
    let newConfig;
    console.log("Current Company at hook", currentCompany);
    try {
      const retryingExperimentPayload = {
        companyID: currentCompany.companyID,
        userID: userInfo.userID,
        experimentTableName: `EXPERIMENTS`,
        experimentName: experimentName,
        experimentModuleName: moduleName,
        experimentStatus: "Retrying...",
        experimentID: experimentId,
        createdAt: Math.floor(new Date(createdAt.replace(" at", "")).getTime()), // Set createdAt to the current date and time
        updatedAt: Date.now(), // Set updatedAt to the current date and time
        createdBy: userInfo.userName,
        experimentPath: filePath,
        experimentRunType: runType, //
        inTrash: false,
        time: Date.now(),
      };

      console.log("retrying Experiment Payload", retryingExperimentPayload);
      await addExperimentToDatabase(
        retryingExperimentPayload,
        currentCompany,
        userInfo.userID
      );
      await loadExperimentList(userInfo);
    } catch (error) {
      console.error("Error updating status of the experiment", error);
    }

    try {
      const config = await fetchJsonFromS3(
        `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${moduleName}/${experimentId}/config.json`
      );
      const DATA_BUCKET_Base_PATH = `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/accounts/${clientName}_${currentCompany.companyID}/data_bucket`;

      if (runType === "run_training") {
        newConfig = {
          ...config,
          common: {
            ...config.common,
            user_name: `${clientName}_${currentCompany.companyID}`,
            base_path: `${DATA_BUCKET_Base_PATH}/${moduleName}/`,
          },
        };
      } else {
        console.log("run type", runType);

        newConfig = {
          ...config,
          common: {
            ...config.common,
            user_name: `${clientName}_${currentCompany.companyID}`,
            base_path: `${DATA_BUCKET_Base_PATH}/${moduleName}/`,
          },
        };
        // experiments_list.forEach((experiment) => {
        //   if (experiment.experimentID === experimentId) {
        //     createdAt = experiment.createdAt;
        //     return;
        //   }
        //   console.log("My created At", createdAt);
        // });
      }
    } catch (error) {
      console.error("Error in fetching config while retrying:", error);
    }

    // Now upload the transformed newConfig
    return dispatch(
      saveConfig(
        newConfig,
        clientName,
        moduleName,
        experimentId,
        userInfo,
        currentCompany,
        runType,
        loadExperimentList,
        createdAt
      )
    );
  };
  const removeExogenousFeatureByIndex = async (id) => {
    dispatch(removeExogenousFeature(id));
  };
  const SetHasConflict = async (hasConflict) => {
    dispatch(setHasConflict(hasConflict));
  };
  const removePlannerAdjustmentByIndex = async (id) => {
    dispatch(removePlannerAdjustment(id));
  };
  const removeEnrichmentByIndex = async (id) => {
    dispatch(removeEnrichment(id));
  };
  const removeEnrichmentPricingByIndex = async (id) => {
    dispatch(removeEnrichmentPricing(id));
  };

  const removeRLAgentEnrichment = async (rlAgentEnrichment) => {
    dispatch(RemoveRLAgentEnrichment(rlAgentEnrichment));
  };

  const getDimensionOptions = () => {
    const nonUniquegroupsArray = ["cluster"]
      .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
      .concat(configState.data.ts_id_columns);

    console.log("dimensionsArray1 " + nonUniquegroupsArray);
    return [...new Set(nonUniquegroupsArray)];
  };
  const loadFilterToConfig = async (filterData, fileName) => {
    dispatch(LoadFilterToConfig({ filterData, fileName }));
  };
  const setEnrichment_bydate = async (enrichment_bydate) => {
    dispatch(SetEnrichment_bydate(enrichment_bydate));
  };
  const setAdjustment_bydate = async (adjustment_bydate) => {
    dispatch(SetAdjustment_bydate(adjustment_bydate));
  };
  const removeNewProductOperation = async () =>
    dispatch(remove_new_product_operation());

  return {
    configState,
    deletedBaseDatasets,
    configHyperState,
    loadConfigFromS3,
    configLoading,
    addEnrichmentMultiFilter,
    removeEnrichmentMultiFilter,
    configError,
    uploadConfigToS3,
    updateConfigFieldByPath,
    updateAdjustDataByPath,
    updateEnrichmentByPath,
    updateExogenousFeatureByPath,
    updateContextConfigFieldByPath,
    updateDatePairByPath,
    getConfigFieldByPath,
    getContextConfigFieldByPath,
    getAdjustDataFieldByPath,
    getEnrichmentFieldByPath,
    getExogenousFeatureFieldByPath,
    getDatePairFieldByPath,
    confirmAddData,
    confirmAddContext,
    confirmAdvancedSettings,
    confirmAdvanceSettingsGroup,
    getDataByArrayName,
    getDimensionOptions,
    addDisaggregateInventoryMetricsGranularity,
    allColumns,
    dateColumns,
    numericColumns,
    categoricalColumns,
    restoreToDefault,
    restoreMLToDefault,
    enrichment,
    enrichment_bydate,
    adjust_data,
    operations,
    datePair,
    exogenous_feature,
    exogenous_features,
    trial_params_mlp,
    configStateSecond,
    removeItem,
    addAdjustData,
    addEnrichment,
    addExogenousFeature,
    addDates,
    deleteBaseDataset,
    addBaseDataset,
    baseDatasets,
    setBaseDatasets,
    setDeletedBaseDatasets,
    addTrialParams,
    editTrialParams,
    getTrialParam,
    contextBuckets,
    advanceSettingBuckets,
    setCurrentBucket,
    isAdvanceBucketFilled,
    setCurrentAdvanceSettingBucket,
    setFeatureGroup,
    featureGroupTypeOptions,
    currentBucket,
    currentAdvanceSettingBucket,
    currentFeatureGroup,
    contextBucketsFilledFlags,
    advanceSettingBucketsFilledFlags,
    confirmContextGroup,
    confirmMLAdvancedSettings,
    isMLSettingsDone,
    isExogenousFeatureAdded,
    isPlannerAdjustmentAdded,
    isPlannerEnrichmentAdded,
    showFutureDataset,
    showBomDataset,
    showForecastRewriteDataset,
    setShowFutureDataset,
    setShowBomDataset,
    setShowForecastRewriteDataset,
    removeExogenousFeatureByIndex,
    removePlannerAdjustmentByIndex,
    removeEnrichmentByIndex,
    setEnrichmentDimension,
    setEnrichmentValue,
    setEnrichmentStartDate,
    setEnrichmentEndDate,
    setAdjustmentStartDate,
    setAdjustmentEndDate,
    setEnrichmentEnrichmentValue,
    setAdjustmentDimension,
    setAdjustmentValue,
    setAdjustmentAdjustValue,
    setShowNewProductsDataset,
    setshowSimpleDisaggregateMappingDataset,
    setShowTransitionItemDataset,
    showTransitionItemDataset,
    showNewProductsDataset,
    showSimpleDisaggregateMappingDataset,
    setShowForecastDataset,
    showForecastDataset,
    confirmPlannerCoding,
    resetAdvanceSettingToDefault,
    setNewAdvanceSettingBucketsFilledFlags,
    setAdvanceSettingBuckets,
    setEditHistories,
    setLastSavedEditAt,
    setEditedFile,
    contextConfig,
    editedFiles,
    editHistories,
    lastSavedEditAt,
    newRows,
    deletedRows,
    taggedOptions,
    hasConflict,
    SetHasConflict,
    setIsNoInstanceAvailable,
    isNoInstanceAvailable,
    retryExecution,
    loadFilterToConfig,
    clearConfigCache,
    setEnrichment_bydate,
    setAdjustment_bydate,
    removeNewProductOperation,
    setNewRows,
    setDeletedRows,
    setEnrichment,
    setAdjustment,
    removeRLAgentEnrichment,
    uploadEditsConfig,
    editsConfig,
    removeEnrichmentPricingByIndex,
    enrichment_bydate_pricing,
    enrichment_bydate_pricing_multi_filter,
    enrichment_bydate_multi_filter,
    addEnrichmentPricingMultifilter,
    removeEnrichmentPricingMultifilter,
    setTabFilterColumns,
    promoPlanningFilterColumns,
    snopFilterColumns,
    supplyPlanningFilterColumns,
    demandForecastingFilterColumns,
    removeTabFilterColumns,
    // Preview Enrichment
    previewEnrichment,
    setPreviewEnrichment,
    resetPreviewEnrichment,
    setPreviewEnrichmentField,
    setPreviewEnrichmentDateRange,
    setPreviewEnrichmentValue,
    setPreviewChangedPricePercent,
    toggleChartMetric,
    initializeChartMetrics,
    metricVisibility,
    supplyPlanDataType,
    setSupplyPlanDataType,
    // TG Scenario
    isTGScenario,
    setIsTGScenario,
    metricVisibility,
    // Forecast Data Reference Item
    forecastDataReferenceItem,
    setForecastDataReferenceItemExpPath,
    setForecastDataReferenceItemForecastType,
    setForecastDataReferenceItemColumnTag,
    resetForecastDataReferenceItem,
    addForecastDataReferenceItem,
    removeForecastDataReferenceItem,
    experimentsHistoryItem,
    setExperimentsHistoryExpPath,
    setExperimentsHistoryDateTag,
    resetExperimentsHistoryItem,
    addExperimentsHistoryItem,
    removeExperimentsHistoryItem,
    isArchive,
    isProduction,
    exp_description,
    setIsArchive,
    setIsProduction,
    setExperimentDescription,
    showUnitsChart,
    showDOIChart,
    setShowUnitsChart,
    setShowDOIChart,

    activeSeries,
    activeDaysSeries,
    setActiveSeries,
    setActiveDaysSeries

  };
};

export default useConfig;
