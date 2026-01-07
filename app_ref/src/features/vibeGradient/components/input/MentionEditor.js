import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  EditorState,
  convertToRaw,
  Modifier,
  getDefaultKeyBinding,
} from "draft-js";
import Editor from "@draft-js-plugins/editor";
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from "@draft-js-plugins/mention";
import "@draft-js-plugins/mention/lib/plugin.css";
import { Box } from "@mui/material";
import ReactDOM from "react-dom";
import useDataset from "../../../../hooks/useDataset";
import useAuth from "../../../../hooks/useAuth";
import { useVibe } from "../../../../hooks/useVibe"; // IMPORT useVibe
import useExperiment from "../../../../hooks/useExperiment";
import {
  selectedExperimentDataset_list,
  getExperimentDatasetPath,
} from "../../../../utils/Agent Utils/selectedExperimentDatasetlist";
import { formatYearMonth } from "../../../../components/ExpTable.js";

const MentionEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      onSend,
      placeholder = "Ask me anything...",
      disabled = false,
      mentions = [],
      editorRef,
    },
    ref
  ) => {
    // USE HOOKS DIRECTLY
    const { datasets_list } = useDataset();
    const { currentCompany } = useAuth();
    // Only pull in the minimal helpers we actually need from vibe to avoid
    // unnecessary re-renders and Redux work on every keystroke.
    const {
      addDatasetToSelection,
      removeDatasetFromSelection,
      addExpDatasetToSelection,
      addUserMessage,
      removeUserMessage,
    } = useVibe();
    const { experiments_list } = useExperiment(); // GET FUNCTION FROM useExperiment
    const innerEditorRef = useRef(null);
    const containerRef = useRef(null);
    const [editorState, setEditorState] = useState(() =>
      EditorState.createEmpty()
    );
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
    });
    const previousMentionsRef = useRef(new Set()); // Track previous mentions
    const isSendingRef = useRef(false);
    const previousExpDatasetsRef = useRef(new Set()); // NEW: Track experiment datasets

    // NEW STATE FOR NESTED DROPDOWN
    const [showNestedDropdown, setShowNestedDropdown] = useState(false);
    const [selectedExperiment, setSelectedExperiment] = useState(null);
    const [nestedSuggestions, setNestedSuggestions] = useState([]);
    const [selectedNestedIndex, setSelectedNestedIndex] = useState(0);

const supersetMentions = useMemo(() => {
  // Safety check: ensure datasets_list is an array
  const datasetMentions = (datasets_list || []).map(d => ({
    name: d.datasetName,
    value: d.datasetSourceName,
    type: 'dataset'
  }));
  
  // Safety check and DEDUPLICATE experiments by name
  const experimentMentions = (experiments_list || [])
    .reduce((acc, e) => {
      // Only add if we haven't seen this name before
      if (!acc.some(exp => exp.name === e.experimentName)) {
        acc.push({
          name: e.experimentName,
          value: e.experimentID,
          type: 'experiment'
        });
      }
      return acc;
    }, []);
  
  return [...datasetMentions, ...experimentMentions];
}, [datasets_list, experiments_list]);

    const formattedExperimentDatasets = useMemo(() => {
      return selectedExperimentDataset_list.map((datasetName) => ({
        name: datasetName,
        value: "",
        type: "experiment_dataset",
      }));
    }, []);

  // THIS USEEFFECT TRACKS MENTIONS AND CALLS useVibe FUNCTIONS
// CONSOLIDATED USEEFFECT TRACKS ALL MENTIONS (datasets + experiment datasets)
 // SIMPLIFIED USEEFFECT - Let Redux handle counting
useEffect(() => {
  if (isSendingRef.current) {
    isSendingRef.current = false;
    previousMentionsRef.current = new Set();
    previousExpDatasetsRef.current = new Set();
    return;
  }
  
  const contentState = editorState.getCurrentContent();
  const currentMentions = new Set();
  const currentExpDatasets = new Set();

  if (!contentState.hasText()) {
    // When editor is empty, remove ALL previously tracked items once
    previousMentionsRef.current.forEach((mentionName) => {
      removeDatasetFromSelection(mentionName);
      console.log('🗑️ Cleared dataset on empty:', mentionName);
    });
    previousExpDatasetsRef.current.forEach((expDatasetName) => {
      removeDatasetFromSelection(expDatasetName);
      console.log('🗑️ Cleared exp dataset on empty:', expDatasetName);
    });
    previousMentionsRef.current = new Set();
    previousExpDatasetsRef.current = new Set();
    return;
  }
  
  // Extract ALL mentions from content (both types)
  contentState.getBlockMap().forEach((block) => {
    block.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'mention'
        );
      },
      (start, end) => {
        const entityKey = block.getEntityAt(start);
        const entity = contentState.getEntity(entityKey);
        const mentionData = entity.getData();
        
        if (mentionData && mentionData.mention) {
          const mentionType = mentionData.mention.type;
          const mentionName = mentionData.mention.name;
          
          console.log('🔍 Found mention:', {
            name: mentionName,
            type: mentionType,
            hasDatasetPath: !!mentionData.mention.datasetPath
          });
          
          if (mentionType === 'experiment_with_dataset') {
            // Experiment dataset
            currentExpDatasets.add(mentionName);
            console.log('🧪 Tracked exp dataset:', mentionName);
          } else if (mentionType === 'dataset') {
            // Regular dataset
            currentMentions.add(mentionName);
            console.log('📊 Tracked dataset:', mentionName);
          }
          // Ignore 'experiment' type (incomplete mentions)
        }
      }
    );
  });
  
  // Handle ADDED regular datasets (simple add, Redux handles counting)
  currentMentions.forEach((mentionName) => {
    if (!previousMentionsRef.current.has(mentionName)) {
      const dataset = datasets_list?.find((d) => d.datasetName === mentionName);
      const isUploaded = dataset && dataset.datasetSourceName === "File Upload";
      
      addDatasetToSelection(
        mentionName,
        isUploaded,
        currentCompany?.companyName || "",
        currentCompany?.companyID || ""
      );
      console.log('➕ Added dataset:', mentionName);
    }
  });
  
  // Handle REMOVED regular datasets (simple remove, Redux handles counting)
  previousMentionsRef.current.forEach((mentionName) => {
    if (!currentMentions.has(mentionName)) {
      removeDatasetFromSelection(mentionName);
      console.log('➖ Removed dataset:', mentionName);
    }
  });
  
  // Handle ADDED experiment datasets
  currentExpDatasets.forEach((expDatasetName) => {
    if (!previousExpDatasetsRef.current.has(expDatasetName)) {
      // Extract experiment name and dataset name
      const [experimentName, datasetName] = expDatasetName.split('/');
      
      // Find the full experiment
      const fullExperiment = experiments_list?.find(
        exp => exp.experimentName === experimentName
      );
      
      if (fullExperiment) {
        // Reconstruct the path
        const moduleName = fullExperiment.experimentModuleName;
        const run_date = formatYearMonth(fullExperiment.createdAt);
        const experimentBasePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${fullExperiment.experimentID}`;
        
        const datasetPath = getExperimentDatasetPath(
          experimentBasePath,
          datasetName
        );
        
        addExpDatasetToSelection(datasetPath, expDatasetName);
        console.log('➕ Added exp dataset:', expDatasetName);
      }
    }
  });
  
  // Handle REMOVED experiment datasets
  previousExpDatasetsRef.current.forEach((expDatasetName) => {
    if (!currentExpDatasets.has(expDatasetName)) {
      removeDatasetFromSelection(expDatasetName);
      console.log('➖ Removed exp dataset:', expDatasetName);
    }
  });
  
  // Update tracked Sets (not Maps, just Sets)
  previousMentionsRef.current = currentMentions;
  previousExpDatasetsRef.current = currentExpDatasets;
  
  console.log('📊 Current tracking - Datasets:', Array.from(currentMentions), 'Exp Datasets:', Array.from(currentExpDatasets));
}, [
  editorState, 
  datasets_list, 
  currentCompany,
  experiments_list,
  addDatasetToSelection, 
  addExpDatasetToSelection,
  removeDatasetFromSelection
]);

    // Clear editor when parent value is reset (after sending message)
    useEffect(() => {
      if (value === "") {
        setEditorState(EditorState.createEmpty());
        // Clear tracked mentions so datasets don't stick around between messages
        previousMentionsRef.current = new Set();
        previousExpDatasetsRef.current = new Set();
      }
    }, [value]);

  // Create mention plugin with proper configuration
const { MentionSuggestions, plugins } = useMemo(() => {
  const mentionPlugin = createMentionPlugin({
    entityMutability: "IMMUTABLE",
    mentionPrefix: "@",
    supportWhitespace: true,
    mentionTrigger: "@",
    positionSuggestions: () => {
      return {};
    },
    mentionComponent: (mentionProps) => {
      return (
        <span
          className={mentionProps.className}
          style={{
            backgroundColor: "#e3f2fd",
            color: "#1976d2",
            padding: "1px",
            borderRadius: "4px",
            fontWeight: 500,
            display: "inline-block",
            marginRight: "6px",
            userSelect: "none", // Prevent text selection
            cursor: "default", // Show default cursor, not text cursor
          }}
          // contentEditable={false} // Make it non-editable
          suppressContentEditableWarning
          onMouseDown={(e) => {
            // Prevent click from placing cursor inside
            e.preventDefault();
          }}
        >
          {mentionProps.children}
        </span>
      );
    },
  });
  const { MentionSuggestions } = mentionPlugin;
  const plugins = [mentionPlugin];
  return { plugins, MentionSuggestions };
}, []);

    // Calculate dropdown position
    const updateDropdownPosition = useCallback(() => {
      if (!containerRef.current || !open) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 230; // approximate or fixed maxHeight
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const shouldOpenAbove =
        spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

      setDropdownPosition({
        top: shouldOpenAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: 300,
      });
    }, [open]);

    // Update position when opening or on scroll/resize
    useEffect(() => {
      if (open) {
        updateDropdownPosition();
        window.addEventListener("scroll", updateDropdownPosition, true);
        window.addEventListener("resize", updateDropdownPosition);

        return () => {
          window.removeEventListener("scroll", updateDropdownPosition, true);
          window.removeEventListener("resize", updateDropdownPosition);
        };
      }
    }, [open, updateDropdownPosition]);

    // Get plain text from editor state
    const getPlainText = useCallback(() => {
      const contentState = editorState.getCurrentContent();
      return contentState.getPlainText();
    }, [editorState]);

    // Focus the editor
    const focusEditor = useCallback(() => {
      if (innerEditorRef.current) {
        innerEditorRef.current.focus();
      }
    }, []);

    // Expose methods via both ref and editorRef
    useImperativeHandle(ref, () => ({
      focus: focusEditor,
      getPlainText: getPlainText,
    }));

    useImperativeHandle(editorRef, () => ({
      focus: focusEditor,
      getPlainText: getPlainText,
    }));

    // Handle mention dropdown open/close
    const onOpenChange = useCallback(
      (_open) => {
        setOpen(_open);
        if (_open) {
          updateDropdownPosition();
          if (!showNestedDropdown) {
            // Initialize with full superset when opening for @ mentions
            setSuggestions(supersetMentions);
          }
          setSelectedSuggestionIndex(0);
        }
      },
      [updateDropdownPosition, showNestedDropdown, supersetMentions]
    );

    // Handle mention search - filter suggestions based on search term
    const onSearchChange = useCallback(
      ({ value: searchValue }) => {
        // Check if we're in nested mode (after /)
        if (showNestedDropdown && selectedExperiment) {
          // Filter nested dataset suggestions using formatted list
          const filtered = defaultSuggestionsFilter(
            searchValue,
            formattedExperimentDatasets
          );
          setNestedSuggestions(filtered);
          setSelectedNestedIndex(0);
        } else {
          // Filter main superset suggestions
          const filtered = defaultSuggestionsFilter(
            searchValue,
            supersetMentions
          );
          setSuggestions(filtered);
          setSelectedSuggestionIndex(0);
          setShowNestedDropdown(false); // Reset nested state
        }
      },
      [
        supersetMentions,
        showNestedDropdown,
        selectedExperiment,
        formattedExperimentDatasets,
      ]
    );

  // Handle editor state changes
const handleEditorChange = useCallback(
  (newEditorState) => {
    setEditorState(newEditorState);
    
    const contentState = newEditorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const plainText = contentState.getPlainText();
    const selection = newEditorState.getSelection();
    const cursorPos = selection.getStartOffset();
    
    // NEW: Check if editor is completely empty
// Check if editor is completely empty
if (!plainText.trim()) {
  // Clear all tracked mentions when editor is empty
  previousMentionsRef.current.forEach((mentionName) => {
    removeDatasetFromSelection(mentionName);
  });
  previousMentionsRef.current = new Set();
  
  // Clear all tracked experiment datasets
  previousExpDatasetsRef.current.forEach((expDatasetName) => {
    removeDatasetFromSelection(expDatasetName);
  });
  previousExpDatasetsRef.current = new Set();
  
  // Close dropdown if open
  if (open) {
    setOpen(false);
    setShowNestedDropdown(false);
    setSelectedExperiment(null);
  }
  
  addUserMessage(plainText);
  onChange(JSON.stringify(rawContent));
  return;
}
    
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();
    const textBeforeCursor = blockText.substring(0, cursorPos);
    
    // NEW: Check if cursor is inside a mention entity
    let cursorInsideEntity = false;
    block.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'mention';
      },
      (start, end) => {
        if (cursorPos > start && cursorPos < end) {
          cursorInsideEntity = true;
        }
      }
    );
    
    // If cursor is inside an entity, close dropdown and return
    if (cursorInsideEntity) {
      if (open) {
        setOpen(false);
        setShowNestedDropdown(false);
        setSelectedExperiment(null);
      }
      addUserMessage(plainText);
      onChange(JSON.stringify(rawContent));
      return;
    }
    
    // Check if there's an @ symbol before cursor
    const hasAtSymbol = textBeforeCursor.includes('@');
    
    // If no @ symbol and dropdown is open, close it immediately
    if (!hasAtSymbol && open) {
      setOpen(false);
      setShowNestedDropdown(false);
      setSelectedExperiment(null);
      addUserMessage(plainText);
      onChange(JSON.stringify(rawContent));
      return;
    }
    
    // Look for pattern: @ExperimentName/ (but only if NOT inside an entity)
        const experimentSlashPattern = /@(\w+)\/(\w*)$/;  // CHANGED: Added (\w*)$ to capture text after slash
    const match = textBeforeCursor.match(experimentSlashPattern);
    
    if (match) {
      const experimentName = match[1];
      const searchAfterSlash = match[2]; // NEW: Capture what user typed after /
      
      const experiment = experiments_list?.find(e => e.experimentName === experimentName);
      
      if (experiment) {
        // Check if this is actually part of a completed mention
        let isPartOfCompletedMention = false;
        block.findEntityRanges(
          (character) => {
            const entityKey = character.getEntity();
            return entityKey !== null && contentState.getEntity(entityKey).getType() === 'mention';
          },
          (start, end) => {
            // If the slash is within a completed mention, don't trigger nested
            if (cursorPos >= start && cursorPos <= end) {
              isPartOfCompletedMention = true;
            }
          }
        );
        
        if (!isPartOfCompletedMention) {
          setSelectedExperiment(experiment);
          setShowNestedDropdown(true);
          
          // NEW: Filter nested suggestions based on what user typed after /
          if (searchAfterSlash) {
            const filtered = defaultSuggestionsFilter(
              searchAfterSlash,
              formattedExperimentDatasets
            );
            setNestedSuggestions(filtered);
          } else {
            setNestedSuggestions(formattedExperimentDatasets);
          }
          
          setSelectedNestedIndex(0);
          if (!open) {
            setOpen(true);
          }
        }
      }
    } else {
      // Reset nested state if no slash pattern
      if (showNestedDropdown) {
        setShowNestedDropdown(false);
        setSelectedExperiment(null);
      }
    }
    
    addUserMessage(plainText);
    onChange(JSON.stringify(rawContent));
  },
  [
    onChange, 
    addUserMessage, 
    experiments_list, 
    showNestedDropdown, 
    open, 
    formattedExperimentDatasets, 
    removeDatasetFromSelection
  ]
);

  // Handle keyboard navigation for dropdown
  const handleKeyDown = useCallback(
    (e) => {
      // Determine which suggestions list we're using
      const currentSuggestions = showNestedDropdown ? nestedSuggestions : suggestions;
      const currentIndex = showNestedDropdown ? selectedNestedIndex : selectedSuggestionIndex;
      const setCurrentIndex = showNestedDropdown ? setSelectedNestedIndex : setSelectedSuggestionIndex;
      
      if (open && currentSuggestions.length > 0) {
        // When the suggestion dropdown (main or nested) is visible,
        // ignore the Enter key entirely so it cannot finalize a mention.
        // Selection should be made by click or arrow+Enter can be disabled
        // to avoid accidental creation of chips while typing.
        if (e.key === "Enter") {
          e.preventDefault();
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCurrentIndex((prev) =>
            prev < currentSuggestions.length - 1 ? prev + 1 : 0
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setCurrentIndex((prev) =>
            prev > 0 ? prev - 1 : currentSuggestions.length - 1
          );
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();

          if (showNestedDropdown) {
            // Ensure we have a selected nested index
            const nestedIndexToUse = typeof selectedNestedIndex === 'number' ? selectedNestedIndex : 0;

            // If selectedExperiment is missing for some reason, try to derive it
            // from the text before the cursor (pattern: @ExperimentName/)
            if (!selectedExperiment) {
              try {
                const contentState = editorState.getCurrentContent();
                const selection = editorState.getSelection();
                const blockKey = selection.getStartKey();
                const block = contentState.getBlockForKey(blockKey);
                const blockText = block.getText();
                const cursorPos = selection.getStartOffset();
                const textBeforeCursor = blockText.substring(0, cursorPos);

                // Capture experiment name allowing spaces: everything between
                // the last '@' and the following '/'
                const m = textBeforeCursor.match(/@([^\/]+)\/$/);
                if (m && m[1]) {
                  const expName = m[1].trim();
                  const found = experiments_list?.find(e => e.experimentName === expName);
                  if (found) {
                    setSelectedExperiment(found);
                  }
                }
              } catch (err) {
                // ignore parsing errors
              }
            }

            // If nestedSuggestions is empty, fall back to formatted list
            if (!nestedSuggestions || nestedSuggestions.length === 0) {
              setNestedSuggestions(formattedExperimentDatasets);
            }

            // Insert nested dataset selection (use current or default index)
            insertNestedDataset(nestedSuggestions[nestedIndexToUse] || formattedExperimentDatasets[0]);
          } else {
            // Insert main mention (dataset or experiment)
            const mention = suggestions[selectedSuggestionIndex];

            if (mention.type === 'experiment') {
              // For experiment, just insert it and wait for user to type '/'
              insertExperimentMention(mention);
            } else {
              // For dataset, insert normally
              insertDatasetMention(mention);
            }
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          setShowNestedDropdown(false);
          return;
        }
      }
    },
    [open, suggestions, selectedSuggestionIndex, editorState, showNestedDropdown, nestedSuggestions, selectedNestedIndex]
  );

  // Handle Enter key to send message
const handleReturn = useCallback(
  (e) => {
    if (open) {
      return "not-handled";
    }
    
    if (e.shiftKey) {
      return "not-handled";
    }

    e.preventDefault();
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText();
    
    if (plainText.trim() && onSend) {
      isSendingRef.current = true;
      
      // Clear tracked mentions
      previousMentionsRef.current.forEach((mentionName) => {
        removeDatasetFromSelection(mentionName);
      });
      previousMentionsRef.current = new Set();
      
      // Clear tracked experiment datasets
      previousExpDatasetsRef.current.forEach((expDatasetName) => {
        removeDatasetFromSelection(expDatasetName);
      });
      previousExpDatasetsRef.current = new Set();
      
      // Clear the editor
      setEditorState(EditorState.createEmpty());
      onChange("");
      removeUserMessage();
      
      // Send the message
      onSend(plainText.trim());
    }
    
    return "handled";
  },
  [editorState, onSend, onChange, open, removeDatasetFromSelection, removeUserMessage]
);

    const handleKeyCommand = useCallback(() => {
      return "not-handled";
    }, []);

    // Focus editor on mount
    useEffect(() => {
      const timer = setTimeout(() => {
        if (innerEditorRef.current) {
          innerEditorRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Helper function to insert experiment mention
    const insertExperimentMention = useCallback(
      (mention) => {
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();

      // Ensure selection is collapsed (cursor, not range)
  if (!selection.isCollapsed()) {
    return;
  }
    
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();
    const cursorPos = selection.getStartOffset();
    const textBeforeCursor = blockText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      // Insert plain text '@ExperimentName/' (no entity) so the nested
      // dataset selection can replace this text with a combined entity.
      const newSelection = selection.merge({
        anchorOffset: lastAtIndex,
        focusOffset: cursorPos,
      });

      const mentionText = `@${mention.name}/`;

      const contentStateWithText = Modifier.replaceText(
        contentState,
        newSelection,
        mentionText
      );

      let newEditorState = EditorState.push(
        editorState,
        contentStateWithText,
        'insert-characters'
      );

      const cursorOffset = lastAtIndex + mentionText.length;
      const finalSelection = selection.merge({
        anchorOffset: cursorOffset,
        focusOffset: cursorOffset,
      });

      newEditorState = EditorState.acceptSelection(newEditorState, finalSelection);

      setEditorState(newEditorState);

      // Open nested suggestions for this experiment. The nested selection
      // will create the final combined mention entity.
      setSelectedExperiment(mention);
      setShowNestedDropdown(true);
      setNestedSuggestions(formattedExperimentDatasets);
      setSelectedNestedIndex(0);
      setOpen(true);

      // Ensure editor has focus so keyboard Enter selects nested suggestion
      setTimeout(() => {
        if (innerEditorRef.current) innerEditorRef.current.focus();
      }, 50);
    }
  }, [editorState]);
  
  // Helper function to insert dataset mention (normal)
  const insertDatasetMention = useCallback((mention) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    
    if (!selection.isCollapsed()) {
      return;
    }

    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();
    const cursorPos = selection.getStartOffset();
    const textBeforeCursor = blockText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const newSelection = selection.merge({
        anchorOffset: lastAtIndex,
        focusOffset: cursorPos,
      });
      
      const mentionText = `@${mention.name}`;
      
      // IMPORTANT: Set type as 'dataset' explicitly
      const newContentState = contentState.createEntity(
        'mention',
        'IMMUTABLE',
        { 
          mention: {
            name: mention.name,
            value: mention.value,
            type: 'dataset'  // ADDED: Explicit type
          }
        }
      );
      const entityKey = newContentState.getLastCreatedEntityKey();
      
      const contentStateWithEntity = Modifier.replaceText(
        newContentState,
        newSelection,
        mentionText,
        null,
        entityKey
      );
      
      const spaceSelection = selection.merge({
        anchorOffset: lastAtIndex + mentionText.length,
        focusOffset: lastAtIndex + mentionText.length,
      });
      
      const finalContentState = Modifier.insertText(
        contentStateWithEntity,
        spaceSelection,
        ' '
      );
      
      let newEditorState = EditorState.push(
        editorState,
        finalContentState,
        'insert-characters'
      );
      
      const cursorOffset = lastAtIndex + mentionText.length + 1;
      const finalSelection = selection.merge({
        anchorOffset: cursorOffset,
        focusOffset: cursorOffset,
      });
      
      newEditorState = EditorState.acceptSelection(
        newEditorState,
        finalSelection
      );
      
      setEditorState(newEditorState);
      setOpen(false);
      
      setTimeout(() => {
        if (innerEditorRef.current) {
          innerEditorRef.current.focus();
        }
      }, 0);
    }
  }, [editorState]);
  


// Helper function to insert nested dataset (FIXED to extend the chip)
  const insertNestedDataset = useCallback((dataset) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();
    const cursorPos = selection.getStartOffset();
    
    // Find the @ symbol to replace the entire mention
    const textBeforeCursor = blockText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      // Find the existing mention entity
      let mentionEntityKey = null;
      let mentionData = null;
      
      block.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (entityKey !== null) {
            const entity = contentState.getEntity(entityKey);
            if (entity.getType() === 'mention') {
              return true;
            }
          }
          return false;
        },
        (start, end) => {
          if (start <= cursorPos && cursorPos <= end) {
            mentionEntityKey = block.getEntityAt(start);
            const entity = contentState.getEntity(mentionEntityKey);
            mentionData = entity.getData();
          }
        }
      );
      
      // Determine experiment name and full experiment object.
      // Prefer the `selectedExperiment` state, but fall back to parsing
      // the editor text if it's not available (avoids relying on async setState).
      let experimentNameLocal = selectedExperiment?.name;
      if (!experimentNameLocal) {
        const m = textBeforeCursor.match(/@([^\/]*)\//);
        if (m && m[1]) {
          experimentNameLocal = m[1].trim();
        }
      }

      if (!experimentNameLocal) {
        console.error('Experiment name could not be determined before inserting nested dataset');
        return;
      }

      const fullExperiment = experiments_list.find(
        (exp) => exp.experimentName === experimentNameLocal
      );

      if (!fullExperiment) {
        console.error('Experiment not found:', experimentNameLocal);
        return;
      }
      
      // NEW: Find company using experimentID
      // const experimentCompany = company_list?.find(
      //   company => company.companyID === fullExperiment.companyID
      // ) || currentCompany;
      
      // NEW: Build experimentBasePath
      const moduleName = fullExperiment.experimentModuleName ;
      const run_date = formatYearMonth(fullExperiment.createdAt) ;
      const experimentBasePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${fullExperiment.experimentID}`;
      
      // NEW: Call getExperimentDatasetPath to get the dataset path
      const datasetPath = getExperimentDatasetPath(
        experimentBasePath,
        dataset.name,
      );

      console.log('📊 Experiment Dataset Path:', datasetPath);

      // IMPORTANT: Do NOT call `addExpDatasetToSelection` here.
      // The centralized `useEffect` that watches `editorState` is responsible
      // for adding/removing datasets in Redux exactly once per unique mention.
      // Calling the add action here (on each insert) caused duplicate increments
      // when the same experiment dataset was inserted multiple times.

      // previousExpDatasetsRef will be updated by the useEffect after
      // the editor state change, so we avoid modifying it here.
      
      // Create the combined mention text: @ExperimentName/DatasetName
      const combinedMentionText = `@${experimentNameLocal}/${dataset.name}`;
      
      // Create new selection from @ to cursor
      const newSelection = selection.merge({
        anchorOffset: lastAtIndex,
        focusOffset: cursorPos,
      });
      
      // Create a new entity with combined data
      const newContentState = contentState.createEntity(
        'mention',
        'IMMUTABLE',
        {
          mention: {
            name: `${experimentNameLocal}/${dataset.name}`,
            experiment: fullExperiment,
            dataset: dataset,
            datasetPath: datasetPath,
            type: 'experiment_with_dataset'
          }
        }
      );
      const entityKey = newContentState.getLastCreatedEntityKey();
      
      // Replace the text with the combined mention
      const contentStateWithEntity = Modifier.replaceText(
        newContentState,
        newSelection,
        combinedMentionText,
        null,
        entityKey
      );
      
      // Add a space after the mention
      const spaceSelection = selection.merge({
        anchorOffset: lastAtIndex + combinedMentionText.length,
        focusOffset: lastAtIndex + combinedMentionText.length,
      });
      
      const finalContentState = Modifier.insertText(
        contentStateWithEntity,
        spaceSelection,
        ' '
      );
      
      let newEditorState = EditorState.push(
        editorState,
        finalContentState,
        'insert-characters'
      );
      
      // Position cursor after the space
      const cursorOffset = lastAtIndex + combinedMentionText.length + 1;
      const finalSelection = selection.merge({
        anchorOffset: cursorOffset,
        focusOffset: cursorOffset,
      });
      
      newEditorState = EditorState.acceptSelection(
        newEditorState,
        finalSelection
      );
      
      setEditorState(newEditorState);
      setOpen(false);
      setShowNestedDropdown(false);
      setSelectedExperiment(null);
      
      setTimeout(() => {
        if (innerEditorRef.current) {
          innerEditorRef.current.focus();
        }
      }, 0);
    }
  }, [editorState, selectedExperiment, experiments_list, currentCompany, addExpDatasetToSelection]);

    // Custom dropdown component rendered via portal - THIS SHOWS THE SUGGESTIONS
    const CustomMentionDropdown =
      open &&
      (showNestedDropdown ? nestedSuggestions : suggestions).length > 0 &&
      typeof document !== "undefined" &&
      ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 9999,
            padding: "8px 0",
          }}
        >
          {(showNestedDropdown ? nestedSuggestions : suggestions).map(
            (mention, index) => {
              // Fix: Correctly determine which index to use for highlighting
              const isSelected = showNestedDropdown
                ? index === selectedNestedIndex
                : index === selectedSuggestionIndex;

              // Rest of your code for sourceLabel...
              let sourceLabel = "";
              if (showNestedDropdown) {
                sourceLabel = mention.value || "dataset";
              } else {
                if (mention.type === "dataset") {
                  const dataset = datasets_list.find(
                    (d) => d.datasetName === mention.name
                  );
                  sourceLabel = dataset?.datasetSourceName || "uploads";
                } else if (mention.type === "experiment") {
                  const e = experiments_list.find(
                    (exp) => exp.experimentName === mention.name
                  );
                  sourceLabel =
                    `${e.experimentID[0]}${e.experimentID[1]}${
                      e.experimentID[2]
                    }...${e.experimentID[e.experimentID.length - 3]}${
                      e.experimentID[e.experimentID.length - 2]
                    }${e.experimentID[e.experimentID.length - 1]}` ||
                    "experiments";
                }
              }

              return (
                <div
                  key={mention.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (showNestedDropdown) {
                      insertNestedDataset(mention);
                    } else if (mention.type === "experiment") {
                      insertExperimentMention(mention);
                    } else {
                      insertDatasetMention(mention);
                    }
                  }}
                  onMouseEnter={() => {
                    if (showNestedDropdown) {
                      setSelectedNestedIndex(index);
                    } else {
                      setSelectedSuggestionIndex(index);
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    margin: "0 8px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#e0f2fe" : "transparent", // Use isSelected variable
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1f2937",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {mention.name}
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginLeft: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sourceLabel}
                  </span>
                </div>
              );
            }
          )}
        </div>,
        document.body
      );

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "40px",
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? "none" : "auto",
          "& .DraftEditor-root": {
            minHeight: "40px",
            maxHeight: "200px",
            overflow: "auto",
            padding: "8px 0",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            fontFamily: "inherit",
            color: disabled ? "#9ca3af" : "inherit",
            cursor: disabled ? "not-allowed" : "text",
          },
          "& .DraftEditor-editorContainer": {
            position: "relative",
          },
          "& .public-DraftEditor-content": {
            minHeight: "24px",
            outline: "none",
          },
          "& .public-DraftEditorPlaceholder-root": {
            color: "#9ca3af",
            position: "absolute",
            pointerEvents: "none",
          },
          "& .public-DraftStyleDefault-block": {
            margin: 0,
          },
          "& .draftJsMentionPlugin__mention__29BEd": {
            backgroundColor: "#e3f2fd !important",
            color: "#1976d2 !important",
            padding: "2px 6px !important",
            borderRadius: "4px !important",
            fontWeight: "500 !important",
            textDecoration: "none !important",
          },
          "& .draftJsMentionPlugin__mentionSuggestions__2DWjA": {
            display: "none !important",
          },
        }}
        onClick={() => {
          if (!disabled && innerEditorRef.current) {
            innerEditorRef.current.focus();
          }
        }}
        onKeyDownCapture={(e) => {
          // Capture Enter at a higher level to ensure plugins can't
          // finalize mentions while suggestion dropdown is visible.
          if (open && (e.key === 'Enter' || e.key === 'Tab')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <Editor
          editorKey="mention-editor"
          editorState={editorState}
          onChange={handleEditorChange}
          plugins={plugins}
          handleReturn={handleReturn}
          handleKeyCommand={handleKeyCommand}
          readOnly={disabled}
          placeholder={placeholder}
          ref={innerEditorRef}
                    keyBindingFn={(e) => {
            if (open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Tab" || e.key === "Escape")) {
              return null;
            }
            return getDefaultKeyBinding(e);
          }}
          onKeyDown={handleKeyDown}
        />
        <MentionSuggestions
          open={open}
          onOpenChange={onOpenChange}
          suggestions={showNestedDropdown ? nestedSuggestions : suggestions}
          onSearchChange={onSearchChange}
          onAddMention={(mention) => {
            // Control insertion behavior when a suggestion is chosen
            if (showNestedDropdown) {
              // When nested dropdown is active, selecting a nested item
              // should insert the combined experiment/dataset mention.
              insertNestedDataset(mention);
            } else {
              if (mention.type === 'experiment') {
                // For experiments, insert plain text '@Name/' and open nested list
                insertExperimentMention(mention);
              } else {
                // For normal datasets, insert as dataset mention
                insertDatasetMention(mention);
              }
            }
          }}
        />
      </Box>
      {CustomMentionDropdown}
    </>
  );
});

MentionEditor.displayName = "MentionEditor";

export default MentionEditor;

