// src/components/MeetingNotes/RichTextEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  DragIndicator,
  Delete,
  ContentCopy,
  ArrowUpward,
  ArrowDownward,
  Image,
  Code,
  FormatListBulleted,
  FormatQuote,
  TableChart,
  Title,
  FormatAlignLeft,
//   SaveIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BLOCK_TYPES, LIST_TYPES, HEADING_LEVELS } from "../utils/meetingNotesUtils"

const RichTextEditor = ({
  sectionId,
  initialContent,
  onSave,
  onBlockUpdate,
  onBlockDelete,
  onBlockReorder,
  onBlockDuplicate,
  onBlockMove,
}) => {
  const [content, setContent] = useState(initialContent || { blocks: [] });
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleBlockChange = useCallback((blockId, updates) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates, modifiedAt: new Date().toISOString() } : block
      ),
    }));
    
    if (onBlockUpdate) {
      onBlockUpdate(blockId, updates);
    }
  }, [onBlockUpdate]);

  const handleAddBlock = useCallback((type) => {
    const newBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    switch (type) {
      case BLOCK_TYPES.LIST:
        newBlock.content = [{ id: `item_${Date.now()}`, text: '', checked: false }];
        newBlock.listType = LIST_TYPES.BULLET;
        break;
      case BLOCK_TYPES.TABLE:
        newBlock.content = { rows: [['', '']], columns: ['Column 1', 'Column 2'] };
        newBlock.headers = true;
        break;
      default:
        newBlock.content = '';
    }

    setContent(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
  }, []);

  const handleDeleteBlock = useCallback((blockId) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId),
    }));
    
    if (onBlockDelete) {
      onBlockDelete(blockId);
    }
  }, [onBlockDelete]);

  const handleDuplicateBlock = useCallback((blockId) => {
    const blockToDuplicate = content.blocks.find(block => block.id === blockId);
    if (blockToDuplicate) {
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };
      
      setContent(prev => ({
        ...prev,
        blocks: [...prev.blocks, duplicatedBlock],
      }));
      
      if (onBlockDuplicate) {
        onBlockDuplicate(blockId);
      }
    }
  }, [content.blocks, onBlockDuplicate]);

  const handleMoveBlock = useCallback((blockId, direction) => {
    const index = content.blocks.findIndex(block => block.id === blockId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.blocks.length) return;

    const newBlocks = [...content.blocks];
    const [block] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, block);

    setContent(prev => ({ ...prev, blocks: newBlocks }));
    
    if (onBlockMove) {
      onBlockMove(blockId, direction);
    }
  }, [content.blocks, onBlockMove]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const newBlocks = [...content.blocks];
    const [removed] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, removed);

    setContent(prev => ({ ...prev, blocks: newBlocks }));
    
    if (onBlockReorder) {
      onBlockReorder(result.source.index, result.destination.index);
    }
  }, [content.blocks, onBlockReorder]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(content);
    }
  }, [content, onSave]);

  const renderBlock = (block, index) => {
    const commonProps = {
      key: block.id,
      block,
      index,
      onUpdate: (updates) => handleBlockChange(block.id, updates),
      onDelete: () => handleDeleteBlock(block.id),
      onDuplicate: () => handleDuplicateBlock(block.id),
      onMoveUp: () => handleMoveBlock(block.id, 'up'),
      onMoveDown: () => handleMoveBlock(block.id, 'down'),
    };

    switch (block.type) {
      case BLOCK_TYPES.PARAGRAPH:
        return <ParagraphBlock {...commonProps} />;
      case BLOCK_TYPES.HEADING:
        return <HeadingBlock {...commonProps} />;
      case BLOCK_TYPES.LIST:
        return <ListBlock {...commonProps} />;
      case BLOCK_TYPES.CODE:
        return <CodeBlock {...commonProps} />;
      case BLOCK_TYPES.TABLE:
        return <TableBlock {...commonProps} />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  return (
    <Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {content.blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        mb: 2,
                        p: 2,
                        position: 'relative',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: 'grab' }}>
                          <DragIndicator />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          {renderBlock(block, index)}
                        </Box>
                        <Box sx={{ ml: 1 }}>
                          <Tooltip title="Move up">
                            <IconButton
                              size="small"
                              onClick={() => handleMoveBlock(block.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpward fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Move down">
                            <IconButton
                              size="small"
                              onClick={() => handleMoveBlock(block.id, 'down')}
                              disabled={index === content.blocks.length - 1}
                            >
                              <ArrowDownward fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicate">
                            <IconButton
                              size="small"
                              onClick={() => handleDuplicateBlock(block.id)}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBlock(block.id)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          startIcon={<FormatAlignLeft />}
          onClick={() => handleAddBlock(BLOCK_TYPES.PARAGRAPH)}
          variant="outlined"
          size="small"
        >
          Paragraph
        </Button>
        <Button
          startIcon={<Title />}
          onClick={() => handleAddBlock(BLOCK_TYPES.HEADING)}
          variant="outlined"
          size="small"
        >
          Heading
        </Button>
        <Button
          startIcon={<FormatListBulleted />}
          onClick={() => handleAddBlock(BLOCK_TYPES.LIST)}
          variant="outlined"
          size="small"
        >
          List
        </Button>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
        //   startIcon={<SaveIcon />}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

// Block Components
const ParagraphBlock = ({ block, onUpdate }) => (
  <TextField
    fullWidth
    multiline
    rows={3}
    value={block.content || ''}
    onChange={(e) => onUpdate({ content: e.target.value })}
    placeholder="Start typing your paragraph..."
    variant="outlined"
    size="small"
  />
);

const HeadingBlock = ({ block, onUpdate }) => (
  <Box>
    <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
      <InputLabel>Level</InputLabel>
      <Select
        value={block.level || 2}
        label="Level"
        onChange={(e) => onUpdate({ level: e.target.value })}
      >
        <MenuItem value={1}>H1</MenuItem>
        <MenuItem value={2}>H2</MenuItem>
        <MenuItem value={3}>H3</MenuItem>
        <MenuItem value={4}>H4</MenuItem>
      </Select>
    </FormControl>
    <TextField
      value={block.content || ''}
      onChange={(e) => onUpdate({ content: e.target.value })}
      placeholder="Heading text..."
      variant="outlined"
      size="small"
      sx={{ flexGrow: 1 }}
    />
  </Box>
);

const ListBlock = ({ block, onUpdate }) => {
  const handleItemChange = (index, text) => {
    const newItems = [...block.content];
    newItems[index].text = text;
    onUpdate({ content: newItems });
  };

  const handleAddItem = () => {
    onUpdate({
      content: [...block.content, { id: `item_${Date.now()}`, text: '', checked: false }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = block.content.filter((_, i) => i !== index);
    onUpdate({ content: newItems });
  };

  return (
    <Box>
      <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
        <InputLabel>List Type</InputLabel>
        <Select
          value={block.listType || LIST_TYPES.BULLET}
          label="List Type"
          onChange={(e) => onUpdate({ listType: e.target.value })}
        >
          <MenuItem value={LIST_TYPES.BULLET}>Bullet</MenuItem>
          <MenuItem value={LIST_TYPES.ORDERED}>Ordered</MenuItem>
          <MenuItem value={LIST_TYPES.CHECK}>Checklist</MenuItem>
        </Select>
      </FormControl>

      {block.content?.map((item, index) => (
        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {block.listType === LIST_TYPES.CHECK && (
            <input
              type="checkbox"
              checked={item.checked || false}
              onChange={(e) => {
                const newItems = [...block.content];
                newItems[index].checked = e.target.checked;
                onUpdate({ content: newItems });
              }}
              style={{ marginRight: 8 }}
            />
          )}
          <TextField
            value={item.text || ''}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder="List item..."
            size="small"
            sx={{ flexGrow: 1 }}
          />
          <IconButton size="small" onClick={() => handleRemoveItem(index)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ))}

      <Button size="small" onClick={handleAddItem}>
        Add Item
      </Button>
    </Box>
  );
};

const CodeBlock = ({ block, onUpdate }) => (
  <Box>
    <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
      <InputLabel>Language</InputLabel>
      <Select
        value={block.language || 'javascript'}
        label="Language"
        onChange={(e) => onUpdate({ language: e.target.value })}
      >
        <MenuItem value="javascript">JavaScript</MenuItem>
        <MenuItem value="python">Python</MenuItem>
        <MenuItem value="sql">SQL</MenuItem>
        <MenuItem value="json">JSON</MenuItem>
      </Select>
    </FormControl>
    <TextField
      fullWidth
      multiline
      rows={6}
      value={block.content || ''}
      onChange={(e) => onUpdate({ content: e.target.value })}
      placeholder="Enter your code here..."
      variant="outlined"
      size="small"
      sx={{ fontFamily: 'monospace' }}
    />
  </Box>
);

const TableBlock = ({ block, onUpdate }) => {
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...block.content.rows];
    newRows[rowIndex][colIndex] = value;
    onUpdate({ content: { ...block.content, rows: newRows } });
  };

  const handleAddRow = () => {
    const newRow = Array(block.content.columns.length).fill('');
    onUpdate({
      content: {
        ...block.content,
        rows: [...block.content.rows, newRow]
      }
    });
  };

  const handleAddColumn = () => {
    const newColumnName = `Column ${block.content.columns.length + 1}`;
    const newRows = block.content.rows.map(row => [...row, '']);
    onUpdate({
      content: {
        ...block.content,
        columns: [...block.content.columns, newColumnName],
        rows: newRows
      }
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        {block.content.columns.map((col, colIndex) => (
          <Chip
            key={colIndex}
            label={col}
            size="small"
            sx={{ mr: 1 }}
          />
        ))}
        <Button size="small" onClick={handleAddColumn}>
          Add Column
        </Button>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {block.content.columns.map((col, colIndex) => (
                <th key={colIndex} style={{ border: '1px solid #ddd', padding: 8 }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.content.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} style={{ border: '1px solid #ddd' }}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        padding: 8,
                        boxSizing: 'border-box'
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Button size="small" onClick={handleAddRow} sx={{ mt: 2 }}>
        Add Row
      </Button>
    </Box>
  );
};

export default RichTextEditor;