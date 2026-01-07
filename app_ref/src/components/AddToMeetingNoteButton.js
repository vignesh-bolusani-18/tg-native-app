"use client"

// src/components/AddToNotesButton/AddToNotesButton.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  Button,
  Menu,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  NoteAddOutlined,
  PushPin,
  PushPinOutlined,
  Close,
  Delete,
  Search,
  Archive,
  Unarchive,
} from "@mui/icons-material"
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { styled } from "@mui/material/styles"
import useMeetingNote from "../hooks/useMeetingNote"
import useAuth from "../hooks/useAuth"
import CustomTooltip from "./CustomToolTip";

// Styled components
const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    width: 250,
    maxHeight: 300,
    borderRadius: "12px",
    boxShadow: theme.shadows[8],
    border: `1px solid ${theme.palette.divider}`,
    padding: 0,
    backgroundColor: "#ffffff",
  },
}))

const NoteCard = styled(Box)(({ theme, pinned }) => ({
  padding: theme.spacing(1, 1.5),
  cursor: "pointer",
  transition: "all 0.2s ease",
  
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  "&:hover": {
    backgroundColor: "#f9fafb",
  },
  "&:last-child": {
    borderBottom: "none",
  },
}))

const formatTime = (dateString) => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch (error) {
    return dateString
  }
}

const AddToNotesButton = ({
  userInfo,
  currentCompany,
  experimentId,
  experimentName,
  tabName,
  onNoteCreated,
  onNoteSelected,
  setIsNotesSidebarOpen,
}) => {
  const {
    notesList,
    loadMeetingNotes,
    createMeetingNote,
    deleteMeetingNote,
    togglePinMeetingNote,
    archiveMeetingNote,
    setCurrentNote,
    loadMeetingNoteById,
    generateNotePreview,
  } = useMeetingNote()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isOpen = Boolean(anchorEl)
  const searchInputRef = useRef(null)
  const newNoteInputRef = useRef(null)
  const menuRef = useRef(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      if (isCreatingNew && newNoteInputRef.current) {
        const timer = setTimeout(() => {
          newNoteInputRef.current?.focus()
        }, 150)
        return () => clearTimeout(timer)
      } else if (!isCreatingNew && searchInputRef.current) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus()
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen, isCreatingNew])

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget)
    setError(null)
    setLoading(true)

    try {
      await loadMeetingNotes(currentCompany)
    } catch (err) {
      setError("Failed to load notes")
      console.error("Error loading notes:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
    setIsCreatingNew(false)
    setNewNoteTitle("")
    setSearchQuery("")
    setError(null)
  }

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return

    setLoading(true)
    setError(null)

    try {
      const result = await createMeetingNote(userInfo, currentCompany, {
        title: newNoteTitle.trim(),
        tags: [ tabName],
        isPinned: false,
        isArchived: false,
        meetingId: experimentId,
        metadata: {
          experimentId,
          experimentName,
          tabName,
          company: currentCompany.companyName,
          companyId: currentCompany.companyID,
          createdBy: userInfo.name || userInfo.email,
          userId: userInfo.userID,
          category: "experiment",
          context: `Analysis from ${experimentName} - ${tabName} tab`,
        },
      })

      if (result.success && result.note) {
        setCurrentNote(result.note)

        if (onNoteCreated) {
          onNoteCreated(result.note)
        }

        setNewNoteTitle("")
        setIsCreatingNew(false)
      } else {
        setError(result.message || "Failed to create note")
      }
    } catch (err) {
      setError("Error creating note")
      console.error("Error creating note:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId, event) => {
    event.stopPropagation()

    if (window.confirm("Are you sure you want to delete this note?")) {
      setLoading(true)
      try {
        const result = await deleteMeetingNote(currentCompany, noteId)
        if (!result.success) {
          setError(result.message || "Failed to delete note")
        }
      } catch (err) {
        setError("Error deleting note")
        console.error("Error deleting note:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleTogglePin = async (noteId, event) => {
    event.stopPropagation()
    setLoading(true)

    try {
      const result = await togglePinMeetingNote(currentCompany, noteId)
      if (!result.success) {
        setError(result.message || "Failed to update pin status")
      }
    } catch (err) {
      setError("Error updating pin status")
      console.error("Error toggling pin:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (noteId, isCurrentlyArchived, event) => {
    event.stopPropagation()
    setLoading(true)

    try {
      const result = await archiveMeetingNote(currentCompany, noteId, !isCurrentlyArchived)
      if (!result.success) {
        setError(result.message || "Failed to update archive status")
      }
    } catch (err) {
      setError("Error updating archive status")
      console.error("Error archiving note:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectNote = async (note) => {
    setLoading(true)

    try {
      if (onNoteSelected) {
        onNoteSelected(note)
      }

      handleClose()
    } catch (err) {
      setError("Error loading note")
      console.error("Error loading note:", err)
    } finally {
      setLoading(false)
    }
  }

  // Stop propagation for key events in text fields
  const handleSearchKeyDown = useCallback((e) => {
    // Prevent event from bubbling up to menu
    e.stopPropagation()
    
    // Handle Escape key to close menu
    if (e.key === 'Escape' && !searchQuery) {
      handleClose()
    }
  }, [searchQuery])

  const handleNewNoteKeyDown = useCallback((e) => {
    // Prevent event from bubbling up to menu
    e.stopPropagation()
    
    if (e.key === 'Enter') {
      handleCreateNote()
    } else if (e.key === 'Escape') {
      setIsCreatingNew(false)
      setNewNoteTitle("")
    }
  }, [handleCreateNote])

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleNewNoteTitleChange = useCallback((e) => {
    setNewNoteTitle(e.target.value)
  }, [])

  // Memoize filtered notes
  const filteredNotes = useMemo(() => {
    return notesList.filter((note) => {
      if (note.isArchived) return false

      const searchLower = searchQuery.toLowerCase()

      return (
        note.title.toLowerCase().includes(searchLower) ||
        (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(searchLower))) ||
        (note.preview && note.preview.toLowerCase().includes(searchLower))
      )
    })
  }, [notesList, searchQuery])

  const pinnedNotes = useMemo(() => 
    filteredNotes.filter((note) => note.isPinned), 
    [filteredNotes]
  )
  
  const unpinnedNotes = useMemo(() => 
    filteredNotes.filter((note) => !note.isPinned), 
    [filteredNotes]
  )

  return (
    <>
      <CustomTooltip title="Add to Notes" arrow>
        <IconButton
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            height: "40px",
            width: "40px",
            "&:hover": {
              backgroundColor: "#F9FAFB",
              borderColor: "#D1D5DB",
            },
          }}
          title="Add note"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : <NoteAddOutlined sx={{ fontSize: "20px", color: "#344054" }} />}
        </IconButton>
      </CustomTooltip>

      <StyledMenu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        ref={menuRef}
        // Disable auto focus to prevent focus jumping
        disableAutoFocus
        disableEnforceFocus
        // Keep menu mounted
        keepMounted
        // Prevent menu from stealing focus
        onKeyDown={(e) => {
          // Let text fields handle their own key events
          if (e.target.tagName === 'INPUT') {
            return
          }
          // Close on Escape
          if (e.key === 'Escape') {
            handleClose()
          }
        }}
      >
        <Box
          sx={{
            py: 1,
            px:1.5,
            borderBottom: "1px solid #f3f4f6",
            backgroundColor: "#ffffff",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "16px", color: "#1A1A1A" }}>
              Add to Notes
            </Typography>
            <Button
              size="small"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              sx={{
                textTransform: "none",
                color: "#333333",
                fontWeight: 500,
                fontSize: "14px",
              }}
              disabled={loading}
            >
              + New
            </Button>
          </Stack>
        </Box>

        <Box sx={{ backgroundColor: "#ffffff" }}>
          {error && (
            <Alert severity="error" sx={{ m: 2, mb: 0 }}>
              {error}
            </Alert>
          )}

          {isCreatingNew && (
            <Box sx={{ p: 2, pb: 1, borderBottom: "1px solid #f3f4f6" }}>
              <TextField
                fullWidth
                size="small"
                autoFocus
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={handleNewNoteTitleChange}
                onKeyDown={handleNewNoteKeyDown}
                inputRef={newNoteInputRef}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setIsCreatingNew(false)
                          setNewNoteTitle("")
                        }}
                        disabled={loading}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleCreateNote}
                        disabled={!newNoteTitle.trim() || loading}
                        sx={{
                          textTransform: "none",
                          minWidth: "auto",
                          px: 2,
                        }}
                      >
                        {loading ? "Creating..." : "Add"}
                      </Button>
                    </Stack>
                  ),
                }}
                // Prevent menu from handling key events
                onFocus={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          )}

          <Box sx={{ mx:1, pt:1, pb: 1 }}>
            <TextField
              inputRef={searchInputRef}
              fullWidth
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "#9ca3af", fontSize: 20, mr: 1 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#ffffff",

                  /* default */
                  "& fieldset": {
                    border: "none",
                  },

                  /* hover */
                  "&:hover fieldset": {
                    border: "none",
                  },

                  /* focus / typing → SAME grey border as before */
                  "&.Mui-focused fieldset": {
                    border: "1px solid #e5e7eb",
                  },
                },
              }}
              disabled={loading}
              // Prevent menu from handling key events
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </Box>

          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {loading && filteredNotes.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredNotes.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center", color: "#9ca3af" }}>
                {searchQuery ? "No notes found" : "No notes yet"}
              </Typography>
            ) : (
              <>
                {pinnedNotes.map((note) => (
                  <MemoizedNoteItem
                    key={note.id}
                    note={note}
                    onSelect={handleSelectNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onArchive={handleArchive}
                    setIsNotesSidebarOpen={setIsNotesSidebarOpen}
                  />
                ))}
                {unpinnedNotes.map((note) => (
                  <MemoizedNoteItem
                    key={note.id}
                    note={note}
                    onSelect={handleSelectNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onArchive={handleArchive}
                    setIsNotesSidebarOpen={setIsNotesSidebarOpen}
                  />
                ))}
              </>
            )}
          </Box>
        </Box>
      </StyledMenu>
    </>
  )
}

const NoteItem = ({ note, onSelect, onDelete, onTogglePin, onArchive, setIsNotesSidebarOpen }) => {
  const { loadMeetingNoteById } = useMeetingNote()
  const { currentCompany } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  const handleNoteClick = useCallback(async () => {
    await loadMeetingNoteById(currentCompany, note.id)
    onSelect(note)
    setTimeout(() => {
      setIsNotesSidebarOpen(true)
    }, 0)
  }, [loadMeetingNoteById, currentCompany, note, onSelect, setIsNotesSidebarOpen])

  return (
    <NoteCard
      pinned={note.isPinned}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNoteClick}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.8}
        sx={{
          flex: 1,
          minWidth: 0,
          px: 1.25,
          py: 0.75,
          borderRadius: "8px",
          transition: "background-color 0.2s ease",

          "&:hover": {
            backgroundColor: "#F9FAFB",
          },
        }}
      >
        {/* Icon */}
        <DescriptionOutlinedIcon
          sx={{
            fontSize: 16,
            color: "#6B7280",
            flexShrink: 0,
          }}
        />

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#111827",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {note.title}
        </Typography>
      </Stack>
    </NoteCard>
  )
}

// Memoize the NoteItem
const MemoizedNoteItem = React.memo(NoteItem)

export default AddToNotesButton