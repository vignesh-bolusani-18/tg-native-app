import React, { useContext } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { ReactComponent as CopyRight } from "../../assets/Icons/copyright.svg";
import { ThemeContext } from "../../theme/config/ThemeContext";

const textStyle = {
  fontFamily: "Inter",
  fontSize: "12px",
  fontWeight: "400",
  lineHeight: "24px",
  color: "#44546F",
};

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Box
      sx={{
        padding: "16px 45px",
        gap: "10px",
        borderTop: "1px solid",
        borderColor: theme.palette.borderColor.header,
        height: "56px",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Stack spacing={1} direction="row" alignItems="center">
          <CopyRight />
          <Typography sx={textStyle}>
            2024 True Gradient. All Rights Reserved
          </Typography>
        </Stack>

        <Box sx={{ display: "flex", gap: "12px", flexDirection: "row" }}>
          <Typography sx={textStyle}>Privacy Notice</Typography>
          <Divider orientation="vertical" sx={{ color: "#CFD0D1" }} />
          <Typography sx={textStyle}>Terms of Use</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
