import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Collapse,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  YouTube as YouTubeIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  FormatListBulleted as ListIcon,
  FormatListNumbered as OrderedListIcon,
  CheckBox as ChecklistIcon,
  Title as TitleIcon,
  HorizontalRule as DelimiterIcon,
  GridView as TableIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Pin as PinIcon
} from '@mui/icons-material';
import useMeetingNote from '../hooks/useMeetingNote';
import MeetingNoteSidebar from './MeetingNoteSidebar';
import useAuth from '../hooks/useAuth';
import CommentsSection from './CommentSection';
import parse from "html-react-parser";
import { useParams } from "react-router-dom";
import { generatePresignedUrl } from '../utils/s3Utils';

// Sophisticated color palette inspired by Notion
const colors = {
  background: '#ffffff',
  surface: '#f7f7f7',
  primary: '#37352f',
  secondary: '#6b7280',
  accent: '#3b82f6',
  border: '#e5e7eb',
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    muted: '#9ca3af'
  },
  highlights: {
    youtube: '#dc2626',
    code: '#059669',
    image: '#7c3aed',
    table: '#f59e0b',
    list: '#2563eb'
  },
  status: {
    pinned: '#fbbf24',
    archived: '#9ca3af'
  }
};

const MeetingNoteDisplay = () => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const { currentNote, loadMeetingNoteById } = useMeetingNote();
  const { currentCompany } = useAuth();
  const { id } = useParams();
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  React.useEffect(() => {
    if (currentCompany && id) {
      loadMeetingNoteById(currentCompany, id);
    }
  }, [currentCompany, id]);

  // Function to check if a URL is an S3 path
  const isS3Path = (url) => {
    return url && url.startsWith('accounts/');
  };

  // Function to generate presigned URL for S3 images
  const getImageUrl = async (imageUrl) => {
    if (!imageUrl) return null;
    
    // If already cached, return cached URL
    if (imageUrls[imageUrl]) {
      return imageUrls[imageUrl];
    }

    // If it's not an S3 path, return as-is
    if (!isS3Path(imageUrl)) {
      return imageUrl;
    }

    try {
      // Generate presigned URL for S3 image
      setLoadingImages(prev => ({ ...prev, [imageUrl]: true }));
      const { presignedUrl, success } = await generatePresignedUrl({
        filePath: imageUrl,
        expiryMinutes: 60
      });

      if (success && presignedUrl) {
        setImageUrls(prev => ({ ...prev, [imageUrl]: presignedUrl }));
        return presignedUrl;
      }
      return imageUrl; // Fallback to original URL
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      return imageUrl;
    } finally {
      setLoadingImages(prev => ({ ...prev, [imageUrl]: false }));
    }
  };

  // Preload all images in the note
  useEffect(() => {
    const preloadImages = async () => {
      if (!currentNote?.content?.blocks) return;

      const imageBlocks = currentNote.content.blocks.filter(
        block => block.type === 'image'
      );

      const urlsToLoad = {};
      imageBlocks.forEach(block => {
        const url = block.data?.file?.url || block.data?.url;
        if (url && isS3Path(url)) {
          urlsToLoad[url] = true;
        }
      });

      // Load presigned URLs for S3 images
      for (const url of Object.keys(urlsToLoad)) {
        if (!imageUrls[url]) {
          await getImageUrl(url);
        }
      }
    };

    preloadImages();
  }, [currentNote]);

  if (!currentNote) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        backgroundColor: colors.background
      }}>
        <Typography variant="h6" sx={{ color: colors.text.muted }}>
          Select a note to view
        </Typography>
      </Box>
    );
  }

  const { content, metadata, tags, title, createdAt, updatedAt, isPinned, isArchived, createdBy } = currentNote;
  const blocks = content?.blocks || [];

  const normalizeDate = (dateStr) => {
    if (typeof dateStr === 'number') {
      return new Date(dateStr);
    }
    return new Date(dateStr.replace(" at ", " "));
  };

  const createdDate = normalizeDate(createdAt);
  const updatedDate = normalizeDate(updatedAt);

  const handleSidebarClose = async () => {
    console.log("Closing sidebar");
    if (currentCompany && currentNote.id) {
      loadMeetingNoteById(currentCompany, currentNote.id);
    }
    setIsNotesSidebarOpen(false);
    setSelectedNoteId(null);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHTML = (html) => {
    if (!html) return "";
    const clean = html.replace(/&nbsp;/g, " ");

    return parse(clean, {
      replace: (domNode) => {
        if (domNode.name === "a" && domNode.attribs?.href) {
          return (
            <a
              href={domNode.attribs.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accent, textDecoration: "underline" }}
            >
              {domNode.children.map((child) => renderHTML(child.data))}
            </a>
          );
        }
      },
    });
  };

  // Handle image rendering - SYNC VERSION
  const ImageComponent = ({ block }) => {
    const [displayUrl, setDisplayUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      const loadImage = async () => {
        let imageUrl = '';
        let caption = '';

        // Handle new format with file object
        if (block.data?.file?.url) {
          imageUrl = block.data.file.url;
        }
        // Handle old format with direct url property
        else if (block.data?.url) {
          imageUrl = block.data.url;
        }

        if (!imageUrl) {
          setIsLoading(false);
          return;
        }

        // Get the appropriate URL (presigned for S3, direct for others)
        if (isS3Path(imageUrl)) {
          try {
            const { presignedUrl, success } = await generatePresignedUrl({
              filePath: imageUrl,
              expiryMinutes: 60
            });
            if (success && presignedUrl) {
              setDisplayUrl(presignedUrl);
            } else {
              setDisplayUrl(imageUrl);
            }
          } catch (error) {
            console.error('Error generating presigned URL:', error);
            setDisplayUrl(imageUrl);
          }
        } else {
          setDisplayUrl(imageUrl);
        }
        setIsLoading(false);
      };

      loadImage();
    }, [block]);

    if (isLoading) {
      return (
        <Box sx={{ my: '40px' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            backgroundColor: colors.surface,
            borderRadius: '12px'
          }}>
            <CircularProgress />
          </Box>
        </Box>
      );
    }

    if (!displayUrl) return null;

    return (
      <Box sx={{ my: '40px' }}>
        <Box
          component="img"
          src={displayUrl}
          alt="Note image"
          sx={{
            width: '100%',
            maxHeight: '500px',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: `1px solid ${colors.border}`
          }}
          onError={(e) => {
            // Fallback to original URL if available
            const originalUrl = block.data?.file?.url || block.data?.url;
            if (originalUrl && displayUrl !== originalUrl) {
              e.target.src = originalUrl;
            }
          }}
        />
        {block.data?.caption && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 1,
              color: colors.text.secondary,
              fontStyle: 'italic'
            }}
          >
            {block.data.caption}
          </Typography>
        )}
      </Box>
    );
  };

  // Render different block types
  const renderBlock = (block) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <Typography
            variant="body1"
            sx={{
              mb: '24px',
              color: colors.text.primary,
              lineHeight: 1.7,
              fontSize: '18px'
            }}
          >
            {renderHTML(block.data.text)}
          </Typography>
        );

      case 'embed':
        if (block.data.service === 'youtube') {
          return (
            <Box sx={{ my: '40px' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  height: 0,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <iframe
                  src={block.data.embed}
                  title="YouTube video"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allowFullScreen
                />
              </Box>
            </Box>
          );
        }
        return null;

      case 'list':
        if (block.data.style === 'checklist') {
          return (
            <Box sx={{ my: '24px', ml: '4px' }}>
              {block.data.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    mb: '12px',
                    p: '6px 0'
                  }}
                >
                  <Checkbox
                    checked={item.meta.checked}
                    size="small"
                    sx={{
                      p: 0,
                      mr: 2,
                      mt: '2px',
                      color: colors.accent
                    }}
                  />
                  <Typography
                    sx={{
                      color: colors.text.primary,
                      fontSize: '18px',
                      textDecoration: item.meta.checked ? 'line-through' : 'none',
                      opacity: item.meta.checked ? 0.6 : 1,
                      flex: 1,
                      lineHeight: 1.6
                    }}
                  >
                    {(item.content)}
                  </Typography>
                </Box>
              ))}
            </Box>
          );
        }

        const ListComponent = block.data.style === 'ordered' ? 'ol' : 'ul';
        return (
          <Box
            component={ListComponent}
            sx={{
              my: '24px',
              pl: block.data.style === 'ordered' ? '32px' : '28px',
              color: colors.text.primary,
              fontSize: '18px',
              lineHeight: 1.7,
              '& li': {
                mb: '12px',
                lineHeight: 1.6
              }
            }}
          >
            {block.data.items.map((item, index) => (
              <li key={index}>{renderHTML(item.content)}</li>
            ))}
          </Box>
        );

      case 'table':
        return (
          <Box sx={{ my: '40px' }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Table size="small">
                <TableBody>
                  {block.data.content.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      sx={{
                        backgroundColor: rowIndex % 2 === 0 ? 'transparent' : colors.surface
                      }}
                    >
                      {row.map((cell, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          sx={{
                            border: `1px solid ${colors.border}`,
                            color: colors.text.primary,
                            py: '16px',
                            fontSize: '16px'
                          }}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 'delimiter':
        return (
          <Box sx={{ my: '40px', display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                width: '100%',
                height: '2px',
                backgroundColor: colors.border,
                position: 'relative'
              }}
            />
          </Box>
        );

      case 'code':
        return (
          <Box sx={{ my: '40px' }}>
            <Paper
              elevation={0}
              sx={{
                p: '20px',
                backgroundColor: '#f8fafc',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontFamily: "'SF Mono', Monaco, 'Cascadia Mono', monospace",
                fontSize: '15px',
                lineHeight: 1.6,
                color: colors.text.primary,
                whiteSpace: 'pre-wrap',
                overflowX: 'auto'
              }}
            >
              {block.data.code}
            </Paper>
          </Box>
        );

      case 'quote':
        return (
          <Box sx={{ my: '32px' }}>
            <Paper
              elevation={0}
              sx={{
                p: '24px',
                borderLeft: `4px solid ${colors.accent}`,
                backgroundColor: colors.surface,
                borderRadius: '6px',
                fontSize: '18px',
                lineHeight: 1.6,
                color: colors.text.primary
              }}
            >
              <Typography sx={{ mb: 2, fontStyle: "italic", fontSize: "18px" }}>
                {renderHTML(block.data.text)}
              </Typography>

              {block.data.caption && (
                <Typography sx={{ fontSize: "14px", color: colors.text.muted }}>
                  — {block.data.caption}
                </Typography>
              )}
            </Paper>
          </Box>
        );

      case 'header':
        const level = block.data.level || 2;
        const headerProps = {
          1: { variant: 'h1', sx: { fontSize: '40px', fontWeight: 700, mt: '56px', mb: '32px' } },
          2: { variant: 'h2', sx: { fontSize: '32px', fontWeight: 600, mt: '48px', mb: '24px' } },
          3: { variant: 'h3', sx: { fontSize: '28px', fontWeight: 600, mt: '40px', mb: '20px' } },
          4: { variant: 'h4', sx: { fontSize: '24px', fontWeight: 600, mt: '32px', mb: '16px' } }
        };
        const props = headerProps[level] || headerProps[2];

        return (
          <Typography
            variant={props.variant}
            sx={{
              color: colors.text.primary,
              ...props.sx
            }}
          >
            {block.data.text.replace(/&nbsp;/g, ' ')}
          </Typography>
        );

      case 'image':
        return <ImageComponent block={block} />;

      default:
        return null;
    }
  };

  return (
    <Box sx={{
      backgroundColor: colors.background,
      minHeight: '100vh',
      maxWidth: '1000px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      px: { xs: 2, sm: 3, md: 4 },
      pt: 2
    }}>
      <Tooltip title="Edit notes" placement="left">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setIsNotesSidebarOpen(true);
          }}
          sx={{
            position: 'fixed',
            top: '80px',
            right: { xs: 16, sm: 24, md: 32 },
            zIndex: 1000,
            p: 1,
            borderRadius: '12px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: colors.primary,
              color: '#fff',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Header with note info */}
      <Box sx={{ pt: '56px', pb: '40px' }}>
        {/* Status badges */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {isPinned && (
            <Chip
              icon={<PinIcon />}
              label="Pinned"
              size="small"
              sx={{
                backgroundColor: `${colors.status.pinned}15`,
                color: colors.text.primary,
                fontWeight: 500
              }}
            />
          )}
          {isArchived && (
            <Chip
              icon={<ArchiveIcon />}
              label="Archived"
              size="small"
              sx={{
                backgroundColor: `${colors.status.archived}15`,
                color: colors.text.secondary,
                fontWeight: 500
              }}
            />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '36px', sm: '48px', md: '56px' },
            fontWeight: 700,
            color: colors.text.primary,
            mb: 3,
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>

        {/* Meta info row */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          color: colors.text.muted
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2">
              Created By {createdBy}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EditIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">
              Updated {formatDate(updatedDate)}
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
            <TagIcon sx={{ color: colors.text.muted, mt: '6px' }} />
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: `${colors.accent}10`,
                  color: colors.accent,
                  fontWeight: 500,
                  border: `1px solid ${colors.accent}30`,
                  '&:hover': {
                    backgroundColor: `${colors.accent}20`
                  }
                }}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ borderColor: colors.border, my: 4 }} />
      </Box>

      {/* Main Content */}
      <Box sx={{ pb: '80px' }}>
        {blocks.map((block) => (
          <Box key={block.id}>
            {renderBlock(block)}
          </Box>
        ))}
      </Box>

      {/* Comments and Sidebar */}
      <CommentsSection comments={currentNote.comments} />
      <MeetingNoteSidebar
        open={isNotesSidebarOpen}
        onClose={handleSidebarClose}
      />
    </Box>
  );
};

export default MeetingNoteDisplay;