// src/hooks/useAuth.js
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import {
  signUpUser,
  loginUser,
  fetchUserAttributes,
  signOutUser,
  sendInvite,
  setuserInfo,
  initiateOtpLogin,
  verifyOtpAndLogin,
  getCompanies,
  createNewCompany,
  setCurrCompany,
  selectAnotherCompany,
  refreshCurrentCompnay as RefreshCurrentCompnay,
  getAuthToken as GetAuthToken,
  acceptInvitation,
  denyInvitation,
  getPendingInvites,
  handleLogoutWithMessage as HandleLogoutWithMessage,
} from "../redux/actions/authActions";
import {
  loadCompanies,
  setError as SetError,
  setCurrentCompany,
  setOtpSent as SetOtpSent,
  setIsContactSalesDialogOpen as SetIsContactSalesDialogOpen,
  setIsExecuteButtonDialogOpen as SetIsExecuteButtonDialogOpen,
} from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const userData = useSelector((state) => state.auth.userData);
  const isSsoDone = useSelector((state) => state.auth.isSsoDone);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userInfo = useSelector((state) => state.auth.userInfo);
  const loading = useSelector((state) => state.auth.loading);
  const currentCompany = useSelector((state) => state.auth.currentCompany);
  const companies_list = useSelector((state) => state.auth.companies_list);
  const pending_invite_list = useSelector(
    (state) => state.auth.pending_invite_list
  );
  const isContactSalesDialogOpen = useSelector(
    (state) => state.auth.isContactSalesDialogOpen
  );
  const isExecuteButtonDialogOpen = useSelector(
    (state) => state.auth.isExecuteButtonDialogOpen
  );
  const otpSent = useSelector((state) => state.auth.otpSent);

  const setOtpSent = (isOtpSent) => {
    dispatch(SetOtpSent(isOtpSent));
  };

  const navigate = useNavigate();
  const signUp = (email, password) => {
    dispatch(signUpUser(email, password));
  };

  const refreshCurrentCompnay = async () => {
    await dispatch(RefreshCurrentCompnay());
  };
  const setIsContactSalesDialogOpen = (isContactSalesDialogOpen) => {
    dispatch(SetIsContactSalesDialogOpen(isContactSalesDialogOpen));
  };
  const setIsExecuteButtonDialogOpen = (isExecuteButtonDialogOpen) => {
    dispatch(SetIsExecuteButtonDialogOpen(isExecuteButtonDialogOpen));
  };
  const login = (email, password, companyName) => {
    dispatch(loginUser(email, password, companyName));
  };

  const requestOTP = async (email) => {
    await dispatch(initiateOtpLogin(email));
  };

  const verifyOTP = async (otp) => {
    await dispatch(verifyOtpAndLogin(otp));
  };

  const signOut = async () => {
    await dispatch(signOutUser());
  };

  const fetchAttributes = (email) => {
    dispatch(fetchUserAttributes(email));
  };

  const handleLogoutWithMessage = async (message) => {
    await dispatch(HandleLogoutWithMessage(message));
  };

  const SendInvite = async (userInfo, currentCompany, inviteEmail) => {
    const response = await dispatch(
      sendInvite(userInfo, currentCompany, inviteEmail)
    );
    return response;
  };

  const acceptInvite = async (userID, acceptInvitationPayload, authToken) => {
    console.log("authToken at useAut: " + authToken);
    const response = await dispatch(
      acceptInvitation(userID, acceptInvitationPayload, authToken)
    );
    return response;
  };

  const denyInvite = async (userID, denyInvitationPayload, authToken) => {
    const response = await dispatch(
      denyInvitation(userID, denyInvitationPayload, authToken)
    );
    return response;
  };
  const setError = (error) => {
    return dispatch(SetError(error));
  };

  const loadCompaniesList = async (userID) => {
    console.log("loadCompaniesList called");
    return dispatch(getCompanies(userID));
  };

  const getAuthToken = async () => {
    return dispatch(GetAuthToken());
  };

  const loadPendingInviteList = async (userInfo) => {
    return dispatch(getPendingInvites(userInfo));
  };

  const setNewCompany = async (userInfo, companyName) => {
    dispatch(createNewCompany(userInfo, companyName));
  };

  const setUserInfo = (userInfo) => {
    dispatch(setuserInfo(userInfo));
  };
  const setCurrentCompany = (companyDetails) => {
    console.log("companyDetails" + JSON.stringify(companyDetails));
    dispatch(setCurrCompany(companyDetails));
  };

  const setOtherCompany = (userInfo) => {
    dispatch(selectAnotherCompany(userInfo));
  };

  return {
    signUp,
    login,
    signOut,
    requestOTP,
    verifyOTP,
    currentCompany,
    fetchAttributes,
    loadCompaniesList,
    loadPendingInviteList,
    setNewCompany,
    setCurrentCompany,
    setOtherCompany,
    acceptInvite,
    denyInvite,
    companies_list,
    pending_invite_list,
    authStatus,
    authError,
    userData,
    isSsoDone,
    isAuthenticated,
    userInfo, // Return the userInfo
    SendInvite,
    loading,
    setUserInfo,
    setError,
    isContactSalesDialogOpen,
    isExecuteButtonDialogOpen,
    setIsContactSalesDialogOpen,
    setIsExecuteButtonDialogOpen,
    setOtpSent,
    otpSent,
    refreshCurrentCompnay,
    getAuthToken,
    handleLogoutWithMessage,
  };
};

export default useAuth;
