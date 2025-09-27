'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  FileDownload,
  Refresh,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

// Sample dashboard data
const sampleDashboardData = {
  kpis: {
    totalClaims: 5650000,
    totalCost: 7100000,
    avgLossRatio: 0.92,
    avgClaim: 4708,
    totalMembers: 1224,
    avgPMPM: 486.27
  },
  monthlyData: [
    { month: 'Jan', claims: 414000, fees: 540000, lossRatio: 0.97, enrollment: 1200, pmpm: 795 },
    { month: 'Feb', claims: 435000, fees: 540140, lossRatio: 0.99, enrollment: 1195, pmpm: 816 },
    { month: 'Mar', claims: 438500, fees: 550550, lossRatio: 0.95, enrollment: 1210, pmpm: 818 },
    { month: 'Apr', claims: 442000, fees: 548275, lossRatio: 0.94, enrollment: 1205, pmpm: 822 },
    { month: 'May', claims: 458000, fees: 556470, lossRatio: 0.91, enrollment: 1215, pmpm: 835 },
    { month: 'Jun', claims: 481200, fees: 561200, lossRatio: 0.89, enrollment: 1220, pmpm: 854 },
    { month: 'Jul', claims: 485950, fees: 565950, lossRatio: 0.88, enrollment: 1225, pmpm: 859 },
    { month: 'Aug', claims: 509950, fees: 571950, lossRatio: 0.87, enrollment: 1230, pmpm: 880 },
    { month: 'Sep', claims: 487564, fees: 568564, lossRatio: 0.89, enrollment: 1228, pmpm: 860 },
    { month: 'Oct', claims: 515745, fees: 576745, lossRatio: 0.88, enrollment: 1235, pmpm: 885 },
    { month: 'Nov', claims: 525040, fees: 579040, lossRatio: 0.91, enrollment: 1232, pmpm: 896 },
    { month: 'Dec', claims: 507280, fees: 585280, lossRatio: 0.88, enrollment: 1240, pmpm: 881 }
  ],
  categoryBreakdown: [
    { category: 'Medical IP', amount: 1850000, percentage: 32.7 },
    { category: 'Medical OP', amount: 1320000, percentage: 23.4 },
    { category: 'Prescription Drugs', amount: 680000, percentage: 12.0 },
    { category: 'Emergency Room', amount: 380000, percentage: 6.7 },
    { category: 'Specialty Care', amount: 520000, percentage: 9.2 },
    { category: 'Mental Health', amount: 270000, percentage: 4.8 },
    { category: 'Other', amount: 630000, percentage: 11.2 }
  ],
  topDiagnoses: [
    { code: 'E11.9', description: 'Type 2 diabetes mellitus', totalCost: 425000, claimCount: 156, memberCount: 48 },
    { code: 'I25.10', description: 'Atherosclerotic heart disease', totalCost: 380000, claimCount: 89, memberCount: 23 },
    { code: 'C78.00', description: 'Secondary malignant neoplasm', totalCost: 620000, claimCount: 67, memberCount: 12 },
    { code: 'N18.6', description: 'End stage renal disease', totalCost: 485000, claimCount: 128, memberCount: 18 },
    { code: 'I50.9', description: 'Heart failure unspecified', totalCost: 310000, claimCount: 94, memberCount: 27 }
  ],
  highCostMembers: [
    { memberId: 'M003', totalCost: 167000, riskScore: 4.5, primaryDiagnosis: 'Anoxic brain damage' },
    { memberId: 'M001', totalCost: 145000, riskScore: 4.1, primaryDiagnosis: 'Secondary malignant neoplasm' },
    { memberId: 'M012', totalCost: 134000, riskScore: 3.9, primaryDiagnosis: 'Malignant neoplasm breast' },
    { memberId: 'M001', totalCost: 125000, riskScore: 2.8, primaryDiagnosis: 'Type 2 diabetes mellitus' },
    { memberId: 'M007', totalCost: 112000, riskScore: 3.6, primaryDiagnosis: 'Hepatic failure unspecified' }
  ]
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('2024');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleExport = () => {
    // TODO: Implement landscape PDF export
    console.log('Exporting analytics dashboard...');
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
              <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Interactive healthcare analytics with KPIs, trends, and insights
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={dateRange}
                label="Period"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="2024">2024 Full Year</MenuItem>
                <MenuItem value="2024-q4">2024 Q4</MenuItem>
                <MenuItem value="2024-q3">2024 Q3</MenuItem>
                <MenuItem value="2024-q2">2024 Q2</MenuItem>
                <MenuItem value="2024-q1">2024 Q1</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
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

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Dashboard Features:
        </Typography>
        <Typography variant="body2">
          • Real-time KPI monitoring with performance indicators
          • Interactive monthly trend analysis with loss ratio overlay
          • Category breakdown with drill-down capabilities
          • High-cost member identification and risk stratification
          • Top diagnosis analysis with cost and utilization metrics
          • Exportable reports in landscape PDF format
        </Typography>
      </Alert>

      <AnalyticsDashboard data={sampleDashboardData} />

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/dashboard/summary" passHref>
          <Button variant="outlined">
            Previous: Summary Table
          </Button>
        </Link>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/dashboard/upload" passHref>
            <Button variant="outlined">
              Upload New Data
            </Button>
          </Link>
          <Button 
            variant="contained" 
            onClick={handleExport}
            startIcon={<FileDownload />}
          >
            Generate Report
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
