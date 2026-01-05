import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    LayoutAnimation,
    Platform,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { useVibe } from "../../../hooks/useVibe";
import DataTaggerSection from "./DataTaggerSection";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TagsSection = ({ tagsData, messageId, langgraphState }) => {
  // State for main section expansion
  const [isMainExpanded, setIsMainExpanded] = useState(true);

  // State for collapsible sections (kept for future parity with web)
  // const [expandedSections, setExpandedSections] = useState({
  //   assignedTags: false,
  //   edaSummary: false,
  // });

  const { dataConfirmed } = useVibe();

  // Logic to find current data tag
  const currentDataTag = Object.keys(langgraphState?.data || {}).find(
    (key) =>
      langgraphState?.data[key].sample_data_path &&
      langgraphState?.data[key].sample_data_path.length > 0
  );

  console.log("currentDataTag", currentDataTag);

  // Extract tags information
  const dataInfo = tagsData?.data?.[currentDataTag];
  
  // Auto-collapse main section when approved
  useEffect(() => {
    if (dataConfirmed) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsMainExpanded(false);
    }
  }, [dataConfirmed]);

  // Toggle main section expansion with animation
  const toggleMainSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMainExpanded(!isMainExpanded);
  };

  return (
    <View className="mt-3 overflow-hidden rounded-xl bg-white border border-gray-200">
      {/* Main Header - Always visible */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleMainSection}
        className={`p-4 flex-row items-center justify-between bg-white ${
          isMainExpanded ? "border-b border-gray-100" : ""
        } border-l-4 border-l-emerald-500`}
      >
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="label" size={20} color="#10b981" />
          
          <Text className="text-base font-semibold text-gray-700">
            {dataConfirmed ? "Data Confirmed" : "Data Tags Analysis"}
          </Text>

          {dataConfirmed && (
            <View className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full flex-row items-center gap-1">
              <MaterialIcons name="check" size={12} color="#10b981" />
              <Text className="text-xs font-medium text-emerald-800">
                Confirmed
              </Text>
            </View>
          )}
        </View>

        <MaterialIcons
          name={isMainExpanded ? "expand-less" : "expand-more"}
          size={24}
          color="#6b7280"
        />
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isMainExpanded && (
        <View className="p-4 bg-white">
          {/* Note: The original Web code had commented out sections for 
            Dataset Info, Tags Analysis, and EDA Summary. 
            I have omitted them here to keep the file clean, 
            but the structure allows you to add them back easily if needed.
          */}

          {/* Active Data Tagger Section */}
          <DataTaggerSection
            dataInfo={dataInfo}
            messageId={messageId}
            langgraphState={langgraphState}
          />
        </View>
      )}
    </View>
  );
};

export default TagsSection;