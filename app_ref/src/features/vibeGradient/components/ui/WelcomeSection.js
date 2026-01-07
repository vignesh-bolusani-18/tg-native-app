import React from "react";
import {
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { SUGGESTED_PROMPTS, STYLES } from "../../constants";
import { useVibe } from "../../../../hooks/useVibe";

const WelcomeSection = ({ onStartChat, onNewChat, onTrySampleData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { conversations } = useVibe();

  const numberOfConversations = Object.keys(conversations).length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        textAlign: "center",
        px: 4,
        py: 6,
        paddingBottom: "200px", // Space for input
      }}
    >
      {/* Main Heading */}
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
          fontWeight: 600,
          color: "#111827",
          mb: 3,
          lineHeight: 1.2,
          fontFamily: STYLES.FONTS.PRIMARY,
        }}
      >
        How can I help you today?
      </Typography>

      {/* Subtitle */}
      <Typography
        sx={{
          fontSize: "1rem",
          color: STYLES.COLORS.TEXT_SECONDARY,
          mb: 4,
          maxWidth: "600px",
          lineHeight: 1.5,
          fontFamily: STYLES.FONTS.PRIMARY,
        }}
      >
        I'm here to help you with your business challenges. Ask me anything
        about sales, inventory, pricing, or any other business problem you're
        facing.
      </Typography>

      {/* Show different content based on conversation count */}
      {numberOfConversations === 0 ? (
        /* Start New Conversation Option */
        <Box sx={{ width: "100%", maxWidth: "400px", mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<AddIcon sx={{ fontSize: "1.2rem" }} />}
              onClick={() => onNewChat && onNewChat()}
              sx={{
                minWidth: "200px",
                height: "48px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                backgroundColor: "transparent",
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: 500,
                fontFamily: STYLES.FONTS.PRIMARY,
                textTransform: "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#d1d5db",
                  backgroundColor: "#f9fafb",
                  color: "#374151",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                },
                "& .MuiButton-startIcon": {
                  marginRight: "8px",
                },
              }}
            >
              Start New Conversation
            </Button>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                fontWeight: 400,
                fontFamily: STYLES.FONTS.PRIMARY,
                textAlign: "center",
                maxWidth: "280px",
                lineHeight: 1.4,
              }}
            >
              Click to begin your first conversation with TrueGradient AI
            </Typography>
          </Box>
        </Box>
      ) : (
        /* Suggested Prompts */
        <>
          {/* Sample Data Experience Option */}
          <Box
            sx={{
              width: "100%",
              maxWidth: "500px",
              mb: 6,
              p: 3,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#6b7280",
                mb: 2,
                fontWeight: 500,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              Don't have data ready? No worries!
            </Typography>

            <Button
              variant="contained"
              startIcon={<PlayArrowIcon sx={{ fontSize: "1.1rem" }} />}
              onClick={() => onTrySampleData && onTrySampleData()}
              sx={{
                minWidth: "280px",
                height: "46px",
                backgroundColor: STYLES.COLORS.PRIMARY,
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 600,
                fontFamily: STYLES.FONTS.PRIMARY,
                textTransform: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: STYLES.COLORS.SECONDARY,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  transform: "translateY(-1px)",
                },
                "& .MuiButton-startIcon": {
                  marginRight: "8px",
                },
              }}
            >
              Try with Personal Care Sample Data
            </Button>

            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                mt: 2,
                fontWeight: 400,
                fontFamily: STYLES.FONTS.PRIMARY,
                lineHeight: 1.4,
              }}
            >
              Experience the power of VibeGradient AI with our curated CPG
              dataset
            </Typography>
          </Box>

          <Box sx={{ width: "100%", maxWidth: "800px", mb: 6 }}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: STYLES.COLORS.TEXT_SECONDARY,
                mb: 3,
                fontWeight: 500,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              Try asking about:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <Chip
                  key={prompt}
                  label={prompt}
                  onClick={() => onStartChat && onStartChat(prompt)}
                  sx={{
                    fontSize: "0.875rem",
                    height: 40,
                    backgroundColor: STYLES.COLORS.BACKGROUND,
                    color: STYLES.COLORS.TEXT_PRIMARY,
                    border: "1px solid #d1d5db",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                      borderColor: "#9ca3af",
                      color: "#111827",
                    },
                    "& .MuiChip-label": {
                      px: 2,
                      py: 1,
                      fontWeight: 400,
                      textAlign: "left",
                      whiteSpace: "normal",
                      lineHeight: 1.3,
                      fontFamily: STYLES.FONTS.PRIMARY,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default WelcomeSection;
