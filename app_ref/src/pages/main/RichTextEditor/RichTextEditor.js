"use client"
import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Tooltip,
  Paper,
  Avatar,
  Fade,
  AppBar,
  Toolbar,
  Stack,
  Alert,
  Snackbar,
  LinearProgress,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Code,
  Image,
  List,
  FormatQuote,
  TableChart,
  ExpandMore,
  Info,
  Warning,
  Title,
  Notes,
  DragIndicator,
  CloudDownload,
  Search,
  Close,
  VideoLibrary,
} from "@mui/icons-material"
import { guideData as userDocs } from "../../docs/userDocs"
import { uploadJsonToS3 } from "../../../utils/s3Utils"

// Custom styled components with subtle colors
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  border: "1px solid #EAECF0",
  backgroundColor: "#FFFFFF",
  boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "14px",
  padding: "8px 16px",
  "&.MuiButton-contained": {
    backgroundColor: "#7C3AED",
    color: "#FFFFFF",
    border: "1px solid #7C3AED",
    "&:hover": {
      backgroundColor: "#6D28D9",
      border: "1px solid #6D28D9",
    },
  },
  "&.MuiButton-outlined": {
    backgroundColor: "#FFFFFF",
    color: "#344054",
    border: "1px solid #D0D5DD",
    "&:hover": {
      backgroundColor: "#F9FAFB",
      border: "1px solid #B2B7C2",
    },
  },
}))

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: "6px",
  padding: "6px",
  "&.primary": {
    backgroundColor: "#7C3AED",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#6D28D9",
    },
  },
  "&.error": {
    backgroundColor: "#F04438",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#D92D20",
    },
  },
  "&.secondary": {
    backgroundColor: "#F9FAFB",
    color: "#667085",
    border: "1px solid #EAECF0",
    "&:hover": {
      backgroundColor: "#F2F4F7",
    },
  },
}))

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(2, 3, 3, 3),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: "#FFFFFF",
  },
}))

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  color: "#101828",
  boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
  borderBottom: "1px solid #EAECF0",
  width: "calc(100% - 50px)", // ← Set this to your actual sidebar width
  marginLeft: "50px",         // ← Shift right to make space for sidebar
  marginTop: "60px",
}));

// Fixed layout container
const LayoutContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100vh",
  paddingTop: "64px", // Account for fixed header
  backgroundColor: "#F9FAFB",
}))

// Scrollable sidebar
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: "400px",
  minWidth: "400px",
  height: "calc(100vh - 64px)",
  overflowY: "auto",
  borderRight: "1px solid #EAECF0",
  backgroundColor: "#FFFFFF",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#F9FAFB",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#D0D5DD",
    borderRadius: "3px",
    "&:hover": {
      background: "#B2B7C2",
    },
  },
}))

// Scrollable content area
const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  height: "calc(100vh - 64px)",
  overflowY: "auto",
  padding: theme.spacing(3),
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#F9FAFB",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#D0D5DD",
    borderRadius: "3px",
    "&:hover": {
      background: "#B2B7C2",
    },
  },
}))

// Enhanced content element wrapper with proper hover behavior
const ContentElementWrapper = styled(StyledCard)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  position: "relative",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    transform: "translateY(-1px)",
    "& .element-actions": {
      opacity: 1,
    },
  },
  "& .element-actions": {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    display: "flex",
    gap: theme.spacing(0.5),
    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "6px",
    padding: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
}))

// Mock data - replace with your actual import
const mockGuideData = {
  1: {
    title: "Getting Started",
    items: [
      {
        id: "1.1",
        title: "Introduction",
        description: "Basic introduction to the system",
        tags: ["basics", "intro"],
        content: [],
        subitems: [
          {
            id: "1.1.1",
            title: "Overview",
            description: "System overview",
            content: [],
          },
        ],
      },
    ],
  },
}

const GuideEditor = () => {
  const [guideData, setGuideData] = useState(userDocs)
  const [activeSection, setActiveSection] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [activeSubitem, setActiveSubitem] = useState(null)
  const [editingContent, setEditingContent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [formData, setFormData] = useState({})
  const [viewMode, setViewMode] = useState("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [formatMenuAnchor, setFormatMenuAnchor] = useState(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const openDialog = (type, data = {}) => {
    setDialogType(type)
    setFormData(data)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setFormData({})
  }

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newData = { ...guideData }
      switch (dialogType) {
        case "section":
          const sectionId = Object.keys(newData).length + 1
          newData[sectionId] = {
            title: formData.title || "New Section",
            items: [],
          }
          showSnackbar("Section added successfully!")
          break
        case "item":
          if (activeSection && newData[activeSection]) {
            const newItem = {
              id: `${activeSection}.${newData[activeSection].items.length + 1}`,
              title: formData.title || "New Item",
              description: formData.description || "",
              tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
              content: [],
              subitems: [],
            }
            newData[activeSection].items.push(newItem)
            showSnackbar("Item added successfully!")
          }
          break
        case "subitem":
          if (activeSection && activeItem && newData[activeSection]?.items) {
            const item = newData[activeSection].items.find((i) => i.id === activeItem)
            if (item) {
              if (!item.subitems) item.subitems = []
              const newSubitem = {
                id: `${activeItem}.${item.subitems.length + 1}`,
                title: formData.title || "New Subitem",
                description: formData.description || "",
                content: [],
              }
              item.subitems.push(newSubitem)
              showSnackbar("Subitem added successfully!")
            }
          }
          break
      }
      setGuideData(newData)
      setIsLoading(false)
      closeDialog()
    }, 500)
  }

  const deleteSection = (sectionId) => {
    const newData = { ...guideData }
    delete newData[sectionId]
    setGuideData(newData)
    showSnackbar("Section deleted", "warning")
  }

  const deleteItem = (sectionId, itemId) => {
    const newData = { ...guideData }
    if (newData[sectionId]) {
      newData[sectionId].items = newData[sectionId].items.filter((item) => item.id !== itemId)
    }
    setGuideData(newData)
    showSnackbar("Item deleted", "warning")
  }

  const deleteSubitem = (sectionId, itemId, subitemId) => {
    const newData = { ...guideData }
    if (newData[sectionId]) {
      const item = newData[sectionId].items.find((i) => i.id === itemId)
      if (item && item.subitems) {
        item.subitems = item.subitems.filter((sub) => sub.id !== subitemId)
      }
    }
    setGuideData(newData)
    showSnackbar("Subitem deleted", "warning")
  }

  const ContentEditor = ({ content, onContentChange }) => {
    const [localContent, setLocalContent] = useState(content || [])
    const [editingIndex, setEditingIndex] = useState(null)
    const [editingElement, setEditingElement] = useState(null)
    const [selectedElements, setSelectedElements] = useState([])

    useEffect(() => {
      setLocalContent(content || [])
    }, [content])

    const addElement = (type) => {
      const templates = {
        paragraph: {
          type: "paragraph",
          children: [{ type: "text", content: "Start writing your content here..." }],
          style: { textAlign: "left", fontSize: "14px" },
        },
        heading: {
          type: "heading",
          level: 2,
          children: [{ type: "text", content: "New Heading" }],
          style: { textAlign: "left", color: "#101828" },
        },
        image: {
          type: "image",
          src: "/placeholder.svg?height=200&width=400",
          alt: "Placeholder Image",
          caption: "Image caption",
        },
        video: {
          type: "video",
          src: "",
          poster: "/placeholder.svg?height=200&width=400",
          caption: "Video caption",
        },
        code: {
          type: "code",
          language: "javascript",
          children: [
            {
              type: "text",
              content: '// Your code here\nconsole.log("Hello World!");',
            },
          ],
        },
        quote: {
          type: "quote",
          children: [{ type: "text", content: "Your inspirational quote here..." }],
          author: "Author Name",
        },
        list: {
          type: "list",
          ordered: false,
          items: [
            { children: [{ type: "text", content: "First item" }] },
            { children: [{ type: "text", content: "Second item" }] },
          ],
        },
        table: {
          type: "table",
          headers: [
            { children: [{ type: "text", content: "Column 1" }] },
            { children: [{ type: "text", content: "Column 2" }] },
          ],
          rows: [
            [{ children: [{ type: "text", content: "Cell 1" }] }, { children: [{ type: "text", content: "Cell 2" }] }],
          ],
        },
        callout: {
          type: "callout",
          variant: "info",
          children: [{ type: "text", content: "Important information or tip" }],
          title: "Note",
        },
        divider: {
          type: "divider",
          style: "solid",
        },
      }

      const newElement = templates[type] || templates.paragraph
      const newContent = [...localContent, newElement]
      setLocalContent(newContent)
      onContentChange(newContent)
      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} added!`)
    }

    const updateElement = (index, element) => {
      const newContent = [...localContent]
      newContent[index] = element
      setLocalContent(newContent)
      onContentChange(newContent)
    }

    const deleteElement = (index) => {
      const newContent = localContent.filter((_, i) => i !== index)
      setLocalContent(newContent)
      onContentChange(newContent)
      showSnackbar("Element deleted", "warning")
    }

    const moveElement = (fromIndex, toIndex) => {
      const newContent = [...localContent]
      const [removed] = newContent.splice(fromIndex, 1)
      newContent.splice(toIndex, 0, removed)
      setLocalContent(newContent)
      onContentChange(newContent)
    }

    const renderChildren = (children) => {
      if (!children) return null
      return children.map((child, i) => {
        if (child.type === "text") {
          return child.content
        } else if (child.type === "bold") {
          return <strong key={i}>{renderChildren(child.children)}</strong>
        } else if (child.type === "italic") {
          return <em key={i}>{renderChildren(child.children)}</em>
        } else if (child.type === "underline") {
          return <u key={i}>{renderChildren(child.children)}</u>
        }
        return null
      })
    }

    const renderContentElement = (element, index) => {
      const isSelected = selectedElements.includes(index)

      const ElementActions = () => (
        <Box className="element-actions">
          <Tooltip title="Move up">
            <StyledIconButton
              className="secondary"
              size="small"
              onClick={() => index > 0 && moveElement(index, index - 1)}
              disabled={index === 0}
            >
              <DragIndicator fontSize="small" />
            </StyledIconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <StyledIconButton
              className="primary"
              size="small"
              onClick={() => {
                setEditingIndex(index)
                setEditingElement(element)
              }}
            >
              <Edit fontSize="small" />
            </StyledIconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <StyledIconButton className="error" size="small" onClick={() => deleteElement(index)}>
              <Delete fontSize="small" />
            </StyledIconButton>
          </Tooltip>
        </Box>
      )

      switch (element.type) {
        case "paragraph":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      ...element.style,
                      lineHeight: 1.7,
                      color: "#344054",
                    }}
                  >
                    {renderChildren(element.children)}
                  </Typography>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "heading":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Typography
                    variant={`h${Math.min(element.level + 2, 6)}`}
                    sx={{
                      ...element.style,
                      fontWeight: 600,
                      mb: 1,
                      color: "#101828",
                    }}
                  >
                    {renderChildren(element.children)}
                  </Typography>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "image":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      src={element.src || "/placeholder.svg"}
                      alt={element.alt}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    {element.caption && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, fontStyle: "italic", color: "#667085" }}
                      >
                        {element.caption}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "video":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <video
                      controls
                      poster={element.poster}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    >
                      <source src={element.src} />
                      Your browser does not support the video tag.
                    </video>
                    {element.caption && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, fontStyle: "italic", color: "#667085" }}
                      >
                        {element.caption}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "code":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Box
                    sx={{
                      bgcolor: "#F9FAFB",
                      color: "#344054",
                      p: 2,
                      borderRadius: 2,
                      fontFamily: "monospace",
                      position: "relative",
                      border: "1px solid #EAECF0",
                    }}
                  >
                    <Chip
                      label={element.language}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "#7C3AED",
                        color: "white",
                      }}
                    />
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{renderChildren(element.children)}</pre>
                  </Box>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "quote":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Box
                    sx={{
                      borderLeft: "4px solid #7C3AED",
                      pl: 3,
                      py: 1,
                      bgcolor: "#F9F5FF",
                      borderRadius: "0 8px 8px 0",
                    }}
                  >
                    <Typography variant="body1" sx={{ fontStyle: "italic", mb: 1, color: "#344054" }}>
                      "{renderChildren(element.children)}"
                    </Typography>
                    {element.author && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#667085" }}>
                        — {element.author}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "list":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Box component={element.ordered ? "ol" : "ul"} sx={{ pl: 2 }}>
                    {element.items.map((item, i) => (
                      <li key={i} style={{ marginBottom: "8px" }}>
                        <Typography variant="body1" sx={{ color: "#344054" }}>
                          {renderChildren(item.children)}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "table":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #EAECF0" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                          {element.headers?.map((header, i) => (
                            <TableCell
                              key={i}
                              sx={{
                                fontWeight: 600,
                                position: "relative",
                                color: "#101828",
                              }}
                            >
                              {renderChildren(header.children)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {element.rows?.map((row, i) => (
                          <TableRow key={i} sx={{ position: "relative" }}>
                            {row.map((cell, j) => (
                              <TableCell key={j} sx={{ color: "#344054" }}>
                                {renderChildren(cell.children)}
                                {cell.fieldPath && (
                                  <Chip
                                    label={`Field: ${cell.fieldPath}`}
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      bgcolor: "#EFF8FF",
                                      color: "#026AA2",
                                    }}
                                    variant="outlined"
                                  />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "callout":
          const calloutColors = {
            info: { bg: "#EFF8FF", border: "#2E90FA", icon: Info },
            warning: { bg: "#FFFAEB", border: "#F79009", icon: Warning },
            error: { bg: "#FEF3F2", border: "#F04438", icon: Warning },
            success: { bg: "#ECFDF3", border: "#12B76A", icon: Info },
          }
          const config = calloutColors[element.variant] || calloutColors.info
          const IconComponent = config.icon
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Alert
                    severity={element.variant}
                    icon={<IconComponent />}
                    sx={{
                      borderRadius: 2,
                      bgcolor: config.bg,
                      border: `1px solid ${config.border}`,
                      "& .MuiAlert-message": { width: "100%" },
                    }}
                  >
                    {element.title && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {element.title}
                      </Typography>
                    )}
                    <Typography variant="body2">{renderChildren(element.children)}</Typography>
                  </Alert>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        case "divider":
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Divider
                    sx={{
                      my: 2,
                      borderStyle: element.style || "solid",
                      borderWidth: element.style === "thick" ? 2 : 1,
                      borderColor: "#EAECF0",
                    }}
                  />
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )

        default:
          return (
            <Fade in timeout={300} key={index}>
              <ContentElementWrapper
                sx={{
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #EAECF0",
                  boxShadow: isSelected ? "0 4px 20px rgba(124, 58, 237, 0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <ElementActions />
                <CardContent sx={{ pt: 1 }}>
                  <Typography variant="body2" sx={{ color: "#667085" }}>
                    Unknown element type: {element.type}
                  </Typography>
                </CardContent>
              </ContentElementWrapper>
            </Fade>
          )
      }
    }

    return (
      <Box>
        {/* Enhanced Toolbar - Fixed at top of content area */}
        <StyledCard sx={{ mb: 3, position: "sticky", top: 0, zIndex: 10 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "#101828", fontWeight: 600, mb: 3 }}>
              Content Elements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "#344054", fontWeight: 500 }}>
                  Text Elements
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<Notes />}
                    onClick={() => addElement("paragraph")}
                    sx={{ minWidth: "auto" }}
                  >
                    Text
                  </StyledButton>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<Title />}
                    onClick={() => addElement("heading")}
                    sx={{ minWidth: "auto" }}
                  >
                    Heading
                  </StyledButton>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<FormatQuote />}
                    onClick={() => addElement("quote")}
                    sx={{ minWidth: "auto" }}
                  >
                    Quote
                  </StyledButton>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<List />}
                    onClick={() => addElement("list")}
                    sx={{ minWidth: "auto" }}
                  >
                    List
                  </StyledButton>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "#344054", fontWeight: 500 }}>
                  Media Elements
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<Image />}
                    onClick={() => addElement("image")}
                    sx={{ minWidth: "auto" }}
                  >
                    Image
                  </StyledButton>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<VideoLibrary />}
                    onClick={() => addElement("video")}
                    sx={{ minWidth: "auto" }}
                  >
                    Video
                  </StyledButton>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<Code />}
                    onClick={() => addElement("code")}
                    sx={{ minWidth: "auto" }}
                  >
                    Code
                  </StyledButton>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "#344054", fontWeight: 500 }}>
                  Layout Elements
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<TableChart />}
                    onClick={() => addElement("table")}
                    sx={{ minWidth: "auto" }}
                  >
                    Table
                  </StyledButton>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<Info />}
                    onClick={() => addElement("callout")}
                    sx={{ minWidth: "auto" }}
                  >
                    Callout
                  </StyledButton>
                  <StyledButton
                    size="small"
                    variant="outlined"
                    startIcon={<Divider />}
                    onClick={() => addElement("divider")}
                    sx={{ minWidth: "auto" }}
                  >
                    Divider
                  </StyledButton>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        <Divider sx={{ my: 3, borderColor: "#EAECF0" }} />

        {/* Content Area */}
        <Box sx={{ minHeight: 400 }}>
          {localContent.length === 0 ? (
            <StyledCard
              sx={{
                textAlign: "center",
                py: 6,
                bgcolor: "#F9FAFB",
                border: "2px dashed #D0D5DD",
              }}
            >
              <Typography variant="h6" sx={{ color: "#344054", mb: 2 }}>
                No content yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#667085", mb: 2 }}>
                Start building your guide by adding content elements above
              </Typography>
              <StyledButton variant="contained" startIcon={<Add />} onClick={() => addElement("paragraph")}>
                Add Your First Element
              </StyledButton>
            </StyledCard>
          ) : (
            localContent.map((element, index) => renderContentElement(element, index))
          )}
        </Box>

        {/* Enhanced Element Editor Dialog */}
        <StyledDialog
          open={editingIndex !== null}
          onClose={() => {
            setEditingIndex(null)
            setEditingElement(null)
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              m: 0,
              p: 3,
              borderBottom: "1px solid #EAECF0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Edit sx={{ color: "#7C3AED" }} />
              <Typography sx={{ fontWeight: 600, color: "#101828" }}>Edit {editingElement?.type}</Typography>
            </Box>
            <StyledIconButton
              className="secondary"
              onClick={() => {
                setEditingIndex(null)
                setEditingElement(null)
              }}
            >
              <Close />
            </StyledIconButton>
          </DialogTitle>
          <DialogContent>
            {editingElement && (
              <ElementEditor
                element={editingElement}
                onSave={(updatedElement) => {
                  updateElement(editingIndex, updatedElement)
                  setEditingIndex(null)
                  setEditingElement(null)
                  showSnackbar("Element updated successfully!")
                }}
              />
            )}
          </DialogContent>
        </StyledDialog>
      </Box>
    )
  }

  const ElementEditor = ({ element, onSave }) => {
    const [localElement, setLocalElement] = useState(element)
    const [tableData, setTableData] = useState(
      element.type === "table"
        ? {
            headers: element.headers || [],
            rows: element.rows || [],
          }
        : null,
    )

    const handleSaveElement = () => {
      if (element.type === "table" && tableData) {
        onSave({ ...localElement, ...tableData })
      } else {
        onSave(localElement)
      }
    }

    const updateElementContent = (path, value) => {
      const newElement = { ...localElement }
      if (path === "content") {
        if (newElement.children) {
          newElement.children[0].content = value
        }
      } else if (path === "src") {
        newElement.src = value
      } else if (path === "alt") {
        newElement.alt = value
      } else if (path === "caption") {
        newElement.caption = value
      } else if (path === "level") {
        newElement.level = Number.parseInt(value)
      } else if (path === "variant") {
        newElement.variant = value
      } else if (path === "title") {
        newElement.title = value
      } else if (path === "author") {
        newElement.author = value
      } else if (path === "language") {
        newElement.language = value
      }
      setLocalElement(newElement)
    }

    const handleTableChange = (type, index, value, rowIndex, cellIndex) => {
      const newTableData = { ...tableData }
      if (type === "header") {
        if (!newTableData.headers[index].children) {
          newTableData.headers[index].children = [{ type: "text", content: "" }]
        }
        newTableData.headers[index].children[0].content = value
      } else if (type === "cell") {
        if (!newTableData.rows[rowIndex][cellIndex].children) {
          newTableData.rows[rowIndex][cellIndex].children = [{ type: "text", content: "" }]
        }
        newTableData.rows[rowIndex][cellIndex].children[0].content = value
      } else if (type === "fieldPath") {
        newTableData.rows[rowIndex][cellIndex].fieldPath = value
      }
      setTableData(newTableData)
    }

    const addTableRow = () => {
      const newRow = tableData.headers.map(() => ({
        children: [{ type: "text", content: "" }],
      }))
      setTableData({
        ...tableData,
        rows: [...tableData.rows, newRow],
      })
    }

    const addTableColumn = () => {
      setTableData({
        headers: [...tableData.headers, { children: [{ type: "text", content: "New Column" }] }],
        rows: tableData.rows.map((row) => [...row, { children: [{ type: "text", content: "" }] }]),
      })
    }

    return (
      <Box sx={{ mt: 2 }}>
        {element.type === "paragraph" && (
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Content"
            value={localElement.children?.[0]?.content || ""}
            onChange={(e) => updateElementContent("content", e.target.value)}
            variant="outlined"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": { borderColor: "#D0D5DD" },
                "&:hover fieldset": { borderColor: "#B2B7C2" },
                "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
              },
            }}
          />
        )}

        {element.type === "heading" && (
          <Box>
            <TextField
              fullWidth
              label="Heading Text"
              value={localElement.children?.[0]?.content || ""}
              onChange={(e) => updateElementContent("content", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Heading Level</InputLabel>
              <Select
                value={localElement.level || 2}
                onChange={(e) => updateElementContent("level", e.target.value)}
                sx={{
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                }}
              >
                <MenuItem value={1}>H1 - Main Title</MenuItem>
                <MenuItem value={2}>H2 - Section</MenuItem>
                <MenuItem value={3}>H3 - Subsection</MenuItem>
                <MenuItem value={4}>H4 - Minor Heading</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {element.type === "image" && (
          <Box>
            <TextField
              fullWidth
              label="Image URL"
              value={localElement.src || ""}
              onChange={(e) => updateElementContent("src", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Alt Text"
              value={localElement.alt || ""}
              onChange={(e) => updateElementContent("alt", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Caption"
              value={localElement.caption || ""}
              onChange={(e) => updateElementContent("caption", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
          </Box>
        )}

        {element.type === "video" && (
          <Box>
            <TextField
              fullWidth
              label="Video URL"
              value={localElement.src || ""}
              onChange={(e) => updateElementContent("src", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Poster Image URL"
              value={localElement.poster || ""}
              onChange={(e) => updateElementContent("poster", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Caption"
              value={localElement.caption || ""}
              onChange={(e) => updateElementContent("caption", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
          </Box>
        )}

        {element.type === "code" && (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={localElement.language || "javascript"}
                onChange={(e) => updateElementContent("language", e.target.value)}
                sx={{
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                }}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="sql">SQL</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Code"
              value={localElement.children?.[0]?.content || ""}
              onChange={(e) => updateElementContent("content", e.target.value)}
              sx={{
                fontFamily: "monospace",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
          </Box>
        )}

        {element.type === "quote" && (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Quote Text"
              value={localElement.children?.[0]?.content || ""}
              onChange={(e) => updateElementContent("content", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Author"
              value={localElement.author || ""}
              onChange={(e) => updateElementContent("author", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
          </Box>
        )}

        {element.type === "callout" && (
          <Box>
            <TextField
              fullWidth
              label="Title"
              value={localElement.title || ""}
              onChange={(e) => updateElementContent("title", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Callout Content"
              value={localElement.children?.[0]?.content || ""}
              onChange={(e) => updateElementContent("content", e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={localElement.variant || "info"}
                onChange={(e) => updateElementContent("variant", e.target.value)}
                sx={{
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                }}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="success">Success</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {element.type === "table" && tableData && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: "#101828" }}>
              Table Editor
            </Typography>
            <StyledCard sx={{ p: 2, mb: 2, bgcolor: "#F9FAFB" }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: "#344054" }}>
                Headers
              </Typography>
              <Grid container spacing={2}>
                {tableData.headers.map((header, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Box sx={{ position: "relative" }}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Header ${i + 1}`}
                        value={header.children?.[0]?.content || ""}
                        onChange={(e) => handleTableChange("header", i, e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": { borderColor: "#D0D5DD" },
                            "&:hover fieldset": { borderColor: "#B2B7C2" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#7C3AED",
                            },
                          },
                        }}
                      />
                      <StyledIconButton
                        className="error"
                        size="small"
                        onClick={() => {
                          const newTableData = { ...tableData }
                          newTableData.headers = newTableData.headers.filter((_, idx) => idx !== i)
                          newTableData.rows = newTableData.rows.map((row) => row.filter((_, idx) => idx !== i))
                          setTableData(newTableData)
                        }}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 20,
                          height: 20,
                        }}
                      >
                        <Delete sx={{ fontSize: 12 }} />
                      </StyledIconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <StyledButton variant="outlined" onClick={addTableColumn} startIcon={<Add />} size="small">
                    Add Column
                  </StyledButton>
                </Grid>
              </Grid>
            </StyledCard>

            <Typography variant="subtitle2" gutterBottom sx={{ color: "#344054" }}>
              Rows
            </Typography>
            {tableData.rows.map((row, rowIndex) => (
              <StyledCard key={rowIndex} sx={{ p: 2, mb: 2, position: "relative" }}>
                <StyledIconButton
                  className="error"
                  size="small"
                  onClick={() => {
                    const newTableData = { ...tableData }
                    newTableData.rows = newTableData.rows.filter((_, idx) => idx !== rowIndex)
                    setTableData(newTableData)
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                  }}
                >
                  <Delete sx={{ fontSize: 14 }} />
                </StyledIconButton>
                <Grid container spacing={2}>
                  {row.map((cell, cellIndex) => (
                    <Grid item xs={12} sm={6} key={cellIndex}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Cell ${rowIndex + 1}-${cellIndex + 1}`}
                        value={cell.children?.[0]?.content || ""}
                        onChange={(e) => handleTableChange("cell", null, e.target.value, rowIndex, cellIndex)}
                        sx={{
                          mb: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": { borderColor: "#D0D5DD" },
                            "&:hover fieldset": { borderColor: "#B2B7C2" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#7C3AED",
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Field Path"
                        value={cell.fieldPath || ""}
                        onChange={(e) => handleTableChange("fieldPath", null, e.target.value, rowIndex, cellIndex)}
                        helperText="e.g., data.date_format"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": { borderColor: "#D0D5DD" },
                            "&:hover fieldset": { borderColor: "#B2B7C2" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#7C3AED",
                            },
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </StyledCard>
            ))}
            <StyledButton variant="outlined" onClick={addTableRow} startIcon={<Add />} sx={{ mb: 2 }}>
              Add Row
            </StyledButton>
          </Box>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <StyledButton variant="outlined" onClick={() => onSave(element)} startIcon={<Cancel />}>
            Cancel
          </StyledButton>
          <StyledButton variant="contained" onClick={handleSaveElement} startIcon={<Save />}>
            Save Changes
          </StyledButton>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F9FAFB", mt:'60px' }}>
      {/* Fixed Header */}
      <StyledAppBar>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600, color: "#101828" }}>
            TrueGradient Guide Editor
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <StyledButton
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={async () => {
                const dataStr = JSON.stringify(guideData, null, 2)
                const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
                const exportFileDefaultName = "guide-data.json"
                const linkElement = document.createElement("a")
                linkElement.setAttribute("href", dataUri)
                linkElement.setAttribute("download", exportFileDefaultName)
                linkElement.click()
                await uploadJsonToS3(`documentation/user-docs.json`, guideData)
                showSnackbar("Guide exported successfully!")
              }}
            >
              Export
            </StyledButton>
          </Box>
        </Toolbar>
        {isLoading && (
          <LinearProgress
            sx={{
              bgcolor: "#F2F4F7",
              "& .MuiLinearProgress-bar": { bgcolor: "#7C3AED" },
            }}
          />
        )}
      </StyledAppBar>

      {/* Main Layout */}
      <LayoutContainer>
        {/* Left Sidebar */}
        <SidebarContainer>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: "#101828", fontWeight: 600 }}>
                Guide Structure
              </Typography>
              <StyledButton variant="contained" startIcon={<Add />} onClick={() => openDialog("section")} size="small">
                Add Section
              </StyledButton>
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "#667085" }} />,
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />

            {/* Sections */}
            {Object.entries(guideData)
              .filter(([_, section]) => section.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(([sectionId, section]) => (
                <Accordion
                  key={sectionId}
                  sx={{
                    mb: 2,
                    border: "1px solid #EAECF0",
                    borderRadius: "8px !important",
                    "&:before": { display: "none" },
                    boxShadow: "none",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      bgcolor: "#F9FAFB",
                      borderRadius: "8px 8px 0 0",
                      "&.Mui-expanded": {
                        borderRadius: "8px 8px 0 0",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#101828" }}>
                        {section.title}
                      </Typography>
                      <Box onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Delete section">
                          <StyledIconButton className="error" size="small" onClick={() => deleteSection(sectionId)}>
                            <Delete />
                          </StyledIconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: "#FFFFFF" }}>
                    <Box sx={{ ml: 1 }}>
                      <StyledButton
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                          setActiveSection(sectionId)
                          openDialog("item")
                        }}
                        sx={{ mb: 2 }}
                        fullWidth
                      >
                        Add Item
                      </StyledButton>
                      {section.items.map((item) => (
                        <Fade in key={item.id} timeout={300}>
                          <Box sx={{ mb: 2 }}>
                            <StyledCard
                              sx={{
                                p: 2,
                                bgcolor: activeItem === item.id ? "#F9F5FF" : "#FFFFFF",
                                border: activeItem === item.id ? "2px solid #7C3AED" : "1px solid #EAECF0",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  boxShadow: "0px 4px 8px rgba(16, 24, 40, 0.1)",
                                  transform: "translateY(-1px)",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 600,
                                    flex: 1,
                                    color: "#101828",
                                  }}
                                >
                                  {item.title}
                                </Typography>
                                <Box>
                                  <Tooltip title="Edit content">
                                    <StyledIconButton
                                      className="primary"
                                      size="small"
                                      onClick={() => {
                                        setActiveSection(sectionId)
                                        setActiveItem(item.id)
                                        setActiveSubitem(null)
                                        setEditingContent(item.content)
                                      }}
                                      sx={{ mr: 0.5 }}
                                    >
                                      <Edit fontSize="small" />
                                    </StyledIconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete item">
                                    <StyledIconButton
                                      className="error"
                                      size="small"
                                      onClick={() => deleteItem(sectionId, item.id)}
                                    >
                                      <Delete fontSize="small" />
                                    </StyledIconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              {item.description && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    mb: 1,
                                    color: "#667085",
                                  }}
                                >
                                  {item.description}
                                </Typography>
                              )}
                              {item.tags && item.tags.length > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                    mb: 1,
                                  }}
                                >
                                  {item.tags.map((tag, i) => (
                                    <Chip
                                      key={i}
                                      label={tag}
                                      size="small"
                                      sx={{
                                        bgcolor: "#F2F4F7",
                                        color: "#344054",
                                        border: "1px solid #EAECF0",
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                              {item.subitems && item.subitems.length > 0 && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    pl: 2,
                                    borderLeft: "2px solid #EAECF0",
                                  }}
                                >
                                  {item.subitems.map((subitem) => (
                                    <StyledCard
                                      key={subitem.id}
                                      sx={{
                                        p: 1.5,
                                        mb: 1,
                                        bgcolor: activeSubitem === subitem.id ? "#F0F9FF" : "#FFFFFF",
                                        border: "1px solid #EAECF0",
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 500,
                                            color: "#101828",
                                          }}
                                        >
                                          {subitem.title}
                                        </Typography>
                                        <Box>
                                          <Tooltip title="Edit subitem">
                                            <StyledIconButton
                                              className="primary"
                                              size="small"
                                              onClick={() => {
                                                setActiveSection(sectionId)
                                                setActiveItem(item.id)
                                                setActiveSubitem(subitem.id)
                                                setEditingContent(subitem.content)
                                              }}
                                              sx={{ mr: 0.5 }}
                                            >
                                              <Edit sx={{ fontSize: 14 }} />
                                            </StyledIconButton>
                                          </Tooltip>
                                          <Tooltip title="Delete subitem">
                                            <StyledIconButton
                                              className="error"
                                              size="small"
                                              onClick={() => deleteSubitem(sectionId, item.id, subitem.id)}
                                            >
                                              <Delete sx={{ fontSize: 14 }} />
                                            </StyledIconButton>
                                          </Tooltip>
                                        </Box>
                                      </Box>
                                    </StyledCard>
                                  ))}
                                </Box>
                              )}
                              <StyledButton
                                size="small"
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => {
                                  setActiveSection(sectionId)
                                  setActiveItem(item.id)
                                  openDialog("subitem")
                                }}
                                sx={{ mt: 1 }}
                              >
                                Add Subitem
                              </StyledButton>
                            </StyledCard>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
          </Box>
        </SidebarContainer>

        {/* Right Content Area */}
        <ContentContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "#101828", fontWeight: 600 }}>
              Content Editor
            </Typography>
            {editingContent !== null && (
              <Chip
                label={`Editing: ${activeSubitem ? "Subitem" : "Item"}`}
                sx={{
                  bgcolor: "#F9F5FF",
                  color: "#7C3AED",
                  border: "1px solid #E9D7FE",
                }}
              />
            )}
          </Box>

          {editingContent !== null ? (
            <ContentEditor
              content={editingContent}
              onContentChange={(newContent) => {
                setEditingContent(newContent)
                const newGuideData = { ...guideData }
                if (activeSubitem) {
                  const section = newGuideData[activeSection]
                  const item = section.items.find((i) => i.id === activeItem)
                  const subitem = item.subitems.find((s) => s.id === activeSubitem)
                  subitem.content = newContent
                } else if (activeItem) {
                  const section = newGuideData[activeSection]
                  const item = section.items.find((i) => i.id === activeItem)
                  item.content = newContent
                }
                setGuideData(newGuideData)
              }}
            />
          ) : (
            <StyledCard
              sx={{
                textAlign: "center",
                py: 8,
                bgcolor: "#F9FAFB",
                border: "2px dashed #D0D5DD",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#7C3AED",
                  mx: "auto",
                  mb: 2,
                  width: 56,
                  height: 56,
                }}
              >
                <Edit />
              </Avatar>
              <Typography variant="h6" sx={{ color: "#344054", mb: 1 }}>
                Select an item to edit its content
              </Typography>
              <Typography variant="body2" sx={{ color: "#667085" }}>
                Choose a section item from the left panel to start editing
              </Typography>
            </StyledCard>
          )}
        </ContentContainer>
      </LayoutContainer>

      {/* Enhanced Dialog */}
      <StyledDialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            borderBottom: "1px solid #EAECF0",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Add sx={{ color: "#7C3AED" }} />
          <Typography sx={{ fontWeight: 600, color: "#101828" }}>
            {dialogType === "section" && "Add New Section"}
            {dialogType === "item" && "Add New Item"}
            {dialogType === "subitem" && "Add New Subitem"}
          </Typography>
          <StyledIconButton className="secondary" onClick={closeDialog} sx={{ ml: "auto" }}>
            <Close />
          </StyledIconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              autoFocus
              label="Title"
              fullWidth
              variant="outlined"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#D0D5DD" },
                  "&:hover fieldset": { borderColor: "#B2B7C2" },
                  "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                },
              }}
            />
            {dialogType !== "section" && (
              <>
                <TextField
                  label="Description"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "& fieldset": { borderColor: "#D0D5DD" },
                      "&:hover fieldset": { borderColor: "#B2B7C2" },
                      "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                    },
                  }}
                />
                <TextField
                  label="Tags (comma-separated)"
                  fullWidth
                  variant="outlined"
                  value={formData.tags || ""}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  helperText="e.g., demand, forecasting, AI"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "& fieldset": { borderColor: "#D0D5DD" },
                      "&:hover fieldset": { borderColor: "#B2B7C2" },
                      "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                    },
                  }}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={closeDialog} variant="outlined" startIcon={<Cancel />}>
            Cancel
          </StyledButton>
          <StyledButton onClick={handleSave} variant="contained" startIcon={<Save />} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #EAECF0",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GuideEditor
