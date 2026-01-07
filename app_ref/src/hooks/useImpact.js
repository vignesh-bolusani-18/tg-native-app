// useExperiment.js
import { useSelector, useDispatch } from "react-redux";

import {
  loadImpactPipelines as LoadImpactPipelines,
  deleteImpactPipeline as DeleteImpactPipeline,
  addImpactPipeline as AddImpactPipeline,
  setMetricsAnalysisGraphMetrics as SetMetricsAnalysisGraphMetrics,
  clearMetricsAnalysisGraphMetrics as ClearMetricsAnalysisGraphMetrics,
  loadMetricsAnalysisGraphMetrics as LoadMetricsAnalysisGraphMetrics,
} from "../redux/actions/impactActions";
import {
  setOpenCreateImpactPipelineModal as SetOpenCreateImpactPipelineModal,
  updateImpactPipelineByPath as UpdateImpactPipelineByPath,
  clearImpactPipelineForm as ClearImpactPipelineForm,
  setImpactPipeline as SetImpactPipeline,
  clearImpactPipeline as ClearImpactPipeline,
  setImpactPipelineLoading as SetImpactPipelineLoading,
  setCurrentImpactMetricsFeature as SetCurrentImpactMetricsFeature,
  setCurrentImpactMetricsValue as SetCurrentImpactMetricsValue,
  clearImpactPipelineData as ClearImpactPipelineData,
} from "../redux/slices/impactSlice";

const useImpact = () => {
  const dispatch = useDispatch();
  const currentCompany = useSelector((state) => state.auth.currentCompany);

  const impact_pipelines_list = useSelector(
    (state) => state.impact.impact_pipelines_list
  );
  const openCreateImpactPipelineModal = useSelector(
    (state) => state.impact.openCreateImpactPipelineModal
  );
  const impactPipelineForm = useSelector(
    (state) => state.impact.impactPipelineForm
  );
  const impactPipeline = useSelector((state) => state.impact.impactPipeline);
  const impactPipelineLoading = useSelector(
    (state) => state.impact.impactPipelineLoading
  );
  const currentImpactMetricsFeature = useSelector(
    (state) => state.impact.currentImpactMetricsFeature
  );
  const currentImpactMetricsValue = useSelector(
    (state) => state.impact.currentImpactMetricsValue
  );
  const metricsAnalysisGraphMetrics = useSelector(
    (state) => state.impact.metricsAnalysisGraphMetrics
  );

  const loadImpactPipelines = (userInfo) => {
    dispatch(LoadImpactPipelines(userInfo));
  };

  const setOpenCreateImpactPipelineModal = (open) => {
    dispatch(SetOpenCreateImpactPipelineModal(open));
  };

  const clearImpactPipelineForm = () => {
    dispatch(ClearImpactPipelineForm());
  };

  const clearImpactPipeline = () => {
    dispatch(ClearImpactPipeline());
  };

  const setImpactPipelineLoading = (loading) => {
    dispatch(SetImpactPipelineLoading(loading));
  };

  const setCurrentImpactMetricsFeature = (feature) => {
    dispatch(SetCurrentImpactMetricsFeature(feature));
  };

  const setCurrentImpactMetricsValue = (value) => {
    dispatch(SetCurrentImpactMetricsValue(value));
  };

  const clearImpactPipelineData = () => {
    dispatch(ClearImpactPipelineData());
  };

  const deleteTheImpactPipeline = (currentCompany, userInfo, payload) => {
    dispatch(
      DeleteImpactPipeline(
        currentCompany,
        userInfo,
        payload,
        loadImpactPipelines
      )
    );
  };

  const addImpactPipeline = (userInfo, currentCompany, impactPipelineInfo) => {
    dispatch(
      AddImpactPipeline(
        userInfo,
        currentCompany,
        impactPipelineInfo,
        loadImpactPipelines
      )
    );
  };

  const updateImpactPipelineByPath = (path, value) => {
    dispatch(UpdateImpactPipelineByPath({ path, value }));
  };
  const getImpactPipelineFieldByPath = (path) => {
    const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
    let current = impactPipelineForm;

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

  const setImpactPipeline = (impactPipeline) => {
    dispatch(SetImpactPipeline(impactPipeline));
  };
  const setMetricsAnalysisGraphMetrics = (metrics) => {
    dispatch(
      SetMetricsAnalysisGraphMetrics(
        metrics,
        currentCompany,
        impactPipeline.impactPipelineID,
        impactPipeline.impactPipelineName
      )
    );
  };
  const clearMetricsAnalysisGraphMetrics = () => {
    dispatch(ClearMetricsAnalysisGraphMetrics());
  };
  const loadMetricsAnalysisGraphMetrics = (
    impactPipelineID,
    impactPipelineName
  ) => {
    dispatch(
      LoadMetricsAnalysisGraphMetrics(
        currentCompany,
        impactPipelineID,
        impactPipelineName
      )
    );
  };
  return {
    impact_pipelines_list,
    loadImpactPipelines,
    deleteTheImpactPipeline,
    addImpactPipeline,
    openCreateImpactPipelineModal,
    setOpenCreateImpactPipelineModal,
    updateImpactPipelineByPath,
    getImpactPipelineFieldByPath,
    impactPipelineForm,
    clearImpactPipelineForm,
    setImpactPipeline,
    impactPipeline,
    clearImpactPipeline,
    setImpactPipelineLoading,
    impactPipelineLoading,
    currentImpactMetricsFeature,
    currentImpactMetricsValue,
    setCurrentImpactMetricsFeature,
    setCurrentImpactMetricsValue,
    clearImpactPipelineData,
    setMetricsAnalysisGraphMetrics,
    clearMetricsAnalysisGraphMetrics,
    metricsAnalysisGraphMetrics,
    loadMetricsAnalysisGraphMetrics,
  };
};

export default useImpact;
