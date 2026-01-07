export const cleanUpConfigObjects = (
  configObject,
  experimentID,
  parentExperimentID = null
) => {
  // Create a new object to store filtered key-value pairs
  const cleanedObject = {};

  // Iterate through all keys in configObject
  Object.keys(configObject).forEach((key) => {
    // Only keep keys that contain the experimentID string
    if (key.includes(experimentID) || (parentExperimentID && key.includes(parentExperimentID))) {
      cleanedObject[key] = configObject[key];
    }
  });

  return cleanedObject;
};
