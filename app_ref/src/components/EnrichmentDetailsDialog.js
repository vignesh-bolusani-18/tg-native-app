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

const EnrichmentDetailsDialog = ({ open, handleClose, enrichments }) => {
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
      <DialogTitle sx={{ m: 0, p: {xs: 0, md: 2} }}>
        <Typography variant="h6">Enrichment Details</Typography>
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
              mt: 0, 
              boxShadow: "none", 
              border: "1px solid #EAECF0",
              maxHeight: "calc(100vh - 150px)",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell className="header">Sr. No.</StyledTableCell>
                  <StyledTableCell className="header">Dimension</StyledTableCell>
                  <StyledTableCell className="header">Value</StyledTableCell>
                  <StyledTableCell className="header">Start Date</StyledTableCell>
                  <StyledTableCell className="header">End Date</StyledTableCell>
                  <StyledTableCell className="header">Type</StyledTableCell>
                  <StyledTableCell className="header">Percentage</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrichments.map((enrichment, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: "#FFFFFF",
                      "&:hover": {
                        backgroundColor: "#F9FAFB",
                      },
                    }}
                  >
                    <StyledTableCell>{index + 1}</StyledTableCell>
                    <StyledTableCell>
                      {enrichment.dimension === "None"
                        ? "All"
                        : enrichment.dimension === "ts_id"
                        ? "Forecast_Granularity"
                        : enrichment.dimension}
                    </StyledTableCell>
                    <StyledTableCell>
                      {enrichment.value === "None" ? "All" : enrichment.value}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatKey(formatDate(enrichment.date_range[0]))}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatKey(formatDate(enrichment.date_range[1]))}
                    </StyledTableCell>
                    <StyledTableCell>{enrichment.enrichment_type}</StyledTableCell>
                    <StyledTableCell>
                      {enrichment.enrichment_value !== null
                        ? `${enrichment.enrichment_value}%`
                        : "-"}
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomScrollbar>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default EnrichmentDetailsDialog; 