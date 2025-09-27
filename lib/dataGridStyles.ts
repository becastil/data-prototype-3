import { SxProps, Theme } from '@mui/material/styles';

/**
 * Shared DataGrid styles for healthcare dashboard components
 * Provides consistent styling across SummaryTable and FeesGrid components
 */

// Base DataGrid styling for all tables
export const baseDataGridStyles: SxProps<Theme> = {
  // Remove focus outline on cells
  '& .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
  
  // Row hover effects
  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#f5f5f5',
  },
  
  // Column header styling
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    color: '#1976d2',
  },
  
  // Footer container styling
  '& .MuiDataGrid-footerContainer': {
    borderTop: '2px solid #dee2e6',
    backgroundColor: '#f8f9fa',
  },
  
  // Overall border styling
  border: 'none',
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid #e0e0e0',
  },
};

// Currency cell styling for financial data
export const currencyCellStyles: SxProps<Theme> = {
  '& .currency-cell': {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};

// Total cost cell with highlighted background
export const totalCostCellStyles: SxProps<Theme> = {
  '& .total-cost-cell': {
    backgroundColor: '#f0f8ff',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
};

// Calculated total cells (for auto-calculated values)
export const calculatedTotalStyles: SxProps<Theme> = {
  '& .calculated-total': {
    backgroundColor: '#f0f8ff',
    fontWeight: 'bold',
  },
};

// Loss ratio color coding styles
export const lossRatioStyles: SxProps<Theme> = {
  '& .loss-ratio-good': {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  '& .loss-ratio-warning': {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  },
  '& .loss-ratio-critical': {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
};

// Variance color coding styles
export const varianceStyles: SxProps<Theme> = {
  '& .variance-positive': {
    color: '#c62828',
    fontWeight: 500,
  },
  '& .variance-negative': {
    color: '#2e7d32',
    fontWeight: 500,
  },
  '& .variance-neutral': {
    color: 'text.secondary',
  },
};

// Combined styles for SummaryTable
export const summaryTableStyles: SxProps<Theme> = {
  ...baseDataGridStyles,
  ...currencyCellStyles,
  ...totalCostCellStyles,
  ...lossRatioStyles,
  ...varianceStyles,
};

// Combined styles for FeesGrid
export const feesGridStyles: SxProps<Theme> = {
  ...baseDataGridStyles,
  ...calculatedTotalStyles,
};

// Utility function to merge custom styles with base styles
// Use array spreading to properly handle SxProps type union
export const mergeDataGridStyles = (
  baseStyles: SxProps<Theme>,
  customStyles: SxProps<Theme> = {}
): SxProps<Theme> => {
  return [
    ...(Array.isArray(baseStyles) ? baseStyles : [baseStyles]),
    ...(Array.isArray(customStyles) ? customStyles : [customStyles]),
  ];
};

// Export individual style objects for granular control
export {
  baseDataGridStyles as default,
};