import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Skeleton,
  CircularProgress,
  Button,
} from "@mui/material";
import { OpenInNewOutlined as OpenInNewOutlinedIcon } from "@mui/icons-material";
import { STYLES } from "../../constants";
import TGLogo from "../../../../assets/Images/tg_logo6.svg";
import { useVibe } from "../../../../hooks/useVibe";
import useAuth from "../../../../hooks/useAuth";
import ParsedErrorMessage from "../../../../components/ParsedErrorMessage";
import { getExperimentById } from "../../../../utils/getExperiments";
import { processToken } from "../../../../utils/jwtUtils";
import { useNavigate } from "react-router-dom";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import useDashboard from "../../../../hooks/useDashboard";
import useExperiment from "../../../../hooks/useExperiment";
import useModule from "../../../../hooks/useModule";
import useConfig from "../../../../hooks/useConfig";
import { executeParallelTasks } from "../../../../utils/executeParallelTasks";
import { clearCache, fetchJsonFromS3 } from "../../../../utils/s3Utils";
import { listFilesInFolderEndpoint } from "../../../../utils/s3UtillsEndpoints";

const ExperimentProgressTracker = ({ experimentId }) => {
  const DashboardModules = [
    ...oldFlowModules,
    "next_best_offer",
    "next_best_action",
    "binary_classification",
    "regression",
  ];
  const PlanModules = [...oldFlowModules];
  console.log("ExperimentProgressTracker Rendered");
  const { currentConversation, setExperimentStatusHistory, setNavigating , creditScore } =
    useVibe();
  if (!experimentId) {
    experimentId = Object.keys(currentConversation.experiments)[0];
  }
  console.log("ExperimentProgressTracker: experimentId =", experimentId);
  console.log("Module Name =", currentConversation.experiments[experimentId].experimentModuleName);
  const { currentCompany, userInfo } = useAuth();
  const navigate = useNavigate();

  // State variables for experiment status
  const [experimentStatus, setExperimentStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errorDetails, setErrorDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState(null);
  const [runDate, setRunDate] = useState(null);
  const [shouldPoll, setShouldPoll] = useState(true);
  const [moduleName, setModuleName] = useState(null);

  // Loading states for navigation buttons
  const [isNavigatingToDashboard, setIsNavigatingToDashboard] = useState(false);
  const [isNavigatingToScenario, setIsNavigatingToScenario] = useState(false);

  const formatDate = (date) => {
    // If it's a valid timestamp (milliseconds since epoch)
    if (!isNaN(date)) {
      const dateObj = new Date(date);
      // Format the date part
      const datePart = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(dateObj);

      // Format the time part, including seconds
      const timePart = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(dateObj);

      // Combine the date and time parts with "at"
      const formattedDateTime = `${datePart}, at ${timePart}`;
      return formattedDateTime;
    }

    // If the date is already a formatted string, parse it and format it again
    try {
      return formatDateString(date);
    } catch (error) {
      console.error("Invalid date string:", error);
    }

    return date; // Return the original string if parsing fails
  };
  // Function to convert full month names to abbreviated month names
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

    // Use a regular expression to match the full date format
    const regex = /(\w+) (\d{1,2}), (\d{4}) at (\d{1,2}:\d{2}:\d{2} [APM]{2})/;
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
  function parseString(input) {
    try {
      // Try to parse the input as JSON
      const json = JSON.parse(input);

      // If successful and it's an object or array, return it
      if (typeof json === "object" && json !== null) {
        return json.status;
      }
    } catch (e) {
      // If JSON.parse throws an error, it means input is not valid JSON
      return input;
    }

    // If input is not valid JSON, return the original string
    return input;
  }
  // Update dates in decoded experiments

  function formatYearMonth(dateString) {
    // Split the string to extract date part
    const datePart = dateString.split(" at ")[0];

    // Create a new Date object with the date part
    const date = new Date(datePart);

    // Check if the date is valid
    if (isNaN(date)) {
      throw new Error("Invalid date format");
    }

    // Extract year and month
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Concatenate year and month
    console.log("Run Date", `${year}${month}`);
    return `${year}${month}`;
  }
  const {
    loadDemandForecastingData,
    loadDimensionFilterData,
    loadElasticityDimensionFilterData,
    loadRawSalesData,
    setCurrentDimension,
    setCurrentValue,
    setExperimentBasePath,
    setDashboardLoading,
    currentDimension,
    currentValue,
    loadInvPriceFilterData,
    loadTablesFilterData,
    syncExperimentConfigWithTablesFilter,
    syncExperimentConfigWithBYOR,
    setBYORConfigurations,
    loadSupplyPlanFilterData,
  } = useDashboard();
  const {
    experiments_list,
    loadExperimentConfigFromS3,
    loadExperiementsList,
    hasParquetFiles,
    deleteTheExperiments,
    renameExperimentAndReload,
    filters,
    isArchiveAndProductionAndReload,
  } = useExperiment();
  const {
    loadExperimentConfigFromS3: loadExperimentConfigFromS3New,
    setExperimentStatus: setExperimentStatusNew,
  } = useModule();
  const { isContactSalesDialogOpen, setIsContactSalesDialogOpen } = useAuth();
  const {
    isNoInstanceAvailable,
    setIsNoInstanceAvailable,
    retryExecution,
    setBaseDatasets,
    setDeletedBaseDatasets,
  } = useConfig();

  const handleFlowNavigation = async ({
    experimentID,
    moduleName,
    run_date,
    experimentStatus,
    currentFlow,
  }) => {
    if (oldFlowModules.includes(moduleName)) {
      setBYORConfigurations({});
      console.log("Row clicked:", experimentID);
      console.log("old?", oldFlowModules.includes(moduleName));
      await setCurrentDimension("all");
      await setCurrentValue("all");
      console.log(experimentID);
      console.log(moduleName);
      console.log(run_date);
      await setDashboardLoading(true);
      let exp_config;
      let priceColumn = "";
      let exp_tablesFilterData;
      let exp_byor_config;
      let exp_deleted_base_datasets;
      let exp_base_datasets;
      let exp_base_dataset_files;

      const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${experimentID}`;
      await setExperimentBasePath(Experiment_Base_Path);
      await executeParallelTasks([
        { fn: clearCache, args: [userInfo.userID, currentCompany.companyName] },
        {
          fn: loadExperimentConfigFromS3,
          args: [moduleName, experimentID, userInfo, currentCompany],
          output: "exp_config",
        },
        /*  {
        fn: navigate,
        args: [
          `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`,
        ],
      }, */
        { fn: setExperimentStatus, args: [experimentStatus] },
        { fn: setExperimentBasePath, args: [Experiment_Base_Path] },
        {
          fn: loadTablesFilterData,
          args: [
            `${Experiment_Base_Path}/custom_report/tablesFilterData.json`,
            userInfo.userID,
          ],
          output: "exp_tablesFilterData",
        },
        {
          fn: fetchJsonFromS3,
          args: [
            `${Experiment_Base_Path}/custom_report/BYORDataConfig.json`,
            userInfo.userID,
          ],
          output: "exp_byor_config",
        },

        {
          fn: fetchJsonFromS3,
          args: [
            `${Experiment_Base_Path}/custom_report/deletedBaseDatasets.json`,
            userInfo.userID,
          ],
          output: "exp_deleted_base_datasets",
        },

        {
          fn: listFilesInFolderEndpoint,
          args: [
            { folderPath: `${Experiment_Base_Path}/byor_base_datasets/` },
            userInfo.userID,
          ],
          output: "exp_base_dataset_files",
        },
      ]).then((results) => {
        exp_config = results.exp_config;
        priceColumn = exp_config.scenario_plan.pricing_constraints.price;
        exp_tablesFilterData = results.exp_tablesFilterData;
        exp_byor_config = results.exp_byor_config;
        exp_deleted_base_datasets = results.exp_deleted_base_datasets;
        exp_base_dataset_files = results.exp_base_dataset_files;
      });
      /* await clearCache(userInfo.userID, currentCompany.companyName); */
      /* const exp_config = await loadExperimentConfigFromS3(
      moduleName,
      experimentID,
      userInfo,
      currentCompany
    ); */
      console.log(
        "Navigating to dashboard:",
        currentFlow,
        moduleName,
        experimentID,
        currentCompany.companyName
      );
      navigate(
        `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`
      );
      /* await setExperimentStatus(experimentStatus); */

      //console.log("Experiment_Base_Path", Experiment_Base_Path);
      /* await setExperimentBasePath(Experiment_Base_Path); */
      /* const exp_tablesFilterData = await loadTablesFilterData(
      `${Experiment_Base_Path}/custom_report/tablesFilterData.json`,
      userInfo.userID
    ); */

      await syncExperimentConfigWithTablesFilter(
        exp_tablesFilterData,
        exp_config,
        Experiment_Base_Path
      );

      if (exp_deleted_base_datasets) {
        setDeletedBaseDatasets(exp_deleted_base_datasets);
      }

      if (
        Array.isArray(exp_base_dataset_files) &&
        exp_base_dataset_files.length > 0
      ) {
        const logFiles = exp_base_dataset_files.filter((file) =>
          file.Key.endsWith(".csv")
        );

        const datasetNames = logFiles.map((file) => {
          const parts = file.Key.split("/");
          return parts[parts.length - 2]; // Folder before output.csv
        });

        let finalDatasetList = datasetNames;
        if (exp_deleted_base_datasets) {
          finalDatasetList = datasetNames.filter(
            (name) => !exp_deleted_base_datasets?.includes(name)
          );
        }

        setBaseDatasets(finalDatasetList);
      }

      if (exp_byor_config) {
        setBYORConfigurations(exp_byor_config);
        console.log("BYOR");
      } else {
        await syncExperimentConfigWithBYOR(
          exp_byor_config,
          exp_config,
          Experiment_Base_Path
        );
      }
      if (currentFlow === "dashboard") {
        // await loadExecutiveViewData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`,
        //   {
        //     dimensionFilters: {
        //       feature: [currentDimension],
        //       value: [currentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
        /*  await loadRawSalesData(
        `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
            value: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      ); */
        await executeParallelTasks([
          {
            fn: loadRawSalesData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              userInfo.userID,
              hasParquetFiles,
            ],
          },
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadElasticityDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
              hasParquetFiles,
              priceColumn,
            ],
          },
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          {
            fn: loadSupplyPlanFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/pp_dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
        ]);
      } else if (
        currentFlow === "scenario" ||
        currentFlow === "optimizations"
      ) {
        await executeParallelTasks([
          {
            fn: clearCache,
            args: [userInfo.userID, currentCompany.companyName],
          },
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadElasticityDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
              hasParquetFiles,
              priceColumn,
            ],
          },
          {
            fn: loadRawSalesData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              userInfo.userID,
              hasParquetFiles,
            ],
          },
          {
            fn: loadDemandForecastingData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              hasParquetFiles,
            ],
          },
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          {
            fn: loadSupplyPlanFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/pp_dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          /* {
          fn: setForecastingPivotData,
          args: [
            `${Experiment_Base_Path}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
            {
              dimensionFilters: {
                [currentDimension]: [currentValue],
              },
              columnFilter: [],
              selectAllColumns: true,
            },
            userInfo.userID,
            hasParquetFiles,
          ],
        } , */
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadElasticityDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
              hasParquetFiles,
              priceColumn,
            ],
          },
        ]);
      }

      setDashboardLoading(false);
    } else {
      console.log("Row clicked:", experimentID);

      await setDashboardLoading(true);
      let exp_config;

      const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${experimentID}`;
      await setExperimentBasePath(Experiment_Base_Path);
      await executeParallelTasks([
        {
          fn: clearCache,
          args: [userInfo.userID, currentCompany.companyName],
        },
        {
          fn: loadExperimentConfigFromS3New,
          args: [moduleName, experimentID, userInfo, currentCompany],
          output: "exp_config",
        },
        /*  {
        fn: navigate,
        args: [
          `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`,
        ],
      }, */
        { fn: setExperimentStatusNew, args: [experimentStatus] },
        { fn: setExperimentBasePath, args: [Experiment_Base_Path] },
      ]).then((results) => {
        exp_config = results.exp_config;
      });

      console.log(
        "Navigating to dashboard:",
        currentFlow,
        moduleName,
        experimentID,
        currentCompany.companyName
      );
      navigate(
        `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`
      );

      if (currentFlow === "dashboard") {
        /*  await executeParallelTasks([
          {
            fn: loadRawSalesData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              userInfo.userID,
              hasParquetFiles,
            ],
          },
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
        ]); */
      } else if (
        currentFlow === "scenario" ||
        currentFlow === "optimizations"
      ) {
        /*   await executeParallelTasks([
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadRawSalesData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              userInfo.userID,
              hasParquetFiles,
            ],
          },
          {
            fn: loadDemandForecastingData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              hasParquetFiles,
            ],
          },
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
        ]); */
      }

      setDashboardLoading(false);
    }
  };
  // Function to redirect to dashboard
  const handleGoToDashboard = async () => {
    if (experimentId && runDate && !isNavigatingToDashboard && moduleName) {
      setIsNavigatingToDashboard(true);
      setNavigating(true);
      try {
        await loadExperiementsList(userInfo);
        await handleFlowNavigation({
          experimentID: experimentId,
          moduleName: moduleName,
          run_date: runDate,
          experimentStatus: overallStatus,
          currentFlow: "dashboard",
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsNavigatingToDashboard(false);
        setNavigating(false);
      } catch (error) {
        console.error("Error navigating to dashboard:", error);
        setIsNavigatingToDashboard(false);
        setNavigating(false);
      }
    }
  };

  // Function to redirect to scenario
  const handleGoToScenario = async () => {
    if (experimentId && runDate && !isNavigatingToScenario && moduleName) {
      setIsNavigatingToScenario(true);
      setNavigating(true);
      try {
        await loadExperiementsList(userInfo);
        await handleFlowNavigation({
          experimentID: experimentId,
          moduleName: moduleName,
          run_date: runDate,
          experimentStatus: overallStatus,
          currentFlow: "scenario",
        });
         await new Promise((resolve) => setTimeout(resolve, 500));
        setIsNavigatingToScenario(false);
        setNavigating(false);
      } catch (error) {
        console.error("Error navigating to scenario:", error);
        setIsNavigatingToScenario(false);
        setNavigating(false);
      }
    }
  };

  // Function to fetch the experiment data by ID
  const fetchExperimentById = async () => {
    if (!experimentId || !currentCompany || !userInfo?.userID) return;

    try {
      console.log("ExperimentProgressTracker: Fetching experiment data");
      const response = await getExperimentById(
        { experimentID: experimentId },
        currentCompany,
        userInfo.userID
      );

      const data = await processToken(response);
      setRunDate(formatYearMonth(formatDate(data.createdAt)));
      setModuleName(data.experimentModuleName);
      setExperimentStatus(data.experimentStatus);
      setOverallStatus(data.experimentStatus);

      // Parse the experiment status to extract current step and completed steps
      if (data.experimentStatus) {
        try {
          const statusObject = JSON.parse(data.experimentStatus);
          setCurrentStep(statusObject.current_step);
          setCompletedSteps(statusObject.completed_steps || []);
          setErrorDetails(statusObject.details?.error || null);
        } catch (parseError) {
          console.error(
            "ExperimentProgressTracker: Error parsing experiment status:",
            parseError
          );
          // Handle simple string statuses
          if (typeof data.experimentStatus === "string") {
            setOverallStatus(data.experimentStatus);
          }
        }
      }

      // Store the experiment status in history
      const statusHistoryEntry = {
        experimentId,
        status: data.experimentStatus,
        timestamp: new Date().toISOString(),
        runDate: formatYearMonth(formatDate(data.createdAt)),
        currentStep: currentStep,
        completedSteps: completedSteps,
        errorDetails: errorDetails,
      };

      // Update polling state based on new status
      const needsPolling = shouldStartPolling(data.experimentStatus);
      setShouldPoll(needsPolling);

      // Update the experiment status history in Redux
      if (currentConversation.experimentStatusHistory) {
        const existingIndex =
          currentConversation.experimentStatusHistory.findIndex(
            (entry) => entry.experimentId === experimentId
          );

        if (existingIndex !== -1) {
          // Update existing entry
          const updatedHistory = [
            ...currentConversation.experimentStatusHistory,
          ];
          updatedHistory[existingIndex] = statusHistoryEntry;
          setExperimentStatusHistory(updatedHistory);
        } else {
          // Add new entry
          const updatedHistory = [
            ...currentConversation.experimentStatusHistory,
            statusHistoryEntry,
          ];
          setExperimentStatusHistory(updatedHistory);
        }
      }
    } catch (error) {
      console.error(
        "ExperimentProgressTracker: Error fetching experiment:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to load experiment status from history
  const loadStatusFromHistory = () => {
    if (!currentConversation.experimentStatusHistory || !experimentId)
      return false;

    const historyEntry = currentConversation.experimentStatusHistory.find(
      (entry) => entry.experimentId === experimentId
    );

    if (historyEntry) {
      console.log(
        "ExperimentProgressTracker: Loading status from history:",
        historyEntry
      );
      setExperimentStatus(historyEntry.status);
      setOverallStatus(historyEntry.status);
      setCurrentStep(historyEntry.currentStep);
      setCompletedSteps(historyEntry.completedSteps || []);
      setErrorDetails(historyEntry.errorDetails);
      setRunDate(historyEntry.runDate);
      setModuleName(historyEntry.experimentModuleName);
      setLoading(false);

      // Set polling state based on loaded status
      const needsPolling = shouldStartPolling(historyEntry.status);
      setShouldPoll(needsPolling);

      return true;
    }

    return false;
  };

  // Function to check if experiment needs polling
  const shouldStartPolling = (status) => {
    if (!status) return true;

    const finalStatuses = ["Completed", "Failed", "Terminated"];
    return !finalStatuses.includes(parseString(status));
  };

  // Reset states when experimentId changes
  useEffect(() => {
    setExperimentStatus(null);
    setCurrentStep(null);
    setCompletedSteps([]);
    setErrorDetails(null);
    setOverallStatus(null);
    setLoading(true);
    setShouldPoll(true); // Default to polling until we determine otherwise

    // Try to load status from history first
    const statusLoadedFromHistory = loadStatusFromHistory();

    // Only start polling if status is not loaded from history or if experiment needs polling
    if (!statusLoadedFromHistory) {
      // No history found, will start polling
      console.log(
        "ExperimentProgressTracker: No history found, will start polling"
      );
    } else {
      // Status loaded from history, check if polling is needed
      console.log(
        "ExperimentProgressTracker: Status loaded from history, will check if polling needed"
      );
    }
  }, [experimentId]);

  // Effect to handle polling decision based on loaded status
  useEffect(() => {
    if (overallStatus && experimentId) {
      const needsPolling = shouldStartPolling(overallStatus);
      setShouldPoll(needsPolling);

      if (!needsPolling) {
        console.log(
          "ExperimentProgressTracker: Experiment in final state, no polling needed"
        );
      } else {
        console.log(
          "ExperimentProgressTracker: Experiment needs polling, will start"
        );
      }
    }
  }, [overallStatus, experimentId]);

  // Set up polling every 10 seconds (same as ViewExperimentHeader)
  useEffect(() => {
    if (experimentId && shouldPoll) {
      // Only start polling if experiment is not in a final state
      console.log(
        "ExperimentProgressTracker: Starting polling for experiment:",
        experimentId
      );

      // Initial fetch
      fetchExperimentById();

      const intervalId = setInterval(() => {
        fetchExperimentById();
      }, 10000);

      return () => clearInterval(intervalId);
    } else if (experimentId && !shouldPoll) {
      console.log(
        "ExperimentProgressTracker: No polling needed for experiment in final state:",
        experimentId
      );
    }
  }, [experimentId, currentCompany?.companyID, userInfo?.userID, shouldPoll]);

  // Define the complete pipeline steps in order
  const completePipelineSteps = [
    "queued",
    "initiating",
    "initiated",
    "executing",
    "ingestion",
    "etl",
    "preprocessing",
    "feature_engineering",
    "custom_module",
    "training",
    "stacking",
    "scenario_planning",
    "optimization",
  ];

  // Helper function to determine if a step should be shown as upcoming
  const shouldShowUpcomingStep = (stepName, currentStep, completedSteps) => {
    // Always show steps that are completed, in progress, or failed
    if (completedSteps.includes(stepName) || currentStep === stepName) {
      return true;
    }

    // Show upcoming steps that come after the current step or after completed steps
    const stepIndex = completePipelineSteps.indexOf(stepName);
    const currentStepIndex = currentStep
      ? completePipelineSteps.indexOf(currentStep)
      : -1;
    const lastCompletedIndex =
      completedSteps.length > 0
        ? Math.max(
            ...completedSteps.map((s) => completePipelineSteps.indexOf(s))
          )
        : -1;

    const maxReachedIndex = Math.max(currentStepIndex, lastCompletedIndex);

    // Show all upcoming steps (don't limit to just 2-3)
    return stepIndex > maxReachedIndex;
  };

  // Process experiment status to build steps array
  const processExperimentStatus = () => {
    if (!experimentStatus) {
      return {
        steps: [],
        currentStep: null,
        completedSteps: [],
        errorDetails: null,
        overallStatus: null,
      };
    }

    const steps = [];
    let currentStepLocal = currentStep;
    let completedStepsLocal = [...(completedSteps || [])]; // Create a new array to avoid extensibility issues
    let errorDetailsLocal = errorDetails;
    let overallStatusLocal = overallStatus;

    // If experimentStatus is a JSON string, parse it
    if (
      typeof experimentStatus === "string" &&
      experimentStatus.startsWith("{")
    ) {
      try {
        const parsedStatus = JSON.parse(experimentStatus);

        if (parsedStatus.status === "Running") {
          overallStatusLocal = "Running";
          currentStepLocal = parsedStatus.current_step;
          completedStepsLocal = [...(parsedStatus.completed_steps || [])];

          // Ensure initial steps are always considered completed
          const initialSteps = [
            "queued",
            "initiating",
            "initiated",
            "executing",
          ];
          initialSteps.forEach((step) => {
            if (!completedStepsLocal.includes(step)) {
              completedStepsLocal.push(step);
            }
          });
        } else if (parsedStatus.status === "Failed") {
          overallStatusLocal = "Failed";
          currentStepLocal = parsedStatus.current_step;
          completedStepsLocal = [...(parsedStatus.completed_steps || [])];
          errorDetailsLocal =
            parsedStatus.details?.error || "Experiment failed";

          // Ensure initial steps are always considered completed
          const initialSteps = [
            "queued",
            "initiating",
            "initiated",
            "executing",
          ];
          initialSteps.forEach((step) => {
            if (!completedStepsLocal.includes(step)) {
              completedStepsLocal.push(step);
            }
          });
        } else if (parsedStatus.status === "Completed") {
          overallStatusLocal = "Completed";
          currentStepLocal = parsedStatus.current_step || "stop_process";
          completedStepsLocal = [...(parsedStatus.completed_steps || [])];

          // For completed experiments, ensure all pipeline steps are marked as completed
          // Add any missing steps from the complete pipeline
          completePipelineSteps.forEach((step) => {
            if (!completedStepsLocal.includes(step)) {
              completedStepsLocal.push(step);
            }
          });

          // Also ensure initial steps are marked as completed
          const initialSteps = [
            "queued",
            "initiating",
            "initiated",
            "executing",
          ];
          initialSteps.forEach((step) => {
            if (!completedStepsLocal.includes(step)) {
              completedStepsLocal.push(step);
            }
          });
        }
      } catch (error) {
        console.error(
          "ExperimentProgressTracker: Error parsing JSON status:",
          error
        );
      }
    } else if (typeof experimentStatus === "string") {
      // Handle simple string statuses
      overallStatusLocal = experimentStatus;

      // Handle "Failed" status specifically
      if (experimentStatus === "Failed") {
        overallStatusLocal = "Failed";
        errorDetailsLocal = "Experiment failed";
        // Don't add "Failed" as a completed step since it's a final status
      } else if (experimentStatus === "Completed") {
        overallStatusLocal = "Completed";
        // For completed experiments, mark all pipeline steps as completed
        completePipelineSteps.forEach((step) => {
          if (!completedStepsLocal.includes(step)) {
            completedStepsLocal.push(step);
          }
        });
        // Also ensure initial steps are marked as completed
        const initialSteps = ["queued", "initiating", "initiated", "executing"];
        initialSteps.forEach((step) => {
          if (!completedStepsLocal.includes(step)) {
            completedStepsLocal.push(step);
          }
        });
      } else {
        // Add these as actual steps in the pipeline for other statuses
        const stepName = experimentStatus
          .toLowerCase()
          .replace(/\.\.\./g, "")
          .replace(/\s+/g, "_");

        if (!completedStepsLocal.includes(stepName)) {
          completedStepsLocal.push(stepName);
        }
      }
    }

    // Build complete steps array with all pipeline steps
    const finalSteps = completePipelineSteps
      .map((stepName) => {
        if (completedStepsLocal.includes(stepName)) {
          return { name: stepName, status: "completed" };
        } else if (currentStepLocal === stepName) {
          return {
            name: stepName,
            status: errorDetailsLocal ? "failed" : "in_progress",
          };
        } else {
          // Determine if this step should be shown as upcoming
          const shouldShowUpcoming = shouldShowUpcomingStep(
            stepName,
            currentStepLocal,
            completedStepsLocal
          );
          return {
            name: stepName,
            status: shouldShowUpcoming ? "upcoming" : "hidden",
          };
        }
      })
      .filter((step) => step.status !== "hidden");

    return {
      steps: finalSteps,
      currentStep: currentStepLocal,
      completedSteps: completedStepsLocal,
      errorDetails: errorDetailsLocal,
      overallStatus: overallStatusLocal,
    };
  };

  const {
    steps,
    currentStep: processedCurrentStep,
    completedSteps: processedCompletedSteps,
    errorDetails: processedErrorDetails,
    overallStatus: processedOverallStatus,
  } = processExperimentStatus();

  // Step name mapping
  const stepNameMapping = {
    queued: "Queued",
    initiating: "Initiating...",
    initiated: "Initiated",
    executing: "Executing",
    ingestion: "Ingestion",
    etl: "ETL",
    preprocessing: "Preprocessing",
    feature_engineering: "Feature Engineering",
    training: "Training",
    stacking: "Stacking",
    scenario_planning: "Scenario Planning",
    optimization: "Optimization",
    custom_module: "Custom Module",
    raw_data_pull: "Raw Data Pull",
    data_cleaning: "Data Cleaning",
    data_preprocessing: "Data Preprocessing",
  };

  // Step progress messages mapping (5-word sentences explaining what's happening)
  const stepProgressMessages = {
    queued: "Waiting in processing queue",
    initiating: "Starting experiment initialization process",
    initiated: "Experiment setup completed successfully",
    executing: "Running main execution pipeline",
    ingestion: "Loading data from sources",
    etl: "Transforming data for processing",
    preprocessing: "Cleaning and preparing datasets",
    feature_engineering: "Creating predictive model features",
    training: "Building machine learning models",
    stacking: "Combining multiple model predictions",
    scenario_planning: "Generating business scenario options",
    optimization: "Finding optimal solution parameters",
    raw_data_pull: "Extracting raw data files",
    data_cleaning: "Removing invalid data entries",
    data_preprocessing: "Formatting data for analysis",
    custom_module: "Running custom module",
  };

  // Function to get styles based on experimentStatus
  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
      case "Running":
        return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
      case "Failed":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Terminated":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error

      // New cases added below
      case "Initiating...":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
      case "Executing":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
      case "Initiated":
        return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started, stable
      case "Terminating":
        return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
      case "On Hold":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
      case "Queued":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
      case "Retrying...":
        return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying in progress
      case "Executed":
        return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue: Intermediate status
      case "Launching...":
        return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue: Launching in progress

      // New case for DataProcessCompleted
      case "DataProcessCompleted":
        return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green: Intermediate completion

      // Default styles
      default:
        return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Neutral/unknown
    }
  };

  // Get step status
  const getStepStatus = (stepName) => {
    const step = steps.find((s) => s.name === stepName);
    if (!step) return "upcoming";
    return step.status;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!steps.length) return 0;

    const completedSteps = steps.filter(
      (step) => step.status === "completed"
    ).length;
    const totalSteps = steps.length;

    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Get current step message
  const getCurrentStepMessage = () => {
    if (processedErrorDetails) {
      return "Experiment encountered an error";
    }

    if (processedOverallStatus === "Completed") {
      return "Experiment completed successfully";
    }

    if (processedOverallStatus === "Terminated") {
      return "Experiment was terminated";
    }

    if (processedCurrentStep) {
      // Use the progress message if available, otherwise fall back to step name
      const progressMessage = stepProgressMessages[processedCurrentStep];
      if (progressMessage) {
        return progressMessage;
      }

      const stepName =
        stepNameMapping[processedCurrentStep] || processedCurrentStep;
      return `Currently ${stepName.toLowerCase()}`;
    }

    return "Preparing experiment...";
  };

  const progress = calculateProgress();
  const currentMessage = getCurrentStepMessage();

  return (
    <Box
      sx={{
        mt: 3,
        p: 3,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        width: "100%",
      }}
    >
      <Stack direction="row" gap={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#374151",
            fontFamily: STYLES.FONTS.PRIMARY,
          }}
        >
          Execution Status
        </Typography>
        {processedOverallStatus && (
          <Chip
            label={processedOverallStatus}
            size="small"
            sx={{
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "18px",
              textAlign: "initial",
              ...getStatusStyles(processedOverallStatus),
            }}
          />
        )}
      </Stack>

      {loading ? (
        // Skeleton loader while fetching experiment data
        <Box sx={{ width: "100%", padding: "16px" }}>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={8} width="100%" />
            <Skeleton variant="rectangular" height={16} width="60%" />
          </Stack>
        </Box>
      ) : (
        <Box sx={{ width: "100%" }}>
          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#f1f5f9",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  backgroundColor: processedErrorDetails
                    ? "#dc2626"
                    : processedOverallStatus === "Completed"
                    ? "#10b981"
                    : "#3b82f6",
                },
              }}
            />
          </Box>

          {/* Current Step Message */}
          <Box
            sx={{
              display: "flex",
              width: "100%",
              py: 1,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                maxWidth: "90%",
                width: "100%",
                px: 0,
                gap: 0,
                alignItems: "center",
              }}
            >
              {/* AI Avatar */}
              <Box
                sx={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  animation:
                    processedOverallStatus === "Completed"
                      ? "none"
                      : "rotate 2s linear infinite",
                  "@keyframes rotate": {
                    "0%": {
                      transform: "rotate(0deg)",
                    },
                    "100%": {
                      transform: "rotate(360deg)",
                    },
                  },
                }}
              >
                <img
                  src={TGLogo}
                  alt="TrueGradient"
                  style={{
                    width: "20px",
                    height: "20px",
                    animation:
                      processedOverallStatus === "Completed"
                        ? "none"
                        : "counterRotate 2s linear infinite",
                    "@keyframes counterRotate": {
                      "0%": {
                        transform: "rotate(0deg)",
                      },
                      "100%": {
                        transform: "rotate(-360deg)",
                      },
                    },
                  }}
                />
              </Box>

              {/* Processing Text with Glow Effect */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: processedErrorDetails
                      ? "#dc2626"
                      : processedOverallStatus === "Completed"
                      ? "#10b981"
                      : "#6b7280",
                    fontWeight: 900,
                    fontFamily: STYLES.FONTS.PRIMARY,
                    position: "relative",
                    background: processedErrorDetails
                      ? "linear-gradient(90deg, #dc2626 0%, #fca5a5 50%, #dc2626 100%)"
                      : processedOverallStatus === "Completed"
                      ? "linear-gradient(90deg, #10b981 0%, #6ee7b7 50%, #10b981 100%)"
                      : "linear-gradient(90deg, #3b82f6 0%,rgb(111, 233, 255) 50%, #3b82f6 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation:
                      processedErrorDetails ||
                      processedOverallStatus === "Completed"
                        ? "none"
                        : "processingGlow 2.5s infinite ease-in-out",
                  }}
                >
                  {currentMessage}
                </Typography>

                {/* CSS Animations */}
                <style>
                  {`
                    @keyframes processingGlow {
                      0% {
                        background-position: -200% 0;
                      }
                      100% {
                        background-position: 200% 0;
                      }
                    }
                  `}
                </style>
              </Box>
            </Box>
          </Box>

          {/* Show error message if the experiment has failed */}
          {processedErrorDetails && (
            <ParsedErrorMessage
              errorDetails={processedErrorDetails}
              currentStep={processedCurrentStep}
            />
          )}

          {/* Show dashboard button when experiment is completed */}
          {processedOverallStatus === "Completed" && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                {!oldFlowModules.includes(
                  currentConversation.experiments[experimentId]
                    .experimentModuleName
                ) && (
                  <Button
                    aria-label="dashboard-navigator"
                    variant="outlined"
                    onClick={async () => await handleGoToDashboard()}
                    disabled={creditScore <= 0 || isNavigatingToDashboard}
                    startIcon={
                      isNavigatingToDashboard ? (
                        <CircularProgress size={16} sx={{ color: "#344054" }} />
                      ) : (
                        <OpenInNewOutlinedIcon
                          sx={{ color: "#344054", fontSize: "20px" }}
                        />
                      )
                    }
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: isNavigatingToDashboard ? "#6B7280" : "#344054",
                      borderColor: isNavigatingToDashboard
                        ? "#E5E7EB"
                        : "#D0D5DD",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      textTransform: "none",
                      minWidth: "auto",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: isNavigatingToDashboard
                          ? "#E5E7EB"
                          : "#344054",
                        backgroundColor: isNavigatingToDashboard
                          ? "#F9FAFB"
                          : "#F9FAFB",
                      },
                      "&:disabled": {
                        color: "#6B7280",
                        borderColor: "#E5E7EB",
                        backgroundColor: "#F9FAFB",
                      },
                    }}
                  >
                    {isNavigatingToDashboard
                      ? "Redirecting..."
                      : "Go to Dashboard"}
                  </Button>
                )}
                {oldFlowModules.includes(
                  currentConversation.experiments[experimentId]
                    .experimentModuleName
                ) && (
                  <Button
                    variant="outlined"
                    aria-label="dashboard-navigator"
                    onClick={async () => await handleGoToScenario()}
                    disabled={creditScore <= 0 || isNavigatingToScenario}
                    startIcon={
                      isNavigatingToScenario ? (
                        <CircularProgress size={16} sx={{ color: "#344054" }} />
                      ) : (
                        <OpenInNewOutlinedIcon
                          sx={{ color: "#344054", fontSize: "20px" }}
                        />
                      )
                    }
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: isNavigatingToScenario ? "#6B7280" : "#344054",
                      borderColor: isNavigatingToScenario
                        ? "#E5E7EB"
                        : "#D0D5DD",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      textTransform: "none",
                      minWidth: "auto",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: isNavigatingToScenario
                          ? "#E5E7EB"
                          : "#344054",
                        backgroundColor: isNavigatingToScenario
                          ? "#F9FAFB"
                          : "#F9FAFB",
                      },
                      "&:disabled": {
                        color: "#6B7280",
                        borderColor: "#E5E7EB",
                        backgroundColor: "#F9FAFB",
                      },
                    }}
                  >
                    {isNavigatingToScenario
                      ? "Redirecting..."
                      : "Go to Dashboard"}
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ExperimentProgressTracker;
