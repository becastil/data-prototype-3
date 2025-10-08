'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalculateIcon from '@mui/icons-material/Calculate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FeeStructureV2, RateBasis, FeeCategory, BlendedRateComponent } from '@/types/fees';
import TierBuilder from '@/components/fees/TierBuilder';

interface FeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (fee: Partial<FeeStructureV2>) => void;
  existingFee?: Partial<FeeStructureV2>;
  enrollmentData?: Array<{ month: string; enrollment: number }>;
}

const rateBasisOptions: { value: RateBasis; label: string; description: string }[] = [
  { value: 'pmpm', label: 'PMPM', description: 'Per Member Per Month - Amount × Enrollment' },
  { value: 'pepm', label: 'PEPM', description: 'Per Employee Per Month - Amount × Employees' },
  { value: 'flat', label: 'Flat Fee', description: 'Fixed amount regardless of enrollment' },
  { value: 'percent_premium', label: '% of Premium', description: 'Percentage of total premiums' },
  { value: 'percent_claims', label: '% of Claims', description: 'Percentage of total claims' },
  { value: 'per_transaction', label: 'Per Transaction', description: 'Amount × Transaction count' },
  { value: 'blended', label: 'Blended Rate', description: 'Combination of multiple components' },
  { value: 'composite', label: 'Composite Rate', description: 'Different rates for members vs dependents' },
  { value: 'manual', label: 'Manual Entry', description: 'Manually entered amount' }
];

const categoryOptions: { value: FeeCategory; label: string }[] = [
  { value: 'administrative', label: 'Administrative' },
  { value: 'performance', label: 'Performance-Based' },
  { value: 'addon', label: 'Add-On Service' },
  { value: 'credit', label: 'Credit/Offset' },
  { value: 'adjustment', label: 'One-Time Adjustment' }
];

export default function FeeModal({
  open,
  onClose,
  onSave,
  existingFee,
  enrollmentData = []
}: FeeModalProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<FeeStructureV2>>({
    id: existingFee?.id || `fee-${Date.now()}`,
    name: existingFee?.name || '',
    description: existingFee?.description || '',
    category: existingFee?.category || 'administrative',
    rateBasis: existingFee?.rateBasis || 'pmpm',
    baseAmount: existingFee?.baseAmount || 0,
    percentage: existingFee?.percentage || 0,
    tieringEnabled: existingFee?.tieringEnabled || false,
    tiers: existingFee?.tiers || [],
    effectiveStartDate: existingFee?.effectiveStartDate || new Date().toISOString().split('T')[0],
    effectiveEndDate: existingFee?.effectiveEndDate,
    blendedComponents: existingFee?.blendedComponents || [],
    compositeRate: existingFee?.compositeRate,
    status: existingFee?.status || 'active',
    version: existingFee?.version || 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewCalculation, setPreviewCalculation] = useState<number | null>(null);

  // Blended components state
  const [blendedComponents, setBlendedComponents] = useState<BlendedRateComponent[]>(
    existingFee?.blendedComponents || [{ type: 'fixed', value: 0, label: 'Base Fee' }]
  );

  // Update form data when existing fee changes
  useEffect(() => {
    if (existingFee) {
      setFormData({
        ...existingFee,
        id: existingFee.id || `fee-${Date.now()}`,
        status: existingFee.status || 'active',
        version: existingFee.version || 1
      });
      if (existingFee.blendedComponents) {
        setBlendedComponents(existingFee.blendedComponents);
      }
    }
  }, [existingFee]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Fee name is required';
    }

    if (!formData.rateBasis) {
      newErrors.rateBasis = 'Rate basis is required';
    }

    if (formData.rateBasis === 'pmpm' || formData.rateBasis === 'pepm') {
      if (!formData.baseAmount || formData.baseAmount <= 0) {
        newErrors.baseAmount = 'Rate must be greater than 0';
      }
    }

    if (formData.rateBasis === 'percent_premium' || formData.rateBasis === 'percent_claims') {
      if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
        newErrors.percentage = 'Percentage must be between 0 and 100';
      }
    }

    if (formData.rateBasis === 'flat' || formData.rateBasis === 'per_transaction') {
      if (!formData.baseAmount || formData.baseAmount <= 0) {
        newErrors.baseAmount = 'Amount must be greater than 0';
      }
    }

    if (formData.tieringEnabled && (!formData.tiers || formData.tiers.length === 0)) {
      newErrors.tiers = 'At least one tier is required when tiering is enabled';
    }

    if (!formData.effectiveStartDate) {
      newErrors.effectiveStartDate = 'Effective start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate preview
  const calculatePreview = () => {
    if (!enrollmentData || enrollmentData.length === 0) {
      setPreviewCalculation(null);
      return;
    }

    const sampleMonth = enrollmentData[0];
    const enrollment = sampleMonth.enrollment;

    let calculatedAmount = 0;

    switch (formData.rateBasis) {
      case 'pmpm':
      case 'pepm':
        if (formData.tieringEnabled && formData.tiers && formData.tiers.length > 0) {
          const applicableTier = formData.tiers.find(tier =>
            enrollment >= tier.minEnrollment &&
            (tier.maxEnrollment === null || enrollment <= tier.maxEnrollment)
          );
          calculatedAmount = applicableTier ? applicableTier.rate * enrollment : 0;
        } else {
          calculatedAmount = (formData.baseAmount || 0) * enrollment;
        }
        break;

      case 'flat':
        calculatedAmount = formData.baseAmount || 0;
        break;

      case 'percent_premium':
        // Assuming sample premium for preview
        calculatedAmount = 500000 * ((formData.percentage || 0) / 100);
        break;

      case 'percent_claims':
        // Assuming sample claims for preview
        calculatedAmount = 425000 * ((formData.percentage || 0) / 100);
        break;

      case 'per_transaction':
        // Assuming sample transaction count
        calculatedAmount = (formData.baseAmount || 0) * 1000;
        break;

      case 'blended':
        blendedComponents.forEach(component => {
          switch (component.type) {
            case 'fixed':
              calculatedAmount += component.value;
              break;
            case 'pmpm':
              calculatedAmount += component.value * enrollment;
              break;
            case 'percent_premium':
              calculatedAmount += 500000 * (component.value / 100);
              break;
            case 'percent_claims':
              calculatedAmount += 425000 * (component.value / 100);
              break;
          }
        });
        break;

      case 'composite':
        if (formData.compositeRate) {
          const memberCount = Math.floor(enrollment * 0.6); // Assume 60% members
          const dependentCount = enrollment - memberCount;
          calculatedAmount =
            (formData.compositeRate.memberRate * memberCount) +
            (formData.compositeRate.dependentRate * dependentCount);
        }
        break;

      case 'manual':
        calculatedAmount = formData.baseAmount || 0;
        break;
    }

    setPreviewCalculation(calculatedAmount);
  };

  // Recalculate preview when relevant fields change
  useEffect(() => {
    calculatePreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.rateBasis, formData.baseAmount, formData.percentage, formData.tieringEnabled, formData.tiers, blendedComponents, formData.compositeRate]);

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const feeToSave: Partial<FeeStructureV2> = {
      ...formData,
      blendedComponents: formData.rateBasis === 'blended' ? blendedComponents : undefined,
      createdAt: existingFee?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(feeToSave);
    onClose();
  };

  const handleFieldChange = (field: keyof FeeStructureV2, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addBlendedComponent = () => {
    setBlendedComponents(prev => [
      ...prev,
      { type: 'fixed', value: 0, label: `Component ${prev.length + 1}` }
    ]);
  };

  const removeBlendedComponent = (index: number) => {
    setBlendedComponents(prev => prev.filter((_, i) => i !== index));
  };

  const updateBlendedComponent = (index: number, field: keyof BlendedRateComponent, value: unknown) => {
    setBlendedComponents(prev => prev.map((comp, i) =>
      i === index ? { ...comp, [field]: value } : comp
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {existingFee ? 'Edit Fee Configuration' : 'Add New Fee'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Fee Name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name || 'e.g., "2024 Admin Fee" or "PMPM Base Rate"'}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                label="Category"
              >
                {categoryOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              multiline
              rows={2}
              placeholder="Add notes about this fee configuration..."
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Rate Configuration */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Rate Configuration
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.rateBasis}>
              <InputLabel>Fee Type / Rate Basis</InputLabel>
              <Select
                value={formData.rateBasis}
                onChange={(e) => handleFieldChange('rateBasis', e.target.value as RateBasis)}
                label="Fee Type / Rate Basis"
              >
                {rateBasisOptions.map(option => (
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
          </Grid>

          {/* PMPM/PEPM Fields */}
          {(formData.rateBasis === 'pmpm' || formData.rateBasis === 'pepm') && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={formData.rateBasis === 'pmpm' ? 'Rate Per Member' : 'Rate Per Employee'}
                  type="number"
                  value={formData.baseAmount || ''}
                  onChange={(e) => handleFieldChange('baseAmount', parseFloat(e.target.value) || 0)}
                  error={!!errors.baseAmount}
                  helperText={errors.baseAmount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Enable Tiered Pricing</InputLabel>
                  <Select
                    value={formData.tieringEnabled ? 'yes' : 'no'}
                    onChange={(e) => handleFieldChange('tieringEnabled', e.target.value === 'yes')}
                    label="Enable Tiered Pricing"
                  >
                    <MenuItem value="no">No - Use flat rate</MenuItem>
                    <MenuItem value="yes">Yes - Use enrollment tiers</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.tieringEnabled && (
                <Grid item xs={12}>
                  <TierBuilder
                    tiers={formData.tiers || []}
                    onTiersChange={(tiers) => handleFieldChange('tiers', tiers)}
                    rateBasis={formData.rateBasis}
                  />
                  {errors.tiers && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.tiers}
                    </Alert>
                  )}
                </Grid>
              )}
            </>
          )}

          {/* Percentage-based Fields */}
          {(formData.rateBasis === 'percent_premium' || formData.rateBasis === 'percent_claims') && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Percentage"
                type="number"
                value={formData.percentage || ''}
                onChange={(e) => handleFieldChange('percentage', parseFloat(e.target.value) || 0)}
                error={!!errors.percentage}
                helperText={errors.percentage || 'Enter percentage (e.g., 2.5 for 2.5%)'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                required
              />
            </Grid>
          )}

          {/* Flat/Per Transaction Fields */}
          {(formData.rateBasis === 'flat' || formData.rateBasis === 'per_transaction' || formData.rateBasis === 'manual') && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={formData.rateBasis === 'per_transaction' ? 'Rate Per Transaction' : 'Amount'}
                type="number"
                value={formData.baseAmount || ''}
                onChange={(e) => handleFieldChange('baseAmount', parseFloat(e.target.value) || 0)}
                error={!!errors.baseAmount}
                helperText={errors.baseAmount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                required
              />
            </Grid>
          )}

          {/* Blended Rate Fields */}
          {formData.rateBasis === 'blended' && (
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Blended Rate Components</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {blendedComponents.map((component, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={component.type}
                              onChange={(e) => updateBlendedComponent(index, 'type', e.target.value)}
                              label="Type"
                              size="small"
                            >
                              <MenuItem value="fixed">Fixed Amount</MenuItem>
                              <MenuItem value="pmpm">PMPM</MenuItem>
                              <MenuItem value="percent_premium">% of Premium</MenuItem>
                              <MenuItem value="percent_claims">% of Claims</MenuItem>
                            </Select>
                          </FormControl>

                          <TextField
                            label="Value"
                            type="number"
                            value={component.value}
                            onChange={(e) => updateBlendedComponent(index, 'value', parseFloat(e.target.value) || 0)}
                            size="small"
                            InputProps={{
                              startAdornment: component.type === 'fixed' || component.type === 'pmpm'
                                ? <InputAdornment position="start">$</InputAdornment>
                                : undefined,
                              endAdornment: component.type === 'percent_premium' || component.type === 'percent_claims'
                                ? <InputAdornment position="end">%</InputAdornment>
                                : undefined
                            }}
                            sx={{ width: 150 }}
                          />

                          <TextField
                            label="Label"
                            value={component.label || ''}
                            onChange={(e) => updateBlendedComponent(index, 'label', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          />

                          <IconButton
                            onClick={() => removeBlendedComponent(index)}
                            color="error"
                            size="small"
                            disabled={blendedComponents.length === 1}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}

                    <Grid item xs={12}>
                      <Button onClick={addBlendedComponent} variant="outlined" size="small">
                        + Add Component
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          {/* Composite Rate Fields */}
          {formData.rateBasis === 'composite' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Member Rate"
                  type="number"
                  value={formData.compositeRate?.memberRate || ''}
                  onChange={(e) => handleFieldChange('compositeRate', {
                    ...formData.compositeRate,
                    memberRate: parseFloat(e.target.value) || 0,
                    dependentRate: formData.compositeRate?.dependentRate || 0,
                    basis: formData.compositeRate?.basis || 'pmpm'
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dependent Rate"
                  type="number"
                  value={formData.compositeRate?.dependentRate || ''}
                  onChange={(e) => handleFieldChange('compositeRate', {
                    ...formData.compositeRate,
                    memberRate: formData.compositeRate?.memberRate || 0,
                    dependentRate: parseFloat(e.target.value) || 0,
                    basis: formData.compositeRate?.basis || 'pmpm'
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Effective Dates */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Effective Dates
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Effective Start Date"
              type="date"
              value={formData.effectiveStartDate}
              onChange={(e) => handleFieldChange('effectiveStartDate', e.target.value)}
              error={!!errors.effectiveStartDate}
              helperText={errors.effectiveStartDate}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Effective End Date (Optional)"
              type="date"
              value={formData.effectiveEndDate || ''}
              onChange={(e) => handleFieldChange('effectiveEndDate', e.target.value || undefined)}
              InputLabelProps={{ shrink: true }}
              helperText="Leave blank for ongoing"
            />
          </Grid>

          {/* Preview Calculation */}
          {previewCalculation !== null && enrollmentData.length > 0 && (
            <Grid item xs={12}>
              <Alert
                severity="info"
                icon={<CalculateIcon />}
                sx={{ mt: 2 }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Preview Calculation (Sample Month: {enrollmentData[0]?.month})
                </Typography>
                <Typography variant="h6" color="primary">
                  ${previewCalculation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on enrollment: {enrollmentData[0]?.enrollment.toLocaleString()}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<CalculateIcon />}
        >
          {existingFee ? 'Update Fee' : 'Create Fee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
