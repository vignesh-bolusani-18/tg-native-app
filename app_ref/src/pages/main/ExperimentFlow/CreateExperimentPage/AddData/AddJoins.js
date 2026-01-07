import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, DialogActions, Divider } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";
import useExperiment from "../../../../../hooks/useExperiment";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../../../../components/CustomButton";
import { PaddingTwoTone } from "@mui/icons-material";
import { useParams } from "react-router-dom";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    // padding: theme.spacing(2),
    padding: 0,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: " 1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

const mainTitleStyle = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#101828",
  textAlign: "center",

  paddingTop: "16px",
  alignSelf: "center",
};
const titleStyle = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#101828",
  textAlign: "center",

  alignSelf: "center",
};

export default function AddJoins({ open, handleClose }) {
  const {
    join_operations,
    join_operations_bom,
    join_operations_future,
    join_operations_forecast,
    join_operations_supply_item_master,
    join_operations_new_product,
    join_operations_simple_disaggregation_mapping,
    join_operations_inventory,
    join_operations_transition_item,
    addJoins,
    input_data,
    input_data_cols,
    inventory_input_data,
    inventory_input_data_cols,
    loadedDatasets,
  } = useExperiment();
  const { moduleName } = useParams();
  const simple_disaggregation_mapping_columns =
    loadedDatasets["simple_disaggregation_mapping"]?.[0]?.data_attributes
      ?.cols || [];
  const sales_columns = Array.from(
    new Set([...input_data_cols, ...simple_disaggregation_mapping_columns])
  );

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="lg"
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
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Stack padding="24px 32px 24px 32px" spacing={2}>
            <Stack spacing={2}>
              {join_operations.length > 0 && (
                <Stack spacing={1}>
                  <Typography sx={mainTitleStyle}>Join Operation</Typography>

                  {join_operations.map((join_object, index) => {
                    return (
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Left Input File: ${join_object.file1}`}
                            showLabel
                            values={join_object.file1_allCols}
                            target="join"
                            path={`join_operations[${index}].file1_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Right Input File: ${join_object.file2}`}
                            showLabel
                            values={join_object.file2_allCols}
                            target="join"
                            path={`join_operations[${index}].file2_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              )}
              {join_operations_inventory.length > 0 && (
                <Stack spacing={1}>
                  <Typography sx={mainTitleStyle}>
                    Join Operation (Inventory)
                  </Typography>

                  {join_operations_inventory.map((join_object, index) => {
                    return (
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Left Input File: ${join_object.file1}`}
                            showLabel
                            values={join_object.file1_allCols}
                            target="join"
                            path={`join_operations_inventory[${index}].file1_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Right Input File: ${join_object.file2}`}
                            showLabel
                            values={join_object.file2_allCols}
                            target="join"
                            path={`join_operations_inventory[${index}].file2_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              )}

              {join_operations_future.length > 0 && (
                <Stack spacing={1}>
                  <Divider sx={{ paddingTop: "16px" }}>
                    <Typography sx={titleStyle}>
                      Join Operation (Future Data)
                    </Typography>
                  </Divider>

                  {join_operations_future.map((join_object, index) => {
                    return (
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Left Input File: ${join_object.file1}`}
                            showLabel
                            values={join_object.file1_allCols}
                            target="join"
                            path={`join_operations_future[${index}].file1_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Right Input File: ${join_object.file2}`}
                            showLabel
                            values={join_object.file2_allCols}
                            target="join"
                            path={`join_operations_future[${index}].file2_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              )}

              {join_operations_bom.length > 0 && (
                <Stack spacing={1}>
                  <Divider sx={{ paddingTop: "16px" }}>
                    <Typography sx={titleStyle}>
                      Join Operation (BOM Data)
                    </Typography>
                  </Divider>

                  {join_operations_bom.map((join_object, index) => {
                    return (
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Left Input File: ${join_object.file1}`}
                            showLabel
                            values={join_object.file1_allCols}
                            target="join"
                            path={`join_operations_bom[${index}].file1_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Right Input File: ${join_object.file2}`}
                            showLabel
                            values={join_object.file2_allCols}
                            target="join"
                            path={`join_operations_bom[${index}].file2_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              )}
              {join_operations_forecast.length > 0 && (
                <Stack spacing={1}>
                  <Divider sx={{ paddingTop: "16px" }}>
                    <Typography sx={titleStyle}>
                      Join Operation (Forecast Data)
                    </Typography>
                  </Divider>

                  {join_operations_forecast.map((join_object, index) => {
                    return (
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Left Input File: ${join_object.file1}`}
                            showLabel
                            values={join_object.file1_allCols}
                            target="join"
                            path={`join_operations_forecast[${index}].file1_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Right Input File: ${join_object.file2}`}
                            showLabel
                            values={join_object.file2_allCols}
                            target="join"
                            path={`join_operations_forecast[${index}].file2_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              )}

              {join_operations_new_product.length > 0 && (
                <Stack spacing={1}>
                  <Divider sx={{ paddingTop: "16px" }}>
                    <Typography sx={titleStyle}>
                      Join Operation (New Products Data)
                    </Typography>
                  </Divider>

                  {join_operations_new_product.map((join_object, index) => {
                    return (
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Left Input File: ${join_object.file1}`}
                            showLabel
                            values={join_object.file1_allCols}
                            target="join"
                            path={`join_operations_new_product[${index}].file1_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Right Input File: ${join_object.file2}`}
                            showLabel
                            values={join_object.file2_allCols}
                            target="join"
                            path={`join_operations_new_product[${index}].file2_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              )}

              {join_operations_simple_disaggregation_mapping.length > 0 && (
                <Stack spacing={1}>
                  <Divider sx={{ paddingTop: "16px" }}>
                    <Typography sx={titleStyle}>
                      Join Operation (Simple Disaggregation Data)
                    </Typography>
                  </Divider>

                  {join_operations_simple_disaggregation_mapping.map(
                    (join_object, index) => {
                      return (
                        <Grid container spacing={2}>
                          <Grid item md={6} xs={12}>
                            <CustomAutocomplete
                              label={`Left Input File: ${join_object.file1}`}
                              showLabel
                              values={join_object.file1_allCols}
                              target="join"
                              path={`join_operations_simple_disaggregation_mapping[${index}].file1_col`}
                              isMultiSelect
                              formatLabel={false}
                              placeholder={"Select primary key/keys"}
                            />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <CustomAutocomplete
                              label={`Right Input File: ${join_object.file2}`}
                              showLabel
                              values={join_object.file2_allCols}
                              target="join"
                              path={`join_operations_simple_disaggregation_mapping[${index}].file2_col`}
                              isMultiSelect
                              formatLabel={false}
                              placeholder={"Select primary key/keys"}
                            />
                          </Grid>
                        </Grid>
                      );
                    }
                  )}
                </Stack>
              )}

              {join_operations_transition_item.length > 0 && (
                <Stack spacing={1}>
                  <Divider sx={{ paddingTop: "16px" }}>
                    <Typography sx={titleStyle}>
                      Join Operation (Transition Item Data)
                    </Typography>
                  </Divider>

                  {join_operations_transition_item.map((join_object, index) => {
                    return (
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Left Input File: ${join_object.file1}`}
                            showLabel
                            values={join_object.file1_allCols}
                            target="join"
                            path={`join_operations_transition_item[${index}].file1_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <CustomAutocomplete
                            label={`Right Input File: ${join_object.file2}`}
                            showLabel
                            values={join_object.file2_allCols}
                            target="join"
                            path={`join_operations_transition_item[${index}].file2_col`}
                            isMultiSelect
                            formatLabel={false}
                            placeholder={"Select primary key/keys"}
                          />
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              )}

              {moduleName === "inventory-optimization" && (
                <>
                  {" "}
                  <Stack spacing={1}>
                    <Divider sx={{ paddingTop: "16px" }}>
                      <Typography sx={titleStyle}>
                        Sales - Inventory Mapping
                      </Typography>
                    </Divider>

                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <CustomAutocomplete
                          label={`Sales Dataset: ${input_data}`}
                          showLabel
                          values={sales_columns}
                          target="config"
                          path={`scenario_plan.inventory_constraints.sales_joining_keys`}
                          isMultiSelect
                          formatLabel={false}
                          placeholder={"Select primary key/keys"}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <CustomAutocomplete
                          label={`Inventory Dataset: ${inventory_input_data}`}
                          showLabel
                          values={inventory_input_data_cols}
                          target="config"
                          path={`scenario_plan.inventory_constraints.inventory_joining_keys`}
                          isMultiSelect
                          formatLabel={false}
                          placeholder={"Select primary key/keys"}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                  {join_operations_supply_item_master.length > 0 && (
                    <Stack spacing={1}>
                      <Divider sx={{ paddingTop: "16px" }}>
                        <Typography sx={titleStyle}>
                          Join Operation (Supply Item Master)
                        </Typography>
                      </Divider>
                      {join_operations_supply_item_master.map(
                        (join_object, index) => {
                          return (
                            <Grid container spacing={2}>
                              <Grid item md={6} xs={12}>
                                <CustomAutocomplete
                                  label={`Left Input File: ${join_object.file1}`}
                                  showLabel
                                  values={sales_columns}
                                  target="join"
                                  path={`join_operations_supply_item_master[${index}].file1_col`}
                                  isMultiSelect
                                  formatLabel={false}
                                  placeholder={"Select primary key/keys"}
                                />
                              </Grid>
                              <Grid item md={6} xs={12}>
                                <CustomAutocomplete
                                  label={`Right Input File: ${join_object.file2}`}
                                  showLabel
                                  values={join_object.file2_allCols}
                                  target="join"
                                  path={`join_operations_supply_item_master[${index}].file2_col`}
                                  isMultiSelect
                                  formatLabel={false}
                                  placeholder={"Select primary key/keys"}
                                />
                              </Grid>
                            </Grid>
                          );
                        }
                      )}
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton
            title={"Add Joins"}
            onClick={async () => {
              await addJoins();
              handleClose();
            }}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
