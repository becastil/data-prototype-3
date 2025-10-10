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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { FeeStructureV2 } from '@/types/fees';

interface AdminFeesManagerProps {
  fees: FeeStructureV2[];
  onAdd: (fee: FeeStructureV2) => void;
  onUpdate: (fee: FeeStructureV2) => void;
  onDelete: (feeId: string) => void;
  sampleEnrollment?: { eeCount: number; memberCount: number };
}

const FEE_CATEGORIES = [
  { value: 'administrative', label: 'Administrative Fee' },
  { value: 'performance', label: 'Performance Fee' },
  { value: 'addon', label: 'Add-on Service' },
  { value: 'credit', label: 'Credit/Offset' },
  { value: 'adjustment', label: 'One-time Adjustment' }
] as const;

const RATE_BASIS_OPTIONS = [
  { value: 'pepm', label: 'PEPM (Per Employee Per Month)', description: 'Amount × Employee Count' },
  { value: 'pmpm', label: 'PMPM (Per Member Per Month)', description: 'Amount × Member Count' },
  { value: 'flat', label: 'Flat Monthly Amount', description: 'Fixed amount each month' }
] as const;

export function AdminFeesManager({
  fees,
  onAdd,
  onUpdate,
  onDelete,
  sampleEnrollment
}: AdminFeesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructureV2 | null>(null);
  const [formData, setFormData] = useState<Partial<FeeStructureV2>>({
    name: '',
    category: 'administrative',
    rateBasis: 'pepm',
    baseAmount: 0,
    description: '',
    tieringEnabled: false,
    status: 'active'
  });

  const handleOpenDialog = (fee?: FeeStructureV2) => {
    if (fee) {
      setEditingFee(fee);
      setFormData(fee);
    } else {
      setEditingFee(null);
      setFormData({
        name: '',
        category: 'administrative',
        rateBasis: 'pepm',
        baseAmount: 0,
        description: '',
        tieringEnabled: false,
        status: 'active'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFee(null);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const fee: FeeStructureV2 = {
      id: editingFee?.id || `fee-${Date.now()}`,
      name: formData.name || 'New Fee',
      description: formData.description,
      category: formData.category || 'administrative',
      effectiveStartDate: formData.effectiveStartDate || new Date().toISOString().split('T')[0],
      effectiveEndDate: formData.effectiveEndDate,
      rateBasis: formData.rateBasis || 'pepm',
      baseAmount: formData.baseAmount || 0,
      tieringEnabled: formData.tieringEnabled || false,
      createdAt: editingFee?.createdAt || now,
      updatedAt: now,
      version: (editingFee?.version || 0) + 1,
      status: formData.status || 'active'
    };

    if (editingFee) {
      onUpdate(fee);
    } else {
      onAdd(fee);
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

  const calculatePreview = (rateBasis: string, baseAmount: number) => {
    if (!sampleEnrollment) return null;

    switch (rateBasis) {
      case 'pepm':
        return baseAmount * sampleEnrollment.eeCount;
      case 'pmpm':
        return baseAmount * sampleEnrollment.memberCount;
      case 'flat':
        return baseAmount;
      default:
        return null;
    }
  };

  const getRateBasisLabel = (rateBasis: string) => {
    return RATE_BASIS_OPTIONS.find(opt => opt.value === rateBasis)?.label || rateBasis.toUpperCase();
  };

  const adminFees = fees.filter(fee =>
    !fee.name.toLowerCase().includes('stop loss') &&
    !fee.name.toLowerCase().includes('consulting')
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Administrative Fee Line Items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure PEPM, PMPM, or Flat administrative fees that auto-calculate based on enrollment
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Admin Fee
        </Button>
      </Box>

      {sampleEnrollment && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Current Enrollment: <strong>{sampleEnrollment.eeCount} Employees</strong>, <strong>{sampleEnrollment.memberCount} Members</strong>
        </Alert>
      )}

      {adminFees.length === 0 ? (
        <Alert severity="info">
          No administrative fees configured. Click "Add Admin Fee" to create PEPM, PMPM, or Flat fee line items.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fee Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Rate Basis</TableCell>
                <TableCell align="right">Base Amount</TableCell>
                {sampleEnrollment && <TableCell align="right">Monthly Total*</TableCell>}
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminFees.map((fee) => {
                const preview = sampleEnrollment ? calculatePreview(fee.rateBasis, fee.baseAmount || 0) : null;
                return (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {fee.name}
                      </Typography>
                      {fee.description && (
                        <Typography variant="caption" color="text.secondary">
                          {fee.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={fee.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={fee.rateBasis.toUpperCase()} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatCurrency(fee.baseAmount || 0)}
                    </TableCell>
                    {sampleEnrollment && (
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {preview !== null ? formatCurrency(preview) : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={fee.status}
                        size="small"
                        color={fee.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(fee)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(fee.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {sampleEnrollment && adminFees.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          * Monthly Total calculated based on current enrollment data
        </Typography>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFee ? 'Edit Admin Fee' : 'Add New Admin Fee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Fee Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              helperText="e.g., 'TPA Claims/COBRA Administration Fee (PEPM)'"
              required
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || 'administrative'}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                {FEE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Rate Basis</InputLabel>
              <Select
                value={formData.rateBasis || 'pepm'}
                label="Rate Basis"
                onChange={(e) => setFormData({ ...formData, rateBasis: e.target.value as any })}
              >
                {RATE_BASIS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box>
                      <Typography variant="body2">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Base Amount"
              type="number"
              value={formData.baseAmount || 0}
              onChange={(e) => setFormData({ ...formData, baseAmount: parseFloat(e.target.value) || 0 })}
              helperText={
                formData.rateBasis === 'flat'
                  ? 'Fixed monthly amount'
                  : formData.rateBasis === 'pepm'
                  ? 'Amount per employee per month'
                  : 'Amount per member per month'
              }
              InputProps={{
                startAdornment: <span style={{ marginRight: 8 }}>$</span>
              }}
              required
            />

            {sampleEnrollment && formData.baseAmount && (
              <Alert severity="success" icon={<InfoIcon />}>
                <Typography variant="body2">
                  <strong>Preview Calculation:</strong>
                </Typography>
                <Typography variant="body2">
                  {formData.rateBasis === 'pepm' && (
                    <>
                      ${formData.baseAmount.toFixed(2)} × {sampleEnrollment.eeCount} employees ={' '}
                      <strong>{formatCurrency(formData.baseAmount * sampleEnrollment.eeCount)}/month</strong>
                    </>
                  )}
                  {formData.rateBasis === 'pmpm' && (
                    <>
                      ${formData.baseAmount.toFixed(2)} × {sampleEnrollment.memberCount} members ={' '}
                      <strong>{formatCurrency(formData.baseAmount * sampleEnrollment.memberCount)}/month</strong>
                    </>
                  )}
                  {formData.rateBasis === 'flat' && (
                    <>
                      Fixed amount: <strong>{formatCurrency(formData.baseAmount)}/month</strong>
                    </>
                  )}
                </Typography>
              </Alert>
            )}

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText="Add notes about this fee"
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || 'active'}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
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
            disabled={!formData.name || !formData.baseAmount}
          >
            {editingFee ? 'Update' : 'Add'} Fee
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
