import React from "react";
import { Box, Typography } from "@mui/material";
import CustomButton from "../components/CustomButton";
import { ReactComponent as ErrorIllustration } from "../assets/Illustrations/Maintenance-bro.svg"; // Example illustration path
import { useEffect } from "react";

const ErrorPage = () => {
  const handleReload = () => {
    window.location.reload();
  };
  // Reload the page when the user navigates away from the error page


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        textAlign: "center",
        padding: "40px 20px",
        borderRadius:'8px'
        // height: "100%",
      }}
    >
      {/* Render the SVG component directly */}
      <ErrorIllustration style={{ maxWidth: "400px", marginBottom: "30px" }} />

      <Typography
        variant="h4"
        color="#B2DDFF"
        sx={{
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Oops! Something went wrong.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: "30px",
          color: "#626F86",
          fontSize: "1.1rem",
        }}
      >
        We’re sorry for the inconvenience. Please try refreshing the page or
        come back later.
      </Typography>
      <CustomButton title={"Try again"} onClick={handleReload} />
    </Box>
  );
};

export default ErrorPage;
