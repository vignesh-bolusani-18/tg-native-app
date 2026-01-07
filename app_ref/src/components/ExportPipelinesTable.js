import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import {
  Box,
  Chip,
  Pagination,
  PaginationItem,
  Typography,
} from "@mui/material";

import { ThemeContext } from "../theme/config/ThemeContext";

import useAuth from "../hooks/useAuth";
import { useState } from "react";
import { useEffect } from "react";

import useExports from "../hooks/useExports";
import useConfig from "../hooks/useConfig";
import useDashboard from "../hooks/useDashboard";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, isSelected }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: isSelected ? "aliceblue" : "#F9FAFB",
  },
  "&:nth-of-type(even)": {
    backgroundColor: isSelected
      ? "aliceblue"
      : theme.palette.background.default,
  },
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease-in-out",
    backgroundColor: isSelected ? "aliceblue" : "#F9F5FF",
    borderTop: "1px solid #D6BBFB",
    borderBottom: "1px solid #D6BBFB",
  },
}));

const CustomPaginationItem = styled(PaginationItem, {
  shouldForwardProp: (prop) =>
    prop !== "isPrevOrNext" &&
    prop !== "isPrev" &&
    prop !== "isNext" &&
    prop !== "selected",
})(({ theme, isPrevOrNext, isPrev, isNext, selected }) => ({
  borderRadius: "0",
  border: "1px solid",
  borderColor: "#D0D5DD",
  margin: "0",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.button.backgroundOnHover,
  },
  "&:not(:first-of-type)": {
    borderLeft: "none",
  },
  "& .MuiTypography-root": {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: isPrevOrNext ? 600 : 500,
    lineHeight: "20px",
    textAlign: "left",
    color: isPrevOrNext ? "#1D2939" : "#344054",
    paddingLeft: isPrevOrNext ? "8px" : "0",
    paddingRight: isPrevOrNext ? "0" : "8px",
  },
  ...(!isPrevOrNext && {
    width: "40px",
  }),
  ...(isPrev && {
    borderBottomLeftRadius: "8px",
    borderTopLeftRadius: "8px",
  }),
  ...(isNext && {
    borderBottomRightRadius: "8px",
    borderTopRightRadius: "8px",
  }),
  ...(selected && {
    backgroundColor: "#F9FAFB",
  }),
}));
const getStatusStyles = (status) => {
  switch (status) {
    case "Verified":
      return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
    case "Created":
      return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
    case "Failed":
      return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error

    // Default styles
    default:
      return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Neutral/unknown
  }
};

export default function ExportPipelinesTable() {
  const { theme } = React.useContext(ThemeContext);

  const { export_pipelines_list, loadExportPipelinesList } = useExports();
  const { experimentBasePath } = useDashboard();
  const [data, setData] = useState(
    export_pipelines_list ? export_pipelines_list : null
  );
  const { userInfo, currentCompany } = useAuth();
  const { setExportJob, export_job } = useExports();
  const { configState } = useConfig();
  useEffect(() => {
    loadExportPipelinesList(userInfo.userID);
  }, []);
  useEffect(() => {
    setData(export_pipelines_list);
  }, [export_pipelines_list]);

  const [page, setPage] = useState(1);

  const RecordsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = data.slice(
    (page - 1) * RecordsPerPage,
    page * RecordsPerPage
  );
  const datasetPathDict = {
    Forecast: `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`,
    "Replacement Optimization": `${experimentBasePath}/scenario_planning/K_best/optimization/optimal_data.csv`,
    "Prediction Interval": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`,
  };
  const [exportPipelineName, setExportPipelineName] = useState(
    export_job ? export_job.exportPipelineName : null
  );
  const handleRowClick = async ({
    exportPipelineName,
    exportDataset,
    exportDestination,
    exportDestinationType,
    exportPipelineStatus,
  }) => {
    setExportPipelineName(exportPipelineName);
    const exportJob = {
      exportPipelinePath: `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/exports/pipelines/${exportPipelineName}.json`,
      datasetPath: datasetPathDict[exportDataset],
      exportPipelineName: exportPipelineName,
      experimentName: configState.project_setup.project_name,
      experimentID: configState.common.job_id,
      exportJobSource: exportDataset,
      exportJobDestination: exportDestination,
      exportJobDestinationType: exportDestinationType,
      exportPipelineStatus,
    };
    setExportJob(exportJob);
  };

  return (
    <Box flex={1}>
      {data.length > 0 ? (
        <>
          <TableContainer component={Box} flex={1}>
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  padding: "16px",
                  alignContent: "center",
                  justifyContent: "center",
                },
              }}
              aria-label="customized table"
            >
              <TableHead>
                <TableRow>
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
                    Name
                  </StyledTableCell>
                  <StyledTableCell
                    align="left"
                    sx={{
                      width: "10%",
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "10px",
                      textAlign: "left",
                      color: "#475467",
                      marginLeft: "12px",
                    }}
                  >
                    Source
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
                    Destination
                  </StyledTableCell>
                  <StyledTableCell
                    align="left"
                    sx={{
                      width: "10%",
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "10px",
                      textAlign: "left",
                      color: "#475467",
                      marginLeft: "12px",
                    }}
                  >
                    Type
                  </StyledTableCell>

                  <StyledTableCell
                    align="left"
                    sx={{
                      width: "10%",
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "10px",
                      textAlign: "left",
                      color: "#475467",
                      marginLeft: "12px",
                    }}
                  >
                    Created by
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
                    Created at
                  </StyledTableCell>
                  <StyledTableCell
                    align="left"
                    sx={{
                      width: "10%",
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "10px",
                      textAlign: "left",
                      color: "#475467",
                      marginLeft: "12px",
                    }}
                  >
                    Status
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => (
                  <StyledTableRow
                    key={row.exportPipelineID}
                    isSelected={row.exportPipelineName === exportPipelineName}
                    onClick={() => {
                      handleRowClick({
                        exportPipelineName: row.exportPipelineName,
                        exportDataset: row.exportDataset,
                        exportDestination: row.exportDestination,
                        exportDestinationType: row.exportDestinationType,
                        exportPipelineStatus: row.exportPipelineStatus,
                      });
                    }}
                  >
                    <StyledTableCell
                      component="th"
                      scope="row"
                      sx={{ width: "20%" }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          fontWeight: 500,
                          lineHeight: "18px",
                          textAlign: "left",
                          color: theme.palette.text.modalHeading,
                          whiteSpace: "nowrap", // Prevents wrapping
                          overflow: "hidden", // Hides overflowed content
                          textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                          //   maxWidth: "100%",
                        }}
                      >
                        {row.exportPipelineName}
                      </Typography>
                    </StyledTableCell>

                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "10%",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#475467",
                        textAlign: "left",
                        whiteSpace: "nowrap", // Prevents wrapping
                        overflow: "hidden", // Hides overflowed content
                        textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                        // maxWidth: "100%",
                      }}
                    >
                      {row.exportDataset}
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
                        whiteSpace: "nowrap", // Prevents wrapping
                        overflow: "hidden", // Hides overflowed content
                        textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                        // maxWidth: "100%",
                      }}
                    >
                      {row.exportDestination}
                    </StyledTableCell>
                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "10%",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#475467",
                        textAlign: "left",
                        whiteSpace: "nowrap", // Prevents wrapping
                        overflow: "hidden", // Hides overflowed content
                        textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                        // maxWidth: "100%",
                      }}
                    >
                      <Chip
                        label={row.exportDestinationType}
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
                        width: "10%",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#475467",
                        textAlign: "left",
                        whiteSpace: "nowrap", // Prevents wrapping
                        overflow: "hidden", // Hides overflowed content
                        textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                        // maxWidth: "100%",
                      }}
                    >
                      {row.createdBy}
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
                        whiteSpace: "nowrap", // Prevents wrapping
                        overflow: "hidden", // Hides overflowed content
                        textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                        // maxWidth: "100%",
                      }}
                    >
                      {row.createdAt}
                    </StyledTableCell>
                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "10%",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "#475467",
                        textAlign: "left",
                        whiteSpace: "nowrap", // Prevents wrapping
                        overflow: "hidden", // Hides overflowed content
                        textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                        // maxWidth: "100%",
                      }}
                    >
                      <Chip
                        label={row.exportPipelineStatus}
                        size="small"
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          fontWeight: 500,
                          lineHeight: "18px",
                          textAlign: "initial",
                          ...getStatusStyles(row.exportPipelineStatus),
                        }}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(data.length / RecordsPerPage)}
            page={page}
            onChange={handleChangePage}
            renderItem={(item) => (
              <CustomPaginationItem
                {...item}
                isPrev={item.type === "previous"}
                isNext={item.type === "next"}
                isPrevOrNext={item.type === "previous" || item.type === "next"}
              />
            )}
            sx={{
              padding: "24px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          />
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            height: "50vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              color: "#475467",
              textAlign: "center",
            }}
          >
            No Pipelines Available
          </Typography>
        </Box>
      )}
    </Box>
  );
}
