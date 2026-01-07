"use client";
import { useState } from "react";
import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Typography, styled } from "@mui/material";
import { Pagination, PaginationItem } from "@mui/material";

const bodyStyle = {
  fontFamily: "Inter",
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: "18px",
  textAlign: "center",
  color: "#475467",
  whiteSpace: "nowrap", // Prevents wrapping
  overflow: "hidden", // Hides overflowed content
  textOverflow: "ellipsis", // Shows ellipsis for overflowed content
  maxWidth: "100%", // Ensures the text does not exceed the container
};

const headingStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  textAlign: "center",
  color: "#101828",
  borderBottom: "1px solid #EAECF0",
  whiteSpace: "nowrap", // Prevents wrapping
  overflow: "hidden", // Hides overflowed content
  textOverflow: "ellipsis", // Shows ellipsis for overflowed content
  maxWidth: "100%", // Ensures the text does not exceed the container
};

// Custom styled pagination item to match the ViewDataset component
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

function Row(props) {
  const { row, index } = props;

  return (
    <TableRow
      sx={{
        backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      {Object.values(row).map((value, idx) => (
        <TableCell key={idx} sx={bodyStyle}>
          {value}
        </TableCell>
      ))}
    </TableRow>
  );
}

Row.propTypes = {
  row: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const renderTable = (data, page, rowsPerPage) => {
  const headings = Object.keys(data);
  const allRows = data[headings[0]].map((_, rowIndex) =>
    headings.reduce((row, heading) => {
      row[heading] = data[heading][rowIndex];
      return row;
    }, {})
  );

  // Paginate the rows
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedRows = allRows.slice(startIndex, startIndex + rowsPerPage);

  return (
    <TableContainer component={Box}>
      <Table aria-label="preview table">
        <TableHead>
          <TableRow>
            {headings.map((heading) => (
              <TableCell key={heading} sx={headingStyle}>
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRows.map((row, index) => (
            <Row key={index} row={row} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Example usage
export default function PreviewTable({ previewData }) {
  console.log("previewData", previewData);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5; // Same as RecordsPerPage in ViewDataset

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate total number of pages
  const totalRows =
    previewData && Object.keys(previewData).length > 0
      ? previewData[Object.keys(previewData)[0]].length
      : 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return (
    previewData && (
      <Box sx={{ marginTop: "16px" }}>
        {previewData && Object.keys(previewData).length > 0 ? (
          <>
            {renderTable(previewData, page, rowsPerPage)}
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              renderItem={(item) => (
                <CustomPaginationItem
                  {...item}
                  isPrev={item.type === "previous"}
                  isNext={item.type === "next"}
                  isPrevOrNext={
                    item.type === "previous" || item.type === "next"
                  }
                />
              )}
              sx={{
                padding: "24px",
                justifyContent: "flex-end",
                display: "flex",
              }}
            />
          </>
        ) : (
          <Typography>No data available</Typography>
        )}
      </Box>
    )
  );
}
