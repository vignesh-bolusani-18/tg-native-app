/**
 * DatasetSelector - Component to select datasets via @ mention
 * Allows users to tag datasets in their chat messages
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
import useDataset from "../../../hooks/useDataset";
import { useVibe } from "../../../hooks/useVibe";

const DatasetSelector = ({ visible, onClose, onSelectDataset }) => {
  const { datasets, loading, fetchDatasets } = useDataset();
  const { currentCompany } = useAuth();
  const { selectedDatasets, addDatasetToSelection, removeDatasetFromSelection } = useVibe();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDatasets, setFilteredDatasets] = useState([]);

  // Fetch datasets on mount
  useEffect(() => {
    if (visible) {
      fetchDatasets();
    }
  }, [visible, fetchDatasets]);

  // Filter datasets based on search
  useEffect(() => {
    if (!datasets || datasets.length === 0) {
      setFilteredDatasets([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredDatasets(datasets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = datasets.filter(
      (dataset) =>
        (dataset.datasetName || dataset.name || '').toLowerCase().includes(query)
    );
    setFilteredDatasets(filtered);
  }, [searchQuery, datasets]);

  const handleSelectDataset = (dataset) => {
    const datasetName = dataset.datasetName || dataset.name;
    const isSelected = selectedDatasets && selectedDatasets[datasetName];
    
    if (isSelected) {
      removeDatasetFromSelection(datasetName);
    } else {
      // ⭐ MATCHES tg-application: Pass isUploaded based on datasetSourceName
      const isUploaded = dataset.datasetSourceName === "File Upload";
      addDatasetToSelection(
        datasetName, 
        isUploaded, 
        currentCompany?.companyName || '', 
        currentCompany?.companyID || ''
      );
    }
    
    if (onSelectDataset) {
      onSelectDataset(dataset, !isSelected);
    }
  };

  const handleDone = () => {
    onClose();
  };

  const getDatasetIcon = (dataset) => {
    const name = (dataset.datasetName || dataset.name || '').toLowerCase();
    if (name.includes('sales')) return 'chart-line';
    if (name.includes('inventory')) return 'package-variant-closed';
    if (name.includes('customer')) return 'account-group';
    if (name.includes('product')) return 'tag-multiple';
    if (name.includes('titanic')) return 'ferry';
    return 'database';
  };

  const getDatasetColor = (dataset) => {
    const name = (dataset.datasetName || dataset.name || '').toLowerCase();
    if (name.includes('sales')) return '#3B82F6';
    if (name.includes('inventory')) return '#10B981';
    if (name.includes('customer')) return '#8B5CF6';
    if (name.includes('product')) return '#F59E0B';
    if (name.includes('titanic')) return '#06B6D4';
    return '#6B7280';
  };

  const renderDatasetItem = ({ item }) => {
    const datasetName = item.datasetName || item.name;
    const isSelected = selectedDatasets && selectedDatasets[datasetName];
    const iconColor = getDatasetColor(item);
    
    return (
      <TouchableOpacity
        onPress={() => handleSelectDataset(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        {/* Dataset Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: `${iconColor}20`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons
            name={getDatasetIcon(item)}
            size={22}
            color={iconColor}
          />
        </View>

        {/* Dataset Info */}
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
            {datasetName}
          </Text>
          {item.path && (
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
              }}
              numberOfLines={1}
            >
              {item.path}
            </Text>
          )}
        </View>

        {/* Selection Checkbox */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: isSelected ? '#3B82F6' : '#D1D5DB',
            backgroundColor: isSelected ? '#3B82F6' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && (
            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const selectedCount = Object.keys(selectedDatasets || {}).length;

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
                name="database"
                size={24}
                color="#3B82F6"
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2937" }}>
                Select Datasets
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
                placeholder="Search datasets..."
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

          {/* Selected Count Badge */}
          {selectedCount > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: "#EFF6FF",
                marginHorizontal: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color="#3B82F6"
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: 13, color: "#1E40AF", fontWeight: "500" }}>
                {selectedCount} dataset{selectedCount > 1 ? 's' : ''} selected
              </Text>
            </View>
          )}

          {/* Datasets List */}
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>Loading datasets...</Text>
            </View>
          ) : filteredDatasets.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
              <MaterialCommunityIcons name="database-off-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontSize: 15, color: "#6B7280", marginTop: 12, textAlign: "center" }}>
                {searchQuery ? "No datasets match your search" : "No datasets available"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredDatasets}
              keyExtractor={(item, index) => item.id || item.datasetName || item.name || index.toString()}
              renderItem={renderDatasetItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          {/* Done Button */}
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
            <TouchableOpacity
              onPress={handleDone}
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DatasetSelector;
