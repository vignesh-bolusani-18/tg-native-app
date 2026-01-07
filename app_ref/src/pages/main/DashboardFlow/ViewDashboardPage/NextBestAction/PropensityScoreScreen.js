import { Box, Stack } from "@mui/material";
import React from "react";
import useDashboard from "../../../../../hooks/useDashboard";
import CustomTable from "../../../../../components/CustomTableNew";
import ErrorWrapper from "../../../../../components/ErrorWrapper";

const PropensityScoreScreen = () => {
  return (
    <Box>
      <ErrorWrapper>
        <CustomTable
          title="Propensity Score"
          showValueLable="Show Probability"
          showValueDescription="Show probability instead of propensity"
          isBYOREnabled={false}
          valueFileTitle="Probability Score"
        />
      </ErrorWrapper>
    </Box>
  );
};

export default PropensityScoreScreen;
