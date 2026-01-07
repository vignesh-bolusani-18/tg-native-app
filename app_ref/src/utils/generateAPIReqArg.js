import { forEach } from "lodash";
import { getFieldTags } from "./getFieldTags";
import { parse } from "date-fns";

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
];

const isValidDate = (dateString) => {
  return dateFormats.some((format) => {
    const parsedDate = parse(dateString, format, new Date());
    return !isNaN(parsedDate);
  });
};

function convertTimestampToDate(timestamp) {
  // Create a Date object from the timestamp
  const date = new Date(timestamp);

  // Extract the year, month, and day from the Date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based, so we add 1
  const day = String(date.getDate()).padStart(2, "0");

  // Return the formatted date string in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
}

export const generateAPIReqArg = (
  previewData,
  type,
  fileName,
  accountName,
  tenant,
  facilityList,
  payload
) => {
  let columns;
  if (type === "Google_Sheets") {
    columns = Object.keys(previewData);
  }
  let date_args = {
    filter_col: null,
    start_dt: null,
    end_dt: null,
  };
  if (type === "Unicommerce") {
    payload.exportFilters.forEach((filter) => {
      if (filter.dateRange !== undefined) {
        date_args = {
          filter_col: filter.id,
          start_dt: convertTimestampToDate(filter.dateRange.start),
          end_dt: convertTimestampToDate(filter.dateRange.end),
        };
      }
    });
  }

  let api_req_arg;
  switch (type) {
    case "Google_Sheets":
      api_req_arg = {
        type: type,
        account: accountName,
        sheet_name: fileName,
        data_args: {
          columns: columns,
        },
      };
      break;
    case "Unicommerce":
      api_req_arg = {
        tenant,
        report_type: payload.exportJobTypeName,
        facility_list: facilityList,
        date_args,
        payload,
      };

      break;

    default:
      break;
  }

  return api_req_arg;
};

// Example usage
