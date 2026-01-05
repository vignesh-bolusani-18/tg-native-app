/**
 * S3 Utilities for File Operations
 */

import * as FileSystem from 'expo-file-system';
import { apiConfig } from './apiConfig';

export const uploadCSVToS3 = async (fileUri, fileName, companyID) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    
    const response = await fetch(`${apiConfig.baseURL}/upload-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileContent,
        companyID,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

export const fetchJsonFromS3 = async (s3Path) => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/fetch-s3-json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ s3Path }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from S3:', error);
    return null;
  }
};

export const deleteFromS3 = async (s3Path) => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/delete-s3-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ s3Path }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};
