import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ReactComponent as UploadCloud } from "../../../../../assets/Icons/download-cloud.svg";
import { ReactComponent as UploadCloudLight } from "../../../../../assets/Icons/download-cloud-white.svg";
import { ThemeContext } from "../../../../../theme/config/ThemeContext";
import { Stack, Button } from "@mui/material";
import UploadDataDialog from "./UploadDataDialog";
import Connectors from "./Connectors";
import DatasetTable from "../../../../../components/ConfigurableDatasetTable";
import CustomButton from "../../../../../components/CustomButton";
import useDataset from "../../../../../hooks/useDataset";
import useAuth from "../../../../../hooks/useAuth";
import { CatchingPokemonSharp } from "@mui/icons-material";
import Connections from "./Connections";
import useDataConnection from "../../../../../hooks/useDataConnection";
import CustomDataset from "./CustomDataset";
import TGInternalDataConnection from "../../../../../components/TGInternalDataConnection";
import ConfirmationDialog from "../../../../../components/ConfirmationDialog";
import ContactSalesDialog from "../../../../../components/ContactSalesDialog";
import NewCustomDataset from "./NewCustomDataset";
import useSession from "../../../../../hooks/useSession";

export default function ExpDataList({ handleClose }) {
  const [uploadOtherDatasetsopen, setUploadOtherDatasetsOpen] =
    React.useState(false);
  const [viewConnectors, setviewConnectors] = React.useState(false);
  const [customDatasetOpen, setCustomDatasetOpen] = React.useState(false);
  const [tgInternalDataOpen, setTGInternalDataOpen] = React.useState(false);
  const { loadConnections, ClearData } = useDataConnection();
  const {clearSession , currentSession , terminateSession} = useSession();
  // useEffect(() => {
  //   loadConnections(userInfo.userID);
  // }, []);

  const { theme } = React.useContext(ThemeContext);
  const { loadDatasetsList, datasets_list } = useDataset();
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();

  
  // console.log("====================================");
  // console.log("Dataset List", datasets_list);
  // console.log("====================================");

  // useEffect(() => {
  //   console.log("Opening upload dialog, fetching datasets...");
  //   loadDatasetsList(userInfo);
  // }, [uploadOtherDatasetsopen]);

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const handleUploadOtherDatasetsOpen = () => setUploadOtherDatasetsOpen(true);
  const handleUploadOtherDatasetsClose = () =>
    setUploadOtherDatasetsOpen(false);
  const handleConnectorsOpen = async () => {
    loadConnections(userInfo.userID);
    setviewConnectors(true);
  };
  const handleConnectorsClose = () => setviewConnectors(false);
  const handleCustomDatasetOpen = () => setCustomDatasetOpen(true);
  const handleCustomDatasetClose = () => {

    if (currentSession.sessionID) {
      const payload = {
        sessionID: currentSession.sessionID,
      };
      terminateSession(currentCompany, userInfo, payload);
    }
   
    clearSession();
    setCustomDatasetOpen(false) 
  };
  const handleTGInternalDataOpen = () => setTGInternalDataOpen(true);
  const handleTGInternalDataClose = () => setTGInternalDataOpen(false);


  

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 24px 19px 24px",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Stack spacing={1} direction="row" alignItems={"center"}>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 500,
              lineHeight: "28px",
              textAlign: "left",
              color: "#101828",
            }}
          >
            Datasets
          </Typography>
        </Stack>
        <Stack spacing={1} direction="row">
          <CustomButton
            title={"TG Internal Dataset"}
            outlined={!tgInternalDataOpen}
            onClick={
              currentCompany.access_tg_internal_data_connection
                ? handleTGInternalDataOpen
                : () => setIsContactSalesDialogOpen(true)
            }
          />
          <CustomButton
            title={"Add Custom Dataset"}
            outlined={!customDatasetOpen}
            onClick={
              currentCompany.custom_query
                ? handleCustomDatasetOpen
                : () => setIsContactSalesDialogOpen(true)
            }
            isPremiumFeature={currentCompany.custom_query}
          />
          <CustomButton
            title={"Add External Data Connection"}
            outlined={!viewConnectors}
            onClick={
              currentCompany.access_external_data_connections
                ? handleConnectorsOpen
                : () => setIsContactSalesDialogOpen(true)
            }
            isPremiumFeature={currentCompany.add_external_data_connection}
          />
          <CustomButton
            title={"Upload Other Datasets"}
            outlined={!uploadOtherDatasetsopen}
            onClick={handleUploadOtherDatasetsOpen}
            isPremiumFeature={currentCompany.upload_other_dataset}
            CustomStartAdornment={
              uploadOtherDatasetsopen ? <UploadCloudLight /> : <UploadCloud />
            }
          />
        </Stack>
      </Box>
      <DatasetTable />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "20px 24px 19px 24px",
          alignItems: "center",
        }}
      >
        <Stack spacing={1} direction="row">
          <Button
            onClick={handleClose}
            size="medium"
            sx={{
              border: "1px solid #D0D5DD",
              borderRadius: "8px",
              padding: "10px 16px",
              maxHeight: "40px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "center",
                color: "#344054",
                textTransform: "none",
              }}
            >
              Cancel
            </Typography>
          </Button>
        </Stack>
      </Box>
      <UploadDataDialog
        handleClose={async () => {
          await loadDatasetsList(userInfo);
          handleUploadOtherDatasetsClose();
        }}
        open={uploadOtherDatasetsopen}
      />
      <TGInternalDataConnection
        handleClose={async () => {
          await loadDatasetsList(userInfo);
          handleTGInternalDataClose();
        }}
        open={tgInternalDataOpen}
      />

      {
        // <CustomDataset
        //   handleClose={async () => {
        //     await loadDatasetsList(userInfo);
        //     handleCustomDatasetClose();
        //   }}
        //   open={customDatasetOpen}
        // />
      }

      <NewCustomDataset
        handleClose={async () => {
          await loadDatasetsList(userInfo);
          handleCustomDatasetClose();
        }}
        open={customDatasetOpen}
      />

      <Connections
        open={viewConnectors}
        handleClose={async () => {
          await loadDatasetsList(userInfo);
          ClearData();
          handleConnectorsClose();
        }}
        handleOpen={handleConnectorsOpen}
      />
      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales for more access."
        ConfirmButtonTitle="Contact Sales"
      />
    </Box>
  );
}
