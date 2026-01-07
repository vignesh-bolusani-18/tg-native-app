// src/hooks/useSession.js
import { useDispatch, useSelector } from "react-redux";
import {
  loadSessions,
  setCurrentSession,
  setSessionCode,
  updateSessionByPath,
  addDataset,
  updateDatasetStatus,
  removeDataset,
  updateSessionLanguage,
  updateSessionStatus,
  updateSessionTimestamp,
  clearSession,
  updateLastModified,
} from "../redux/slices/sessionSlice";
import {
  addSession as addSessionAction,
  terminateSession as TerminateSession,
} from "../redux/actions/sessionActions"; // Alias the import

const useSession = () => {
  const dispatch = useDispatch();

  // Selectors
  const sessionsList = useSelector((state) => state?.session?.sessions_list);
  const currentSession = useSelector((state) => state.session?.current_session);
  const currentDatasets = useSelector(
    (state) => state.session?.current_session.datasets
  );

  // Actions
  const loadSessionsList = (sessions) => dispatch(loadSessions(sessions));
  const setCurrentSessionAction = (session) =>
    dispatch(setCurrentSession(session));
  const setSessionCodeAction = (session) => dispatch(setSessionCode(session));
  const updateSessionByPathAction = (path, value) =>
    dispatch(updateSessionByPath({ path, value }));
  const updateLastModifiedAction = (date, index) =>
    dispatch(updateLastModified({ date, index }));
  const addDatasetAction = (dataset) => dispatch(addDataset(dataset));
  const updateDatasetStatusAction = (index, isLoaded) =>
    dispatch(updateDatasetStatus({ index, isLoaded }));
  const removeDatasetAction = (index) => dispatch(removeDataset(index));
  const updateSessionLanguageAction = (language) =>
    dispatch(updateSessionLanguage(language));
  const updateSessionStatusAction = (status) =>
    dispatch(updateSessionStatus(status));
  const updateSessionTimestampAction = (timestamp) =>
    dispatch(updateSessionTimestamp(timestamp));
  const clearSessionAction = () => dispatch(clearSession());
  const terminateSession = (currentCompany, userInfo, payload) => {
      dispatch(
        TerminateSession(
          currentCompany,
          userInfo,
          payload,
        
        )
      );
  };

  // Use the aliased addSessionAction
  const addSession = (
    userInfo,
    currentCompany,
    sessionInfo,
    code,
    providedSessionID = null,
    instanceID = null,
    isBYOR = false,
    isSave = false,
    datasetName = null,
    attached_experiment_args
  ) =>
    dispatch(
      addSessionAction(
        userInfo,
        currentCompany,
        sessionInfo,
        code,
        providedSessionID,
        instanceID,
        isBYOR,
        isSave,
        datasetName,
        attached_experiment_args
      )
    );

  return {
    // State
    sessionsList,
    currentSession,
    currentDatasets,
    // Actions
    loadSessionsList,
    setCurrentSession: setCurrentSessionAction,
    setSessionCode: setSessionCodeAction,
    updateSessionByPath: updateSessionByPathAction,
    addSessionDataset: addDatasetAction,
    updateDatasetStatus: updateDatasetStatusAction,
    removeDataset: removeDatasetAction,
    updateSessionLanguage: updateSessionLanguageAction,
    updateSessionStatus: updateSessionStatusAction,
    updateSessionTimestamp: updateSessionTimestampAction,
    updateLastModified: updateLastModifiedAction,
    clearSession: clearSessionAction,
    addSession,
    terminateSession, // Use the aliased function
  };
};

export default useSession;
