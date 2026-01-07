"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Search, MoreVert, PushPin } from "@mui/icons-material"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import useMeetingNote from "../hooks/useMeetingNote"
import { useNavigate } from "react-router-dom"

const formatDate = (dateString) => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch (error) {
    return dateString
  }
}

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const ReportsList = ({ userInfo, currentCompany, onReportSelected, setIsNotesSidebarOpen }) => {
  const {
    notesList,
    loadMeetingNotes,
    createMeetingNote,
    deleteMeetingNote,
    togglePinMeetingNote,
    archiveMeetingNote,
    setCurrentNote,
    loadMeetingNoteById,
  } = useMeetingNote()
   
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newReportTitle, setNewReportTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const navigate = useNavigate();
  useEffect(() => {
    loadNotesOnMount()
  }, [])

  const loadNotesOnMount = async () => {
    setLoading(true)
    try {
      await loadMeetingNotes(currentCompany)
    } catch (err) {
      setError("Failed to load reports")
      console.error("Error loading reports:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMenuOpen = (event, report) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedReport(report)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedReport(null)
  }

  const handlePinReport = async () => {
    if (!selectedReport) return

    try {
      const result = await togglePinMeetingNote(currentCompany, selectedReport.id)
      if (!result.success) {
        setError(result.message || "Failed to update pin status")
      } else {
        await loadMeetingNotes(currentCompany)
      }
    } catch (err) {
      setError("Error updating pin status")
      console.error("Error toggling pin:", err)
    } finally {
      setLoading(false)
      handleMenuClose()
    }
  }

  const handleArchiveReport = async () => {
    if (!selectedReport) return
    setLoading(true)

    try {
      const result = await archiveMeetingNote(currentCompany, selectedReport.id, !selectedReport.isArchived)
      if (!result.success) {
        setError(result.message || "Failed to update archive status")
      } else {
        await loadMeetingNotes(currentCompany)
      }
    } catch (err) {
      setError("Error updating archive status")
      console.error("Error archiving report:", err)
    } finally {
      setLoading(false)
      handleMenuClose()
    }
  }

  const handleDeleteFromMenu = async () => {
    if (!selectedReport) return

    if (window.confirm("Are you sure you want to delete this report?")) {
      setLoading(true)
      try {
        const result = await deleteMeetingNote(currentCompany, selectedReport.id)
        if (result.success) {
          await loadMeetingNotes(currentCompany)
        } else {
          setError(result.message || "Failed to delete report")
        }
      } catch (err) {
        setError("Error deleting report")
        console.error("Error deleting report:", err)
      } finally {
        setLoading(false)
        handleMenuClose()
      }
    }
  }

  const handleCreateReport = async () => {
    if (!newReportTitle.trim()) return

    setLoading(true)
    setError(null)

    try {
      const result = await createMeetingNote(userInfo, currentCompany, {
        title: newReportTitle.trim(),
        tags: ["report"],
        isPinned: false,
        isArchived: false,
        meetingId: "N/A",
        metadata: {
          experimentId: "N/A",
          experimentName: "N/A",
          tabName: "N/A",
          company: currentCompany.companyName,
          companyId: currentCompany.companyID,
          createdBy: userInfo.name || userInfo.email,
          userId: userInfo.userID,
          category: "report",
          context: "General report created outside of experiments",
        },
      })

      if (result.success && result.note) {
        setCurrentNote(result.note)

        if (onReportSelected) {
          onReportSelected(result.note)
        }

        setNewReportTitle("")
        setIsCreatingNew(false)

        await loadMeetingNotes(currentCompany)
      } else {
        setError(result.message || "Failed to create report")
      }
    } catch (err) {
      setError("Error creating report")
      console.error("Error creating report:", err)
    } finally {
      setLoading(false)
    }
  }
  const toSlug = (text) => {
  return text
    .toString()
    .normalize("NFKD")                 // handle accents/unicode
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")      // remove unsafe chars
    .replace(/[\s_-]+/g, "-")          // convert spaces & _ to -
    .replace(/^-+|-+$/g, "");          // remove leading/trailing -
};

  const handleSelectReport = async (report) => {
    setLoading(true)

    try {
      await loadMeetingNoteById(currentCompany, report.id)

      if (onReportSelected) {
        onReportSelected(report)
      }

      if (setIsNotesSidebarOpen) {
        setIsNotesSidebarOpen(true)
      }

       navigate(`/${currentCompany.companyName}/meeting-notes/meeting-note-display/${report.id}/${toSlug(report.title)}`);
    } catch (err) {
      setError("Error loading report")
      console.error("Error loading report:", err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredReports = () => {
    let filtered = notesList.filter((report) => {
      if (report.isArchived) return false

      const searchLower = searchQuery.toLowerCase()

      return (
        report.title.toLowerCase().includes(searchLower) ||
        (report.tags && report.tags.some((tag) => tag.toLowerCase().includes(searchLower))) ||
        (report.preview && report.preview.toLowerCase().includes(searchLower))
      )
    })

    if (activeTab === 1) {
      filtered = filtered.filter(
        (report) => report.metadata?.createdBy === userInfo.name || report.metadata?.createdBy === userInfo.email,
      )
    } else if (activeTab === 2) {
      filtered = filtered.filter(
        (report) => report.metadata?.createdBy !== userInfo.name && report.metadata?.createdBy !== userInfo.email,
      )
    }

    return filtered
  }
   const normalizeDate = (dateStr) =>
    new Date(dateStr.replace(" at ", " "));


  const filteredReports = getFilteredReports()
  const pinnedReports = filteredReports.filter((report) => report.isPinned)
  const unpinnedReports = filteredReports.filter((report) => !report.isPinned)

  return (
    <Box sx={{ px: 5, py: 10 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "#1A1A1A", fontSize: "20px" }}>
          Meeting notes
        </Typography>
         <Button
  variant="contained"
  onClick={() => setIsCreatingNew(true)}
  disabled={loading}
  sx={{
    textTransform: "none",
    fontWeight: 500,

    backgroundColor: "#FFFFFF",
    color: "#111827", // near-black text
    boxShadow: "none",
    border: "1px solid transparent",
    transition: "border-color 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      backgroundColor: "#FFFFFF",
      borderColor: "#E5E7EB", // subtle gray border
      boxShadow: "none",
    },

    "&:active": {
      borderColor: "#D1D5DB",
    },

    "&.Mui-disabled": {
      backgroundColor: "#FFFFFF",
      color: "#9CA3AF",
      borderColor: "transparent",
    },
  }}
>
  + New note
</Button>

      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              minHeight: "auto",
              py: 1.5,
            },
          }}
        >
          <Tab label="All reports" id="tab-0" />
        </Tabs>
      <TextField
          size="small"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: <Search sx={{ color: "#9ca3af", fontSize: 18 }} />,
          }}
          sx={{
            width: "250px",
            // "& .MuiOutlinedInput-root": {
            //   backgroundColor: "#ffffff",
            //   "& fieldset": {
            //     border: "1px solid #e5e7eb",
            //   },
            //   "&:hover fieldset": {
            //     border: "1px solid #d1d5db",
            //   },
            //   "&.Mui-focused fieldset": {
            //     border: "1px solid #6366f1",
            //   },
            // },
          }}
          disabled={loading}
        />
      
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        
      </Box>

      {loading && filteredReports.length === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && filteredReports.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 2 }} />
          <Typography color="text.secondary" sx={{ color: "#9ca3af" }}>
            {searchQuery ? "No reports found" : "No reports yet"}
          </Typography>
        </Box>
      )}

      {!loading && filteredReports.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
            backgroundColor: "#ffffff",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#ffffff",
                  borderBottom: "none",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#6B7280",
                    fontSize: "12px",
                    py: 2.5,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#6B7280",
                    fontSize: "12px",
                    py: 2.5,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Created by
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#6B7280",
                    fontSize: "12px",
                    py: 2.5,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Last updated
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#6B7280",
                    fontSize: "12px",
                    py: 2.5,
                    borderBottom: "1px solid #e5e7eb",
                    width: "50px",
                  }}
                >
                  {/* Action column */}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pinnedReports.map((report) => (
                <TableRow
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e5e7eb",
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                    },
                    "&:last-child": {
                      borderBottom: "1px solid #e5e7eb",
                    },
                  }}
                >
                  <TableCell sx={{ color: "#1F2937", fontSize: "14px", py: 2.5, borderBottom: "none" }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "#6B7280", flexShrink: 0 }} />
                      <Typography sx={{ fontWeight: 500 }}>{report.title}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "#6B7280", fontSize: "14px", py: 2.5, borderBottom: "none" }}>
                    {report?.createdBy || "Unknown"}
                  </TableCell>
                  <TableCell sx={{ color: "#6B7280", fontSize: "14px", py: 2.5, borderBottom: "none" }}>
                    {(report.updatedAt || report.createdAt)}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 1, borderBottom: "none" }} onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, report)}
                      sx={{
                        color: "#6B7280",
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                        },
                      }}
                    >
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {unpinnedReports.map((report) => (
                <TableRow
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e5e7eb",
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                    },
                    "&:last-child": {
                      borderBottom: "1px solid #e5e7eb",
                    },
                  }}
                >
                  <TableCell sx={{ color: "#1F2937", fontSize: "14px", py: 2.5, borderBottom: "none" }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "#6B7280", flexShrink: 0 }} />
                      <Typography sx={{ fontWeight: 500 }}>{report.title}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "#6B7280", fontSize: "14px", py: 2.5, borderBottom: "none" }}>
                    {report?.createdBy || "Unknown"}
                  </TableCell>
                  <TableCell sx={{ color: "#6B7280", fontSize: "14px", py: 2.5, borderBottom: "none" }}>
                    {(report.updatedAt || report.createdAt)}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 1, borderBottom: "none" }} onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, report)}
                      sx={{
                        color: "#6B7280",
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                        },
                      }}
                    >
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={isCreatingNew}
        onClose={() => {
          setIsCreatingNew(false)
          setNewReportTitle("")
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "18px",
            color: "#1A1A1A",
            borderBottom: "1px solid #e5e7eb",
            py: 2.5,
          }}
        >
          Create New Note
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Note title"
            value={newReportTitle}
            onChange={(e) => setNewReportTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateReport()
              } else if (e.key === "Escape") {
                setIsCreatingNew(false)
                setNewReportTitle("")
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#ffffff",
                "& fieldset": {
                  borderColor: "#e5e7eb",
                },
                "&:hover fieldset": {
                  borderColor: "#d1d5db",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: "1px solid #e5e7eb",
            py: 2,
            px: 3,
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              setIsCreatingNew(false)
              setNewReportTitle("")
            }}
            sx={{
              textTransform: "none",
              color: "#6B7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateReport}
            disabled={!newReportTitle.trim() || loading}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#1A1A1A",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#0d0d0d",
              },
              "&:disabled": {
                backgroundColor: "#d1d5db",
                color: "#9ca3af",
              },
            }}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 220,
            backgroundColor: "#FFF",
            boxShadow: "0px 8px 32px rgba(16, 24, 40, 0.16)",
            mt: "6px",
          },
        }}
        MenuListProps={{
          onMouseLeave: handleMenuClose,
          sx: { p: 0 },
        }}
      >
        {/* Header */}
        <Typography
          sx={{
            px: "12px",
            py: "8px",
            fontFamily: "Inter",
            fontSize: "11px",
            fontWeight: 600,
            color: "#344054",
            borderBottom: "1px solid #EAECF0",
          }}
        >
          Note Actions
        </Typography>

        <MenuItem
          onClick={() => {
            handlePinReport()
            handleMenuClose()
          }}
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            color: "#344054",
            px: 1.5,
            py: "8px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&:hover": {
              backgroundColor: "#F9F5FF",
              color: "#7F56D9",
            },
          }}
        >
          <PushPin sx={{ fontSize: 14 }} />
          {selectedReport?.isPinned ? "Unpin" : "Pin"}
        </MenuItem>

        <Box sx={{ borderBottom: "1px solid #EAECF0" }} />

        {/* Archive / Unarchive */}
        <MenuItem
          onClick={() => {
            handleArchiveReport()
            handleMenuClose()
          }}
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            color: "#344054",
            px: 1.5,
            py: "8px",
            "&:hover": {
              backgroundColor: "#F9F5FF",
              color: "#7F56D9",
            },
          }}
        >
          {selectedReport?.isArchived ? "Unarchive" : "Archive"}
        </MenuItem>

        <Box sx={{ borderBottom: "1px solid #EAECF0" }} />

        {/* Delete */}
        <MenuItem
          onClick={() => {
            handleDeleteFromMenu()
            handleMenuClose()
          }}
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            color: "#DC2626",
            px: 1.5,
            py: "8px",
            "&:hover": {
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ReportsList
