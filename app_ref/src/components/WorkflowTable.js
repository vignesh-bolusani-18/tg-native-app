import * as React from "react";
import {
  Box,
  Collapse,
  IconButton,
  Pagination,
  PaginationItem,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Menu,
  Skeleton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomButton from "./CustomButton";
import CustomTextInput from "./CustomInputControls/CustomTextInput";
import CustomSelect from "./CustomInputControls/CustomSelector";
import CustomAutoCompleteObject from "./CustomInputControls/CustomAutoCompleteObject";
import ConfirmationDialog from "./ConfirmationDialog";
import useExperiment from "../hooks/useExperiment";
import { ThemeContext } from "../theme/config/ThemeContext";
import useScheduledJob from "../hooks/useScheduledJob";
import useAuth from "../hooks/useAuth";
import { styled as muiStyled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import useWorkflow from "../hooks/useWorkflow";
import CustomDatePicker from "./CustomInputControls/CustomDatePicker";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const CustomPaginationItem = styled(PaginationItem, {
  shouldForwardProp: (prop) => prop !== "isPrevOrNext" && prop !== "isPrev" && prop !== "isNext" && prop !== "selected",
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

const headingStyle = {
  fontFamily: "Inter",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "18px",
  textAlign: "left",
  color: "#475467",
};

const tableCellStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  textAlign: "left",
  color: "#475467",
};

const getStatusColor = (status) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return {
        bg: "#ECFDF3",
        text: "#027A48",
      };
    case "PAUSED":
      return {
        bg: "#FFF1F3",
        text: "#C01048",
      };
    case "INACTIVE":
      return {
        bg: "#F2F4F7",
        text: "#344054",
      };
    default:
      return {
        bg: "#F2F4F7",
        text: "#344054",
      };
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

const getFrequencyDisplay = (workflow) => {
  switch (workflow.triggerFrequency) {
    case "DAILY":
      return `Daily at ${workflow.triggerTime}`;
    case "WEEKLY":
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return `Weekly on ${days[workflow.triggerDayOfWeek]} at ${workflow.triggerTime}`;
    case "MONTHLY":
      return `Monthly on day ${workflow.triggerDayOfMonth} at ${workflow.triggerTime}`;
    default:
      return workflow.triggerFrequency;
  }
};

const formatRunType = (runType) => {
  if (!runType) return "N/A";

  const typeMap = {
    'run_optimization': 'Rerun Optimization',
    'run_training': 'Run Training',
    'run_scenario': 'Run Scenario Planning'
  };

  return typeMap[runType] || runType;
};

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const monthDates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

const AttachJobDialog = ({ open, onClose, workflow }) => {
  const [jobType, setJobType] = React.useState('');
  const [selectedExperiment, setSelectedExperiment] = React.useState(null);
  const [runType, setRunType] = React.useState('run_optimization');
  const [occurrence, setOccurrence] = React.useState('max');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { experiments_list } = useExperiment();
  const { theme } = React.useContext(ThemeContext);
  const { createNewScheduledJob, scheduledJobLoading, loadScheduledJobs, scheduled_jobs_list } = useScheduledJob();
  const { userInfo, currentCompany } = useAuth();

  React.useEffect(() => {
    console.log("AttachJobDialog mounted");
    console.log("Current workflow:", workflow);
    console.log("All scheduled jobs:", scheduled_jobs_list);
  }, [workflow, scheduled_jobs_list]);

  // Get already selected experiments for this workflow
  const excludedExperiments = React.useMemo(() => {
    console.log("Calculating excluded experiments");
    console.log("Workflow ID:", workflow?.workflowID);
    console.log("All scheduled jobs:", scheduled_jobs_list);

    const selectedExps = scheduled_jobs_list
      .filter(job => {
        const isMatchingWorkflow = job.workflowID === workflow?.workflowID;
        const isExperimentType = job.jobType?.toLowerCase() === 'experiment';
        console.log("Job:", job);
        console.log("Is matching workflow:", isMatchingWorkflow);
        console.log("Is experiment type:", isExperimentType);
        return isMatchingWorkflow && isExperimentType;
      })
      .map(job => {
        console.log("Mapping job:", job);
        console.log("Experiment details:", job.experimentDetails);
        return job.experimentID;
      })
      .filter(Boolean);

    console.log("Excluded experiments:", selectedExps);
    return selectedExps;
  }, [scheduled_jobs_list, workflow?.workflowID]);

  // Calculate maximum occurrences based on workflow frequency and tenure
  const calculateMaxOccurrences = React.useMemo(() => {
    if (!workflow?.workFlowStartDate || !workflow?.workFlowEndDate) return 0;

    const startDate = new Date();
    const endDate = new Date(Number(workflow.workFlowEndDate));
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    switch (workflow.triggerFrequency) {
      case 'DAILY':
        return durationInDays;
      case 'WEEKLY':
        return Math.ceil(durationInDays / 7);
      case 'MONTHLY':
        // Calculate full months between dates
        return (
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth()) +
          (endDate.getDate() >= startDate.getDate() ? 1 : 0)
        );
      default:
        return 0;
    }
  }, [workflow]);

  // Calculate next execution time based on workflow trigger config
  const calculateNextExecutionTime = () => {
    console.log("Calculating next execution time");
    console.log("Workflow:", workflow);
    const now = new Date();
    console.log("Now:", now);
    const [hours, minutes] = workflow.triggerTime.split(':').map(Number);
    console.log("Hours:", hours);
    console.log("Minutes:", minutes);
    let nextExecution = new Date();
    nextExecution.setHours(hours, minutes, 0, 0);
    console.log("Next execution:", nextExecution);
    // If the time has already passed today, start from tomorrow
    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1);
      console.log("Next execution after adding 1 day:", nextExecution);
    }

    switch (workflow.triggerFrequency) {
      case 'DAILY':
        // For daily, we already have the next execution time set
        console.log("Daily trigger frequency");
        break;

      case 'WEEKLY': {
        console.log("Weekly trigger frequency");
        const targetDay = workflow.triggerDayOfWeek;
        console.log("Target day:", targetDay);
        const currentDay = nextExecution.getDay();
        console.log("Current day:", currentDay);
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        console.log("Days until target:", daysUntilTarget);
        // If it's the target day but time has passed, we need to wait for next week
        if (daysUntilTarget === 0 && nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + 7);
          console.log("Next execution after adding 7 days:", nextExecution);
        } else {
          nextExecution.setDate(nextExecution.getDate() + daysUntilTarget);
          console.log("Next execution after adding days until target:", nextExecution);
        }
        break;
      }

      case 'MONTHLY': {
        const targetDate = workflow.triggerDayOfMonth;
        console.log("Target date:", targetDate);

        // Helper function to get the last day of a month
        const getLastDayOfMonth = (date) => {
          return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        };

        // Set to target date or last day of month if target doesn't exist
        const lastDayOfMonth = getLastDayOfMonth(nextExecution);
        const actualTargetDate = Math.min(targetDate, lastDayOfMonth);

        console.log("Last day of month:", lastDayOfMonth);
        console.log("Actual target date:", actualTargetDate);

        nextExecution.setDate(actualTargetDate);
        console.log("Next execution after setting actual target date:", nextExecution);

        // If the target date has passed this month, move to next month
        if (nextExecution <= now) {
          nextExecution.setMonth(nextExecution.getMonth() + 1);
          // Recalculate for the new month
          const newLastDayOfMonth = getLastDayOfMonth(nextExecution);
          const newActualTargetDate = Math.min(targetDate, newLastDayOfMonth);
          nextExecution.setDate(newActualTargetDate);
          console.log("Next execution set to next month with actual target date:", nextExecution);
          console.log("New last day of month:", newLastDayOfMonth);
          console.log("New actual target date:", newActualTargetDate);
        }
        console.log("Final next execution date:", nextExecution);
        break;
      }

      default:
        console.error('Unknown frequency:', workflow.triggerFrequency);
        return now.getTime();
    }

    // Ensure the execution time is not beyond workflow end date if it exists
    if (workflow.workFlowEndDate) {
      const endDate = new Date(Number(workflow.workFlowEndDate));
      console.log("End date:", endDate);
      console.log("Next execution:", nextExecution);
      if (nextExecution > endDate) {
        console.log("Next execution time is beyond end date");
        return null; // No next execution if beyond end date
      }
    }
    console.log("Next execution time:", nextExecution.getTime());
    return nextExecution.getTime();
  };

  const handleClose = () => {
    setJobType('');
    setSelectedExperiment('');
    setRunType('run_optimization');
    setOccurrence('max');
    onClose();
  };
  function replaceEncodedSlashes(encodedStr) {
    return encodedStr.replace(/&#x2F;/g, "/")
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const nextExecutionTime = calculateNextExecutionTime();
      console.log("nextExecutionTime: ", nextExecutionTime);
      // If no valid next execution time (beyond end date), show error
      if (nextExecutionTime === null) {
        console.error('No valid execution time available - workflow may have ended');
        toast.error('No valid execution time available - workflow may have ended');
        setIsSubmitting(false);
        handleClose();
        return;
      }

      const jobData = {
        jobName: selectedExperiment.experimentName,
        workflowID: workflow.workflowID,
        workflowName: workflow.workflowName,
        scheduledBy: userInfo.userName,
        companyName: currentCompany.companyName,
        scheduledJobStatus: "Scheduled",
        createdAt: Date.now(),
        inTrash: false,
        jobType: jobType.toLowerCase(),
        jobOccurance: occurrence === 'max' ? calculateMaxOccurrences : occurrence,
        nextExecutionTime: nextExecutionTime,
        ...(jobType === 'Experiment' && {
          experimentDetails: {
            experimentID: selectedExperiment.experimentID,
            experimentName: selectedExperiment.experimentName,
            experimentModuleName: selectedExperiment.experimentModuleName,
            experimentPath: `s3://${process.env.REACT_APP_AWS_BUCKET_NAME}/${replaceEncodedSlashes(selectedExperiment.experimentPath)}`,
            experimentBucketName: process.env.REACT_APP_AWS_BUCKET_NAME,
            experimentRegion: process.env.REACT_APP_AWS_REGION,
            experimentRunType: runType
          }
        }),
      };

      console.log("jobData: ", jobData);

      const response = await createNewScheduledJob(userInfo, currentCompany, jobData);
      if (response) {
        await loadScheduledJobs(userInfo);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating scheduled job:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const jobTypes = ["Experiment"];
  const runTypes = ["run_optimization", "run_scenario"];
  const runTypeLabels = {
    "run_optimization": "Rerun Optimization",
    "run_scenario": "Run Scenario Planning"
  };

  // Helper function to parse experiment status
  const parseExperimentStatus = (experiment) => {
    try {
      const statusObj = JSON.parse(experiment.experimentStatus);
      return statusObj.status;
    } catch (e) {
      return experiment.experimentStatus;
    }
  };

  // Function to get styles based on status
  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
      case "Running":
        return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
      case "Failed":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Terminated":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Initiating...":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
      case "Executing":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
      case "Initiated":
        return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started
      case "Terminating":
        return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
      case "On Hold":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused
      case "Retrying...":
        return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying
      case "Executed":
        return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue
      case "Launching...":
        return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue
      case "DataProcessCompleted":
        return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green
      case "Scheduled":
        return { color: "#7C3AED", backgroundColor: "#F3E8FF" }; // Purple: Scheduled
      default:
        return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Unknown
    }
  };

  // Get completed experiments for selection
  const experimentOptions = React.useMemo(() => {
    console.log("Calculating experiment options");
    const options = [...new Set(
      experiments_list
        .filter(
          (experiment) =>
            !experiment.inTrash &&
            parseExperimentStatus(experiment) === "Completed"
        )
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((experiment) => experiment.experimentID)
    )];
    console.log("Available experiment options:", options);
    return options;
  }, [experiments_list]);

  // Dictionary mapping ID to experiment object
  const experimentObjectDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseExperimentStatus(experiment) === "Completed"
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [experiment.experimentID, experiment])
  );

  // Dictionary mapping ID to experiment for display
  const experimentValuesDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseExperimentStatus(experiment) === "Completed"
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [experiment.experimentID, experiment])
  );

  // Create custom components for experiment options
  const experimentComponentDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseExperimentStatus(experiment) === "Completed"
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [
        experiment.experimentID,
        () => (
          <Stack
            direction={"row"}
            alignItems={"center"}
            sx={{ width: "100%", padding: "4px" }}
          >
            <Stack spacing={0.1} width={"30%"}>
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
                {experiment.experimentName}
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
                {experiment.experimentID}
              </Typography>
            </Stack>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"flex-start"} width={"20%"}>
              <Chip
                label={experiment.experimentModuleName}
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
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              width={"50%"}
            >
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
                  Created At
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
                  {experiment.createdAt}
                </Typography>
              </Stack>
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
                  Updated At
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
                  {experiment.updatedAt}
                </Typography>
              </Stack>
              <Tooltip title="Completed Experiment">
                <Chip
                  label={parseExperimentStatus(experiment)}
                  size="small"
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    textAlign: "initial",
                    ...getStatusStyles(parseExperimentStatus(experiment)),
                  }}
                />
              </Tooltip>
            </Stack>
          </Stack>
        ),
      ])
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: "1px solid #E5E7EB",
        padding: "16px 24px",
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 600,
              color: "#101828",
            }}
          >
            Attach Job
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ padding: "24px" }}>
        <Stack spacing={3}>
          <CustomSelect
            label="Job Type"
            showLabel
            values={jobTypes}
            selectedValues={{ "Job Type": jobType ? [jobType] : [] }}
            setSelectedValues={(value) => setJobType(value["Job Type"][0])}
            placeholder="Select job type"
          />
          {jobType === "Experiment" && (
            <>
              <CustomAutoCompleteObject
                showLabel
                label="Select Experiment"
                placeholder="Select an experiment to attach"
                values={experimentOptions}
                selectedValues={{
                  Experiment: selectedExperiment ? [selectedExperiment.experimentID] : [],
                  ExperimentObject: selectedExperiment ? [selectedExperiment] : []
                }}
                setSelectedValues={(value) => {
                  console.log("Selected value:", value);
                  if (value?.ExperimentObject?.[0]) {
                    setSelectedExperiment(value.ExperimentObject[0]);
                  } else {
                    setSelectedExperiment(null);
                  }
                }}
                valuesDict={experimentValuesDict}
                objectDict={experimentObjectDict}
                optionComponentDict={experimentComponentDict}
                isMultiSelect={false}
                target="Experiment"
                path="selectedExperiment"
                excludedOptions={excludedExperiments}
              />
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#344054",
                    mb: 1,
                  }}
                >
                  Run Type
                </Typography>
                <RadioGroup
                  value={runType}
                  onChange={(e) => setRunType(e.target.value)}
                  sx={{
                    gap: 1,
                    flexDirection: { xs: 'column', md: 'row' },
                    '& .MuiFormControlLabel-root': {
                      marginRight: { md: '24px' }
                    }
                  }}
                >
                  <FormControlLabel
                    value="run_optimization"
                    control={<Radio />}
                    label="Rerun Optimization"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontFamily: "Inter",
                        fontSize: "14px",
                        color: "#344054"
                      }
                    }}
                  />
                  <FormControlLabel
                    value="run_scenario"
                    control={<Radio />}
                    label="Run Scenario Planning"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontFamily: "Inter",
                        fontSize: "14px",
                        color: "#344054"
                      }
                    }}
                  />
                </RadioGroup>
              </FormControl>
              <FormControl>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#344054",
                    mb: 1,
                  }}
                >
                  Occurrence
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <RadioGroup
                    value={occurrence === 'max' ? 'max' : 'custom'}
                    onChange={(e) => {
                      if (e.target.value === 'max') {
                        setOccurrence('max');
                      } else if (occurrence === 'max') {
                        setOccurrence('1');
                      }
                    }}
                    sx={{
                      flexDirection: 'row',
                      '& .MuiFormControlLabel-root': {
                        marginRight: '24px'
                      }
                    }}
                  >
                    <FormControlLabel
                      value="max"
                      control={<Radio />}
                      label={`Maximum (${calculateMaxOccurrences})`}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontFamily: "Inter",
                          fontSize: "14px",
                          color: "#344054"
                        }
                      }}
                    />
                    <FormControlLabel
                      value="custom"
                      control={<Radio />}
                      label="Custom"
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontFamily: "Inter",
                          fontSize: "14px",
                          color: "#344054"
                        }
                      }}
                    />
                  </RadioGroup>
                  {occurrence !== 'max' && (
                    <TextField
                      type="number"
                      value={occurrence}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) > 0 && Number(value) <= calculateMaxOccurrences)) {
                          setOccurrence(value);
                        }
                      }}
                      inputProps={{
                        min: 1,
                        max: calculateMaxOccurrences,
                        style: {
                          fontFamily: "Inter",
                          fontSize: "14px",
                          color: "#344054"
                        }
                      }}
                      sx={{
                        width: '100px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        }
                      }}
                    />
                  )}
                </Stack>
                {occurrence !== 'max' && (
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      color: "#475467",
                      mt: 1,
                    }}
                  >
                    Enter a value between 1 and {calculateMaxOccurrences}
                  </Typography>
                )}
              </FormControl>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{
        padding: "16px 24px",
        borderTop: "1px solid #E5E7EB",
      }}>
        <CustomButton
          title="Cancel"
          onClick={handleClose}
          outlined
          disabled={isSubmitting}
        />
        <CustomButton
          title="Attach"
          onClick={handleSubmit}
          disabled={jobType === "Experiment" && !selectedExperiment || isSubmitting}
          loading={isSubmitting}
        />
      </DialogActions>
    </Dialog>
  );
};

const StyledJobTableCell = muiStyled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.default,
    padding: "12px 16px",
    fontFamily: "Inter",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "18px",
    color: "#475467",
  },
  [`&.${tableCellClasses.body}`]: {
    padding: "16px",
    fontFamily: "Inter",
    fontSize: "14px",
    color: "#475467",
  }
}));

const getStatusStyles = (status) => {
  switch (status) {
    case "Completed":
      return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
    case "Running":
      return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
    case "Failed":
      return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
    case "Terminated":
      return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
    case "Initiating...":
      return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
    case "Executing":
      return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
    case "Initiated":
      return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started
    case "Terminating":
      return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
    case "On Hold":
      return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused
    case "Retrying...":
      return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying
    case "Executed":
      return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue
    case "Launching...":
      return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue
    case "DataProcessCompleted":
      return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green
    case "Scheduled":
      return { color: "#7C3AED", backgroundColor: "#F3E8FF" }; // Purple: Scheduled
    default:
      return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Unknown
  }
};

const StyledJobTableRow = muiStyled(TableRow)(({ theme }) => ({
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

const isWorkflowExpired = (endDate) => {
  if (!endDate) return false;
  return Date.now() > Number(endDate);
};

const EditWorkflowDialog = ({ open, onClose, workflow, onSave }) => {
  const [editForm, setEditForm] = React.useState({
    workflowName: workflow?.workflowName || '',
    startDate: workflow?.workFlowStartDate || null,
    endDate: workflow?.workFlowEndDate || null,
    frequency: workflow?.triggerFrequency?.toLowerCase() || 'daily',
    time: workflow?.triggerTime ? dayjs(`2000-01-01T${workflow.triggerTime}`) : dayjs('2000-01-01T12:00:00'),
    selectedDays: workflow?.triggerDayOfWeek ? [daysOfWeek[workflow.triggerDayOfWeek]] : [],
    monthlyDate: workflow?.triggerDayOfMonth?.toString() || '1'
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { loadWorkflows } = useWorkflow();
  const { userInfo } = useAuth();

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const hours = editForm.time.hour().toString().padStart(2, '0');
      const minutes = editForm.time.minute().toString().padStart(2, '0');
      const triggerTime = `${hours}:${minutes}`;

      const triggerConfig = {
        frequency: editForm.frequency.toUpperCase(),
        time: triggerTime,
      };

      if (editForm.frequency === 'weekly' && editForm.selectedDays.length > 0) {
        const dayIndex = daysOfWeek.indexOf(editForm.selectedDays[0]);
        if (dayIndex !== -1) {
          triggerConfig.dayOfWeek = dayIndex;
        }
      }

      if (editForm.frequency === 'monthly' && editForm.monthlyDate) {
        triggerConfig.dayOfMonth = parseInt(editForm.monthlyDate);
      }

      const workflowData = {
        workflowName: editForm.workflowName,
        workflowStatus: workflow.workflowStatus,
        workflowID: workflow.workflowID,
        companyID: workflow.companyID,
        userID: workflow.userID,
        createdAt: workflow.createdAt,
        updatedAt: Date.now(),
        createdBy: workflow.createdBy,
        inTrash: workflow.inTrash,
        workFlowStartDate: typeof editForm.startDate === 'number' ? editForm.startDate : new Date(editForm.startDate).getTime(),
        workFlowEndDate: editForm.endDate ? (() => {
          // Handle both timestamp (number) and date string cases
          if (typeof editForm.endDate === 'number') {
            // If it's already a timestamp, use it directly but set to end of day
            const endDate = new Date(editForm.endDate);
            endDate.setHours(23, 59, 59, 999);
            return endDate.getTime();
          } else {
            // Parse date string and create in local timezone
            const dateParts = editForm.endDate.split('-');
            const endDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            endDate.setHours(23, 59, 59, 999); // Set to end of day (11:59:59 PM) in local timezone
            return endDate.getTime();
          }
        })() : null,
        triggerFrequency: triggerConfig.frequency,
        triggerTime: triggerConfig.time,
        triggerDayOfWeek: triggerConfig.dayOfWeek,
        triggerDayOfMonth: triggerConfig.dayOfMonth,
        triggerConfig: triggerConfig,
      };

      await onSave(workflowData);
      await loadWorkflows();
      onClose();
    } catch (error) {
      console.error("Error updating workflow:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: "1px solid #E5E7EB",
        padding: "16px 24px",
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 600,
              color: "#101828",
            }}
          >
            Edit Workflow
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ padding: "24px" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomTextInput
              label="Workflow Name"
              showLabel
              value={editForm.workflowName}
              onChange={(e) => handleInputChange("workflowName", e.target.value)}
              placeholder="Enter workflow name"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomDatePicker
              label="Start Date"
              showLabel
              selectedValue={editForm.startDate}
              setSelectedValue={(value) => handleInputChange("startDate", value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomDatePicker
              label="End Date"
              showLabel
              selectedValue={editForm.endDate}
              setSelectedValue={(value) => handleInputChange("endDate", value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#344054",
                  mb: 1,
                }}
              >
                Frequency
              </Typography>
              <RadioGroup
                row
                value={editForm.frequency}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '24px',
                  '& .MuiFormControlLabel-root': {
                    margin: 0
                  }
                }}
              >
                <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#344054",
                  mb: 1,
                }}
              >
                Time
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  minutesStep={1}
                  value={editForm.time}
                  onChange={(newTime) => handleInputChange("time", newTime)}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  format="HH:mm"
                  ampm={false}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          {editForm.frequency === "weekly" && (
            <Grid item xs={12}>
              <CustomSelect
                label="Days"
                showLabel
                values={daysOfWeek}
                isMultiSelect
                selectedValues={{ Days: editForm.selectedDays }}
                setSelectedValues={(value) => handleInputChange("selectedDays", value.Days)}
                placeholder="Select days"
              />
            </Grid>
          )}

          {editForm.frequency === "monthly" && (
            <Grid item xs={12}>
              <CustomSelect
                label="Date"
                showLabel
                values={monthDates}
                selectedValues={{ Date: [editForm.monthlyDate] }}
                setSelectedValues={(value) => handleInputChange("monthlyDate", value.Date[0])}
                placeholder="Select date"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{
        padding: "16px 24px",
        borderTop: "1px solid #E5E7EB",
      }}>
        <CustomButton
          title="Cancel"
          onClick={onClose}
          outlined
          disabled={isSubmitting}
        />
        <CustomButton
          title="Save Changes"
          onClick={handleSave}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </DialogActions>
    </Dialog>
  );
};

const Row = ({ row, index, onDeleteConfirm, onPauseResume, loadWorkflows }) => {
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [attachJobDialogOpen, setAttachJobDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = React.useState(false);
  const [selectedExtendDate, setSelectedExtendDate] = React.useState(null);
  const [deleteJobDialogOpen, setDeleteJobDialogOpen] = React.useState(false);
  const [jobToDelete, setJobToDelete] = React.useState(null);
  const isEven = index % 2 === 0;
  const { scheduled_jobs_list, loading, loadScheduledJobs, deleteScheduledJob } = useScheduledJob();
  const { userInfo, currentCompany } = useAuth();
  const { extendWorkflow, editWorkflow, deleteWorkflow } = useWorkflow();

  // Polling for scheduled jobs when expanded
  React.useEffect(() => {
    let intervalId;
    if (open && userInfo) {
      // Initial load
      loadScheduledJobs(userInfo);
      // Poll every 5 seconds
      intervalId = setInterval(() => {
        loadScheduledJobs(userInfo);
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [open, userInfo]);

  // Filter jobs for this workflow
  const workflowJobs = React.useMemo(() => {
    return scheduled_jobs_list.filter(job => job.workflowID === row.workflowID);
  }, [scheduled_jobs_list, row.workflowID]);

  const handleDeleteWorkflow = async () => {
    try {
      // Check for scheduled jobs under this workflow
      const jobsForWorkflow = scheduled_jobs_list.filter(job => job.workflowID === row.workflowID);
      const hasActiveJobs = jobsForWorkflow.some(job => job.jobOccurance > 0);
      if (jobsForWorkflow.length > 0 && hasActiveJobs) {
        toast.warn(`${row.workflowName} has some jobs scheduled under it. You cannot delete it now. Try again once all jobs are executed.`);
        setDialogOpen(false);
        return;
      }
      await deleteWorkflow(userInfo, currentCompany, row.workflowID);
      await loadWorkflows();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error deleting workflow:", error);
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleAttachJobOpen = () => {
    setAttachJobDialogOpen(true);
  };

  const handleAttachJobClose = () => {
    setAttachJobDialogOpen(false);
  };

  const handleDeleteJob = async () => {
    try {
      if (!jobToDelete) return;
      
      await deleteScheduledJob(jobToDelete.scheduledJobID, row.workflowID);
      await loadScheduledJobs(userInfo);
      setDeleteJobDialogOpen(false);
      setJobToDelete(null);
      toast.success('Scheduled job deleted successfully');
    } catch (error) {
      console.error("Error deleting scheduled job:", error);
      toast.error('Failed to delete scheduled job');
    }
  };

  const handleDeleteJobDialogOpen = (job) => {
    setJobToDelete(job);
    setDeleteJobDialogOpen(true);
  };

  const handleDeleteJobDialogClose = () => {
    setDeleteJobDialogOpen(false);
    setJobToDelete(null);
  };

  const statusColors = getStatusColor(row.workflowStatus);

  const handleEditWorkflow = async (workflowData) => {
    try {
      await editWorkflow(userInfo, currentCompany, workflowData);
      await loadWorkflows();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating workflow:", error);
    }
  };

  const handleExtendWorkflow = async () => {
    try {
      if (!selectedExtendDate) return;

          const newEndDate = (() => {
      // Handle both timestamp (number) and date string cases
      if (typeof selectedExtendDate === 'number') {
        // If it's already a timestamp, use it directly but set to end of day
        const endDate = new Date(selectedExtendDate);
        endDate.setHours(23, 59, 59, 999);
        return endDate.getTime();
      } else {
        // Parse date string and create in local timezone
        const dateParts = selectedExtendDate.split('-');
        const endDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        endDate.setHours(23, 59, 59, 999); // Set to end of day (11:59:59 PM) in local timezone
        return endDate.getTime();
      }
    })();
      await extendWorkflow(userInfo, currentCompany, newEndDate, row.workflowID);
      await loadWorkflows();
      setExtendDialogOpen(false);
      setSelectedExtendDate(null);
    } catch (error) {
      console.error("Error extending workflow:", error);
    }
  };

  const handleCloseExtendDialog = () => {
    setExtendDialogOpen(false);
    setSelectedExtendDate(null);
  };

  return (
    <>
      <TableRow
        sx={{
          cursor: "pointer",
          backgroundColor: isWorkflowExpired(row.workFlowEndDate) ? "#F2F4F7" : (isEven ? "#FFF" : "#F9FAFB"),
          borderBottom: "1px solid #EAECF0",
          opacity: isWorkflowExpired(row.workFlowEndDate) ? 0.7 : 1,
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease-in-out",
            backgroundColor: "#F9F5FF",
            borderTop: "1px solid #D6BBFB",
            borderBottom: "1px solid #D6BBFB",
          },
        }}
      >
        <TableCell align="left" width="18%" sx={tableCellStyle}>
          {row.workflowName}
        </TableCell>
        <TableCell align="left" width="12%" sx={tableCellStyle}>
          {getFrequencyDisplay(row)}
        </TableCell>
        <TableCell align="center" width="10%">
          <Box
            sx={{
              padding: "2px 8px",
              borderRadius: "16px",
              backgroundColor: statusColors.bg,
              maxHeight: "22px",
              width: "max-content",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "18px",
                textAlign: "center",
                color: statusColors.text,
              }}
            >
              {row.workflowStatus}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="left" width="15%" sx={tableCellStyle}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>
              {formatDate(row.workFlowEndDate)}
            </Typography>
            {isWorkflowExpired(row.workFlowEndDate) && (
              <CustomButton
                title="Extend"
                onClick={(e) => {
                  e.stopPropagation();
                  setExtendDialogOpen(true);
                }}
                sx={{
                  minWidth: 'auto',
                  padding: '4px 12px',
                  height: '28px',
                  backgroundColor: '#0C66E4',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#0C66E4',
                  },
                }}
              />
            )}
          </Stack>
        </TableCell>
        <TableCell align="left" width="15%" sx={tableCellStyle}>
          {formatDate(row.updatedAt)}
        </TableCell>
        <TableCell align="left" width="12%" sx={tableCellStyle}>
          {row.createdBy}
        </TableCell>
        <TableCell align="left" width="8%">
          <IconButton
            aria-label="settings"
            onClick={() => setOpen(!open)}
            sx={{
              color: "#0C66E4",
            }}
            disabled={isWorkflowExpired(row.workFlowEndDate)}
          >
            {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                backgroundColor: "#F9FAFB",
                width: "100%",
                padding: "24px",
              }}
            >
              <Stack spacing={3} sx={{ width: "100%" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ width: "100%" }}
                >
                  <Typography variant="h6" sx={{ color: "#101828", fontWeight: 600 }}>
                    Attached Jobs
                  </Typography>
                  <CustomButton
                    title="+ Attach Job"
                    onClick={handleAttachJobOpen}
                    disabled={isWorkflowExpired(row.workFlowEndDate)}
                  />
                </Stack>

                {workflowJobs.length === 0 ? (
                  <Typography sx={{ color: "#475467", textAlign: "center", py: 4 }}>
                    No jobs attached to this workflow
                  </Typography>
                ) : (
                  <TableContainer sx={{ width: "100%" }}>
                    <Table sx={{ width: "100%" }}>
                      <TableHead>
                        <TableRow>
                          <StyledJobTableCell width="18%">Job Name</StyledJobTableCell>
                          <StyledJobTableCell width="10%">Job Type</StyledJobTableCell>
                          <StyledJobTableCell width="15%">Module Name</StyledJobTableCell>
                          <StyledJobTableCell width="12%">Run Type</StyledJobTableCell>
                          <StyledJobTableCell width="10%">Occurrences</StyledJobTableCell>
                          <StyledJobTableCell width="15%">Next Execution</StyledJobTableCell>
                          <StyledJobTableCell width="12%">Created At</StyledJobTableCell>
                          <StyledJobTableCell width="8%">Status</StyledJobTableCell>
                          <StyledJobTableCell width="8%">Action</StyledJobTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {workflowJobs.map((job) => (
                          <StyledJobTableRow
                            key={job.jobID}
                            sx={job.jobOccurance === 0 ? { backgroundColor: '#F3F4F6', opacity: 0.6 } : {}}
                          >
                            <StyledJobTableCell>
                              <Stack spacing={0.5}>
                                <Typography sx={{ fontWeight: 500, color: "#101828" }}>
                                  {job.jobName}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#475467" }}>
                                  {job.jobID}
                                </Typography>
                              </Stack>
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              <Chip
                                label={job.jobType}
                                size="small"
                                sx={{
                                  backgroundColor: "#F0F9FF",
                                  color: "#0369A1",
                                  fontWeight: 500,
                                }}
                              />
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              {job.experimentModuleName ? (
                                <Chip
                                  label={job.experimentModuleName}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#ECFDF3",
                                    color: "#027A48",
                                    fontWeight: 500,
                                  }}
                                />
                              ) : (
                                <Typography sx={{ color: "#475467", fontSize: "14px" }}>
                                  N/A
                                </Typography>
                              )}
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              {job.experimentRunType ? (
                                <Chip
                                  label={formatRunType(job.experimentRunType)}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#F0FDF4",
                                    color: "#166534",
                                    fontWeight: 500,
                                  }}
                                />
                              ) : (
                                <Typography sx={{ color: "#475467", fontSize: "14px" }}>
                                  N/A
                                </Typography>
                              )}
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              <Chip
                                label={`${job.jobOccurance}`}
                                size="small"
                                sx={{
                                  backgroundColor: "#FDF2F8",
                                  color: "#BE185D",
                                  fontWeight: 500,
                                }}
                              />
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              {job.jobOccurance === 0 ? (
                                <Typography sx={{ color: '#98A2B3', fontSize: '14px' }}>-</Typography>
                              ) : (
                                formatDate(job.nextExecutionTime)
                              )}
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              {formatDate(job.createdAt)}
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              {(() => {
                                const statusStyles = getStatusStyles(job.scheduledJobStatus || "Scheduled");
                                return (
                                  <Chip
                                    label={job.scheduledJobStatus || "Scheduled"}
                                    size="small"
                                    sx={{
                                      backgroundColor: statusStyles.backgroundColor,
                                      color: statusStyles.color,
                                      fontWeight: 500,
                                    }}
                                  />
                                );
                              })()}
                            </StyledJobTableCell>
                            <StyledJobTableCell>
                              <IconButton
                                onClick={() => handleDeleteJobDialogOpen(job)}
                                disabled={job.jobOccurance === 0}
                                sx={{
                                  color: "#DC2626",
                                  '&:hover': {
                                    backgroundColor: "#FEE2E2",
                                  },
                                  '&:disabled': {
                                    color: "#9CA3AF",
                                  }
                                }}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </StyledJobTableCell>
                          </StyledJobTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ width: "100%" }}
                >
                  <CustomButton
                    title="Close"
                    outlined
                    onClick={() => setOpen(false)}
                  />
                  {/*  <CustomButton
                    title="Test Workflow"
                    outlined
                    onClick={() => console.log(row)}
                  /> */}
                  <CustomButton
                    title="Edit Workflow"
                    outlined
                    onClick={() => setEditDialogOpen(true)}
                    disabled={isWorkflowExpired(row.workFlowEndDate)}
                  />
                  <CustomButton
                    title={row.workflowStatus === "ACTIVE" ? "Pause Workflow" : "Resume Workflow"}
                    outlined
                    onClick={() => onPauseResume(row)}
                    disabled={isWorkflowExpired(row.workFlowEndDate)}
                  />
                  <CustomButton
                    title="Delete Workflow"
                    outlined
                    onClick={handleDialogOpen}
                    disabled={isWorkflowExpired(row.workFlowEndDate)}
                  />
                </Stack>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <ConfirmationDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleConfirm={handleDeleteWorkflow}
        WarningText="Are you sure you want to delete this workflow?"
        ResultText="This action cannot be undone. The workflow will be permanently deleted."
        ConfirmButtonTitle="Delete"
      />
      <ConfirmationDialog
        open={deleteJobDialogOpen}
        handleClose={handleDeleteJobDialogClose}
        handleConfirm={handleDeleteJob}
        WarningText="Are you sure you want to delete this scheduled job?"
        ResultText="This action cannot be undone. The scheduled job will be permanently deleted."
        ConfirmButtonTitle="Delete"
      />
      <AttachJobDialog
        open={attachJobDialogOpen}
        onClose={handleAttachJobClose}
        workflow={row}
      />
      <EditWorkflowDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        workflow={row}
        onSave={handleEditWorkflow}
      />
      <Dialog
        open={extendDialogOpen}
        onClose={handleCloseExtendDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: "1px solid #E5E7EB",
          padding: "16px 24px",
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "18px",
                fontWeight: 600,
                color: "#101828",
              }}
            >
              Extend Workflow
            </Typography>
            <IconButton onClick={handleCloseExtendDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ padding: "24px" }}>
          <CustomDatePicker
            label="New End Date"
            showLabel
            minDate={new Date()}
            selectedValue={selectedExtendDate}
            setSelectedValue={(value) => setSelectedExtendDate(value)}
          />
        </DialogContent>
        <DialogActions sx={{
          padding: "16px 24px",
          borderTop: "1px solid #E5E7EB",
        }}>
          <CustomButton
            title="Cancel"
            onClick={handleCloseExtendDialog}
            outlined
          />
          <CustomButton
            title="Confirm"
            onClick={handleExtendWorkflow}
            disabled={!selectedExtendDate}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

// Skeleton loader component for WorkflowTable
const WorkflowTableSkeleton = () => (
  <Box flex={1}>
    <TableContainer component={Box}>
      <Table>
        <TableHead>
          <TableRow sx={{ borderBottom: "1px solid #EAECF0" }}>
            {["Workflow Name", "Schedule", "Status", "End Date", "Last Updated", "Created By", "Action"].map((header, index) => (
              <TableCell key={index} sx={headingStyle}>
                <Skeleton variant="text" width="80%" height={20} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" width="100%" height={40} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box sx={{ display: "flex", justifyContent: "flex-end", padding: "20px 24px" }}>
      <Skeleton variant="rectangular" width={200} height={40} />
    </Box>
  </Box>
);

const WorkflowTable = ({ workflows, onDeleteWorkflow, onPauseResumeWorkflow, loadWorkflows, isLoading = false }) => {
  const [page, setPage] = React.useState(1);
  const RecordsPerPage = 5;
  const { loadScheduledJobs } = useScheduledJob();
  const { userInfo } = useAuth();

  React.useEffect(() => {
    if (userInfo) {
      loadScheduledJobs(userInfo);
    }
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Filter out workflows in trash
  const filteredWorkflows = workflows.filter((workflow) => !workflow.inTrash);

  const paginatedData = filteredWorkflows.slice((page - 1) * RecordsPerPage, page * RecordsPerPage);

  // Show skeleton loader when loading
  if (isLoading) {
    return <WorkflowTableSkeleton />;
  }

  return (
    <Box flex={1}>
      {filteredWorkflows.length === 0 ? (
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
            No workflows available
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Box}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: "1px solid #EAECF0" }}>
                <TableCell width="18%" sx={headingStyle}>
                  Workflow Name
                </TableCell>
                <TableCell width="12%" sx={headingStyle}>
                  Schedule
                </TableCell>
                <TableCell width="10%" sx={headingStyle}>
                  Status
                </TableCell>
                <TableCell width="15%" sx={headingStyle}>
                  End Date
                </TableCell>
                <TableCell width="15%" sx={headingStyle}>
                  Last Updated
                </TableCell>
                <TableCell width="12%" sx={headingStyle}>
                  Created By
                </TableCell>
                <TableCell width="8%" sx={headingStyle}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((workflow, index) => (
                <Row
                  key={workflow.workflowID}
                  row={workflow}
                  index={index}
                  onDeleteConfirm={onDeleteWorkflow}
                  onPauseResume={onPauseResumeWorkflow}
                  loadWorkflows={loadWorkflows}
                />
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={Math.ceil(filteredWorkflows.length / RecordsPerPage)}
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
        </TableContainer>
      )}
    </Box>
  );
};

export default WorkflowTable; 