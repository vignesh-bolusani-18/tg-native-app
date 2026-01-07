import {
  setLoading,
  setError,
  setIsNoInstanceAvailable,
  confirmAddData as ConfirmAddData,
  confirmPlannerCoding as ConfirmPlannerCoding,
  confirmAddContext as ConfirmAddContext,
  restoreToDefault as RestoreToDefault,
  addJoins as AddJoins,
  deleteBaseDataset as DeleteBaseDataset,
  addBaseDataset as AddBaseDataset,
  setBaseDatasets as SetBaseDatasets,
  setDeletedBaseDatasets as SetDeletedBaseDatasets,
  setCurrentBucket as SetCurrentBucket,
  setCurrentAdvanceSettingBucket as SetCurrentAdvanceSettingBucket,
  setFeatureGroup as SetFeatureGroup,
  confirmContextGroup as ConfirmContextGroup,
  addAdjustData as AddAdjustData,
  addEnrichment as AddEnrichment,
  addExogenousFeature as AddExogenousFeature,
  addDates as AddDates,
  removeItem as RemoveItem,
  confirmAdvancedSettings as ConfirmAdvancedSettings,
  confirmAdvanceSettingsGroup as ConfirmAdvanceSettingsGroup,
  resetAdvanceSettingToDefault as ResetAdvanceSettingToDefault,
  setAdvanceSettingBuckets as SetAdvanceSettingBuckets,
  setNewAdvanceSettingBucketsFilledFlags as SetNewAdvanceSettingBucketsFilledFlags,
  addTrialParams as AddTrialParams,
  editTrialParams as EditTrialParams,
  restoreMLToDefault as RestoreMLToDefault,
  loadExperiments,
  setExperimentConfig,
  setLoadedDataCSV,
  setMetadata,
  setExperimentStatus as SetExperimentStatus,
  setTabValue as SetTabValue,
  setPreprocessMetadata,
  updateConfigByPath as UpdateConfigByPath,
  setDatasetInfo,
} from "../slices/moduleSlice";
import {
  fetchJsonFromS3,
  uploadJsonToS3,
  fetchCSVData,
} from "../../utils/s3Utils";
import { decryptData, encryptData } from "../../utils/cryptoUtils";
import { generateToken, processTokens } from "../../utils/jwtUtils";
import { addExperiment } from "../slices/experimentSlice";
import {
  addExperimentToDatabase,
  deleteExperiment,
} from "../../utils/createDBEntry";
import {
  executeExperiment,
  startInstance,
  triggerExperiment,
  triggerExperiment1,
  triggerExperimentTaskManager,
} from "../../utils/launchAIPipeline";
import { useNavigate } from "react-router-dom";
import { navigateTo } from "../../utils/navigate";
import { setIsContactSalesDialogOpen } from "../slices/authSlice";
import { handleLogoutWithMessage } from "./authActions";
import { removeDuplicates } from "../../utils/removeDuplicates";
import { getExperiments } from "../../utils/getExperiments";
import { loadFieldTags } from "../../utils/loadFieldTagsConfigurable";
import { removeUnnecessaryFieldTags } from "../../utils/Formating/loadedDatasetFormatingConfigurable";
import { terminateExperiment } from "../../utils/terminateExperiment";

// Config Actions
export const loadConfig =
  ({ moduleName, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchJsonFromS3(
        `ai_modules/usecase_pipelines/${moduleName}/config.json`,
        userID
      );
      const decryptedData = data;
      console.log("decryptedData", decryptedData);

      return decryptedData;
    } catch (error) {
      console.log("Error at config Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadDatasetInfo =
  ({userID }) =>
  async (dispatch) => {
    const data = await fetchJsonFromS3(
      `ai_modules/general_utils/datasets_info.json`,
      userID
    );
    console.log("datasets_info loaded", data);
    dispatch(setDatasetInfo(data));
    return data;
  };

export const confirmAddData =
  (loadedDatasets, datasetsLoaded) => async (dispatch, getState) => {
    await dispatch(ConfirmAddData({ loadedDatasets, datasetsLoaded }));
    const updatedConfig = getState().module.config;
    console.log("Updated Config at Action:", updatedConfig);
    return updatedConfig;
  };

export const setCurrentBucket = (currentBucket) => (dispatch) => {
  dispatch(SetCurrentBucket(currentBucket));
};

export const deleteBaseDataset = (datasetName) => (dispatch) => {
  dispatch(DeleteBaseDataset(datasetName));
};

export const addBaseDataset = (datasetName) => (dispatch) => {
  dispatch(AddBaseDataset(datasetName));
};

export const setBaseDatasets = (datasetNames) => (dispatch) => {
  dispatch(SetBaseDatasets(datasetNames));
};

export const setDeletedBaseDatasets = (datasetNames) => (dispatch) => {
  dispatch(SetDeletedBaseDatasets(datasetNames));
};

export const setNewAdvanceSettingBucketsFilledFlags = () => (dispatch) => {
  dispatch(SetNewAdvanceSettingBucketsFilledFlags());
};

export const setAdvanceSettingBuckets = () => (dispatch) => {
  dispatch(SetAdvanceSettingBuckets());
};

export const setCurrentAdvanceSettingBucket =
  (currentAdvanceSettingBucket) => (dispatch) => {
    dispatch(SetCurrentAdvanceSettingBucket(currentAdvanceSettingBucket));
  };

export const setFeatureGroup = (featureGroup) => (dispatch) => {
  dispatch(SetFeatureGroup(featureGroup));
};

export const confirmContextGroup = (contextGroup) => (dispatch) => {
  dispatch(ConfirmContextGroup(contextGroup));
};

export const confirmPlannerCoding = (loadedDatasets) => (dispatch) => {
  dispatch(ConfirmPlannerCoding(loadedDatasets));
};

export const confirmAdvanceSettingsGroup = (group) => (dispatch) => {
  dispatch(ConfirmAdvanceSettingsGroup(group));
};

export const confirmAddContext =
  (loadedDatasets) => async (dispatch, getState) => {
    await dispatch(ConfirmAddContext(loadedDatasets));
    const updatedConfig = getState().module.config;
    console.log("Updated Config at Action:", updatedConfig);
    return updatedConfig;
  };

export const restoreToDefault = (bucket, featureGroup) => (dispatch) => {
  dispatch(RestoreToDefault({ bucket, featureGroup }));
};

export const restoreMLToDefault = (bucket, featureGroup) => (dispatch) => {
  dispatch(RestoreMLToDefault({ bucket, featureGroup }));
};

export const removeItem = (index, arrayName, featureGroup) => (dispatch) => {
  dispatch(RemoveItem({ index, arrayName, featureGroup }));
};

export const resetAdvanceSettingToDefault =
  (arrayName, featureGroup) => (dispatch) => {
    dispatch(ResetAdvanceSettingToDefault({ arrayName, featureGroup }));
  };

export const addAdjustData = () => (dispatch) => {
  dispatch(AddAdjustData());
};

export const addExogenousFeature = () => (dispatch) => {
  dispatch(AddExogenousFeature());
};

export const addEnrichment = () => (dispatch) => {
  dispatch(AddEnrichment());
};

export const addTrialParams = (newParam, modelType) => (dispatch) => {
  dispatch(AddTrialParams({ newParam, modelType }));
};

export const editTrialParams = (newParam, index, modelType) => (dispatch) => {
  dispatch(EditTrialParams({ newParam, index, modelType }));
};

export const addDates = () => (dispatch) => {
  dispatch(AddDates());
};

export const confirmAdvancedSettings = () => async (dispatch, getState) => {
  await dispatch(ConfirmAdvancedSettings());
  const updatedConfig = getState().module.config;
  console.log("Updated Config at Action:", updatedConfig);
  return updatedConfig;
};

export const addJoins =
  (
    input_data,
    bom_input_data,
    join_operations,
    join_operations_future,
    join_operations_bom,
    join_operations_forecast,
    join_operations_new_product,
    join_operations_simple_disaggregation_mapping
  ) =>
  (dispatch) => {
    dispatch(
      AddJoins({
        input_data,
        bom_input_data,
        join_operations,
        join_operations_future,
        join_operations_bom,
        join_operations_forecast,
        join_operations_new_product,
        join_operations_simple_disaggregation_mapping,
      })
    );
  };

// Experiment Actions
export const loadMetadata =
  ({ path, currentDatasetTag, userID, dataset_info }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log("loadedDataset path:", path);
      const data = await fetchJsonFromS3(path, userID);
      const decryptedData = data;
      console.log("Decrypted Loaded Dataset", data);
      const newData = loadFieldTags(
        decryptedData,
        currentDatasetTag,
        dataset_info
      );
      console.log("Aggregations :", newData.data_steps[0].kwargs.aggregations);
      const filteredData = removeUnnecessaryFieldTags(
        newData,
        currentDatasetTag,
        dataset_info
      );
      console.log("Filtered Data", data);

      await dispatch(
        setMetadata({ loadedDataset: filteredData, currentDatasetTag })
      );
      console.log("MetaData Fetched:", filteredData);
      return filteredData;
    } catch (error) {
      console.log("Error at experiment Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadExistingMetadata =
  ({ loadedData, tag, dataset_info }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log("Dataset Info at actions", dataset_info);
      const newData = loadFieldTags(loadedData, tag, dataset_info);
      console.log("Aggregations :", newData.data_steps[0].kwargs.aggregations);
      const filteredData = removeUnnecessaryFieldTags(newData, tag, dataset_info);
      console.log("Filtered Data", filteredData);

      await dispatch(
        setMetadata({ loadedDataset: filteredData, currentDatasetTag: tag })
      );
      console.log("Existing MetaData Setted at actions:", filteredData);
      return filteredData;
    } catch (error) {
      console.log("Error at experiment Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadPreprocessMetadata =
  ({ path, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      console.log("loadedDataset path:", path);
      const data = await fetchJsonFromS3(path, userID);
      await dispatch(setPreprocessMetadata(data));
      console.log("MetaData Fetched:", data);
      return data;
    } catch (error) {
      console.log("Error at experiment Actions!", error);
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadExperimentList = (userInfo) => async (dispatch) => {
  console.log("loadExperimentList called");
  try {
    const response = await getExperiments(userInfo.userID);
    const rawExperiments = await processTokens(response);
    const decodedExperiments = rawExperiments.map(flattenAttributes);

    const formatDate = (date) => {
      if (!isNaN(date)) {
        const dateObj = new Date(date);
        const datePart = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(dateObj);

        const timePart = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(dateObj);

        return `${datePart}, at ${timePart}`;
      }

      try {
        return formatDateString(date);
      } catch (error) {
        console.error("Invalid date string:", error);
      }

      return date;
    };

    function convertToTimestamp(dateString) {
      const date = new Date(dateString.replace(/ at /, " "));
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
      return date.getTime();
    }

    const formatDateString = (dateString) => {
      const monthMap = {
        January: "Jan",
        February: "Feb",
        March: "Mar",
        April: "Apr",
        May: "May",
        June: "Jun",
        July: "Jul",
        August: "Aug",
        September: "Sep",
        October: "Oct",
        November: "Nov",
        December: "Dec",
      };

      const regex =
        /(\w+) (\d{1,2}), (\d{4}) at (\d{1,2}:\d{2}:\d{2} [APM]{2})/;
      const match = dateString.match(regex);

      if (match) {
        const fullMonth = match[1];
        const day = match[2];
        const year = match[3];
        const time = match[4];

        const abbreviatedMonth = monthMap[fullMonth];
        return `${abbreviatedMonth} ${day}, ${year} at ${time}`;
      }

      return dateString;
    };

    const updatedExperiments = decodedExperiments.map((experiment) => ({
      ...experiment,
      updatedAt: formatDate(experiment.updatedAt),
      createdAt: formatDate(experiment.createdAt),
    }));

    const sortExperiments = (experiments) => {
      return experiments.sort(
        (a, b) =>
          convertToTimestamp(b.updatedAt) - convertToTimestamp(a.updatedAt)
      );
    };

    const sortedExperiments = sortExperiments(updatedExperiments);
    dispatch(loadExperiments(sortedExperiments));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const deleteTheExperiment =
  (currentCompany, userInfo, payload, loadExperimentsList) =>
  async (dispatch) => {
    deleteExperiment(payload, currentCompany, userInfo.userID)
      .then(async (response) => {
        console.log("Experiment deleted successfully", response);
        await loadExperimentsList(userInfo);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
  };

export const terminateTheExperiment =
  (currentCompany, userInfo, payload, loadExperimentsList) =>
  async (dispatch) => {
    await loadExperimentsList(userInfo);
    terminateExperiment(payload, currentCompany, userInfo.userID)
      .then(async (response) => {
        console.log("Experiment terminated successfully", response);
        await loadExperimentsList(userInfo);
        return response;
      })
      .catch((error) => {
        dispatch(setError(error.message));
      });
  };

export const saveMetadata = (path, metaData) => async (dispatch) => {
  const filePath = path;
  try {
    const encryptedData = metaData;
    console.log("data before going to S3", encryptedData);
    await uploadJsonToS3(filePath, encryptedData);
    console.log("hi");
  } catch (error) {
    console.log(error);
    dispatch(setError(error.toString()));
  }
};

export const loadDatasetCSV =
  ({ path, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchCSVData({
        filePath: path,
        filterData: null,
        paginationData: { batchNo: 1, batchSize: 50 },
        sortingData: null,
      });
      const decryptedData = data;
      console.log(path);
      await dispatch(setLoadedDataCSV(decryptedData));
      console.log(" Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at experiment Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadExperimentConfig =
  ({ experimentId, moduleName, currentCompany }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchJsonFromS3(
        `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${moduleName}/${experimentId}/config.json`
      );
      const decryptedData = data;
      await dispatch(setExperimentConfig(decryptedData));
      console.log("config.json Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at experiment Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const setExperimentStatus =
  ({ experimentStatus }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await dispatch(SetExperimentStatus(experimentStatus));
      console.log("current Experiment Status", experimentStatus);
      return experimentStatus;
    } catch (error) {
      console.log("Error at experiment Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

// Helper function for flattening attributes
const flattenAttributes = (item) => {
  const flattened = {};
  for (const key in item) {
    if (typeof item[key] === "object" && item[key] !== null) {
      Object.assign(flattened, flattenAttributes(item[key]));
    } else {
      flattened[key] = item[key];
    }
  }
  return flattened;
};

// Helper function for getting cookie
const getCookie = async (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

export const saveConfig =
  (
    config,
    clientName,
    moduleName,
    experimentId,
    userInfo,
    currentCompany,
    runType,
    loadExperimentList,
    createdAt,
    runDEPipeline = true,
    silent = false
  ) =>
  async (dispatch, getState) => {
    const filePath = `accounts/${clientName}_${currentCompany.companyID}/customer_data/configs/${moduleName}/${experimentId}/config.json`;
    const dataConfigFilePath = `accounts/${clientName}_${currentCompany.companyID}/customer_data/configs/${moduleName}/${experimentId}/data_config.json`;
    const job_list = removeDuplicates(
      getState().module?.job_list
        ? getState().module.job_list
        : config.job_list ?? []
    );
    const refreshToken = await getCookie("refresh_token_company");
    try {
      // console.log("Config before going to S3: ", encryptedData);

      const formatCurrentDateTime = () => {
        return new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true, // Use 12-hour format with AM/PM
        });
      };
      let experimentPayload;
      if (createdAt !== null) {
        console.log("createdAt", createdAt);
        experimentPayload = {
          companyID: currentCompany.companyID,
          userID: userInfo.userID,
          experimentTableName: `EXPERIMENTS`,
          experimentName: config.project_setup.project_name,
          experimentModuleName: moduleName,
          experimentStatus: "Queued", // comment this line to comment the task manager
          // experimentStatus: "Initiating...", // uncomment this line to comment the task manager
          experimentID: experimentId,
          createdAt: Math.floor(
            new Date(createdAt.replace(" at", "")).getTime()
          ), // Set createdAt to the current date and time
          updatedAt: Date.now(), // Set updatedAt to the current date and time
          createdBy: userInfo.userName,
          experimentPath: filePath,
          experimentRunType: runType, //
          inTrash: false,
          time: Date.now(),
        };
      } else {
        experimentPayload = {
          companyID: currentCompany.companyID,
          userID: userInfo.userID,
          experimentTableName: `EXPERIMENTS`,
          experimentName: config.project_setup.project_name,
          experimentModuleName: moduleName,
          experimentStatus: "Queued", // comment this line to comment the task manager
          // experimentStatus: "Initiating...", // uncomment this line to comment the task manager
          experimentID: experimentId,
          createdAt: Date.now(), // Set createdAt to the current date and time
          updatedAt: Date.now(), // Set updatedAt to the current date and time
          createdBy: userInfo.userName,
          experimentPath: filePath,
          experimentRunType: runType, //
          inTrash: false,
          time: Date.now(),
        };
      }

      console.log("Experiment Payload", experimentPayload);
      // const startInstancePayload = {
      //   resourceGroupID: currentCompany.companyID,
      //   tableName: `EXPERIMENTS`,
      //   experimentID: experimentId,
      //   experimentRegion: process.env.REACT_APP_AWS_REGION,
      //   companyName: currentCompany.companyName,
      //   time: performance.now(),
      // };
      // Add experiment to database
      await uploadJsonToS3(filePath, { ...config, job_list });
      try {
        const response = await addExperimentToDatabase(
          experimentPayload,
          currentCompany,
          userInfo.userID
        );

        console.log("Add Experiment Response", response);
        await loadExperimentList(userInfo);
        if (!silent) {
          navigateTo(`/${currentCompany.companyName}/experiments`);
        }
      } catch (error) {
        const errorMessage = error.message || "";
        const lastWord = errorMessage.split(" ").pop(); // Get the last word of the error message

        if (lastWord === "405") {
          dispatch(setIsContactSalesDialogOpen(true));
        } else {
          dispatch(setError(errorMessage));
        }
      }

      const executeDEPayload = {
        experimentModuleName: moduleName,
        experimentTableName: `EXPERIMENTS`,
        experimentID: experimentId,
        experimentRegion: process.env.REACT_APP_AWS_REGION,
        experimentPath: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${dataConfigFilePath}`,
        experimentBucketName: process.env.REACT_APP_AWS_BUCKET_NAME,
        refreshAuthToken: refreshToken,
        companyName: currentCompany.companyName,
        experimentRunType: runType,
        commandType: "data",
        time: performance.now(),
      };

      const executeExperimentPayload = {
        experimentModuleName: moduleName,
        experimentTableName: `EXPERIMENTS`,
        experimentID: experimentId,
        experimentRegion: process.env.REACT_APP_AWS_REGION,
        experimentPath: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${filePath}`,
        experimentBucketName: process.env.REACT_APP_AWS_BUCKET_NAME,
        refreshAuthToken: refreshToken,
        companyName: currentCompany.companyName,
        experimentRunType: runType,
        commandType: "experiment",
        time: performance.now(),
      };

      if (job_list.length > 0 && runType !== "run_scenario") {
        console.log("Running DE Pipeline");
      } else {
        console.log("Not Running DE Pipeline");
      }
      const finalPayload =
        job_list.length > 0 && runType !== "run_scenario"
          ? runDEPipeline
            ? executeDEPayload
            : executeExperimentPayload
          : executeExperimentPayload;
      if (finalPayload === executeDEPayload) {
        console.log("Running DE Pipeline");
      }
      console.log("ExecuteExperiment Payload: ", finalPayload);

      try {
        //comment below lines to comment the task manager
        console.log("Triggering Experiment Task Manager");
        const response = await triggerExperimentTaskManager(
          finalPayload,
          currentCompany
        );
        console.log("Trigger Experiment Response: Task ID", response.taskId);

        // uncomment below lines to comment the task manager
        // console.log("Triggering Experiment using Lambda");
        // const response = await triggerExperiment(finalPayload, currentCompany);

        // if (job_list.length > 0) {
        //   const data_config = {
        //     user_id: config.common.user_name,
        //     wait_time: 60,
        //     timeout: 1800,
        //     job_id: "test_job",
        //     job_created_at: formatCurrentDateTime(Date.now()),
        //     attached_experiment_args: {
        //       module_name: config.common.module_name,
        //       job_id: config.common.job_id,
        //       config_path: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${filePath}`,
        //       run_type: runType,
        //     },
        //     activity_end_date: config.etl.activity_end_date,
        //     job_list,
        //     run_data_pull: true,
        //     run_data_clean: true,
        //     trigger_next: true,
        //     instanceId: instanceId,
        //     dbUserID: userInfo.userID,
        //   };
        //   console.log("Uploading data config to s3", data_config);
        //   await uploadJsonToS3(dataConfigFilePath, data_config);
        // }

        // // Upload Config to S3
        // const new_config = { ...config, instanceId };
        // await uploadJsonToS3(filePath, new_config);
        await loadExperimentList(userInfo);
      } catch (error) {
        dispatch(setError(error.message));

        // Handle "On Hold" and "Failed" statuses
        // let experimentStatusPayload;
        const isOnHold =
          error.message.split(" ")[error.message.split(" ").length - 1] ===
          "405";
        const isSessionExpired =
          error.message.split(" ")[error.message.split(" ").length - 1] ===
          "456";
        if (isSessionExpired) {
          handleLogoutWithMessage("Session expired. Please sign in again.");
        } else if (isOnHold) {
          dispatch(setIsNoInstanceAvailable(true));
        }
        // comment below lines to comment the task manager
        else {
          const experimentStatusPayload = {
            companyID: currentCompany.companyID,
            userID: userInfo.userID,
            experimentTableName: `EXPERIMENTS`,
            experimentName: config.project_setup.project_name,
            experimentModuleName: moduleName,
            experimentStatus: "Failed",
            experimentID: experimentId,
            createdAt: createdAt
              ? Math.floor(new Date(createdAt.replace(" at", "")).getTime())
              : Date.now(),
            updatedAt: Date.now(),
            createdBy: userInfo.userName,
            experimentPath: filePath,
            experimentRunType: runType,
            inTrash: false,
            time: Date.now(),
          };

          console.log(`Failed Experiment Payload`, experimentStatusPayload);
          await addExperimentToDatabase(
            experimentStatusPayload,
            currentCompany,
            userInfo.userID
          );
        }

        await loadExperimentList(userInfo);
        // Return early to stop further steps
        return;
      }

      // let instanceId;
      // try {
      //   const response = await startInstance(
      //     startInstancePayload,
      //     currentCompany,
      //     userInfo.userID
      //   );
      //   console.log("Start Experiment Response", response);

      //   instanceId = response ? response.instanceId : null;

      //   if (job_list.length > 0) {
      //     const data_config = {
      //       user_id: config.common.user_name,
      //       wait_time: 60,
      //       timeout: 1800,
      //       job_id: "test_job",
      //       job_created_at: formatCurrentDateTime(Date.now()),
      //       attached_experiment_args: {
      //         module_name: config.common.module_name,
      //         job_id: config.common.job_id,
      //         config_path: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${filePath}`,
      //         run_type: runType,
      //       },
      //       activity_end_date: config.etl.activity_end_date,
      //       job_list,
      //       run_data_pull: true,
      //       run_data_clean: true,
      //       trigger_next: true,
      //       instanceId: instanceId,
      //       dbUserID: userInfo.userID,
      //     };
      //     console.log("Uploading data config to s3", data_config);
      //     await uploadJsonToS3(dataConfigFilePath, data_config);
      //   }

      //   // Upload Config to S3
      //   const new_config = { ...config, instanceId };
      //   await uploadJsonToS3(filePath, new_config);
      //   await loadExperimentList(userInfo);
      // } catch (error) {
      //   dispatch(setError(error.message));

      //   // Handle "On Hold" and "Failed" statuses
      //   let experimentStatusPayload;
      //   const isOnHold =
      //     error.message.split(" ")[error.message.split(" ").length - 1] ===
      //     "405";
      //   if (!isOnHold) {
      //     experimentStatusPayload = {
      //       companyID: currentCompany.companyID,
      //       userID: userInfo.userID,
      //       experimentTableName: `EXPERIMENTS`,
      //       experimentName: config.project_setup.project_name,
      //       experimentModuleName: moduleName,
      //       experimentStatus: "Failed",
      //       experimentID: experimentId,
      //       createdAt: createdAt
      //         ? Math.floor(new Date(createdAt.replace(" at", "")).getTime())
      //         : Date.now(),
      //       updatedAt: Date.now(),
      //       createdBy: userInfo.userName,
      //       experimentPath: filePath,
      //       experimentRunType: runType,
      //       inTrash: false,
      //       time: Date.now(),
      //     };

      //     console.log(`Failed Experiment Payload`, experimentStatusPayload);
      //     await addExperimentToDatabase(
      //       experimentStatusPayload,
      //       currentCompany,
      //       userInfo.userID
      //     );
      //   }
      //   if (isOnHold) dispatch(setIsNoInstanceAvailable(true));
      //   await loadExperimentList(userInfo);
      //   // Return early to stop further steps
      //   return;
      // }

      // await startInstance(startInstancePayload, currentCompany, userInfo.userID)
      //   .then(async (response) => {
      //     await loadExperimentList(userInfo);
      //     console.log("Start Experiment Response", response);
      //     instanceId = response ? response.instanceId : null;
      //     if (job_list.length > 0) {
      //       const data_config = {
      //         user_id: config.common.user_name,
      //         wait_time: 60,
      //         timeout: 1800,
      //         job_id: "test_job",
      //         job_created_at: formatCurrentDateTime(Date.now()),
      //         attached_experiment_args: {
      //           module_name: config.common.module_name,
      //           job_id: config.common.job_id,
      //           config_path: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${filePath}`,
      //           run_type: runType,
      //         },
      //         activity_end_date: config.etl.activity_end_date,
      //         job_list,
      //         run_data_pull: true,
      //         run_data_clean: true,
      //         trigger_next: true,
      //         instanceId: instanceId,
      //         dbUserID: userInfo.userID,
      //       };
      //       console.log("Uploading data config to s3", data_config);
      //       uploadJsonToS3(dataConfigFilePath, data_config);
      //     }

      //     // Upload Config to S3
      //     const new_config = { ...config, instanceId };
      //     await uploadJsonToS3(filePath, new_config);
      //     await loadExperimentList(userInfo);
      //   })
      //   .catch(async (error) => {
      //     dispatch(setError(error.message));
      //     if (
      //       error.message.split(" ")[error.message.split(" ").length - 1] ===
      //       "405"
      //     ) {
      //       // console.log("On Hold message: " + error);
      //       // let onHoldExperimentPayload = {
      //       //   companyID: currentCompany.companyID,
      //       //   userID: userInfo.userID,
      //       //   experimentTableName: `EXPERIMENTS`,
      //       //   experimentName: config.project_setup.project_name,
      //       //   experimentModuleName: moduleName,
      //       //   experimentStatus: "On Hold",
      //       //   experimentID: experimentId,
      //       //   createdAt: Date.now(), // Set createdAt to the current date and time
      //       //   updatedAt: Date.now(), // Set updatedAt to the current date and time
      //       //   createdBy: userInfo.userName,
      //       //   experimentPath: filePath,
      //       //   experimentRunType: runType, //
      //       //   inTrash: false,
      //       //   time: Date.now(),
      //       // };
      //       // if (createdAt !== null) {
      //       //   onHoldExperimentPayload = {
      //       //     companyID: currentCompany.companyID,
      //       //     userID: userInfo.userID,
      //       //     experimentTableName: `EXPERIMENTS`,
      //       //     experimentName: config.project_setup.project_name,
      //       //     experimentModuleName: moduleName,
      //       //     experimentStatus: "On Hold",
      //       //     experimentID: experimentId,
      //       //     createdAt: Math.floor(
      //       //       new Date(createdAt.replace(" at", "")).getTime()
      //       //     ), // Set createdAt to the current date and time
      //       //     updatedAt: Date.now(), // Set updatedAt to the current date and time
      //       //     createdBy: userInfo.userName,
      //       //     experimentPath: filePath,
      //       //     experimentRunType: runType, //
      //       //     inTrash: false,
      //       //     time: Date.now(),
      //       //   };
      //       // }
      //       // console.log("On Hold Experiment Payload", onHoldExperimentPayload);
      //       // await addExperimentToDatabase(
      //       //   onHoldExperimentPayload,
      //       //   currentCompany,
      //       //   userInfo.userID
      //       // );
      //       dispatch(setIsNoInstanceAvailable(true));
      //     }else{
      //       console.log("Failed message: " + error);
      //       let failedExperimentPayload = {
      //         companyID: currentCompany.companyID,
      //         userID: userInfo.userID,
      //         experimentTableName: `EXPERIMENTS`,
      //         experimentName: config.project_setup.project_name,
      //         experimentModuleName: moduleName,
      //         experimentStatus: "Failed",
      //         experimentID: experimentId,
      //         createdAt: Date.now(), // Set createdAt to the current date and time
      //         updatedAt: Date.now(), // Set updatedAt to the current date and time
      //         createdBy: userInfo.userName,
      //         experimentPath: filePath,
      //         experimentRunType: runType, //
      //         inTrash: false,
      //         time: Date.now(),
      //       };
      //       if (createdAt !== null) {
      //         failedExperimentPayload = {
      //           companyID: currentCompany.companyID,
      //           userID: userInfo.userID,
      //           experimentTableName: `EXPERIMENTS`,
      //           experimentName: config.project_setup.project_name,
      //           experimentModuleName: moduleName,
      //           experimentStatus: "Failed",
      //           experimentID: experimentId,
      //           createdAt: Math.floor(
      //             new Date(createdAt.replace(" at", "")).getTime()
      //           ), // Set createdAt to the current date and time
      //           updatedAt: Date.now(), // Set updatedAt to the current date and time
      //           createdBy: userInfo.userName,
      //           experimentPath: filePath,
      //           experimentRunType: runType, //
      //           inTrash: false,
      //           time: Date.now(),
      //         };
      //       }
      //       console.log("Failed Experiment Payload", failedExperimentPayload);
      //       await addExperimentToDatabase(
      //         failedExperimentPayload,
      //         currentCompany,
      //         userInfo.userID
      //       );
      //       await loadExperimentList(userInfo);

      //     }
      //     return;
      //   });
      // console.log("Starting wait...");
      // await new Promise((resolve) => setTimeout(resolve, 30000));
      // await loadExperimentList(userInfo);

      // console.log("End of wait...");

      // const executeDEPayload = {
      //   experimentModuleName: moduleName,
      //   experimentTableName: `EXPERIMENTS`,
      //   experimentID: experimentId,
      //   experimentPath: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${dataConfigFilePath}`,
      //   experimentBucketName: process.env.REACT_APP_AWS_BUCKET_NAME,
      //   experimentRegion: process.env.REACT_APP_AWS_REGION,
      //   // instanceId: instanceId,
      //   experimentRunType: runType,
      //   commandType: "data",
      //   time: Date.now(),
      // };

      // const executeExperimentPayload = {
      //   experimentModuleName: moduleName,
      //   experimentTableName: `EXPERIMENTS`,
      //   experimentID: experimentId,
      //   experimentPath: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${filePath}`,
      //   experimentBucketName: process.env.REACT_APP_AWS_BUCKET_NAME,
      //   experimentRegion: process.env.REACT_APP_AWS_REGION,
      //   // instanceId: instanceId,
      //   experimentRunType: runType,
      //   commandType: "experiment",
      //   time: Date.now(),
      // };

      // if (job_list.length > 0 && runType !== "run_scenario") {
      //   console.log("Running DE Pipeline");
      // } else {
      //   console.log("Not Running DE Pipeline");
      // }
      // const finalPayload =
      //   job_list.length > 0 && runType !== "run_scenario"
      //     ? executeDEPayload
      //     : executeExperimentPayload;
      // if (finalPayload === executeDEPayload) {
      //   console.log("Running DE Pipeline");
      // }
      // console.log("ExecuteExperiment Payload: ", finalPayload);
      // await executeExperiment(finalPayload, currentCompany, userInfo.userID)
      //   .then(async (response) => {
      //     console.log("Execute Experiment Response", response);
      //     await loadExperimentList(userInfo);
      //   })
      //   .catch(async (error) => {
      //     dispatch(setError(error.message));

      //     await loadExperimentList(userInfo);
      //   });
    } catch (error) {
      console.log(error);
      dispatch(setError(error.toString()));

      await loadExperimentList(userInfo);
    }
  };

export const updateConfigFieldByPath = (path, value) => (dispatch) => {
  dispatch(UpdateConfigByPath({ path, value }));
};
