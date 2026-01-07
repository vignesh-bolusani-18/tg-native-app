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
import ReportsAndAnalysis from "../../pages/main/DashboardFlow/ViewDashboardPage/ReportsAndAnalysis";
import useDashboard from "../../hooks/useDashboard";
import { clearCache, uploadJsonToS3 } from "../../utils/s3Utils";
import { configureStore } from "@reduxjs/toolkit";
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
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MeetingNotesSidebar from "../../components/MeetingNoteSidebar";
import {
  LogoutOutlined as LogoutOutlinedIcon,
  TimelineOutlined as TimelineOutlinedIcon,
  AutoFixHighOutlined as AutoFixHighOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
  RefreshOutlined as RefreshOutlinedIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import AddToNotesButton from "../../components/AddToMeetingNoteButton";

const getTabs = (moduleName, havePrice) => {
  if (havePrice) {
    switch (moduleName) {
      case "demand-planning":
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
      case "pricing-promotion-optimization":
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
      case "inventory-optimization":
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
      default:
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
    }
  } else {
    switch (moduleName) {
      case "demand-planning":
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
      case "pricing-promotion-optimization":
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
      case "inventory-optimization":
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
      default:
        return [
          {
            page: "forecast-enrichment-agent",
            label: "Forecast Enrichment Agent",
          },
          { page: "data-cleaning-agent", label: "Data Cleaning Agent" },
        ];
    }
  }
};

const AgenticArenaHeader = ({ currentpage }) => {
  const {
    confirmAddContext,
    configState,
    uploadConfigToS3,
    confirmAdvancedSettings,
    operations,
    clearConfigCache,
    isArchive,
    isProduction,
    exp_description,
    enrichment_bydate,
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
  } = useExperiment();

  const { experiment_id } = useParams();
  const { cloneExperiment: cloneExperimentNew } = useModule();
  const moduleName = getModuleName(experiment_id);

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
  const [isNotesSidebarOpen , setIsNotesSidebarOpen] = useState(false);






  const handleContactSales = () => {
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

  const handleClone = () => {
    cloneExperiment();
  };
  const handleSaveAndExit = async () => {
    navigate(`/${currentCompany.companyName}/optimizations`);
    const path = `${experimentBasePath}/custom_report/tablesFilterData.json`;
    await uploadJsonToS3(path, tablesFilterData);
    await confirmAddContext();
    const latestConfig = await confirmAdvancedSettings();
    console.log("Latest config", latestConfig);
    await uploadJsonToS3(configPath, latestConfig);
    await clearDashboardCache();
    await clearConfigCache();
    await clearCache(userInfo.userID, currentCompany.companyName);
  };
  const { setLastSyncedTime } = useDashboard();

  const CustomizedButtonStyles = ({ page, children }) => {
    const navigate = useNavigate();
    const { experiment_id } = useParams();
    const { experiment_config } = useExperiment();
    const {
      experimentBasePath,
      loadReports,
      dashboardLoading,
      clearAggregatedValuesHistory,
      demandForecastingData,
    } = useDashboard();
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
          disabled={
            dashboardLoading ||
            (page === "forecast-enrichment-agent" && !demandForecastingData)
          }
          sx={{
            backgroundColor: "#F1F9FF",
            width: "100%",
            maxWidth: "100%",
            "&:hover": {
              backgroundColor: "#F1F9FF",
              textDecoration: "none",
            },
            height: "40px",
          }}
          onClick={() => {
            console.log("clicked : ", page);
            navigate(
              `/${currentCompany.companyName}/optimizations/view/${moduleName}/${experiment_id}/${page}`
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
              overflow: "hidden",
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
          disabled={
            dashboardLoading ||
            (page === "forecast-enrichment-agent" && !demandForecastingData)
          }
          sx={{
            width: "100%",
            "&:hover": {
              backgroundColor: "#F1F9FF",
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
              `/${currentCompany.companyName}/optimizations/view/${moduleName}/${experiment_id}/${page}`
            );
          }}
        >
          <Stack direction={"row"} spacing={1} paddingRight={"8px"}>
            <Typography sx={btnGrpText}>{children}</Typography>
          </Stack>
        </Button>
      );
    }
  };

  const { theme } = useContext(ThemeContext);

  const btnGrpText = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
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

  const {
    setCurrentDimension,
    setCurrentValue,
    setExperimentBasePath,
    currentDimension,
    currentValue,
    loadRawSalesData,
    loadDemandForecastingData,
    loadDimensionFilterData,
    loadInvPriceFilterData,
  } = useDashboard();

  const { hasParquetFiles } = useExperiment();

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

  const handleScenarioClick = async () => {
    await navigateToFlow("scenario");
  };

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
    } else if (flowType === "scenario" || flowType === "experiments") {
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

  const configPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/configs/${configState.common.module_name}/${configState.common.job_id}/config.json`;
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
      const json = JSON.parse(input);
      if (typeof json === "object" && json !== null) {
        return json.status;
      }
    } catch (e) {
      return input;
    }
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
    if (scenarioBtnText === "Run Scenario Planning") {
      handleRunScenario();
    } else {
      handleRetraining();
    }
    setIsExecuteButtonDialogOpen(false);
  }

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

  if (switchLoading) {
    return <LoadingScreen />;
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
                backgroundColor: "#ECFDF3",
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
          {/* Exit Button */}

          <Tooltip title="Exit" arrow>
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
              onClick={handleSaveAndExit}
            >
              <LogoutOutlinedIcon sx={{ fontSize: "20px", color: "#344054" }} />
            </IconButton>
          </Tooltip>

          {/* Dashboard Button */}

          {/* Experiment Button */}
          {parseString(experimentStatus) === "Completed" && (
            <Tooltip title="Experiment" arrow>
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
            </Tooltip>
          )}

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

          {/* Scenario Button */}
          {parseString(experimentStatus) === "Completed" && (
            <Tooltip title="Scenario Plan" arrow>
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
                onClick={handleScenarioClick}
              >
                <BarChartOutlinedIcon
                  sx={{ fontSize: "18px", color: "#6B7280" }}
                />
              </IconButton>
            </Tooltip>
          )}
          {parseString(experimentStatus) === "Completed" && (
            <Tooltip title="Dashboard" arrow>
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
            </Tooltip>
          )}

          {/* Clone Button */}
          <Tooltip
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
          </Tooltip>

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
        </Stack>
      </Box>

      <Grid container sx={{ paddingX: "15px", paddingBottom: "8px" }}>
        {getTabs(experiment_config.common.module_name, havePrice).map(
          (button) => {
            return (
              <Grid
                item
                key={button.label}
                xs={6}
                md={
                  12 /
                  getTabs(experiment_config.common.module_name, havePrice)
                    .length
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
          }
        )}
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

export default AgenticArenaHeader;
