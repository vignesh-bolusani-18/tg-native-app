import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
  Stack,
  Typography,
} from "@mui/material";
import { MoreVertRounded } from "@mui/icons-material";
import { ReactComponent as File } from "../assets/Icons/file_Icon.svg";
import { ThemeContext } from "../theme/config/ThemeContext";
import { useNavigate } from "react-router-dom";
import useDashboard from "../hooks/useDashboard";
import useExperiment from "../hooks/useExperiment";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import { useEffect } from "react";
import { loadReports } from "../redux/actions/dashboardActions";
import useDataConnection from "../hooks/useDataConnection";
import ConnectionDatasets from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/ConnectionDatasets";
import UnicommerceDataConnection from "./UnicommerceDataConnection";
import SnowflakeDataConnection from "./SnowflakeDataConnection";
import AzureDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/AzureDataConnectionData";
import ShopifyDataConnection from "./ShopifyDataConnection";
import AmazonVendorDataConnection from "./AmazonVendorDataConnection";
import AmazonSellerDataConnection from "./AmazonSellerDataConnection";
import useExports from "../hooks/useExports";
import { fetchJsonFromS3 } from "../utils/s3Utils";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, isSelected }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: isSelected ? "aliceblue" : "#F9FAFB",
  },
  "&:nth-of-type(even)": {
    backgroundColor: isSelected
      ? "aliceblue"
      : theme.palette.background.default,
  },
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease-in-out",
    backgroundColor: isSelected ? "aliceblue" : "#F9F5FF",
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

export default function SelectConnectionTable() {
  const { theme } = React.useContext(ThemeContext);

  const { dataConnections, loadConnections, loadConnectionDetails } =
    useDataConnection();
  const { setDataConnectionInfo, create_step, setCreateStep, export_pipeline } =
    useExports();

  const [data, setData] = useState(dataConnections ? dataConnections : null);
  const [dataConnectionID, setDataConnectionID] = useState(
    export_pipeline.dataConnection !== null
      ? export_pipeline.dataConnection.dataConnectionID
      : null
  );
  useEffect(() => {
    setDataConnectionID(
      export_pipeline.dataConnection !== null
        ? export_pipeline.dataConnection.dataConnectionID
        : null
    );
  }, [export_pipeline]);
  const { userInfo, currentCompany } = useAuth();
  useEffect(() => {
    loadConnections(userInfo.userID);
  }, []);
  useEffect(() => {
    setData(dataConnections);
  }, [dataConnections]);

  const [page, setPage] = useState(1);

  const RecordsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = data.slice(
    (page - 1) * RecordsPerPage,
    page * RecordsPerPage
  );

  const handleRowClick = async ({ dataConnectionName, dataConnectionID,dataConnectionType }) => {
    setDataConnectionID(dataConnectionID);
    const dataConnectionPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/data_connections/${dataConnectionName}.json`;
    const dataConnection = await fetchJsonFromS3(dataConnectionPath);
    await setDataConnectionInfo({ ...dataConnection, dataConnectionID,source_type:dataConnectionType });
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
          key={`${dataConnectionID}`}
        >
          <TableHead>
            <TableRow>
              <StyledTableCell
                align="left"
                sx={{
                  width: "20%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Name
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{
                  width: "5%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Type
              </StyledTableCell>
              <StyledTableCell
                align="left"
                sx={{
                  width: "15%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Created by
              </StyledTableCell>
              <StyledTableCell
                align="left"
                sx={{
                  width: "30%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Created at
              </StyledTableCell>
              <StyledTableCell
                align="left"
                sx={{
                  width: "30%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Updated at
              </StyledTableCell>
              {/* <StyledTableCell
                align="left"
                sx={{
                  width: "5%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Status
              </StyledTableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <StyledTableRow
                key={row.dataConnectionID}
                onClick={() => {
                  handleRowClick({
                    dataConnectionName: row.dataConnectionName,
                    dataConnectionID: row.dataConnectionID,
                    dataConnectionType:row.dataConnectionType
                  });
                }}
                isSelected={row.dataConnectionID === dataConnectionID}
              >
                <StyledTableCell
                  component="th"
                  scope="row"
                  sx={{ width: "20%" }}
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
                    {row.dataConnectionName}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell
                  align="left"
                  sx={{
                    width: "5%",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                    whiteSpace: "nowrap", // Prevents wrapping
                    overflow: "hidden", // Hides overflowed content
                    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                    // maxWidth: "100%",
                  }}
                >
                  <Chip
                    label={row.dataConnectionType}
                    size="small"
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "18px",
                      textAlign: "initial",
                      color: "#027A48",
                      backgroundColor: "#ECFDF3",
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell
                  align="left"
                  sx={{
                    width: "15%",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                    whiteSpace: "nowrap", // Prevents wrapping
                    overflow: "hidden", // Hides overflowed content
                    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                    // maxWidth: "100%",
                  }}
                >
                  {row.createdBy}
                </StyledTableCell>
                <StyledTableCell
                  align="left"
                  sx={{
                    width: "30%",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                    whiteSpace: "nowrap", // Prevents wrapping
                    overflow: "hidden", // Hides overflowed content
                    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                    // maxWidth: "100%",
                  }}
                >
                  {row.createdAt}
                </StyledTableCell>
                <StyledTableCell
                  align="left"
                  sx={{
                    width: "30%",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                    whiteSpace: "nowrap", // Prevents wrapping
                    overflow: "hidden", // Hides overflowed content
                    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                    // maxWidth: "100%",
                  }}
                >
                  {row.updatedAt}
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
    </Box>
  );
}
