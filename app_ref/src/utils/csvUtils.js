export const transformCsv = async (object) => {
  const parsedData = object;

  const headers = parsedData.data[0];

  const CsvObject = {};
  headers.forEach((header) => {
    CsvObject[header] = [];
  });
  console.log( "csvobj",CsvObject);

  for (let i = 1; i < parsedData.data.length; i++) {
    const row = parsedData.data[i];
    headers.forEach((header, index) => {
      CsvObject[header].push(row[index]);
    });
  }

  return CsvObject;
};
