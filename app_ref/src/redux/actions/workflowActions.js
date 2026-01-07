import {
  loadWorkflows as LoadWorkflows,
  setWorkflowLoading as SetWorkflowLoading,
  setWorkflowsListLoading as SetWorkflowsListLoading,
} from "../slices/workflowSlice";

import { addWorkflowToDatabase } from "../../utils/createDBEntry";
import { processTokens, verifyWorkflowsResponse } from "../../utils/jwtUtils";
import { getWorkflows } from "../../utils/getWorkflows";
import { setError } from "../slices/experimentSlice";
import { deleteWorkflowToDatabase, editWorkflowToDatabase, extendWorkflowToDatabase } from "../../utils/workflowManager";

export const loadWorkflowsList = (userInfo) => async (dispatch) => {
  try {
    dispatch(SetWorkflowsListLoading(true));
    const response = await getWorkflows(userInfo.userID);
    const verifiedWorkflows = await verifyWorkflowsResponse(response, userInfo.userID);
    
    // Sort workflows by creation date
    const sortedWorkflows = verifiedWorkflows.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    dispatch(LoadWorkflows(sortedWorkflows));
  } catch (error) {
    console.log("error: ", error);
  } finally {
    dispatch(SetWorkflowsListLoading(false));
  }
};

export const createWorkflow = (userInfo, currentCompany, workflowInfo) => async (dispatch) => {
  console.log("createWorkflow for company:", currentCompany.companyName);

  const workflowPayload = {
    companyID: currentCompany.companyID,
    userID: userInfo.userID,
    workflowTableName: "WORKFLOWS",
    workflowName: workflowInfo.workflowName,
    workflowStatus: workflowInfo.workflowStatus,
    workFlowStartDate: workflowInfo.workFlowStartDate,
    workFlowEndDate: workflowInfo.workFlowEndDate,
    triggerConfig: workflowInfo.triggerConfig,
    createdAt: workflowInfo.createdAt,
    updatedAt: workflowInfo.updatedAt,
    createdBy: userInfo.userName,
    inTrash: workflowInfo.inTrash
  };

  try {
    dispatch(SetWorkflowLoading(true));
    const response = await addWorkflowToDatabase(workflowPayload, currentCompany, userInfo.userID);
    console.log("Workflow creation response:", response);
    await dispatch(loadWorkflowsList(userInfo));
    return response;
  } catch (error) {
    console.error("Error creating workflow:", error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(SetWorkflowLoading(false));
  }
}; 

export const editWorkflow = (userInfo, currentCompany, workflowInfo) => async (dispatch) => {
  console.log("editWorkflow for company:", currentCompany.companyName);

  try {
    dispatch(SetWorkflowLoading(true));
    const response = await editWorkflowToDatabase(workflowInfo);
    console.log("Workflow edit response:", response);
    await dispatch(loadWorkflowsList(userInfo));
    return response;
  } catch (error) {
    console.error("Error editing workflow:", error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(SetWorkflowLoading(false));
  }
}; 

export const extendWorkflow = (userInfo, currentCompany, workFlowEndDate, workflowID) => async (dispatch) => {
  console.log("extendWorkflow for company:", currentCompany.companyName);

  const workflowPayload = {
    extendedWorkflowEndDate: workFlowEndDate,
    workflowID: workflowID
  };

  try {
    dispatch(SetWorkflowLoading(true));
    const response = await extendWorkflowToDatabase(workflowPayload);
    console.log("Workflow extend response:", response);
    await dispatch(loadWorkflowsList(userInfo));
    return response;
  } catch (error) {
    console.error("Error editing workflow:", error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(SetWorkflowLoading(false));
  }
}; 

export const deleteWorkflow = (userInfo, currentCompany, workflowID) => async (dispatch) => {
  console.log("deleteWorkflow for company:", currentCompany.companyName);

  const workflowPayload = {
    workflowID: workflowID
  };

  try {
    dispatch(SetWorkflowLoading(true));
    const response = await deleteWorkflowToDatabase(workflowPayload, currentCompany, userInfo.userID);
    console.log("Workflow delete response:", response);
    await dispatch(loadWorkflowsList(userInfo));
    return response;
  } catch (error) {
    console.error("Error deleting workflow:", error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(SetWorkflowLoading(false));
  }
}; 

export const pauseWorkflow = (userInfo, currentCompany, workflow, newStatus) => async (dispatch) => {
  console.log(`${newStatus === "PAUSED" ? "Pausing" : "Resuming"} workflow:`, workflow.workflowID);

  const workflowPayload = {
    companyID: currentCompany.companyID,
    userID: userInfo.userID,
    workflowTableName: "WORKFLOWS",
    workflowID: workflow.workflowID,
    workflowName: workflow.workflowName,
    workflowStatus: newStatus,
    workFlowStartDate: workflow.workFlowStartDate,
    workFlowEndDate: workflow.workFlowEndDate,
    triggerConfig: {
      frequency: workflow.triggerFrequency,
      time: workflow.triggerTime,
      ...(workflow.triggerDayOfWeek !== undefined && { dayOfWeek: workflow.triggerDayOfWeek }),
      ...(workflow.triggerDayOfMonth !== undefined && { dayOfMonth: workflow.triggerDayOfMonth })
    },
    createdAt: workflow.createdAt,
    updatedAt: Date.now(),
    createdBy: workflow.createdBy || userInfo.userName,
    inTrash: workflow.inTrash || false
  };

  try {
    dispatch(SetWorkflowLoading(true));
    const response = await addWorkflowToDatabase(workflowPayload, currentCompany, userInfo.userID);
    console.log("Workflow update response:", response);
    await dispatch(loadWorkflowsList(userInfo));
    return response;
  } catch (error) {
    console.error("Error updating workflow:", error);
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(SetWorkflowLoading(false));
  }
}; 