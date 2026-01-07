import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { format, parseISO } from "date-fns";

// The transformData function is unchanged
const transformData = (data) => {
  console.log("hello");
  const keys = Object.keys(data);
  const length = data[keys[0]].length;
  const transformedData = [];
  for (let i = 0; i < length; i++) {
    const newObj = {};
    keys.forEach((key) => {
      if (data[key][i] === "") {
        newObj[key] = null;
      } else if (
        !isNaN(data[key][i]) &&
        Number.isInteger(parseFloat(data[key][i]))
      ) {
        newObj[key] = parseInt(data[key][i], 10);
      } else if (!isNaN(data[key][i])) {
        newObj[key] = parseFloat(data[key][i]).toFixed(2);
      } else {
        newObj[key] = data[key][i];
      }
    });
    if (Object.keys(newObj).length > 0) {
      transformedData.push(newObj);
    }
  }
  console.log(
    `[${new Date().toLocaleTimeString()}] : Transformation completed for forecastpivot data`
  );
  return transformedData;
};
const formatKey = (key) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (dateRegex.test(key)) {
    return format(parseISO(key), "MMM dd, yyyy");
  }
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};
const ForecastingPivot = ({ data }) => {
  // Transform the data before passing it to the table
  const transformedData = useMemo(() => transformData(data), [data]);

  // Dynamically generate columns based on the keys of the first transformed data object
  const columns = useMemo(() => {
    if (transformedData.length === 0) return [];

    const firstRow = transformedData[0];
    return Object.keys(firstRow).map((key) => ({
      accessorKey: key, // Accessor key directly from the data key
      header:formatKey(key),// Capitalize the header
      size: 150,
    }));
  }, [transformedData]);

  const table = useMaterialReactTable({
    columns,
    data: transformedData,
    enableRowSelection: false,
   muiTableBodyProps:{
    sx: (theme) => ({
        '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td':
          {
            backgroundColor:'#F9FAFB',
          },
       
        '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td':
          {
            backgroundColor: "#ffffff",
          },
         
        
      }),
   
   },
      muiTableBodyRowProps: {
        sx: {
          
          '&:hover': {
           boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1) !important',
          transform: 'translateY(-2px) !important',
          transition: 'all 0.3s ease-in-out !important',
        //   backgroundColor: 'red !important',
          borderTop: '1px solid #D6BBFB !important',
          borderBottom: '1px solid #D6BBFB !important',
          },
        },
      },
      muiTableHeadCellProps: ({ column }) => ({
        //conditionally style pinned columns
        sx: {
color: "#101828",
          fontFamily: "Inter",
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: "24px",
          textAlign:'center', 
        padding:'0px'       },
      }),
      
      muiTableBodyCellProps: ({ column }) => ({
        //conditionally style pinned columns
        sx: {
          fontWeight: column.getIsPinned() ? 'bold' : 'normal',
          color: "#626F86",
          fontFamily: "Inter",
          fontSize: "14px",
          fontWeight: 400,
          
          lineHeight: "24px",
        },
      }),
      }
  );

  return <MaterialReactTable table={table} />;
};

export default ForecastingPivot;
