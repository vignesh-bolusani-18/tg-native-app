// src/hooks/useMeetingNote.js
import { useDispatch, useSelector } from "react-redux";
import {
  loadNotesList,
  setCurrentNote,
 updateCurrentNoteByPath as updateCurrentNote,
  removeNoteFromList,
  togglePinNoteInList,
  updateNoteInList,
  clearCurrentNote,
  addNoteToList,
  updateNoteContent,
  updateNoteTitle,
  startSaving,
  finishSaving,
  updateNoteTimestamp,
  togglePinNote,
  addTagToNote,
  removeTagFromNote,
  updateEditorState,
  createNewNote as createNewNoteAction,
} from "../redux/slices/meetingNoteSlice";

import {
  loadMeetingNotes as loadMeetingNotesAction,
  createMeetingNote as createMeetingNoteAction,
  loadMeetingNoteById as loadMeetingNoteByIdAction,
  updateMeetingNote as updateMeetingNoteAction,
  deleteMeetingNote as deleteMeetingNoteAction,
  togglePinMeetingNote as togglePinMeetingNoteAction,
  archiveMeetingNote as archiveMeetingNoteAction,
  searchMeetingNotes as searchMeetingNotesAction,
  addTagToMeetingNote as addTagToMeetingNoteAction,
  removeTagFromMeetingNote as removeTagFromMeetingNoteAction,
} from "../redux/actions/meetingNoteActions";

const useMeetingNote = () => {
  const dispatch = useDispatch();

  // Selectors
  const notesList = useSelector((state) => state?.meetingNotes?.notesList);
  const currentNote = useSelector((state) => state?.meetingNotes?.currentNote);
  const editorState = useSelector((state) => state?.meetingNotes?.editorState);

  // Slice Actions
  const loadNotesListAction = (notes) => dispatch(loadNotesList(notes));
  const setCurrentNoteAction = (note) => dispatch(setCurrentNote(note));
  const updateCurrentNoteAction = (updates) => dispatch(updateCurrentNote(updates));
  const removeNoteFromListAction = (noteId) => dispatch(removeNoteFromList(noteId));
  const togglePinNoteInListAction = (noteId) => dispatch(togglePinNoteInList(noteId));
  const updateNoteInListAction = (note) => dispatch(updateNoteInList(note));
  const clearCurrentNoteAction = () => dispatch(clearCurrentNote());
  const addNoteToListAction = (note) => dispatch(addNoteToList(note));
  const updateNoteContentAction = (content) => dispatch(updateNoteContent(content));
  const updateNoteTitleAction = (title) => dispatch(updateNoteTitle(title));
  const startSavingAction = () => dispatch(startSaving());
  const finishSavingAction = (timestamp) => dispatch(finishSaving(timestamp));
  const updateNoteTimestampAction = (field, timestamp) => 
    dispatch(updateNoteTimestamp({ field, timestamp }));
  const togglePinNoteAction = () => dispatch(togglePinNote());
  const addTagToNoteAction = (tag) => dispatch(addTagToNote(tag));
  const removeTagFromNoteAction = (tag) => dispatch(removeTagFromNote(tag));
  const updateEditorStateAction = (state) => dispatch(updateEditorState(state));
  const createNewNoteSliceAction = (noteInfo) => dispatch(createNewNoteAction(noteInfo));

  // Action Creators (with async operations)
  const loadMeetingNotes = (currentCompany) => 
    dispatch(loadMeetingNotesAction(currentCompany));

  const createMeetingNote = (userInfo, currentCompany, noteInfo) =>
    dispatch(createMeetingNoteAction(userInfo, currentCompany, noteInfo));

  const loadMeetingNoteById = (currentCompany, noteId) =>{
    console.log('loadMeetingNoteById', currentCompany, noteId)
    dispatch(loadMeetingNoteByIdAction(currentCompany, noteId));}

  const updateMeetingNote = (currentCompany, noteId, updates) =>
    dispatch(updateMeetingNoteAction(currentCompany, noteId, updates));

  const deleteMeetingNote = (currentCompany, noteId) =>
    dispatch(deleteMeetingNoteAction(currentCompany, noteId));

  const togglePinMeetingNote = (currentCompany, noteId) =>
    dispatch(togglePinMeetingNoteAction(currentCompany, noteId));

  const archiveMeetingNote = (currentCompany, noteId, archive = true) =>
    dispatch(archiveMeetingNoteAction(currentCompany, noteId, archive));

  const searchMeetingNotes = (currentCompany, searchTerm) =>
    dispatch(searchMeetingNotesAction(currentCompany, searchTerm));

  const addTagToMeetingNote = (currentCompany, noteId, tag) =>
    dispatch(addTagToMeetingNoteAction(currentCompany, noteId, tag));

  const removeTagFromMeetingNote = (currentCompany, noteId, tag) =>
    dispatch(removeTagFromMeetingNoteAction(currentCompany, noteId, tag));

  // Helper function to generate preview from content
  const generateNotePreview = (content) => {
    if (!content || !Array.isArray(content)) return '';
    
    const extractText = (node) => {
      if (node.text) return node.text;
      if (node.children) {
        return node.children.map(extractText).join(' ');
      }
      return '';
    };
    
    const text = content.map(extractText).join(' ').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return {
    // State
    notesList,
    currentNote,
    editorState,

    // Slice Actions (synchronous)
    loadNotesList: loadNotesListAction,
    setCurrentNote: setCurrentNoteAction,
    updateCurrentNote: updateCurrentNoteAction,
    removeNoteFromList: removeNoteFromListAction,
    togglePinNoteInList: togglePinNoteInListAction,
    updateNoteInList: updateNoteInListAction,
    clearCurrentNote: clearCurrentNoteAction,
    addNoteToList: addNoteToListAction,
    updateNoteContent: updateNoteContentAction,
    updateNoteTitle: updateNoteTitleAction,
    startSaving: startSavingAction,
    finishSaving: finishSavingAction,
    updateNoteTimestamp: updateNoteTimestampAction,
    togglePinNote: togglePinNoteAction,
    addTagToNote: addTagToNoteAction,
    removeTagFromNote: removeTagFromNoteAction,
    updateEditorState: updateEditorStateAction,
    createNewNote: createNewNoteSliceAction,

    // Action Creators (asynchronous - S3 operations)
    loadMeetingNotes,
    createMeetingNote,
    loadMeetingNoteById,
    updateMeetingNote,
    deleteMeetingNote,
    togglePinMeetingNote,
    archiveMeetingNote,
    searchMeetingNotes,
    addTagToMeetingNote,
    removeTagFromMeetingNote,

    // Helper Functions
    generateNotePreview,
  };
};

export default useMeetingNote;