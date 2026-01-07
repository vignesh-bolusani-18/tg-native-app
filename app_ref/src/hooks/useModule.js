// useExperiment.js
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useConfig from "./useConfig";
import useExperiment from "./useExperiment";
import {
  setConfigCache,
  selectDatasetCard,
  clearCache,
  updateLoadedDatasetByPath,
  addMetaData,
  clearMetaData,
  addMoreData,
  setPath,
  resetExperimentConfig,
  loadJoins as LoadJoins,
  updateJoinDataByPath as UpdateJoinDataByPath,
  setJoinsAdded,
  setLogs,
  setTabValue as SetTabValue,
  editMetaData,
  setSearchString,
  setCreatedStartDate,
  setCreatedEndDate,
  setUpdatedStartDate,
  setUpdatedEndDate,
  setModuleNames,
  setIsProduction,
  setStatuses,
  resetFilters,
  openDatasetDialog,
  closeDatasetDialog,
  setEditedFile as SetEditedFile,
  setNewRows as SetNewRows,
  setDeletedRows as SetDeletedRows,
  setEditHistories as SetEditHistories,
  updateConfig as UpdateConfig,
  setIsNoInstanceAvailable as SetIsNoInstanceAvailable,
  setHasConflict,
  setShowBomDataset as SetShowBomDataset,
  setShowFutureDataset as SetShowFutureDataset,
  setShowNewProductsDataset as SetShowNewProductsDataset,
  setShowForecastRewriteDataset as SetShowForecastRewriteDataset,
  setshowSimpleDisaggregateMappingDataset as SetshowSimpleDisaggregateMappingDataset,
  setShowForecastDataset as SetShowForecastDataset,
  removePlannerAdjustment as RemovePlannerAdjustment,
  setEnrichmentDimension as SetEnrichmentDimension,
  setEnrichmentValue as SetEnrichmentValue,
  setEnrichmentEnrichmentValue as SetEnrichmentEnrichmentValue,
  setAdjustmentDimension as SetAdjustmentDimension,
  setAdjustmentValue as SetAdjustmentValue,
  setAdjustmentAdjustValue as SetAdjustmentAdjustValue,
  setEnrichmentStartDate as SetEnrichmentStartDate,
  setEnrichmentEndDate as SetEnrichmentEndDate,
  setAdjustmentStartDate as SetAdjustmentStartDate,
  setAdjustmentEndDate as SetAdjustmentEndDate,
  removeEnrichment as RemoveEnrichment,
  removeExogenousFeature as RemoveExogenousFeature,
  updateConfigByPath as UpdateConfigByPath,
  setConfigByKeyValue as SetConfigByKeyValue,
  confirmAddData as ConfirmAddData,
  confirmPlannerCoding as ConfirmPlannerCoding,
  addJoins as AddJoins,
  updateContextConfigByPath as UpdateContextConfigByPath,
  updateExogenousFeatureByPath as UpdateExogenousFeatureByPath,
  confirmAddContext as ConfirmAddContext,
  restoreMLToDefault as RestoreMLToDefault,
  setCurrentBucket as SetCurrentBucket,
  updateAdjustDataByPath as UpdateAdjustDataByPath,
  updateEnrichmentByPath as UpdateEnrichmentByPath,
  updateDatePairByPath as UpdateDatePairByPath,
  removeItem as RemoveItem,
  addDates as AddDates,
  deleteBaseDataset as DeleteBaseDataset,
  addBaseDataset as AddBaseDataset,
  setBaseDatasets as SetBaseDatasets,
  setDeletedBaseDatasets as SetDeletedBaseDatasets,
  loadFilterToConfig as LoadFilterToConfig,
  clearConfigCache as ClearConfigCache,
  setEnrichment_bydate as SetEnrichment_bydate,
  setAdjustment_bydate as SetAdjustment_bydate,
  setContextConfig as SetContextConfig,
  setContextBucketsFilledFlags as SetContextBucketsFilledFlags,
  setAdvanceSettingBucketsFilledFlags as SetAdvanceSettingBucketsFilledFlags,
  setFeatureGroup as SetFeatureGroup,
  restoreToDefault as RestoreToDefault,
  confirmContextGroup as ConfirmContextGroup,
  addDisaggregateInventoryMetricsGranularity as AddDisaggregateInventoryMetricsGranularity,
  setCurrentAdvanceSettingBucket as SetCurrentAdvanceSettingBucket,
  confirmAdvanceSettingsGroup as ConfirmAdvanceSettingsGroup,
  addAdjustData as AddAdjustData,
  addEnrichment as AddEnrichment,
  addExogenousFeature as AddExogenousFeature,
  confirmMLAdvancedSettings as ConfirmMLAdvancedSettings,
  addTrialParams as AddTrialParams,
  editTrialParams as EditTrialParams,
  setNeedToJoin as SetNeedToJoin,
  setShowDatasetGroups as SetShowDatasetGroups,
  setEnrichment as SetEnrichment,
  setAdjustment as SetAdjustment,
  removeRLAgentEnrichment as RemoveRLAgentEnrichment,
  setRiskColumn as SetRiskColumn,
  remove_new_product_operation,
  setDashboardLoading as SetDashboardLoading,
} from "../redux/slices/moduleSlice";

import {
  loadConfig,
  loadMetadata,
  loadExistingMetadata as LoadExistingMetadata,
  loadPreprocessMetadata,
  loadExperimentList,
  deleteTheExperiment,
  terminateTheExperiment,
  saveMetadata,
  loadDatasetCSV as loadDataCSV,
  setExperimentStatus as SetExperimentStatus,
  saveConfig,
  loadExperimentConfig,
  updateConfigFieldByPath as UpdateConfigFieldByPath,
  resetAdvanceSettingToDefault as ResetAdvanceSettingToDefault,
  confirmAdvancedSettings as ConfirmAdvancedSettings,
  loadDatasetInfo as LoadDatasetInfo,
} from "../redux/actions/moduleAction";
import { navigateTo } from "../utils/navigate";

import { fetchJsonFromS3, loadLogsFromFolder } from "../utils/s3Utils";

import useAuth from "./useAuth";
import { renameExperiment } from "../utils/renameExperiment";
import { isArchiveAndProduction } from "../utils/isArchiveAndProduction";
import { listFilesInFolderEndpoint } from "../utils/s3UtillsEndpoints";

//import { ui_config as UI_CONFIG } from "../backend/UI Configs/demand-forecasting";
import { processUIConfig } from "../utils/processUIConfig";

const useModule = () => {
  const dispatch = useDispatch();

  const defaultConfig = useSelector((state) => state.module.defaultConfig);
  const dashboardLoading = useSelector((state) => state.module.dashboardLoading);
  const loadedDataset = useSelector((state) => state.module.loadedDataset);
  const datasetsLoaded = useSelector((state) => state.module.datasetsLoaded);
  const mandatoryDatasetTags = useSelector(
    (state) =>
      state.module.ui_config.datasets.dataset_groups.mandatory_datasets_tags
  );
  const datasetsAdded = useSelector((state) => state.module.datasetsAdded);
  const columnsInUse = useSelector((state) => state.module.columnsInUse);
  const experiments_list = useSelector(
    (state) => state.module.experiments_list
  );
  const areMandatoryFieldsFilled = useSelector(
    (state) => state.module.areMandatoryFieldsFilled
  );
  const path = useSelector((state) => state.module.path);
  const filters = useSelector((state) => state.module.experimentFiltersState);
  const renderDataStepsList = useSelector(
    (state) => state.module.renderDataStepsList
  );
  const loadedDatasets = useSelector((state) => state.module.loadedDatasets);
  const tagFieldConfig = useSelector((state) => state.module.tagFieldConfig);
  const renderDatasets = useSelector((state) => state.module.renderDatasets);
  const currentDatasetTag = useSelector(
    (state) => state.module.currentDatasetTag
  );
  const loadedDatasetCSV = useSelector(
    (state) => state.module.loadedDatasetCSV
  );
  const experiment_config = useSelector(
    (state) => state.module.experiment_config
  );
  const input_data = useSelector((state) => state.module.input_data);
  const bom_input_data = useSelector((state) => state.module.bom_input_data);

  const join_operations = useSelector((state) => state.module.join_operations);
  const join_operations_future = useSelector(
    (state) => state.module.join_operations_future
  );
  const join_operations_bom = useSelector(
    (state) => state.module.join_operations_bom
  );
  const join_operations_forecast = useSelector(
    (state) => state.module.join_operations_forecast
  );
  const join_operations_new_product = useSelector(
    (state) => state.module.join_operations_new_product
  );
  const join_operations_simple_disaggregation_mapping = useSelector(
    (state) => state.module.join_operations_simple_disaggregation_mapping
  );
  const needToJoin = useSelector((state) => state.module.needToJoin);
  const joinsAdded = useSelector((state) => state.module.joinsAdded);
  const wholeState = useSelector((state) => state.module);
  const logs = useSelector((state) => state.module.logs);
  const tabValue = useSelector((state) => state.module.tabValue);
  const ui_config = useSelector((state) => state.module.ui_config);
  const isBOMDataLoaded = useSelector((state) => state.module.isBOMDataLoaded);

  const preprocessMetadata = useSelector(
    (state) => state.module.preprocessMetadata
  );
  const experimentBasePath = useSelector(
    (state) => state.dashboard.experimentBasePath
  );
  const currentExperimentStatus = useSelector(
    (state) => state.module.currentExperimentStatus
  );

  const hasParquetFiles = useSelector((state) => state.module.hasParquetFiles);
  const { userInfo, currentCompany } = useAuth();

  const navigate = useNavigate();

  const configState = useSelector((state) => state.module.config);
  const dateColumns = useSelector((state) => state.module.dateColumns);
  const numericColumns = useSelector((state) => state.module.numericColumns);
  const categoricalColumns = useSelector(
    (state) => state.module.categoricalColumns
  );
  const contextBuckets = useSelector((state) => state.module.contextBuckets);
  const advanceSettingBuckets = useSelector(
    (state) => state.module.advanceSettingBuckets
  );
  const contextConfig = useSelector((state) => state.module.contextConfig);
  const currentBucket = useSelector((state) => state.module.currentBucket);
  const currentAdvanceSettingBucket = useSelector(
    (state) => state.module.currentAdvanceSettingBucket
  );
  const currentFeatureGroup = useSelector(
    (state) => state.module.currentFeatureGroup
  );
  const contextBucketsFilledFlags = useSelector(
    (state) => state.module.contextBucketsFilledFlags
  );
  const advanceSettingBucketsFilledFlags = useSelector(
    (state) => state.module.advanceSettingBucketsFilledFlags
  );
  const isNoInstanceAvailable = useSelector(
    (state) => state.module.isNoInstanceAvailable
  );
  const advancedSettingConfig = useSelector(
    (state) => state.module.advancedSettingConfig
  );
  const enrichment_bydate = useSelector(
    (state) => state.module.enrichment_bydate
  );
  const enrichment = useSelector((state) => state.module.enrichment);
  const operations = useSelector((state) => state.module.operations);
  const adjust_data = useSelector((state) => state.module.adjust_data);
  const exogenous_features = useSelector(
    (state) => state.module.exogenous_features
  );
  const exogenous_feature = useSelector(
    (state) => state.module.exogenous_feature
  );
  const datePair = useSelector((state) => state.module.datePair);
  const trial_params_mlp = useSelector(
    (state) => state.module.trial_params_mlp
  );
  const trial_params_lstm = useSelector(
    (state) => state.module.trial_params_lstm
  );
  const trial_params_gru = useSelector(
    (state) => state.module.trial_params_gru
  );
  const isMLSettingsDone = useSelector(
    (state) => state.module.isMLSettingsDone
  );
  const isFeatureSettingsDone = useSelector(
    (state) => state.module.isFeatureSettingsDone
  );
 
  const job_list = useSelector((state) => state.module.job_list);
  const taggedOptions = useSelector((state) => state.module.taggedOptions);
  const editedFiles = useSelector((state) => state.module.editedFiles);
  const editHistories = useSelector((state) => state.module.editHistories);
  const newRows = useSelector((state) => state.module.newRows || []);
  const deletedRows = [];
  const hasConflict = useSelector((state) => state.module.hasConflict);
  const allColumns = useSelector((state) => state.module.allColumns);
  const show_dataset_groups = useSelector((state) => state.module.show_dataset_groups);
  const showBomDataset = useSelector((state) => state.module.showBomDataset);
  const showFutureDataset = useSelector(
    (state) => state.module.showFutureDataset
  );
  const showForecastDataset = useSelector(
    (state) => state.module.showForecastDataset
  );
  const showNewProductsDataset = useSelector(
    (state) => state.module.showNewProductsDataset
  );
  const showSimpleDisaggregateMappingDataset = useSelector(
    (state) => state.module.showSimpleDisaggregateMappingDataset
  );
  const showForecastRewriteDataset = useSelector(
    (state) => state.module.showForecastRewriteDataset
  );
  const RiskColumn = useSelector((state) => state.module.RiskColumn);
   const dialogState = useSelector(
    (state) =>
      state.module.dialogState || {
        dialogOpen: false,
        dialogDatasetTag: "",
        dialogDatasetTitle: "",
      }
  );


  const onClickDatasetCard = (tag) => {
    dispatch(selectDatasetCard(tag));
    console.log(currentDatasetTag);
  };


   const handleOpenDatasetDialog = (tag, title = "") => {
    console.log("OpenDialogCalled");
    dispatch(openDatasetDialog({ tag, title }));
  };

  const handleCloseDatasetDialog = () => {
    onClickDatasetCard("none");
    dispatch(closeDatasetDialog());
  };
  const renameExperimentAndReload = async (
    experimentID,
    newExperimentName,
    moduleName,
    updatedAt
  ) => {
    try {
      const tokenPayload = {
        experimentID,
        newExperimentName,
        moduleName,
        updatedAt,
      };
      console.log("tokenPaylod " + JSON.stringify(tokenPayload));
      await renameExperiment(tokenPayload, currentCompany, userInfo.userID);
      await loadExperiementsList(userInfo);
    } catch (error) {
      console.error("Error renaming experiment:", error);
      throw error;
    }
  };

  const setShowDatasetGroups = (key, value) => {
    dispatch(SetShowDatasetGroups({ key, value }));
  };
  const setRiskColumn = (riskColumn) => {
    dispatch(SetRiskColumn(riskColumn));
  };
  const setEnrichment = (enrichment) => {
    dispatch(SetEnrichment(enrichment));
  };
  const setAdjustment = (adjustment) => {
    dispatch(SetAdjustment(adjustment));
  };

  const isArchiveAndProductionAndReload = async (
    experimentID,
    fieldToUpdate,
    value
  ) => {
    try {
      const tokenPayload = {
        experimentID,
        fieldToUpdate,
        value,
      };
      console.log("tokenPaylod " + JSON.stringify(tokenPayload));
      await isArchiveAndProduction(
        tokenPayload,
        currentCompany,
        userInfo.userID
      );
      await loadExperiementsList(userInfo);
    } catch (error) {
      console.error("Error renaming experiment:", error);
      throw error;
    }
  };

  const removeNewProductOperation =  async() => dispatch(remove_new_product_operation())

  const updateTagFieldByPath = (path, value) => {
    dispatch(updateLoadedDatasetByPath({ path, value }));
  };

  const setDashboardLoading = (value) => {
    dispatch(SetDashboardLoading(value));
  };

  const setTabValue = (value) => {
    return dispatch(SetTabValue(value));
  };
  const setExperimentStatus = async (experimentStatus) => {
    return dispatch(SetExperimentStatus({ experimentStatus }))
      .then((data) => {
        console.log("current Experiment Status:", data);
        return data; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const updateJoinDataByPath = (path, value) => {
    dispatch(UpdateJoinDataByPath({ path, value }));
  };

  const loadExperiementsList = (userInfo) => {
    dispatch(loadExperimentList(userInfo));
  };

  const deleteTheExperiments = (currentCompany, userInfo, payload) => {
    dispatch(
      deleteTheExperiment(
        currentCompany,
        userInfo,
        payload,
        loadExperiementsList
      )
    );
  };

  const terminateTheExperiments = (currentCompany, userInfo, payload) => {
    return dispatch(
      terminateTheExperiment(
        currentCompany,
        userInfo,
        payload,
        loadExperiementsList
      )
    );
  };

  const getJoinFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = wholeState;

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
  const getTagFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = loadedDataset;
    console.log("current", current);

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

  const createExperiment = async (moduleName, userID, silent = false) => {
    try {
      const ai_config = await fetchJsonFromS3(
        `ai_modules/usecase_pipelines/${moduleName}/config.json`,
        userID
      );
      const ui_config = await fetchJsonFromS3(
        `ai_modules/usecase_pipelines/${moduleName}/ui_config.json`,
        userID
      );

      const allTags = await fetchJsonFromS3(
        `ai_modules/usecase_pipelines/${moduleName}/allTags.json`,
        userID
      );
      const allContextFeatures = await fetchJsonFromS3(
        `ai_modules/usecase_pipelines/${moduleName}/allContextFeatures.json`,
        userID
      );
      const allAdvancedSettings = await fetchJsonFromS3(
        `ai_modules/usecase_pipelines/${moduleName}/allAdvancedSettings.json`,
        userID
      );

      const UI_CONFIG = processUIConfig(ui_config, allTags, allContextFeatures, allAdvancedSettings);
      dispatch(clearCache());
      console.log("ai_config", ai_config);
      console.log("UI_CONFIG", UI_CONFIG);
      dispatch(setConfigCache({ ai_config, ui_config: UI_CONFIG }));
      if (!silent) {
        navigate(
        `/${currentCompany.companyName}/experiments/create-experiment/${moduleName}`
      );
      }
    } catch (error) {
      console.error("Error loading config at handleClick:", error);
    }
  };
  const getExperimentName = (projectName) => {
    if (projectName === "") {
      return projectName;
    }

    // Check if the name ends with 'Clone' (e.g., 'Project_Clone')
    const cloneRegex = /_Clone$/;
    // Check if the name ends with 'Clone_<number>' (e.g., 'Project_Clone_1')
    const cloneWithNumberRegex = /_Clone_(\d+)$/;

    if (cloneWithNumberRegex.test(projectName)) {
      // If it ends with 'Clone_<number>', increment the number
      return projectName.replace(
        cloneWithNumberRegex,
        (_, num) => `_Clone_${parseInt(num, 10) + 1}`
      );
    } else if (cloneRegex.test(projectName)) {
      // If it ends with 'Clone', append '_1'
      return projectName + "_1";
    } else {
      // Default case: Append '_Clone'
      return `${projectName}_Clone`;
    }
  };

  const cloneExperiment = async () => {
    try {
      let tables_filter_data = {};

      try {
        const exp_tablesFilterData = await fetchJsonFromS3(
          `${experimentBasePath}/custom_report/tablesFilterData.json`,
          userInfo.userID
        );

        // Process all files in parallel using Object.entries and Promise.all
        await Promise.all(
          Object.entries(exp_tablesFilterData).map(
            async ([fileName, fileData]) => {
              // Check if file has Default filter data
              if (fileData?.["Default"]?.filterData) {
                const filterData = {
                  ...fileData["Default"].filterData,
                  aggregatedValuesHistory: [],
                };

                const convertedExperimentBasePath = experimentBasePath
                  .split("/")
                  .join("_");
                const shortFileName = fileName
                  .split(`${convertedExperimentBasePath}_`)
                  .pop();

                // Add filter data directly to tables_filter_data

                tables_filter_data[shortFileName] = filterData;
              }
            }
          )
        );
      } catch (error) {
        console.error("Error fetching tables filter data:", error);
        tables_filter_data = {};
      }

      function removeBasePathFromConfig(config, basePath) {
        // Convert the base path to a regex pattern that matches either forward slashes or underscores
        const basePathPattern = basePath.replace(/\//g, "[\\/_]");
        const basePathRegex = new RegExp(`^${basePathPattern}[\\/_]?`);

        // Loop through each report in the config
        for (const reportKey in config) {
          if (config.hasOwnProperty(reportKey)) {
            const report = config[reportKey];

            // Remove base path from filePath
            if (report.filePath && report.filePath.startsWith(basePath)) {
              report.filePath = report.filePath.substring(basePath.length + 1); // +1 to remove the trailing slash
            }

            // Remove base path from fileName
            if (report.fileName) {
              // Replace both forward slashes and underscores with a standard pattern
              report.fileName = report.fileName.replace(basePathRegex, "");
            }
          }
        }

        return config;
      }
      let byor_config = {};

      try {
        const byor_config_clone = await fetchJsonFromS3(
          `${experimentBasePath}/custom_report/BYORDataConfig.json`,
          userInfo.userID
        );

        byor_config = removeBasePathFromConfig(
          byor_config_clone,
          experimentBasePath
        );
      } catch (error) {
        console.error("Error fetching tables filter data:", error);

        byor_config = {};
      }

      const folderPath = `${experimentBasePath}/byor_base_datasets/`;

      const payload = { folderPath };
      const files = await listFilesInFolderEndpoint(payload, userInfo.userID);

      // Filter only CSV files
      const logFiles = files.filter((file) => file.Key.endsWith(".csv"));

      // Extract folder names right before output.csv
      const datasetNames = logFiles.map((file) => {
        const parts = file.Key.split("/");
        return parts[parts.length - 2]; // the folder just before "output.csv"
      });

      console.log("Dataset Names:", datasetNames);

      const newConfig = {
        ...configState,
        tables_filter_data,
        byor_config,
        byor_base_datasets: configState.baseDatasets || datasetNames || [],

        project_setup: {
          ...configState.project_setup,
          project_name: getExperimentName(
            configState.project_setup.project_name
          ),
        },
      };
      console.log("New Config", newConfig);
      await dispatch(setConfigCache({ ai_config: newConfig, ui_config }));
      dispatch(clearCache());
      console.log(newConfig);
      dispatch(setConfigCache({ ai_config: newConfig, ui_config }));
      // await confirmAddData();
      navigate(
        `/${currentCompany.companyName}/experiments/create-experiment/${configState.project_setup.usecase_name}`
      );
    } catch (error) {
      console.error("Error loading config at handleClick:", error);
    }
  };

  const discardExperiment = async () => {
    try {
      dispatch(clearCache());
      dispatch(ClearConfigCache());
    } catch (error) {
      throw error;
    }
  };

  const ClearCache = async () => {
    try {
      dispatch(clearCache());
    } catch (error) {
      throw error;
    }
  };
  const loadJoins = async () => {
    try {
      dispatch(LoadJoins());
    } catch (error) {
      throw error;
    }
  };

  const AddMetaData = async (loadedDataset) => {
    try {
      await dispatch(addMetaData({ loadedDataset }));
    } catch (error) {
      throw error;
    }
  };
  const EditMetaData = async (loadedDataset, tag, index) => {
    try {
      await dispatch(editMetaData({ loadedDataset, tag, index }));
      if (input_data === null && tag === "sales") {
        UpdateConfigFieldByPath("etl.input_data", loadedDataset.filename);
      } else if (bom_input_data === null && tag === "bom_mapping") {
        UpdateConfigFieldByPath("etl.bom_input_data", loadedDataset.filename);
      }
    } catch (error) {
      throw error;
    }
  };
  const updateConfigFieldByPath = (path, value) => {
    dispatch(UpdateConfigFieldByPath(path, value));
  };
  const ClearMetaData = async (tag, index = null) => {
    try {
      dispatch(clearMetaData({ tag, index }));
    } catch (error) {
      throw error;
    }
  };
  const AddMoreData = async (tag) => {
    try {
      dispatch(addMoreData(tag));
    } catch (error) {
      throw error;
    }
  };
  

  const loadMetaDataFromS3 = async (path, tag, userID) => {
    return dispatch(loadMetadata({ path, currentDatasetTag: tag, userID,dataset_info:ui_config.datasets.dataset_info }))
      .then((loadedData) => {
        console.log("Metadata loaded:", loadedData);
        console.log("Loaded the metadata from useExperiment Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading metadata:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };
  const loadExistingMetadata = async (loadedData,tag) => {
    return dispatch(LoadExistingMetadata({loadedData,tag,dataset_info:ui_config.datasets.dataset_info}));
  };
  const loadPreprocessMetadataFromS3 = async (path, userID) => {
    return dispatch(loadPreprocessMetadata({ path, userID }))
      .then((loadedData) => {
        console.log("Metadata loaded:", loadedData);
        console.log("Loaded the metadata from useExperiment Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading metadata:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
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

    // project_setup,
  }) => {
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() returns 0-based month
    const DATA_BUCKET_Base_PATH = `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/accounts/${clientName}_${currentCompany.companyID}/data_bucket`;
    console.log("config", config);
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
        silent
      )
    );
  };
  const uploadMetadataToS3 = async ({ metaData, path }) => {
    return dispatch(saveMetadata(path, metaData));
  };

  const SetPath = async (path) => {
    dispatch(setPath(path));
  };

  const mendatoryDataAdded = () => {
    let mandatoryDataAdded = true;
    mandatoryDatasetTags.forEach((tag) => {
      if (loadedDatasets[tag].length === 0) {
        mandatoryDataAdded = false;
      }
    });
    // console.log("Added!", mandatoryDataAdded);
    return mandatoryDataAdded;
  };

  const loadDatasetCSV = (path) => {
    dispatch(loadDataCSV({ path, userID: userInfo.userID }));
  };
  const isMandatoryDataAdded = mendatoryDataAdded();

  const exitFromViewExperiment = async () => {
    navigateTo(`/${currentCompany.companyName}/experiments`);
    await dispatch(resetExperimentConfig());
    await dispatch(setLogs(null));
  };

  const addJoins = async () => {
    let needToJoin = false;
    const {join_groups} = ui_config;
    join_groups.forEach((joinGroup) => {
      const join_operation_key = joinGroup.join_operation_key.split(".").pop();
      const joinOperations = configState.etl[join_operation_key];
      joinOperations.forEach((joinOperation) => {
        if (joinOperation.file1_col.length === 0 || joinOperation.file2_col.length === 0) {
          needToJoin = true;
          return;
        }
      });
    })
    dispatch(SetNeedToJoin(needToJoin));
    dispatch(setJoinsAdded(true));
    /*  dispatch(
      AddJoins(
        input_data,
        bom_input_data,
        join_operations,
        join_operations_future,
        join_operations_bom,
        join_operations_forecast,
        join_operations_new_product,
        join_operations_simple_disaggregation_mapping
      )
    ); */
  };

  const fetchLogs = async (userID) => {
    loadLogsFromFolder(`${experimentBasePath}/logs/`, userID)
      .then(async (logs) => {
        console.log("Processed logs:", logs);
        await dispatch(setLogs(logs));
      })
      .catch((error) => {
        console.error("Error loading logs:", error);
      });
  };

  const setFilters = {
    searchString: (value) => dispatch(setSearchString(value)),
    createdStartDate: (value) => dispatch(setCreatedStartDate(value)),
    createdEndDate: (value) => dispatch(setCreatedEndDate(value)),
    updatedStartDate: (value) => dispatch(setUpdatedStartDate(value)),
    updatedEndDate: (value) => dispatch(setUpdatedEndDate(value)),
    moduleNames: (value) => dispatch(setModuleNames(value)),
    isProduction: (value) => dispatch(setIsProduction(value)),
    statuses: (value) => dispatch(setStatuses(value)),
    reset: () => dispatch(resetFilters()),
  };

  // Add new functions from moduleSlice.js
  const setEditedFile = (fileName, editedCells) => {
    dispatch(SetEditedFile({ fileName, editedCells }));
  };

  const setEditHistories = (fileName, editHistory) => {
    dispatch(SetEditHistories({ fileName, editHistory }));
  };

  const updateConfig = (config) => {
    dispatch(UpdateConfig(config));
  };

  const setIsNoInstanceAvailable = (value) => {
    dispatch(SetIsNoInstanceAvailable(value));
  };

  const SetHasConflict = (value) => {
    dispatch(setHasConflict(value));
  };

  const setShowBomDataset = (value) => {
    dispatch(SetShowBomDataset(value));
  };

  const setShowFutureDataset = (value) => {
    dispatch(SetShowFutureDataset(value));
  };

  const setShowNewProductsDataset = (value) => {
    dispatch(SetShowNewProductsDataset(value));
  };

  const setShowForecastRewriteDataset = (value) => {
    dispatch(SetShowForecastRewriteDataset(value));
  };

  const setshowSimpleDisaggregateMappingDataset = (value) => {
    dispatch(SetshowSimpleDisaggregateMappingDataset(value));
  };

  const setShowForecastDataset = (value) => {
    dispatch(SetShowForecastDataset(value));
  };

  const removePlannerAdjustmentByIndex = (id) => {
    dispatch(RemovePlannerAdjustment(id));
  };

  const setEnrichmentDimension = (value) => {
    dispatch(SetEnrichmentDimension(value));
  };

  const setEnrichmentValue = (value) => {
    dispatch(SetEnrichmentValue(value));
  };

  const setEnrichmentEnrichmentValue = (value) => {
    dispatch(SetEnrichmentEnrichmentValue(value));
  };

  const setAdjustmentDimension = (value) => {
    dispatch(SetAdjustmentDimension(value));
  };

  const setAdjustmentValue = (value) => {
    dispatch(SetAdjustmentValue(value));
  };

  const setAdjustmentAdjustValue = (value) => {
    dispatch(SetAdjustmentAdjustValue(value));
  };

  const setEnrichmentStartDate = (value) => {
    dispatch(SetEnrichmentStartDate(value));
  };

  const setEnrichmentEndDate = (value) => {
    dispatch(SetEnrichmentEndDate(value));
  };

  const setAdjustmentStartDate = (value) => {
    dispatch(SetAdjustmentStartDate(value));
  };

  const setAdjustmentEndDate = (value) => {
    dispatch(SetAdjustmentEndDate(value));
  };

  const removeEnrichmentByIndex = (id) => {
    dispatch(RemoveEnrichment(id));
  };

  const removeRLAgentEnrichment = (rlAgentEnrichment) => {
    dispatch(RemoveRLAgentEnrichment(rlAgentEnrichment));
  };

  const removeExogenousFeatureByIndex = (id) => {
    dispatch(RemoveExogenousFeature(id));
  };

  const updateConfigByPath = (path, value) => {
    dispatch(UpdateConfigByPath({ path, value }));
  };

  const setConfigByKeyValue = (key, value) => {
    dispatch(SetConfigByKeyValue({ key, value }));
  };

  const confirmAddData = (loadedDatasets, datasetsLoaded) => {
    dispatch(ConfirmAddData({ loadedDatasets, datasetsLoaded }));
  };

  const loadDatasetInfo = () => {
    dispatch(LoadDatasetInfo({ userID: userInfo.userID }));
  };

  const confirmPlannerCoding = (loadedDatasets) => {
    dispatch(ConfirmPlannerCoding(loadedDatasets));
  };

  /*  const addJoins = (
    input_data,
    bom_input_data,
    join_operations,
    join_operations_future,
    join_operations_bom,
    join_operations_forecast,
    join_operations_new_product,
    join_operations_simple_disaggregation_mapping
  ) => {
    dispatch(
      addJoins(
        input_data,
        bom_input_data,
        join_operations,
        join_operations_future,
        join_operations_bom,
        join_operations_forecast,
        join_operations_new_product,
        join_operations_simple_disaggregation_mapping
      )
    );
  }; */

  const updateContextConfigFieldByPath = (path, value) => {
    dispatch(UpdateContextConfigByPath({ path, value }));
  };

  const confirmAddContext = (loadedDatasets) => {
    dispatch(ConfirmAddContext(loadedDatasets));
  };

  const restoreMLToDefault = (bucket, featureGroup) => {
    dispatch(RestoreMLToDefault({ bucket, featureGroup }));
  };

  const setCurrentBucket = (currentBucket) => {
    dispatch(SetCurrentBucket(currentBucket));
  };

  const setCurrentAdvanceSettingBucket = (currentAdvanceSettingBucket) => {
    dispatch(SetCurrentAdvanceSettingBucket(currentAdvanceSettingBucket));
  };

  const updateAdjustDataByPath = (path, value) => {
    dispatch(UpdateAdjustDataByPath({ path, value }));
  };

  const updateEnrichmentByPath = (path, value) => {
    dispatch(UpdateEnrichmentByPath({ path, value }));
  };

  const updateDatePairByPath = (path, value) => {
    dispatch(UpdateDatePairByPath({ path, value }));
  };

  const removeItem = (arrayName, index, featureGroup) => {
    dispatch(RemoveItem({ arrayName, index, featureGroup }));
  };

  const addDates = () => {
    dispatch(AddDates());
  };

  const deleteBaseDataset = (datasetName) => {
    dispatch(DeleteBaseDataset(datasetName));
  };

  const addBaseDataset = (datasetName) => {
    dispatch(AddBaseDataset(datasetName));
  };

  const setBaseDatasets = (datasetNames) => {
    dispatch(SetBaseDatasets(datasetNames));
  };

  const setDeletedBaseDatasets = (datasetNames) => {
    dispatch(SetDeletedBaseDatasets(datasetNames));
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

  const loadFilterToConfig = (filterData, fileName) => {
    dispatch(LoadFilterToConfig({ filterData, fileName }));
  };

  const clearConfigCache = () => {
    dispatch(ClearConfigCache());
  };

  const setEnrichment_bydate = (value) => {
    dispatch(SetEnrichment_bydate(value));
  };

  const setAdjustment_bydate = (value) => {
    dispatch(SetAdjustment_bydate(value));
  };

  const loadExperimentConfigFromS3 = async (
    moduleName,
    experimentId,
    userInfo,
    currentCompany
  ) => {
    return dispatch(
      loadExperimentConfig({
        moduleName,
        experimentId,
        userInfo,
        currentCompany,
      })
    )
      .then(async (loadedData) => {
        const ui_config = await fetchJsonFromS3(
          `ai_modules/usecase_pipelines/${moduleName}/ui_config.json`,
          userInfo.userID
        );
        const allTags = await fetchJsonFromS3(
          `ai_modules/usecase_pipelines/${moduleName}/allTags.json`,
          userInfo.userID
        );
        const allContextFeatures = await fetchJsonFromS3(
          `ai_modules/usecase_pipelines/${moduleName}/allContextFeatures.json`,
          userInfo.userID
        );
        const allAdvancedSettings = await fetchJsonFromS3(
          `ai_modules/usecase_pipelines/${moduleName}/allAdvancedSettings.json`,
            userInfo.userID
        );
        const UI_CONFIG = processUIConfig(ui_config, allTags, allContextFeatures, allAdvancedSettings);

        // dispatch(clearCache());

        console.log("Experiment Config loaded:", loadedData);
        const dashboardConfig = {
          ...loadedData,
          // contextBuckets: Object.fromEntries(
          //   Object.entries(loadedData.contextBuckets).filter(
          //     ([key]) => key !== "FC"
          //   )
          // ),
        };
        await dispatch(
          setConfigCache({ ai_config: loadedData, ui_config: UI_CONFIG })
        );
        await dispatch(SetContextConfig(dashboardConfig));
        if (loadedData.contextBucketsFilledFlags !== undefined) {
          await dispatch(
            SetContextBucketsFilledFlags(loadedData?.contextBucketsFilledFlags)
          );
        }
        if (loadedData.advanceSettingBucketsFilledFlags !== undefined) {
          await dispatch(
            SetAdvanceSettingBucketsFilledFlags(
              loadedData?.advanceSettingBucketsFilledFlags
            )
          );
        }

        console.log("Experiment Config loaded:", loadedData);
        console.log("Loaded the config from useExperiment Level");
        // await confirmAddData(
        //   loadedData.loadedDatasets,
        //   loadedData.datasetsLoaded
        // );

        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading config:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const loadExistingMetaData = async (loadedData, tag) => {
    return dispatch(LoadExistingMetadata({ loadedData, tag, dataset_info:ui_config.datasets.dataset_info }))
      .then((loadedData) => {
        console.log("Existing Metadata loaded:", loadedData);
        console.log("Loaded the metadata from useExperiment Level");
        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading metadata:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
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
    console.log("getContextConfigFieldByPath called", path);
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

  const updateExogenousFeatureByPath = (path, value) => {
    dispatch(UpdateExogenousFeatureByPath({ path, value }));
  };

  const setFeatureGroup = (featureGroup) => {
    dispatch(SetFeatureGroup(featureGroup));
  };

  const restoreToDefault = (bucket, featureGroup) => {
    dispatch(RestoreToDefault({ bucket, featureGroup }));
  };

  const confirmContextGroup = (contextGroup) => {
    dispatch(ConfirmContextGroup(contextGroup));
  };

  const addDisaggregateInventoryMetricsGranularity = () => {
    dispatch(AddDisaggregateInventoryMetricsGranularity());
  };

  const confirmAdvanceSettingsGroup = (advanceSettingGroup) => {
    dispatch(ConfirmAdvanceSettingsGroup(advanceSettingGroup));
  };

  const getDataByArrayName = (arrayName) => {
    const data = configState[arrayName];
    console.log(data);

    return configState[arrayName] || [];
  };

  const addAdjustData = () => {
    dispatch(AddAdjustData());
  };
  const addEnrichment = () => {
    dispatch(AddEnrichment());
  };
  const addExogenousFeature = () => {
    dispatch(AddExogenousFeature());
  };
  const confirmMLAdvancedSettings = () => {
    dispatch(ConfirmMLAdvancedSettings());
  };
  const addTrialParams = (newParam, modelType) => {
    dispatch(AddTrialParams({ newParam, modelType }));
  };

  const editTrialParams = (newParam, index, modelType) => {
    dispatch(EditTrialParams({ newParam, index, modelType }));
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

  const resetAdvanceSettingToDefault = (bucket, featureGroup) => {
    dispatch(ResetAdvanceSettingToDefault(bucket, featureGroup));
  };

  const setNewRows = (fileName, newRows) => {
    dispatch(SetNewRows({ fileName, newRows }));
  };

  const setDeletedRows = (fileName, deletedRows) => {
    dispatch(SetDeletedRows({ fileName, deletedRows }));
  };

  return {
    ui_config,
    isBOMDataLoaded,
    createExperiment,
    loadExperimentConfigFromS3,
    onClickDatasetCard,
    currentDatasetTag,
    loadExistingMetaData,
    defaultConfig,
    renderDatasets,
    discardExperiment,
    loadedDataset,
    updateTagFieldByPath,
    getTagFieldByPath,
    tagFieldConfig,
    loadMetaDataFromS3,
    uploadMetadataToS3,
    loadedDatasets,
    AddMetaData,
    datasetsLoaded,
    ClearMetaData,
    AddMoreData,
    renderDataStepsList,
    path,
    SetPath,
    columnsInUse,
    areMandatoryFieldsFilled,
    experiments_list,
    loadExperiementsList,
    deleteTheExperiments,
    terminateTheExperiments,
    mandatoryDatasetTags,
    isMandatoryDataAdded,
    loadDatasetCSV,
    loadedDatasetCSV,
    exitFromViewExperiment,
    experiment_config,
    addJoins,
    loadJoins,
    updateJoinDataByPath,
    input_data,
    join_operations,
    join_operations_future,
    join_operations_bom,
    join_operations_forecast,
    join_operations_new_product,
    join_operations_simple_disaggregation_mapping,
    needToJoin,
    joinsAdded,
    ClearCache,
    getJoinFieldByPath,
    fetchLogs,
    logs,
    setExperimentStatus,
    currentExperimentStatus,
    cloneExperiment,
    tabValue,
    setTabValue,
    filters,
    preprocessMetadata,
    loadPreprocessMetadataFromS3,
    loadExistingMetadata,
    EditMetaData,
    datasetsAdded,
    hasParquetFiles,
    setFilters,
    renameExperimentAndReload,
    isArchiveAndProductionAndReload,
    configState,
    dateColumns,
    numericColumns,
    categoricalColumns,
    contextBuckets,
    advanceSettingBuckets,
    contextConfig,
    currentBucket,
    currentAdvanceSettingBucket,
    currentFeatureGroup,
    contextBucketsFilledFlags,
    advanceSettingBucketsFilledFlags,
    isNoInstanceAvailable,
    advancedSettingConfig,
    enrichment_bydate,
    enrichment,
    operations,
    adjust_data,
    exogenous_features,
    exogenous_feature,
    datePair,
    trial_params_mlp,
    trial_params_lstm,
    trial_params_gru,
    isMLSettingsDone,
    isFeatureSettingsDone,
    job_list,
    taggedOptions,
    editedFiles,
    editHistories,
    newRows,
    deletedRows,
    hasConflict,
    uploadConfigToS3,
    setEditedFile,
    setEditHistories,
    updateConfig,
    setIsNoInstanceAvailable,
    SetHasConflict,
    setShowBomDataset,
    setShowFutureDataset,
    setShowNewProductsDataset,
    setShowForecastRewriteDataset,
    setshowSimpleDisaggregateMappingDataset,
    setShowForecastDataset,
    removePlannerAdjustmentByIndex,
    setEnrichmentDimension,
    setEnrichmentValue,
    setEnrichmentEnrichmentValue,
    setAdjustmentDimension,
    setAdjustmentValue,
    setAdjustmentAdjustValue,
    setEnrichmentStartDate,
    setEnrichmentEndDate,
    setAdjustmentStartDate,
    setAdjustmentEndDate,
    removeEnrichmentByIndex,
    removeExogenousFeatureByIndex,
    updateConfigByPath,
    setConfigByKeyValue,
    confirmAddData,
    confirmPlannerCoding,
    updateContextConfigFieldByPath,
    confirmAddContext,
    restoreMLToDefault,
    setCurrentBucket,
    updateAdjustDataByPath,
    updateEnrichmentByPath,
    updateDatePairByPath,
    removeItem,
    addDates,
    deleteBaseDataset,
    addBaseDataset,
    setBaseDatasets,
    setDeletedBaseDatasets,
    confirmAdvancedSettings,
    loadFilterToConfig,
    clearConfigCache,
    setEnrichment_bydate,
    setAdjustment_bydate,
    allColumns,
    showBomDataset,
    showFutureDataset,
    showForecastDataset,
    showNewProductsDataset,
    showSimpleDisaggregateMappingDataset,
    showForecastRewriteDataset,
    updateConfigFieldByPath,
    getConfigFieldByPath,
    getContextConfigFieldByPath,
    getAdjustDataFieldByPath,
    getEnrichmentFieldByPath,
    getExogenousFeatureFieldByPath,
    getDatePairFieldByPath,
    updateExogenousFeatureByPath,
    setFeatureGroup,
    restoreToDefault,
    confirmContextGroup,
    addDisaggregateInventoryMetricsGranularity,
    setCurrentAdvanceSettingBucket,
    confirmAdvanceSettingsGroup,
    getDataByArrayName,
    addAdjustData,
    addEnrichment,
    addExogenousFeature,
    confirmMLAdvancedSettings,
    addTrialParams,
    editTrialParams,
    getTrialParam,
    resetAdvanceSettingToDefault,
    show_dataset_groups,
    setShowDatasetGroups,
    setEnrichment,
    setAdjustment,
    removeRLAgentEnrichment,
    RiskColumn,
    setRiskColumn,
    dashboardLoading,
    setDashboardLoading,
    dialogOpen: dialogState.dialogOpen,
    dialogDatasetTag: dialogState.dialogDatasetTag,
    dialogDatasetTitle: dialogState.dialogDatasetTitle,
    handleOpenDatasetDialog,
    handleCloseDatasetDialog,
    removeNewProductOperation,
    loadDatasetInfo,
    setNewRows,
    setDeletedRows,
  };
};

export default useModule;
