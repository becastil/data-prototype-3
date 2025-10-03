'use client';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Chip,
  Divider
} from '@mui/material';
import {
  BarChart,
  LineChart,
  PieChart
} from '@mui/x-charts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MedicationIcon from '@mui/icons-material/Medication';
import BudgetVsActualsChart from '@/components/charts/BudgetVsActualsChart';
import { useBudgetData } from '@/hooks/useBudgetData';

// Static dummy data based on the PDF
const dashboardData = {
  planPeriod: "4/1/2024 - 3/31/2025",
  clientName: "Client Name",

  // Financial Overview
  totalPlanPayment: 7280807,
  medicalPlanPayment: 5961818,
  rxPlanPayment: 1318990,

  // Executive Summary Metrics
  highestCostMonth: { month: "March", amount: 919000, drivers: ["Sepsis", "Malignant neoplasm of tongue", "Immunotherapy"] },
  finalEnrollment: 938,
  topClaimant: { id: "E", diagnosis: "Malignant neoplasm of border of tongue", totalCost: 553446 },

  // Member Distribution
  memberDistribution: [
    { range: "<$25K", claimantsPercent: 94, paymentsPercent: 29 },
    { range: "$25K-$49.9K", claimantsPercent: 2, paymentsPercent: 9 },
    { range: "$50K-$99.9K", claimantsPercent: 2, paymentsPercent: 19 },
    { range: ">$100K", claimantsPercent: 2, paymentsPercent: 43 }
  ],

  // Top 10 Claimants
  topClaimants: [
    { id: "M5678871894251147653", medical: 551798, rx: 1648, total: 553446, prediction: ">$250,000" },
    { id: "M8435355375567843488", medical: 504829, rx: 915, total: 505743, prediction: ">$250,000" },
    { id: "M4813695712490826471", medical: 410633, rx: 4664, total: 415298, prediction: ">$250,000" },
    { id: "M6139352970344454162", medical: 235695, rx: 193, total: 235888, prediction: ">$250,000" },
    { id: "M5248554363948063967", medical: 207531, rx: 0, total: 207531, prediction: ">$250,000" },
    { id: "M6772666479264936838", medical: 166858, rx: 14981, total: 181838, prediction: "" },
    { id: "M7011485725588150948", medical: 162618, rx: 9482, total: 172100, prediction: ">$250,000" },
    { id: "M8172948208185798260", medical: 156938, rx: 911, total: 157849, prediction: "" },
    { id: "M6759092276395757917", medical: 125886, rx: 11340, total: 137225, prediction: ">$250,000" },
    { id: "M8184197057812746184", medical: 134632, rx: 0, total: 134632, prediction: ">$250,000" }
  ],

  // Monthly Cost Summary
  monthlyCosts: [
    { month: "April", medical: 450000, rx: 95000, members: 1050 },
    { month: "May", medical: 620000, rx: 110000, members: 1045 },
    { month: "June", medical: 480000, rx: 102000, members: 1038 },
    { month: "July", medical: 410000, rx: 98000, members: 1025 },
    { month: "August", medical: 580000, rx: 115000, members: 1015 },
    { month: "September", medical: 320000, rx: 88000, members: 1008 },
    { month: "October", medical: 485000, rx: 105000, members: 998 },
    { month: "November", medical: 520000, rx: 112000, members: 985 },
    { month: "December", medical: 590000, rx: 118000, members: 972 },
    { month: "January", medical: 510000, rx: 108000, members: 958 },
    { month: "February", medical: 480000, rx: 102000, members: 945 },
    { month: "March", medical: 919000, rx: 122000, members: 938 }
  ],

  // Place of Service
  placeOfService: [
    { service: "Outpatient Procedures", amount: 2475000 },
    { service: "Hospital Stay (In-Patient)", amount: 1657000 },
    { service: "Drugs", amount: 1319000 },
    { service: "Immediate Medical Attention", amount: 714000 },
    { service: "Testing", amount: 443000 },
    { service: "Office/Clinic Visit", amount: 394000 },
    { service: "Substance Abuse", amount: 107000 },
    { service: "Mental Health", amount: 66000 },
    { service: "Pregnancy", amount: 43000 },
    { service: "Recovery", amount: 39000 }
  ],

  // Top 10 Diagnosis by Cost
  diagnosisByCost: [
    { code: "C02.1", description: "Malignant neoplasm of border of tongue", cost: 305000, percent: 17.02 },
    { code: "C04.9", description: "Malignant neoplasm of floor of mouth", cost: 235000, percent: 13.11 },
    { code: "I71.01", description: "Dissection of ascending aorta", cost: 208000, percent: 11.58 },
    { code: "A41.9", description: "Sepsis; unspecified organism", cost: 192000, percent: 10.70 },
    { code: "Z51.12", description: "Encounter for antineoplastic immunotherapy", cost: 184000, percent: 10.25 },
    { code: "J96.01", description: "Acute respiratory failure with hypoxia", cost: 164000, percent: 9.12 },
    { code: "I42.2", description: "Other hypertrophic cardiomyopathy", cost: 135000, percent: 7.54 },
    { code: "Z12.39", description: "Encounter for screening for malignant neoplasm", cost: 129000, percent: 7.19 },
    { code: "C34.11", description: "Malignant neoplasm of upper lobe, right bronchus", cost: 124000, percent: 6.90 },
    { code: "I47.1", description: "Other supraventricular tachycardia", cost: 118000, percent: 6.60 }
  ],

  // Top 10 Diagnosis by Utilization
  diagnosisByUtilization: [
    { code: "Z00.00", description: "Encounter for general adult medical exam", count: 2000, percent: 29.87 },
    { code: "I10", description: "Essential (primary) hypertension", count: 1000, percent: 12.60 },
    { code: "Z23", description: "Encounter for immunization", count: 1000, percent: 11.45 },
    { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycemia", count: 700, percent: 7.13 },
    { code: "G47.33", description: "Obstructive sleep apnea (adult)", count: 650, percent: 6.94 },
    { code: "Z51.11", description: "Encounter for antineoplastic chemotherapy", count: 640, percent: 6.88 },
    { code: "Z12.11", description: "Encounter for screening for malignant neoplasm of colon", count: 600, percent: 6.40 },
    { code: "E11.9", description: "Type 2 diabetes mellitus without complications", count: 590, percent: 6.34 },
    { code: "A41.9", description: "Sepsis; unspecified organism", count: 580, percent: 6.20 },
    { code: "Z00.129", description: "Encounter for routine child health exam", count: 575, percent: 6.18 }
  ],

  // Medical Episodes
  medicalEpisodes: [
    { description: "Cancer of head and neck", cost: 699000, percent: 22.84 },
    { description: "Heart disease", cost: 509000, percent: 16.63 },
    { description: "Chemotherapy", cost: 322000, percent: 10.52 },
    { description: "Respiratory disease", cost: 286000, percent: 9.34 },
    { description: "Screening", cost: 276000, percent: 9.02 },
    { description: "Septicemia", cost: 256000, percent: 8.35 },
    { description: "Vascular disorder", cost: 218000, percent: 7.11 },
    { description: "Back pain", cost: 176000, percent: 5.76 },
    { description: "Cancer of respiratory system", cost: 161000, percent: 5.25 },
    { description: "Medical examination", cost: 159000, percent: 5.19 }
  ],

  // Drug Classes
  drugClasses: [
    { class: "ANTIHYPERTENSIVES", scripts: 1149, patientCost: 8640.91, planPayment: 4861.57 },
    { class: "ANTIDEPRESSANTS", scripts: 1070, patientCost: 10087.33, planPayment: 14033.49 },
    { class: "ANTIHYPERLIPIDEMICS", scripts: 1020, patientCost: 6649.62, planPayment: 21403.87 },
    { class: "ANTIDIABETICS", scripts: 994, patientCost: 45263.73, planPayment: 493830.28 },
    { class: "ANTICONVULSANTS", scripts: 455, patientCost: 4030.47, planPayment: 6731.89 },
    { class: "BETA BLOCKERS", scripts: 429, patientCost: 2830.35, planPayment: 2360.70 },
    { class: "ANTIASTHMATIC AND BRONCHODILATOR AGENTS", scripts: 416, patientCost: 15734.49, planPayment: 54036.36 },
    { class: "CALCIUM CHANNEL BLOCKERS", scripts: 365, patientCost: 3036.57, planPayment: 695.97 },
    { class: "ANALGESICS - OPIOID", scripts: 364, patientCost: 2402.46, planPayment: 16635.95 },
    { class: "ADHD/ANTI-NARCOLEPSY/ANTI-OBESITY/ANOREXIANTS", scripts: 352, patientCost: 5281.00, planPayment: 23302.30 }
  ],

  // ER Data
  erCategories: [
    { category: "ER All Others", count: 1560 },
    { category: "ER Drug Alcohol Psych", count: 133 },
    { category: "ER Injury", count: 497 },
    { category: "ER Non Emergent, Avoidable", count: 1576 },
    { category: "ER PCP Treatable", count: 1464 }
  ],

  erTopDiagnosis: [
    { diagnosis: "Chest pain; unspecified", count: 117 },
    { diagnosis: "Neutropenia; unspecified", count: 104 },
    { diagnosis: "Hydronephrosis with renal and ureteral calculous", count: 101 },
    { diagnosis: "Other chest pain", count: 101 },
    { diagnosis: "Atherosclerotic heart disease", count: 98 }
  ],

  // Care Compliance (Chronic Conditions)
  careCompliance: [
    { condition: "Hypertension", compliant: 180, nonCompliant: 65, avgPMPY: 12000 },
    { condition: "Lipid Metabolism", compliant: 155, nonCompliant: 48, avgPMPY: 15000 },
    { condition: "Depression", compliant: 142, nonCompliant: 38, avgPMPY: 18000 },
    { condition: "Asthma", compliant: 95, nonCompliant: 22, avgPMPY: 14000 },
    { condition: "Diabetes", compliant: 88, nonCompliant: 85, avgPMPY: 20000 },
    { condition: "Hypothyroidism", compliant: 72, nonCompliant: 15, avgPMPY: 8000 },
    { condition: "Ischemic Heart Disease", compliant: 45, nonCompliant: 28, avgPMPY: 39000 }
  ],

  // Preventive Screenings
  preventiveScreenings: [
    { screening: "Preventive Care Visit", priorMembers: 1100, currentMembers: 1050, priorParticipation: 92, currentParticipation: 94 },
    { screening: "Lipid Disorder Screening", priorMembers: 650, currentMembers: 580, priorParticipation: 78, currentParticipation: 82 },
    { screening: "Diabetes Screening", priorMembers: 550, currentMembers: 520, priorParticipation: 65, currentParticipation: 68 },
    { screening: "Colorectal Cancer Screening", priorMembers: 480, currentMembers: 450, priorParticipation: 52, currentParticipation: 58 },
    { screening: "Cervical Cancer Screening", priorMembers: 320, currentMembers: 285, priorParticipation: 48, currentParticipation: 45 },
    { screening: "Breast Cancer Screening", priorMembers: 280, currentMembers: 265, priorParticipation: 62, currentParticipation: 68 }
  ]
};

export function ComprehensiveAnalyticsDashboard() {
  // Get budget data
  const budgetData = useBudgetData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Chart colors
  const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1d4ed8', '#2563eb'];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Plan Info */}
      <Card sx={{ mb: 3, bgcolor: '#1e3a8a', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              {dashboardData.clientName} - Healthcare Analytics Dashboard
            </Typography>
            <Typography variant="subtitle1">
              Plan Paid Period: {dashboardData.planPeriod}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon /> Executive Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    • March saw the highest medical plan cost (<strong>{formatCurrency(dashboardData.highestCostMonth.amount)}</strong>) due to sepsis, malignant neoplasm of tongue, and immunotherapy. Enrollment decreased over the year, ending with <strong>{dashboardData.finalEnrollment} members</strong>.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    • Highest cost claimant ({dashboardData.topClaimant.id}), top diagnosis for {dashboardData.topClaimant.diagnosis}. Of the top 14 claimants, four members have termed. Of the 10 remaining large claimants, four are expecting significant ongoing spend in excess of $100K.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>6% of membership</strong> accounting for <strong>71% of total claims</strong>. 94% of members accounting for remaining 29%. <strong>2% of membership</strong> with claims in excess of $100K, accounting for <strong>43% of total plan spend</strong>.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    • Outpatient accounted for <strong>34% of total plan spend</strong> ($2.5M). Malignancies are the primary driver. Hospitalization accounted for 23% of plan spend at $1.6M with infectious disease being the primary cost driver.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon /> Actionable Insights
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="error" sx={{ py: 0.5 }}>
                  <AlertTitle sx={{ fontSize: '0.875rem', mb: 0.5 }}>Cancer Costs - 18% of Total Spend</AlertTitle>
                  <Typography variant="caption">
                    Cancer of head and neck account for 23% of top episodes. Promote supplemental cancer benefits or consider programs like Cancer Guardian.
                  </Typography>
                </Alert>
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  <AlertTitle sx={{ fontSize: '0.875rem', mb: 0.5 }}>Heart Disease - 17% of Top Episodes</AlertTitle>
                  <Typography variant="caption">
                    Hypertension most prevalent chronic condition. Incentivize programming for heart health (e.g., 100% coverage for maintenance meds).
                  </Typography>
                </Alert>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  <AlertTitle sx={{ fontSize: '0.875rem', mb: 0.5 }}>Mental Health</AlertTitle>
                  <Typography variant="caption">
                    Depression is 3rd prevalent chronic condition. Consider tele-behavioral health and digital mental health tools.
                  </Typography>
                </Alert>
                <Alert severity="success" sx={{ py: 0.5 }}>
                  <AlertTitle sx={{ fontSize: '0.875rem', mb: 0.5 }}>Preventive Care</AlertTitle>
                  <Typography variant="caption">
                    Participation remains &gt;45% in all categories. Continue to promote/incentivize screenings with reminder campaigns.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Financial Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#1e40af', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOnIcon sx={{ mr: 1 }} />
                <Typography variant="overline">Plan Payment</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(dashboardData.totalPlanPayment)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#2563eb', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalHospitalIcon sx={{ mr: 1 }} />
                <Typography variant="overline">Medical Plan Payment</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(dashboardData.medicalPlanPayment)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#3b82f6', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MedicationIcon sx={{ mr: 1 }} />
                <Typography variant="overline">RX Plan Payment</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(dashboardData.rxPlanPayment)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Cost Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Monthly Cost Summary
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <LineChart
                  xAxis={[{
                    scaleType: 'point',
                    data: dashboardData.monthlyCosts.map(d => d.month),
                  }]}
                  series={[
                    {
                      data: dashboardData.monthlyCosts.map(d => d.medical),
                      label: 'Medical Plan Payment',
                      color: '#1e40af',
                      area: true,
                    },
                    {
                      data: dashboardData.monthlyCosts.map(d => d.rx),
                      label: 'RX Plan Payment',
                      color: '#f59e0b',
                      area: true,
                    },
                  ]}
                  height={350}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Member Distribution
              </Typography>
              <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {dashboardData.memberDistribution.map((dist) => (
                  <Box key={dist.range} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">{dist.range}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dist.claimantsPercent}% / {dist.paymentsPercent}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Box sx={{
                        flex: 1,
                        height: 24,
                        bgcolor: '#93c5fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 0.5
                      }}>
                        <Typography variant="caption" fontWeight="medium">{dist.claimantsPercent}%</Typography>
                      </Box>
                      <Box sx={{
                        flex: 1,
                        height: 24,
                        bgcolor: '#1e40af',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 0.5
                      }}>
                        <Typography variant="caption" fontWeight="medium">{dist.paymentsPercent}%</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#93c5fd', borderRadius: 0.5 }} />
                    <Typography variant="caption">Claimants</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#1e40af', borderRadius: 0.5 }} />
                    <Typography variant="caption">Payments</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget vs Actuals Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <BudgetVsActualsChart
            data={budgetData}
            title="Budget vs Actuals - Monthly Comparison"
            height={400}
          />
        </Grid>
      </Grid>

      {/* Top Claimants Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Top 10 High-Cost Claimants
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell><strong>Member ID</strong></TableCell>
                  <TableCell align="right"><strong>Medical Payment</strong></TableCell>
                  <TableCell align="right"><strong>RX Payment</strong></TableCell>
                  <TableCell align="right"><strong>Plan Payment</strong></TableCell>
                  <TableCell><strong>Predicted Cost Range</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.topClaimants.map((claimant) => (
                  <TableRow key={claimant.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">{claimant.id}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(claimant.medical)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(claimant.rx)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(claimant.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {claimant.prediction && (
                        <Chip label={claimant.prediction} size="small" color="error" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Place of Service & Diagnosis Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Place of Service
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <BarChart
                  yAxis={[{
                    scaleType: 'band',
                    data: dashboardData.placeOfService.map(s => s.service),
                  }]}
                  series={[{
                    data: dashboardData.placeOfService.map(s => s.amount),
                    color: '#1e40af',
                  }]}
                  layout="horizontal"
                  height={380}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top 10 Diagnosis by Cost
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <PieChart
                  series={[{
                    data: dashboardData.diagnosisByCost.map((item, index) => ({
                      id: index,
                      value: item.cost,
                      label: item.code,
                      color: COLORS[index % COLORS.length],
                    })),
                    highlightScope: { faded: 'global', highlighted: 'item' },
                  }]}
                  height={380}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diagnosis Tables */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top 10 Diagnosis by Cost
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                      <TableCell><strong>Code</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell align="right"><strong>Cost</strong></TableCell>
                      <TableCell align="right"><strong>%</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.diagnosisByCost.map((diag) => (
                      <TableRow key={diag.code}>
                        <TableCell><Typography variant="body2" fontWeight="medium">{diag.code}</Typography></TableCell>
                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{diag.description}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{formatCurrency(diag.cost)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{diag.percent.toFixed(2)}%</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top 10 Diagnosis by Utilization
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                      <TableCell><strong>Code</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell align="right"><strong>Count</strong></TableCell>
                      <TableCell align="right"><strong>%</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.diagnosisByUtilization.map((diag) => (
                      <TableRow key={diag.code}>
                        <TableCell><Typography variant="body2" fontWeight="medium">{diag.code}</Typography></TableCell>
                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{diag.description}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{formatNumber(diag.count)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{diag.percent.toFixed(2)}%</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Medical Episodes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Top 10 Medical Episodes by Plan Payment
          </Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: dashboardData.medicalEpisodes.map(e => e.description),
              }]}
              series={[{
                data: dashboardData.medicalEpisodes.map(e => e.cost),
                color: '#1e40af',
              }]}
              height={380}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Drug Classes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Top Drug Classes by Utilization
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell><strong>Drug Class</strong></TableCell>
                  <TableCell align="right"><strong>Scripts</strong></TableCell>
                  <TableCell align="right"><strong>Patient Cost</strong></TableCell>
                  <TableCell align="right"><strong>Plan Payment</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.drugClasses.map((drug) => (
                  <TableRow key={drug.class}>
                    <TableCell><Typography variant="body2">{drug.class}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2">{formatNumber(drug.scripts)}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2">{formatCurrency(drug.patientCost)}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" fontWeight="bold">{formatCurrency(drug.planPayment)}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ER Utilization & Care Compliance */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Emergency Room Category
              </Typography>
              <Box sx={{ width: '100%', height: 350 }}>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: dashboardData.erCategories.map(c => c.category.replace('ER ', '')),
                  }]}
                  series={[{
                    data: dashboardData.erCategories.map(c => c.count),
                    color: '#dc2626',
                  }]}
                  height={330}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ER Visits - Top 5 Diagnosis
              </Typography>
              <Box sx={{ mt: 2 }}>
                {dashboardData.erTopDiagnosis.map((diag, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{diag.diagnosis}</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error">{diag.count}</Typography>
                    </Box>
                    <Box sx={{
                      width: `${(diag.count / 117) * 100}%`,
                      height: 8,
                      bgcolor: '#dc2626',
                      borderRadius: 1
                    }} />
                  </Box>
                ))}
              </Box>
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="caption">
                  <strong>30%</strong> of ER services are considered non-emergent/avoidable
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Care Compliance */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Chronic Condition Care Compliance
          </Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: dashboardData.careCompliance.map(c => c.condition),
              }]}
              series={[
                {
                  data: dashboardData.careCompliance.map(c => c.nonCompliant),
                  label: 'Non-Compliant',
                  color: '#dc2626',
                  stack: 'total',
                },
                {
                  data: dashboardData.careCompliance.map(c => c.compliant),
                  label: 'Compliant',
                  color: '#16a34a',
                  stack: 'total',
                },
              ]}
              height={380}
            />
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Ischemic heart disease</strong> is most costly with a PMPY of $39K. <strong>Diabetes</strong> has the next highest PMPY at $20K and the <strong>lowest care compliance rate of 51%</strong>.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Preventive Screenings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Adult Preventive Screenings - Year over Year Comparison
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell><strong>Screening</strong></TableCell>
                  <TableCell align="right"><strong>Prior Year Members</strong></TableCell>
                  <TableCell align="right"><strong>Current Members</strong></TableCell>
                  <TableCell align="right"><strong>Prior Participation</strong></TableCell>
                  <TableCell align="right"><strong>Current Participation</strong></TableCell>
                  <TableCell align="center"><strong>Trend</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.preventiveScreenings.map((screening) => {
                  const participationChange = screening.currentParticipation - screening.priorParticipation;
                  const isPositive = participationChange > 0;

                  return (
                    <TableRow key={screening.screening}>
                      <TableCell><Typography variant="body2">{screening.screening}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2">{formatNumber(screening.priorMembers)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2">{formatNumber(screening.currentMembers)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2">{screening.priorParticipation}%</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight="bold">{screening.currentParticipation}%</Typography></TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isPositive ? (
                            <TrendingUpIcon color="success" fontSize="small" />
                          ) : (
                            <TrendingDownIcon color="error" fontSize="small" />
                          )}
                          <Typography
                            variant="caption"
                            color={isPositive ? 'success.main' : 'error.main'}
                            sx={{ ml: 0.5 }}
                          >
                            {participationChange > 0 ? '+' : ''}{participationChange}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Adult screening participation increased in all categories YoY, except for cervical cancer screenings. However, eligible membership decreased YoY in all categories. All categories remain &gt;45% participation.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Footer Summary */}
      <Card sx={{ bgcolor: '#f3f4f6' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Dashboard generated with static dummy data based on healthcare analytics report template.
            All data is for demonstration purposes only.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
