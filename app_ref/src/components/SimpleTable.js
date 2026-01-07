import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  TablePagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { fetchCSVData } from "../utils/s3Utils";
import { format, parseISO } from "date-fns";

// Styled components with modern design
const SimpleTableCell = styled(TableCell)(() => ({
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: "13px",
  color: "#1F2937",
  borderBottom: "1px solid #F3F4F6",
  padding: "12px 16px",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
}));

const SimpleTableHeaderCell = styled(TableCell)(() => ({
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6B7280",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  borderBottom: "2px solid #E5E7EB",
  padding: "12px 16px",
  backgroundColor: "#F9FAFB",
}));

const SimpleTable = ({ title, filePath }) => {
  const [tableData, setTableData] = useState({});
  const [transformedData, setTransformedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = async () => {
    if (!filePath) {
      setError("No file path provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchCSVData({
        filePath: filePath,
        filterData: null,
        paginationData: null,
        sortingData: null,
      });
      
      setTableData(data);
      
      if (data && Object.keys(data).length > 0) {
        const transformed = transformData(data);
        setTransformedData(transformed);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const transformData = (data) => {
    if (Object.keys(data).length === 0) return [];
    
    const keys = Object.keys(data);
    const length = data[keys[0]]?.length || 0;
    const transformed = [];

    for (let i = 0; i < length; i++) {
      const row = {};
      keys.forEach(key => {
        let value = data[key][i];
        
        if (value === null || value === undefined || value === "") {
          row[key] = "";
        } else if (!isNaN(value) && value !== "" && value !== " ") {
          const numValue = parseFloat(value);
          row[key] = Number.isInteger(numValue) ? numValue.toString() : numValue.toFixed(2);
        } else {
          row[key] = value.toString();
        }
      });
      transformed.push(row);
    }

    return transformed;
  };

  const formatKey = (key) => {
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    const dateMatch = key.match(dateRegex);

    if (dateMatch) {
      const date = dateMatch[0];
      const formattedDate = format(parseISO(date), "MMM dd, yyyy");
      return key
        .replace(date, formattedDate)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = useMemo(() => {
    if (transformedData.length === 0) return [];
    return Object.keys(transformedData[0] || {});
  }, [transformedData]);

  const currentPageData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return transformedData.slice(startIndex, endIndex);
  }, [transformedData, page, rowsPerPage]);

  useEffect(() => {
    fetchData();
  }, [filePath]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ width: "100%" }}>
          <Skeleton variant="text" width="30%" height="40px" sx={{ mb: 2 }} />
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <Box key={rowIndex} sx={{ display: "flex", gap: 1, mb: 1 }}>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  width="100%"
                  height="40px"
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            padding: "16px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "8px",
          }}
        >
          <Typography sx={{ color: "#DC2626", fontSize: "14px", fontFamily: "Inter" }}>
            Error loading data: {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (transformedData.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            padding: "32px",
            textAlign: "center",
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
          }}
        >
          <Typography sx={{ color: "#6B7280", fontSize: "14px", fontFamily: "Inter" }}>
            No data available
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ }}>
      <TableContainer
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          overflow: "scroll",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <SimpleTableHeaderCell key={column}>
                  {formatKey(column)}
                </SimpleTableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  backgroundColor: "#ffffff",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                  },
                  borderBottom: rowIndex === currentPageData.length - 1 ? "none" : "1px solid #F3F4F6",
                }}
              >
                {columns.map((column) => {
                  const value = row[column];
                  const isNumeric = !isNaN(value) && value !== "";
                  
                  return (
                    <SimpleTableCell 
                      key={`${rowIndex}-${column}`}
                      sx={{
                        textAlign: isNumeric ? "right" : "left",
                        fontWeight: isNumeric ? "500" : "400",
                      }}
                    >
                      {value}
                    </SimpleTableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          px: 1,
        }}
      >
        <Typography sx={{ fontSize: "13px", color: "#6B7280", fontFamily: "Inter" }}>
          Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, transformedData.length)} of {transformedData.length} entries
        </Typography>
        <TablePagination
          component="div"
          count={transformedData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows:"
          sx={{
            border: "none",
            "& .MuiTablePagination-toolbar": {
              padding: "0",
              minHeight: "auto",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "13px",
              fontFamily: "Inter",
              color: "#6B7280",
              margin: 0,
            },
            "& .MuiTablePagination-select": {
              fontSize: "13px",
              fontFamily: "Inter",
            },
            "& .MuiTablePagination-actions": {
              marginLeft: "8px",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default SimpleTable;