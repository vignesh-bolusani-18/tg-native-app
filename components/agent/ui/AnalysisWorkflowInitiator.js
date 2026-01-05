/**
 * ⭐ ANALYSIS WORKFLOW INITIATOR - Start analysis workflow with experiment selection
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useExperiment from '../../../hooks/useExperiment';
import { useVibe } from '../../../hooks/useVibe';

export default function AnalysisWorkflowInitiator({ onStart, onExperimentSelect }) {
  const { experiments_list, fetchExperiments, loading: experimentsLoading } = useExperiment();
  const { selectedAnalysisExperiment, setSelectedAnalysisExperiment, clearSelectedAnalysisExperiment } = useVibe();
  const [showExperimentList, setShowExperimentList] = useState(false);

  useEffect(() => {
    fetchExperiments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter only completed experiments
  const completedExperiments = (experiments_list || []).filter(
    (exp) =>
      !exp.inTrash &&
      exp.experimentStatus === "Completed" &&
      !exp.isArchive &&
      ["demand-planning", "inventory-optimization", "price-promotion-optimization"].includes(
        exp.experimentModuleName
      )
  );

  const handleSelectExperiment = (experiment) => {
    setSelectedAnalysisExperiment(experiment);
    setShowExperimentList(false);
    if (onExperimentSelect) {
      onExperimentSelect(experiment);
    }
  };

  const handleClearExperiment = () => {
    clearSelectedAnalysisExperiment();
  };

  const getModuleIcon = (moduleName) => {
    switch (moduleName) {
      case "demand-planning": return "chart-timeline-variant";
      case "inventory-optimization": return "package-variant-closed";
      case "price-promotion-optimization": return "tag-multiple";
      default: return "flask";
    }
  };

  const getModuleColor = (moduleName) => {
    switch (moduleName) {
      case "demand-planning": return "#3B82F6";
      case "inventory-optimization": return "#10B981";
      case "price-promotion-optimization": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const renderExperimentItem = ({ item }) => {
    const isSelected = selectedAnalysisExperiment?.experimentID === item.experimentID;
    const moduleColor = getModuleColor(item.experimentModuleName);
    
    return (
      <TouchableOpacity
        onPress={() => handleSelectExperiment(item)}
        style={[
          styles.experimentItem,
          isSelected && { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${moduleColor}20` }]}>
          <MaterialCommunityIcons
            name={getModuleIcon(item.experimentModuleName)}
            size={20}
            color={moduleColor}
          />
        </View>
        <View style={styles.experimentInfo}>
          <Text style={styles.experimentName} numberOfLines={1}>
            {item.experimentName || "Unnamed Experiment"}
          </Text>
          <Text style={styles.experimentModule}>
            {item.experimentModuleName?.replace(/-/g, " ")}
          </Text>
        </View>
        {isSelected && (
          <MaterialCommunityIcons name="check-circle" size={20} color="#3B82F6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="flask-outline" size={24} color="#3B82F6" />
        <Text style={styles.title}>Select Experiment for Analysis</Text>
      </View>

      {/* Selected Experiment Badge */}
      {selectedAnalysisExperiment && (
        <View style={styles.selectedBadge}>
          <MaterialCommunityIcons name="flask" size={18} color="#3B82F6" />
          <Text style={styles.selectedText} numberOfLines={1}>
            {selectedAnalysisExperiment.experimentName}
          </Text>
          <TouchableOpacity onPress={handleClearExperiment}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Toggle Experiment List Button */}
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setShowExperimentList(!showExperimentList)}
      >
        <Text style={styles.selectButtonText}>
          {selectedAnalysisExperiment ? "Change Experiment" : "Select an Experiment"}
        </Text>
        <MaterialCommunityIcons
          name={showExperimentList ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* Experiment List */}
      {showExperimentList && (
        <View style={styles.experimentList}>
          {experimentsLoading ? (
            <Text style={styles.loadingText}>Loading experiments...</Text>
          ) : completedExperiments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="flask-empty-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No completed experiments</Text>
            </View>
          ) : (
            <FlatList
              data={completedExperiments}
              keyExtractor={(item) => item.experimentID}
              renderItem={renderExperimentItem}
              style={{ maxHeight: 200 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Start Button */}
      {selectedAnalysisExperiment && (
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <MaterialCommunityIcons name="play" size={20} color="#fff" />
          <Text style={styles.startText}>Start Analysis</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  experimentList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  experimentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  experimentInfo: {
    flex: 1,
  },
  experimentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  experimentModule: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
