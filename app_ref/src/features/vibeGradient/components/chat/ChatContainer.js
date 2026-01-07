// src/features/vibeGradient/components/chat/ChatContainer.js
import React, { forwardRef, useEffect, useRef } from "react";
import { Box, Stack } from "@mui/material";
import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";
import TypingIndicator from "./TypingIndicator";
// import ExperimentProgressTracker from "../user-actions/ExperimentProgressTracker";
import TGLogo from "../../../../assets/Images/tg_logo6.svg";
import { STYLES, CHAT_CONFIG } from "../../constants";
import { useVibe } from "../../../../hooks/useVibe";
import ExperimentProgressTracker from "../user-actions/ExperimentProgressTracker";
import InputSection from "../input/InputSection";
import { useWorkflowWebSocket } from "../../../../hooks/useWorkflowWebSocket";
import useDashboard from "../../../../hooks/useDashboard";
import useExperiment from "../../../../hooks/useExperiment";
import useModule from "../../../../hooks/useModule";
import useAuth from "../../../../hooks/useAuth";
import useConfig from "../../../../hooks/useConfig";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import { executeParallelTasks } from "../../../../utils/executeParallelTasks";
import { clearCache, fetchJsonFromS3 } from "../../../../utils/s3Utils";
import { listFilesInFolderEndpoint } from "../../../../utils/s3UtillsEndpoints";
import CustomScrollbar from "../../../../components/CustomScrollbar";
import { uploadJsonToS3 } from "../../../../utils/s3Utils";

const ChatContainer = forwardRef(
  (
    {
      messages,
      isWaitingForAI,
      setIsWaitingForAI,
      isStreaming,
      currentProgress,
      messagesEndRef,
      processingStepText,
      isDrawer = false,
      systemPrompt = null,
      dataPathDict = null,
    },
    ref
  ) => {
    console.log("ChatContainer: processingStepText =", processingStepText);
    const {
      currentMessages,
      currentConversationId,
      currentConversation,
      addMessage,
      hasConversation,
      updateProcessingStepText,
      conversationState,

      refreshCredits,
      decrementCredits,
      selectedDatasets,
      clearAllSelectedDatasets,
      
    } = useVibe();
    const { canSendMessage, sendQuery } = useWorkflowWebSocket();
    // Use currentMessages from conversation if available, otherwise fall back to props
    const experiments = currentConversation?.experiments;
    const handleSendMessage = async (message) => {
      console.log("ChatContainer: Sending message:", message);
      console.log("ChatContainer: Selected datasets:", selectedDatasets);
      console.log("ChatContainer: Data path dict:", dataPathDict);
      console.log("ChatContainer: System prompt:", systemPrompt);
      let data = Object.fromEntries(
        Object.entries(selectedDatasets).map(([key, value]) => [
          key,
          value.path,
        ])
      );
      if (dataPathDict) {
        data = { ...data, ...dataPathDict };
      }
      console.log("ChatPage: Data:", data);
      updateProcessingStepText("Processing your message...");
      console.log("ChatPage: Current conversation ID:", currentConversationId);
      updateProcessingStepText("Thinking...");
      // Add user message to Redux immediately for instant display
      await addMessage({
        id: `user-${Date.now()}`,
        type: "user",
        content: message,
        data: data,
        timestamp: new Date().toISOString(),
        conversationId: currentConversationId, // Add conversationId to message
      });

      // Set waiting state immediately when user sends a message
      console.log("Setting isWaitingForAI to true for message:", message);
      setIsWaitingForAI(true);

      // Send the message
      sendQuery({
        query: systemPrompt ? systemPrompt + "\n\n" + message : message,
        updated_state: conversationState,
        data: data,
      });
      clearAllSelectedDatasets();

      // // Scroll to bottom after sending message
      // setTimeout(() => {
      //   scrollToBottom();
      // }, 100);
    };

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
      setExperimentStatus,
    } = useExperiment();
    const {
      loadExperimentConfigFromS3: loadExperimentConfigFromS3New,
      setExperimentStatus: setExperimentStatusNew,
      configState: configStateModule,
    } = useModule();
    const { currentCompany, userInfo } = useAuth();
    const {
      setBaseDatasets,
      setDeletedBaseDatasets,
      configState: configStateConfig,
    } = useConfig();

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
    // const loadExistingExperiment = async ({
    //   experimentID,
    //   moduleName,
    //   run_date,
    //   experimentStatus,
    // }) => {
    //   if (oldFlowModules.includes(moduleName)) {
    //     setBYORConfigurations({});
    //     console.log("Row clicked:", experimentID);
    //     console.log("old?", oldFlowModules.includes(moduleName));
    //     await setCurrentDimension("all");
    //     await setCurrentValue("all");
    //     console.log(experimentID);
    //     console.log(moduleName);
    //     console.log(run_date);
    //     await setDashboardLoading(true);
    //     let exp_config;
    //     let priceColumn = "";
    //     let exp_tablesFilterData;
    //     let exp_byor_config;
    //     let exp_deleted_base_datasets;
    //     let exp_base_datasets;
    //     let exp_base_dataset_files;

    //     const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${experimentID}`;
    //     await setExperimentBasePath(Experiment_Base_Path);
    //     await executeParallelTasks([
    //       {
    //         fn: clearCache,
    //         args: [userInfo.userID, currentCompany.companyName],
    //       },
    //       {
    //         fn: loadExperimentConfigFromS3,
    //         args: [moduleName, experimentID, userInfo, currentCompany],
    //         output: "exp_config",
    //       },
    //       /*  {
    //     fn: navigate,
    //     args: [
    //       `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`,
    //     ],
    //   }, */
    //       { fn: setExperimentStatus, args: [experimentStatus] },
    //       { fn: setExperimentBasePath, args: [Experiment_Base_Path] },
    //       {
    //         fn: loadTablesFilterData,
    //         args: [
    //           `${Experiment_Base_Path}/custom_report/tablesFilterData.json`,
    //           userInfo.userID,
    //         ],
    //         output: "exp_tablesFilterData",
    //       },
    //       {
    //         fn: fetchJsonFromS3,
    //         args: [
    //           `${Experiment_Base_Path}/custom_report/BYORDataConfig.json`,
    //           userInfo.userID,
    //         ],
    //         output: "exp_byor_config",
    //       },

    //       {
    //         fn: fetchJsonFromS3,
    //         args: [
    //           `${Experiment_Base_Path}/custom_report/deletedBaseDatasets.json`,
    //           userInfo.userID,
    //         ],
    //         output: "exp_deleted_base_datasets",
    //       },

    //       {
    //         fn: listFilesInFolderEndpoint,
    //         args: [
    //           { folderPath: `${Experiment_Base_Path}/byor_base_datasets/` },
    //           userInfo.userID,
    //         ],
    //         output: "exp_base_dataset_files",
    //       },
    //     ]).then((results) => {
    //       exp_config = results.exp_config;
    //       priceColumn = exp_config.scenario_plan.pricing_constraints.price;
    //       exp_tablesFilterData = results.exp_tablesFilterData;
    //       exp_byor_config = results.exp_byor_config;
    //       exp_deleted_base_datasets = results.exp_deleted_base_datasets;
    //       exp_base_dataset_files = results.exp_base_dataset_files;
    //     });

    //     //  console.log(
    //     //    "Navigating to dashboard:",
    //     //    currentFlow,
    //     //    moduleName,
    //     //    experimentID,
    //     //    currentCompany.companyName
    //     //  );
    //     //  navigate(
    //     //    `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`
    //     //  );

    //     //console.log("Experiment_Base_Path", Experiment_Base_Path);
    //     /* await setExperimentBasePath(Experiment_Base_Path); */
    //     /* const exp_tablesFilterData = await loadTablesFilterData(
    //   `${Experiment_Base_Path}/custom_report/tablesFilterData.json`,
    //   userInfo.userID
    // ); */

    //     await syncExperimentConfigWithTablesFilter(
    //       exp_tablesFilterData,
    //       exp_config,
    //       Experiment_Base_Path
    //     );

    //     if (exp_deleted_base_datasets) {
    //       setDeletedBaseDatasets(exp_deleted_base_datasets);
    //     }

    //     if (
    //       Array.isArray(exp_base_dataset_files) &&
    //       exp_base_dataset_files.length > 0
    //     ) {
    //       const logFiles = exp_base_dataset_files.filter((file) =>
    //         file.Key.endsWith(".csv")
    //       );

    //       const datasetNames = logFiles.map((file) => {
    //         const parts = file.Key.split("/");
    //         return parts[parts.length - 2]; // Folder before output.csv
    //       });

    //       let finalDatasetList = datasetNames;
    //       if (exp_deleted_base_datasets) {
    //         finalDatasetList = datasetNames.filter(
    //           (name) => !exp_deleted_base_datasets?.includes(name)
    //         );
    //       }

    //       setBaseDatasets(finalDatasetList);
    //     }

    //     if (exp_byor_config) {
    //       setBYORConfigurations(exp_byor_config);
    //       console.log("BYOR");
    //     } else {
    //       await syncExperimentConfigWithBYOR(
    //         exp_byor_config,
    //         exp_config,
    //         Experiment_Base_Path
    //       );
    //     }
    //     //    if (currentFlow === "dashboard") {
    //     //      // await loadExecutiveViewData(
    //     //      //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`,
    //     //      //   {
    //     //      //     dimensionFilters: {
    //     //      //       feature: [currentDimension],
    //     //      //       value: [currentValue],
    //     //      //     },
    //     //      //     columnFilter: [],
    //     //      //     selectAllColumns: true,
    //     //      //   },
    //     //      //   userInfo.userID
    //     //      // );
    //     //      /*  await loadRawSalesData(
    //     //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
    //     //   {
    //     //     dimensionFilters: {
    //     //       feature: [currentDimension],
    //     //       value: [currentValue],
    //     //     },
    //     //     columnFilter: [],
    //     //     selectAllColumns: true,
    //     //   },
    //     //   userInfo.userID,
    //     //   hasParquetFiles
    //     // ); */
    //     //      await executeParallelTasks([
    //     //        {
    //     //          fn: loadRawSalesData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
    //     //            {
    //     //              dimensionFilters: {
    //     //                feature: [currentDimension],
    //     //                value: [currentValue],
    //     //              },
    //     //              columnFilter: [],
    //     //              selectAllColumns: true,
    //     //            },
    //     //            userInfo.userID,
    //     //            hasParquetFiles,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadDimensionFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
    //     //            hasParquetFiles,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadElasticityDimensionFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
    //     //            hasParquetFiles,
    //     //            priceColumn,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadInvPriceFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
    //     //            userInfo.userID,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadSupplyPlanFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/pp_dimension_value_metadata.json`,
    //     //            userInfo.userID,
    //     //          ],
    //     //        },
    //     //      ]);
    //     //      // await loadPriceMetricsData(
    //     //      //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/price_card_metrics.csv`,
    //     //      //   {
    //     //      //     dimensionFilters: {
    //     //      //       feature: [PriceCurrentDimension],
    //     //      //       value: [PriceCurrentValue],
    //     //      //     },
    //     //      //     columnFilter: [],
    //     //      //     selectAllColumns: true,
    //     //      //   },
    //     //      //   userInfo.userID
    //     //      // );
    //     //      // await loadDemandForecastingData(
    //     //      //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
    //     //      //   {
    //     //      //     dimensionFilters: {
    //     //      //       feature: [currentDimension],
    //     //      //       value: [currentValue],
    //     //      //     },
    //     //      //     columnFilter: [],
    //     //      //     selectAllColumns: true,
    //     //      //   }
    //     //      // );
    //     //      // await setForecastingPivotData(
    //     //      //   `${Experiment_Base_Path}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    //     //      //   {
    //     //      //     dimensionFilters: {
    //     //      //       [currentDimension]: [currentValue],
    //     //      //     },
    //     //      //     columnFilter: [],
    //     //      //     selectAllColumns: true,
    //     //      //   },
    //     //      //   userInfo.userID
    //     //      // );

    //     //      /* await loadDimensionFilterData(
    //     //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
    //     //   hasParquetFiles
    //     // );
    //     // await loadInvPriceFilterData(
    //     //   `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
    //     //   userInfo.userID
    //     // ); */
    //     //      /*  if (
    //     //   moduleName !== "demand-planning" ||
    //     //   moduleName !== "pricing-promotion-optimization"
    //     // ) {
    //     //   // await loadInventoryOptimizationData(
    //     //   //   `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
    //     //   //   exp_config,
    //     //   //   {
    //     //   //     dimensionFilters: {
    //     //   //       [convert(InvCurrentDimension)]: [InvCurrentValue],
    //     //   //     },
    //     //   //     columnFilter: [],
    //     //   //     selectAllColumns: true,
    //     //   //   },
    //     //   //   userInfo.userID
    //     //   // );
    //     //   // await loadInventoryMetricsData(
    //     //   //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/inventory_metrics.csv`,
    //     //   //   {
    //     //   //     dimensionFilters: {
    //     //   //       feature: [currentDimension],
    //     //   //       value: [currentValue],
    //     //   //     },
    //     //   //     columnFilter: [],
    //     //   //     selectAllColumns: true,
    //     //   //   },
    //     //   //   userInfo.userID
    //     //   // );
    //     // } */

    //     //      // await loadPriceOptimizationData(
    //     //      //   `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
    //     //      //   exp_config,
    //     //      //   {
    //     //      //     dimensionFilters: {
    //     //      //       [convert(PriceCurrentDimension)]: [PriceCurrentValue],
    //     //      //     },
    //     //      //     columnFilter: [],
    //     //      //     selectAllColumns: true,
    //     //      //   },
    //     //      //   userInfo.userID
    //     //      // );
    //     //    } else if (
    //     //      currentFlow === "scenario" ||
    //     //      currentFlow === "optimizations"
    //     //    ) {
    //     //      await executeParallelTasks([
    //     //        {
    //     //          fn: clearCache,
    //     //          args: [userInfo.userID, currentCompany.companyName],
    //     //        },
    //     //        {
    //     //          fn: loadDimensionFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
    //     //            hasParquetFiles,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadElasticityDimensionFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
    //     //            hasParquetFiles,
    //     //            priceColumn,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadRawSalesData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
    //     //            {
    //     //              dimensionFilters: {
    //     //                feature: [currentDimension],
    //     //                value: [currentValue],
    //     //              },
    //     //              columnFilter: [],
    //     //              selectAllColumns: true,
    //     //            },
    //     //            userInfo.userID,
    //     //            hasParquetFiles,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadDemandForecastingData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
    //     //            {
    //     //              dimensionFilters: {
    //     //                feature: [currentDimension],
    //     //                value: [currentValue],
    //     //              },
    //     //              columnFilter: [],
    //     //              selectAllColumns: true,
    //     //            },
    //     //            hasParquetFiles,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadInvPriceFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
    //     //            userInfo.userID,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadSupplyPlanFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/pp_dimension_value_metadata.json`,
    //     //            userInfo.userID,
    //     //          ],
    //     //        },
    //     //        /* {
    //     //     fn: setForecastingPivotData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    //     //       {
    //     //         dimensionFilters: {
    //     //           [currentDimension]: [currentValue],
    //     //         },
    //     //         columnFilter: [],
    //     //         selectAllColumns: true,
    //     //       },
    //     //       userInfo.userID,
    //     //       hasParquetFiles,
    //     //     ],
    //     //   } , */
    //     //        {
    //     //          fn: loadDimensionFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
    //     //            hasParquetFiles,
    //     //          ],
    //     //        },
    //     //        {
    //     //          fn: loadElasticityDimensionFilterData,
    //     //          args: [
    //     //            `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
    //     //            hasParquetFiles,
    //     //            priceColumn,
    //     //          ],
    //     //        },
    //     //      ]);
    //     //    }

    //     setDashboardLoading(false);
    //   } else {
    //     console.log("Row clicked:", experimentID);

    //     await setDashboardLoading(true);
    //     let exp_config;

    //     const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${experimentID}`;
    //     await setExperimentBasePath(Experiment_Base_Path);
    //     await executeParallelTasks([
    //       {
    //         fn: clearCache,
    //         args: [userInfo.userID, currentCompany.companyName],
    //       },
    //       {
    //         fn: loadExperimentConfigFromS3New,
    //         args: [moduleName, experimentID, userInfo, currentCompany],
    //         output: "exp_config",
    //       },
    //       /*  {
    //     fn: navigate,
    //     args: [
    //       `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`,
    //     ],
    //   }, */
    //       { fn: setExperimentStatusNew, args: [experimentStatus] },
    //       { fn: setExperimentBasePath, args: [Experiment_Base_Path] },
    //     ]).then((results) => {
    //       exp_config = results.exp_config;
    //     });

    //     //  console.log(
    //     //    "Navigating to dashboard:",
    //     //    currentFlow,
    //     //    moduleName,
    //     //    experimentID,
    //     //    currentCompany.companyName
    //     //  );
    //     //  navigate(
    //     //    `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`
    //     //  );

    //     //  if (currentFlow === "dashboard") {
    //     //    /*  await executeParallelTasks([
    //     //   {
    //     //     fn: loadRawSalesData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
    //     //       {
    //     //         dimensionFilters: {
    //     //           feature: [currentDimension],
    //     //           value: [currentValue],
    //     //         },
    //     //         columnFilter: [],
    //     //         selectAllColumns: true,
    //     //       },
    //     //       userInfo.userID,
    //     //       hasParquetFiles,
    //     //     ],
    //     //   },
    //     //   {
    //     //     fn: loadDimensionFilterData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
    //     //       hasParquetFiles,
    //     //     ],
    //     //   },
    //     //   {
    //     //     fn: loadInvPriceFilterData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
    //     //       userInfo.userID,
    //     //     ],
    //     //   },
    //     // ]); */
    //     //  } else if (
    //     //    currentFlow === "scenario" ||
    //     //    currentFlow === "optimizations"
    //     //  ) {
    //     //    /*   await executeParallelTasks([
    //     //   {
    //     //     fn: loadDimensionFilterData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
    //     //       hasParquetFiles,
    //     //     ],
    //     //   },
    //     //   {
    //     //     fn: loadRawSalesData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
    //     //       {
    //     //         dimensionFilters: {
    //     //           feature: [currentDimension],
    //     //           value: [currentValue],
    //     //         },
    //     //         columnFilter: [],
    //     //         selectAllColumns: true,
    //     //       },
    //     //       userInfo.userID,
    //     //       hasParquetFiles,
    //     //     ],
    //     //   },
    //     //   {
    //     //     fn: loadDemandForecastingData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
    //     //       {
    //     //         dimensionFilters: {
    //     //           feature: [currentDimension],
    //     //           value: [currentValue],
    //     //         },
    //     //         columnFilter: [],
    //     //         selectAllColumns: true,
    //     //       },
    //     //       hasParquetFiles,
    //     //     ],
    //     //   },
    //     //   {
    //     //     fn: loadInvPriceFilterData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
    //     //       userInfo.userID,
    //     //     ],
    //     //   },
    //     //   {
    //     //     fn: loadDimensionFilterData,
    //     //     args: [
    //     //       `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
    //     //       hasParquetFiles,
    //     //     ],
    //     //   },
    //     // ]); */
    //     //  }

    //     setDashboardLoading(false);
    //   }
    // };
    const experimentTriggered =
      experiments &&
      typeof experiments === "object" &&
      Object.keys(experiments).length > 0;

    console.log("ChatContainer: experimentTriggered =", experimentTriggered);
    // Get the first experiment ID from the experiments object
    const experimentId = experimentTriggered
      ? Object.keys(experiments)[0]
      : null;
    console.log("ChatContainer: experimentId =", experimentId);
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
    // Get the experiment data for additional info if needed
    const experimentData = experimentId ? experiments[experimentId] : null;
    const configState = experimentData
      ? oldFlowModules.includes(experimentData.experimentModuleName)
        ? configStateConfig
        : configStateModule
      : null;

    // if (
    //   (experimentId &&
    //     (!configState || Object.keys(configState).length === 0)) ||
    //   configState.common.jog_id !== experimentId
    // ) {
    //   console.log("Got the row:", experiments[experimentId]);
    //   const row = experiments[experimentId];
    //   loadExistingExperiment({
    //     experimentID: row.experimentID,
    //     moduleName: row.experimentModuleName,
    //     run_date: formatYearMonth(formatDate(row.createdAt)),
    //     experimentStatus: row.experimentStatus,
    //   });
    // }

    const handleStartChat = async (suggestion) => {
      console.log("ChatPage: Starting chat with suggestion:", suggestion);

      console.log("ChatPage: Current conversation ID:", currentConversationId);
      // Add user message to Redux immediately for instant display

      await addMessage({
        id: `user-${Date.now()}`,
        type: "user",
        content: suggestion,
        timestamp: new Date().toISOString(),
        conversationId: currentConversationId,
      });

      // Set waiting state immediately when user starts a chat
      console.log("Setting isWaitingForAI to true for suggestion:", suggestion);
      setIsWaitingForAI(true);

      // Send the suggestion
      sendQuery({ query: suggestion });

      // Scroll to bottom after starting chat
      // setTimeout(() => {
      //   scrollToBottom();
      // }, 100);
    };
    // Enhanced logic to handle the nested experiments structure

    // Debug logging
    console.log("ChatContainer: experiments =", experiments);
    console.log("ChatContainer: experimentTriggered =", experimentTriggered);
    console.log("ChatContainer: experimentId =", experimentId);
    console.log("ChatContainer: experimentData =", experimentData);

    const messagesToRender =
      currentMessages.length > 0 ? currentMessages : messages;

    //  CREDIT DECREMENT LOGIC
    // Track the last message ID we processed for credit decrement
    const lastProcessedMessageIdRef = useRef(null);
    // Track if we're currently processing a credit decrement
    const isDecrementingRef = useRef(false);

    useEffect(() => {
      // Only process if we have a current conversation and messages
      if (
        !currentConversation ||
        !currentMessages ||
        currentMessages.length === 0
      ) {
        return;
      }

      // Get the last message in the conversation
      const lastMessage = currentMessages[currentMessages.length - 1];

      // If this is the first time the effect runs for this conversation,
      // initialize the processed-message id to the current last message id
      // so we don't charge for historical messages on page load/refresh.
      if (lastProcessedMessageIdRef.current === null) {
        lastProcessedMessageIdRef.current = lastMessage?.id ?? null;
        return; // skip charging for existing last message
      }

      // Check if:
      //  Last message is from AI, we haven't processed this message ID yet,
      //  we're not currently decrementing, and company is NOT premium
      if (
        lastMessage?.type === "ai" &&
        lastMessage?.id !== lastProcessedMessageIdRef.current &&
        !isDecrementingRef.current &&
        !currentCompany?.isPremium
      ) {
        console.log("🔻 New AI message detected, decrementing credits by 1");

        // Mark this message as processed
        lastProcessedMessageIdRef.current = lastMessage.id;
        isDecrementingRef.current = true;

        // Decrement credits using hook helper (which handles optimistic update and backend sync)
        (async () => {
          try {
            await decrementCredits(1);
            console.log("✅ Credits decremented by 1");
          } catch (err) {
            console.error("❌ Failed to decrement credits:", err);
          } finally {
            isDecrementingRef.current = false;
          }
        })();
      } else if (
        lastMessage?.type === "ai" &&
        lastMessage?.id !== lastProcessedMessageIdRef.current &&
        currentCompany?.isPremium
      ) {
        // For premium users, just mark the message as processed without decrementing
        lastProcessedMessageIdRef.current = lastMessage.id;
        console.log("✅ Premium user - no credits deducted");
      }
    }, [
      currentMessages,
      currentConversation,
      decrementCredits,
      currentCompany?.isPremium,
    ]);

    // Reset processed message when conversation changes
    useEffect(() => {
      lastProcessedMessageIdRef.current = null;
    }, [currentConversationId]);

    // ===== REST OF YOUR COMPONENT =====

    // Ref for the scrollable container in drawer mode (CustomScrollbar's Box)
    const drawerScrollRef = useRef(null);

    // Scroll to bottom when drawer opens or messages change
    useEffect(() => {
      if (isDrawer && drawerScrollRef.current) {
        // Use setTimeout to ensure the DOM has updated
        const scrollToBottom = () => {
          if (drawerScrollRef.current) {
            // Smooth scroll to the bottom of the CustomScrollbar container
            drawerScrollRef.current.scrollTo({
              top: drawerScrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        };

        // Small delay to ensure DOM is ready, especially when drawer first opens
        setTimeout(scrollToBottom, 150);
        // Also try after a longer delay to account for drawer animation
        setTimeout(scrollToBottom, 400);
      }
    }, [isDrawer, messagesToRender.length]);

    useEffect(() => {
      const conversationPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/conversations/${currentConversationId}/conversation_state.json`;
      uploadJsonToS3(conversationPath, currentConversation);
    }, [currentMessages]);

    return (
      <Stack
        justifyContent="space-between"
        flex={1}
        sx={{
          padding: CHAT_CONFIG.CHAT_CONTAINER_PADDING,
          paddingTop: "0px",
          height: "100%",
          minHeight: 0,
        }}
      >
        {isDrawer ? (
          <Box
            ref={(el) => {
              // Get the CustomScrollbar's scrollable Box element (first child of wrapper)
              if (el && el.firstElementChild) {
                drawerScrollRef.current = el.firstElementChild;
              }
            }}
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CustomScrollbar>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Render all messages from current conversation */}
                {messagesToRender.map((message) => (
                  <Box key={message.id}>
                    {message.type === "user" ? (
                      <UserMessage message={message} isDrawer={isDrawer} />
                    ) : message.type === "ai" ? (
                      <AIMessage
                        message={message}
                        toolsUsed={message.toolsUsed || []}
                        setIsWaitingForAI={setIsWaitingForAI}
                        isDrawer={isDrawer}
                      />
                    ) : null}
                  </Box>
                ))}

                {/* Show typing indicator when waiting for AI */}
                {(isWaitingForAI || false) && (
                  <TypingIndicator
                    isTyping={true}
                    message={processingStepText}
                  />
                )}

                {/* Show current progress if streaming */}
                {(isStreaming || false) &&
                  currentProgress &&
                  currentProgress.length > 0 && (
                    <Box
                      sx={{
                        py: 6,
                        backgroundColor: STYLES.COLORS.BACKGROUND,
                        borderBottom: `1px solid ${STYLES.COLORS.BORDER}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          maxWidth: "768px",
                          width: "100%",
                          mx: "auto",
                          px: 4,
                          gap: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            backgroundColor: STYLES.COLORS.PRIMARY,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={TGLogo}
                            alt="TrueGradient"
                            style={{
                              width: "20px",
                              height: "20px",
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              color: STYLES.COLORS.TEXT_PRIMARY,
                              fontFamily: STYLES.FONTS.PRIMARY,
                              lineHeight: "1.5",
                            }}
                            dangerouslySetInnerHTML={{
                              __html:
                                currentProgress[currentProgress.length - 1]
                                  ?.message || "",
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}

                {/* Auto-scroll target */}
                <div ref={messagesEndRef} style={{ height: "100px" }} />
              </Box>
            </CustomScrollbar>
          </Box>
        ) : (
          <Box
            ref={ref}
            sx={{
              flex: 1,
              overflow: "auto",
              minHeight: 0,
            }}
          >
            {/* Render all messages from current conversation */}
            {messagesToRender.map((message) => (
              <Box key={message.id}>
                {message.type === "user" ? (
                  <UserMessage message={message} isDrawer={isDrawer} />
                ) : message.type === "ai" ? (
                  <AIMessage
                    message={message}
                    toolsUsed={message.toolsUsed || []}
                    setIsWaitingForAI={setIsWaitingForAI}
                    isDrawer={isDrawer}
                  />
                ) : null}
              </Box>
            ))}

            {/* Show typing indicator when waiting for AI */}
            {(isWaitingForAI || false) && (
              <TypingIndicator isTyping={true} message={processingStepText} />
            )}

            {/* Show current progress if streaming */}
            {(isStreaming || false) &&
              currentProgress &&
              currentProgress.length > 0 && (
                <Box
                  sx={{
                    py: 6,
                    backgroundColor: STYLES.COLORS.BACKGROUND,
                    borderBottom: `1px solid ${STYLES.COLORS.BORDER}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      maxWidth: "768px",
                      width: "100%",
                      mx: "auto",
                      px: 4,
                      gap: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: STYLES.COLORS.PRIMARY,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={TGLogo}
                        alt="TrueGradient"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: STYLES.COLORS.TEXT_PRIMARY,
                          fontFamily: STYLES.FONTS.PRIMARY,
                          lineHeight: "1.5",
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            currentProgress[currentProgress.length - 1]
                              ?.message || "",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

            {/* Auto-scroll target */}
            <div ref={messagesEndRef} style={{ height: "100px" }} />
          </Box>
        )}

        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            backgroundColor: STYLES.COLORS.BACKGROUND,
            //borderTop: `1px solid ${STYLES.COLORS.BORDER}`,
            // zIndex: 1,
          }}
        >
          <InputSection
            onSendMessage={handleSendMessage}
            onStartChat={handleStartChat}
            canSendMessage={canSendMessage}
            hasConversation={hasConversation}
            isWaitingForAI={isWaitingForAI}
          />
        </Box>
      </Stack>
    );
  }
);

ChatContainer.displayName = "ChatContainer";

export default ChatContainer;
