import React, { useEffect, useState } from "react";
import { Pagination, PaginationItem, Stack, Typography, Switch } from "@mui/material";

import { styled } from "@mui/material/styles";
import { Box, Button, ButtonGroup, InputBase, Tab } from "@mui/material";
import { ReactComponent as PlusIcon } from "../../../assets/Icons/plus.svg";
import { ReactComponent as FilterIcon } from "../../../assets/Icons/Filters lines.svg";
import { ReactComponent as SearchIcon } from "../../../assets/Icons/search.svg";
import ExpTable from "../../../components/ExpTable";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
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
import ExperimentFiltersDialog from "../../../components/ExperimentFilterDialog";
import SupplyORAutoMLDialog from "../../../components/SupplyORAutoMLDialog";

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

// Enhanced styled production toggle switch
const ProductionSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(18px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#0C66E4',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#0C66E4',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.1)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E4E7EC',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

// Styled container for the toggle and label
const ToggleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  padding: '6px 12px',
  marginRight: '24px',
  border: '1px solid #EAECF0',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#D0D5DD',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
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

const AgenticArenaPage = () => {
  const navigate = useNavigate();
  const {
    createExperiment,
    loadExperiementsList,
    experiments_list,
    filters,
    setFilters,
  } = useExperiment();
  const { userInfo, currentCompany } = useAuth();
  useEffect(() => {
    console.log("UserInfo:", userInfo);
    loadExperiementsList(userInfo);
  }, [userInfo]); // Add userInfo to the dependency array
  const filteredExpList = experiments_list.filter(
    (row) => !row.inTrash && parseString(row.experimentStatus) === "Completed"
  );

  const count = filteredExpList ? filteredExpList.length : 0;

  const [newExperimentOpen, setNewExperimentOpen] = React.useState(false);
  const [tableTabValue, setTableTabValue] = useState("liveTable");
  const handleNewExperimentOpen = () => setNewExperimentOpen(true);
  const handleNewExperimentClose = () => setNewExperimentOpen(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  const handleSearchChange = (event) => {
    setFilters.searchString(event.target.value);
  };

  // Handle production toggle change
  const handleProductionToggle = (event) => {
    setFilters.isProduction(event.target.checked);
  };

  function isFilterActive(filters) {
    return (
      filters.createdAt.startDate ||
      filters.createdAt.endDate ||
      filters.updatedAt.startDate ||
      filters.updatedAt.endDate ||
      filters.moduleNames.length > 0 ||
      filters.statuses.length > 0 ||
      filters.isProduction
    );
  }
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
                  Optimizations {`(${count})`}
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
                  onChange={handleSearchChange}
                  value={filters.searchString}
                />
              </Search>

              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CustomButton
                  onClick={() => setFiltersDialogOpen(true)}
                  title={"Filters"}
                  outlined
                  sx={{
                    position: "relative",
                    overflow: "visible",
                  }}
                  CustomStartAdornment={<FilterIcon />}
                />
                {isFilterActive(filters) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#ff4444",

                      zIndex: 2,
                    }}
                  />
                )}
              </Box>
              <CustomButton
                onClick={handleNewExperimentOpen}
                title={"New Experiment"}
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
          <TabContext value={tableTabValue}>
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: "divider",
              display: "flex", 
              flexDirection: "row", 
              justifyContent: "space-between",
              alignItems: "center" 
            }}>
              <TabList
                onChange={(e, newValue) => setTableTabValue(newValue)}
                aria-label="table tabs"
              >
                <Tab
                  label="Live"
                  value="liveTable"
                  sx={{
                    color: "#667085",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    textAlign: "left",
                    textTransform: "none",
                    "&.Mui-selected": {
                      borderBottom: "2px solid #0C66E4",
                    },
                  }}
                />
                <Tab
                  label="Archive"
                  value="archiveTable"
                  sx={{
                    color: "#667085",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    textAlign: "left",
                    textTransform: "none",
                    "&.Mui-selected": {
                      borderBottom: "2px solid #0C66E4",
                    },
                  }}
                />
              </TabList>
              
              {/* Enhanced Production Toggle Button */}
              <ToggleContainer>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: filters.isProduction ? "#0C66E4" : "#667085",
                    marginRight: "12px",
                    transition: "color 0.3s ease",
                  }}
                >
                  Production Only
                </Typography>
                <ProductionSwitch 
                  checked={filters.isProduction}
                  onChange={handleProductionToggle}
                  name="production"
                  inputProps={{ 'aria-label': 'production toggle' }}
                />
              </ToggleContainer>
            </Box>

            <TabPanel value="liveTable" sx={{ padding: "16px 0" }}>
              <ExpTable currentFlow={"optimizations"} currentTable={"live"} />
            </TabPanel>
            <TabPanel value="archiveTable" sx={{ padding: "16px 0" }}>
              <ExpTable currentFlow={"optimizations"} currentTable={"archive"} />
            </TabPanel>
          </TabContext>

          <Box
            p={2}
            sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
          ></Box>
        </Box>
        <SupplyORAutoMLDialog
          open={newExperimentOpen}
          handleClose={handleNewExperimentClose}
        />
        <ExperimentFiltersDialog
          open={filtersDialogOpen}
          handleClose={() => setFiltersDialogOpen(false)}
          experimentFiltersState={filters}
          setFilters={setFilters}
        />
      </Box>
    </div>
  );
};

export default AgenticArenaPage;