import React, { useState } from "react";
import CustomReport from "./CustomReport";
import { useEffect } from "react";
import { fetchCSVData, fetchParquetData, loadBatchData } from "../utils/s3Utils";
import useAuth from "../hooks/useAuth";
import useDashboard from "../hooks/useDashboard";
import useExperiment from "../hooks/useExperiment";

const CustomReportWrapper = ({ reportId, fileName, filePath }) => {
  const [data, setData] = useState(null);
  const { userInfo, currentCompany } = useAuth();
  const { tablesFilterData } = useDashboard();
  const { hasParquetFiles } = useExperiment();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await (hasParquetFiles
        ? fetchParquetData({
            filePath: filePath,
            filterData: tablesFilterData[fileName][reportId].filterData,
            paginationData: { batchNo: 1, batchSize: 50 },
            sortingData: null,
          })
        : fetchCSVData({
            filePath: filePath,
            filterData: tablesFilterData[fileName][reportId].filterData,
            paginationData: { batchNo: 1, batchSize: 50 },
            sortingData: null,
          }));
      await setData(fetchedData);
    };
    fetchData();
  }, [
    userInfo.userID,
    currentCompany.companyName,
    fileName,
    reportId,
    tablesFilterData,
    filePath,
  ]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <CustomReport
      fileName={fileName}
      data={data}
      reportId={reportId}
      title={tablesFilterData[fileName][reportId].reportName}
    />
  );
};

export default CustomReportWrapper;
