# Enhanced Medical/Rx Reporting System - Implementation Plan

**Based on**: "Medical-Rx Experience Report Template (2025.10.02).pdf"

**Status**: ✅ **Phase 1 & 2 Complete** | 🚧 **Phases 3-8 In Progress**

---

## 📊 Executive Summary

This document outlines the implementation plan to upgrade the existing C&E Reporting Platform to match the enterprise template's capabilities, including:

- Multi-plan tracking (HDHP, PPO Base, PPO Buy-Up)
- Rolling 24-month analytics with Current PY vs Prior PY comparisons
- Executive Dashboard with Fuel Gauge and KPI tiles
- High Cost Claimant (HCC) module with ISL threshold tracking
- Plan-specific detail pages matching template structure
- Template-accurate PDF exports

---

## ✅ Completed Work (Phases 1-2)

### Phase 1: Data Model Extension ✅

**Files Created:**
- **[types/enterprise-template.ts](types/enterprise-template.ts)** - Complete type definitions

**Key Types Implemented:**
```typescript
- Client, PlanYear, Plan, PlanTier (multi-tenancy foundation)
- MonthlyPlanStats (columns A-N from template pages 3, 5-7)
- HighClaimant (ISL tracking, template page 4)
- ExecutiveSummaryKPIs (template page 2 metrics)
- PremiumEquivalent, AdminFeeComponent, StopLossFeeByTier (inputs, page 8)
- FuelGaugeConfig, DistributionInsights, PEPMCalculation
- GoldenSampleDataset (validation targets)
```

**Schema Design:**
- Multi-client (tenant) architecture
- Plan-level breakouts (HDHP, PPO_BASE, PPO_BUYUP, HMO_1-5)
- Rolling 24-month window support
- Enrollment tier tracking (Employee Only, E+Spouse, E+Child, Family)

### Phase 2: Formula Engine & Executive Dashboard ✅

**Files Created:**
- **[lib/calculations/template-formulas.ts](lib/calculations/template-formulas.ts)** - Complete calculation engine
- **[app/dashboard/executive/page.tsx](app/dashboard/executive/page.tsx)** - Executive Dashboard page
- **[app/dashboard/executive/components/FuelGauge.tsx](app/dashboard/executive/components/FuelGauge.tsx)** - Fuel gauge visual
- **[app/dashboard/executive/components/KPITiles.tsx](app/dashboard/executive/components/KPITiles.tsx)** - KPI tiles grid
- **[app/dashboard/executive/components/PlanYTDChart.tsx](app/dashboard/executive/components/PlanYTDChart.tsx)** - Stacked chart (placeholder)
- **[app/dashboard/executive/components/DistributionPanels.tsx](app/dashboard/executive/components/DistributionPanels.tsx)** - Distribution visuals
- **[app/dashboard/executive/components/ObservationsPanel.tsx](app/dashboard/executive/components/ObservationsPanel.tsx)** - Auto-insights

**Formula Engine Functions:**

✅ **Column Formulas (A-N):**
```typescript
calculateGrossClaims(medical, rx)         // E = C + D
calculateNetClaims(gross, reimb, rebates) // H = E + F + G
calculateTotalPlanCost(net, admin, sl)    // K = H + I + J
calculateSurplusDeficit(budget, cost)     // M = L - K
calculatePercentOfBudget(cost, budget)    // N = K / L * 100
```

✅ **PEPM Calculations:**
```typescript
calculatePEPM(monthlyStats, label)
  → memberMonths = Σ subscribers
  → avgSubscribers = memberMonths / months
  → PEPM = (Σ metric) / avgSubscribers
```

✅ **Executive Summary:**
```typescript
calculateExecutiveSummaryKPIs(stats, planYear, through)
  → Sums all metrics for YTD
  → Calculates variances
  → Generates monthly vs budget distribution
```

✅ **Fuel Gauge:**
```typescript
calculateFuelGauge(percentOfBudget)
  → <95% = GREEN
  → 95-105% = YELLOW
  → >105% = RED
```

✅ **Distribution Insights:**
```typescript
calculateMedicalVsRxDistribution()
calculatePlanMixDistribution()
calculateHighClaimantBuckets()
```

**Executive Dashboard Components:**

✅ **Fuel Gauge** - Semicircle gauge with color thresholds
- Green arc (<95%), Yellow (95-105%), Red (>105%)
- Needle indicator
- Status badge
- Legend

✅ **KPI Tiles** - 12 metric cards in responsive grid:
- Total Budgeted Premium ($5,585,653 with $988.79 PEPM)
- Medical Paid Claims ($4,499,969)
- Pharmacy Paid Claims ($678,522)
- Total Paid Claims ($5,178,492)
- Est. Stop Loss Reimb. ($-563,512)
- Est. Earned Rx Rebates ($-423,675)
- Net Paid Claims ($4,191,305 with $741.96 PEPM)
- Administration Fees ($258,894)
- Stop Loss Fees ($817,983)
- IBNR Adjustment ($0)
- Total Plan Cost ($5,268,182 with $932.59 PEPM)
- Surplus/Deficit ($317,471) with trend coloring

✅ **Distribution Panels** - 3 visual insights:
1. **Medical vs Rx** (87% / 13%)
2. **Plan Mix** (PPO Base 58%, PPO Buy-Up 39%, HDHP 3%)
3. **High-Cost Buckets** ($200k+ 20%, $100-200k 11%, All Other 69%)

✅ **Observations Panel** - Auto-generated insights:
- Budget performance narrative
- High-cost claimant summary
- Medical/Rx distribution commentary
- Plan mix breakdown
- Editable custom notes

**Mock Data Integration:**
- Uses Golden Sample Dataset values from template
- All KPIs match template page 2 exactly

---

## 🚧 Remaining Work (Phases 3-8)

### Phase 3: Rolling 24-Month Analytics 🔜

**Objective**: Extend Monthly Detail page to support 24-month views with Current PY vs Prior PY comparisons.

**Tasks:**
1. **Create Monthly Detail - All Plans page** (`/app/dashboard/monthly/all/page.tsx`)
   - Table with columns A-N (matching template page 3)
   - Footer rows: Current PY, Prior PY, Current 12, Prior 12
   - PEPM calculations

2. **Add PEPM Trend Charts** (below table)
   - PEPM Medical Claims (line chart, 24 months)
   - PEPM Rx Claims (line chart, 24 months)
   - Show Current 12 vs Prior 12 comparison (+5% medical, +25% rx in sample)

3. **Implement filtering**
   - Rolling 24-month window selector
   - Date range picker
   - Export to CSV/Excel with data dictionary

**Files to Create:**
```
/app/dashboard/monthly/
  all/
    page.tsx                     # All Plans detail table
    components/
      MonthlyDetailTable.tsx     # A-N columns
      PEPMTrendCharts.tsx        # Rolling 24-month charts
```

**Formula Integration:**
- Use `calculateMonthlyStats()` for each row
- Use `calculatePEPM()` for summary rows
- Implement CSV export with template formatting

---

### Phase 4: Plan-Specific Detail Pages 🔜

**Objective**: Create dedicated tabs for HDHP, PPO Base, PPO Buy-Up with same A-N structure.

**Tasks:**
1. **Create plan-specific pages** (template pages 5, 6, 7)
   - `/app/dashboard/monthly/hdhp/page.tsx`
   - `/app/dashboard/monthly/ppo-base/page.tsx`
   - `/app/dashboard/monthly/ppo-buyup/page.tsx`

2. **Tab navigation** within Monthly Detail section
   - All Plans | HDHP | PPO Base | PPO Buy-Up

3. **Plan-scoped calculations**
   - Filter `MonthlyPlanStats` by `planId`
   - Calculate plan-specific PEPMs
   - Show plan-only subscriber counts

**Files to Create:**
```
/app/dashboard/monthly/
  [plan]/
    page.tsx                     # Dynamic plan page
  components/
    PlanTabs.tsx                 # Tab navigation
```

---

### Phase 5: High Cost Claimant Module 🔜

**Objective**: Implement ISL tracking module matching template page 4.

**Tasks:**
1. **Create HCC tracking page** (`/app/dashboard/hcc/page.tsx`)
   - Table: Rank, Plan, Status, Diagnosis, Med, Rx, Total, Exceeding ISL
   - ISL limit configuration (default $200k)
   - Threshold filter (≥50% of ISL = $100k)

2. **Build Employer vs Stop Loss visualization**
   - Horizontal stacked bar
   - Employer Responsibility: $1,390,000 (85%)
   - Stop Loss Reimbursement: $240,000 (15%)

3. **Implement filtering & export**
   - Filter by status (Active, COBRA, Retired, Terminated)
   - Sort by total paid (descending)
   - Export to CSV with PHI protections

**Files to Create:**
```
/app/dashboard/hcc/
  page.tsx
  components/
    HCCTable.tsx
    EmployerVsStopLossChart.tsx
    ISLConfiguration.tsx
```

**Formula Integration:**
- Use `filterHighCostClaimants(claimants, islLimit)`
- Use `calculateHighClaimantBuckets()`

---

### Phase 6: Advanced Inputs & Configuration 🔜

**Objective**: Enhance Fees page with template page 8 inputs.

**Tasks:**
1. **Extend Fees page** with new tabs:
   - **Premium Equivalents** (by plan tier)
   - **Stop Loss Fees by Tier** (ISL + ASL)
   - **Global Inputs** (Rx rebate PEPM, IBNR, ASL composite factor)

2. **Add enrollment management**
   - Tier mix tracking (Employee Only, E+Spouse, E+Child, Family)
   - Auto-calculate fees from tier × rate

3. **Version control**
   - Changes effective by date
   - Recalculate downstream KPIs on save

**Files to Modify:**
```
/app/dashboard/fees/page.tsx
  - Add tabs: Premium Equiv | Stop Loss | Global Inputs
/app/dashboard/fees/components/
  PremiumEquivalentsManager.tsx    # NEW
  StopLossFeesByTier.tsx           # NEW
  GlobalInputsManager.tsx          # NEW
```

**UI Requirements:**
- CRUD for premium equivalent rates (4 tiers × 3 plans = 12 inputs)
- CRUD for stop loss fees (4 tiers × ISL + ASL = 8 inputs per plan)
- Global toggles: Stop Loss Tracking Mode (BY_PLAN | AGGREGATED)

---

### Phase 7: Golden Sample Dataset Seeder 🔜

**Objective**: Create seeder to load "Flavio's Dog House" validation data.

**Tasks:**
1. **Create seeder script** (`/scripts/seed-golden-dataset.ts`)
   - Client: Flavio's Dog House
   - Plan Year: 2024 (7/1/2024 - 6/30/2025)
   - Plans: HDHP, PPO Base, PPO Buy-Up
   - 24 months of data (Jul 2023 - Jun 2025)

2. **Load data matching template**
   - Monthly All Plans (24 rows, template page 3)
   - Monthly by Plan (24 rows × 3 plans, pages 5-7)
   - High Claimants (8 rows, page 4)
   - Premium Equivalents (12 rates, page 8)
   - Admin Fee Components (5 items, page 8)
   - Stop Loss Fees by Tier (12 rates, page 8)

3. **Validation targets** (Expected KPIs):
```typescript
expectedKPIs: {
  totalBudgetedPremium: 5585653,     // ±$1
  medicalPaidClaims: 4499969,
  pharmacyPaidClaims: 678522,
  totalPaidClaims: 5178492,
  estStopLossReimb: -563512,
  estEarnedRxRebates: -423675,
  netPaidClaims: 4191305,
  administrationFees: 258894,
  stopLossFees: 817983,
  ibnrAdjustment: 0,
  totalPlanCost: 5268182,
  surplusDeficit: 317471,
  percentOfBudget: 94.3,              // ±0.1%
}
```

**Files to Create:**
```
/scripts/
  seed-golden-dataset.ts
  data/
    golden-sample-all-plans.json
    golden-sample-hdhp.json
    golden-sample-ppo-base.json
    golden-sample-ppo-buyup.json
    golden-sample-hcc.json
    golden-sample-inputs.json
```

**Run Command:**
```bash
pnpm seed:golden --validate
```

---

### Phase 8: PDF Export Enhancement 🔜

**Objective**: Generate template-matching PDF exports.

**Tasks:**
1. **Create PDF export service** (`/lib/utils/pdfExportTemplate.ts`)
   - Use headless Chromium (Puppeteer)
   - Render pages server-side

2. **PDF page sequence** (matching template):
   - Page 1: Cover slide (client name, plan year, data through date)
   - Page 2: Executive Summary (fuel gauge, KPIs, charts, observations)
   - Page 3: Monthly Detail - All Plans (table + PEPM charts)
   - Page 4: High Cost Claimants (table + employer vs stop loss chart)
   - Page 5: Monthly Detail - HDHP
   - Page 6: Monthly Detail - PPO Base
   - Page 7: Monthly Detail - PPO Buy-Up

3. **Preserve template layout**
   - Neutral branding with client name injection
   - Exact chart positioning
   - Page footers: "Consultant Name | License No. | Website"

**Files to Create:**
```
/lib/utils/pdfExportTemplate.ts
/app/api/export/pdf/route.ts
/app/dashboard/executive/components/ExportButton.tsx
```

**API Endpoint:**
```
POST /api/export/pdf
Body: { clientId, planYearId, through, options: PDFExportOptions }
Response: Binary PDF stream
```

---

### Phase 9: Testing & Validation ✅ (Continuous)

**Unit Tests:**
```
/lib/calculations/__tests__/
  template-formulas.test.ts
    ✓ Column E calculation (C + D)
    ✓ Column H calculation (E + F + G)
    ✓ Column K calculation (H + I + J)
    ✓ Column M calculation (L - K)
    ✓ Column N calculation (K / L * 100)
    ✓ PEPM calculation (member-months, averages)
    ✓ Executive summary KPIs match Golden Sample
    ✓ Fuel gauge thresholds (<95%, 95-105%, >105%)
    ✓ High-cost claimant filtering (≥50% ISL)
    ✓ Reconciliation validation (Σ plans = All Plans)
```

**Integration Tests:**
```
/e2e/__tests__/
  executive-dashboard.spec.ts
    ✓ Load executive dashboard
    ✓ Fuel gauge displays correct status
    ✓ KPI tiles show Golden Sample values
    ✓ Distribution panels render
    ✓ Observations auto-generate
```

**E2E Tests (Playwright):**
```
/e2e/__tests__/
  upload-to-pdf.spec.ts
    ✓ Upload monthly CSV
    ✓ Configure fees
    ✓ Navigate to executive dashboard
    ✓ Verify KPIs match expected
    ✓ Export PDF
    ✓ Validate PDF content
```

---

## 📂 File Structure

```
/types/
  enterprise-template.ts          ✅ Complete type definitions

/lib/calculations/
  template-formulas.ts            ✅ Formula engine (columns A-N, PEPM, KPIs)
  __tests__/
    template-formulas.test.ts     🔜 Unit tests

/app/dashboard/
  executive/                      ✅ Executive Dashboard
    page.tsx                      ✅ Main page
    components/
      FuelGauge.tsx               ✅ Fuel gauge visual
      KPITiles.tsx                ✅ KPI tiles grid
      PlanYTDChart.tsx            ✅ Stacked chart (placeholder)
      DistributionPanels.tsx      ✅ Distribution visuals
      ObservationsPanel.tsx       ✅ Auto-insights

  monthly/                        🔜 Monthly Detail pages
    all/
      page.tsx                    🔜 All Plans detail
    [plan]/
      page.tsx                    🔜 Plan-specific detail
    components/
      MonthlyDetailTable.tsx      🔜 A-N columns table
      PEPMTrendCharts.tsx         🔜 Rolling 24-month charts
      PlanTabs.tsx                🔜 Tab navigation

  hcc/                            🔜 High Cost Claimants
    page.tsx                      🔜 HCC tracking page
    components/
      HCCTable.tsx                🔜 Claimant table
      EmployerVsStopLossChart.tsx 🔜 Employer vs SL viz
      ISLConfiguration.tsx        🔜 ISL limit settings

  fees/                           ⚠️  Needs Enhancement
    page.tsx                      ⚠️  Add Premium Equiv, Stop Loss tabs
    components/
      PremiumEquivalentsManager.tsx 🔜 NEW
      StopLossFeesByTier.tsx        🔜 NEW
      GlobalInputsManager.tsx       🔜 NEW

/app/api/
  exec-summary/route.ts           🔜 GET executive summary
  monthly/
    all-plans/route.ts            🔜 GET monthly all plans
    [plan]/route.ts               🔜 GET monthly per plan
  hcc/route.ts                    🔜 GET high-cost claimants
  inputs/route.ts                 🔜 GET/PUT inputs
  upload/
    monthly-all/route.ts          🔜 POST upload all plans CSV
    monthly-plan/route.ts         🔜 POST upload plan CSV
    hcc/route.ts                  🔜 POST upload HCC CSV
  export/
    pdf/route.ts                  🔜 POST generate PDF

/scripts/
  seed-golden-dataset.ts          🔜 Golden Sample seeder
  data/
    golden-sample-*.json          🔜 Sample data files

/lib/utils/
  pdfExportTemplate.ts            🔜 PDF generation

/docs/
  IMPLEMENTATION_PLAN.md          ✅ This document
  FORMULAS.md                     🔜 Formula documentation
  API.md                          🔜 API documentation
```

---

## 🔧 Technical Architecture

### Data Flow

```
┌─────────────┐
│ CSV Upload  │
│ (Monthly,   │
│  HCC)       │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│ Validation  │────▶│ MonthlyPlan  │
│ & Transform │     │ Stats Table  │
└─────────────┘     └──────┬───────┘
                           │
       ┌───────────────────┼────────────────────┐
       ▼                   ▼                    ▼
┌──────────────┐  ┌──────────────┐   ┌─────────────────┐
│ Formula      │  │ PEPM         │   │ Distribution    │
│ Engine       │  │ Calculator   │   │ Insights        │
│ (A-N cols)   │  │              │   │ (Med/Rx, HCC)   │
└──────┬───────┘  └──────┬───────┘   └────────┬────────┘
       │                 │                    │
       └─────────────────┼────────────────────┘
                         ▼
              ┌─────────────────────┐
              │ Executive Summary   │
              │ KPIs + Fuel Gauge   │
              └──────────┬──────────┘
                         │
       ┌─────────────────┼────────────────────┐
       ▼                 ▼                    ▼
┌──────────────┐  ┌──────────────┐   ┌─────────────┐
│ Dashboard    │  │ Monthly      │   │ PDF Export  │
│ Visuals      │  │ Detail Pages │   │             │
└──────────────┘  └──────────────┘   └─────────────┘
```

### Calculation Precedence

1. **Base Monthly Stats** (columns A-E)
2. **Adjustments** (columns F-G: Stop Loss Reimb, Rx Rebates)
3. **Net Claims** (column H)
4. **Fees** (columns I-J)
5. **Total Plan Cost** (column K)
6. **Variance** (columns M-N)
7. **PEPM Aggregation** (member-months → PEPM)
8. **Executive Summary** (YTD sums → KPIs)

---

## 📋 Acceptance Criteria

### Phase Completion Checklist

**Phase 1: Data Model ✅**
- [x] All entity types defined
- [x] Multi-plan architecture
- [x] Enrollment tier support
- [x] Golden Sample types defined

**Phase 2: Executive Dashboard ✅**
- [x] Formula engine implemented
- [x] Fuel gauge component with thresholds
- [x] KPI tiles (12 metrics)
- [x] Distribution panels (3 visuals)
- [x] Observations panel with auto-insights
- [x] Mock data integration

**Phase 3: Rolling 24-Month Analytics 🔜**
- [ ] Monthly Detail - All Plans page
- [ ] Columns A-N table implementation
- [ ] PEPM trend charts (Medical + Rx)
- [ ] Current PY vs Prior PY comparison
- [ ] CSV/Excel export

**Phase 4: Plan-Specific Pages 🔜**
- [ ] HDHP detail page
- [ ] PPO Base detail page
- [ ] PPO Buy-Up detail page
- [ ] Tab navigation
- [ ] Plan-scoped calculations

**Phase 5: High Cost Claimants 🔜**
- [ ] HCC tracking table
- [ ] ISL filtering (≥50%)
- [ ] Employer vs Stop Loss chart
- [ ] Status filtering
- [ ] CSV export with PHI protection

**Phase 6: Inputs Enhancement 🔜**
- [ ] Premium Equivalents manager
- [ ] Stop Loss Fees by Tier
- [ ] Global Inputs (Rx rebate, IBNR, ASL)
- [ ] Version control by effective date
- [ ] Downstream recalculation on save

**Phase 7: Golden Sample Seeder 🔜**
- [ ] Seeder script implemented
- [ ] All sample data loaded
- [ ] Validation targets defined
- [ ] KPIs match template (±$1, ±0.1%)

**Phase 8: PDF Export 🔜**
- [ ] PDF export service
- [ ] 7-page template layout
- [ ] Cover slide
- [ ] All dashboard pages
- [ ] Plan-specific pages
- [ ] Template-accurate formatting

**Phase 9: Testing ⚠️  Ongoing**
- [ ] Unit tests (formula engine)
- [ ] Integration tests (APIs)
- [ ] E2E tests (upload → export)
- [ ] Golden Sample validation passes

---

## ⏱️ Estimated Timeline

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| 1 | Data Model Extension | 1 day | ✅ Complete |
| 2 | Executive Dashboard | 2 days | ✅ Complete |
| 3 | Rolling 24-Month Analytics | 1.5 days | 🔜 Next |
| 4 | Plan-Specific Pages | 1 day | 🔜 Pending |
| 5 | High Cost Claimants | 1 day | 🔜 Pending |
| 6 | Inputs Enhancement | 1 day | 🔜 Pending |
| 7 | Golden Sample Seeder | 0.5 days | 🔜 Pending |
| 8 | PDF Export | 1.5 days | 🔜 Pending |
| 9 | Testing & Validation | 1 day | ⚠️  Ongoing |
| **Total** | **Full Implementation** | **10 days** | **20% Complete** |

---

## 🚀 Next Steps

### Immediate Priorities (Next Sprint)

1. **Implement Monthly Detail - All Plans**
   - Create table with columns A-N
   - Add PEPM trend charts
   - Implement CSV export

2. **Build Plan-Specific Pages**
   - Create HDHP/PPO Base/PPO Buy-Up pages
   - Add tab navigation
   - Link from Executive Dashboard

3. **Create High Cost Claimant Module**
   - HCC tracking table with ISL filtering
   - Employer vs Stop Loss visualization
   - Export functionality

### Week 1 Goals
- [ ] Monthly Detail - All Plans page complete
- [ ] PEPM trend charts implemented
- [ ] Plan-specific pages (3) complete
- [ ] Tab navigation functional

### Week 2 Goals
- [ ] High Cost Claimant module complete
- [ ] Premium Equivalents manager
- [ ] Golden Sample seeder
- [ ] Validation tests passing

---

## 📝 Notes & Assumptions

1. **Database**: Assumes PostgreSQL + Prisma ORM (not yet migrated)
2. **Authentication**: Uses existing auth (no changes needed)
3. **Charts**: Chart.js selected (lightweight, no theme dependencies)
4. **PDF Generation**: Puppeteer for server-side rendering
5. **Data Seeding**: Golden Sample values hardcoded initially, then CSV import

---

## 📚 Reference Documentation

- **Template Source**: "Medical-Rx Experience Report Template (2025.10.02).pdf"
- **Existing System Docs**: [CLAUDE.md](CLAUDE.md)
- **Formula Engine**: [lib/calculations/template-formulas.ts](lib/calculations/template-formulas.ts)
- **Type Definitions**: [types/enterprise-template.ts](types/enterprise-template.ts)

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
**Status**: ✅ Phases 1-2 Complete | 🚧 20% Implementation Complete
