import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Button,
  Stack,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  QuestionAnswer as QuestionAnswerIcon,
} from "@mui/icons-material";
import { STYLES } from "../../constants";
import { default as CustomDatePickerConfig } from "../../../../components/CustomInputControls/CustomDatePicker";
import { default as CustomTextInputConfig } from "../../../../components/CustomInputControls/CustomTextInput";
import { default as CustomCounterConfig } from "../../../../components/CustomInputControls/CustomCounter";
import { default as CustomAutocompleteConfig } from "../../../../components/CustomInputControls/CustomAutoComplete";
import { default as CustomCheckConfig } from "../../../../components/CustomInputControls/CustomCheck";
import { default as CustomTextInputModule } from "../../../../components/CustomInputControls/CustomTextInput";
import { default as CustomArrayEditorConfig } from "../../../../components/CustomInputControls/CustomeArrayEditor";
import { default as CustomDatePickerModule } from "../../../../components/ConfigurableCustomInputControls/CustomDatePicker";
import { default as CustomCounterModule } from "../../../../components/ConfigurableCustomInputControls/CustomCounter";
import { default as CustomAutocompleteModule } from "../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";
import { default as CustomCheckModule } from "../../../../components/ConfigurableCustomInputControls/CustomCheck";
import { default as CustomArrayEditorModule } from "../../../../components/ConfigurableCustomInputControls/CustomeArrayEditor";
import useConfig from "../../../../hooks/useConfig";
import useModule from "../../../../hooks/useModule";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import useExperiment from "../../../../hooks/useExperiment";
import { useVibe } from "../../../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../../../hooks/useWorkflowWebSocket";
import CustomButton from "../../../../components/CustomButton";

const AdvancedQuestionsSection = ({ advancedQuestions, langgraphState }) => {
 const {
    setIsWaitingForAI,
    setProcessingStepText,
    setDataConfirmed,
    setAdvancedQuestionsAnswered,
    currentConversation,
    setAdvancedAnswersConfirmed,
    creditScore,
  } = useVibe();

  const CustomDatePicker = !oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? CustomDatePickerModule
    : CustomDatePickerConfig;
  const CustomTextInput = !oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? CustomTextInputModule
    : CustomTextInputConfig;
  const CustomCounter = !oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? CustomCounterModule
    : CustomCounterConfig;
  const CustomAutocomplete = !oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? CustomAutocompleteModule
    : CustomAutocompleteConfig;
  const CustomCheck = !oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? CustomCheckModule
    : CustomCheckConfig;
  const CustomArrayEditor = !oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? CustomArrayEditorModule
    : CustomArrayEditorConfig;



  // Initialize expanded state: collapsed if answers already submitted, expanded otherwise
  const advancedQuestionsAnswered =
    currentConversation?.advancedQuestionsAnswered || false;
  const [isExpanded, setIsExpanded] = useState(!advancedQuestionsAnswered);
  const [answers, setAnswers] = useState({});
  const [refresh, setRefresh] = useState(false);
  const {
    confirmAdvancedSettings: confirmAdvancedSettingsConfig,
    confirmAdvanceSettingsGroup: confirmAdvanceSettingsGroupConfig,
    advanceSettingBuckets: advanceSettingsBucketsConfig,
    enrichment: enrichmentConfig,
    adjust_data: adjust_dataConfig,
    configState: configStateConfig,
  } = useConfig();

  const {
    confirmAdvancedSettings: confirmAdvancedSettingsModule,
    confirmAdvanceSettingsGroup: confirmAdvanceSettingsGroupModule,
    advanceSettingBuckets: advanceSettingsBucketsModule,
    enrichment: enrichmentModule,
    adjust_data: adjust_dataModule,
    configState: configStateModule,
  } = useModule();
 
  const { sendQuery } = useWorkflowWebSocket();
  const advanceSettingsBuckets = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? advanceSettingsBucketsConfig
    : advanceSettingsBucketsModule;
  const advancedAnswersConfirmed =
    currentConversation?.advancedAnswersConfirmed || false;

  const confirmAdvanceSettingsGroup = (group) => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      confirmAdvanceSettingsGroupConfig(group);
    } else {
      confirmAdvanceSettingsGroupModule(group);
    }
  };
  const confirmAdvancedSettings = () => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      confirmAdvancedSettingsConfig();
    } else {
      confirmAdvancedSettingsModule();
    }
  };
  const enrichment = oldFlowModules.includes(langgraphState?.determined_module)
    ? enrichmentConfig
    : enrichmentModule;
  const adjust_data = oldFlowModules.includes(langgraphState?.determined_module)
    ? adjust_dataConfig
    : adjust_dataModule;
  const configState = oldFlowModules.includes(langgraphState?.determined_module)
    ? configStateConfig
    : configStateModule;

  // Check if context questions are available
  const hasAdvancedQuestions =
    advancedQuestions && advancedQuestions.length > 0;

  // Toggle expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const getDimensionOptions = () => {
    const nonUniquegroupsArray = ["cluster"]
      .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
      .concat(configState.data.ts_id_columns);

    console.log("dimensionsArray1 " + nonUniquegroupsArray);
    return [...new Set(nonUniquegroupsArray)];
  };

  // useEffect(() => {
  //   setRefresh(!refresh);
  // }, [contextConfigConfig, contextConfigModule]);
  // Handle form submission
  const allGroups = [...new Set(advancedQuestions.map((q) => q.group))];
  const handleSubmit = async () => {
    console.log("Advanced Questions Answers:", answers);
    for (const group of allGroups) {
      await confirmAdvanceSettingsGroup(group);
    }
    setAdvancedQuestionsAnswered(true);
    setIsExpanded(false); // Collapse the section immediately after submitting
  };

  // Update expanded state when advancedQuestionsAnswered or advancedAnswersConfirmed changes
  useEffect(() => {
    if (advancedQuestionsAnswered || advancedAnswersConfirmed) {
      setIsExpanded(false);
    }
  }, [advancedQuestionsAnswered, advancedAnswersConfirmed]);
  const handleConfirmAdvanced = async () => {
    setAdvancedAnswersConfirmed(true); // Hide the button immediately
    setIsExpanded(false); // Ensure section stays collapsed
    await confirmAdvancedSettings();
    const updated_state = {
      ...langgraphState,
      workflow_status: {
        ...langgraphState.workflow_status,
        advanced_questions_answered: true,
        advanced_questions_generated: true,
      },
      next_step: {
        user: "advanced_questions_answered",
        ai: "experiment_validator",
      },
      next_module: "experiment_validator",
    };
    setIsWaitingForAI(true);
    setProcessingStepText("Validating experiment...");
    setDataConfirmed(true);
    sendQuery({ query: "", updated_state: updated_state });
  };

  // Helper function to get value from configState by path
  const getConfigValueByPath = (path) => {
    if (!configState || !path) return null;

    const pathParts = path.split(".");
    let value = configState;

    for (const part of pathParts) {
      // Handle array indices like "kwargs.date_range[0]"
      if (part.includes("[")) {
        const [key, indexStr] = part.split("[");
        const index = parseInt(indexStr.replace("]", ""));
        if (value[key] && Array.isArray(value[key])) {
          value = value[key][index];
        } else {
          return null;
        }
      } else {
        value = value[part];
      }

      if (value === null || value === undefined) {
        return null;
      }
    }

    return value;
  };

  // Format answer value for preview display
  const formatAnswerValue = (value, key = null) => {
    if (value === null || value === undefined || value === "") {
      return "Not answered";
    }
    console.log("formatAnswerValue key:", key);
    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value.map((v, idx) => (
            <Box
              key={idx}
              sx={{
                px: 1.25,
                py: 0.5,
                backgroundColor: "#e0e7ff",
                color: "#312e81",
                borderRadius: "12px",
                display: "inline-flex",
                fontSize: "0.85em",
                alignItems: "center",
                m: 0,
              }}
            >
              {formatAnswerValue(v, key)}
            </Box>
          ))}
        </Box>
      ) : "Not answered";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Ensure key is a string before using includes
    const keyStr = typeof key === "string" ? key : "";

    // Date formatting - either a JS Date object or if the key is date-related, try to parse string
    if (value instanceof Date || keyStr.includes("date")) {
      let dateObj = value;
      if (!(dateObj instanceof Date)) {
        // Try to parse string to date
        dateObj = new Date(value);
      }
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        const day = dateObj.getDate();
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const month = monthNames[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }

    // Frequency enum formatting
    if (keyStr.includes("frequency")) {
      const frequencyValuesDict = {
        W: "Weekly",
        M: "Monthly",
        Q: "Quarterly",
        D: "Daily",
        Y: "Yearly",
        H: "Hourly",
        "30T": "30 minute",
        "15T": "15 minute",
        "10T": "10 minute",
        "5T": "5 minute",
      };
      return frequencyValuesDict[value] || String(value);
    }

    return String(value);
  };

  // Render appropriate input component based on question type
  const renderInputComponent = (question) => {
    const { bucket, group, is_required, path } = question;
    console.log("advanceSettingsBuckets:", advanceSettingsBuckets);
    console.log("bucket:", bucket);
    console.log("group:", group);

    console.log("is_required:", is_required);

    // Add null checks

    const feature = advanceSettingsBuckets[bucket].featureGroups[
      group
    ].features.find((feature) => feature.path === path);

    // If in preview mode, show simple question-answer preview
    if (advancedQuestionsAnswered) {
      const answerValue = getConfigValueByPath(feature.path);
      return (
        <Box
          sx={{
            mt: 1,
            p: 1,
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "#1e293b",
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            {formatAnswerValue(answerValue,question.key)}
          </Typography>
        </Box>
      );
    }

    let isDisabled = false;

    switch (feature.path) {
      case "kwargs.adjustment_value":
        console.log("isdisableupdate " + isDisabled);
        isDisabled = adjust_data.kwargs.adjustment_type === "cut_history";
        break;

      case "kwargs.date_range[0]":
        isDisabled = adjust_data.kwargs.adjustment_type === "cut_history";
        break;

      case "kwargs.time_steps":
        isDisabled = adjust_data.kwargs.adjustment_type !== "YoY";
        break;

      case "kwargs.future_history":
        isDisabled = adjust_data.kwargs.adjustment_type !== "YoY";
        break;
      case "kwargs.enrichment_value":
        isDisabled = enrichment.kwargs.enrichment_type !== "uplift";

        break;

      case "feature_engg.sinusoidal_freq_max_count":
        isDisabled =
          !configState?.feature_engg?.feature_types.includes("sinusoidal");
        break;
      case "dashboard_settings.show_forecasting_pivot_disaggregated":
        isDisabled = configState.data.ts_id_columns_disagg?.length === 0;
        break;
      default:
        break;
    }

    // Normal mode - show input components
    return (
      <>
        {feature.type === "DatePicker" && (
          <CustomDatePicker
            showLabel={feature.showLabel}
            label={feature.label}
            path={feature?.path}
            key={`${feature?.path}-${refresh}`}
            target={feature?.target}
            disabled={isDisabled}
          />
        )}

        {feature.type === "Counter" && (
          <CustomCounter
            target={feature.target}
            showLabel={feature.showLabel}
            label={feature.label}
            path={feature.path}
            placeholder={feature.placeholder}
            maxRange={feature.maxRange}
            minRange={feature.minRange}
            key={`${feature.path}-${refresh}`}
            disabled={isDisabled}
          />
        )}
        {feature.type === "AutoComplete" && (
          <CustomAutocomplete
            key={`${feature.path}-${refresh}`}
            showLabel={feature.showLabel}
            label={feature.label}
            path={feature.path}
            placeholder={feature.placeholder}
            isMultiSelect={feature.isMultiSelect}
            values={
              feature.values === "dimensionOptions"
                ? getDimensionOptions()
                : Array.isArray(feature.values)
                ? feature.values
                : []
            }
            valuesDict={feature.valuesDict}
            dateFormat={feature.dateFormat}
            target={feature.target}
            disabled={isDisabled}
            conflictCheck={
              feature.conflictCheck === undefined
                ? false
                : feature.conflictCheck
            }
            formatLabel={false}
          />
        )}
        {feature.type === "Check" && (
          <CustomCheck
            question={feature.label}
            direction={feature.direction}
            path={feature.path}
            key={`${feature.path}-${refresh}`}
            target={feature.target}
            disabled={isDisabled}
          />
        )}

        {feature.type === "TextInput" && (
          <CustomTextInput
            showLabel={feature.showLabel}
            placeholder={feature.placeholder}
            label={feature.label}
            required
            path={feature.path}
            target={feature.target}
            disabled={isDisabled}
          />
        )}

        {feature.type === "ArrayEditor" && (
          <CustomArrayEditor
            showLabel={feature.showLabel}
            placeholder={feature.placeholder}
            label={feature.label}
            required
            path={feature.path}
            target={feature.target}
            disabled={isDisabled}
          />
        )}
      </>
    );
  };

  if (!hasAdvancedQuestions) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 3,
        overflow: "hidden",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          borderLeft: "4px solid #3b82f6",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(59, 130, 246, 0.05)",
          },
        }}
        onClick={toggleExpansion}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <QuestionAnswerIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#374151",
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              Advanced Configurations
            </Typography>
            {advancedQuestionsAnswered ? (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #10b981",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#059669",
                    fontWeight: 500,
                    fontFamily: STYLES.FONTS.PRIMARY,
                  }}
                >
                  Answers Submitted
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: "#dbeafe",
                  border: "1px solid #3b82f6",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#1e40af",
                    fontWeight: 500,
                    fontFamily: STYLES.FONTS.PRIMARY,
                  }}
                >
                  {advancedQuestions.length} Questions
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {advancedQuestionsAnswered && !advancedAnswersConfirmed && (
              <CustomButton
                title="Confirm"
                disabled={creditScore <= 0}          
                onClick={handleConfirmAdvanced}
                loadable
              />
             
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpansion();
              }}
              sx={{
                color: "#6b7280",
                "&:hover": {
                  backgroundColor: "rgba(107, 114, 128, 0.1)",
                },
              }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: 3,
            border: "1px solid #e2e8f0",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
          }}
        >
          {advancedQuestionsAnswered ? null : (
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#6b7280",
                mb: 3,
                lineHeight: 1.5,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              Please answer the following questions to help us configure your
              analysis:
            </Typography>
          )}

          <Stack spacing={3}>
            {advancedQuestions.map((question, index) => (
              <Box
                key={question.key}
                sx={{
                  p: 2,
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                    fontFamily: STYLES.FONTS.PRIMARY,
                  }}
                >
                  {index + 1}. {question.question}{" "}
                  {question.is_required && (
                    <span style={{ color: STYLES.COLORS.PRIMARY }}>*</span>
                  )}
                </Typography>

                {question.description && (
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      mb: 2,
                      fontStyle: "italic",
                      fontFamily: STYLES.FONTS.PRIMARY,
                    }}
                  >
                    {question.description}
                  </Typography>
                )}

                {/* Render appropriate input component */}
                {renderInputComponent(question)}
              </Box>
            ))}

            {!advancedQuestionsAnswered && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                <CustomButton 
                  title="Submit Answers"
                  disabled={creditScore <= 0}
                  onClick={async () => await handleSubmit()}
                  loadable
                />
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default AdvancedQuestionsSection;
