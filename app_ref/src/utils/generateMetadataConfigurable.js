import { getFieldTags } from "./getFieldTagsConfigurable";
import { parse } from "date-fns";

const removeDuplicates = (array) => {
  const uniqueArray = [...new Set(array)];
  return uniqueArray;
};

const dateFormats = [
  "dd/MM/yy",
  "yy/MM/dd",
  "dd-MM-yy",
  "yy-MM-dd",
  "MM/dd/yy",
  "MM-dd-yy",
  "dd/MM/yyyy",
  "yyyy/MM/dd",
  "dd-MM-yyyy",
  "yyyy-MM-dd",
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "yyyy-MM-dd HH:mm:ss.SSSxxx",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ss'Z'",
];

const isValidDate = (dateString) => {
  return dateFormats.some((format) => {
    try {
      const parsedDate = parse(dateString, format, new Date());
      // Check that parsedDate is a valid Date object
      return parsedDate instanceof Date && !isNaN(parsedDate);
    } catch (error) {
      return false; // If parse throws, consider it invalid
    }
  });
};

const determineColumnType = (data) => {
  const numericPattern = /^-?\d*\.?\d+$/;

  if (data.every((item) => numericPattern.test(item))) {
    return "numeric";
  } else if (data.every((item) => isValidDate(item))) {
    return "timestamp";
  } else {
    return "categorical";
  }
};

const typecastNumericValues = (data, columnType) => {
  if (columnType === "numeric") {
    return data.map((item) => Number(item));
  }
  return data;
};

export const generateMetadata = (
  previewData,
  tags,
  fileName,
  source_name = "File Upload",
  source_label = "",
  dataset_info = {}
) => {
  const columns = Object.keys(previewData);
  const sampleVal = {};
  const colTypes = {
    ts_cols: [],
    num_cols: [],
    cat_cols: [],
    text_cols: [],
  };

  columns.forEach((col) => {
    const columnType = determineColumnType(previewData[col]);
    const castedData = typecastNumericValues(previewData[col], columnType);

    sampleVal[col] = castedData[0]; // Taking the first value as a sample

    if (columnType === "timestamp") {
      colTypes.ts_cols.push(col);
    } else if (columnType === "numeric") {
      colTypes.num_cols.push(col);
    } else if (columnType === "categorical") {
      colTypes.cat_cols.push(col);
    } else {
      colTypes.text_cols.push(col);
    }
  });

  const dataAttributes = {
    cols: columns,
    col_types: colTypes,
    sample_val: sampleVal,
  };

  const fieldTags = getFieldTags({ tags, existingFieldTags: {} ,dataset_info});

  const metadata = {
    filename: fileName,
    data_tag: tags[0],
    data_params: {
      timestamp_columns: colTypes.ts_cols,
      numeric: colTypes.num_cols,
      categorical_columns: colTypes.cat_cols,
    },
    data_steps: [
      {
        kwargs: {
          grouping_columns: [],
          aggregations: {},
          fillNA: {},
          in_aggregation: {},
        },
        operation: "aggregate_data",
      },
    ],
    source_name: source_name,
    source_label: source_label,
    created_date: new Date().toISOString(),
    last_modified_date: new Date().toISOString(),
    data_attributes: dataAttributes,
    field_tags: fieldTags,
  };

  return metadata;
};

// Example usage
