'use client';

import { 
  DataGrid, 
  GridColDef, 
  GridToolbar,
  GridPaginationModel
} from '@mui/x-data-grid';
import { 
  Box, 
  Chip,
  Typography,
  Tooltip,
  ChipProps
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat 
} from '@mui/icons-material';
import { MonthlySummary } from '@/types/healthcare';
import { summaryTableStyles } from '@/lib/dataGridStyles';
import { useState } from 'react';

interface SummaryTableProps {
  data: MonthlySummary[];
}

export function SummaryTable({ data }: SummaryTableProps) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 12,
  });

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getLossRatioStatus = (value: number): 'good' | 'warning' | 'critical' => {
    if (value <= 0.85) return 'good';
    if (value <= 1.0) return 'warning';
    return 'critical';
  };

  const getLossRatioColor = (status: ReturnType<typeof getLossRatioStatus>): ChipProps['color'] => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getVarianceTrend = (variance: number) => {
    if (Math.abs(variance) < 2) return <TrendingFlat fontSize="small" />;
    return variance > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
  };

  const columns: GridColDef[] = [
    { 
      field: 'month', 
      headerName: 'Period', 
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'claims',
      headerName: 'Claims',
      width: 130,
      type: 'number',
      valueFormatter: (value: number | undefined) => formatCurrency(value ?? 0),
      cellClassName: 'currency-cell'
    },
    {
      field: 'fees',
      headerName: 'Fees',
      width: 120,
      type: 'number',
      valueFormatter: (value: number | undefined) => formatCurrency(value ?? 0),
      cellClassName: 'currency-cell'
    },
    {
      field: 'premiums',
      headerName: 'Premiums',
      width: 140,
      type: 'number',
      valueFormatter: (value: number | undefined) => formatCurrency(value ?? 0),
      cellClassName: 'currency-cell'
    },
    {
      field: 'totalCost',
      headerName: 'Total Cost',
      width: 140,
      type: 'number',
      valueFormatter: (value: number | undefined) => formatCurrency(value ?? 0),
      cellClassName: 'total-cost-cell',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'monthlyLossRatio',
      headerName: 'Loss Ratio',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const status = getLossRatioStatus(params.value);
        return (
          <Chip
            label={formatPercentage(params.value)}
            color={getLossRatioColor(status)}
            size="small"
            variant="filled"
          />
        );
      }
    },
    {
      field: 'rolling12LossRatio',
      headerName: 'Rolling 12M LR',
      width: 140,
      type: 'number',
      renderCell: (params) => {
        const status = getLossRatioStatus(params.value);
        return (
          <Tooltip title="Rolling 12-month Loss Ratio">
            <Chip
              label={formatPercentage(params.value)}
              color={getLossRatioColor(status)}
              size="small"
              variant="outlined"
            />
          </Tooltip>
        );
      }
    },
    {
      field: 'variance',
      headerName: 'Variance',
      width: 130,
      type: 'number',
      renderCell: (params) => {
        const isPositive = params.value > 0;
        const isFlat = Math.abs(params.value) < 2;
        
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: isFlat ? 'text.secondary' : isPositive ? 'error.main' : 'success.main'
          }}>
            {getVarianceTrend(params.value)}
            <Typography variant="body2" fontWeight="medium">
              {params.value > 0 ? '+' : ''}{params.value.toFixed(1)}%
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'memberMonths',
      headerName: 'Member Months',
      width: 130,
      type: 'number',
      valueFormatter: (value: number | undefined) => (value ?? 0).toLocaleString()
    },
    {
      field: 'pmpm',
      headerName: 'PMPM',
      width: 100,
      type: 'number',
      valueFormatter: (value: number | undefined) => `$${(value ?? 0).toFixed(2)}`,
      renderCell: (params) => (
        <Tooltip title="Per Member Per Month">
          <Typography variant="body2" fontWeight="medium">
            ${params.value?.toFixed(2) || '0.00'}
          </Typography>
        </Tooltip>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[12, 24, 50]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
              csvOptions: {
                fileName: 'loss-ratio-summary',
                delimiter: ',',
                utf8WithBom: true
              }
            }
          }}
          sx={summaryTableStyles}
          disableRowSelectionOnClick
          density="standard"
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="textSecondary">
            Performance Legend:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip label="Good ≤85%" color="success" size="small" />
            <Chip label="Warning 85-100%" color="warning" size="small" />
            <Chip label="Critical >100%" color="error" size="small" />
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" color="textSecondary">
            Calculations:
          </Typography>
          <Typography variant="caption" display="block">
            Loss Ratio = (Claims + Fees) ÷ Premiums
          </Typography>
          <Typography variant="caption" display="block">
            PMPM = Total Cost ÷ Member Months
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
