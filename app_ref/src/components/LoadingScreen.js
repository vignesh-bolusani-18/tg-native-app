import React from "react";
import { CircularProgress, Box } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingScreen;
