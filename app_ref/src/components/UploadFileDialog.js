import React, { useCallback, useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  PaginationItem,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ReactComponent as CloudUploadIcon } from "../assets/Icons/cloud-upload-dark.svg";
import CustomButton from "./CustomButton";
import { toast } from "react-toastify";
import { uploadCSVToS3, detectCSVChanges } from "../utils/s3Utils";
import DeleteIcon from "@mui/icons-material/Delete";
import PreviewTable from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/PreviewData";
import Papa from "papaparse";

import useConfig from "../hooks/useConfig";
import DiffViewer from "./DiffViewer";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

// Custom styled pagination item
const CustomPaginationItem = styled(PaginationItem, {
  shouldForwardProp: (prop) =>
    prop !== "isPrevOrNext" &&
    prop !== "isPrev" &&
    prop !== "isNext" &&
    prop !== "selected",
})(({ theme, isPrevOrNext, isPrev, isNext, selected }) => ({
  borderRadius: "0",
  border: "1px solid",
  borderColor: "#D0D5DD",
  margin: "0",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.mode === "light" ? "#F9FAFB" : "#2D3748",
  },
  "&:not(:first-of-type)": {
    borderLeft: "none",
  },
  "& .MuiTypography-root": {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: isPrevOrNext ? 600 : 500,
    lineHeight: "20px",
    textAlign: "left",
    color: isPrevOrNext ? "#1D2939" : "#344054",
    paddingLeft: isPrevOrNext ? "8px" : "0",
    paddingRight: isPrevOrNext ? "0" : "8px",
  },
  ...(!isPrevOrNext && {
    width: "40px",
  }),
  ...(isPrev && {
    borderBottomLeftRadius: "8px",
    borderTopLeftRadius: "8px",
  }),
  ...(isNext && {
    borderBottomRightRadius: "8px",
    borderTopRightRadius: "8px",
  }),
  ...(selected && {
    backgroundColor: "#F9FAFB",
  }),
}));

// New Rows Table Component (Greenish Theme)
const NewRowsTable = ({ newRows, onRowDiscard, onAllRowsDiscard }) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Check if all rows are approved (not discarded)
  const allApproved = newRows.every((row) => !row.discarded);
  const someApproved = newRows.some((row) => !row.discarded);
  const isIndeterminate = someApproved && !allApproved;

  const bodyStyle = {
    fontFamily: "Inter",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "18px",
    textAlign: "center",
    color: "#344054",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px",
    padding: "0px 16px",
    borderRight: "1px solid #D1FADF",
    borderBottom: "1px solid #D1FADF",
  };

  const headingStyle = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    textAlign: "center",
    color: "#027A48",
    backgroundColor: "#ECFDF3",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px",
    padding: "8px 16px",
    borderRight: "1px solid #D1FADF",
    borderBottom: "1px solid #D1FADF",
  };

  if (!newRows || newRows.length === 0) return null;

  // Get column headers from the first row's data
  const columnHeaders = Object.keys(newRows[0].rowData);

  // Paginate the rows
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedRows = newRows.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(newRows.length / rowsPerPage);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        sx={{
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "20px",
          color: "#027A48",
          mb: 2,
        }}
      >
        New Rows Detected ({newRows.length})
      </Typography>

      <TableContainer
        component={Box}
        sx={{
          border: "1px solid #D1FADF",
          borderRadius: "8px",
          maxHeight: "400px",
          overflowY: "auto",
          backgroundColor: "#F6FEF9",
        }}
      >
        <Table aria-label="new rows table" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headingStyle, width: "60px" }}>
                <Checkbox
                  checked={allApproved}
                  indeterminate={isIndeterminate}
                  onChange={(e) => onAllRowsDiscard(e.target.checked)}
                  size="small"
                  sx={{ color: "#027A48" }}
                />
              </TableCell>
              <TableCell sx={{ ...headingStyle, width: "100px" }}>
                Row ID
              </TableCell>
              {columnHeaders.map((header) => (
                <TableCell key={header} sx={headingStyle}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((newRow, index) => (
              <TableRow
                key={newRow.ts_id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#F6FEF9" : "#ECFDF3",
                }}
              >
                <TableCell sx={{ ...bodyStyle, textAlign: "center" }}>
                  <Checkbox
                    checked={!newRow.discarded}
                    onChange={(e) =>
                      onRowDiscard(newRow.ts_id, !e.target.checked)
                    }
                    size="small"
                    sx={{ color: "#027A48" }}
                  />
                </TableCell>
                <TableCell
                  sx={{ ...bodyStyle, color: "#027A48", fontWeight: 500 }}
                >
                  {newRow.ts_id}
                </TableCell>
                {columnHeaders.map((header) => (
                  <TableCell key={header} sx={bodyStyle}>
                    {newRow.rowData[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          renderItem={(item) => (
            <CustomPaginationItem
              {...item}
              isPrev={item.type === "previous"}
              isNext={item.type === "next"}
              isPrevOrNext={item.type === "previous" || item.type === "next"}
            />
          )}
          sx={{
            padding: "16px 0",
            justifyContent: "flex-end",
            display: "flex",
          }}
        />
      )}
    </Box>
  );
};



// Changed Rows Table Component (Yellowish Theme)
const ChangedRowsTable = ({ changes, onChangeDiscard }) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const bodyStyle = {
    fontFamily: "Inter",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "18px",
    textAlign: "center",
    color: "#B54708",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px",
    padding: "0px 16px",
    borderRight: "1px solid #FEDF89",
    borderBottom: "1px solid #FEDF89",
  };

  const headingStyle = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    textAlign: "center",
    color: "#B54708",
    backgroundColor: "#FFFAEB",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px",
    padding: "8px 16px",
    borderRight: "1px solid #FEDF89",
    borderBottom: "1px solid #FEDF89",
  };

  if (!changes || changes.length === 0) return null;

  // Paginate the rows
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedChanges = changes.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(changes.length / rowsPerPage);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        sx={{
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "20px",
          color: "#DC6803",
          mb: 2,
        }}
      >
        Modifications Detected ({changes.length})
      </Typography>

      <TableContainer
        component={Box}
        sx={{
          border: "1px solid #FEDF89",
          borderRadius: "8px",
          maxHeight: "400px",
          overflowY: "auto",
          backgroundColor: "#FEFDF0",
        }}
      >
        <Table aria-label="changed rows table" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headingStyle, width: "60px" }}>
                Approve
              </TableCell>
              <TableCell sx={{ ...headingStyle, width: "100px" }}>
                Row ID
              </TableCell>
              <TableCell sx={{ ...headingStyle, width: "120px" }}>
                Column
              </TableCell>
              <TableCell sx={{ ...headingStyle, width: "150px" }}>
                Original Value
              </TableCell>
              <TableCell sx={{ ...headingStyle, width: "150px" }}>
                New Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedChanges.map((change, index) => (
              <TableRow
                key={`${change.ts_id}-${change.columnName}`}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#FEFDF0" : "#FFFAEB",
                }}
              >
                <TableCell sx={{ ...bodyStyle, textAlign: "center" }}>
                  <Checkbox
                    checked={!change.discarded}
                    onChange={(e) =>
                      onChangeDiscard(
                        change.ts_id,
                        change.columnName,
                        !e.target.checked
                      )
                    }
                    size="small"
                    sx={{ color: "#DC6803" }}
                  />
                </TableCell>
                <TableCell
                  sx={{ ...bodyStyle, color: "#DC6803", fontWeight: 500 }}
                >
                  {change.ts_id}
                </TableCell>
                <TableCell sx={{ ...bodyStyle, fontWeight: 500 }}>
                  {change.columnName}
                </TableCell>
                <TableCell
                  sx={{
                    ...bodyStyle,
                    backgroundColor: "#FEF3F2",
                    color: "#B42318",
                    border: "1px solid #FECDCA",
                    borderRadius: "4px",
                  }}
                >
                  {change.originalValue}
                </TableCell>
                <TableCell
                  sx={{
                    ...bodyStyle,
                    backgroundColor: "#ECFDF3",
                    color: "#027A48",
                    border: "1px solid #ABEFC6",
                    borderRadius: "4px",
                  }}
                >
                  {change.newValue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          renderItem={(item) => (
            <CustomPaginationItem
              {...item}
              isPrev={item.type === "previous"}
              isNext={item.type === "next"}
              isPrevOrNext={item.type === "previous" || item.type === "next"}
            />
          )}
          sx={{
            padding: "16px 0",
            justifyContent: "flex-end",
            display: "flex",
          }}
        />
      )}
    </Box>
  );
};

const UploadFileDialog = ({
  open,
  handleClose,
  uploadPath,
  requiredColumns,
  fileName,
  getTimeStamp,
  setEditedCells,
  setEditHistory,
  editableColumns,
  editedCells,
  editHistory,
  rowDimension = null,
  isRowEditable = null,
  editableRowDimensionValues = [],
  onNewRowsApproved,
}) => {
  const { configState } = useConfig();
  const fileInputRef = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [editChanges, setEditChanges] = useState(null);
  const [currentHeaders, setCurrentHeaders] = useState(null);
  const [hasTypeConflict, setHasTypeConflict] = useState(false);
  const [newRows, setNewRows] = useState(null);

  // Revalidate when requiredColumns change
  useEffect(() => {
    if (currentHeaders) {
      validateColumns(currentHeaders);
    }
  }, [requiredColumns]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "text/csv") {
        parseCSV(file);
        setSelectedFile(file);
      } else {
        toast.error("Please select a CSV file");
        setSelectedFile(null);
        event.target.value = "";
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file && file.type === "text/csv") {
      parseCSV(file);
      setSelectedFile(file);
    } else {
      toast.error("Please select a CSV file");
      setSelectedFile(null);
    }
    setDragOver(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setIsUploaded(false);
    setEditChanges(null);
    setNewRows(null);
    setCurrentHeaders(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  function getPreviewData(data, limit = 10) {
    const headings = data[0];
    const result = {};

    headings.forEach((heading) => {
      result[heading] = [];
    });

    data.slice(1).forEach((row) => {
      if (
        row.length === headings.length &&
        row.every((value) => value !== "")
      ) {
        row.forEach((value, index) => {
          if (result[headings[index]].length < limit) {
            result[headings[index]].push(value);
          }
        });
      }
    });

    return result;
  }

  const validateColumns = (headers) => {
    if (headers.length !== requiredColumns.length) {
      toast.error(`File must have exactly ${requiredColumns.length} columns`);
      return false;
    }

    for (let i = 0; i < headers.length; i++) {
      let headerValue = headers[i];
      const requiredValue = requiredColumns[i];

      // Check if required column looks like a date

      if (headerValue !== requiredValue) {
        toast.error(
          `Column mismatch: Expected "${requiredValue}" at position ${
            i + 1
          }, but found "${headerValue}". Please ensure you're using the original CSV file without any modifications.`
        );
        return false;
      }
    }
    return true;
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      dynamicTyping: false,
      header: false,
      skipEmptyLines: true,
      encoding: "utf-8",
      transformHeader: (header) => {
        // Preserve the exact string representation
        return header.toString();
      },
      transform: (value) => value.toString(),
      complete: (result) => {
        const headers = result.data[0];
        setCurrentHeaders(headers); // Store headers for revalidation

        if (!validateColumns(headers)) {
          setSelectedFile(null);
          setPreviewData(null);
          return;
        }

        const previewData = {};
        headers.forEach((header) => {
          previewData[header] = [];
        });

        const limit = 10;
        console.log("result.data", result.data);
        result.data.slice(1).forEach((row) => {
          if (row.length === headers.length) {
            console.log("row", row);
            row.forEach((value, index) => {
              if (previewData[headers[index]].length < limit) {
                previewData[headers[index]].push(value);
              }
            });
          } else {
            console.log("row.length", row.length);
            console.log("headers.length", headers.length);
          }
        });

        setPreviewData(previewData);
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
        toast.error("Error parsing CSV file");
        setSelectedFile(null);
        setPreviewData(null);
      },
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // 1. First upload file to S3
      await uploadCSVToS3(uploadPath, selectedFile);

      // 2. Call API to get differences
      const response = await detectCSVChanges(
        fileName,
        uploadPath,
        editableColumns,
        configState.data.ts_id_columns,
        rowDimension,
        isRowEditable,
        editableRowDimensionValues
      );

      console.log("response", response);

      // Handle changes (existing logic)
      const changes = response.changes || [];
      const filteredChanges = changes.filter(
        (change) =>
          editableColumns.includes(change.columnName) &&
          (rowDimension === null || isRowEditable(change[rowDimension]))
      );

      // Handle new rows
      const newRowsData = response.newRows || [];

      setEditChanges(filteredChanges);
      setNewRows(newRowsData);
      setIsUploaded(true);

      // Show summary of changes
      toast.info(
        `Found ${filteredChanges.length} changes and ${newRowsData.length} new rows.`
      );
    } catch (error) {
      console.error("Upload/Compare error:", error);
      toast.error("Error processing file");
    } finally {
      setUploading(false);
    }
  };

  const handleChangeDiscard = (ts_id, columnName, discarded) => {
    setEditChanges((prevChanges) =>
      prevChanges.map((change) =>
        change.ts_id === ts_id && change.columnName === columnName
          ? { ...change, discarded }
          : change
      )
    );
  };

  const handleNewRowDiscard = (ts_id, discarded) => {
    setNewRows((prevRows) =>
      prevRows.map((row) => (row.ts_id === ts_id ? { ...row, discarded } : row))
    );
  };


  const handleAllNewRowDiscard = (selectAll) => {
    setNewRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        discarded: !selectAll, // if selectAll is true, mark as NOT discarded
      }))
    );
  };
 

  const handleApprove = () => {
    if (!editChanges && !newRows) return;

    // Filter out discarded changes
    const approvedChanges = editChanges
      ? editChanges.filter((change) => !change.discarded)
      : [];

    // Update edits in the same format as CustomTable
    const newEditedCells = approvedChanges.map((change) => {
      // Check if there's an existing edit for this cell
      const existingEdit = editedCells.find(
        (edit) =>
          edit.ts_id === change.ts_id &&
          edit.columnName === change.columnName &&
          (!rowDimension || edit.rowDimensionValue === change[rowDimension])
      );

      if (existingEdit) {
        // If edit exists, append the new value to edits array
        return {
          ...existingEdit,
          rowDimension: rowDimension,
          rowDimensionValue: rowDimension ? change[rowDimension] : null,
          edits: [...existingEdit.edits, change.newValue],
          finalValue: change.newValue, // Update final value to latest change
        };
      }

      // If no existing edit, create new edit entry
      return {
        row: change.rowIndex,
        col: change.columnName,
        columnName: change.columnName,
        edits: [change.originalValue, change.newValue],
        initialValue: change.originalValue,
        finalValue: change.newValue,
        ts_id: change.ts_id,
        rowDimension: rowDimension,
        rowDimensionValue: rowDimension ? change[rowDimension] : null,
        timestamp: getTimeStamp(change.columnName),
      };
    });

    console.log("newEditedCells", newEditedCells);
    // Merge existing edits with new edits
    setEditedCells((prevCells) => {
      const updatedCells = [...prevCells];

      newEditedCells.forEach((newEdit) => {
        const existingIndex = updatedCells.findIndex(
          (cell) =>
            cell.ts_id === newEdit.ts_id &&
            cell.columnName === newEdit.columnName &&
            (!rowDimension ||
              cell.rowDimensionValue === newEdit.rowDimensionValue)
        );

        if (existingIndex !== -1) {
          // Replace existing edit
          updatedCells[existingIndex] = newEdit;
        } else {
          // Add new edit
          updatedCells.push(newEdit);
        }
      });

      console.log("updatedCells", updatedCells);

      return updatedCells;
    });

    // Update edit history with new changes
    const newHistory = approvedChanges.map((change) => ({
      row: change.rowIndex,
      col: change.columnName,
      ts_id: change.ts_id,
    }));
    setEditHistory((prev) => [...prev, ...newHistory]);

    // Handle new rows approval
    const approvedNewRows = newRows
      ? newRows.filter((row) => !row.discarded)
      : [];
    console.log("approvedNewRows", approvedNewRows);
    if (approvedNewRows.length > 0 && onNewRowsApproved) {
      onNewRowsApproved(approvedNewRows);
    }

    // Handle deleted rows approval
    

    handleClose();
    toast.success(
      `${approvedChanges.length} changes and ${approvedNewRows.length} new rows approved.`
    );
  };

  const getColumnRequirements = () => {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "18px",
            color: "#475467",
            mb: 1,
          }}
        >
          Required columns (in order):
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
            gap: "4px",
            maxWidth: "100%",
          }}
        >
          {requiredColumns.map((column, index) => (
            <Typography
              key={index}
              sx={{
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#101828",
                backgroundColor: "#F2F4F7",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid #E0E4E8",
              }}
            >
              {column}
            </Typography>
          ))}
        </Stack>
      </Box>
    );
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          padding: "20px 26px 19px 26px",
          borderBottom: "1px solid #EAECF0",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            color: "#101828",
            textAlign: "left",
          }}
        >
          Upload File
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#667085",
            padding: "8px",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ padding: "24px 32px 48px 32px", gap: "24px" }}>
          {selectedFile && (
            <Box
              sx={{
                border: "1px solid #EAECF0",
                borderRadius: "8px",
                padding: "16px 24px 16px 24px",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                }}
              >
                <Stack direction="column">
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "20px",
                      color: "#101828",
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "20px",
                      color: "#10182870",
                    }}
                  >
                    {`${(selectedFile.size / 1024).toFixed(2)} KB`}
                  </Typography>
                </Stack>
                <IconButton
                  aria-label="remove"
                  onClick={handleRemoveFile}
                  sx={{
                    color: "#FF0000",
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
              <PreviewTable previewData={previewData} />

              {/* Show diffs below preview when changes are available */}
              {isUploaded && editChanges && editChanges.length > 0 && (
                <ChangedRowsTable
                  changes={editChanges}
                  onChangeDiscard={handleChangeDiscard}
                />
              )}

              {/* Show new rows when available */}
              {isUploaded && newRows && newRows.length > 0 && (
                <NewRowsTable
                  newRows={newRows}
                  onRowDiscard={handleNewRowDiscard}
                  onAllRowsDiscard={handleAllNewRowDiscard}
                />
              )}

              {/* Show deleted rows when available */}
              {/* {isUploaded && deletedRows && deletedRows.length > 0 && (
                <DeletedRowsTable
                  deletedRows={deletedRows}
                  onRowDiscard={handleDeletedRowDiscard}
                  onAllRowsDiscard={handleAllDeletedRowDiscard}
                />
              )} */}
            </Box>
          )}

          {!selectedFile && (
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: "1px solid #EAECF0",
                borderRadius: "8px",
                padding: "16px 24px 16px 24px",
                backgroundColor: dragOver ? "#F2F4F7" : "#FFFFFF",
              }}
            >
              <Stack spacing={0.5} alignItems="center" justifyContent="center">
                <IconButton onClick={handleUploadClick}>
                  <Box
                    sx={{
                      border: "6px solid #F9FAFB",
                      backgroundColor: "#F2F4F7",
                      borderRadius: "28px",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "40px",
                      width: "40px",
                    }}
                  >
                    <CloudUploadIcon />
                  </Box>
                  <VisuallyHiddenInput
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </IconButton>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "center",
                  }}
                >
                  <Box
                    component="span"
                    onClick={handleUploadClick}
                    sx={{
                      color: "#0C66E4",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Click to upload
                  </Box>
                  {" or drag and drop"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "18px",
                    color: "#475467",
                    textAlign: "center",
                  }}
                >
                  CSV files only
                </Typography>
                {getColumnRequirements()}
              </Stack>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px" }}>
        <CustomButton onClick={handleClose} title="Cancel" outlined />
        {!isUploaded ? (
          <CustomButton
            onClick={handleUpload}
            title={uploading ? "Scanning..." : "Scan"}
            disabled={!selectedFile || uploading}
            loading={uploading}
          />
        ) : (
          <CustomButton
            onClick={handleApprove}
            title="Approve Changes"
            disabled={
              ((!editChanges || editChanges.length === 0) &&
                (!newRows || newRows.length === 0) &&
              hasTypeConflict)
            }
          />
        )}
      </DialogActions>
    </BootstrapDialog>
  );
};

export default UploadFileDialog;
