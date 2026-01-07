import React from "react";
import { Box, Typography, Button } from "@mui/material";

const InitialMessage = ({ onSendQuery }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fafafa",
        textAlign: "center",
        padding: "24px",
        color: "#333",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100%",
        maxHeight: "calc(100vh - 60px)",
        overflowY: "auto",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "16px" }}>
        Hi
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: "16px" }}>
        What can I help you with?
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", marginBottom: "24px" }}>
        Ask any question related to your data on TG. For example:
      </Typography>

      {/* Example Questions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <Button
          variant="contained"
          disableElevation
          onClick={() =>
            onSendQuery(
              "Identify the row items where where lost sales exists and sort the data based on the lost sales value"
            )
          }
          sx={{
            backgroundColor: "#e0e0e0",
            color: "#333",
            textTransform: "none",
            padding: "12px 24px",
            fontSize: "0.875rem",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#d6d6d6",
            },
          }}
        >
          Identify the row items where where lost sales exists and sort the data based on the lost sales value
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() =>
            onSendQuery(
              "Identify the row items where where excess stock exists and sort the data based on the excess stock value"
            )
          }
          sx={{
            backgroundColor: "#e0e0e0",
            color: "#333",
            textTransform: "none",
            padding: "12px 24px",
            fontSize: "0.875rem",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#d6d6d6",
            },
          }}
        >
         Identify the row items where where excess stock exists and sort the data based on the excess stock value
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() =>
            onSendQuery("Identify the row items contributing 90% forecast and sort the data based on forecast")
          }
          sx={{
            backgroundColor: "#e0e0e0",
            color: "#333",
            textTransform: "none",
            padding: "12px 24px",
            fontSize: "0.875rem",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#d6d6d6",
            },
          }}
        >
          Identify the row items contributing 90% forecast and sort the data based on forecast
        </Button>
      </Box>
    </Box>
  );
};

export default InitialMessage;

