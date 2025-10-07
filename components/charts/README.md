# Budget vs Actuals Chart Component

## Overview
A reusable combination chart component that displays stacked bar charts with an overlaid line graph, built with **MUI X Charts**. Perfect for comparing budget vs actual costs over time.

## Features
- ✅ **Stacked Bar Chart**: Shows Claims and Fixed Costs as stacked bars
- ✅ **Line Overlay**: Budget trend line with markers
- ✅ **MUI Theming**: Fully integrated with Material-UI theme
- ✅ **Responsive**: Adapts to different screen sizes
- ✅ **Accessible**: ARIA labels and keyboard navigation
- ✅ **Customizable**: Colors, height, and title can be customized
- ✅ **Tooltips**: Hover to see exact values
- ✅ **Legend**: Clear legend with visual indicators

## Installation

### Dependencies
```bash
npm install @mui/material @mui/x-charts @emotion/react @emotion/styled
```

Already installed in this project!

## Usage

### Basic Usage
```tsx
import BudgetVsActualsChart from '@/components/charts/BudgetVsActualsChart';
import { useBudgetData } from '@/hooks/useBudgetData';

export default function MyDashboard() {
  const budgetData = useBudgetData();

  return (
    <BudgetVsActualsChart
      data={budgetData}
    />
  );
}
```

### Custom Styling
```tsx
<BudgetVsActualsChart
  data={budgetData}
  title="Custom Title"
  height={500}
  claimsColor="#1e40af"
  fixedCostsColor="#f59e0b"
  budgetColor="#dc2626"
/>
```

### With Custom Data
```tsx
const customData = [
  { period: 'Q1 2024', claims: 500000, fixedCosts: 100000, budget: 650000 },
  { period: 'Q2 2024', claims: 620000, fixedCosts: 110000, budget: 700000 },
  { period: 'Q3 2024', claims: 580000, fixedCosts: 105000, budget: 680000 },
];

<BudgetVsActualsChart data={customData} />
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `BudgetDataPoint[]` | Yes | - | Array of data points with period, claims, fixedCosts, budget |
| `title` | `string` | No | `'Budget vs Actuals'` | Chart title |
| `height` | `number` | No | `400` | Chart height in pixels |
| `claimsColor` | `string` | No | `theme.palette.primary.main` | Color for claims bars |
| `fixedCostsColor` | `string` | No | `theme.palette.warning.main` | Color for fixed costs bars |
| `budgetColor` | `string` | No | `theme.palette.error.main` | Color for budget line |

## Data Structure

### BudgetDataPoint Interface
```typescript
interface BudgetDataPoint {
  period: string;      // Time period label (e.g., "Jan 2024", "Q1 2024")
  claims: number;      // Claims amount in dollars
  fixedCosts: number;  // Fixed costs amount in dollars
  budget: number;      // Budget amount in dollars
}
```

### Example Data
```typescript
const sampleData: BudgetDataPoint[] = [
  {
    period: 'Apr 2024',
    claims: 450000,
    fixedCosts: 95000,
    budget: 600000,
  },
  {
    period: 'May 2024',
    claims: 620000,
    fixedCosts: 110000,
    budget: 600000,
  },
  // ... more months
];
```

## Hooks

### useBudgetData()
Returns sample budget data for demonstration purposes.

```tsx
import { useBudgetData } from '@/hooks/useBudgetData';

const budgetData = useBudgetData();
```

### useCalculatedBudgetData()
Calculates budget data from uploaded claims CSV data.

```tsx
import { useCalculatedBudgetData } from '@/hooks/useBudgetData';

const budgetData = useCalculatedBudgetData(
  claimsData,        // Array of claim records
  100000,            // Fixed cost rate (optional)
  600000             // Budget amount (optional)
);
```

### useQuarterlyBudgetData()
Aggregates monthly data into quarterly periods.

```tsx
import { useQuarterlyBudgetData, useBudgetData } from '@/hooks/useBudgetData';

const monthlyData = useBudgetData();
const quarterlyData = useQuarterlyBudgetData(monthlyData);

<BudgetVsActualsChart data={quarterlyData} />
```

## Integration with Healthcare Dashboard

### Current Integration
The chart is currently integrated into the **ComprehensiveAnalyticsDashboard** component:

```tsx
// app/dashboard/analytics/components/ComprehensiveAnalyticsDashboard.tsx
import BudgetVsActualsChart from '@/components/charts/BudgetVsActualsChart';
import { useBudgetData } from '@/hooks/useBudgetData';

export function ComprehensiveAnalyticsDashboard() {
  const budgetData = useBudgetData();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <BudgetVsActualsChart
          data={budgetData}
          title="Budget vs Actuals - Monthly Comparison"
          height={400}
        />
      </Grid>
    </Grid>
  );
}
```

## Customization Examples

### Dark Theme
```tsx
<BudgetVsActualsChart
  data={budgetData}
  claimsColor="#60a5fa"      // Light blue
  fixedCostsColor="#fbbf24"  // Light orange
  budgetColor="#f87171"      // Light red
/>
```

### Corporate Colors
```tsx
<BudgetVsActualsChart
  data={budgetData}
  claimsColor="#003366"      // Navy
  fixedCostsColor="#FF6600"  // Orange
  budgetColor="#CC0000"      // Red
/>
```

### Tall Chart
```tsx
<BudgetVsActualsChart
  data={budgetData}
  height={600}
/>
```

## Accessibility Features

- ✅ **ARIA Labels**: Chart has proper ARIA labels for screen readers
- ✅ **Keyboard Navigation**: Can navigate chart with keyboard
- ✅ **Color Contrast**: Colors meet WCAG AA standards
- ✅ **Tooltips**: Tooltips provide additional context
- ✅ **Legend**: Clear legend with text labels

## Responsive Behavior

The chart automatically adjusts to container width:
- **Mobile (xs)**: Full width, legend on top
- **Tablet (md)**: Full width, legend on right
- **Desktop (lg+)**: Full width, optimized spacing

## Performance Optimization

- Uses React `useMemo` hook to prevent unnecessary re-renders
- Data transformations cached until dependencies change
- Efficient rendering with MUI X Charts

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Future Enhancements

Potential features to add:
- [ ] Export chart as PNG/PDF
- [ ] Custom date range filtering
- [ ] Drill-down by clicking bars
- [ ] Comparison mode (YoY, MoM)
- [ ] Variance indicators (over/under budget)
- [ ] Animated transitions
- [ ] Real-time data updates

## Troubleshooting

### Chart not displaying
- Ensure `@mui/x-charts` is installed: `npm install @mui/x-charts`
- Check that data is in correct format
- Verify all required props are provided

### Colors not applying
- Check that MUI theme is properly configured
- Use hex colors instead of theme colors if needed
- Verify ThemeProvider wraps your app

### Data not updating
- Ensure data prop is changing (check with `console.log`)
- Verify useMemo dependencies are correct
- Check React strict mode isn't causing double renders

## Related Components

- **LineChart**: For simple line graphs
- **BarChart**: For simple bar charts
- **PieChart**: For distribution charts
- **AreaChart**: For area graphs

## License

MIT - Part of the C&E Reporting Platform

---

**Need Help?**
- Check MUI X Charts docs: https://mui.com/x/react-charts/
- Review sample implementations in the dashboard
- See hooks/useBudgetData.ts for data examples
