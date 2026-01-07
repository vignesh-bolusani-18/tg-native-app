// src/components/MeetingNoteEditor/MeetingNoteEditor.jsx
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Slate, 
  Editable, 
  withReact,
  ReactEditor,
  useFocused,
  useSelected
} from 'slate-react';
import { 
  createEditor, 
  Editor, 
  Transforms,
  Range,
  Point,
  Element as SlateElement,
  Text
} from 'slate';
import { withHistory } from 'slate-history';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';

// MUI Components
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Popover,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Fade,
  ClickAwayListener,
  InputBase
} from '@mui/material';

// MUI Icons
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import TitleIcon from '@mui/icons-material/Title';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import TagIcon from '@mui/icons-material/Tag';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';

import { styled } from '@mui/material/styles';
import { 
  updateNoteContent,
  updateNoteTitle,
  startSaving,
  finishSaving,
  updateNoteTimestamp,
  togglePinNote,
  addTagToNote,
  removeTagFromNote,
  createNewNote
} from '../redux/slices/meetingNoteSlice';

// ==================== STYLED COMPONENTS ====================
const EditorContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: '#f8f9fa',
  borderBottom: `1px solid #e0e0e0`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const TitleSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}));

const TitleInput = styled(InputBase)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 700,
  color: '#2c3e50',
  flex: 1,
  '& input': {
    padding: 0,
    '&::placeholder': {
      color: '#95a5a6',
    }
  }
}));

const MetadataSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
  alignItems: 'center',
  fontSize: '13px',
  color: '#7f8c8d',
}));

const MetadataItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
}));

const StatusBadge = styled(Chip)(({ theme }) => ({
  fontSize: '12px',
  height: '24px',
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  border: '1px solid #c8e6c9',
  fontWeight: 500,
}));

const TagChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#f1f8ff',
  color: '#1976d2',
  border: '1px solid #bbdefb',
  fontSize: '12px',
  height: '24px',
  '& .MuiChip-deleteIcon': {
    fontSize: '16px',
    color: '#1976d2',
  }
}));

const AddTagButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '12px',
  color: '#1976d2',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
  }
}));

const StyledEditable = styled(Editable)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
  fontSize: '15px',
  lineHeight: 1.6,
  overflowY: 'auto',
  outline: 'none',
  minHeight: '400px',
  backgroundColor: '#ffffff',
  color: '#2c3e50',
  
  '& h1': {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: `${theme.spacing(3)} 0 ${theme.spacing(1)}`,
    color: '#2c3e50',
    paddingBottom: theme.spacing(0.5),
  },
  
  '& h2': {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: `${theme.spacing(2.5)} 0 ${theme.spacing(1)}`,
    color: '#2c3e50',
  },
  
  '& h3': {
    fontSize: '1.125rem',
    fontWeight: 600,
    margin: `${theme.spacing(2)} 0 ${theme.spacing(1)}`,
    color: '#34495e',
  },
  
  '& p': {
    marginBottom: theme.spacing(1.5),
  },
  
  '& blockquote': {
    borderLeft: `4px solid #3498db`,
    margin: `${theme.spacing(2)} 0 ${theme.spacing(2)} ${theme.spacing(2)}`,
    paddingLeft: theme.spacing(2),
    color: '#7f8c8d',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: theme.spacing(1.5),
    borderRadius: '4px',
  },
  
  '& pre': {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    padding: theme.spacing(2),
    borderRadius: '6px',
    overflowX: 'auto',
    fontFamily: '"SF Mono", Monaco, Consolas, "Courier New", monospace',
    fontSize: '14px',
    margin: `${theme.spacing(2)} 0`,
  },
  
  '& code': {
    backgroundColor: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
    color: '#e74c3c',
    border: '1px solid #e0e0e0',
  },
  
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
    margin: `${theme.spacing(1.5)} 0`,
    
    '& li': {
      marginBottom: theme.spacing(0.5),
    }
  },
  
  '& table': {
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: '100%',
    margin: `${theme.spacing(2)} 0`,
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    
    '& th, & td': {
      border: `1px solid #e0e0e0`,
      padding: theme.spacing(1.25),
      textAlign: 'left',
    },
    
    '& th': {
      backgroundColor: '#f8f9fa',
      fontWeight: 600,
      color: '#2c3e50',
    },
    
    '& tr:hover': {
      backgroundColor: '#f8f9fa',
    }
  }
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backgroundColor: '#ffffff',
  borderBottom: `1px solid #e0e0e0`,
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexWrap: 'wrap',
}));

const ToolbarButton = styled(IconButton)(({ theme, active }) => ({
  minWidth: '36px',
  height: '36px',
  borderRadius: '4px',
  backgroundColor: active ? '#e3f2fd' : 'transparent',
  color: active ? '#1976d2' : '#5f6368',
  border: active ? '1px solid #bbdefb' : '1px solid transparent',
  
  '&:hover': {
    backgroundColor: active ? '#bbdefb' : '#f5f5f5',
    borderColor: active ? '#90caf9' : '#e0e0e0',
  }
}));

const DividerVertical = styled(Box)(({ theme }) => ({
  width: '1px',
  height: '24px',
  backgroundColor: '#e0e0e0',
  margin: theme.spacing(0, 0.5),
}));

const StatusBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.25, 2.5),
  backgroundColor: '#f8f9fa',
  borderTop: `1px solid #e0e0e0`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '13px',
  color: '#7f8c8d',
}));

const SaveButton = styled(Button)(({ theme, saving }) => ({
  textTransform: 'none',
  fontSize: '13px',
  fontWeight: 500,
  padding: theme.spacing(0.5, 2),
  backgroundColor: '#1976d2',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
  '&.Mui-disabled': {
    backgroundColor: '#e0e0e0',
    color: '#9e9e9e',
  }
}));

// Block Insertion Components
const BlockInsertionControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  border: '1px solid #e0e0e0',
  zIndex: 999,
  opacity: 0,
  transform: 'translateY(-10px)',
  transition: 'all 0.2s ease',
  pointerEvents: 'none',
  
  '&.visible': {
    opacity: 1,
    transform: 'translateY(0)',
    pointerEvents: 'auto',
  }
}));

const InsertionButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  color: '#5f6368',
  backgroundColor: 'transparent',
  
  '&:hover': {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  }
}));

const iconButtonSx = {
  width: 36,
  height: 36,
  borderRadius: '8px',
  color: '#5f6368',
  border: '1px solid transparent',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    color: '#1976d2',
    borderColor: '#e0e0e0',
  },
};

// Floating Toolbar
const FloatingToolbar = styled(Box)(({ theme, visible }) => ({
  position: 'absolute',
  display: visible ? 'flex' : 'none',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.75),
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)',
  border: `1px solid #e0e0e0`,
  zIndex: 1000,
  transform: 'translateY(-100%)',
  transition: 'all 0.2s ease',
}));

// Image Element Component
const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  
  return (
    <div {...attributes}>
      <div contentEditable={false} style={{ position: 'relative' }}>
        <img
          src={element.url}
          alt={element.alt || ''}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '400px',
            borderRadius: '6px',
            boxShadow: selected && focused ? '0 0 0 2px #3498db' : 'none',
            margin: '16px 0',
            border: '1px solid #e0e0e0',
          }}
        />
        {element.alt && (
          <div style={{
            fontSize: '13px',
            color: '#7f8c8d',
            textAlign: 'center',
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            {element.alt}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

// Link Element Component
const LinkElement = ({ attributes, children, element }) => {
  return (
    <a
      {...attributes}
      href={element.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ 
        color: '#1976d2', 
        textDecoration: 'none',
        borderBottom: '1px solid #bbdefb',
        paddingBottom: '1px',
        '&:hover': {
          borderBottom: '2px solid #1976d2',
        }
      }}
    >
      {children}
    </a>
  );
};

// ==================== SLATE ELEMENTS ====================
const Element = ({ attributes, children, element, editor }) => {
  const selected = useSelected();
  const path = ReactEditor.findPath(editor, element);
  
  const handleClick = (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      // Handle block selection in parent component
      window.dispatchEvent(new CustomEvent('block-select', { 
        detail: { path, event: { ctrlKey: true } } 
      }));
    }
  };

  const elementProps = {
    ...attributes,
    onClick: handleClick,
    style: {
      ...attributes.style,
      position: 'relative',
      margin: '2px 0',
      padding: '4px 0',
      cursor: 'pointer',
    },
    'data-slate-path': JSON.stringify(path),
  };

  switch (element.type) {
    case 'heading-one':
      return <h1 {...elementProps}>{children}</h1>;
    case 'heading-two':
      return <h2 {...elementProps}>{children}</h2>;
    case 'heading-three':
      return <h3 {...elementProps}>{children}</h3>;
    case 'blockquote':
      return <blockquote {...elementProps}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul style={{ listStyleType: 'disc' }} {...elementProps}>{children}</ul>;
    case 'numbered-list':
      return <ol style={{ listStyleType: 'decimal' }} {...elementProps}>{children}</ol>;
    case 'list-item':
      return <li {...elementProps}>{children}</li>;
    case 'code-block':
      return <pre {...elementProps}>{children}</pre>;
    case 'code-line':
      return <code {...elementProps}>{children}</code>;
    case 'image':
      return <ImageElement attributes={attributes} element={element}>{children}</ImageElement>;
    case 'link':
      return <LinkElement attributes={attributes} element={element}>{children}</LinkElement>;
    case 'table':
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody {...elementProps}>{children}</tbody>
        </table>
      );
    case 'table-row':
      return <tr {...elementProps}>{children}</tr>;
    case 'table-cell':
      return <td style={{ border: '1px solid #e0e0e0', padding: '12px' }} {...elementProps}>{children}</td>;
    default:
      return <p {...elementProps}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong style={{ fontWeight: 700 }}>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em style={{ fontStyle: 'italic' }}>{children}</em>;
  }
  if (leaf.underline) {
    children = <u style={{ textDecoration: 'underline' }}>{children}</u>;
  }
  if (leaf.code) {
    children = <code style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '2px 6px', 
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '0.9em',
      color: '#e74c3c',
      border: '1px solid #e0e0e0'
    }}>{children}</code>;
  }
  if (leaf.highlight) {
    children = <mark style={{ 
      backgroundColor: '#fff9c4',
      padding: '0 2px',
      borderRadius: '2px'
    }}>{children}</mark>;
  }
  if (leaf.strikethrough) {
    children = <del style={{ textDecoration: 'line-through', color: '#95a5a6' }}>{children}</del>;
  }
  
  return <span {...attributes}>{children}</span>;
};

// ==================== EDITOR HELPERS ====================
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });
  return !!match;
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      LIST_TYPES.includes(
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type
      ),
    split: true,
  });

  const newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const insertImage = (editor, url, alt = '') => {
  const text = { text: '' };
  const image = { 
    type: 'image', 
    url, 
    alt,
    children: [text]
  };
  
  Transforms.insertNodes(editor, image);
  Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
};

const insertLink = (editor) => {
  const url = window.prompt('Enter the URL:');
  if (!url) return;
  
  if (!isUrl(url)) {
    alert('Please enter a valid URL');
    return;
  }
  
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };
  
  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const insertTable = (editor, rows = 3, cols = 3) => {
  const table = {
    type: 'table',
    children: [],
  };
  
  for (let r = 0; r < rows; r++) {
    const row = {
      type: 'table-row',
      children: [],
    };
    
    for (let c = 0; c < cols; c++) {
      const cell = {
        type: 'table-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      };
      row.children.push(cell);
    }
    
    table.children.push(row);
  }
  
  Transforms.insertNodes(editor, table);
  Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
};

// ==================== BLOCK INSERTION HOOK ====================
const useBlockInsertion = (editor) => {
  const insertBlock = useCallback((position, blockType = 'paragraph', relativeToPath = null) => {
    if (!editor.selection) {
      // If no selection, insert at end
      Transforms.insertNodes(editor, {
        type: blockType,
        children: [{ text: '' }]
      });
      return null;
    }

    const [node, nodePath] = Editor.node(editor, editor.selection);

    let insertPath;
    
    switch (position) {
      case 'above':
        insertPath = nodePath;
        break;
      
      case 'below':
        insertPath = [...nodePath.slice(0, -1), nodePath[nodePath.length - 1] + 1];
        break;
      
      case 'between':
        if (relativeToPath) {
          const middleIndex = Math.floor((nodePath[nodePath.length - 1] + relativeToPath[relativeToPath.length - 1]) / 2);
          insertPath = [...nodePath.slice(0, -1), middleIndex];
        } else {
          insertPath = [...nodePath.slice(0, -1), nodePath[nodePath.length - 1] + 1];
        }
        break;
      
      default:
        insertPath = [...nodePath.slice(0, -1), nodePath[nodePath.length - 1] + 1];
    }

    Transforms.insertNodes(editor, {
      type: blockType,
      children: [{ text: '' }]
    }, { at: insertPath });

    // Move cursor to the new block
    Transforms.select(editor, insertPath);
    
    return insertPath;
  }, [editor]);

  const insertBlockAtPath = useCallback((path, blockType = 'paragraph') => {
    if (!path) return;
    
    Transforms.insertNodes(editor, {
      type: blockType,
      children: [{ text: '' }]
    }, { at: path });
    
    Transforms.select(editor, path);
    
    return path;
  }, [editor]);

  return { insertBlock, insertBlockAtPath };
};

// ==================== BLOCK INSERTION MENU COMPONENT ====================
const BlockInsertionMenu = ({ 
  editor, 
  onClose, 
  onInsert 
}) => {
  const [selectedBlockType, setSelectedBlockType] = useState('paragraph');

  const blockTypes = [
    { type: 'paragraph', label: 'Paragraph', icon: <TitleIcon fontSize="small" /> },
    { type: 'heading-one', label: 'Heading 1', icon: <TitleIcon fontSize="small" /> },
    { type: 'heading-two', label: 'Heading 2', icon: <TitleIcon fontSize="small" /> },
    { type: 'bulleted-list', label: 'Bullet List', icon: <FormatListBulletedIcon fontSize="small" /> },
    { type: 'numbered-list', label: 'Numbered List', icon: <FormatListNumberedIcon fontSize="small" /> },
    { type: 'blockquote', label: 'Quote', icon: <FormatQuoteIcon fontSize="small" /> },
    { type: 'code-block', label: 'Code Block', icon: <CodeIcon fontSize="small" /> },
    { type: 'image', label: 'Image', icon: <ImageIcon fontSize="small" /> },
    { type: 'table', label: 'Table', icon: <InsertDriveFileIcon fontSize="small" /> },
  ];

  const handleInsert = () => {
    onInsert(selectedBlockType);
  };

  const handleQuickInsert = (blockType) => {
    setSelectedBlockType(blockType);
    onInsert(blockType);
  };

  return (
    <Box sx={{ p: 1, minWidth: 250 }}>
      <Typography variant="caption" sx={{ color: '#7f8c8d', mb: 1, display: 'block' }}>
        Select block type:
      </Typography>
      
      {/* Quick Insert Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          mb: 2,
        }}
      >
        {blockTypes.slice(0, 6).map((block) => (
          <IconButton
            key={block.type}
            onClick={() => handleQuickInsert(block.type)}
            sx={{
              width: 48,
              height: 48,
              flexDirection: 'column',
              borderRadius: '8px',
              backgroundColor: selectedBlockType === block.type ? '#e3f2fd' : '#f8f9fa',
              color: selectedBlockType === block.type ? '#1976d2' : '#5f6368',
              '&:hover': {
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
              }
            }}
          >
            {block.icon}
            <Typography variant="caption" sx={{ fontSize: 10, mt: 0.5 }}>
              {block.label.split(' ')[0]}
            </Typography>
          </IconButton>
        ))}
      </Box>

      {/* Detailed Selection */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {blockTypes.map((block) => (
          <Button
            key={block.type}
            startIcon={block.icon}
            onClick={() => setSelectedBlockType(block.type)}
            variant={selectedBlockType === block.type ? 'contained' : 'outlined'}
            size="small"
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '13px',
              py: 0.5,
              backgroundColor: selectedBlockType === block.type ? '#e3f2fd' : 'transparent',
              color: selectedBlockType === block.type ? '#1976d2' : '#5f6368',
              borderColor: selectedBlockType === block.type ? '#bbdefb' : '#e0e0e0',
            }}
          >
            {block.label}
          </Button>
        ))}
      </Stack>
      
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          onClick={handleInsert}
          startIcon={<AddIcon />}
        >
          Insert Block
        </Button>
      </Box>
    </Box>
  );
};

// ==================== MAIN COMPONENT ====================
const MeetingNoteEditor = () => {
  const dispatch = useDispatch();
  
  const meetingNotesState = useSelector(state => state.meetingNotes);
  const currentNote = meetingNotesState?.currentNote || {
    id: null,
    title: "",
    content: [],
    createdAt: "",
    updatedAt: "",
    meetingId: null,
    tags: [],
    isPinned: false,
    isArchived: false,
    metadata: { userID: 'Anonymous' }
  };
  
  const editorState = meetingNotesState?.editorState || {
    isSaving: false,
    hasUnsavedChanges: false,
    lastSaved: null,
  };

  const [newTag, setNewTag] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [floatingToolbar, setFloatingToolbar] = useState({
    visible: false,
    top: 0,
    left: 0,
  });
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [expandedTags, setExpandedTags] = useState(false);
  
  // Block insertion states
  const [insertionControls, setInsertionControls] = useState({
    visible: false,
    path: null,
    x: 0,
    y: 0,
    direction: 'below',
  });
  
  const [insertionMenuOpen, setInsertionMenuOpen] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  
  const saveTimeoutRef = useRef(null);
  const editorContainerRef = useRef(null);
  const insertionMenuPositionRef = useRef({ x: 0, y: 0, direction: 'below' });
  
  // Create editor instance
  const editor = useMemo(() => {
    const editorInstance = withHistory(withReact(createEditor()));
    
    editorInstance.insertImage = (url, alt) => insertImage(editorInstance, url, alt);
    editorInstance.insertLink = () => insertLink(editorInstance);
    editorInstance.insertTable = (rows, cols) => insertTable(editorInstance, rows, cols);
    
    return editorInstance;
  }, []);
  
  // Initialize block insertion hook
  const { insertBlock, insertBlockAtPath } = useBlockInsertion(editor);
  
  const initialValue = useMemo(() => 
    currentNote.content && currentNote.content.length > 0 
      ? currentNote.content
      : [{ 
          type: 'paragraph', 
          children: [{ 
            text: 'Start writing your note here... You can use / to open commands, or select text to see formatting options.' 
          }] 
        }],
    [currentNote.id]
  );
  
  // Handle block selection events
  useEffect(() => {
    const handleBlockSelect = (event) => {
      const { path, event: clickEvent } = event.detail;
      
      if (clickEvent.ctrlKey || clickEvent.metaKey) {
        setSelectedPaths(prev => {
          const pathStr = JSON.stringify(path);
          if (prev.some(p => JSON.stringify(p) === pathStr)) {
            return prev.filter(p => JSON.stringify(p) !== pathStr);
          } else {
            if (prev.length >= 2) {
              return [prev[1], path]; // Keep only last two selections
            }
            return [...prev, path];
          }
        });
      }
    };

    const handleMouseMove = (event) => {
      if (!editorContainerRef.current) return;
      
      const containerRect = editorContainerRef.current.getBoundingClientRect();
      const x = event.clientX - containerRect.left;
      const y = event.clientY - containerRect.top;
      
      // Find the nearest block element
      const elements = document.elementsFromPoint(event.clientX, event.clientY);
      const blockElement = elements.find(el => 
        el.hasAttribute('data-slate-node') || 
        el.getAttribute('data-slate-path')
      );
      
      if (blockElement) {
        const blockRect = blockElement.getBoundingClientRect();
        const relativeY = event.clientY - blockRect.top;
        const isNearTop = relativeY < 20;
        const isNearBottom = relativeY > blockRect.height - 20;
        
        if (isNearTop || isNearBottom) {
          try {
            const path = JSON.parse(blockElement.getAttribute('data-slate-path') || 'null');
            if (path) {
              setHoveredBlock({ element: blockElement, path });
              setInsertionControls({
                visible: true,
                path,
                x: x,
                y: isNearTop ? blockRect.top - containerRect.top + 10 : blockRect.bottom - containerRect.top - 10,
                direction: isNearTop ? 'above' : 'below',
              });
              return;
            }
          } catch (error) {
            console.error('Error parsing path:', error);
          }
        }
      }
      
      setInsertionControls(prev => ({ ...prev, visible: false }));
      setHoveredBlock(null);
    };

    window.addEventListener('block-select', handleBlockSelect);
    if (editorContainerRef.current) {
      editorContainerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('block-select', handleBlockSelect);
      if (editorContainerRef.current) {
        editorContainerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Auto-save effect
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        handleSave();
      }
    };
  }, []);
  
  // Handle save function
  const handleSave = async () => {
    if (!isDirty || editorState.isSaving) return;
    
    dispatch(startSaving());
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch(finishSaving(new Date().toISOString()));
      dispatch(updateNoteTimestamp({ 
        field: 'updatedAt', 
        timestamp: new Date().toISOString() 
      }));
      setIsDirty(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };
  
  // Handle content change
  const handleContentChange = useCallback((value) => {
    dispatch(updateNoteContent(value));
    setIsDirty(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  }, [dispatch]);
  
  // Handle title change
  const handleTitleChange = (event) => {
    dispatch(updateNoteTitle(event.target.value));
    setIsDirty(true);
  };
  
  // Handle toggle pin
  const handleTogglePin = () => {
    dispatch(togglePinNote());
  };
  
  // Handle add tag
  const handleAddTag = () => {
    if (newTag.trim() && !currentNote.tags.includes(newTag.trim())) {
      dispatch(addTagToNote(newTag.trim()));
      setNewTag('');
    }
  };
  
  // Handle remove tag
  const handleRemoveTag = (tag) => {
    dispatch(removeTagFromNote(tag));
  };
  
  // Handle insert image
  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    
    if (!isUrl(imageUrl) && !imageExtensions.some(ext => imageUrl.endsWith(ext))) {
      alert('Please enter a valid image URL');
      return;
    }
    
    editor.insertImage(imageUrl, imageAlt);
    setImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
  };
  
  // Handle block insertion
  const handleInsertBlock = (blockType = 'paragraph') => {
    const { direction, path } = insertionControls;
    
    if (blockType === 'image') {
      setImageDialogOpen(true);
      return;
    }
    
    insertBlock(direction, blockType);
    setInsertionControls(prev => ({ ...prev, visible: false }));
  };
  
  // Handle open insertion menu
  const handleOpenInsertionMenu = (direction) => {
    insertionMenuPositionRef.current = {
      ...insertionControls,
      direction
    };
    setInsertionMenuOpen(true);
  };
  
  // Handle insert between selected blocks
  const insertBetweenSelectedBlocks = (blockType = 'paragraph') => {
    if (selectedPaths.length === 2) {
      const [firstPath, secondPath] = selectedPaths;
      
      // Make sure paths are at the same level
      if (firstPath.length !== secondPath.length) {
        alert('Cannot insert between blocks at different levels');
        return;
      }
      
      // Calculate middle index
      const lastIndex = firstPath.length - 1;
      const middleIndex = Math.floor((firstPath[lastIndex] + secondPath[lastIndex]) / 2);
      
      // Create new path at middle position
      const insertPath = [...firstPath.slice(0, lastIndex), middleIndex];
      
      insertBlockAtPath(insertPath, blockType);
      setSelectedPaths([]);
    }
  };
  
  // Handle key down events
  const handleKeyDown = (event) => {
    // Slash command
    if (event.key === '/' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      setMoreMenuAnchor(event.currentTarget);
      return;
    }
    
    // Block insertion shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          toggleMark(editor, 'bold');
          break;
        case 'i':
          event.preventDefault();
          toggleMark(editor, 'italic');
          break;
        case 'u':
          event.preventDefault();
          toggleMark(editor, 'underline');
          break;
        case 'k':
          event.preventDefault();
          editor.insertLink();
          break;
        case '`':
          event.preventDefault();
          toggleMark(editor, 'code');
          break;
        case 's':
          event.preventDefault();
          handleSave();
          break;
        case 'z':
          if (event.shiftKey) {
            event.preventDefault();
            editor.redo();
          } else {
            event.preventDefault();
            editor.undo();
          }
          break;
        case 'y':
          event.preventDefault();
          editor.redo();
          break;
        // Quick block insertion shortcuts
        case 'enter':
          if (event.altKey) {
            event.preventDefault();
            handleOpenInsertionMenu('below');
          }
          break;
        case 'arrowup':
          if (event.altKey) {
            event.preventDefault();
            handleOpenInsertionMenu('above');
          }
          break;
        case 'arrowdown':
          if (event.altKey) {
            event.preventDefault();
            handleOpenInsertionMenu('below');
          }
          break;
        case ' ':
          if (event.altKey && selectedPaths.length === 2) {
            event.preventDefault();
            insertBetweenSelectedBlocks();
          }
          break;
      }
    }
    
    // Shift + Enter for insert above
    if (event.shiftKey && event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      handleOpenInsertionMenu('above');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Check if valid note
  const hasValidNote = currentNote && currentNote.id !== null && currentNote.id !== undefined;
  
  if (!hasValidNote) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          p: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Note Selected
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Select a note from the list or create a new one to start editing
        </Typography>
        <Button
          variant="contained"
          onClick={() => dispatch(createNewNote())}
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          Create New Note
        </Button>
      </Box>
    );
  }
  
  return (
    <>
      <EditorContainer 
        elevation={0}
        ref={editorContainerRef}
      >
        {/* Editor Header */}
        <EditorHeader>
          <TitleSection>
            <TitleInput
              fullWidth
              placeholder="Experiment Notes - Angelcare"
              value={currentNote.title || ''}
              onChange={handleTitleChange}
              sx={{ fontSize: '24px', fontWeight: 700 }}
            />
            <Stack direction="row" spacing={1}>
              <Tooltip title={currentNote.isPinned ? 'Unpin note' : 'Pin note'}>
                <IconButton 
                  onClick={handleTogglePin}
                  size="small"
                  sx={{
                    color: currentNote.isPinned ? '#1976d2' : '#7f8c8d',
                  }}
                >
                  {currentNote.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                </IconButton>
              </Tooltip>
              <StatusBadge 
                label={currentNote.isArchived ? "Archived" : "Active"}
                size="small"
              />
            </Stack>
          </TitleSection>
          
          <MetadataSection>
            <MetadataItem>
              <PersonIcon sx={{ fontSize: 14 }} />
              <span>Omitted by {currentNote.metadata?.userID || 'Anonymous'}</span>
            </MetadataItem>
            <MetadataItem>
              <CalendarTodayIcon sx={{ fontSize: 14 }} />
              <span>Last updated: {formatDate(currentNote.updatedAt)}</span>
            </MetadataItem>
            <MetadataItem>
              <AccessTimeIcon sx={{ fontSize: 14 }} />
              <span>Created: {formatDate(currentNote.createdAt)}</span>
            </MetadataItem>
          </MetadataSection>
          
          {/* Tags Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TagIcon sx={{ fontSize: 16, color: '#7f8c8d' }} />
              <Typography variant="caption" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                Tags:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {currentNote.tags && currentNote.tags.slice(0, expandedTags ? undefined : 3).map((tag, index) => (
                  <TagChip
                    key={index}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                  />
                ))}
                {currentNote.tags && currentNote.tags.length > 3 && (
                  <IconButton 
                    size="small" 
                    onClick={() => setExpandedTags(!expandedTags)}
                    sx={{ width: 24, height: 24 }}
                  >
                    {expandedTags ? 
                      <KeyboardArrowUpIcon sx={{ fontSize: 16 }} /> : 
                      <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                    }
                  </IconButton>
                )}
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                sx={{ 
                  width: 140,
                  '& .MuiInputBase-root': {
                    height: 32,
                    fontSize: 13,
                  }
                }}
              />
              <AddTagButton
                size="small"
                startIcon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add Tag
              </AddTagButton>
            </Box>
          </Box>
        </EditorHeader>
        
        {/* Toolbar */}
        <ToolbarContainer>
          <ToolbarButton
            active={isMarkActive(editor, 'bold')}
            onClick={() => toggleMark(editor, 'bold')}
            size="small"
            title="Bold (Ctrl+B)"
          >
            <FormatBoldIcon fontSize="small" />
          </ToolbarButton>
          
          <ToolbarButton
            active={isMarkActive(editor, 'italic')}
            onClick={() => toggleMark(editor, 'italic')}
            size="small"
            title="Italic (Ctrl+I)"
          >
            <FormatItalicIcon fontSize="small" />
          </ToolbarButton>
          
          <ToolbarButton
            active={isMarkActive(editor, 'underline')}
            onClick={() => toggleMark(editor, 'underline')}
            size="small"
            title="Underline (Ctrl+U)"
          >
            <FormatUnderlinedIcon fontSize="small" />
          </ToolbarButton>
          
          <DividerVertical />
          
          <ToolbarButton
            active={isBlockActive(editor, 'heading-one')}
            onClick={() => toggleBlock(editor, 'heading-one')}
            size="small"
            title="Heading 1"
          >
            <TitleIcon fontSize="small" />
          </ToolbarButton>
          
          <ToolbarButton
            active={isBlockActive(editor, 'bulleted-list')}
            onClick={() => toggleBlock(editor, 'bulleted-list')}
            size="small"
            title="Bulleted List"
          >
            <FormatListBulletedIcon fontSize="small" />
          </ToolbarButton>
          
          <ToolbarButton
            active={isBlockActive(editor, 'numbered-list')}
            onClick={() => toggleBlock(editor, 'numbered-list')}
            size="small"
            title="Numbered List"
          >
            <FormatListNumberedIcon fontSize="small" />
          </ToolbarButton>
          
          <DividerVertical />
          
          <ToolbarButton
            onClick={() => editor.insertLink()}
            size="small"
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon fontSize="small" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => setImageDialogOpen(true)}
            size="small"
            title="Insert Image"
          >
            <ImageIcon fontSize="small" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.insertTable()}
            size="small"
            title="Insert Table"
          >
            <InsertDriveFileIcon fontSize="small" />
          </ToolbarButton>
          
          <DividerVertical />
          
          <ToolbarButton
            onClick={() => editor.undo()}
            size="small"
            title="Undo (Ctrl+Z)"
          >
            <UndoIcon fontSize="small" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.redo()}
            size="small"
            title="Redo (Ctrl+Y)"
          >
            <RedoIcon fontSize="small" />
          </ToolbarButton>
          
          <DividerVertical />
          
          <Tooltip title="Insert Block (Alt+↓)">
            <ToolbarButton
              onClick={() => handleOpenInsertionMenu('below')}
              size="small"
            >
              <AddIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>
          
          <IconButton 
            size="small"
            onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
            sx={{ ml: 'auto' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </ToolbarContainer>
        
        {/* Editor Content */}
        <Box sx={{ position: 'relative', flex: 1 }}>
          {/* Block Insertion Controls */}
          <BlockInsertionControls
            className={insertionControls.visible ? 'visible' : ''}
            style={{
              left: insertionControls.x,
              top: insertionControls.y,
              transform: `translate(-50%, ${insertionControls.direction === 'above' ? '-100%' : '0'})`,
            }}
          >
            <Tooltip title="Insert above (Alt+↑)">
              <InsertionButton
                size="small"
                onClick={() => handleOpenInsertionMenu('above')}
              >
                <VerticalAlignTopIcon fontSize="small" />
              </InsertionButton>
            </Tooltip>
            
            <Tooltip title="Insert below (Alt+↓)">
              <InsertionButton
                size="small"
                onClick={() => handleOpenInsertionMenu('below')}
              >
                <VerticalAlignBottomIcon fontSize="small" />
              </InsertionButton>
            </Tooltip>
            
            {selectedPaths.length === 2 && (
              <Tooltip title="Insert between selected blocks (Alt+Space)">
                <InsertionButton
                  size="small"
                  onClick={() => {
                    insertionMenuPositionRef.current = { direction: 'between' };
                    setInsertionMenuOpen(true);
                  }}
                  sx={{ color: '#1976d2' }}
                >
                  <VerticalAlignCenterIcon fontSize="small" />
                </InsertionButton>
              </Tooltip>
            )}
          </BlockInsertionControls>
          
          <Slate
            editor={editor}
            initialValue={initialValue}
            onChange={handleContentChange}
          >
            {/* Floating Toolbar */}
            <FloatingToolbar
              visible={floatingToolbar.visible}
              style={{
                top: floatingToolbar.top,
                left: floatingToolbar.left,
                transform: `translate(-50%, -100%)`,
              }}
            >
              <ToolbarButton
                active={isMarkActive(editor, 'bold')}
                onClick={() => toggleMark(editor, 'bold')}
                size="small"
              >
                <FormatBoldIcon fontSize="small" />
              </ToolbarButton>
              
              <ToolbarButton
                active={isMarkActive(editor, 'italic')}
                onClick={() => toggleMark(editor, 'italic')}
                size="small"
              >
                <FormatItalicIcon fontSize="small" />
              </ToolbarButton>
              
              <ToolbarButton
                active={isMarkActive(editor, 'underline')}
                onClick={() => toggleMark(editor, 'underline')}
                size="small"
              >
                <FormatUnderlinedIcon fontSize="small" />
              </ToolbarButton>
              
              <DividerVertical />
              
              <ToolbarButton
                onClick={() => editor.insertLink()}
                size="small"
              >
                <LinkIcon fontSize="small" />
              </ToolbarButton>
              
              <ToolbarButton
                onClick={() => setImageDialogOpen(true)}
                size="small"
              >
                <ImageIcon fontSize="small" />
              </ToolbarButton>
            </FloatingToolbar>
            
            <StyledEditable
              renderElement={(props) => <Element {...props} editor={editor} />}
              renderLeaf={(props) => <Leaf {...props} />}
              onKeyDown={handleKeyDown}
              placeholder="Start writing your note here... (Ctrl/Cmd+Click to select multiple blocks)"
              spellCheck
              autoFocus
              style={{ padding: '24px' }}
            />
          </Slate>
        </Box>
        
        {/* Status Bar */}
        <StatusBar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <UpdateIcon sx={{ fontSize: 14 }} />
              <span>Auto-save: {editorState.lastSaved ? 'On' : 'Off'}</span>
            </Box>
            {isDirty && !editorState.isSaving && (
              <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 500 }}>
                ● Unsaved changes
              </Typography>
            )}
            {selectedPaths.length > 0 && (
              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 500 }}>
                ● {selectedPaths.length} block(s) selected
              </Typography>
            )}
          </Box>
          
          <SaveButton
            size="small"
            variant="contained"
            startIcon={editorState.isSaving ? 
              <CircularProgress size={14} sx={{ color: '#ffffff' }} /> : 
              <SaveIcon sx={{ fontSize: 14 }} />
            }
            onClick={handleSave}
            disabled={!isDirty || editorState.isSaving}
            saving={editorState.isSaving}
          >
            {editorState.isSaving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </StatusBar>
      </EditorContainer>
      
      {/* Block Insertion Dialog */}
      <Dialog
        open={insertionMenuOpen}
        onClose={() => setInsertionMenuOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            maxHeight: '80vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontSize: '16px', fontWeight: 600 }}>
          Insert Block
        </DialogTitle>
        <DialogContent>
          <BlockInsertionMenu
            editor={editor}
            onClose={() => setInsertionMenuOpen(false)}
            onInsert={(blockType) => {
              if (insertionMenuPositionRef.current.direction === 'between') {
                insertBetweenSelectedBlocks(blockType);
              } else {
                handleInsertBlock(blockType);
              }
              setInsertionMenuOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Image Insert Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={() => setImageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '8px' }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontSize: '18px', fontWeight: 600 }}>
          Insert Image
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              helperText="Supported formats: .jpg, .png, .gif, .svg, .webp"
              size="small"
            />
            <TextField
              fullWidth
              label="Alt Text (optional)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Description of the image"
              helperText="For accessibility and SEO"
              size="small"
            />
            {imageUrl && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setImageDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleInsertImage} 
            variant="contained"
            startIcon={<ImageIcon />}
            disabled={!imageUrl.trim()}
            sx={{ textTransform: 'none' }}
          >
            Insert Image
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* More Actions Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            p: 1,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
          }}
        >
          {/* Quote */}
          <IconButton
            onClick={() => {
              setMoreMenuAnchor(null);
              toggleBlock(editor, 'blockquote');
            }}
            sx={iconButtonSx}
          >
            <FormatQuoteIcon fontSize="small" />
          </IconButton>

          {/* Code Block */}
          <IconButton
            onClick={() => {
              setMoreMenuAnchor(null);
              toggleBlock(editor, 'code-block');
            }}
            sx={iconButtonSx}
          >
            <CodeIcon fontSize="small" />
          </IconButton>

          {/* Highlight */}
          <IconButton
            onClick={() => {
              setMoreMenuAnchor(null);
              toggleMark(editor, 'highlight');
            }}
            sx={iconButtonSx}
          >
            <FormatColorTextIcon fontSize="small" />
          </IconButton>

          {/* Image */}
          <IconButton
            onClick={() => {
              setMoreMenuAnchor(null);
              setImageDialogOpen(true);
            }}
            sx={iconButtonSx}
          >
            <ImageIcon fontSize="small" />
          </IconButton>

          {/* Link */}
          <IconButton
            onClick={() => {
              setMoreMenuAnchor(null);
              editor.insertLink();
            }}
            sx={iconButtonSx}
          >
            <LinkIcon fontSize="small" />
          </IconButton>

          {/* Table */}
          <IconButton
            onClick={() => {
              setMoreMenuAnchor(null);
              editor.insertTable();
            }}
            sx={iconButtonSx}
          >
            <InsertDriveFileIcon fontSize="small" />
          </IconButton>
        </Box>
      </Menu>
    </>
  );
};

export default MeetingNoteEditor;