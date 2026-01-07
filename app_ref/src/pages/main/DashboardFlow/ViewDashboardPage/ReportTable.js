import React, { useState } from "react";
import useDashboard from "../../../../hooks/useDashboard";
import useAuth from "../../../../hooks/useAuth";

import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchParquetData,
} from "../../../../utils/s3Utils";
import { useEffect } from "react";
import CustomTable from "../../../../components/TanStackCustomTable";
import { Skeleton, Stack, Typography } from "@mui/material";
import useExperiment from "../../../../hooks/useExperiment";

const ReportLoader = ({
  path,
  title,
  data,
  onDataFetched,
  isFirst,
  ReportTitle,
  byorConfig,
}) => {
  const [newData, setNewData] = useState(data);
  const [customColumns, setCustomColumns] = useState(null);
  const { hasParquetFiles } = useExperiment();
  const [retryCount, setRetryCount] = useState(0);
  const { userInfo, currentCompany } = useAuth();

  const fetchData = async () => {
    try {
      const fetchedData = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 50 },
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: null,
            paginationData: { batchNo: 1, batchSize: 50 },
            sortingData: null,
          }));
      setNewData(fetchedData);
      setRetryCount((prev) => prev + 1);

      let sample = [];
      let columns = [];

      if (Array.isArray(fetchedData)) {
        sample = fetchedData.slice(0, 100);
        if (sample.length > 0) {
          columns = Object.keys(sample[0]);
        }
      } else if (typeof fetchedData === "object" && fetchedData !== null) {
        columns = Object.keys(fetchedData);
        const rowCount =
          columns.length > 0 ? fetchedData[columns[0]]?.length || 0 : 0;
        sample = Array.from({ length: Math.min(rowCount, 100) }, (_, i) => {
          const row = {};
          columns.forEach((col) => {
            if (fetchedData[col] && fetchedData[col][i] !== undefined) {
              row[col] = fetchedData[col][i];
            }
          });
          return row;
        });
      }

      // Now you can use these columns and sample rows as needed

      setCustomColumns(columns);
      onDataFetched && onDataFetched(fetchedData); // Notify parent component if needed
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setRetryCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (!newData) {
      fetchData();
    }
  }, [newData]); // `fetchData` removed from dependencies

  if (!newData) {
    return retryCount === 0 ? (
      <Stack
        sx={{ width: "100%", padding: "16px", height: "100%" }}
        spacing={2}
      >
        {/* Skeleton Loader */}
        <Skeleton variant="text" width="30%" height="40px" />
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <Stack key={rowIndex} direction="row" spacing={1}>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  width="100%"
                  height="50px"
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </Stack>
    ) : (
      <>
        {isFirst ? (
          <Stack
            sx={{ width: "100%", padding: "16px", height: "100%" }}
            justifyContent="center"
          >
            <Typography
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "center",
              }}
            >
              No data available
            </Typography>
          </Stack>
        ) : null}
      </>
    );
  }

  return (
    <CustomTable title={title} datasetPath={path} reportTitle={ReportTitle} customColumns={customColumns} />
  );
};

const ReportTable = ({
  reports,
  reportGroup,
  index,
  isCustomReport,
  byorConfig,
}) => {
  const { experimentBasePath } = useDashboard();
  const { userInfo, currentCompany } = useAuth();

  const specificReport = reports[reportGroup].reports[index];

  // Handle custom BYOR reports
  if (isCustomReport && specificReport) {
    const path = specificReport.filePath;
    const ReportName = reports[reportGroup].reports[index].title;
    const title = reports[reportGroup].reports[index].config?.title;
    return (
      <ReportLoader
        path={path}
        title={title}
        data={specificReport.data}
        isFirst={true}
        ReportTitle={ReportName}
        byorConfig={byorConfig}
      />
    );
  }

  // Handle regular reports
  if (!specificReport.isSingle) {
    if (
      specificReport.reportsArray &&
      Array.isArray(specificReport.reportsArray)
    ) {
      return (
        <>
          {specificReport.reportsArray.map(
            (secondaryReport, secondaryIndex) => (
              <ReportLoader
                key={secondaryIndex}
                path={`${experimentBasePath}/${secondaryReport.path}`}
                title={secondaryReport.title}
                data={secondaryReport.data}
                isFirst={secondaryIndex === 0}
              />
            )
          )}
        </>
      );
    } else {
      // Handle case where reportsArray is undefined
      return (
        <Stack
          sx={{ width: "100%", padding: "16px", height: "100%" }}
          justifyContent="center"
        >
          <Typography
            sx={{
              color: "#667085",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              textAlign: "center",
            }}
          >
            Report structure is invalid
          </Typography>
        </Stack>
      );
    }
  }

  return (
    <ReportLoader
      path={`${experimentBasePath}/${specificReport.path}`}
      title={specificReport.title}
      data={specificReport.data}
      isFirst
    />
  );
};

export default ReportTable;
