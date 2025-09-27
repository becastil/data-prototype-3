'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Calculate
} from '@mui/icons-material';
import Link from 'next/link';
import { FeesGrid } from './components/FeesGrid';
import { FeeStructure } from '@/types/healthcare';

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
  const [feeData, setFeeData] = useState<FeeStructure[]>(initialFeeData);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: Implement actual save to API
    console.log('Saving fee data:', feeData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const calculateTotals = () => {
    const totalFees = feeData.reduce((sum, fee) => sum + fee.calculatedTotal, 0);
    const avgFeePerMonth = totalFees / feeData.length;
    const avgEnrollment = feeData.reduce((sum, fee) => sum + (fee.enrollment || 0), 0) / feeData.length;
    
    return { totalFees, avgFeePerMonth, avgEnrollment };
  };

  const { totalFees, avgFeePerMonth, avgEnrollment } = calculateTotals();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/" passHref>
          <Button startIcon={<ArrowBack />} sx={{ mb: 2 }}>
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
          Fee configuration saved successfully!
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Annual Fees
              </Typography>
              <Typography variant="h4" color="primary">
                ${totalFees.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Monthly Fee
              </Typography>
              <Typography variant="h4" color="primary">
                ${avgFeePerMonth.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Enrollment
              </Typography>
              <Typography variant="h4" color="primary">
                {Math.round(avgEnrollment).toLocaleString()}
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
            <Button
              variant="outlined"
              startIcon={<Calculate />}
              onClick={() => setFeeData([...feeData])} // Trigger recalculation
            >
              Recalculate
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Configuration
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

        <FeesGrid 
          data={feeData} 
          onDataChange={setFeeData}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/dashboard/upload" passHref>
            <Button variant="outlined">
              Previous: Upload Data
            </Button>
          </Link>
          <Link href="/dashboard/summary" passHref>
            <Button variant="contained">
              Next: View Summary
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}