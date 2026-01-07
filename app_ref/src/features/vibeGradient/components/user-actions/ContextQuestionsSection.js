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
import { default as CustomDatePickerModule } from "../../../../components/ConfigurableCustomInputControls/CustomDatePicker";
import { default as CustomCounterModule } from "../../../../components/ConfigurableCustomInputControls/CustomCounter";
import { default as CustomAutocompleteModule } from "../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";
import { default as CustomCheckModule } from "../../../../components/ConfigurableCustomInputControls/CustomCheck";

import useConfig from "../../../../hooks/useConfig";
import useModule from "../../../../hooks/useModule";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import useExperiment from "../../../../hooks/useExperiment";
import { useVibe } from "../../../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../../../hooks/useWorkflowWebSocket";
import CustomButton from "../../../../components/CustomButton";

const ContextQuestionsSection = ({ contextQuestions, langgraphState }) => {
  const {
    setIsWaitingForAI,
    setProcessingStepText,
    setDataConfirmed,
    setContextQuestionsAnswered,
    currentConversation,
    setContextAnswersConfirmed,
    creditScore,
  } = useVibe();

  // Initialize expanded state: collapsed if answers already submitted, expanded otherwise
  const contextQuestionsAnswered =
    currentConversation?.contextQuestionsAnswered || false;
  const [isExpanded, setIsExpanded] = useState(!contextQuestionsAnswered);
  const [answers, setAnswers] = useState({});
  const [refresh, setRefresh] = useState(false);
  const {
    getContextConfigFieldByPath: getContextConfigFieldByPathConfig,
    contextConfig: contextConfigConfig,
    confirmContextGroup: confirmContextGroupConfig,
    confirmAddContext: confirmAddContextConfig,
    contextBuckets: contextBucketsConfig,
    updateContextConfigFieldByPath: updateContextConfigFieldByPathConfig,
  } = useConfig();
  const { loadedDatasets: loadedDatasetsConfig } = useExperiment();
  const {
    getContextConfigFieldByPath: getContextConfigFieldByPathModule,
    contextConfig: contextConfigModule,
    confirmContextGroup: confirmContextGroupModule,
    confirmAddContext: confirmAddContextModule,
    loadedDatasets: loadedDatasetsModule,
    contextBuckets: contextBucketsModule,
    updateContextConfigFieldByPath: updateContextConfigFieldByPathModule,
  } = useModule();
  const { sendQuery } = useWorkflowWebSocket();
  const contextConfig = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? contextConfigConfig
    : contextConfigModule;
  const getContextConfigFieldByPath = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? getContextConfigFieldByPathConfig
    : getContextConfigFieldByPathModule;
  const updateContextConfigFieldByPath = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? updateContextConfigFieldByPathConfig
    : updateContextConfigFieldByPathModule;
  const contextAnswersConfirmed =
    currentConversation?.contextAnswersConfirmed || false;
  const allGroups = [...new Set(contextQuestions.map((q) => q.group))];
  const preAnsweredContextQuestions = contextQuestions.filter(
    (q) => q.answer !== null && q.answer !== undefined && q.answer !== "None"
  );

  const preFillAnswers = async () => {
    for (const question of preAnsweredContextQuestions) {
      await updateContextConfigFieldByPath(question.path, question.answer);
      confirmContextGroup(question.group);
    }
  };

  useEffect(() => {
    preFillAnswers();
  }, []);

  const contextBuckets = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? contextBucketsConfig
    : contextBucketsModule;
  const confirmAddContext = (loadedDatasets) => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      confirmAddContextConfig();
    } else {
      confirmAddContextModule(loadedDatasets);
    }
  };
  const loadedDatasets = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? loadedDatasetsConfig
    : loadedDatasetsModule;
  const confirmContextGroup = (contextGroup) => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      confirmContextGroupConfig(contextGroup);
    } else {
      confirmContextGroupModule(contextGroup);
    }
  };

  // Check if context questions are available
  const hasContextQuestions = contextQuestions && contextQuestions.length > 0;

  // Toggle expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

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

  // Handle answer changes
  const handleAnswerChange = (questionKey, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  useEffect(() => {
    setRefresh(!refresh);
  }, [contextConfigConfig, contextConfigModule]);
  // Handle form submission
  const handleSubmit = async () => {
    console.log("Context Questions Answers:", answers);
    for (const group of allGroups) {
      await confirmContextGroup(group);
    }
    setContextQuestionsAnswered(true);
    setIsExpanded(false); // Collapse the section immediately after submitting
  };

  // Update expanded state when contextQuestionsAnswered or contextAnswersConfirmed changes
  useEffect(() => {
    if (contextQuestionsAnswered || contextAnswersConfirmed) {
      setIsExpanded(false);
    }
  }, [contextQuestionsAnswered, contextAnswersConfirmed]);
  const handleConfirmContext = async () => {
    setContextAnswersConfirmed(true); // Hide the button immediately
    setIsExpanded(false); // Ensure section stays collapsed
    await confirmAddContext(loadedDatasets);
    const updated_state = {
      ...langgraphState,
      workflow_status: {
        ...langgraphState.workflow_status,
        context_questions_answered: true,
        context_questions_generated: true,
      },
      context_questions: langgraphState.context_questions.map((q) => ({
        ...q,
        answer: getContextConfigFieldByPath(q.path),
      })),
      next_step: {
        user: "context_questions_answered",
        ai: "advanced_questions_generator",
      },
      next_module: "advanced_questions_generator",
    };
    setIsWaitingForAI(true);
    setProcessingStepText("Generating advanced configuration...");
    setDataConfirmed(true);
    sendQuery({ query: "", updated_state: updated_state });
  };

  // Format answer value for preview display
   const formatAnswerValue = (value, key = null) => {
     if (value === null || value === undefined || value === "") {
       return "Not answered";
     }
     console.log("formatAnswerValue key:", key);
     if (Array.isArray(value)) {
       return value.length > 0 ? (
         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
       ) : (
         "Not answered"
       );
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
    console.log("contextBuckets:", contextBuckets);
    console.log("bucket:", bucket);
    console.log("group:", group);

    console.log("is_required:", is_required);

    // Add null checks

    const feature = contextBuckets[bucket].featureGroups[group].features.find(
      (feature) => feature.path === path
    );

    // If in preview mode, show simple question-answer preview
    if (contextQuestionsAnswered) {
      const answerValue = getContextConfigFieldByPath(feature.path);
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

    // Normal mode - show input components
    return (
      <>
        {feature.component === "DatePicker" && (
          <CustomDatePicker
            showLabel={feature.showLabel}
            label={feature.label}
            path={feature.path}
            key={`${feature.path}-${refresh}`}
            target={feature.target}
            isRequired={
              (is_required &&
                getContextConfigFieldByPath(feature.path) === null) ||
              getContextConfigFieldByPath(feature.path) === undefined ||
              getContextConfigFieldByPath(feature.path) === ""
            }
          />
        )}
        {feature.component === "Counter" && (
          <CustomCounter
            target={feature.target}
            showLabel={feature.showLabel}
            label={feature.label}
            path={feature.path}
            placeholder={feature.placeholder}
            maxRange={feature.maxRange}
            minRange={feature.minRange}
            key={`${feature.path}-${refresh}`}
          />
        )}
        {feature.component === "AutoComplete" && (
          <CustomAutocomplete
            isRequired={
              (is_required &&
                getContextConfigFieldByPath(feature.path) === null) ||
              getContextConfigFieldByPath(feature.path) === undefined ||
              getContextConfigFieldByPath(feature.path) === ""
            }
            key={`${feature.path}-${refresh}`}
            showLabel={feature.showLabel}
            label={feature.label}
            path={feature.path}
            placeholder={feature.placeholder}
            isMultiSelect={feature.isMultiSelect}
            values={feature.values}
            valuesDict={feature.valuesDict}
            dateFormat={feature.dateFormat}
            target={feature.target}
            conflictCheck={
              feature.conflictCheck === undefined
                ? false
                : feature.conflictCheck
            }
            disabled={
              (feature.label === "Select Product Dimensions" &&
                contextConfig.scenario_plan.inventory_constraints
                  .stock_transfer_level === "None") ||
              (feature.label === "Select Facility Dimensions" &&
                contextConfig.scenario_plan.inventory_constraints
                  .stock_transfer_facility === "None") ||
              (feature.label === "Select Zone Dimensions" &&
                contextConfig.scenario_plan.inventory_constraints
                  .stock_transfer_zone?.length === 0) ||
              ((feature.label === "Forecast Granularity" ||
                feature.label === "Cross Learning Dimensions" ||
                feature.label === "Historical Reference Period") &&
                (!loadedDatasets["new_product"] ||
                  loadedDatasets["new_product"].length === 0)) ||
              ([
                "Bundle Mapping Granularity",
                "Bundle Forecast Granularity",
                "Simple Mapping",
                "Simple Disaggregation Quantity",
                "Simple Disaggregated Granularity",
              ].includes(feature.label) &&
                contextConfig.scenario_plan.inventory_constraints
                  .disaggregation_type !== "simple_disaggregation")
            }
            formatLabel={false}
          />
        )}{" "}
        {feature.component === "Check" && (
          <CustomCheck
            question={feature.question}
            direction={feature.direction}
            path={feature.path}
            key={`${feature.path}-${refresh}`}
            target={feature.target}
          />
        )}
      </>
    );
  };

  if (!hasContextQuestions) {
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
              Context Questions
            </Typography>
            {contextQuestionsAnswered ? (
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
                  {contextQuestions.length} Questions
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {contextQuestionsAnswered && !contextAnswersConfirmed && (
              <CustomButton
                title="Confirm"
                aria-label="Confirm"
                disabled={creditScore <= 0}
                onClick={handleConfirmContext}
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
          {contextQuestionsAnswered ? null : (
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
            {contextQuestions.map((question, index) => (
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

            {!contextQuestionsAnswered && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                <CustomButton
                  title="Submit Answers"
                  disabled={creditScore <= 0}
                  onClick={async () => await handleSubmit()}
                  aria-label="Submit Answers"
                />
           
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ContextQuestionsSection;
