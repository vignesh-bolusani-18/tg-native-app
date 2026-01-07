import React from "react";
import { Box } from "@mui/material";

const UserMessage = ({ message, isLastMessage }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mb: 2,
        px: 1,
      }}
    >
      <Box
        sx={{
          maxWidth: "80%",
          backgroundColor: "#1976d2",
          color: "white",
          borderRadius: 2,
          p: 1.5,
          position: "relative",
        }}
      >
        <Box
          component="div"
          sx={{
            fontSize: "0.875rem",
            lineHeight: 1.4,
            fontWeight: 400,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {message.content}
        </Box>
      </Box>
    </Box>
  );
};

export default UserMessage;
