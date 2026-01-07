import React from "react";
import { Box, Typography } from "@mui/material";
import TGLogo from "../../../../assets/Images/tg_logo6.svg";
import { STYLES, ANIMATIONS, CHAT_CONFIG } from "../../constants";

const TypingIndicator = ({ isTyping, message }) => {
  if (!isTyping) return null;
  console.log("TypingIndicator: message =", message);
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        py: 1,
        backgroundColor: STYLES.COLORS.BACKGROUND,
      }}
    >
      <Box
        sx={{
          display: "flex",
          maxWidth: "90%",
          width: "100%",
          mx: "auto",
          px: { xs: 1, sm: 2, md: 3 },
          gap: 1,
          alignItems: "center",
        }}
      >
        {/* AI Avatar */}
        <Box
          sx={{
            width: 35,
            height: 35,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            animation: "rotate 2s linear infinite",
            "@keyframes rotate": {
              "0%": {
                transform: "rotate(0deg)",
              },
              "100%": {
                transform: "rotate(360deg)",
              }
            }
          }}
        >
          <img
            src={TGLogo}
            alt="TrueGradient" 
            style={{
              width: "20px",
              height: "20px",
              animation: "counterRotate 2s linear infinite",
              "@keyframes counterRotate": {
                "0%": {
                  transform: "rotate(0deg)",
                },
                "100%": {
                  transform: "rotate(-360deg)",
                }
              }
            }}
          />
        </Box>

        {/* Typing Content */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Processing Text with Glow Effect */}
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "#6b7280",
              fontWeight: 900,
              fontFamily: STYLES.FONTS.PRIMARY,
              position: "relative",
              background:
                "linear-gradient(90deg, #3b82f6 0%,rgb(111, 233, 255) 50%, #3b82f6 100%)",
              backgroundSize: "200% 100%",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "processingGlow 2.5s infinite ease-in-out",
            }}
          >
            {message}
          </Typography>

          {/* CSS Animations */}
          <style>
            {`
              @keyframes processingGlow {
                0% {
                  background-position: -200% 0;
                }
                100% {
                  background-position: 200% 0;
                }
              }
            `}
          </style>
        </Box>
      </Box>

      {/* CSS for typing animation */}
      <style>{ANIMATIONS.TYPING_KEYFRAMES}</style>
    </Box>
  );
};

export default TypingIndicator;
