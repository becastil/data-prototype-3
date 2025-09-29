'use client';

import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  BarChart, 
  PieChart 
} from '@mui/x-charts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface DashboardData {
  kpis: {
    totalClaims: number;
    totalCost: number;
    avgLossRatio: number;
    avgClaim: number;
    totalMembers: number;
    avgPMPM: number;
  };
  monthlyData: Array<{
    month: string;
    claims: number;
    fees: number;
    lossRatio: number;
    enrollment: number;
    pmpm: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topDiagnoses: Array<{
    code: string;
    description: string;
    totalCost: number;
    claimCount: number;
    memberCount: number;
  }>;
  highCostMembers: Array<{
    memberId: string;
    totalCost: number;
    riskScore: number;
    primaryDiagnosis: string;
  }>;
}

interface AnalyticsDashboardProps {
  data: DashboardData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Colors for charts
  const COLORS = [
    '#1976d2', '#2e7d32', '#ff6f00', '#7b1fa2', 
    '#d32f2f', '#00796b', '#f57c00', '#5d4037'
  ];

  const KPICard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    trendValue, 
    color = 'primary' 
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    color?: 'primary' | 'success' | 'warning' | 'error';
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon}
          <Typography color="textSecondary" variant="overline" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={`${color}.main`} gutterBottom>
          {value}
        </Typography>
        {trend && trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend === 'up' && <TrendingUpIcon color="success" fontSize="small" />}
            {trend === 'down' && <TrendingDownIcon color="error" fontSize="small" />}
            {trend === 'stable' && <CheckCircleIcon color="info" fontSize="small" />}
            <Typography 
              variant="body2" 
              color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'info.main'}
              sx={{ ml: 0.5 }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {/* KPI Cards Row 1 */}
      <Grid item xs={12} sm={6} md={4}>
        <KPICard
          title="Total Claims"
          value={formatCurrency(data.kpis.totalClaims)}
          icon={<LocalHospitalIcon color="primary" />}
          trend="up"
          trendValue="+5.2% YoY"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <KPICard
          title="Total Cost"
          value={formatCurrency(data.kpis.totalCost)}
          icon={<TrendingUpIcon color="primary" />}
          trend="up"
          trendValue="+3.8% YoY"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <KPICard
          title="Average Loss Ratio"
          value={formatPercentage(data.kpis.avgLossRatio)}
          icon={<WarningIcon color={data.kpis.avgLossRatio > 1 ? 'error' : 'warning'} />}
          trend={data.kpis.avgLossRatio > 0.95 ? 'up' : 'down'}
          trendValue={data.kpis.avgLossRatio > 0.95 ? 'Above Target' : 'Within Target'}
          color={data.kpis.avgLossRatio > 1 ? 'error' : data.kpis.avgLossRatio > 0.85 ? 'warning' : 'success'}
        />
      </Grid>

      {/* KPI Cards Row 2 */}
      <Grid item xs={12} sm={6} md={4}>
        <KPICard
          title="Average Claim"
          value={formatCurrency(data.kpis.avgClaim)}
          icon={<LocalHospitalIcon color="primary" />}
          trend="up"
          trendValue="+2.1%"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <KPICard
          title="Total Members"
          value={data.kpis.totalMembers.toLocaleString()}
          icon={<PersonIcon color="primary" />}
          trend="up"
          trendValue="+3.4%"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <KPICard
          title="Average PMPM"
          value={formatCurrency(data.kpis.avgPMPM)}
          icon={<TrendingUpIcon color="primary" />}
          trend="up"
          trendValue="+4.7%"
        />
      </Grid>

      {/* Monthly Trend Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Claims & Loss Ratio Trend
            </Typography>
            <Box sx={{ width: '100%', height: 400 }}>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: data.monthlyData.map(d => d.month),
                }]}
                series={[
                  {
                    data: data.monthlyData.map(d => d.claims),
                    label: 'Claims',
                    color: '#1976d2',
                  },
                  {
                    data: data.monthlyData.map(d => d.fees),
                    label: 'Fees',
                    color: '#2e7d32',
                  },
                ]}
                height={350}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Category Breakdown Pie Chart */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category Breakdown
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <PieChart
                series={[
                  {
                    data: data.categoryBreakdown.map((item, index) => ({
                      id: index,
                      value: item.amount,
                      label: item.category,
                      color: COLORS[index % COLORS.length],
                    })),
                  },
                ]}
                height={250}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              {data.categoryBreakdown.slice(0, 4).map((category, index) => (
                <Box key={category.category} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: COLORS[index], 
                      mr: 1,
                      borderRadius: '50%'
                    }} 
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {category.category}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {category.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Diagnoses Table */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Diagnoses by Cost
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                    <TableCell align="right">Claims</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topDiagnoses.map((diagnosis) => (
                    <TableRow key={diagnosis.code}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {diagnosis.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {diagnosis.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(diagnosis.totalCost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {diagnosis.claimCount}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* High-Cost Members */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              High-Cost Members
            </Typography>
            <List dense>
              {data.highCostMembers.map((member) => (
                <ListItem key={member.memberId}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {member.memberId}
                        </Typography>
                        <Chip 
                          label={`Risk: ${member.riskScore}`}
                          size="small"
                          color={member.riskScore > 4 ? 'error' : member.riskScore > 3 ? 'warning' : 'default'}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {member.primaryDiagnosis}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatCurrency(member.totalCost)}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
