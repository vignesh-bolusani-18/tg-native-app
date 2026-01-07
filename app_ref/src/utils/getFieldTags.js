import { getTagFieldConfig } from "./experimentUtils";
const removeDuplicates = (array) => {
  const uniqueArray = [...new Set(array)];
  // console.log("group column tags",uniqueTags);
  return uniqueArray;
};
export const getFieldTags = ({ tags, existingFieldTags }) => {
  const allNeededTagsFields = tags.map((tag) => getTagFieldConfig(tag));
  let allTagsList = [];
  allNeededTagsFields.map((tags) => {
    console.log(tags);
    const { mandatory_tags, optional_tags } = tags;
    mandatory_tags.forEach((tag) => {
      allTagsList.push(tag);
    });
    optional_tags.forEach((tag) => {
      allTagsList.push(tag);
    });
  });
  allTagsList = removeDuplicates(allTagsList);

  const updatedFieldTags = { ...existingFieldTags };

  allTagsList.forEach((item) => {
    const key = item.path.split(".").pop(); // Extract the key from the path
    if (!updatedFieldTags.hasOwnProperty(key)) {
      updatedFieldTags[key] = item.isMultiSelect ? [] : null; // Set value based on isMultiSelect
    }
  });

  console.log("Updated Field Tags", updatedFieldTags);

  return updatedFieldTags;
};
