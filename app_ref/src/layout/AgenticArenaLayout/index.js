import { Stack, Box, CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ScenarioPlanningHeader from "./AgenticArenaHeader";
import useDashboard from "../../hooks/useDashboard";
import { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "../../pages/ErrorPage";
import ErrorWrapper from "../../components/ErrorWrapper";
import AgenticArenaHeader from "./AgenticArenaHeader";

const AgenticArenaLayout = ({ currentPage }) => {
  console.log("Agentic Arena Layout");
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
          <AgenticArenaHeader currentpage={currentPage} />

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

export default AgenticArenaLayout;
