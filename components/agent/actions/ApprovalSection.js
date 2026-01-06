// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\actions\ApprovalSection.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Hooks
import useAuth from "../../../hooks/useAuth";
import useExperiment from "../../../hooks/useExperiment";
import useModule from "../../../hooks/useModule";
import { useVibe } from "../../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../../hooks/useWorkflowWebSocket";
import { oldFlowModules } from "../../../utils/oldFlowModules";

const ApprovalSection = ({ approvalData, messageId }) => {
  const { createExperiment: createExperimentExperiment } = useExperiment();
  const { createExperiment: createExperimentModule } = useModule();
  const { userInfo } = useAuth();
  
  const {
    setProcessingStepText,
    setIsWaitingForAI,
    editMessage,
    creditScore,
  } = useVibe();
  
  const { sendQuery } = useWorkflowWebSocket();

  const createExperiment = oldFlowModules.includes(approvalData?.determined_module)
    ? createExperimentExperiment
    : createExperimentModule;

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

  const modulesDict = {
    "demand-planning": "Demand Planning",
    "next_best_action": "Next Best Action",
    "next_best_offer": "Next Best Offer",
    "regression": "Regression",
    "binary_classification": "Binary Classification",
  };

  const onApprove = async () => {
    if (conversationalModules.includes(approvalData?.determined_module)) {
      setProcessingStepText("Preparing data requirements...");
      setIsWaitingForAI(true);
    }

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
        mandatory_data_tags: mandatoryDataTagsDict[approvalData?.determined_module],
        workflow_status: {
          ...approvalData?.workflow_status,
          module_approved: true,
        },
        next_step: { user: "approved", ai: "data_demander" },
      };

      sendQuery({ query: "", updated_state: updated_state });
    }
  };

  const isApproved = approvalData?.next_step?.user === "approved";

  return (
    <View style={styles.container}>
      {isApproved ? (
        <View style={styles.approvedRow}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
          <Text style={styles.approvedText}>
            Approved {modulesDict[approvalData?.determined_module] || "Module"}
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>
            Module Recommendation: {modulesDict[approvalData?.determined_module] || "Recommended"}
          </Text>

          {approvalData.reason && (
            <Text style={styles.reason}>
              {approvalData.reason}
            </Text>
          )}

          <TouchableOpacity
            onPress={onApprove}
            disabled={creditScore <= 0}
            style={[styles.button, creditScore <= 0 && styles.buttonDisabled]}
          >
            <MaterialCommunityIcons name="check" size={16} color="white" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  approvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approvedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  reason: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    width: 128,
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 12,
  },
});

export default ApprovalSection;