// useDataset.js
import { useSelector, useDispatch } from "react-redux";
import {
  AddExportJob,
  AddExportPipeline,
  loadExportJobsList as LoadExportJobsList,
  loadExportPipelinesList as LoadExportPipelinesList,
} from "../redux/actions/exportsAction";
import { v4 as uuidv4 } from "uuid";
import useAuth from "./useAuth";
import {
  updateExportPipelineByPath,
  setCreateQuery as SetCreateQuery,
  setInsertQuery as SetInsertQuery,
  setTransformQuery as SetTransformQuery,
  setDataConnectionInfo as SetDataConnectionInfo,
  setCreateStep as SetCreateStep,
  clearCache as ClearCache,
  setExportJob as SetExportJob,
  setExportJobsOpen as SetExportJobsOpen,
} from "../redux/slices/exportsSlice";

const useExports = () => {
  const dispatch = useDispatch();

  const export_pipelines_list = useSelector(
    (state) => state.exports.export_pipelines_list
  );
  const export_jobs_list = useSelector(
    (state) => state.exports.export_jobs_list
  );
  const export_jobs_open = useSelector(
    (state) => state.exports.export_jobs_open
  );

  const export_pipeline = useSelector((state) => state.exports.export_pipeline);
  const export_dataset = useSelector(
    (state) => state.exports.export_pipeline.dataset
  );
  const export_job = useSelector((state) => state.exports.export_job);
  const create_step = useSelector((state) => state.exports.create_step);
  const loadExportPipelinesList = (userInfo) => {
    console.log("Called at Hook");
    dispatch(LoadExportPipelinesList(userInfo));
  };
  const loadExportJobsList = (userInfo) => {
    dispatch(LoadExportJobsList(userInfo));
  };

  const addExportPipeline = async (
    userInfo,
    currentCompany,
    exportPipelineInfo
  ) => {
    console.log("Add Pipeline Called at hook");
    const existingExportPipeline = await export_pipelines_list.find(
      (exportPipeline) =>
        exportPipeline.exportPipelineName === exportPipelineInfo.name
    );

    // Generate a new UUID if the pipeline does not exist
    const exportPipelineId = (await existingExportPipeline)
      ? existingExportPipeline.exportPipelineId
      : uuidv4();
    const response = await dispatch(
      AddExportPipeline(
        userInfo,
        currentCompany,
        exportPipelineInfo,
        exportPipelineId
      )
    );
    return response;
  };

  const addExportJob = async (userInfo, currentCompany, exportJobInfo) => {
    // Generate a new UUID if the pipeline does not exist
    const exportJobId = uuidv4();
    console.log("Export Job Info", exportJobInfo);
    const response = await dispatch(
      AddExportJob(userInfo, currentCompany, exportJobInfo, exportJobId)
    );
    return response;
  };
  const getExportPipelineFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = export_pipeline;

    for (let i = 0; i < pathParts.length; i++) {
      const key = pathParts[i];

      // Check if key is a numeric index
      const index = Number(key);
      if (!isNaN(index)) {
        // Handle array case
        if (!Array.isArray(current) || index >= current.length) {
          console.log(path, "not found!!!!!!!!!!!!!!!!!", "The index:=>>", key);
          return null;
        }
        current = current[index];
      } else {
        // Handle object case
        if (current[key] === undefined) {
          console.log(path, "not found!!!!!!!!!!!!!!!!!", "The key:=>>", key);
          return null;
        }
        current = current[key];
      }
    }

    return current;
  };

  const setDataConnectionInfo = async (dataConnection) => {
    dispatch(SetDataConnectionInfo(dataConnection));
  };
  const setCreateQuery = async (createQuery) => {
    dispatch(SetCreateQuery(createQuery));
  };
  const setExportJobsOpen = async (exportJobsOpen) => {
    dispatch(SetExportJobsOpen(exportJobsOpen));
  };
  const setInsertQuery = async (insertQuery) => {
    dispatch(SetInsertQuery(insertQuery));
  };
  const setTransformQuery = async (transformQuery) => {
    dispatch(SetTransformQuery(transformQuery));
  };
  const setCreateStep = async (createStep) => {
    dispatch(SetCreateStep(createStep));
  };
  const updateExportPipelineFieldByPath = (path, value) => {
    dispatch(updateExportPipelineByPath({ path, value }));
  };
  const clearCache = () => {
    dispatch(ClearCache());
  };

  const setExportJob = async (exportJob) => {
    dispatch(SetExportJob(exportJob));
  };

  return {
    export_pipelines_list,
    export_jobs_list,
    loadExportPipelinesList,
    loadExportJobsList,
    addExportPipeline,
    addExportJob,
    export_pipeline,
    getExportPipelineFieldByPath,
    updateExportPipelineFieldByPath,
    setDataConnectionInfo,
    setCreateQuery,
    setInsertQuery,
    setTransformQuery,
    setCreateStep,
    create_step,
    export_dataset,
    clearCache,
    export_job,
    setExportJob,
    setExportJobsOpen,
    export_jobs_open,
  };
};

export default useExports;
