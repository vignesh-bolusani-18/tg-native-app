/**
 * AnalyzeExperimentInlinePopup - Figma Design 3968:1307
 * 
 * Component States (matching Figma exactly):
 * 1. Default (3968:1306) - Blue header collapsed + chat input
 * 2. Analyze Experiment List (3968:1305) - Expanded with experiment cards
 * 3. Mention Open Options (4087:1346) - @ popup overlay visible
 * 4. Experiment Selected with Mention (4087:1400) - Dataset options popup
 * 5. Mentions Selected (4087:1478) - Selected mention badge shown
 * 6. Experiment Selected (3968:1360) - Blue experiment card header
 * 
 * Pixel-perfect implementation with exact dimensions, colors, and animations
 */

import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MentionEditor from "./MentionEditor";

import useAuth from "../../../hooks/useAuth";
import useDataset from "../../../hooks/useDataset";
import useExperiment from "../../../hooks/useExperiment";
import { useVibe } from "../../../hooks/useVibe";
import { generateSystemPrompt } from "../../../utils/Agent Utils/generateSystemPrompt";

// Format date to YYYYMM format (matches tg-application)
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

// Design Tokens from Figma
const COLORS = {
  // Brand
  primary: '#008AE5',
  primaryBright: '#0F8BFF',
  // Text
  text80: '#333333',
  text75: '#404040',
  text60: '#666666',
  text50: '#808080',
  text40: '#999999',
  // Chips
  chipBlueBg: '#F0F9FF',
  chipBlueText: '#006BB2',
  chipYellowBg: '#FFF5DB',
  chipYellowText: '#8F6900',
  // Surface
  surfacePrimary: '#FFFFFF',
  surfaceTertiary: '#F0F0F0',
  // Stroke
  strokeNeutralGrey: '#F0F0F0',
  strokeNeutralPrimary: '#E6E6E6',
  strokeBlue: 'rgba(0, 138, 229, 0.5)',
  // Misc
  white: '#FFFFFF',
  shadow: 'rgba(51, 51, 51, 0.15)',
  shadowLight: 'rgba(51, 51, 51, 0.11)',
  mentionBadgeBg: '#F0F9FF',
  subtitleBlue: '#CCEBFF',
};

const FONTS = {
  interDisplay: 'Inter Display',
  geistMono: 'Geist Mono',
};

// Component Width (Figma: 335px, but we use full width on mobile)
const COMPONENT_WIDTH = '100%';

// Supported experiment modules for analysis (matches app_ref)
const SUPPORTED_MODULES = [
  'demand-planning',
  'inventory-optimization',
  'price-promotion-optimization',
];

const AnalyzeExperimentInlinePopup = ({ 
  isExpanded, 
  onToggle, 
  onSelectExperiment,
  inputValue,
  onInputChange,
  onSendMessage,
  isSendDisabled,
  isWaitingForAI
}) => {
  const { currentCompany } = useAuth();
  const { experiments_list, fetchExperiments } = useExperiment();
  const { datasets_name_list, datasets, fetchDatasets } = useDataset();
  const { 
    selectedAnalysisExperiment,
    setSelectedAnalysisExperiment,
    clearSelectedAnalysisExperiment,
    setAnalysisSystemPrompt,
    setAnalysisDataPathDict,
    selectedDatasets,
    addDatasetToSelection,
    removeDatasetFromSelection,
  } = useVibe();
  
  // Fetch experiments and datasets on mount
  useEffect(() => {
    console.log('🔄 [AnalyzePopup] Component mounted, fetching experiments and datasets...');
    console.log('   Current experiments_list:', experiments_list?.length || 0);
    console.log('   Current datasets:', datasets_name_list?.length || 0);
    
    // Force fetch to ensure we have the latest data
    fetchExperiments(true); // force refresh
    fetchDatasets(true); // force refresh
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // State for mention overlay popup
  const [showMentionOverlay, setShowMentionOverlay] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('All');
  const [selectedMention, setSelectedMention] = useState(null);
  const [showDatasetOptions, setShowDatasetOptions] = useState(false);
  
  const inputRef = useRef(null);
  
  // Animation values
  const expandAnim = useRef(new Animated.Value(0)).current;
  const mentionOverlayAnim = useRef(new Animated.Value(0)).current;

  // Helper to check if experiment is completed
  // experimentStatus can be:
  // 1. Plain string: "Completed", "Failed", etc.
  // 2. Object: {status: "Completed", ...}
  // 3. JSON string: '{"status": "Completed", ...}' (needs parsing)
  const isExperimentCompleted = (exp) => {
    if (!exp) return false;
    let status = exp.experimentStatus;
    
    // If status is a string that looks like JSON, try to parse it
    if (typeof status === 'string') {
      // Check if it's a plain status string
      if (status === 'Completed') return true;
      
      // Check if it's a JSON string (starts with '{')
      if (status.startsWith('{')) {
        try {
          const parsed = JSON.parse(status);
          return parsed?.status === 'Completed';
        } catch (_e) {
          // Not valid JSON, treat as plain string
          return false;
        }
      }
      return false;
    }
    
    // If it's already an object
    if (typeof status === 'object' && status !== null) {
      return status.status === 'Completed';
    }
    
    return false;
  };

  // Get completed experiments - filter for completed, not in trash, not archived
  // Handle both string and object status formats
  // Also filter by supported modules like app_ref
  const completedExperiments = (experiments_list || []).filter(
    exp => isExperimentCompleted(exp) && 
           !exp.inTrash && 
           !exp.isArchive &&
           SUPPORTED_MODULES.includes(exp.experimentModuleName)
  );
  
  // Debug: Log all experiments and why some might be filtered out
  useEffect(() => {
    if (experiments_list && experiments_list.length > 0) {
      console.log('📊 [AnalyzePopup] Raw experiments_list:', experiments_list.length);
      let passCount = 0;
      let failCount = 0;
      experiments_list.forEach((exp, idx) => {
        const isCompleted = isExperimentCompleted(exp);
        const notInTrash = !exp.inTrash;
        const notArchived = !exp.isArchive;
        const hasValidModule = SUPPORTED_MODULES.includes(exp.experimentModuleName);
        const passes = isCompleted && notInTrash && notArchived && hasValidModule;
        
        if (!passes) {
          failCount++;
          // Only log first 5 failures to avoid spam
          if (failCount <= 5) {
            console.log(`   ❌ Exp ${idx}: "${exp.experimentName}" - completed:${isCompleted}, notTrash:${notInTrash}, notArchive:${notArchived}, validModule:${hasValidModule} (${exp.experimentModuleName})`);
          }
        } else {
          passCount++;
          if (passCount <= 5) {
            console.log(`   ✅ Exp ${idx}: "${exp.experimentName}" - PASSES (${exp.experimentModuleName})`);
          }
        }
      });
      console.log(`📊 [AnalyzePopup] Summary: ${passCount} passed, ${failCount} failed filter`);
    }
  }, [experiments_list]);
  
  console.log('📊 [AnalyzePopup] Completed experiments:', completedExperiments.length, 'Datasets:', (datasets_name_list || []).length);
  console.log('📊 [AnalyzePopup] experiments_list raw:', experiments_list?.length || 0);

  // Transform for suggestions - ensure unique IDs
  const experimentSuggestions = completedExperiments.map((exp, idx) => ({
    id: `exp-${exp.experimentID || idx}`,
    name: exp.experimentName || "Unnamed Experiment",
    type: 'experiment',
    category: 'Experiment',
    data: exp
  }));
  
  // Use Set to deduplicate dataset names, then map with unique index-based IDs
  // Categories: Uploads, Custom, TG Internal (based on dataset type if available)
  const uniqueDatasets = [...new Set(datasets_name_list || [])];
  const datasetSuggestions = uniqueDatasets.map((name, idx) => {
    // Try to find the full dataset object to get category
    const fullDataset = (datasets || []).find(d => d.datasetName === name);
    // Determine category based on dataset type/source
    let category = 'Uploads'; // default
    if (fullDataset) {
      if (fullDataset.datasetType === 'custom' || fullDataset.isCustom) {
        category = 'Custom';
      } else if (fullDataset.datasetType === 'internal' || fullDataset.isTGInternal) {
        category = 'TG Internal';
      }
    }
    return {
      id: `dataset-${idx}-${name}`,
      name: name,
      type: 'dataset',
      category: category,
      data: fullDataset
    };
  });
  
  const suggestions = [...datasetSuggestions, ...experimentSuggestions];

  // Get mention items based on filter - matches Figma design categories
  const getMentionItems = () => {
    const allItems = [...experimentSuggestions, ...datasetSuggestions];
    console.log('📋 [getMentionItems] Filter:', mentionFilter);
    console.log('   experimentSuggestions count:', experimentSuggestions.length);
    console.log('   datasetSuggestions count:', datasetSuggestions.length);
    console.log('   All items total:', allItems.length);
    
    let result = [];
    if (mentionFilter === 'All') {
      result = allItems;
    } else if (mentionFilter === 'Experiments') {
      result = experimentSuggestions;
    } else if (mentionFilter === 'Uploads') {
      result = datasetSuggestions.filter(d => d.category === 'Uploads');
    } else if (mentionFilter === 'Custom') {
      result = datasetSuggestions.filter(d => d.category === 'Custom');
    } else if (mentionFilter === 'TG Internal') {
      result = datasetSuggestions.filter(d => d.category === 'TG Internal');
    } else {
      result = allItems;
    }
    
    console.log('   Returning items:', result.length);
    return result;
  };

  // Dataset options for selected experiment (simulated)
  const datasetOptions = [
    'Forecast Pivot',
    'DOI Details', 
    'Elasticity Detailed View',
    'Metrics Deep Dive',
  ];

  // Animation for expand/collapse
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, expandAnim]);

  // Animation for mention overlay
  useEffect(() => {
    Animated.timing(mentionOverlayAnim, {
      toValue: showMentionOverlay ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMentionOverlay, mentionOverlayAnim]);

  // Handle @ button press - show mention overlay
  const handleAtPress = () => {
    console.log('🔘 [AnalyzePopup] @ button pressed!');
    console.log('   Current showMentionOverlay:', showMentionOverlay);
    console.log('   Experiments available:', experimentSuggestions.length);
    console.log('   Datasets available:', datasetSuggestions.length);
    setShowMentionOverlay(true);
    setSelectedMention(null);
    setShowDatasetOptions(false);
  };

  // Handle mention item selection
  const handleMentionSelect = (item) => {
    console.log('📊 [AnalyzePopup] Mention item selected:', item.name, 'type:', item.type);
    
    if (item.type === 'experiment') {
      // IMPORTANT: Set the experiment context immediately when selecting from @ menu
      // This matches tg-application behavior where selecting an experiment sets the context
      setSelectedMention(item);
      if (item.data) {
        selectExperimentWithContext(item.data);
      }
      // Close the overlay - user can use the experiment directly
      setShowMentionOverlay(false);
      setShowDatasetOptions(false);
    } else if (item.type === 'dataset') {
      // Dataset selected - RESTORED standard selection behavior
      const datasetName = item.name;
      
      // Determine if uploaded based on dataset source (ROBUST CHECK)
      const fullDataset = item.data || (datasets || []).find(d => d.datasetName === datasetName);
      
      const isUploaded = fullDataset?.datasetSourceName === "File Upload" || 
                          fullDataset?.sourceType === 'upload' ||
                          fullDataset?.isUploaded === true;
                          
      console.log('📊 [AnalyzePopup] Adding dataset to selection:', datasetName, 'isUploaded:', isUploaded);
      
      if (currentCompany?.companyName && currentCompany?.companyID) {
        addDatasetToSelection(
          datasetName,
          isUploaded,
          currentCompany.companyName,
          currentCompany.companyID
        );
      } else {
        console.warn('⚠️ [AnalyzePopup] Missing company info for dataset selection');
      }
      
      // Close overlay after single selection (Default behavior)
      setShowMentionOverlay(false);
    }
  };

  // Handle dataset option selection (for experiment)
  const handleDatasetOptionSelect = (option) => {
    // Create the full mention with dataset path
    const fullMention = {
      ...selectedMention,
      datasetPath: option,
      displayName: `@${selectedMention.name}/${option}`,
    };
    setSelectedMention(fullMention);
    setShowMentionOverlay(false);
    setShowDatasetOptions(false);
    
    // Also set the experiment as selected analysis experiment
    if (selectedMention.data) {
      selectExperimentWithContext(selectedMention.data);
    }
  };

  // Clear selected mention
  const handleClearMention = () => {
    setSelectedMention(null);
  };

  // Helper to select experiment and generate system prompt/data path
  const selectExperimentWithContext = (experiment) => {
    if (!experiment) {
      setSelectedAnalysisExperiment(null);
      setAnalysisSystemPrompt(null);
      setAnalysisDataPathDict(null);
      return;
    }

    console.log('📊 [AnalyzePopup] Selecting experiment with context:', experiment.experimentName);
    
    // Build experiment base path - MATCHES tg-application exactly
    const moduleName = experiment.experimentModuleName;
    const run_date = formatYearMonth(experiment.createdAt);
    const experimentBasePath = `accounts/${currentCompany?.companyName}_${currentCompany?.companyID}/data_bucket/${moduleName}/${run_date}/${experiment.experimentID}`;
    
    console.log('📊 [AnalyzePopup] experimentBasePath:', experimentBasePath);

    // Generate systemPrompt and dataPathDict
    const { systemPrompt, dataPathDict } = generateSystemPrompt(
      experimentBasePath,
      moduleName,
      experiment.experimentName
    );

    console.log('📊 [AnalyzePopup] Generated systemPrompt:', systemPrompt?.substring(0, 100));

    // Update Redux state
    setSelectedAnalysisExperiment(experiment);
    setAnalysisSystemPrompt(systemPrompt);
    setAnalysisDataPathDict(dataPathDict);
  };

  // Handle experiment card selection from list
  const handleExperimentSelect = (experiment) => {
    console.log('📊 [AnalyzePopup] Experiment card selected:', experiment.experimentName);
    // Set the selected experiment in global state with context
    selectExperimentWithContext(experiment);
    // Also call the parent callback
    onSelectExperiment(experiment);
  };

  return (
    <View style={{ width: COMPONENT_WIDTH }}>
      {/* Mention Overlay Popup - Positioned ABOVE main component */}
      {showMentionOverlay && (
        <Animated.View 
          style={{
            opacity: mentionOverlayAnim,
            marginBottom: 12,
            backgroundColor: COLORS.surfacePrimary,
            borderWidth: 1,
            borderColor: COLORS.strokeNeutralPrimary,
            borderRadius: 12,
            padding: 16,
            shadowColor: COLORS.text80,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.11,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          {!showDatasetOptions ? (
            // State: mention open options (4087:1346)
            <View style={{ gap: 16 }}>
              {/* Header with Filter Dropdown and Close Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: '#F7F7F7',
                    paddingLeft: 6,
                    paddingRight: 4,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                  onPress={() => {
                    // Cycle through filters - matches Figma design
                    const filters = ['All', 'Experiments', 'Uploads', 'Custom', 'TG Internal'];
                    const idx = filters.indexOf(mentionFilter);
                    setMentionFilter(filters[(idx + 1) % filters.length]);
                  }}
                >
                  <Text style={{
                    fontFamily: FONTS.interDisplay,
                    fontSize: 12,
                    fontWeight: '500',
                    lineHeight: 16,
                    color: COLORS.text75,
                  }}>
                    {mentionFilter}
                  </Text>
                  <MaterialIcons name="expand-more" size={12} color={COLORS.text50} />
                </TouchableOpacity>
                
                {/* Close Button */}
                <TouchableOpacity 
                  onPress={() => setShowMentionOverlay(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="close" size={18} color={COLORS.text50} />
                </TouchableOpacity>
              </View>

              {/* Mention Options List */}
              <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={{ gap: 4 }}>
                  {getMentionItems().length > 0 ? (
                    getMentionItems().map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={`mention-${item.type}-${index}-${item.id}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 8,
                            borderRadius: 4,
                            backgroundColor: COLORS.surfacePrimary,
                          }}
                          onPress={() => handleMentionSelect(item)}
                        >
                          <Text style={{
                            fontFamily: FONTS.interDisplay,
                            fontSize: 12,
                            fontWeight: '500',
                            lineHeight: 16,
                            color: COLORS.text75,
                            flex: 1,
                          }} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={{
                            fontFamily: FONTS.interDisplay,
                            fontSize: 11,
                            fontWeight: '400',
                            lineHeight: 14,
                            color: COLORS.text40,
                            marginLeft: 8,
                          }}>
                            {item.category}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={{
                      fontFamily: FONTS.interDisplay,
                      fontSize: 12,
                      color: COLORS.text40,
                      textAlign: 'center',
                      paddingVertical: 16,
                    }}>
                      No items found
                    </Text>
                  )}
                </View>
              </ScrollView>
              
              {/* Remove selected Datasets Count and Done Button which were here */}
            </View>
          ) : (
            // State: experiment selected with mention popup (4087:1400)
            <View style={{ gap: 20 }}>
              {/* Selected Experiment Badge */}
              <View style={{
                backgroundColor: COLORS.mentionBadgeBg,
                padding: 8,
                borderRadius: 6,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{
                      fontFamily: FONTS.interDisplay,
                      fontSize: 12,
                      fontWeight: '500',
                      lineHeight: 16,
                      color: COLORS.chipBlueText,
                    }}>
                      {selectedMention?.name}
                    </Text>
                    <Text style={{
                      fontFamily: FONTS.interDisplay,
                      fontSize: 11,
                      fontWeight: '400',
                      lineHeight: 14,
                      color: COLORS.chipBlueText,
                    }}>
                      Experiment
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => {
                    setShowDatasetOptions(false);
                    setSelectedMention(null);
                  }}>
                    <MaterialIcons name="edit" size={16} color={COLORS.chipBlueText} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dataset Options */}
              <View style={{ gap: 12 }}>
                <View style={{ paddingHorizontal: 4 }}>
                  <Text style={{
                    fontFamily: FONTS.interDisplay,
                    fontSize: 12,
                    fontWeight: '500',
                    lineHeight: 16,
                    color: COLORS.text50,
                  }}>
                    Select options
                  </Text>
                </View>
                <View style={{ gap: 4 }}>
                  {datasetOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        backgroundColor: COLORS.surfacePrimary,
                      }}
                      onPress={() => handleDatasetOptionSelect(option)}
                    >
                      <Text style={{
                        fontFamily: FONTS.interDisplay,
                        fontSize: 12,
                        fontWeight: '500',
                        lineHeight: 16,
                        color: COLORS.text75,
                      }}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {/* Main Component Container */}
      <View style={{
        width: '100%',
        borderRadius: 12,
        overflow: 'visible',
        shadowColor: COLORS.text80,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 5,
      }}>
        {/* Blue Header - Logic: 
            1. If Expanded: Show simple header (user is selecting)
            2. If Selected Experiment exists AND !Expanded: Show detailed Experiment Card (Edit mode)
            3. Default: Show "Analyze experiment" prompt
        */}
        {selectedAnalysisExperiment && !isExpanded ? (
          // === SELECTED EXPERIMENT STATE (Blue Card) ===
          <View style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            gap: 12,
          }}>
            {/* Experiment Name Row with Edit + Close */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontFamily: FONTS.interDisplay,
                  fontSize: 15,
                  fontWeight: '600',
                  lineHeight: 24,
                  color: COLORS.white,
                }}>
                  {selectedAnalysisExperiment.experimentName}
                </Text>
              </View>
              {/* Edit Button - Expands the list */}
              <TouchableOpacity 
                onPress={onToggle} 
                style={{ padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="edit" size={16} color={COLORS.white} />
              </TouchableOpacity>
              {/* Close Button - Clears selection */}
              <TouchableOpacity 
                onPress={() => clearSelectedAnalysisExperiment()} 
                style={{ padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="close" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            {/* Experiment Tags */}
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              {selectedAnalysisExperiment.experimentModuleName && (
                <View style={{ backgroundColor: '#F0F9FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                  <Text style={{ fontFamily: FONTS.geistMono, fontSize: 11, fontWeight: '500', lineHeight: 16, color: '#006BB2' }}>
                    {selectedAnalysisExperiment.experimentModuleName}
                  </Text>
                </View>
              )}
              {selectedAnalysisExperiment.experimentRegion && (
                <View style={{ backgroundColor: '#FFF5DB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                  <Text style={{ fontFamily: FONTS.geistMono, fontSize: 11, fontWeight: '500', lineHeight: 14, color: '#8F6900' }}>
                    {selectedAnalysisExperiment.experimentRegion}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          // === DEFAULT / EXPANDED STATE ===
          <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.8}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 16,
              paddingVertical: isExpanded ? 12 : 8,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            {isExpanded ? (
              // Expanded header with subtitle
              <View style={{ gap: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name="lightbulb" size={14} color={COLORS.white} />
                  <Text style={{
                    flex: 1,
                    fontFamily: FONTS.interDisplay,
                    fontSize: 15,
                    fontWeight: '500',
                    lineHeight: 24,
                    color: COLORS.white,
                    textAlign: 'center',
                  }}>
                    Analyze experiment
                  </Text>
                  <MaterialIcons name="expand-less" size={14} color={COLORS.white} />
                </View>
                <View style={{ paddingHorizontal: 18, paddingVertical: 4 }}>
                  <Text style={{
                    fontFamily: FONTS.interDisplay,
                    fontSize: 12,
                    fontWeight: '500',
                    lineHeight: 16,
                    color: COLORS.subtitleBlue,
                  }}>
                    Select from the list of experiments
                  </Text>
                </View>
              </View>
            ) : (
              // Collapsed header
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="lightbulb" size={14} color={COLORS.white} />
                <Text style={{
                  flex: 1,
                  fontFamily: FONTS.interDisplay,
                  fontSize: 15,
                  fontWeight: '500',
                  lineHeight: 24,
                  color: COLORS.white,
                  textAlign: 'center',
                }}>
                  Analyze experiment
                </Text>
                <MaterialIcons name="expand-more" size={14} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* White Content Area */}
        <View style={{
          backgroundColor: COLORS.surfacePrimary,
          borderWidth: 1.5,
          borderTopWidth: 0,
          borderColor: COLORS.strokeBlue,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}>
          {/* Experiment List - Shows when expanded (3968:1305) */}
          {isExpanded && (
            <Animated.View style={{
              opacity: expandAnim,
              padding: 16,
              gap: 16,
            }}>
              {completedExperiments.length > 0 ? (
                <ScrollView 
                  style={{ maxHeight: 280 }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  <View style={{ gap: 16 }}>
                    {completedExperiments.map((experiment, index) => (
                      <TouchableOpacity
                        key={`exp-card-${experiment.experimentID || index}-${index}`}
                        onPress={() => handleExperimentSelect(experiment)}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: COLORS.surfacePrimary,
                          borderWidth: 1,
                          borderColor: COLORS.strokeNeutralGrey,
                          borderRadius: 10,
                          padding: 12,
                          gap: 16,
                        }}
                      >
                        {/* Experiment Header - Name + Info Icon */}
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'space-between' 
                        }}>
                          <Text style={{
                            fontFamily: FONTS.interDisplay,
                            fontSize: 13,
                            fontWeight: '600',
                            lineHeight: 20,
                            color: COLORS.text80,
                            flex: 1,
                            paddingRight: 8,
                          }} numberOfLines={1}>
                            {experiment.experimentName || 'Unnamed Experiment'}
                          </Text>
                          <MaterialIcons name="info-outline" size={12} color={COLORS.text50} />
                        </View>

                        {/* Experiment Tags */}
                        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                          {experiment.experimentModuleName && (
                            <View style={{ 
                              backgroundColor: COLORS.chipBlueBg, 
                              paddingHorizontal: 4, 
                              paddingVertical: 4, 
                              borderRadius: 4 
                            }}>
                              <Text style={{ 
                                fontFamily: FONTS.geistMono, 
                                fontSize: 11, 
                                fontWeight: '500', 
                                lineHeight: 14, 
                                color: COLORS.chipBlueText 
                              }}>
                                {experiment.experimentModuleName}
                              </Text>
                            </View>
                          )}
                          {experiment.experimentRegion && (
                            <View style={{ 
                              backgroundColor: COLORS.chipYellowBg, 
                              paddingHorizontal: 8, 
                              paddingVertical: 4, 
                              borderRadius: 4 
                            }}>
                              <Text style={{ 
                                fontFamily: FONTS.geistMono, 
                                fontSize: 11, 
                                fontWeight: '500', 
                                lineHeight: 14, 
                                color: COLORS.chipYellowText 
                              }}>
                                {experiment.experimentRegion}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <Text style={{
                  fontFamily: FONTS.interDisplay,
                  fontSize: 14,
                  color: COLORS.text40,
                  textAlign: 'center',
                  paddingVertical: 20,
                }}>
                  No completed experiments available
                </Text>
              )}
            </Animated.View>
          )}

          {/* Chat Input Section - Always visible when collapsed */}
          {!isExpanded && (
            <View style={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 12,
              gap: 28,
            }}>
              {/* Selected Mention Badge (4087:1478) */}
              {selectedMention && (
                <View style={{
                  backgroundColor: COLORS.mentionBadgeBg,
                  padding: 8,
                  borderRadius: 4,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontFamily: FONTS.geistMono,
                        fontSize: 11,
                        fontWeight: '500',
                        lineHeight: 16,
                        color: COLORS.chipBlueText,
                      }}>
                        {selectedMention.displayName || `@${selectedMention.name}`}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleClearMention}>
                      <MaterialIcons name="close" size={16} color={COLORS.chipBlueText} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Selected Datasets Badges */}
              {/* Selected Datasets Badges (Restored) */}
              {Object.keys(selectedDatasets || {}).length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {Object.keys(selectedDatasets).map((datasetName) => (
                    <View 
                      key={datasetName}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: COLORS.chipBlueBg,
                        paddingLeft: 8,
                        paddingRight: 4,
                        paddingVertical: 4,
                        borderRadius: 4,
                        gap: 4,
                      }}
                    >
                      <Text style={{
                        fontFamily: FONTS.geistMono,
                        fontSize: 11,
                        fontWeight: '500',
                        color: COLORS.chipBlueText,
                      }}>
                        @{datasetName.length > 15 ? datasetName.substring(0, 15) + '...' : datasetName}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => removeDatasetFromSelection(datasetName)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <MaterialIcons name="close" size={14} color={COLORS.chipBlueText} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Text Input */}
              <View style={{ minHeight: 24 }}>
                <MentionEditor
                  ref={inputRef}
                  value={inputValue}
                  onChange={onInputChange}
                  onSend={onSendMessage}
                  placeholder="Ask anything..."
                  placeholderColor={COLORS.text40}
                  editable={!isWaitingForAI}
                  suggestions={suggestions}
                  onMentionSelect={(item) => {
                    if (item.type === 'experiment') {
                      setSelectedMention(item);
                    }
                  }}
                  style={{
                    fontFamily: FONTS.interDisplay,
                    fontSize: 16,
                    fontWeight: '500',
                    lineHeight: 24,
                    color: COLORS.text80,
                  }}
                />
              </View>

              {/* Action Buttons Row */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Left: @ and Attachment icons */}
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  {/* @ Button */}
                  <TouchableOpacity
                    onPress={handleAtPress}
                    disabled={isWaitingForAI}
                    style={{
                      padding: 4,
                      borderRadius: 4,
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons 
                      name="alternate-email" 
                      size={18} 
                      color={COLORS.text50} 
                    />
                  </TouchableOpacity>
                  
                  {/* Attachment Button */}
                  <TouchableOpacity
                    disabled={isWaitingForAI}
                    style={{
                      padding: 4,
                      borderRadius: 4,
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons 
                      name="attach-file" 
                      size={18} 
                      color={COLORS.text50} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Right: Mic and Send buttons */}
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  {/* Mic button */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: COLORS.surfaceTertiary,
                      padding: 6,
                      borderRadius: 16,
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="mic" size={18} color={COLORS.text60} />
                  </TouchableOpacity>

                  {/* Send button */}
                  <TouchableOpacity
                    onPress={() => {
                      console.log('🔘 [AnalyzePopup] Send button pressed');
                      console.log('   inputValue:', inputValue?.substring(0, 30) || 'EMPTY');
                      console.log('   isSendDisabled:', isSendDisabled);
                      console.log('   isWaitingForAI:', isWaitingForAI);
                      if (onSendMessage) {
                        console.log('   Calling onSendMessage...');
                        onSendMessage();
                      } else {
                        console.warn('   ⚠️ onSendMessage is not defined!');
                      }
                    }}
                    disabled={isSendDisabled}
                    style={{
                      backgroundColor: COLORS.primaryBright,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 20,
                      shadowColor: '#001F3B',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                      opacity: isSendDisabled ? 0.5 : 1,
                    }}
                    activeOpacity={0.7}
                  >
                    {isWaitingForAI ? (
                      <ActivityIndicator size={18} color={COLORS.white} />
                    ) : (
                      <MaterialIcons 
                        name="arrow-forward" 
                        size={18} 
                        color={COLORS.white}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default AnalyzeExperimentInlinePopup;
