'use client';

import { useState } from 'react';
import { Container, Typography, Box, Button, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { DraggableChartGrid, ChartConfig } from '@/components/DraggableChartGrid';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { ClientOnly } from '@/components/ClientOnly';

// Sample healthcare data
const monthlyData = [
  { month: 'Jan', claims: 414000, fees: 540000, enrollment: 1200 },
  { month: 'Feb', claims: 435000, fees: 540140, enrollment: 1195 },
  { month: 'Mar', claims: 438500, fees: 550550, enrollment: 1210 },
  { month: 'Apr', claims: 442000, fees: 548275, enrollment: 1205 },
  { month: 'May', claims: 458000, fees: 556470, enrollment: 1215 },
  { month: 'Jun', claims: 481200, fees: 561200, enrollment: 1220 },
];

const categoryData = [
  { category: 'Medical IP', amount: 1850000 },
  { category: 'Medical OP', amount: 1320000 },
  { category: 'Prescription Drugs', amount: 680000 },
  { category: 'Emergency Room', amount: 380000 },
  { category: 'Specialty Care', amount: 520000 },
];

const topDiagnoses = [
  { code: 'E11.9', description: 'Type 2 diabetes', cost: 425000, claims: 156 },
  { code: 'I25.10', description: 'Heart disease', cost: 380000, claims: 89 },
  { code: 'C78.00', description: 'Cancer', cost: 620000, claims: 67 },
  { code: 'N18.6', description: 'Kidney disease', cost: 485000, claims: 128 },
];

export default function InteractiveDashboard() {
  const [, setSavedLayouts] = useState<ChartConfig[]>([]);

  // Available charts that users can add
  const availableCharts = [
    {
      type: 'bar' as const,
      title: 'Monthly Claims Trend',
      content: (
        <BarChart
          series={[
            { data: monthlyData.map(d => d.claims), label: 'Claims' }
          ]}
          xAxis={[{ scaleType: 'band', data: monthlyData.map(d => d.month) }]}
          height={250}
        />
      )
    },
    {
      type: 'line' as const,
      title: 'Enrollment Trends',
      content: (
        <LineChart
          series={[
            { data: monthlyData.map(d => d.enrollment), label: 'Members', curve: 'linear' }
          ]}
          xAxis={[{ scaleType: 'band', data: monthlyData.map(d => d.month) }]}
          height={250}
        />
      )
    },
    {
      type: 'pie' as const,
      title: 'Claims by Category',
      content: (
        <PieChart
          series={[
            {
              data: categoryData.map((item, index) => ({
                id: index,
                value: item.amount,
                label: item.category
              }))
            }
          ]}
          height={250}
        />
      )
    },
    {
      type: 'table' as const,
      title: 'Top Diagnoses',
      content: (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="right">Claims</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topDiagnoses.map((row) => (
                <TableRow key={row.code}>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">
                    ${row.cost.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{row.claims}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    {
      type: 'kpi' as const,
      title: 'Key Performance Indicators',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOnIcon color="primary" />
                <Typography variant="h4">$5.65M</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Claims
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h4">92%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Loss Ratio
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )
    },
    {
      type: 'bar' as const,
      title: 'Monthly Fees vs Claims',
      content: (
        <BarChart
          series={[
            { data: monthlyData.map(d => d.claims), label: 'Claims', color: '#f44336' },
            { data: monthlyData.map(d => d.fees), label: 'Fees', color: '#4caf50' }
          ]}
          xAxis={[{ scaleType: 'band', data: monthlyData.map(d => d.month) }]}
          height={250}
        />
      )
    }
  ];

  // Initial layout with a few default charts
  const initialCharts: ChartConfig[] = [
    {
      id: 'chart-1',
      type: 'kpi',
      title: 'Key Performance Indicators',
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      content: availableCharts[4].content
    },
    {
      id: 'chart-2',
      type: 'bar',
      title: 'Monthly Claims Trend',
      x: 4,
      y: 0,
      w: 8,
      h: 4,
      content: availableCharts[0].content
    },
    {
      id: 'chart-3',
      type: 'pie',
      title: 'Claims by Category',
      x: 0,
      y: 4,
      w: 6,
      h: 4,
      content: availableCharts[2].content
    },
    {
      id: 'chart-4',
      type: 'line',
      title: 'Enrollment Trends',
      x: 6,
      y: 4,
      w: 6,
      h: 4,
      content: availableCharts[1].content
    }
  ];

  const handleLayoutChange = (charts: ChartConfig[]) => {
    setSavedLayouts(charts);
    console.log('Layout changed:', charts);
  };

  return (
    <ClientOnly>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/dashboard/analytics"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Analytics
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Interactive Dashboard Builder
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Drag, drop, resize, add and remove charts like Tableau
              </Typography>
            </Box>
            <Chip
              label="Tableau-Style"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            How to use:
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Drag:</strong> Click and hold the chart header to move charts around
            <br />
            • <strong>Resize:</strong> Drag the bottom-right corner of any chart to resize
            <br />
            • <strong>Add:</strong> Click &quot;Add Chart&quot; button to add new visualizations
            <br />
            • <strong>Remove:</strong> Hover over a chart and click the X button to remove
          </Typography>
        </Alert>

        <DraggableChartGrid
          initialCharts={initialCharts}
          availableCharts={availableCharts}
          onLayoutChange={handleLayoutChange}
        />
      </Container>
    </ClientOnly>
  );
}
