import {
  Typography,
  Link,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { styled } from "@mui/material/styles"

// Consistent design system tokens
const DESIGN_TOKENS = {
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    baseSize: 18,
    lineHeight: 1.7,
    headerWeight: 600,
    bodyWeight: 400,
    boldWeight: 600,
  },
  colors: {
    primary: "#1976d2",
    textPrimary: "rgba(0, 0, 0, 0.87)",
    textSecondary: "rgba(0, 0, 0, 0.6)",
    background: "#ffffff",
    surface: "#f8f9fa",
    border: "rgba(0, 0, 0, 0.12)",
  }
}

// Enhanced styled components with consistent design
const StyledParagraph = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  lineHeight: DESIGN_TOKENS.typography.lineHeight,
  fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
  color: theme.palette.text.primary,
  fontWeight: DESIGN_TOKENS.typography.bodyWeight,
  letterSpacing: "0.00938em",
  "& + &": {
    marginTop: 0,
  },
  "& strong, & b": {
    fontWeight: DESIGN_TOKENS.typography.boldWeight,
    color: theme.palette.text.primary,
  },
  "& em, & i": {
    fontStyle: "italic",
    color: theme.palette.text.secondary,
  },
}))

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontWeight: DESIGN_TOKENS.typography.headerWeight,
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  letterSpacing: "-0.00833em",
  "&:first-of-type": {
    marginTop: 0,
  },
  // Consistent heading sizes
  "&.MuiTypography-h3": {
    fontSize: "1.778rem", // 32px
    lineHeight: 1.4,
  },
  "&.MuiTypography-h4": {
    fontSize: "1.5rem", // 27px
    lineHeight: 1.4,
  },
  "&.MuiTypography-h5": {
    fontSize: "1.278rem", // 23px
    lineHeight: 1.4,
  },
  "&.MuiTypography-h6": {
    fontSize: "1.111rem", // 20px
    lineHeight: 1.4,
  },
}))

const StyledList = styled(List)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  paddingLeft: 0,
  "& .MuiListItem-root": {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(3),
    paddingRight: 0,
    alignItems: "flex-start",
    display: "flex",
    position: "relative",
    "&::before": {
      content: '"•"',
      position: "absolute",
      left: theme.spacing(1),
      top: theme.spacing(0.5),
      color: theme.palette.text.primary,
      fontWeight: "bold",
      fontSize: "1.2em",
      lineHeight: 1.6,
    },
  },
  "& .MuiListItemText-primary": {
    lineHeight: DESIGN_TOKENS.typography.lineHeight,
    fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
    color: theme.palette.text.primary,
    margin: 0,
  },
  "& .MuiListItemText-root": {
    margin: 0,
  },
}))

const StyledOrderedList = styled(List)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  paddingLeft: 0,
  counterReset: "list-counter",
  "& .MuiListItem-root": {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(3),
    paddingRight: 0,
    alignItems: "flex-start",
    display: "flex",
    position: "relative",
    counterIncrement: "list-counter",
    "&::before": {
      content: 'counter(list-counter) "."',
      position: "absolute",
      left: theme.spacing(1),
      top: theme.spacing(0.5),
      color: theme.palette.text.primary,
      fontWeight: "bold",
      fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
      lineHeight: 1.6,
      minWidth: "1.5em",
    },
  },
  "& .MuiListItemText-primary": {
    lineHeight: DESIGN_TOKENS.typography.lineHeight,
    fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
    color: theme.palette.text.primary,
    margin: 0,
  },
  "& .MuiListItemText-root": {
    margin: 0,
  },
}))

const StyledCodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#f5f5f5",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  overflow: "auto",
  fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
  fontSize: "16px",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  color: theme.palette.text.primary,
}))

const StyledTable = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  "& .MuiTableHead-root": {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
  },
  "& .MuiTableCell-head": {
    fontWeight: DESIGN_TOKENS.typography.headerWeight,
    color: theme.palette.text.primary,
    fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& .MuiTableCell-body": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
    fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
    lineHeight: DESIGN_TOKENS.typography.lineHeight,
    color: theme.palette.text.primary,
  },
  "& .MuiTableRow-root:last-child .MuiTableCell-body": {
    borderBottom: "none",
  },
}))

const InlineCode = styled("code")(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#f5f5f5",
  color: theme.palette.text.primary,
  padding: theme.spacing(0.25, 0.5),
  borderRadius: theme.spacing(0.5),
  fontSize: "0.9em",
  fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
  fontWeight: 400,
  border: `1px solid ${theme.palette.divider}`,
}))

const StyledBlockquote = styled(Box)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  paddingLeft: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: "transparent",
  "& p": {
    margin: 0,
    fontStyle: "italic",
    color: theme.palette.text.secondary,
    fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
    lineHeight: DESIGN_TOKENS.typography.lineHeight,
  },
}))

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "underline",
  fontWeight: DESIGN_TOKENS.typography.bodyWeight,
  "&:hover": {
    color: theme.palette.primary.dark,
    textDecoration: "underline",
  },
}))

// UPDATED: Styled component for images - made slightly smaller
const StyledImage = styled("img")(({ theme }) => ({
  maxWidth: "85%", // Reduced from 100% to 85%
  height: "auto",
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  display: "block",
}))

// Styled component for image container with fallback
const ImageContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textAlign: "center",
  "& .image-fallback": {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.grey[100],
    border: `2px dashed ${theme.palette.grey[300]}`,
    borderRadius: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "14px",
  },
}))

const MarkdownRenderer = ({ content }) => {
  if (!content || typeof content !== "string") {
    return null
  }

  const parseMarkdown = (markdown) => {
    const lines = markdown.trim().split("\n")
    const elements = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Skip empty lines
      if (!line.trim()) {
        i++
        continue
      }

      // Headers
      if (line.startsWith("#")) {
        const level = line.match(/^#+/)[0].length
        const text = line.replace(/^#+\s*/, "")
        const variant = level === 1 ? "h3" : level === 2 ? "h4" : level === 3 ? "h5" : "h6"

        elements.push(
          <StyledHeading key={i} variant={variant} component={`h${Math.min(level + 2, 6)}`}>
            {parseInlineElements(text)}
          </StyledHeading>,
        )
        i++
      }
      // Code blocks
      else if (line.startsWith("```")) {
        const codeLines = []
        i++ // Skip opening ```
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i])
          i++
        }
        i++ // Skip closing ```

        elements.push(<StyledCodeBlock key={i}>{codeLines.join("\n")}</StyledCodeBlock>)
      }
      // Handle standalone images (images on their own line)
      else if (line.trim().match(/^!\[.*?\]\(.*?\)$/)) {
        const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (imageMatch) {
          const [, altText, imageUrl] = imageMatch
          elements.push(
            <ImageContainer key={i}>
              <StyledImage
                src={imageUrl}
                alt={altText}
                loading="lazy"
                onError={(e) => {
                  // Replace with fallback content
                  const fallbackDiv = document.createElement('div')
                  fallbackDiv.className = 'image-fallback'
                  fallbackDiv.innerHTML = `
                    <div>🖼️ Image not found</div>
                    <div style="margin-top: 8px; font-size: 12px;">
                      Alt: ${altText}<br/>
                      URL: ${imageUrl}
                    </div>
                  `
                  e.target.parentNode.replaceChild(fallbackDiv, e.target)
                }}
              />
            </ImageContainer>
          )
        }
        i++
      }
      // Tables
      else if (line.includes("|")) {
        const tableLines = []
        let j = i
        while (j < lines.length && lines[j].includes("|")) {
          tableLines.push(lines[j])
          j++
        }

        if (tableLines.length > 1) {
          const headers = tableLines[0]
            .split("|")
            .map((h) => h.trim())
            .filter((h) => h)
          const rows = tableLines.slice(2).map((row) =>
            row
              .split("|")
              .map((cell) => cell.trim())
              .filter((cell) => cell),
          )

          elements.push(
            <StyledTable key={i} component={Paper} elevation={0}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    {headers.map((header, idx) => (
                      <TableCell key={idx}>{parseInlineElements(header)}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <TableCell key={cellIdx}>{parseInlineElements(cell)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTable>,
          )
          i = j
        } else {
          // Single line with |, treat as paragraph
          elements.push(<StyledParagraph key={i}>{parseInlineElements(line)}</StyledParagraph>)
          i++
        }
      }
      // Unordered lists
      else if (line.match(/^[\s]*[-*+]\s/)) {
        const listItems = []
        let j = i
        while (j < lines.length && lines[j].match(/^[\s]*[-*+]\s/)) {
          const text = lines[j].replace(/^[\s]*[-*+]\s/, "")
          listItems.push(text)
          j++
        }

        elements.push(
          <StyledList key={i}>
            {listItems.map((item, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={parseInlineElements(item)} />
              </ListItem>
            ))}
          </StyledList>,
        )
        i = j
      }
      // Ordered lists
      else if (line.match(/^[\s]*\d+\.\s/)) {
        const listItems = []
        let j = i
        while (j < lines.length && lines[j].match(/^[\s]*\d+\.\s/)) {
          const text = lines[j].replace(/^[\s]*\d+\.\s/, "")
          listItems.push(text)
          j++
        }

        elements.push(
          <StyledOrderedList key={i} component="div">
            {listItems.map((item, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={parseInlineElements(item)} />
              </ListItem>
            ))}
          </StyledOrderedList>,
        )
        i = j
      }
      // Blockquotes
      else if (line.startsWith(">")) {
        const quoteLines = []
        let j = i
        while (j < lines.length && lines[j].startsWith(">")) {
          quoteLines.push(lines[j].replace(/^>\s*/, ""))
          j++
        }

        elements.push(
          <StyledBlockquote key={i}>
            <Typography variant="body1">{parseInlineElements(quoteLines.join(" "))}</Typography>
          </StyledBlockquote>,
        )
        i = j
      }
      // Horizontal rule
      else if (line.match(/^---+$/)) {
        elements.push(
          <Divider 
            key={i} 
            sx={{ 
              my: 3,
              borderColor: "divider",
            }} 
          />
        )
        i++
      }
      // Regular paragraphs
      else {
        const paragraphLines = []
        let j = i
        while (
          j < lines.length &&
          lines[j].trim() &&
          !lines[j].startsWith("#") &&
          !lines[j].startsWith("```") &&
          !lines[j].match(/^[\s]*[-*+]\s/) &&
          !lines[j].match(/^[\s]*\d+\.\s/) &&
          !lines[j].startsWith(">") &&
          !lines[j].includes("|") &&
          !lines[j].trim().match(/^!\[.*?\]\(.*?\)$/) // Don't include standalone images in paragraphs
        ) {
          paragraphLines.push(lines[j])
          j++
        }

        if (paragraphLines.length > 0) {
          elements.push(<StyledParagraph key={i}>{parseInlineElements(paragraphLines.join(" "))}</StyledParagraph>)
        }
        i = j
      }
    }

    return elements
  }

  const parseInlineElements = (text) => {
    if (!text) return ""

    // Handle images first (before links since they have similar syntax)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, url) => `__IMAGE__${altText}|${url}__IMAGE__`)

    // Handle inline code
    text = text.replace(/`([^`]+)`/g, (match, code) => `__INLINE_CODE__${code}__INLINE_CODE__`)

    // Handle bold
    text = text.replace(/\*\*([^*]+)\*\*/g, (match, bold) => `__BOLD__${bold}__BOLD__`)

    // Handle italic
    text = text.replace(/\*([^*]+)\*/g, (match, italic) => `__ITALIC__${italic}__ITALIC__`)

    // Handle links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => `__LINK__${linkText}|${url}__LINK__`)

    // Split by special markers and render
    const parts = text.split(/(__[A-Z_]+__[^_]*__[A-Z_]+__)/)

    return parts.map((part, index) => {
      if (part.startsWith("__IMAGE__")) {
        const imageMatch = part.match(/__IMAGE__([^|]*)\|([^_]*)__IMAGE__/)
        if (imageMatch) {
          return (
            <StyledImage
              key={index}
              src={imageMatch[2]}
              alt={imageMatch[1]}
              loading="lazy"
              style={{ display: 'inline-block', verticalAlign: 'middle', maxWidth: '160px', margin: '0 4px' }} // Reduced from 200px to 160px
              onError={(e) => {
                e.target.style.display = 'none'
                console.warn(`Failed to load inline image: ${imageMatch[2]}`)
              }}
            />
          )
        }
      } else if (part.startsWith("__INLINE_CODE__")) {
        const code = part.replace(/__INLINE_CODE__([^_]*)__INLINE_CODE__/, "$1")
        return <InlineCode key={index}>{code}</InlineCode>
      } else if (part.startsWith("__BOLD__")) {
        const bold = part.replace(/__BOLD__([^_]*)__BOLD__/, "$1")
        return (
          <Typography key={index} component="strong" sx={{ fontWeight: DESIGN_TOKENS.typography.boldWeight, color: "text.primary" }}>
            {bold}
          </Typography>
        )
      } else if (part.startsWith("__ITALIC__")) {
        const italic = part.replace(/__ITALIC__([^_]*)__ITALIC__/, "$1")
        return (
          <Typography key={index} component="em" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            {italic}
          </Typography>
        )
      } else if (part.startsWith("__LINK__")) {
        const linkMatch = part.match(/__LINK__([^|]*)\|([^_]*)__LINK__/)
        if (linkMatch) {
          return (
            <StyledLink
              key={index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkMatch[1]}
            </StyledLink>
          )
        }
      }
      return part
    })
  }

  return (
    <Box
      sx={{
        maxWidth: "100%",
        "& > *:first-child": { mt: 0 },
        "& > *:last-child": { mb: 0 },
        // Consistent spacing between elements
        "& > * + *": {
          marginTop: 2,
        },
        // Override specific spacing for headings after paragraphs
        "& p + h1, & p + h2, & p + h3, & p + h4, & p + h5, & p + h6": {
          marginTop: 4,
        },
        // Typography consistency
        fontSize: `${DESIGN_TOKENS.typography.baseSize}px`,
        lineHeight: DESIGN_TOKENS.typography.lineHeight,
        color: "text.primary",
      }}
    >
      {parseMarkdown(content)}
    </Box>
  )
}

export default MarkdownRenderer