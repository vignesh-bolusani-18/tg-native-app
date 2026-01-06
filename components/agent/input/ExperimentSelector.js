/**
 * ExperimentSelector - Component to select experiments via @ mention
 * Allows users to tag experiments in their chat messages
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import useAuth from "../../../hooks/useAuth";
import useExperiment from "../../../hooks/useExperiment";
import { useVibe } from "../../../hooks/useVibe";
import { generateSystemPrompt } from "../../../utils/Agent Utils/generateSystemPrompt";

/**
 * ⭐ MATCHES tg-application: Parse experimentStatus helper
 * experimentStatus can be a JSON string like {"status": "Completed"} or plain "Completed"
 */
const parseExperimentStatus = (input) => {
  if (!input) return null;
  try {
    const json = JSON.parse(input);
    if (typeof json === "object" && json !== null) {
      return json.status;
    }
  } catch (_e) {
    // Not a JSON string, return as-is
    return input;
  }
  return input;
};

/**
 * ⭐ MATCHES tg-application: Format date to YYYYMM format
 */
const formatYearMonth = (dateString) => {
  if (!dateString) return '';
  
  if (typeof dateString === 'number') {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }
  
  const datePart = String(dateString).split(' at ')[0];
  const date = new Date(datePart);
  
  if (isNaN(date.getTime())) {
    const directDate = new Date(dateString);
    if (!isNaN(directDate.getTime())) {
      const year = directDate.getFullYear();
      const month = String(directDate.getMonth() + 1).padStart(2, '0');
      return `${year}${month}`;
    }
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
};

const ExperimentSelector = ({ visible, onClose, onSelectExperiment }) => {
  const { experiments_list, loading, error, fetchExperiments } = useExperiment();
  const { currentCompany } = useAuth();
  const { 
    selectedAnalysisExperiment, 
    setSelectedAnalysisExperiment, 
    clearSelectedAnalysisExperiment,
    setAnalysisSystemPrompt,
    setAnalysisDataPathDict,
  } = useVibe();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExperiments, setFilteredExperiments] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Fetch experiments on mount
  useEffect(() => {
    if (visible && (!experiments_list || experiments_list.length === 0)) {
      setHasError(false);
      setLoadingTimeout(false);
      
      // Set timeout after 10 seconds of loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('⚠️ [ExperimentSelector] Loading timeout - backend may be unavailable');
          setLoadingTimeout(true);
        }
      }, 10000);
      
      fetchExperiments().then(() => {
        clearTimeout(timeoutId);
        setLoadingTimeout(false);
      }).catch((err) => {
        console.error('❌ [ExperimentSelector] Error fetching:', err);
        clearTimeout(timeoutId);
        setHasError(true);
        setLoadingTimeout(false);
      });
      
      return () => clearTimeout(timeoutId);
    }
  }, [visible, experiments_list, fetchExperiments]);

  // Filter experiments based on search
  useEffect(() => {
    if (!experiments_list) {
      setFilteredExperiments([]);
      return;
    }
    
    // ⭐ MATCHES tg-application: Filter completed experiments using parseExperimentStatus
    const completedExperiments = experiments_list.filter(
      (exp) =>
        !exp.inTrash &&
        parseExperimentStatus(exp.experimentStatus) === "Completed" &&
        !exp.isArchive &&
        ["demand-planning", "inventory-optimization", "price-promotion-optimization"].includes(
          exp.experimentModuleName
        )
    );

    if (!searchQuery.trim()) {
      setFilteredExperiments(completedExperiments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = completedExperiments.filter(
      (exp) =>
        exp.experimentName?.toLowerCase().includes(query) ||
        exp.experimentModuleName?.toLowerCase().includes(query)
    );
    setFilteredExperiments(filtered);
  }, [searchQuery, experiments_list]);

  /**
   * ⭐ MATCHES tg-application: Handle experiment selection
   * Generates systemPrompt and dataPathDict when experiment is selected
   */
  const handleSelectExperiment = (experiment) => {
    console.log('🔍 [ExperimentSelector] handleSelectExperiment:', experiment?.experimentName);
    
    if (!experiment) {
      setSelectedAnalysisExperiment(null);
      setAnalysisSystemPrompt(null);
      setAnalysisDataPathDict(null);
      onClose();
      return;
    }

    // Build experiment base path - MATCHES tg-application exactly
    const moduleName = experiment.experimentModuleName;
    const run_date = formatYearMonth(experiment.createdAt);
    const experimentBasePath = `accounts/${currentCompany?.companyName}_${currentCompany?.companyID}/data_bucket/${moduleName}/${run_date}/${experiment.experimentID}`;
    
    console.log('🔍 [ExperimentSelector] experimentBasePath:', experimentBasePath);

    // Generate systemPrompt and dataPathDict - MATCHES tg-application exactly
    const { systemPrompt, dataPathDict } = generateSystemPrompt(
      experimentBasePath,
      moduleName,
      experiment.experimentName
    );

    console.log('🔍 [ExperimentSelector] Generated systemPrompt:', systemPrompt?.substring(0, 100));

    // Update Redux state
    setSelectedAnalysisExperiment(experiment);
    setAnalysisSystemPrompt(systemPrompt);
    setAnalysisDataPathDict(dataPathDict);
    
    if (onSelectExperiment) {
      onSelectExperiment(experiment);
    }
    onClose();
  };

  const handleClearSelection = () => {
    // ⭐ MATCHES tg-application: Clear all analysis state
    clearSelectedAnalysisExperiment();
    setAnalysisSystemPrompt(null);
    setAnalysisDataPathDict(null);
    onClose();
  };

  const getModuleIcon = (moduleName) => {
    switch (moduleName) {
      case "demand-planning":
        return "chart-timeline-variant";
      case "inventory-optimization":
        return "package-variant-closed";
      case "price-promotion-optimization":
        return "tag-multiple";
      default:
        return "flask";
    }
  };

  const getModuleColor = (moduleName) => {
    switch (moduleName) {
      case "demand-planning":
        return "#3B82F6"; // Blue
      case "inventory-optimization":
        return "#10B981"; // Green
      case "price-promotion-optimization":
        return "#F59E0B"; // Amber
      default:
        return "#6B7280"; // Gray
    }
  };

  const renderExperimentItem = ({ item }) => {
    const isSelected = selectedAnalysisExperiment?.experimentID === item.experimentID;
    const moduleColor = getModuleColor(item.experimentModuleName);
    
    return (
      <TouchableOpacity
        onPress={() => handleSelectExperiment(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        {/* Module Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: `${moduleColor}20`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons
            name={getModuleIcon(item.experimentModuleName)}
            size={22}
            color={moduleColor}
          />
        </View>

        {/* Experiment Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {item.experimentName || "Unnamed Experiment"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              textTransform: "capitalize",
            }}
          >
            {item.experimentModuleName?.replace(/-/g, " ")}
          </Text>
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color="#3B82F6"
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "70%",
            minHeight: "50%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="at"
                size={24}
                color="#3B82F6"
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2937" }}>
                Select Experiment
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={{ padding: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F3F4F6",
                borderRadius: 10,
                paddingHorizontal: 12,
              }}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#9CA3AF"
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search experiments..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  fontSize: 15,
                  color: "#1F2937",
                }}
              />
            </View>
          </View>

          {/* Currently Selected */}
          {selectedAnalysisExperiment && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: "#EFF6FF",
                marginHorizontal: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color="#3B82F6"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ fontSize: 13, color: "#1E40AF", fontWeight: "500" }}
                  numberOfLines={1}
                >
                  Selected: {selectedAnalysisExperiment.experimentName}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClearSelection}>
                <Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "600" }}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Experiments List */}
          {loading && !loadingTimeout ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>Loading experiments...</Text>
            </View>
          ) : loadingTimeout || hasError ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={{ fontSize: 15, color: "#1F2937", marginTop: 12, textAlign: "center", fontWeight: "600" }}>
                {loadingTimeout ? "Service Unavailable" : "Unable to Load Experiments"}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 8, textAlign: "center" }}>
                {loadingTimeout 
                  ? "The backend service is temporarily unavailable. Please try again later."
                  : "Failed to fetch experiments. Please check your connection and try again."
                }
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setHasError(false);
                  setLoadingTimeout(false);
                  fetchExperiments();
                }}
                style={{ 
                  marginTop: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: "#3B82F6",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredExperiments.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
              <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontSize: 15, color: "#6B7280", marginTop: 12, textAlign: "center" }}>
                {searchQuery ? "No experiments match your search" : "No completed experiments available"}
              </Text>
              <Text style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center" }}>
                Complete an experiment to use it here
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredExperiments}
              keyExtractor={(item) => item.experimentID}
              renderItem={renderExperimentItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ExperimentSelector;
