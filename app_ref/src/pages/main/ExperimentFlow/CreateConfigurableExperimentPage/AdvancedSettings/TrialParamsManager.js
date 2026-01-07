import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import CustomAutocomplete from "../../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";
import CustomCheck from "../../../../../components/ConfigurableCustomInputControls/CustomCheck";
import CustomButton from "../../../../../components/CustomButton";
import useModule from "../../../../../hooks/useModule";
import { styled } from "@mui/material/styles";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const TrialParamsManager = ({ modelType }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingParam, setEditingParam] = useState(null);
  const {
    trial_params_mlp,
    addTrialParams,
    removeItem,
    editTrialParams,
    getTrialParam,
    configState,
  } = useModule();

  const featureGroupTypeOptions = (modelType) => {
    if (
      modelType &&
      configState.training.models[modelType] &&
      configState.training.models[modelType].feature_group_type
    ) {
      return Object.keys(configState.training.models[modelType].feature_group_type);
    }
    return [];
  };

  const trial_params = getTrialParam(modelType);
  const trial_limit = configState.training.models[modelType].trials;

  const getDefaultParam = () => {
    switch (modelType) {
      case "MLP":
        return {
          optimizer: "RMSprop",
          scheduler: "ReduceLROnPlateau",
          SWA: false,
          parameter_average: true,
        };
      case "LSTM":
      case "GRU":
        return {
          optimizer: "RMSprop",
          scheduler: "ReduceLROnPlateau",
          SWA: false,
          parameter_average: true,
          feature_group_type: "feature_group_type1",
        };
      default:
        return {};
    }
  };

  const handleAdd = () => {
    const newParam = getDefaultParam();
    addTrialParams(newParam, modelType);
  };

  const handleEdit = (index) => {
    setEditingParam({ ...trial_params[index] });
    setEditingIndex(index);
  };

  const getArrayName = () => {
    if (modelType === "MLP") {
      return "trial_params_mlp";
    } else if (modelType === "LSTM") {
      return "trial_params_lstm";
    } else if (modelType === "GRU") {
      return "trial_params_gru";
    }
  };

  const handleDelete = (index) => {
    const arrayName = getArrayName();
    removeItem(index, arrayName, modelType);
  };

  const handleSave = () => {
    if (editingIndex !== null && editingParam) {
      editTrialParams(editingParam, editingIndex, modelType);
      setEditingIndex(null);
      setEditingParam(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingParam(null);
  };

  const updateValue = (field, value) => {
    setEditingParam((prevParam) => ({
      ...prevParam,
      [field]: value,
    }));
  };

  const renderEditFields = (param) => {
    return (
      <Grid container spacing={2}>
        {Object.entries(param).map(([key, value]) => (
          <>
            {typeof value === "boolean" ? (
              <Grid item xs={6} md={3} key={key}>
                <CustomCheck
                  question={key}
                  selectedValues={value}
                  setSelectedValues={(newValue) => updateValue(key, newValue)}
                />
              </Grid>
            ) : (
              <Grid item xs={6} md={6} key={key}>
                <CustomAutocomplete
                  label={key}
                  showLabel={true}
                  selectedValues={value}
                  setSelectedValues={(newValue) => updateValue(key, newValue)}
                  values={getOptionsForField(key)}
                  valuesDict={getOptionsForField(key)}
                  formatLabel={false}
                />
              </Grid>
            )}
          </>
        ))}
      </Grid>
    );
  };

  const getOptionsForField = (field) => {
    switch (field) {
      case "optimizer":
        return ["RMSprop", "SGD", "Adam"];
      case "scheduler":
        return ["ReduceLROnPlateau", "CyclicLR"];
      case "feature_group_type":
        return featureGroupTypeOptions(modelType);
      default:
        return [];
    }
  };

  const getTableHeaders = () => {
    if (trial_params.length === 0) return ["Trial", "Actions"];
    const firstParam = trial_params[0];
    return ["Trial", ...Object.keys(firstParam), "Actions"];
  };

  const renderTableCell = (param, key) => {
    const value = param[key];
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value.toString();
  };

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">{modelType} Trial Parameters</Typography>
        <CustomButton
          title={"Add Trial"}
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={trial_params?.length >= trial_limit}
        />
      </Box>
      <StyledTableContainer component={Paper}>
        <StyledTable>
          <TableHead>
            <TableRow>
              {getTableHeaders().map((header, index) => (
                <StyledTableCell key={index}>{header}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {trial_params?.map((param, index) => (
              <TableRow key={index}>
                {editingIndex === index ? (
                  <StyledTableCell colSpan={getTableHeaders().length}>
                    <Box width="100%">
                      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                        Editing Trial {index + 1}
                      </Typography>
                      {renderEditFields(editingParam)}
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <StyledButton variant="outlined" onClick={handleCancel}>
                          Cancel
                        </StyledButton>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          onClick={handleSave}
                        >
                          Save
                        </StyledButton>
                      </Box>
                    </Box>
                  </StyledTableCell>
                ) : (
                  <>
                    <StyledTableCell>{index + 1}</StyledTableCell>
                    {Object.keys(param).map((key) => (
                      <StyledTableCell key={key}>
                        {renderTableCell(param, key)}
                      </StyledTableCell>
                    ))}
                    <StyledTableCell>
                      <StyledButton
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
                      </StyledButton>
                      <StyledButton
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(index)}
                        disabled={trial_params?.length <= 2}
                      >
                        Delete
                      </StyledButton>
                    </StyledTableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </div>
  );
};

export default TrialParamsManager;
