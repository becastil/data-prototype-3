# Healthcare Analytics Dashboard - Navigation & Page Structure

## Overview

This document provides a complete reference for all pages, routes, and navigation flows in the Healthcare Analytics Dashboard application.

---

## Page Structure

### 1. Home Page
- **Route**: `/`
- **File**: [app/page.tsx](app/page.tsx)
- **Purpose**: Landing page with workflow overview and quick navigation
- **Features**:
  - 4 main action cards (Upload, Configure Fees, Summary, Analytics)
  - Getting Started guide
  - Direct navigation to all major sections
- **Links To**:
  - `/dashboard/upload` - Start Upload button
  - `/dashboard/fees` - Configure Fees button
  - `/dashboard/summary` - View Summary button
  - `/dashboard/analytics` - View Analytics button

---

### 2. Upload Data Page
- **Route**: `/dashboard/upload`
- **File**: [app/dashboard/upload/page.tsx](app/dashboard/upload/page.tsx)
- **Component**: [CSVUploader](app/dashboard/upload/components/CSVUploader.tsx)
- **Purpose**: Upload and validate CSV files
- **Features**:
  - 3-step stepper workflow
  - Multiple file upload (up to 5 files)
  - CSV template downloads
  - Real-time validation with error reporting
  - Experience data and high-cost claimant parsing
- **API Endpoints**:
  - `POST /api/upload` - Upload and parse CSV files
  - `GET /api/upload?template=experience` - Download experience data template
  - `GET /api/upload?template=high-cost-claimant` - Download claimants template
- **Navigation**:
  - Back to Home: `/`
  - Next Step (on success): `/dashboard/fees`
  - Alternative: `/dashboard/summary`

---

### 3. Fee Configuration Page
- **Route**: `/dashboard/fees`
- **File**: [app/dashboard/fees/page.tsx](app/dashboard/fees/page.tsx)
- **Component**: [FeesGrid](app/dashboard/fees/components/FeesGrid.tsx)
- **Purpose**: Configure monthly fee structures
- **Features**:
  - Editable data grid with 12 months
  - Multiple fee types (PMPM, PEPM, Flat, Tiered, Annual, Manual)
  - Auto-calculation of totals
  - Premium rate configuration
  - Target loss ratio settings
  - Auto-generation from experience data
  - Real-time KPI cards (Total Fees, Avg Monthly Fee, Enrollment, Loss Ratio)
- **API Endpoints**:
  - `POST /api/calculations` (type: 'monthly-summaries') - Calculate monthly summaries
- **Navigation**:
  - Back to Home: `/`
  - Previous: `/dashboard/upload`
  - Next: `/dashboard/summary`

---

### 4. Summary Table Page
- **Route**: `/dashboard/summary`
- **File**: [app/dashboard/summary/page.tsx](app/dashboard/summary/page.tsx)
- **Component**: [SummaryTable](app/dashboard/summary/components/SummaryTable.tsx)
- **Purpose**: View calculated loss ratios and monthly summaries
- **Features**:
  - Interactive data grid with sorting/filtering
  - Multiple view modes (Monthly, Quarterly, Annual)
  - Color-coded loss ratio indicators (Good/Warning/Critical)
  - KPI cards (Total Claims, Fees, Avg Loss Ratio, PMPM)
  - Refresh/Recalculate button
  - Export to PDF (landscape)
  - Performance indicator legend
- **View Modes**:
  - **Monthly**: All 12 months individually
  - **Quarterly**: Q1, Q2, Q3, Q4 aggregates
  - **Annual**: Full year totals
- **API Endpoints**:
  - `POST /api/calculations` (type: 'monthly-summaries') - Recalculate summaries
- **Navigation**:
  - Back to Home: `/`
  - Previous: `/dashboard/fees`
  - Next: `/dashboard/analytics`

---

### 5. Analytics Dashboard Page
- **Route**: `/dashboard/analytics`
- **File**: [app/dashboard/analytics/page.tsx](app/dashboard/analytics/page.tsx)
- **Component**: [AnalyticsDashboard](app/dashboard/analytics/components/AnalyticsDashboard.tsx)
- **Purpose**: Interactive charts and advanced analytics
- **Features**:
  - 6-tile dashboard layout:
    1. **KPI Cards**: Total Claims, Total Cost, Avg Loss Ratio, Avg Claim, Total Members, PMPM
    2. **Monthly Trend Chart**: Line/bar chart with loss ratio overlay
    3. **Category Breakdown**: Pie/donut chart of cost categories
    4. **High-Cost Members**: Table with top 5-10 members
    5. **Top Diagnoses**: Table with ICD-10 codes and costs
    6. **Trend Analysis**: Rolling metrics and comparisons
  - Period selector (Full Year, Q1-Q4)
  - Refresh data button
  - Export to PDF (landscape)
  - Real-time data updates
- **API Endpoints**:
  - `POST /api/calculations` (type: 'dashboard-analytics') - Generate dashboard data
- **Navigation**:
  - Back to Home: `/`
  - Previous: `/dashboard/summary`
  - Upload New Data: `/dashboard/upload`

---

## API Routes

### 1. Upload API
- **Route**: `POST /api/upload`
- **File**: [app/api/upload/route.ts](app/api/upload/route.ts)
- **Purpose**: Process CSV file uploads
- **Accepts**: `multipart/form-data` with files
- **Returns**:
  ```typescript
  {
    success: boolean;
    data?: UploadResult[];
    error?: string;
  }
  ```
- **Query Parameters**:
  - `?template=experience` - Returns experience data CSV template
  - `?template=high-cost-claimant` - Returns claimant CSV template

### 2. Calculations API
- **Route**: `POST /api/calculations`
- **File**: [app/api/calculations/route.ts](app/api/calculations/route.ts)
- **Purpose**: Perform calculations and generate analytics
- **Request Types**:
  - `monthly-summaries` - Calculate monthly summaries from experience data
  - `dashboard-analytics` - Generate dashboard KPIs and charts
- **Request Body**:
  ```typescript
  {
    type: 'monthly-summaries' | 'dashboard-analytics';
    data: {
      experienceData: ExperienceData[];
      feeStructures: FeeStructure[];
      premiumData?: PremiumData[];
      monthlySummaries?: MonthlySummary[];
      highCostClaimants?: HighCostClaimant[];
      targetLossRatio?: number;
    }
  }
  ```
- **Returns**:
  ```typescript
  {
    success: boolean;
    data?: any;
    error?: string;
  }
  ```

---

## Navigation Flow

### Primary Workflow (4 Steps)

```
Home (/)
  ↓
Upload Data (/dashboard/upload)
  - Step 1: Upload Files
  - Step 2: Validate Data
  - Step 3: Review & Confirm
  ↓
Configure Fees (/dashboard/fees)
  - Set fee structures
  - Calculate totals
  - Save & generate summaries
  ↓
View Summary (/dashboard/summary)
  - Review loss ratios
  - Analyze PMPM
  - Export summary PDF
  ↓
Analytics Dashboard (/dashboard/analytics)
  - Interactive charts
  - Drill-down analysis
  - Generate full report
```

### Alternative Navigation Paths

**Quick Access from Home:**
- Home → Upload → Fees → Summary → Analytics (sequential)
- Home → Summary (direct, uses sample data)
- Home → Analytics (direct, uses sample data)

**Back Navigation:**
- All pages have "Back to Home" button
- Sequential pages have "Previous/Next" navigation

**Cross Navigation:**
- Analytics → Upload New Data
- Summary → Analytics (Next)
- Fees → Summary (Next)

---

## Component Dependencies

### Layout Components
- **RootLayout** ([app/layout.tsx](app/layout.tsx))
  - `ClientThemeProvider` - MUI theme wrapper
  - `HealthcareProvider` - Global state management
  - `ErrorBoundary` - Error handling
  - `AppRouterCacheProvider` - MUI Next.js integration

### Shared Components
- **ClientOnly** ([components/ClientOnly.tsx](components/ClientOnly.tsx))
  - Prevents hydration issues
  - Used on all client-side pages
- **ErrorBoundary** ([components/ErrorBoundary.tsx](components/ErrorBoundary.tsx))
  - Catches React errors
  - Displays user-friendly error UI

### Page-Specific Components
1. **Upload Page**
   - `CSVUploader` - File upload and drag-drop

2. **Fees Page**
   - `FeesGrid` - Editable data grid

3. **Summary Page**
   - `SummaryTable` - Loss ratio data grid

4. **Analytics Page**
   - `AnalyticsDashboard` - Full dashboard with 6 tiles

---

## State Management

### Global Context
- **HealthcareContext** ([lib/store/HealthcareContext.tsx](lib/store/HealthcareContext.tsx))
- **Available Hooks**:
  - `useHealthcare()` - Full context with actions
  - `useExperienceData()` - Experience data array
  - `useFeeStructures()` - Fee structures array
  - `useMonthlySummaries()` - Calculated summaries
  - `useHighCostClaimants()` - Claimant data
  - `useLoadingState()` - Loading and error states

### State Flow
```
Upload Page → Sets experienceData, highCostClaimants
  ↓
Fees Page → Sets feeStructures, generates monthlySummaries
  ↓
Summary Page → Reads monthlySummaries, can recalculate
  ↓
Analytics Page → Reads all data, generates visualizations
```

---

## Link Validation Checklist

### Home Page Links
- ✅ `/dashboard/upload` - Working
- ✅ `/dashboard/fees` - Working
- ✅ `/dashboard/summary` - Working
- ✅ `/dashboard/analytics` - Working

### Upload Page Links
- ✅ `/` - Back to Home
- ✅ `/dashboard/fees` - Next step
- ✅ `/dashboard/summary` - Alternative route
- ✅ `/api/upload?template=experience` - Template download
- ✅ `/api/upload?template=high-cost-claimant` - Template download

### Fees Page Links
- ✅ `/` - Back to Home
- ✅ `/dashboard/upload` - Previous step
- ✅ `/dashboard/summary` - Next step

### Summary Page Links
- ✅ `/` - Back to Home
- ✅ `/dashboard/fees` - Previous step
- ✅ `/dashboard/analytics` - Next step

### Analytics Page Links
- ✅ `/` - Back to Home
- ✅ `/dashboard/summary` - Previous step
- ✅ `/dashboard/upload` - Upload new data

---

## TypeScript Type Definitions

### Data Types
- **ExperienceData** - [types/healthcare.ts](types/healthcare.ts)
- **HighCostClaimant** - [types/healthcare.ts](types/healthcare.ts)
- **FeeStructure** - [types/healthcare.ts](types/healthcare.ts)
- **MonthlySummary** - [types/healthcare.ts](types/healthcare.ts)
- **DashboardKPIs** - [types/healthcare.ts](types/healthcare.ts)
- **CategoryBreakdown** - [types/healthcare.ts](types/healthcare.ts)
- **DiagnosisBreakdown** - [types/healthcare.ts](types/healthcare.ts)

---

## Testing Navigation

### Manual Testing Steps

1. **Home → Upload Flow**
   ```
   Navigate to /
   Click "Start Upload"
   Verify: Lands on /dashboard/upload
   ```

2. **Upload → Fees Flow**
   ```
   Complete upload
   Click "Configure Fees"
   Verify: Lands on /dashboard/fees
   ```

3. **Fees → Summary Flow**
   ```
   Save fees
   Click "Next: View Summary"
   Verify: Lands on /dashboard/summary
   ```

4. **Summary → Analytics Flow**
   ```
   View summaries
   Click "Next: View Analytics"
   Verify: Lands on /dashboard/analytics
   ```

5. **Back Navigation**
   ```
   From any page
   Click "Back to Home"
   Verify: Returns to /
   ```

### API Testing

```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -F "files=@experience-data.csv"

# Test calculations endpoint
curl -X POST http://localhost:3000/api/calculations \
  -H "Content-Type: application/json" \
  -d '{"type":"monthly-summaries","data":{...}}'

# Test template downloads
curl http://localhost:3000/api/upload?template=experience
curl http://localhost:3000/api/upload?template=high-cost-claimant
```

---

## Troubleshooting Navigation Issues

### Issue: 404 Not Found
**Solution**: Verify the page exists at `app/[route]/page.tsx`

### Issue: Page Loads but Shows Error
**Solution**: Check:
1. Component imports are correct
2. Context providers are wrapping the app
3. ClientOnly wrapper for client components
4. Browser console for errors

### Issue: Links Don't Navigate
**Solution**:
- Use Next.js `Link` component from `next/link`
- Use `legacyBehavior` for MUI Button wrapping
- Check Link syntax: `<Link href="/path" legacyBehavior><Button>...</Button></Link>`

### Issue: Data Not Persisting Between Pages
**Solution**: Check HealthcareContext provider in root layout

### Issue: API Calls Failing
**Solution**:
- Verify API route files exist
- Check request body matches expected format
- Validate CORS settings in production
- Check server logs for errors

---

## Production Deployment

### Pre-Deployment Checklist
- [ ] All pages build successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] All imports resolve correctly
- [ ] API routes tested
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Mobile responsive (all pages)
- [ ] Accessibility tested (WCAG AA)

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Build Command
```bash
npm run build
npm start
```

---

## Quick Reference

### All Routes
| Route | Purpose | Key Features |
|-------|---------|-------------|
| `/` | Home | Landing, navigation hub |
| `/dashboard/upload` | Upload | CSV parsing, validation |
| `/dashboard/fees` | Configure | Fee structures, calculations |
| `/dashboard/summary` | Summary | Loss ratios, PMPM |
| `/dashboard/analytics` | Analytics | Charts, KPIs, reports |

### All API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload CSV files |
| `/api/upload?template=experience` | GET | Download template |
| `/api/upload?template=high-cost-claimant` | GET | Download template |
| `/api/calculations` | POST | Calculate summaries/analytics |

---

**Last Updated**: 2024-09-30
**Next.js Version**: 15.5.4
**Total Pages**: 5 main pages + 1 not-found
**Total API Routes**: 2 endpoints