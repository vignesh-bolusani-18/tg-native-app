"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  TextField,
  List,
  ListItemText,
  ListItemButton,
  Collapse,
  Paper,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  Divider,
  Skeleton,
} from "@mui/material"
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Book as BookIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material"
import TocIcon from '@mui/icons-material/Toc';
import { guideData } from "./userDocs.js" // Your converted guide data
import RichTextRenderer from "./RichTextRenderer.js" // Your existing rich text renderer
import InFlowHeader from "../../../src/layout/DashboardLayout/InFlowHeader.js"

export default function UserGuide({ initialSection = null }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"))
  const navigate = useNavigate()
  const { "*": urlPath } = useParams()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false) // For mobile TOC drawer
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [tableOfContents, setTableOfContents] = useState([])
  const contentRef = useRef(null)
  const [expandedCategories, setExpandedCategories] = useState(() => {
    return new Set(["2"])
  })
  const [expandedItems, setExpandedItems] = useState(() => new Set())

  // Extract table of contents from block content structure
  const extractTableOfContents = useCallback((content) => {
    if (!content || !Array.isArray(content)) return []
    const headings = []
    const extractHeadings = (blocks, depth = 0) => {
      blocks.forEach((block, index) => {
        if (block.type === "heading") {
          // Extract text from children
          let text = ""
          if (block.children && Array.isArray(block.children)) {
            text = block.children
              .map((child) => {
                if (child.type === "text") {
                  return child.content || ""
                } else if (child.children) {
                  return child.children.map((grandChild) => grandChild.content || "").join("")
                }
                return ""
              })
              .join("")
              .trim()
          } else if (block.content) {
            text = block.content
          }
          if (text) {
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .trim("-")
            headings.push({
              id,
              text,
              level: block.level || 2,
              blockIndex: index,
            })
          }
        }
        // Recursively check for nested content
        if (block.children && Array.isArray(block.children)) {
          extractHeadings(block.children, depth + 1)
        }
        if (block.items && Array.isArray(block.items)) {
          block.items.forEach((item) => {
            if (item.children) {
              extractHeadings(item.children, depth + 1)
            }
          })
        }
      })
    }
    extractHeadings(content)
    return headings
  }, [])

  // Enhanced scroll to section function for block content
  const scrollToSection = useCallback(
    (sectionId, options = {}) => {
      console.log(`=== SCROLL TO SECTION: ${sectionId} ===`)
      if (!contentRef.current) {
        console.log("❌ Content ref not available")
        return false
      }

      const { behavior = "smooth", updateUrl = true, highlightDuration = 3000 } = options

      // Convert section ID to search terms
      const searchTerms = [
        sectionId,
        sectionId.replace(/-/g, " "),
        sectionId.replace(/-/g, " ").toLowerCase(),
        sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace(/-/g, " "),
      ]

      console.log("🔍 Search terms:", searchTerms)

      let targetElement = null
      let bestMatch = null
      let bestScore = 0

      // Search through all text content
      const allElements = contentRef.current.querySelectorAll("*")
      console.log(`📄 Searching through ${allElements.length} elements`)

      Array.from(allElements).forEach((element) => {
        const text = element.textContent || ""
        const trimmedText = text.trim()

        // Skip if element is too large (likely a container)
        if (trimmedText.length > 200) return

        // Check each search term
        searchTerms.forEach((term) => {
          const normalizedText = trimmedText.toLowerCase()
          const normalizedTerm = term.toLowerCase()

          // Exact match gets highest score
          if (normalizedText === normalizedTerm) {
            if (10 > bestScore) {
              bestScore = 10
              bestMatch = element
              console.log(`🎯 Exact match found: "${trimmedText}" in ${element.tagName}`)
            }
          }
          // Text starts with term
          else if (normalizedText.startsWith(normalizedTerm)) {
            if (8 > bestScore) {
              bestScore = 8
              bestMatch = element
              console.log(`🎯 Starts with match: "${trimmedText}" in ${element.tagName}`)
            }
          }
          // Text contains term
          else if (normalizedText.includes(normalizedTerm)) {
            const score = (normalizedTerm.length / normalizedText.length) * 5
            if (score > bestScore) {
              bestScore = score
              bestMatch = element
              console.log(`🎯 Contains match: "${trimmedText}" in ${element.tagName} (score: ${score})`)
            }
          }
        })
      })

      if (bestMatch) {
        targetElement = bestMatch
        console.log(`✅ Best match selected:`, {
          element: targetElement.tagName,
          text: targetElement.textContent?.substring(0, 100),
          score: bestScore,
        })
      } else {
        console.log("❌ No matching element found")
        return false
      }

      if (targetElement) {
        console.log("🚀 Starting scroll to element")
        try {
          targetElement.scrollIntoView({
            behavior: behavior,
            block: "center",
            inline: "nearest",
          })
          console.log("✅ scrollIntoView executed successfully")

          setTimeout(() => {
            const rect = targetElement.getBoundingClientRect()
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop
            const headerOffset = 120
            if (rect.top < headerOffset) {
              const adjustedScrollY = currentScrollY - (headerOffset - rect.top)
              console.log(`🔧 Adjusting scroll position by ${headerOffset - rect.top}px`)
              window.scrollTo({
                top: adjustedScrollY,
                behavior: "smooth",
              })
            }
          }, 100)
        } catch (error) {
          console.log("❌ scrollIntoView failed:", error)
          return false
        }

        // Add highlight effect
        setTimeout(() => {
          const originalStyle = {
            backgroundColor: targetElement.style.backgroundColor,
            padding: targetElement.style.padding,
            borderRadius: targetElement.style.borderRadius,
            border: targetElement.style.border,
            transition: targetElement.style.transition,
          }

          targetElement.style.transition = "all 0.3s ease"
          targetElement.style.backgroundColor = "#fff3cd"
          targetElement.style.padding = "4px 8px"
          targetElement.style.borderRadius = "4px"
          targetElement.style.border = "2px solid #ffc107"
          console.log("✨ Applied highlight effect")

          setTimeout(() => {
            Object.keys(originalStyle).forEach((key) => {
              targetElement.style[key] = originalStyle[key]
            })
            console.log("🔄 Removed highlight effect")
          }, highlightDuration)
        }, 200)

        if (updateUrl) {
          const currentPath = location.pathname
          const newUrl = `${currentPath}#${sectionId}`
          console.log(`🔗 Updating URL to: ${newUrl}`)
          navigate(newUrl, { replace: true })
        }

        // Close mobile TOC drawer after navigation
        if (isMobile) {
          setTocOpen(false)
        }

        return true
      }
      return false
    },
    [location.pathname, navigate, isMobile],
  )

  // Update table of contents when selected guide changes
  useEffect(() => {
    if (selectedGuide && selectedGuide.content) {
      const toc = extractTableOfContents(selectedGuide.content)
      console.log("📋 Extracted TOC:", toc)
      setTableOfContents(toc)
    } else {
      setTableOfContents([])
    }
  }, [selectedGuide, extractTableOfContents])

  // Handle URL hash changes and auto-scroll
  useEffect(() => {
    if (!selectedGuide || !contentRef.current || isLoading) return

    const hash = location.hash.replace("#", "")
    if (hash) {
      console.log(`🔗 URL hash detected: ${hash}`)
      const timer = setTimeout(() => {
        console.log("⏰ Attempting to scroll after timeout")
        const success = scrollToSection(hash, { updateUrl: false })
        if (!success) {
          console.log(`❌ Failed to scroll to section: ${hash}`)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [selectedGuide, location.hash, scrollToSection, isLoading])

  // Search results for block content
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const normalizedQuery = searchQuery.toLowerCase()
    const results = []

    const searchInBlocks = (blocks) => {
      if (!blocks || !Array.isArray(blocks)) return false

      return blocks.some((block) => {
        // Search in text content
        if (
          block.content &&
          typeof block.content === "string" &&
          block.content.toLowerCase().includes(normalizedQuery)
        ) {
          return true
        }

        // Search in children
        if (block.children && Array.isArray(block.children)) {
          return searchInBlocks(block.children)
        }

        // Search in table content
        if (block.type === "table") {
          if (block.headers && searchInBlocks(block.headers)) return true
          if (block.rows && block.rows.some((row) => searchInBlocks(row))) return true
        }

        // Search in list items
        if (block.items && Array.isArray(block.items)) {
          return block.items.some((item) => searchInBlocks(item.children || []))
        }

        return false
      })
    }

    const searchInItems = (items) => {
      items.forEach((item) => {
        if (item.title.toLowerCase().includes(normalizedQuery)) {
          results.push(item)
          return
        }

        if (item.content && searchInBlocks(item.content)) {
          results.push(item)
          return
        }

        if (item.subitems) {
          searchInItems(item.subitems)
        }
      })
    }

    Object.values(guideData).forEach((category) => {
      if (category && category.items) {
        searchInItems(category.items)
      }
    })

    return results
  }, [searchQuery])

  // Function to convert title to URL slug
  const titleToSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  }, [])

  // Function to get category by ID
  const getCategoryById = useCallback((categoryId) => {
    return guideData[categoryId] || null
  }, [])

  // Function to build hierarchical URL path for a guide
  const buildHierarchicalPath = useCallback(
    (guide) => {
      if (!guide || !guide.id) return ""

      const parts = guide.id.split(".")
      const categoryId = parts[0]
      const category = getCategoryById(categoryId)

      if (!category) return titleToSlug(guide.title)

      const pathParts = [titleToSlug(category.title)]

      if (parts.length > 2) {
        const parentItemId = parts.slice(0, 2).join(".")
        const parentItem = findItemById(parentItemId)
        if (parentItem) {
          pathParts.push(titleToSlug(parentItem.title))
        }
      }

      pathParts.push(titleToSlug(guide.title))
      return pathParts.join("/")
    },
    [titleToSlug],
  )

  // Function to find item by ID
  const findItemById = useCallback(
    (itemId) => {
      const parts = itemId.split(".")
      const categoryId = parts[0]
      const category = getCategoryById(categoryId)

      if (!category) return null

      const searchInItems = (items, targetId) => {
        for (const item of items) {
          if (item.id === targetId) return item
          if (item.subitems) {
            const found = searchInItems(item.subitems, targetId)
            if (found) return found
          }
        }
        return null
      }

      return searchInItems(category.items, itemId)
    },
    [getCategoryById],
  )

  // Function to parse hierarchical URL path and find the corresponding guide
  const parseHierarchicalPath = useCallback(
    (urlPath) => {
      if (!urlPath) return null

      const pathParts = urlPath.split("/").filter((part) => part.length > 0)
      if (pathParts.length === 0) return null

      for (const [categoryId, category] of Object.entries(guideData)) {
        const categorySlug = titleToSlug(category.title)
        if (pathParts[0] === categorySlug) {
          if (pathParts.length === 1) {
            return category.items[0] || null
          }

          const searchInItems = (items, depth = 1) => {
            for (const item of items) {
              const itemSlug = titleToSlug(item.title)
              if (depth === pathParts.length - 1 && pathParts[depth] === itemSlug) {
                return item
              }
              if (item.subitems && pathParts[depth] === itemSlug) {
                const found = searchInItems(item.subitems, depth + 1)
                if (found) return found
              }
            }
            return null
          }

          const found = searchInItems(category.items)
          if (found) return found
        }
      }

      const lastPart = pathParts[pathParts.length - 1]
      return findGuideBySlug(lastPart)
    },
    [titleToSlug],
  )

  // Function to find guide by slug
  const findGuideBySlug = useCallback(
    (slug) => {
      if (!slug) return null

      const searchInItems = (items) => {
        for (const item of items) {
          if (titleToSlug(item.title) === slug) {
            return item
          }
          if (item.subitems) {
            const found = searchInItems(item.subitems)
            if (found) return found
          }
        }
        return null
      }

      for (const category of Object.values(guideData)) {
        if (category && category.items) {
          const found = searchInItems(category.items)
          if (found) return found
        }
      }

      return null
    },
    [titleToSlug],
  )

  // Function to get breadcrumb path for a guide
  const getBreadcrumbPath = useCallback(
    (guide) => {
      if (!guide || !guide.id) return []

      const parts = guide.id.split(".")
      const categoryId = parts[0]
      const category = getCategoryById(categoryId)

      if (!category) return [{ title: guide.title, guide }]

      const breadcrumbs = [{ title: category.title, guide: category.items[0] }]

      if (parts.length > 2) {
        const parentItemId = parts.slice(0, 2).join(".")
        const parentItem = findItemById(parentItemId)
        if (parentItem) {
          breadcrumbs.push({ title: parentItem.title, guide: parentItem })
        }
      }

      breadcrumbs.push({ title: guide.title, guide: null })
      return breadcrumbs
    },
    [getCategoryById, findItemById],
  )

  // Function to expand categories and items to show the selected guide
  const expandToShowGuide = useCallback((guide) => {
    if (!guide || !guide.id) return

    const parts = guide.id.split(".")
    if (parts.length < 1) return

    const categoryId = parts[0]
    setExpandedCategories((prev) => new Set([...prev, categoryId]))

    if (parts.length > 2) {
      const parentItemId = parts.slice(0, 2).join(".")
      setExpandedItems((prev) => new Set([...prev, parentItemId]))
    }
  }, [])

  // Function to update URL when section changes
  const updateUrl = useCallback(
    (guide) => {
      if (guide && guide.title) {
        const hierarchicalPath = buildHierarchicalPath(guide)
        const currentPath = location.pathname.split("/user-guide")[0]
        navigate(`${currentPath}/user-guide/${hierarchicalPath}`, { replace: true })
      }
    },
    [navigate, location.pathname, buildHierarchicalPath],
  )

  // Handle URL-based navigation
  useEffect(() => {
    const loadGuide = async () => {
      setIsLoading(true)
      let guide = null

      if (urlPath) {
        guide = parseHierarchicalPath(urlPath)
      } else if (initialSection) {
        guide = findGuideBySlug(titleToSlug(initialSection))
      }

      if (guide) {
        setSelectedGuide(guide)
        expandToShowGuide(guide)
        if (isMobile) {
          setMobileOpen(true)
        }
      } else {
        const defaultGuide = guideData["2"].items[0]
        setSelectedGuide(defaultGuide)
        updateUrl(defaultGuide)
      }

      setTimeout(() => {
        setIsLoading(false)
      }, 200)
    }

    loadGuide()
  }, [
    urlPath,
    initialSection,
    parseHierarchicalPath,
    findGuideBySlug,
    titleToSlug,
    expandToShowGuide,
    isMobile,
    updateUrl,
  ])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleTocToggle = () => {
    setTocOpen(!tocOpen)
  }

  const handleCategoryClick = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const handleItemClick = (itemId) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleGuideSelect = (guide) => {
    if (guide.id === selectedGuide?.id) return

    setIsLoading(true)
    setSelectedGuide(guide)
    updateUrl(guide)
    if (isMobile) {
      setMobileOpen(false)
    }

    setTimeout(() => {
      setIsLoading(false)
    }, 100)
  }

  const handleSearchSelect = (guide) => {
    setSearchQuery("")
    handleGuideSelect(guide)
  }

  const handleBreadcrumbClick = (guide) => {
    if (guide) {
      handleGuideSelect(guide)
    }
  }

  const navigateToSection = useCallback(
    (sectionId) => {
      const currentPath = location.pathname
      navigate(`${currentPath}#${sectionId}`)
    },
    [location.pathname, navigate],
  )

  const renderItems = (items, level = 0) => {
    return items.map((item) => (
      <Box key={item.id}>
        <ListItemButton
          onClick={() => handleGuideSelect(item)}
          sx={{ pl: 2 + level * 2 }}
          selected={selectedGuide?.id === item.id}
        >
          <ListItemText primary={item.title} />
          {item.subitems?.length ? (
            <Box
              onClick={(e) => {
                e.stopPropagation()
                handleItemClick(item.id)
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 0.5,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              {expandedItems.has(item.id) ? <ExpandLess /> : <ExpandMore />}
            </Box>
          ) : null}
        </ListItemButton>
        {item.subitems?.length ? (
          <Collapse in={expandedItems.has(item.id)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {renderItems(item.subitems, level + 1)}
            </List>
          </Collapse>
        ) : null}
      </Box>
    ))
  }

  // Table of Contents Component for Right Sidebar
  const TableOfContents = () => {
    if (tableOfContents.length === 0) return null

    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "white",
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", fontSize: "1rem", fontWeight: 600 }}>
             Contents
          </Typography>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            maxHeight: "calc(100vh - 140px)",
          }}
        >
           <List dense sx={{ p: 1, listStyle: "none" }}>
            {tableOfContents.map((item, index) => (
              <ListItemButton
                key={index}
                onClick={() => scrollToSection(item.id)}
                sx={{
                  pl: 1 + (item.level - 2) * 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 0.5,
                  listStyle: "none",
                  
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"

                        sx={{
                          fontSize: Math.max(0.75, 1 - (item.level - 2) * 0.1) + "rem",
                          fontWeight: item.level === 2 ? 600 : 400,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.text}
                      </Typography>
                      
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>
    )
  }

  const leftSidebar = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search guides..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          size="small"
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          maxHeight: "calc(100vh - 120px)",
        }}
      >
        {searchQuery ? (
          <List sx={{ px: 2 }}>
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
              Search Results ({searchResults.length})
            </Typography>
            {searchResults.map((item) => (
              <ListItemButton
                key={item.id}
                selected={selectedGuide?.id === item.id}
                onClick={() => handleSearchSelect(item)}
              >
                <ListItemText primary={item.title} />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <List component="nav" sx={{ px: 2 }}>
            {Object.entries(guideData).map(([key, category]) => (
              <Box key={key}>
                <ListItemButton onClick={() => handleCategoryClick(key)}>
                  <ListItemText primary={category.title} />
                  {expandedCategories.has(key) ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expandedCategories.has(key)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {renderItems(category.items)}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )

  const navbarHeight = 80
  const leftSidebarWidth = 280
  const rightSidebarWidth = 280

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={2} sx={{ mb: 3 }} />
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={200} />
    </Box>
  )

  // Get breadcrumb path for current guide
  const breadcrumbPath = selectedGuide ? getBreadcrumbPath(selectedGuide) : []

  return (
    <>
      <InFlowHeader />
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "white" }}>
        <Box sx={{ height: `${navbarHeight}px`, width: "100%", position: "fixed", top: 0, zIndex: 1100 }} />

        {/* Mobile Menu Buttons */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ position: "fixed", top: navbarHeight + 8, left: 8, zIndex: 1100 }}
            >
              <MenuIcon />
            </IconButton>
            {tableOfContents.length > 0 && (
              <IconButton
                color="inherit"
                aria-label="open table of contents"
                onClick={handleTocToggle}
                sx={{ position: "fixed", top: navbarHeight + 8, right: 8, zIndex: 1100 }}
              >
                <TocIcon />
              </IconButton>
            )}
          </>
        )}

        {/* Left Sidebar */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: leftSidebarWidth,
                marginTop: `${navbarHeight}px`,
                height: `calc(100% - ${navbarHeight}px)`,
              },
            }}
          >
            {leftSidebar}
          </Drawer>
        ) : (
          <Box
            component="nav"
            sx={{
              width: leftSidebarWidth,
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              position: "fixed",
              top: `${navbarHeight}px`,
              bottom: 0,
              overflowY: "hidden",
              zIndex: 1,
            }}
          >
            {leftSidebar}
          </Box>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pl: 3,
            pr:3,
            marginLeft: isMobile ? 0 : `${leftSidebarWidth}px`,
            marginRight: isMobile || isTablet ? 0 : `${rightSidebarWidth}px`,
            marginTop: `${navbarHeight}px`,
            height: `calc(100vh - ${navbarHeight}px)`,
            overflow: "scroll",
          }}
        >
          <Paper elevation={0} sx={{ pl: 3,
            pr:3, mt: isMobile ? 5 : 0, bgcolor: "white" }}>
            {isLoading || !selectedGuide ? (
              <LoadingSkeleton />
            ) : (
              <>
                <Breadcrumbs sx={{ mb: 2 }}>
                  <Link underline="hover" sx={{ display: "flex", alignItems: "center" }} color="inherit" href="/">
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                  </Link>
                  <Link underline="hover" sx={{ display: "flex", alignItems: "center" }} color="inherit" href="#">
                    <BookIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Guide
                  </Link>
                  {breadcrumbPath.map((breadcrumb, index) =>
                    index === breadcrumbPath.length - 1 ? (
                      <Typography key={index} color="text.primary">
                        {breadcrumb.title}
                      </Typography>
                    ) : (
                      <Link
                        key={index}
                        underline="hover"
                        color="inherit"
                        component="button"
                        onClick={() => handleBreadcrumbClick(breadcrumb.guide)}
                        sx={{ cursor: "pointer" }}
                      >
                        {breadcrumb.title}
                      </Link>
                    ),
                  )}
                </Breadcrumbs>

                <Typography variant="h4" gutterBottom>
                  {selectedGuide.title}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box ref={contentRef} sx={{ mt: 3 }}>
                  <RichTextRenderer content={selectedGuide.content} />
                </Box>
              </>
            )}
          </Paper>
        </Box>

        {/* Right Sidebar - Table of Contents */}
        {!isMobile && !isTablet && tableOfContents.length > 0 && (
          <Box
            sx={{
              width: rightSidebarWidth,
              flexShrink: 0,
              borderLeft: 1,
              borderColor: "divider",
              position: "fixed",
              top: `${navbarHeight}px`,
              right: 0,
              bottom: 0,
              bgcolor: "white",
              zIndex: 1,
            }}
          >
            <TableOfContents />
          </Box>
        )}

        {/* Mobile TOC Drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            anchor="right"
            open={tocOpen}
            onClose={handleTocToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: 280,
                marginTop: `${navbarHeight}px`,
                height: `calc(100% - ${navbarHeight}px)`,
                bgcolor: "white",
              },
            }}
          >
            <TableOfContents />
          </Drawer>
        )}
      </Box>
    </>
  )
}
