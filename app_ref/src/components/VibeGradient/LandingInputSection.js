import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

const LandingInputSection = ({
  onSendMessage,
  isConnected,
  isStreaming,
  canSendMessage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const inputRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (inputValue.trim() && canSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            backgroundColor: "#ffffff",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#cbd5e1",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            },
            "&:focus-within": {
              borderColor: "#1976d2",
              boxShadow: "0 1px 3px rgba(25, 118, 210, 0.15)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              p: 1.5,
            }}
          >
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              rows={3}
              maxRows={8}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Ask me anything..." : "Connecting..."}
              variant="outlined"
              disabled={!isConnected || isStreaming}
              sx={{
                mr: 1,
                "& .MuiOutlinedInput-root": {
                  border: "none",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.875rem",
                  color: "#1e293b",
                  padding: "12px 0",
                  fontWeight: 400,
                  resize: "none",
                  lineHeight: 1.5,
                  "&::placeholder": {
                    color: "#94a3b8",
                    opacity: 1,
                    fontWeight: 400,
                  },
                  "&:disabled": {
                    color: "#94a3b8",
                  },
                },
              }}
            />

            <IconButton
              onClick={handleSend}
              disabled={!inputValue.trim() || !canSendMessage || isStreaming}
              sx={{
                backgroundColor:
                  inputValue.trim() && canSendMessage && !isStreaming
                    ? "#1976d2"
                    : "#e2e8f0",
                color: "white",
                width: 32,
                height: 32,
                flexShrink: 0,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor:
                    inputValue.trim() && canSendMessage && !isStreaming
                      ? "#1565c0"
                      : "#e2e8f0",
                  transform:
                    inputValue.trim() && canSendMessage && !isStreaming
                      ? "translateY(-1px)"
                      : "none",
                  boxShadow:
                    inputValue.trim() && canSendMessage && !isStreaming
                      ? "0 2px 4px rgba(25, 118, 210, 0.2)"
                      : "none",
                },
                "&:disabled": {
                  backgroundColor: "#e2e8f0",
                  color: "#94a3b8",
                  transform: "none",
                  boxShadow: "none",
                },
              }}
            >
              <SendIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default LandingInputSection;
