// src/utils/meetingNotesUtils.js
import { v4 as uuidv4 } from "uuid";

// Block type constants
export const BLOCK_TYPES = {
  PARAGRAPH: "paragraph",
  HEADING: "heading",
  LIST: "list",
  CHECKLIST: "checklist",
  CODE: "code",
  QUOTE: "quote",
  IMAGE: "image",
  TABLE: "table",
  DIVIDER: "divider",
  CALLOUT: "callout",
  LINK: "link",
  MENTION: "mention",
  DATETIME: "datetime",
  MATH: "math",
  EMBED: "embed",
  ATTACHMENT: "attachment"
};

// List style constants
export const LIST_TYPES = {
  BULLET: "bullet",
  ORDERED: "ordered",
  CHECKLIST: "checklist"
};

// Heading level constants
export const HEADING_LEVELS = {
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6
};

// Callout type constants
export const CALLOUT_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error"
};

// Default block styles
export const DEFAULT_BLOCK_STYLES = {
  paragraph: {
    align: "left",
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#333333"
  },
  heading: {
    align: "left",
    color: "#2C3E50"
  },
  list: {
    spacing: "normal"
  }
};

// Create a paragraph block
export const createParagraph = (content = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.PARAGRAPH,
    content,
    data: {
      ...DEFAULT_BLOCK_STYLES.paragraph,
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a heading block
export const createHeading = (content = "", level = HEADING_LEVELS.H2, options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.HEADING,
    content,
    data: {
      level,
      ...DEFAULT_BLOCK_STYLES.heading,
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a list block
export const createList = (items = [], style = LIST_TYPES.BULLET, options = {}) => {
  const formattedItems = items.map(item => ({
    id: item.id || `item_${uuidv4()}`,
    text: item.text || "",
    checked: item.checked || false,
    indent: item.indent || 0,
    ...item
  }));

  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.LIST,
    content: "", // Content is stored in data.items
    data: {
      style,
      items: formattedItems,
      ...DEFAULT_BLOCK_STYLES.list,
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a checklist block
export const createChecklist = (items = [], options = {}) => {
  return createList(items, LIST_TYPES.CHECKLIST, options);
};

// Create a code block
export const createCode = (code = "", language = "javascript", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.CODE,
    content: code,
    data: {
      language,
      lineNumbers: options.lineNumbers || true,
      theme: options.theme || "dark",
      filename: options.filename || "",
      showCopyButton: options.showCopyButton || true,
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a quote block
export const createQuote = (content = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.QUOTE,
    content,
    data: {
      author: options.author || "",
      cite: options.cite || "",
      align: options.align || "left",
      borderLeft: options.borderLeft !== undefined ? options.borderLeft : true,
      backgroundColor: options.backgroundColor || "#f9f9f9",
      fontSize: options.fontSize || "18px",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create an image block
export const createImage = (url = "", caption = "", alt = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.IMAGE,
    content: url,
    data: {
      caption,
      alt,
      width: options.width || "100%",
      height: options.height || "auto",
      align: options.align || "center",
      border: options.border !== undefined ? options.border : true,
      shadow: options.shadow || false,
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a table block
export const createTable = (rows = [], columns = [], options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.TABLE,
    content: "", // Content is stored in data.rows
    data: {
      rows,
      columns,
      headers: options.headers !== undefined ? options.headers : true,
      border: options.border !== undefined ? options.border : true,
      striped: options.striped || true,
      alignment: options.alignment || [],
      width: options.width || "100%",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a divider block
export const createDivider = (options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.DIVIDER,
    content: "",
    data: {
      style: options.style || "solid",
      width: options.width || "90%",
      thickness: options.thickness || "2px",
      color: options.color || "#E0E0E0",
      align: options.align || "center",
      label: options.label || "",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a callout/alert block
export const createCallout = (content = "", type = CALLOUT_TYPES.INFO, options = {}) => {
  const icons = {
    [CALLOUT_TYPES.INFO]: "ℹ️",
    [CALLOUT_TYPES.SUCCESS]: "✅",
    [CALLOUT_TYPES.WARNING]: "⚠️",
    [CALLOUT_TYPES.ERROR]: "❌"
  };

  const defaultStyles = {
    [CALLOUT_TYPES.INFO]: {
      backgroundColor: "#E3F2FD",
      borderColor: "#2196F3",
      textColor: "#0D47A1"
    },
    [CALLOUT_TYPES.SUCCESS]: {
      backgroundColor: "#E8F5E9",
      borderColor: "#4CAF50",
      textColor: "#1B5E20"
    },
    [CALLOUT_TYPES.WARNING]: {
      backgroundColor: "#FFF3E0",
      borderColor: "#FF9800",
      textColor: "#E65100"
    },
    [CALLOUT_TYPES.ERROR]: {
      backgroundColor: "#FFEBEE",
      borderColor: "#F44336",
      textColor: "#B71C1C"
    }
  };

  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.CALLOUT,
    content,
    data: {
      type,
      icon: options.icon || icons[type],
      dismissible: options.dismissible || false,
      ...defaultStyles[type],
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a link/bookmark block
export const createLink = (title = "", url = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.LINK,
    content: title,
    data: {
      url,
      title: options.title || title,
      description: options.description || "",
      favicon: options.favicon || "",
      previewImage: options.previewImage || "",
      openInNewTab: options.openInNewTab !== undefined ? options.openInNewTab : true,
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a mention/person block
export const createMention = (username = "", userId = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.MENTION,
    content: username,
    data: {
      userId,
      userName: options.userName || username,
      userRole: options.userRole || "",
      userAvatar: options.userAvatar || "",
      email: options.email || "",
      department: options.department || "",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a date/time block
export const createDateTime = (dateTime = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.DATETIME,
    content: dateTime,
    data: {
      format: options.format || "MMMM D, YYYY h:mm A",
      timezone: options.timezone || "UTC",
      showDate: options.showDate !== undefined ? options.showDate : true,
      showTime: options.showTime !== undefined ? options.showTime : true,
      showTimezone: options.showTimezone || false,
      isAllDay: options.isAllDay || false,
      reminder: options.reminder || false,
      reminderTime: options.reminderTime || "30 minutes",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a math/equation block
export const createMath = (equation = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.MATH,
    content: equation,
    data: {
      format: options.format || "latex",
      displayMode: options.displayMode !== undefined ? options.displayMode : true,
      numbered: options.numbered || false,
      align: options.align || "center",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create an embed block
export const createEmbed = (title = "", url = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.EMBED,
    content: title,
    data: {
      url,
      service: options.service || "custom",
      embedCode: options.embedCode || "",
      width: options.width || 560,
      height: options.height || 315,
      autoplay: options.autoplay || false,
      caption: options.caption || "",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create an attachment block
export const createAttachment = (filename = "", fileUrl = "", options = {}) => {
  return {
    id: `block_${uuidv4()}`,
    type: BLOCK_TYPES.ATTACHMENT,
    content: filename,
    data: {
      fileName: filename,
      fileUrl,
      fileSize: options.fileSize || "",
      fileType: options.fileType || "",
      downloadUrl: options.downloadUrl || fileUrl,
      uploadedAt: options.uploadedAt || new Date().toISOString(),
      uploadedBy: options.uploadedBy || "",
      ...options
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Create a default note (empty)
export const createDefaultNote = (userId, title = "Untitled Note") => {
  return {
    noteId: `note_${uuidv4()}`,
    userId,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    blocks: [
      createHeading("Meeting Notes", HEADING_LEVELS.H1),
      createParagraph("Start taking notes here...")
    ],
    metadata: {
      tags: [],
      category: "general",
      version: "2.0"
    }
  };
};

// Create a template note (for common use cases)
export const createTemplateNote = (userId, templateType = "meeting") => {
  const templates = {
    meeting: {
      title: "Meeting Notes",
      blocks: [
        createHeading("Meeting Agenda", HEADING_LEVELS.H1),
        createDivider(),
        createHeading("Attendees", HEADING_LEVELS.H2),
        createList([
          { text: "Attendee 1" },
          { text: "Attendee 2" },
          { text: "Attendee 3" }
        ]),
        createHeading("Agenda Items", HEADING_LEVELS.H2),
        createChecklist([
          { text: "Review previous action items", checked: false },
          { text: "Discuss new topics", checked: false },
          { text: "Assign action items", checked: false }
        ]),
        createHeading("Notes", HEADING_LEVELS.H2),
        createParagraph("Add meeting notes here..."),
        createHeading("Action Items", HEADING_LEVELS.H2),
        createChecklist([
          { text: "Action item 1", checked: false },
          { text: "Action item 2", checked: false }
        ])
      ]
    },
    brainstorming: {
      title: "Brainstorming Session",
      blocks: [
        createHeading("Brainstorming Ideas", HEADING_LEVELS.H1),
        createDivider(),
        createHeading("Problem Statement", HEADING_LEVELS.H2),
        createParagraph("Describe the problem to solve..."),
        createHeading("Ideas", HEADING_LEVELS.H2),
        createList([], LIST_TYPES.BULLET, { style: "bullet" }),
        createHeading("Top 3 Ideas", HEADING_LEVELS.H2),
        createList([
          { text: "Idea 1" },
          { text: "Idea 2" },
          { text: "Idea 3" }
        ], LIST_TYPES.ORDERED),
        createHeading("Next Steps", HEADING_LEVELS.H2),
        createChecklist([])
      ]
    },
    project: {
      title: "Project Plan",
      blocks: [
        createHeading("Project Plan", HEADING_LEVELS.H1),
        createDivider(),
        createHeading("Project Overview", HEADING_LEVELS.H2),
        createParagraph("Project description goes here..."),
        createHeading("Objectives", HEADING_LEVELS.H2),
        createList([
          { text: "Objective 1" },
          { text: "Objective 2" },
          { text: "Objective 3" }
        ]),
        createHeading("Timeline", HEADING_LEVELS.H2),
        createTable(
          [
            ["Phase", "Start Date", "End Date", "Owner"],
            ["Planning", "2024-01-01", "2024-01-15", "Project Manager"],
            ["Development", "2024-01-16", "2024-03-15", "Dev Team"],
            ["Testing", "2024-03-16", "2024-03-31", "QA Team"]
          ],
          ["Phase", "Start Date", "End Date", "Owner"]
        ),
        createHeading("Resources", HEADING_LEVELS.H2),
        createList([]),
        createHeading("Risks & Mitigations", HEADING_LEVELS.H2),
        createCallout("Identify potential risks and mitigation strategies", CALLOUT_TYPES.WARNING)
      ]
    }
  };

  const template = templates[templateType] || templates.meeting;
  
  return {
    noteId: `note_${uuidv4()}`,
    userId,
    title: template.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    blocks: template.blocks,
    metadata: {
      tags: [templateType],
      category: templateType,
      version: "2.0"
    }
  };
};

// Calculate word count for a note
export const calculateNoteWordCount = (blocks = []) => {
  return blocks.reduce((count, block) => {
    if (typeof block.content === 'string') {
      return count + block.content.split(/\s+/).filter(word => word.length > 0).length;
    } else if (block.type === BLOCK_TYPES.LIST || block.type === BLOCK_TYPES.CHECKLIST) {
      // For list blocks
      return count + (block.data.items || []).reduce((listCount, item) => {
        return listCount + (item.text || '').split(/\s+/).filter(word => word.length > 0).length;
      }, 0);
    } else if (block.type === BLOCK_TYPES.TABLE) {
      // For table blocks
      return count + (block.data.rows || []).reduce((tableCount, row) => {
        return tableCount + (row || []).reduce((rowCount, cell) => {
          return rowCount + (cell || '').split(/\s+/).filter(word => word.length > 0).length;
        }, 0);
      }, 0);
    }
    return count;
  }, 0);
};

// Get note metadata (extract metadata from full note)
export const getNoteMetadata = (note) => {
  return {
    noteId: note.noteId,
    userId: note.userId,
    title: note.title,
    created_at: note.created_at,
    updated_at: note.updated_at,
    wordCount: calculateNoteWordCount(note.blocks),
    blockCount: note.blocks?.length || 0,
    tags: note.metadata?.tags || [],
    category: note.metadata?.category || "general",
    color: note.metadata?.color || "#4CAF50"
  };
};

// Find block by ID
export const findBlockById = (blocks = [], blockId) => {
  return blocks.find(block => block.id === blockId);
};

// Filter blocks by type
export const filterBlocksByType = (blocks = [], type) => {
  return blocks.filter(block => block.type === type);
};

// Get all headings for table of contents
export const getHeadingsForTOC = (blocks = []) => {
  return blocks
    .filter(block => block.type === BLOCK_TYPES.HEADING)
    .map(block => ({
      id: block.id,
      level: block.data.level || 2,
      text: block.content,
      position: blocks.indexOf(block)
    }));
};

// Extract text content from blocks (for search indexing)
export const extractTextFromBlocks = (blocks = []) => {
  return blocks.map(block => {
    switch(block.type) {
      case BLOCK_TYPES.HEADING:
      case BLOCK_TYPES.PARAGRAPH:
      case BLOCK_TYPES.QUOTE:
      case BLOCK_TYPES.CODE:
        return block.content || '';
      
      case BLOCK_TYPES.LIST:
      case BLOCK_TYPES.CHECKLIST:
        return (block.data.items || [])
          .map(item => item.text || '')
          .join(' ');
      
      case BLOCK_TYPES.TABLE:
        return (block.data.rows || [])
          .flat()
          .join(' ');
      
      case BLOCK_TYPES.LINK:
        return `${block.content} ${block.data.description || ''}`;
      
      case BLOCK_TYPES.MENTION:
        return `${block.content} ${block.data.userName || ''}`;
      
      default:
        return block.content || '';
    }
  }).join('\n');
};

// Convert blocks to plain text
export const convertBlocksToPlainText = (blocks = []) => {
  return blocks.map(block => {
    const content = extractTextFromBlocks([block]);
    return `${block.type.toUpperCase()}: ${content}`;
  }).join('\n\n');
};

// Validate block structure
export const validateBlock = (block) => {
  if (!block) return { valid: false, error: "Block is null or undefined" };
  
  const requiredFields = ['id', 'type'];
  const missingFields = requiredFields.filter(field => !block[field]);
  
  if (missingFields.length > 0) {
    return { valid: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  if (!Object.values(BLOCK_TYPES).includes(block.type)) {
    return { valid: false, error: `Invalid block type: ${block.type}` };
  }
  
  // Type-specific validations
  switch(block.type) {
    case BLOCK_TYPES.HEADING:
      if (!block.data?.level || !Object.values(HEADING_LEVELS).includes(block.data.level)) {
        return { valid: false, error: "Invalid heading level" };
      }
      break;
    
    case BLOCK_TYPES.LIST:
    case BLOCK_TYPES.CHECKLIST:
      if (!Array.isArray(block.data?.items)) {
        return { valid: false, error: "List items must be an array" };
      }
      break;
    
    case BLOCK_TYPES.TABLE:
      if (!Array.isArray(block.data?.rows)) {
        return { valid: false, error: "Table rows must be an array" };
      }
      break;
    
    case BLOCK_TYPES.IMAGE:
      if (!block.content) {
        return { valid: false, error: "Image URL is required" };
      }
      break;
  }
  
  return { valid: true };
};

// Update block content (helper function)
export const updateBlockContentHelper = (block, newContent) => {
  return {
    ...block,
    content: newContent,
    updatedAt: new Date().toISOString()
  };
};

// Update block data (helper function)
export const updateBlockDataHelper = (block, newData) => {
  return {
    ...block,
    data: {
      ...block.data,
      ...newData
    },
    updatedAt: new Date().toISOString()
  };
};

// Create a deep copy of blocks
export const cloneBlocks = (blocks = []) => {
  return blocks.map(block => ({
    ...block,
    id: `copy_${block.id}_${uuidv4().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

// Sort blocks by creation date
export const sortBlocksByDate = (blocks = [], ascending = true) => {
  return [...blocks].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Search blocks for text
export const searchBlocks = (blocks = [], searchTerm) => {
  if (!searchTerm) return blocks;
  
  const term = searchTerm.toLowerCase();
  return blocks.filter(block => {
    const text = extractTextFromBlocks([block]).toLowerCase();
    return text.includes(term);
  });
};

// Group blocks by type
export const groupBlocksByType = (blocks = []) => {
  return blocks.reduce((groups, block) => {
    const type = block.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(block);
    return groups;
  }, {});
};

// Get statistics about blocks
export const getBlockStatistics = (blocks = []) => {
  const stats = {
    total: blocks.length,
    byType: {},
    wordCount: calculateNoteWordCount(blocks),
    createdRange: { min: null, max: null }
  };
  
  // Count by type
  blocks.forEach(block => {
    stats.byType[block.type] = (stats.byType[block.type] || 0) + 1;
  });
  
  // Find date range
  if (blocks.length > 0) {
    const dates = blocks.map(b => new Date(b.createdAt));
    stats.createdRange.min = new Date(Math.min(...dates)).toISOString();
    stats.createdRange.max = new Date(Math.max(...dates)).toISOString();
  }
  
  return stats;
};

// Generate a unique block ID
export const generateBlockId = () => {
  return `block_${uuidv4()}`;
};

// Generate a unique note ID
export const generateNoteId = () => {
  return `note_${uuidv4()}`;
};

// Check if blocks are empty
export const areBlocksEmpty = (blocks = []) => {
  if (blocks.length === 0) return true;
  
  return blocks.every(block => {
    if (typeof block.content === 'string') {
      return !block.content.trim();
    } else if (block.type === BLOCK_TYPES.LIST || block.type === BLOCK_TYPES.CHECKLIST) {
      return !block.data?.items?.length || 
             block.data.items.every(item => !item.text?.trim());
    } else if (block.type === BLOCK_TYPES.TABLE) {
      return !block.data?.rows?.length || 
             block.data.rows.every(row => row.every(cell => !cell?.trim()));
    }
    return false;
  });
};

// Get first non-empty block
export const getFirstNonEmptyBlock = (blocks = []) => {
  return blocks.find(block => {
    if (typeof block.content === 'string') {
      return block.content.trim();
    }
    return true; // For non-text blocks, consider them non-empty
  });
};