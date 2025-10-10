'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateIcon from '@mui/icons-material/Calculate';
import Link from 'next/link';
import { EnhancedSummaryTable } from './components/EnhancedSummaryTable';
import {
  useHealthcare,
  useExperienceData,
  useFeeStructuresV2,
  useUserAdjustments,
  useBudgetData,
  useLoadingState
} from '@/lib/store/HealthcareContext';
import { ClientOnly } from '@/components/ClientOnly';
import { CompleteSummaryRow, SummaryCalculationInput } from '@/types/summary';
import { calculateCompleteSummary } from '@/lib/calculations/summaryCalculations';

type ViewMode = 'monthly' | 'quarterly' | 'annual';

export default function SummaryPage() {
  const { actions } = useHealthcare();
  const experienceData = useExperienceData();
  const feeStructuresV2 = useFeeStructuresV2();
  const userAdjustments = useUserAdjustments();
  const budgetData = useBudgetData();
  const { loading, error } = useLoadingState();

  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [isCalculating, setIsCalculating] = useState(false);
  const [summaryData, setSummaryData] = useState<CompleteSummaryRow[]>([]);
  const [showAdjustments, setShowAdjustments] = useState(true);
  const [calculationWarnings, setCalculationWarnings] = useState<string[]>([]);

  // Transform experience data to match calculation input format
  const transformedExperienceData = useMemo(() => {
    return experienceData.map(exp => ({
      month: exp.month,
      domesticMedicalIPOP: exp.domesticMedicalIP + exp.domesticMedicalOP,
      nonDomesticMedical: exp.nonDomesticMedical,
      nonHospitalMedical: exp.preventiveCare + exp.urgentCare + exp.specialtyCare +
                          exp.labDiagnostic + exp.physicalTherapy + exp.dme + exp.homeHealth,
      rxClaims: exp.prescriptionDrugs,
      eeCount: exp.enrollment, // Assuming enrollment = EE count
      memberCount: exp.enrollment // TODO: Get actual member count from CSV
    }));
  }, [experienceData]);

  // Transform fee structures to stop loss fees
  const transformedStopLossFees = useMemo(() => {
    // Find stop loss fee structures
    const stopLossFees = feeStructuresV2.filter(fee =>
      fee.category === 'administrative' &&
      (fee.name.toLowerCase().includes('stop loss') || fee.name.toLowerCase().includes('stoploss'))
    );

    // Group by month and calculate
    const monthlyFees = new Map<string, number>();

    stopLossFees.forEach(fee => {
      // Calculate for each month based on fee structure
      transformedExperienceData.forEach(exp => {
        const month = exp.month;
        let feeAmount = 0;

        if (fee.rateBasis === 'pmpm' && fee.baseAmount) {
          feeAmount = fee.baseAmount * exp.memberCount;
        } else if (fee.rateBasis === 'pepm' && fee.baseAmount) {
          feeAmount = fee.baseAmount * exp.eeCount;
        } else if (fee.rateBasis === 'flat' && fee.baseAmount) {
          feeAmount = fee.baseAmount;
        } else if (fee.rateBasis === 'composite' && fee.compositeRate) {
          feeAmount = fee.compositeRate.memberRate * exp.memberCount;
        }

        monthlyFees.set(month, (monthlyFees.get(month) || 0) + feeAmount);
      });
    });

    return Array.from(monthlyFees.entries()).map(([month, calculatedAmount]) => ({
      month,
      calculatedAmount,
      feeStructure: 'composite' as const
    }));
  }, [feeStructuresV2, transformedExperienceData]);

  // Transform consulting fees
  const transformedConsulting = useMemo(() => {
    const consultingFees = feeStructuresV2.filter(fee =>
      fee.category === 'administrative' &&
      fee.name.toLowerCase().includes('consulting')
    );

    const monthlyConsulting = new Map<string, number>();

    consultingFees.forEach(fee => {
      transformedExperienceData.forEach(exp => {
        const month = exp.month;
        let amount = 0;

        if (fee.rateBasis === 'flat' && fee.baseAmount) {
          amount = fee.baseAmount;
        } else if (fee.rateBasis === 'pmpm' && fee.baseAmount) {
          amount = fee.baseAmount * exp.memberCount;
        } else if (fee.rateBasis === 'pepm' && fee.baseAmount) {
          amount = fee.baseAmount * exp.eeCount;
        }

        monthlyConsulting.set(month, (monthlyConsulting.get(month) || 0) + amount);
      });
    });

    return Array.from(monthlyConsulting.entries()).map(([month, amount]) => ({
      month,
      amount
    }));
  }, [feeStructuresV2, transformedExperienceData]);

  // Transform admin fee line items
  const transformedAdminFees = useMemo(() => {
    const adminFees = feeStructuresV2.filter(fee =>
      fee.category === 'administrative' &&
      !fee.name.toLowerCase().includes('stop loss') &&
      !fee.name.toLowerCase().includes('consulting')
    );

    interface AdminFeeItem {
      id: string;
      name: string;
      feeType: 'pmpm' | 'pepm' | 'flat';
      amount: number;
      calculatedAmount: number;
      description?: string;
    }

    const monthlyAdminFees = new Map<string, Array<AdminFeeItem>>();

    adminFees.forEach(fee => {
      transformedExperienceData.forEach(exp => {
        const month = exp.month;

        const feeItem: AdminFeeItem = {
          id: fee.id,
          name: fee.name,
          feeType: fee.rateBasis === 'pmpm' ? 'pmpm' : fee.rateBasis === 'pepm' ? 'pepm' : 'flat',
          amount: fee.baseAmount || 0,
          calculatedAmount: 0,
          description: fee.description
        };

        if (!monthlyAdminFees.has(month)) {
          monthlyAdminFees.set(month, []);
        }
        monthlyAdminFees.get(month)!.push(feeItem);
      });
    });

    return Array.from(monthlyAdminFees.entries()).map(([month, fees]) => ({
      month,
      fees
    }));
  }, [feeStructuresV2, transformedExperienceData]);

  // Calculate summaries
  const handleCalculateSummaries = useCallback(async () => {
    if (transformedExperienceData.length === 0) {
      actions.setError('Please upload experience data first');
      return;
    }

    setIsCalculating(true);
    actions.setLoading(true);
    setCalculationWarnings([]);

    try {
      const input: SummaryCalculationInput = {
        experienceData: transformedExperienceData,
        stopLossFees: transformedStopLossFees,
        consulting: transformedConsulting,
        adminFeeLineItems: transformedAdminFees,
        userAdjustments: userAdjustments,
        budgetData: budgetData,
        targetLossRatio: 0.85,
        targetPEPM: 1207.43 // From spreadsheet
      };

      // Call calculation engine
      const result = calculateCompleteSummary(input);

      if (result.success && result.data) {
        setSummaryData(result.data);

        if (result.warnings && result.warnings.length > 0) {
          setCalculationWarnings(result.warnings);
        }

        actions.setError(null);
      } else {
        actions.setError(result.errors?.join(', ') || 'Calculation failed');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      actions.setError('Failed to calculate summaries');
    } finally {
      setIsCalculating(false);
      actions.setLoading(false);
    }
  }, [
    transformedExperienceData,
    transformedStopLossFees,
    transformedConsulting,
    transformedAdminFees,
    userAdjustments,
    budgetData,
    actions
  ]);

  // Auto-calculate on mount if data is available
  useEffect(() => {
    if (transformedExperienceData.length > 0 && summaryData.length === 0 && !isCalculating) {
      handleCalculateSummaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedExperienceData.length]); // Only depend on length to avoid infinite loop

  // Calculate KPIs from summary data
  const kpis = useMemo(() => {
    if (!summaryData || summaryData.length === 0) {
      return {
        totalClaims: 0,
        totalFees: 0,
        avgPEPM: 0,
        cumulativeTotal: 0,
        variancePercentage: 0
      };
    }

    const lastMonth = summaryData[summaryData.length - 1];
    const totalClaims = summaryData.reduce((sum, row) =>
      sum + row.medicalClaims.totalAdjustedMedicalClaims + row.pharmacy.totalRxClaims, 0
    );
    const totalFees = summaryData.reduce((sum, row) =>
      sum + row.adminFees.totalAdminFees + row.stopLoss.totalStopLossFees, 0
    );
    const avgPEPM = lastMonth.pepm.pepmNonLaggedCumulative;
    const cumulativeTotal = lastMonth.totals.cumulativeClaimsAndExpenses;
    const variancePercentage = lastMonth.variance.percentDifferenceCumulative;

    return {
      totalClaims,
      totalFees,
      avgPEPM,
      cumulativeTotal,
      variancePercentage
    };
  }, [summaryData]);

  const handleViewModeChange = (event: SelectChangeEvent) => {
    const nextViewMode = event.target.value;
    if (nextViewMode === 'monthly' || nextViewMode === 'quarterly' || nextViewMode === 'annual') {
      setViewMode(nextViewMode);
    }
  };

  const handleExport = async () => {
    if (!summaryData || summaryData.length === 0) {
      actions.setError('No data to export');
      return;
    }

    try {
      const response = await fetch('/api/summary/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: summaryData,
          format: 'csv'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary-table-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        actions.setError('Failed to export CSV');
      }
    } catch (error) {
      console.error('Export error:', error);
      actions.setError('Export failed');
    }
  };

  return (
    <ClientOnly>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                C&E Summary Table
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Complete 28-row Claims and Expenses reporting with automated calculations
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAdjustments}
                    onChange={(e) => setShowAdjustments(e.target.checked)}
                  />
                }
                label="Show Adjustments"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>View</InputLabel>
                <Select
                  value={viewMode}
                  label="View"
                  onChange={handleViewModeChange}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={isCalculating ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handleCalculateSummaries}
                disabled={isCalculating || transformedExperienceData.length === 0}
              >
                {isCalculating ? 'Calculating...' : 'Refresh'}
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
              >
                Export CSV
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Data Status Alerts */}
        {transformedExperienceData.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No experience data found. Please{' '}
            <Link href="/dashboard/upload" style={{ textDecoration: 'underline', color: 'inherit' }}>
              upload your CSV files
            </Link>{' '}
            first to generate the summary table.
          </Alert>
        )}

        {calculationWarnings.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Calculation Warnings:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {calculationWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}

        {loading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Calculating summary table...</Typography>
            </Box>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => actions.setError(null)}>
            {error}
          </Alert>
        )}

        {/* KPI Cards */}
        {summaryData.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Claims
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${kpis.totalClaims.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Fees
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${kpis.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Cumulative Total
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${kpis.cumulativeTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Average PEPM
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${kpis.avgPEPM.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Budget Variance
                  </Typography>
                  <Typography
                    variant="h6"
                    color={kpis.variancePercentage > 0 ? 'error' : kpis.variancePercentage < -5 ? 'success' : 'warning'}
                  >
                    {kpis.variancePercentage.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Summary Table Structure (28 Rows):
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Items 1-7:</strong> Medical Claims (Domestic, Non-Domestic, Hospital, Non-Hospital, Adjustments)<br />
            • <strong>Items 8-9:</strong> Pharmacy (Rx Claims, Rebates)<br />
            • <strong>Items 10-11:</strong> Stop Loss (Fees, Reimbursements)<br />
            • <strong>Items 12-14:</strong> Administrative Fees (Consulting, Line Items, Totals)<br />
            • <strong>Items 15-16:</strong> Monthly & Cumulative Totals<br />
            • <strong>Items 17-18:</strong> Enrollment Metrics (EE Count, Member Count)<br />
            • <strong>Items 19-21:</strong> PEPM Metrics (Actual, Cumulative, Target)<br />
            • <strong>Items 22-24:</strong> Budget Data<br />
            • <strong>Items 25-28:</strong> Variance Analysis
          </Typography>
        </Alert>

        <Paper sx={{ p: 0 }}>
          {summaryData && summaryData.length > 0 ? (
            <EnhancedSummaryTable data={summaryData} showAdjustments={showAdjustments} />
          ) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              textAlign: 'center'
            }}>
              <CalculateIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Summary Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {transformedExperienceData.length === 0
                  ? "Upload your experience data to generate the summary table"
                  : "Click 'Refresh' to calculate the summary table"
                }
              </Typography>
              {transformedExperienceData.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<CalculateIcon />}
                  onClick={handleCalculateSummaries}
                  disabled={isCalculating}
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Summary'}
                </Button>
              )}
            </Box>
          )}
        </Paper>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            component={Link}
            href="/dashboard/fees"
            variant="outlined"
          >
            Previous: Configure Fees
          </Button>
          <Button
            component={Link}
            href="/dashboard/analytics"
            variant="contained"
          >
            Next: View Analytics
          </Button>
        </Box>
      </Container>
    </ClientOnly>
  );
}
