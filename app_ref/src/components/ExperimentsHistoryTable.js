import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { ReactComponent as File } from "../assets/Icons/file_Icon.svg";
import { ThemeContext } from "../theme/config/ThemeContext";
import useExperiment from "../hooks/useExperiment";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F9FAFB",
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.default,
  },
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease-in-out",
    backgroundColor: "#F9F5FF",
    borderTop: "1px solid #D6BBFB",
    borderBottom: "1px solid #D6BBFB",
  },
}));

export default function ExperimentsHistoryTable({
  experimentsHistory,
  onRemoveExperiment,
}) {
  const { theme } = React.useContext(ThemeContext);
  const { experiments_list } = useExperiment();

  // Helper function to extract experiment ID from path
  const getExperimentIdFromPath = (expPath) => {
    if (!expPath) return null;
    const pathParts = expPath.split("/");
    return pathParts[pathParts.length - 1];
  };

  // Helper function to get experiment name by ID
  const getExperimentNameById = (experimentId) => {
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experimentId
    );
    return experiment ? experiment.experimentName : "Unknown Experiment";
  };

  // Helper function to get experiment module name by ID
  const getExperimentModuleById = (experimentId) => {
    const experiment = experiments_list.find(
      (exp) => exp.experimentID === experimentId
    );
    return experiment ? experiment.experimentModuleName : "Unknown Module";
  };

  if (!experimentsHistory || experimentsHistory.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <TableContainer
        component={Box}
        sx={{
          maxHeight: "300px", // Fixed height for scrollable area
          overflow: "auto",
          border: "1px solid #EAECF0",
          borderRadius: "8px",
        }}
      >
        <Table
          stickyHeader // Makes header sticky
          sx={{
            "& .MuiTableCell-root": {
              padding: "16px",
              alignContent: "center",
              justifyContent: "center",
            },
          }}
          aria-label="forecast data references table"
        >
          <TableHead>
            <TableRow>
              <StyledTableCell
                align="left"
                sx={{
                  width: "40%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Experiment
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{
                  width: "20%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Module
              </StyledTableCell>
             
              <StyledTableCell
                align="left"
                sx={{
                  width: "20%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Date Tag
              </StyledTableCell>
              <StyledTableCell
                align="left"
                sx={{
                  width: "20%",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "10px",
                  textAlign: "left",
                  color: "#475467",
                  marginLeft: "12px",
                }}
              >
                Action
              </StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {experimentsHistory.map((experiment, index) => {
              const experimentId = getExperimentIdFromPath(experiment.exp_path);
              const experimentName = getExperimentNameById(experimentId);
              const moduleName = getExperimentModuleById(experimentId);

              return (
                <StyledTableRow key={`${experiment.exp_path}-${index}`}>
                  <StyledTableCell
                    component="th"
                    scope="row"
                    sx={{ width: "40%" }}
                  >
                    <Stack direction={"row"} spacing={2} alignItems={"center"}>
                    
                      <Stack spacing={0.1}>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 500,
                            lineHeight: "18px",
                            textAlign: "left",
                            color: theme.palette.text.modalHeading,
                          }}
                        >
                          {experimentName}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            color: "#475467",
                            textAlign: "left",
                          }}
                        >
                          {experimentId}
                        </Typography>
                      </Stack>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell
                    align="left"
                    sx={{
                      width: "20%",
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#475467",
                      textAlign: "left",
                    }}
                  >
                    <Chip
                      label={moduleName}
                      size="small"
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "18px",
                        textAlign: "initial",
                        color: "#027A48",
                        backgroundColor: "#ECFDF3",
                      }}
                    />
                  </StyledTableCell>

                

                  <StyledTableCell
                    align="left"
                    sx={{
                      width: "20%",
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#475467",
                      textAlign: "left",
                    }}
                  >
                    <Chip
                      label={experiment.date_tag}
                      size="small"
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "18px",
                        textAlign: "initial",
                        color: "#7C3AED",
                        backgroundColor: "#F3E8FF",
                      }}
                    />
                  </StyledTableCell>

                  <StyledTableCell align="left" sx={{ width: "10%" }}>
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"flex-start"}
                    >
                      <IconButton
                        aria-label="remove"
                        onClick={() =>
                          onRemoveExperiment && onRemoveExperiment(index)
                        }
                        sx={{
                          color: "#D92D20",
                          "&:hover": {
                            backgroundColor: "#FEE4E2",
                          },
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </IconButton>
                    </Stack>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
