import { cleanUpConfigObjects } from "./cleanUpConfigObjects";

export const cleanUpEditsConfig = (
  editsConfig,
  experimentID,
  parentExperimentID
) => {
  const { editedFiles, newRows, editHistories } = editsConfig;
  const cleanEditsConfig = {
    editedFiles: cleanUpConfigObjects(
      editedFiles,
      experimentID,
      parentExperimentID
    ),
    newRows: cleanUpConfigObjects(newRows, experimentID, parentExperimentID),
    editHistories: cleanUpConfigObjects(
      editHistories,
      experimentID,
      parentExperimentID
    ),
  };
  return cleanEditsConfig;
};
