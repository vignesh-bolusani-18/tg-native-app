import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Divider,
  Tooltip,
  Checkbox,
  Button,
  Badge,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import CustomButton from "./CustomButton";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";
import useDataConnection from "../hooks/useDataConnection";
import { GRAY, BRAND, SUCCESS, WARNING } from "../theme/custmizations/colors";
import { toast } from "react-toastify";

import { Editor } from "@monaco-editor/react";

import { useState } from "react";
import GoogleDriveDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/GoogleDriveDataConnectionData";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

// Helper function to get all files under a folder recursively
const getAllFilesUnderFolder = (folder) => {
  const files = [];

  if (folder.children) {
    folder.children.forEach((child) => {
      if (child.file.type === "file" && child.file.isSupportedFile) {
        files.push(child.file);
      } else if (child.file.type === "folder") {
        files.push(...getAllFilesUnderFolder(child));
      }
    });
  }

  return files;
};

// Helper function to get all folders under a folder recursively
const getAllFoldersUnderFolder = (folder) => {
  const folders = [];

  if (folder.children) {
    folder.children.forEach((child) => {
      if (child.file.type === "folder") {
        folders.push(child.file);
        folders.push(...getAllFoldersUnderFolder(child));
      }
    });
  }

  return folders;
};

// File Structure Item Component
const FileStructureItem = ({
  item,
  level = 0,
  onFileSelect,
  selectedItems,
  onSelectionChange,
  currentPath = "",
}) => {
  const [expanded, setExpanded] = useState(false);
  const isFolder = item.file.type === "folder";
  const hasChildren = item.children && item.children.length > 0;

  // Check if this item is selected
  const isSelected = selectedItems.some(
    (selected) => selected.id === item.file.id
  );

  // Check if this folder is partially selected (some children selected)
  const isPartiallySelected =
    isFolder &&
    hasChildren &&
    (() => {
      const allChildren = [
        ...getAllFilesUnderFolder(item),
        ...getAllFoldersUnderFolder(item),
      ];
      const selectedChildren = allChildren.filter((child) =>
        selectedItems.some((selected) => selected.id === child.id)
      );
      return (
        selectedChildren.length > 0 &&
        selectedChildren.length < allChildren.length
      );
    })();

  // Check if this folder is fully selected (all children selected)
  const isFullySelected =
    isFolder &&
    hasChildren &&
    (() => {
      const allChildren = [
        ...getAllFilesUnderFolder(item),
        ...getAllFoldersUnderFolder(item),
      ];
      const selectedChildren = allChildren.filter((child) =>
        selectedItems.some((selected) => selected.id === child.id)
      );
      return (
        selectedChildren.length === allChildren.length && allChildren.length > 0
      );
    })();

  const handleToggle = () => {
    if (isFolder) {
      setExpanded(!expanded);
    }
  };

  const handleCheckboxChange = (event) => {
    event.stopPropagation();

    if (isFolder) {
      // Check if folder is empty before allowing selection
      const allChildren = [
        ...getAllFilesUnderFolder(item),
        ...getAllFoldersUnderFolder(item),
      ];

      if (event.target.checked) {
        // If folder is empty, show toast and prevent selection
        if (allChildren.length === 0) {
          toast.warning(
            "This folder is empty. Please select a folder that contains files or subfolders.",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          return; // Prevent selection
        }

        // Select folder and all its children
        const itemsToAdd = [item.file, ...allChildren];
        const newSelectedItems = [...selectedItems];

        itemsToAdd.forEach((itemToAdd) => {
          if (
            !newSelectedItems.some((selected) => selected.id === itemToAdd.id)
          ) {
            newSelectedItems.push(itemToAdd);
          }
        });

        onSelectionChange(newSelectedItems);
      } else {
        // Deselect folder and all its children
        const itemsToRemove = [item.file, ...allChildren];
        const newSelectedItems = selectedItems.filter(
          (selected) =>
            !itemsToRemove.some(
              (itemToRemove) => itemToRemove.id === selected.id
            )
        );

        onSelectionChange(newSelectedItems);
      }
    } else {
      // Handle file selection
      if (event.target.checked) {
        if (!selectedItems.some((selected) => selected.id === item.file.id)) {
          onSelectionChange([...selectedItems, item.file]);
        }
      } else {
        // When deselecting a file, also deselect any parent folders that would become partially selected
        const newSelectedItems = selectedItems.filter(
          (selected) => selected.id !== item.file.id
        );

        // Find and deselect parent folders that would become partially selected
        const parentFoldersToDeselect = [];
        selectedItems.forEach((selected) => {
          if (selected.type === "folder" && selected.path && item.file.path) {
            // Check if this folder is a parent of the deselected file
            if (item.file.path.startsWith(selected.path + "/")) {
              // Count how many children of this parent are still selected
              const remainingChildren = newSelectedItems.filter(
                (child) =>
                  child.path && child.path.startsWith(selected.path + "/")
              );

              // If no children are left selected, deselect the parent
              if (remainingChildren.length === 0) {
                parentFoldersToDeselect.push(selected.id);
              }
            }
          }
        });

        // Remove parent folders that should be deselected
        const finalSelectedItems = newSelectedItems.filter(
          (selected) => !parentFoldersToDeselect.includes(selected.id)
        );

        onSelectionChange(finalSelectedItems);
      }
    }
  };

  const getFileIcon = (file) => {
    if (file.type === "folder") {
      return expanded ? (
        <FolderOpenIcon sx={{ color: "#0C66E4" }} />
      ) : (
        <FolderIcon sx={{ color: "#0C66E4" }} />
      );
    }

    // File type icons based on extension
    const extension = file.fileExtension?.toLowerCase();
    if (extension === "xlsx" || extension === "xls") {
      return <InsertDriveFileIcon sx={{ color: SUCCESS[600] }} />; // Excel green
    } else if (extension === "csv") {
      return <InsertDriveFileIcon sx={{ color: WARNING[600] }} />; // CSV orange
    }
    return <InsertDriveFileIcon sx={{ color: GRAY[500] }} />;
  };

  const formatFileSize = (size) => {
    if (!size) return "";
    const bytes = parseInt(size);
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Determine background color based on selection state
  const getBackgroundColor = () => {
    if (isSelected) {
      return BRAND[100]; // Selected file - light blue background
    }
    return "#FFFFFF";
  };

  // Determine border color based on selection state
  const getBorderColor = () => {
    if (isSelected) {
      return BRAND[300]; // Selected file - blue border
    }
    return "transparent";
  };

  return (
    <Box>
      <ListItem
        button={isFolder}
        onClick={isFolder ? handleToggle : null}
        sx={{
          pl: 2 + level * 2,
          py: 0.5,
          cursor: isFolder ? "pointer" : "default",
          opacity: item.file.isSupportedFile ? 1 : 0.6,
          borderRadius: "6px",
          margin: "2px 0",
          backgroundColor: getBackgroundColor(),
          border: `1px solid ${getBorderColor()}`,
          "&:hover": {
            backgroundColor: isFolder ? GRAY[50] : "transparent",
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <Checkbox
            checked={isSelected || isFullySelected}
            indeterminate={isPartiallySelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            disabled={
              isFolder &&
              getAllFilesUnderFolder(item).length === 0 &&
              getAllFoldersUnderFolder(item).length === 0
            }
            sx={{
              padding: "4px",
              color: GRAY[400],
              "&.Mui-checked": {
                color: "#0C66E4",
              },
              "&.MuiCheckbox-indeterminate": {
                color: "#0C66E4",
              },
              "&.Mui-disabled": {
                color: GRAY[300],
              },
            }}
          />
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 32 }}>
          {getFileIcon(item.file)}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 600 : isFolder ? 700 : 500,
                  fontFamily: "Inter",
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: isSelected ? BRAND[700] : "#101828",
                }}
              >
                {item.file.name}
                {isFolder && hasChildren && (
                  <Chip
                    label={`${getAllFilesUnderFolder(item).length} files`}
                    size="small"
                    sx={{
                      fontSize: "0.7rem",
                      height: 18,
                      backgroundColor: GRAY[100],
                      color: GRAY[600],
                      fontFamily: "Inter",
                      fontWeight: 400,
                      marginLeft: 1,
                    }}
                  />
                )}
              </Typography>
              {!isFolder && item.file.size && (
                <Chip
                  label={formatFileSize(item.file.size)}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    borderColor: GRAY[300],
                    color: GRAY[600],
                    fontFamily: "Inter",
                  }}
                />
              )}
              {!isFolder && item.file.isSupportedFile && (
                <Chip
                  label={item.file.fileExtension?.toUpperCase()}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    backgroundColor: isSelected ? BRAND[100] : BRAND[50],
                    color: BRAND[700],
                    fontFamily: "Inter",
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>
          }
          secondary={
            !isFolder && (
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: GRAY[500],
                }}
              >
                Modified:{" "}
                {new Date(item.file.modifiedTime).toLocaleDateString()}
              </Typography>
            )
          }
        />
        {isFolder && (
          <IconButton size="small" sx={{ p: 0, color: GRAY[500] }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </ListItem>

      {isFolder && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {hasChildren ? (
              item.children.map((child, index) => (
                <FileStructureItem
                  key={`${child.file.id}-${index}`}
                  item={child}
                  level={level + 1}
                  onFileSelect={onFileSelect}
                  selectedItems={selectedItems}
                  onSelectionChange={onSelectionChange}
                  currentPath={item.file.path}
                />
              ))
            ) : (
              <ListItem sx={{ pl: 4 + level * 2, py: 1 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: GRAY[500],
                      }}
                    >
                      📁 Empty Folder
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

// Selected Items List Component
const SelectedItemsList = ({
  selectedItems,
  onRemoveItem,
  onClearAll,
  fileStructure,
}) => {
  // Group items by their path hierarchy
  const groupItemsByHierarchy = () => {
    const hierarchy = {};

    selectedItems.forEach((item) => {
      const pathParts = item.path ? item.path.split("/") : [item.name];
      let currentLevel = hierarchy;

      pathParts.forEach((part, index) => {
        if (!currentLevel[part]) {
          // Find the actual item for this path level
          const currentPath = pathParts.slice(0, index + 1).join("/");
          const actualItem = selectedItems.find(
            (selected) =>
              selected.path === currentPath ||
              (index === 0 && selected.name === part && !selected.path)
          );

          currentLevel[part] = {
            item: actualItem || {
              name: part,
              type: "folder",
              path: currentPath,
            },
            children: {},
          };
        }
        currentLevel = currentLevel[part].children;
      });
    });

    return hierarchy;
  };

  // Count only direct children under a folder (not nested descendants)
  const countDirectChildrenUnderFolder = (folderPath) => {
    return selectedItems.filter((item) => {
      if (!item.path || !folderPath) return false;

      // Check if this item is a direct child (only one level deeper)
      const folderPathParts = folderPath.split("/");
      const itemPathParts = item.path.split("/");

      // Direct child means: same parent path + exactly one more level
      return (
        itemPathParts.length === folderPathParts.length + 1 &&
        item.path.startsWith(folderPath + "/")
      );
    }).length;
  };

  // Count direct children considering parent folder selection
  const getEffectiveDirectChildrenCount = (folderPath) => {
    // First, check if this folder itself is selected
    const folderIsSelected = selectedItems.some(
      (item) => item.path === folderPath && item.type === "folder"
    );

    if (folderIsSelected) {
      // If folder is selected, count all direct children from the file structure
      // This gives us the actual count of what's under this folder
      const folderItem = findFolderInStructure(folderPath);
      if (folderItem && folderItem.children) {
        return folderItem.children.length;
      }
    } else {
      // If folder is not selected, count only selected direct children
      return countDirectChildrenUnderFolder(folderPath);
    }

    return 0;
  };

  // Helper function to find a folder in the file structure
  const findFolderInStructure = (folderPath) => {
    const searchInChildren = (children) => {
      for (const child of children) {
        if (child.file.path === folderPath) {
          return child;
        }
        if (child.children) {
          const found = searchInChildren(child.children);
          if (found) return found;
        }
      }
      return null;
    };

    // Search in the root structure
    if (fileStructure?.children) {
      return searchInChildren(fileStructure.children);
    }
    return null;
  };

  // Render hierarchy recursively
  const renderHierarchy = (hierarchy, level = 0) => {
    return Object.entries(hierarchy).map(([name, data]) => {
      const item = data.item;
      const hasChildren = Object.keys(data.children).length > 0;

      // Determine if this is actually a folder (either by type or by having children)
      const isFolder = item?.type === "folder" || hasChildren;

      // Count direct children under this folder
      const directChildrenCount = item?.path
        ? getEffectiveDirectChildrenCount(item.path)
        : 0;

      return (
        <Box key={item?.id || name}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 0.5,
              pl: level * 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isFolder ? (
                <FolderIcon sx={{ color: "#0C66E4", fontSize: 16 }} />
              ) : (
                <InsertDriveFileIcon
                  sx={{ color: SUCCESS[600], fontSize: 16 }}
                />
              )}
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: GRAY[700],
                  fontWeight: isFolder ? 500 : 400,
                }}
              >
                {name}
              </Typography>
              {!isFolder && item?.fileExtension && (
                <Chip
                  label={item.fileExtension.toUpperCase()}
                  size="small"
                  sx={{
                    fontSize: "0.6rem",
                    height: 16,
                    backgroundColor: BRAND[50],
                    color: BRAND[700],
                    fontFamily: "Inter",
                    fontWeight: 500,
                  }}
                />
              )}
              {isFolder && directChildrenCount > 0 && (
                <Chip
                  label={`${directChildrenCount} items`}
                  size="small"
                  sx={{
                    fontSize: "0.6rem",
                    height: 16,
                    backgroundColor: GRAY[100],
                    color: GRAY[600],
                    fontFamily: "Inter",
                    fontWeight: 400,
                  }}
                />
              )}
            </Box>
            <IconButton
              size="small"
              onClick={() => onRemoveItem(item.id)}
              sx={{ p: 0.5, color: GRAY[500] }}
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          {hasChildren && (
            <Box sx={{ pl: 1 }}>
              {renderHierarchy(data.children, level + 1)}
            </Box>
          )}
        </Box>
      );
    });
  };

  const hierarchy = groupItemsByHierarchy();

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        bgcolor: GRAY[50],
        borderRadius: "8px",
        border: `1px solid ${GRAY[200]}`,
        maxHeight: "200px",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "20px",
            color: GRAY[900],
          }}
        >
          Selected Items (
          {selectedItems.filter((item) => item.type === "file").length})
        </Typography>
        {selectedItems.length > 0 && (
          <Button
            size="small"
            onClick={onClearAll}
            sx={{
              fontSize: "12px",
              color: GRAY[600],
              textTransform: "none",
              "&:hover": {
                backgroundColor: GRAY[100],
              },
            }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {selectedItems.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "20px",
            color: GRAY[500],
            textAlign: "center",
          }}
        >
          No items selected
        </Typography>
      ) : (
        <Box>{renderHierarchy(hierarchy)}</Box>
      )}
    </Box>
  );
};

// Summary Component
const FileSummary = ({ summary }) => {
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        bgcolor: GRAY[50],
        borderRadius: "8px",
        border: `1px solid ${GRAY[200]}`,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontSize: "16px",
          fontFamily: "Inter",
          fontWeight: 600,
          lineHeight: "24px",
          color: GRAY[900],
        }}
      >
        Folder Summary
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
        <Chip
          label={`${summary.totalFiles} Files`}
          size="small"
          sx={{
            backgroundColor: BRAND[50],
            color: BRAND[700],
            fontFamily: "Inter",
            fontWeight: 500,
          }}
        />
        <Chip
          label={`${summary.totalFolders} Folders`}
          size="small"
          sx={{
            backgroundColor: SUCCESS[50],
            color: SUCCESS[700],
            fontFamily: "Inter",
            fontWeight: 500,
          }}
        />
        <Chip
          label={`Max Depth: ${summary.maxDepth}`}
          size="small"
          sx={{
            backgroundColor: GRAY[100],
            color: GRAY[700],
            fontFamily: "Inter",
            fontWeight: 500,
          }}
        />
        <Chip
          label={`Supported: ${summary.supportedFileTypes.join(", ")}`}
          size="small"
          sx={{
            backgroundColor: WARNING[50],
            color: WARNING[700],
            fontFamily: "Inter",
            fontWeight: 500,
          }}
        />
      </Stack>
    </Box>
  );
};

export default function GoogleDriveDataConnection({
  open,
  handleClose,
  handleOpen,
  dataConnectionID,
  dataConnectionName,
  tenant,
  tenantURL,
}) {
  const defaultPayload = `{
  "exportJobTypeName": "Copy of Gatepass Export",
  "exportColums": [
    "gatePassCode",
    "gatePassCreatedBy",
    "type",
    "gatepassStatus",
    "createdAt",
    "updatedAt",
    "purpose",
    "reference",
    "toParty",
    "itemName",
    "itemSkuCode",
    "color",
    "size",
    "brand",
    "hsnCode",
    "unitPrice",
    "quantity",
    "receivedquantity",
    "inventoryType",
    "status",
    "shelf",
    "reason",
    "created",
    "updated",
    "gatePassOrderCode",
    "fromFacilityName",
    "toFacilityName",
    "toPartyCity",
    "invoiceType",
    "taxableAmount",
    "centralGSTRate",
    "centralGST",
    "stateGSTRate",
    "stateGST",
    "integratedGSTRate",
    "integratedGST",
    "invoiceNumber",
    "asdijasjd",
    "batchCode",
    "mfd",
    "expiry"
  ],
  "exportFilters": [
    {
      "id": "addedOn",
      "dateRange": {"start": 1642291200000,
                        "end": 1642291200000}
    }
  ],
  "frequency": "ONETIME"
}`;

  const [code, setCode] = useState(defaultPayload);
  const [
    googleDriveDataConnectionDataOpen,
    setGoogleDriveDataConnectionDataOpen,
  ] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [
    googleDriveDataConnectionPayload,
    setGoogleDriveDataConnectionPayload,
  ] = useState(null);

  const handleOpenGoogleDriveDataConnectionData = () => {
    setGoogleDriveDataConnectionDataOpen(true);
  };
  const handleCloseGoogleDriveDataConnectionData = () => {
    setGoogleDriveDataConnectionDataOpen(false);
    handleClose();
  };

  const {
    googleDriveDataConnectionDetails,
    loadGoogleDriveConnectionDataDetails,
    loadGoogleDriveSampleDataDetails,
    googleDriveSampleDataFetchFailed,
  } = useDataConnection();

  console.log(
    "googleDriveConnectionDetails for google drive",
    JSON.stringify(googleDriveDataConnectionDetails, null, 2)
  );

  const { userInfo, currentCompany } = useAuth();

  const handleConfirm = async () => {
    // Function to get only top-level selected folders (exclude children when parent is selected)
    const getTopLevelSelectedFolders = () => {
      const selectedFolders = selectedItems.filter(
        (item) => item.type === "folder"
      );
      const topLevelFolders = [];

      selectedFolders.forEach((folder) => {
        // Check if this folder is a child of any other selected folder
        const isChildOfSelectedFolder = selectedFolders.some((otherFolder) => {
          if (otherFolder.id === folder.id) return false; // Don't compare with itself
          return (
            folder.path &&
            otherFolder.path &&
            folder.path.startsWith(otherFolder.path + "/")
          );
        });

        // Only include if it's not a child of any other selected folder
        if (!isChildOfSelectedFolder) {
          topLevelFolders.push(folder);
        }
      });

      return topLevelFolders;
    };

    // Function to generate optimized regex path patterns from selected items
    const generatePathPatterns = () => {
      const patterns = [];

      // Get all selected files and folders
      const selectedFiles = selectedItems.filter(
        (item) => item.type === "file"
      );
      const selectedFolders = selectedItems.filter(
        (item) => item.type === "folder"
      );

      // Helper function to check if a path is covered by any existing pattern
      const isPathCovered = (path, existingPatterns) => {
        return existingPatterns.some((pattern) => {
          if (pattern.type === "folder_recursive") {
            // Check if path is under the recursive folder pattern
            return (
              path &&
              pattern.folderPath &&
              path.startsWith(pattern.folderPath + "/")
            );
          } else if (pattern.type === "wildcard") {
            // Check if path matches the wildcard pattern
            const patternPath = pattern.folderPath || "";
            const fileExtension = pattern.extension;
            if (path && patternPath && fileExtension) {
              // Check if the file is in the same folder or any subfolder with the same extension
              return (
                path.startsWith(patternPath + "/") &&
                path.endsWith(`.${fileExtension}`)
              );
            }
          }
          return false;
        });
      };

      // Helper function to check if a folder pattern covers another folder pattern
      const isFolderPatternCovered = (folderPath, existingPatterns) => {
        return existingPatterns.some((pattern) => {
          if (pattern.type === "folder_recursive") {
            // Check if this folder is under the recursive folder pattern
            return (
              folderPath &&
              pattern.folderPath &&
              folderPath.startsWith(pattern.folderPath + "/")
            );
          } else if (pattern.type === "wildcard") {
            // Check if this folder is under a wildcard pattern that covers all files
            const patternPath = pattern.folderPath || "";
            return (
              folderPath &&
              patternPath &&
              folderPath.startsWith(patternPath + "/")
            );
          }
          return false;
        });
      };

      // Helper function to get all files under a folder path
      const getFilesUnderPath = (folderPath) => {
        return selectedFiles.filter(
          (file) => file.path && file.path.startsWith(folderPath + "/")
        );
      };

      // Helper function to check if all files in a folder have the same extension
      const getCommonExtension = (files) => {
        const extensions = [
          ...new Set(
            files
              .map((file) => file.fileExtension?.toLowerCase())
              .filter(Boolean)
          ),
        ];
        return extensions.length === 1 ? extensions[0] : null;
      };

      // First, handle selected folders (highest priority for optimization)
      // Sort folders by path length (shorter paths first) to process parent folders before children
      const sortedFolders = selectedFolders.sort((a, b) => {
        const aPathLength = (a.path || "").split("/").length;
        const bPathLength = (b.path || "").split("/").length;
        return aPathLength - bPathLength;
      });

      sortedFolders.forEach((folder) => {
        // Skip if this folder is already covered by a previous pattern
        if (isFolderPatternCovered(folder.path || "", patterns)) {
          return;
        }

        const filesInFolder = getFilesUnderPath(folder.path || "");

        if (filesInFolder.length > 0) {
          // Check if all files in this folder have the same extension
          const commonExtension = getCommonExtension(filesInFolder);

          if (commonExtension) {
            // Create a wildcard pattern for the folder
            const pattern = folder.path
              ? `${folder.path}/*.${commonExtension}`
              : `*.${commonExtension}`;
            patterns.push({
              pattern: pattern,
              type: "wildcard",
              folderPath: folder.path,
              extension: commonExtension,
              fileCount: filesInFolder.length,
              description: `All ${commonExtension.toUpperCase()} files in ${
                folder.name
              }`,
            });
          } else {
            // Mixed extensions - use recursive folder pattern
            patterns.push({
              pattern: folder.path ? `${folder.path}/**/*` : `**/*`,
              type: "folder_recursive",
              folderPath: folder.path,
              extension: null,
              fileCount: filesInFolder.length,
              description: `All files in folder: ${folder.name}`,
            });
          }
        } else {
          // Empty folder - use recursive pattern
          patterns.push({
            pattern: folder.path ? `${folder.path}/**/*` : `**/*`,
            type: "folder_recursive",
            folderPath: folder.path,
            extension: null,
            fileCount: 0,
            description: `All files in folder: ${folder.name}`,
          });
        }
      });

      // Then handle individual files that aren't covered by folder patterns
      selectedFiles.forEach((file) => {
        if (!isPathCovered(file.path, patterns)) {
          // Check if there are other files in the same folder with the same extension
          const parentPath = file.path
            ? file.path.substring(0, file.path.lastIndexOf("/"))
            : "";
          const filesInSameFolder = selectedFiles.filter((f) => {
            const fParentPath = f.path
              ? f.path.substring(0, f.path.lastIndexOf("/"))
              : "";
            return (
              fParentPath === parentPath &&
              f.fileExtension === file.fileExtension
            );
          });

          if (filesInSameFolder.length > 1) {
            // Multiple files with same extension in same folder - create wildcard pattern
            const pattern = parentPath
              ? `${parentPath}/*.${file.fileExtension}`
              : `*.${file.fileExtension}`;

            // Check if this pattern is already added
            const existingPattern = patterns.find(
              (p) =>
                p.type === "wildcard" &&
                p.folderPath === parentPath &&
                p.extension === file.fileExtension
            );

            if (!existingPattern) {
              patterns.push({
                pattern: pattern,
                type: "wildcard",
                folderPath: parentPath,
                extension: file.fileExtension?.toLowerCase(),
                fileCount: filesInSameFolder.length,
                description: `All ${file.fileExtension?.toUpperCase()} files in ${
                  parentPath || "root"
                }`,
              });
            }
          } else {
            // Single file - create specific pattern
            patterns.push({
              pattern: file.path || file.name,
              type: "specific",
              folderPath: parentPath,
              extension: file.fileExtension?.toLowerCase(),
              fileCount: 1,
              description: `Specific file: ${file.name}`,
            });
          }
        }
      });

      // Remove duplicate patterns and sort by efficiency (folder_recursive first, then wildcard, then specific)
      const uniquePatterns = patterns.filter(
        (pattern, index, self) =>
          index === self.findIndex((p) => p.pattern === pattern.pattern)
      );

      return uniquePatterns.sort((a, b) => {
        const typeOrder = { folder_recursive: 0, wildcard: 1, specific: 2 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
    };

    // Generate path patterns
    const pathPatterns = generatePathPatterns();
    console.log("Generated path patterns:", pathPatterns);

    // Prepare the payload with selected items information
    const dataConnectionPayload = {
      selectedItems: selectedItems,
      selectedFiles: selectedItems.filter((item) => item.type === "file"),
      selectedFolders: getTopLevelSelectedFolders(),
      totalSelectedCount: selectedItems.filter((item) => item.type === "file")
        .length,
      fileCount: selectedItems.filter((item) => item.type === "file").length,
      folderCount: getTopLevelSelectedFolders().length,
      rootFolder: googleDriveDataConnectionDetails?.rootFolder,
      fileStructure: googleDriveDataConnectionDetails?.fileStructure,
      dataConnectionID: dataConnectionID,
      dataConnectionName: dataConnectionName,
      timestamp: new Date().toISOString(),
      pathPatterns: pathPatterns, // Add the generated patterns
      selectionSummary: {
        totalPatterns: pathPatterns.length,
        wildcardPatterns: pathPatterns.filter((p) => p.type === "wildcard")
          .length,
        specificPatterns: pathPatterns.filter((p) => p.type === "specific")
          .length,
        folderPatterns: pathPatterns.filter(
          (p) => p.type === "folder_recursive"
        ).length,
        extensions: [
          ...new Set(pathPatterns.map((p) => p.extension).filter(Boolean)),
        ],
        estimatedFileCount: pathPatterns.reduce(
          (sum, p) => sum + (p.fileCount || 0),
          0
        ),
      },
    };

    setGoogleDriveDataConnectionPayload(dataConnectionPayload);
    console.log("Google Drive Data Connection Payload:", dataConnectionPayload);

    await loadGoogleDriveSampleDataDetails(
      dataConnectionID,
      dataConnectionPayload,
      userInfo.userID
    );
    handleOpenGoogleDriveDataConnectionData();

    await loadGoogleDriveConnectionDataDetails(
      dataConnectionID,
      userInfo.userID
    );
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    console.log("Selected file:", file);
  };

  const handleSelectionChange = (newSelectedItems) => {
    // Remove folders that have no selected children
    const cleanedSelectedItems = removeEmptyFolders(newSelectedItems);
    setSelectedItems(cleanedSelectedItems);
    console.log("Selected items:", cleanedSelectedItems);
  };

  // Function to remove folders that have no selected children
  const removeEmptyFolders = (items) => {
    return items.filter((item) => {
      if (item.type !== "folder") {
        return true; // Keep all files
      }

      // For folders, check if they have any selected children
      const hasSelectedChildren = items.some(
        (child) => child.path && child.path.startsWith(item.path + "/")
      );

      return hasSelectedChildren; // Only keep folders with selected children
    });
  };

  const handleRemoveItem = (itemId) => {
    const itemToRemove = selectedItems.find((item) => item.id === itemId);

    if (itemToRemove && itemToRemove.type === "folder") {
      // If it's a folder, remove the folder and all its children
      const itemsToRemove = selectedItems.filter((item) => {
        // Remove the folder itself
        if (item.id === itemId) return true;

        // Remove all children (files and subfolders) that are under this folder
        if (item.path && itemToRemove.path) {
          return item.path.startsWith(itemToRemove.path + "/");
        }

        return false;
      });

      setSelectedItems(
        selectedItems.filter((item) => !itemsToRemove.includes(item))
      );
    } else {
      // If it's a file, just remove the file
      setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    }
  };

  const handleClearAll = () => {
    setSelectedItems([]);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => {
    if (
      !googleDriveDataConnectionDetails ||
      !googleDriveDataConnectionDetails.fileStructure
    ) {
      return (
        <Stack
          direction={"row"}
          justifyContent={"center"}
          sx={{
            border: `1px solid ${GRAY[200]}`,
            borderRadius: "8px",
            padding: "16px 24px 16px 24px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <CircularProgress size={25} sx={{ color: "#0C66E4" }} />
        </Stack>
      );
    }

    return (
      <Box>
        {/* Summary Section */}
        {googleDriveDataConnectionDetails.summary && (
          <FileSummary summary={googleDriveDataConnectionDetails.summary} />
        )}

        {/* Root Folder Info */}
        {googleDriveDataConnectionDetails.rootFolder && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: BRAND[50],
              borderRadius: "8px",
              border: `1px solid ${BRAND[200]}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontFamily: "Inter",
                fontSize: "14px",
                lineHeight: "20px",
                color: BRAND[700],
              }}
            >
              Root Folder: {googleDriveDataConnectionDetails.rootFolder.name}
            </Typography>
          </Box>
        )}

        {/* File Structure */}
        <Box
          sx={{
            border: `1px solid ${GRAY[200]}`,
            borderRadius: "8px",
            maxHeight: isFullscreen ? "calc(100vh - 500px)" : "400px",
            overflow: "auto",
            bgcolor: "#FFFFFF",
          }}
        >
          <List dense>
            {googleDriveDataConnectionDetails.fileStructure.children?.map(
              (item, index) => (
                <FileStructureItem
                  key={`${item.file.id}-${index}`}
                  item={item}
                  onFileSelect={handleFileSelect}
                  selectedItems={selectedItems}
                  onSelectionChange={handleSelectionChange}
                  currentPath={""} // Root path is empty
                />
              )
            )}
          </List>
        </Box>

        {/* Selected Items List */}
        <SelectedItemsList
          selectedItems={selectedItems}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
          fileStructure={googleDriveDataConnectionDetails.fileStructure}
        />

        {/* Selected File Info (for backward compatibility) */}
        {selectedFile && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: SUCCESS[50],
              borderRadius: "8px",
              border: `1px solid ${SUCCESS[200]}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontFamily: "Inter",
                fontSize: "14px",
                lineHeight: "20px",
                color: SUCCESS[700],
              }}
            >
              Selected File: {selectedFile.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                lineHeight: "18px",
                color: GRAY[600],
              }}
            >
              Path: {selectedFile.path} | Size:{" "}
              {selectedFile.size
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : "N/A"}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth={isFullscreen ? false : "md"}
        fullWidth={!isFullscreen}
        fullScreen={isFullscreen}
      >
        <DialogTitle
          sx={{
            m: 0,
            padding: "20px 26px 19px 26px",
            borderBottom: `1px solid ${GRAY[200]}`,
          }}
          id="customized-dialog-title"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: "28px",
                color: GRAY[900],
                textAlign: "left",
              }}
            >
              {dataConnectionName}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    color: GRAY[500],
                    padding: "8px",
                    "&:hover": {
                      backgroundColor: GRAY[100],
                    },
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  color: GRAY[500],
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: GRAY[100],
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>{renderContent()}</DialogContent>
        <DialogActions>
          <CustomButton onClick={handleClose} title={"Cancel"} outlined />
          <CustomButton
            onClick={handleConfirm}
            title={"Confirm"}
            disabled={code === ""}
            loadable
          />
        </DialogActions>
      </BootstrapDialog>
      {googleDriveDataConnectionDataOpen && (
        <GoogleDriveDataConnectionData
          open={googleDriveDataConnectionDataOpen}
          handleClose={handleCloseGoogleDriveDataConnectionData}
          dataConnectionName={dataConnectionName}
          googleDriveDataConnectionPayload={googleDriveDataConnectionPayload}
          dataConnectionID={dataConnectionID}
          sampleDataFetchFailed={googleDriveSampleDataFetchFailed}
        />
      )}
    </Box>
  );
}
