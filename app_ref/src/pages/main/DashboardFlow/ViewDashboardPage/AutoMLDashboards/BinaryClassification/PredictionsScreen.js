import { Box, Stack } from "@mui/material";
import React from "react";
import CustomTable from "../../../../../../components/CustomTableNew";
import ErrorWrapper from "../../../../../../components/ErrorWrapper";

const BinaryClassificationPredictionsScreen = () => {
  return (
    <Box>
      <ErrorWrapper>
        <CustomTable title="Binary Classification Predictions" alternateTitle="Predictions" isBYOREnabled={false} />
      </ErrorWrapper>
    </Box>
  );
};

export default BinaryClassificationPredictionsScreen;
