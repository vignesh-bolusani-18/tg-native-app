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
  Chip,
} from "@mui/material"
import { styled } from "@mui/material/styles"

// Enhanced styled components with improved visual hierarchy
const StyledParagraph = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3), // Increased from 2 to 3
  lineHeight: 1.8, // Increased from 1.7 to 1.8 for better readability
  fontSize: "1.125rem", // Increased from 1rem to 1.125rem (18px)
  color: theme.palette.text.primary,
  fontWeight: 400,
  letterSpacing: "0.01em",
  "& + &": {
    marginTop: theme.spacing(1.5), // Increased spacing between paragraphs
  },
  // Better handling of nested elements
  "& strong, & b": {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  "& em, & i": {
    fontStyle: "italic",
    color: theme.palette.text.secondary,
  },
}))

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 700, // Increased from 600 to 700
  marginTop: theme.spacing(4), // Increased from 3 to 4
  marginBottom: theme.spacing(2.5), // Increased from 2 to 2.5
  color: theme.palette.text.primary,
  letterSpacing: "-0.02em",
  position: "relative",
  "&:first-of-type": {
    marginTop: 0,
  },
  // Add subtle underline for better visual hierarchy
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-8px",
    left: 0,
    width: "40px",
    height: "3px",
    backgroundColor: theme.palette.primary.main,
    borderRadius: "2px",
    opacity: 0.8,
  },
}))

const StyledList = styled(List)(({ theme }) => ({
  marginBottom: theme.spacing(3), // Increased from 2 to 3
  marginTop: theme.spacing(1),
  "& .MuiListItem-root": {
    paddingTop: theme.spacing(0.75), // Increased from 0.5
    paddingBottom: theme.spacing(0.75),
    alignItems: "flex-start",
    "&::before": {
      content: '""',
      minWidth: "8px",
      height: "8px",
      backgroundColor: theme.palette.primary.main,
      borderRadius: "50%",
      marginRight: theme.spacing(1.5),
      marginTop: "0.6em",
      flexShrink: 0,
    },
  },
  "& .MuiListItemText-primary": {
    lineHeight: 1.7,
    fontSize: "1.05rem", // Slightly larger list text
    color: theme.palette.text.primary,
    marginLeft: theme.spacing(0.5),
  },
}))

const StyledCodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5), // Increased border radius
  padding: theme.spacing(3), // Increased from 2 to 3
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  overflow: "auto",
  position: "relative",
  boxShadow: theme.shadows[1],
  "&::before": {
    content: '"Code"',
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1.5),
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  "& code": {
    fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Consolas", monospace',
    fontSize: "0.9rem", // Slightly larger code font
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    color: theme.palette.text.primary,
    display: "block",
    paddingTop: theme.spacing(2),
  },
}))

// Updated clean table styling
const StyledTable = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 0, // Remove border radius for cleaner look
  backgroundColor: "transparent", // Transparent background
  boxShadow: "none", // Remove shadow
  overflow: "visible",

  "& .MuiTable-root": {
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  "& .MuiTableHead-root": {
    backgroundColor: "transparent", // Remove header background
  },

  "& .MuiTableCell-head": {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: "1rem",
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: "transparent",
    "&:last-child": {
      borderRight: "none",
    },
  },

  "& .MuiTableCell-body": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
    "&:last-child": {
      borderRight: "none",
    },
  },

  "& .MuiTableRow-root": {
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent", // Remove hover effect
    },
    "&:last-child .MuiTableCell-body": {
      borderBottom: "none", // Remove bottom border from last row
    },
  },
}))

const StyledImage = styled("img")(({ theme }) => ({
  maxWidth: "100%",
  height: "auto",
  borderRadius: theme.spacing(2), // Increased border radius
  boxShadow: theme.shadows[4], // Enhanced shadow
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
}))

const InlineCode = styled("code")(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[100],
  color: theme.palette.primary.main, // Changed to primary color
  padding: theme.spacing(0.4, 0.8), // Increased padding
  borderRadius: theme.spacing(0.75),
  fontSize: "0.9em", // Slightly larger
  fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Consolas", monospace',
  fontWeight: 500,
  border: `1px solid ${theme.palette.divider}`,
}))

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  fontWeight: 600, // Increased from 500
  position: "relative",
  transition: "color 0.2s ease-in-out",
  "&:hover": {
    color: theme.palette.primary.dark,
    textDecoration: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "2px",
    bottom: "-2px",
    left: 0,
    backgroundColor: theme.palette.primary.main,
    transform: "scaleX(0)",
    transformOrigin: "bottom right",
    transition: "transform 0.2s ease-in-out",
  },
  "&:hover::after": {
    transform: "scaleX(1)",
    transformOrigin: "bottom left",
  },
}))

const StyledBlockquote = styled(Box)(({ theme }) => ({
  borderLeft: `6px solid ${theme.palette.primary.main}`, // Increased from 4px
  paddingLeft: theme.spacing(3), // Increased from 2
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[50],
  borderRadius: "0 8px 8px 0",
  position: "relative",
  boxShadow: theme.shadows[1],
  "&::before": {
    content: '"""',
    position: "absolute",
    top: theme.spacing(1),
    left: theme.spacing(1),
    fontSize: "3rem",
    color: theme.palette.primary.main,
    opacity: 0.3,
    fontFamily: "serif",
    lineHeight: 1,
  },
}))

const StyledCallout = styled(Paper)(({ theme, variant }) => ({
  padding: theme.spacing(3), // Increased from 2
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1.5),
  position: "relative",
  overflow: "hidden",
  border: `2px solid ${variant === "warning" ? theme.palette.warning.main : theme.palette.info.main}`,
  backgroundColor:
    variant === "warning"
      ? theme.palette.mode === "dark"
        ? theme.palette.warning.dark
        : theme.palette.warning.light
      : theme.palette.mode === "dark"
        ? theme.palette.info.dark
        : theme.palette.info.light,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    backgroundColor: variant === "warning" ? theme.palette.warning.main : theme.palette.info.main,
  },
}))

const RichTextRenderer = ({ content }) => {
  if (!content || !Array.isArray(content)) {
    return null
  }

  const renderNode = (node, index) => {
    switch (node.type) {
      case "paragraph":
        return (
          <StyledParagraph key={index} component="p">
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
          </StyledParagraph>
        )

      case "heading":
        const getHeadingVariant = (level) => {
          switch (level) {
            case 1:
              return "h3"
            case 2:
              return "h4"
            case 3:
              return "h5"
            case 4:
              return "h6"
            default:
              return "h6"
          }
        }

        return (
          <StyledHeading
            key={index}
            variant={getHeadingVariant(node.level || 1)}
            component={`h${Math.min(node.level || 1, 6)}`}
          >
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
          </StyledHeading>
        )

      case "text":
        return node.content || ""

      case "bold":
        return (
          <Typography key={index} component="strong" sx={{ fontWeight: 700, color: "text.primary" }}>
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
          </Typography>
        )

      case "italic":
        return (
          <Typography key={index} component="em" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
          </Typography>
        )

      case "underline":
        return (
          <Typography
            key={index}
            component="span"
            sx={{
              textDecoration: "underline",
              textDecorationColor: "primary.main",
              textDecorationThickness: "2px",
              textUnderlineOffset: "3px",
            }}
          >
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
          </Typography>
        )

      case "inline-code":
        return (
          <InlineCode key={index}>
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
          </InlineCode>
        )

      case "link":
        return (
          <StyledLink key={index} href={node.url || "#"} target="_blank" rel="noopener noreferrer">
            {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
          </StyledLink>
        )

      case "image":
        return (
          <Box key={index} sx={{ textAlign: "center", my: 4 }}>
            <StyledImage src={node.src || "/placeholder.svg?height=300&width=500"} alt={node.alt || "Image"} />
            {node.caption && (
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  color: "text.secondary",
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                }}
              >
                {node.caption}
              </Typography>
            )}
          </Box>
        )

      case "bullet-list":
        return (
          <StyledList key={index} sx={{ listStyleType: "none", pl: 0 }}>
            {node.items?.map((item, i) => (
              <ListItem key={i} sx={{ display: "flex", alignItems: "flex-start", pl: 0, py: 0.75 }}>
                <ListItemText
                  primary={item.children ? item.children.map((child, j) => renderNode(child, j)) : item.content}
                  sx={{ my: 0 }}
                />
              </ListItem>
            ))}
          </StyledList>
        )

      case "numbered-list":
        return (
          <StyledList
            key={index}
            component="ol"
            sx={{
              listStyleType: "decimal",
              pl: 3,
              "& .MuiListItem-root::before": {
                display: "none",
              },
            }}
          >
            {node.items?.map((item, i) => (
              <ListItem key={i} sx={{ display: "list-item", pl: 1, py: 0.75 }}>
                <ListItemText
                  primary={item.children ? item.children.map((child, j) => renderNode(child, j)) : item.content}
                  sx={{ my: 0 }}
                />
              </ListItem>
            ))}
          </StyledList>
        )

      case "divider":
        return (
          <Divider
            key={index}
            sx={{
              my: 4,
              borderColor: "primary.main",
              opacity: 0.3,
              "&::before, &::after": {
                borderColor: "inherit",
              },
            }}
          />
        )

      case "table":
        return (
          <StyledTable key={index} component="div">
            <Table size="medium">
              {node.headers && (
                <TableHead>
                  <TableRow>
                    {node.headers.map((header, i) => (
                      <TableCell key={i}>
                        {header.children ? header.children.map((child, j) => renderNode(child, j)) : header.content}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {node.rows?.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j}>
                        {cell.children ? cell.children.map((child, k) => renderNode(child, k)) : cell.content}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTable>
        )

      case "code":
        return (
          <StyledCodeBlock key={index}>
            <code>{node.content}</code>
          </StyledCodeBlock>
        )

      case "blockquote":
        return (
          <StyledBlockquote key={index}>
            <Typography
              variant="h6"
              sx={{
                fontStyle: "italic",
                color: "text.primary",
                fontSize: "1.1rem",
                lineHeight: 1.6,
                paddingLeft: 2,
              }}
            >
              {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
            </Typography>
          </StyledBlockquote>
        )

      case "callout":
  return (
    <StyledCallout 
      key={index} 
      elevation={1} 
      variant={node.variant}
      sx={{
        backgroundColor: "#f8f9fa",
        borderLeft: "4px solid #dee2e6",
        border: "1px solid #e9ecef",
        "&:hover": {
          backgroundColor: "#f1f3f4",
        }
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontSize: "1.05rem",
          lineHeight: 1.6,
          fontWeight: 500,
          color: "#495057",
        }}
      >
        {node.children ? node.children.map((child, i) => renderNode(child, i)) : node.content}
      </Typography>
    </StyledCallout>
  )

      case "tag":
        return (
          <Chip
            key={index}
            label={node.content}
            size="medium"
            sx={{
              mr: 1.5,
              mb: 1.5,
              fontWeight: 600,
              fontSize: "0.85rem",
              height: "32px",
            }}
            color="primary"
            variant="outlined"
          />
        )

      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        maxWidth: "100%",
        "& > *:first-child": { mt: 0 },
        "& > *:last-child": { mb: 0 },
        // Better spacing for the overall container
        "& p + h1, & p + h2, & p + h3, & p + h4, & p + h5, & p + h6": {
          marginTop: (theme) => theme.spacing(4),
        },
        // Improved typography scale
        fontSize: "1rem",
        lineHeight: 1.7,
      }}
    >
      {content.map((node, index) => renderNode(node, index))}
    </Box>
  )
}

export default RichTextRenderer
