import { Box, Stack } from "@mui/material";
import React from "react";
import CustomTable from "../../../../../../components/CustomTableNew";
import ErrorWrapper from "../../../../../../components/ErrorWrapper";

const RegressionPredictionsScreen = () => {
  return (
    <Box>
      <ErrorWrapper>
        <CustomTable title="Regression Predictions" alternateTitle="Predictions" isBYOREnabled={false} />
      </ErrorWrapper>
    </Box>
  );
};

export default RegressionPredictionsScreen;
