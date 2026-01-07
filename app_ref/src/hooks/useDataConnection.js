// useDataConnection.js
import { useSelector, useDispatch } from "react-redux";
import {
  createConnection as CreateConnection,
  loadConnectionsList,
  loadConnectionDetails as LoadConnectionDetails,
  loadConnectionDataDetails as LoadConnectionDataDetails,
  loadShopifyConnectionDataDetails as LoadShopifyConnectionDataDetails,
  loadAmazonVendorConnectionDataDetails as LoadAmazonVendorConnectionDataDetails,
  loadAmazonSellerConnectionDataDetails as LoadAmazonSellerConnectionDataDetails,
  loadTGInternalConnectionDataDetails as LoadTGInternalConnectionDataDetails,
  loadBizeeBuyConnectionDataDetails as LoadBizeeBuyConnectionDataDetails,
  loadMS365BusinessCentralConnectionDataDetails as LoadMS365BusinessCentralConnectionDataDetails,
  loadGoogleBigQueryConnectionDataDetails as LoadGoogleBigQueryConnectionDataDetails,
  loadGoogleDriveConnectionDataDetails as LoadGoogleDriveConnectionDataDetails,
  loadGoogleDriveSampleDataDetails as LoadGoogleDriveSampleDataDetails,
} from "../redux/actions/dataConnectionAction";
import useAuth from "./useAuth";
import {
  clearData,
  setConnectionDetails,
  setError,
  setSampleData,
} from "../redux/slices/dataConnectionSlice";

const useDataConnection = () => {
  const dispatch = useDispatch();
  const dataConnections = useSelector(
    (state) => state.dataConnection.dataConnections
  );
  const connecting = useSelector((state) => state.dataConnection.connecting);
  const error = useSelector((state) => state.dataConnection.error);
  const connectionResponse = useSelector(
    (state) => state.dataConnection.connectionResponse
  );
  const connectionDetails = useSelector(
    (state) => state.dataConnection.connectionDetails
  );
  const googleDriveDataConnectionDetails = useSelector(
    (state) => state.dataConnection.googleDriveDataConnectionDetails
  );
  const googleDriveSampleData = useSelector(
    (state) => state.dataConnection.googleDriveSampleData
  );
  const googleDriveSampleDataFetchFailed = useSelector(
    (state) => state.dataConnection.googleDriveSampleDataFetchFailed
  );
  const sampleData = useSelector((state) => state.dataConnection.sampleData);
  const fileName = useSelector((state) => state.dataConnection.fileName);
  const { userInfo, currentCompany } = useAuth();

  const createConnection = async (
    dataConnectionName,
    dataConnectionType,
    dataConnectionPayload,
    postCreation,
    userID
  ) => {
    console.log(
      "Function called with",
      dataConnectionName,
      dataConnectionType,
      dataConnectionPayload
    );
    try {
      await dispatch(
        CreateConnection(
          dataConnectionName,
          dataConnectionType,
          dataConnectionPayload,
          userInfo,
          currentCompany,
          postCreation
        )
      );
    } catch (error) {
      console.log("Create Experiment error :", error);
    }

    await dispatch(loadConnectionsList(userInfo.userID));
  };
  const SetError = async (error) => {
    dispatch(setError(error));
  };

  const getError = async () => {
    return error;
  };
  const loadConnections = async (userID) => {
    dispatch(loadConnectionsList(userID));
  };
  const loadConnectionDetails = async (dataConnectionID, userID) => {
    dispatch(LoadConnectionDetails(dataConnectionID, userID));
  };

  const loadGoogleDriveConnectionDataDetails = async (
    dataConnectionID,
    userID
  ) => {
    console.log("loadGoogleDriveConnectionDataDetails called");
    dispatch(LoadGoogleDriveConnectionDataDetails(dataConnectionID, userID));
  };
  const loadConnectionDataDetails = async (
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadConnectionDataDetails(dataConnectionID, dataConnectionPayload, userID)
    );
  };
  const loadGoogleDriveSampleDataDetails = async (
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadGoogleDriveSampleDataDetails(
        dataConnectionID,
        dataConnectionPayload,
        userID
      )
    );
  };

  const loadShopifyConnectionDataDetails = async (
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadShopifyConnectionDataDetails(
        dataConnectionID,
        dataConnectionPayload,
        userID
      )
    );
  };
  const loadBizeeBuyConnectionDataDetails = async (
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadBizeeBuyConnectionDataDetails(
        dataConnectionID,
        dataConnectionPayload,
        userID
      )
    );
  };
  const loadMS365BusinessCentralConnectionDataDetails = async (
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadMS365BusinessCentralConnectionDataDetails(
        dataConnectionID,
        dataConnectionPayload,
        userID
      )
    );
  };
  const loadGoogleBigQueryConnectionDataDetails = async (
    dataConnectionName,
    companyName,
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadGoogleBigQueryConnectionDataDetails(
        dataConnectionName,
        companyName,
        dataConnectionID,
        dataConnectionPayload,
        userID
      )
    );
  };
  const loadAmazonVendorConnectionDataDetails = async (
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadAmazonVendorConnectionDataDetails(
        dataConnectionID,
        dataConnectionPayload,
        userID
      )
    );
  };
  const loadTGInternalConnectionDataDetails = async (
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadTGInternalConnectionDataDetails(dataConnectionPayload, userID)
    );
  };

  const loadAmazonSellerConnectionDataDetails = async (
    dataConnectionID,
    dataConnectionPayload,
    userID
  ) => {
    dispatch(
      LoadAmazonSellerConnectionDataDetails(
        dataConnectionID,
        dataConnectionPayload,
        userID
      )
    );
  };
  const SetSampleData = async (data) => {
    dispatch(setSampleData(data));
  };

  const SetConnectionsDetails = async (details) => {
    dispatch(setConnectionDetails(details));
  };

  const ClearData = async () => {
    dispatch(clearData());
  };
  return {
    createConnection,
    dataConnections,
    connecting,
    error,
    connectionResponse,
    loadConnections,
    SetError,
    getError,
    loadConnectionDetails,
    loadGoogleDriveConnectionDataDetails,
    googleDriveDataConnectionDetails,
    connectionDetails,
    loadConnectionDataDetails,
    loadShopifyConnectionDataDetails,
    loadAmazonVendorConnectionDataDetails,
    loadAmazonSellerConnectionDataDetails,
    loadBizeeBuyConnectionDataDetails,
    loadMS365BusinessCentralConnectionDataDetails,
    loadGoogleBigQueryConnectionDataDetails,
    loadTGInternalConnectionDataDetails,
    sampleData,
    SetSampleData,
    SetConnectionsDetails,
    ClearData,
    fileName,
    googleDriveSampleData,
    googleDriveSampleDataFetchFailed,
    loadGoogleDriveSampleDataDetails,
  };
};

export default useDataConnection;
