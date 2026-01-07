import React from "react";
import { Box, Alert, AlertTitle } from "@mui/material";
import { STYLES } from "../../constants";

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1001,
        maxWidth: "600px",
        width: "calc(100vw - 64px)",
      }}
    >
      <Alert
        severity="error"
        sx={{
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          fontFamily: STYLES.FONTS.PRIMARY,
        }}
      >
        <AlertTitle>Error</AlertTitle>
        {error.message || error}
      </Alert>
    </Box>
  );
};

export default ErrorDisplay;
