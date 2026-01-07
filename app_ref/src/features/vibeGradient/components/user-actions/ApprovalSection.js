import React, { useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";
import { STYLES } from "../../constants";
import useExperiment from "../../../../hooks/useExperiment";
import useAuth from "../../../../hooks/useAuth";
import { useWorkflowWebSocket } from "../../../../hooks/useWorkflowWebSocket";
import { useVibe } from "../../../../hooks/useVibe";
import useConfig from "../../../../hooks/useConfig";
import useModule from "../../../../hooks/useModule";
import { oldFlowModules } from "../../../../utils/oldFlowModules";

const ApprovalSection = ({ approvalData, messageId, conversationId }) => {
  const { createExperiment: createExperimentExperiment, mandatoryDatasetTags } =
    useExperiment();
  const { createExperiment: createExperimentModule } = useModule();
  const { configState } = useConfig();
  const { userInfo } = useAuth();
  const {
    processingStepText,
    setProcessingStepText,
    isWaitingForAI,
    setIsWaitingForAI,
    editMessage,
    creditScore,
  } = useVibe();
  const { sendQuery } = useWorkflowWebSocket();
  const createExperiment = oldFlowModules.includes(
    approvalData?.determined_module
  )
    ? createExperimentExperiment
    : createExperimentModule;
  const processingText = useMemo(() => {
    return processingStepText;
  }, [processingStepText]);
  const updatedConfigData = useMemo(() => {
    return {
      mandatory_data_tags: mandatoryDatasetTags,
      config: configState,
    };
  }, [mandatoryDatasetTags, configState]);

  const mandatoryDataTagsDict = {
    "demand-planning": ["sales"],
    "inventory-optimization": ["sales", "inventory"],
    "price-promotion-optimization": ["sales"],
    next_best_action: ["customer_transaction"],
    next_best_offer: ["customer_transaction"],
    regression: ["base"],
    binary_classification: ["base"],
  };
  const conversationalModules = [
    "demand-planning",
    "next_best_action",
    "next_best_offer",
    "regression",
    "binary_classification",
  ];

  const { discardExperiment: discardExperimentModule } = useModule();
  const { discardExperiment: discardExperimentExperiment } = useExperiment();
  const modulesDict ={
    "demand-planning": "Demand Planning",
    "next_best_action": "Next Best Action",
    "next_best_offer": "Next Best Offer",
    "regression": "Regression",
    "binary_classification": "Binary Classification",
  };
  const handleDiscardExperiment = () => {
    if (oldFlowModules.includes(approvalData?.determined_module)) {
      discardExperimentExperiment();
    } else {
      discardExperimentModule();
    }
  };
  const onApprove = async () => {
    // Set the processing state immediately
    handleDiscardExperiment();
    if (conversationalModules.includes(approvalData?.determined_module)) {
      setProcessingStepText("Preparing data requirements...");
      setIsWaitingForAI(true);
    }

    // Update the message's langgraphState to mark it as approved
    if (messageId) {
      editMessage(messageId, {
        langgraphState: {
          ...approvalData,
          next_step: { user: "approved", ai: "data_demander" },
        },
      });
    }
    if (!conversationalModules.includes(approvalData?.determined_module)) {
      await createExperiment(
        approvalData?.determined_module,
        userInfo.userID,
        false
      );
      return;
    } else {
      await createExperiment(
        approvalData?.determined_module,
        userInfo.userID,
        true
      );
      const updated_state = {
        ...approvalData,
        mandatory_data_tags:
          mandatoryDataTagsDict[approvalData?.determined_module],
        workflow_status: {
          ...approvalData?.workflow_status,
          module_approved: true,
        },
        next_step: { user: "approved", ai: "data_demander" },
      };

      console.log("ApprovalSection: Processing step text", processingText);
      console.log("ApprovalSection: Is waiting for AI", isWaitingForAI);
      sendQuery({query: "", updated_state: updated_state});
    }
  };
  const onReject = async () => {
    console.log("ApprovalSection: Rejecting module");
    setProcessingStepText("Rejecting module...");
    setIsWaitingForAI(false);
  };

  // Check if the module is already approved
  const isApproved = approvalData?.next_step?.user === "approved";
  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        borderLeft: "4px solid #3b82f6",
      }}
    >
      {isApproved ? (
        // Show simple approved header
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CheckIcon sx={{ fontSize: 16, color: "#10b981" }} />
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#10b981",
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            Approved {modulesDict[approvalData?.determined_module] || "Module"}
          </Typography>
        </Box>
      ) : (
        // Show full recommendation content
        <>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              mb: 1,
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            Module Recommendation:{" "}
            {modulesDict[approvalData?.determined_module] || "Recommended"}
          </Typography>

          {approvalData.reason && (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#6b7280",
                mb: 2,
                lineHeight: 1.5,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              {approvalData.reason}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Button
              size="small"
              aria-label="Approve-Module"
              variant="contained"
              color="success"
              startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
              disabled={creditScore <= 0}
              onClick={onApprove}
              sx={{
                fontSize: "0.75rem",
                py: 0.5,
                px: 1.5,
                textTransform: "none",
                fontWeight: 500,
                minWidth: "auto",
              }}
            >
              Approve
            </Button>
            {/* <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
              onClick={onReject}
              sx={{
                fontSize: "0.75rem",
                py: 0.5,
                px: 1.5,
                textTransform: "none",
                fontWeight: 500,
                minWidth: "auto",
                borderWidth: "1px",
              }}
            >
              Reject
            </Button> */}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ApprovalSection;
