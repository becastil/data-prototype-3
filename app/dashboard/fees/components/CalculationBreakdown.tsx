'use client';

import {
  Box,
  Tooltip,
  Paper,
  Typography,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { MonthlyFeeInstance } from '@/types/fees';

interface CalculationBreakdownProps {
  feeInstance: MonthlyFeeInstance;
  feeName: string;
  rateBasis: string;
}

export default function CalculationBreakdown({
  feeInstance,
  feeName,
  rateBasis
}: CalculationBreakdownProps) {
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  // Build formula display based on rate basis
  const getFormulaDisplay = () => {
    const { enrollment, premiumAmount, claimsAmount, transactionCount, breakdown } = feeInstance;

    switch (rateBasis) {
      case 'pmpm':
      case 'pepm':
        if (feeInstance.appliedTier) {
          return `${formatNumber(enrollment)} × ${formatCurrency(feeInstance.appliedTier.rate)} = ${formatCurrency(feeInstance.calculatedAmount)}`;
        }
        return `${formatNumber(enrollment)} × Rate = ${formatCurrency(feeInstance.calculatedAmount)}`;

      case 'percent_premium':
        return `${formatCurrency(premiumAmount)} × Percentage = ${formatCurrency(feeInstance.calculatedAmount)}`;

      case 'percent_claims':
        return `${formatCurrency(claimsAmount)} × Percentage = ${formatCurrency(feeInstance.calculatedAmount)}`;

      case 'per_transaction':
        return `${formatNumber(transactionCount)} transactions × Rate = ${formatCurrency(feeInstance.calculatedAmount)}`;

      case 'flat':
        return `Fixed Amount = ${formatCurrency(feeInstance.calculatedAmount)}`;

      case 'blended':
        return breakdown?.components
          ? breakdown.components.map(c => `${c.label}: ${formatCurrency(c.amount)}`).join(' + ')
          : 'Multiple Components';

      case 'composite':
        return `Members + Dependents = ${formatCurrency(feeInstance.calculatedAmount)}`;

      case 'manual':
        return `Manual Entry = ${formatCurrency(feeInstance.calculatedAmount)}`;

      default:
        return formatCurrency(feeInstance.calculatedAmount);
    }
  };

  const tooltipContent = (
    <Paper sx={{ p: 2, maxWidth: 400 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {feeName}
        </Typography>
        <Chip
          label={rateBasis.toUpperCase()}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {feeInstance.month}
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Base Calculation */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Base Calculation:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {getFormulaDisplay()}
        </Typography>
      </Box>

      {/* Applied Tier */}
      {feeInstance.appliedTier && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Applied Tier:
          </Typography>
          <Chip
            label={feeInstance.appliedTier.label || 'Tier'}
            size="small"
            sx={{
              bgcolor: feeInstance.appliedTier.color || '#2563eb',
              color: 'white',
              fontWeight: 'medium'
            }}
          />
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            {formatNumber(feeInstance.appliedTier.minEnrollment)} - {feeInstance.appliedTier.maxEnrollment === null ? '∞' : formatNumber(feeInstance.appliedTier.maxEnrollment)} members @ {formatCurrency(feeInstance.appliedTier.rate)}
          </Typography>
        </Box>
      )}

      {/* Breakdown Components */}
      {feeInstance.breakdown && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Calculation Breakdown:
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Base Amount:</Typography>
                <Typography variant="caption" fontWeight="medium">
                  {formatCurrency(feeInstance.breakdown.baseCalculation)}
                </Typography>
              </Box>

              {feeInstance.breakdown.seasonalAdjustment !== undefined && feeInstance.breakdown.seasonalAdjustment !== 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="primary">
                    <TrendingUpIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    Seasonal Adjustment:
                  </Typography>
                  <Typography variant="caption" fontWeight="medium" color="primary">
                    {formatCurrency(feeInstance.breakdown.seasonalAdjustment)}
                  </Typography>
                </Box>
              )}

              {feeInstance.breakdown.escalationAdjustment !== undefined && feeInstance.breakdown.escalationAdjustment !== 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="secondary">
                    Escalation:
                  </Typography>
                  <Typography variant="caption" fontWeight="medium" color="secondary">
                    {formatCurrency(feeInstance.breakdown.escalationAdjustment)}
                  </Typography>
                </Box>
              )}

              {feeInstance.breakdown.constraintAdjustment !== undefined && feeInstance.breakdown.constraintAdjustment !== 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="warning.main">
                    Cap/Floor Adjustment:
                  </Typography>
                  <Typography variant="caption" fontWeight="medium" color="warning.main">
                    {formatCurrency(feeInstance.breakdown.constraintAdjustment)}
                  </Typography>
                </Box>
              )}

              {feeInstance.breakdown.proRatingAdjustment !== undefined && feeInstance.breakdown.proRatingAdjustment !== 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Pro-Rating:</Typography>
                  <Typography variant="caption" fontWeight="medium">
                    {formatCurrency(feeInstance.breakdown.proRatingAdjustment)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </>
      )}

      {/* Blended Components */}
      {feeInstance.breakdown?.components && feeInstance.breakdown.components.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Blended Components:
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {feeInstance.breakdown.components.map((component, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">{component.label}:</Typography>
                  <Typography variant="caption" fontWeight="medium">
                    {formatCurrency(component.amount)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </>
      )}

      {/* Final Total */}
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          Final Amount:
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="primary">
          {formatCurrency(feeInstance.finalAmount)}
        </Typography>
      </Box>

      {/* Enrollment Info */}
      <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
        <Typography variant="caption" color="text.secondary">
          Enrollment: {formatNumber(feeInstance.enrollment)}
        </Typography>
        {feeInstance.premiumAmount && (
          <Typography variant="caption" color="text.secondary" display="block">
            Premium: {formatCurrency(feeInstance.premiumAmount)}
          </Typography>
        )}
        {feeInstance.claimsAmount && (
          <Typography variant="caption" color="text.secondary" display="block">
            Claims: {formatCurrency(feeInstance.claimsAmount)}
          </Typography>
        )}
      </Box>

      {/* Calculated At */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.7rem' }}>
        Calculated: {new Date(feeInstance.calculatedAt).toLocaleString()}
      </Typography>
    </Paper>
  );

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="left"
      enterDelay={300}
      leaveDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            maxWidth: 'none'
          }
        }
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'help',
          '&:hover': {
            color: 'primary.main'
          }
        }}
      >
        <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
      </Box>
    </Tooltip>
  );
}
