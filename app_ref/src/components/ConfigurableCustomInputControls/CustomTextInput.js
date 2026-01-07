// src/components/CustomInputControls/CustomTextInput.js

import React, { useContext } from "react";
import { Stack, Typography, InputAdornment, IconButton } from "@mui/material";
import { StyledInputBase, TextFieldBox } from "../Search";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { ERROR } from "../../theme/custmizations/colors";

const CustomTextInput = ({
  type = "text",
  name,
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  showLabel,
  label,
  error,
  helperText,
  startAdornment,
  endAdornment,
  disabled = false,
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <Stack>
      {showLabel && (
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 500,

            lineHeight: "20px",
            textAlign: "left",
            color: "#344054",
            textTransform: "none",
            marginBottom: "6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {label}
        </Typography>
      )}

      <StyledInputBase
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        inputProps={{ "aria-label": "experiment-title", readOnly: disabled }}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        disabled={disabled}
        sx={{
          position: "relative",
          borderRadius: "8px",
          border: "1px solid #D0D5DD",
          opacity: disabled ? 0.5 : 1,
          backgroundColor: theme.palette.background.default,
          width: "100%",
          [theme.breakpoints.up("sm")]: {
            width: "auto",
          },
          "& .MuiInputBase-input": {
            paddingLeft: "14px",
            fontFamily: "Inter",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            color: "#667085",
            textAlign: "left",
            textTransform: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: theme.transitions.create("width"),

            width: "100%",
            "&:-webkit-autofill": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
            "&:-webkit-autofill:hover": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
            "&:-webkit-autofill:focus": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
            "&:-webkit-autofill:active": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
          },
        }}
      />
      {error && (
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: "500",
            lineHeight: "14px",
            // textAlign: "center",
            color: ERROR[500],
            paddingTop: "2px",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Stack>
  );
};

export default CustomTextInput;
