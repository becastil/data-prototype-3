'use client';

import { useState } from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridRowModel,
  GridToolbar
} from '@mui/x-data-grid';
import { 
  Box, 
  IconButton, 
  Tooltip,
  Alert,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { FeeStructure } from '@/types/healthcare';
import { feesGridStyles } from '@/lib/dataGridStyles';

interface FeesGridProps {
  data: FeeStructure[];
  onDataChange: (data: FeeStructure[]) => void;
}

export function FeesGrid({ data, onDataChange }: FeesGridProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 12 });

  const calculateTotal = (
    feeType: string, 
    amount: number, 
    enrollment?: number
  ): number => {
    switch (feeType) {
      case 'pmpm':
      case 'pepm':
        return enrollment ? amount * enrollment : 0;
      case 'flat':
        return amount;
      case 'tiered':
        // Simplified tiered calculation - in real implementation, this would be more complex
        if (!enrollment) return 0;
        if (enrollment <= 1000) return amount * enrollment;
        if (enrollment <= 1500) return amount * 0.95 * enrollment;
        return amount * 0.9 * enrollment;
      case 'annual':
        return amount / 12;
      case 'manual':
        return amount;
      default:
        return 0;
    }
  };

  const validateRow = (row: FeeStructure): string[] => {
    const errors: string[] = [];
    
    if (!row.month) errors.push('Month is required');
    if (!row.feeType) errors.push('Fee type is required');
    if (row.amount <= 0) errors.push('Amount must be greater than 0');
    if ((row.feeType === 'pmpm' || row.feeType === 'pepm') && !row.enrollment) {
      errors.push('Enrollment is required for PMPM/PEPM fee types');
    }
    if (!row.effectiveDate) errors.push('Effective date is required');
    
    return errors;
  };

  const handleProcessRowUpdate = (newRow: GridRowModel): FeeStructure => {
    const errors = validateRow(newRow as FeeStructure);
    if (errors.length > 0) {
      setValidationErrors(errors);
      throw new Error('Validation failed');
    }
    
    setValidationErrors([]);
    
    const calculatedTotal = calculateTotal(
      newRow.feeType,
      newRow.amount,
      newRow.enrollment
    );
    
    const updatedRow: FeeStructure = {
      ...newRow,
      calculatedTotal
    } as FeeStructure;
    
    const updatedData = data.map(row => 
      row.id === updatedRow.id ? updatedRow : row
    );
    
    onDataChange(updatedData);
    return updatedRow;
  };

  const handleAddRow = () => {
    const newId = `new-${Date.now()}`;
    const currentDate = new Date();
    const monthString = currentDate.toISOString().substring(0, 7);
    
    const newRow: FeeStructure = {
      id: newId,
      month: monthString,
      feeType: 'pmpm',
      amount: 450,
      enrollment: 1200,
      calculatedTotal: 540000,
      effectiveDate: currentDate.toISOString().substring(0, 10),
      description: 'New fee entry'
    };
    
    onDataChange([...data, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    const updatedData = data.filter(row => row.id !== id);
    onDataChange(updatedData);
  };

  const columns: GridColDef[] = [
    { 
      field: 'month', 
      headerName: 'Month', 
      width: 120,
      editable: true,
      type: 'string'
    },
    {
      field: 'feeType',
      headerName: 'Fee Type',
      width: 130,
      editable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: 'flat', label: 'Flat' },
        { value: 'pepm', label: 'PEPM' },
        { value: 'pmpm', label: 'PMPM' },
        { value: 'tiered', label: 'Tiered' },
        { value: 'annual', label: 'Annual' },
        { value: 'manual', label: 'Manual' }
      ],
      renderCell: (params) => (
        <Chip 
          label={params.value?.toUpperCase()} 
          size="small" 
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount ($)',
      width: 120,
      editable: true,
      type: 'number',
      valueFormatter: (value: number | undefined) => (value ? `$${value.toLocaleString()}` : '$0')
    },
    {
      field: 'enrollment',
      headerName: 'Enrollment',
      width: 120,
      editable: true,
      type: 'number',
      valueFormatter: (value: number | undefined) => (value ? value.toLocaleString() : '')
    },
    {
      field: 'calculatedTotal',
      headerName: 'Calculated Total ($)',
      width: 180,
      editable: false,
      valueFormatter: (value: number | undefined) => `$${value?.toLocaleString() || '0'}`,
      cellClassName: 'calculated-total',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <strong>${params.value?.toLocaleString() || '0'}</strong>
          <Tooltip title="Auto-calculated based on fee type and enrollment">
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
      )
    },
    {
      field: 'effectiveDate',
      headerName: 'Effective Date',
      width: 140,
      editable: true,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
      valueSetter: (value) => value ? value.toISOString().substring(0, 10) : ''
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      editable: true,
      type: 'string'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleDeleteRow(params.row.id)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Validation Errors:</strong>
          <ul style={{ margin: '8px 0 0 20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <IconButton
          onClick={handleAddRow}
          color="primary"
          sx={{ 
            border: '1px dashed',
            borderColor: 'primary.main',
            borderRadius: 1
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[12, 24]}
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={() => {
            // Error already handled in handleProcessRowUpdate
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 }
            }
          }}
          sx={feesGridStyles}
        />
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <strong>Tips:</strong>
        <ul style={{ margin: '8px 0 0 20px' }}>
          <li>Double-click any cell to edit it</li>
          <li>Calculated totals update automatically when you change amount or enrollment</li>
          <li>Use the toolbar to filter and search through entries</li>
          <li>Click the + button to add new fee entries</li>
        </ul>
      </Alert>
    </Box>
  );
}
