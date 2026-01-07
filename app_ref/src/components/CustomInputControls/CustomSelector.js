import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import React, { useContext, useState } from "react";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { ReactComponent as openMenuIcon } from "../../assets/Icons/chevron-down.svg";
import { ReactComponent as TagCloseIcon } from "../../assets/Icons/x.svg";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 8,
    position: "relative",
    backgroundColor: theme.palette.background.default,
    border: "1px solid #D0D5DD",
    fontSize: 16,
    padding: "10px 14px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 8,
      borderColor: " #D0D5DD",
      // boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}));

const StyledOpenMenuIcon = openMenuIcon;

const CustomSelect = ({
  label,
  values,
  isMultiSelect,
  selectedValues,
  setSelectedValues,
  showLabel,
  placeholder,
}) => {
  const { theme } = useContext(ThemeContext);

  const [selectedValue, setSelectedValue] = useState(
    isMultiSelect ? [] : placeholder
  );
  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    selectedValues[label] = isMultiSelect ? value : [value];
    // Use the updated selectedValues
    setSelectedValues({ ...selectedValues });
  };

  const handleTagClose = (value) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [label]: prevSelectedValues[label].filter((item) => item !== value),
    }));
  };

  return (
    <FormControl fullWidth sx={{ width: "100%" }}>
      {showLabel ? (
        <Typography
          sx={{
            color: "#344054",
            fontFamily: "Inter",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "20px",
            marginBottom: "6px",
          }}
        >
          {label}
        </Typography>
      ) : null}
      <Select
        placeholder={placeholder}
        input={<BootstrapInput />}
        multiple={isMultiSelect}
        MenuProps={{
          PaperProps: {
            sx: {
              // boxShad",

              "& .MuiList-root": {
                paddingTop: 0, // Remove padding from the top of the list
                paddingBottom: 0, // Remove padding from the bottom of the list
                boxShadow: "none",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
              },
              "& .MuiMenuItem-root": {
                "&.Mui-selected": {
                  backgroundColor: "#F9F5FF", // Background color for selected items
                  border: "1px solid #D0D5DD",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#F9F5FF", // Hover color for selected items
                },
                "&:not(.Mui-selected)": {
                  backgroundColor: theme.palette.background.default, // Background color for non-selected items
                  border: "1px solid #D0D5DD",
                },
                "&:not(.Mui-selected):hover": {
                  backgroundColor: "#F9F5FF", // Hover color for non-selected items
                },
              },
            },
          },
        }}
        labelId={`customized-select-label-${label}`}
        id={`customized-select-${label}`}
        // value={selectedValues[label] || (isMultiSelect ? [] : "")}
        value={selectedValue}
        onChange={handleChange}
        IconComponent={StyledOpenMenuIcon} // Replace with your openMenuIcon component
        renderValue={(selected) => {
          if (!isMultiSelect) {
            return (
              <Stack
                key={selected}
                direction="row"
                alignItems="center"
                sx={{
                  backgroundColor: theme.palette.background.default,
                  padding: "2px 6px 2px 8px",
                  borderRadius: "16px",
                }}
                spacing={0.5}
              >
                <Typography
                  sx={
                    selected !== placeholder
                      ? {
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "14px",
                          lineHeight: "18px",
                          textAlign: "left",
                          color: "#344054",
                        }
                      : {
                          fontFamily: "Inter",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "18px",
                          textAlign: "left",
                          color: "#667085",
                        }
                  }
                >
                  {selected}
                </Typography>
              </Stack>
            );
          }
          return (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                padding: "1px",
                height: "20px",
                alignContent: "center",
              }}
            >
              {selected.map((value) => (
                <Stack
                  key={value}
                  direction="row"
                  alignItems="center"
                  sx={{
                    backgroundColor: "#F2F4F7",
                    padding: "1px 6px 1px 8px",
                    borderRadius: "16px",
                  }}
                  spacing={0.1}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "18px",
                      textAlign: "center",
                      color: "#344054",
                    }}
                  >
                    {value}
                  </Typography>
                  <IconButton
                    onClick={() => {
                      handleTagClose(value);
                    }}
                  >
                    <TagCloseIcon />
                  </IconButton>
                </Stack>
              ))}
            </Box>
          );
        }}
      >
        {placeholder && (
          <MenuItem value={placeholder}>{"<--- Select --->"}</MenuItem>
        )}
        {/* {!isMultiSelect && (
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
        )} */}
        {values.map((value, idx) => (
          <MenuItem key={idx} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;
