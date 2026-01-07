// useDataset.js
import { useSelector, useDispatch } from "react-redux";
import {
  AddDataset,
  loadDatasetList,
  RemovePreprocessMetaData,
  AddPreprocessMetadata,
  UpdatePreprocessMetaData,
  AddDetails,
  RemoveDetail,
  UpdateDetail,
  deleteTheDataset,
  AddQuery,
  RemoveQuery,
  UpdateQuery,
} from "../redux/actions/datasetAction";
import {
  openDatasetDialog,
  closeDatasetDialog,
} from "../redux/slices/datasetSlice";
import { v4 as uuidv4 } from "uuid";
import useAuth from "./useAuth";
import { useState } from "react";
import useExpeiriment from "./useExperiment";

const useDataset = () => {
  const { currentCompany } = useAuth();
  const { onClickDatasetCard } = useExpeiriment();
  const dispatch = useDispatch();

  const dialogState = useSelector(
    (state) =>
      state.dataset.dialogState || {
        dialogOpen: false,
        dialogDatasetTag: "",
        dialogDatasetTitle: "",
      }
  );

  // Dialog handlers that dispatch Redux actions
  const handleOpenDatasetDialog = (tag, title = "") => {
    dispatch(openDatasetDialog({ tag, title }));
  };

  const handleCloseDatasetDialog = () => {
    onClickDatasetCard("none");
    dispatch(closeDatasetDialog());
  };

  const datasets_list = useSelector((state) => state.dataset.datasets_list);

  const datasets_name_list = useSelector(
    (state) => state.dataset.datasets_name_list
  );
  const pre_processes_metadata = useSelector(
    (state) => state.dataset.pre_processes_metadata
  );
  const details = useSelector((state) => state.dataset.details);
  const queries = useSelector((state) => state.dataset.queries);

  const loadDatasetsList = (userInfo) => {
    dispatch(loadDatasetList(userInfo));
  };

  const deleteTheDatasets = (currentCompany, userInfo, payload) => {
    dispatch(
      deleteTheDataset(currentCompany, userInfo, payload, loadDatasetsList)
    );
  };

  const addDataset = async (userInfo, currentCompany, datasetInfo) => {
    const existingDataset = await datasets_list.find(
      (dataset) => dataset.datasetName === datasetInfo.datasetName
    );

    // Generate a new UUID if the dataset does not exist
    const datasetId = (await existingDataset)
      ? existingDataset.datasetID
      : uuidv4();
    const response = await dispatch(
      AddDataset(userInfo, currentCompany, datasetInfo, datasetId)
    );
    return response;
  };

  const addPreprocessMetadata = (path, datasetID, userID) => {
    dispatch(AddPreprocessMetadata(path, datasetID, userID));
  };
  const addDetails = (
    datasetID,
    source,
    companyName,
    fileName,
    currentCompany
  ) => {
    dispatch(
      AddDetails(datasetID, source, companyName, fileName, currentCompany)
    );
  };
  const addQuery = async (
    datasetID,
    source,
    companyName,
    fileName,
    dataConnectionName,
    currentCompany
  ) => {
    await dispatch(
      AddQuery(
        datasetID,
        source,
        companyName,
        fileName,
        dataConnectionName,
        currentCompany
      )
    );
  };
  const removePreprocessMetadata = (datasetID) => {
    dispatch(RemovePreprocessMetaData(datasetID));
  };
  const removeDetail = (datasetID) => {
    dispatch(RemoveDetail(datasetID));
  };
  const removeQuery = (datasetID) => {
    dispatch(RemoveQuery(datasetID));
  };
  const updatePreprocessMetadata = (data_preprocess_args, datasetID) => {
    dispatch(UpdatePreprocessMetaData(data_preprocess_args, datasetID));
  };
  const updateDetail = (detail, datasetID) => {
    dispatch(UpdateDetail(detail, datasetID));
  };
  const updateQuery = (query, datasetID) => {
    dispatch(UpdateQuery(query, datasetID));
  };

  return {
    datasets_list,
    loadDatasetsList,
    deleteTheDatasets,
    addDataset,
    datasets_name_list,
    pre_processes_metadata,
    addPreprocessMetadata,
    removePreprocessMetadata,
    updatePreprocessMetadata,
    addDetails,
    updateDetail,
    removeDetail,
    details,
    addQuery,
    updateQuery,
    removeQuery,
    queries,

    dialogOpen: dialogState.dialogOpen,
    dialogDatasetTag: dialogState.dialogDatasetTag,
    dialogDatasetTitle: dialogState.dialogDatasetTitle,

    handleOpenDatasetDialog,
    handleCloseDatasetDialog,
  };
};

export default useDataset;
