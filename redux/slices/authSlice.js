// redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userInfo: {},
    userData: { email: "", token: null },
    status: "idle",
    error: null,
    isLoggedIn: false,
    isAuthenticated: false,
    isContactSalesDialogOpen: false,
    isExecuteButtonDialogOpen: false,
    otpSent: false,
    loading: false,
    companies_list: [],
    pending_invite_list: [],
    newCompany: null,
    currentCompany: null, // Changed from [] to null for proper object storage
    isSsoDone: false,
  },
  reducers: {
    setLoggedInUser: (state, action) => {
      state.userData = action.payload;
      state.status = "succeeded";
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      state.status = "succeeded";
    },
    signOut: (state) => {
      state.userData = { email: "", token: null };
      state.status = "idle";
      state.isLoggedIn = false;
      state.isAuthenticated = false;
      state.currentCompany = null;
      state.companies_list = [];
    },
    resetCurrentCompany: (state) => {
      state.currentCompany = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = "failed";
    },
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setIsContactSalesDialogOpen: (state, action) => {
      state.isContactSalesDialogOpen = action.payload;
    },
    setIsExecuteButtonDialogOpen: (state, action) => {
      state.isExecuteButtonDialogOpen = action.payload;
    },
    setOtpSent: (state, action) => {
      state.otpSent = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setIsSsoDone: (state, action) => {
      state.isSsoDone = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loadCompanies(state, action) {
      state.companies_list = action.payload;
    },
    loadPendingInvites(state, action) {
      state.pending_invite_list = action.payload;
    },
    setNewCompany(state, action) {
      state.newCompany = action.payload;
    },
    setCurrentCompany(state, action) {
      state.currentCompany = action.payload;
    },
  },
});

export const {
  setLoggedInUser,
  signOut,
  setOtpSent,
  setError,
  setUserInfo,
  setIsLoggedIn,
  setIsAuthenticated,
  setIsContactSalesDialogOpen,
  setIsExecuteButtonDialogOpen,
  setLoading,
  loadCompanies,
  loadPendingInvites,
  setNewCompany,
  setCurrentCompany,
  setIsSsoDone,
  resetCurrentCompany,
} = authSlice.actions;
export default authSlice.reducer;