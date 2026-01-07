import { getFieldTags } from "./getFieldTagsConfigurable";

export const loadFieldTags = (loadedDataset, currentDatasetTag,dataset_info) => {
  const existingFieldTags = loadedDataset.field_tags;
  console.log("Existing",existingFieldTags)
  const newLoadedDataset = { ...loadedDataset };
  const tags = [currentDatasetTag];
  const newFieldTags = getFieldTags({ tags, existingFieldTags,dataset_info });
  console.log("New Field Tags", newFieldTags);
  newLoadedDataset.field_tags = newFieldTags;
  console.log("New Loaded Dataset", newLoadedDataset);
  return newLoadedDataset;
};
