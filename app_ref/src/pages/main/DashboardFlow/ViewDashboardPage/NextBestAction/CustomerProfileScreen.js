import { Box, Stack } from "@mui/material";
import React from "react";
import useDashboard from "../../../../../hooks/useDashboard";
import CustomTable from "../../../../../components/CustomTableNew";
import ErrorWrapper from "../../../../../components/ErrorWrapper";

const CustomerProfileScreen = () => {
  return (
    <Box>
      <ErrorWrapper>
        <CustomTable
          title="Customer Profile"
          isBYOREnabled={false}
        />
      </ErrorWrapper>
    </Box>
  );
};

export default CustomerProfileScreen;
