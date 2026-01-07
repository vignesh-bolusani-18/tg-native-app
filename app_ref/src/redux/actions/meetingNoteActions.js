// src/redux/actions/meetingNoteAction.js
import { 
  loadNotesList,
  setCurrentNote,
  updateCurrentNoteByPath as updateCurrentNote,
  removeNoteFromList,
  togglePinNoteInList,
  updateNoteInList,
  clearCurrentNote,
  addNoteToList
} from '../slices/meetingNoteSlice';
import { setError } from '../slices/experimentSlice';
import { 
  uploadJsonToS3, 
  fetchJsonFromS3,

} from '../../utils/s3Utils';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get S3 paths for meeting notes
const getMeetingNotePaths = (currentCompany, noteId = null) => {
  const companyPrefix = `${currentCompany.companyName}_${currentCompany.companyID}`;
  const basePath = `accounts/${companyPrefix}/meeting_notes`;
  
  if (noteId) {
    return {
      notesListPath: `${basePath}/notes_list.json`,
      notePath: `${basePath}/notes/${noteId}.json`
    };
  }
  
  return {
    notesListPath: `${basePath}/notes_list.json`,
    notesFolderPath: `${basePath}/notes/`
  };
};

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return '';
  
  // If it's already a timestamp
  if (!isNaN(date)) {
    const dateObj = new Date(date);
    const datePart = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);

    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(dateObj);

    return `${datePart} at ${timePart}`;
  }

  return date;
};

// Helper to create note metadata for notes_list
const createNoteMetadata = (noteId, noteInfo , userInfo) => {
  const now = Date.now();
  return {
    id: noteId,
    title: noteInfo.title || 'Untitled Note',
    createdAt: now,
    updatedAt: now,
    tags: noteInfo.tags || [],
    isPinned: noteInfo.isPinned || false,
    isArchived: noteInfo.isArchived || false,
    createdBy:userInfo?.userName,
    preview: noteInfo.preview || '',
    lastViewedAt: null
  };
};

// Load all meeting notes (metadata only) from notes_list.json
export const loadMeetingNotes = (currentCompany) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany);
    
    // Try to load the notes list
    let notesList = [];
    
    try {
      const notesListData = await fetchJsonFromS3(paths.notesListPath);
      
      // Handle different possible structures
      if (notesListData && notesListData.notes && Array.isArray(notesListData.notes)) {
        notesList = notesListData.notes;
      } else if (notesListData && Array.isArray(notesListData)) {
        // If file contains just an array, wrap it
        notesList = notesListData;
        // Also fix the file structure for future
        await uploadJsonToS3(paths.notesListPath, { notes: notesList });
      } else if (notesListData && typeof notesListData === 'object') {
        // Try to extract notes from any object structure
        const allValues = Object.values(notesListData);
        const arrayValues = allValues.filter(val => Array.isArray(val));
        if (arrayValues.length > 0) {
          notesList = arrayValues[0];
        }
      }
    } catch (error) {
      console.log('No existing notes list found, creating fresh');
      // Create initial notes list file
      await uploadJsonToS3(paths.notesListPath, { notes: [] });
    }
    
    // Format dates for display
    const formattedNotes = notesList.map(note => ({
      ...note,
      createdAt: formatDate(note.createdAt),
      updatedAt: formatDate(note.updatedAt),
      lastViewedAt: note.lastViewedAt ? formatDate(note.lastViewedAt) : null
    }));
    
    // Sort by updated date (most recent first)
    const sortedNotes = formattedNotes.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
    
    dispatch(loadNotesList(sortedNotes));
    return { success: true, notes: sortedNotes };
  } catch (error) {
    console.error('Error loading meeting notes:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};
// Create a new meeting note
export const createMeetingNote = (userInfo, currentCompany, noteInfo) => async (dispatch) => {
  try {
    const noteId = uuidv4();
    const paths = getMeetingNotePaths(currentCompany, noteId);
    const now = Date.now();
    
    // Prepare full note data
    const noteData = {
      id: noteId,
      title: noteInfo.title || 'Untitled Note',
      blocks: noteInfo.content || [{ type: 'paragraph', children: [{ text: '' }] }],
      createdAt: now,
      updatedAt: now,
     
      createdBy:userInfo?.userName,
      tags: noteInfo.tags || [],
      isPinned: noteInfo.isPinned || false,
      isArchived: noteInfo.isArchived || false,
      lastViewedAt: null,
      metadata: {
        company: currentCompany.companyName,
        companyId: currentCompany.companyID,
        createdBy: userInfo.name || userInfo.email,
        userId: userInfo.userID,
        category: noteInfo.metadata?.category || 'general',
        context: noteInfo.metadata?.context || '',
        experimentId: noteInfo.metadata?.experimentId,
        tabName: noteInfo.metadata?.tabName,
        ...noteInfo.metadata
      }
    };
    
    // 1. Upload individual note file
    await uploadJsonToS3(paths.notePath, noteData);
    
    // 2. Update notes_list.json - FIXED VERSION
    let notesListData = { notes: [] };
    
    try {
      const fetchedData = await fetchJsonFromS3(paths.notesListPath);
      // Ensure we have a valid object with notes array
      if (fetchedData && fetchedData.notes && Array.isArray(fetchedData.notes)) {
        notesListData = fetchedData;
      } else if (fetchedData && Array.isArray(fetchedData)) {
        // Handle case where file contains just an array
        notesListData = { notes: fetchedData };
      } else {
        console.log('Creating new notes list with default structure');
        notesListData = { notes: [] };
      }
    } catch (error) {
      console.log('Creating new notes list file');
      // Create initial notes list file with proper structure
      notesListData = { notes: [] };
    }
    
    // Create metadata for notes_list
    const noteMetadata = createNoteMetadata(noteId, noteInfo , userInfo);
    notesListData.notes.push(noteMetadata);
    
    // Upload updated notes_list
    await uploadJsonToS3(paths.notesListPath, notesListData);
    
    // Format dates for Redux
    const formattedNote = {
      ...noteData,
      createdAt: formatDate(noteData.createdAt),
      updatedAt: formatDate(noteData.updatedAt)
    };
    
    // Dispatch actions
    dispatch(setCurrentNote(formattedNote));
    dispatch(addNoteToList(noteMetadata));
    
    return { 
      success: true, 
      noteId,
      note: formattedNote,
      message: 'Note created successfully'
    };
  } catch (error) {
    console.error('Error creating meeting note:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Load a specific meeting note by ID
export const loadMeetingNoteById = (currentCompany, noteId) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany, noteId);
    
    // Load individual note file
    const noteData = await fetchJsonFromS3(paths.notePath);
    console.log(noteData)
    if (!noteData) {
      throw new Error('Note not found');
    }
    
    // Update last viewed timestamp in both files
    const now = Date.now();
    const updatedNoteData = {
      ...noteData,
      lastViewedAt: now
    };
    
    // Update individual note file
    await uploadJsonToS3(paths.notePath, updatedNoteData);
    
    // Update notes_list.json
    let notesListData = { notes: [] };
    
    try {
      notesListData = await fetchJsonFromS3(paths.notesListPath);
    } catch (error) {
      console.log('No existing notes list found');
    }
    
    // Update metadata in notes_list
    const noteIndex = notesListData.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      notesListData.notes[noteIndex] = {
        ...notesListData.notes[noteIndex],
        lastViewedAt: now
      };
      await uploadJsonToS3(paths.notesListPath, notesListData);
    }
    
    // Format dates for display
    const formattedNote = {
      ...updatedNoteData,
      createdAt: formatDate(updatedNoteData.createdAt),
      updatedAt: formatDate(updatedNoteData.updatedAt),
      lastViewedAt: formatDate(updatedNoteData.lastViewedAt)
    };


    console.log(formattedNote)
    
    dispatch(setCurrentNote(formattedNote));
    return { success: true, note: formattedNote };
  } catch (error) {
    console.error('Error loading meeting note:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Update an existing meeting note
export const updateMeetingNote = (currentCompany, noteId, updates) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany, noteId);
    const now = Date.now();
    
    // 1. Load existing note
    const existingNote = await fetchJsonFromS3(paths.notePath);

    console.log(existingNote);
    
    if (!existingNote) {
      throw new Error('Note not found');
    }

    
    // 2. Prepare updated note data
    const updatedNoteData = {
      ...existingNote,
      ...updates,
      updatedAt: now,
      id: noteId // Ensure ID is preserved
    };

    console.log(updatedNoteData);
    
    // 3. Upload updated individual note
    await uploadJsonToS3(paths.notePath, updatedNoteData);
    
    // 4. Update notes_list.json metadata
    let notesListData = { notes: [] };
    
    try {
      notesListData = await fetchJsonFromS3(paths.notesListPath);
    } catch (error) {
      console.log('No existing notes list found');
    }
    
    // Find and update metadata
    const noteIndex = notesListData.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      notesListData.notes[noteIndex] = {
        ...notesListData.notes[noteIndex],
        title: updates.title || notesListData.notes[noteIndex].title,
        updatedAt: now,
        tags: updates.tags || notesListData.notes[noteIndex].tags,
        isPinned: updates.isPinned !== undefined ? updates.isPinned : notesListData.notes[noteIndex].isPinned,
        isArchived: updates.isArchived !== undefined ? updates.isArchived : notesListData.notes[noteIndex].isArchived,
        preview: updates.preview || notesListData.notes[noteIndex].preview
      };
      
      await uploadJsonToS3(paths.notesListPath, notesListData);
    }
    
    // 5. Load full note for Redux
    const fullNote = await loadMeetingNoteById(currentCompany, noteId);
    
    // 6. Dispatch update actions
    dispatch(updateCurrentNote(fullNote.note));
    if (noteIndex !== -1) {
      const updatedMetadata = {
        ...notesListData.notes[noteIndex],
        createdAt: formatDate(notesListData.notes[noteIndex].createdAt),
        updatedAt: formatDate(now)
      };
      dispatch(updateNoteInList(updatedMetadata));
    }
    
    return { success: true, note: fullNote.note };
  } catch (error) {
    console.error('Error updating meeting note:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Delete a meeting note
export const deleteMeetingNote = (currentCompany, noteId) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany, noteId);
    
    // 1. Delete individual note file
   
    
    // 2. Update notes_list.json
    let notesListData = { notes: [] };
    
    try {
      notesListData = await fetchJsonFromS3(paths.notesListPath);
    } catch (error) {
      console.log('No existing notes list found');
    }
    
    // Remove note from list
    const filteredNotes = notesListData.notes.filter(note => note.id !== noteId);
    notesListData.notes = filteredNotes;
    
    await uploadJsonToS3(paths.notesListPath, notesListData);
    
    // 3. Dispatch Redux actions
    dispatch(removeNoteFromList(noteId));
    dispatch(clearCurrentNote());
    
    return { success: true, message: 'Note deleted successfully' };
  } catch (error) {
    console.error('Error deleting meeting note:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Toggle pin status of a note
export const togglePinMeetingNote = (currentCompany, noteId) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany, noteId);
    const now = Date.now();
    
    // 1. Load existing note
    const existingNote = await fetchJsonFromS3(paths.notePath);
    
    if (!existingNote) {
      throw new Error('Note not found');
    }
    
    // 2. Update individual note
    const isPinned = !existingNote.isPinned;
    const updatedNoteData = {
      ...existingNote,
      isPinned,
      updatedAt: now
    };
    
    await uploadJsonToS3(paths.notePath, updatedNoteData);
    
    // 3. Update notes_list.json
    let notesListData = { notes: [] };
    
    try {
      notesListData = await fetchJsonFromS3(paths.notesListPath);
    } catch (error) {
      console.log('No existing notes list found');
    }
    
    // Update metadata
    const noteIndex = notesListData.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      notesListData.notes[noteIndex] = {
        ...notesListData.notes[noteIndex],
        isPinned,
        updatedAt: now
      };
      
      await uploadJsonToS3(paths.notesListPath, notesListData);
      
      // 4. Dispatch actions
      dispatch(togglePinNoteInList(noteId));
      
      const updatedMetadata = {
        ...notesListData.notes[noteIndex],
        createdAt: formatDate(notesListData.notes[noteIndex].createdAt),
        updatedAt: formatDate(now)
      };
      dispatch(updateNoteInList(updatedMetadata));
    }
    
    return { 
      success: true, 
      isPinned,
      note: updatedNoteData 
    };
  } catch (error) {
    console.error('Error toggling pin status:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Archive/Unarchive a note
export const archiveMeetingNote = (currentCompany, noteId, archive = true) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany, noteId);
    const now = Date.now();
    
    // 1. Load existing note
    const existingNote = await fetchJsonFromS3(paths.notePath);
    
    if (!existingNote) {
      throw new Error('Note not found');
    }
    
    // 2. Update individual note
    const updatedNoteData = {
      ...existingNote,
      isArchived: archive,
      updatedAt: now
    };
    
    await uploadJsonToS3(paths.notePath, updatedNoteData);
    
    // 3. Update notes_list.json
    let notesListData = { notes: [] };
    
    try {
      notesListData = await fetchJsonFromS3(paths.notesListPath);
    } catch (error) {
      console.log('No existing notes list found');
    }
    
    // Update metadata
    const noteIndex = notesListData.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      notesListData.notes[noteIndex] = {
        ...notesListData.notes[noteIndex],
        isArchived: archive,
        updatedAt: now
      };
      
      await uploadJsonToS3(paths.notesListPath, notesListData);
      
      // 4. Dispatch update action
      const updatedMetadata = {
        ...notesListData.notes[noteIndex],
        createdAt: formatDate(notesListData.notes[noteIndex].createdAt),
        updatedAt: formatDate(now)
      };
      dispatch(updateNoteInList(updatedMetadata));
    }
    
    return { 
      success: true, 
      isArchived: archive,
      note: updatedNoteData 
    };
  } catch (error) {
    console.error('Error archiving note:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Search meeting notes
export const searchMeetingNotes = (currentCompany, searchTerm) => async (dispatch) => {
  try {
    // Load notes list first
    const result = await dispatch(loadMeetingNotes(currentCompany));
    
    if (!result.success) {
      return { success: false, message: result.message };
    }
    
    const { notes } = result;
    
    // Filter notes based on search term
    const filteredNotes = notes.filter(note => {
      const searchLower = searchTerm.toLowerCase();
      
      // Search in title
      if (note.title.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in tags
      if (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
        return true;
      }
      
      // Search in preview
      if (note.preview && note.preview.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
    
    return { 
      success: true, 
      notes: filteredNotes,
      total: notes.length,
      filtered: filteredNotes.length
    };
  } catch (error) {
    console.error('Error searching meeting notes:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Add tag to note
export const addTagToMeetingNote = (currentCompany, noteId, tag) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany, noteId);
    const now = Date.now();
    
    // 1. Load existing note
    const existingNote = await fetchJsonFromS3(paths.notePath);
    
    if (!existingNote) {
      throw new Error('Note not found');
    }
    
    // 2. Add tag if not already present
    const currentTags = existingNote.tags || [];
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag];
      
      const updatedNoteData = {
        ...existingNote,
        tags: updatedTags,
        updatedAt: now
      };
      
      // 3. Update individual note
      await uploadJsonToS3(paths.notePath, updatedNoteData);
      
      // 4. Update notes_list.json
      let notesListData = { notes: [] };
      
      try {
        notesListData = await fetchJsonFromS3(paths.notesListPath);
      } catch (error) {
        console.log('No existing notes list found');
      }
      
      // Update metadata
      const noteIndex = notesListData.notes.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        notesListData.notes[noteIndex] = {
          ...notesListData.notes[noteIndex],
          tags: updatedTags,
          updatedAt: now
        };
        
        await uploadJsonToS3(paths.notesListPath, notesListData);
        
        // 5. Dispatch update action
        const updatedMetadata = {
          ...notesListData.notes[noteIndex],
          createdAt: formatDate(notesListData.notes[noteIndex].createdAt),
          updatedAt: formatDate(now)
        };
        dispatch(updateNoteInList(updatedMetadata));
      }
      
      return { 
        success: true, 
        tags: updatedTags,
        note: updatedNoteData 
      };
    }
    
    return { 
      success: true, 
      message: 'Tag already exists',
      tags: currentTags
    };
  } catch (error) {
    console.error('Error adding tag to note:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Remove tag from note
export const removeTagFromMeetingNote = (currentCompany, noteId, tag) => async (dispatch) => {
  try {
    const paths = getMeetingNotePaths(currentCompany, noteId);
    const now = Date.now();
    
    // 1. Load existing note
    const existingNote = await fetchJsonFromS3(paths.notePath);
    
    if (!existingNote) {
      throw new Error('Note not found');
    }
    
    // 2. Remove tag
    const currentTags = existingNote.tags || [];
    const updatedTags = currentTags.filter(t => t !== tag);
    
    const updatedNoteData = {
      ...existingNote,
      tags: updatedTags,
      updatedAt: now
    };
    
    // 3. Update individual note
    await uploadJsonToS3(paths.notePath, updatedNoteData);
    
    // 4. Update notes_list.json
    let notesListData = { notes: [] };
    
    try {
      notesListData = await fetchJsonFromS3(paths.notesListPath);
    } catch (error) {
      console.log('No existing notes list found');
    }
    
    // Update metadata
    const noteIndex = notesListData.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      notesListData.notes[noteIndex] = {
        ...notesListData.notes[noteIndex],
        tags: updatedTags,
        updatedAt: now
      };
      
      await uploadJsonToS3(paths.notesListPath, notesListData);
      
      // 5. Dispatch update action
      const updatedMetadata = {
        ...notesListData.notes[noteIndex],
        createdAt: formatDate(notesListData.notes[noteIndex].createdAt),
        updatedAt: formatDate(now)
      };
      dispatch(updateNoteInList(updatedMetadata));
    }
    
    return { 
      success: true, 
      tags: updatedTags,
      note: updatedNoteData 
    };
  } catch (error) {
    console.error('Error removing tag from note:', error);
    dispatch(setError(error.message));
    return { success: false, message: error.message };
  }
};

// Generate preview from note content
export const generateNotePreview = (content) => {
  if (!content || !Array.isArray(content)) return '';
  
  // Extract text from Slate content
  const extractText = (node) => {
    if (node.text) return node.text;
    if (node.children) {
      return node.children.map(extractText).join(' ');
    }
    return '';
  };
  
  const text = content.map(extractText).join(' ').trim();
  
  // Return first 100 characters as preview
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
};