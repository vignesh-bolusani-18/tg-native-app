import React from "react";
import { Box, Typography } from "@mui/material";

const Summary = ({ parsedSummary }) => {
  console.log("Received parsedSummary in summary block:", parsedSummary);

  return (
    <Box
      sx={{
        padding: "12px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="body2">
        {parsedSummary || "No summary available."}
      </Typography>
    </Box>
  );
};

export default Summary;
