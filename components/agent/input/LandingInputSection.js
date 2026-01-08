// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\input\LandingInputSection.js
import { MaterialIcons } from "@expo/vector-icons";
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
  onStopGeneration, // NEW: Function to stop AI generation
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
            paddingVertical: 6,
            backgroundColor: '#EFF6FF',
            borderRadius: 16,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: '#BFDBFE'
          }}
        >
          <MaterialIcons name="science" size={14} color="#3B82F6" />
          <Text style={{ flex: 1, marginLeft: 6, fontSize: 12, color: '#1E40AF', fontWeight: '500', fontFamily: 'Inter Display' }} numberOfLines={1}>
            {selectedAnalysisExperiment.experimentName}
          </Text>
          <TouchableOpacity onPress={clearSelectedAnalysisExperiment} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={16} color="#6B7280" />
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
            paddingVertical: 6,
            backgroundColor: '#F0FDF4',
            borderRadius: 16,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: '#BBF7D0'
          }}
        >
          <MaterialIcons name="push-pin" size={14} color="#10B981" />
          <Text style={{ flex: 1, marginLeft: 6, fontSize: 12, color: '#065F46', fontWeight: '500', fontFamily: 'Inter Display' }} numberOfLines={1}>
            {selectedDatasetCount} dataset{selectedDatasetCount > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={clearAllSelectedDatasets} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Chat Input Container - Figma Design */}
      <View 
        style={{ 
          minHeight: 48, 
          maxHeight: 120,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 24,
          paddingHorizontal: 12,
          paddingVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {/* @ Button (Experiment Selector) */}
        <TouchableOpacity
          onPress={() => setShowExperimentSelector(true)}
          disabled={isEditorDisabled}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selectedAnalysisExperiment ? '#EFF6FF' : 'transparent',
            marginRight: 6,
          }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <MaterialIcons 
            name="alternate-email" 
            size={20} 
            color={selectedAnalysisExperiment ? "#0F8BFF" : "#999999"} 
          />
        </TouchableOpacity>

        {/* Dataset Button (Paperclip/Attachment Icon) */}
        <TouchableOpacity
          onPress={() => setShowDatasetSelector(true)}
          disabled={isEditorDisabled}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selectedDatasetCount > 0 ? '#F0FDF4' : 'transparent',
            marginRight: 8,
          }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <MaterialIcons 
            name="attach-file" 
            size={18} 
            color={selectedDatasetCount > 0 ? "#10B981" : "#808080"} 
          />
        </TouchableOpacity>

        {/* Text Input Area */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <MentionEditor
            ref={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder="Ask anything..."
            editable={!isEditorDisabled}
            suggestions={suggestions}
            onMentionSelect={handleExperimentSelect}
          />
        </View>

        {/* Mic Button */}
        <TouchableOpacity
          disabled={isEditorDisabled}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F0F0F0',
            marginRight: 6,
          }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <MaterialIcons 
            name="mic" 
            size={18} 
            color="#666666" 
          />
        </TouchableOpacity>

        {/* Send / Stop Button */}
        <TouchableOpacity
          onPress={() => {
            if (isWaitingForAI && onStopGeneration) {
              // Stop AI generation
              onStopGeneration();
            } else {
              // Send message
              handleSend(inputValue);
            }
          }}
          disabled={!isWaitingForAI && (isSendDisabled || !canSendMessageProp)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isWaitingForAI ? '#EF4444' : '#0F8BFF',
            opacity: isWaitingForAI || (hasText && !isEditorDisabled && canSendMessageProp) ? 1 : 0.5,
          }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          {isWaitingForAI ? (
            <MaterialIcons 
              name="stop" 
              size={18} 
              color="#FFFFFF" 
            />
          ) : (
            <MaterialIcons 
              name="arrow-upward" 
              size={18} 
              color="#FFFFFF" 
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Experiment Selector Modal */}
      <ExperimentSelector
        visible={showExperimentSelector}
        onClose={() => setShowExperimentSelector(false)}
        onSelectExperiment={(exp) => {
          handleExperimentSelect(exp);
          setShowExperimentSelector(false);
        }}
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