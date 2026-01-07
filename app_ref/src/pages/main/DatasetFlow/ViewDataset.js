// import React from "react";
// import {
//   Box,
//   Stack,
//   Typography,
//   Button,
//   Pagination,
//   PaginationItem,
// } from "@mui/material";
// import {
//   Search,
//   SearchIconWrapper,
//   StyledInputBase,
// } from "../../../components/Search";
// import { styled } from "@mui/material/styles";

import { ThemeContext } from "../../../theme/config/ThemeContext";

// import { ReactComponent as FilterIcon } from "../../../assets/Icons/Filters lines.svg";
// import { ReactComponent as SearchIcon } from "../../../assets/Icons/search.svg";
// import DatasetTable from "../../../components/DatasetTable";
// import { ArrowBack, ArrowForward } from "@mui/icons-material";
// import useDataset from "../../../hooks/useDataset";
// import { useEffect } from "react";
// import useAuth from "../../../hooks/useAuth";
// const textLgMedium = {
//   fontFamily: "Inter",
//   fontSize: "18px",
//   fontWeight: 500,
//   lineHeight: "28px",
//   textAlign: "left",
//   color: "#101828",
// };

// const btnText = {
//   fontFamily: "Inter",
//   fontSize: "14px",
//   fontWeight: 600,
//   lineHeight: "20px",
//   textAlign: "left",
//   color: "#344054",
//   textTransform: "none",
// };

// const CustomPaginationItem = styled(PaginationItem, {
//   shouldForwardProp: (prop) =>
//     prop !== "isPrevOrNext" &&
//     prop !== "isPrev" &&
//     prop !== "isNext" &&
//     prop !== "selected",
// })(({ theme, isPrevOrNext, isPrev, isNext, selected }) => ({
//   borderRadius: "0", // Remove border radius for square buttons
//   border: "1px solid", // Add border
//   borderColor: "#D0D5DD", // Use theme color for border
//   margin: "0", // Ensure no margin between items
//   height: "40px", // Fixed height
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   "&:hover": {
//     backgroundColor: theme.palette.button.backgroundOnHover, // Optional: Add hover effect
//   },
//   "&:not(:first-of-type)": {
//     borderLeft: "none", // Remove left border to avoid double borders
//   },
//   "& .MuiTypography-root": {
//     fontFamily: "Inter",
//     fontSize: "14px",
//     fontWeight: isPrevOrNext ? 600 : 500,
//     lineHeight: "20px",
//     textAlign: "left",
//     color: isPrevOrNext ? "#1D2939" : "#344054", // Different color for pagination item vs previous/next button
//     paddingLeft: isPrevOrNext ? "8px" : "0", // Add padding left for previous button
//     paddingRight: isPrevOrNext ? "0" : "8px", // Add padding right for next button
//   },
//   ...(!isPrevOrNext && {
//     width: "40px", // Apply outer radius to previous and next buttons
//   }),
//   ...(isPrev && {
//     borderBottomLeftRadius: "8px",
//     borderTopLeftRadius: "8px", // Apply outer radius to previous and next buttons
//   }),
//   ...(isNext && {
//     borderBottomRightRadius: "8px",
//     borderTopRightRadius: "8px", // Apply outer radius to previous and next buttons
//   }),
//   ...(selected && {
//     backgroundColor: "#F9FAFB", // Apply outer radius to previous and next buttons
//   }),
// }));
// const ViewDataset = () => {
//   const { loadDatasetsList, datasets_list } = useDataset();
//   const {userInfo} = useAuth();
//   useEffect(() => {
//     // Ensure loadDatasetsList runs only once on mount
//     loadDatasetsList(userInfo);
//   }, []); // Empty dependency array to run once on mount

//   return (
//     <div>
//       <Box sx={{ padding: "120px 32px 32px 32px" }}>
//         <Box sx={{ border: "1px solid #EAECF0", borderRadius: "12px" }}>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               padding: "15px",
//             }}
//           >
//             <Stack direction="column" spacing={1}>
//               <Stack direction="row" spacing={1}>
//                 <Typography sx={textLgMedium}>Vendor movements</Typography>
//                 <Box
//                   sx={{
//                     padding: " 4px 8px 4px 8px",
//                     borderRadius: "16px",
//                     backgroundColor: " #F9F5FF",
//                   }}
//                 >
//                   <Typography
//                     sx={{
//                       fontFamily: "Inter",
//                       fontSize: "12px",
//                       fontWeight: 500,
//                       lineHeight: "18px",
//                       textAlign: "center",
//                       color: "#0C66E4",
//                     }}
//                   >
//                     240 Vendors
//                   </Typography>
//                 </Box>
//               </Stack>

//               <Typography
//                 sx={{
//                   fontFamily: "Inter",
//                   fontSize: "14px",
//                   fontWeight: 400,
//                   lineHeight: "20px",
//                   color: "#475467",
//                   textAlign: "left",
//                 }}
//               >
//                 Last updated: January 01, 2024 10:00 AM EST
//               </Typography>
//             </Stack>

//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 padding: "15px",
//               }}
//             >
//               <Stack spacing={1} direction="row">
//                 <Search>
//                   <SearchIconWrapper>
//                     <SearchIcon />
//                   </SearchIconWrapper>
//                   <StyledInputBase
//                     placeholder="Search"
//                     inputProps={{ "aria-label": "search" }}
//                   />
//                 </Search>
//                 <Button
//                   size="medium"
//                   sx={{ border: "1px solid #D0D5DD", padding: "10px 16px" }}
//                 >
//                   <Stack direction="row" spacing={1}>
//                     <FilterIcon />
//                     <Typography sx={btnText}>Filters</Typography>
//                   </Stack>
//                 </Button>
//               </Stack>
//             </Box>
//           </Box>
//           <Stack
//             spacing={1}
//             padding="20px 24px 19px 24px"
//             direction="row"
//             alignItems={"center"}
//           >
//             <Typography
//               sx={{
//                 fontFamily: "Inter",
//                 fontSize: "18px",
//                 fontWeight: 500,
//                 lineHeight: "28px",
//                 textAlign: "left",
//                 color: "#101828",
//               }}
//             >
//               Team Members
//             </Typography>
//             <Box
//               sx={{
//                 padding: " 2px 8px 2px 8px",
//                 borderRadius: "16px",
//                 backgroundColor: " #F9F5FF",
//                 maxHeight: "22px",
//               }}
//             >
//               <Typography
//                 sx={{
//                   fontFamily: "Inter",
//                   fontSize: "12px",
//                   fontWeight: 500,
//                   lineHeight: "18px",
//                   textAlign: "center",
//                   color: "#0C66E4",
//                 }}
//               >
//                 100 users
//               </Typography>
//             </Box>
//           </Stack>
//           <DatasetTable />
//           <Box
//             p={2}
//             sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
//           >
//             <Stack direction="row" spacing={0}>
//               <Pagination
//                 count={10}
//                 renderItem={(item) => (
//                   <CustomPaginationItem
//                     key={item.type}
//                     selected={item.selected}
//                     components={{
//                       previous: () => (
//                         <Stack direction="row" alignItems="center" spacing={1}>
//                           <ArrowBack />
//                           <Typography
//                             sx={{
//                               fontFamily: "Inter, sans-serif",
//                               fontSize: "14px",
//                               fontWeight: 600,
//                               lineHeight: "20px",
//                               textAlign: "left",
//                               color: "#475467",
//                             }}
//                           >
//                             Previous
//                           </Typography>
//                         </Stack>
//                       ),
//                       next: () => (
//                         <Stack direction="row" alignItems="center" spacing={1}>
//                           <Typography
//                             sx={{
//                               fontFamily: "Inter, sans-serif",
//                               fontSize: "14px",
//                               fontWeight: 600,
//                               lineHeight: "20px",
//                               textAlign: "left",
//                               color: "#475467",
//                             }}
//                           >
//                             Next
//                           </Typography>
//                           <ArrowForward />
//                         </Stack>
//                       ),
//                     }}
//                     {...item}
//                     isPrevOrNext={
//                       item.type === "previous" || item.type === "next"
//                     }
//                     isPrev={item.type === "previous"}
//                     isNext={item.type === "next"}
//                   />
//                 )}
//               />
//             </Stack>
//           </Box>
//         </Box>
//       </Box>
//     </div>
//   );
// };

// export default ViewDataset;
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ReactComponent as UploadCloud } from "../../../assets/Icons/download-cloud.svg";
import { ReactComponent as UploadCloudLight } from "../../../assets/Icons/download-cloud-white.svg";
import { Stack, Button } from "@mui/material";
import UploadDataDialog from "../ExperimentFlow/CreateExperimentPage/AddData/UploadDataDialog";
import Connectors from "../ExperimentFlow/CreateExperimentPage/AddData/Connectors";
import DatasetTable from "../../../components/DatasetTable";
import useConfig from "../../../hooks/useConfig";
import useAuth from "../../../hooks/useAuth";
import { useEffect } from "react";
import useDataset from "../../../hooks/useDataset";
import CustomButton from "../../../components/CustomButton";
import useDataConnection from "../../../hooks/useDataConnection";
import Connections from "../ExperimentFlow/CreateExperimentPage/AddData/Connections";
import CustomDataset from "../ExperimentFlow/CreateExperimentPage/AddData/CustomDataset";
import TGInternalDataConnection from "../../../components/TGInternalDataConnection";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import ContactSalesDialog from "../../../components/ContactSalesDialog";
import NewCustomDataset from "../ExperimentFlow/CreateExperimentPage/AddData/NewCustomDataset";
import useSession from "../../../hooks/useSession";
// import UploadDataDialog from "./UploadDataDialog";
// import Connectors from "./Connectors";
// import DatasetTable from "../../../../../components/DatasetTable";
// import useConfig from "../../../../../hooks/useConfig";

export default function ViewDataset() {
  const [uploadOtherDatasetsopen, setUploadOtherDatasetsOpen] =
    React.useState(false);
  const [viewConnectors, setviewConnectors] = React.useState(false);
  const [customDatasetOpen, setCustomDatasetOpen] = React.useState(false);
  const [tgInternalDataOpen, setTGInternalDataOpen] = React.useState(false);
  const { loadConnections, ClearData } = useDataConnection();
  const { clearSession, currentSession, terminateSession } = useSession();
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

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };
  // console.log("====================================");
  // console.log("Dataset List", datasets_list);
  // console.log("====================================");

  // useEffect(() => {
  //   console.log("Opening upload dialog, fetching datasets...");
  //   loadDatasetsList(userInfo);
  // }, [uploadOtherDatasetsopen]);

  const handleUploadOtherDatasetsOpen = () => setUploadOtherDatasetsOpen(true);
  const handleUploadOtherDatasetsClose = () =>
    setUploadOtherDatasetsOpen(false);
  const handleConnectorsOpen = async () => {
    await loadConnections(userInfo.userID);
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

    setCustomDatasetOpen(false);
  };
  const handleTGInternalDataOpen = () => setTGInternalDataOpen(true);
  const handleTGInternalDataClose = () => setTGInternalDataOpen(false);
  useEffect(() => {
    loadDatasetsList(userInfo);
  }, [uploadOtherDatasetsopen]);
  const count = datasets_list ? datasets_list.length : 0;
  // console.log("Project setup:", configState);
  return (
    <div>
      <Box sx={{ padding: "92px 24px 34px 24px" }}>
        <Box
          sx={{
            borderRadius: "12px",
            border: "1px solid #EAECF0",
            // marginBottom: "-37px",
          }}
        >
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
                isPremiumFeature={
                  currentCompany.access_tg_internal_data_connection
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
              />{" "}
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
                  uploadOtherDatasetsopen ? (
                    <UploadCloudLight />
                  ) : (
                    <UploadCloud />
                  )
                }
              />
            </Stack>
          </Box>
          <DatasetTable />
          <UploadDataDialog
            handleClose={async () => {
              await loadDatasetsList(userInfo);
              handleUploadOtherDatasetsClose();
            }}
            open={uploadOtherDatasetsopen}
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

          <TGInternalDataConnection
            handleClose={async () => {
              await loadDatasetsList(userInfo);
              handleTGInternalDataClose();
            }}
            open={tgInternalDataOpen}
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
        </Box>
      </Box>
      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales for more access."
        ConfirmButtonTitle="Contact Sales"
      />
    </div>
  );
}
