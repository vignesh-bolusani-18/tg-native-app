import { getTagFieldConfig } from "../experimentUtils";

export function cleanLoadedDataset(loadedDataset) {
  // Destructure the input loadedDataset to get data_steps and other properties
  const { data_steps, field_tags, ...rest } = loadedDataset;

  console.log(loadedDataset);

  // Clean each data_step in the data_steps array
  const cleanedDataSteps = data_steps.map((dataStep) => {
    const { operation, kwargs } = dataStep;
    const { grouping_columns, aggregations, fillNA, in_aggregation } = kwargs;

    // Create a new fillNA object excluding keys with value "auto"
    const cleanedFillNA = Object.keys(fillNA).reduce((acc, key) => {
      if (fillNA[key] !== "None" && fillNA[key] !== null) {
        acc[key] = fillNA[key];
      }
      return acc;
    }, {});

    // Return the cleaned data_step
    return {
      operation,
      kwargs: {
        grouping_columns,
        aggregations,
        fillNA: cleanedFillNA,
        in_aggregation,
      },
    };
  });

  let cleanedFieldTags = { ...field_tags };
  if ("supply_item_master" in cleanedFieldTags) {
    if (cleanedFieldTags.supply_item_master === "true") {
      cleanedFieldTags.supply_item_master = true;
    } else if (
      cleanedFieldTags.supply_item_master === "false" ||
      cleanedFieldTags.supply_item_master === null
    ) {
      cleanedFieldTags.supply_item_master = false;
    }
    // else leave as is if it has some other unexpected value
  }

  // Return the new cleanedLoadedDataset
  return {
    ...rest,
    field_tags: cleanedFieldTags,
    data_steps: cleanedDataSteps,
  };
}
const removeDuplicates = (array) => {
  const uniqueArray = [...new Set(array)];
  return uniqueArray;
};
export const removeUnnecessaryFieldTags = (loadedDataset, tag) => {
  const resultLoadedDataset = { ...loadedDataset };
  const allNeededTagsFields = [getTagFieldConfig(tag)];
  let allTagsList = [];

  // Collecting all necessary tags
  allNeededTagsFields.forEach((tags) => {
    const { mandatory_tags, optional_tags } = tags;
    allTagsList = allTagsList.concat(mandatory_tags, optional_tags);
  });

  // Remove duplicate tags
  allTagsList = removeDuplicates(allTagsList);

  // Extract the last key from each tag path
  const allKeys = allTagsList.map((tag) => tag.path.split(".").pop());

  // Filter out the unnecessary field tags
  let newFieldTags = {};
  for (let key in resultLoadedDataset.field_tags) {
    if (allKeys.includes(key)) {
      newFieldTags[key] = resultLoadedDataset.field_tags[key];
    }
  }

  // Assign the newFieldTags to the resultLoadedDataset
  resultLoadedDataset.field_tags = newFieldTags;
  // resultLoadedDataset.data_steps[0].kwargs.aggregations = {};
  // resultLoadedDataset.data_steps[0].kwargs.fillNA = {};

  console.log("New Tag Fields", newFieldTags);

  // Return the modified dataset
  console.log("Result After Removing", resultLoadedDataset);
  return resultLoadedDataset;
};
