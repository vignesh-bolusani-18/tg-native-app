import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchCSVWithFilterFromS3,
  fetchJsonFromS3,
  loadBatchData,
} from "../../utils/s3Utils";
import { decryptData, encryptData } from "../../utils/cryptoUtils";
import {
  setDashboardData,
  setError,
  clearChat,
  resetClearChat,
  setExecutiveViewData,
  setRawSalesData,
  setPriceMetricsData,
  setInventoryMetricsData,
  setDemandForecastingData,
  setCurrentDimension as SetCurrentDimension,
  setCurrentInvDimension as SetCurrentInvDimension,
  setCurrentPriceDimension as SetCurrentPriceDimension,
  setForecastingPivotData as SetForecastingPivotData,
  setForecastingDisagg as SetForecastingDisagg,
  setCurrentValue as SetCurrentValue,
  setCurrentInvValue as SetCurrentInvValue,
  setCurrentPriceValue as SetCurrentPriceValue,
  setCurrentStartDate as SetCurrentStartDate,
  setCurrentEndDate as SetCurrentEndDate,
  setExperimentBasePath as SetExperimentBasePath,
  setInventoryOptimizationData,
  setDimensionFilterData,
  setPriceOptimizationData,
  setLoading,
  setDashboardLoading as SetDashboardLoading,
  setReports as SetReports,
  setReportsTab as SetReportsTab,
  setSubReportsTab as SetSubReportsTab,
  setReportToShow as SetReportToShow,
  setInvPriceFilterData,
  setTablesFilterData,
  setSelectedModel,
  setElasticityDimensionFilterData,
  setRLAgentEnrichmentSuggestions as SetRLAgentEnrichmentSuggestions,
  setApprovedRLAgentEnrichmentSuggestions as SetApprovedRLAgentEnrichmentSuggestions,
  setSupplyPlanFilterData,
} from "../slices/dashboardSlice";
import { getReports } from "../../utils/Other Reports/getReports";
import {
  getPreSignedURLToDownloadData1,
  getPreSignedURLToDownloadParquetData,
} from "../../utils/getPreSignedURLToDownloadData1";
import axios from "axios";
import { saveAs } from "file-saver";
import { deleteDownloadedCSV } from "../../utils/deleteDownloadedCSV";
import useAuth from "../../hooks/useAuth";
import { fetchParquetData } from "./../../utils/s3Utils";
import { callQueryEngineDownload } from "../../utils/queryEngine";
import { transformRLEnrichmentSuggestions } from "../../utils/Agent Utils/transformRLEnrichmentSuggestions";
import { transformApprovedRLEnrichmentSuggestions } from "../../utils/Agent Utils/transformApprovedRLEnrichmentSuggestions";
import store from "../store";

export const loadDashboardData =
  ({ path, fallBackPath, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchCSVData({
        filePath: path,
        filterData: null,
        paginationData: null,
        sortingData: null,
      });
      const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      console.log(path);
      await dispatch(setDashboardData(decryptedData));
      console.log("Dashboard Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

const cleanupTablesFilterData = (data) => {
  // Deep clone the data to avoid mutating the original
  const cleanedData = JSON.parse(JSON.stringify(data));

  // Iterate through each key in the data
  Object.keys(cleanedData).forEach((key) => {
    // Iterate through each subkey
    Object.keys(cleanedData[key]).forEach((subKey) => {
      // Check if aggregatedValuesHistory exists and is an array
      if (Array.isArray(cleanedData[key][subKey].aggregatedValuesHistory)) {
        // Process each entry in aggregatedValuesHistory
        cleanedData[key][subKey].aggregatedValuesHistory = cleanedData[key][
          subKey
        ].aggregatedValuesHistory.map((entry) => ({
          ...entry,
          // Convert empty aggregated_values objects to null
          aggregated_values:
            Object.keys(entry.aggregated_values || {}).length === 0
              ? null
              : entry.aggregated_values,
        }));
      }
    });
  });

  return cleanedData;
};

export const loadTablesFilterData =
  ({ path, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchJsonFromS3(path, userID);
      let decryptedData = data;

      // Clean up the data by converting empty aggregated_values to null
      const cleanedData = await cleanupTablesFilterData(decryptedData);

      console.log(path);
      await dispatch(setTablesFilterData(cleanedData));
      console.log("Tables Filter Data Fetched:", cleanedData);
      return cleanedData;
    } catch (error) {
      await dispatch(setTablesFilterData({}));
      console.log("Error at dashboard Actions for tablesFilterData!");
      // dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadExecutiveViewData =
  ({ path, fallBackPath, filterData, userID, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));
      const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      console.log(path);

      await dispatch(setExecutiveViewData(decryptedData));
      console.log("ExecutiveView Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const loadRawSalesData =
  ({ path, fallBackPath, filterData, userID, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));
      const decryptedData = data;

      console.log(path);
      await dispatch(setRawSalesData(decryptedData));
      console.log("Raw Sales Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const loadPriceMetricsData =
  ({ path, fallBackPath, filterData, userID, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));
      const decryptedData = data;

      console.log(path);
      await dispatch(setPriceMetricsData(decryptedData));
      console.log("Price Metrics Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const loadInventoryMetricsData =
  ({ path, fallBackPath, filterData, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchCSVWithFilterFromS3(
        path,
        fallBackPath,
        false,
        filterData,
        userID
      );
      const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      console.log(path);
      await dispatch(setInventoryMetricsData(decryptedData));
      console.log("Inventory Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadDimensionFilterData =
  ({ path, fallBackPath, userID, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData: null,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: null,
            paginationData: null,
            sortingData: null,
          }));

      console.log(path);
      const transformedData = {};
      console.log(data);

      // Iterate over the feature array
      data.feature.forEach((feature, index) => {
        // Normalize the feature name to lowercase

        // Initialize the array for this feature if it doesn't exist
        if (!transformedData[feature]) {
          transformedData[feature] = [];
        }

        // Add the corresponding value to the feature array
        if (feature && feature !== "") {
          transformedData[feature].push(data.value[index]);
        }
      });
      await dispatch(setDimensionFilterData(transformedData));
      console.log("DimensionFilterData Data Fetched:", transformedData);
      return transformedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadElasticityDimensionFilterData =
  ({ path, fallBackPath, userID, hasParquetFiles, priceColumn }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData: null,
            paginationData: null,
            sortingData: null,
            fetchAllRows: true,
          })
        : fetchCSVData({
            filePath: path,
            filterData: null,
            paginationData: null,
            sortingData: null,
            fetchAllRows: true,
          }));

      console.log("elasticity data", data);

      // Validate if data is available and has required properties
      if (
        !data ||
        !data.Dimension ||
        !data.Value ||
        !data?.[`${priceColumn}_elasticity`]
      ) {
        return;
      }

      // Additional validation to check if arrays are not empty
      if (
        data.Dimension.length === 0 ||
        data.Value.length === 0 ||
        data?.[`${priceColumn}_elasticity`].length === 0
      ) {
        return;
      }

      const transformedData = {};
      console.log("priceColumnData", data?.[`${priceColumn}_elasticity`]);
      // Iterate over the Dimension array
      data.Dimension.forEach((dimension, index) => {
        // Initialize the array for this dimension if it doesn't exist
        if (!transformedData[dimension]) {
          transformedData[dimension] = [];
        }

        // Add the corresponding data to the dimension array
        if (dimension && dimension !== "") {
          transformedData[dimension].push({
            item: data.Value[index],
            elasticity: data?.[`${priceColumn}_elasticity`][index] || 0,
          });
        }
      });

      await dispatch(setElasticityDimensionFilterData(transformedData));
      console.log(
        "ElasticityDimensionFilterData Data Fetched:",
        transformedData
      );
      return transformedData;
    } catch (error) {
      console.log("Error loading elasticity dimension filter data:", error);
      dispatch(setError(error.toString()));
      throw error; // Re-throw the error if you want calling code to handle it
    } finally {
      dispatch(setLoading(false));
    }
  };
// Function to download a file using the pre-signed URL
export const downloadFileUsingPreSignedURL = async (
  tokenPayload,
  fileName,
  tableName,
  userID
) => {
  try {
    // Get the pre-signed URL from the API

    const { downloadUrl } = await getPreSignedURLToDownloadData1(tokenPayload);
    console.log(downloadUrl)

    if (!downloadUrl) {
      throw new Error("No download URL returned from the API");
    }

    console.log("Pre-Signed URL:-->", downloadUrl);

    // Make a GET request to download the file
    const response = await axios.get(downloadUrl, {
      responseType: "blob", // Important to get the file as a Blob
    });

    // Use file-saver to save the file (you can use other methods if you prefer)
    saveAs(response.data, tableName);

    await deleteDownloadedCSV(tokenPayload, userID);

    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error; // Rethrow the error to handle it in the caller function if needed
  }
};

export const downloadParquetFileUsingPreSignedURL = async (
  tokenPayload,
  tableName,
  userID
) => {
  try {
    // Get the pre-signed URL from the API
    /*  const newPayload = {...tokenPayload,
      filePath: tokenPayload.filePath.replace('.csv', '.parquet'),
    } */
    const { downloadUrl } = await callQueryEngineDownload(tokenPayload);

    if (!downloadUrl) {
      throw new Error("No download URL returned from the API");
    }

    console.log("Pre-Signed URL:-->", downloadUrl);

    // Make a GET request to download the file
    const response = await axios.get(downloadUrl, {
      responseType: "blob", // Important to get the file as a Blob
    });

    // Use file-saver to save the file (you can use other methods if you prefer)
    saveAs(response.data, tableName);

    await deleteDownloadedCSV(tokenPayload, userID);

    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error; // Rethrow the error to handle it in the caller function if needed
  }
};
export const loadInvPriceFilterData =
  ({ path, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await fetchJsonFromS3(path, userID);
      const updatedData = {
        ...data,
        Stock_Risk_Level: [
          "StockOut",
          "CriticalStock",
          "LowInventory",
          "ExcessStock",
          "Stable",
        ],
        "Imputation Flag": ["0", "1"], // key has a space, so wrap in quotes
      };
      console.log(path);

      await dispatch(setInvPriceFilterData(updatedData));
      console.log("InvPriceFilterData Data Fetched:", updatedData);
      return updatedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadSupplyPlanFilterData =
  ({ path, userID }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const { config } = store.getState(); // assuming configState is stored in Redux
      const configState = config?.config;
      console.log("supplyFilterData ");
      const data = await fetchJsonFromS3(path, userID);
      
      console.log("supplyFilterData " + JSON.stringify(data));
      let updatedData;
      if (data) {
        updatedData = {
          ...data,
          Variable:[...configState.scenario_plan.production_plan.production_plan_metrics] ,
                   Stock_Risk_Level: [
            "StockOut",
            "CriticalStock",
            "LowInventory",
            "ExcessStock",
            "Stable",
          ],

        };
      }
      console.log(path);
      console.log(updatedData)

      await dispatch(setSupplyPlanFilterData(updatedData));
      console.log("SupplyPlanFilterData Data Fetched:", updatedData);
      return updatedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const loadReports =
  ({ basePath, module_name, userID, havePrice }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const reports = await getReports(module_name, havePrice); // Correctly define and await reports
      console.log("Reports: ", reports);
      console.log("Base path", basePath);
      const { config } = store.getState(); // assuming configState is stored in Redux
      const configState = config?.config;
      console.log(configState)
      // ✅ Dynamically add Forecast Accuracy group
      const dimensions =
        configState?.scenario_plan?.demand_alignment_report
          ?.dimensions_for_accuracy || [];
      const calculateDimension = configState.scenario_plan?.demand_alignment_report?.calc_dimensions_accuracy || false

       if (dimensions.length > 0 ) {
        const forecastAccuracyReports = dimensions.map((dimension) => ({
          title: `${dimension} Accuracy Report`,
          path: `scenario_planning/K_best/Dimension_Accuracy/${dimension}_accuracy.csv`,
          data: null,
          isSingle: true,
        }));

        reports.Forecast_Accuracy = {
          title: "Dimension Accuracy",
          description:
            "Forecast Accuracy reports show accuracy metrics for each selected dimension.",
          reports: forecastAccuracyReports,
        };
      }

        console.log("Final Reports Object (with Forecast Accuracy):", reports);
      // for (const reportGroup in reports) {
      //   if (reports.hasOwnProperty(reportGroup)) {
      //     for (const report of reports[reportGroup].reports) {
      //       console.log("Report", report);
      //       const path = `${basePath}/${report.path}`;
      //       const fallBackPath = `accounts/demo/data_bucket/inventory-optimization/202406/efb139fa-f5de-43c4-aa73-84eb6adf7694/${report.path}`;
      //       try {
      //         const data = await fetchCSVFromS3(
      //           path,
      //           fallBackPath,
      //           true,
      //           userID,
      //           true
      //         );
      //         console.log(path);
      //         console.log("Data at", data);
      //         if (Object.keys(data).length > 1) {
      //           report.data = data;
      //         }
      //         console.log(
      //           `${report.title} data fetched from ${path}:::>>>>`,
      //           data
      //         );
      //       } catch (error) {
      //         console.log("Error at dashboard Actions! for", path);
      //         dispatch(setError(error.toString()));
      //         report.data = null; // Handle the error by setting data to null
      //       }
      //     }
      //   }
      // }

      await dispatch(SetReports(reports)); // Dispatch the updated reports
      return reports; // Return the final reports object with data
    } catch (error) {
      dispatch(setError(error.toString()));
      dispatch(setLoading(false));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const setReportsTab = (reportsTab) => (dispatch) => {
  dispatch(SetReportsTab(reportsTab));
};
export const setSubReportsTab = (subReportsTab) => (dispatch) => {
  dispatch(SetSubReportsTab(subReportsTab));
};
export const setReportToShow = (report) => (dispatch) => {
  dispatch(SetReportToShow(report));
};

export const setForecastingPivotData =
  ({ path, fallBackPath, filterData, userID, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));

      console.log(path);
      await dispatch(SetForecastingPivotData(data));
      console.log("forecastingPivotData  Fetched:", data);
      return data;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const setForecastingDisagg =
  ({ path, fallBackPath, filterData, userID, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));

      console.log(path);
      await dispatch(SetForecastingDisagg({ data }));
      console.log("forecastingPivotData  Fetched:", data);
      return data;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const loadDemandForecastingData =
  ({ path, fallBackPath, filterData, userID, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));
      const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      console.log("DF Data", decryptedData);
      console.log(path);
      await dispatch(setDemandForecastingData(decryptedData));
      console.log("DemandForecastingData Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const loadInventoryOptimizationData =
  ({
    path,
    fallBackPath,
    dimensionColumns,
    filterData,
    userID,
    hasParquetFiles,
  }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));
      const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      console.log(path);
      await dispatch(
        setInventoryOptimizationData({ data: decryptedData, dimensionColumns })
      );

      console.log("InventoryOptimizationData Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const loadPriceOptimizationData =
  ({
    path,
    fallBackPath,
    dimensionColumns,
    filterData,
    userID,
    hasParquetFiles,
  }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: { batchNo: 1, batchSize: 50 },
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: { batchNo: 1, batchSize: 50 },
            sortingData: null,
          }));
      const decryptedData = data;

      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      console.log(path);
      await dispatch(
        setPriceOptimizationData({ data: decryptedData, dimensionColumns })
      );

      console.log("Price Optimization Data Fetched:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const setCurrentDimension =
  ({ dimension }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await dispatch(SetCurrentDimension(dimension));
      console.log("current dimension", dimension);
      return dimension;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setCurrentValue =
  ({ value }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // const data = await fetchCSVFromS3(path);
      // const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      // console.log(path);
      await dispatch(SetCurrentValue(value));
      console.log("current value", value);
      return value;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setCurrentInvDimension =
  ({ dimension }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await dispatch(SetCurrentInvDimension(dimension));
      console.log("current dimension", dimension);
      return dimension;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setCurrentInvValue =
  ({ value }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // const data = await fetchCSVFromS3(path);
      // const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      // console.log(path);
      await dispatch(SetCurrentInvValue(value));
      console.log("current value", value);
      return value;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setCurrentPriceDimension =
  ({ dimension }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await dispatch(SetCurrentPriceDimension(dimension));
      console.log("current dimension", dimension);
      return dimension;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setCurrentPriceValue =
  ({ value }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // const data = await fetchCSVFromS3(path);
      // const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      // console.log(path);
      await dispatch(SetCurrentPriceValue(value));
      console.log("current value", value);
      return value;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const setCurrentStartDate =
  ({ startDate }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      // console.log(path);
      await dispatch(SetCurrentStartDate(startDate));
      console.log("current startDate", startDate);
      return startDate;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setCurrentEndDate =
  ({ endDate }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // const data = await fetchCSVFromS3(path);
      // const decryptedData = data;
      // const decryptedData = decryptData(
      //   data,
      //   "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
      // );
      // console.log(path);
      await dispatch(SetCurrentEndDate(endDate));
      console.log("current enddate", endDate);
      return endDate;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setExperimentBasePath =
  ({ experimentBasePath }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await dispatch(SetExperimentBasePath(experimentBasePath));
      console.log("current Experiment Base Path", experimentBasePath);
      return experimentBasePath;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
const filterObjectByIndexes = (inputObj, indexes) => {
  // Create a new object to store the filtered result
  let filteredObj = {};

  // Loop over each header in the input object
  for (let header in inputObj) {
    // Filter the values based on the provided indexes
    filteredObj[header] = indexes
      .map((index) => inputObj[header][index])
      .filter((val) => val !== undefined);
  }

  return filteredObj;
};

export const setDashboardLoading =
  ({ dashboardLoading }) =>
  (dispatch) => {
    return dispatch(SetDashboardLoading(dashboardLoading));
  };

export const selectModel = (model) => async (dispatch) => {
  try {
    dispatch(setSelectedModel(model));
    console.log("Model selected:", model);
  } catch (error) {
    console.error("Error selecting model:", error);
  }
};
export const setRLAgentEnrichmentSuggestions =
  ({
    path,
    filterData,
    hasParquetFiles,
    approvedRLAgentEnrichmentSuggestions,
    forecastDeviation,
    batchNo = 1,
    enableRLAgent
  }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
             paginationData: { batchNo: batchNo, batchSize: 250 },
            sortingData: null,
            
            
          }));

          console.log(batchNo)
      console.log("RLAgentEnrichmentSuggestions Data Fetched:", data);
      const transformedData = await transformRLEnrichmentSuggestions(
        data,
        approvedRLAgentEnrichmentSuggestions,
        forecastDeviation,
        enableRLAgent
      );
      await dispatch(SetRLAgentEnrichmentSuggestions(transformedData));
      console.log(
        "RLAgentEnrichmentSuggestions Transformed Data Fetched:",
        transformedData
      );
      return transformedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };
export const setApprovedRLAgentEnrichmentSuggestions =
  ({ path, filterData, hasParquetFiles }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: { batchNo: 1, batchSize: 250 },
            sortingData: null,
          }));
      console.log("ApprovedRLAgentEnrichmentSuggestions Data Fetched:", data);
      const transformedData = await transformApprovedRLEnrichmentSuggestions(
        data
      );
      await dispatch(SetApprovedRLAgentEnrichmentSuggestions(transformedData));
      console.log(
        "ApprovedRLAgentEnrichmentSuggestions Transformed Data Fetched:",
        transformedData
      );
      return transformedData;
    } catch (error) {
      console.log("Error at dashboard Actions!");
      dispatch(setError(error.toString()));
    } finally {
      dispatch(setLoading(false));
    }
  };

// export const  clearChat = () => {

// };
