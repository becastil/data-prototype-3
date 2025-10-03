# Analytics Dashboard

## Overview
The Analytics Dashboard provides comprehensive healthcare analytics visualization based on claims and expenses data.

## Components

### ComprehensiveAnalyticsDashboard
A full-featured analytics dashboard with static dummy data that includes:

#### Executive Summary
- Key metrics and trends overview
- Highest cost month analysis
- Top claimant identification
- Member distribution patterns

#### Actionable Insights
- Cancer cost analysis (18% of total spend)
- Heart disease prevention recommendations
- Mental health program suggestions
- Preventive care participation tracking

#### Financial Metrics
- Total Plan Payment: $7.28M
- Medical Plan Payment: $5.96M
- RX Plan Payment: $1.32M

#### Visualizations

1. **Monthly Cost Summary**
   - Line chart showing medical and RX costs over 12 months
   - Member enrollment trend overlay

2. **Member Distribution**
   - Cost bracket analysis (<$25K, $25K-$49.9K, $50K-$99.9K, >$100K)
   - Shows concentration of costs (2% of members = 43% of spend)

3. **Top 10 High-Cost Claimants Table**
   - Member ID with medical and RX breakdown
   - Predictive cost range modeling
   - Total plan payment per claimant

4. **Place of Service Analysis**
   - Horizontal bar chart
   - Top categories: Outpatient, Inpatient, Drugs, ER, Testing

5. **Diagnosis Analysis**
   - Top 10 by Cost (pie chart + table)
   - Top 10 by Utilization (table)
   - ICD-10 code breakdown with percentages

6. **Medical Episodes**
   - Bar chart of top 10 episodes by cost
   - Cancer of head/neck (22.84%), Heart disease (16.63%), etc.

7. **Drug Classes**
   - Table with scripts, patient cost, and plan payment
   - Top classes: Antihypertensives, Antidepressants, Antidiabetics

8. **ER Utilization**
   - Bar chart by category (All Others, Drug/Alcohol, Injury, Non-Emergent, PCP Treatable)
   - Top 5 ER diagnoses with visual bars
   - 30% avoidable visits alert

9. **Chronic Condition Care Compliance**
   - Stacked bar chart (Compliant vs Non-Compliant)
   - Conditions: Hypertension, Diabetes, Depression, etc.
   - Average PMPY overlay

10. **Preventive Screenings**
    - Year-over-year comparison table
    - Participation rates with trend indicators
    - Categories: Preventive care, Lipid screening, Cancer screenings

## Data Source

All data is currently **static dummy data** based on the healthcare analytics report template PDF. This provides a realistic visualization of what the dashboard will look like when connected to real data.

## Future Enhancements

- [ ] Connect to real uploaded CSV data
- [ ] Add date range filtering
- [ ] Implement drill-down capabilities
- [ ] Export to PDF functionality
- [ ] Interactive chart tooltips with detailed information
- [ ] Comparison views (YoY, Month over Month)
- [ ] Custom alert thresholds
- [ ] Downloadable data tables (CSV/Excel)

## Technical Details

### Technologies Used
- **React/Next.js** - Framework
- **Material-UI (MUI)** - Component library
- **MUI X-Charts** - Chart visualizations (BarChart, LineChart, PieChart)
- **TypeScript** - Type safety

### Color Scheme
- Primary Blue: `#1e3a8a`, `#2563eb`, `#3b82f6`
- Success Green: `#16a34a`
- Warning Orange: `#f59e0b`
- Error Red: `#dc2626`

### File Structure
```
app/dashboard/analytics/
├── page.tsx                                    # Main analytics page
├── components/
│   ├── AnalyticsDashboard.tsx                 # Original dashboard (simple)
│   └── ComprehensiveAnalyticsDashboard.tsx    # New comprehensive dashboard
└── README.md                                   # This file
```

## Usage

Navigate to `/dashboard/analytics` to view the comprehensive analytics dashboard.

The dashboard automatically renders with static demo data and requires no configuration or uploaded data to display.

## Notes

- All monetary values are formatted as USD currency
- Percentages are calculated and displayed with appropriate precision
- Color coding follows healthcare analytics best practices (red for high risk, green for compliant)
- Responsive design works on desktop, tablet, and mobile devices
