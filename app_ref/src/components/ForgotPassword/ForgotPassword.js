import React from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { ReactComponent as MailIcon } from "../../assets/Icons/mail.svg";
import TGIcon from "../../assets/Images/tg_logo6.svg";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";

const typoStyles = {
  textfieldStyle: {
    display: "flex",
    justifyContent: "center",
    height: "44px",
    padding: "12px 0px",
    gap: "8px",
    borderRadius: "8px",
    border: "1px solid #D0D5DD",
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.1)",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderWidth: "0",
      },
    },
    "& .MuiOutlinedInput-root.Mui-focused": {
      "& fieldset": {
        borderWidth: "0",
      },
    },
  },
  placeholder: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "24px",
    textAlign: "center",
    color: "#667085",
  },
  textSmMedium: {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    textAlign: "left",
    color: "#344054",
  },
  numberText: {
    fontFamily: "Inter",
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "18px",
    textAlign: "left",
    color: "#8A8A8A",
  },
};
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 18px 10px 18px",
          gap: "8px",
          borderRadius: " 8px ",

          "&.Mui-disabled": {
            backgroundColor: "#C2C2C2", // Custom color for disabled buttons
            color: "#FFFFFF", // Ensure text is visible
          },
        },
      },
    },
  },
});
const ForgotPassword = () => {
  const [email, setEmail] = useState("");

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
                Forgot password?
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
                Enter the email address you used when you <br />
                joined and we’ll send you instructions to reset
                <br /> your password.
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography sx={typoStyles.textSmMedium}>Email*</Typography>

                <TextField
                  required
                  hiddenLabel
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    sx: typoStyles.placeholder,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton aria-label="toggle password visibility">
                          <MailIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={typoStyles.textfieldStyle}
                />
              </Stack>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  height: "64px",

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
                  Log in
                </Typography>
              </Button>
              <Stack spacing={1} direction="column" alignItems="center">
                <Typography
                  sx={{ ...typoStyles.textSmMedium, color: "#344054" }}
                >
                  Haven't received the notification email yet?
                </Typography>
                <Button>
                  <Typography
                    sx={{
                      ...typoStyles.textSmMedium,
                      color: "#0C66E4",
                      textTransform: "none",
                    }}
                  >
                    Resend
                  </Typography>
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ForgotPassword;
