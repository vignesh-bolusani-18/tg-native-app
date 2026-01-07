"use client"

import * as React from "react"
import { Box, Link, Tooltip, IconButton, Typography } from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { guideData } from "./userDocs"




const getTooltipFromGuideData = (guideData, fieldPath) => {
  if (!fieldPath || !guideData) return null

  const searchInContent = (content) => {
    if (!content || !Array.isArray(content)) return null

    for (const block of content) {
      // Check table rows
      if (block.type === "table" && block.rows) {
        for (const row of block.rows) {
          for (const cell of row) {
            if (cell.fieldPath === fieldPath && cell.children) {
              const text = cell.children
                .map((child) => child.content || "")
                .join("")
                .trim()
              return text
            }
          }
        }
      }

      // Check other content types if needed
      if (block.children && Array.isArray(block.children)) {
        const found = searchInContent(block.children)
        if (found) return found
      }
    }

    return null
  }

  const searchInItems = (items) => {
    for (const item of items) {
      if (item.content) {
        const found = searchInContent(item.content)
        if (found) {
          return {
            tooltip: found,
            itemId: item.id,
            itemTitle: item.title,
          }
        }
      }

      if (item.subitems) {
        const found = searchInItems(item.subitems)
        if (found) return found
      }
    }
    return null
  }

  // Search through all categories
  for (const [categoryId, category] of Object.entries(guideData)) {
    if (category && category.items) {
      const found = searchInItems(category.items)
      if (found) {
        return {
          ...found,
          categoryId,
          categoryTitle: category.title,
        }
      }
    }
  }

  return null
}

const buildGuideUrl = (tooltipData, fieldLabel) => {
  if (!tooltipData) return null

  const titleToSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  }

  // Convert field label to anchor format
  const labelToAnchor = (label) => {
    return label
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters like : ? !
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim("-") // Remove leading/trailing hyphens
  }

  const pathParts = []
  if (tooltipData.categoryTitle) pathParts.push(titleToSlug(tooltipData.categoryTitle))
  if (tooltipData.itemTitle) pathParts.push(titleToSlug(tooltipData.itemTitle))

  const basePath = `/user-guide/${pathParts.join("/")}`

  // Add anchor based on field label
  if (fieldLabel) {
    const anchor = labelToAnchor(fieldLabel)
    return `${basePath}#${anchor}`
  }

  return basePath
}

const DynamicInfoTooltip = ({ fieldPath, fieldLabel }) => {
  const [open, setOpen] = React.useState(false)
  const [isHoveringTooltip, setIsHoveringTooltip] = React.useState(false)
  const [isHoveringIcon, setIsHoveringIcon] = React.useState(false)
  const timeoutRef = React.useRef(null)

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Get tooltip data from guideData
  const tooltipData = React.useMemo(() => {
    return getTooltipFromGuideData(guideData, fieldPath)
  }, [fieldPath])

  if (!tooltipData || !tooltipData.tooltip) return null

  const handleIconMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHoveringIcon(true)
    setOpen(true)
  }

  const handleIconMouseLeave = () => {
    setIsHoveringIcon(false)
    // Delay closing to allow moving to tooltip
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringTooltip) {
        setOpen(false)
      }
    }, 300) // 300ms delay
  }

  const handleTooltipMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHoveringTooltip(true)
    setOpen(true)
  }

  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false)
    // Close after a short delay
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringIcon) {
        setOpen(false)
      }
    }, 200)
  }

  const handleExploreMore = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const guideUrlWithAnchor = buildGuideUrl(tooltipData, fieldLabel)
    if (guideUrlWithAnchor) {
      // Get current base path
      const currentUrl = window.location.href
      const urlParts = currentUrl.split("/")
      const basePath = `${urlParts[0]}//${urlParts[2]}/${urlParts[3]}`

      const fullUrl = `${basePath}${guideUrlWithAnchor}`
      console.log("Navigating to:", fullUrl) // Debug log
      window.open(fullUrl, "_blank", "noopener,noreferrer")
    }

    // Close tooltip after clicking
    setOpen(false)
  }

  const TooltipContent = () => (
    <Box sx={{ maxWidth: 250, p: 1.5 }} onMouseEnter={handleTooltipMouseEnter} onMouseLeave={handleTooltipMouseLeave}>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          color: "#344054",
          fontSize: "13px",
          lineHeight: "18px",
        }}
      >
        {tooltipData.tooltip}
      </Typography>
      <Link
        href="#"
        onClick={handleExploreMore}
        onMouseDown={handleExploreMore} // Also handle mousedown for better UX
        sx={{
          fontSize: "12px",
          color: "#1976d2",
          textDecoration: "underline",
          cursor: "pointer",
          display: "inline-block",
          padding: "2px 4px", // Add some padding to make it easier to click
          margin: "-2px -4px", // Negative margin to maintain visual spacing
          borderRadius: "2px",
          "&:hover": {
            color: "#1565c0",
            backgroundColor: "rgba(25, 118, 210, 0.08)",
          },
        }}
      >
        Explore more
      </Link>
    </Box>
  )

  return (
    <Tooltip
      title={<TooltipContent />}
      arrow
      placement="top"
      open={open}
      // Remove the automatic open/close handlers
      disableHoverListener={true}
      disableFocusListener={false}
      disableTouchListener={false}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: "white",
            color: "#344054",
            fontSize: "13px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E4E7EC",
            // Add some margin to make it easier to move between icon and tooltip
            marginTop: "4px !important",
            "& .MuiTooltip-arrow": {
              color: "white",
              "&::before": {
                border: "1px solid #E4E7EC",
              },
            },
          },
        },
        popper: {
          sx: {
            // Ensure the popper doesn't interfere with mouse events
            "& .MuiTooltip-tooltip": {
              // Add a small invisible padding area to make transition easier
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-8px",
                left: "-8px",
                right: "-8px",
                bottom: "-8px",
                zIndex: -1,
              },
            },
          },
        },
      }}
    >
      <IconButton
        size="small"
        onMouseEnter={handleIconMouseEnter}
        onMouseLeave={handleIconMouseLeave}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Small delay on blur to allow clicking
          setTimeout(() => {
            if (!isHoveringTooltip) {
              setOpen(false)
            }
          }, 100)
        }}
        sx={{
          ml: 0.5,
          p: 0.25,
          color: "#666",
          "&:hover": {
            color: "#1976d2",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
          "&:focus": {
            color: "#1976d2",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  )
}

export default DynamicInfoTooltip
