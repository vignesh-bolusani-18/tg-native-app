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
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format, parseISO } from "date-fns";
import CustomScrollbar from "./CustomScrollbar";

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

const AdjustmentDetailsDialog = ({ open, handleClose, adjustments }) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="enrichment-details-dialog"
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: { xs: 0, md: 2 } }}>
        <Typography variant="h6">Adjustment Details</Typography>
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
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              border: "none",
              maxHeight: "400px",
              overflowX: "auto", // Enable horizontal scrolling
              width: "100%",
            }}
          >
            <Table stickyHeader sx={{ minWidth: "max-content" }}>
              <TableHead>
                <TableRow>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Sr.
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Dimension
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Value
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Type
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Start Date
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    End Date
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Cut History Till
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Percentage
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    # Value
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Time Steps
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Future / History
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adjustments.map((adjustment, index) => {
                  return (
                    <TableRow
                      key={adjustment.id || index}
                      sx={{
                        backgroundColor: "#FFFFFF",
                        "&:hover": {
                          backgroundColor: "#F9FAFB",
                        },
                        position: "relative",
                        opacity: 1,
                      }}
                    >
                      <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
                        {index + 1}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: "inherit",
                              /* maxWidth: "calc(100% - 24px)", */
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {adjustment.dimension === "None"
                              ? "All"
                              : adjustment.dimension === "ts_id"
                              ? "Forecast_Granularity"
                              : adjustment.dimension}
                          </Typography>
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: "inherit",
                              /*  maxWidth: "calc(100% - 24px)", */
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {adjustment.value === "None"
                              ? "All"
                              : adjustment.value}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      {/*  //Type */}
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: "inherit",
                              /*   maxWidth: "calc(100% - 24px)", */
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {adjustment.adjustment_type}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      {/*  //Start Date */}
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: "inherit",
                              /*   maxWidth     : "calc(100% - 24px)", */
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {adjustment.adjustment_type !== "cut_history"
                              ? formatKey(formatDate(adjustment.date_range[0]))
                              : "-"}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      {/*  //End Date */}
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: "inherit",
                              /*  maxWidth: "calc(100% - 24px)", */
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {adjustment.adjustment_type !== "cut_history"
                              ? formatKey(formatDate(adjustment.date_range[1]))
                              : "-"}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      {/* //Cut History Till */}
                      <StyledTableCell>
                        {adjustment.adjustment_type === "cut_history" ? (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                color: "inherit",
                                /* maxWidth: "calc(100% - 24px)", */
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatKey(formatDate(adjustment.date_range[1]))}
                            </Typography>
                          </Box>
                        ) : (
                          "-"
                        )}
                      </StyledTableCell>
                      {/* // Percentage */}
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {adjustment.adjustment_value !== null &&
                          adjustment.adjustment_value !== "" &&
                          ["uplift", "YoY", "stockout_correction"].includes(
                            adjustment.adjustment_type
                          ) ? (
                            <Typography
                              sx={{
                                color: "inherit",
                                // maxWidth : "calc(100% - 24px)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.adjustment_value}
                              {"%"}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </Box>
                      </StyledTableCell>
                      {/*  // # Value */}
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {adjustment.adjustment_value !== null &&
                          adjustment.adjustment_value !== "" &&
                          ["replace_value", "uplift_by_value"].includes(
                            adjustment.adjustment_type
                          ) ? (
                            <Typography
                              sx={{
                                color: "inherit",
                                // maxWidth: "calc(100% - 24px)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.adjustment_value}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </Box>
                      </StyledTableCell>
                      {/*  // # Time Steps */}
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {adjustment.time_steps !== null &&
                          adjustment.time_steps !== "" &&
                          adjustment.adjustment_type === "YoY" ? (
                            <Typography
                              sx={{
                                color: "inherit",
                                // maxWidth: "calc(100% - 24px)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.time_steps}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </Box>
                      </StyledTableCell>
                      {/* // # Future/History */}
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {adjustment.future_history !== null &&
                          adjustment.future_history !== "" &&
                          adjustment.adjustment_type === "YoY" ? (
                            <Typography
                              sx={{
                                color: "inherit",
                                // maxWidth: "calc(100% - 24px)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.future_history}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </Box>
                      </StyledTableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomScrollbar>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default AdjustmentDetailsDialog;
