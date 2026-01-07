import React, { useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ReactComponent as Solution } from "../../assets/Icons/solution.svg";
import { ReactComponent as SolutionDark } from "../../assets/Icons/solution_dark.svg";
import { ReactComponent as Home } from "../../assets/Icons/home.svg";
import { ReactComponent as CheckSquare } from "../../assets/Icons/check-square.svg";
import { ReactComponent as Flag } from "../../assets/Icons/flag.svg";
import { ReactComponent as Layers } from "../../assets/Icons/3-layers.svg";
import { ReactComponent as Support } from "../../assets/Icons/support.svg";
import { ReactComponent as Deployements } from "../../assets/Icons/DeploymentIcon.svg";
import { ReactComponent as Admin } from "../../assets/Icons/admin.svg";
import { ReactComponent as Settings } from "../../assets/Icons/settings.svg";
import useAuth from "../../hooks/useAuth";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDataset from "../../hooks/useDataset";
import CardDialog from "../../components/Dialog/Dialog";
import useExperiment from "../../hooks/useExperiment";
import CustomButton from "../../components/CustomButton";
import CustomTooltip from "../../components/CustomToolTip";
import AddIcon from "@mui/icons-material/Add";
import ModuleCard from "../../components/ModuleCard";

const styles = {
  mainTypo: {
    fontFamily: "Inter",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "24px",
    textAlign: "left",
    color: "#44546F",
    whiteSpace: "nowrap", // Prevents wrapping
    overflow: "hidden", // Hides overflowed content
    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
    maxWidth: "100%", // Ensures the text does not exceed the container
  },
  subTypo: {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
    textAlign: "justify",
    color: "#626F86",
    whiteSpace: "pre-line",
    // whiteSpace: "nowrap", // Prevents wrapping
    overflow: "hidden", // Hides overflowed content
    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
    maxWidth: "100%", // Ensures the text does not exceed the container
  },
};
const supplyChainModules = [
  // {
  //   title: "Advanced Planning System (APS)",
  //   description:
  //     "Optimize strategic and operational planning for e-commerce/D2C brands in an interconnected manner to include demand forecasting, managing inventory levels, promotion strategies, markdown timing, and assortment plans.",
  //   moduleName: "inventory-optimization",
  // },
  {
    title: "Demand Planning / Time Series Forecasting",
    description:
      "Predict future demand for a product or service by analyzing historical sales data, market trends, seasonality, external factors, events, and  other relevant factors.",
    moduleName: "demand-planning",
    isComingSoon: false,
  },
  {
    title: "Inventory Planning",
    description:
      "This involves optimizing inventory levels based on forecasted demand  to guarantee products are accessible when and where required, thereby reducing instances of both stockouts and surplus inventory.",
    moduleName: "inventory-optimization",
    isComingSoon: false,
  },
  {
    title: "Price & Promotion Planning",
    description:
      "Optimize the efficiency of pricing and promotional approaches to enhance  return on investment (ROI) while considering business parameters such as sell-through targets & budget constraints.",
    moduleName: "pricing-promotion-optimization",
    isComingSoon: false,
  },
  {
    title: "Assortment Planning",
    description:
      "Optimize store product assortment by considering size, characteristics,  location, and customer preferences. Account for halo and cannibalization  effects.",
    moduleName: "assortment-planning",
    isComingSoon: false,
  },
];
const sectionList = [
  { title: "Supply Chain Modules", modules: supplyChainModules },
];
const HomePage = () => {
  console.log("HomePage is called");
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { userInfo } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const { createExperiment } = useExperiment();

  const handleClickOpen = async (card, userID) => {
    await createExperiment(card.moduleName, userID);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCard(null);
  };
  return (
    <Box
      sx={{
        flexGrow: 1,
        margin: "72px 0px 32px 0px", // Adjusted top margin to account for AppBar height
        ml: { md: "264px" },
        p: 3,
      }}
    >
      <Grid
        container
        sx={{ display: "flex", flexDirection: { md: "row" }, gap: "24px" }}
      >
        {sectionList.map((section, index) => (
          <Grid item xs={12} key={index}>
            {/* <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#101828",
                textAlign: "left",
                lineHeight: "2.5rem",
                paddingBottom: "0.5rem",
                paddingLeft: "1rem",
              }}
            >
              {section.title}
            </Typography>
            <Divider orientation="horizontal" sx={{marginBottom:'1rem'}}/> */}
            <Grid container spacing={3}>
              {section.modules.map((card, index) => (
                <ModuleCard
                  card={card}
                  index={index}
                  handleClickOpen={() => handleClickOpen(card, userInfo.userID)}
                />
              ))}
            </Grid>
          </Grid>
        ))}
        {/* <Grid item xs={12}>
          <Grid container spacing={3}>
            {supplyChainModules.map((card, index) => (
              <Grid item md={6} xs={12} key={card.title}>
                <CustomTooltip
                  title={`Create the ${card.title} Experiment`}
                  arrow
                  placement={index < 2 ? "top" : "bottom"}
                >
                  <Card
                    onClick={() => handleClickOpen(card, userInfo.userID)}
                    sx={{
                      border: "1px solid",
                      borderColor: theme.palette.borderColor.solutionCard,
                      boxShadow: "none",
                      height: "100%",
                      "&:hover": {
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                        transform: "translateY(-2px)",
                        transition: "all 0.3s ease-in-out",
                      },
                      cursor: "pointer",
                      maxWidth: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent={"space-between"}
                      sx={{
                        borderRadius: "3px 3px 0 0",
                        paddingLeft: "2rem",
                        paddingRight: "1rem",
                        backgroundColor: theme.palette.background.paper,
                        height: "64px",
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <Stack
                        direction={"row"}
                        spacing={1}
                        alignItems="center"
                        sx={{
                          maxWidth: "100%",
                          overflow: "hidden",
                          backgroundColor: "transparent",
                        }}
                      >
                        {theme.palette.mode === "light" ? (
                          <Solution />
                        ) : (
                          <SolutionDark />
                        )}
                        <Typography sx={styles.mainTypo}>
                          {card.title}
                        </Typography>
                      </Stack>
                      <IconButton
                        onClick={() => handleClickOpen(card, userInfo.userID)}
                      >
                        <AddIcon style={{ color: "#0C66E4" }} />
                      </IconButton>
                    </Stack>
                    <CardContent
                      sx={{
                        paddingLeft: "40px",
                        backgroundColor: theme.palette.background.default,
                        height: "100%",
                      }}
                    >
                      <Typography sx={styles.subTypo}>
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </CustomTooltip>
              </Grid>
            ))}
          </Grid>
        </Grid> */}
      </Grid>
      {selectedCard && (
        <CardDialog
          open={open}
          onClose={handleClose}
          selectedCard={selectedCard}
        />
      )}
    </Box>
  );
};

export default HomePage;
