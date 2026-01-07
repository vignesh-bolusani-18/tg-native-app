import { Divider, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomSelector from "../../../../../components/CustomInputControls/CustomSelector";
import CustomDatePicker from "../../../../../components/CustomInputControls/CustomDatePicker";
import CustomCheck from "../../../../../components/CustomInputControls/CustomCheck";
import CustomButton from "./../../../../../components/CustomButton";
import useConfig from "./../../../../../hooks/useConfig";
import { dateFormats } from "../../../../../utils/Formating/dateFormating";

const subHeadingStyle = {
  color: "#475467",
  fontFamily: "Inter",
  fontWeight: "500",
  fontSize: "14px",
  lineHeight: "20px",
  // marginBottom: "6px",
};

const AddContext = () => {
  const { configState, allColumns } = useConfig();

  useEffect(() => {
    console.log("After PreExecution:", configState);
  }, []);

  //History Days
  const historyDaysMaxRange = 5000; //
  const historyDaysMinRange = 0;

  //History Days

  const activeDaysMaxRange = 5000; // Maximum allowed count value
  const activeDaysMinRange = 0;

  //Forecast Frequency

  const forecastFrequencies = ["W", "M", "Q", "D", "Y", "H", "30T", "15T"];
  const forecastFrequenciesDict = {
    W: "Weekly",
    M: "Monthly",
    Q: "Quarterly",
    D: "Daily",
    Y: "Yearly",
    H: "Hourly",
    "30T": "30 minute",
    "15T": "15 minute",
  };
  //Forecast Granularity

  const forecastGranularities = allColumns;

  //Disaggregation Granularity

  const disaggregationGranularities = allColumns;

  //Forcast Horizon

  const forcastHorizonMaxRange = 5000; // Maximum allowed count value
  const forcastHorizonMinRange = 0;

  //Inventory Optimization Granularity

  const inventoryOptGranularities = allColumns;

  // Lead Time Column

  const leadTimeColumns = allColumns;

  // Safety Stock Column

  const safetyStockColumns = allColumns;

  // Ideal DOI Column

  const idealDOIColumns = allColumns;

  // Service Level Column

  const serviceLevelColumns = allColumns;

  // MOQ Column

  const MOQColumns = allColumns;

  // Running PO Column

  const runningPOColumns = allColumns;

  // Stock Transfer Product Level

  const stockTransferProductLevelColumns = allColumns;
  // Stock Transfer Zone

  const stockTransferZoneColumns = allColumns;
  // Stock Transfer Facility Level

  const stockTransferFacilityLevelColumns = allColumns;

  // Batch ID Column

  const batchIDColumns = allColumns;

  // Expiry Date Column

  const expiryDateColumns = allColumns;
  // Expiry Date Format

  const expiryDateFormats = dateFormats;

  // Tolerance Level Column

  const toleranceLevelColumns = allColumns;

  // Forecast Rewrite Column

  const forecastRewriteColumns = allColumns;

  // Total Demand Column

  const totalDemandColumns = allColumns;

  // Cost Column

  const costColumns = allColumns;

  // Price Column

  const priceColumns = allColumns;

  // MRP Column

  const MRPColumns = allColumns;

  // Objective

  const objectives = allColumns;

  // Lead Time

  const leadTimeMaxRange = 5000;
  const leadTimeMinRange = 0;

  // Safety Stock

  const safetyStockMaxRange = 5000;
  const safetyStockMinRange = 0;

  // Ideal Days of Inventory (DOI)

  const idealDOIMaxRange = 5000;
  const idealDOIMinRange = 0;

  // Service Level

  const serviceLevelMaxRange = 5000;
  const serviceLevelMinRange = 0;

  // Minimum Order Quantity (MOQ)

  const MOQMaxRange = 5000;
  const MOQMinRange = 0;

  // Running Purchase Orders (runningPO)

  const runningPOMaxRange = 5000;
  const runningPOMinRange = 0;

  // Tolerance Level

  const toleranceLevelMaxRange = 5000;
  const toleranceLevelMinRange = 0;

  // Revenue Target Percent

  const revenueTargetPercentMaxRange = 5000;
  const revenueTargetPercentMinRange = 0;

  // Margin Target Percent

  const marginTargetPercentMaxRange = 5000;
  const marginTargetPercentMinRange = 0;

  // Minimum Price Change Percent

  const minimumPriceChangePercentMaxRange = 5000;
  const minimumPriceChangePercentMinRange = 0;
  // Maximum Price Change Percent

  const maximumPriceChangePercentMaxRange = 5000;
  const maximumPriceChangePercentMinRange = 0;

  // Margin Assumption

  const marginAssumptionMaxRange = 5000;
  const marginAssumptionMinRange = 0;

  // Number of Iterations

  const numberOfIterationsMaxRange = 5000;
  const numberOfIterationsMinRange = 0;

  // Markdown Minimum Margin Cut Factor

  const markdownMinimumMarginCutFactorMaxRange = 5000;
  const markdownMinimumMarginCutFactorMinRange = 0;

  // Markdown Step Size

  const markdownStepSizeMaxRange = 5000;
  const markdownStepSizeMinRange = 0;

  // Liquidation MMCF (Minimum Markdown Cut Factor)

  const liquidationMMCFMaxRange = 5000;
  const liquidationMMCFMinRange = 0;

  // Liquidation Step Size

  const liquidationStepSizeMaxRange = 5000;
  const liquidationStepSizeMinRange = 0;

  return (
    <Box>
      <Stack padding="20px 24px 19px 24px" gap="16px">
        <Typography sx={subHeadingStyle}>Forecasting Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <CustomDatePicker
              showLabel
              label="Select a date:"
              path="etl.activity_end_date"
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="History  Since (Days)"
              maxRange={historyDaysMaxRange}
              minRange={historyDaysMinRange}
              path="etl.history"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Active Since Days"
              path="etl.activity_period"
              maxRange={activeDaysMaxRange}
              minRange={activeDaysMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Frequency Of Forecast"
              values={forecastFrequencies}
              valuesDict={forecastFrequenciesDict}
              path="data.frequency"
            />
          </Grid>
          <Grid item xs={6} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Forecast Horizon"
              path="data.forecast_horizon"
              maxRange={forcastHorizonMaxRange}
              minRange={forcastHorizonMinRange}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Type here...."
              label="Select Granularity for Forecasting"
              values={forecastGranularities}
              isMultiSelect
              path="data.ts_id_columns"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Granularity for Disaggregation"
              isMultiSelect
              values={disaggregationGranularities}
              path="data.ts_id_columns_disagg"
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack padding="20px 24px 19px 24px" gap="24px">
        <Divider>
          <Typography sx={subHeadingStyle}>Inventory Constraints</Typography>
        </Divider>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Type here...."
              label="Select Granularity for Inventory Optimization"
              values={inventoryOptGranularities}
              isMultiSelect
              path={
                "scenario_plan.inventory_constraints.inventory_optimisation_granularity"
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select lead time column"
              values={leadTimeColumns}
              path="scenario_plan.inventory_constraints.lead_time_col"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Lead Time (Days) (*Applicable if column is not available)"
              path="scenario_plan.inventory_constraints.lead_time"
              maxRange={leadTimeMaxRange}
              minRange={leadTimeMinRange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select safety stock column"
              values={safetyStockColumns}
              path="scenario_plan.inventory_constraints.safety_stock_days_col"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Safety Stock (Days) (*Applicable if column is not available)"
              path="scenario_plan.inventory_constraints.safety_stock_days"
              maxRange={safetyStockMaxRange}
              minRange={safetyStockMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Ideal DOI column"
              values={idealDOIColumns}
              path="scenario_plan.inventory_constraints.Ideal_DOI_col"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Ideal DOI (Days) (*Applicable if column is not available)"
              path="scenario_plan.inventory_constraints.Ideal_DOI"
              maxRange={idealDOIMaxRange}
              minRange={idealDOIMinRange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Service Level column"
              values={serviceLevelColumns}
              path="scenario_plan.inventory_constraints.service_level_col"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Service Level (%) (*Applicable if column is not available)"
              path="scenario_plan.inventory_constraints.service_level"
              maxRange={serviceLevelMaxRange}
              minRange={serviceLevelMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select MOQ column"
              values={MOQColumns}
              path="scenario_plan.inventory_constraints.minimum_order_qty_col"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Minimum Order Quantity (MOQ) Value (*Applicable if column is not available)"
              path="scenario_plan.inventory_constraints.minimum_order_qty"
              maxRange={MOQMaxRange}
              minRange={MOQMinRange}
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack padding="20px 24px 19px 24px" gap="24px">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Running Purchase Order (PO) column"
              values={runningPOColumns}
              path="scenario_plan.bill_of_materials.running_purchase_order"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select Days to Running PO column"
              path="scenario_plan.bill_of_materials.days_to_running_po"
              maxRange={runningPOMaxRange}
              minRange={runningPOMinRange}
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack padding="20px 24px 19px 24px" gap="24px">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CustomCheck
              question="Enable stock Transfer?"
              direction="column" // Example direction
              path="scenario_plan.inventory_constraints.enable_stock_transfer"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Product Level of stock transfer"
              values={stockTransferProductLevelColumns}
              path="scenario_plan.inventory_constraints.stock_transfer_level"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Zone within which stock transfer will happen"
              values={stockTransferZoneColumns}
              path="scenario_plan.inventory_constraints.stock_transfer_zone"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Facility Level for stock transfer"
              values={stockTransferFacilityLevelColumns}
              path="scenario_plan.inventory_constraints.stock_transfer_facility"
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack padding="20px 24px 19px 24px" gap="24px">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="BatchID Column"
              values={batchIDColumns}
              path="data.batch_column"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Expiry Date Column"
              values={expiryDateColumns}
              path="data.expiry_date"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Expiry Date Format"
              values={expiryDateFormats}
              path="data.expiry_date_format"
              dateFormat
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Tolerance level(in Days) column"
              values={toleranceLevelColumns}
              path="scenario_plan.inventory_constraints.tolerance_level_days_col"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Tolerance level(in Days) (*Applicable if column is not available)"
              path="scenario_plan.inventory_constraints.tolerance_level_days"
              maxRange={toleranceLevelMaxRange}
              minRange={toleranceLevelMinRange}
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack padding="20px 24px 19px 24px" gap="24px">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Forecast Rewrite Column"
              values={forecastRewriteColumns}
              path="scenario_plan.forecast_rewrite"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Total Demand Column"
              values={totalDemandColumns}
              path="scenario_plan.inventory_constraints.total_demand"
            />
          </Grid>
        </Grid>
      </Stack>

      <Stack padding="20px 24px 19px 24px" gap="24px">
        <Typography sx={subHeadingStyle}>Pricing Constraints</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select cost column"
              values={costColumns}
              path="scenario_plan.pricing_constraints.cost"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select price column"
              values={priceColumns}
              path="scenario_plan.pricing_constraints.price"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select MRP (price rewrite) column"
              values={MRPColumns}
              path="scenario_plan.pricing_constraints.MRP"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              target="config"
              showLabel
              placeholder="Select"
              label="Select Objective"
              values={objectives}
              path="scenario_plan.pricing_constraints.Objective"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select Revenue Target Percent"
              path="scenario_plan.pricing_constraints.Revenue_target_Percent"
              maxRange={revenueTargetPercentMaxRange}
              minRange={revenueTargetPercentMinRange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select Margin Target Percent"
              path="scenario_plan.pricing_constraints.Margin_Target_Percent"
              maxRange={marginTargetPercentMaxRange}
              minRange={marginTargetPercentMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select minimum price change Percent"
              path="scenario_plan.pricing_constraints.Min_Price_Change"
              maxRange={minimumPriceChangePercentMaxRange}
              minRange={minimumPriceChangePercentMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select maximum price change Percent"
              path="scenario_plan.pricing_constraints.Max_Price_Change"
              maxRange={maximumPriceChangePercentMaxRange}
              minRange={maximumPriceChangePercentMinRange}
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack padding="20px 24px 19px 24px" gap="24px">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography sx={subHeadingStyle}>Advanced Settings</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select margin assumption"
              path="scenario_plan.pricing_constraints.margin_assumption"
              maxRange={marginAssumptionMaxRange}
              minRange={marginAssumptionMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select number of Iterations"
              path="scenario_plan.pricing_constraints.Iterations"
              maxRange={numberOfIterationsMaxRange}
              minRange={numberOfIterationsMinRange}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography sx={subHeadingStyle}>Markdown</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select minimum margin cut factor for Markdown"
              path="scenario_plan.pricing_constraints.mkd_margin_perc_min"
              maxRange={markdownMinimumMarginCutFactorMaxRange}
              minRange={markdownMinimumMarginCutFactorMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select step size for Markdown"
              path="scenario_plan.pricing_constraints.mkd_margin_perc_step_size"
              maxRange={markdownStepSizeMaxRange}
              minRange={markdownStepSizeMinRange}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography sx={subHeadingStyle}>Liquidation</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select minimum margin cut factor for Liquidation"
              path="scenario_plan.pricing_constraints.lqd_margin_perc_min"
              maxRange={liquidationMMCFMaxRange}
              minRange={liquidationMMCFMinRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCounter
              target="config"
              showLabel
              placeholder="Set your count"
              label="Select step size for Liquidation"
              path="scenario_plan.pricing_constraints.lqd_margin_perc_step_size"
              maxRange={liquidationStepSizeMaxRange}
              minRange={liquidationStepSizeMinRange}
            />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default AddContext;
