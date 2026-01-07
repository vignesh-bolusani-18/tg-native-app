import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Grid,
} from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../components/CustomButton";
import CustomTextInput from "../../../components/CustomInputControls/CustomTextInput";
import CustomDatePicker from "../../../components/CustomInputControls/CustomDatePicker";
import CustomSelect from "../../../components/CustomInputControls/CustomSelector";
import CustomAutoComplete from "../../../components/CustomInputControls/CustomAutoComplete";
import useWorkflow from "../../../hooks/useWorkflow";
import useAuth from "../../../hooks/useAuth";
import WorkflowTable from "../../../components/WorkflowTable";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function Workflows() {
  const { userInfo, currentCompany } = useAuth();
  const {
    workflows_list,
    loadWorkflows,
    openCreateWorkflowModal,
    setOpenCreateWorkflowModal,
    workflowForm,
    updateWorkflowForm,
    clearWorkflowForm,
    workflowLoading,
    workflowsListLoading,
    createNewWorkflow,
    deleteWorkflow,
    editWorkflow,
  } = useWorkflow();

  // Load workflows only once when component mounts
  React.useEffect(() => {
    if (userInfo) {
      loadWorkflows(userInfo);
    }
  }, []); // Only depend on userInfo

  // Function to get nearest next 5-minute interval
  const getNextFiveMinuteInterval = () => {
    const now = dayjs();
    const minutes = now.minute();
    const nextInterval = Math.ceil(minutes / 5) * 5;
    
    if (nextInterval === 60) {
      // If next interval would be 60 minutes, move to next hour
      return now.hour(now.hour() + 1).minute(0).second(0).millisecond(0);
    } else {
      return now.minute(nextInterval).second(0).millisecond(0);
    }
  };

  // Update initial time to be nearest next 5-minute interval when modal opens
  React.useEffect(() => {
    if (openCreateWorkflowModal) {
      // Always set to next 5-minute interval when modal opens (fresh calculation)
      updateWorkflowForm('time', getNextFiveMinuteInterval());
    }
  }, [openCreateWorkflowModal]);

  const handleOpenModal = () => setOpenCreateWorkflowModal(true);
  const handleCloseModal = () => {
    setOpenCreateWorkflowModal(false);
    clearWorkflowForm();
  };

  const handleInputChange = (field, value) => {
    if (field === 'time') {
      // Ensure we're working with a valid dayjs object
      const timeValue = value ? dayjs(value) : dayjs();
      updateWorkflowForm(field, timeValue);
    } else {
      updateWorkflowForm(field, value);
    }
  };

  const handleSubmit = async () => {
    try {
      // Ensure we have a valid dayjs object
      const timeValue = dayjs.isDayjs(workflowForm.time) ? workflowForm.time : dayjs();
      
      const hours = timeValue.hour().toString().padStart(2, '0');
      const minutes = timeValue.minute().toString().padStart(2, '0');
      const triggerTime = `${hours}:${minutes}`;
      const triggerConfig = {
        frequency: workflowForm.frequency.toUpperCase(),
        time: triggerTime,
      };
      if (workflowForm.frequency === 'weekly' && workflowForm.selectedDays.length > 0) {
        const dayIndex = daysOfWeek.indexOf(workflowForm.selectedDays[0]);
        if (dayIndex !== -1) {
          triggerConfig.dayOfWeek = dayIndex;
        }
      }
      if (workflowForm.frequency === 'monthly' && workflowForm.monthlyDate) {
        triggerConfig.dayOfMonth = parseInt(workflowForm.monthlyDate);
      }
      const workflowData = {
        workflowName: workflowForm.workflowName,
        workflowStatus: "ACTIVE",
        workflowID: uuidv4(),
        companyID: currentCompany.companyID,
        userID: userInfo.userID,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: userInfo.userID,
        inTrash: false,
        workFlowStartDate: new Date(workflowForm.startDate).getTime(),
        workFlowEndDate: workflowForm.endDate ? (() => {
          // Parse date string and create in local timezone
          const dateParts = workflowForm.endDate.split('-');
          const endDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
          endDate.setHours(23, 59, 59, 999); // Set to end of day (11:59:59 PM) in local timezone
          return endDate.getTime();
        })() : null,
        triggerFrequency: triggerConfig.frequency,
        triggerTime: triggerConfig.time,
        triggerDayOfWeek: triggerConfig.dayOfWeek,
        triggerDayOfMonth: triggerConfig.dayOfMonth,
        triggerConfig: triggerConfig,
      };
      await createNewWorkflow(userInfo, currentCompany, workflowData);
      handleCloseModal();
    } catch (error) {
      console.error("Error creating workflow:", error);
    }
  };

  const handleDeleteWorkflow = async (workflow) => {
    try {
      await deleteWorkflow(workflow.workflowID);
      loadWorkflows(userInfo);
    } catch (error) {
      console.error("Error deleting workflow:", error);
    }
  };

  const handlePauseResumeWorkflow = async (workflow) => {
    try {
      const newStatus = workflow.workflowStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const updatedWorkflow = {
        ...workflow,
        workflowStatus: newStatus,
        updatedAt: Date.now(),
      };
      await editWorkflow(userInfo, currentCompany, updatedWorkflow);
      await loadWorkflows(userInfo);
    } catch (error) {
      console.error("Error updating workflow status:", error);
    }
  };

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const monthDates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div>
      <Box sx={{ padding: "92px 24px 34px 24px" }}>
        <Box
          sx={{
            borderRadius: "12px",
            border: "1px solid #EAECF0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "20px 24px 19px 24px",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Stack spacing={1} direction="row" alignItems={"center"}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "18px",
                  fontWeight: 500,
                  lineHeight: "28px",
                  textAlign: "left",
                  color: "#101828",
                }}
              >
                Workflows
              </Typography>
            </Stack>
            <Stack spacing={1} direction="row">
              <CustomButton 
                title="+ New Workflow"
                onClick={handleOpenModal}
              />
            </Stack>
          </Box>

          {/* Workflows Table */}
          <WorkflowTable
            workflows={workflows_list}
            onDeleteWorkflow={handleDeleteWorkflow}
            onPauseResumeWorkflow={handlePauseResumeWorkflow}
            loadWorkflows={() => loadWorkflows(userInfo)}
            isLoading={workflowsListLoading}
          />
        </Box>
      </Box>

      {/* Create Workflow Modal */}
      <Dialog 
        open={openCreateWorkflowModal} 
        onClose={handleCloseModal}
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
              Create New Workflow
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
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
                value={workflowForm.workflowName}
                onChange={(e) => handleInputChange("workflowName", e.target.value)}
                placeholder="Enter workflow name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomDatePicker
                label="Start Date"
                showLabel
                selectedValue={workflowForm.startDate}
                setSelectedValue={(value) => handleInputChange("startDate", value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomDatePicker
                label="End Date"
                showLabel
                selectedValue={workflowForm.endDate}
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
                  value={workflowForm.frequency}
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
                  <FormControlLabel 
                    value="daily" 
                    control={<Radio />} 
                    label="Daily"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontFamily: "Inter",
                        fontSize: "14px",
                        color: "#344054"
                      }
                    }}
                  />
                  <FormControlLabel 
                    value="weekly" 
                    control={<Radio />} 
                    label="Weekly"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontFamily: "Inter",
                        fontSize: "14px",
                        color: "#344054"
                      }
                    }}
                  />
                  <FormControlLabel 
                    value="monthly" 
                    control={<Radio />} 
                    label="Monthly"
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
                    value={dayjs.isDayjs(workflowForm.time) ? workflowForm.time : dayjs()}
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

            {workflowForm.frequency === "weekly" && (
              <Grid item xs={12}>
                <CustomSelect
                  label="Days"
                  showLabel
                  values={daysOfWeek}
                  isMultiSelect
                  selectedValues={{ Days: workflowForm.selectedDays }}
                  setSelectedValues={(value) => handleInputChange("selectedDays", value.Days)}
                  placeholder="Select days"
                />
              </Grid>
            )}

            {workflowForm.frequency === "monthly" && (
              <Grid item xs={12}>
                <CustomSelect
                  label="Date"
                  showLabel
                  values={monthDates}
                  selectedValues={{ Date: [workflowForm.monthlyDate] }}
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
            onClick={handleCloseModal}
            outlined
          />
          <CustomButton
            title="Create"
            onClick={handleSubmit}
            loading={workflowLoading}
            disabled={workflowLoading}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
}