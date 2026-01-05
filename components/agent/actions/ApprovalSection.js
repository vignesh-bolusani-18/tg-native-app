// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\actions\ApprovalSection.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

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
    <View className="mt-4 p-4 bg-white border border-gray-200 rounded-lg border-l-4 border-l-blue-500 shadow-sm">
      {isApproved ? (
        <View className="flex-row items-center space-x-2">
          <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
          <Text className="text-sm font-semibold text-green-600">
            Approved {modulesDict[approvalData?.determined_module] || "Module"}
          </Text>
        </View>
      ) : (
        <View>
          <Text className="text-sm font-semibold text-gray-800 mb-2">
            Module Recommendation: {modulesDict[approvalData?.determined_module] || "Recommended"}
          </Text>

          {approvalData.reason && (
            <Text className="text-xs text-gray-500 mb-4 leading-5">
              {approvalData.reason}
            </Text>
          )}

          <TouchableOpacity
            onPress={onApprove}
            disabled={creditScore <= 0}
            className={`flex-row items-center justify-center py-2 px-4 rounded-md w-32 ${
              creditScore <= 0 ? "bg-gray-300" : "bg-green-600"
            }`}
          >
            <MaterialCommunityIcons name="check" size={16} color="white" />
            <Text className="text-white font-medium ml-2 text-xs">Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ApprovalSection;