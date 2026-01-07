import React, { useEffect } from "react";
import { Box, Stack } from "@mui/material";

import CreateExperimentHeader from "./CreateExperimentHeader";
import useConfig from "../../../../hooks/useConfig";
import useExperiment from "../../../../hooks/useExperiment";
import useDataset from "../../../../hooks/useDataset";
import useAuth from "../../../../hooks/useAuth";
import useModule from "../../../../hooks/useModule";
const CreateExperimentPage = () => {

  const { defaultConfig, renderDatasets,configState } = useModule();
  const { loadDatasetsList } = useDataset();
  const { userInfo  } = useAuth();
  useEffect(() => {
    // Ensure loadDatasetsList runs only once on mount
    loadDatasetsList(userInfo);
  }, []);
  console.log("Config at index.js:==>", configState);
  console.log("Default: ", defaultConfig);
  console.log("Datasets: ", renderDatasets);
  return (
    <Stack direction="column">
      <Box sx={{ padding: "92px 24px 34px 24px" }}>
        <Box sx={{ border: "1px solid #EAECF0", borderRadius: "12px" }}>
          <CreateExperimentHeader config={configState} />
        </Box>
      </Box>
    </Stack>
  );
};

export default CreateExperimentPage;
