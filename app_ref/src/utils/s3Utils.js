import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import Papa from "papaparse";
import { transformCsv } from "./csvUtils";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

import {
  clearCacheEndpoint,
  fetchAndModifyCSVEndpoint,
  fetchCSVEndpoint,
  fetchCSVWithFilterEndpoint,
  fetchCSVWithFilterEndpoint1,
  fetchFileFromS3Endpoint,
  fetchJsonFromS3Endpoint,
  fetchParquetFileEndpoint,
  listFilesInFolderEndpoint,
  loadBatchEndpoint,
  loadBatchEndpoint1,
  uploadCSVToS3Endpoint,
  detectCSVChangesEndpoint,
  getAggregatedValueEndpoint,
} from "./s3UtillsEndpoints";
import { callQueryEngineQuery } from "./queryEngine";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const isDevelopment = process.env.NODE_ENV === "development";

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION,
  credentials:
  //  isDevelopment
    // ? {
    //     accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    //   }
    // : 
    fromCognitoIdentityPool({
        client: new CognitoIdentityClient({
          region: process.env.REACT_APP_AWS_REGION,
        }),
        identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID, // Your identity pool ID here
      }),
});

// export const listBuckets = async () => {

//     console.log("list buckets:", process.env.REACT_APP_API_BASE_URL);
//     const data = await s3Client.send(new ListBucketsCommand({}));
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_BASE_URL}/listBuckets`,
//         {
//           headers: {
//             "x-api-key": process.env.REACT_APP_API_KEY, // API key in the header
//             "Content-Type": "application/json", // Assuming the data is JSON
//           },
//         }
//       );
//       console.log("ListBucket From Vishnu:", response.data.buckets);
//       return data.Buckets;
//     } catch (error) {
//       if (error.response) {
//         // The request was made, and the server responded with a status code that falls out of the range of 2xx
//         console.error("Error response data:", error.response.data);
//         console.error("Error response status:", error.response.status);
//         console.error("Error response headers:", error.response.headers);
//       } else if (error.request) {
//         // The request was made, but no response was received
//         console.error("Error request data:", error.request);
//       } else {
//         // Something happened in setting up the request that triggered an Error
//         console.error("Error message:", error.message);
//       }
//       console.error("Error config:", error.config);
//       throw error; // Throw the error for handling in the caller function
//     }

// };

// export const listBuckets = async () => {
//   try {
//     const data = await s3Client.send(new ListBucketsCommand({}));
//     return data.Buckets;
//   } catch (error) {
//     console.error("Error listing buckets:", error);
//     throw error;
//   }
// };
const defaultFilterData = {
  dimensionFilters: {},
  columnFilter: [],
  selectAllColumns: true,
};
const defaultPaginationData = null;

const defaultSortingData = null;
export const fetchParquetData = async ({
  filePath,
  filterData,
  paginationData,
  sortingData,
}) => {
  try {
    const finalFilterData = filterData || defaultFilterData;
    const finalPaginationData = paginationData
      ? paginationData
      : defaultPaginationData;
    const finalSortingData = sortingData || defaultSortingData;
    const updatedFilePath = filePath.replace(".csv", ".parquet");
    const payload = {
      filePath: updatedFilePath,
      filterData: finalFilterData,
      paginationData: finalPaginationData,
      sortingData: finalSortingData,
      time: performance.now(),
    };
    const response = await callQueryEngineQuery(payload);
    console.log("Response From query engine:", response);
    return response;
  } catch (error) {
    console.log("Failed to get Information from backend:", error);
  }
};
export const fetchCSVData = async ({
  filePath,
  filterData,
  paginationData,
  sortingData,
  fetchAllRows = false
}) => {
  try {
    const finalFilterData = filterData || defaultFilterData;
    const finalPaginationData = paginationData
      ? paginationData
      : defaultPaginationData;
    const finalSortingData = sortingData || defaultSortingData;
    const updatedFilePath = filePath;
    const payload = {
      filePath: updatedFilePath,
      filterData: {
        ...finalFilterData,
        selectAllColumns:
          finalFilterData.columnFilter.length === 0
            ? true
            : finalFilterData.selectAllColumns,
      },
      paginationData: finalPaginationData,
      sortingData: finalSortingData,
      fetchAllRows:fetchAllRows,
      time: performance.now(),
    };
    const response = await callQueryEngineQuery(payload);
    console.log("Response From query engine:", response);
    return response;
  } catch (error) {
    
    console.log("Failed to get Information from backend:", error);
   
  }
};
export const fetchJsonFromS3 = async (filePath) => {
  try {
    const payload = { filePath, time: Date.now() };
    const response = await fetchJsonFromS3Endpoint(payload);
    console.log("Response From backend:", response);
    return response;
  } catch (error) {
    console.log("Failed to get Information from backend:", error);
  }
};
export const fetchCSVFromS3 = async (
  filePath,
  fallbackPath,
  noFallback,
  userID,
  pagination,
  caching = true
) => {
  try {
    return await fetchCSV(filePath, userID, pagination, caching);
  } catch (error) {
    console.log("Original path failed, attempting fallback...");
    try {
      if (!noFallback) {
        return await fetchCSV(fallbackPath, userID, pagination, caching);
      }
      return null;
    } catch (fallbackError) {
      console.error("Error fetching from fallback path:", fallbackError);
      throw fallbackError; // Re-throw to handle it in the calling component if necessary
    }
  }
}; //filter :-> all, sorting:-> none , pagination :-> 1,50

export const fetchCSVWithFilterFromS3 = async (
  filePath,
  fallbackPath,
  noFallback,
  filterData,
  userID
) => {
  try {
    return await fetchCSVWithFilter(filePath, filterData, userID);
  } catch (error) {
    console.log("Original path failed, attempting fallback...");
    try {
      if (!noFallback) {
        return await fetchCSVWithFilter(fallbackPath, filterData, userID);
      }
      return null;
    } catch (fallbackError) {
      console.error("Error fetching from fallback path:", fallbackError);
      throw fallbackError; // Re-throw to handle it in the calling component if necessary
    }
  }
}; //filter:-> given filter, sorting:-> none, pagination:-> 1,50

const fetchCSV = async (path, userID, pagination, caching) => {
  // const getObjectParams = {
  //   Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
  //   Key: path,
  // };

  // const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
  // const bodyString = await new Response(Body).text();

  // // Parse the CSV string into JSON
  // const response = Papa.parse(bodyString, {
  //   columns: true,
  //   skip_empty_lines: true,
  //   dynamicTyping: false,
  // });

  // console.log("Untransformed CSV:", response);
  // return transformCsv(response);
  try {
    const payload = {
      filePath: path,
      time: Date.now(),
      userID,
      pagination,
      caching,
    };
    const response = await fetchCSVEndpoint(payload, userID);
    // const response1 = Papa.parse(response, {
    //   columns: true,
    //   skip_empty_lines: true,
    //   dynamicTyping: false,
    // });
    // console.log("Response From backend CSV:", response);
    // console.log("Response1 From backend CSV:", response1);
    console.log("DF Data at utils at path:", path, response);
    return response;
  } catch (error) {
    console.log("Error at backend CSV:", error);
  }
}; //filter :-> all, sorting:-> none , pagination :-> 1,50

export const fetchAndModifyCSV = async (
  inputFilePath,
  outputFilePath,
  newColumns,
  userID
) => {
  try {
    const payload = {
      inputFilePath,
      outputFilePath,
      newColumns,
      time: Date.now(),
    };
    const response = await fetchAndModifyCSVEndpoint(payload, userID);
    // const response1 = Papa.parse(response, {
    //   columns: true,
    //   skip_empty_lines: true,
    //   dynamicTyping: false,
    // });
    // console.log("Response From backend CSV:", response);
    // console.log("Response1 From backend CSV:", response1);
    console.log("Response of Stage Export", response);
    return response;
  } catch (error) {
    console.log("Error at backend CSV:", error);
    return error;
  }
};

export const clearCache = async (userID, companyName) => {
  const payload = { userID, companyName, time: Date.now() };
  try {
    const response = await clearCacheEndpoint(payload, userID);
    return response;
  } catch (error) {
    console.log("Error at backend clearing cache:", error);
  }
};
export const loadBatchData = async (
  userID,
  companyName,
  batch_no,
  fileName,
  filterData,
  filePath = ""
) => {
  const payload = {
    userID,
    companyName,
    batch_no,
    fileName,
    filterData,
    time: Date.now(),
  };
  console.log("Load Batch Data called with payload", payload);
  try {
    if (batch_no === 1) {
      const newPayload = {
        filePath,
        filterData,
        userID,
        time: Date.now(),
      };
      console.log("New Payload:", newPayload);
      const response = await fetchCSVWithFilterEndpoint1(newPayload, userID);
      return response;
    }
    const response = await loadBatchEndpoint1(payload, userID);
    return response;
  } catch (error) {
    console.log(
      "Error at backend loading BatchNo>",
      batch_no,
      "For data",
      fileName,
      "Error is:",
      error
    );
  }
}; //filter:-> given filter, sorting:-> none, pagination:-> batch_no,50

const fetchCSVWithFilter = async (path, filterData, userID) => {
  // const getObjectParams = {
  //   Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
  //   Key: path,
  // };

  // const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
  // const bodyString = await new Response(Body).text();

  // // Parse the CSV string into JSON
  // const response = Papa.parse(bodyString, {
  //   columns: true,
  //   skip_empty_lines: true,
  //   dynamicTyping: false,
  // });

  // console.log("Untransformed CSV:", response);
  // return transformCsv(response);
  try {
    const payload = {
      filePath: path,
      filterData,
      userID,
      time: Date.now(),
    };
    const response = await fetchCSVWithFilterEndpoint1(payload, userID);
    // const response1 = Papa.parse(response, {
    //   columns: true,
    //   skip_empty_lines: true,
    //   dynamicTyping: false,
    // });
    // console.log("Response From backend CSV:", response);
    // console.log("Response1 From backend CSV:", response1);
    return response;
  } catch (error) {
    console.log("Error at backend CSV:", error);
  }
}; //filter:-> given filter, sorting:-> none, pagination:-> 1,50

// Function to typecast JSON values
const typecastValues = (data, excludeKeys = []) => {
  if (data === null) {
    return data;
  } else if (Array.isArray(data)) {
    return data.map((item) => typecastValues(item, excludeKeys));
  } else if (typeof data === "object" && data !== null) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (excludeKeys.includes(key)) {
        acc[key] = value;
      } else {
        acc[key] = typecastValues(value, excludeKeys);
      }
      return acc;
    }, {});
  } else if (!isNaN(data) && data !== "" && typeof data !== "boolean") {
    return Number(data);
  } else if (data === "true") {
    return true;
  } else if (data === "false") {
    return false;
  } else {
    return data;
  }
};

const removeNullKeysAndArrayNulls = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== null) // Remove null values from arrays
      .map((item) => removeNullKeysAndArrayNulls(item)); // Recursively handle nested arrays/objects
  } else if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (key !== "null") {
        // Remove entries where the key is null
        const cleanedValue = removeNullKeysAndArrayNulls(value);
        acc[key] = cleanedValue;
      }
      return acc;
    }, {});
  }
  return obj;
};

export const uploadJsonToS3 = async (path, data) => {
  console.log("Uploading metadata to path:", path);
  // Typecast JSON values
  const typecastedData = typecastValues(data, ["raw_data_id", "run_date"]);
  console.log("Typecasted Data:", typecastedData);
  const nullRemovedData = removeNullKeysAndArrayNulls(typecastedData);
  console.log("Null Removed Data:", nullRemovedData);
  const formattedData = JSON.stringify(nullRemovedData, null, 2); // Indents the JSON with 2 spaces
  console.log("Final Formatted Data Going to S3", formattedData);
  const putObjectParams = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: path,
    Body: formattedData,
    ContentType: "application/json",
    CacheControl: "no-cache, no-store, must-revalidate", // Prevent caching
    Expires: new Date(0), // Immediately expired
  };

  try {
    const response = await s3Client.send(new PutObjectCommand(putObjectParams));
    console.log(response);
  } catch (error) {
    console.error("Error uploading JSON to S3:", error);
    throw error;
  }
};


export const uploadImageToS3 = async (path, file) => {
  console.log("Uploading image to path:", path);
  console.log("File:", file);

  if (!file) {
    throw new Error("No file/blob provided for upload");
  }

  const putObjectParams = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: path,
    Body: file,                           // File or Blob
    ContentType: file.type || "image/png", // ✅ fallback for canvas blobs
    CacheControl: "no-cache, no-store, must-revalidate",
    Expires: new Date(0),
  };

  try {
    const response = await s3Client.send(
      new PutObjectCommand(putObjectParams)
    );
    console.log("Upload success:", response);
    return response;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};

export const getPreSignedURL = async (path, file) => {
  console.log("Uploading image to path:", path);
  console.log("File:", file);

  if (!file) {
    throw new Error("No file/blob provided for upload");
  }

  const putObjectParams = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: path,
    Body: file,                           // File or Blob
    ContentType: file.type || "image/png", // ✅ fallback for canvas blobs
    CacheControl: "no-cache, no-store, must-revalidate",
    Expires: new Date(0),
  };

  try {
    const response = await s3Client.send(
      new PutObjectCommand(putObjectParams)
    );
    console.log("Upload success:", response);
    return response;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};


export const generatePresignedUrl = async ({
  filePath,
  expiryMinutes = 15,
  downloadFileName = null
}) => {
  try {
    // Validate inputs
    if (!filePath || filePath.trim() === "") {
      throw new Error("filePath is required");
    }

    // Validate expiry time (1 minute to 7 days max)
    const sanitizedExpiryMinutes = Math.min(
      Math.max(Number(expiryMinutes) || 15, 1),
      60 * 24 * 7 // Max 7 days
    );

    // Create GetObjectCommand
    const getObjectParams = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: filePath,
    };

    // Add content disposition for download with custom filename
    if (downloadFileName) {
      getObjectParams.ResponseContentDisposition = `attachment; filename="${downloadFileName}"`;
    }

    // Get content type based on file extension
    const getContentType = (path) => {
      const extension = path.split('.').pop()?.toLowerCase();
      const contentTypes = {
        'json': 'application/json',
        'csv': 'text/csv',
        'parquet': 'application/octet-stream',
        'txt': 'text/plain',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'zip': 'application/zip',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      return contentTypes[extension] || 'application/octet-stream';
    };

    getObjectParams.ResponseContentType = getContentType(filePath);

    const command = new GetObjectCommand(getObjectParams);

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: sanitizedExpiryMinutes * 60, // Convert minutes to seconds
    });

    const expiresAt = new Date(Date.now() + sanitizedExpiryMinutes * 60 * 1000);

    return {
      success: true,
      presignedUrl,
      expiryMinutes: sanitizedExpiryMinutes,
      filePath,
      expiresAt: expiresAt.toISOString(),
      contentType: getContentType(filePath),
    };

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    
    let errorMessage = "Failed to generate presigned URL";
    
    if (error.name === "NoSuchKey") {
      errorMessage = "File not found";
    } else if (error.name === "AccessDenied") {
      errorMessage = "Access denied to the file";
    } else if (error.message.includes("filePath is required")) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.name || "Unknown error",
    };
  }
};

// Helper function to extract filename from path
const extractFileName = (filePath) => {
  const parts = filePath.split('/');
  return parts[parts.length - 1] || 'file';
};


export const uploadCSVToS3 = async (filePath, data) => {
  const putObjectParams = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: filePath,
    Body: data,
    ContentType: "text/csv",
    CacheControl: "no-cache, no-store, must-revalidate", // Prevent caching
    Expires: new Date(0), // Immediately expired
  };

  try {
    const response = await s3Client.send(new PutObjectCommand(putObjectParams));
    console.log(response);
  } catch (error) {
    console.error("Error uploading CSV to S3:", error);
    throw error;
  }
  // try {
  //   const payload = {filePath, data};
  //   console.log("Vishnu Data 1 ", data)
  //   const response = await uploadCSVToS3Endpoint(filePath, data);
  //   console.log("Response From backend CSV:", response);
  // } catch (error) {
  //   console.log("Error in uploading CSV to S3 is: ", error);
  // }
};

export const uploadTxtToS3 = async (filePath, data) => {
  const putObjectParams = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: filePath,
    Body: data,
    ContentType: "text/plain", // Adjusted for .txt files
    CacheControl: "no-cache, no-store, must-revalidate", // Prevent caching
    Expires: new Date(0), // Immediately expired
  };

  console.log("Data", data);

  try {
    const response = await s3Client.send(new PutObjectCommand(putObjectParams));
    console.log(response);
  } catch (error) {
    console.error("Error uploading TXT to S3:", error);
    throw error;
  }
};
export const fetchTxtFromS3 = async (filePath) => {
  const getObjectParams = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: filePath,
    // IfModifiedSince: new Date().toISOString(),
  };

  try {
    const response = await s3Client.send(new GetObjectCommand(getObjectParams));

    // Handle ReadableStream (typical in browser environments)
    const bodyContents = await readableStreamToString(response.Body);

    console.log("Fetched Data:", bodyContents);
    return bodyContents;
  } catch (error) {
    console.error("Error fetching TXT from S3:", error);
    return "No data!";
    throw error;
  }
};

// Helper function to read from a ReadableStream
const readableStreamToString = async (stream) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let result = "";
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    if (value) {
      result += decoder.decode(value, { stream: !done });
    }
  }

  return result;
};

////////////////////////////////

// // Function to list files in a specific folder
// export const listFilesInFolder = async (folderPath) => {
//   try {
//     const listParams = {
//       Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
//       Prefix: folderPath,
//     };

//     const data = await s3Client.send(new ListObjectsV2Command(listParams));
//     return data.Contents; // Return the list of files
//   } catch (error) {
//     console.error("Error listing files in folder:", error);
//     throw error;
//   }
// };

// Helper function to fetch file content
const fetchFileFromS3 = async (filePath, userID) => {
  // try {
  //   const getObjectParams = {
  //     Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
  //     Key: filePath,
  //   };

  //   const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
  //   const bodyString = await new Response(Body).text();
  //   console.log(bodyString);
  try {
    const payload = { filePath, time: Date.now() };
    const response = await fetchFileFromS3Endpoint(payload, userID);
    console.log("Response From backend:", response);
    return response;
  } catch (error) {
    console.log("Failed to fetch file:", error);
  }
  // return bodyString;
  // } catch (error) {
  //   console.error(`Error fetching file from S3 (${filePath}):`, error);
  //   throw error;
  // }
};

// Helper function to process log data
const processLogData = (filePath, data) => {
  if (filePath.includes("training_output.log")) {
    // Process CSV data
    return Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    }).data;
  } else if (filePath.includes("training_error.log")) {
    // Process plain text error messages
    return data.split("\n").filter((line) => line.trim() !== "");
  } else {
    // Default processing (e.g., plain text)
    return data;
  }
};

// Function to load and process all log files in a folder
export const loadLogsFromFolder = async (folderPath, userID) => {
  try {
    // List files in the folder
    const payload = { folderPath };
    const files = await listFilesInFolderEndpoint(payload, userID);

    // Filter log files (assuming log files have a `.log` extension)
    const logFiles = files.filter((file) => file.Key.endsWith(".log"));

    // Fetch and process each log file
    const logDataPromises = logFiles.map(async (file) => {
      const filePath = file.Key;
      const lastModified = file.LastModified;
      const fileName = filePath.split("/").pop(); // Extract file name

      console.log(`Fetching log file: ${filePath}`);

      try {
        const fileContent = await fetchFileFromS3(filePath, userID);
        const processedData = processLogData(filePath, fileContent); // Process data based on file type
        return { fileName, filePath, lastModified, content: processedData };
      } catch (error) {
        console.error(`Error processing log file (${filePath}):`, error);
        return { fileName, filePath, lastModified, error: error.message };
      }
    });

    let logData = await Promise.all(logDataPromises);
    // Sort log data by last modified date (newest first)
    logData.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    console.log("Loaded log data:", logData);
    return logData;
  } catch (error) {
    console.error("Error loading logs from folder:", error);
    throw error;
  }
};

export const detectCSVChanges = async (
  originalFilePath,
  uploadedPath,
  editableColumns,
  ts_id_columns,
  rowDimension,
  isRowEditable,
  editableRowDimensionValues
) => {
  try {
    const payload = {
      originalFilePath,
      uploadedPath,
      editableColumns,
      ts_id_columns,
      rowDimension,
      isRowEditable,
      editableRowDimensionValues,
      time: Date.now(),
    };
    const response = await detectCSVChangesEndpoint(payload);
    return response;
  } catch (error) {
    console.error("Error comparing files:", error);
    throw error;
  }
};

export const getAggregatedValue = async ({
  filePath,
  filterData,
  columnName,
  userID,
}) => {
  try {
    const payload = {
      filePath,
      filterData,
      columnName,
      userID,
      time: Date.now(),
    };
    const queryPayload = {
      filePath,
      aggregationColumns: { [columnName]: "sum" },
      filterData,
    };

    const response = await callQueryEngineQuery(queryPayload);
    console.log("Response From backend:", response);
    return response[`sum_${columnName}`][0];
  } catch (error) {
    console.error("Error getting aggregated value:", error);
    throw error;
  }
};
