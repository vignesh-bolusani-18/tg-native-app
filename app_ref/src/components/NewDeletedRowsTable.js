import React, { useMemo, useState, useCallback, useRef } from "react";
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
  IconButton,
  Stack,
} from "@mui/material";
import { createColumnHelper } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

const NewDeletedRowsTable = ({
  data,
  title,
  type = "new", // "new" or "deleted"
  fileName,
}) => {
  const columnHelper = createColumnHelper();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Column resizing state
  const [columnResizing, setColumnResizing] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);

  // Helper function to format column keys
  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to check if value is float
  const isFloat = (str) => {
    return str !== "" && !isNaN(str) && str.toString().indexOf(".") !== -1;
  };

  // Transform data for TanStack Table
  const transformedData = useMemo(() => {
    if (!data || !data[fileName] || data[fileName].length === 0) {
      return [];
    }

    return data[fileName].map((row, index) => {
      const transformedRow = {};

      Object.keys(row.rowData).forEach((key) => {
        const value = row.rowData[key];
        if (value === "" || value === null) {
          transformedRow[key] = "None";
        } else if (value === " ") {
          transformedRow[key] = "";
        } else if (!isNaN(value)) {
          if (isFloat(value)) {
            transformedRow[key] = parseFloat(value).toFixed(2);
          } else {
            transformedRow[key] = value;
          }
        } else {
          transformedRow[key] = value;
        }
      });

      return {
        id: index,
        ...transformedRow,
      };
    });
  }, [data, fileName]);

  // Pagination calculations
  const totalRows = transformedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = transformedData.slice(startIndex, endIndex);

  // Create columns dynamically
  const columns = useMemo(() => {
    if (!data || !data[fileName] || data[fileName].length === 0) {
      return [];
    }

    const firstRow = data[fileName][0];
    if (!firstRow || !firstRow.rowData) {
      return [];
    }

    return Object.keys(firstRow.rowData).map((key) =>
      columnHelper.accessor(key, {
        id: key,
        header: formatKey(key),
        cell: (info) => {
          const value = info.getValue();
          const isNumeric = !isNaN(value) && value !== "" && value !== "None";

          return (
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                lineHeight: "14px",
                textAlign: isNumeric ? "right" : "left",
                padding: "8px 12px",
                color: type === "new" ? "#027A48" : "#B42318",
                backgroundColor: "transparent",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: "150px",
                maxWidth: "300px",
              }}
            >
              {value}
            </Typography>
          );
        },
      })
    );
  }, [data, fileName, type]);

  // Column virtualization setup (after columns are defined)
  const parentRef = useRef();
  const columnVirtualizer = useVirtualizer(
    {
      horizontal: true,
      count: columns.length,
      getScrollElement: () => parentRef.current,
      estimateSize: (index) => {
        const column = columns[index];
        return columnResizing[column.id] || 150; // Use resized width or default
      },
      overscan: 2,
    },
    [columnResizing]
  ); // Add dependency to recalculate when column widths change

  // Get virtual columns
  const virtualColumns = columnVirtualizer.getVirtualItems();
  const virtualPaddingLeft = virtualColumns[0]?.start || 0;
  const virtualPaddingRight =
    virtualColumns[virtualColumns.length - 1]?.end <
    columnVirtualizer.getTotalSize()
      ? columnVirtualizer.getTotalSize() -
        virtualColumns[virtualColumns.length - 1]?.end
      : 0;

  // Pagination handlers
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Column resize handlers
  const handleColumnResizeStart = useCallback(
    (headerId, event) => {
      setResizingColumn(headerId);
      const startX = event.clientX;
      const startWidth = columnResizing[headerId] || 150; // Default column width

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(100, Math.min(500, startWidth + deltaX)); // Min 100px, Max 500px

        setColumnResizing((prev) => ({
          ...prev,
          [headerId]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        setResizingColumn(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnResizing]
  );

  if (!data || !data[fileName] || data[fileName].length === 0) {
    return null;
  }

  const titleColor = type === "new" ? "#027A48" : "#D92D20";
  const headerBgColor = type === "new" ? "#ECFDF3" : "#FEF3F2";
  const headerBorderColor = type === "new" ? "#D1FADF" : "#FECDCA";
  const headerTextColor = type === "new" ? "#027A48" : "#B42318";
  const rowBgColor1 = type === "new" ? "#ECFDF3" : "#FEF3F2";
  const rowBgColor2 = type === "new" ? "#F6FEF9" : "#FEF7F7";

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "18px",
          fontWeight: "600",
          color: titleColor,
          textAlign: "left",
          lineHeight: "28px",
          mb: 2,
        }}
      >
        {title} ({data[fileName]?.length || 0})
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${headerBorderColor}`,
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <TableContainer
          ref={parentRef}
          sx={{
            overflowX: "auto",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            position: "relative",
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#a8a8a8",
              },
            },
            scrollBehavior: "smooth",
            willChange: "scroll-position",
          }}
        >
          <Table size="small" sx={{ width: columnVirtualizer.getTotalSize() }}>
            <TableHead>
              <TableRow>
                {/* Virtual padding for left columns */}
                {virtualPaddingLeft > 0 && (
                  <TableCell
                    sx={{
                      width: virtualPaddingLeft,
                      minWidth: virtualPaddingLeft,
                      maxWidth: virtualPaddingLeft,
                      padding: 0,
                      border: "none",
                      backgroundColor: "transparent",
                    }}
                  />
                )}

                {/* Virtualized header columns */}
                {virtualColumns.map((vc) => {
                  const column = columns[vc.index];
                  if (!column) return null;

                  return (
                    <TableCell
                      key={column.id}
                      data-index={vc.index}
                      ref={columnVirtualizer.measureElement}
                      sx={{
                        backgroundColor: headerBgColor,
                        color: headerTextColor,
                        fontFamily: "Inter",
                        fontSize: "14px",
                        lineHeight: "14px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textTransform: "none",
                        padding: "12px 10px",
                        border: `1px solid ${headerBorderColor}`,
                        fontWeight: "600",
                        width: columnResizing[column.id] || vc.size,
                        minWidth: columnResizing[column.id] || vc.size,
                        maxWidth: columnResizing[column.id] || vc.size,
                        position: "relative",
                        ...(resizingColumn === column.id && {
                          backgroundColor: "#f8f9fa",
                          borderRight: "2px solid #1976d2",
                          boxShadow: "2px 0 4px rgba(25, 118, 210, 0.2)",
                        }),
                      }}
                    >
                      {column.header}

                      {/* Resize handle */}
                      <Box
                        sx={{
                          position: "absolute",
                          right: "-2px",
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          cursor: "col-resize",
                          backgroundColor: "transparent",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "1px",
                            height: "20px",
                            backgroundColor:
                              resizingColumn === column.id
                                ? "#e0e0e0"
                                : "#e0e0e0",
                            borderRadius: "0.5px",
                          },
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "3px",
                            height: "20px",
                            backgroundColor:
                              resizingColumn === column.id
                                ? "transparent"
                                : "transparent",
                            borderRadius: "1.5px",
                          },
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColumnResizeStart(column.id, e);
                        }}
                      />
                    </TableCell>
                  );
                })}

                {/* Virtual padding for right columns */}
                {virtualPaddingRight > 0 && (
                  <TableCell
                    sx={{
                      width: virtualPaddingRight,
                      minWidth: virtualPaddingRight,
                      maxWidth: virtualPaddingRight,
                      padding: 0,
                      border: "none",
                      backgroundColor: "transparent",
                    }}
                  />
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  sx={{
                    backgroundColor:
                      rowIndex % 2 === 0 ? rowBgColor1 : rowBgColor2,
                    "&:hover": {
                      backgroundColor: type === "new" ? "#E6F4EA" : "#FEE8E6",
                    },
                  }}
                >
                  {/* Virtual padding for left columns */}
                  {virtualPaddingLeft > 0 && (
                    <TableCell
                      sx={{
                        width: virtualPaddingLeft,
                        minWidth: virtualPaddingLeft,
                        maxWidth: virtualPaddingLeft,
                        padding: 0,
                        border: "none",
                        backgroundColor: "transparent",
                      }}
                    />
                  )}

                  {/* Virtualized body columns */}
                  {virtualColumns.map((vc) => {
                    const column = columns[vc.index];
                    if (!column) return null;

                    return (
                      <TableCell
                        key={column.id}
                        sx={{
                          padding: "2px 4px",
                          border: `1px solid ${headerBorderColor}`,
                          backgroundColor: "transparent",
                          width: columnResizing[column.id] || vc.size,
                          minWidth: columnResizing[column.id] || vc.size,
                          maxWidth: columnResizing[column.id] || vc.size,
                          textAlign: (() => {
                            const value = row[column.id];
                            const isNumeric =
                              !isNaN(value) && value !== "" && value !== "None";
                            return isNumeric ? "right" : "left";
                          })(),
                        }}
                      >
                        {column.cell({ getValue: () => row[column.id] })}
                      </TableCell>
                    );
                  })}

                  {/* Virtual padding for right columns */}
                  {virtualPaddingRight > 0 && (
                    <TableCell
                      sx={{
                        width: virtualPaddingRight,
                        minWidth: virtualPaddingRight,
                        maxWidth: virtualPaddingRight,
                        padding: 0,
                        border: "none",
                        backgroundColor: "transparent",
                      }}
                    />
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        {totalRows > 0 && (
          <Box
            sx={{
              padding: "16px",
              backgroundColor: "#FFFFFF",
              display: "flex",
              justifyContent: "flex-end",
              borderTop: `1px solid ${headerBorderColor}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  color: "#344054",
                }}
              >
                Rows per page:
              </Typography>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  padding: "4px 8px",
                  border: `1px solid ${headerBorderColor}`,
                  borderRadius: "4px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  color: "#344054",
                }}
              >
                {`${startIndex + 1}-${Math.min(
                  endIndex,
                  totalRows
                )} of ${totalRows}`}
              </Typography>
              <IconButton
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
                sx={{ color: "#344054" }}
              >
                ‹
              </IconButton>
              <IconButton
                onClick={() => handleChangePage(page + 1)}
                disabled={(page + 1) * rowsPerPage >= totalRows}
                sx={{ color: "#344054" }}
              >
                ›
              </IconButton>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default NewDeletedRowsTable;
