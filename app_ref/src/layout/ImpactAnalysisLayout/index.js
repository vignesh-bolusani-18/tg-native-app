import { Stack, Box, CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import useDashboard from "../../hooks/useDashboard";
import { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";

import ErrorWrapper from "../../components/ErrorWrapper";
import ImpactAnalysisHeader from "./ImpactAnalysisHeader";
import useImpact from "../../hooks/useImpact";

const ImpactAnalysisLayout = ({ currentPage }) => {
  console.log("Scenarrio Planning Layout");
  const { impactPipelineLoading } = useImpact();
  const [loading, setloading] = useState(impactPipelineLoading);
  useEffect(() => {
    setloading(impactPipelineLoading);
  }, [impactPipelineLoading]);

  return (
    <Stack
      direction="column"
      //   sx={{
      //     minHeight: "100vh", // Ensure the Stack takes at least the full height of the viewport
      //   }}
    >
      <Box sx={{ padding: "92px 24px 32px 24px" }}>
        <Box sx={{ border: "1px solid #EAECF0", borderRadius: "12px" }}>
          <ImpactAnalysisHeader currentpage={currentPage} />

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

export default ImpactAnalysisLayout;
