// src/utils/dummyData.js
import { v4 as uuidv4 } from 'uuid';

// Mock User and Company Info
export const mockUserInfo = {
  userID: 'user_123',
  userName: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1'
};

export const mockCurrentCompany = {
  companyID: 'company_123',
  companyName: 'Acme Corp',
  logo: 'https://via.placeholder.com/50'
};

// Mock Note Structure
export const createMockNote = (overrides = {}) => {
  const noteId = overrides.noteId || `note_${uuidv4()}`;
  const now = new Date().toISOString();
  
  return {
    noteId,
    userId: mockUserInfo.userID,
    title: overrides.title || 'Untitled Note',
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
    blocks: overrides.blocks || [
      {
        id: `block_${uuidv4()}`,
        type: 'heading',
        content: 'Welcome to Your Note',
        data: { level: 1 },
        createdAt: now,
        updatedAt: now
      },
      {
        id: `block_${uuidv4()}`,
        type: 'paragraph',
        content: 'This is your first note. Start writing here...',
        data: {},
        createdAt: now,
        updatedAt: now
      }
    ],
    metadata: {
      tags: overrides.tags || ['general'],
      category: overrides.category || 'personal',
      color: overrides.color || '#4CAF50',
      version: '2.0'
    }
  };
};

// Comprehensive Mock Notes List
export const mockNotesList = [
  createMockNote({
    noteId: 'note_1',
    title: 'Weekly Team Meeting - Q1 Planning',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    tags: ['planning', 'team', 'quarterly'],
    category: 'meeting',
    color: '#4CAF50',
    blocks: [
      {
        id: 'block_1',
        type: 'heading',
        content: 'Weekly Team Meeting',
        data: { level: 1, align: 'center' },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'block_2',
        type: 'paragraph',
        content: 'Meeting held on Monday to discuss Q1 goals and project timelines.',
        data: { align: 'left', fontSize: '16px' },
        createdAt: '2024-01-15T10:31:00Z',
        updatedAt: '2024-01-15T10:31:00Z'
      },
      {
        id: 'block_3',
        type: 'heading',
        content: 'Agenda',
        data: { level: 2 },
        createdAt: '2024-01-15T10:32:00Z',
        updatedAt: '2024-01-15T10:32:00Z'
      },
      {
        id: 'block_4',
        type: 'list',
        content: '',
        data: {
          style: 'bullet',
          items: [
            { id: 'item_1', text: 'Review Q4 performance', indent: 0 },
            { id: 'item_2', text: 'Discuss new feature roadmap', indent: 0 },
            { id: 'item_3', text: 'Budget allocation', indent: 0 }
          ]
        },
        createdAt: '2024-01-15T10:35:00Z',
        updatedAt: '2024-01-15T10:35:00Z'
      }
    ]
  }),
  createMockNote({
    noteId: 'note_2',
    title: 'Project Retrospective - Sprint 42',
    created_at: '2024-01-18T16:00:00Z',
    updated_at: '2024-01-19T11:20:00Z',
    tags: ['retro', 'sprint', 'improvements'],
    category: 'retrospective',
    color: '#FF9800',
    blocks: [
      {
        id: 'block_1',
        type: 'heading',
        content: 'Sprint 42 Retrospective',
        data: { level: 1 },
        createdAt: '2024-01-18T16:00:00Z',
        updatedAt: '2024-01-18T16:00:00Z'
      },
      {
        id: 'block_2',
        type: 'checklist',
        content: '',
        data: {
          items: [
            { id: 'item_1', text: 'Complete user authentication', checked: true },
            { id: 'item_2', text: 'Fix dashboard bugs', checked: true },
            { id: 'item_3', text: 'Optimize database queries', checked: false }
          ]
        },
        createdAt: '2024-01-18T16:05:00Z',
        updatedAt: '2024-01-18T16:05:00Z'
      }
    ]
  }),
  createMockNote({
    noteId: 'note_3',
    title: 'Client Requirements Brainstorm',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T09:00:00Z',
    tags: ['client', 'requirements', 'brainstorm'],
    category: 'client',
    color: '#2196F3',
    blocks: [
      {
        id: 'block_1',
        type: 'heading',
        content: 'Client Requirements',
        data: { level: 1 },
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-14T09:00:00Z'
      },
      {
        id: 'block_2',
        type: 'table',
        content: '',
        data: {
          rows: [
            ['Feature', 'Priority', 'Estimate'],
            ['User Dashboard', 'High', '2 weeks'],
            ['Reporting System', 'Medium', '3 weeks'],
            ['Mobile App', 'Low', '4 weeks']
          ],
          columns: ['Feature', 'Priority', 'Estimate'],
          headers: true
        },
        createdAt: '2024-01-14T09:10:00Z',
        updatedAt: '2024-01-14T09:10:00Z'
      }
    ]
  }),
  createMockNote({
    noteId: 'note_4',
    title: 'Personal Goals 2024',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T15:30:00Z',
    tags: ['personal', 'goals', 'yearly'],
    category: 'personal',
    color: '#9C27B0',
    blocks: [
      {
        id: 'block_1',
        type: 'heading',
        content: '2024 Personal Goals',
        data: { level: 1 },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'block_2',
        type: 'list',
        content: '',
        data: {
          style: 'ordered',
          items: [
            { id: 'item_1', text: 'Learn React Native' },
            { id: 'item_2', text: 'Contribute to open source' },
            { id: 'item_3', text: 'Improve fitness routine' }
          ]
        },
        createdAt: '2024-01-01T00:05:00Z',
        updatedAt: '2024-01-01T00:05:00Z'
      }
    ]
  }),
  createMockNote({
    noteId: 'note_5',
    title: 'Code Review Notes',
    created_at: '2024-01-22T14:00:00Z',
    updated_at: '2024-01-22T16:30:00Z',
    tags: ['code', 'review', 'technical'],
    category: 'technical',
    color: '#795548',
    blocks: [
      {
        id: 'block_1',
        type: 'heading',
        content: 'Code Review - Auth Module',
        data: { level: 1 },
        createdAt: '2024-01-22T14:00:00Z',
        updatedAt: '2024-01-22T14:00:00Z'
      },
      {
        id: 'block_2',
        type: 'code',
        content: `function authenticateUser(credentials) {
  const { email, password } = credentials;
  
  // Find user in database
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return { user, token };
}`,
        data: {
          language: 'javascript',
          lineNumbers: true,
          theme: 'dark'
        },
        createdAt: '2024-01-22T14:10:00Z',
        updatedAt: '2024-01-22T14:10:00Z'
      }
    ]
  })
];

// Mock Backend Service
export class MockBackendService {
  constructor() {
    this.notes = [...mockNotesList];
    this.currentNote = mockNotesList[0];
    this.delay = 200; // Simulate network delay
  }

  // Simulate network delay
  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  // Get all notes (metadata only)
  async getNotesList() {
    await this.simulateDelay();
    return this.notes.map(note => ({
      noteId: note.noteId,
      userId: note.userId,
      title: note.title,
      created_at: note.created_at,
      updated_at: note.updated_at,
      wordCount: this.calculateWordCount(note.blocks),
      blockCount: note.blocks.length,
      tags: note.metadata.tags,
      category: note.metadata.category,
      color: note.metadata.color
    }));
  }

  // Get full note with blocks
  async getNoteById(noteId) {
    await this.simulateDelay();
    const note = this.notes.find(n => n.noteId === noteId);
    if (!note) {
      throw new Error(`Note ${noteId} not found`);
    }
    return note;
  }

  // Create new note
  async createNote(noteData) {
    await this.simulateDelay();
    const newNote = createMockNote({
      ...noteData,
      noteId: `note_${uuidv4()}`
    });
    this.notes.unshift(newNote); // Add to beginning
    this.currentNote = newNote;
    return newNote;
  }

  // Update note
  async updateNote(noteId, updates) {
    await this.simulateDelay();
    const index = this.notes.findIndex(n => n.noteId === noteId);
    if (index === -1) {
      throw new Error(`Note ${noteId} not found`);
    }
    
    const updatedNote = {
      ...this.notes[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    this.notes[index] = updatedNote;
    
    if (this.currentNote.noteId === noteId) {
      this.currentNote = updatedNote;
    }
    
    return updatedNote;
  }

  // Update note title
  async updateNoteTitle(noteId, title) {
    return this.updateNote(noteId, { title });
  }

  // Update blocks
  async updateBlocks(noteId, blocks) {
    return this.updateNote(noteId, { blocks });
  }

  // Add block to note
  async addBlock(noteId, block) {
    const note = await this.getNoteById(noteId);
    const updatedBlocks = [...note.blocks, {
      ...block,
      id: block.id || `block_${uuidv4()}`,
      createdAt: block.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
    
    return this.updateNote(noteId, { 
      blocks: updatedBlocks,
      updated_at: new Date().toISOString()
    });
  }

  // Update block
  async updateBlock(noteId, blockId, updates) {
    const note = await this.getNoteById(noteId);
    const blockIndex = note.blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex === -1) {
      throw new Error(`Block ${blockId} not found`);
    }
    
    const updatedBlocks = [...note.blocks];
    updatedBlocks[blockIndex] = {
      ...updatedBlocks[blockIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.updateNote(noteId, { 
      blocks: updatedBlocks,
      updated_at: new Date().toISOString()
    });
  }

  // Delete block
  async deleteBlock(noteId, blockId) {
    const note = await this.getNoteById(noteId);
    const updatedBlocks = note.blocks.filter(b => b.id !== blockId);
    
    return this.updateNote(noteId, { 
      blocks: updatedBlocks,
      updated_at: new Date().toISOString()
    });
  }

  // Reorder blocks
  async reorderBlocks(noteId, startIndex, endIndex) {
    const note = await this.getNoteById(noteId);
    const result = [...note.blocks];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    return this.updateNote(noteId, { 
      blocks: result,
      updated_at: new Date().toISOString()
    });
  }

  // Delete note
  async deleteNote(noteId) {
    await this.simulateDelay();
    const index = this.notes.findIndex(n => n.noteId === noteId);
    if (index === -1) {
      throw new Error(`Note ${noteId} not found`);
    }
    
    this.notes.splice(index, 1);
    
    if (this.currentNote.noteId === noteId) {
      this.currentNote = this.notes[0] || null;
    }
    
    return true;
  }

  // Search notes
  async searchNotes(query) {
    await this.simulateDelay();
    return this.notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      note.blocks.some(block => 
        block.content.toLowerCase().includes(query.toLowerCase())
      )
    );
  }

  // Get note statistics
  async getNoteStats(noteId) {
    const note = await this.getNoteById(noteId);
    return {
      noteId: note.noteId,
      title: note.title,
      wordCount: this.calculateWordCount(note.blocks),
      blockCount: note.blocks.length,
      created: note.created_at,
      updated: note.updated_at,
      blockTypes: this.getBlockTypes(note.blocks)
    };
  }

  // Helper methods
  calculateWordCount(blocks) {
    return blocks.reduce((count, block) => {
      if (typeof block.content === 'string') {
        return count + block.content.split(/\s+/).filter(word => word.length > 0).length;
      } else if (block.type === 'list' && block.data?.items) {
        return count + block.data.items.reduce((listCount, item) => {
          return listCount + (item.text || '').split(/\s+/).filter(word => word.length > 0).length;
        }, 0);
      } else if (block.type === 'table' && block.data?.rows) {
        return count + block.data.rows.reduce((tableCount, row) => {
          return tableCount + (row || []).reduce((rowCount, cell) => {
            return rowCount + (cell || '').split(/\s+/).filter(word => word.length > 0).length;
          }, 0);
        }, 0);
      }
      return count;
    }, 0);
  }

  getBlockTypes(blocks) {
    const types = {};
    blocks.forEach(block => {
      types[block.type] = (types[block.type] || 0) + 1;
    });
    return types;
  }

  // Export note
  async exportNote(noteId, format = 'html') {
    const note = await this.getNoteById(noteId);
    
    switch(format) {
      case 'html':
        return this.exportAsHTML(note);
      case 'markdown':
        return this.exportAsMarkdown(note);
      case 'json':
        return JSON.stringify(note, null, 2);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  exportAsHTML(note) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${note.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #333; }
        .note-meta { color: #666; font-size: 0.9em; margin-bottom: 30px; }
        .block { margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${note.title}</h1>
    <div class="note-meta">
        Created: ${note.created_at}<br>
        Last Updated: ${note.updated_at}
    </div>
    <div class="note-content">`;
    
    note.blocks.forEach(block => {
      html += this.convertBlockToHTML(block);
    });
    
    html += `</div></body></html>`;
    return html;
  }

  exportAsMarkdown(note) {
    let markdown = `# ${note.title}\n\n`;
    markdown += `*Created: ${note.created_at}*\n`;
    markdown += `*Last Updated: ${note.updated_at}*\n\n`;
    markdown += `---\n\n`;
    
    note.blocks.forEach(block => {
      markdown += this.convertBlockToMarkdown(block) + '\n\n';
    });
    
    return markdown;
  }

  convertBlockToHTML(block) {
    switch(block.type) {
      case 'heading':
        const level = block.data?.level || 2;
        return `<h${level}>${block.content}</h${level}>`;
      case 'paragraph':
        return `<p>${block.content}</p>`;
      case 'list':
        const listType = block.data?.style === 'ordered' ? 'ol' : 'ul';
        let items = '';
        (block.data?.items || []).forEach(item => {
          items += `<li>${item.text || ''}</li>`;
        });
        return `<${listType}>${items}</${listType}>`;
      case 'code':
        return `<pre><code>${block.content}</code></pre>`;
      case 'quote':
        return `<blockquote>${block.content}</blockquote>`;
      default:
        return `<div class="${block.type}">${block.content}</div>`;
    }
  }

  convertBlockToMarkdown(block) {
    switch(block.type) {
      case 'heading':
        const level = block.data?.level || 2;
        return `${'#'.repeat(level)} ${block.content}`;
      case 'paragraph':
        return block.content;
      case 'list':
        let markdown = '';
        (block.data?.items || []).forEach((item, index) => {
          const prefix = block.data?.style === 'ordered' ? `${index + 1}.` : '-';
          markdown += `${prefix} ${item.text || ''}\n`;
        });
        return markdown.trim();
      case 'code':
        return `\`\`\`\n${block.content}\n\`\`\``;
      case 'quote':
        return `> ${block.content}`;
      default:
        return block.content;
    }
  }
}

// Mock S3 Utils for local development
export const mockS3Utils = {
  async uploadJsonToS3(path, data) {
    console.log(`[Mock S3] Uploading to ${path}:`, data);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, path, timestamp: new Date().toISOString() };
  },

  async listS3Objects(prefix) {
    console.log(`[Mock S3] Listing objects with prefix: ${prefix}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockNotesList.map(note => 
      `accounts/${mockCurrentCompany.companyName}_${mockCurrentCompany.companyID}/meeting_notes/${mockUserInfo.userID}/${note.noteId}/note_config.json`
    );
  },

  async downloadJsonFromS3(path) {
    console.log(`[Mock S3] Downloading from: ${path}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    const noteId = path.split('/').slice(-2)[0];
    return mockNotesList.find(note => note.noteId === noteId);
  }
};

// Initialize mock backend
export const mockBackend = new MockBackendService();

// Export for easy access
export default {
  mockUserInfo,
  mockCurrentCompany,
  mockNotesList,
  mockBackend,
  mockS3Utils
};