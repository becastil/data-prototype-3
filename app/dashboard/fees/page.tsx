'use client';

import { useState, useEffect, useCallback } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Link from 'next/link';
import { FeesGrid } from './components/FeesGrid';
import { FeeStructure } from '@/types/healthcare';
import { useHealthcare, useExperienceData, useFeeStructures } from '@/lib/store/HealthcareContext';
import { ClientOnly } from '@/components/ClientOnly';

const initialFeeData: FeeStructure[] = [
  {
    id: '1',
    month: '2024-01',
    feeType: 'pmpm',
    amount: 450,
    enrollment: 1200,
    calculatedTotal: 540000,
    effectiveDate: '2024-01-01',
    description: 'Standard PMPM fee'
  },
  {
    id: '2',
    month: '2024-02',
    feeType: 'pmpm',
    amount: 452,
    enrollment: 1195,
    calculatedTotal: 540140,
    effectiveDate: '2024-02-01',
    description: 'Adjusted for enrollment change'
  },
  {
    id: '3',
    month: '2024-03',
    feeType: 'pmpm',
    amount: 455,
    enrollment: 1210,
    calculatedTotal: 550550,
    effectiveDate: '2024-03-01',
    description: 'Rate increase'
  },
  {
    id: '4',
    month: '2024-04',
    feeType: 'pmpm',
    amount: 455,
    enrollment: 1205,
    calculatedTotal: 548275,
    effectiveDate: '2024-04-01',
    description: 'Stable rate'
  },
  {
    id: '5',
    month: '2024-05',
    feeType: 'pmpm',
    amount: 458,
    enrollment: 1215,
    calculatedTotal: 556470,
    effectiveDate: '2024-05-01',
    description: 'Performance adjustment'
  },
  {
    id: '6',
    month: '2024-06',
    feeType: 'pmpm',
    amount: 460,
    enrollment: 1220,
    calculatedTotal: 561200,
    effectiveDate: '2024-06-01',
    description: 'Mid-year adjustment'
  },
  {
    id: '7',
    month: '2024-07',
    feeType: 'pmpm',
    amount: 462,
    enrollment: 1225,
    calculatedTotal: 565950,
    effectiveDate: '2024-07-01',
    description: 'Summer rate'
  },
  {
    id: '8',
    month: '2024-08',
    feeType: 'pmpm',
    amount: 465,
    enrollment: 1230,
    calculatedTotal: 571950,
    effectiveDate: '2024-08-01',
    description: 'Peak season rate'
  },
  {
    id: '9',
    month: '2024-09',
    feeType: 'pmpm',
    amount: 463,
    enrollment: 1228,
    calculatedTotal: 568564,
    effectiveDate: '2024-09-01',
    description: 'Fall adjustment'
  },
  {
    id: '10',
    month: '2024-10',
    feeType: 'pmpm',
    amount: 467,
    enrollment: 1235,
    calculatedTotal: 576745,
    effectiveDate: '2024-10-01',
    description: 'Q4 rate'
  },
  {
    id: '11',
    month: '2024-11',
    feeType: 'pmpm',
    amount: 470,
    enrollment: 1232,
    calculatedTotal: 579040,
    effectiveDate: '2024-11-01',
    description: 'November rate'
  },
  {
    id: '12',
    month: '2024-12',
    feeType: 'pmpm',
    amount: 472,
    enrollment: 1240,
    calculatedTotal: 585280,
    effectiveDate: '2024-12-01',
    description: 'Year-end rate'
  }
];

export default function FeesPage() {
  const { actions } = useHealthcare();
  const experienceData = useExperienceData();
  const existingFeeStructures = useFeeStructures();

  const [feeData, setFeeData] = useState<FeeStructure[]>(
    existingFeeStructures?.length > 0 ? existingFeeStructures : initialFeeData
  );
  const [premiumRate, setPremiumRate] = useState<number>(500);
  const [premiumCalculationMethod, setPremiumCalculationMethod] = useState<string>('pmpm');
  const [targetLossRatio, setTargetLossRatio] = useState<number>(0.85);
  const [saved, setSaved] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const generateFeeStructuresFromExperience = useCallback(() => {
    const generatedFees: FeeStructure[] = experienceData.map((expData, index) => ({
      id: `gen-${index + 1}`,
      month: expData.month,
      feeType: 'pmpm' as const,
      amount: premiumRate,
      enrollment: expData.enrollment,
      calculatedTotal: premiumRate * expData.enrollment,
      effectiveDate: `${expData.month}-01`,
      description: 'Auto-generated from experience data'
    }));
    
    setFeeData(generatedFees);
  }, [experienceData, premiumRate]);

  // Update fee data from context when it changes
  useEffect(() => {
    if (existingFeeStructures.length > 0) {
      setFeeData(existingFeeStructures);
    }
  }, [existingFeeStructures]);

  // Generate fee data from experience data if no existing fees
  useEffect(() => {
    if (experienceData.length > 0 && existingFeeStructures.length === 0) {
      generateFeeStructuresFromExperience();
    }
  }, [experienceData, existingFeeStructures.length, generateFeeStructuresFromExperience]);

  const handleSave = async () => {
    setIsCalculating(true);
    actions.setLoading(true);
    
    try {
      // Save fee structures to context
      actions.setFeeStructures(feeData);
      
      // Generate premium data for calculations
      const premiumData = feeData.map(fee => ({
        month: fee.month,
        premiumAmount: calculatePremiumAmount(fee),
        enrollment: fee.enrollment || 0
      }));

      // Call calculations API to generate monthly summaries
      const calculationsResponse = await fetch('/api/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'monthly-summaries',
          data: {
            experienceData,
            feeStructures: feeData,
            premiumData,
            targetLossRatio
          }
        }),
      });

      const calculationsResult = await calculationsResponse.json();
      
      if (calculationsResult.success) {
        actions.setMonthlySummaries(calculationsResult.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        actions.setError(`Calculation failed: ${calculationsResult.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      actions.setError('Failed to save configuration');
    } finally {
      setIsCalculating(false);
      actions.setLoading(false);
    }
  };

  const calculatePremiumAmount = (fee: FeeStructure): number => {
    // Calculate premium to achieve target loss ratio
    const totalCosts = fee.calculatedTotal; // This is the fee amount
    // Premium should be higher than costs to achieve target loss ratio
    return totalCosts / targetLossRatio;
  };

  const recalculateWithNewRates = () => {
    const updatedFees = feeData.map(fee => ({
      ...fee,
      amount: premiumRate,
      calculatedTotal: fee.feeType === 'pmpm' || fee.feeType === 'pepm' 
        ? premiumRate * (fee.enrollment || 0)
        : fee.feeType === 'flat'
        ? premiumRate
        : fee.calculatedTotal
    }));
    
    setFeeData(updatedFees);
  };

  const calculateTotals = () => {
    const totalFees = feeData.reduce((sum, fee) => sum + fee.calculatedTotal, 0);
    const avgFeePerMonth = feeData.length > 0 ? totalFees / feeData.length : 0;
    const avgEnrollment = feeData.length > 0 
      ? feeData.reduce((sum, fee) => sum + (fee.enrollment || 0), 0) / feeData.length 
      : 0;
    
    // Calculate estimated premium total
    const totalPremiums = feeData.reduce((sum, fee) => sum + calculatePremiumAmount(fee), 0);
    
    return { totalFees, avgFeePerMonth, avgEnrollment, totalPremiums };
  };

  const { totalFees, avgFeePerMonth, avgEnrollment, totalPremiums } = calculateTotals();

  return (
    <ClientOnly>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>
        </Link>
        <Typography variant="h4" component="h1" gutterBottom>
          Fee Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure monthly fee structures with automatic calculations
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Fee configuration saved successfully! Monthly summaries have been calculated.
        </Alert>
      )}

      {experienceData.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No experience data found. Please upload your data first to automatically generate fee structures.
        </Alert>
      )}

      {/* Premium Configuration */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Premium & Target Configuration
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Base Premium Rate"
              type="number"
              value={premiumRate}
              onChange={(e) => setPremiumRate(Number(e.target.value))}
              helperText="Base rate for PMPM calculations"
              InputProps={{
                startAdornment: '$'
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Premium Method</InputLabel>
              <Select
                value={premiumCalculationMethod}
                onChange={(e) => setPremiumCalculationMethod(e.target.value)}
                label="Premium Method"
              >
                <MenuItem value="pmpm">Per Member Per Month</MenuItem>
                <MenuItem value="pepm">Per Employee Per Month</MenuItem>
                <MenuItem value="flat">Flat Rate</MenuItem>
                <MenuItem value="calculated">Calculated from Loss Ratio</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Target Loss Ratio"
              type="number"
              value={targetLossRatio}
              onChange={(e) => setTargetLossRatio(Number(e.target.value))}
              helperText="Target (e.g., 0.85 = 85%)"
              inputProps={{ min: 0.1, max: 1.0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={recalculateWithNewRates}
              sx={{ height: 56 }}
            >
              Apply New Rates
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Annual Fees
              </Typography>
              <Typography variant="h5" color="primary">
                ${totalFees.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Monthly Fee
              </Typography>
              <Typography variant="h5" color="primary">
                ${Math.round(avgFeePerMonth).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Estimated Premiums
              </Typography>
              <Typography variant="h5" color="secondary">
                ${Math.round(totalPremiums).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Enrollment
              </Typography>
              <Typography variant="h5" color="primary">
                {Math.round(avgEnrollment).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Projected Loss Ratio
              </Typography>
              <Typography variant="h5" color={targetLossRatio > 0.9 ? "error" : "success"}>
                {(targetLossRatio * 100).toFixed(0)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Monthly Fee Structure
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {experienceData.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<CalculateIcon />}
                onClick={generateFeeStructuresFromExperience}
              >
                Auto-Generate from Data
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Save & Calculate Summaries'}
            </Button>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Fee Types:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>PMPM:</strong> Per Member Per Month - Amount × Enrollment</li>
              <li><strong>PEPM:</strong> Per Employee Per Month - Amount × Employees</li>
              <li><strong>Flat:</strong> Fixed amount regardless of enrollment</li>
              <li><strong>Tiered:</strong> Amount varies by enrollment tiers</li>
              <li><strong>Annual:</strong> Annual amount divided by 12</li>
              <li><strong>Manual:</strong> Manually entered total amount</li>
            </ul>
          </Typography>
        </Alert>

        {feeData && feeData.length > 0 ? (
          <FeesGrid
            data={feeData}
            onDataChange={setFeeData}
          />
        ) : (
          <Alert severity="info">
            <Typography>No fee data available. Click &quot;Auto-Generate from Data&quot; to create fee structures.</Typography>
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/dashboard/upload" style={{ textDecoration: 'none' }}>
            <Button variant="outlined">
              Previous: Upload Data
            </Button>
          </Link>
          <Link href="/dashboard/summary" style={{ textDecoration: 'none' }}>
            <Button variant="contained">
              Next: View Summary
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
    </ClientOnly>
  );
}
