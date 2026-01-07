import { cleanUpConfigObjects } from "./cleanUpConfigObjects";

export const syncConfigWithEdits = (
  config,
  editsConfig,
  experimentID,
  parentExperimentID
) => {
  const editedFiles = cleanUpConfigObjects(
    editsConfig.editedFiles,
    experimentID,
    parentExperimentID
  );
  const newRows = cleanUpConfigObjects(
    editsConfig.newRows,
    experimentID,
    parentExperimentID
  );
  const deletedRows = cleanUpConfigObjects(
    {},
    experimentID,
    parentExperimentID
  );
  const editHistories = cleanUpConfigObjects(
    editsConfig.editHistories,
    experimentID,
    parentExperimentID
  );

  const stackingEditedFiles = {};
  for (const [key, editedCells] of Object.entries(editsConfig.editedFiles)) {
    const newEditedCells = editedCells.map((editedCell) => {
      return {
        ts_id: editedCell.ts_id,
        timestamp: editedCell.timestamp,
        initialValue: editedCell.initialValue,
        finalValue: editedCell.finalValue,
        rowDimensionValue: editedCell?.rowDimensionValue ?? null,
        rowDimension: editedCell?.rowDimension ?? null,
      };
    });
    stackingEditedFiles[key] = newEditedCells;
  }

  const syncedConfig = {
    ...config,
    stacking: {
      ...config.stacking,
      editedFiles: editedFiles,
      newRows: newRows,
      deletedRows: null,
    },
    editHistories: editHistories,
    editedFiles: null,
    deletedRows: null,
    newRows: null,
  };

  //sync the editsConfig with the config
  return syncedConfig;
};
