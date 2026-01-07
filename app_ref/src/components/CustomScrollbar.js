import React from "react";
import { Box } from "@mui/material";

const CustomScrollbar = ({
  children,
  verticalScroll = true,
  horizontalScroll = false,
  padding="0px"
}) => {
  return (
    <Box
      sx={{
        overflowY: verticalScroll ? "auto" : "hidden", // Vertical scrolling based on prop
        overflowX: horizontalScroll ? "auto" : "hidden", // Horizontal scrolling based on prop
        maxWidth: "100%", // Set a max width for the scrollable area
        position: "relative",
        paddingBottom: padding,

        // For Firefox
        scrollbarWidth: "thin", // Make scrollbar thin in Firefox
        scrollbarColor: "#D0D5DD #D0D5DD20", // Set thumb and track colors

        // For WebKit browsers
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#D0D5DD",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#fff",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#B0B5BB",
        },
      }}
    >
      {children}
    </Box>
  );
};

export default CustomScrollbar;
