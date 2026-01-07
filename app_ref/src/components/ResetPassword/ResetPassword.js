import React, { useState } from "react";
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
import { ReactComponent as Visibility } from "../../assets/Icons/eye.svg";
import { ReactComponent as VisibilityOff } from "../../assets/Icons/eye-off.svg";
import TGIcon from "../../assets/Images/tg_logo6.svg";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
          // Default color for buttons

          "&.Mui-disabled": {
            backgroundColor: "#C2C2C2", // Custom color for disabled buttons
            color: "#FFFFFF", // Ensure text is visible
          },
        },
      },
    },
  },
});
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((show) => !show);
  };

  const isButtonDisabled = !email || !password || !confirmPassword;
  console.log(isButtonDisabled);

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
                Reset password
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
                Your new password must be different from
                <br /> previous used passwords.{" "}
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography sx={typoStyles.textSmMedium}>
                  New Password
                </Typography>

                <TextField
                  hiddenLabel
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    sx: typoStyles.placeholder,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          onMouseDown={(event) => event.preventDefault()}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={typoStyles.textfieldStyle}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography sx={typoStyles.textSmMedium}>
                  Confirm Password
                </Typography>

                <TextField
                  hiddenLabel
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    sx: typoStyles.placeholder,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowConfirmPassword}
                          onMouseDown={(event) => event.preventDefault()}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
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
                  Reset Password
                </Typography>
              </Button>

              <Button>
                <Typography
                  sx={{
                    ...typoStyles.textSmMedium,
                    color: "#0C66E4",
                    textTransform: "none",
                  }}
                >
                  Return to Login
                </Typography>
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Signup;
