# Healthcare Analytics Data Template Generator

## Overview

This Python module reverse-engineers data requirements from the **ComprehensiveAnalyticsDashboard** component to create:

✅ **Data schemas** for each visualization type
✅ **CSV template files** with proper headers and data types
✅ **Data validation rules**
✅ **Mock data generators**
✅ **Mapping between CSV columns and chart elements**

---

## Quick Start

### 1. Generate Templates and Mock Data

```bash
python scripts/data_template_generator.py
```

This will create a `./data_templates/` directory containing:

- **CSV template files** (7 files with headers and validation rules)
- **visualization_mapping.json** (maps CSV columns to chart elements)
- Console output showing mock data summary statistics

### 2. Output Directory Structure

```
data_templates/
├── monthly_costs.csv
├── high_cost_claimants.csv
├── diagnosis_by_cost.csv
├── diagnosis_by_utilization.csv
├── drug_classes.csv
├── preventive_screenings.csv
├── chronic_condition_compliance.csv
└── visualization_mapping.json
```

---

## Data Schema Reference

### 1. Financial KPIs

**Maps to:** KPI Cards (3 cards at top of dashboard)

**Data Class:** `FinancialKPI`

| Field | Type | Description |
|-------|------|-------------|
| `total_plan_payment` | float | Total payment across all categories |
| `medical_plan_payment` | float | Medical services payment |
| `rx_plan_payment` | float | Prescription drug payment |

**Validation:**
- `medical_plan_payment + rx_plan_payment ≈ total_plan_payment`

---

### 2. Monthly Cost Summary

**Maps to:** Monthly Cost Summary Chart (Area/Line chart with 2 series)

**Data Class:** `MonthlyCostSummary`

| Field | Type | Description |
|-------|------|-------------|
| `month` | string | Month name (e.g., "April") |
| `year` | int | 4-digit year |
| `medical_plan_payment` | float | Medical costs for the month |
| `rx_plan_payment` | float | RX costs for the month |
| `member_enrollment` | int | Active members in this month |

**CSV Template:** `monthly_costs.csv`

**Validation:**
- Must have exactly 12 rows (one per month)
- Months must be sequential
- `member_enrollment > 0`

**Chart Mapping:**
- **X-axis:** `month`
- **Series 1 (Blue):** `medical_plan_payment`
- **Series 2 (Orange):** `rx_plan_payment`

---

### 3. Member Distribution

**Maps to:** Member Distribution Chart (Horizontal stacked bar chart)

**Data Class:** `MemberDistribution`

| Field | Type | Description |
|-------|------|-------------|
| `cost_range` | CostRange enum | `<$25K`, `$25K-$49.9K`, `$50K-$99.9K`, `>$100K` |
| `claimants_percent` | float | % of total claimants in this bracket (0-100) |
| `payments_percent` | float | % of total payments from this bracket (0-100) |

**Validation:**
- `claimants_percent` sum ≈ 100
- `payments_percent` sum ≈ 100
- All percentages 0-100

**Chart Mapping:**
- **Categories:** Cost ranges
- **Bar 1 (Light blue):** `claimants_percent`
- **Bar 2 (Dark blue):** `payments_percent`

---

### 4. Budget vs Actuals

**Maps to:** Budget vs Actuals Chart (Stacked bar + line overlay)

**Data Class:** `BudgetVsActuals`

| Field | Type | Description |
|-------|------|-------------|
| `month` | string | Month name |
| `year` | int | 4-digit year |
| `claims_actual` | float | Actual claim costs |
| `fixed_costs_actual` | float | Fixed administrative/overhead costs |
| `budget_total` | float | Budgeted amount for the month |

**Chart Mapping:**
- **X-axis:** `month`
- **Stacked Bar 1:** `claims_actual`
- **Stacked Bar 2:** `fixed_costs_actual`
- **Line Overlay:** `budget_total`

---

### 5. High-Cost Claimants

**Maps to:** Top 10 High-Cost Claimants Table

**Data Class:** `HighCostClaimant`

| Field | Type | Description |
|-------|------|-------------|
| `member_id` | string | Masked/hashed member identifier |
| `medical_payment` | float | Total medical costs |
| `rx_payment` | float | Total prescription costs |
| `predicted_cost_range` | PredictedCostRange enum (optional) | `>$250,000`, `$100,000-$250,000`, `$50,000-$100,000`, `<$50,000` |

**CSV Template:** `high_cost_claimants.csv`

**Validation:**
- Member IDs should be de-identified
- Typically top 10-20 claimants
- Sorted by total cost descending

**Table Columns:**
- Member ID → `member_id`
- Medical Payment → `medical_payment`
- RX Payment → `rx_payment`
- Plan Payment → `medical_payment + rx_payment` (computed)
- Predicted Cost Range → `predicted_cost_range`

---

### 6. Place of Service

**Maps to:** Place of Service Chart (Horizontal bar chart)

**Data Class:** `PlaceOfServiceData`

| Field | Type | Description |
|-------|------|-------------|
| `service_category` | PlaceOfService enum | Service location type |
| `total_amount` | float | Total spend in this category |
| `claim_count` | int (optional) | Number of claims |

**Service Categories:**
- Outpatient Procedures
- Hospital Stay (In-Patient)
- Drugs
- Immediate Medical Attention
- Testing
- Office/Clinic Visit
- Substance Abuse
- Mental Health
- Pregnancy
- Recovery

**Chart Mapping:**
- **Y-axis:** `service_category`
- **X-axis (bar length):** `total_amount`

---

### 7. Diagnosis by Cost

**Maps to:** Top 10 Diagnosis by Cost (Pie chart + Table)

**Data Class:** `DiagnosisByCost`

| Field | Type | Description |
|-------|------|-------------|
| `diagnosis_code` | string | ICD-10 code (e.g., "C02.1") |
| `diagnosis_description` | string | Full diagnosis description |
| `total_cost` | float | Total costs for this diagnosis |
| `percentage` | float | % of total diagnosis costs (0-100) |

**CSV Template:** `diagnosis_by_cost.csv`

**Validation:**
- Top 10 diagnoses only
- Percentages sum ≈ 100
- Sorted by `total_cost` descending

**Chart Mapping:**
- **Pie slice value:** `total_cost`
- **Pie slice label:** `diagnosis_code`

**Table Columns:**
- Code → `diagnosis_code`
- Description → `diagnosis_description`
- Cost → `total_cost`
- % → `percentage`

---

### 8. Diagnosis by Utilization

**Maps to:** Top 10 Diagnosis by Utilization (Pie chart + Table)

**Data Class:** `DiagnosisByUtilization`

| Field | Type | Description |
|-------|------|-------------|
| `diagnosis_code` | string | ICD-10 code |
| `diagnosis_description` | string | Full diagnosis description |
| `claim_count` | int | Number of claims with this diagnosis |
| `percentage` | float | % of total claims (0-100) |

**CSV Template:** `diagnosis_by_utilization.csv`

**Validation:**
- Top 10 diagnoses only
- Percentages sum ≈ 100
- Sorted by `claim_count` descending

**Table Columns:**
- Code → `diagnosis_code`
- Description → `diagnosis_description`
- Count → `claim_count`
- % → `percentage`

---

### 9. Medical Episodes

**Maps to:** Top 10 Medical Episodes by Plan Payment (Bar chart)

**Data Class:** `MedicalEpisode`

| Field | Type | Description |
|-------|------|-------------|
| `episode_description` | string | Episode type (e.g., "Cancer of head and neck") |
| `total_cost` | float | Total costs for this episode type |
| `percentage` | float | % of total episode costs (0-100) |

**Chart Mapping:**
- **X-axis:** `episode_description`
- **Y-axis (bar height):** `total_cost`

---

### 10. Drug Classes

**Maps to:** Top Drug Classes by Utilization Table

**Data Class:** `DrugClass`

| Field | Type | Description |
|-------|------|-------------|
| `drug_class_name` | string | Therapeutic class name (e.g., "ANTIHYPERTENSIVES") |
| `script_count` | int | Number of prescriptions filled |
| `patient_cost` | float | Total patient out-of-pocket |
| `plan_payment` | float | Total plan payment for this class |

**CSV Template:** `drug_classes.csv`

**Validation:**
- Top 10 drug classes by utilization
- Sorted by `script_count` descending

**Table Columns:**
- Drug Class → `drug_class_name`
- Scripts → `script_count`
- Patient Cost → `patient_cost`
- Plan Payment → `plan_payment`

---

### 11. ER Utilization

**Maps to:** Emergency Room Category Chart (Bar chart)

**Data Class:** `ERUtilization`

| Field | Type | Description |
|-------|------|-------------|
| `er_category` | ERCategory enum | ER visit classification |
| `visit_count` | int | Number of ER visits in this category |

**ER Categories:**
- ER All Others
- ER Drug Alcohol Psych
- ER Injury
- ER Non Emergent, Avoidable
- ER PCP Treatable

**Chart Mapping:**
- **X-axis:** `er_category`
- **Y-axis (bar height):** `visit_count`

---

### 12. ER Top Diagnoses

**Maps to:** ER Visits - Top 5 Diagnosis (Horizontal bar chart)

**Data Class:** `ERTopDiagnosis`

| Field | Type | Description |
|-------|------|-------------|
| `diagnosis_description` | string | Diagnosis description |
| `visit_count` | int | Number of ER visits with this diagnosis |

**Chart Mapping:**
- **Y-axis (label):** `diagnosis_description`
- **X-axis (bar length):** `visit_count`

---

### 13. Chronic Condition Care Compliance

**Maps to:** Chronic Condition Care Compliance (Stacked bar chart)

**Data Class:** `ChronicConditionCompliance`

| Field | Type | Description |
|-------|------|-------------|
| `condition_name` | string | Chronic condition name (e.g., "Hypertension") |
| `compliant_count` | int | Members compliant with care protocols |
| `non_compliant_count` | int | Members not compliant |
| `avg_pmpy` | float | Average Per Member Per Year cost |

**CSV Template:** `chronic_condition_compliance.csv`

**Chart Mapping:**
- **X-axis:** `condition_name`
- **Stacked Bar 1 (Red):** `non_compliant_count`
- **Stacked Bar 2 (Green):** `compliant_count`

**Common Conditions:**
- Hypertension
- Lipid Metabolism
- Depression
- Asthma
- Diabetes
- Hypothyroidism
- Ischemic Heart Disease

---

### 14. Preventive Screenings

**Maps to:** Adult Preventive Screenings Table (Year-over-Year)

**Data Class:** `PreventiveScreening`

| Field | Type | Description |
|-------|------|-------------|
| `screening_name` | string | Name of screening |
| `prior_year_members` | int | Eligible members prior year |
| `current_year_members` | int | Eligible members current year |
| `prior_participation_percent` | float | Prior year participation % (0-100) |
| `current_participation_percent` | float | Current year participation % (0-100) |

**CSV Template:** `preventive_screenings.csv`

**Validation:**
- Participation percentages must be 0-100

**Table Columns:**
- Screening → `screening_name`
- Prior Year Members → `prior_year_members`
- Current Members → `current_year_members`
- Prior Participation → `prior_participation_percent`
- Current Participation → `current_participation_percent`
- Trend → `current_participation_percent - prior_participation_percent` (computed)

**Common Screenings:**
- Preventive Care Visit
- Lipid Disorder Screening
- Diabetes Screening
- Colorectal Cancer Screening
- Cervical Cancer Screening
- Breast Cancer Screening

---

## Mock Data Generation

The `MockDataGenerator` class creates realistic healthcare data following industry patterns:

### Key Features

✅ **Pareto Distribution** for high-cost claimants (80/20 rule)
✅ **Seasonal Variation** in medical costs
✅ **Realistic ICD-10 codes** and descriptions
✅ **Therapeutic drug classes** with proper naming
✅ **Year-over-year trends** in preventive care
✅ **Compliance patterns** for chronic conditions

### Usage

```python
from data_template_generator import MockDataGenerator

# Generate complete dataset
mock_data = MockDataGenerator.generate_complete_dashboard_data()

# Validate data
is_valid, errors = mock_data.validate_all()

# Access specific data
print(f"Total Plan Payment: ${mock_data.financial_kpis.total_plan_payment:,.2f}")
print(f"Top Claimant: {mock_data.top_claimants[0].member_id}")

# Generate only monthly costs
monthly_costs = MockDataGenerator.generate_monthly_costs(year=2024, base_enrollment=1200)
```

---

## CSV Template Generation

The `CSVTemplateGenerator` class creates CSV files with:

- **Header comments** with validation rules
- **Column headers** matching data schema
- **Sample rows** with realistic data
- **Data type specifications**

### Usage

```python
from data_template_generator import CSVTemplateGenerator
from pathlib import Path

output_dir = Path("./my_templates")

# Generate all templates
CSVTemplateGenerator.generate_all_templates(output_dir)

# Generate specific template
CSVTemplateGenerator.generate_monthly_costs_template(
    output_dir / "monthly_costs.csv"
)
```

---

## Visualization Mapping

The `visualization_mapping.json` file maps CSV columns to dashboard chart elements.

### Example Entry

```json
{
  "monthly_cost_summary_chart": {
    "description": "Area/Line chart showing monthly medical and RX costs",
    "component": "LineChart with two series",
    "data_source": "MonthlyCostSummary (list)",
    "x_axis": "month",
    "series": {
      "Medical Plan Payment": "medical_plan_payment",
      "RX Plan Payment": "rx_plan_payment"
    }
  }
}
```

### Usage

Load the mapping to understand which CSV columns feed each visualization:

```python
import json

with open('data_templates/visualization_mapping.json', 'r') as f:
    mapping = json.load(f)

# Find data source for a specific chart
chart_info = mapping['monthly_cost_summary_chart']
print(f"Data Source: {chart_info['data_source']}")
print(f"X-axis: {chart_info['x_axis']}")
print(f"Series: {chart_info['series']}")
```

---

## Data Validation Rules

### Financial Validation

- **Medical + RX = Total:** `medical_plan_payment + rx_plan_payment ≈ total_plan_payment`
- **Budget variance:** `budget_total - (claims_actual + fixed_costs_actual)`

### Percentage Validation

- **Member distribution:** Claimants % and Payments % both sum to ~100
- **Diagnosis percentages:** Cost % and Utilization % both sum to ~100
- **All percentages:** Must be in range 0-100

### Count Validation

- **Monthly data:** Must have exactly 12 records
- **Top N lists:** Typically 10 records (some 5-7)
- **Member enrollment:** Must be > 0

### Data Type Validation

- **Currency fields:** Float, >= 0
- **Count fields:** Integer, >= 0
- **Percentage fields:** Float, 0-100
- **Date fields:** YYYY-MM-DD format

---

## Integration with Dashboard

### Step 1: Load CSV Data

```typescript
import Papa from 'papaparse';

async function loadMonthlyData(csvFile: File) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      comments: '#',
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          month: row.month,
          year: parseInt(row.year),
          medical_plan_payment: parseFloat(row.medical_plan_payment),
          rx_plan_payment: parseFloat(row.rx_plan_payment),
          member_enrollment: parseInt(row.member_enrollment)
        }));
        resolve(data);
      },
      error: (error) => reject(error)
    });
  });
}
```

### Step 2: Map to Dashboard Props

```typescript
const dashboardData = {
  monthlyCosts: monthlyData.map(row => ({
    month: row.month,
    medical: row.medical_plan_payment,
    rx: row.rx_plan_payment,
    members: row.member_enrollment
  })),
  // ... other mappings
};
```

### Step 3: Render Charts

```typescript
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
```

---

## Example Workflow

### 1. Generate Templates

```bash
python scripts/data_template_generator.py
```

Output:
```
✓ Generated template: ./data_templates/monthly_costs.csv
✓ Generated template: ./data_templates/high_cost_claimants.csv
...
✓ Visualization mapping saved to: ./data_templates/visualization_mapping.json

SUMMARY
================================================================================
Plan Period: 4/1/2024 - 3/31/2025
Total Plan Payment: $7,123,456.00
  - Medical: $5,834,567.00
  - RX: $1,288,889.00

Monthly Cost Records: 12
High-Cost Claimants: 10
Top Claimant Total: $553,446.00
...
```

### 2. Customize CSV Templates

Edit the generated CSV files to match your actual data:

```csv
# monthly_costs.csv
month,year,medical_plan_payment,rx_plan_payment,member_enrollment
April,2024,450000.00,95000.00,1050
May,2024,620000.00,110000.00,1045
...
```

### 3. Upload to Dashboard

Use the **AnalyticsDropZone** component to upload CSV files:

```typescript
<AnalyticsDropZone onFilesAccepted={handleFilesAccepted} />
```

### 4. Process and Display

The dashboard will parse CSV files, validate data, and populate all visualizations.

---

## Common ICD-10 Codes

The generator includes realistic ICD-10 codes:

| Code | Description |
|------|-------------|
| C02.1 | Malignant neoplasm of border of tongue |
| I71.01 | Dissection of ascending aorta |
| A41.9 | Sepsis; unspecified organism |
| Z51.12 | Encounter for antineoplastic immunotherapy |
| J96.01 | Acute respiratory failure with hypoxia |
| Z00.00 | Encounter for general adult medical exam |
| I10 | Essential (primary) hypertension |
| E11.9 | Type 2 diabetes mellitus without complications |

---

## Dependencies

```bash
pip install python-dataclasses  # Built-in for Python 3.7+
```

No external dependencies required! Uses only Python standard library.

---

## File Structure

```
scripts/
├── data_template_generator.py          # Main generator script
└── README_DATA_TEMPLATES.md            # This documentation

data_templates/                          # Generated output (created on first run)
├── monthly_costs.csv
├── high_cost_claimants.csv
├── diagnosis_by_cost.csv
├── diagnosis_by_utilization.csv
├── drug_classes.csv
├── preventive_screenings.csv
├── chronic_condition_compliance.csv
└── visualization_mapping.json
```

---

## Troubleshooting

### Issue: Percentages don't sum to 100

**Solution:** Adjust the last item's percentage to account for rounding:

```python
remaining_percent = 100.0
for i in range(count):
    if i < count - 1:
        percent = calculate_percent()
    else:
        percent = remaining_percent  # Last item gets remainder
    remaining_percent -= percent
```

### Issue: CSV parsing fails

**Solution:** Check for:
- Proper UTF-8 encoding
- No extra commas
- Consistent column count per row
- Comment lines start with `#`

### Issue: Mock data validation fails

**Solution:** Run validation and check error messages:

```python
is_valid, errors = mock_data.validate_all()
if not is_valid:
    for error in errors:
        print(f"Error: {error}")
```

---

## Future Enhancements

Potential additions:

- [ ] JSON output format (in addition to CSV)
- [ ] Database schema generation (SQL)
- [ ] API endpoint mock server
- [ ] Data quality scoring
- [ ] Automated data profiling
- [ ] Excel template generation
- [ ] Data lineage documentation

---

## License

Part of the C&E Reporting Platform project.

---

## Questions?

Refer to:
- **Main project documentation:** [CLAUDE.md](../CLAUDE.md)
- **Dashboard component:** [ComprehensiveAnalyticsDashboard.tsx](../app/dashboard/analytics/components/ComprehensiveAnalyticsDashboard.tsx)
- **Analytics page:** [page.tsx](../app/dashboard/analytics/page.tsx)
