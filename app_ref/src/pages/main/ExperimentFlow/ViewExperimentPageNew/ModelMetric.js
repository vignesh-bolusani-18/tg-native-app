import React, { useContext } from "react";
import { Box } from "@mui/material";
import { ThemeContext } from "../../../../theme/config/ThemeContext";

import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import BarChart from "./FactorBarChart";
import PerformanceMetric from "./PerformanceMetric";

const ModelMetric = () => {
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { theme } = useContext(ThemeContext);
  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab
              label="Factor Contributions"
              value="1"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
            />
            <Tab
              label="Performance Metrics"
              value="2"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
            />
          </TabList>
        </Box>
        <TabPanel value="1">
          <BarChart />
        </TabPanel>
        <TabPanel value="2">
          <PerformanceMetric />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default ModelMetric;
