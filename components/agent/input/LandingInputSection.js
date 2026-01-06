// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\input\LandingInputSection.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// Components
import DatasetSelector from "./DatasetSelector";
import ExperimentSelector from "./ExperimentSelector";
import MentionEditor from "./MentionEditor";

// Hooks
import useDataset from "../../../hooks/useDataset";
import useExperiment from "../../../hooks/useExperiment";
import { useVibe } from "../../../hooks/useVibe";

const LandingInputSection = ({
  onSendMessage,
  canSendMessage: canSendMessageProp,
  isWaitingForAI,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showExperimentSelector, setShowExperimentSelector] = useState(false);
  const [showDatasetSelector, setShowDatasetSelector] = useState(false);
  const inputRef = useRef(null);
  
  // Hooks
  const { fetchExperiments, getCompletedExperiments } = useExperiment();
  const { datasets_name_list, fetchDatasets } = useDataset();
  const { selectedAnalysisExperiment, clearSelectedAnalysisExperiment, selectedDatasets, clearAllSelectedDatasets } = useVibe();

  // Fetch experiments and datasets on mount
  useEffect(() => {
    fetchExperiments();
    fetchDatasets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep input enabled during workflow - only disable when waiting for AI response
  // This allows users to interact during workflow execution
  const isEditorDisabled = isWaitingForAI;
  const hasText = inputValue.trim().length > 0;
  
  console.log('🎛️ [LandingInput] State:', { isWaitingForAI, isEditorDisabled, hasText });

  // Transform for suggestions (datasets and experiments)
  const completedExperiments = getCompletedExperiments();
  const experimentSuggestions = completedExperiments.map(exp => ({
    id: exp.experimentID,
    name: exp.experimentName || "Unnamed Experiment",
    type: 'experiment',
    data: exp
  }));
  
  const datasetSuggestions = (datasets_name_list || []).map(name => ({
    id: name,
    name: name,
    type: 'dataset'
  }));
  
  // Combine all suggestions
  const suggestions = [...datasetSuggestions, ...experimentSuggestions];

  const handleSend = (text = inputValue) => {
    if (text.trim() && canSendMessageProp && !isWaitingForAI) {
      console.log('📤 [INPUT] USER MESSAGE SEND');
      console.log('   Message:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      console.log('   Length:', text.length, 'chars');
      console.log('   Timestamp:', new Date().toISOString());
      if (selectedAnalysisExperiment) {
        console.log('   Selected Experiment:', selectedAnalysisExperiment.experimentName);
      }
      if (selectedDatasets && Object.keys(selectedDatasets).length > 0) {
        console.log('   Selected Datasets:', Object.keys(selectedDatasets));
      }
      onSendMessage(text.trim());
      setInputValue("");
      console.log('   ✅ Message sent to handler');
    } else {
      console.warn('⚠️ [INPUT] Message send blocked:', {
        hasText: !!text.trim(),
        canSend: canSendMessageProp,
        isWaiting: isWaitingForAI
      });
    }
  };

  const handleExperimentSelect = (experiment) => {
    console.log('📊 [INPUT] Experiment selected:', experiment.experimentName);
  };

  const handleDatasetSelect = (dataset, isSelected) => {
    console.log('📂 [INPUT] Dataset selection changed:', dataset.name || dataset.datasetName, isSelected);
  };

  // Send is disabled if editor is disabled OR socket is not ready OR no text
  const isSendDisabled = isEditorDisabled || !hasText;
  
  const selectedDatasetCount = Object.keys(selectedDatasets || {}).length;

  return (
    <View style={{ width: '100%', maxWidth: '100%', alignSelf: 'center', paddingHorizontal: 4, paddingBottom: 4 }}>
      {/* Selected Experiment Badge */}
      {selectedAnalysisExperiment && (
        <View 
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: '#EFF6FF',
            borderRadius: 8,
            marginHorizontal: 4
          }}
        >
          <MaterialCommunityIcons name="flask" size={16} color="#3B82F6" />
          <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#1E40AF', fontWeight: '500' }} numberOfLines={1}>
            @{selectedAnalysisExperiment.experimentName}
          </Text>
          <TouchableOpacity onPress={clearSelectedAnalysisExperiment}>
            <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Selected Datasets Badge */}
      {selectedDatasetCount > 0 && (
        <View 
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: '#F0FDF4',
            borderRadius: 8,
            marginHorizontal: 4
          }}
        >
          <MaterialCommunityIcons name="database" size={16} color="#10B981" />
          <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#065F46', fontWeight: '500' }} numberOfLines={1}>
            {selectedDatasetCount} dataset{selectedDatasetCount > 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity onPress={clearAllSelectedDatasets}>
            <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      <View 
        style={{ 
          minHeight: 56, 
          maxHeight: 150,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isEditorDisabled ? '#f9fafb' : '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 9999,
          paddingHorizontal: 16,
          paddingVertical: 12,
          opacity: isEditorDisabled ? 0.6 : 1
        }}
      >
        {/* Dataset Selector Button */}
        <TouchableOpacity
          onPress={() => setShowDatasetSelector(true)}
          disabled={isEditorDisabled}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selectedDatasetCount > 0 ? '#F0FDF4' : '#f3f4f6',
            marginRight: 4,
          }}
        >
          <MaterialCommunityIcons 
            name="database" 
            size={16} 
            color={selectedDatasetCount > 0 ? "#10B981" : "#6B7280"} 
          />
        </TouchableOpacity>

        {/* Experiment Selector Button */}
        <TouchableOpacity
          onPress={() => setShowExperimentSelector(true)}
          disabled={isEditorDisabled}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selectedAnalysisExperiment ? '#EFF6FF' : '#f3f4f6',
            marginRight: 8,
          }}
        >
          <MaterialCommunityIcons 
            name="flask" 
            size={16} 
            color={selectedAnalysisExperiment ? "#3B82F6" : "#6B7280"} 
          />
        </TouchableOpacity>

        {/* Editor Area */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <MentionEditor
            ref={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder="Ask me anything..."
            editable={!isEditorDisabled}
            suggestions={suggestions}
            onMentionSelect={handleExperimentSelect}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={() => handleSend(inputValue)}
          disabled={isSendDisabled || !canSendMessageProp}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: hasText && !isEditorDisabled && canSendMessageProp ? '#10B981' : '#f3f4f6',
          }}
        >
          {isWaitingForAI ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <MaterialCommunityIcons 
              name="arrow-up" 
              size={20} 
              color={hasText && !isEditorDisabled && canSendMessageProp ? "white" : "#9ca3af"} 
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Experiment Selector Modal */}
      <ExperimentSelector
        visible={showExperimentSelector}
        onClose={() => setShowExperimentSelector(false)}
        onSelectExperiment={handleExperimentSelect}
      />

      {/* Dataset Selector Modal */}
      <DatasetSelector
        visible={showDatasetSelector}
        onClose={() => setShowDatasetSelector(false)}
        onSelectDataset={handleDatasetSelect}
      />
    </View>
  );
};

export default LandingInputSection;