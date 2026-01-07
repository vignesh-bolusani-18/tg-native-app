import React, { useState, useEffect } from "react";
import {
  Popover,
  Box,
  Typography,
  Stack,
  LinearProgress,
  Alert,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import { callQueryEngineQuery } from "../utils/queryEngine";

const ProductionPlanPopover = ({
  anchorEl,
  open,
  onClose,
  anchorReference,
  anchorPosition,
  tsIdData,
  filePath,
  fileName,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    if (open && tsIdData && filePath && fileName) {
      fetchApiData();
    } else {
      setApiData(null);
      setError(null);
    }
  }, [open, tsIdData, filePath, fileName]);

  const fetchApiData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        fileName,
        filePath,
        filterData: {
          dimensionFilters: tsIdData,
          columnFilter: ['Potential_Sales_Loss', 'TG Reorder now', 'stock_transfer_dict', 'reorder_transfer_dict'],
          frozenColumns: null,
          selectAllColumns: false,
        },
        sortingData: null,
        groupByColumns: [],
        aggregationColumns: {},
        filterConditions: [],
        paginationData: null,
        time: Date.now(),
      };

      const results = await callQueryEngineQuery(payload);
      if (results && Object.keys(results).length > 0) {
        setApiData(results);
      } else {
        setError("No data found");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const parseDictionary = (dictString) => {
    try {
      if (!dictString || dictString === '{}' || dictString === '[]') return {};
      const cleanString = dictString.replace(/^\[|\]$/g, '');
      return JSON.parse(cleanString.replace(/'/g, '"'));
    } catch (err) {
      return {};
    }
  };

  const formatNumber = (num) => {
    return num?.toLocaleString('en-US') || '0';
  };

  const calculateTotal = (dict) => {
    return Object.values(dict).reduce((sum, value) => sum + value, 0);
  };

  const renderData = () => {
    const potentialSalesLoss = parseInt(apiData.Potential_Sales_Loss?.[0]) || 0;
    const currentReorder = parseInt(apiData['TG Reorder now']?.[0]) || 0;
    const stockTransferDict = parseDictionary(apiData.stock_transfer_dict?.[0]);
    const reorderTransferDict = parseDictionary(apiData.reorder_transfer_dict?.[0]);

    const potentialSalesLossTotal = calculateTotal(stockTransferDict);
  const reorderNowTotal = calculateTotal(reorderTransferDict);
    
    // Combine dictionaries for matching keys
    const allKeys = new Set([
      ...Object.keys(stockTransferDict),
      ...Object.keys(reorderTransferDict)
    ]);
    
    const combinedDict = {};
    allKeys.forEach(key => {
      const stockValue = stockTransferDict[key] || 0;
      const reorderValue = reorderTransferDict[key] || 0;
      combinedDict[key] = stockValue + reorderValue;
    });

    const stockTransferTotal = calculateTotal(combinedDict);

    return (
      <Stack spacing={2}>
        {/* Stock Transfer Total */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={500}>
              Total Stock Transfer [ST]
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {formatNumber(stockTransferTotal)}
            </Typography>
          </Box>
          {/* <Typography variant="caption" color="text.secondary">
            Sum of stock transfer and reorder now dict
          </Typography> */}
        </Box>

        {/* Combined Breakdown */}
        {Object.keys(combinedDict).length > 0 && (
          <Box sx={{ pl: 1.5, borderLeft: '2px solid', borderColor: 'divider' }}>
            <Stack spacing={0.5}>
              {Object.entries(combinedDict).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">{key}</Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {formatNumber(value)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Potential Sales Loss */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={500}>
              ST to prevent Potential Sales Loss
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {formatNumber(potentialSalesLossTotal)}
            </Typography>
          </Box>
        </Box>

        {/* Stock Transfer Breakdown (only if different from combined) */}
        {Object.keys(stockTransferDict).length > 0 && (
          <Box>
            {/* <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Stock Transfer Dict
            </Typography> */}
            <Stack spacing={0.5}>
              {Object.entries(stockTransferDict).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', pl: 1 }}>
                  <Typography variant="caption">{key}</Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {formatNumber(value)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Current Reorder */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={500}>
              ST to reduce current reorder 
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {formatNumber(reorderNowTotal)}
            </Typography>
          </Box>
        </Box>

        {/* Reorder Transfer Breakdown (only if different from combined) */}
        {Object.keys(reorderTransferDict).length > 0 && (
          <Box>
            {/* <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Reorder Transfer Dict
            </Typography> */}
            <Stack spacing={0.5}>
              {Object.entries(reorderTransferDict).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', pl: 1 }}>
                  <Typography variant="caption">{key}</Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {formatNumber(value)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    );
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
       anchorOrigin={{
    vertical: 'top',         // Align with top of cell
    horizontal: 'right',     // Position to the right of cell
  }}
  transformOrigin={{
    vertical: 'top',         // Align popover top with anchor top
    horizontal: 'left',      // Align popover left with anchor right
  }}
      PaperProps={{
        sx: {
          width: 350,
          borderRadius: "8px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          border: "1px solid",
          borderColor: "grey.200",
          backgroundColor: "white",
        },
      }}
    >
      {/* Header */}
      {/* <Box sx={{ 
        p: 1.5, 
        borderBottom: '1px solid', 
        borderColor: 'divider', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Production Details
        </Typography>
        <Box>
          <IconButton 
            size="small" 
            onClick={fetchApiData} 
            disabled={loading}
            sx={{ mr: 0.5 }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box> */}

      {/* Content */}
      <Box sx={{ p: 2, backgroundColor: 'white' }}>
        {loading ? (
          <Box sx={{ py: 2 }}>
            <LinearProgress sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              fontSize: '0.75rem', 
              py: 0.5,
              backgroundColor: 'white'
            }}
          >
            {error}
          </Alert>
        ) : apiData ? (
          renderData()
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            No data available
          </Typography>
        )}
      </Box>
    </Popover>
  );
};

export default ProductionPlanPopover;