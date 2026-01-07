import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import {
  Download as DownloadIcon,
  KeyboardDoubleArrowDown,
  Code as CodeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Editor from "@monaco-editor/react";
import { STYLES } from "../../constants";
import { downloadParquetFileUsingPreSignedURL } from "../../../../redux/actions/dashboardActions";
import useAuth from "../../../../hooks/useAuth";

const normalizeData = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  // If it's a single object, wrap in array
  if (typeof data === "object") return [data];
  return [];
};

// Safely stringify complex values (avoids crashing on circular structures)
const safeStringify = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("AIMessageDataTable: Failed to stringify value", error);
    return "[Object]";
  }
};

const MAX_ROWS = 50;
const PAGE_SIZE = 5;

const convertToCsv = (rows, columns) => {
  if (!rows.length || !columns.length) return "";

  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const str =
      typeof value === "object" ? safeStringify(value) : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escape).join(",");
  const body = rows
    .map((row) => columns.map((col) => escape(row[col])).join(","))
    .join("\n");

  return `${header}\n${body}`;
};

const buildPageItems = (current, total) => {
  const items = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
    return items;
  }

  if (current <= 3) {
    items.push(1, 2, 3, 4, 5, "...", total);
    return items;
  }

  if (current >= total - 2) {
    items.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    return items;
  }

  items.push(1, "...", current - 1, current, current + 1, "...", total);
  return items;
};

// Helper function to convert filePath to fileName (similar to parseDatasetPath in TanStackCustomTable)
const parseDatasetPath = (datasetPath) => {
  if (typeof datasetPath !== "string") return "";
  return datasetPath
    .split(".csv")[0] // remove .csv extension
    .split("/") // split by slash
    .join("_"); // join with underscore
};

const AIMessageDataTable = ({ data, title, message }) => {
  const rows = normalizeData(data);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const { userInfo, currentCompany } = useAuth();

  if (!rows.length) return null;

  // Derive columns from first row
  const columns = Object.keys(rows[0] || {});

  // Limit to top MAX_ROWS, then paginate PAGE_SIZE rows per page
  const limitedRows = rows.slice(0, MAX_ROWS);
  const totalPages = Math.max(1, Math.ceil(limitedRows.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const previewRows = limitedRows.slice(startIndex, startIndex + PAGE_SIZE);

  // Check if we should use S3 download or local CSV download
  const hasS3Data = message?.hasS3Data === true;
  const dataPath = message?.dataPath;
  const dataTitle = message?.dataTitle || title;
  const dataTotalRows = message?.dataTotalRows;

  // Check if message has code
  const hasCode = message?.code && typeof message.code === "string";
  const codeContent = message?.code || "";

  const handleDownload = async () => {
    // If hasS3Data is true, use S3 download similar to TanStackCustomTable
    if (hasS3Data && dataPath) {
      setLoading(true);
      try {
        const fileName = parseDatasetPath(dataPath);
        const tokenPayloadForParquet = {
          filePath: dataPath,
          fileName: fileName,
          companyName: currentCompany?.companyName,
          filterData: null,
          paginationData: null,
          sortingData: null,
        };

        await downloadParquetFileUsingPreSignedURL(
          tokenPayloadForParquet,
          dataTitle || title || "data",
          userInfo?.userID
        );

        console.log("File download initiated:", tokenPayloadForParquet);
      } catch (error) {
        console.error("Error during file download:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback to local CSV download if no S3 data
      try {
        const csv = convertToCsv(rows, columns);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${title || "data"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download CSV", error);
      }
    }
  };

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: { xs: 1, sm: 1.25 },
          gap: 1,
        }}
      >
        {title && (
          <Typography
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              fontWeight: 600,
              color: "#111827",
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            {title}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
          {hasCode && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CodeIcon />}
              onClick={() => setCodeDialogOpen(true)}
              sx={{
                color: "#374151",
                borderColor: "#d1d5db",
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "none",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Code
            </Button>
          )}
          {hasS3Data && (
            <Button
              variant="outlined"
              size="small"
              startIcon={
                loading ? (
                  <KeyboardDoubleArrowDown
                    sx={{
                      animation: "arrowMove 1.5s linear infinite",
                      "@keyframes arrowMove": {
                        "0%": { transform: "translateY(-50%)" },
                        "100%": { transform: "translateY(50%)" },
                      },
                    }}
                  />
                ) : (
                  <DownloadIcon />
                )
              }
              onClick={handleDownload}
              sx={{
                color: "#374151",
                borderColor: "#d1d5db",
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "none",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Download
            </Button>
          )}
        </Box>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: { xs: "6px", sm: "8px" },
          boxShadow: "none",
          border: "1px solid #e5e7eb",
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            borderCollapse: "collapse",
            "& .MuiTableRow-root": {
              backgroundColor: "#ffffff",
            },
            "& .MuiTableCell-root": {
              fontFamily: STYLES.FONTS.PRIMARY,
              fontSize: { xs: "0.675rem", sm: "0.7rem" },
              backgroundColor: "#ffffff",
              borderRight: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
              "&:last-of-type": {
                borderRight: "none",
              },
            },
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {typeof row[col] === "object"
                      ? safeStringify(row[col])
                      : row[col]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {limitedRows.length > PAGE_SIZE && (
        <Box
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
              color: STYLES.COLORS.TEXT_SECONDARY,
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            Showing rows {limitedRows.length ? startIndex + 1 : 0}–
            {Math.min(startIndex + PAGE_SIZE, limitedRows.length)} of{" "}
            {Math.min(rows.length, MAX_ROWS)}
            {(() => {
              // Use dataTotalRows if available, otherwise fall back to rows.length
              const totalRows =
                dataTotalRows != null ? dataTotalRows : rows.length;
              if (totalRows > MAX_ROWS) {
                return ` (Total rows: ${totalRows})`;
              }
              return "";
            })()}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              sx={{
                minWidth: 32,
                textTransform: "none",
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                px: { xs: 0.75, sm: 1 },
                py: { xs: 0.25, sm: 0.35 },
                borderColor: "#d1d5db",
                color: STYLES.COLORS.TEXT_PRIMARY,
                "&.Mui-disabled": {
                  borderColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
            >
              {"‹"}
            </Button>
            {buildPageItems(page, totalPages).map((item, index) =>
              item === "..." ? (
                <Box
                  key={`ellipsis-${index}`}
                  sx={{
                    px: 0.75,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    color: STYLES.COLORS.TEXT_SECONDARY,
                    fontFamily: STYLES.FONTS.PRIMARY,
                  }}
                >
                  ...
                </Box>
              ) : (
                <Button
                  key={`page-${item}`}
                  size="small"
                  variant={item === page ? "contained" : "outlined"}
                  onClick={() => setPage(item)}
                  sx={{
                    minWidth: 32,
                    textTransform: "none",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    px: { xs: 0.75, sm: 1 },
                    py: { xs: 0.25, sm: 0.35 },
                    borderColor: "#d1d5db",
                    color:
                      item === page ? "#ffffff" : STYLES.COLORS.TEXT_PRIMARY,
                    backgroundColor: item === page ? "#111827" : "#ffffff",
                    "&:hover": {
                      backgroundColor: item === page ? "#030712" : "#f9fafb",
                    },
                  }}
                >
                  {item}
                </Button>
              )
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              sx={{
                minWidth: 32,
                textTransform: "none",
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                px: { xs: 0.75, sm: 1 },
                py: { xs: 0.25, sm: 0.35 },
                borderColor: "#d1d5db",
                color: STYLES.COLORS.TEXT_PRIMARY,
                "&.Mui-disabled": {
                  borderColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
            >
              {"›"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Code Dialog */}
      <Dialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            minHeight: "500px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#111827",
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            {message?.codeTitle || "Code"}
          </Typography>
          <IconButton
            onClick={() => setCodeDialogOpen(false)}
            size="small"
            sx={{
              color: "#6B7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            backgroundColor: "#f9fafb",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "600px",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              "& .monaco-editor": {
                backgroundColor: "#f9fafb !important",
              },
              "& .monaco-editor .monaco-editor-background": {
                backgroundColor: "#f9fafb !important",
              },
              "& .monaco-editor .margin": {
                backgroundColor: "#f9fafb !important",
              },
            }}
          >
            <Editor
              height="100%"
              language="python"
              value={codeContent}
              theme="vs"
              beforeMount={(monaco) => {
                monaco.editor.defineTheme("custom-light", {
                  base: "vs",
                  inherit: true,
                  rules: [],
                  colors: {
                    "editor.background": "#f9fafb",
                  },
                });
              }}
              onMount={(editor, monaco) => {
                monaco.editor.setTheme("custom-light");
              }}
              options={{
                readOnly: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: "off",
                automaticLayout: true,
                padding: {
                  top: 8,
                  bottom: 8,
                },
                scrollbar: {
                  vertical: "auto",
                  horizontal: "auto",
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                },
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AIMessageDataTable;
