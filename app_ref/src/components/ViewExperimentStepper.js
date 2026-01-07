import React from "react";
import {
  Box,
  Step,
  StepLabel,
  Stepper,
  LinearProgress,
} from "@mui/material";
import {
  CheckRounded,
  ErrorRounded,
  WarningRounded,
  Settings, // Import the gear icon
} from "@mui/icons-material";
import ParsedErrorMessage from "./ParsedErrorMessage";

const baseRunTypeSteps  = {
  run_training: [
    "ingestion",
    "etl",
    "preprocessing",
    "feature_engineering",
    "training",
    "stacking",
    "scenario_planning",
    "optimization",
    "custom_module",
  ],
  run_optimization: [
    "ingestion",
    "etl",
    "stacking",
    "scenario_planning",
    "optimization",
    "custom_module",
  ],
  run_scenario: ["stacking", "scenario_planning", "optimization", "custom_module"],
};

const stepNameMapping = {
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
const ViewExperimentStepper = ({
  experimentRunType,
  currentStep,
  completedSteps = [],
  errorDetails,
  loading,
  hasDataOperations
}) => {
  const dataOperationSteps = ["raw_data_pull", "data_cleaning", "data_preprocessing"];
  const runTypeSteps = { ...baseRunTypeSteps };

  if (hasDataOperations) {
    runTypeSteps.run_training = [...dataOperationSteps, ...runTypeSteps.run_training];
    runTypeSteps.run_optimization = [...dataOperationSteps, ...runTypeSteps.run_optimization];
  } 
  // Set steps dynamically based on experimentRunType
  const steps = experimentRunType ? runTypeSteps[experimentRunType] : [];
  const areDataOperationsCompleted =
  dataOperationSteps.every((step) => !completedSteps.includes(step)) &&
  currentStep !== "raw_data_pull";

  const getStepStatus = (step) => {
    if(areDataOperationsCompleted && dataOperationSteps.includes(step)) {
      return "completed";
    }
    if (completedSteps.includes(step)) {
      return "completed";
    } else if (currentStep === step) {
      return errorDetails ? "failed" : "in_progress";
    } else {
      return "upcoming";
    }
  };

  const getIcon = (step) => {
    const stepStatus = getStepStatus(step);
    const isCurrentStep = currentStep === step; // Check if it's the current step

    const iconStyle = {
      color: "#fff",
      width: isCurrentStep ? "20px" : "16px", // Make current step icon larger
      height: isCurrentStep ? "20x" : "16px", // Make current step icon larger
    };

    if (stepStatus === "completed") {
      return (
        <Box sx={stepIconStyle("#12B76A")}>
          <CheckRounded style={iconStyle} />
        </Box>
      );
    } else if (stepStatus === "in_progress") {
      // Show rotating gear icon for the current step
      return (
        <Box sx={stepIconStyle("#1E40AF")}>
          <Settings className="rotating-icon" style={iconStyle} />
        </Box>
      );
    } else if (stepStatus === "failed") {
      return (
        <Box sx={stepIconStyle("#DC2626")}>
          <ErrorRounded style={iconStyle} />
        </Box>
      );
    } else {
      return <Box sx={stepIconStyle("#D1D5DB")} />;
    }
  };

  const stepIconStyle = (bgColor) => ({
    backgroundColor: bgColor,
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });

  if (loading) {
    return (
      <Box sx={{ padding: "16px", textAlign: "center" }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", padding: "16px" }}>
      <Stepper alternativeLabel>
        {steps.map((step) => (
          <Step key={step} active={currentStep === step}>
            <StepLabel
              StepIconComponent={() => getIcon(step)}
              sx={{
                ".MuiStepLabel-label": {
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color:
                    getStepStatus(step) === "completed"
                      ? "#101828"
                      : "#6B7280",
                },
              }}
            >
              {stepNameMapping[step] || step}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Show error message if the experiment has failed */}
      {errorDetails && (
        <Box sx={{ padding: "16px", marginTop: "16px" }}>
          <ParsedErrorMessage errorDetails={errorDetails} currentStep={currentStep} />
        </Box>
      )}
      
      {/* Include CSS styles directly in the component */}
      <style>
        {`
          .rotating-icon {
            animation: rotate 2s linear infinite; /* Animation for rotation */
          }

          /* Keyframes for rotation */
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ViewExperimentStepper;
