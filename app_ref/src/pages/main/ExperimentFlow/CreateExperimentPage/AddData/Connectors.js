import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import GoogleSheetImg from "../../../../../assets/Images/google_sheet.svg";
import GoogleDriveImg from "../../../../../assets/Images/google_drive.svg";
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
import Retailogists from "../../../../../assets/Images/RetailLogist_fixed.svg";
import BizeeBuy from "../../../../../assets/Images/BizeeBuy.png";
import Microsoft from "../../../../../assets/Images/microsoft.png";

import AzureImg from "../../../../../assets/Images/Azure.svg";

import { Grid, Box, Stack, Skeleton } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import GoogleSheet from "./GoogleSheet";
import GoogleDrive from "./GoogleDrive";
import Snowflake from "./Snowflake";
import useDataConnection from "../../../../../hooks/useDataConnection";
import Unicommerce from "./Unicommerce";
import Azure from "./AzureSQL";
import AzureSQL from "./AzureSQL";
import ShopifyConnection from "./Shopify";
import AmazonSellerConnection from "./AmazonSeller";
import AmazonVendorConnection from "./AmazonVendor";
import FlipkartConnection from "./Flipkart";
import SAPConnection from "./SAP";
import ConfirmationDialog from "../../../../../components/ConfirmationDialog";
import useAuth from "../../../../../hooks/useAuth";
import ContactSalesDialog from "../../../../../components/ContactSalesDialog";
import GoogleBigQuery from "./GoogleBigQuery";
import BizeeBuyForm from "./BizeeBuyForm";
import MS365BusinessCentralForm from "./MS365BusinessCentralForm";
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
  { img: GoogleDriveImg, title: "Google Drive" },
  { img: SnowflakeImg, title: "Snow flake" },
  { img: UnicommerceImg, title: "Unicommerce" },
  { img: Shopify, title: "Shopify" },
  { img: Sap, title: "Sap" },
  { img: AzureImg, title: "Microsoft Azure SQL" },
  { img: GBQ, title: "Google BigQuery" },
  { img: Microsoft, title: "MS 365 Business Central" },
  { img: AmazonVendor, title: "Amazon Vendor Central" },
  { img: Amazon, title: "Amazon" },
  { img: Flipkart, title: "Flipkart" },

  // { img: Retailogists, title: "Retailogists" },
  // { img: Plus, title: "Upload Other Details" },
  { img: BizeeBuy, title: "BizeeBuy" },
];

export default function Connectors({ open, handleClose, handleOpen }) {
  const [googleSheetOpen, setGoogleSheetOpen] = React.useState(false);
  const [googleDriveOpen, setGoogleDriveOpen] = React.useState(false);
  const [snowflakeOpen, setSnowflakeOpen] = React.useState(false);
  const [unicommerceOpen, setUnicommerceOpen] = React.useState(false);
  const [shopifyOpen, setShopifyOpen] = React.useState(false);
  const [azureOpen, setAzureOpen] = React.useState(false);
  const [googleBigQueryOpen, setGoogleBigQueryOpen] = React.useState(false);
  const [amazonSellerOpen, setAmazonSellerOpen] = React.useState(false);
  const [amazonVendorOpen, setAmazonVendorOpen] = React.useState(false);
  const [bizeeBuyOpen, setBizeeBuyOpen] = React.useState(false);
  const [ms365BusinessCentralOpen, setMS365BusinessCentralOpen] =
    React.useState(false);
  const [sapOpen, setSapOpen] = React.useState(false);
  const [flipkartOpen, setFlipkartOpen] = React.useState(false);
  const { SetError } = useDataConnection();
  const {
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  const handleGoogleSheetOpen = () => {
    setGoogleSheetOpen(true);
  };
  const handleGoogleDriveOpen = () => {
    setGoogleDriveOpen(true);
  };
  const handleGoogleBigQueryOpen = () => {
    console.log("Google BigQuery Open");
    setGoogleBigQueryOpen(true);
  };
  const handleBizeeBuyOpen = () => {
    setBizeeBuyOpen(true);
  };
  const handleMS365BusinessCentralOpen = () => {
    setMS365BusinessCentralOpen(true);
  };
  const handleUnicommerceOpen = () => {
    setUnicommerceOpen(true);
  };

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const handleGridItemClick = async (item) => {
    await SetError(null);
    if (item.title === "Google Sheet") {
      handleGoogleSheetOpen();
    } else if (item.title === "Google Drive") {
      handleGoogleDriveOpen();
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
    } else if (item.title === "Retailogists") {
      handleShopifyOpen();
    } else if (item.title === "Google BigQuery") {
      handleGoogleBigQueryOpen();
    } else if (item.title === "BizeeBuy") {
      handleBizeeBuyOpen();
    } else if (item.title === "MS 365 Business Central") {
      handleMS365BusinessCentralOpen();
    }
  };

  const handleGoogleSheetClose = () => {
    setGoogleSheetOpen(false);
    // handleOpen();
  };
  const handleGoogleDriveClose = () => {
    setGoogleDriveOpen(false);
  };
  const handleGoogleBigQueryClose = () => {
    setGoogleBigQueryOpen(false);
  };
  const handleBizeeBuyClose = () => {
    setBizeeBuyOpen(false);
  };
  const handleMS365BusinessCentralClose = () => {
    setMS365BusinessCentralOpen(false);
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

  const handleShopifyClose = () => {
    setShopifyOpen(false);
  };

  const handleShopifyOpen = () => {
    setShopifyOpen(true);
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

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            padding: "20px 26px 19px 26px",
            borderBottom: "1px solid #EAECF0",
          }}
          id="customized-dialog-title"
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
            All Connectors
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#667085",
              padding: "8px",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid
            container
            gap={"20px"}
            padding="16px 24px"
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
                      item.title === "Google Drive" ||
                      item.title === "Snow flake" ||
                      item.title === "Unicommerce" ||
                      item.title === "Microsoft Azure SQL" ||
                      item.title === "Shopify" ||
                      item.title === "Flipkart" ||
                      item.title === "Amazon Vendor Central" ||
                      item.title === "Sap" ||
                      item.title === "Amazon" ||
                      item.title === "RetailLogists" ||
                      item.title === "Google BigQuery" ||
                      item.title === "BizeeBuy" ||
                      item.title === "MS 365 Business Central"
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
                    item.title === "Google Drive" ||
                    item.title === "Snow flake" ||
                    item.title === "Unicommerce" ||
                    item.title === "Microsoft Azure SQL" ||
                    item.title === "Shopify" ||
                    item.title === "Flipkart" ||
                    item.title === "Amazon Vendor Central" ||
                    item.title === "Sap" ||
                    item.title === "RetailLogists" ||
                    item.title === "Amazon" ||
                    item.title === "Google BigQuery" ||
                    item.title === "BizeeBuy" ||
                    item.title === "MS 365 Business Central"
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
                  padding: "10.4px 10.4px 15.2px 10.4px",
                  //gap: "19.2px",
                }}
              >
                <Stack
                  direction="column"
                  spacing={1}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LazyLoadImage
                      src={item.img}
                      alt={item.title}
                      effect="blur"
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
                        maxHeight: "100%",
                        objectFit: "contain",
                        borderRadius: "4px",
                        display: "block",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      width: "100%",
                      height: "fit-content",
                      padding: "7.2px 12px",
                      gap: "4.8px",
                      borderRadius: "4.8px",
                      border: "0.6px solid #F9F5FF",
                      backgroundColor: "#F9F5FF",
                      marginTop: "auto",
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
          <ContactSalesDialog
            open={isContactSalesDialogOpen}
            handleClose={() => setIsContactSalesDialogOpen(false)}
            handleConfirm={handleContactSales}
            WarningText="Upgrade Your Subscription"
            ResultText="Upgrade your subscription or contact sales to access this connection."
            ConfirmButtonTitle="Contact Sales"
          />
        </DialogContent>
      </BootstrapDialog>

      {googleSheetOpen && (
        <GoogleSheet
          open={googleSheetOpen}
          handleClose={handleGoogleSheetClose}
          handleConfirm={handleClose}
        />
      )}
      {googleDriveOpen && (
        <GoogleDrive
          open={googleDriveOpen}
          handleClose={handleGoogleDriveClose}
          handleConfirm={handleClose}
        />
      )}
      {unicommerceOpen && (
        <Unicommerce
          open={unicommerceOpen}
          handleClose={handleUnicommerceClose}
          handleConfirm={handleClose}
        />
      )}

      {snowflakeOpen && (
        <Snowflake
          open={snowflakeOpen}
          handleClose={handleSnowflakeClose}
          handleConfirm={handleClose}
        />
      )}
      {azureOpen && (
        <AzureSQL
          open={azureOpen}
          handleClose={handleAzureClose}
          handleConfirm={handleClose}
        />
      )}
      {shopifyOpen && (
        <ShopifyConnection
          open={shopifyOpen}
          handleClose={handleShopifyClose}
          handleConfirm={handleClose}
        />
      )}

      {amazonSellerOpen && (
        <AmazonSellerConnection
          open={amazonSellerOpen}
          handleClose={handleAmazonSellerClose}
          handleConfirm={handleClose}
        />
      )}

      {amazonVendorOpen && (
        <AmazonVendorConnection
          open={amazonVendorOpen}
          handleClose={handleAmazonVendorClose}
          handleConfirm={handleClose}
        />
      )}

      {flipkartOpen && (
        <FlipkartConnection
          open={flipkartOpen}
          handleClose={handleFlipkartClose}
          handleConfirm={handleClose}
        />
      )}
      {sapOpen && (
        <SAPConnection
          open={sapOpen}
          handleClose={handleSapClose}
          handleConfirm={handleClose}
        />
      )}
      {googleBigQueryOpen && (
        <GoogleBigQuery
          open={googleBigQueryOpen}
          handleClose={handleGoogleBigQueryClose}
          handleConfirm={handleClose}
        />
      )}
      {bizeeBuyOpen && (
        <BizeeBuyForm
          open={bizeeBuyOpen}
          handleClose={handleBizeeBuyClose}
          handleConfirm={handleClose}
        />
      )}
      {ms365BusinessCentralOpen && (
        <MS365BusinessCentralForm
          open={ms365BusinessCentralOpen}
          handleClose={handleMS365BusinessCentralClose}
          handleConfirm={handleClose}
        />
      )}
    </React.Fragment>
  );
}
