import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { Box, Pagination, PaginationItem, Typography } from "@mui/material";

import { ThemeContext } from "../theme/config/ThemeContext";

import { useState } from "react";
import { useEffect } from "react";

import useDataConnection from "../hooks/useDataConnection";
import DataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/DataConnnectionData";
import useAuth from "../hooks/useAuth";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.default,
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
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease-in-out",
    backgroundColor: "#F9F5FF",
    borderTop: "1px solid #D6BBFB",
    borderBottom: "1px solid #D6BBFB",
  },
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

export default function ConnectionDataTable({
  dataConnectionID,
  dataConnectionName,
  handleClose,
}) {
  const { theme } = React.useContext(ThemeContext);
  useEffect(() => {
    console.log(
      "dataConnectionName at ConnectionDataTable",
      dataConnectionName
    );
    console.log("dataConnectionID at ConnectionDataTable", dataConnectionID);
  }, []);
  const {
    loadConnectionDetails,
    connectionDetails,
    loadConnectionDataDetails,
  } = useDataConnection();

  const [data, setData] = useState(
    connectionDetails ? connectionDetails : null
  );

  useEffect(() => {
    loadConnectionDetails();
  }, []);
  useEffect(() => {
    setData(connectionDetails);
  }, [connectionDetails]);

  const [page, setPage] = useState(1);

  const RecordsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = data.slice(
    (page - 1) * RecordsPerPage,
    page * RecordsPerPage
  );

  const [dataConnectionDataOpen, setDataConnectionDataOpen] = useState(false);
  const [filename, setFilename] = useState("");

  const handleOpenDataConnectionData = (fileName) => {
    setFilename(fileName);
    setDataConnectionDataOpen(true);
  };
  const handleCloseDataConnectionData = async () => {
    await setDataConnectionDataOpen(false);
    handleClose();
  };
  const { userInfo, currentCompany } = useAuth();
  const handleRowClick = async ({ properties }) => {
    console.log("Row clicked:", properties, dataConnectionID);
    const dataConnectionPayload = { sheetProperty: properties };
    await loadConnectionDataDetails(
      dataConnectionID,
      dataConnectionPayload,
      userInfo.userID
    );
    handleOpenDataConnectionData(properties.title);
  };

  return (
    <Box flex={1}>
      <TableContainer component={Box} flex={1}>
        <Table
          sx={{
            "& .MuiTableCell-root": {
              padding: "16px",
              alignContent: "center",
              justifyContent: "center",
            },
          }}
          aria-label="customized table"
        >
          <TableHead>
            <TableRow>
              <StyledTableCell
                align="left"
                sx={{
                  width: "100%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Sheet Name
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <StyledTableRow
                key={row.properties.sheetId}
                onClick={() => {
                  handleRowClick({
                    properties: row.properties,
                  });
                }}
              >
                <StyledTableCell
                  component="th"
                  scope="row"
                  sx={{ width: "100%" }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "18px",
                      textAlign: "left",
                      color: theme.palette.text.modalHeading,
                      whiteSpace: "nowrap", // Prevents wrapping
                      overflow: "hidden", // Hides overflowed content
                      textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                      //   maxWidth: "100%",
                    }}
                  >
                    {row.properties.title}
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(data.length / RecordsPerPage)}
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
        sx={{ padding: "24px", justifyContent: "flex-end", display: "flex" }}
      />
      {dataConnectionDataOpen && (
        <DataConnectionData
          open={dataConnectionDataOpen}
          handleClose={handleCloseDataConnectionData}
          fileName={filename}
          dataConnectionName={dataConnectionName}
        />
      )}
    </Box>
  );
}
