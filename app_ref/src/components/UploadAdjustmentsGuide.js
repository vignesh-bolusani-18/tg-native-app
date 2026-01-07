import React from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CustomScrollbar from "./CustomScrollbar";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(0),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));
const exampleRows = [
  {
    Dimension: "all",
    Value: "all",
    "Start Date": "2024-10-01",
    "End Date": "2025-02-27",
    Type: "uplift",
    "Cut History Till": "",
    Percentage: "2",
    "# Value": "",
    "Time Steps": "",
    "Future/History": "",
  },
  {
    Dimension: "all",
    Value: "all",
    "Start Date": "",
    "End Date": "",
    Type: "cut_history",
    "Cut History Till": "2025-04-23",
    Percentage: "",
    "# Value": "",
    "Time Steps": "",
    "Future/History": "",
  },
  {
    Dimension: "all",
    Value: "all",
    "Start Date": "2025-04-01",
    "End Date": "2025-04-29",
    Type: "YoY",
    "Cut History Till": "",
    Percentage: "2",
    "# Value": "",
    "Time Steps": "1",
    "Future/History": "history",
  },
  {
    Dimension: "all",
    Value: "all",
    "Start Date": "2025-04-06",
    "End Date": "2025-04-24",
    Type: "stockout_correction",
    "Cut History Till": "",
    Percentage: "2",
    "# Value": "",
    "Time Steps": "",
    "Future/History": "",
  },
  {
    Dimension: "all",
    Value: "all",
    "Start Date": "2025-04-08",
    "End Date": "2025-04-23",
    Type: "replace_value",
    "Cut History Till": "",
    Percentage: "",
    "# Value": "0",
    "Time Steps": "",
    "Future/History": "",
  },
  {
    Dimension: "all",
    Value: "all",
    "Start Date": "2025-04-22",
    "End Date": "2025-04-30",
    Type: "uplift_by_value",
    "Cut History Till": "",
    Percentage: "",
    "# Value": "100",
    "Time Steps": "",
    "Future/History": "",
  },
];
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: "Inter",
  fontSize: "14px",
  padding: "12px 16px",
  borderBottom: "1px solid #EAECF0",
  color: "#101828",
  "&.header": {
    backgroundColor: "#F9FAFB",
    color: "#101828",
    fontWeight: 500,
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
}));

const UploadAdjustmentsGuide = ({
  open,
  handleClose,
  columns,
  dimensionFilterData,
  types,
}) => {
  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="enrichment-details-dialog"
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: { xs: 0, md: 2 } }}>
        <Typography variant="h6">Upload Adjustments Guide</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <CustomScrollbar verticalScroll={true} horizontalScroll={false}>
          <Box
            sx={{
              border: "1px solid #EAECF0",
              borderRadius: "8px",
              padding: "16px 24px 16px 24px",
              backgroundColor: "#FFFFFF",
            }}
          >
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
                mb: 2,
              }}
            >
              {columns.map((column, index) => (
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
            {/* 
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
                  Required columns by type:
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      uplift:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "Percentage"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      cut_history:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Type", "Cut History Till"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      YoY:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {[
                        "Dimension",
                        "Value",
                        "Start Date",
                        "End Date",
                        "Type",
                        "Time Steps",
                        "Future/History",
                      ].map((column, index) => (
                        <Typography
                          key={index}
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#027A48",
                            backgroundColor: "#ECFDF3",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            border: "1px solid #ABEFC6",
                          }}
                        >
                          {column}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      stockout_correction:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "Percentage"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      replace_value:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "# Value"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      uplift_by_value:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "# Value"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                </Stack> */}

            <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
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
                  Validation Rules:
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#475467",
                    }}
                  >
                    • Date Format: YYYY-MM-DD (e.g., 2024-01-31)
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#475467",
                    }}
                  >
                    • Note: If using Excel, be careful with dates. They may
                    auto-format.
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#475467",
                    }}
                  >
                    • End date {">"} Start date (except for cut_history type)
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#475467",
                    }}
                  >
                    • Type-specific requirements:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                      }}
                    >
                      - uplift: Requires Percentage (numeric)
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                      }}
                    >
                      - cut_history: Requires Cut History Till date only
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                      }}
                    >
                      - YoY: Requires Time Steps (numeric) and Future/History
                      ("history" or "future")
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                      }}
                    >
                      - stockout_correction: Requires Percentage (numeric)
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                      }}
                    >
                      - replace_value: Requires # Value (numeric)
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                      }}
                    >
                      - uplift_by_value: Requires # Value (numeric)
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/*  <Box sx={{ flex: 1 }}>
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
                      Special Cases:
                    </Typography>
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • "None" = "all"
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • ts_id → Forecast_Granularity
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • Cluster → cluster
                      </Typography>
                    </Stack>
                  </Box> */}
            </Stack>
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "18px",
                    color: "#475467",
                  }}
                >
                  Example Formats:
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    // Create CSV content with columns in the correct order
                    const csvContent = [
                      [
                        "Dimension",
                        "Value",
                        "Start Date",
                        "End Date",
                        "Type",
                        "Cut History Till",
                        "Percentage",
                        "# Value",
                        "Time Steps",
                        "Future/History",
                      ].join(","),
                      // Example for uplift
                      [
                        "all",
                        "all",
                        " 2024-10-01",
                        " 2025-02-27",
                        "uplift",
                        "",
                        "2",
                        "",
                        "",
                        "",
                      ].join(","),
                      // Example for cut_history
                      [
                        "all",
                        "all",
                        "",
                        "",
                        "cut_history",
                        " 2025-04-23",
                        "",
                        "",
                        "",
                        "",
                      ].join(","),
                      // Example for YoY
                      [
                        "all",
                        "all",
                        " 2025-04-01",
                        " 2025-04-29",
                        "YoY",
                        "",
                        "2",
                        "",
                        "1",
                        "history",
                      ].join(","),
                      // Example for stockout_correction
                      [
                        "all",
                        "all",
                        " 2025-04-06",
                        " 2025-04-24",
                        "stockout_correction",
                        "",
                        "2",
                        "",
                        "",
                        "",
                      ].join(","),
                      // Example for replace_value
                      [
                        "all",
                        "all",
                        " 2025-04-08",
                        " 2025-04-23",
                        "replace_value",
                        "",
                        "",
                        "0",
                        "",
                        "",
                      ].join(","),
                      // Example for uplift_by_value
                      [
                        "all",
                        "all",
                        " 2025-04-22",
                        " 2025-04-30",
                        "uplift_by_value",
                        "",
                        "",
                        "100",
                        "",
                        "",
                      ].join(","),
                    ].join("\n");

                    // Create and trigger download
                    const blob = new Blob([csvContent], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "example_format.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <FileDownloadOutlinedIcon
                    sx={{ fontSize: 16, color: "#475467" }}
                  />
                </IconButton>
              </Stack>
              <TableContainer
                component={Paper}
                sx={{ boxShadow: "none", border: "1px solid #EAECF0" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableCell key={index}>
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 600,
                              fontSize: "12px",
                              lineHeight: "16px",
                              color: "black",
                            }}
                          >
                            {column}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exampleRows.map((row, index) => (
                      <TableRow key={index}>
                        {columns.map((column, colIndex) => (
                          <TableCell key={colIndex}>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 400,
                                fontSize: "12px",
                                lineHeight: "16px",
                                color: "#667085",
                              }}
                            >
                              {row[column]}
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </CustomScrollbar>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default UploadAdjustmentsGuide;
