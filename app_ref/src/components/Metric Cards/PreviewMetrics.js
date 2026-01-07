import { Divider, Stack, Typography } from "@mui/material";
import React from "react";
import CustomTooltip from "../CustomToolTip";

const submetricTitleStyle = {
  fontFamily: "Inter",
  fontSize: "0.75rem", // Reduced from 0.8rem
  fontWeight: 600,
  lineHeight: "0.9rem", // Reduced from 1rem
  textAlign: "left",
  textTransform: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  color: "#626F86",
};

const submetricStyle = {
  fontFamily: "Inter",
  fontSize: "13px", // Reduced from 14px
  fontWeight: 600,
  lineHeight: "16px", // Reduced from 20px
  textAlign: "left",
  color: "#101828",
};

const positiveMetricStyle = {
  fontFamily: "Inter",
  fontSize: "clamp(1rem, 1.4vw, 1.3rem)", // Reduced further
  lineHeight: "clamp(1rem, 1.4vw, 1.6rem)", // Reduced further
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
  fontSize: "clamp(1rem, 1.4vw, 1.3rem)", // Reduced further
  lineHeight: "clamp(1rem, 1.4vw, 1.6rem)", // Reduced further
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
  fontSize: "clamp(1rem, 1.4vw, 1.3rem)", // Reduced further
  lineHeight: "clamp(1rem, 1.4vw, 1.6rem)", // Reduced further
  fontWeight: 600,
  textAlign: "left",
  textTransform: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  color: "#101828",
};

const PreviewMetricCards = ({ data }) => {
  
  console.log("metric 2", data.metric2);
  return (
    <Stack
      sx={{
        borderRadius: "8px",
        padding: "0.75rem", // Reduced from 1rem
        gap: "12px", // Reduced from 24px
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
          fontSize: "0.9rem", // Reduced from 1rem
          fontWeight: 600,
          lineHeight: "1.2rem", // Reduced from 1.5rem
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
        sx={{ gap: "8px", maxWidth: "100%", overflow: "hidden" }} // Reduced gap from 12px
        justifyContent={"space-around"}
      >
        {data.metric1title !== undefined ? (
          <>
            {data.metric1 !== undefined ? (
              <Stack
                gap={"8px"} // Reduced from 16px
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric1title}
                </Typography>
                <Stack
                  gap={"0.25rem"} // Reduced from 0.5rem
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
                gap={"8px"} // Reduced from 16px
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric1title}
                </Typography>
                <Stack
                  gap={"0.25rem"} // Reduced from 0.5rem
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
                gap={"8px"} // Reduced from 16px
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric2title}
                </Typography>
                <Stack
                  gap={"0.25rem"} // Reduced from 0.5rem
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
                gap={"8px"} // Reduced from 16px
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric2title}
                </Typography>
                <Stack
                  gap={"0.25rem"} // Reduced from 0.5rem
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
                gap={"8px"} // Reduced from 16px
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric3title}
                </Typography>
                <Stack
                  gap={"0.25rem"} // Reduced from 0.5rem
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
                gap={"8px"} // Reduced from 16px
                sx={{ maxWidth: "100%", overflow: "hidden" }}
                alignItems={"center"}
              >
                <Typography sx={submetricTitleStyle}>
                  {data.metric3title}
                </Typography>
                <Stack
                  gap={"0.25rem"} // Reduced from 0.5rem
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
      <Stack spacing={"0.25rem"}> {/* Reduced from 0.5rem */}
        {(data.bottomMetric !== undefined) & (data.bottomMetric !== null) ? (
          <>
            <Divider />
            <Stack
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

export default PreviewMetricCards;