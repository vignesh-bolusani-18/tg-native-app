import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Collapse,
  Stack,
  TextField,
  Button,
  Paper,
  Tooltip,
} from "@mui/material";
import { ExpandMore, ExpandLess, Reply } from "@mui/icons-material";

// Helper to format timestamps
const formatTime = (ts) => {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CommentsSection = ({ comments = [] }) => {
  const [replyBox, setReplyBox] = useState(null);
  const [expandedComment, setExpandedComment] = useState({});

  const toggleReplies = (id) => {
    setExpandedComment((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReplyToggle = (id) => {
    setReplyBox(replyBox === id ? null : id);
  };

  return (
    <Box sx={{ mt: 4, pb: 6 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 2, fontSize: "26px", color: "#111827" }}
      >
        Comments
      </Typography>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          p: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <Stack divider={<Divider sx={{ my: 2 }} />} spacing={2}>
          {comments.map((comment) => (
            <Box key={comment.id}>
              {/* Comment Row */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Avatar
                  src={comment.authorAvatar || ""}
                  sx={{ width: 38, height: 38 }}
                >
                  {comment.author?.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, fontSize: "17px" }}
                    >
                      {comment.author}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ fontSize: "13px", color: "#6b7280", mt: 0.5 }}
                    >
                      {formatTime(comment.text ? comment.id : comment.timestamp)}
                    </Typography>
                  </Box>

                  {/* Comment Text */}
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.5,
                      fontSize: "16px",
                      lineHeight: 1.6,
                      color: "#1f2937",
                    }}
                  >
                    {comment.text}
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                    {/* <Tooltip title="Reply">
                      <IconButton
                        size="small"
                        onClick={() => handleReplyToggle(comment.id)}
                      >
                        <Reply fontSize="14px" />
                      </IconButton>
                    </Tooltip> */}

                    {comment.replies?.length > 0 && (
                      <Button
                        size="small"
                        onClick={() => toggleReplies(comment.id)}
                        startIcon={
                          expandedComment[comment.id] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )
                        }
                        sx={{
                          fontSize: "13px",
                          textTransform: "none",
                          fontWeight: 500,
                          color: "#6b7280",
                        }}
                      >
                        {comment.replies.length} Replies
                      </Button>
                    )}
                  </Box>

                  {/* Reply Input Box */}
                  <Collapse in={replyBox === comment.id}>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Write a reply..."
                        size="small"
                        sx={{
                          background: "#fff",
                          borderRadius: "8px",
                          "& .MuiInputBase-root": { fontSize: "15px" },
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Reply />}
                          sx={{
                            fontSize: "13px",
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 2,
                          }}
                        >
                          Post Reply
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>

                  {/* Replies List */}
                  {comment.replies?.length > 0 && (
                    <Collapse in={expandedComment[comment.id]}>
                      <Stack sx={{ mt: 3, ml: 2 }} spacing={3}>
                        {comment.replies.map((reply) => (
                          <Box key={reply.id} sx={{ display: "flex", gap: 2 }}>
                            <Avatar
                              src={reply.authorAvatar || ""}
                              sx={{ width: 32, height: 32 }}
                            >
                              {reply.author?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>
                                {reply.author}
                              </Typography>
                              <Typography sx={{ fontSize: "15px", color: "#374151", mt: 0.3 }}>
                                {reply.text}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: "12px", color: "#9ca3af" }}>
                                {formatTime(reply.timestamp)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Collapse>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Empty State */}
        {comments.length === 0 && (
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "15px",
              color: "#9ca3af",
              py: 3,
            }}
          >
            No comments yet
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CommentsSection;
