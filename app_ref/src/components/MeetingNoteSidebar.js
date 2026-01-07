"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Divider,
  Stack,
  Button,
  Paper,
  alpha,
  CircularProgress,
  Avatar,
  TextField,
  Chip,
  List as ListMUI,
  ListItem,
  ListItemAvatar,
  ListItemText,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Badge,
  Tooltip,
  Fade,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Menu,
  MenuItem,
  Popover,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";
import Embed from "@editorjs/embed";
import Delimiter from "@editorjs/delimiter";

import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import TagIcon from "@mui/icons-material/Tag";
import LabelIcon from "@mui/icons-material/Label";
import SaveIcon from "@mui/icons-material/Save";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import SendIcon from "@mui/icons-material/Send";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import {
  updateMeetingNote,
  addTagToMeetingNote,
  removeTagFromMeetingNote,
} from "../redux/actions/meetingNoteActions";
import useAuth from "../hooks/useAuth";
import store from "../redux/store";
import { generatePresignedUrl, uploadImageToS3 } from "../utils/s3Utils";

// ==================== STYLED COMPONENTS ====================
const SidebarContainer = styled(Paper)(({ theme }) => ({
  width: 750,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 0,
  overflow: "hidden",
  backgroundColor: "#ffffff",
}));

const SidebarHeaderNew = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const EditorContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: "#ffffff",
  overflowY: "auto",
  position: "relative",
  minHeight: "calc(100vh - 300px)",
}));

const EditorWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: "500px",

  "& .codex-editor": {
    fontFamily: "'Inter', sans-serif",
  },

  "& .ce-block": {
    margin: "0.75rem 0",
  },

  "& .ce-header": {
    fontWeight: 600,
    marginBottom: "0.5rem",

    "& h1": {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#1a1a1a",
    },

    "& h2": {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#1a1a1a",
    },

    "& h3": {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: "#333",
    },
  },

  "& .ce-paragraph": {
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#333",
  },

  "& .ce-quote": {
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    paddingLeft: "1rem",
    color: "#666",
    fontStyle: "italic",
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
    padding: "0.75rem",
    borderRadius: "4px",
  },

  "& .cdx-list": {
    paddingLeft: "1.5rem",

    "&__item": {
      marginBottom: "0.25rem",
    },
  },

  "& .ce-code": {
    backgroundColor: "#f5f5f5",
    padding: "1rem",
    borderRadius: "4px",
    fontFamily: "'SF Mono', monospace",
    fontSize: "14px",
    lineHeight: 1.5,
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const CommentsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: "#ffffff",
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
}));

const CommentCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#ffffff",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
}));

const CommentReplyCard = styled(Box)(({ theme }) => ({
  backgroundColor: "#fafafa",
  borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(1.5),
  marginLeft: theme.spacing(6),
}));

// Comments Sidebar Component
const CommentsSidebar = ({
  open,
  onClose,
  comments,
  onAddComment,
  onReply,
  onDelete,
}) => {
  const { userInfo } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleDeleteClick = () => {
    setCommentToDelete(selectedComment);
    setDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      onDelete(commentToDelete.id);
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleSubmitReply = (commentId) => {
    if (!replyText.trim()) return;
    onReply(commentId, replyText);
    setReplyText("");
    setReplyToCommentId(null);
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <Dialog
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      aria-labelledby="delete-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <WarningAmberIcon
            sx={{ fontSize: 48, color: "warning.main", mb: 2 }}
          />
          <DialogTitle
            id="delete-dialog-title"
            sx={{ fontWeight: 600, fontSize: "1.25rem", p: 0 }}
          >
            Delete Comment
          </DialogTitle>
        </Box>
        <DialogContentText
          sx={{ textAlign: "center", color: "text.secondary" }}
        >
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button
          onClick={() => setDeleteModalOpen(false)}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmDelete}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          sx={{ minWidth: 100 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{
          BackdropProps: {
            style: {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            },
          },
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: 400,
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            borderLeft: "1px solid #e0e0e0",
            boxShadow: "-2px 0 12px rgba(0,0,0,0.08)",
          },
          "& .MuiBackdrop-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Comments Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e0e0e0",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ChatBubbleOutlineIcon /> Comments ({comments.length})
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Add Comment Input */}
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: "text.secondary" }}
            >
              Add a comment
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Avatar
                src={userInfo?.avatar}
                alt={userInfo?.userName}
                sx={{ width: 32, height: 32, mt: 0.5 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Write your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (newComment.trim()) {
                    onAddComment(newComment);
                    setNewComment("");
                  }
                }}
                disabled={!newComment.trim()}
                sx={{
                  minWidth: "auto",
                  px: 1.5,
                  height: "40px",
                  alignSelf: "flex-end",
                }}
              >
                <SendIcon fontSize="small" />
              </Button>
            </Box>
          </Box>

          {/* Comments List */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              backgroundColor: "#ffffff",
            }}
          >
            {comments.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "text.secondary",
                }}
              >
                <ChatBubbleOutlineIcon
                  sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}
                />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No comments yet
                </Typography>
                <Typography variant="body2">
                  Start the conversation by adding the first comment
                </Typography>
              </Box>
            ) : (
              comments.map((comment) => (
                <CommentCard key={comment.id}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                      <Avatar
                        src={comment.authorAvatar}
                        alt={comment.author}
                        sx={{ width: 36, height: 36 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {comment.author}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(comment.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, comment)}
                            sx={{ color: "text.secondary" }}
                          >
                            <MoreHorizIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1.5, lineHeight: 1.6 }}
                        >
                          {comment.text}
                        </Typography>

                        {/* Comment Actions */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 2,
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={<ReplyIcon />}
                            onClick={() =>
                              setReplyToCommentId(
                                comment.id === replyToCommentId
                                  ? null
                                  : comment.id
                              )
                            }
                            sx={{
                              color: "text.secondary",
                              textTransform: "none",
                              fontSize: "0.75rem",
                            }}
                          >
                            Reply
                          </Button>
                        </Box>

                        {/* Reply Input */}
                        {replyToCommentId === comment.id && (
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              variant="outlined"
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Button
                                size="small"
                                onClick={() => setReplyToCommentId(null)}
                                sx={{ textTransform: "none" }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyText.trim()}
                                sx={{ textTransform: "none" }}
                              >
                                Reply
                              </Button>
                            </Box>
                          </Box>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            {comment.replies.map((reply) => (
                              <CommentReplyCard key={reply.id}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      alignItems: "center",
                                    }}
                                  >
                                    <Avatar
                                      src={reply.authorAvatar}
                                      alt={reply.author}
                                      sx={{ width: 24, height: 24 }}
                                    />
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {reply.author}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.875rem", mt: 0.5 }}
                                >
                                  {reply.text}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mt: 0.5 }}
                                >
                                  {new Date(
                                    reply.timestamp
                                  ).toLocaleDateString()}
                                </Typography>
                              </CommentReplyCard>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </CommentCard>
              ))
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      {/* Menu for Comment Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 120,
            borderRadius: 1,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            color: "error.main",
            fontSize: "0.875rem",
            py: 1,
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

class SimpleImageLike {
  static get toolbox() {
    return {
      title: "Image",
      icon: "🖼",
    };
  }

  constructor({ data }) {
    this.data = data;
  }

  render() {
    const wrapper = document.createElement("div");

    // 🟢 If an image URL or base64 already exists, render the image
    if (this.data.url) {
      const img = document.createElement("img");
      img.src = this.data.url;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "8px";
      img.style.marginTop = "10px";
      wrapper.appendChild(img);
      return wrapper;
    }

    // 🟡 Otherwise show input only for new insert
    const input = document.createElement("input");
    input.placeholder = "Paste image URL and press Enter";
    input.style.width = "100%";
    input.style.padding = "10px";
    input.style.border = "1px solid #e5e7eb";
    input.style.borderRadius = "8px";
    input.style.fontSize = "16px";
    input.style.outline = "none";

    // Allow normal paste into input without Editor.js creating new block
    input.addEventListener("paste", (e) => e.stopPropagation());

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        e.preventDefault();
        this.insertImage(input.value.trim(), input);
      }
    });

    wrapper.appendChild(input);
    return wrapper;
  }

  insertImage(url, input) {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "8px";
    img.style.marginTop = "10px";
    input.replaceWith(img);
    this.data.url = url;
  }

  save() {
    return {
      url: this.data.url || "",
    };
  }

  // 🔥 Global paste handler support for base64 images
  static pasteConfig = {
    tags: ["IMG"],
    patterns: {
      image: /(data:image\/(png|jpg|jpeg|webp|gif);base64,)/i,
    },
  };

  onPaste(event) {
    const item = event.clipboardData?.items[0];

    // If user copies an actual image and pastes it
    if (item && item.type.includes("image")) {
      event.preventDefault();
      item
        .getAsFile()
        .arrayBuffer()
        .then((buffer) => {
          const base64 = Buffer.from(buffer).toString("base64");
          const dataUrl = `data:${item.type};base64,${base64}`;

          event.editor.blocks.insert("image", {
            url: dataUrl,
            caption: "",
            withBorder: false,
            stretched: false,
          });
        });
    }
  }
}

// ==================== MAIN COMPONENT ====================
const MeetingNoteSidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { currentCompany, userInfo } = useAuth();

  // Get current note from Redux
  const currentNote = useSelector((state) => state.meetingNotes?.currentNote);

  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New state for editable title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // New state for tags
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState([]);

  // New state for comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    const handlePaste = async (event) => {
      if (!editorInstanceRef.current) return;

      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      // Check for image files in clipboard
      const items = Array.from(clipboardData.items);
      const imageItem = items.find((item) => item.type.indexOf("image") !== -1);

      if (imageItem) {
        event.preventDefault();
        const file = imageItem.getAsFile();
        const reader = new FileReader();

        reader.onload = (e) => {
          const imageUrl = e.target.result;
          // Insert image using data URL
          editorInstanceRef.current.blocks.insert("image", {
            url: imageUrl,
            caption: "",
            withBorder: false,
            stretched: false,
          });
        };

        reader.readAsDataURL(file);
        return;
      }

      // Check for image URLs in text
      const text = clipboardData.getData("text") || "";
      const imageUrlRegex = /(https?:\/\/\S+\.(png|jpg|jpeg|webp|gif))/i;
      const match = text.match(imageUrlRegex);

      if (match) {
        event.preventDefault();
        editorInstanceRef.current.blocks.insert("image", {
          url: match[0],
          caption: "",
          withBorder: false,
          stretched: false,
        });
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Initialize data from currentNote
  useEffect(() => {
    if (currentNote) {
      setEditedTitle(currentNote.title || "");
      setTags(currentNote.tags || []);
      setComments(currentNote.comments || []);
    }
  }, [currentNote]);

  // Initialize Editor.js
  const initializeEditor = useCallback(async () => {
    if (!editorRef.current) return;

    if (editorInstanceRef.current) {
      try {
        await editorInstanceRef.current.destroy();
      } catch (err) {
        console.error("Destroy error:", err);
      }
      editorInstanceRef.current = null;
    }

    try {
      const rawContent = currentNote?.content || {
        time: Date.now(),
        blocks: [
          {
            type: "paragraph",
            data: { text: "" },
          },
        ],
      };

      console.log("rawContent", rawContent);

      const initialData = await prepareContentForEditor(rawContent);
      console.log("initialData", initialData);
      const editor = new EditorJS({
        holder: editorRef.current,
        placeholder: "Start typing your note...",
        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          header: {
            class: Header,
            config: {
              placeholder: "Enter a header",
              levels: [1, 2, 3],
              defaultLevel: 2,
            },
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: "Enter a quote",
              captionPlaceholder: "Quote's author",
            },
          },
          code: {
            class: Code,
            config: {
              placeholder: "Enter your code here...",
            },
          },

          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  try {
                    const fileName = `img-${Date.now()}-${file.name}`;
                    const companyPrefix = `${currentCompany.companyName}_${currentCompany.companyID}`;
                    const s3Path = `accounts/${companyPrefix}/meeting_notes/assets/images/${fileName}`;

                    // Upload to S3
                    await uploadImageToS3(s3Path, file);

                    // Get presigned URL for display in the editor
                    const { presignedUrl, success } =
                      await generatePresignedUrl({ filePath: s3Path });

                    return {
                      success: 1,
                      file: {
                        // What the editor will actually render:
                        url: success && presignedUrl ? presignedUrl : s3Path,
                        // Original S3 path we want to store in DB:
                        s3Path,
                      },
                    };
                  } catch (err) {
                    console.error("S3 Upload Failed:", err);
                    return { success: 0 };
                  }
                },

                async uploadByUrl(url) {
                  // For pasted URLs, just store URL as-is (or add similar S3 logic if needed)
                  return {
                    success: 1,
                    file: { url },
                  };
                },
              },
             pasteConfig: { enabled: false }, 
            },
          },

          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                vimeo: true,
                instagram: true,
                twitter: true,
                facebook: true,
              },
            },
          },
          delimiter: Delimiter,
          table: Table,
        },
        data: initialData || {
          time: Date.now(),
          blocks: [
            {
              type: "paragraph",
              data: {
                text: "",
              },
            },
          ],
        },
        onReady: () => {
          setIsLoading(false);
          console.log("Editor.js is ready to work!");
        },

        onChange: () => {
          // Handle changes if needed
        },
      });

      editorInstanceRef.current = editor;
      const note = store.getState().meetingNotes.currentNote?.content;
    
    } catch (error) {
      console.error("Failed to initialize editor:", error);
      setIsLoading(false);
    }
  }, [currentNote?.content]);

  // Destroy editor on unmount
  const destroyEditor = useCallback(async () => {
    if (editorInstanceRef.current) {
      try {
        await editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      } catch (error) {
        console.error("Error destroying editor:", error);
      }
    }
  }, []);

  // Initialize/destroy editor based on open state
  useEffect(() => {
    if (open && currentNote) {
      initializeEditor();
    } else {
      destroyEditor();
    }

    return () => {
      if (!open) {
        destroyEditor();
      }
    };
  }, [open, currentNote, currentNote.content, initializeEditor, destroyEditor]);

  // Handle save
// Update the handleSave function
const handleSave = async () => {
  if (!editorInstanceRef.current || !currentNote) return;

  setIsSaving(true);

  try {
    const savedData = await editorInstanceRef.current.save();

    // Normalize images: ensure consistent format for saving
    const normalizedContent = {
      ...savedData,
      blocks:
        savedData.blocks?.map((block) => {
          if (block.type === "image" && block.data?.file) {
            const { file, ...restData } = block.data;
            
            // Extract the S3 path if it exists, otherwise use the URL
            const s3Path = file.s3Path || file.url;
            const displayUrl = file.url;
            
            return {
              ...block,
              data: {
                ...restData,
                file: {
                  url: s3Path, // Always store the S3 path in DB
                  ...(file.s3Path && { s3Path: file.s3Path }), // Keep s3Path if it exists
                },
              },
            };
          }
          return block;
        }) || [],
    };

    const updates = {
      content: normalizedContent,
      title: editedTitle || "Untitled",
      tags,
      comments,
      updatedAt: new Date().toISOString(),
    };

    await dispatch(
      updateMeetingNote(currentCompany, currentNote.id, updates)
    );
    console.log("Note saved successfully");
  } catch (error) {
    console.error("Failed to save note:", error);
  } finally {
    setIsSaving(false);
  }
};

  // Helper
// Update the prepareContentForEditor function in MeetingNoteSidebar
const prepareContentForEditor = async (content) => {
  if (!content || !content.blocks) return content;

  const blocks = await Promise.all(
    content.blocks.map(async (block) => {
      if (block.type === "image" && block.data) {
        const fileUrl = block.data?.file?.url || block.data?.url;
        
        // If there's no URL at all, return the block as-is
        if (!fileUrl) return block;

        // Check if it's an S3 path
        const isS3Path = fileUrl.startsWith("accounts/");
        
        // For the editor, we need to make sure we preserve BOTH:
        // 1. The display URL (presigned for S3, direct for others)
        // 2. The original S3 path for saving back to DB
        
        if (isS3Path) {
          try {
            const { presignedUrl, success } = await generatePresignedUrl({
              filePath: fileUrl,
              expiryMinutes: 60,
            });

            if (success && presignedUrl) {
              // Return block with both URLs preserved
              return {
                ...block,
                data: {
                  ...block.data,
                  file: {
                    // What the editor will actually render:
                    url: presignedUrl,
                    // Original S3 path we want to store in DB:
                    s3Path: fileUrl,
                  },
                },
              };
            } else {
              // If presigned URL generation fails, still keep the original
              return {
                ...block,
                data: {
                  ...block.data,
                  file: {
                    url: fileUrl, // Original URL as fallback
                    s3Path: fileUrl,
                  },
                },
              };
            }
          } catch (e) {
            console.error("Error generating presigned URL for image:", e);
            // On error, preserve the original structure
            return {
              ...block,
              data: {
                ...block.data,
                file: {
                  url: fileUrl,
                  s3Path: fileUrl,
                },
              },
            };
          }
        } else {
          // For non-S3 URLs (external URLs or data URLs)
          // Preserve the original URL structure
          if (block.data.file) {
            // Already has file object, keep it
            return block;
          } else {
            // Convert old format to new format
            return {
              ...block,
              data: {
                ...block.data,
                file: {
                  url: fileUrl,
                  // No s3Path for external URLs
                },
              },
            };
          }
        }
      }
      return block;
    })
  );

  return { ...content, blocks };
};
  // Handle title editing
  const handleTitleEditStart = () => {
    setIsEditingTitle(true);
    setEditedTitle(currentNote?.title || "");
  };

  const handleTitleEditSave = () => {
    setIsEditingTitle(false);
    // Title is saved when handleSave is called
  };

  const handleTitleEditCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle(currentNote?.title || "");
  };

  // Handle tags
  const handleAddTag = async () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;

    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag("");
    setIsAddingTag(false);

    // Update immediately or batch with save
    try {
      await dispatch(
        addTagToMeetingNote(currentCompany, currentNote.id, newTag.trim())
      );
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);

    try {
      await dispatch(
        removeTagFromMeetingNote(currentCompany, currentNote.id, tagToRemove)
      );
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  // Handle comments
  const handleAddComment = (commentText) => {
    if (!commentText.trim()) return;

    const newCommentObj = {
      id: Date.now().toString(),
      text: commentText.trim(),
      author: userInfo?.userName || "Anonymous",
      authorAvatar: userInfo?.avatar || "",
      timestamp: new Date().toISOString(),
      replies: [],
    };

    setComments((prev) => [...prev, newCommentObj]);
  };

  const handleReplyToComment = (commentId, replyText) => {
    if (!replyText.trim()) return;

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...(comment.replies || []),
            {
              id: Date.now().toString(),
              text: replyText.trim(),
              author: userInfo?.userName || "Anonymous",
              authorAvatar: userInfo?.avatar || "",
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return comment;
    });

    setComments(updatedComments);
  };

  const handleDeleteComment = (commentId) => {
    // Delete main comment
    const updatedComments = comments.filter(
      (comment) => comment.id !== commentId
    );
    setComments(updatedComments);
  };

  const handleDeleteReply = (commentId, replyId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: (comment.replies || []).filter(
            (reply) => reply.id !== replyId
          ),
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <Dialog
      open={deleteModalOpen}
      onClose={() => {
        setDeleteModalOpen(false);
        setCommentToDelete(null);
      }}
      aria-labelledby="delete-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <WarningAmberIcon
            sx={{ fontSize: 48, color: "warning.main", mb: 2 }}
          />
          <DialogTitle
            id="delete-dialog-title"
            sx={{ fontWeight: 600, fontSize: "1.25rem", p: 0 }}
          >
            Delete {commentToDelete?.author ? "Comment" : "Reply"}
          </DialogTitle>
        </Box>
        <DialogContentText
          sx={{ textAlign: "center", color: "text.secondary" }}
        >
          Are you sure you want to delete this{" "}
          {commentToDelete?.author ? "comment" : "reply"}? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button
          onClick={() => {
            setDeleteModalOpen(false);
            setCommentToDelete(null);
          }}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (commentToDelete) {
              // Check if it's a reply (has parent comment ID) or main comment
              if (commentToDelete.parentCommentId) {
                handleDeleteReply(
                  commentToDelete.parentCommentId,
                  commentToDelete.id
                );
              } else {
                handleDeleteComment(commentToDelete.id);
              }
            }
          }}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          sx={{ minWidth: 100 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Handle keyboard shortcuts
  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      handleSave();
    }
  };

  if (!currentNote || !open) {
    return null;
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={async () => {
  await handleSave();
  onClose();
}}
        variant="persistent"
        sx={{
          "& .MuiDrawer-paper": {
            width: 750,
            boxSizing: "border-box",
            borderLeft: "1px solid #e0e0e0",
          },
        }}
      >
        <SidebarContainer onKeyDown={handleKeyDown}>
          {/* Note Header Section */}
          <SidebarHeaderNew>
            <Box sx={{ px: 5, pt: 3 }}>
              {/* Top actions row */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2.5}
              >
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={onClose}>
                    <ChevronLeftOutlinedIcon fontSize="small" />
                  </IconButton>
                  {/* <IconButton size="small">
                    <OpenInFullOutlinedIcon fontSize="small" />
                  </IconButton> */}
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="text"
                    sx={{
                      textTransform: "none",
                      color: "text.primary",
                      fontWeight: 500,
                    }}
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Badge badgeContent={comments.length} color="primary">
                    <Tooltip title="Comments">
                      <IconButton
                        size="small"
                        onClick={() => setShowCommentsSidebar(true)}
                        color={showCommentsSidebar ? "primary" : "default"}
                      >
                        <ChatBubbleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Badge>
                </Stack>
              </Box>

              {/* Title Section - Editable */}
              <Box sx={{ mb: 2 }}>
                {isEditingTitle ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      fullWidth
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTitleEditSave();
                        if (e.key === "Escape") handleTitleEditCancel();
                      }}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "2rem",
                          fontWeight: 700,
                          fontFamily: "Inter",
                        },
                      }}
                      autoFocus
                    />
                    <IconButton onClick={handleTitleEditSave} color="primary">
                      <CheckIcon />
                    </IconButton>
                    <IconButton onClick={handleTitleEditCancel}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.2,
                        fontFamily: "Inter",
                        color: "#1A1A1A",
                        flexGrow: 1,
                      }}
                    >
                      {editedTitle || "Untitled"}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleTitleEditStart}
                      sx={{ mt: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Tags Section */}
              <Box sx={{ mb: 2 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <TagIcon fontSize="small" /> Tags
                  </Typography>
                  {!isAddingTag && (
                    <Button
                      startIcon={<AddOutlinedIcon />}
                      size="small"
                      onClick={() => setIsAddingTag(true)}
                      sx={{ textTransform: "none" }}
                    >
                      Add Tag
                    </Button>
                  )}
                </Box>

                <TagsContainer>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      onDelete={() => handleRemoveTag(tag)}
                      deleteIcon={<CloseIcon fontSize="small" />}
                      icon={<LabelIcon fontSize="small" />}
                      sx={{
                        backgroundColor: alpha("#1976d2", 0.1),
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  ))}

                  {isAddingTag && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TextField
                        size="small"
                        placeholder="Enter tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTag();
                          if (e.key === "Escape") setIsAddingTag(false);
                        }}
                        sx={{ width: 120 }}
                        autoFocus
                      />
                      <IconButton size="small" onClick={handleAddTag}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setIsAddingTag(false)}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </TagsContainer>
              </Box>

              {/* Metadata row */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ color: "text.secondary", mb: 3 }}
              >
                {/* Creator */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src="/avatar.png"
                    alt={currentNote.createdBy}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2">
                    Created by <strong>{currentNote.createdBy || "N/A"}</strong>
                  </Typography>
                </Stack>

                <Divider orientation="vertical" flexItem />

                {/* Last updated */}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
                  <Typography variant="body2">
                    Last updated {currentNote.updatedAt}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </SidebarHeaderNew>

          {/* Editor Container */}
          <EditorContainer>
            {isLoading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="400px"
              >
                <CircularProgress />
              </Box>
            ) : (
              <EditorWrapper>
                <div ref={editorRef} />
              </EditorWrapper>
            )}
          </EditorContainer>

          {/* Quick Comments Preview */}
          <Collapse in={showComments}>
            <CommentsContainer>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ChatBubbleOutlineIcon /> Recent Comments
              </Typography>

              {/* Add Comment Quick Input */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a quick comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      if (newComment.trim()) {
                        handleAddComment(newComment);
                        setNewComment("");
                      }
                    }}
                    disabled={!newComment.trim()}
                    startIcon={<SendIcon />}
                  >
                    Add Comment
                  </Button>
                </Box>
              </Box>

              {/* Recent Comments List */}
              {comments.slice(0, 3).map((comment) => (
                <CommentCard key={comment.id}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Avatar
                        src={comment.authorAvatar}
                        alt={comment.author}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {comment.text}
                        </Typography>
                        {comment.replies && comment.replies.length > 0 && (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{ mt: 0.5, display: "block" }}
                          >
                            {comment.replies.length}{" "}
                            {comment.replies.length === 1 ? "reply" : "replies"}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </CommentCard>
              ))}

              {comments.length > 3 && (
                <Button
                  fullWidth
                  onClick={() => setShowCommentsSidebar(true)}
                  sx={{ mt: 1 }}
                >
                  View all {comments.length} comments
                </Button>
              )}
            </CommentsContainer>
          </Collapse>

          {/* Footer */}
          <Box
            sx={{
              padding: "12px 16px",
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Press Ctrl+S to save
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={() => {
                  setShowComments(!showComments);
                  if (!showComments && comments.length > 0) {
                    setShowCommentsSidebar(true);
                  }
                }}
                variant={showComments ? "contained" : "outlined"}
              >
                {showComments
                  ? "Hide Comments"
                  : `Comments (${comments.length})`}
              </Button>
            </Box>
          </Box>
        </SidebarContainer>
      </Drawer>

      {/* Comments Sidebar */}
      <CommentsSidebar
        open={showCommentsSidebar}
        onClose={() => setShowCommentsSidebar(false)}
        comments={comments}
        onAddComment={handleAddComment}
        onReply={handleReplyToComment}
        onDelete={handleDeleteComment}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </>
  );
};

export default MeetingNoteSidebar;
