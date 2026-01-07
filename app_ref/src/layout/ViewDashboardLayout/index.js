import { Stack, Box, CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ViewDashboardHeader from "./ViewDashboardHeader";
import useDashboard from "../../hooks/useDashboard";
import { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "../../pages/ErrorPage";
import ErrorWrapper from "../../components/ErrorWrapper";

const ViewExperimentLayout = ({ currentPage }) => {
  console.log("View Experiment Layout");
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
          <ViewDashboardHeader currentpage={currentPage} />

          {loading ? (
            <LoadingScreen />
          ) : (
            <ErrorWrapper>
              <Outlet />
            </ErrorWrapper>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default ViewExperimentLayout;
