import { Box, Stack } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "../../pages/ErrorPage";
import ErrorWrapper from "../../components/ErrorWrapper";

const SSOLayout = () => {
  return (
    <Stack
      direction="column"
      sx={{
        minHeight: "100vh",
      }}
    >
   

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          paddingTop: "80px",
        }}
      >
        <ErrorWrapper>
          <Outlet />
        </ErrorWrapper>
      </Box>

    </Stack>
  );
};

export default SSOLayout;
