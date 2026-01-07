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
import GoogleBigQueryDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/GoogleBigQueryDataConnectionData";
import BizeeBuyDataConnection from "./BizeeBuyDataConnection";
import MS365BusinessCentralDataConnection from "./MS365BusinessCentralDataConnection";
import GoogleBigQueryDataConnection from "./GoogleBigQueryDataConnection";
import GoogleDriveDataConnection from "./GoogleDriveDataConnection";

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

export default function ConnectionTable({ handleClose }) {
  const { theme } = React.useContext(ThemeContext);

  const { dataConnections, loadConnections, loadConnectionDetails, loadGoogleDriveConnectionDataDetails } =
    useDataConnection();

  const [data, setData] = useState(dataConnections ? dataConnections : null);
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

  const [dataConnectionID, setDataConnectionID] = useState(null);
  const [dataConnectionName, setDataConnectionName] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [tenantURL, setTenantURL] = useState(null);
  const [shopName, setShopName] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [shopifyAPISecretKey, setShopifyAPISecretKey] = useState(null);
  const [endpoint, setEndpoint] = useState(null);
  const [appVersion, setAppVersion] = useState(null);
  const [appId, setAppId] = useState(null);
  const [connectionDatasetOpen, setConnectionDatasetOpen] = useState(false);
  const [googleDriveDataConnectionOpen, setGoogleDriveDataConnectionOpen] =
    useState(false);
  const [unicommerceDataConnectionOpen, setUnicommerceDataConnectionOpen] =
    useState(false);
  const [snowflakeDataConnectionOpen, setSnowflakeDataConnectionOpen] =
    useState(false);
  const [azureSQLDataConnectionOpen, setAzureSQLDataConnectionOpen] =
    useState(false);
  const [shopifyDataConnectionOpen, setShopifyDataConnectionOpen] =
    useState(false);

  const [amazonVendorDataConnectionOpen, setAmazonVendorDataConnectionOpen] =
    useState(false);
  const [amazonSellerDataConnectionOpen, setAmazonSellerDataConnectionOpen] =
    useState(false);
  const [flipkartDataConnectionOpen, setFlipkartDataConnectionOpen] =
    useState(false);
  const [
    googleBigQueryDataConnectionOpen,
    setGoogleBigQueryDataConnectionOpen,
  ] = useState(false);
  const [bizeeBuyDataConnectionOpen, setBizeeBuyDataConnectionOpen] =
    useState(false);
  const [bizeeBuyAccessToken, setBizeeBuyAccessToken] = useState(null);
  const [ms365BusinessCentralDataConnectionOpen, setMS365BusinessCentralDataConnectionOpen] =
    useState(false);
  const [ms365BusinessCentralBaseURL, setMS365BusinessCentralBaseURL] = useState(null);
  const [ms365BusinessCentralUserID, setMS365BusinessCentralUserID] = useState(null);
  const [ms365BusinessCentralPassword, setMS365BusinessCentralPassword] = useState(null);

  const handleOpenConnectionDataset = (
    dataConnectionID,
    dataConnectionName
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setConnectionDatasetOpen(true);
  };
  const handleOpenGoogleDriveDataConnection = async(
    dataConnectionID,
    dataConnectionName
  ) => {
    await loadGoogleDriveConnectionDataDetails(dataConnectionID, userInfo.userID);
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setGoogleDriveDataConnectionOpen(true);
  };
  const handleOpenBizeeBuyDataConnection = (
    dataConnectionID,
    dataConnectionName,
    accessToken
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setBizeeBuyAccessToken(accessToken);
    setBizeeBuyDataConnectionOpen(true);
  };
  const handleCloseBizeeBuyDataConnection = async () => {
    setDataConnectionID(null);
    setDataConnectionName(null);
    setBizeeBuyAccessToken(null);
    setBizeeBuyDataConnectionOpen(false);
    handleClose();
  };
  const handleOpenMS365BusinessCentralDataConnection = (
    dataConnectionID,
    dataConnectionName,
    baseURL,
    userID,
    password
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setMS365BusinessCentralBaseURL(baseURL);
    setMS365BusinessCentralUserID(userID);
    setMS365BusinessCentralPassword(password);
    setMS365BusinessCentralDataConnectionOpen(true);
  };
  const handleCloseMS365BusinessCentralDataConnection = async () => {
    setDataConnectionID(null);
    setDataConnectionName(null);
    setMS365BusinessCentralBaseURL(null);
    setMS365BusinessCentralUserID(null);
    setMS365BusinessCentralPassword(null);
    setMS365BusinessCentralDataConnectionOpen(false);
    handleClose();
  };
  const handleCloseConnectionDataset = async () => {
    setDataConnectionID(null);
    setDataConnectionName(null);
    setConnectionDatasetOpen(false);
    handleClose();
  };
  const handleCloseGoogleDriveDataConnection = async () => {
    setDataConnectionID(null);
    setDataConnectionName(null);
    setGoogleDriveDataConnectionOpen(false);
    handleClose();
  };
  const handleOpenUnicommerceDataConnection = (
    dataConnectionID,
    dataConnectionName,
    tenant,
    tenantURL
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setTenant(tenant);
    setTenantURL(tenantURL);
    setUnicommerceDataConnectionOpen(true);
  };
  const handleCloseUnicommerceDataConnection = async () => {
    await setDataConnectionID(null);
    await setDataConnectionName(null);
    await setTenant(null);
    await setTenantURL(null);
    await setUnicommerceDataConnectionOpen(false);
    handleClose();
  };
  const handleOpenSnowflakeDataConnection = (
    dataConnectionID,
    dataConnectionName
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setSnowflakeDataConnectionOpen(true);
  };
  const handleCloseSnowflakeDataConnection = async () => {
    await setDataConnectionID(null);
    await setDataConnectionName(null);
    await setSnowflakeDataConnectionOpen(false);
    handleClose();
  };
  const handleOpenAzureSQLDataConnection = (
    dataConnectionID,
    dataConnectionName
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setAzureSQLDataConnectionOpen(true);
  };
  const handleCloseAzureSQLDataConnection = async () => {
    await setDataConnectionID(null);
    await setDataConnectionName(null);
    await setAzureSQLDataConnectionOpen(false);
    handleClose();
  };

  const handleOpenGoogleBigQueryDataConnection = (
    dataConnectionID,
    dataConnectionName
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setGoogleBigQueryDataConnectionOpen(true);
  };
  const handleCloseGoogleBigQueryDataConnection = async () => {
    await setDataConnectionID(null);
    await setDataConnectionName(null);
    await setGoogleBigQueryDataConnectionOpen(false);
    handleClose();
  };

  const handleOpenShopifyDataConnection = (
    dataConnectionID,
    dataConnectionName,
    shopName,
    accessToken,
    apiSecretKey
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setShopName(shopName);
    setAccessToken(accessToken);
    setShopifyAPISecretKey(apiSecretKey);
    setShopifyDataConnectionOpen(true);
  };

  const handleCloseShopifyDataConnection = async () => {
    await setDataConnectionID(null);
    await setDataConnectionName(null);
    await setShopName(null);
    await setAccessToken(null);
    await setShopifyAPISecretKey(null);
    await setShopifyDataConnectionOpen(false);
    handleClose();
  };

  const handleOpenAmazonVendorDataConnection = (
    dataConnectionID,
    dataConnectionName,
    accessToken,
    endpoint,
    appVersion,
    appId
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setAccessToken(accessToken);
    setEndpoint(endpoint);
    setAppVersion(appVersion);
    setAppId(appId);
    setAmazonVendorDataConnectionOpen(true);
  };
  const handleCloseAmazonVendorDataConnection = async () => {
    setDataConnectionID(null);
    setDataConnectionName(null);
    setAccessToken(null);
    setEndpoint(null);
    setAppVersion(null);
    setAppId(null);
    handleClose();
  };

  const handleOpenAmazonSellerDataConnection = (
    dataConnectionID,
    dataConnectionName,
    accessToken,
    endpoint,
    appVersion,
    appId
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setAccessToken(accessToken);
    setEndpoint(endpoint);
    setAppVersion(appVersion);
    setAppId(appId);
    setAmazonSellerDataConnectionOpen(true);
  };
  const handleCloseAmazonSellerDataConnection = async () => {
    setDataConnectionID(null);
    setDataConnectionName(null);
    setAccessToken(null);
    setEndpoint(null);
    setAppVersion(null);
    setAppId(null);
    handleClose();
  };

  const handleOpenFlipkartDataConnection = (
    dataConnectionID,
    dataConnectionName,
    accessToken
  ) => {
    setDataConnectionID(dataConnectionID);
    setDataConnectionName(dataConnectionName);
    setAccessToken(accessToken);
    setFlipkartDataConnectionOpen(true);
  };
  const handleCloseFlipkartDataConnection = async () => {
    setDataConnectionID(null);
    setDataConnectionName(null);
    setAccessToken(null);
    handleClose();
  };

  const handleRowClick = async ({
    dataConnectionID,
    dataConnectionName,
    dataConnectionType,
    tenant,
    tenantURL,
    shopName,
    accessToken,
    endpoint,
    appVersion,
    appId,
    apiSecretKey,
    baseURL,
    userID,
    password,
  }) => {
    console.log("Row clicked:", dataConnectionID , dataConnectionType);
    if (
      dataConnectionType !== "snowflake" &&
      dataConnectionType !== "Shopify" &&
      dataConnectionType !== "AmazonVendor" &&
      dataConnectionType !== "AmazonSeller" &&
      dataConnectionType !== "Flipkart" &&
      dataConnectionType !== "Google BigQuery" &&
      dataConnectionType !== "BizeeBuy" &&
      dataConnectionType !== "MS 365 Business Central" &&
      dataConnectionType !== "gdrive"
    ) {
      await loadConnectionDetails(dataConnectionID, userInfo.userID);
    }

    if (dataConnectionType === "gsheet") {
      handleOpenConnectionDataset(dataConnectionID, dataConnectionName);
    }
    else if (dataConnectionType === "gdrive") {

      handleOpenGoogleDriveDataConnection(dataConnectionID, dataConnectionName);
    } else if (dataConnectionType === "unicommerce") {
      console.log("Opening unicommerce form");
      handleOpenUnicommerceDataConnection(
        dataConnectionID,
        dataConnectionName,
        tenant,
        tenantURL
      );
    } else if (dataConnectionType === "snowflake") {
      console.log("Opening snowflake query editor");
      handleOpenSnowflakeDataConnection(dataConnectionID, dataConnectionName);
    } else if (dataConnectionType === "Azure SQL") {
      console.log("Opening snowflake query editor");
      handleOpenAzureSQLDataConnection(dataConnectionID, dataConnectionName);
    } else if (dataConnectionType === "Shopify") {
      console.log("shopify");
      handleOpenShopifyDataConnection(
        dataConnectionID,
        dataConnectionName,
        shopName,
        accessToken,
        apiSecretKey
      );
    } else if (dataConnectionType === "AmazonVendor") {
      console.log("Amazon Vendor");
      handleOpenAmazonVendorDataConnection(
        dataConnectionID,
        dataConnectionName,
        accessToken,
        endpoint,
        appVersion,
        appId
      );
    } else if (dataConnectionType === "AmazonSeller") {
      console.log("Amazon Vendor");
      handleOpenAmazonSellerDataConnection(
        dataConnectionID,
        dataConnectionName,
        accessToken,
        endpoint,
        appVersion,
        appId
      );
    } else if (dataConnectionType === "Flipkart") {
      console.log("Flipkart");
      handleOpenAmazonSellerDataConnection(
        dataConnectionID,
        dataConnectionName,
        accessToken
      );
    } else if (dataConnectionType === "Google BigQuery") {
      console.log("Google BigQuery");
      handleOpenGoogleBigQueryDataConnection(
        dataConnectionID,
        dataConnectionName
      );
    } else if (dataConnectionType === "BizeeBuy") {
      console.log("BizeeBuy");
      handleOpenBizeeBuyDataConnection(
        dataConnectionID,
        dataConnectionName,
        accessToken
      );
    } else if (dataConnectionType === "MS 365 Business Central") {
      console.log("MS 365 Business Central");
      handleOpenMS365BusinessCentralDataConnection(
        dataConnectionID,
        dataConnectionName,
        baseURL,
        userID,
        password
      );
    }
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
                    dataConnectionID: row.dataConnectionID,
                    dataConnectionName: row.dataConnectionName,
                    dataConnectionType: row.dataConnectionType,
                    tenant: row?.tenant || "",
                    tenantURL: row?.tenantURL || "",
                    shopName: row?.shopName || "",
                    accessToken: row?.accessToken || "",
                    endpoint: row?.endpoint,
                    appVersion: row?.appVersion,
                    appId: row?.appId,
                    apiSecretKey: row?.apiSecretKey || "",
                    baseURL: row?.baseURL || "",
                    userID: row?.userID || "",
                    password: row?.password || "",
                  });
                }}
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
      {connectionDatasetOpen && (
        <ConnectionDatasets
          open={connectionDatasetOpen}
          handleClose={handleCloseConnectionDataset}
          handleOpen={handleOpenConnectionDataset}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
        />
      )}
      {googleDriveDataConnectionOpen && (
        <GoogleDriveDataConnection
          open={googleDriveDataConnectionOpen}
          handleClose={handleCloseGoogleDriveDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
        />
      )}
      {unicommerceDataConnectionOpen && (
        <UnicommerceDataConnection
          open={unicommerceDataConnectionOpen}
          handleClose={handleCloseUnicommerceDataConnection}
          handleOpen={handleOpenUnicommerceDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
          tenant={tenant}
          tenantURL={tenantURL}
        />
      )}
      {snowflakeDataConnectionOpen && (
        <SnowflakeDataConnection
          open={snowflakeDataConnectionOpen}
          handleClose={handleCloseSnowflakeDataConnection}
          handleOpen={handleOpenSnowflakeDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
        />
      )}

      {shopifyDataConnectionOpen && (
        <ShopifyDataConnection
          open={shopifyDataConnectionOpen}
          handleClose={handleCloseShopifyDataConnection}
          handleOpen={handleOpenShopifyDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
          shopName={shopName}
          accessToken={accessToken}
          apiSecretKey={shopifyAPISecretKey}
        />
      )}
      {amazonVendorDataConnectionOpen && (
        <AmazonVendorDataConnection
          open={amazonVendorDataConnectionOpen}
          handleClose={handleCloseAmazonVendorDataConnection}
          handleOpen={handleOpenAmazonVendorDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
          accessToken={accessToken}
          endpoint={endpoint}
          appVersion={appVersion}
          appId={appId}
        />
      )}

      {amazonSellerDataConnectionOpen && (
        <AmazonSellerDataConnection
          open={amazonSellerDataConnectionOpen}
          handleClose={handleCloseAmazonSellerDataConnection}
          handleOpen={handleOpenAmazonSellerDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
          accessToken={accessToken}
          endpoint={endpoint}
          appVersion={appVersion}
          appId={appId}
        />
      )}

      {azureSQLDataConnectionOpen && (
        <AzureDataConnectionData
          open={azureSQLDataConnectionOpen}
          handleClose={handleCloseAzureSQLDataConnection}
          dataConnectionName={dataConnectionName}
        />
      )}

      {/* {googleBigQueryDataConnectionOpen && (
        <GoogleBigQueryDataConnectionData
          open={googleBigQueryDataConnectionOpen}
          handleClose={handleCloseGoogleBigQueryDataConnection}
          dataConnectionName={dataConnectionName}
        />
      )} */}
      {googleBigQueryDataConnectionOpen && (
        <GoogleBigQueryDataConnection
          open={googleBigQueryDataConnectionOpen}
          handleClose={handleCloseGoogleBigQueryDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
        />
      )}
      {bizeeBuyDataConnectionOpen && (
        <BizeeBuyDataConnection
          open={bizeeBuyDataConnectionOpen}
          handleClose={handleCloseBizeeBuyDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
          accessToken={bizeeBuyAccessToken}
        />
      )}
      {ms365BusinessCentralDataConnectionOpen && (
        <MS365BusinessCentralDataConnection
          open={ms365BusinessCentralDataConnectionOpen}
          handleClose={handleCloseMS365BusinessCentralDataConnection}
          dataConnectionID={dataConnectionID}
          dataConnectionName={dataConnectionName}
          baseURL={ms365BusinessCentralBaseURL}
          userID={ms365BusinessCentralUserID}
          password={ms365BusinessCentralPassword}
        />
      )}
    </Box>
  );
}
