import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Page404 = () => {
  const { userInfo, currentCompany } = useAuth();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h1" component="div" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="div" gutterBottom>
        Oops! Page not found.
      </Typography>
      <Typography variant="body1" gutterBottom>
        The page you are looking for might have been removed or is temporarily
        unavailable.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={RouterLink}
        to={`/${currentCompany.companyName}`}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default Page404;
