// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\actions\DataUploadSection.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Hooks
import useAuth from "../../../hooks/useAuth";
import useExperiment from "../../../hooks/useExperiment";
import { useVibe } from "../../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../../hooks/useWorkflowWebSocket";

const DataUploadSection = ({ uploadData, messageId }) => {
  const currentDataTag = uploadData?.data ? Object.keys(uploadData.data)[0] : 'base';
  const { sendQuery } = useWorkflowWebSocket();
  const {
    setProcessingStepText,
    setIsWaitingForAI,
    currentConversation,
    setDataUploaded,
  } = useVibe();
  
  const { uploadMetadataToS3 } = useExperiment();
  const { currentCompany } = useAuth();

  const dataUploaded = currentConversation?.dataUploaded;
  const isDataUploaded = uploadData?.next_step?.user === "uploaded_data";

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!dataUploaded);
  const tags = uploadData?.mandatory_data_tags || [];

  useEffect(() => {
    setIsExpanded(!dataUploaded);
  }, [dataUploaded]);

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const maxSize = 100 * 1024 * 1024; // 100MB

      if (!currentCompany?.unlimited_data_upload && file.size > maxSize) {
        Alert.alert("Error", "File size exceeds 100MB limit.");
        return;
      }

      setSelectedFile(file);
    } catch (err) {
      console.error("Picker Error:", err);
      Alert.alert("Error", "Failed to select file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    console.log('📤 [DataUpload] Starting upload...');
    console.log('   File:', selectedFile.name);
    console.log('   Size:', selectedFile.size);
    console.log('   Company:', currentCompany?.companyName);
    
    setIsUploading(true);
    setProcessingStepText("Uploading data...");
    setIsWaitingForAI(true);

    try {
      const fileName = selectedFile.name.replace(".csv", "");
      const companyPath = `accounts/${currentCompany?.companyName || 'default'}_${currentCompany?.companyID || 'default'}`;
      const metaDataPath = `${companyPath}/customer_data/data_library/metadata/${fileName}.json`;
      const uploadCSVPath = `${companyPath}/customer_data/data_library/uploads/${fileName}.csv`;

      console.log('📁 [DataUpload] Paths generated:');
      console.log('   Metadata:', metaDataPath);
      console.log('   CSV:', uploadCSVPath);

      // Create metadata
      const metadata = {
        columns: [],
        preview: {},
        fileName,
        tags,
        source: "File Upload"
      };

      // Try to upload metadata (may fail if endpoint doesn't exist - that's OK)
      console.log('📊 [DataUpload] Uploading metadata...');
      try {
        await uploadMetadataToS3({ metaData: metadata, path: metaDataPath });
        console.log('✅ [DataUpload] Metadata uploaded successfully');
      } catch (metaErr) {
        console.warn('⚠️ [DataUpload] Metadata upload skipped:', metaErr.message);
      }

      const datasetInfo = {
        datasetName: fileName,
        datasetTag: tags[0] || 'base',
        metaDataPath: metaDataPath,
        sourceName: "File Upload",
        dataConnectionName: "",
      };

      console.log('📋 [DataUpload] Dataset info created:', datasetInfo);
      setProcessingStepText("Data uploaded successfully");
      
      // ⚠️ DO NOT call editMessage - it triggers massive state update
      // The sendQuery below will handle state propagation
      console.log('⚡ [DataUpload] Skipping editMessage to prevent reload');

      const uploadState = {
        ...uploadData,
        workflow_status: { ...uploadData?.workflow_status, data_loaded: true },
        next_step: { user: "", ai: "tags_generator" },
        data: {
          ...uploadData?.data,
          [currentDataTag]: {
            ...uploadData?.data?.[currentDataTag],
            sample_data_path: uploadCSVPath,
            metadata_path: metaDataPath,
            dataset_info: datasetInfo,
          },
        },
      };

      console.log('🔄 [DataUpload] Updating workflow state...');
      setIsWaitingForAI(true);
      setProcessingStepText("Processing data...");
      setDataUploaded(true);
      
      console.log('📨 [DataUpload] Sending query with updated state');
      console.log('   Next step:', uploadState.next_step);
      
      // ⭐ Send immediately - no delay needed since we removed editMessage
      console.log('📤 [DataUpload] Sending query to backend...');
      sendQuery({ query: "", updated_state: uploadState });
      
      setSelectedFile(null);
      console.log('✅ [DataUpload] Upload completed - workflow will progress automatically');
    } catch (err) {
      console.error('❌ [DataUpload] Upload error:', err);
      Alert.alert("Upload Failed", err.message || "Please try again.");
      setProcessingStepText("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header / Toggle */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name={isDataUploaded ? "check-circle" : "cloud-upload"}
            size={20}
            color={isDataUploaded ? "#10b981" : "#f59e0b"}
          />
          <Text style={styles.headerText}>
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
        <View style={styles.content}>
          {isDataUploaded ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Dataset Information</Text>
              <Text style={styles.successText}>
                Name: {uploadData?.data?.[currentDataTag]?.dataset_info?.datasetName || 'Uploaded'}
              </Text>
              <Text style={styles.successText}>
                Tag: {uploadData?.data?.[currentDataTag]?.dataset_info?.datasetTag || currentDataTag}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.description}>
                Please upload a CSV file containing the required data to continue.
              </Text>

              {/* Upload Box */}
              {!selectedFile ? (
                <TouchableOpacity onPress={handleFileSelect} style={styles.uploadBox}>
                  <View style={styles.uploadIcon}>
                    <MaterialCommunityIcons name="cloud-upload" size={24} color="#6b7280" />
                  </View>
                  <Text style={styles.uploadTitle}>Select CSV File</Text>
                  <Text style={styles.uploadSubtitle}>Max 100MB</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.fileBox}>
                  <View style={styles.fileInfo}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color="#3b82f6" />
                    <Text style={styles.fileName} numberOfLines={1}>
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
                disabled={!selectedFile || isUploading}
                style={[
                  styles.uploadButton,
                  (!selectedFile || isUploading) && styles.uploadButtonDisabled
                ]}
              >
                <Text style={styles.uploadButtonText}>
                  {isUploading ? "Uploading..." : "Upload Data"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  successTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  successText: {
    fontSize: 12,
    color: '#374151',
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  fileBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DataUploadSection;