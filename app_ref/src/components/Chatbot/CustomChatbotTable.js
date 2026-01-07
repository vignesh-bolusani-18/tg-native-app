import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControlLabel,
  Checkbox,
  Switch,
  TableCell,
} from "@mui/material";
import MUIDataTable, { TableFilterList } from "mui-datatables";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
// import { makeStyles } from "@mui/material";
// import CustomPagination from "./CustomPagination";
// import { ReactComponent as Refresh } from "../../src/assets/Icons/refresh.svg";
// import { ReactComponent as FilterIcon } from "../assets/Icons/Filters lines.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import UndoRoundedIcon from "@mui/icons-material/UndoRounded";

// import {
//   Download as DownloadIcon,
//   Search as SearchIcon,
//   // FilterList as FilterIcon,
//   ViewColumn as ColumnsIcon,
//   KeyboardDoubleArrowDown,
//   BorderColor,
// } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { format, parseISO } from "date-fns";
import ErrorWrapper from "../ErrorWrapper";
import useDashboard from "../../hooks/useDashboard";
import useAuth from "../../hooks/useAuth";
// import { fetchCSVFromS3, loadBatchData } from "../utils/s3Utils";
// import { downloadFileUsingPreSignedURL } from "../redux/actions/dashboardActions";

// import CustomFilterDialog from "./CustomFilterDialog";

// import SaveReportDialog from "./SaveReportDialog";

// import CustomReportWrapper from "./CustomReportWrapper";
// import SaveIcon from "@mui/icons-material/Save";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomScrollbar from "../CustomScrollbar";
import { SUCCESS, WARNING } from "../../theme/custmizations/colors";
import { styled } from "@mui/material";
// import useConfig from "../hooks/useConfig";
// import { setExperimentBasePath } from "./../redux/actions/dashboardActions";
// import ContactSalesDialog from "./ContactSalesDialog";
// import CustomButton from "./CustomButton";
const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 32,
  height: 16,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "500ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: SUCCESS[700],
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: SUCCESS[700],
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: SUCCESS[700],
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 12,
    height: 12,
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));
function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

function isFloat(str) {
  const num = Number(str);
  return !isNaN(num) && !Number.isInteger(num);
}

const formatKey = (key) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (dateRegex.test(key)) {
    return format(parseISO(key), "MMM dd, yyyy");
  }
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

const CustomChip = ({ label, onDelete }) => {
  return (
    <Chip
      variant="outlined"
      label={label}
      onDelete={onDelete}
      sx={{
        fontFamily: "Inter",
        fontWeight: "400",
        "& .MuiChip-deleteIcon": {
          color: "#101828",
        },
      }}
    />
  );
};

const CustomFilterList = (props) => {
  return <TableFilterList {...props} ItemComponent={CustomChip} />;
};

const CustomChatbotTable = ({
  data,
  isAlreadyTransformed,

  //   isFilterable,
  //   isEditable,
  //   isEditableColumn = (value) => {
  //     return false;
  //   },
  //   getTimeStamp,
  //   oc_path = null,
}) => {
  const theme = useTheme();

  // State to manage table data
  //   const {
  //     editedFiles,
  //     editHistories,
  //     setEditHistories,
  //     setEditedFile,
  //     configState,
  //   } = useConfig();
  //   const setOCCache = async () => {
  //     if (oc_path) {
  //       const path = `${experimentBasePath}/${oc_path}`;
  //       try {
  //         const oc_data = await fetchCSVFromS3(
  //           path,
  //           "",
  //           true,
  //           userInfo.userID,
  //           true
  //         );
  //         return true;
  //       } catch (error) {
  //         return false;
  //       }
  //     }
  //   };
  //   useEffect(() => {
  //     setOCCache();
  //   }, []);

  const transformData = (data) => {
    console.log("TransformedData Input", data);
    const keys = Object.keys(data);
    const length = data[keys[0]].length;
    // const ts_id_cols = configState.data.ts_id_columns;

    const transformedData = [];

    // Iterate over each row
    for (let i = 0; i < length; i++) {
      //   const ts_id_array = ts_id_cols.map(
      //     (ts_id_col) => data[ts_id_col]?.[i] ?? null
      //   );
      //   const ts_id = ts_id_array.join("_");
      const newObj = {};

      // Iterate over each column (key)
      keys.forEach((key) => {
        let value = data[key][i];

        // const editedCell = editedCells.find(
        //   (cell) => cell.ts_id === ts_id && cell.columnName === key
        // );

        // if (editedCell) {
        //   // If this cell was edited, update it with the new value
        //   if (editState) {
        //     value = editedCell.finalValue;
        //   } else {
        //     value = editedCell.initialValue;
        //   }
        // }

        // Check if the current cell is edited

        // Apply transformations based on the cell value
        if (value === "") {
          newObj[key] = "None";
        } else if (value === " ") {
          newObj[key] = "";
        } else if (value === null) {
          // Skip this key-value pair if the value is null
          return;
        } else if (!isNaN(value)) {
          if (isFloat(value)) {
            newObj[key] = parseFloat(value).toFixed(2);
          } else {
            newObj[key] = value;
          }
        } else {
          newObj[key] = value;
        }
      });

      // If the object has any values, add it to the transformed data
      if (Object.keys(newObj).length > 0) {
        transformedData.push(newObj);
      }
    }

    console.log("Transformed Data", transformedData);
    return transformedData;
  };

  const { experimentBasePath } = useDashboard();

  const customTheme = useMemo(
    () =>
      createTheme({
        ...theme,
        components: {
          MuiDialog: {
            styleOverrides: {
              root: {
                width: "100%",
                maxWidth: "unset", // Remove the default max width
                flex: 1, // This will make it occupy the full width
              },
            },
          },
          MUIDataTable: {
            styleOverrides: {
              root: {
                backgroundColor: "#fff",
                border: "none",
                boxShadow: "none",
                padding: "8px",
                paddingTop: "0px",
              },
            },
          },
          MUIDataTableSelectCell: {
            styleOverrides: {
              headerCell: {
                backgroundColor: "#FFF",
              },
              root: {
                backgroundColor: "#FFFFFF",
              },
            },
          },
          MUIDataTableHeadCell: {
            styleOverrides: {
              root: {
                backgroundColor: "#fff",
                textTransform: "none",
                whiteSpace: "nowrap", // Prevents wrapping
                overflow: "hidden", // Hides overflowed content
                textOverflow: "ellipsis", // Shows ellipsis for overflowed content
                color: "#626F86",
                fontFamily: "Inter",
                fontSize: "14px",
                // fontWeight: 900,
                lineHeight: "14px",
                // textAlign: "center",
                // borderBottom: "1px solid #E0E0E0", // Add bottom border for grid
                padding: "2px 8px", // Reduce padding for denser appearance
                // "&.editable-header": {
                //   backgroundColor: SUCCESS[100], // Light blue background for editable headers
                //   color: SUCCESS[700], // Optional: Change text color
                //   // borderColor:SUCCESS[700]
                // },
              },
            },
          },
          MUIDataTableBodyCell: {
            styleOverrides: {
              root: {
                padding: "0px 2px", // Reduce padding for density
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#101828",
                lineHeight: "14px",
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&:nth-of-type(odd)": {
                  backgroundColor: "aliceblue",
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "#ffffff",
                },
                "&:hover": {
                  transition: "all 0.3s ease-in-out",
                  borderBottom: "1px solid #D6BBFB",
                  cursor: "pointer",
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                border: "1px solid #E0E0E0", // Add borders to simulate grid lines
                padding: "0px 4px", // Reduce padding for cleaner appearance
              },
            },
          },
        },
      }),
    [theme]
  );

  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const {
    userInfo,
    currentCompany,
    // isContactSalesDialogOpen,
    // setIsContactSalesDialogOpen,
  } = useAuth();

  const transformedData = useMemo(() => {
    return isAlreadyTransformed ? tableData : transformData(tableData);
  }, [tableData, isAlreadyTransformed]);

  const EditableCell = ({
    value,
    // prevValue, // Accept previous value as a prop
    // rowIndex,
    // colIndex,
    // columnKey,
    // isNumeric,
    // currentPage,
    // batchNo,
    // ts_id,
    // onCommit,
  }) => {
    const [currentValue, setCurrentValue] = useState(value);

    return (
      <Typography
        sx={{
          padding: "0px 4px",
          fontFamily: "Inter",
          fontSize: "14px",
          color: "#101828",
          textAlign: "left",
          textTransform: "none",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: theme.transitions.create("width"),
        }}
      >
        {currentValue}
      </Typography>
    );
  };

  const columns = useMemo(() => {
    if (transformedData.length === 0) return [];

    const numRowsToCheck = 3;

    return Object.keys(transformedData[0]).map((key, colIndex) => {
      const isNumeric = !transformedData
        .slice(0, numRowsToCheck)
        .some((row) => {
          const value = row[key];
          return value !== null && value !== "" && isNaN(value);
        });
      //   const isEditableCol = isEditableColumn(key) && editState;
      return {
        name: key,
        label: formatKey(key),
        options: {
          draggable: true,
          filter: true,

          setCellProps: () => ({
            style: {
              minWidth: "150px",
              maxWidth: "300px",
              textAlign: isNumeric ? "right" : "left",
              color: "#626F86",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          }),
          customBodyRender: (value, tableMeta) => {
            return <EditableCell value={value || ""} />;
          },
        },
      };
    });
  }, [transformedData]);

  const options = useMemo(
    () => ({
      selectableRows: "none",
      selectableRowsOnClick: false,
      resizableColumns: true,
      rowHover: false,
      draggable: true,
      filter: false,
      print: false,
      download: false,
      viewColumns: false, // Disable default CSV download button
      search: false,
      sort: false,
      pagenation: false,
      customToolbar: () => {
        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
          ></Stack>
        );
      },

      customFooter: (
        count,
        page,
        rowsPerPage,
        changeRowsPerPage,
        changePage
      ) => (
        <Box
          sx={{ padding: "10px", justifyContent: "flex-end", display: "flex" }}
        ></Box>
      ),
    }),
    []
  );

  return (
    <ErrorWrapper>
      <ThemeProvider theme={customTheme}>
        <ToastContainer />
        <CustomScrollbar>
          <MUIDataTable
            data={transformedData}
            columns={columns}
            options={options}
          />
        </CustomScrollbar>
      </ThemeProvider>
    </ErrorWrapper>
  );
};

export default CustomChatbotTable;
