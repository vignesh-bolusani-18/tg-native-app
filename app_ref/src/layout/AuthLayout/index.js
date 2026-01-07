import { Box, Stack} from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "../../pages/ErrorPage";
import ErrorWrapper from "../../components/ErrorWrapper";

const AuthLayout = () => {
  return (
    <Stack
      direction="column"
      sx={{
        minHeight: "100vh", // Ensure the Stack takes at least the full height of the viewport
      }}
    >
      {/* <Header /> */}
      <Box
        sx={{
          // paddingTop: "80px",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <ErrorWrapper>
          <Outlet />
        </ErrorWrapper>
      </Box>
      {/* <Footer /> */}
    </Stack>
  );
};

export default AuthLayout;
