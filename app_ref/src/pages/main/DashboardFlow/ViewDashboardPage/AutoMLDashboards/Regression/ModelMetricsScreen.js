import { Box, Stack, Tabs, Tab } from "@mui/material";
import React, { useState } from "react";
import CustomTable from "../../../../../../components/CustomTableNew";
import ErrorWrapper from "../../../../../../components/ErrorWrapper";
import useModule from "../../../../../../hooks/useModule";

const AllMetricsTables = [
  {
    title: "XgBoost",
    isFilterable: false,
    isBYOREnabled: false,
    model: "Xgboost",
  },
  { title: "Lgbm", isFilterable: false, isBYOREnabled: false, model: "Lgbm" },
  { title: "MLP", isFilterable: false, isBYOREnabled: false, model: "MLP" },
];

const RegressionModelMetricsScreen = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
    const { configState } = useModule();
    const models = configState?.training?.model_names;
    const MetricsTables = AllMetricsTables.filter((tableConfig) =>
      models.includes(tableConfig.model)
    );

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

export default RegressionModelMetricsScreen;
