import {
  Box,
  Button,
  Stack,
  Typography,
  ButtonGroup,
  Chip,
  IconButton,
  MenuItem,
  Menu,
} from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

import { ReactComponent as ExportIcon } from "../../assets/Icons/export.svg";
import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import useExperiment from "../../hooks/useExperiment";
import useAuth from "../../hooks/useAuth";
import CustomButton from "../../components/CustomButton";
import useConfig from "../../hooks/useConfig";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import ViewExperimentStepper from "../../components/ViewExperimentStepper";
import { getExperimentById } from "../../utils/getExperiments";
import { processToken } from "../../utils/jwtUtils";
import { MoreVertRounded } from "@mui/icons-material";
import StageExport from "../../pages/main/ExperimentFlow/ViewExperimentPageNew/StageExport";
import ContactSalesDialog from "../../components/ContactSalesDialog";
import IosShareIcon from "@mui/icons-material/IosShare";
import ExportPipelines from "../../pages/main/ExperimentFlow/ViewExperimentPage/ExportPipelines";
import { loadExportPipelinesList } from "../../redux/actions/exportsAction";
import useExports from "../../hooks/useExports";
import { areJsonEqual } from "../../utils/jsonCompare";
import ExecuteButtonDialog from "../../components/ExecuteButtonDialog";
import useDashboard from "../../hooks/useDashboard";
import { clearCache } from "../../utils/s3Utils";

import ScenarioPlanningEdit from "../../pages/main/ScenarioPlanningFlow/ViewDashboardPage/ScenarioPlanEditNew";
import LoadingScreen from "../../components/LoadingScreen";
import { clearQueryEngineCache } from "../../utils/queryEngine";
import { executeParallelTasks } from "../../utils/executeParallelTasks";
import useModule from "../../hooks/useModule";
import { oldFlowModules } from "../../utils/oldFlowModules";
import AddToNotesButton from "../../components/AddToMeetingNoteButton";
import MeetingNotesSidebar from "../../components/MeetingNoteSidebar";
const ViewExperimentHeader = ({ currentpage }) => {
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
    isExecuteButtonDialogOpen,
    setIsExecuteButtonDialogOpen,
  } = useAuth();

  const { experiment_id } = useParams();
  const { theme } = useContext(ThemeContext);
  const [isEdit, setIsEdit] = useState(false);
  const [experimentStatus, setExperimentStatus] = useState(null);
  const [experimentRunType, setExperimentRunType] = useState(null);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errorDetails, setErrorDetails] = useState(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const { loadExportPipelinesList } = useExports();

  const [scenarioBtnText, setScenarioBtnText] = useState(
    "Run Scenario Planning"
  );

  useEffect(() => {
    loadExportPipelinesList(userInfo);
  }, []);

  // Function to fetch the experiment data by ID
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
      setExperimentRunType(data.experimentRunType);

      const statusObject = JSON.parse(data.experimentStatus);
      setCurrentStep(statusObject.current_step);
      setCompletedSteps(statusObject.completed_steps);
      setErrorDetails(statusObject.details?.error || null);
    } catch (error) {
      console.error("Error fetching experiment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Define the statuses to check against
  const hiddenStatuses = [
    "Initiating...",
    "Initiated",
    "Queued",
    "Executing",
    "Executed",
    "Launching...",
    "Running",
    "Failed",
    "Terminating...",
    "Terminated",
  ];

  useEffect(() => {
    fetchExperimentById();

    // Set up polling every 10 seconds
    const intervalId = setInterval(() => {
      fetchExperimentById();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [experiment_id]);

  const CustomizedButtonStyles = ({ page, children }) => {
    const navigate = useNavigate();
    const { experiment_id, moduleName } = useParams();

    if (page === currentpage) {
      return (
        <Button
          sx={{
            backgroundColor: "#F1F9FF",
            "&:hover": {
              backgroundColor: "#F1F9FF",
              textDecoration: "none",
              border: "1px solid",
              borderColor: theme.palette.borderColor.searchBox,
            },

            height: "40px",
          }}
          onClick={() => {
            navigate(
              `/${currentCompany.companyName}/experiments/view/${moduleName}/${experiment_id}/${page}`
            );
          }}
        >
          <Stack
            direction={"row"}
            spacing={1}
            alignItems={"center"}
            paddingRight={"8px"}
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
          sx={{
            "&:hover": {
              backgroundColor: "inherit", // Keep the background color on hover
              textDecoration: "none",
              border: "1px solid",
              borderColor: theme.palette.borderColor.searchBox,
            },
            height: "40px",
          }}
          onClick={() => {
            navigate(
              `/${currentCompany.companyName}/experiments/view/${moduleName}/${experiment_id}/${page}`
            );
          }}
        >
          <Stack direction={"row"} spacing={1} paddingRight={"8px"}>
            <Box
              sx={{
                height: "8px",
                width: "8px",
                borderRadius: "4px",
                backgroundColor: "#FFFFFF",
              }}
            />
            <Typography sx={btnGrpText}>{children}</Typography>
          </Stack>
        </Button>
      );
    }
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

  const navigate = useNavigate();
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);
  const handleConfirmationOpen = () => setConfirmationOpen(true);
  const handleConfirmationClose = () => setConfirmationOpen(false);
  const { clearAggregatedValuesHistory } = useDashboard();

  const {
    loadDemandForecastingData,

    loadDimensionFilterData,

    loadRawSalesData,
    setCurrentDimension,
    setCurrentValue,
    setExperimentBasePath,

    currentDimension,
    currentValue,
    loadInvPriceFilterData,
  } = useDashboard();

  // const [updatedAt, setUpdatedAt] = useState("");
  const { experiments_list, experiment_config } = useExperiment();
  const {
    cloneExperiment: cloneExperimentOld,
    loadedDatasets,
    datasetsLoaded,
    getModuleName,
    exitFromViewExperiment,
    terminateTheExperiments,
    defaultConfig,
    hasParquetFiles,
    confirmAddContext,
    uploadConfigToS3,
    confirmAddData,
    configState,
    operations,
    confirmAdvancedSettings,
    cloneExperiment,
    clearConfigCache,
  } = useModule();
  const hasDataOperations = !!(
    configState.job_list && configState.job_list.length > 0
  );
  const [executeBtnText, setExecuteBtnText] = useState({
    runType: "run_scenario",
    runDEPipeline: false,
  });

  const handleDashboardClick = async () => {
    await navigateToFlow("dashboard");
  };

  const handleScenarioPlanClick = async () => {
    await navigateToFlow("scenario");
  };
  const { moduleName } = useParams();
  const navigateToFlow = async (flowType) => {
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experiment_id
    );
    if (!experiment) return;
    setSwitchLoading(true);
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
      /* await loadRawSalesData(
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

      /*   await loadDimensionFilterData(
        `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
        hasParquetFiles
      ); */

      /* await loadInvPriceFilterData(
        `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
        userInfo.userID
      ); */
    } else if (flowType === "scenario") {
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
      /*  await loadDimensionFilterData(
        `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
        hasParquetFiles
      ); */
      /* 
      await loadRawSalesData(
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
      );

      await loadDemandForecastingData(
        `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
            value: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        hasParquetFiles
      );

      await setForecastingPivotData(
        `${Experiment_Base_Path}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
        {
          dimensionFilters: {
            [currentDimension]: [currentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );

      await loadInvPriceFilterData(
        `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
        userInfo.userID
      ); */
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

  useEffect(() => {
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experiment_id
    );

    if (experiment) {
      console.log("Updated At:", experiment.updatedAt);
      setUpdatedAt(experiment.updatedAt);
    } else {
      console.log("Experiment not found");
    }
  }, [experiment_id, experiments_list]);
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
    });
    await clearQueryEngineCache(latestConfig.common.job_id);
  };
  const handleRetraining = async () => {
    console.log("Retraining");
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
    });
  };

  const handleTerminate = async () => {
    // Handle terminate logic
    const payload = {
      experimentTableName: `EXPERIMENTS`,
      experimentID: experiment_id,
      time: Date.now(),
    };
    const response = await terminateTheExperiments(
      currentCompany,
      userInfo,
      payload
    );

    exitFromViewExperiment();

    console.log("Terminating experiment:", experiment_id);
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
    });
    await clearQueryEngineCache(newConfig.common.job_id);
  };

  const btnGrpText = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
  };

  const textLgMedium = {
    fontFamily: "Inter",
    fontSize: "18px",
    fontWeight: 500,
    lineHeight: "28px",
    textAlign: "left",
    color: "#101828",
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const [openStageExport, setOpenStageExport] = useState(false);
  const [openExportPipelines, setOpenExportPipelines] = useState(false);

  const handleCloseExportPipelines = () => {
    setOpenExportPipelines(false);
  };
  const handleCloseStageExport = () => {
    setOpenStageExport(false);
  };

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const handleOpenStageExport = () => {
    setOpenStageExport(true);
  };
  const handleOpenExportPipelines = () => {
    setOpenExportPipelines(true);
  };

  async function handleExecuteButton() {
    await clearAggregatedValuesHistory();
    if (executeBtnText.runType === "run_optimization") {
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

  function handleBtnText(btnClicked) {
    if (btnClicked === "rerun_optimization") {
      setExecuteBtnText({
        runType: "run_optimization",
        runDEPipeline: true,
      });
    } else {
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
    }

    setIsExecuteButtonDialogOpen(true);
  }

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

    // setScenarioBtnText(
    //   isOperationsEqual && isTrainingEqual
    //     ? "Run Scenario Planning"
    //     : "Rerun Training"
    // );
  }, [operations, configState?.training]);

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
        <Stack direction="column" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={textLgMedium}>
              {configState.project_setup.project_name}
            </Typography>
            <Chip
              label={parseString(experimentStatus)}
              size="small"
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "18px",
                textAlign: "initial",
                ...getStatusStyles(parseString(experimentStatus)),
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

        <Stack direction="row" spacing={2} alignItems={"flex-start"}>
          <Stack direction="row" spacing={2} alignItems={"center"}>
            {/* Conditionally render the Terminate button */}
            {parseString(experimentStatus) !== "Completed" &&
              parseString(experimentStatus) !== "Failed" &&
              parseString(experimentStatus) !== "Terminated" &&
              parseString(experimentStatus) !== "Launching..." && (
                <Button
                  size="medium"
                  sx={{
                    border: "1px solid #bf0202",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    maxHeight: "40px",
                  }}
                  onClick={handleConfirmationOpen}
                >
                  <Stack direction="row" spacing={1} alignItems={"center"}>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "20px",
                        textAlign: "left",
                        color: "#bf0202",
                        textTransform: "none",
                      }}
                    >
                      Terminate
                    </Typography>
                  </Stack>
                </Button>
              )}

            <CustomButton
              title="Exit"
              outlined
              onClick={async () => {
                await navigate(`/${currentCompany.companyName}/experiments`);
                await clearConfigCache();
                await clearCache(userInfo.userID, currentCompany.companyName);
               
              }}
            />
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
            {parseString(experimentStatus) === "Completed" && (
              <>
                <CustomButton
                  title="Dashboard"
                  onClick={handleDashboardClick}
                  CustomStartAdornment={
                    <OpenInNewOutlinedIcon
                      style={{ color: "#344054", fontSize: "20px" }}
                    />
                  }
                  outlined
                />
                {/* <CustomButton
                  title="Scenario Plan"
                  onClick={handleScenarioPlanClick}
                  CustomStartAdornment={
                    <OpenInNewOutlinedIcon
                      style={{ color: "#344054", fontSize: "20px" }}
                    />
                  }
                  outlined
                /> */}
              </>
            )}

            {parseString(experimentStatus) === "Failed"  && (
              <CustomButton
                title="Edit"
                outlined={isEdit ? false : true}
                onClick={async () => {
                  if (!isEdit) {
                    await confirmAddData(loadedDatasets, datasetsLoaded);
                  }
                  setIsEdit(!isEdit);
                }}
              />
            )}
            <CustomButton
              title="Clone"
              outlined
              onClick={
                currentCompany.clone_experiment
                  ? cloneExperiment
                  : () => setIsContactSalesDialogOpen(true)
              }
              isPremiumFeature={currentCompany.clone_experiment}
            />

            
            <CustomButton
              title="Export"
              outlined
              CustomStartAdornment={<ExportIcon />}
              disabled={!currentCompany.access_stage_export}
              onClick={
                currentCompany.access_stage_export
                  ? () => {
                      handleOpenExportPipelines();
                    }
                  : () => setIsContactSalesDialogOpen(true)
              }
              isPremiumFeature={currentCompany.access_stage_export}
            />
            {/* <CustomButton
              title="Rerun Optimization"
              onClick={
                currentCompany.rerun_optimization
                  ? () => handleRerunOptimization()
                  : () => setIsContactSalesDialogOpen(true)
              }
              isPremiumFeature={currentCompany.rerun_optimization}
            /> */}
            <CustomButton
              title={scenarioBtnText}
              // CustomStartAdornment={<PlusIcon />}
              onClick={() => handleBtnText("run_scenario")}
            />
            <Stack direction="row" alignItems="center">
              <CustomButton
                title="Rerun Optimization"
                // CustomStartAdornment={<PlusIcon />}
                onClick={() => handleBtnText("rerun_optimization")}
              />
              <IconButton
                aria-label="more"
                // aria-controls={`menu-${row.experimentID}`}
                aria-haspopup="true"
                onClick={(e) => {
                  console.log("1");
                  e.stopPropagation();
                  handleMenuClick(e);
                }}
              >
                <MoreVertRounded sx={{ fontSize: "26px" }} />
              </IconButton>
            </Stack>

            <Menu
              // id={`menu-${row.experimentID}`}
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={(e) => handleMenuClose(e)}
            >
              <MenuItem
                onClick={() => {
                  handleOpenStageExport();
                }}
              >
                Stage Export
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Box>

      {isEdit && <ScenarioPlanningEdit />}
      {!hiddenStatuses.includes(experimentStatus) && (
        <ViewExperimentStepper
          experimentRunType={experimentRunType}
          currentStep={currentStep}
          completedSteps={completedSteps}
          errorDetails={errorDetails}
          loading={loading}
          hasDataOperations={hasDataOperations}
        />
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "15px",
          flexDirection: { xs: "column" },
        }}
      >
        <ButtonGroup
          sx={{
            borderRadius: "8px",
            ".MuiButtonGroup-grouped": {
              border: "1px solid",
              borderColor: theme.palette.borderColor.searchBox,
            },
          }}
        >
          <CustomizedButtonStyles page={"details"}>
            Run Details
          </CustomizedButtonStyles>
          <CustomizedButtonStyles page={"logs"}>
            Run Logs
          </CustomizedButtonStyles>
          {/* <CustomizedButtonStyles page={"metrics"}>
            Model Metrics
          </CustomizedButtonStyles>
          <CustomizedButtonStyles page={"use_model"}>
            Use Model
          </CustomizedButtonStyles> */}
        </ButtonGroup>
      </Box>
      <ConfirmationDialog
        open={confirmationOpen}
        handleClose={handleConfirmationClose}
        handleConfirm={handleTerminate}
        WarningText={"Are you sure, you want to terminate this experiment?"}
        ResultText={
          "Your experiment will be terminated once you press Terminate"
        }
        ConfirmButtonTitle={"Terminate"}
      />
      <StageExport
        open={openStageExport}
        handleClose={handleCloseStageExport}
        handleConfirm={() => console.log("Exporting the Stage....")}
      />
      <ExportPipelines
        open={openExportPipelines}
        handleClose={handleCloseExportPipelines}
        handleConfirm={() => console.log("Exporting the Stage....")}
      />
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
       <MeetingNotesSidebar
              open={isNotesSidebarOpen}
              onClose={() => {
                console.log("Closing sidebar");
                setIsNotesSidebarOpen(false);
                
              }}
             
            />
    </>
  );
};

export default ViewExperimentHeader;
