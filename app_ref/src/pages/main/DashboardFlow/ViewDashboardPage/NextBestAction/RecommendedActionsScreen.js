import { Box, Stack } from "@mui/material";
import React from "react";
import useDashboard from "../../../../../hooks/useDashboard";
import CustomTable from "../../../../../components/CustomTableNew";
import ErrorWrapper from "../../../../../components/ErrorWrapper";

const RecommendedActionsScreen = () => {
  return (
    <Box>
      <ErrorWrapper>
        <CustomTable
          title="Recommended Actions"
          isBYOREnabled={false}
        />
      </ErrorWrapper>
    </Box>
  );
};

export default RecommendedActionsScreen;
