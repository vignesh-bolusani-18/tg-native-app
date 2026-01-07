import React from "react";
import {
  Box,
  Typography,
  Chip,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import LandingInputSection from "./LandingInputSection";

const WelcomeMessage = ({
  isConnected,
  isStreaming,
  connectionStatus,
  onStartChat,
  onSendMessage,
  canSendMessage,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const suggestedPrompts = [
    "Sales are unpredictable each month",
    "We have too much warehouse stock",
    "Our prices aren't competitive enough",
  ];

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          textAlign: "center",
          px: 2,
        }}
      >
        {/* Main Heading */}
        {/* <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            fontWeight: 700,
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
            lineHeight: 1.2,
          }}
        >
          What is your burning problem?
        </Typography> */}

        {/* Connection Status */}
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 4,
            px: 2,
            py: 1,
            backgroundColor: isConnected ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${isConnected ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: 2,
            color: isConnected ? "#166534" : "#dc2626",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 16 }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {isConnected ? "Connected" : connectionStatus}
          </Typography>
        </Box> */}

        {/* Input Section - Right after prompt suggestions */}
        <Box sx={{ width: "100%", maxWidth: "800px", mt: 6 }}>
          <LandingInputSection
            onSendMessage={onSendMessage}
            isConnected={isConnected}
            isStreaming={isStreaming}
            canSendMessage={canSendMessage}
          />
        </Box>
        {/* Suggested Prompts */}
        <Box sx={{ width: "100%", maxWidth: "800px", mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 1.5,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {suggestedPrompts.map((prompt, index) => (
              <Fade in={true} timeout={1000 + index * 200} key={prompt}>
                <Chip
                  label={prompt}
                  onClick={() => onStartChat && onStartChat(prompt)}
                  sx={{
                    fontSize: "0.8rem",
                    height: 36,
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      borderColor: "#1976d2",
                      color: "#1976d2",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                    },
                    "& .MuiChip-label": {
                      px: 1.5,
                      py: 0.5,
                      fontWeight: 500,
                      textAlign: "left",
                      whiteSpace: "normal",
                      lineHeight: 1.3,
                    },
                  }}
                />
              </Fade>
            ))}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default WelcomeMessage;
