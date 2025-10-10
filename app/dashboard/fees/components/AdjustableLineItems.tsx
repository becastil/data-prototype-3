'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { UserAdjustableLineItem } from '@/types/summary';

interface AdjustableLineItemsProps {
  adjustments: UserAdjustableLineItem[];
  onAdd: (adjustment: UserAdjustableLineItem) => void;
  onUpdate: (adjustment: UserAdjustableLineItem) => void;
  onDelete: (id: string) => void;
  availableMonths: string[];
}

const ADJUSTMENT_TYPES = [
  { value: 'uc-settlement', label: 'UC Claims Settlement Adjustment', description: 'Adjustments to urgent care claims settlements' },
  { value: 'rx-rebates', label: 'Rx Rebates', description: 'Pharmacy rebates received (typically negative)' },
  { value: 'stop-loss-reimbursement', label: 'Stop Loss Reimbursement', description: 'Stop loss reimbursements received (typically negative)' }
] as const;

export function AdjustableLineItems({
  adjustments,
  onAdd,
  onUpdate,
  onDelete,
  availableMonths
}: AdjustableLineItemsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserAdjustableLineItem | null>(null);
  const [formData, setFormData] = useState<Partial<UserAdjustableLineItem>>({
    type: 'uc-settlement',
    month: availableMonths[0] || '',
    amount: 0,
    description: '',
    enabled: true
  });

  const handleOpenDialog = (item?: UserAdjustableLineItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        type: 'uc-settlement',
        month: availableMonths[0] || '',
        amount: 0,
        description: '',
        enabled: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const adjustment: UserAdjustableLineItem = {
      id: editingItem?.id || `adj-${Date.now()}`,
      type: formData.type || 'uc-settlement',
      month: formData.month || '',
      amount: formData.amount || 0,
      description: formData.description,
      enabled: formData.enabled !== undefined ? formData.enabled : true,
      createdAt: editingItem?.createdAt || now,
      updatedAt: now
    };

    if (editingItem) {
      onUpdate(adjustment);
    } else {
      onAdd(adjustment);
    }

    handleCloseDialog();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getTypeLabel = (type: UserAdjustableLineItem['type']) => {
    return ADJUSTMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: UserAdjustableLineItem['type']) => {
    switch (type) {
      case 'uc-settlement':
        return 'info';
      case 'rx-rebates':
        return 'success';
      case 'stop-loss-reimbursement':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            User-Adjustable Line Items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add adjustments for UC Claims Settlement, Rx Rebates, and Stop Loss Reimbursements
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Adjustment
        </Button>
      </Box>

      {adjustments.length === 0 ? (
        <Alert severity="info">
          No adjustments configured. Click &quot;Add Adjustment&quot; to create monthly adjustments for claims settlements, rebates, or reimbursements.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Month</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(adjustment.type)}
                      color={getTypeColor(adjustment.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{adjustment.month}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(adjustment.amount)}
                  </TableCell>
                  <TableCell>{adjustment.description || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={adjustment.enabled ? 'Active' : 'Disabled'}
                      color={adjustment.enabled ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(adjustment)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(adjustment.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Adjustment' : 'Add New Adjustment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Adjustment Type</InputLabel>
              <Select
                value={formData.type || 'uc-settlement'}
                label="Adjustment Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as UserAdjustableLineItem['type'] })}
              >
                {ADJUSTMENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body2">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={formData.month || ''}
                label="Month"
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              >
                {availableMonths.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount || 0}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              helperText="Enter positive for additions, negative for deductions (rebates/reimbursements)"
              InputProps={{
                startAdornment: <span style={{ marginRight: 8 }}>$</span>
              }}
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText="Add notes about this adjustment"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled !== undefined ? formData.enabled : true}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label="Enable this adjustment"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.month || formData.amount === undefined}
          >
            {editingItem ? 'Update' : 'Add'} Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
