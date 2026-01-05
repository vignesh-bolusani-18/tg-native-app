// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\actions\DataUploadSection.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

// Hooks
import useAuth from "../../../hooks/useAuth";
import useExperiment from "../../../hooks/useExperiment";
import { useVibe } from "../../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../../hooks/useWorkflowWebSocket";
// import useDataset from "../../../hooks/useDataset"; // TODO: Create this hook
import { uploadCSVToS3 } from "../../../utils/s3Utils";
// import { generateMetadata as generateMetadataOld } from "../../../utils/generateMetadata"; // TODO: Create
// import { generateMetadata as generateMetadataNew } from "../../../utils/generateMetadataConfigurable"; // TODO: Create
// import { oldFlowModules } from "../../../utils/oldFlowModules"; // Unused for now
// import useModule from "../../../hooks/useModule"; // Unused for now

// Components (We will need placeholders if not built)
const SampleDataLibrary = () => <Text className="text-gray-400 p-4 text-center">Sample Data Library (Coming Soon)</Text>; 

const DataUploadSection = ({ uploadData, messageId }) => {
  const currentDataTag = Object.keys(uploadData.data)[0];
  const { sendQuery } = useWorkflowWebSocket();
  const {
    setProcessingStepText,
    setIsWaitingForAI,
    editMessage,
    currentConversation,
    setDataUploaded,
    creditScore,
  } = useVibe();
  
  // const { ui_config } = useModule(); // Unused for now
  const { uploadMetadataToS3 } = useExperiment();
  // const { addDataset } = useDataset(); // TODO: Create useDataset hook
  const addDataset = () => {}; // Placeholder
  const { userInfo, currentCompany } = useAuth();

  const dataUploaded = currentConversation.dataUploaded;
  const isDataUploaded = uploadData?.next_step?.user === "uploaded_data";

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!dataUploaded);
  const tags = uploadData.mandatory_data_tags || [];
  // const [tags, setTags] = useState(uploadData.mandatory_data_tags || []);

  useEffect(() => {
    setIsExpanded(!dataUploaded);
  }, [dataUploaded]);

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const maxSize = 100 * 1024 * 1024; // 100MB

      if (!currentCompany.unlimited_data_upload && file.size > maxSize) {
        Alert.alert("Error", "File size exceeds limit.");
        return;
      }

      setSelectedFile(file);
    } catch (err) {
      console.error("Picker Error:", err);
    }
  };

  const generateMetadata = (fileName) => {
    // Simplified metadata gen for mobile (skipping heavy preview parsing for now)
    const dummyPreview = {}; 
    // TODO: Import and use actual metadata generators
    const metadata = {
      columns: [],
      preview: dummyPreview,
      fileName,
      tags,
      source: "File Upload"
    };
    return metadata;
    // return oldFlowModules.includes(uploadData.determined_module)
    //   ? generateMetadataOld(dummyPreview, tags, fileName, "File Upload", "", {})
    //   : generateMetadataNew(
    //       dummyPreview,
    //       tags,
    //       fileName,
    //       "File Upload",
    //       "",
    //       JSON.parse(JSON.stringify(ui_config?.datasets?.dataset_info || {}))
    //     );
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProcessingStepText("Uploading data...");
    setIsWaitingForAI(true);

    try {
      const fileName = selectedFile.name.replace(".csv", "");
      // Note: React Native fetch expects 'uri' for file uploads usually
      // You might need to adjust uploadCSVToS3 util to handle { uri, name, type } object
      
      const metadata = generateMetadata(fileName);
      const metaDataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${fileName}.json`;
      const uploadCSVPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/uploads/${fileName}.csv`;

      await uploadMetadataToS3({ metaData: metadata, path: metaDataPath });
      
      // Pass the file object directly (RN fetch handles uri)
      await uploadCSVToS3(uploadCSVPath, selectedFile);

      const datasetInfo = {
        datasetName: fileName,
        datasetTag: tags[0],
        metaDataPath: metaDataPath,
        sourceName: "File Upload",
        dataConnectionName: "",
      };

      const response = await addDataset(userInfo, currentCompany, datasetInfo);

      if (response) {
        setProcessingStepText("Data uploaded successfully");
        
        if (messageId) {
          editMessage(messageId, {
            langgraphState: {
              ...uploadData,
              workflow_status: { ...uploadData.workflow_status, data_loaded: true },
              next_step: { user: "uploaded_data", ai: "tags_generator" },
              data: {
                ...uploadData.data,
                [currentDataTag]: {
                  ...uploadData.data[currentDataTag],
                  sample_data_path: uploadCSVPath,
                  metadata_path: metaDataPath,
                  dataset_info: datasetInfo,
                },
              },
            },
          });
        }

        const uploadState = {
          ...uploadData,
          workflow_status: { ...uploadData.workflow_status, data_loaded: true },
          next_step: { user: "", ai: "tags_generator" },
          data: {
            ...uploadData.data,
            [currentDataTag]: {
              ...uploadData.data[currentDataTag],
              sample_data_path: uploadCSVPath,
              metadata_path: metaDataPath,
              dataset_info: datasetInfo,
            },
          },
        };

        setIsWaitingForAI(true);
        setProcessingStepText("Fetching Sample data...");
        setDataUploaded(true);
        sendQuery({ query: "", updated_state: uploadState });
        
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload Failed", "Please try again.");
      setProcessingStepText("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="mt-4 bg-white border border-gray-200 rounded-xl border-l-4 border-l-green-500 shadow-sm overflow-hidden">
      {/* Header / Toggle */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between p-3 bg-gray-50"
      >
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name={isDataUploaded ? "check-circle" : "cloud-upload"}
            size={20}
            color={isDataUploaded ? "#10b981" : "#f59e0b"}
          />
          <Text className="text-sm font-semibold text-gray-700">
            {isDataUploaded ? "Data Uploaded" : "Data Upload Required"}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#10b981"
        />
      </TouchableOpacity>

      {/* Content */}
      {isExpanded && (
        <View className="p-4">
          {isDataUploaded ? (
            <View className="bg-green-50 p-3 rounded-lg border border-green-200">
              <Text className="text-xs font-semibold text-green-700 mb-1">Dataset Information</Text>
              <Text className="text-xs text-gray-700">Name: {uploadData?.data?.[currentDataTag]?.dataset_info?.datasetName}</Text>
              <Text className="text-xs text-gray-700">Tag: {uploadData?.data?.[currentDataTag]?.dataset_info?.datasetTag}</Text>
            </View>
          ) : (
            <View>
              <Text className="text-xs text-gray-500 mb-4 leading-5">
                Please upload a CSV file containing the required data to continue.
              </Text>

              {/* Upload Box */}
              {!selectedFile ? (
                <TouchableOpacity
                  onPress={handleFileSelect}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center bg-gray-50 mb-4"
                >
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
                    <MaterialCommunityIcons name="cloud-upload" size={24} color="#6b7280" />
                  </View>
                  <Text className="text-sm font-semibold text-gray-700">Select CSV File</Text>
                  <Text className="text-xs text-gray-400 mt-1">Max 100MB</Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1">
                    <MaterialCommunityIcons name="file-document-outline" size={24} color="#3b82f6" />
                    <Text className="text-sm text-gray-800 flex-1" numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <MaterialCommunityIcons name="close" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={handleUpload}
                disabled={!selectedFile || isUploading || creditScore <= 0}
                className={`w-full py-3 rounded-lg items-center ${
                  !selectedFile || isUploading || creditScore <= 0 ? "bg-gray-300" : "bg-blue-600"
                }`}
              >
                <Text className="text-white font-semibold">
                  {isUploading ? "Uploading..." : "Upload Data"}
                </Text>
              </TouchableOpacity>
              
              <View className="mt-4">
                 <SampleDataLibrary />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default DataUploadSection;