/**
 * ExperimentDropdown - Figma Design 3968:1307
 * Collapsible experiment selector that appears above the chat input
 */

import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import useExperiment from "../../../hooks/useExperiment";
import { useVibe } from "../../../hooks/useVibe";

const ExperimentDropdown = ({ isExpanded, onToggle, onSelectExperiment }) => {
  const { experiments_list } = useExperiment();
  const { selectedAnalysisExperiment } = useVibe();

  // Filter completed experiments
  const completedExperiments = (experiments_list || []).filter(
    exp => exp.experimentStatus === "Completed" && !exp.inTrash && !exp.isArchive
  );

  return (
    <View style={{
      width: '100%',
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#333333',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 5,
    }}>
      {/* Blue Header - "Analyze experiment" */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={{
          backgroundColor: '#008AE5',
          paddingHorizontal: 16,
          paddingVertical: isExpanded ? 12 : 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <MaterialIcons name="lightbulb" size={14} color="#FFFFFF" />
        <Text style={{
          flex: 1,
          fontFamily: 'Inter Display',
          fontSize: 15,
          fontWeight: '500',
          lineHeight: 24,
          color: '#FFFFFF',
          textAlign: 'center',
        }}>
          Analyze experiment
        </Text>
        <MaterialIcons 
          name={isExpanded ? "expand-less" : "expand-more"} 
          size={14} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>

      {/* Expanded Content - Experiment List */}
      {isExpanded && (
        <View style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1.5,
          borderTopWidth: 0,
          borderColor: 'rgba(0, 138, 229, 0.5)',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}>
          {completedExperiments.length > 0 ? (
            <ScrollView 
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: 16 }}>
                {completedExperiments.map((experiment, index) => (
                  <TouchableOpacity
                    key={experiment.experimentID || index}
                    onPress={() => {
                      onSelectExperiment(experiment);
                      onToggle(); // Close dropdown after selection
                    }}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#F0F0F0',
                      borderRadius: 10,
                      padding: 12,
                      gap: 16,
                    }}
                  >
                    {/* Experiment Name with Info Icon */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <Text style={{
                        fontFamily: 'Inter Display',
                        fontSize: 13,
                        fontWeight: '600',
                        lineHeight: 20,
                        color: '#333333',
                        flex: 1,
                      }} numberOfLines={1}>
                        {experiment.experimentName || 'Unnamed Experiment'}
                      </Text>
                      <MaterialIcons name="info-outline" size={12} color="#808080" />
                    </View>

                    {/* Tags */}
                    <View style={{
                      flexDirection: 'row',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}>
                      {/* Module Tag */}
                      {experiment.experimentModuleName && (
                        <View style={{
                          backgroundColor: '#F0F9FF',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                        }}>
                          <Text style={{
                            fontFamily: 'Geist Mono',
                            fontSize: 11,
                            fontWeight: '500',
                            lineHeight: 14,
                            color: '#006BB2',
                          }}>
                            {experiment.experimentModuleName.replace(/-/g, ' ')}
                          </Text>
                        </View>
                      )}
                      
                      {/* Region/Company Tag */}
                      {experiment.region && (
                        <View style={{
                          backgroundColor: '#FFF5DB',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                        }}>
                          <Text style={{
                            fontFamily: 'Geist Mono',
                            fontSize: 11,
                            fontWeight: '500',
                            lineHeight: 14,
                            color: '#8F6900',
                          }}>
                            {experiment.region}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={{
              paddingVertical: 20,
              alignItems: 'center',
            }}>
              <Text style={{
                fontFamily: 'Inter Display',
                fontSize: 12,
                fontWeight: '500',
                lineHeight: 16,
                color: '#CCEBFF',
                textAlign: 'center',
              }}>
                No completed experiments available
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Selected Experiment Display */}
      {!isExpanded && selectedAnalysisExperiment && (
        <View style={{
          backgroundColor: '#008AE5',
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: 'Inter Display',
                fontSize: 15,
                fontWeight: '600',
                lineHeight: 24,
                color: '#FFFFFF',
              }} numberOfLines={1}>
                {selectedAnalysisExperiment.experimentName}
              </Text>
            </View>
            <TouchableOpacity
              style={{ padding: 4 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSelectExperiment(null)}
              style={{ padding: 4 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            {selectedAnalysisExperiment.experimentModuleName && (
              <View style={{
                backgroundColor: '#F0F9FF',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}>
                <Text style={{
                  fontFamily: 'Geist Mono',
                  fontSize: 11,
                  fontWeight: '500',
                  lineHeight: 16,
                  color: '#006BB2',
                }}>
                  {selectedAnalysisExperiment.experimentModuleName.replace(/-/g, ' ')}
                </Text>
              </View>
            )}
            
            {selectedAnalysisExperiment.region && (
              <View style={{
                backgroundColor: '#FFF5DB',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}>
                <Text style={{
                  fontFamily: 'Geist Mono',
                  fontSize: 11,
                  fontWeight: '500',
                  lineHeight: 14,
                  color: '#8F6900',
                }}>
                  {selectedAnalysisExperiment.region}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default ExperimentDropdown;
