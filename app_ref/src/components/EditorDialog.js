import { useState, useEffect, createContext, useContext } from "react";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Stack,
  CircularProgress,
  CssBaseline,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import useDashboard from "../hooks/useDashboard";
import { fetchTxtFromS3, fetchJsonFromS3 } from "../utils/s3Utils";
import CustomQueryBYORDialog from "./CustomQueryBYORDialog";
import useSession from "../hooks/useSession";
import useConfig from "../hooks/useConfig";
import useAuth from "../hooks/useAuth";
// Editor Theme Context
const EditorThemeContext = createContext({
  isEditorDarkMode: false,
  toggleEditorTheme: () => {},
});

const useEditorTheme = () => useContext(EditorThemeContext);

// Create theme for dialog
const createDialogTheme = () =>
  createTheme({
    palette: {
      mode: "light",
      background: {
        default: "#ffffff",
        paper: "#ffffff",
      },
      text: {
        primary: "#1F2328",
        secondary: "#6B7280",
      },
    },
  });

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: `1px solid #EAECF0`,
    backgroundColor: "#ffffff",
    minWidth: "600px",
    maxWidth: "900px",
  },
}));

const EditorContainer = styled(Box)(({ isEditorDarkMode }) => ({
  position: "relative",
  width: "100%",
  height: "400px",
  borderRadius: "8px",
  border: `1px solid ${isEditorDarkMode ? "#404040" : "#D0D5DD"}`,
  boxShadow: isEditorDarkMode
    ? "0 4px 8px rgba(0, 0, 0, 0.3)"
    : "0 4px 8px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
  backgroundColor: isEditorDarkMode ? "#2d2d2d" : "#ffffff",
}));

const LanguageLabel = styled(Box)(({ isEditorDarkMode }) => ({
  position: "absolute",
  top: "8px",
  right: "12px",
  backgroundColor: isEditorDarkMode ? "#1E3A8A" : "#F0F9FF",
  color: isEditorDarkMode ? "#93C5FD" : "#1E40AF",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  zIndex: 5,
}));

const CopyButton = styled(IconButton)(({ isEditorDarkMode }) => ({
  position: "absolute",
  top: "8px",
  left: "12px",
  backgroundColor: isEditorDarkMode ? "#374151" : "#F9FAFB",
  color: isEditorDarkMode ? "#D1D5DB" : "#6B7280",
  padding: "6px",
  borderRadius: "6px",
  border: `1px solid ${isEditorDarkMode ? "#4B5563" : "#E5E7EB"}`,
  zIndex: 5,
  "&:hover": {
    backgroundColor: isEditorDarkMode ? "#4B5563" : "#F3F4F6",
  },
}));

const LoadingOverlay = styled(Box)(({ isEditorDarkMode }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: isEditorDarkMode
    ? "rgba(45, 45, 45, 0.9)"
    : "rgba(255, 255, 255, 0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
}));

const ErrorOverlay = styled(Box)(({ isEditorDarkMode }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: isEditorDarkMode
    ? "rgba(45, 45, 45, 0.95)"
    : "rgba(255, 255, 255, 0.95)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
  padding: "32px",
  textAlign: "center",
}));

const CustomButton = ({
  title,
  onClick,
  outlined = false,
  disabled = false,
  startIcon,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={outlined ? "outlined" : "contained"}
      startIcon={startIcon}
      sx={{
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
        padding: "10px 20px",
        ...(outlined
          ? {
              borderColor: "#E5E7EB",
              color: "#374151",
              "&:hover": {
                borderColor: "#D1D5DB",
                backgroundColor: "#F9FAFB",
              },
            }
          : {
              backgroundColor: "#2563EB",
              "&:hover": {
                backgroundColor: "#1D4ED8",
              },
            }),
      }}
    >
      {title}
    </Button>
  );
};

const EditorThemeToggleButton = () => {
  const { isEditorDarkMode, toggleEditorTheme } = useEditorTheme();

  return (
    <IconButton
      onClick={toggleEditorTheme}
      sx={{
        color: "#374151",
        "&:hover": {
          backgroundColor: "#F3F4F6",
        },
      }}
      title="Toggle editor theme"
    >
      {isEditorDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
};

const SyntaxHighlighterWrapper = ({ code, isEditorDarkMode, onCopy }) => {
  const customStyle = {
    margin: 0,
    padding: "18px",
    paddingTop: "50px",
    fontSize: "14px",
    lineHeight: "1.6",
    fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
    height: "100%",
    overflow: "auto",
    backgroundColor: "transparent",
    userSelect: "text",
    WebkitUserSelect: "text",
    MozUserSelect: "text",
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy?.();
    } catch (err) {
      console.error("Failed to copy code:", err);
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        onCopy?.();
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <CopyButton
        isEditorDarkMode={isEditorDarkMode}
        onClick={handleCopyClick}
        title="Copy code"
        size="small"
      >
        <ContentCopyIcon sx={{ fontSize: "16px" }} />
      </CopyButton>

      <SyntaxHighlighter
        language="python"
        style={isEditorDarkMode ? oneDark : oneLight}
        customStyle={customStyle}
        showLineNumbers={true}
        lineNumberStyle={{
          minWidth: "3em",
          paddingRight: "1em",
          color: isEditorDarkMode ? "#6B7280" : "#9CA3AF",
          fontSize: "12px",
          userSelect: "none",
        }}
        wrapLines={true}
        wrapLongLines={true}
        codeTagProps={{
          style: {
            fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
          },
        }}
      >
        {code || "# No code content found"}
      </SyntaxHighlighter>
    </Box>
  );
};

function EditorDialogContent({ open, handleClose, title = "Code Viewer" }) {
  const [code, setCode] = useState("");
  const [sessionConfig, setSessionConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { experimentBasePath } = useDashboard();
  const {baseDatasets = []} = useConfig()
  const { isEditorDarkMode } = useEditorTheme();
   const { userInfo, currentCompany } = useAuth();
  


   const dataTypes = {
    "Forecasting Pivot": `scenario_planning/K_best/forecast/forecast_data_pivot`,
    "Forecasting Pivot Disaggregated": `scenario_planning/K_best/forecast/forecast_disaggregated`,
    "DOI Details": `scenario_planning/K_best/inventory_plan/soh_data`,
    "Elasticity Detailed View": `scenario_planning/K_best/scenario_plan/scenario_planner_data`,
    "Metrics Deep dive": `scenario_planning/K_best/post_model_demand_pattern/post_model_metrics`,
    Forecast: `scenario_planning/K_best/forecast/forecast_data`,
    "Prediction Interval": `scenario_planning/K_best/forecast/forecast_prediction_interval`,
    "Forecast Distribution": `scenario_planning/K_best/forecast/forecast_distribution`,
    "Inventory Reorder Plan": `scenario_planning/K_best/inventory_plan/reorder_table`,
    "Stock Transfer": `scenario_planning/K_best/inventory_plan/stock_transfer_df`,
    "Potential Stock Wastage": `scenario_planning/K_best/inventory_plan/potential_stock_wastage`,
    "Raw Inventory": `etl_data/202110/inv_data`,
    "SOH Pivot": `scenario_planning/K_best/forecast/soh_data_pivot`,
    "Bill Of Materials": `scenario_planning/K_best/inventory_plan/bill_of_material_inv_details`,
    "Price Optimization": `scenario_planning/K_best/scenario_plan/scenario_planner_data`,
    "Driver Elasticity": `stacking/future/K_best/coeffs`,
    "Model Metrics": `stacking/future/K_best/metric`,
    "Feature Importance": `feature_score/feature_score`,
    "Future Granular Metrics": `scenario_planning/K_best/forecast/future_data_metrics`,
    "Future Time Metrics": `scenario_planning/K_best/forecast/time_metrics`,
  };

  const mergedDataTypes = {
    ...dataTypes,
    ...Object.fromEntries(
      baseDatasets?.map((name) => [
        `${name}`,
        `byor_base_datasets/${name}/output`,
      ])
    ),
  };

  const {addSessionDataset} = useSession();
  useEffect(() => {
    if (open && title && experimentBasePath) {
      fetchData();
    }
  }, [open, title, experimentBasePath]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setCode("");
    setSessionConfig(null);

    try {
      const [codeData, configData] = await Promise.all([
        fetchTxtFromS3(
          `${experimentBasePath}/byor_base_datasets/${title}/code.txt`
        ),
        fetchJsonFromS3(
          `${experimentBasePath}/byor_base_datasets/${title}/session_config.json`
        ),
      ]);

      setCode(codeData || "# No code content found");
      setSessionConfig(configData);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (sessionConfig) {
      // Transform the datasets for session
      const transformedDatasets =
        sessionConfig.datasets?.map((dataset) => ({
          dataset_name: dataset.dataset_name,
          api_req_args_path:
            dataset.api_req_args_path ||
            `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/${dataset.dataset_name}.json`,
          dataset_path: dataset.dataset_path || "",
          last_modified: dataset.last_modified || new Date().toISOString(),
          is_loaded: false,
        })) || [];

      const transformedModelDatasets =
        sessionConfig.model_datasets?.map((dataset) => ({
          dataset_name: dataset.dataset_name,
          relative_dataset_path:
            dataset.relative_dataset_path ||
            `${mergedDataTypes[dataset.dataset_name]}.csv`,
        })) || [];

      // Add transformed datasets to session
      addSessionDataset({
        datasets: transformedDatasets,
        model_datasets: transformedModelDatasets,
      });

      setEditDialogOpen(true);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    fetchData(); // Refresh data after editing
  };

  const getDatasetsFromConfig = () => {
    if (!sessionConfig) return { datasets: [], modelDatasets: [] };

    return {
      datasets: sessionConfig.datasets?.map((d) => d.dataset_name) || [],
      modelDatasets:
        sessionConfig.model_datasets?.map((d) => d.dataset_name) || [],
    };
  };

  const { datasets, modelDatasets } = getDatasetsFromConfig();

  const handleCopySuccess = () => {
    setCopySuccess(true);
  };

  const handleCloseCopySnackbar = () => {
    setCopySuccess(false);
  };

  const getCodeStats = () => {
    if (!code) return { lines: 0, characters: 0 };
    return {
      lines: code.split("\n").length,
      characters: code.length,
    };
  };

  const stats = getCodeStats();

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="editor-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#667085",
            padding: "8px",
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <Stack
            spacing={3}
            padding={"16px"}
            justifyContent={"center"}
            marginTop={"16px"}
          >
            {/* Header */}
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <CodeIcon style={{ color: "#2563EB" }} fontSize="large" />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "24px",
                  fontWeight: 600,
                  lineHeight: "28px",
                  color: "#101828",
                  textAlign: "left",
                }}
              >
                {title}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "#F3F4F6",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                <VisibilityIcon sx={{ fontSize: "12px", color: "#6B7280" }} />
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#6B7280",
                    textTransform: "uppercase",
                  }}
                >
                  Read Only
                </Typography>
              </Box>
              <Box sx={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                <Tooltip title="Edit this dataset">
                  <IconButton
                    onClick={handleEditClick}
                    disabled={!sessionConfig}
                    sx={{
                      color: "#374151",
                      "&:hover": {
                        backgroundColor: "#F3F4F6",
                      },
                      "&:disabled": {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <EditorThemeToggleButton />
              </Box>
            </Stack>

            {/* File Info */}
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6B7280",
                }}
              >
                📄 code.txt • sessionConfig.json
              </Typography>
              <Typography sx={{ color: "#D1D5DB" }}>•</Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#059669",
                  backgroundColor: "#ECFDF5",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                PYTHON
              </Typography>
            </Stack>

            {/* Config Summary */}
            {sessionConfig && (
              <Stack
                spacing={1}
                sx={{
                  backgroundColor: isEditorDarkMode ? "#374151" : "#F3F4F6",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: isEditorDarkMode ? "#E5E7EB" : "#374151",
                  }}
                >
                  Dataset Configuration
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: isEditorDarkMode ? "#9CA3AF" : "#6B7280",
                      }}
                    >
                      Data Library:
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                      {datasets.length} dataset
                      {datasets.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: isEditorDarkMode ? "#9CA3AF" : "#6B7280",
                      }}
                    >
                      Model Datasets:
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                      {modelDatasets.length} dataset
                      {modelDatasets.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            )}

            {/* Editor Container */}
            <EditorContainer isEditorDarkMode={isEditorDarkMode}>
              <LanguageLabel isEditorDarkMode={isEditorDarkMode}>
                <CodeIcon sx={{ fontSize: "12px" }} />
                Python
              </LanguageLabel>

              {loading && (
                <LoadingOverlay isEditorDarkMode={isEditorDarkMode}>
                  <Stack direction={"row"} alignItems={"center"} spacing={2}>
                    <CircularProgress size={24} />
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: isEditorDarkMode ? "#b3b3b3" : "#6B7280",
                      }}
                    >
                      Loading data...
                    </Typography>
                  </Stack>
                </LoadingOverlay>
              )}

              {error && (
                <ErrorOverlay isEditorDarkMode={isEditorDarkMode}>
                  <Stack spacing={2} alignItems={"center"}>
                    <ErrorOutlineIcon
                      sx={{ fontSize: "32px", color: "#EF4444" }}
                    />
                    <Stack spacing={1} alignItems={"center"}>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: isEditorDarkMode ? "#ffffff" : "#111827",
                        }}
                      >
                        Error Loading Data
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: isEditorDarkMode ? "#b3b3b3" : "#6B7280",
                        }}
                      >
                        {error}
                      </Typography>
                    </Stack>
                    <CustomButton
                      title="Try Again"
                      onClick={fetchData}
                      startIcon={<RefreshIcon />}
                    />
                  </Stack>
                </ErrorOverlay>
              )}

              {!loading && !error && (
                <SyntaxHighlighterWrapper
                  code={code}
                  isEditorDarkMode={isEditorDarkMode}
                  onCopy={handleCopySuccess}
                />
              )}
            </EditorContainer>

            {/* Code Stats */}
            {code && !loading && !error && (
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                sx={{
                  paddingTop: "8px",
                  borderTop: `1px solid #F3F4F6`,
                }}
              >
                <Stack direction={"row"} spacing={3}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6B7280",
                    }}
                  >
                    {stats.lines} lines
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#6B7280",
                    }}
                  >
                    {stats.characters} characters
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#9CA3AF",
                    fontStyle: "italic",
                  }}
                >
                  Read-only mode
                </Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "flex-end", padding: "16px 32px" }}
        >
          <CustomButton title="Close" onClick={handleClose} outlined />
        </DialogActions>
      </BootstrapDialog>

      {/* Edit Dialog */}
      {sessionConfig && (
        <CustomQueryBYORDialog
          open={editDialogOpen}
          handleClose={handleCloseEditDialog}
          initialDatasets={datasets}
          initialModelDatasets={modelDatasets}
          initialCode={code}
          initialFileName={title}
          isEditMode={true}
        />
      )}

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseCopySnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseCopySnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Code copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function EditorDialog(props) {
  const [isEditorDarkMode, setIsEditorDarkMode] = useState(false);

  const toggleEditorTheme = () => {
    setIsEditorDarkMode(!isEditorDarkMode);
  };

  const dialogTheme = createDialogTheme();

  return (
    <EditorThemeContext.Provider
      value={{ isEditorDarkMode, toggleEditorTheme }}
    >
      <ThemeProvider theme={dialogTheme}>
        <CssBaseline />
        <EditorDialogContent {...props} />
      </ThemeProvider>
    </EditorThemeContext.Provider>
  );
}
