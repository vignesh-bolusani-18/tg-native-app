import * as React from "react";
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Stack, Typography } from "@mui/material";
import { Pagination, PaginationItem } from "@mui/material";
import useExperiment from "../../../../../hooks/useExperiment";
import { fetchCSVData, fetchCSVFromS3 } from "../../../../../utils/s3Utils";
import useAuth from "../../../../../hooks/useAuth";
import Skeleton from "@mui/material/Skeleton";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.default,
    textTransform: "none",
    whiteSpace: "nowrap", // Prevents wrapping
    overflow: "hidden", // Hides overflowed content
    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
    maxWidth: "100%",
    fontWeight: 600, // Make headers bold
  },
  [`&.${tableCellClasses.body}`]: {
    whiteSpace: "nowrap", // Prevents wrapping in body cells
    overflow: "hidden", // Hides overflowed content
    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F9FAFB",
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.default,
  },
  cursor: "pointer",
}));

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
    backgroundColor: theme.palette.button.backgroundOnHover,
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

const convertToNumber = (value) => {
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? value : Math.round(parsedValue * 100) / 100;
};

const transformData = (data) => {
  if (!data) {
    return [];
  }
  const keys = Object.keys(data);
  const length = data[keys[0]].length;

  const transformedData = [];
  for (let i = 0; i < length; i++) {
    const row = {};
    keys.forEach((key) => {
      row[key] = data[key][i] === "" ? null : data[key][i];
    });
    transformedData.push(row);
  }
  return transformedData;
};

export default function ViewDataset({ path }) {
  const { userInfo } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const RecordsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(
          "Fetching data with path:",
          path,
          "userID:",
          userInfo?.userID
        );
        setLoading(true);
        const result = await fetchCSVData({
          filePath: path,
          filterData: null,
          paginationData: { batchNo: 1, batchSize: 100 },
          sortingData: null,
        });
        console.log("Fetched result:", result);
        setData(result);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);

        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const transformedData = transformData(data);
  const headers = data ? Object.keys(data) : [];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = transformedData.slice(
    (page - 1) * RecordsPerPage,
    page * RecordsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ maxWidth: "90vw", overflowX: "auto", width: "100%" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[1, 2, 3, 4, 5].map((item) => (
                  <TableCell key={item}>
                    <Skeleton variant="text" width={100} height={20} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton variant="text" width={100} height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: "90vw", overflowX: "auto", width: "100%" }}>
        <Typography color="error">Error loading data: {error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {paginatedData.length > 0 ? (
        <Box sx={{ maxWidth: "90vw", overflowX: "auto", width: "100%" }}>
          <TableContainer
            component={Box}
            sx={{ maxWidth: "90vw", overflowX: "auto", width: "100%" }}
          >
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  padding: "16px",
                  alignContent: "center",
                  justifyContent: "center",
                },
                minWidth: "650px", // Set a minimum width for the table
              }}
              aria-label="customized table"
            >
              <TableHead>
                <StyledTableRow>
                  {headers.map((header) => (
                    <StyledTableCell key={header}>{header}</StyledTableCell>
                  ))}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <StyledTableRow key={index}>
                    {headers.map((header) => (
                      <StyledTableCell key={header}>
                        {row[header] !== null ? row[header] : "None"}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(transformedData.length / RecordsPerPage)}
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
              padding: "24px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          />
        </Box>
      ) : (
        <Box sx={{ maxWidth: "90vw", overflowX: "auto", width: "100%" }}>
          <Typography>Sample data not available!</Typography>
        </Box>
      )}
    </>
  );
}
