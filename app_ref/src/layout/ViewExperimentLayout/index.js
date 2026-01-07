import { Stack, Box, CircularProgress } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
import ViewExperimentHeader from "./ViewExperimentHeader";
import useDashboard from "../../hooks/useDashboard";
import { useState } from "react";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "../../pages/ErrorPage";
import ErrorWrapper from "../../components/ErrorWrapper";

const ViewExperimentLayout = ({ currentPage }) => {
  const { dashboardLoading } = useDashboard();
  const [loading, setloading] = useState(dashboardLoading);
  useEffect(() => {
    setloading(dashboardLoading);
  }, [dashboardLoading]);
  return (
    <Stack
      direction="column"
      //   sx={{
      //     minHeight: "100vh", // Ensure the Stack takes at least the full height of the viewport
      //   }}
    >
      <Box sx={{ padding: "92px 24px 32px 24px" }}>
        <Box sx={{ border: "1px solid #EAECF0", borderRadius: "12px" }}>
          <ViewExperimentHeader currentpage={currentPage} />
          <ErrorWrapper>
            {loading ? <CircularProgress /> : <Outlet />}
            {/* <ExpRunDetails/> */}
          </ErrorWrapper>
        </Box>
      </Box>
    </Stack>
  );
};

export default ViewExperimentLayout;
