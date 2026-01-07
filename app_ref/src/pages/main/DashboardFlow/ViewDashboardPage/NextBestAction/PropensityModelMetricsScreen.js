import { Box, Stack, Tabs, Tab } from "@mui/material";
import React, { useState } from "react";
import useDashboard from "../../../../../hooks/useDashboard";
import CustomTable from "../../../../../components/CustomTableNew";
import ErrorWrapper from "../../../../../components/ErrorWrapper";

const MetricsTables = [
  { title: "Accuracy Scorecard", isFilterable: false, isBYOREnabled: false },
  { title: "F1 Threshold", isFilterable: false, isBYOREnabled: false },
];

const PropensityModelMetricsScreen = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 1, padding: "0px 24px", borderBottom: "1px solid #E4E7EC" }}
      >
        {MetricsTables.map((tableConfig, index) => (
          <Tab
            key={index}
            label={tableConfig.title}
            sx={{ textTransform: "none" }}
          />
        ))}
      </Tabs>

      {MetricsTables.map(
        (tableConfig, index) =>
          selectedTab === index && (
            <ErrorWrapper key={index}>
              <CustomTable
                title={tableConfig.title}
                isFilterable={tableConfig.isFilterable}
                isBYOREnabled={tableConfig.isBYOREnabled}
              />
            </ErrorWrapper>
          )
      )}
    </Box>
  );
};

export default PropensityModelMetricsScreen;
