import {
  Box,
  Button,
  Stack,
  Typography,
  ButtonGroup,
  Grid,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

import { ReactComponent as PlusIcon } from "../../assets/Icons/plus.svg";
import React, { useContext, useEffect } from "react";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import useExperiment from "../../hooks/useExperiment";
import { useState } from "react";
import CustomButton from "../../components/CustomButton";
import useConfig from "../../hooks/useConfig";
import { v4 as uuidv4 } from "uuid";

import useAuth from "../../hooks/useAuth";
import { navigateTo } from "../../utils/navigate";
import ReportsAndAnalysis from "../../pages/main/DashboardFlow/ViewDashboardPage/ReportsAndAnalysis";
import useDashboard from "../../hooks/useDashboard";
import { clearCache, uploadJsonToS3 } from "../../utils/s3Utils";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import ContactSalesDialog from "../../components/ContactSalesDialog";
import ExecuteButtonDialog from "../../components/ExecuteButtonDialog";
import { getExperimentById } from "../../utils/getExperiments";
import { processToken } from "../../utils/jwtUtils";
import LoadingScreen from "../../components/LoadingScreen";
import { clearQueryEngineCache } from "../../utils/queryEngine";
import { executeParallelTasks } from "../../utils/executeParallelTasks";
import useModule from "../../hooks/useModule";
import { oldFlowModules } from "../../utils/oldFlowModules";

const getTabs = (moduleName) => {
  switch (moduleName) {
    case "next_best_action":
      return [
        { page: "propensity-score", label: "Propensity Score" },
        { page: "recommended-actions", label: "Recommended Actions" },
        { page: "customer-profile", label: "Customer Profile" },
        { page: "propensity-model-metrics", label: "Model Metrics" },
      ];
    case "next_best_offer":
      return [
        { page: "propensity-score", label: "Propensity Score" },
        { page: "recommended-actions", label: "Recommended Actions" },
        { page: "customer-profile", label: "Customer Profile" },
        { page: "propensity-model-metrics", label: "Model Metrics" },
      ];
    case "binary_classification":
      return [
        { page: "binary-classification-predictions", label: "Predictions" },
        { page: "binary-classification-model-metrics", label: "Model Metrics" },
      ];
    case "regression":
      return [
        { page: "regression-predictions", label: "Predictions" },
        { page: "regression-model-metrics", label: "Model Metrics" },
      ];
    default:
      return [
        { page: "propensity-score", label: "Propensity Score" },
        { page: "recommended-actions", label: "Recommended Actions" },
        { page: "customer-profile", label: "Customer Profile" },
        { page: "propensity-model-metrics", label: "Model Metrics" },
      ];
  }
};

const ViewDashboardHeader = ({ currentpage }) => {
  const {
    confirmAddContext,
    uploadConfigToS3,
    confirmAddData,
    clearConfigCache,
  } = useModule();
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

    cloneExperiment,
    loadedDatasets,
    datasetsLoaded,
  } = useModule();
  const { experiments_list } = useExperiment();

  const { experiment_id, moduleName } = useParams();

  const [updatedAt, setUpdatedAt] = useState("");
  const [switchLoading, setSwitchLoading] = useState(false);
  const [executeBtnText, setExecuteBtnText] = useState({
    runType: "run_optimization",
    runDEPipeline: true,
  });
  const [experimentStatus, setExperimentStatus] = useState(null);

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
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
    setIsExecuteButtonDialogOpen(false);
  };
  const handleClone = () => {
    cloneExperiment();
  };
  const CustomizedButtonStyles = ({ page, children }) => {
    const navigate = useNavigate();
    const { experiment_id } = useParams();
    const { experimentBasePath, loadReports, dashboardLoading } = useModule();
    const moduleName = useParams().moduleName;
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
              `/${currentCompany.companyName}/dashboard/view/${moduleName}/${experiment_id}/${page}`
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
            navigate(
              `/${currentCompany.companyName}/dashboard/view/${moduleName}/${experiment_id}/${page}`
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
  } = useDashboard();

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
  const { hasParquetFiles } = useModule();

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
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experiment_id
    );
    console.log("experiment found", experiment);

    const run_date = formatYearMonth(experiment.createdAt);
    const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${experiment.experimentModuleName}/${run_date}/${experiment_id}`;

    setExperimentBasePath(Experiment_Base_Path);
  }, [experiment_id]);
  const handleExperimentClick = async () => {
    await navigateToFlow("experiments");
  };

  const handleScenarioPlanClick = async () => {
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
  const havePrice =
    experiment_config.scenario_plan.pricing_constraints.price !== "None" &&
    experiment_config.scenario_plan.pricing_constraints.price;

  const [status, setStatus] = useState("");
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
  }, [tablesFilterData, experimentBasePath]);

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
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },

          padding: "15px",
          gap: "16px",
        }}
      >
        <Stack direction="column" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={textLgMedium}>
              {experiment_config.project_setup.project_name}
            </Typography>
            <Box
              sx={{
                padding: " 2px 8px 4px 8px",
                borderRadius: "16px",
                backgroundColor: "#ECFDF3",
                maxHeight: "22px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "18px",
                  textAlign: "center",
                  color: "#027A48",
                }}
              >
                {status}
              </Typography>
            </Box>
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
          <CustomButton
            title="Exit"
            outlined
            onClick={async () => {
              navigate(`/${currentCompany.companyName}/dashboard`);
              const path = `${experimentBasePath}/custom_report/tablesFilterData.json`;
              await uploadJsonToS3(path, tablesFilterData);
              await clearDashboardCache();
              await clearConfigCache();
              await clearCache(userInfo.userID, currentCompany.companyName);
            }}
          />

          {/* <CustomButton
            title="Scenario Plan"
            onClick={handleScenarioPlanClick}
            disabled={parseString(experimentStatus) !== "Completed"}
            CustomStartAdornment={
              <OpenInNewOutlinedIcon
                style={{ color: "#344054", fontSize: "20px" }}
              />
            }
            outlined
          /> */}

          <CustomButton
            title="Experiment"
            onClick={handleExperimentClick}
            outlined
            CustomStartAdornment={
              <OpenInNewOutlinedIcon
                style={{ color: "#344054", fontSize: "20px" }}
              />
            }
          />
          <CustomButton
            title="Clone"
            outlined
            onClick={
              currentCompany.clone_experiment
                ? () => handleClone()
                : () => setIsContactSalesDialogOpen(true)
            }
            isPremiumFeature={currentCompany.clone_experiment}
          />
          <CustomButton
            title="Rerun Optimization"
            // CustomStartAdornment={<PlusIcon />}
            onClick={
              currentCompany.rerun_optimization
                ? () => setIsExecuteButtonDialogOpen(true)
                : () => setIsContactSalesDialogOpen(true)
            }
            isPremiumFeature={currentCompany.rerun_optimization}
          />
        </Stack>
      </Box>
      {
        <Grid container sx={{ paddingX: "15px", paddingBottom: "8px" }}>
          {getTabs(moduleName, havePrice).map((button) => {
            return (
              <Grid
                item
                key={button.label}
                xs={6}
                md={12 / getTabs(moduleName, havePrice).length}
                sx={{
                  border: "1px solid",
                  borderColor: theme.palette.borderColor.searchBox,
                }}
              >
                {dashboardLoading ? (
                  <Skeleton
                    variant="rectangular"
                    height={"40px"}
                    animation="wave"
                  />
                ) : (
                  <CustomizedButtonStyles page={button.page}>
                    {button.label}
                  </CustomizedButtonStyles>
                )}
              </Grid>
            );
          })}
        </Grid>
      }
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
        handleConfirm={handleRerunOptimization}
        WarningText="You are about to execute a run_optimization workflow. This will run with DE Pipeline before execution."
        ResultText={` This process may take significant time and resources.`}
        ConfirmButtonTitle="Proceed"
        executeBtnText={executeBtnText}
        setExecuteBtnText={setExecuteBtnText}
      />
    </>
  );
};

export default ViewDashboardHeader;
