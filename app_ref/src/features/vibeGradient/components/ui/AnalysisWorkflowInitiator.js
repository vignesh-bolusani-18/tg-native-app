import React, { useMemo } from "react";
import { Box, Typography, Stack, Card, CardContent } from "@mui/material";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import useExperiment from "../../../../hooks/useExperiment";
import useAuth from "../../../../hooks/useAuth";
import { generateSystemPrompt } from "../../../../utils/Agent Utils/generateSystemPrompt";
import { formatYearMonth } from "../../../../components/ExpTable";
import { useVibe } from "../../../../hooks/useVibe";

const AnalysisWorkflowInitiator = () => {
  const { experiments_list } = useExperiment();
  const { currentCompany } = useAuth();
  const {
    selectedAnalysisExperiment,
    setSelectedAnalysisExperiment,
    setAnalysisSystemPrompt,
    setAnalysisDataPathDict,
  } = useVibe();

  // Parse experiment status helper function
  function parseString(input) {
    try {
      const json = JSON.parse(input);
      if (typeof json === "object" && json !== null) {
        return json.status;
      }
    } catch (e) {
      return input;
    }
    return input;
  }

  // Filter completed experiments
  const completedExperiments = useMemo(() => {
    return (
      experiments_list?.filter(
        (experiment) =>
          !experiment.inTrash &&
          parseString(experiment.experimentStatus) === "Completed" &&
          !experiment.isArchive &&
          [
            "demand-planning",
            "inventory-optimization",
            "price-promotion-optimization",
          ].includes(experiment.experimentModuleName)
      ) || []
    );
  }, [experiments_list]);

  // Create experiment options (experiment paths like in Forecast Reference Settings)
  const experimentOptions = useMemo(() => {
    return completedExperiments
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(
        (experiment) =>
          `accounts/${currentCompany.companyName}_${
            currentCompany.companyID
          }/data_bucket/${experiment.experimentModuleName}/${formatYearMonth(
            experiment.createdAt
          )}/${experiment.experimentID}`
      );
  }, [completedExperiments, currentCompany]);

  // Create experiment values dict (path -> "exp name (first3...last3)")
  const experimentValuesDict = useMemo(() => {
    return Object.fromEntries(
      completedExperiments
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((experiment) => {
          const path = `accounts/${currentCompany.companyName}_${
            currentCompany.companyID
          }/data_bucket/${experiment.experimentModuleName}/${formatYearMonth(
            experiment.createdAt
          )}/${experiment.experimentID}`;
          const formattedId =
            experiment.experimentID.length > 6
              ? `${experiment.experimentID.slice(
                  0,
                  3
                )}...${experiment.experimentID.slice(-3)}`
              : experiment.experimentID;
          return [path, `${experiment.experimentName} (${formattedId})`];
        })
    );
  }, [completedExperiments, currentCompany]);

  // Create experiment component dict for custom rendering (showing all experiment details)
  const experimentComponentDict = useMemo(() => {
    return Object.fromEntries(
      completedExperiments
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((experiment) => {
          const path = `accounts/${currentCompany.companyName}_${
            currentCompany.companyID
          }/data_bucket/${experiment.experimentModuleName}/${formatYearMonth(
            experiment.createdAt
          )}/${experiment.experimentID}`;

          // Format module name for display
          const formatModuleName = (moduleName) => {
            return moduleName
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          };

          return [
            path,
            () => (
              <Stack spacing={0.5} sx={{ width: "100%" }}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    textAlign: "left",
                    color: "#101828",
                  }}
                >
                  {experiment.experimentName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "16px",
                      color: "#475467",
                      textAlign: "left",
                    }}
                  >
                    {experiment.experimentID}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "16px",
                      color: "#98A2B3",
                      textAlign: "left",
                    }}
                  >
                    •
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "16px",
                      color: "#475467",
                      textAlign: "left",
                    }}
                  >
                    {formatModuleName(experiment.experimentModuleName)}
                  </Typography>
                </Stack>
              </Stack>
            ),
          ];
        })
    );
  }, [completedExperiments, currentCompany]);

  // Get selected experiment display value from Redux state (for CustomAutocomplete, we need display value to match options)
  const getSelectedExperimentDisplayValue = () => {
    if (!selectedAnalysisExperiment) return null;
    const moduleName = selectedAnalysisExperiment.experimentModuleName;
    const run_date = formatYearMonth(selectedAnalysisExperiment.createdAt);
    const path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${selectedAnalysisExperiment.experimentID}`;
    // Return the display value (from experimentValuesDict) so it matches the options
    return experimentValuesDict[path] || null;
  };

  // Handle experiment selection
  const handleExperimentChange = (newValue) => {
    console.log("🔍 handleExperimentChange called with:", newValue);
    console.log("🔍 Type of newValue:", typeof newValue);

    // newValue will be the experiment path (internal value) when there's no path prop
    // OR it could be the display value - we need to handle both cases
    if (!newValue) {
      console.log("🔍 No value selected, clearing state");
      setSelectedAnalysisExperiment(null);
      setAnalysisSystemPrompt(null);
      setAnalysisDataPathDict(null);
      return;
    }

    // Check if newValue is a path (starts with "accounts/") or a display value
    let experimentPath = newValue;

    // If it's not a path, it's a display value - find the path
    if (!newValue.startsWith("accounts/")) {
      console.log("🔍 newValue is display value, looking up path...");
      const foundPath = Object.entries(experimentValuesDict).find(
        ([path, displayValue]) => displayValue === newValue
      )?.[0];

      if (!foundPath) {
        console.error(
          "❌ No experiment path found for display value:",
          newValue
        );
        return;
      }
      experimentPath = foundPath;
    }

    console.log("🔍 Using experimentPath:", experimentPath);

    // Extract experiment ID from path
    const pathParts = experimentPath.split("/");
    const experimentId = pathParts[pathParts.length - 1];
    console.log("🔍 Extracted experimentId:", experimentId);

    const selectedExperiment = completedExperiments.find(
      (exp) => exp.experimentID === experimentId
    );

    console.log("🔍 Found selectedExperiment:", selectedExperiment);

    if (!selectedExperiment) {
      console.error("❌ No experiment found with ID:", experimentId);
      return;
    }

    // Create experimentBasePath
    const moduleName = selectedExperiment.experimentModuleName;
    const run_date = formatYearMonth(selectedExperiment.createdAt);
    const experimentBasePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${selectedExperiment.experimentID}`;

    console.log("🔍 experimentBasePath:", experimentBasePath);

    // Generate systemPrompt and dataPathDict
    const { systemPrompt, dataPathDict } = generateSystemPrompt(
      experimentBasePath,
      moduleName,
      selectedExperiment.experimentName
    );

    console.log("🔍 Generated systemPrompt:", systemPrompt);
    console.log("🔍 Generated dataPathDict:", dataPathDict);

    // Update Redux state
    console.log("🔍 Dispatching Redux actions...");
    setSelectedAnalysisExperiment(selectedExperiment);
    setAnalysisSystemPrompt(systemPrompt);
    setAnalysisDataPathDict(dataPathDict);
    console.log("✅ Redux actions dispatched");
  };

  return (
    <Box
      sx={{
        width: "100%",
        // maxWidth: "900px",
        mx: "auto",
      }}
    >
      <Card
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          overflow: "visible",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            borderColor: "#cbd5e1",
          },
        }}
      >
        <CardContent
          sx={{
            p: 2.5,
            "&:last-child": {
              pb: 2.5,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            {/* Left side - Text */}
            <Box sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" } }}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "15px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  color: "#1e293b",
                  mb: 0.25,
                }}
              >
                Analyze Experiment
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "18px",
                  color: "#64748b",
                }}
              >
                Get insights and recommendations for completed experiments
              </Typography>
            </Box>

            {/* Right side - Autocomplete */}
            <Box
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 auto" },
                minWidth: { xs: "100%", sm: "280px" },
                maxWidth: { xs: "100%", sm: "60%" },
              }}
            >
              <CustomAutocomplete
                showLabel={false}
                label="Select Experiment"
                placeholder="Choose experiment..."
                values={experimentOptions}
                selectedValues={getSelectedExperimentDisplayValue()}
                setSelectedValues={handleExperimentChange}
                isMultiSelect={false}
                valuesDict={experimentValuesDict}
                optionComponentDict={experimentComponentDict}
                formatLabel={false}
                disabled={false}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalysisWorkflowInitiator;
