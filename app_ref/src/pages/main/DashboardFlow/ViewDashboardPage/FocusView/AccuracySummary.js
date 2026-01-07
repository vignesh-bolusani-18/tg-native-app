import { ArrowDownwardOutlined } from "@mui/icons-material";
import {
  Button,
  CssBaseline,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MultiLayerPieChart from "../../../../../components/MultiLayerPieChart";

const btnText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
};
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
  color: "#475467",
  borderBottom: "1px solid #EAECF0",
};

const data = [
  {
    accuracy: "Accuracy > 70%",
    size: "200 KB",
    combinationsDate: "Jan 4, 2022",
    salesDate: "Jan 4, 2022",
  },
  {
    accuracy: "Accuracy 40%-70%",
    size: "720 KB",
    combinationsDate: "Jan 4, 2022",
    salesDate: "Jan 4, 2022",
  },
  {
    accuracy: "Accuracy <40%",
    size: "16 MB",
    combinationsDate: "Jan 2, 2022",
    salesDate: "Jan 2, 2022",
  },
];

const values = [65, 78, 85];
const colors = ["#B692F6", "#0C66E4", "#53389E"];

const AccuracyComponent = () => {
  return (
    <Stack
      
        sx={{
          flexDirection: { xs: 'column', md: 'row' },
          p:"0px 32px 0px 32px",
          alignItems:{xs:'center',md:'"flex-start"'},
                    justifyContent: 'space-between',
          gap:'16px'
        }}
       
     
    >
      <Stack
        alignItems={"center"}
        justifyContent={"space-between"}
        gap={"2px"}
        height={"306px"}
        sx={{
          display: "flex",
          flex: "3",
        }}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            component="div"
            sx={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: "28px",
              textAlign: "left",
            }}
          >
            Accuracy
          </Typography>
          <IconButton aria-label="settings" sx={{ color: "#98A2B3" }}>
            <MoreVertIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ width: "100%", color: "#EAECF0" }} />

        <CssBaseline />
        <MultiLayerPieChart values={values} colors={colors} />
      </Stack>
      <TableContainer sx={{ flex: "7" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead
            sx={{
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #EAECF0",
            }}
          >
            <TableRow>
              <TableCell sx={headingStyle}>File name</TableCell>
              <TableCell sx={headingStyle}>#Combinations</TableCell>
              <TableCell sx={headingStyle}>% Combinations</TableCell>
              <TableCell sx={headingStyle}>% Sales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow sx={{ height: "72px" }} key={row.accuracy}>
                <TableCell
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "20px",
                    textAlign: "left",
                    color: "#101828",
                    borderBottom: "1px solid #EAECF0",
                  }}
                  component="th"
                  scope="row"
                >
                  {row.accuracy}
                </TableCell>
                <TableCell sx={{ bodyStyle }}>{row.size}</TableCell>
                <TableCell sx={{ bodyStyle }}>{row.combinationsDate}</TableCell>
                <TableCell sx={{ bodyStyle }}>{row.salesDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

const AccuracySummary = () => {
  return (
    <Stack
      sx={{
        gap: "16px",
        padding: "12px 24px 12px 24px",
      }}
    >
      <Stack
      sx={{
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap:'16px'
      }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            textAlign: "left",
            color: "#101828",
          }}
        >
          Overall Forecast Accuracy for 808 combinations SKU_ID-DC is 80.1%
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            size="medium"
            sx={{
              border: "1px solid #D0D5DD",
              borderRadius: "8px",
              padding: "10px 16px",
              maxHeight: "40px",
            }}
          >
            <Stack direction="row" spacing={1}>
              <Typography sx={btnText}>Copy</Typography>
            </Stack>
          </Button>

          <Button
            variant="contained"
            sx={{
              border: "1px solid #0C66E4",
              borderRadius: "8px",
              backgroundColor: "#0C66E4",
              padding: "10px 16px",
              maxHeight: "40px",
            }}
          >
            <Stack spacing={1} direction="row" alignItems={"center"}>
              <ArrowDownwardOutlined />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "center",
                  color: "#FFFFFF",
                  textTransform: "none",
                }}
              >
                Download
              </Typography>
            </Stack>
          </Button>
        </Stack>
      </Stack>
      <Stack>
        <AccuracyComponent />
      </Stack>
    </Stack>
  );
};

export default AccuracySummary;
