// src/redux/slices/meetingNoteSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notesList: [], // Array of note metadata
  currentNote: {
    id: null,
    title: "",
    content: [], // This will store the Slate.js editor state
    createdAt: "",
    updatedAt: "",
    meetingId: null,
    tags: [],
    isPinned: false,
    isArchived: false,
  },
  editorState: {
    isSaving: false,
    hasUnsavedChanges: false,
    lastSaved: null,
    selection: null, // Current editor selection
  },
};

const meetingNoteSlice = createSlice({
  name: "meetingNotes",
  initialState,
  reducers: {
    // Load all notes metadata
    loadNotesList(state, action) {
      state.notesList = action.payload;
    },
    
    // Set current note with full data
    setCurrentNote(state, action) {
      state.currentNote = action.payload;
      state.editorState.hasUnsavedChanges = false;
    },
    
    // Update current note by path (useful for nested updates)
    updateCurrentNoteByPath: (state, action) => {
      const { path, value } = action.payload;

      const updateNestedByPath = (obj, path, value) => {
        const pathParts = path.split(/[\.\[\]]/).filter(Boolean);
        const updateRecursively = (currentObj, keys) => {
          const [firstKey, ...remainingKeys] = keys;
          const index = Number(firstKey);
          
          if (!isNaN(index)) {
            // Array case
            if (remainingKeys.length === 0) {
              currentObj[index] = value;
            } else {
              currentObj[index] = updateRecursively(
                currentObj[index],
                remainingKeys
              );
            }
          } else {
            // Object case
            if (remainingKeys.length === 0) {
              currentObj[firstKey] = value;
            } else {
              currentObj[firstKey] = updateRecursively(
                currentObj[firstKey],
                remainingKeys
              );
            }
          }
          return currentObj;
        };

        return updateRecursively(obj, pathParts);
      };

      state.currentNote = updateNestedByPath(state.currentNote, path, value);
      state.editorState.hasUnsavedChanges = true;
    },
    
    // Update Slate.js editor content directly
    updateNoteContent(state, action) {
      state.currentNote.content = action.payload;
      state.editorState.hasUnsavedChanges = true;
    },
    
    // Update note title
    updateNoteTitle(state, action) {
      state.currentNote.title = action.payload;
      state.editorState.hasUnsavedChanges = true;
    },
    
    // Update note metadata in the list
    updateNoteInList(state, action) {
      const updatedNote = action.payload;
      const index = state.notesList.findIndex(note => note.id === updatedNote.id);
      if (index !== -1) {
        state.notesList[index] = { ...state.notesList[index], ...updatedNote };
      }
    },
    
    // Add tag to current note
    addTagToNote(state, action) {
      state.currentNote.tags.push(action.payload);
      state.editorState.hasUnsavedChanges = true;
    },
    
    // Remove tag from current note
    removeTagFromNote(state, action) {
      state.currentNote.tags = state.currentNote.tags.filter(
        tag => tag !== action.payload
      );
      state.editorState.hasUnsavedChanges = true;
    },
    
    // Toggle pin status
    togglePinNote(state) {
      state.currentNote.isPinned = !state.currentNote.isPinned;
      state.editorState.hasUnsavedChanges = true;
    },
    
    // Archive/unarchive note
    toggleArchiveNote(state) {
      state.currentNote.isArchived = !state.currentNote.isArchived;
      state.editorState.hasUnsavedChanges = true;
    },
    
    // Update editor state
    updateEditorState(state, action) {
      state.editorState = { ...state.editorState, ...action.payload };
    },
    
    // Mark as saving
    startSaving(state) {
      state.editorState.isSaving = true;
    },
    
    // Mark as saved
    finishSaving(state, action) {
      state.editorState.isSaving = false;
      state.editorState.hasUnsavedChanges = false;
      state.editorState.lastSaved = action.payload || new Date().toISOString();
    },
    
    // Update current note's timestamp
    updateNoteTimestamp(state, action) {
      const { field, timestamp } = action.payload;
      if (field === 'createdAt' || field === 'updatedAt') {
        state.currentNote[field] = timestamp;
      }
    },
    
    // Create new empty note
    createNewNote(state, action) {
      const newNoteId = action.payload?.id || Date.now();
      state.currentNote = {
        ...initialState.currentNote,
        id: newNoteId,
        title: action.payload?.title || "New Note",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        meetingId: action.payload?.meetingId || null,
        content: action.payload?.content || [{ type: 'paragraph', children: [{ text: '' }] }],
      };
      state.editorState.hasUnsavedChanges = false;
    },
    
    // Clear current note
    clearCurrentNote(state) {
      state.currentNote = initialState.currentNote;
      state.editorState = initialState.editorState;
    },
    
    // Add note to list (when created)
    addNoteToList(state, action) {
      state.notesList.unshift(action.payload);
    },
    
    // Remove note from list
    removeNoteFromList(state, action) {
      state.notesList = state.notesList.filter(
        note => note.id !== action.payload
      );
    },

    
    togglePinNoteInList: (state, action) => {
      const noteId = action.payload;
      const noteIndex = state.notesList.findIndex(note => note.id === noteId);
      if (noteIndex !== -1) {
        state.notesList[noteIndex].isPinned = !state.notesList[noteIndex].isPinned;
      }
    },
    
    updateNoteInList: (state, action) => {
      const updatedNote = action.payload;
      const index = state.notesList.findIndex(note => note.id === updatedNote.id);
      if (index !== -1) {
        state.notesList[index] = { ...state.notesList[index], ...updatedNote };
      }
    },
    
    filterNotesByTag: (state, action) => {
      const tag = action.payload;
      if (tag === 'all') {
        // Reset to all notes logic here
      }
      // You might want to keep filtered notes in a separate state property
    },
    
    archiveNote: (state, action) => {
      const noteId = action.payload;
      const noteIndex = state.notesList.findIndex(note => note.id === noteId);
      if (noteIndex !== -1) {
        state.notesList[noteIndex].isArchived = true;
      }
    },
    
    unarchiveNote: (state, action) => {
      const noteId = action.payload;
      const noteIndex = state.notesList.findIndex(note => note.id === noteId);
      if (noteIndex !== -1) {
        state.notesList[noteIndex].isArchived = false;
      }
    },
    
    searchNotes: (state, action) => {
      const searchTerm = action.payload;
      // You might want to store search results in a separate state property
    },
  },
});

export const {
  loadNotesList,
  setCurrentNote,
  updateCurrentNoteByPath,
  updateNoteContent,
  updateNoteTitle,
  updateNoteInList,
  addTagToNote,
  removeTagFromNote,
  togglePinNote,
  toggleArchiveNote,
  updateEditorState,
  startSaving,
  finishSaving,
  updateNoteTimestamp,
  createNewNote,
  clearCurrentNote,
  addNoteToList,
  removeNoteFromList,
   togglePinNoteInList,
 
  filterNotesByTag,
  archiveNote,
  unarchiveNote,
  searchNotes,
} = meetingNoteSlice.actions;

export default meetingNoteSlice.reducer;