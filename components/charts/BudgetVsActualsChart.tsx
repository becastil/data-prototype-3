'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { ResponsiveChartContainer, BarPlot, LinePlot, ChartsXAxis, ChartsYAxis, ChartsTooltip, ChartsLegend, ChartsGrid } from '@mui/x-charts';
import { BarSeriesType, LineSeriesType } from '@mui/x-charts/models';

interface BudgetDataPoint {
  period: string;
  claims: number;
  fixedCosts: number;
  budget: number;
}

interface BudgetVsActualsChartProps {
  data: BudgetDataPoint[];
  title?: string;
  height?: number;
  claimsColor?: string;
  fixedCostsColor?: string;
  budgetColor?: string;
}

export default function BudgetVsActualsChart({
  data,
  title = 'Budget vs Actuals',
  height = 400,
  claimsColor,
  fixedCostsColor,
  budgetColor
}: BudgetVsActualsChartProps) {
  const theme = useTheme();

  // Use theme colors if not provided
  const defaultClaimsColor = claimsColor || theme.palette.primary.main;
  const defaultFixedCostsColor = fixedCostsColor || theme.palette.warning.main;
  const defaultBudgetColor = budgetColor || theme.palette.error.main;

  // Extract data arrays
  const periods = data.map(d => d.period);
  const claims = data.map(d => d.claims);
  const fixedCosts = data.map(d => d.fixedCosts);
  const budget = data.map(d => d.budget);

  // Format currency for tooltips
  const formatCurrency = (value: number | null) => {
    if (value === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Define series with proper types
  const barSeries: BarSeriesType[] = [
    {
      type: 'bar',
      id: 'claims',
      data: claims,
      label: 'Claims',
      color: defaultClaimsColor,
      stack: 'total',
      valueFormatter: formatCurrency,
    },
    {
      type: 'bar',
      id: 'fixedCosts',
      data: fixedCosts,
      label: 'Fixed Costs',
      color: defaultFixedCostsColor,
      stack: 'total',
      valueFormatter: formatCurrency,
    },
  ];

  const lineSeries: LineSeriesType[] = [
    {
      type: 'line',
      id: 'budget',
      data: budget,
      label: 'Budget',
      color: defaultBudgetColor,
      curve: 'linear',
      valueFormatter: formatCurrency,
      showMark: true,
    },
  ];

  const allSeries = [...barSeries, ...lineSeries];

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Box sx={{ width: '100%', height: height }}>
          <ResponsiveChartContainer
            series={allSeries}
            xAxis={[
              {
                scaleType: 'band',
                data: periods,
                id: 'periods',
              },
            ]}
            yAxis={[
              {
                id: 'amount',
              },
            ]}
            height={height}
            margin={{ top: 60, right: 20, bottom: 60, left: 80 }}
          >
            <ChartsGrid vertical horizontal />
            <BarPlot />
            <LinePlot />
            <ChartsXAxis
              label="Time Period"
              position="bottom"
              axisId="periods"
            />
            <ChartsYAxis
              label="Amount ($)"
              position="left"
              axisId="amount"
            />
            <ChartsTooltip trigger="axis" />
            <ChartsLegend
              direction="row"
              position={{ vertical: 'top', horizontal: 'right' }}
            />
          </ResponsiveChartContainer>
        </Box>

        {/* Legend Helper Text */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: defaultClaimsColor,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Claims (Stacked)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: defaultFixedCostsColor,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Fixed Costs (Stacked)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 3,
                bgcolor: defaultBudgetColor,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Budget (Line)
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
