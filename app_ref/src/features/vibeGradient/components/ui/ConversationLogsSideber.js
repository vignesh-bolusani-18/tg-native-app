import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, TextField, ClickAwayListener } from '@mui/material';
import { Menu as MenuIcon, Add as AddIcon, MoreVert as MoreVertIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import CustomButton from '../../../../components/CustomButton';

const ConversationSidebar = ({ 
  conversationList, 
  onSelectConversation, 
  onNewChat,
  isOpen,
  onToggle,
  currentConversationId,
  onRenameConversation,
  onDeleteConversation 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  const editBoxRef = useRef(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      
      // Scroll to the editing item
      if (editBoxRef.current) {
        editBoxRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [editingId]);

  const handleMenuOpen = (event, conversation) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => {
    if (selectedConversation) {
      setEditingId(selectedConversation.conversationID);
      setEditValue(selectedConversation.conversation_name || '');
      handleMenuClose();
    }
  };

  const handleRenameSubmit = () => {
    if (editValue.trim() && onRenameConversation && editingId) {
      onRenameConversation(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDeleteClick = () => {
    if (onDeleteConversation && selectedConversation) {
      onDeleteConversation(selectedConversation.conversationID);
    }
    handleMenuClose();
  };

  // Get unique conversations to prevent duplicates
  const uniqueConversations = conversationList?.reduce((acc, conversation) => {
    if (!acc.find(c => c.conversationID === conversation.conversationID)) {
      acc.push(conversation);
    }
    return acc;
  }, []) || [];

  return (
    <>
      {/* Sidebar */}
      <Box
        sx={{
          width: isOpen ? '15%' : 0,
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#ffffff',
          borderRight: isOpen ? '1px solid #e5e7eb' : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: isOpen ? 1 : 0,
        }}
      >
        {/* Sidebar Header with Toggle */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton
            onClick={onToggle}
            sx={{
              p: 1,
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
            aria-label="Close sidebar"
          >
            <MenuIcon sx={{ fontSize: 20, color: '#6b7280' }} />
          </IconButton>
          <CustomButton
            onClick={onNewChat}
            title="New chat"
            outlined 
          />
        </Box>
        <Box sx={{ p: 1.5 }}>
          {/* New Chat Button */}
        </Box>

        {/* Conversations List */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 1,
            pb: 1.5,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#d1d5db',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: '#9ca3af',
              },
            },
          }}
        >
          {uniqueConversations.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {uniqueConversations.map((conversation) => {
                const isEditing = editingId === conversation.conversationID;
                
                return (
                  <Box
                    key={conversation.conversationID}
                    ref={isEditing ? editBoxRef : null}
                    sx={{
                      position: 'relative',
                      '&:hover .conversation-menu-button': {
                        opacity: isEditing ? 0 : 1,
                      },
                    }}
                  >
                    {isEditing ? (
                      // Editing mode
                      <ClickAwayListener onClickAway={handleRenameCancel}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1.5,
                            py: 1,
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            my: 0.5,
                          }}
                        >
                          <TextField
                            inputRef={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleRenameSubmit();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleRenameCancel();
                              }
                            }}
                            size="small"
                            variant="outlined"
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: '14px',
                                backgroundColor: '#ffffff',
                                '& fieldset': {
                                  borderColor: '#d1d5db',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#9ca3af',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#2563eb',
                                },
                              },
                              '& .MuiOutlinedInput-input': {
                                padding: '6px 8px',
                              },
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={handleRenameSubmit}
                            sx={{
                              padding: '4px',
                              color: '#16a34a',
                              '&:hover': {
                                backgroundColor: '#dcfce7',
                              },
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleRenameCancel}
                            sx={{
                              padding: '4px',
                              color: '#dc2626',
                              '&:hover': {
                                backgroundColor: '#fee2e2',
                              },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </ClickAwayListener>
                    ) : (
                      // Normal mode
                      <>
                        <Button
                          onClick={() => onSelectConversation(conversation)}
                          sx={{
                            width: '100%',
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                            px: 1,
                            py: 0.75,
                            backgroundColor: 
                              currentConversationId === conversation.conversationID 
                                ? '#f3f4f6' 
                                : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            textTransform: 'none',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                              <Box
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 350,
                                  color: '#111827',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {conversation.conversation_name || 'Untitled Conversation'}
                              </Box>
                            </Box>
                          </Box>
                        </Button>

                        {/* Three dots menu button */}
                        <IconButton
                          className="conversation-menu-button"
                          onClick={(e) => handleMenuOpen(e, conversation)}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            padding: '4px',
                            '&:hover': {
                              backgroundColor: '#e5e7eb',
                            },
                          }}
                          aria-label="Conversation options"
                        >
                          <MoreVertIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '14px',
                mt: 4,
              }}
            >
              No conversations yet
            </Box>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.25), 0 4px 6px -2px rgba(0,0,0,0.15)'
,
            borderRadius: '8px',
            minWidth: '160px',
            backgroundColor: '#ffffff',
          },
        }}
      >
        <MenuItem 
          onClick={handleRenameClick}
          sx={{
            fontSize: '14px',
            py: 1,
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
          }}
        >
          Rename
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteClick}
          sx={{
            fontSize: '14px',
            py: 1,
            color: '#dc2626',
            '&:hover': {
              backgroundColor: '#fee2e2',
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Toggle Button when Sidebar is Closed */}
      {!isOpen && (
        <Box
          sx={{
            width: 'fit-content',
            flexShrink: 0,
            marginRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingTop: 2,
            gap: 1,
            marginLeft: '8px',  
          }}
        >
          <IconButton
            onClick={onToggle}
            sx={{
              backgroundColor: '#f8fafc',
              width: 44,
              height: 44,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              },
            }}
            aria-label="Open sidebar"
          >
            <MenuIcon sx={{ fontSize: 20, color: '#374151' }} />
          </IconButton>

          <Button
            onClick={onNewChat}
            startIcon={<AddIcon sx={{ fontSize: 20, color: '#374151' }} />}
            sx={{
              backgroundColor: '#f8fafc',
              color: '#374151',
              border: 'none',
              borderRadius: '50%',
              textTransform: 'none',
              fontWeight: 500,
              height: 44,
              width: 44,
              minWidth: 44,
              p: 0,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              transition:
                'width 220ms cubic-bezier(0.4, 0, 0.2, 1), padding 220ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1), background-color 220ms cubic-bezier(0.4, 0, 0.2, 1)',
              justifyContent: 'center',
              '& .MuiButton-startIcon': {
                margin: 0,
                transition: 'margin 220ms cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '& .new-chat-label': {
                maxWidth: 0,
                opacity: 0,
                ml: 0,
                transition:
                  'max-width 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms cubic-bezier(0.4, 0, 0.2, 1), margin 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
              },
              '&:hover': {
                backgroundColor: '#f1f5f9',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                px: 2,
                width: 'auto',
                minWidth: 120,
                borderRadius: '24px',
              },
              '&:hover .MuiButton-startIcon': {
                marginRight: 0.5,
              },
              '&:hover .new-chat-label': {
                maxWidth: 100,
                opacity: 1,
                ml: 0,
              },
              '&:active': {
                backgroundColor: '#e2e8f0',
              },
            }}
          >
            <span className="new-chat-label">New chat</span>
          </Button>
        </Box>
      )}
    </>
  );
};

export default ConversationSidebar;