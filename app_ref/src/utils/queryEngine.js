import axios from "axios";
import { getAuthToken } from "../redux/actions/authActions";
import { generateToken } from "./jwtUtils";

// Retry configuration

export const callQueryEngineQuery = async (tokenPayload) => {
  console.log("Entered in call query engine");

  try {
    const maxRetries = 0;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      const Token = await getAuthToken();
      const baseURL = process.env.REACT_APP_QUERY_ENGINE_API_BASE_URL;
      console.log("Query Engine API Base URL:", baseURL || "undefined");
      console.log(
        "Query Engine API Key:",
        process.env.REACT_APP_QUERY_ENGINE_API_KEY || "undefined"
      );
      const requestConfig = {
        headers: {
          "x-api-key": process.env.REACT_APP_QUERY_ENGINE_API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
        timeout: 30000, // 30 second timeout
      };

      const isGroupByEmpty =
        !tokenPayload.groupByColumns ||
        tokenPayload.groupByColumns.length === 0;
      const isAggregationEmpty =
        !tokenPayload.aggregationColumns ||
        Object.keys(tokenPayload.aggregationColumns).length === 0;
      const isFilterConditionsEmpty =
        !tokenPayload.filterConditions ||
        Object.keys(tokenPayload.filterConditions).length === 0;

      const shouldUseByorForFilterData =
        tokenPayload.isBYOR &&
        isGroupByEmpty &&
        isAggregationEmpty &&
        isFilterConditionsEmpty;
      const payload = {
        filePath: tokenPayload.filePath,
        filterData: shouldUseByorForFilterData
          ? {
              dimensionFilters:
                tokenPayload.byorFilterData?.dimensionFilters || {},
              columnsFilter: tokenPayload.byorFilterData?.columnsFilter || [],
              selectAllColumns: tokenPayload.byorFilterData?.selectAllColumns,
            }
          : tokenPayload.filterData
          ? {
              dimensionFilters: tokenPayload.filterData.dimensionFilters || {},
              columnsFilter: tokenPayload.filterData.columnFilter || [],
              selectAllColumns: tokenPayload.filterData.selectAllColumns,
            }
          : null,
        filterConditions: tokenPayload.filterConditions || null,
        groupByColumns: tokenPayload.groupByColumns || null,
        aggregationColumns: tokenPayload.aggregationColumns || null,
        fetchAllRows: tokenPayload.fetchAllRows || false,
        byorFilterData: tokenPayload.byorFilterData
          ? {
              dimensionFilters:
                tokenPayload.byorFilterData.dimensionFilters || {},
              columnsFilter: tokenPayload.byorFilterData.columnsFilter || [], // irrelevant when selectAllColumns = true
              selectAllColumns: tokenPayload.byorFilterData.selectAllColumns,
            }
          : null,
        sortingData: tokenPayload.sortingData || null,
        paginationData: tokenPayload.paginationData || null,
        time: Date.now(),
      };

      const token = await generateToken(payload, Token);
      try {
        const response = await axios.post(
          `${baseURL}/query?t=${Date.now()}`,
          { ...payload, s3Token: token },
          requestConfig
        );

        console.log("Query Response:-->", response.data);
        return response.data;
      } catch (error) {
        if (
          error.response &&
          error.response.status === 504 &&
          error.response.data.message ===
            "Network error communicating with endpoint"
        ) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          console.log(
            `Request failed with 504, retrying attempt ${retryCount} of ${maxRetries}`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          ); // Exponential backoff
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in callQueryEngine: ", error);
    throw error;
  }

  // If we get here, all retries failed
};

export const callQueryEngineDownload = async (tokenPayload) => {
  console.log("Entered in call query engine download");

  

  try {
    const maxRetries = 0;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      const Token = await getAuthToken();
      const baseURL = process.env.REACT_APP_QUERY_ENGINE_API_BASE_URL;
      const requestConfig = {
        headers: {
          "x-api-key": process.env.REACT_APP_QUERY_ENGINE_API_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
        timeout: 30000, // 30 second timeout
      };

      const isGroupByEmpty =
        !tokenPayload.groupByColumns ||
        tokenPayload.groupByColumns.length === 0;
      const isAggregationEmpty =
        !tokenPayload.aggregationColumns ||
        Object.keys(tokenPayload.aggregationColumns).length === 0;
      const isFilterConditionsEmpty =
        !tokenPayload.filterConditions ||
        Object.keys(tokenPayload.filterConditions).length === 0;

      const shouldUseByorForFilterData =
        tokenPayload.isBYOR &&
        isGroupByEmpty &&
        isAggregationEmpty &&
        isFilterConditionsEmpty;
      const payload = {
        fileName: tokenPayload.fileName,
        companyName: tokenPayload.companyName,
        filePath: tokenPayload.filePath,
        filterData: shouldUseByorForFilterData
          ? {
              dimensionFilters:
                tokenPayload.byorFilterData?.dimensionFilters || {},
              columnsFilter: tokenPayload.byorFilterData?.columnsFilter || [],
              selectAllColumns: tokenPayload.byorFilterData?.selectAllColumns,
            }
          : tokenPayload.filterData
          ? {
              dimensionFilters: tokenPayload.filterData.dimensionFilters || {},
              columnsFilter: tokenPayload.filterData.columnFilter || [],
              selectAllColumns: tokenPayload.filterData.selectAllColumns,
            }
          : null,
        filterConditions: tokenPayload.filterConditions || null,
        groupByColumns: tokenPayload.groupByColumns || null,
        aggregationColumns: tokenPayload.aggregationColumns || null,
        byorFilterData: tokenPayload.byorFilterData
          ? {
              dimensionFilters:
                tokenPayload.byorFilterData.dimensionFilters || {},
              columnsFilter: tokenPayload.byorFilterData.columnsFilter || [], // irrelevant when selectAllColumns = true
              selectAllColumns:
                tokenPayload.byorFilterData.selectAllColumns || false,
            }
          : null,
        sortingData: tokenPayload.sortingData || null,
        fetchAllRows: tokenPayload.fetchAllRows || false,
        paginationData: null,
        time: Date.now(),
      };

      const token = await generateToken(payload, Token);
      try {
        const response = await axios.post(
          `${baseURL}/download?t=${Date.now()}`,
          { ...payload, downloadToken: token },
          requestConfig
        );

        console.log("Response:-->", response.data);
        return response.data;
      } catch (error) {
        if (
          error.response &&
          error.response.status === 504 &&
          error.response.data.message ===
            "Network error communicating with endpoint"
        ) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          console.log(
            `Request failed with 504, retrying attempt ${retryCount} of ${maxRetries}`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          ); // Exponential backoff
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in callQueryEngine: ", error);
    throw error;
  }

  // If we get here, all retries failed
};

export const clearQueryEngineCache = async (experiment_id) => {
  console.log("Entered in clear query engine cache");

  try {
    const maxRetries = 0;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      const baseURL = process.env.REACT_APP_QUERY_ENGINE_API_BASE_URL;
      const requestConfig = {
        headers: {
          "x-api-key": process.env.REACT_APP_QUERY_ENGINE_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      };

      try {
        const response = await axios.post(
          `${baseURL}/api/clear-cache?t=${Date.now()}`,
          { experiment_id },
          requestConfig
        );

        console.log("Response:-->", response.data);
        return response.data;
      } catch (error) {
        if (
          error.response &&
          error.response.status === 504 &&
          error.response.data.message ===
            "Network error communicating with endpoint"
        ) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          console.log(
            `Request failed with 504, retrying attempt ${retryCount} of ${maxRetries}`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          ); // Exponential backoff
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in clearQueryEngineCache: ", error);
    throw error;
  }

  // If we get here, all retries failed
};
