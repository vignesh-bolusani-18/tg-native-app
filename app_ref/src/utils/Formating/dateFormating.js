const formatsDict = {
  "DD/MM/YY": "%d/%m/%y",
  "YY/MM/DD": "%y/%m/%d",
  "DD-MM-YY": "%d-%m-%y",
  "YY-MM-DD": "%y-%m-%d",
  "MM/DD/YY": "%m/%d/%y",
  "MM-DD-YY": "%m-%d-%y",

  "DD/MM/YYYY": "%d/%m/%Y",
  "YYYY/MM/DD": "%Y/%m/%d",
  "DD-MM-YYYY": "%d-%m-%Y",
  "YYYY-MM-DD": "%Y-%m-%d",
  "MM/DD/YYYY": "%m/%d/%Y",
  "MM-DD-YYYY": "%m-%d-%Y",

  "YYYY-MM-DD HH:MM:SS.f+00:00": "%Y-%m-%d %H:%M:%S.%f%z",
  "YYYY-MM-DD HH:MM:SS": "%Y-%m-%d %H:%M:%S",
  "YYYY-MM-DDTHH:MM:SSZ": "%Y-%m-%dZ%H:%M:%ST",
};
const reverseFormatsDict = Object.fromEntries(
  Object.entries(formatsDict).map(([key, value]) => [value, key])
);

export const formatDate = (format) => {
  if (Array.isArray(format)) {
    return format.map((f) => formatsDict[f] || null);
  }
  return formatsDict[format] || null;
};
export const reverseFormatDate = (format) => {
  if (Array.isArray(format)) {
    return format.map((f) => reverseFormatsDict[f] || null);
  }
  return reverseFormatsDict[format] || null;
};

export const dateFormats = Object.keys(formatsDict);
