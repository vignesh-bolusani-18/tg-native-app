import { useSelector, useDispatch } from "react-redux";
import {
  loadWorkflowsList,
  createWorkflow,
  editWorkflow as EditWorkflow,
  extendWorkflow as ExtendWorkflow,
  deleteWorkflow as DeleteWorkflow,
  pauseWorkflow,
} from "../redux/actions/workflowActions";

import {
  setOpenCreateWorkflowModal,
  updateWorkflowForm,
  clearWorkflowForm,
  setWorkflowLoading,
  setWorkflowsListLoading,
} from "../redux/slices/workflowSlice";

const useWorkflow = () => {
  const dispatch = useDispatch();

  const workflows_list = useSelector((state) => state.workflow.workflows_list);
  const openCreateWorkflowModal = useSelector((state) => state.workflow.openCreateWorkflowModal);
  const workflowForm = useSelector((state) => state.workflow.workflowForm);
  const workflowLoading = useSelector((state) => state.workflow.workflowLoading);
  const workflowsListLoading = useSelector((state) => state.workflow.workflowsListLoading);

  const loadWorkflows = (userInfo) => {
    dispatch(loadWorkflowsList(userInfo));
  };

  const handleOpenCreateWorkflowModal = (open) => {
    dispatch(setOpenCreateWorkflowModal(open));
  };

  const handleUpdateWorkflowForm = (field, value) => {
    dispatch(updateWorkflowForm({ field, value }));
  };

  const handleClearWorkflowForm = () => {
    dispatch(clearWorkflowForm());
  };

  const handleSetWorkflowLoading = (loading) => {
    dispatch(setWorkflowLoading(loading));
  };

  const handleSetWorkflowsListLoading = (loading) => {
    dispatch(setWorkflowsListLoading(loading));
  };

  const createNewWorkflow = (userInfo, currentCompany, workflowInfo) => {
    return dispatch(createWorkflow(userInfo, currentCompany, workflowInfo));
  };

  const editWorkflow = (userInfo, currentCompany, workflowInfo) => {
    return dispatch(EditWorkflow(userInfo, currentCompany, workflowInfo));
  };

  const extendWorkflow = (userInfo, currentCompany, workFlowEndDate, workflowID) => {
    return dispatch(ExtendWorkflow(userInfo, currentCompany, workFlowEndDate, workflowID));
  };

  const deleteWorkflow = (userInfo, currentCompany, workflowID) => {
    return dispatch(DeleteWorkflow(userInfo, currentCompany, workflowID));
  };

  const handlePauseWorkflow = (userInfo, currentCompany, workflow, newStatus) => {
    return dispatch(pauseWorkflow(userInfo, currentCompany, workflow, newStatus));
  };

  return {
    workflows_list,
    loadWorkflows,
    openCreateWorkflowModal,
    setOpenCreateWorkflowModal: handleOpenCreateWorkflowModal,
    workflowForm,
    updateWorkflowForm: handleUpdateWorkflowForm,
    clearWorkflowForm: handleClearWorkflowForm,
    workflowLoading,
    setWorkflowLoading: handleSetWorkflowLoading,
    workflowsListLoading,
    setWorkflowsListLoading: handleSetWorkflowsListLoading,
    createNewWorkflow,
    pauseWorkflow: handlePauseWorkflow,
    editWorkflow,
    extendWorkflow,
    deleteWorkflow,
  };
};

export default useWorkflow; 