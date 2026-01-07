import React, { useEffect } from "react";
import { Pagination, PaginationItem, Stack, Typography } from "@mui/material";

import { styled } from "@mui/material/styles";
import { Box, Button, ButtonGroup, InputBase } from "@mui/material";
import { ReactComponent as PlusIcon } from "../../../assets/Icons/plus.svg";
import { ReactComponent as FilterIcon } from "../../../assets/Icons/Filters lines.svg";
import { ReactComponent as SearchIcon } from "../../../assets/Icons/search.svg";
import ExpTable from "../../../components/ExpTable";
import { ArrowBack, ArrowForward, RefreshSharp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../../components/Search";
import useAuth from "../../../hooks/useAuth";
import useExperiment from "../../../hooks/useExperiment";
import CustomButton from "../../../components/CustomButton";
import NewExperimentDialog from "../../../components/NewExperimentDialog";
import CreateImpactPipeline from "./CreateImpactPipeline";
import useImpact from "../../../hooks/useImpact";
import ImpactPipelinesTable from "../../../components/ImpactPipelinesTable";

const CustomPaginationItem = styled(PaginationItem, {
  shouldForwardProp: (prop) =>
    prop !== "isPrevOrNext" &&
    prop !== "isPrev" &&
    prop !== "isNext" &&
    prop !== "selected",
})(({ theme, isPrevOrNext, isPrev, isNext, selected }) => ({
  borderRadius: "0", // Remove border radius for square buttons
  border: "1px solid", // Add border
  borderColor: "#D0D5DD", // Use theme color for border
  margin: "0", // Ensure no margin between items
  height: "40px", // Fixed height
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.button.backgroundOnHover, // Optional: Add hover effect
  },
  "&:not(:first-of-type)": {
    borderLeft: "none", // Remove left border to avoid double borders
  },
  "& .MuiTypography-root": {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: isPrevOrNext ? 600 : 500,
    lineHeight: "20px",
    textAlign: "left",
    color: isPrevOrNext ? "#1D2939" : "#344054", // Different color for pagination item vs previous/next button
    paddingLeft: isPrevOrNext ? "8px" : "0", // Add padding left for previous button
    paddingRight: isPrevOrNext ? "0" : "8px", // Add padding right for next button
  },
  ...(!isPrevOrNext && {
    width: "40px", // Apply outer radius to previous and next buttons
  }),
  ...(isPrev && {
    borderBottomLeftRadius: "8px",
    borderTopLeftRadius: "8px", // Apply outer radius to previous and next buttons
  }),
  ...(isNext && {
    borderBottomRightRadius: "8px",
    borderTopRightRadius: "8px", // Apply outer radius to previous and next buttons
  }),
  ...(selected && {
    backgroundColor: "#F9FAFB", // Apply outer radius to previous and next buttons
  }),
}));

const textLgMedium = {
  fontFamily: "Inter",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "28px",
  textAlign: "left",
  color: "#101828",
};

function parseString(input) {
  try {
    // Try to parse the input as JSON
    const json = JSON.parse(input);

    // If successful and it's an object or array, return it
    if (typeof json === "object" && json !== null) {
      return json.status;
    }
  } catch (e) {
    // If JSON.parse throws an error, it means input is not valid JSON
    return input;
  }

  // If input is not valid JSON, return the original string
  return input;
}

const ImpactAnalysisPage = () => {
  const navigate = useNavigate();
  const {
    loadImpactPipelines,
    impact_pipelines_list,
    openCreateImpactPipelineModal,
    setOpenCreateImpactPipelineModal,
    clearImpactPipelineForm,
  } = useImpact();
  const { userInfo, currentCompany } = useAuth();
  useEffect(() => {
    console.log("UserInfo:", userInfo);
    loadImpactPipelines(userInfo);
  }, [userInfo]); // Add userInfo to the dependency array
  const filteredImpactPipelineList = impact_pipelines_list.filter(
    (row) => !row.inTrash
  );

  const count = filteredImpactPipelineList
    ? filteredImpactPipelineList.length
    : 0;

  const handleCreateImpactPipelineOpen = () => {
    setOpenCreateImpactPipelineModal(true);
  };

  const handleCreateImpactPipelineClose = async () => {
    setOpenCreateImpactPipelineModal(false);
    clearImpactPipelineForm();
  };

  return (
    <div>
      <Box sx={{ padding: "92px 24px 34px 24px" }}>
        <Box sx={{ border: "1px solid #EAECF0", borderRadius: "12px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              gap: "16px",
              padding: "20px 24px 19px 24px",
            }}
          >
            <Stack direction="column" spacing={1} justifyContent={"center"}>
              <Stack direction="row" spacing={1}>
                <Typography sx={textLgMedium}>
                  Impact Pipelines {`(${count})`}
                </Typography>
              </Stack>
            </Stack>
            <Stack spacing={1} direction="row">
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
              <CustomButton
                onClick={() => {
                  loadImpactPipelines(userInfo);
                }}
                CustomStartAdornment={
                  <RefreshSharp fontSize="small" style={{ color: "black" }} />
                }
                title={null}
                outlined
              />
              <CustomButton
                onClick={() => {}}
                title={"Filters"}
                outlined
                CustomStartAdornment={<FilterIcon />}
              />
              <CustomButton
                onClick={handleCreateImpactPipelineOpen}
                title={"New Impact Pipeline"}
                CustomStartAdornment={<PlusIcon />}
              />
            </Stack>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexDirection: { xs: "column", md: "row" },
              // gap: "16px",

              // padding: "15px",
            }}
          ></Box>
          <ImpactPipelinesTable />

          <Box
            p={2}
            sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
          ></Box>
        </Box>
        <CreateImpactPipeline
          open={openCreateImpactPipelineModal}
          handleClose={handleCreateImpactPipelineClose}
        />
      </Box>
    </div>
  );
};

export default ImpactAnalysisPage;
