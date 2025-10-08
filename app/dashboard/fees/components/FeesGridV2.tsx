'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Alert,
  Button,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FeeStructureV2 } from '@/types/fees';
import { useFeeCalculations } from '@/lib/hooks/useFeeCalculations';
import { ExperienceData } from '@/types/healthcare';

interface FeesGridV2Props {
  feeStructures: FeeStructureV2[];
  experienceData: ExperienceData[];
  onAddFee: () => void;
  onEditFee: (fee: FeeStructureV2) => void;
  onDeleteFee: (feeId: string) => void;
  onDuplicateFee: (fee: FeeStructureV2) => void;
}

export default function FeesGridV2({
  feeStructures,
  experienceData,
  onAddFee,
  onEditFee,
  onDeleteFee,
  onDuplicateFee
}: FeesGridV2Props) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    experienceData.length > 0 ? experienceData[0].month : null
  );

  // Calculate fees using the hook
  const {
    monthlyFees,
    summary,
    isCalculating,
    needsRecalculation,
    getFeeBreakdown,
    recalculate
  } = useFeeCalculations({
    feeStructures,
    experienceData,
    autoRecalculate: true
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getStatusColor = (hasErrors: boolean, hasWarnings: boolean) => {
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  };

  const getStatusIcon = (hasErrors: boolean, hasWarnings: boolean) => {
    if (hasErrors) return <WarningIcon fontSize="small" />;
    if (hasWarnings) return <InfoIcon fontSize="small" />;
    return <CheckCircleIcon fontSize="small" />;
  };

  const selectedMonthBreakdown = selectedMonth ? getFeeBreakdown(selectedMonth) : null;

  return (
    <Box>
      {/* Recalculation Banner */}
      {needsRecalculation && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={recalculate}>
              Recalculate Now
            </Button>
          }
        >
          Data has changed. Click to recalculate fees.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* LEFT PANEL: Active Fee Structures */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '600px', overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontSize="1rem">
                Active Fees
              </Typography>
              <IconButton onClick={onAddFee} color="primary" size="small">
                <AddIcon />
              </IconButton>
            </Box>

            {feeStructures.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No fees configured
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={onAddFee}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add First Fee
                </Button>
              </Box>
            ) : (
              <Stack spacing={1}>
                {feeStructures.map((fee) => (
                  <Card
                    key={fee.id}
                    variant="outlined"
                    sx={{
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {fee.name}
                          </Typography>
                          <Chip
                            label={fee.rateBasis.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => onEditFee(fee)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => onDuplicateFee(fee)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => onDeleteFee(fee.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block">
                        {fee.description || 'No description'}
                      </Typography>

                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {fee.effectiveStartDate}
                          {fee.effectiveEndDate && ` - ${fee.effectiveEndDate}`}
                        </Typography>
                        <Chip
                          label={fee.status}
                          size="small"
                          color={fee.status === 'active' ? 'success' : 'default'}
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* CENTER PANEL: Monthly Calculation Grid */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontSize="1rem" gutterBottom>
              Monthly Fee Calculations
            </Typography>

            {isCalculating && (
              <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                Calculating fees...
              </Alert>
            )}

            <TableContainer sx={{ maxHeight: 550 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Enrollment</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Fees</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          {experienceData.length === 0
                            ? 'No enrollment data available'
                            : feeStructures.length === 0
                            ? 'No fee structures configured'
                            : 'No calculated fees'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    monthlyFees.map((monthFee) => {
                      const hasErrors = monthFee.errors.length > 0;
                      const hasWarnings = monthFee.warnings.length > 0;
                      const isSelected = monthFee.month === selectedMonth;

                      return (
                        <TableRow
                          key={monthFee.month}
                          hover
                          selected={isSelected}
                          onClick={() => setSelectedMonth(monthFee.month)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'action.selected' : 'inherit'
                          }}
                        >
                          <TableCell>{monthFee.month}</TableCell>
                          <TableCell align="right">{monthFee.enrollment.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                            {formatCurrency(monthFee.totalFees)}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip
                              title={
                                hasErrors
                                  ? `${monthFee.errors.length} errors`
                                  : hasWarnings
                                  ? `${monthFee.warnings.length} warnings`
                                  : 'Calculated successfully'
                              }
                            >
                              <Chip
                                size="small"
                                icon={getStatusIcon(hasErrors, hasWarnings)}
                                label={monthFee.feeInstances.length}
                                color={getStatusColor(hasErrors, hasWarnings)}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedMonth(monthFee.month)}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}

                  {/* Summary Row */}
                  {monthlyFees.length > 0 && (
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {Math.round(summary.avgEnrollment).toLocaleString()} avg
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatCurrency(summary.totalFees)}
                      </TableCell>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="caption" color="text.secondary">
                          {summary.monthCount} months
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* RIGHT PANEL: Calculation Details */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '600px', overflowY: 'auto' }}>
            <Typography variant="h6" fontSize="1rem" gutterBottom>
              Calculation Details
            </Typography>

            {!selectedMonth ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InfoIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Select a month to view calculation details
                </Typography>
              </Box>
            ) : !selectedMonthBreakdown ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <WarningIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No calculation data available for {selectedMonth}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedMonth}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatCurrency(selectedMonthBreakdown.totalFees)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enrollment: {selectedMonthBreakdown.enrollment.toLocaleString()}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Fee Breakdown ({selectedMonthBreakdown.fees.length})
                </Typography>

                <Stack spacing={1}>
                  {selectedMonthBreakdown.fees.map((fee, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {fee.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(fee.amount)}
                            </Typography>
                            {fee.appliedTier && (
                              <Chip
                                label={fee.appliedTier.label}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  fontSize: '0.65rem',
                                  height: 18,
                                  bgcolor: fee.appliedTier.color,
                                  color: 'white'
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {fee.breakdown && (
                          <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary">
                              Base: {formatCurrency(fee.breakdown.baseCalculation)}
                              {fee.breakdown.seasonalAdjustment !== undefined && fee.breakdown.seasonalAdjustment !== 0 && (
                                <> + Seasonal: {formatCurrency(fee.breakdown.seasonalAdjustment)}</>
                              )}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Summary Statistics */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Annual Fees
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(summary.totalFees)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Average Monthly Fee
              </Typography>
              <Typography variant="h6">
                {formatCurrency(summary.avgMonthlyFee)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Average Enrollment
              </Typography>
              <Typography variant="h6">
                {Math.round(summary.avgEnrollment).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Months Calculated
              </Typography>
              <Typography variant="h6">
                {summary.monthCount}
                {summary.totalErrors > 0 && (
                  <Chip
                    label={`${summary.totalErrors} errors`}
                    size="small"
                    color="error"
                    sx={{ ml: 1, fontSize: '0.7rem' }}
                  />
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
