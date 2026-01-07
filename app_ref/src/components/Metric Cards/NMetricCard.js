import { Divider, Stack, Typography } from "@mui/material";
import React from "react";
import CustomTooltip from "../CustomToolTip";

const submetricTitleStyle = {
  fontFamily: "Inter",
  fontSize: "0.8rem",
  fontWeight: 600,
  lineHeight: "1rem",
  textAlign: "left",
  // color: "#101828",
  textTransform: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  // flexGrow: 1,
  color: "#626F86",
};
const submetricStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  textAlign: "left",
  color: "#101828",
};
const positiveMetricStyle = {
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
  color: "#12B76A",
};
const negativeMetricStyle = {
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
  color: "#D92D20",
};
const mainMetricStyle = {
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
};

const NMetricCard = ({ data }) => {
  
  console.log("metric 2", data.metric2);
  return (
    <Stack
      sx={{
        borderRadius: "8px",
        padding: "1rem",
        gap: "24px",
        border: "1px solid #EAECF0",
        boxShadow: "0px 1px 2px 0px #1018280D",
        backgroundColor: "#FFFFFF",
        height: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "1rem",
          fontWeight: 600,
          lineHeight: "1.5rem",
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
      <Stack
        direction={"row"}
        sx={{ gap: "12px", maxWidth: "100%", overflow: "hidden" }}
        justifyContent={"space-around"}
      >
        {data.metric1title !== undefined ? (
          <>
            {data.metric1 !== undefined ? (
              <Stack
                gap={"16px"}
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric1title}
                </Typography>
                <Stack
                  gap={"0.5rem"}
                  sx={{ maxWidth: "100%", overflow: "hidden" }}
                  alignItems={"flex-start"}
                >
                  <Typography
                    sx={
                      data.metric1[0] === "-"
                        ? negativeMetricStyle
                        : data.metric1[0] === "+"
                        ? positiveMetricStyle
                        : mainMetricStyle
                    }
                  >
                    {data.metric1}
                  </Typography>
                  {(data.subMetric1 !== undefined) &
                  (data.subMetric1 !== "0") ? (
                    <CustomTooltip title="Value" placement="right" arrow>
                      <Typography sx={submetricTitleStyle}>
                        {data.subMetric1}
                      </Typography>
                    </CustomTooltip>
                  ) : (
                    <Typography sx={submetricTitleStyle}>{` `}</Typography>
                  )}
                </Stack>
              </Stack>
            ) : (
              <Stack
                gap={"16px"}
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric1title}
                </Typography>
                <Stack
                  gap={"0.5rem"}
                  sx={{ maxWidth: "100%", overflow: "hidden" }}
                  alignItems={"flex-start"}
                >
                  <Typography
                    sx={
                      data.metric1[0] === "-"
                        ? negativeMetricStyle
                        : data.metric1[0] === "+"
                        ? positiveMetricStyle
                        : mainMetricStyle
                    }
                  >
                    --
                  </Typography>
                  <Typography sx={submetricTitleStyle}>{` `}</Typography>
                </Stack>
              </Stack>
            )}
          </>
        ) : null}

        {data.metric1title === undefined ||
        data.metric2title === undefined ? null : (
          <Divider orientation="vertical" variant="middle" flexItem />
        )}
        {data.metric2title !== undefined ? (
          <>
            {data.metric2 !== undefined ? (
              <Stack
                gap={"16px"}
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric2title}
                </Typography>
                <Stack
                  gap={"0.5rem"}
                  sx={{ maxWidth: "100%", overflow: "hidden" }}
                  alignItems={"flex-start"}
                >
                  <Typography
                    sx={
                      data.metric2[0] === "-"
                        ? negativeMetricStyle
                        : data.metric2[0] === "+"
                        ? positiveMetricStyle
                        : mainMetricStyle
                    }
                  >
                    {data.metric2}
                  </Typography>
                  {(data.subMetric2 !== undefined) &
                  ((data.subMetric2 !== "") & (data.subMetric2 !== "0")) ? (
                    <CustomTooltip title="Value" placement="right" arrow>
                      <Typography sx={submetricTitleStyle}>
                        {data.subMetric2}
                      </Typography>
                    </CustomTooltip>
                  ) : (
                    <Typography sx={submetricTitleStyle}>{` `}</Typography>
                  )}
                </Stack>
              </Stack>
            ) : (
              <Stack
                gap={"16px"}
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric2title}
                </Typography>
                <Stack
                  gap={"0.5rem"}
                  sx={{ maxWidth: "100%", overflow: "hidden" }}
                  alignItems={"flex-start"}
                >
                  <Typography
                    sx={
                      data.metric2[0] === "-"
                        ? negativeMetricStyle
                        : data.metric2[0] === "+"
                        ? positiveMetricStyle
                        : mainMetricStyle
                    }
                  >
                    --
                  </Typography>
                  <Typography sx={submetricTitleStyle}>{` `}</Typography>
                </Stack>
              </Stack>
            )}
          </>
        ) : null}

        {data.metric2title === undefined ||
        data.metric3title === undefined ? null : (
          <Divider orientation="vertical" variant="middle" flexItem />
        )}
        {data.metric3title !== undefined ? (
          <>
            {data.metric3 !== undefined ? (
              <Stack
                gap={"16px"}
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric3title}
                </Typography>
                <Stack
                  gap={"0.5rem"}
                  sx={{ maxWidth: "100%", overflow: "hidden" }}
                  alignItems={"flex-start"}
                >
                  <Typography
                    sx={
                      data.metric3[0] === "-"
                        ? negativeMetricStyle
                        : data.metric3[0] === "+"
                        ? positiveMetricStyle
                        : mainMetricStyle
                    }
                  >
                    {data.metric3}
                  </Typography>
                  {(data.subMetric3 !== undefined) &
                  (data.subMetric3 !== "") ? (
                    <CustomTooltip title="Value" placement="right" arrow>
                      <Typography sx={submetricTitleStyle}>
                        {data.subMetric3}
                      </Typography>
                    </CustomTooltip>
                  ) : (
                    <Typography sx={submetricTitleStyle}>{` `}</Typography>
                  )}
                </Stack>
              </Stack>
            ) : (
              <Stack
                gap={"16px"}
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric3title}
                </Typography>
                <Stack
                  gap={"0.5rem"}
                  sx={{ maxWidth: "100%", overflow: "hidden" }}
                  alignItems={"flex-start"}
                >
                  <Typography sx={mainMetricStyle}>--</Typography>

                  <Typography sx={submetricTitleStyle}>{` `}</Typography>
                </Stack>
              </Stack>
            )}
          </>
        ) : null}
      </Stack>
      <Stack spacing={"0.5rem"}>
        {(data.bottomMetric !== undefined) & (data.bottomMetric !== null) ? (
          <>
            <Divider />
            <Stack
              // gap={"16px"}
              sx={{ maxWidth: "100%", overflow: "hidden" }}
              alignItems={"center"}
              direction={"row"}
              justifyContent={"space-between"}
            >
              <Typography sx={submetricTitleStyle}>
                {data.bottomMetricTitle}
              </Typography>
              <Typography sx={submetricStyle}>{data.bottomMetric}</Typography>
            </Stack>
          </>
        ) : null}
      </Stack>
    </Stack>
  );
};

export default NMetricCard;
