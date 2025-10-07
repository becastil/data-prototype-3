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

// Complete healthcare data from static dashboard
const dashboardData = {
  totalPlanPayment: 7280807,
  medicalPlanPayment: 5961818,
  rxPlanPayment: 1318990,

  monthlyCosts: [
    { month: "Apr", medical: 450000, rx: 95000, members: 1050 },
    { month: "May", medical: 620000, rx: 110000, members: 1045 },
    { month: "Jun", medical: 480000, rx: 102000, members: 1038 },
    { month: "Jul", medical: 410000, rx: 98000, members: 1025 },
    { month: "Aug", medical: 580000, rx: 115000, members: 1015 },
    { month: "Sep", medical: 320000, rx: 88000, members: 1008 },
    { month: "Oct", medical: 485000, rx: 105000, members: 998 },
    { month: "Nov", medical: 520000, rx: 112000, members: 985 },
    { month: "Dec", medical: 590000, rx: 118000, members: 972 },
    { month: "Jan", medical: 510000, rx: 108000, members: 958 },
    { month: "Feb", medical: 480000, rx: 102000, members: 945 },
    { month: "Mar", medical: 919000, rx: 122000, members: 938 }
  ],

  placeOfService: [
    { service: "Outpatient Procedures", amount: 2475000 },
    { service: "Hospital Stay (In-Patient)", amount: 1657000 },
    { service: "Drugs", amount: 1319000 },
    { service: "Immediate Medical Attention", amount: 714000 },
    { service: "Testing", amount: 443000 },
    { service: "Office/Clinic Visit", amount: 394000 },
    { service: "Substance Abuse", amount: 107000 },
    { service: "Mental Health", amount: 66000 },
  ],

  diagnosisByCost: [
    { code: "C02.1", description: "Malignant neoplasm of border of tongue", cost: 305000 },
    { code: "C04.9", description: "Malignant neoplasm of floor of mouth", cost: 235000 },
    { code: "I71.01", description: "Dissection of ascending aorta", cost: 208000 },
    { code: "A41.9", description: "Sepsis; unspecified organism", cost: 192000 },
    { code: "Z51.12", description: "Antineoplastic immunotherapy", cost: 184000 },
  ],

  diagnosisByUtilization: [
    { code: "Z00.00", description: "General adult medical exam", count: 2000 },
    { code: "I10", description: "Essential hypertension", count: 1000 },
    { code: "Z23", description: "Encounter for immunization", count: 1000 },
    { code: "E11.65", description: "Type 2 diabetes with hyperglycemia", count: 700 },
    { code: "G47.33", description: "Obstructive sleep apnea", count: 650 },
  ],

  medicalEpisodes: [
    { description: "Cancer of head and neck", cost: 699000 },
    { description: "Heart disease", cost: 509000 },
    { description: "Chemotherapy", cost: 322000 },
    { description: "Respiratory disease", cost: 286000 },
    { description: "Screening", cost: 276000 },
    { description: "Septicemia", cost: 256000 },
  ],

  drugClasses: [
    { class: "ANTIHYPERTENSIVES", scripts: 1149, planPayment: 4861.57 },
    { class: "ANTIDEPRESSANTS", scripts: 1070, planPayment: 14033.49 },
    { class: "ANTIHYPERLIPIDEMICS", scripts: 1020, planPayment: 21403.87 },
    { class: "ANTIDIABETICS", scripts: 994, planPayment: 493830.28 },
    { class: "ANTICONVULSANTS", scripts: 455, planPayment: 6731.89 },
  ],

  erCategories: [
    { category: "All Others", count: 1560 },
    { category: "Drug/Alcohol/Psych", count: 133 },
    { category: "Injury", count: 497 },
    { category: "Non Emergent", count: 1576 },
    { category: "PCP Treatable", count: 1464 }
  ],

  careCompliance: [
    { condition: "Hypertension", compliant: 180, nonCompliant: 65 },
    { condition: "Lipid Metabolism", compliant: 155, nonCompliant: 48 },
    { condition: "Depression", compliant: 142, nonCompliant: 38 },
    { condition: "Asthma", compliant: 95, nonCompliant: 22 },
    { condition: "Diabetes", compliant: 88, nonCompliant: 85 },
  ],

  preventiveScreenings: [
    { screening: "Preventive Care Visit", current: 94, prior: 92 },
    { screening: "Lipid Disorder Screening", current: 82, prior: 78 },
    { screening: "Diabetes Screening", current: 68, prior: 65 },
    { screening: "Colorectal Cancer", current: 58, prior: 52 },
    { screening: "Breast Cancer", current: 68, prior: 62 },
  ],

  topClaimants: [
    { id: "M5678871894251147653", medical: 551798, rx: 1648, total: 553446 },
    { id: "M8435355375567843488", medical: 504829, rx: 915, total: 505743 },
    { id: "M4813695712490826471", medical: 410633, rx: 4664, total: 415298 },
    { id: "M6139352970344454162", medical: 235695, rx: 193, total: 235888 },
  ]
};

export default function InteractiveDashboard() {
  const [, setSavedLayouts] = useState<ChartConfig[]>([]);

  // Available charts that users can add - ALL charts from static dashboard
  const availableCharts = [
    // 1. Financial KPIs
    {
      type: 'kpi' as const,
      title: 'Financial KPIs',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="outlined" sx={{ bgcolor: '#1e40af', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOnIcon />
                <Typography variant="h4">${(dashboardData.totalPlanPayment / 1000000).toFixed(2)}M</Typography>
              </Box>
              <Typography variant="body2">Total Plan Payment</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ bgcolor: '#2563eb', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                <Typography variant="h4">${(dashboardData.medicalPlanPayment / 1000000).toFixed(2)}M</Typography>
              </Box>
              <Typography variant="body2">Medical Payment</Typography>
            </CardContent>
          </Card>
        </Box>
      )
    },
    // 2. Monthly Cost Summary (Line Chart)
    {
      type: 'line' as const,
      title: 'Monthly Cost Summary',
      content: (
        <LineChart
          series={[
            { data: dashboardData.monthlyCosts.map(d => d.medical), label: 'Medical', color: '#1e40af', area: true },
            { data: dashboardData.monthlyCosts.map(d => d.rx), label: 'RX', color: '#f59e0b', area: true }
          ]}
          xAxis={[{ scaleType: 'band', data: dashboardData.monthlyCosts.map(d => d.month) }]}
          height={250}
        />
      )
    },
    // 3. Enrollment Trend
    {
      type: 'line' as const,
      title: 'Member Enrollment Trend',
      content: (
        <LineChart
          series={[
            { data: dashboardData.monthlyCosts.map(d => d.members), label: 'Members', curve: 'linear', color: '#16a34a' }
          ]}
          xAxis={[{ scaleType: 'band', data: dashboardData.monthlyCosts.map(d => d.month) }]}
          height={250}
        />
      )
    },
    // 4. Place of Service (Bar Chart)
    {
      type: 'bar' as const,
      title: 'Place of Service',
      content: (
        <BarChart
          yAxis={[{ scaleType: 'band', data: dashboardData.placeOfService.map(s => s.service) }]}
          series={[{ data: dashboardData.placeOfService.map(s => s.amount), color: '#1e40af' }]}
          layout="horizontal"
          height={250}
        />
      )
    },
    // 5. Diagnosis by Cost (Pie Chart)
    {
      type: 'pie' as const,
      title: 'Top Diagnoses by Cost',
      content: (
        <PieChart
          series={[{
            data: dashboardData.diagnosisByCost.map((item, index) => ({
              id: index,
              value: item.cost,
              label: item.code
            }))
          }]}
          height={250}
        />
      )
    },
    // 6. Diagnosis by Cost (Table)
    {
      type: 'table' as const,
      title: 'Top Diagnoses by Cost (Table)',
      content: (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.diagnosisByCost.map((row) => (
                <TableRow key={row.code}>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">${row.cost.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    // 7. Diagnosis by Utilization (Table)
    {
      type: 'table' as const,
      title: 'Top Diagnoses by Utilization',
      content: (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.diagnosisByUtilization.map((row) => (
                <TableRow key={row.code}>
                  <TableCell>{row.code}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">{row.count.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    // 8. Medical Episodes (Bar Chart)
    {
      type: 'bar' as const,
      title: 'Top Medical Episodes',
      content: (
        <BarChart
          xAxis={[{ scaleType: 'band', data: dashboardData.medicalEpisodes.map(e => e.description) }]}
          series={[{ data: dashboardData.medicalEpisodes.map(e => e.cost), color: '#1e40af' }]}
          height={250}
        />
      )
    },
    // 9. Drug Classes (Table)
    {
      type: 'table' as const,
      title: 'Top Drug Classes',
      content: (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Drug Class</TableCell>
                <TableCell align="right">Scripts</TableCell>
                <TableCell align="right">Plan Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.drugClasses.map((row) => (
                <TableRow key={row.class}>
                  <TableCell>{row.class}</TableCell>
                  <TableCell align="right">{row.scripts.toLocaleString()}</TableCell>
                  <TableCell align="right">${row.planPayment.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    // 10. ER Categories (Bar Chart)
    {
      type: 'bar' as const,
      title: 'Emergency Room Categories',
      content: (
        <BarChart
          xAxis={[{ scaleType: 'band', data: dashboardData.erCategories.map(c => c.category) }]}
          series={[{ data: dashboardData.erCategories.map(c => c.count), color: '#dc2626' }]}
          height={250}
        />
      )
    },
    // 11. Care Compliance (Stacked Bar)
    {
      type: 'bar' as const,
      title: 'Chronic Condition Care Compliance',
      content: (
        <BarChart
          xAxis={[{ scaleType: 'band', data: dashboardData.careCompliance.map(c => c.condition) }]}
          series={[
            { data: dashboardData.careCompliance.map(c => c.nonCompliant), label: 'Non-Compliant', color: '#dc2626', stack: 'total' },
            { data: dashboardData.careCompliance.map(c => c.compliant), label: 'Compliant', color: '#16a34a', stack: 'total' }
          ]}
          height={250}
        />
      )
    },
    // 12. Preventive Screenings (Table)
    {
      type: 'table' as const,
      title: 'Preventive Screenings YoY',
      content: (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Screening</TableCell>
                <TableCell align="right">Current %</TableCell>
                <TableCell align="right">Prior %</TableCell>
                <TableCell align="right">Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.preventiveScreenings.map((row) => (
                <TableRow key={row.screening}>
                  <TableCell>{row.screening}</TableCell>
                  <TableCell align="right">{row.current}%</TableCell>
                  <TableCell align="right">{row.prior}%</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${row.current - row.prior > 0 ? '+' : ''}${row.current - row.prior}%`}
                      color={row.current - row.prior > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    // 13. Top Claimants (Table)
    {
      type: 'table' as const,
      title: 'Top High-Cost Claimants',
      content: (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Member ID</TableCell>
                <TableCell align="right">Medical</TableCell>
                <TableCell align="right">RX</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.topClaimants.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.id}</TableCell>
                  <TableCell align="right">${row.medical.toLocaleString()}</TableCell>
                  <TableCell align="right">${row.rx.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <strong>${row.total.toLocaleString()}</strong>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    },
    // 14. Monthly Medical vs RX (Bar Chart)
    {
      type: 'bar' as const,
      title: 'Monthly Medical vs RX Payment',
      content: (
        <BarChart
          xAxis={[{ scaleType: 'band', data: dashboardData.monthlyCosts.map(d => d.month) }]}
          series={[
            { data: dashboardData.monthlyCosts.map(d => d.medical), label: 'Medical', color: '#1e40af' },
            { data: dashboardData.monthlyCosts.map(d => d.rx), label: 'RX', color: '#f59e0b' }
          ]}
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
      title: 'Financial KPIs',
      x: 0,
      y: 0,
      w: 3,
      h: 4,
      content: availableCharts[0].content
    },
    {
      id: 'chart-2',
      type: 'line',
      title: 'Monthly Cost Summary',
      x: 3,
      y: 0,
      w: 9,
      h: 4,
      content: availableCharts[1].content
    },
    {
      id: 'chart-3',
      type: 'bar',
      title: 'Place of Service',
      x: 0,
      y: 4,
      w: 6,
      h: 4,
      content: availableCharts[3].content
    },
    {
      id: 'chart-4',
      type: 'pie',
      title: 'Top Diagnoses by Cost',
      x: 6,
      y: 4,
      w: 6,
      h: 4,
      content: availableCharts[4].content
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
            📊 14 Chart Types Available | How to use:
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Drag:</strong> Click and hold the chart header to move charts around
            <br />
            • <strong>Resize:</strong> Drag the bottom-right corner of any chart to resize
            <br />
            • <strong>Add:</strong> Click &quot;Add Chart&quot; button to choose from 14 visualization types
            <br />
            • <strong>Remove:</strong> Hover over a chart and click the X button to remove
            <br />
            • <strong>Charts:</strong> KPIs, Line Charts, Bar Charts, Pie Charts, Tables (Cost, Utilization, Drug Classes, Claimants, Preventive Screenings, ER, Care Compliance)
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
