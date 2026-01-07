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

const UploadEnrichmentsGuide = ({
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
        <Typography variant="h6">Upload Enrichments Guide</Typography>
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
                    • End date {">"} Start date
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#475467",
                    }}
                  >
                    • Valid Type: {types.join(", ")}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#475467",
                    }}
                  >
                    • Percentage: numeric
                  </Typography>
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
                    // Create CSV content
                    const csvContent = [
                      columns.join(","),
                      ...types.map((type) => {
                        const dimension = Object.keys(dimensionFilterData)[1];
                        const value = dimensionFilterData[dimension][0];
                        return [
                          dimension,
                          value,
                          " 2024-01-01", // Add space to prevent Excel auto-formatting
                          " 2024-12-31", // Add space to prevent Excel auto-formatting
                          type,
                          type === "uplift" ? "10" : "",
                        ].join(",");
                      }),
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
                    {types.map((type, index) => {
                      const dimension = Object.keys(dimensionFilterData)[1];
                      const value = dimensionFilterData[dimension][0];
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "12px",
                                lineHeight: "16px",
                                color: "#475467",
                              }}
                            >
                              {dimension}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "12px",
                                lineHeight: "16px",
                                color: "#475467",
                              }}
                            >
                              {value}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "12px",
                                lineHeight: "16px",
                                color: "#475467",
                              }}
                            >
                              2024-01-01
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "12px",
                                lineHeight: "16px",
                                color: "#475467",
                              }}
                            >
                              2024-12-31
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "12px",
                                lineHeight: "16px",
                                color: "#475467",
                              }}
                            >
                              {type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "12px",
                                lineHeight: "16px",
                                color: "#475467",
                              }}
                            >
                              {type === "uplift" ? "10" : ""}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

export default UploadEnrichmentsGuide;
