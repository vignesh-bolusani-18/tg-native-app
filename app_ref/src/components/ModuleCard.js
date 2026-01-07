import React from "react";
import {
  Grid,
  Stack,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import CustomButton from "./CustomButton";
import CustomTooltip from "./CustomToolTip";

const ModuleCard = ({
  module,
  idx,
  loadingModule,
  onModuleSelection,
  gridProps = { xs: 12, sm: 6, md: 4, lg: 3 },
}) => {
  const handleClick = () => {
    onModuleSelection(module.moduleName, module.disabled, idx);
  };

  const handleButtonClick = async (e) => {
    e.stopPropagation();
    await onModuleSelection(module.moduleName, module.disabled, idx);
  };

  return (
    <Grid item {...gridProps}>
      <CustomTooltip
        title={module.disabled ? "This module is coming soon" : ""}
        arrow
        placement="top"
        disableHoverListener={!module.disabled}
      >
        <Grid
          item
          sx={{
            borderRadius: "8px",
            border: "1px solid #D0D5DD",
            backgroundColor: "#FFFFFF",
            padding: "16px",
            height: "160px", // Fixed height for all cards
            display: "flex",
            flexDirection: "column",
            "&:hover": {
              boxShadow: module.disabled
                ? "none"
                : "0px 4px 8px rgba(0, 0, 0, 0.1)",
              transform: module.disabled ? "none" : "translateY(-2px)",
              transition: "all 0.3s ease-in-out",
            },
            opacity: module.disabled ? 0.7 : 1,
                      cursor: module.disabled
            ? "not-allowed"
            : loadingModule === idx
            ? "wait"
            : "pointer",
          pointerEvents:
            loadingModule === idx ? "none" : "auto",
          }}
          onClick={handleClick}
        >
        <Stack
          justifyContent={"space-between"}
          spacing={1}
          width="100%"
          height="100%" // Ensure the stack takes full height
        >
          <Stack spacing={1}>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: "18px",
                textAlign: "left",
                color: "#101828",
              }}
            >
              {module.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "18px",
                textAlign: "left",
                color: "#44546F",
              }}
            >
              {module.description}
            </Typography>
          </Stack>
                    <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            {module.useCase && (
              <Chip
                label={module.useCase.name}
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: module.useCase.textColor,
                  backgroundColor: module.useCase.backgroundColor,
                  height: "24px",
                  "& .MuiChip-label": {
                    padding: "0 8px",
                  },
                }}
              />
            )}
            <Box sx={{ marginLeft: "auto" }}>
              <CustomButton
                title={
                  module.disabled
                    ? "Create"
                    : loadingModule === idx
                    ? "Creating..."
                    : "Create"
                }
                outlined
                disabled={module.disabled || loadingModule === idx}
                onClick={handleButtonClick}
              />
            </Box>
          </Stack>
        </Stack>
        </Grid>
      </CustomTooltip>
    </Grid>
  );
};

export default ModuleCard;
