import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import React from "react";
import CustomButton from "../../../../components/CustomButton";
import CustomSelector from "../../../../components/CustomInputControls/CustomSelector";
import Planogram from "../../../../assets/Images/Planogram.png";
import PlanogramTable from "../../../../assets/Images/planogramtable.png";
import AssortmentDataTable from "./AssortmentDataTable";
const btnText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
};

const DashAssortmentOptimization = () => {
  const [selectedValues, setSelectedValues] = React.useState({});
  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];

  return (
    <Stack gap={2}>
      <Stack direction={"row"} sx={{ padding: "12px 16px 12px 16px" }} gap={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3.9}>
            <CustomSelector
              showLabel
              label="Select Floor"
              placeholder="G"
              values={options}
              isMultiSelect={false}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
            />
          </Grid>
          <Grid item xs={12} md={3.9}>
            <CustomSelector
              showLabel
              label="Select MOD"
              placeholder="MOM"
              values={options}
              isMultiSelect={false}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
            />
          </Grid>
          <Grid item xs={12} md={3.9}>
            <CustomSelector
              showLabel
              label="Select Horizontal Shelf"
              placeholder="C2-10"
              values={options}
              isMultiSelect={false}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} alignItems={"flex-end"}>
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

          <CustomButton
            title="Download"
            onClick={() => {}}
            backgroundColor="#0C66E4"
            borderColor="#0C66E4"
            textColor={"#FFF"}
          />
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2} p={"20px 24px 19px 24px"}>
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
          Colouring based on Product
        </Typography>
      </Stack>
      <Grid container spacing={2} p={2}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: "230px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0px 4px 6px -2px #10182808",
              boxShadow: "0px 12px 16px -4px #10182814",
              border: "1px solid #EAECF0",
              borderRadius: "16px",
            }}
          >
            <img src={Planogram} alt="planogram"/>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: "230px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0px 4px 6px -2px #10182808",
              boxShadow: "0px 12px 16px -4px #10182814",
              border: "1px solid #EAECF0",
              borderRadius: "16px",
            }}
          >
            <img src={PlanogramTable} alt="planogramtable"/>
          </Box>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2} p={"20px 24px 19px 24px"}>
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
          Drill Down Data
        </Typography>
      </Stack>
      <AssortmentDataTable />
    </Stack>
  );
};

export default DashAssortmentOptimization;
