import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import React, { useState } from "react";

const CustomButton = ({
  title,
  onClick,
  fullWidth,
  outlined,
  CustomStartAdornment,
  type,
  disabled,
  loadable,
  sx, // <-- Added sx prop for custom styling
}) => {
  const [loading, setLoading] = useState(false); // Internal loading state

  const handleClick = async (e) => {
    if (loadable) {
      setLoading(true); // Set loading to true on click
    }

    console.log("Button Clicked");
    await onClick(e);

    setTimeout(() => {
      setLoading(false); // Reset loading state after 2 seconds
    }, 20000); // This can be replaced with your actual operation's completion logic
  };

  return (
    <Button
      aria-label={title}
      disabled={disabled || loading} // Disable the button if loading or disabled
      type={type}
      fullWidth={fullWidth}
      onClick={handleClick} // Use the internal handleClick function
      size="medium"
      sx={{
        borderRadius: "8px",
        backgroundColor: outlined ? "#FFFFFF" : loading ? "#E0E0E0" : "#0C66E4", // Change color when loading
        border: "1px solid",
        borderColor: outlined ? "#D0D5DD" : loading ? "#E0E0E0" : "#0C66E4",
        padding: "10px 16px",
        boxShadow: [0, 1, 2, 0, "#1018280D"],
        "&:hover": {
          backgroundColor: outlined
            ? "#FFFFFF"
            : loading
            ? "#E0E0E0"
            : "#0C66E4",
          borderColor: outlined ? "#D0D5DD" : loading ? "#E0E0E0" : "#0C66E4",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease-in-out",
        },
        opacity: disabled || loading ? 0.6 : 1, // Reduce opacity when disabled or loading
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: "100%", // Ensure button doesn’t grow beyond the container
        ...sx, // <-- Merge the custom styles passed in `sx`
      }}
    >
      <Stack
        spacing={1}
        direction="row"
        sx={{
          maxWidth: "100%",
          overflow: "hidden", // Prevents the stack from exceeding the button width
          alignItems: "center",
        }}
      >
        {loading ? (
          <CircularProgress
            size={"14px"}
            sx={{
              color: outlined ? "#344054" : "#FFFFFF", // Apply custom color here using the sx prop
            }}
          />
        ) : (
          <>{CustomStartAdornment}</>
        )}

        {title && (
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              textAlign: "left",
              color: outlined ? "#344054" : "#FFFFFF",
              textTransform: "none",
              whiteSpace: "nowrap", // Prevents wrapping
              overflow: "hidden", // Hides overflowed content
              textOverflow: "ellipsis", // Shows ellipsis for overflowed content
              maxWidth: "100%", // Ensures the text does not exceed the container
            }}
          >
            {title}
          </Typography>
        )}
      </Stack>
    </Button>
  );
};

export default CustomButton;
