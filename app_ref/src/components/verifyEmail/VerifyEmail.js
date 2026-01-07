import React from "react";
import { Container, Box, Typography, Stack, Button } from "@mui/material";

import TGIcon from "../../assets/Images/tg_logo6.svg";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 18px 10px 18px",
          gap: "8px",
          borderRadius: " 8px ",

          border: "1px solid #0C66E4",

          backgroundColor: "#0C66E4", // Default color for buttons
          "&:hover": {
            backgroundColor: "#115293", // Hover color
            color: "red",
          },
          "&.Mui-disabled": {
            backgroundColor: "#C2C2C2", // Custom color for disabled buttons
            color: "#FFFFFF", // Ensure text is visible
          },
        },
      },
    },
  },
});
const VerifyEmail = () => {

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Container
          sx={{
            width: "443px",
            padding: "40px 32px",
            gap: "32px",
            borderRadius: "4px 0px 0px 0px",
            borderTop: "1px solid #E3E9F2",
            boxShadow: "0px 1.6px 3.6px #00000021, 0px 0.3px 0.9px #0000001A",
          }}
        >
          <Stack direction="column" spacing={5}>
            <Box>
              <img src={TGIcon} alt="tgicon" height="60px" />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  paddingTop: "12px",
                  fontSize: "20px",
                  fontWeight: "500",
                  lineHeight: "24px",
                  textAlign: "center",
                  color: "#222222",
                }}
              >
                Welcome back!
              </Typography>
            </Box>

            <Stack spacing={1}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "30px",
                  fontWeight: "500",
                  lineHeight: "36.31px",
                  textAlign: "left",
                  color: "#222222",
                }}
              >
                Verify email address
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "16px",
                  fontWeight: "400",
                  lineHeight: "24px",
                  textAlign: "left",
                  color: "#344054",
                }}
              >
                The email will include a code that needs to be entered next.
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  height: "64px",
                  bgcolor: "#0C66E4",
                  textTransform: "none",
                }}
                // Button disabled if any field is empty
              >
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "1rem",
                    fontWeight: "500",
                    lineHeight: "24px",
                    textAlign: "left",
                    textTransform: "none",
                    color: "#FFFFFF",
                  }}
                >
                  Continue
                </Typography>
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default VerifyEmail;
