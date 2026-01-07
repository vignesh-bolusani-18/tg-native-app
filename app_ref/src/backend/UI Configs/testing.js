const { processJsonWithContext } = require("../../utils/Context Utils Configurable/processJsonWithContext.js");

// Import the allTags configuration
const allTags = {
  "driver_columns": {
    "label": "Driver Columns",
    "isMultiSelect": true,
    "inputType": "AutoComplete",
    "path": "field_tags.driver_columns",
    "showLabel": true,
    "xs": 12,
    "md": 6,
    "default_aggregate_option": "mean",
    "aggregate_disabled": false,
    "default_fillNa_option": "None",
    "fillNa_disabled": false,
    "in_aggregation": true
  },
  "timestamp_column": {
    "label": "Date",
    "isMultiSelect": false,
    "inputType": "AutoComplete",
    "path": "field_tags.timestamp_column",
    "showLabel": true,
    "xs": 12,
    "md": 6
  },
  "id_columns": {
    "label": "Customer ID",
    "isMultiSelect": true,
    "inputType": "AutoComplete",
    "path": "field_tags.id_columns",
    "showLabel": true,
    "xs": 12,
    "md": 6
  },
  "ts_id_columns": {
    "label": "Granularity",
    "isMultiSelect": true,
    "inputType": "AutoComplete",
    "path": "field_tags.ts_id_columns",
    "showLabel": true,
    "xs": 12,
    "md": 6
  },
  "target_column": {
    "label": "Target",
    "isMultiSelect": false,
    "inputType": "AutoComplete",
    "path": "field_tags.target_column",
    "showLabel": true,
    "xs": 12,
    "md": 6,
    "default_aggregate_option": "sum",
    "aggregate_disabled": false,
    "default_fillNa_option": "0",
    "fillNa_disabled": false,
    "in_aggregation": true
  },
  "dimensions": {
    "label": "Other Interesting Dimensions",
    "isMultiSelect": true,
    "inputType": "AutoComplete",
    "path": "field_tags.dimensions",
    "showLabel": true,
    "xs": 12,
    "md": 6,
    "default_aggregate_option": "max",
    "aggregate_disabled": false,
    "default_fillNa_option": "None",
    "fillNa_disabled": false,
    "in_aggregation": false
  },
  "date_format": {
    "label": "Date Format",
    "isMultiSelect": false,
    "inputType": "AutoComplete",
    "path": "field_tags.date_format",
    "showLabel": true,
    "xs": 12,
    "md": 6
  }
};

// The dataset info with string references and Script expressions
const nextBestOfferDatasetInfo = {
  "customer_transaction": {
    "tag": "customer_transaction",
    "title": "Add Customer Transaction Dataset",
    "description": "Contains data on customer transactions and purchase behavior.",
    "dataStepConfig": {
      "grouping_columns": [
        "allTags.timestamp_column",
        "Script(return {...allTags.id_columns, label: 'Modified Customer ID'};)",
        "allTags.ts_id_columns"
      ],
      "aggregations": [
        "allTags.target_column",
        "allTags.driver_columns",
        "allTags.dimensions"
      ],
      "fillNa": [
        "allTags.target_column",
        "allTags.driver_columns",
        "allTags.dimensions"
      ]
    },
    "tagFieldConfig": {
      "mandatory_tags": [
        "allTags.date_format",
        "allTags.timestamp_column",
        "allTags.target_column",
        "Script(return {...allTags.id_columns, label: 'Modified Customer ID'};)"
      ],
      "optional_tags": [
        "allTags.driver_columns",
        "allTags.dimensions",
        "allTags.ts_id_columns"
      ]
    }
  },
  "others": {
    "tag": "others",
    "title": "Add Other Dataset",
    "description": "Additional dataset for other marketing-related information.",
    "dataStepConfig": {
      "grouping_columns": [
        "allTags.timestamp_column",
        "Script(return {...allTags.id_columns, label: 'Modified Customer ID'};)"
      ],
      "aggregations": [
        "allTags.driver_columns",
        "allTags.dimensions"
      ],
      "fillNa": [
        "allTags.driver_columns",
        "allTags.dimensions"
      ]
    },
    "tagFieldConfig": {
      "mandatory_tags": [
        "Script(return {...allTags.id_columns, label: 'Modified Customer ID'};)"
      ],
      "optional_tags": [
        "allTags.date_format",
        "allTags.timestamp_column",
        "allTags.driver_columns",
        "allTags.dimensions"
      ]
    }
  }
};

// Create context with allTags
const context = {
  allTags
};

// Process the dataset info with context
const processedDatasetInfo = processJsonWithContext(nextBestOfferDatasetInfo, context);

// Log the results
console.log("Original Dataset Info:", JSON.stringify(nextBestOfferDatasetInfo, null, 2));
console.log("\nProcessed Dataset Info:", JSON.stringify(processedDatasetInfo, null, 2));

// Export for use in other files if needed
module.exports = { processedDatasetInfo };
