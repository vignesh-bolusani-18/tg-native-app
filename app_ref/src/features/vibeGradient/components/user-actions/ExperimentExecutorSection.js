import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { PlayArrow as PlayArrowIcon } from "@mui/icons-material";
import { STYLES } from "../../constants";
import CustomTextInput from "../../../../components/CustomInputControls/CustomTextInput";
import { useVibe } from "../../../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../../../hooks/useWorkflowWebSocket";
import { Form, Formik } from "formik";
import { experimentNameSchema } from "../../../../validation";
import useConfig from "../../../../hooks/useConfig";
import useModule from "../../../../hooks/useModule";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import { v4 as uuidv4 } from "uuid";
import useExperiment from "../../../../hooks/useExperiment";
import useAuth from "../../../../hooks/useAuth";

const ExperimentExecutorSection = ({ messageId, langgraphState }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExperimentNameFilled, setIsExperimentNameFilled] = useState(false);
  const {
    setIsWaitingForAI,
    setProcessingStepText,
    fetchAndStoreExperimentDataForConversation,
    decrementCredits,
    creditScore,
  } = useVibe();
  const { sendQuery } = useWorkflowWebSocket();
  const { userInfo, currentCompany } = useAuth();
  const {
    configState: configStateConfig,
    updateConfigFieldByPath: updateConfigFieldByPathConfig,
    confirmAddContext: confirmAddContextConfig,
    confirmAdvancedSettings: confirmAdvancedSettingsConfig,
    uploadConfigToS3: uploadConfigToS3Config,
  } = useConfig();
  const { loadedDatasets: loadedDatasetsConfig } = useExperiment();
  const {
    configState: configStateModule,
    updateConfigFieldByPath: updateConfigFieldByPathModule,
    confirmAddContext: confirmAddContextModule,
    confirmAdvancedSettings: confirmAdvancedSettingsModule,
    uploadConfigToS3: uploadConfigToS3Module,
    loadedDatasets: loadedDatasetsModule,
  } = useModule();
  const loadedDatasets = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? loadedDatasetsConfig
    : loadedDatasetsModule;
  const confirmAddContext = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? confirmAddContextConfig
    : confirmAddContextModule;
  const confirmAdvancedSettings = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? confirmAdvancedSettingsConfig
    : confirmAdvancedSettingsModule;
  const uploadConfigToS3 = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? uploadConfigToS3Config
    : uploadConfigToS3Module;
  const configState = oldFlowModules.includes(langgraphState?.determined_module)
    ? configStateConfig
    : configStateModule;
  const updateConfigFieldByPath = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? updateConfigFieldByPathConfig
    : updateConfigFieldByPathModule;
  const handleExperimentExecution = async () => {
    const experimentId = uuidv4();
    await confirmAddContext(loadedDatasets);

    const newConfig = await confirmAdvancedSettings();
    console.log("newConfig", newConfig);
    await uploadConfigToS3({
      config: newConfig,
      clientName: currentCompany.companyName,
      experimentId: experimentId,
      moduleName: langgraphState?.determined_module,
      userInfo,
      currentCompany,
      runType: "run_training",
      isClone: false,
      runDEPipeline: false,
      silent: true,
    });

    // Fetch and store experiment data after a short delay to allow S3 upload to complete
    setTimeout(async () => {
      try {
        await fetchAndStoreExperimentDataForConversation(
          experimentId,
          currentCompany,
          userInfo
        );
        console.log("Experiment data stored successfully for:", experimentId);
      } catch (error) {
        console.error("Failed to fetch and store experiment data:", error);
      }
    }, 200); // 2 second delay
  };
  // Handle execute button click
  const handleExecute = async () => {
    // Prevent multiple executions while one is already in progress
    if (isExecuting) {
      return;
    } else {
      setIsExecuting(true);
    }

    const experimentName = configState.project_setup.project_name;
    if (!experimentName.trim()) return;

 
    setIsWaitingForAI(true);
    setProcessingStepText("Executing experiment...");

    await handleExperimentExecution();

    const updated_state = {
      ...langgraphState,
      workflow_status: {
        ...langgraphState?.workflow_status,
        experiment_executed: true,
      },
      next_step: {
        user: "experiment_executed",
        ai: "workflow_complete",
      },
      next_module: "workflow_complete",
    };

    sendQuery({query: "", updated_state: updated_state});
    decrementCredits(5);
  };

  // Check if execute button should be disabled
  const isExecuteDisabled = !isExperimentNameFilled || isExecuting;

  // Update experiment name filled state when config changes
  useEffect(() => {
    setIsExperimentNameFilled(
      configState.project_setup.project_name.trim().length > 0
    );
  }, [configState.project_setup.project_name]);

  return (
    <Box
      sx={{
        mt: 3,
        p: 3,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        borderLeft: `4px solid ${STYLES.COLORS.PRIMARY}`,
      }}
    >
      <Typography
        sx={{
          fontSize: "1rem",
          fontWeight: 600,
          color: "#374151",
          mb: 2,
          fontFamily: STYLES.FONTS.PRIMARY,
        }}
      >
        Experiment Execution
      </Typography>

      <Typography
        sx={{
          fontSize: "0.875rem",
          color: "#6b7280",
          mb: 3,
          lineHeight: 1.5,
          fontFamily: STYLES.FONTS.PRIMARY,
        }}
      >
        Please provide a name for your experiment to proceed with execution.
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Formik
            initialValues={{
              experimentName: configState.project_setup.project_name,
            }}
            validationSchema={experimentNameSchema}
            onSubmit={() => {}}
          >
            {({
              errors,
              touched,
              handleChange,
              handleBlur,
              values,
              setFieldValue,
            }) => (
              <Form>
                <CustomTextInput
                  required
                  showLabel
                  label={"Experiment name"}
                  placeholder={"Please enter your experiment name"}
                  name="experimentName"
                  onChange={(e) => {
                    const { value } = e.target;

                    handleChange(e);

                    const updatedSetup = {
                      ...configState.project_setup,
                      project_name: value,
                    };
                    updateConfigFieldByPath("project_setup", updatedSetup);

                    setFieldValue("experimentName", value);
                  }}
                  onBlur={handleBlur}
                  value={values.experimentName}
                  error={
                    touched.experimentName && Boolean(errors.experimentName)
                  }
                  helperText={touched.experimentName && errors.experimentName}
                  disabled={isExecuting}
                />
              </Form>
            )}
          </Formik>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
          aria-label="Execute"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleExecute}
            disabled={creditScore <= 0 || isExecuteDisabled}
            sx={{
              backgroundColor: STYLES.COLORS.PRIMARY,
              "&:hover": {
                backgroundColor: STYLES.COLORS.SECONDARY,
              },
              "&:disabled": {
                backgroundColor: "#d1d5db",
                color: "#9ca3af",
              },
              textTransform: "none",
              fontWeight: 500,
              fontFamily: STYLES.FONTS.PRIMARY,
              px: 3,
              py: 1,
            }}
          >
            {isExecuting ? "Executing..." : "Execute"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ExperimentExecutorSection;
