import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const styles = {
  tableContainer: {
    overflowX: "auto",
  },
};

const data = {
  months: [
    "2024-01-31",
    "2024-02-29",
    "2024-03-31",
    "2024-04-30",
    "2024-05-31",
    "2024-06-30",
    "2024-07-31",
    "2024-08-31",
    "2024-09-30",
    "2024-10-31",
    "2024-11-30",
    "2024-12-31",
  ],
  numbers: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "600",
    "-",
    "-",
    "-",
    "200",
  ],
};

const InventoryReorderPlanTable = ({ classes }) => {
  return (
    <TableContainer style={styles.tableContainer}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {data.months.map((month, index) => (
              <TableCell
                key={index}
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  textAlign: "left",
                  color: "#475467",
                }}
                align="center"
              >
                {month}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {data.numbers.map((number, index) => (
              <TableCell
                key={index}
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  textAlign: "left",
                  color: "#475467",
                }}
                align="left"
              >
                {number}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default InventoryReorderPlanTable;
