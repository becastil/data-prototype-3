'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  Divider,
  Tooltip,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import { FeeTier } from '@/types/fees';

interface TierBuilderProps {
  tiers: FeeTier[];
  onTiersChange: (tiers: FeeTier[]) => void;
  rateBasis?: 'pmpm' | 'pepm' | 'flat';
  currency?: string;
}

export default function TierBuilder({
  tiers,
  onTiersChange,
  rateBasis = 'pmpm',
  currency = 'USD'
}: TierBuilderProps) {
  const [previewEnrollment, setPreviewEnrollment] = useState<number>(1000);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Generate unique ID for new tier
  const generateId = () => `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add a new tier
  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (lastTier.maxEnrollment || 0) + 1 : 0;

    const newTier: FeeTier = {
      id: generateId(),
      minEnrollment: newMin,
      maxEnrollment: null,
      rate: lastTier ? lastTier.rate * 0.95 : 500, // 5% discount from previous tier
      label: `Tier ${tiers.length + 1}`,
      color: getTierColor(tiers.length)
    };

    onTiersChange([...tiers, newTier]);
    validateTiers([...tiers, newTier]);
  };

  // Remove a tier
  const handleRemoveTier = (id: string) => {
    const updatedTiers = tiers.filter(t => t.id !== id);
    onTiersChange(updatedTiers);
    validateTiers(updatedTiers);
  };

  // Update tier field
  const handleTierUpdate = (id: string, field: keyof FeeTier, value: any) => {
    const updatedTiers = tiers.map(tier => {
      if (tier.id === id) {
        return { ...tier, [field]: value };
      }
      return tier;
    });
    onTiersChange(updatedTiers);
    validateTiers(updatedTiers);
  };

  // Validate tier configuration
  const validateTiers = (tiersToValidate: FeeTier[]) => {
    const errors: string[] = [];

    // Check for gaps
    const sortedTiers = [...tiersToValidate].sort((a, b) => a.minEnrollment - b.minEnrollment);
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentMax = sortedTiers[i].maxEnrollment;
      const nextMin = sortedTiers[i + 1].minEnrollment;

      if (currentMax === null) {
        errors.push(`Tier "${sortedTiers[i].label}" has unlimited max but is not the last tier`);
      } else if (currentMax + 1 !== nextMin) {
        errors.push(`Gap detected between "${sortedTiers[i].label}" and "${sortedTiers[i + 1].label}"`);
      }
    }

    // Check for overlaps
    for (let i = 0; i < sortedTiers.length; i++) {
      for (let j = i + 1; j < sortedTiers.length; j++) {
        const tier1 = sortedTiers[i];
        const tier2 = sortedTiers[j];

        if (tier1.maxEnrollment === null) continue;
        if (tier2.minEnrollment <= tier1.maxEnrollment) {
          errors.push(`Overlap detected between "${tier1.label}" and "${tier2.label}"`);
        }
      }
    }

    // Check for invalid ranges
    sortedTiers.forEach(tier => {
      if (tier.maxEnrollment !== null && tier.minEnrollment > tier.maxEnrollment) {
        errors.push(`Invalid range in "${tier.label}": min > max`);
      }
      if (tier.rate <= 0) {
        errors.push(`Invalid rate in "${tier.label}": must be greater than 0`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Calculate fee for preview enrollment
  const calculatePreviewFee = (): { tier: FeeTier | null; amount: number } => {
    const applicableTier = tiers.find(tier => {
      return previewEnrollment >= tier.minEnrollment &&
        (tier.maxEnrollment === null || previewEnrollment <= tier.maxEnrollment);
    });

    if (!applicableTier) {
      return { tier: null, amount: 0 };
    }

    const amount = rateBasis === 'flat' ? applicableTier.rate : applicableTier.rate * previewEnrollment;
    return { tier: applicableTier, amount };
  };

  // Get color for tier visualization
  const getTierColor = (index: number): string => {
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#65a30d'];
    return colors[index % colors.length];
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const previewResult = calculatePreviewFee();
  const sortedTiers = [...tiers].sort((a, b) => a.minEnrollment - b.minEnrollment);

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Tiered Pricing Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define enrollment breakpoints with custom rates for each tier
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTier}
            size="small"
          >
            Add Tier
          </Button>
        </Box>

        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Validation Errors:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Tier Configuration Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={40}></TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Min Enrollment</TableCell>
                <TableCell>Max Enrollment</TableCell>
                <TableCell>Rate ({rateBasis.toUpperCase()})</TableCell>
                <TableCell>Sample Cost (1000 members)</TableCell>
                <TableCell width={80}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No tiers configured. Click &quot;Add Tier&quot; to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTiers.map((tier, index) => {
                  const sampleCost = rateBasis === 'flat' ? tier.rate : tier.rate * 1000;
                  return (
                    <TableRow key={tier.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: tier.color || getTierColor(index),
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <DragIndicatorIcon sx={{ fontSize: 16, color: 'white' }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={tier.label}
                          onChange={(e) => handleTierUpdate(tier.id, 'label', e.target.value)}
                          placeholder="Tier name"
                          sx={{ minWidth: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={tier.minEnrollment}
                          onChange={(e) => handleTierUpdate(tier.id, 'minEnrollment', Number(e.target.value))}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={tier.maxEnrollment || ''}
                          onChange={(e) => handleTierUpdate(tier.id, 'maxEnrollment', e.target.value ? Number(e.target.value) : null)}
                          placeholder="Unlimited"
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={tier.rate}
                          onChange={(e) => handleTierUpdate(tier.id, 'rate', Number(e.target.value))}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                          }}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(sampleCost)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveTier(tier.id)}
                          disabled={tiers.length === 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Visual Tier Representation */}
        {sortedTiers.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Visual Tier Breakdown
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              {sortedTiers.map((tier, index) => {
                const range = tier.maxEnrollment
                  ? `${tier.minEnrollment}-${tier.maxEnrollment}`
                  : `${tier.minEnrollment}+`;
                return (
                  <Tooltip
                    key={tier.id}
                    title={`${tier.label}: ${range} members @ ${formatCurrency(tier.rate)}${rateBasis === 'flat' ? '' : '/' + rateBasis}`}
                  >
                    <Chip
                      label={`${tier.label}: ${formatCurrency(tier.rate)}`}
                      sx={{
                        bgcolor: tier.color || getTierColor(index),
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                      size="small"
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Fee Preview */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon fontSize="small" />
            Fee Calculator Preview
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label="Enrollment Count"
              type="number"
              value={previewEnrollment}
              onChange={(e) => setPreviewEnrollment(Number(e.target.value))}
              size="small"
              sx={{ width: 180 }}
            />
            <Box sx={{ flex: 1 }}>
              {previewResult.tier ? (
                <Alert severity="success" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    <strong>Applicable Tier:</strong> {previewResult.tier.label}<br />
                    <strong>Rate:</strong> {formatCurrency(previewResult.tier.rate)}{rateBasis !== 'flat' && `/${rateBasis.toUpperCase()}`}<br />
                    <strong>Calculated Fee:</strong> {formatCurrency(previewResult.amount)}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning">
                  No tier applicable for {previewEnrollment} members. Please adjust tier ranges.
                </Alert>
              )}
            </Box>
          </Box>
        </Box>

        {/* Help Text */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="caption">
            <strong>Tips:</strong> Tiers should be continuous without gaps. The last tier can have unlimited max enrollment (leave blank).
            Lower tiers typically have higher rates, with discounts for higher enrollment.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
}
