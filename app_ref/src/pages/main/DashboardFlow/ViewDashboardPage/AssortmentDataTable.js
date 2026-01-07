import * as React from "react";
import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

function createData(
  CellNumber,
  product_id,
  cat2,
  H_Facing,
  Product_Max_facing,
  NinetyDayAvgSales,
  Margin,
  Profit,
  ProfitPerUnit
) {
  return {
    CellNumber,
    product_id,
    cat2,
    H_Facing,
    Product_Max_facing,
    NinetyDayAvgSales,
    Margin,
    Profit,
    ProfitPerUnit,
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
      <TableCell>{row.CellNumber}</TableCell>
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
        {row.product_id}
      </TableCell>
      <TableCell sx={bodyStyle}>{row.cat2}</TableCell>
      <TableCell sx={bodyStyle}>{row.H_Facing}</TableCell>
      <TableCell sx={bodyStyle}>{row.Product_Max_facing}</TableCell>
      <TableCell sx={bodyStyle}>{row.NinetyDayAvgSales}</TableCell>
      <TableCell sx={bodyStyle}>{row.Margin}</TableCell>
      <TableCell sx={bodyStyle}>{row.Profit}</TableCell>
      <TableCell sx={bodyStyle}>{row.ProfitPerUnit}</TableCell>
    </TableRow>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    cat2: PropTypes.number.isRequired,
    Product_Max_facing: PropTypes.number.isRequired,
    H_Facing: PropTypes.number.isRequired,
    product_id: PropTypes.string.isRequired,
    CellNumber: PropTypes.string.isRequired,
    NinetyDayAvgSales: PropTypes.number.isRequired,
    Margin: PropTypes.number.isRequired,
    Profit: PropTypes.number.isRequired,
    ProfitPerUnit: PropTypes.number.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const rows = [
  createData(
    "200KB",
    "FrozenYog123",
    "1234567890123",
    "FacilityA",
    159,
    6.0,
    40.6,
    1200,
    20
  ),
  createData(
    "200KB",
    "IceCream456",
    "2345678901234",
    "FacilityB",
    237,
    9.0,
    40.6,
    1200,
    20
  ),
  createData(
    "200KB",
    "Eclair789",
    "3456789012345",
    "FacilityC",
    262,
    16.0,
    40.6,
    1200,
    20
  ),
  createData(
    "200KB",
    "Cupcake012",
    "4567890123456",
    "FacilityD",
    305,
    3.7,
    40.6,
    1200,
    20
  ),
  createData(
    "200KB",
    "Gingerbread345",
    "5678901234567",
    "FacilityE",
    356,
    16.0,
    40.6,
    1200,
    20
  ),
  createData(
    "200KB",
    "Something234",
    "5678901234543",
    "FacilityF",
    356,
    16.0,
    40.6,
    1200,
    20
  ),
];

export default function AssortmentDataTable() {
  return (
    <TableContainer
    // component={Paper}
    >
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={headingStyle}>Cell Number</TableCell>
            <TableCell sx={headingStyle}>Product_id</TableCell>
            <TableCell align="right" sx={headingStyle}>
              cat2
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              H_Facing
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              Product Max facing
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              90 days avg sales
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              Margin
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              Profit
            </TableCell>
            <TableCell align="right" sx={headingStyle}>
              Profit_per _unit
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <Row key={row.product_id} row={row} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
