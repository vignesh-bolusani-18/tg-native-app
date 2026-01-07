import {
  Box,
  Stack,
  Grid,
  CardContent,
  Card,
  CircularProgress,
} from "@mui/material";

import Typography from "@mui/material/Typography";
import { ReactComponent as DangerIcon } from "../../../../../assets/Icons/DangerIcon.svg";
import { ReactComponent as WarningIcon } from "../../../../../assets/Icons/WarningIcon.svg";
import { ReactComponent as SafeIcon } from "../../../../../assets/Icons/SafeIcon.svg";
import CustomSelector from "../../../../../components/CustomInputControls/CustomSelector";
import InventoryReorderPlanTable from "../../../../../components/InventoryReorderPlanTable";
import CustomButton from "../../../../../components/CustomButton";
import { useState, useEffect } from "react";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import InventoryMetricCard from "../../../../../components/Metric Cards/InventoryMetricsCard";
import useAuth from "../../../../../hooks/useAuth";
import useDashboard from "../../../../../hooks/useDashboard";
import {
  downloadFileUsingPreSignedURL,
  downloadParquetFileUsingPreSignedURL,
} from "../../../../../redux/actions/dashboardActions";
import { fetchCSVFromS3 } from "../../../../../utils/s3Utils";
import useExperiment from "../../../../../hooks/useExperiment";

const BoxComponent = ({ title, description, icon: Icon, percentage, data }) => {
  const [loading, setLoading] = useState(false);
  const { currentCompany } = useAuth();
  const { userInfo } = useAuth();
  const { experimentBasePath, hasParquetFiles } = useDashboard();

  const InvFileNameDict = {
    Stockout:
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_StockOut`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Critical Stock":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_CriticalStock`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Low Inventory":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_LowInventory`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Stable Stock":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_Stable`
        .split(".csv")[0]
        .split("/")
        .join("_"),
    "Excess Stock":
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_ExcessStock`
        .split(".csv")[0]
        .split("/")
        .join("_"),
  };
  const InvFileNamePathDict = {
    Stockout: `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_StockOut.csv`,
    "Critical Stock": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_CriticalStock.csv`,
    "Low Inventory": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_LowInventory.csv`,
    "Stable Stock": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_Stable.csv`,
    "Excess Stock": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/StockRisk_Deadstock_Info/RiskLevel_ExcessStock.csv`,
  };
  const titleRiskLevelDict = {
    Stockout: "StockOut",
    "Critical Stock": "CriticalStock",
    "Low Inventory": "LowInventory",
    "Stable Stock": "Stable",
    "Excess Stock": "ExcessStock",
  };
  // Add new state for caching status
  const [isCached, setIsCached] = useState(false);

  const handleDownload = async () => {
    setLoading(true); // Set loading state to true when download starts
    console.log("Downloading file...");
    const title = data.title;

    const fileName = InvFileNameDict[title];
    const newFileName =
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data`
        .split(".csv")[0]
        .split("/")
        .join("_");
    const newFilePath = `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`;
    const filterData = {
      dimensionFilters: { Stock_Risk_Level: titleRiskLevelDict[title] },
      columnFilter: [],
      selectAllColumns: true,
    };
    const filePath = InvFileNamePathDict[title];
    /* const faltu_data = await fetchCSVFromS3(
      filePath,
      "",
      true,
      userInfo.userID,
      true
    ); //for having cache */

    // Add 3 second delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const tokenPayload = {
      fileName,
      companyName: currentCompany.companyName,
      filterData,
    };
    const newTokenPayload = {
      fileName: newFileName,
      companyName: currentCompany.companyName,
      filterData,
    };
    const tokenPayloadForParquet = {
      filePath,
      fileName,
      companyName: currentCompany.companyName,
      filterData,
      paginationData: null,
      sortingData: null,
    };
    const newTokenPayloadForParquet = {
      filePath: newFilePath,
      fileName: newFileName,
      companyName: currentCompany.companyName,
      filterData,
      paginationData: null,
      sortingData: null,
    };

    try {
      await downloadParquetFileUsingPreSignedURL(
        tokenPayloadForParquet,
        title,
        userInfo.userID
      );

      console.log("File download initiated :", tokenPayload);
    } catch (error) {
      console.error("Error during file download:", error);
      await downloadParquetFileUsingPreSignedURL(
        newTokenPayloadForParquet,
        title,
        userInfo.userID
      );
    } finally {
      setLoading(false); // Set loading state to false when download finishes
    }
  };
  return (
    <Card
      onClick={handleDownload}
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        height: "100%",
        position: "relative",
        "& .MuiCard-root": {
          padding: 0,
        },
        "& .MuiCardContent-root": {
          paddingBottom: "0px",
        },
        boxShadow: "0px 2px 2px #1018280D",
      }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 1,
          }}
        >
          <Stack spacing={1} alignItems="center">
            <CircularProgress size={30} />
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#344054",
              }}
            >
              Downloading...
            </Typography>
          </Stack>
        </Box>
      )}
      <InventoryMetricCard data={data} />
    </Card>
  );
};

const InventoryHealth = ({ inventoryMetrics }) => {
  const [selectedValues, setSelectedValues] = useState({});
  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
  console.log(inventoryMetrics);
  const boxContent = [
    {
      icon: DangerIcon,
      subHeading: "Projected Lost Sales",
      title: "Stockout",
      percentage: inventoryMetrics.percentages.stockout_pct,
      metricCount: ` ${inventoryMetrics.counts.stockout}`,
      combination: `${inventoryMetrics.counts.stockout}`,
      unit: `${inventoryMetrics.units.stockout}`,
      value:
        inventoryMetrics.values.stockout === "0"
          ? "0"
          : `${inventoryMetrics.currency ? inventoryMetrics.currency : ""} ${
              inventoryMetrics.values.stockout
            }`,
      action: "Reorder Today",
      description: `Combinations at risk ⇢ ${inventoryMetrics.counts.stockout} \n
                      Est. Sales Loss Units ⇢ ${inventoryMetrics.units.stockout} \n
                      Est. Sales Loss Value ⇢ ${inventoryMetrics.values.stockout} \n
                      Action: Reorder Today`,
      completed: false,
      bar_metric: inventoryMetrics.percentages.stockout_pct,
      metric_theme: "error",
    },
    {
      icon: WarningIcon,
      subHeading: "Projected Lost Sales",

      title: "Critical Stock",
      percentage: inventoryMetrics.percentages.critical_pct,
      metricCount: ` ${inventoryMetrics.counts.critical_stock}`,
      combination: `${inventoryMetrics.counts.critical_stock}`,
      unit: `${inventoryMetrics.units.critical_stock}`,
      value:
        inventoryMetrics.values.critical_stock === "0"
          ? "0"
          : `${inventoryMetrics.currency ? inventoryMetrics.currency : ""} ${
              inventoryMetrics.values.critical_stock
            }`,
      action: "Reorder/Plan Price Increase",

      description: `Combinations at risk ⇢ ${inventoryMetrics.counts.critical_stock} \n
                      Est. Sales Loss Units ⇢ ${inventoryMetrics.units.critical_stock} \n
                      Est. Sales Loss Value ⇢ ${inventoryMetrics.values.critical_stock} \n
                      Action: Reorder/Plan Price Increase`,
      completed: false,
      bar_metric: inventoryMetrics.percentages.critical_pct,
      metric_theme: "warning",
    },
    {
      icon: WarningIcon,
      title: "Low Inventory",
      subHeading: "Projected Lost Sales",

      percentage: inventoryMetrics.percentages.low_pct,
      metricCount: ` ${inventoryMetrics.counts.low_inventory}`,
      combination: `${inventoryMetrics.counts.low_inventory}`,
      unit: `${inventoryMetrics.units.low_inventory}`,
      value:
        inventoryMetrics.values.low_inventory === "0"
          ? "0"
          : `${inventoryMetrics.currency ? inventoryMetrics.currency : ""} ${
              inventoryMetrics.values.low_inventory
            }`,
      action: "Reorder Soon",

      description: `Combinations at risk ⇢ ${inventoryMetrics.counts.low_inventory} \n
                      Est. Sales Loss Units ⇢ ${inventoryMetrics.units.low_inventory} \n
                      Est. Sales Loss Value ⇢ ${inventoryMetrics.values.low_inventory} \n
                      Action: Reorder Soon`,
      completed: false,
      bar_metric: inventoryMetrics.percentages.low_pct,
      metric_theme: "info",
    },
    {
      icon: SafeIcon,
      title: "Stable Stock",
      subHeading: "Current Stable Inventory",

      percentage: inventoryMetrics.percentages.stable_pct,
      metricCount: ` ${inventoryMetrics.counts.stable_stock}`,
      combination: `${inventoryMetrics.counts.stable_stock}`,
      unit: `${inventoryMetrics.units.stable_stock}`,
      value:
        inventoryMetrics.values.stable_stock === "0"
          ? "0"
          : `${inventoryMetrics.currency ? inventoryMetrics.currency : ""} ${
              inventoryMetrics.values.stable_stock
            }`,
      action: "No Action Required",

      description: `Stable Combinations ⇢ ${inventoryMetrics.counts.stable_stock} \n
                      Current SOH Units ⇢ ${inventoryMetrics.units.stable_stock} \n
                      Current SOH Value ⇢ ${inventoryMetrics.values.stable_stock} \n
                      Action: No Action Required`,
      completed: false,
      bar_metric: inventoryMetrics.percentages.stable_pct,
      metric_theme: "success",
    },
    {
      icon: DangerIcon,
      title: "Excess Stock",
      subHeading: "Current Excess Inventory",

      percentage: inventoryMetrics.percentages.excess_pct,
      metricCount: ` ${inventoryMetrics.counts.excess_stock}`,
      combination: `${inventoryMetrics.counts.excess_stock}`,
      unit: `${inventoryMetrics.units.excess_stock}`,
      value:
        inventoryMetrics.values.excess_stock === "0"
          ? "0"
          : `${inventoryMetrics.currency ? inventoryMetrics.currency : ""} ${
              inventoryMetrics.values.excess_stock
            }`,
      action: "Markdown/Liquidate Stock",

      description: `Combinations in excess ⇢ ${inventoryMetrics.counts.excess_stock} \n
                      Est. Excess Stock Units ⇢ ${inventoryMetrics.units.excess_stock} \n
                      Est. Excess Stock Value ⇢ ${inventoryMetrics.values.excess_stock} \n
                      Action: Markdown/Liquidate Stock`,
      completed: false,
      bar_metric: inventoryMetrics.percentages.excess_pct,
      metric_theme: "error",
    },
  ];

  return (
    <Box>
      <Grid container spacing={3} padding={"12px 16px 12px 16px"}>
        {boxContent.map((box) => {
          return (
            <Grid item xs={12} md={2.4} key={box.id}>
              <BoxComponent
                icon={box.icon}
                title={box.title}
                percentage={box.percentage}
                description={box.description}
                id={box.id}
                data={box}
              />
            </Grid>
          );
        })}
      </Grid>
      {/* <Stack
        direction={"row"}
        alignItems={"center"}
        // justifyContent={"space-between"}
        // border={"1px solid"}
        display={"flex"}
        sx={{
          padding: "12px 16px 12px 16px",
          gap: "16px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            textAlign: "left",
            color: "#101828",
            // justifyContent:'flex-start'
          }}
        >
          Inventory Reorder Plan
        </Typography>
        <Stack
          sx={{ flexDirection: { xs: "column", md: "row" } }}
          spacing={2}
          // alignItems={"center"}
          display={"flex"}
          // border={"1px solid"}
          // width={"100%"}
          justifyContent={"flex-end"}
          justifySelf={"flex-end"}
          marginLeft={"auto"}
        >
          <Stack
            direction={"row"}
            spacing={2}

            // display={"flex"}
            // width={"60%"}
            // justifyContent={"flex-end"}
          >
            <Box>
              <CustomAutocomplete
                placeholder="Select Aggregation Level"
                values={options}
                isMultiSelect={false}
              />
            </Box>
            <CustomButton
              title="Clear"
              onClick={() => {}}
              backgroundColor="#FFFF"
              borderColor="#D0D5DD"
              textColor="#344054"
            />
            <CustomButton
              title="Download"
              onClick={() => {}}
              backgroundColor="#0C66E4"
              borderColor="#0C66E4"
              textColor={"#FFF"}
            />
          </Stack>
        </Stack>
      </Stack> */}

      {/* <Stack
        direction="row"
        alignItems="center"
        sx={{
          padding: "12px 16px 12px 16px",
          gap: "16px",
          // borderBottom: "1px solid", // Border for the Stack
        }}
      >
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
          Inventory Reorder Plan
        </Typography>
        <Stack direction="row" spacing={2} alignItems={"center"} marginLeft={'auto'}>
          <CustomSelector
            placeholder="Select Aggregation Level"
            values={options}
            isMultiSelect={false}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
          />
          <Button
            size="medium"
            sx={{
              border: "1px solid #D0D5DD",
              borderRadius: "8px",
              padding: "10px 16px",
              maxHeight: "40px",
            }}
          >
            <Stack direction="row" spacing={1}>
              <Typography sx={btnText}>Clear</Typography>
            </Stack>
          </Button>

          <Button
            variant="contained"
            sx={{
              border: "1px solid #0C66E4",
              borderRadius: "8px",
              backgroundColor: "#0C66E4",
              padding: "10px 16px",
              maxHeight: "40px",
            }}
          >
            <Stack spacing={1} direction="row" alignItems={"center"}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "center",
                  color: "#FFFFFF",
                  textAlign: "left",
                  textTransform: "none",
                }}
              >
                Download
              </Typography>
            </Stack>
          </Button>
        </Stack>
      </Stack> */}
    </Box>
  );
};

export default InventoryHealth;
