import React, { useState, useMemo } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useVibe } from "../../../../hooks/useVibe";

const ConversationSidebar = ({ onNewChat, isOpen = true, onToggle }) => {
  const {
    currentConversationId,
    switchToConversation,
    deleteConversationById,
    conversationList,
  } = useVibe();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversationList;

    const query = searchQuery.toLowerCase();
    return conversationList.filter(
      (conversation) =>
        conversation.title.toLowerCase().includes(query) ||
        conversation.lastMessagePreview.toLowerCase().includes(query) ||
        conversation.workflowName.toLowerCase().includes(query)
    );
  }, [conversationList, searchQuery]);

  const handleConversationClick = (conversationId) => {
    switchToConversation(conversationId);
    // Navigation is now handled by useVibe hook
  };

  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      deleteConversationById(conversationToDelete.id);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  // Menu handlers
  const handleMenuOpen = (event, conversation) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConversation(null);
  };

  const handleDeleteFromMenu = () => {
    if (selectedConversation) {
      setConversationToDelete(selectedConversation);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px 0 0 12px",
        overflow: "hidden",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          borderTopLeftRadius: "12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#111827",
                fontSize: "1rem",
              }}
            >
              Chats
            </Typography>
          </Box>

          {onToggle && (
            <Tooltip title="Hide sidebar">
              <IconButton
                onClick={onToggle}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  color: "#6b7280",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <KeyboardDoubleArrowLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* New Chat Button */}
        <Button
          onClick={onNewChat}
          fullWidth
          startIcon={<EditIcon sx={{ fontSize: 18, color: "#6b7280" }} />}
          sx={{
            backgroundColor: "#f8fafc",
            color: "#374151",
            border: "none",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            py: 1.5,
            px: 2,
            mb: 2,
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            "&:hover": {
              backgroundColor: "#f1f5f9",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            },
            "&:active": {
              backgroundColor: "#e2e8f0",
            },
          }}
        >
          New chat
        </Button>

        {/* Search Input */}
        {/* <TextField
          size="small"
          placeholder="Search chats"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#ffffff",
              borderRadius: "6px",
              "& fieldset": {
                borderColor: "#d1d5db",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "#9ca3af",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#3b82f6",
                borderWidth: "1px",
              },
            },
            "& .MuiInputBase-input": {
              fontSize: "0.875rem",
              padding: "8px 12px",
              color: "#111827",
              "&::placeholder": {
                color: "#9ca3af",
                opacity: 1,
              },
            },
          }}
        /> */}
      </Box>

      {/* Conversation List */}
      <Box sx={{ flex: 1, overflow: "auto", backgroundColor: "#ffffff" }}>
        {filteredConversations.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: "#6b7280",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {searchQuery ? (
              <>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  No conversations found
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  No conversations yet
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredConversations.map((conversation, index) => (
              <React.Fragment key={conversation.id}>
                <ListItem
                  disablePadding
                  sx={{
                    backgroundColor:
                      conversation.id === currentConversationId
                        ? "#f3f4f6"
                        : "transparent",
                    borderRadius: "6px",
                    mb: 0.5,
                  }}
                >
                  <ListItemButton
                    onClick={() => handleConversationClick(conversation.id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#111827",
                            fontSize: "0.875rem",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {truncateTitle(conversation.title, 25)}
                        </Typography>
                      }
                    />
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Tooltip title="More options" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, conversation)}
                          sx={{
                            width: 24,
                            height: 24,
                            opacity: 0.6,
                            color: "#9ca3af",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: "#f3f4f6",
                              color: "#374151",
                            },
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < filteredConversations.length - 1 && (
                  <Divider
                    sx={{ mx: 2, opacity: 0.3, borderColor: "#e5e7eb" }}
                  />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#dc2626",
            fontWeight: 700,
            fontSize: "1.125rem",
            pb: 1,
          }}
        >
          Delete Conversation
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography
            variant="body1"
            sx={{ mb: 2, color: "#111827", fontWeight: 500 }}
          >
            Are you sure you want to delete "{conversationToDelete?.title}"?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", lineHeight: 1.5 }}
          >
            This action cannot be undone. All messages in this conversation will
            be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              fontWeight: 500,
              borderRadius: "8px",
              px: 3,
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: "#dc2626",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)",
              "&:hover": {
                backgroundColor: "#b91c1c",
                boxShadow: "0 4px 8px rgba(220, 38, 38, 0.4)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e5e7eb",
            minWidth: 160,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={handleDeleteFromMenu}
          sx={{
            color: "#dc2626",
            fontSize: "0.875rem",
            py: 1,
            px: 2,
            "&:hover": {
              backgroundColor: "#fef2f2",
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConversationSidebar;
