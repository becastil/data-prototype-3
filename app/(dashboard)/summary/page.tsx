'use client';

import { useState, useMemo } from 'react';
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
  MenuItem
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  ArrowBack,
  FileDownload,
  Refresh
} from '@mui/icons-material';
import Link from 'next/link';
import { SummaryTable } from './components/SummaryTable';
import { MonthlySummary } from '@/types/healthcare';

// Sample data based on templates
const generateSampleData = (): MonthlySummary[] => {
  const months = [
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
  ];

  return months.map((month, index) => {
    // Base values from CSV template
    const baseClaims = 400000 + (index * 15000) + Math.random() * 20000;
    const baseFees = 450000 + (index * 8000);
    const basePremiums = 980000 + (index * 5000);
    const memberMonths = 1200 + (index * 2);
    
    const totalCost = baseClaims + baseFees;
    const monthlyLossRatio = totalCost / basePremiums;
    
    // Calculate rolling 12-month loss ratio (simplified)
    const avgLossRatio = monthlyLossRatio * (0.9 + Math.random() * 0.2);
    
    const variance = ((monthlyLossRatio - 0.85) / 0.85) * 100;
    const pmpm = totalCost / memberMonths;

    return {
      id: month,
      month,
      claims: Math.round(baseClaims),
      fees: Math.round(baseFees),
      premiums: Math.round(basePremiums),
      totalCost: Math.round(totalCost),
      monthlyLossRatio: Math.round(monthlyLossRatio * 1000) / 1000,
      rolling12LossRatio: Math.round(avgLossRatio * 1000) / 1000,
      variance: Math.round(variance * 10) / 10,
      memberMonths,
      pmpm: Math.round(pmpm * 100) / 100
    };
  });
};

type ViewMode = 'monthly' | 'quarterly' | 'annual';

export default function SummaryPage() {
  const [summaryData, setSummaryData] = useState<MonthlySummary[]>(generateSampleData());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  const filteredData = useMemo(() => {
    if (viewMode === 'quarterly') {
      // Group by quarters
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      return quarters.map((quarter, qIndex) => {
        const startMonth = qIndex * 3;
        const quarterData = summaryData.slice(startMonth, startMonth + 3);
        
        const totalClaims = quarterData.reduce((sum, month) => sum + month.claims, 0);
        const totalFees = quarterData.reduce((sum, month) => sum + month.fees, 0);
        const totalPremiums = quarterData.reduce((sum, month) => sum + month.premiums, 0);
        const totalMemberMonths = quarterData.reduce((sum, month) => sum + month.memberMonths, 0);
        
        const totalCost = totalClaims + totalFees;
        const lossRatio = totalCost / totalPremiums;
        const pmpm = totalCost / totalMemberMonths;
        
        return {
          id: `2024-${quarter}`,
          month: `2024 ${quarter}`,
          claims: totalClaims,
          fees: totalFees,
          premiums: totalPremiums,
          totalCost,
          monthlyLossRatio: lossRatio,
          rolling12LossRatio: lossRatio,
          variance: ((lossRatio - 0.85) / 0.85) * 100,
          memberMonths: totalMemberMonths,
          pmpm
        };
      });
    } else if (viewMode === 'annual') {
      const totalClaims = summaryData.reduce((sum, month) => sum + month.claims, 0);
      const totalFees = summaryData.reduce((sum, month) => sum + month.fees, 0);
      const totalPremiums = summaryData.reduce((sum, month) => sum + month.premiums, 0);
      const totalMemberMonths = summaryData.reduce((sum, month) => sum + month.memberMonths, 0);
      
      const totalCost = totalClaims + totalFees;
      const lossRatio = totalCost / totalPremiums;
      const pmpm = totalCost / totalMemberMonths;
      
      return [{
        id: '2024-annual',
        month: '2024 Annual',
        claims: totalClaims,
        fees: totalFees,
        premiums: totalPremiums,
        totalCost,
        monthlyLossRatio: lossRatio,
        rolling12LossRatio: lossRatio,
        variance: ((lossRatio - 0.85) / 0.85) * 100,
        memberMonths: totalMemberMonths,
        pmpm
      }];
    }
    return summaryData;
  }, [summaryData, viewMode]);

  const calculateKPIs = () => {
    const totalClaims = summaryData.reduce((sum, month) => sum + month.claims, 0);
    const totalFees = summaryData.reduce((sum, month) => sum + month.fees, 0);
    const totalPremiums = summaryData.reduce((sum, month) => sum + month.premiums, 0);
    const avgLossRatio = (totalClaims + totalFees) / totalPremiums;
    const totalMemberMonths = summaryData.reduce((sum, month) => sum + month.memberMonths, 0);
    const avgPMPM = (totalClaims + totalFees) / totalMemberMonths;
    
    return {
      totalClaims,
      totalFees,
      totalPremiums,
      avgLossRatio,
      avgPMPM,
      totalMemberMonths
    };
  };

  const kpis = calculateKPIs();

  const handleViewModeChange = (event: SelectChangeEvent) => {
    const nextViewMode = event.target.value;
    if (nextViewMode === 'monthly' || nextViewMode === 'quarterly' || nextViewMode === 'annual') {
      setViewMode(nextViewMode);
    }
  };

  const handleRefresh = () => {
    setSummaryData(generateSampleData());
  };

  const handleExport = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting summary data...');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/" passHref>
          <Button startIcon={<ArrowBack />} sx={{ mb: 2 }}>
            Back to Home
          </Button>
        </Link>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Loss Ratio Summary
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monthly loss ratios, PMPM metrics, and performance indicators
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
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
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExport}
            >
              Export PDF
            </Button>
          </Box>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Claims
              </Typography>
              <Typography variant="h5" color="primary">
                ${kpis.totalClaims.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Fees
              </Typography>
              <Typography variant="h5" color="primary">
                ${kpis.totalFees.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Loss Ratio
              </Typography>
              <Typography 
                variant="h5" 
                color={kpis.avgLossRatio > 1.0 ? 'error' : kpis.avgLossRatio > 0.85 ? 'warning' : 'success'}
              >
                {(kpis.avgLossRatio * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average PMPM
              </Typography>
              <Typography variant="h5" color="primary">
                ${kpis.avgPMPM.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Performance Indicators:
        </Typography>
        <Typography variant="body2" component="div">
          <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>● Good:</Box> Loss Ratio ≤ 85% | 
          <Box component="span" sx={{ color: 'warning.main', fontWeight: 'bold', ml: 1 }}>● Warning:</Box> 85% &lt; Loss Ratio ≤ 100% | 
          <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold', ml: 1 }}>● Critical:</Box> Loss Ratio &gt; 100%
        </Typography>
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {viewMode === 'monthly' ? 'Monthly' : viewMode === 'quarterly' ? 'Quarterly' : 'Annual'} Summary Table
        </Typography>
        
        <SummaryTable data={filteredData} />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/dashboard/fees" passHref>
            <Button variant="outlined">
              Previous: Configure Fees
            </Button>
          </Link>
          <Link href="/dashboard/analytics" passHref>
            <Button variant="contained">
              Next: View Analytics
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
