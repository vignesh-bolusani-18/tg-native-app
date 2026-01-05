// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\actions\SampleDataSection.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const SampleDataSection = ({ sampleData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sampleData) return null;
  const currentDataTag = Object.keys(sampleData.data)[0];
  const dataInfo = sampleData?.data?.[currentDataTag];
  const sampleDataRows = dataInfo?.sample_data?.data || [];
  const columns = dataInfo?.sample_data?.columns || [];
  const dtypes = dataInfo?.sample_data?.dtypes || {};

  return (
    <View className="mt-4 bg-white border border-gray-200 rounded-lg border-l-4 border-l-green-500 overflow-hidden">
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between p-3 bg-gray-50"
      >
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons name="database" size={18} color="#10b981" />
          <Text className="text-sm font-semibold text-gray-700">Sample Data</Text>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#10b981"
        />
      </TouchableOpacity>

      {/* Content */}
      {isExpanded && (
        <View className="p-3">
          {/* Dataset Info */}
          {dataInfo?.dataset_info && (
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Info</Text>
              <View className="flex-row flex-wrap gap-2">
                <View className="bg-gray-100 px-2 py-1 rounded">
                  <Text className="text-xs text-gray-700">Name: {dataInfo.dataset_info.datasetName}</Text>
                </View>
                <View className="bg-gray-100 px-2 py-1 rounded">
                  <Text className="text-xs text-gray-700">Source: {dataInfo.dataset_info.sourceName}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Columns */}
          {columns.length > 0 && (
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Columns</Text>
              <View className="flex-row flex-wrap gap-1">
                {columns.map((col, idx) => (
                  <View key={idx} className="border border-gray-200 px-2 py-0.5 rounded">
                    <Text className="text-[10px] text-gray-600">
                      {col} ({dtypes[col] || "?"})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Data Preview Table */}
          {sampleDataRows.length > 0 && (
            <View>
              <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">Preview (First 5 Rows)</Text>
              <ScrollView horizontal className="bg-gray-50 border border-gray-200 rounded p-2">
                <View>
                  {/* Table Header */}
                  <View className="flex-row border-b border-gray-300 pb-1 mb-1">
                    {columns.map((col, idx) => (
                      <Text key={idx} className="w-24 text-xs font-bold text-gray-700 text-center mx-1" numberOfLines={1}>
                        {col}
                      </Text>
                    ))}
                  </View>
                  
                  {/* Table Rows */}
                  {sampleDataRows.slice(0, 5).map((row, rIdx) => (
                    <View key={rIdx} className="flex-row border-b border-gray-100 py-1">
                      {Object.values(row).map((val, cIdx) => (
                        <Text key={cIdx} className="w-24 text-xs text-gray-600 text-center mx-1" numberOfLines={1}>
                          {String(val)}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SampleDataSection;