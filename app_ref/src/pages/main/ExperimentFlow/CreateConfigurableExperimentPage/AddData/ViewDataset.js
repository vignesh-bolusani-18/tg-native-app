import * as React from "react";
import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

function createData(name, calories, fat, carbs, protein) {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
  };
}

const headingStyle = {
  fontFamily: "Inter",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "18px",
  textAlign: "left",
  color: "#475467",
};

const bodyStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  textAlign: "left",
  color: "#101828",
  borderBottom: "1px solid #EAECF0",
};

function Row(props) {
  const { row, index } = props;

  return (
    <TableRow
      sx={{
        backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell
        component="th"
        scope="row"
        sx={{
          fontFamily: "Inter",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          textAlign: "left",
          color: "#101828",
          borderBottom: "1px solid #EAECF0",
        }}
      >
        {row.name}
      </TableCell>
      <TableCell sx={bodyStyle}>{row.calories}</TableCell>
      <TableCell sx={bodyStyle}>{row.fat}</TableCell>
      <TableCell sx={bodyStyle}>{row.carbs}</TableCell>
      <TableCell sx={bodyStyle}>{row.protein}</TableCell>
    </TableRow>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    protein: PropTypes.number.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const rows = [
  createData("FrozenYog123", "1234567890123", "FacilityA", 159, 6.0),
  createData("IceCream456", "2345678901234", "FacilityB", 237, 9.0),
  createData("Eclair789", "3456789012345", "FacilityC", 262, 16.0),
  createData("Cupcake012", "4567890123456", "FacilityD", 305, 3.7),
  createData("Gingerbread345", "5678901234567", "FacilityE", 356, 16.0),
  createData("Something234", "5678901234543", "FacilityF", 356, 16.0),
];

export default function ViewDataset() {
  return (
    <TableContainer
    // component={Paper}
    >
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={headingStyle}></TableCell>
            <TableCell sx={headingStyle}>ItemSkuCode</TableCell>
            <TableCell align="right" sx={headingStyle}>
              EAN
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              Facility
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              GoodInventory
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              ExcessStock
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <Row key={row.name} row={row} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
