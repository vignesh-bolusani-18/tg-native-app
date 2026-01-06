import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    LayoutAnimation,
    Platform,
    StyleSheet,
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
    <View style={styles.container}>
      {/* Main Header - Always visible */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleMainSection}
        style={[styles.header, isMainExpanded && styles.headerWithBorder]}
      >
        <View style={styles.headerLeft}>
          <MaterialIcons name="label" size={20} color="#10b981" />
          
          <Text style={styles.headerTitle}>
            {dataConfirmed ? "Data Confirmed" : "Data Tags Analysis"}
          </Text>

          {dataConfirmed && (
            <View style={styles.confirmedBadge}>
              <MaterialIcons name="check" size={12} color="#10b981" />
              <Text style={styles.confirmedText}>
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
        <View style={styles.content}>
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

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  headerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  confirmedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#065f46',
  },
  content: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
});

export default TagsSection;