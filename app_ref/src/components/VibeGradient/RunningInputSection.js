import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Fade,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useVibe } from "../../hooks/useVibe";

const RunningInputSection = ({
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const { isConnected, isStreaming, canSendMessage } = useVibe();
  // Debug logging

  // Monitor state changes
  useEffect(() => {
    console.log("RunningInputSection state changed:", {
      isConnected,
      isStreaming,
      canSendMessage,
    });
  }, [isConnected, isStreaming, canSendMessage]);

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
    <Fade in={true} timeout={300}>
      <Box sx={{ width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            backgroundColor: "#ffffff",
            overflow: "hidden",
            transition: "all 0.2s ease",
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
              key={isConnected ? "connected" : "disconnected"}
              ref={inputRef}
              fullWidth
              multiline
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isStreaming ? "Replying..." : "Continue the conversation..."
              }
              variant="outlined"
              disabled={!canSendMessage}
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
                  padding: "8px 0",
                  fontWeight: 400,
                  resize: "none",
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
              disabled={!inputValue.trim() || !canSendMessage}
              size="small"
              sx={{
                backgroundColor:
                  inputValue.trim() && canSendMessage ? "#1976d2" : "#e2e8f0",
                color: "white",
                width: 32,
                height: 32,
                flexShrink: 0,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor:
                    inputValue.trim() && canSendMessage ? "#1565c0" : "#e2e8f0",
                  transform:
                    inputValue.trim() && canSendMessage
                      ? "translateY(-1px)"
                      : "none",
                  boxShadow:
                    inputValue.trim() && canSendMessage
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
              {isStreaming ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: 14 }} />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default RunningInputSection;
