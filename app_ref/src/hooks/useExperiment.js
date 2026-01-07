// useExperiment.js
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useConfig from "./useConfig";
import {
  selectDatasetCard,
  setCache,
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
} from "../redux/slices/experimentSlice";
import {
  setAdvanceSettingBucketsFilledFlags,
  setContextConfig,
} from "../redux/slices/configSlice";
import {
  deleteTheExperiment,
  loadDatasetCSV as loadDataCSV,
  loadExperimentConfig,
  syncExperimentConfigFromS3WithEdits as SyncExperimentConfigFromS3WithEdits,
  loadExperimentList,
  loadMetadata,
  saveMetadata,
  terminateTheExperiment,
  setExperimentStatus as SetExperimentStatus,
  loadPreprocessMetadata,
  loadExistingMetadata as LoadExistingMetadata,
  addConversationIdToExperiment as AddConversationIdToExperiment,
} from "../redux/actions/experimentActions";
import { navigateTo } from "../utils/navigate";
import { addJoins as AddJoins } from "../redux/actions/configActions";
import { update } from "lodash";
import { fetchJsonFromS3, loadLogsFromFolder } from "../utils/s3Utils";
import useDashboard from "./useDashboard";
import {
  setConfig,
  setContextBucketsFilledFlags,
} from "../redux/slices/configSlice";
import useAuth from "./useAuth";
import { renameExperiment } from "../utils/renameExperiment";
import { isArchiveAndProduction } from "../utils/isArchiveAndProduction";
import { listFilesInFolderEndpoint } from "../utils/s3UtillsEndpoints";
import { config } from 'aws-sdk';
import { updateExperimentDescription } from "../utils/updateExperimentDescription";

const useExperiment = () => {
  const dispatch = useDispatch();
  const defaultConfig = useSelector((state) => state.experiment.defaultConfig);
  const loadedDataset = useSelector((state) => state.experiment.loadedDataset);
  const datasetsLoaded = useSelector(
    (state) => state.experiment.datasetsLoaded
  );
  const mandatoryDatasetTags = useSelector(
    (state) => state.experiment.mandatory_datasets_tags
  );
  const datasetsAdded = useSelector((state) => state.experiment.datasetsAdded);
  const columnsInUse = useSelector((state) => state.experiment.columnsInUse);
  const experiments_list = useSelector(
    (state) => state.experiment.experiments_list
  );
  const areMandatoryFieldsFilled = useSelector(
    (state) => state.experiment.areMandatoryFieldsFilled
  );
  const path = useSelector((state) => state.experiment.path);
  const filters = useSelector(
    (state) => state.experiment.experimentFiltersState
  );
  const renderDataStepsList = useSelector(
    (state) => state.experiment.renderDataStepsList
  );
  const loadedDatasets = useSelector(
    (state) => state.experiment.loadedDatasets
  );
  const tagFieldConfig = useSelector(
    (state) => state.experiment.tagFieldConfig
  );
  const renderDatasets = useSelector(
    (state) => state.experiment.renderDatasets
  );
  const currentDatasetTag = useSelector(
    (state) => state.experiment.currentDatasetTag
  );
  const loadedDatasetCSV = useSelector(
    (state) => state.experiment.loadedDatasetCSV
  );
  const experiment_config = useSelector(
    (state) => state.experiment.experiment_config
  );
  const input_data = useSelector((state) => state.experiment.input_data);
  const input_data_cols = useSelector(
    (state) => state.experiment.input_data_cols
  );
  const bom_input_data = useSelector(
    (state) => state.experiment.bom_input_data
  );
  const inventory_input_data = useSelector(
    (state) => state.experiment.inventory_input_data
  );
  const inventory_input_data_cols = useSelector(
    (state) => state.experiment.inventory_input_data_cols
  );

  const join_operations = useSelector(
    (state) => state.experiment.join_operations
  );
  const join_operations_inventory = useSelector(
    (state) => state.experiment.join_operations_inventory
  );
  const join_operations_future = useSelector(
    (state) => state.experiment.join_operations_future
  );
  const join_operations_bom = useSelector(
    (state) => state.experiment.join_operations_bom
  );
  const join_operations_forecast = useSelector(
    (state) => state.experiment.join_operations_forecast
  );
  const join_operations_supply_item_master = useSelector(
    (state) => state.experiment.join_operations_supply_item_master
  );
  const join_operations_new_product = useSelector(
    (state) => state.experiment.join_operations_new_product
  );
  const join_operations_transition_item = useSelector(
    (state) => state.experiment.join_operations_transition_item
  );
  const join_operations_simple_disaggregation_mapping = useSelector(
    (state) => state.experiment.join_operations_simple_disaggregation_mapping
  );
  const needToJoin = useSelector((state) => state.experiment.needToJoin);
  const joinsAdded = useSelector((state) => state.experiment.joinsAdded);
  const wholeState = useSelector((state) => state.experiment);
  const logs = useSelector((state) => state.experiment.logs);
  const tabValue = useSelector((state) => state.experiment.tabValue);

  const preprocessMetadata = useSelector(
    (state) => state.experiment.preprocessMetadata
  );
  const experimentBasePath = useSelector(
    (state) => state.dashboard.experimentBasePath
  );
  const currentExperimentStatus = useSelector(
    (state) => state.experiment.currentExperimentStatus
  );

  const hasParquetFiles = useSelector(
    (state) => state.experiment.hasParquetFiles
  );
  const { userInfo, currentCompany } = useAuth();

  const navigate = useNavigate();
  const {
    loadConfigFromS3,
    updateConfigFieldByPath,
    configState,
    loadFilterToConfig,
    deletedBaseDatasets,
    baseDatasets,
  } = useConfig();

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
  const updateExperimentDescriptionAndReload = async (
  experimentID,
  exp_description
) => {
  try {
    const tokenPayload = {
      experimentID,
      exp_description,
    };

    console.log("tokenPayload " + JSON.stringify(tokenPayload));

    await updateExperimentDescription(
      tokenPayload,
      currentCompany,
      userInfo.userID
    );

    await loadExperiementsList(userInfo);
  } catch (error) {
    console.error("Error updating experiment description:", error);
    throw error;
  }
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

  const updateTagFieldByPath = (path, value) => {
    dispatch(updateLoadedDatasetByPath({ path, value }));
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
      const response = await loadConfigFromS3(moduleName, userID);
      dispatch(clearCache());
      console.log(response);
      dispatch(setCache(response));
      if (!silent) {
        navigate(
          `/${currentCompany.companyName}/experiments/create/${moduleName}`
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
        byor_base_datasets:
          Array.isArray(baseDatasets) && baseDatasets.length > 0
            ? baseDatasets
            : Array.isArray(datasetNames) && datasetNames.length > 0
            ? datasetNames
            : [],

        project_setup: {
          ...configState.project_setup,
          project_name: getExperimentName(
            configState.project_setup.project_name
          ),
        },
      };
      console.log("New Config", newConfig);
      await dispatch(setConfig(newConfig));
      dispatch(clearCache());
      console.log(newConfig);
      dispatch(setCache(newConfig));
      // await confirmAddData();
      navigate(
        `/${currentCompany.companyName}/experiments/create/${configState.project_setup.usecase_name}`
      );
    } catch (error) {
      console.error("Error loading config at handleClick:", error);
    }
  };

  const discardExperiment = async () => {
    try {
      dispatch(clearCache());
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
      if (input_data === null && currentDatasetTag === "sales") {
        updateConfigFieldByPath("etl.input_data", loadedDataset.filename);
      } else if (
        bom_input_data === null &&
        currentDatasetTag === "bom_mapping"
      ) {
        updateConfigFieldByPath("etl.bom_input_data", loadedDataset.filename);
      }
    } catch (error) {
      throw error;
    }
  };
  const EditMetaData = async (loadedDataset, tag, index) => {
    try {
      await dispatch(editMetaData({ loadedDataset, tag, index }));
      if (input_data === null && tag === "sales") {
        updateConfigFieldByPath("etl.input_data", loadedDataset.filename);
      } else if (bom_input_data === null && tag === "bom_mapping") {
        updateConfigFieldByPath("etl.bom_input_data", loadedDataset.filename);
      }
    } catch (error) {
      throw error;
    }
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
  const onClickDatasetCard = (tag) => {
    dispatch(selectDatasetCard(tag));
    console.log(currentDatasetTag);
  };

  const loadMetaDataFromS3 = async (path, tag, userID) => {
    return dispatch(loadMetadata({ path, currentDatasetTag: tag, userID }))
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
  const loadExistingMetaData = async (loadedData, tag) => {
    return dispatch(LoadExistingMetadata({ loadedData, tag }))
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
        await dispatch(setConfig(dashboardConfig));
        await dispatch(setContextConfig(dashboardConfig));
        if (loadedData.contextBucketsFilledFlags !== undefined) {
          await dispatch(
            setContextBucketsFilledFlags(loadedData?.contextBucketsFilledFlags)
          );
        }
        if (loadedData.advanceSettingBucketsFilledFlags !== undefined) {
          await dispatch(
            setAdvanceSettingBucketsFilledFlags(
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
        await dispatch(setCache(loadedData));

        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading config:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };

  const syncExperimentConfigFromS3WithEdits = async (
    moduleName,
    config,
    currentCompany
  ) => {
    return dispatch(
      SyncExperimentConfigFromS3WithEdits({
        moduleName,
        config,
        currentCompany
      })
    )
      .then(async (loadedData) => {
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
        await dispatch(setConfig(dashboardConfig));
        await dispatch(setContextConfig(dashboardConfig));
        if (loadedData.contextBucketsFilledFlags !== undefined) {
          await dispatch(
            setContextBucketsFilledFlags(loadedData?.contextBucketsFilledFlags)
          );
        }
        if (loadedData.advanceSettingBucketsFilledFlags !== undefined) {
          await dispatch(
            setAdvanceSettingBucketsFilledFlags(
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
        await dispatch(setCache(loadedData));

        return loadedData; // Pass the loaded data downstream if needed
      })
      .catch((error) => {
        console.error("Error loading config:", error);
        throw error; // Re-throw the error to handle it in the calling component if necessary
      });
  };


  const exitFromViewExperiment = async () => {
    navigateTo(`/${currentCompany.companyName}/experiments`);
    await dispatch(resetExperimentConfig());
    await dispatch(setLogs(null));
  };

  const addJoins = async () => {
    dispatch(setJoinsAdded(true));
    dispatch(
      AddJoins(
        input_data,
        bom_input_data,
        inventory_input_data,
        join_operations,
        join_operations_inventory,
        join_operations_future,
        join_operations_bom,
        join_operations_forecast,
        join_operations_supply_item_master,
        join_operations_new_product,
        join_operations_simple_disaggregation_mapping
      )
    );
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

  const getModuleName = (experimentId) => {
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experimentId
    );
    return experiment ? experiment.experimentModuleName : null;
  };

  const addConversationIdToExperiment = async (
    experiment_id,
    conversation_id,
    userInfo) => {
    try {
      const response = await dispatch(AddConversationIdToExperiment(
        experiment_id,
        conversation_id,
        userInfo
      ));
      return response;
    } catch (error) {
      console.error("Error adding conversation ID to experiment:", error);
      throw error;
    }
  };

  return {
    createExperiment,
    onClickDatasetCard,
    currentDatasetTag,
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
    loadExperimentConfigFromS3,
    exitFromViewExperiment,
    experiment_config,
    addJoins,
    loadJoins,
    updateJoinDataByPath,
    input_data,
    input_data_cols,
    inventory_input_data_cols,
    join_operations,
    join_operations_future,
    join_operations_bom,
    join_operations_forecast,
    join_operations_supply_item_master,
    join_operations_new_product,
    join_operations_simple_disaggregation_mapping,
    join_operations_inventory,
    join_operations_transition_item,
    inventory_input_data,
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
    loadExistingMetaData,
    EditMetaData,
    datasetsAdded,
    hasParquetFiles,
    setFilters,
    getModuleName,
    renameExperimentAndReload,
    isArchiveAndProductionAndReload,
    syncExperimentConfigFromS3WithEdits,
    updateExperimentDescriptionAndReload,
    addConversationIdToExperiment,
  };
};

export default useExperiment;
