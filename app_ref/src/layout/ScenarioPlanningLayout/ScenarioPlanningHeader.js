import {
  Box,
  Button,
  Stack,
  Typography,
  ButtonGroup,
  Grid,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import { ReactComponent as PlusIcon } from "../../assets/Icons/plus.svg";
import React, { useContext, useEffect, useMemo } from "react";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import useExperiment from "../../hooks/useExperiment";
import { useState } from "react";
import CustomButton from "../../components/CustomButton";
import CustomTooltip from "../../components/CustomToolTip";

import useConfig from "../../hooks/useConfig";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SyncIcon from "@mui/icons-material/Sync";
import { v4 as uuidv4 } from "uuid";

import useAuth from "../../hooks/useAuth";
import { navigateTo } from "../../utils/navigate";
import useDashboard from "../../hooks/useDashboard";
import { clearCache, uploadJsonToS3 } from "../../utils/s3Utils";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import ContactSalesDialog from "../../components/ContactSalesDialog";
import { areJsonEqual } from "../../utils/jsonCompare";
import ExecuteButtonDialog from "../../components/ExecuteButtonDialog";
import { getExperimentById } from "../../utils/getExperiments";
import { processToken } from "../../utils/jwtUtils";
import LoadingScreen from "../../components/LoadingScreen";
import { clearQueryEngineCache } from "../../utils/queryEngine";
import { executeParallelTasks } from "../../utils/executeParallelTasks";
import useModule from "../../hooks/useModule";
import { oldFlowModules } from "../../utils/oldFlowModules";
import { cleanUpEditsConfig } from "../../utils/cleanUpEditsConfig";
import { useVibe } from "../../hooks/useVibe";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import {
  LogoutOutlined as LogoutOutlinedIcon,
  TimelineOutlined as TimelineOutlinedIcon,
  AutoFixHighOutlined as AutoFixHighOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
  RefreshOutlined as RefreshOutlinedIcon,
  NoteAddOutlined as NoteAddOutlinedIcon,
  Search as SearchIcon,
  Add as AddIcon,
  PushPin as PushPinIcon,
} from "@mui/icons-material";
import ChatIcon from "@mui/icons-material/Chat";

// Import hooks and components
// import useMeetingNote from "../../hooks/useMeetingNote";
import MeetingNotesSidebar from "../../components/MeetingNoteSidebar";
import ChatDrawer from "../../features/vibeGradient/components/chat/ChatDrawer";
import { generateSystemPrompt } from "../../utils/Agent Utils/generateSystemPrompt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddToNotesButton from "../../components/AddToMeetingNoteButton";

const getTabs = (moduleName, havePrice, elasticityDimensionFilterData) => {
  const tabs = [];

  // Always include Demand Planning first
  tabs.push({ page: "SnOP-report", label: "Demand Planning" });

  // Add Supply Planning tab only for inventory-optimization module
  if (moduleName === "inventory-optimization") {
    tabs.push({ page: "production-planning", label: "Supply Planning" });
  }

  // Add Promo Planning tab if elasticity dimension data exists
  if (
    elasticityDimensionFilterData &&
    Object.keys(elasticityDimensionFilterData).length > 0
  ) {
    tabs.push({ page: "promo-planning", label: "Promo Planning" });
  }

  // Add Trend Analysis
  tabs.push({ page: "planning-workbench", label: "Trend Analysis" });

  // Always include Scenario Planning tab last
  tabs.push({ page: "scenario-planning", label: "Scenario Planning" });

  return tabs;
};

const ScenarioPlanningHeader = ({ currentpage }) => {
  const {
    confirmAddContext,
    configState,
    confirmAddData,
    uploadConfigToS3,
    confirmAdvancedSettings,
    operations,
    clearConfigCache,
    uploadEditsConfig,
    editsConfig,
    isArchive,
    isProduction,
    exp_description,
  } = useConfig();
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
    isExecuteButtonDialogOpen,
    setIsExecuteButtonDialogOpen,
  } = useAuth();
  const navigate = useNavigate();
  const {
    experiment_config,
    experiments_list,
    cloneExperiment: cloneExperimentOld,
    defaultConfig,
    getModuleName,
    syncExperimentConfigFromS3WithEdits,
    loadedDatasets,
    datasetsLoaded,
    discardExperiment: discardExperimentExperiment,
    experiment_list,
    addConversationIdToExperiment,
  } = useExperiment();

  console.log(isArchive, isProduction);

  const { elasticityDimensionFilterData } = useDashboard();

  const { experiment_id } = useParams();
  const {
    cloneExperiment: cloneExperimentNew,
    discardExperiment: discardExperimentModule,
  } = useModule();

  const { clearError, setHasConversation, createNewChat, clearConversations, addConversationFromSidebar } =
    useVibe();
  const moduleName = getModuleName(experiment_id);

  const handleDiscardExperiment = () => {
    if (oldFlowModules.includes(moduleName)) {
      discardExperimentExperiment();
    } else {
      discardExperimentModule();
    }
  };

  const handleNewChat = async () => {
    console.log("ScenarioPlanningHeader: Starting new chat from header");

    // Clear any existing error immediately
    clearError();

    // Reset conversations and start a fresh one
    await clearConversations();
    const conversationID = await createNewChat("master_workflow", "New Chat");
    
    setHasConversation(true);
    // handleDiscardExperiment();

    setTimeout(() => {
      console.log("ScenarioPlanningHeader: New chat reset completed");
    }, 100);
    return conversationID;
  };

  // Meeting Notes State
  const [notesAnchorEl, setNotesAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  // Import meeting notes hook
  // const {
  //   notesList,
  //   loadMeetingNotes,
  //   createMeetingNote,
  //   addMeetingNoteSectionWithBlock,
  // } = useMeetingNote();

  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const handleOpenChatDrawer = () => {
    setIsChatDrawerOpen(true);
  };

  const handleCloseChatDrawer = () => {
    setIsChatDrawerOpen(false);
  };

  const cloneExperiment = oldFlowModules.includes(moduleName)
    ? cloneExperimentOld
    : cloneExperimentNew;

  const [updatedAt, setUpdatedAt] = useState("");
  const [switchLoading, setSwitchLoading] = useState(false);
  const [executeBtnText, setExecuteBtnText] = useState({
    runType: "run_scenario",
    runDEPipeline: false,
  });
  const [experimentStatus, setExperimentStatus] = useState(null);
  const [lastUploadedEditsConfig, setLastUploadedEditsConfig] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  // Meeting Notes Handlers
  const handleNotesClick = (event) => {
    console.log("Add to Notes clicked");
    event.stopPropagation();
    setNotesAnchorEl(event.currentTarget);

    // Load meeting notes
    // loadMeetingNotes(userInfo, currentCompany)
    //   .then(result => {
    //     console.log("Meeting notes loaded:", result);
    //   })
    //   .catch(error => {
    //     console.error("Error loading meeting notes:", error);
    //   });
  };

  const handleNotesClose = () => {
    console.log("Closing notes popover");
    setNotesAnchorEl(null);
    setSearchQuery("");
    setNewNoteTitle("");
    setIsCreatingNewNote(false);
  };

  // const handleCreateNewNote = () => {
  //   console.log("Creating new note clicked");
  //   setIsCreatingNewNote(true);
  // };

  // const handleSaveNewNote = async () => {
  //   console.log("Saving new note with title:", newNoteTitle);
  //   if (!newNoteTitle.trim()) {
  //     console.log("No title provided");
  //     return;
  //   }

  //   const noteInfo = {
  //     title: newNoteTitle,
  //     notes: [], // Start with empty notes array
  //     metadata: {
  //       company: currentCompany.companyName,
  //       companyId: currentCompany.companyID,
  //       tags: ["scenario-planning"],
  //       category: "experiment",
  //     },
  //   };

  //   console.log("Creating note with info:", noteInfo);

  //   try {
  //     const result = await createMeetingNote(
  //       userInfo,
  //       currentCompany,
  //       noteInfo
  //     );
  //     console.log("Note creation result:", result);

  //     if (result.success && result.noteId) {
  //       console.log("Note created successfully, adding section...");

  //       // Add a section with experiment data
  //       const sectionResult = await addMeetingNoteSectionWithBlock(
  //         userInfo,
  //         currentCompany,
  //         {
  //           experimentId: experiment_id,
  //           experimentName:
  //             experiment_config?.project_setup?.project_name ||
  //             "Untitled Experiment",
  //           tabName: currentpage,
  //           filters_applied: {},
  //         },
  //         "image",
  //         "https://via.placeholder.com/400x200.png?text=Experiment+Analysis+Image"
  //       );

  //       console.log("Section added result:", sectionResult);

  //       // Open the sidebar with the new note
  //       setSelectedNoteId(result.noteId);
  //       setIsNotesSidebarOpen(true);
  //       console.log(
  //         "Sidebar should open now - noteId:",
  //         result.noteId,
  //         "isNotesSidebarOpen:",
  //         true
  //       );

  //       handleNotesClose();
  //     } else {
  //       console.error("Note creation failed:", result);
  //     }
  //   } catch (error) {
  //     console.error("Error creating note:", error);
  //   }
  // };

  // const handleSelectNote = async (note) => {
  //   console.log("Selecting note:", note.noteId, note.title);
  //   // Open the sidebar with the selected note
  //   setSelectedNoteId(note.noteId);
  //   setIsNotesSidebarOpen(true);
  //   console.log(
  //     "Setting sidebar open - noteId:",
  //     note.noteId,
  //     "isNotesSidebarOpen:",
  //     true
  //   );
  //   handleNotesClose();
  // };

  // Add console logs for state changes
  useEffect(() => {
    console.log("isNotesSidebarOpen changed to:", isNotesSidebarOpen);
    console.log("selectedNoteId changed to:", selectedNoteId);
  }, [isNotesSidebarOpen, selectedNoteId]);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await confirmAddContext();
      const latestConfig = await confirmAdvancedSettings();
      console.log("Latest config", latestConfig);
      const syncedConfig = await syncExperimentConfigFromS3WithEdits(
        moduleName,
        latestConfig,
        currentCompany
      );
      return syncedConfig;
    } finally {
      setIsSyncing(false);
      setLastSyncedTime(Date.now());
    }
  };

  // Helper function to check if edits config has changes compared to last uploaded state
  const hasEditsChanges = (editsConfig) => {
    if (!editsConfig) return false;

    // If we haven't uploaded anything yet, check if there are any edits
    if (!lastUploadedEditsConfig) {
      const { editedFiles, newRows, editHistories } = editsConfig;
      const hasEditedFiles = editedFiles && Object.keys(editedFiles).length > 0;
      const hasNewRows = newRows && Object.keys(newRows).length > 0;
      const hasEditHistories =
        editHistories && Object.keys(editHistories).length > 0;

      return hasEditedFiles || hasNewRows || hasEditHistories;
    }

    // Compare current state with last uploaded state
    const currentString = JSON.stringify(editsConfig);
    const lastUploadedString = JSON.stringify(lastUploadedEditsConfig);

    return currentString !== lastUploadedString;
  };

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const handleRunScenario = async () => {
    await confirmAddContext();
    const latestConfig = await confirmAdvancedSettings();
    console.log("Latest config", latestConfig);
    await uploadConfigToS3({
      config: latestConfig,
      clientName: currentCompany.companyName,
      experimentId: latestConfig.common.job_id,
      moduleName: latestConfig.common.module_name,
      userInfo,
      currentCompany,
      runType: "run_scenario",
      isClone: false,
      runDEPipeline: executeBtnText.runDEPipeline,
      isArchive: isArchive,
      isProduction: isProduction,
      exp_description: exp_description,
    });
    await clearQueryEngineCache(latestConfig.common.job_id);
  };
  const handleRetraining = async () => {
    console.log("Retraining");
    await confirmAddData(loadedDatasets, datasetsLoaded);
    await confirmAddContext();

    const latestConfig = await confirmAdvancedSettings();
    console.log("Latest config", latestConfig);
    console.log("runDePipeline " + executeBtnText.runDEPipeline);
    uploadConfigToS3({
      config: latestConfig,
      clientName: currentCompany.companyName,
      experimentId: latestConfig.common.job_id,
      moduleName: latestConfig.common.module_name,
      userInfo,
      currentCompany,
      runType: "run_training",
      isClone: false,
      runDEPipeline: executeBtnText.runDEPipeline,
      isArchive: isArchive,
      isProduction: isProduction,
      exp_description: exp_description,
    });
  };

  const handleRerunOptimization = async () => {
    await confirmAddData(loadedDatasets, datasetsLoaded);
    const newConfig = await confirmAddContext(loadedDatasets);
    console.log("New config", newConfig);
    await uploadConfigToS3({
      config: newConfig,
      clientName: currentCompany.companyName,
      experimentId: newConfig.common.job_id,
      moduleName: newConfig.common.module_name,
      userInfo,
      currentCompany,
      runType: "run_optimization",
      isClone: false,
      runDEPipeline: executeBtnText.runDEPipeline,
      isArchive: isArchive,
      isProduction: isProduction,
      exp_description: exp_description,
    });
    await clearQueryEngineCache(newConfig.common.job_id);
  };
  const handleClone = () => {
    cloneExperiment();
  };
  const { setLastSyncedTime } = useDashboard();

  const CustomizedButtonStyles = ({ page, children }) => {
    const navigate = useNavigate();
    const { experiment_id } = useParams();
    const { experiment_config } = useExperiment();
    const { experimentBasePath, loadReports, dashboardLoading } =
      useDashboard();

    const havePrice =
      experiment_config.scenario_plan.pricing_constraints.price !== "None" &&
      experiment_config.scenario_plan.pricing_constraints.price;
    const moduleName = experiment_config.common.module_name;
    const [disabled, setdisabled] = useState(dashboardLoading);
    useEffect(() => {
      setdisabled(dashboardLoading);
    }, [dashboardLoading]);

    if (page === currentpage) {
      return (
        <Button
          disabled={dashboardLoading}
          sx={{
            backgroundColor: "#F1F9FF",
            width: "100%",
            maxWidth: "100%",
            "&:hover": {
              backgroundColor: "#F1F9FF",
              textDecoration: "none",
              // border: "1px solid",
              // borderColor: theme.palette.borderColor.searchBox,
            },

            height: "40px",
          }}
          onClick={() => {
            console.log("clicked : ", page);
            navigate(
              `/${currentCompany.companyName}/scenario/view/${moduleName}/${experiment_id}/${page}`
            );
          }}
        >
          <Stack
            direction={"row"}
            spacing={1}
            alignItems={"center"}
            paddingRight={"8px"}
            sx={{
              maxWidth: "100%",
              overflow: "hidden", // Prevents the stack from exceeding the button width
            }}
          >
            <Box
              sx={{
                height: "8px",
                width: "8px",
                borderRadius: "4px",
                backgroundColor: "#12B76A",
              }}
            />
            <Typography sx={btnGrpText}>{children}</Typography>
          </Stack>
        </Button>
      );
    } else {
      return (
        <Button
          disabled={dashboardLoading}
          sx={{
            width: "100%",
            "&:hover": {
              backgroundColor: "#F1F9FF",
              // // textDecoration: "none",
              // border: "1px solid",
              // borderColor: theme.palette.borderColor.searchBox,
            },
            height: "40px",
          }}
          onClick={() => {
            console.log("clicked : ", page);
            if (page === "reports-and-analysis") {
              console.log("loading reports");
              loadReports(moduleName, experimentBasePath, havePrice);
            }
            navigate(
              `/${currentCompany.companyName}/scenario/view/${moduleName}/${experiment_id}/${page}`
            );
          }}
        >
          <Stack direction={"row"} spacing={1} paddingRight={"8px"}>
            {/* <Box
              sx={{
                height: "8px",
                width: "8px",
                borderRadius: "4px",
                backgroundColor: "#F1F9FF",
              }}
            /> */}
            <Typography sx={btnGrpText}>{children}</Typography>
          </Stack>
        </Button>
      );
    }
  };
  const { theme } = useContext(ThemeContext);

  const btnText = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
  };
  const btnGrpText = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
    whiteSpace: "nowrap", // Prevents wrapping
    overflow: "hidden", // Hides overflowed content
    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
    maxWidth: "100%", //
  };
  const textLgMedium = {
    fontFamily: "Inter",
    fontSize: "18px",
    fontWeight: 500,
    lineHeight: "28px",
    textAlign: "left",
    color: "#101828",
  };
  const {
    dashboardLoading,
    clearDashboardCache,
    experimentBasePath,
    tablesFilterData,
    clearAggregatedValuesHistory,
  } = useDashboard();
  const { systemPrompt, dataPathDict } = useMemo(
    () =>
      generateSystemPrompt(
        experimentBasePath,
        moduleName,
        experiment_config.project_setup.project_name
      ),
    [
      experimentBasePath,
      moduleName,
      experiment_config.project_setup.project_name,
    ]
  );

  const {
    setCurrentDimension,
    setCurrentValue,
    setExperimentBasePath,
    setDashboardLoading,
    currentDimension,
    currentValue,
    loadRawSalesData,
    loadDemandForecastingData,
    loadDimensionFilterData,
    setForecastingPivotData,
    loadInvPriceFilterData,
    loadInventoryMetricsData,
    loadInventoryOptimizationData,
    loadPriceOptimizationData,
    loadPriceMetricsData,
    syncExperimentConfigWithTablesFilter,
    loadTablesFilterData,
  } = useDashboard();
  const { hasParquetFiles, loadExperimentConfigFromS3 } = useExperiment();

  const fetchExperimentById = async () => {
    try {
      console.log("Fetching experiment");
      const response = await getExperimentById(
        { experimentID: experiment_id },
        currentCompany,
        userInfo.userID
      );
      console.log("response" + response);
      const data = await processToken(response);
      setExperimentStatus(data.experimentStatus);
    } catch (error) {
      console.error("Error fetching experiment:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchExperimentById();
  }, [experiment_id]);
  const handleExperimentClick = async () => {
    await navigateToFlow("experiments");
  };

  const handleDashboardClick = async () => {
    await navigateToFlow("dashboard");
  };
  const handleOptimizeClick = async () => {
    await navigateToFlow("optimizations");
  };

  const navigateToFlow = async (flowType) => {
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experiment_id
    );
    if (!experiment) return;
    setSwitchLoading(true);
    console.log(flowType);

    await setCurrentDimension("all");
    await setCurrentValue("all");

    const run_date = formatYearMonth(experiment.createdAt);
    const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${experiment.experimentModuleName}/${run_date}/${experiment_id}`;

    await setExperimentBasePath(Experiment_Base_Path);

    if (flowType === "dashboard") {
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
          fn: loadInvPriceFilterData,
          args: [
            `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
            userInfo.userID,
          ],
        },
      ]);
    } else if (flowType === "scenario" || flowType === "optimizations") {
      await executeParallelTasks([
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
      ]);
    }

    setSwitchLoading(false);
    navigate(
      `/${currentCompany.companyName}/${flowType}/view/${moduleName}/${experiment_id}`
    );
  };

  // Add this helper function (same as in ExpTable)
  function formatYearMonth(dateString) {
    const datePart = dateString.split(" at ")[0];
    const date = new Date(datePart);
    if (isNaN(date)) {
      throw new Error("Invalid date format");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}${month}`;
  }

  const configPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${configState?.common.module_name}/${configState.common.job_id}/config.json`;
  const havePrice =
    experiment_config.scenario_plan.pricing_constraints.price !== "None" &&
    experiment_config.scenario_plan.pricing_constraints.price;

  const [status, setStatus] = useState("");
  const [scenarioBtnText, setScenarioBtnText] = useState(
    "Run Scenario Planning"
  );
  const [module, setModule] = useState(experiment_config.common.module_name);
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
  useEffect(() => {
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experiment_id
    );

    if (experiment) {
      console.log("Updated At:", experiment.updatedAt);
      setUpdatedAt(experiment.updatedAt);
      setStatus(parseString(experiment.experimentStatus));
      setModule(experiment.experimentModuleName);
    } else {
      console.log("Experiment not found");
    }
  }, [experiment_id, experiments_list]);
  useEffect(() => {
    if (Object.keys(tablesFilterData).length > 0) {
      uploadJsonToS3(
        `${experimentBasePath}/custom_report/tablesFilterData.json`,
        tablesFilterData
      );
    }
  }, [tablesFilterData]);

  useEffect(() => {
    const isOperationsEqual = areJsonEqual(
      defaultConfig?.preprocess.serial_ops[0]?.operations,
      operations
    );
    const isTrainingEqual = areJsonEqual(
      defaultConfig?.training,
      configState?.training
    );

    console.log("compareJson operations:", isOperationsEqual);
    console.log("compareJson training:", isTrainingEqual);

    setScenarioBtnText(
      isOperationsEqual && isTrainingEqual
        ? "Run Scenario Planning"
        : "Rerun Training"
    );
  }, [operations, configState?.training]);

  async function handleExecuteButton() {
    await clearAggregatedValuesHistory();
    if (executeBtnText.runType === "run_training") {
      handleRetraining();
    } else if (executeBtnText.runType === "run_optimization") {
      handleRerunOptimization();
    } else {
      if (scenarioBtnText === "Run Scenario Planning") {
        handleRunScenario();
      } else {
        handleRetraining();
      }
    }
    setIsExecuteButtonDialogOpen(false);
  }
  const handleConversation = async () => {
    
    console.log(experiments_list, experiment_id);  
// debugger; 
    // If experiment_list is an array, find the experiment by its id property.
   const experimentItem = Array.isArray(experiments_list)
  ? experiments_list.find((e) =>  
      String(e?.experimentID) === String(experiment_id)   
    )
  : experiments_list?.[experiment_id]; 


    const conversationID = experimentItem?.conversationID;
    console.log("Existing conversation ID:", conversationID);

    if (conversationID) {
      addConversationFromSidebar(conversationID);
    } else {
      const conversationIDNew = await handleNewChat();
      console.log("New conversation ID:", conversationIDNew);
    
       await addConversationIdToExperiment(experiment_id, conversationIDNew, userInfo);
      
    }

    handleOpenChatDrawer();
  };
  
  useEffect(() => {
    if (scenarioBtnText === "Run Scenario Planning") {
      setExecuteBtnText({
        runType: "run_scenario",
        runDEPipeline: false,
      });
    } else {
      setExecuteBtnText({
        runType: "run_training",
        runDEPipeline: false,
      });
    }
  }, [scenarioBtnText]);

  function handleBtnText(btnClicked) {
    if (btnClicked === "run_training") {
      setExecuteBtnText({
        runType: "run_training",
        runDEPipeline: true,
      });
    } else if (btnClicked === "rerun_optimization") {
      setExecuteBtnText({
        runType: "run_optimization",
        runDEPipeline: true,
      });
    }

    setIsExecuteButtonDialogOpen(true);
  }

  if (switchLoading) {
    return (
      <>
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          padding: "15px",
          gap: "16px",
        }}
      >
        {/* Left Section: Project Title + Status */}
        <Stack direction="column" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CustomTooltip
              title={experiment_config.project_setup.project_name}
              arrow
            >
              <Typography
                sx={{
                  ...textLgMedium,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "600px",
                }}
              >
                {experiment_config.project_setup.project_name}
              </Typography>
            </CustomTooltip>

            <Chip
              label={status}
              size="small"
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "18px",
                textAlign: "initial",
                color: "#027A48",
                backgroundColor: "#ECFDF3", // use the same helper as in experiment
              }}
            />
          </Stack>

          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "20px",
              color: "#475467",
              textAlign: "left",
            }}
          >
            {`Last updated: ${updatedAt}`}
          </Typography>
        </Stack>

        {/* Right Section: Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Add to Notes Button */}
          {/* <CustomTooltip title="Add to Notes" arrow>
            <IconButton
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                height: "40px",
                width: "40px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#D1D5DB",
                },
              }}
              onClick={handleNotesClick}
            >
              <NoteAddOutlinedIcon sx={{ fontSize: "20px", color: "#344054" }} />
            </IconButton>
          </CustomTooltip> */}

          {/* Exit Button */}
          <CustomTooltip title="Exit" arrow>
            <IconButton
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                height: "40px",
                width: "40px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#D1D5DB",
                },
              }}
              onClick={async () => {
                navigate(`/${currentCompany.companyName}/scenario`);
                const path = `${experimentBasePath}/custom_report/tablesFilterData.json`;
                await clearDashboardCache();

                const syncedConfig = await handleManualSync();
                console.log("Synced config", syncedConfig);
                await uploadJsonToS3(path, tablesFilterData);
                await uploadJsonToS3(configPath, syncedConfig);

                await clearConfigCache();
                await clearCache(userInfo.userID, currentCompany.companyName);
              }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: "20px", color: "#344054" }} />
            </IconButton>
          </CustomTooltip>

          {/* Chat Assistant Button */}
          <CustomTooltip title="Agent" arrow>
            <IconButton
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                height: "40px",
                width: "40px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#D1D5DB",
                },
              }}
              onClick={async () => {
                 await handleConversation();  
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: "20px", color: "#344054" }} />
            </IconButton>
          </CustomTooltip>

          {/* Sync Button */}
          <CustomTooltip title="Sync" arrow>
            <IconButton
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                height: "40px",
                width: "40px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#D1D5DB",
                },
              }}
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              <SyncIcon
                sx={{
                  fontSize: "18px",
                  color: "#344054",
                  animation: isSyncing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </CustomTooltip>

          <AddToNotesButton
            userInfo={userInfo}
            currentCompany={currentCompany}
            experimentId={experiment_id}
            experimentName={experiment_config?.project_setup?.project_name}
            tabName={currentpage}
            setIsNotesSidebarOpen={setIsNotesSidebarOpen}
            onNoteCreated={(note) => {
              console.log("Note created successfully:", note);
              // Optional: Show success notification
            }}
            onNoteSelected={(note) => {
              console.log("Note selected:", note);
              // Optional: Open notes editor or sidebar
            }}
          />

          {/* Dashboard Button */}
          {parseString(experimentStatus) === "Completed" && (
            <CustomTooltip title="Experiment" arrow>
              <IconButton
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  height: "40px",
                  width: "40px",
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                    borderColor: "#D1D5DB",
                  },
                }}
                onClick={handleExperimentClick}
              >
                <ScienceOutlinedIcon
                  sx={{ fontSize: "18px", color: "#6B7280" }}
                />
              </IconButton>
            </CustomTooltip>
          )}
          {parseString(experimentStatus) === "Completed" && (
            <CustomTooltip title="Dashboard" arrow>
              <IconButton
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  height: "40px",
                  width: "40px",
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                    borderColor: "#D1D5DB",
                  },
                }}
                onClick={handleDashboardClick}
              >
                <TimelineOutlinedIcon
                  sx={{ fontSize: "18px", color: "#6B7280" }}
                />
              </IconButton>
            </CustomTooltip>
          )}

          {/* Optimize Button */}
          {parseString(experimentStatus) === "Completed" && (
            <CustomTooltip title="Optimize" arrow>
              <IconButton
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  height: "40px",
                  width: "40px",
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                    borderColor: "#D1D5DB",
                  },
                }}
                onClick={handleOptimizeClick}
              >
                <AutoFixHighOutlinedIcon
                  sx={{ fontSize: "18px", color: "#6B7280" }}
                />
              </IconButton>
            </CustomTooltip>
          )}

          {/* Clone Button */}
          <CustomTooltip
            title={
              currentCompany.clone_experiment ? "Clone" : "Premium Feature"
            }
            arrow
          >
            <CustomButton
              title="Clone"
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                height: "40px",
                opacity: currentCompany.clone_experiment ? 1 : 0.5,
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#D1D5DB",
                },
              }}
              outlined
              onClick={
                currentCompany.clone_experiment
                  ? () => handleClone()
                  : () => setIsContactSalesDialogOpen(true)
              }
              isPremiumFeature={currentCompany.clone_experiment}
            />
          </CustomTooltip>

          {/* Scenario Plan Button */}
          <CustomButton
            title={scenarioBtnText}
            sx={{
              borderRadius: "8px",
              padding: "8px 20px",
              height: "40px",
              textTransform: "none",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
            }}
            onClick={() => {
              if (currentCompany.scenario_planning_access) {
                setIsExecuteButtonDialogOpen(true);
              } else {
                setIsContactSalesDialogOpen(true);
              }
            }}
            isPremiumFeature={currentCompany.scenario_planning_access}
          />

          {/* More Options (Rerun Menu) */}
          <IconButton
            aria-label="more options"
            aria-haspopup="true"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(e);
            }}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              height: "40px",
              width: "40px",
              "&:hover": {
                backgroundColor: "#F9FAFB",
                borderColor: "#D1D5DB",
              },
            }}
          >
            <MoreHorizIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: "8px",
                mt: 1,
                boxShadow:
                  "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleBtnText("run_training");
                handleMenuClose();
              }}
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                padding: "10px 16px",
                "&:hover": { backgroundColor: "#F9FAFB" },
              }}
            >
              <RefreshOutlinedIcon
                sx={{ fontSize: "18px", mr: 1.5, color: "#6B7280" }}
              />
              Rerun Experiment
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleBtnText("rerun_optimization");
                handleMenuClose();
              }}
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                padding: "10px 16px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                },
              }}
            >
              <AutorenewOutlinedIcon
                sx={{ fontSize: "18px", mr: 1.5, color: "#6B7280" }}
              />
              Rerun Optimization
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* Meeting Notes Popover */}

      {/* Meeting Notes Sidebar */}
      <MeetingNotesSidebar
        open={isNotesSidebarOpen}
        onClose={() => {
          console.log("Closing sidebar");
          setIsNotesSidebarOpen(false);
          setSelectedNoteId(null);
        }}
        // noteId={selectedNoteId}
        // userInfo={userInfo}
        // currentCompany={currentCompany}
        // experimentId={experiment_id}
        // experimentName={experiment_config?.project_setup?.project_name}
        // tabName={currentpage}
      />

      <Grid container sx={{ paddingX: "15px", paddingBottom: "8px" }}>
        {getTabs(
          experiment_config.common.module_name,
          havePrice,
          elasticityDimensionFilterData
        ).map((button) => {
          return (
            <Grid
              item
              key={button.label}
              xs={6}
              md={
                12 /
                getTabs(
                  experiment_config.common.module_name,
                  havePrice,
                  elasticityDimensionFilterData
                ).length
              }
              sx={{
                border: "1px solid",
                borderColor: theme.palette.borderColor.searchBox,
              }}
            >
              <CustomizedButtonStyles page={button.page}>
                {button.label}
              </CustomizedButtonStyles>
            </Grid>
          );
        })}
      </Grid>
      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales for more access."
        ConfirmButtonTitle="Contact Sales"
      />

      <ExecuteButtonDialog
        open={isExecuteButtonDialogOpen}
        handleClose={() => setIsExecuteButtonDialogOpen(false)}
        handleConfirm={handleExecuteButton}
        WarningText={`You are about to execute a ${
          executeBtnText.runType
        } workflow.  This will run ${
          executeBtnText.runDEPipeline ? "with" : "without"
        } DE Pipeline before execution.  `}
        ResultText={` This process may take significant time and resources.`}
        ConfirmButtonTitle="Proceed"
        executeBtnText={executeBtnText}
        setExecuteBtnText={setExecuteBtnText}
      />

      {isChatDrawerOpen && (
        <ChatDrawer
          open={isChatDrawerOpen}
          onClose={handleCloseChatDrawer}
          title="TG Agent"
          systemPrompt={systemPrompt}
          dataPathDict={dataPathDict}
        />
      )}
    </>
  );
};

export default ScenarioPlanningHeader;
