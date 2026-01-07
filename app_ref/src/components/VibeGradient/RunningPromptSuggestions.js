import React from "react";
import {
  Box,
  Typography,
  Chip,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Lightbulb as LightbulbIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const RunningPromptSuggestions = ({
  suggestions = [],
  onSuggestionClick,
  onRefresh,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Default suggestions if none provided
  const defaultSuggestions = [
    "Can you explain that in more detail?",
    "Show me the code for this",
    "What are the next steps?",
    "Can you add more features?",
  ];

  const displaySuggestions =
    suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LightbulbIcon sx={{ fontSize: 14, color: "#f59e0b" }} />
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              Quick Actions
            </Typography>
          </Box>

          {onRefresh && (
            <Chip
              icon={<RefreshIcon />}
              label="Refresh"
              size="small"
              onClick={onRefresh}
              sx={{
                fontSize: "0.7rem",
                height: 20,
                backgroundColor: "#f8fafc",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
                "& .MuiChip-icon": {
                  fontSize: 12,
                },
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "flex-start",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {displaySuggestions.map((suggestion, index) => (
            <Fade in={true} timeout={600 + index * 100} key={suggestion}>
              <Chip
                label={suggestion}
                size="small"
                onClick={() =>
                  onSuggestionClick && onSuggestionClick(suggestion)
                }
                sx={{
                  fontSize: "0.7rem",
                  height: 28,
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  maxWidth: "100%",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    transform: "translateY(-1px)",
                    boxShadow: "0 1px 3px rgba(25, 118, 210, 0.15)",
                  },
                  "& .MuiChip-label": {
                    px: 1,
                    py: 0.25,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: isMobile ? "120px" : "150px",
                  },
                }}
              />
            </Fade>
          ))}
        </Box>
      </Box>
    </Fade>
  );
};

export default RunningPromptSuggestions;
