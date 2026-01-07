import React from "react";
import { Box, Button, Typography } from "@mui/material";

const NavigationButtons = ({
  handleNextTab,
  handlePrevTab,
  isLastTab,
  isFirstTab,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 24px",
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "white",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Button
        onClick={handlePrevTab}
        variant="outlined"
        sx={{
          border: "1px solid #0C66E4",
          borderRadius: "8px",
          padding: "10px 16px",
          maxHeight: "40px",
        }}
        disabled={isFirstTab}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "20px",
            color: "#0C66E4",
            textAlign: "center",
            textTransform: "none",
          }}
        >
          Previous
        </Typography>
      </Button>
      <Button
        onClick={handleNextTab}
        variant="contained"
        sx={{
          border: "1px solid #0C66E4",
          borderRadius: "8px",
          backgroundColor: "#0C66E4",
          padding: "10px 16px",
          maxHeight: "40px",
        }}
        disabled={isLastTab}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "20px",
            color: "#FFFFFF",
            textAlign: "center",
            textTransform: "none",
          }}
        >
          Next
        </Typography>
      </Button>
    </Box>
  );
};

export default NavigationButtons;
