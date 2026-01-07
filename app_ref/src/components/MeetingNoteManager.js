// components/MeetingNotes/MeetingNotesManager.jsx
import React, { useEffect } from 'react';
import useMeetingNote from '../hooks/useMeetingNote';
import { useSelector } from 'react-redux';
import useConfig from '../hooks/useConfig';
import useAuth from '../hooks/useAuth';

const MeetingNotesManager = () => {
  const {
    // State
    notesList,
    currentNote,
    currentSections,
    
    // Direct actions
    setCurrentNote,
    updateNoteTitle,
    addNoteSection,
    
    // Thunk actions
    loadMeetingNotes,
    createMeetingNote,
    deleteMeetingNote,
    saveAllMeetingNotes,
  } = useMeetingNote();
  
  // Get user and company info from store (like your session hook usage)
 
  const {} = useConfig();
  const { userInfo, currentCompany } = useAuth();
  


  console.log(notesList)
  
  // Load notes on mount (like your session loading)
//   useEffect(() => {
//     if (userInfo && currentCompany) {
//       loadMeetingNotes(userInfo, currentCompany);
//     }
//   }, [userInfo, currentCompany]);
  
  const handleCreateNote = async () => {
    if (!userInfo || !currentCompany) return;
    
    const result = await createMeetingNote(
      userInfo,
      currentCompany,
      {
        title: 'New Meeting Notes',
        tags: ['meeting'],
        category: 'work'
      }
    );
    
    if (result.success) {
      console.log('Created note:', result.noteID);
    }
  };
  
  const handleSaveAll = async () => {
    if (!userInfo || !currentCompany) return;
    
    const result = await saveAllMeetingNotes(userInfo, currentCompany);
    if (result.success) {
      alert(`Saved ${result.count} notes to S3`);
    }
  };
  
  return (
    <div>
      <h2>Meeting Notes ({notesList?.length})</h2>
      
      <button onClick={handleCreateNote} disabled={!userInfo || !currentCompany}>
        Create New Note
      </button>
      
      <button onClick={handleSaveAll} disabled={notesList?.length === 0}>
        Save All Notes to S3
      </button>
      
      {/* Display notes list */}
      <div className="notes-list">
        {notesList && notesList?.map(note => (
          <div 
            key={note.noteId} 
            className={`note-item ${currentNote.noteId === note.noteId ? 'active' : ''}`}
            onClick={() => setCurrentNote(note)}
          >
            <h3>{note.title}</h3>
            {/* <p>Sections: {note.notes?.length || 0}</p> */}
            <p>Updated: {note.updated_at}</p>
          </div>
        ))}
      </div>
      
      {/* Current note editor */}
      {currentNote && currentNote.noteId && (
        <div className="current-note-editor">
          <input
            type="text"
            value={currentNote.title}
            onChange={(e) => updateNoteTitle(e.target.value)}
          />
          
          <button onClick={() => addNoteSection({
            experimentId: 'exp_001',
            experimentName: 'Test Experiment',
            tabName: 'Dashboard',
            filters_applied: {},
          })}>
            Add Section
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingNotesManager;