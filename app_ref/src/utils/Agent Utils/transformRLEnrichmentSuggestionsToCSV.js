export const transformRLEnrichmentSuggestionsToCSV = (
  rlAgentEnrichmentSuggestions
) => {
  const transformedSuggestions = rlAgentEnrichmentSuggestions.map(
    (suggestion) => transformSuggestion(suggestion)
  );

  console.log(transformedSuggestions)
  // Convert array of objects to CSV string with keys as column names
  if (transformedSuggestions.length === 0) {
    return "";
  }
  return arrayToCSV(transformedSuggestions);
};

// Helper function to convert array of objects to CSV string
const arrayToCSV = (data) => {
  if (!data || data.length === 0) return "";
  const columnNames = Object.keys(data[0]);
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";
    const str = value.toString();
    // Escape double quotes by doubling them, and wrap in quotes if any special char
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvRows = [
    columnNames.join(","),
    ...data.map((row) =>
      columnNames.map((col) => escapeCSV(row[col])).join(",")
    ),
  ];
  return csvRows.join("\n");
};

const transformSuggestion = (suggestion) => {
  return {
    Dimension: suggestion.Dimension,
    Value: suggestion.Value,
    Risk: suggestion.Risk,
    "Start Date": suggestion["Start Date"],
    "End Date": suggestion["End Date"],
    "Current Accuracy": suggestion["Current Accuracy"],
    "Error_Contribution": suggestion["Error_Contribution"],
    Reviewed: suggestion.Reviewed,
    "Reviewed By": suggestion["Reviewed By"],
    "Approved Enrichment Rank": suggestion["Approved Enrichment"]?.Rank || "",
    "Approved Enrichment Type": suggestion["Approved Enrichment"]?.Type || "",
    "Approved Enrichment Reward":
      suggestion["Approved Enrichment"]?.Reward || "",
    "Approved Enrichment Deviation":
      suggestion["Approved Enrichment"]?.Deviation || "",
    "Comment": suggestion.Comment,
  };
};
