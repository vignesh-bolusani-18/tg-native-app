import React, { useContext } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { ReactComponent as CopyRight } from "../../assets/Icons/copyright.svg";
import { ThemeContext } from "../../theme/config/ThemeContext";
import CustomButton from "../CustomButton";
import {
  callQueryEngineQuery,
  clearQueryEngineCache,
  callQueryEngineDownload,
} from "../../utils/queryEngine";

const file =
  "accounts/Stylum_499afd4e-b703-47db-993d-e68273298c26/data_bucket/inventory-optimization/202505/c356f489-3a4d-4e0d-bd95-1afcf6b8f389/scenario_planning/K_best/inventory_plan/soh_data.csv";
const payloadCSV = {
  filePath:
    "accounts/Stylum_499afd4e-b703-47db-993d-e68273298c26/data_bucket/inventory-optimization/202505/c356f489-3a4d-4e0d-bd95-1afcf6b8f389/scenario_planning/K_best/inventory_plan/soh_data.csv",
  filterData: {
    dimensionFilters: {},
    columnFilter: [
      "Facility",
      "Item SKU Code",
      "cluster",
      "Style code",
      "Product Name",
      "Category",
      "Colour",
      "Size",
      "Brand",
      "Type",
      "Live date",
      "Sub category",
      "Lifestage",
      "ts_id",
      "sales_deviation_by_day",
      "age_days",
      "Age Months",
      "Current Month Sales till Date",
      "current_year_sales_tilldate",
      "current_fiscal_year_sales_tilldate",
      "sales_last7days",
      "sales_last30days",
      "sales_last60days",
      "sales_last90days",
      "total_demand",
      "Sales_Per_Day_4_W",
      "Sales Per Day",
      "Forecast_Per_Day",
      "Return_Per_Day",
      "%Return",
      "Stock_On_Hand",
      "DOI_Current_Stock",
      "Current_OOS_Date",
      "In Transit",
      "Open PO",
      "potential_stock_wastage",
      "Days on Inventory",
      "TG Ideal Inventory",
      "TG Reorder Point",
      "TG Safety Stock",
      "current_safety_stock",
      "Minimum Order Quantity",
      "round_off_reorder",
      "TG Reorder Quantity",
      "TG Reorder Date",
      "TG Reorder now",
      "Fulfillment Node",
      "TG Reorder Interval",
      "Stock_Risk_Level",
      "Excess_Stock",
      "TG Ideal Inventory Days",
      "TG Safety Stock Days",
      "lead_time",
      "Potential_Sales_Loss",
      "Dead_Stock",
      "Stock_Type",
      "stock_transfer_dict",
      "updated_Excess_Stock",
      "updated_Potential_Sales_Loss",
      "stock_transfer_po",
      "Selling Price",
      "COGS",
      "TG Reorder_Quantity_value",
      "soh_value",
      "Excess_Stock_value",
      "potential_stock_wastage_value",
      "Dead_Stock_value",
      "Potential_Sales_Loss_value",
      "Margin%",
      "column69",
      "column70",
    ],
    selectAllColumns: true,
  },
  filterConditions: null,
  groupByColumns: null,
  aggregationColumns: null,
  fetchAllRows: false,
  sortingData: null,
  paginationData: {
    batchNo: 1,
    batchSize: 50,
  },
  time: Date.now(),
};
const payloadParquet = {
  fileName: file.split("/").join("_"),
  companyName: "demotg",
  filePath: `${file}.parquet`,
  filterData: {
    dimensionFilters: { all: ["all"] },
    columnsFilter: [],
    selectAllColumns: true,
  },
  sortingData: null,
  /* paginationData: {
    batchNo: 1,
    batchSize: 50,
  }, */
  paginationData: null,
  time: Date.now(),
};

const textStyle = {
  fontFamily: "Inter",
  fontSize: "12px",
  fontWeight: "400",
  lineHeight: "24px",
  textAlign: "left",
  color: "#44546F",
};

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Box
      sx={{
        padding: "16px 45px",
        gap: "10px",
        borderTop: `1px solid ${theme.palette.borderColor.header}`,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Stack spacing={1} direction="row" alignItems="center">
        <CopyRight />
        <Typography sx={textStyle}>
          {`${new Date().getFullYear()} TrueGradient. All Rights Reserved`}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        {/*  <CustomButton
          title={"Test Parquet Query"}
          outlined
          onClick={() => callQueryEngineQuery(payloadParquet)}
        /> */}
        {/* <CustomButton
          title={"Test CSV Query"}
          outlined
          onClick={() => callQueryEngineQuery(payloadCSV)}
        /> */}
        {/*  <CustomButton
          title={"Test Parquet Download"}
          outlined
          onClick={() => callQueryEngineDownload(payloadParquet)}
        /> */}
        {/* <CustomButton
          title={"Test CSV Download"}
          outlined
          onClick={() => callQueryEngineDownload(payloadCSV)}
        />*/}
        {/* <CustomButton
          title={"Clear Cache"}
          outlined
          onClick={() => clearQueryEngineCache("08458703-5b0e-41fc-8f42-7677457d2303")}
        /> */}
      </Stack>
      <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Typography sx={textStyle}>Privacy Notice</Typography>
        <Divider
          orientation="vertical"
          sx={{ backgroundColor: "#CFD0D1", height: "24px" }}
        />
        <Typography sx={textStyle}>Terms of Use</Typography>
      </Box>
    </Box>
  );
};

export default Footer;
