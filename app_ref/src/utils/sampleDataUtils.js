import { fetchCSVData } from "./s3Utils";

/**
 * Converts columnar data format to CSV string
 * @param {Object} columnarData - Data in columnar format like {column1: [val1, val2], column2: [val1, val2]}
 * @returns {string} CSV string
 */
export const convertColumnarToCSV = (columnarData) => {
  if (!columnarData || Object.keys(columnarData).length === 0) {
    return "";
  }

  const columns = Object.keys(columnarData);
  const rows = columns.length > 0 ? columnarData[columns[0]].length : 0;

  // Create CSV header
  const csvHeader = columns.join(",");

  // Create CSV rows
  const csvRows = [];
  for (let i = 0; i < rows; i++) {
    const row = columns.map((column) => {
      const value = columnarData[column][i];
      // Escape values that contain commas, quotes, or newlines
      if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"') || value.includes("\n"))
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || "";
    });
    csvRows.push(row.join(","));
  }

  return [csvHeader, ...csvRows].join("\n");
};

/**
 * Converts CSV string to File object for drag and drop
 * @param {string} csvString - CSV string content
 * @param {string} fileName - Name for the file
 * @returns {File} File object
 */
export const createFileFromCSV = (csvString, fileName) => {
  const blob = new Blob([csvString], { type: "text/csv" });
  return new File([blob], fileName, { type: "text/csv" });
};

/**
 * Fetches sample data from S3 and converts it to File object
 * @param {string} sampleDataPath - Path to sample data in S3
 * @param {string} fileName - Name for the file
 * @returns {Promise<File>} File object ready for upload
 */
export const fetchSampleDataAsFile = async (sampleDataPath, fileName) => {
  try {
    const sampleData = await fetchCSVData({
      filePath: sampleDataPath,
      filterData: null,
      paginationData: null,
      sortingData: null,
      fetchAllRows: true,
    });

    if (!sampleData || Object.keys(sampleData).length === 0) {
      throw new Error("No data received from sample data path");
    }

    const csvString = convertColumnarToCSV(sampleData);
    return createFileFromCSV(csvString, fileName);
  } catch (error) {
    console.error("Error fetching sample data:", error);
    throw error;
  }
};

/**
 * Available sample datasets configuration
 */
export const SAMPLE_DATASETS = [
  {
    id: "personal_care",
    name: "Personal Care",
    moduleNames:["demand-planning"],
    path: "sample_data_library/Personal Care.csv",
    description:
      "Personal care products sales data with brand, category, and sales metrics",
    tags: ["sales", "retail", "personal_care"],
  },
  {
    id: "customer_transaction",
    name: "Customer Transaction",
    moduleNames:["next_best_offer","next_best_action"],
    path: "sample_data_library/Customer Transaction.csv",
    description:
      "Customer transaction data with customer ID, transaction date, and transaction amount",
    tags: ["customer", "transaction", "sales"],
  },
  {
    id:"titanic",
    name: "Titanic",
    moduleNames:["binary_classification"],
    path: "sample_data_library/Titanic.csv",
    description:
      "Titanic dataset with passenger information and survival status",
    tags: ["survival", "passenger", "historical"],
  },
  {id:"house_price",
    name: "House Price",
    moduleNames:["regression"],
    path: "sample_data_library/House Price.csv",
    description:
      "House price dataset with house information and price",
    tags: ["price", "house", "historical"],
  }
  // Add more sample datasets here as needed
];
