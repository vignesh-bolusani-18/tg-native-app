export const next_best_offer_dataset_info = {
  customer_transaction: {
    tag: "customer_transaction",
    title: "Add Customer Transaction Dataset",
    description:
      "Contains data on customer transactions and purchase behavior.",
    dataStepConfig: {
      grouping_columns: [
        "allTags.timestamp_column",
        "allTags.id_columns",
        "allTags.ts_id_columns",
      ],
      aggregations: [
        "allTags.target_column",
        "allTags.driver_columns",
        "allTags.dimensions",
      ],
      fillNa: [
        "allTags.target_column",
        "allTags.driver_columns",
        "allTags.dimensions",
      ],
    },
    tagFieldConfig: {
      mandatory_tags: [
        "allTags.date_format",
        "allTags.timestamp_column",
        "allTags.target_column",
        "allTags.id_columns",
      ],
      optional_tags: [
        "allTags.driver_columns",
        "allTags.dimensions",
        "allTags.ts_id_columns",
      ],
    },
  },
  others: {
    tag: "others",
    title: "Add Other Dataset",
    description: "Additional dataset for other marketing-related information.",
    dataStepConfig: {
      grouping_columns: ["allTags.timestamp_column", "allTags.id_columns"],
      aggregations: ["allTags.driver_columns", "allTags.dimensions"],
      fillNa: ["allTags.driver_columns", "allTags.dimensions"],
    },
    tagFieldConfig: {
      mandatory_tags: ["allTags.id_columns"],
      optional_tags: [
        "allTags.date_format",
        "allTags.timestamp_column",
        "allTags.driver_columns",
        "allTags.dimensions",
      ],
    },
  },
};
