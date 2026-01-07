import { Divider, Stack, Typography } from "@mui/material";
import React from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CustomTooltip from "../CustomToolTip";
import { ArrowBack } from "@mui/icons-material";
const submetricTitleStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  textAlign: "left",
  color: "#626F86",
};
const submetricStyle = {
  fontFamily: "Inter",
  fontSize: "0.9rem",
  fontWeight: 500,
  lineHeight: "0.9rem",
  textAlign: "left",
  color: "#626F86",
  textTransform: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  // flexGrow: 1,
};
const actionStyle = {
  fontFamily: "Inter",
  fontSize: "0.8rem",
  fontWeight: 600,
  lineHeight: "0.8rem",
  textAlign: "left",
  color: "#626F86",
  textTransform: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  flexGrow: 1,
};
const InventoryMetricCard = ({ data }) => {
  const Icon = data.icon;
  console.log("metric 2", data.metric2);
  return (
    <Stack
      spacing={"1.5rem"}
      sx={{
        borderRadius: "8px",
        padding: "1rem",
        // gap: "1rem",
        border: "1px solid #EAECF0",
        boxShadow: "0px 1px 2px 0px #1018280D",
        backgroundColor: "#FFFFFF",
        height: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{ maxWidth: "100%", overflow: "hidden", flexWrap: "nowrap" }}
      >
        <Stack
          direction={"row"}
          spacing={1}
          alignItems={"center"}
          sx={{ overflow: "hidden" }}
        >
          <Icon sx={{ fontSize: "1.5rem" }} />
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "1rem",
              fontWeight: 600,
              lineHeight: "1rem",
              textAlign: "left",
              color: "#101828",
              textTransform: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              flexGrow: 1,
            }}
          >
            {data.title}
          </Typography>
        </Stack>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: "#EAECF0",
            borderWidth: "1px",
            marginX: "2px",
            display: { xs: "none", md: "block" },
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "clamp(1.2rem, 1.6vw, 1.6rem)", // Reduced by 80%
            lineHeight: "clamp(1.2rem, 1.6vw, 2.2rem)", // Reduced by 80%
            fontWeight: 600,
            textAlign: "left",
            textTransform: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
            color: "#101828",
          }}
        >
          {data.percentage}
        </Typography>
      </Stack>

      <Stack
        sx={{ maxWidth: "100%", overflow: "hidden", flexWrap: "nowrap" }}
        paddingLeft={"0.5rem"}
        spacing="1rem"
      >
        <Stack
          sx={{ maxWidth: "100%", overflow: "hidden", flexWrap: "nowrap" }}
          paddingLeft={"0.5rem"}
          spacing="1.5rem"
        >
          <Stack
            spacing="0.6rem"
            sx={{
              overflow: "hidden",
              maxWidth: "100%",
              flexWrap: "nowrap",
              alignItems: "flex-start",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "0.8rem",
                fontWeight: 600,
                lineHeight: "0.8rem",
                textAlign: "left",
                color: "#101828",
                textTransform: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                flexGrow: 1,
              }}
            >
              {data.subHeading}
            </Typography>
            <Stack
              alignItems={"flex-start"}
              spacing={"0.5rem"}
              width={"100%"}
              paddingLeft={"1rem"}
            >
              <CustomTooltip title="Units" placement="right" arrow>
                <Typography
                  sx={{
                    fontSize: "clamp(1.2rem, 1.6vw, 1.6rem)", // Reduced by 80%
                    lineHeight: "clamp(1.2rem, 1.6vw, 2.2rem)", // Reduced by 80%
                    fontFamily: "Inter",
                    fontWeight: 600,
                    textAlign: "left",
                    color: "#101828",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    flexGrow: 1,
                  }}
                >
                  {data.unit}
                </Typography>
              </CustomTooltip>
              {(data.value !== "null") && (data.value !== "0") ? (
                <CustomTooltip title="Value" placement="right" arrow>
                  <Typography sx={submetricStyle}>{`${data.value}`}</Typography>
                </CustomTooltip>
              ) : (
                <Typography sx={submetricStyle}></Typography>
              )}
            </Stack>
          </Stack>
          <Stack
            width="80%"
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            sx={{ maxWidth: "100%", overflow: "hidden", flexWrap: "nowrap" }}
            paddingRight="0.5rem"
          >
            <Typography sx={submetricTitleStyle}># Combinations</Typography>
            <Typography sx={submetricStyle}>{data.combination}</Typography>
          </Stack>
        </Stack>

        <Divider />

        <Stack
          // direction={"row"}
          spacing={1}
          alignItems={"center"}
          marginTop={"2px"}
          justifyItems={"center"}
          // border={"1px solid"}
          width="100%"
        >
          <Stack direction={"row"} spacing={1}>
            <AutoAwesomeIcon style={{ color: "#626F86", fontSize: "0.8rem" }} />
            <Typography sx={actionStyle}>{data.action}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default InventoryMetricCard;
