import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import GoogleSheetImg from "../../../../../assets/Images/google_sheet.svg";
import SnowflakeImg from "../../../../../assets/Images/Snowflake.svg";
import UnicommerceImg from "../../../../../assets/Images/unicommerce.svg";
import Shopify from "../../../../../assets/Images/Shopify.svg";
import Sap from "../../../../../assets/Images/Sap.svg";
import Postgresql from "../../../../../assets/Images/PostgreSQL.svg";
import Plus from "../../../../../assets/Images/Plus.svg";
import GBQ from "../../../../../assets/Images/GBQ.svg";
import Amazon from "../../../../../assets/Images/Amazon.svg";
import Flipkart from "../../../../../assets/Images/flipkart-logo.png";
import AmazonVendor from "../../../../../assets/Images/amazon_vendor_central.png";
import AzureImg from "../../../../../assets/Images/Azure.svg";
import Microsoft from "../../../../../assets/Images/microsoft.png";

import { Grid, Box, Stack, Skeleton } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import GoogleSheet from "./GoogleSheet";
import Snowflake from "./Snowflake";
import Connectors from "./Connectors";
import useDataConnection from "../../../../../hooks/useDataConnection";
import { useState } from "react";
import { useEffect } from "react";
import CustomButton from "../../../../../components/CustomButton";
import { connect } from "formik";
import ConnectionTable from "../../../../../components/ConnectionTable";
import Unicommerce from "./Unicommerce";
import Azure from "./AzureSQL";
import AzureSQL from "./AzureSQL";
import ShopifyConnection from "./Shopify";
import AmazonSellerConnection from "./AmazonSeller";
import AmazonVendorConnection from "./AmazonVendor";
import FlipkartConnection from "./Flipkart";
import SAPConnection from "./SAP";
import useAuth from "../../../../../hooks/useAuth";

import ConfirmationDialog from "../../../../../components/ConfirmationDialog";
import ContactSalesDialog from "../../../../../components/ContactSalesDialog";
import SelectConnectionTable from "../../../../../components/SelectConnectionTable";
import GoogleBigQuery from "./GoogleBigQuery";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    // padding: theme.spacing(2),
    padding: 0,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: " 1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

const data = [
  {
    img: GoogleSheetImg,
    title: "Google Sheet",
  },
  { img: SnowflakeImg, title: "Snow flake" },
  { img: UnicommerceImg, title: "Unicommerce" },
  { img: Shopify, title: "Shopify" },
  { img: Sap, title: "Sap" },
  { img: AzureImg, title: "Microsoft Azure SQL" },
  { img: AmazonVendor, title: "Amazon Vendor Central" },
  { img: Amazon, title: "Amazon" },
  { img: Flipkart, title: "Flipkart" },
  { img: GBQ, title: "Google BigQuery" },
  { img: Microsoft, title: "MS 365 Business Central" },
  { img: Plus, title: "Upload Other Details" },
];

export default function SelectConnections() {
  const [googleSheetOpen, setGoogleSheetOpen] = React.useState(false);
  const [snowflakeOpen, setSnowflakeOpen] = React.useState(false);
  const [connectorsOpen, setConnectorsOpen] = React.useState(false);
  const [shopifyOpen, setShopifyOpen] = React.useState(false);
  const [unicommerceOpen, setUnicommerceOpen] = React.useState(false);
  const [azureOpen, setAzureOpen] = React.useState(false);
  const [amazonSellerOpen, setAmazonSellerOpen] = React.useState(false);
  const [amazonVendorOpen, setAmazonVendorOpen] = React.useState(false);
  const [sapOpen, setSapOpen] = React.useState(false);
  const [flipkartOpen, setFlipkartOpen] = React.useState(false);
  const [googleBigQueryOpen, setGoogleBigQueryOpen] = React.useState(false);
  const { SetError } = useDataConnection();
  const {
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };
  const handleGoogleSheetOpen = () => {
    setGoogleSheetOpen(true);
  };
  const handleGoogleBigQueryOpen = () => {
    setGoogleBigQueryOpen(true);
  };
  const handleUnicommerceOpen = () => {
    setUnicommerceOpen(true);
  };
  const handleGridItemClick = async (item) => {
    await SetError(null);
    if (item.title === "Google Sheet") {
      handleGoogleSheetOpen();
    } else if (item.title === "Snow flake") {
      handleSnowflakeOpen();
    } else if (item.title === "Unicommerce") {
      handleUnicommerceOpen();
    } else if (item.title === "Microsoft Azure SQL") {
      handleAzureOpen();
    } else if (item.title === "Shopify") {
      handleShopifyOpen();
    } else if (item.title === "Flipkart") {
      handleFlipkartOpen();
    } else if (item.title === "Amazon Vendor Central") {
      handleAmazonVendorOpen();
    } else if (item.title === "Amazon") {
      handleAmazonSellerOpen();
    } else if (item.title === "Sap") {
      handleSapOpen();
    } else if (item.title === "Google BigQuery") {
      handleGoogleBigQueryOpen();
    }
  };

  const handleGoogleSheetClose = () => {
    setGoogleSheetOpen(false);
    // handleOpen();
  };
  const handleGoogleBigQueryClose = () => {
    setGoogleBigQueryOpen(false);
  };
  const handleUnicommerceClose = () => {
    setUnicommerceOpen(false);
    // handleOpen();
  };
  const handleSnowflakeOpen = () => {
    setSnowflakeOpen(true);
  };

  const handleSnowflakeClose = () => {
    setSnowflakeOpen(false);
  };
  const handleAzureOpen = () => {
    setAzureOpen(true);
  };

  const handleAzureClose = () => {
    setAzureOpen(false);
  };
  const handleShopifyOpen = () => {
    setShopifyOpen(true);
  };

  const handleShopifyClose = () => {
    setShopifyOpen(false);
  };

  const handleConnectorsOpen = () => {
    setConnectorsOpen(true);
  };

  const handleConnectorsClose = () => {
    setConnectorsOpen(false);
  };

  const handleAmazonSellerOpen = () => {
    setAmazonSellerOpen(true);
  };

  const handleAmazonSellerClose = () => {
    setAmazonSellerOpen(false);
  };

  const handleAmazonVendorOpen = () => {
    setAmazonVendorOpen(true);
  };

  const handleAmazonVendorClose = () => {
    setAmazonVendorOpen(false);
  };

  const handleFlipkartOpen = () => {
    setFlipkartOpen(true);
  };

  const handleFlipkartClose = () => {
    setFlipkartOpen(false);
  };

  const handleSapOpen = () => {
    setSapOpen(true);
  };

  const handleSapClose = () => {
    setSapOpen(false);
  };

  const { dataConnections, ClearData, loadConnections } = useDataConnection();
  const { userInfo } = useAuth();
  const [length, setLength] = useState(dataConnections.length);
  useEffect(() => {
    loadConnections(userInfo.userID);
  }, []);
  useEffect(() => {
    setLength(dataConnections.length);
  }, [dataConnections]);

  return (
    <React.Fragment>
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            color: "#101828",
            textAlign: "left",
          }}
        >
          Step 2: Select Connection
        </Typography>

        <Stack direction="row" spacing={1}>
          {length > 0 && (
            <CustomButton
              title={"Add Connection"}
              outlined={!connectorsOpen}
              onClick={handleConnectorsOpen}
            />
          )}
        </Stack>
      </Stack>

      <Stack>
        {length > 0 ? (
          <Box
            sx={{
              padding: "0px 0px",
              // alignContent: "center",
              justifyContent: "center",
              //  maxHeight: "40vh",
            }}
          >
            <SelectConnectionTable />
          </Box>
        ) : (
          <Grid
            container
            gap={"20px"}
            padding="24px 32px"
            alignContent={"center"}
            justifyContent={"center"}
          >
            {data.map((item, index) => (
              <Grid
                onClick={() => {
                  if (
                    item.title === "Google Sheet" &&
                    currentCompany.access_external_data_connections
                  ) {
                    handleGridItemClick(item);
                  } else if (
                    currentCompany.access_premium_external_data_connections
                  ) {
                    if (
                      item.title === "Snow flake" ||
                      item.title === "Unicommerce" ||
                      item.title === "Microsoft Azure SQL" ||
                      item.title === "Shopify" ||
                      item.title === "Flipkart" ||
                      item.title === "Amazon Vendor Central" ||
                      item.title === "Sap" ||
                      item.title === "Amazon" ||
                      item.title === "Google BigQuery"
                    ) {
                      handleGridItemClick(item);
                    } else {
                      setIsContactSalesDialogOpen(true);
                    }
                  } else {
                    setIsContactSalesDialogOpen(true);
                  }
                }} // Use handleGridItemClick function here
                style={{
                  cursor:
                    item.title === "Google Sheet" ||
                    item.title === "Snow flake" ||
                    item.title === "Unicommerce" ||
                    item.title === "Microsoft Azure SQL" ||
                    item.title === "Shopify" ||
                    item.title === "Flipkart" ||
                    item.title === "Amazon Vendor Central" ||
                    item.title === "Sap" ||
                    item.title === "Amazon" ||
                    item.title === "Google BigQuery"
                      ? "pointer"
                      : "default",
                  //   opacity:
                  // item.title === "Google Sheet" ||
                  // item.title === "Snow flake" ||
                  // item.title === "Unicommerce" ||
                  // item.title === "Microsoft Azure SQL"
                  //   ? 1
                  //   : 0.5,
                }}
                item
                md={2.75}
                sm={5.8}
                // xs={12}
                key={index}
                sx={{
                  borderRadius: "4px",
                  boxShadow: "0px 7.2px 9.6px -2.4px rgba(16, 24, 40, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14.4px 14.4px 19.2px 14.4px",
                  gap: "19.2px",
                }}
              >
                <Stack
                  direction="column"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    backgroundColor: "#FFFFFF",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // paddingY: "16px",
                  }}
                >
                  <LazyLoadImage
                    src={item.img}
                    alt={item.title}
                    effect="blur" // You can choose different loading effects
                    placeholder={
                      <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={"auto"}
                        animation="wave"
                      />
                    }
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "4px",
                      display: "block",
                    }}
                  />

                  <Box
                    sx={{
                      width: "100%",
                      height: "fit-content",
                      padding: "7.2px 12px",
                      gap: "4.8px",
                      borderRadius: "4.8px",
                      border: "0.6px solid #F9F5FF",
                      backgroundColor: "#F9F5FF",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "9.6px",
                        fontWeight: 600,
                        lineHeight: "14.4px",
                        textAlign: "center",
                        color: "#0C66E4",
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {googleSheetOpen && (
        <GoogleSheet
          open={googleSheetOpen}
          handleClose={handleGoogleSheetClose}
          // handleConfirm={handleClose}
        />
      )}
      {unicommerceOpen && (
        <Unicommerce
          open={unicommerceOpen}
          handleClose={handleUnicommerceClose}
          // handleConfirm={handleClose}
        />
      )}

      {snowflakeOpen && (
        <Snowflake
          open={snowflakeOpen}
          handleClose={handleSnowflakeClose}
          // handleConfirm={handleClose}
        />
      )}
      {connectorsOpen && (
        <Connectors
          open={connectorsOpen}
          handleClose={handleConnectorsClose}
          // handleOpen={handleConnectorsOpen}
        />
      )}
      {azureOpen && (
        <AzureSQL
          open={azureOpen}
          handleClose={handleAzureClose}
          // handleConfirm={handleClose}
        />
      )}
      {shopifyOpen && (
        <ShopifyConnection
          open={shopifyOpen}
          handleClose={handleShopifyClose}
          // handleConfirm={handleClose}
        />
      )}

      {amazonSellerOpen && (
        <AmazonSellerConnection
          open={amazonSellerOpen}
          handleClose={handleAmazonSellerClose}
          // handleConfirm={handleClose}
        />
      )}

      {amazonVendorOpen && (
        <AmazonVendorConnection
          open={amazonVendorOpen}
          handleClose={handleAmazonVendorClose}
          // handleConfirm={handleClose}
        />
      )}
      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales to access this connection."
        ConfirmButtonTitle="Contact Sales"
      />
      {flipkartOpen && (
        <FlipkartConnection
          open={flipkartOpen}
          handleClose={handleFlipkartClose}
          // handleConfirm={handleClose}
        />
      )}
      {sapOpen && <SAPConnection open={sapOpen} handleClose={handleSapClose} />}
      {googleBigQueryOpen && (
        <GoogleBigQuery
          open={googleBigQueryOpen}
          handleClose={handleGoogleBigQueryClose}
        />
      )}
    </React.Fragment>
  );
}
