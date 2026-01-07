import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { keyframes } from "@mui/system";

// Subtle pulse animation for current step
const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
  }
`;

const WorkflowProgressTracker = ({
  currentStep,
  totalSteps,
  workflowName,
  currentStepName,
  determinedModule,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Don't render if data is invalid
  if (!currentStep || !totalSteps || currentStep > totalSteps) {
    return null;
  }

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const stepsRemaining = totalSteps - currentStep;

  // Format module name for display
  const formatModuleName = (module) => {
    if (!module) return null;
    return module
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formattedModule = formatModuleName(determinedModule);

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: {
          xs: "8px 16px",
          sm: "8px 24px",
          md: "8px 80px",
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 2, sm: 3, md: 4 },
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "#fafafa",
        },
      }}
    >
      {/* Left side - Step info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5, md: 2 },
          minWidth: 0,
          flex: "0 0 auto",
        }}
      >
        {/* 1. Module Name */}
        {formattedModule && !isMobile && (
          <>
            <Typography
              sx={{
                fontSize: { xs: "11px", sm: "11px", md: "12px" },
                fontWeight: 500,
                color: "#3b82f6",
                whiteSpace: "nowrap",
              }}
            >
              {formattedModule}
            </Typography>
            <Typography
              sx={{
                fontSize: "10px",
                color: "#cbd5e1",
              }}
            >
              •
            </Typography>
          </>
        )}

        {/* 2. Current Step Name */}
        {currentStepName && !isMobile && (
          <>
            <Typography
              sx={{
                fontSize: { xs: "11px", sm: "11px", md: "12px" },
                fontWeight: 500,
                color: "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              {currentStepName}
            </Typography>
            <Typography
              sx={{
                fontSize: "10px",
                color: "#cbd5e1",
              }}
            >
              •
            </Typography>
          </>
        )}
      </Box>

      {/* Center - Step Progress with Circles */}
      <Box
        sx={{
          flex: 1,
          minWidth: { xs: 100, sm: 200, md: 300 },
          display: "flex",
          alignItems: "center",
          position: "relative",
          paddingY: 0.5,
        }}
      >
        {/* Background Line */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2px",
            backgroundColor: "#e2e8f0",
            borderRadius: "1px",
            zIndex: 1,
          }}
        />

        {/* Progress Line */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            width: `${progressPercentage}%`,
            height: "2px",
            backgroundColor: stepsRemaining === 0 ? "#10b981" : "#3b82f6",
            borderRadius: "1px",
            zIndex: 2,
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Step Circles */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 3,
          }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <Box
                key={stepNumber}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Circle */}
                <Box
                  sx={{
                    width: { xs: "16px", sm: "18px", md: "20px" },
                    height: { xs: "16px", sm: "18px", md: "20px" },
                    borderRadius: "50%",
                    backgroundColor: isCompleted
                      ? "#3b82f6"
                      : isCurrent
                      ? "#3b82f6"
                      : "#ffffff",
                    border: isCurrent
                      ? "2px solid #3b82f6"
                      : isUpcoming
                      ? "2px solid #cbd5e1"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: isCurrent
                      ? `${pulseAnimation} 2.5s ease-in-out infinite`
                      : "none",
                    boxShadow: isCurrent
                      ? "0 0 0 3px rgba(59, 130, 246, 0.08)"
                      : "none",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.08)",
                    },
                  }}
                >
                  {/* Checkmark for completed steps */}
                  {isCompleted && (
                    <Typography
                      sx={{
                        fontSize: { xs: "9px", sm: "10px", md: "11px" },
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      ✓
                    </Typography>
                  )}

                  {/* Dot for current step */}
                  {isCurrent && (
                    <Box
                      sx={{
                        width: { xs: "6px", sm: "7px", md: "8px" },
                        height: { xs: "6px", sm: "7px", md: "8px" },
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                      }}
                    />
                  )}

                  {/* Number for upcoming steps */}
                  {isUpcoming && !isMobile && (
                    <Typography
                      sx={{
                        fontSize: { xs: "8px", sm: "9px", md: "10px" },
                        fontWeight: 600,
                        color: "#94a3b8",
                      }}
                    >
                      {stepNumber}
                    </Typography>
                  )}
                </Box>

                {/* Step number label below (optional, for mobile) */}
                {isMobile && (
                  <Typography
                    sx={{
                      fontSize: "8px",
                      fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent ? "#3b82f6" : "#94a3b8",
                      marginTop: "4px",
                      position: "absolute",
                      bottom: "-16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stepNumber}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default WorkflowProgressTracker;
