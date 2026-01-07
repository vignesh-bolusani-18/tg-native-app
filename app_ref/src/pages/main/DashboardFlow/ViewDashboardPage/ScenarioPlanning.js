import { AddOutlined } from "@mui/icons-material";
import { Box, Button, Grid, Stack, Tab, Typography } from "@mui/material";

import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import CustomCheck from "../../../../components/CustomInputControls/CustomCheck";
import AddPlannerEnrichments from "./AddPlannerEnrichments";
import useDashboard from "../../../../hooks/useDashboard";
import NewAddContext from "../../ExperimentFlow/CreateExperimentPage/AddContext/NewAddContext";
import CustomButton from "../../../../components/CustomButton";
import useConfig from "../../../../hooks/useConfig";
import useAuth from "../../../../hooks/useAuth";
import AdvancedSettings from "../../ExperimentFlow/CreateExperimentPage/AdvancedSettings";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import AddData from "../../ExperimentFlow/CreateExperimentPage/AddData";
import { ThemeContext } from "../../../../theme/config/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import useExperiment from "../../../../hooks/useExperiment";
import NewAdvanceSettings from "../../ExperimentFlow/CreateExperimentPage/AdvancedSettings/NewAdvanceSettings";
import ExecuteButtonDialog from "../../../../components/ExecuteButtonDialog";
import { areJsonEqual } from "../../../../utils/jsonCompare";
import { clearQueryEngineCache } from "../../../../utils/queryEngine";
import { isPromise } from "formik";

const btnText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
};

const subHeadingStyle = {
  color: "#475467",
  fontFamily: "Inter",
  fontWeight: "500",
  fontSize: "14px",
  lineHeight: "20px",
  // marginBottom: "6px",
};

const DashScenarioPlanning = () => {
  const [selectedValues, setSelectedValues] = React.useState("");
  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];

  const [selectedValuesMulti, setSelectedValuesMulti] = React.useState({});
  const Multioptions = ["Option 1", "Option 2", "Option 3", "Option 4"];

  const [count, setCount] = useState(0); // Initial count value
  const maxRange = 10; // Maximum allowed count value
  const minRange = 0; // Minimum allowed count value

  const [ans2, setAns2] = useState(true);

  const [addPlannerEnrichmentsOpen, setAddPlannerEnrichmentsOpen] =
    React.useState(false);

  const handleAddPlannerEnrichmentsOpen = () => {
    setAddPlannerEnrichmentsOpen(true);
  };
  const handleAddPlannerEnrichmentsClose = () => {
    setAddPlannerEnrichmentsOpen(false);
  };
  const [executeBtnText, setExecuteBtnText] = useState({
    runType: "run_scenario",
    runDEPipeline: false,
  });
  // const [tabValue, setTabValue] = useState("1");
  const { tabValue, setTabValue, defaultConfig } = useExperiment();
  const [isExperimentNameFilled, setIsExperimentNameFilled] = useState(false);
  const [scenarioBtnText, setScenarioBtnText] = useState(
    "Run Scenario Planning"
  );

  const navigate = useNavigate();

  const {
    configState,
    uploadConfigToS3,
    confirmAddData,
    updateConfigFieldByPath,
    confirmAddContext,
    confirmAdvancedSettings,
    operations,
    confirmPlannerCoding,
    isArchive,
    isProduction,
    exp_description
  } = useConfig();
  const { userInfo, currentCompany } = useAuth();

  const {
    loadedDatasets,
    isMandatoryDataAdded,
    discardExperiment,
    joinsAdded,
    needToJoin,
    datasetsLoaded,
    isExecuteButtonDialogOpen,
    setIsExecuteButtonDialogOpen,
  } = useExperiment();
  const { clearAggregatedValuesHistory } = useDashboard();
  const location = useLocation();
  const paramsLength = location.pathname.split("/").length;
  const currentModule = location.pathname.split("/")[paramsLength - 1];



  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePrevTab = () => {
    setTabValue((parseInt(tabValue) - 1).toString());
  };

  const handleNextTab = () => {
    confirmAddContext(loadedDatasets);
    confirmPlannerCoding(loadedDatasets)
    setTabValue((parseInt(tabValue) + 1).toString());
  };

  const { theme } = useContext(ThemeContext);

  const handleRunScenario = async () => {
    const newConfig = await confirmAdvancedSettings();
    console.log("New config", newConfig);
    await uploadConfigToS3({
      config: newConfig,
      clientName: currentCompany.companyName,
      experimentId: newConfig.common.job_id,
      moduleName: newConfig.common.module_name,
      userInfo,
      currentCompany,
      runType: "run_scenario",
      isClone: false,
      runDEPipeline: executeBtnText.runDEPipeline,
      isArchive:isArchive,
      isProduction:isProduction,
      exp_description:exp_description,
    });
    await clearQueryEngineCache(newConfig.common.job_id);
  };
  const handleRetraining = async () => {
    const newConfig = await confirmAdvancedSettings();
    console.log("New config", newConfig);
    uploadConfigToS3({
      config: newConfig,
      clientName: currentCompany.companyName,
      experimentId: newConfig.common.job_id,
      moduleName: newConfig.common.module_name,
      userInfo,
      currentCompany,
      runType: "run_training",
      isClone: false,
      runDEPipeline: executeBtnText.runDEPipeline,
      isArchive:isArchive,
      isProduction:isProduction,
      exp_description:exp_description,
    });
  };

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

  return (
    <Stack>
      <TabContext value={tabValue}>
        <Box padding="12px 16px 12px 16px">
          <TabList
            onChange={handleChange}
            aria-label="create experiment tablist"
          >
            <Tab
              label="Add Context"
              value="1"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
              disabled={tabValue !== "1"}
            />
            <Tab
              label="Advanced Settings"
              value="2"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
              disabled={tabValue !== "2"}
            />
          </TabList>
        </Box>

        <TabPanel sx={{ padding: "24px 0px", marginX: "-16px" }} value="1">
          <NewAddContext />
          <Stack
            direction={"row"}
            justifyContent={"flex-end"}
            paddingRight={"32px"}
            paddingBottom={"16px"}
          >
            <CustomButton title={"Next"} onClick={() => handleNextTab()} />
          </Stack>
        </TabPanel>
        <TabPanel sx={{ padding: "0px 10px", marginX: "-16px" }} value="2">
          <NewAdvanceSettings />
        </TabPanel>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          paddingX={"32px"}
          paddingBottom={"16px"}
        >
          <CustomButton
            title={"Previous"}
            outlined
            onClick={() => handlePrevTab()}
          />
          <CustomButton
            title={"Run Scenario Planning"}
            onClick={() => handleRunScenario()}
          />
        </Stack>
      </TabContext>
      {/* <NewAddContext />
      <AdvancedSettings /> */}

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
    </Stack>
  );
};

export default DashScenarioPlanning;
