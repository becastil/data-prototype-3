# C&E Reporting Platform - Development Guide

## Project Overview
Healthcare analytics dashboard for claims and expenses (C&E) reporting with automated calculations and interactive analytics. Built with Next.js, React, and deployed on Render.

**Live URL:** https://becastil-data-prototype-2-webbecastil.onrender.com/

## Project Structure
/app /dashboard /upload ✅ WORKING - Use as reference template /fees ❌ NEEDS FIXING /summary ❌ NEEDS FIXING /analytics ❌ NEEDS FIXING /components - Navigation bar - Footer - Feature cards /api - Upload endpoints - Template downloads

## ✅ Status Update - PRODUCTION READY

### 🎉 All Core Features Completed
All previously broken pages have been **FIXED and fully functional**:
- ✅ `/dashboard/fees` - **WORKING** - Complete fee configuration with Admin Fees & Adjustments
- ✅ `/dashboard/summary` - **WORKING** - Full 28-row summary table with calculations
- ✅ `/dashboard/analytics` - **WORKING** - Analytics dashboard with charts
- ✅ `/dashboard/upload` - **WORKING** - CSV upload and validation
- ✅ `/` - Homepage **WORKING**

**All pages are production-ready with comprehensive features!** ## Development Guidelines ### 1. Consistent Branding - **Official Name:** C&E Reporting Platform - **Browser Title:** C&E Reporting Platform - **Color Scheme:** Blue primary (#2563eb), white, gray accents - **Typography:** Clear, professional, healthcare-appropriate ### 2. Navigation Requirements All pages MUST include: - Persistent top navigation bar with links to all sections - Active page highlighting in navigation - Footer with Quick Links, Legal links, and copyright - Consistent header/logo placement ### 3. Page Structure Template Every dashboard page should follow this structure: ```javascript export default function PageName() { return ( <> {/* Navigation bar is global - included automatically */} <div className="container mx-auto px-4 py-8"> <h1 className="text-3xl font-bold mb-4">[Page Title]</h1> <p className="text-gray-600 mb-8">[Page description]</p> {/* Main content area */} <div className="content-wrapper"> {/* Your content here */} </div> </div> {/* Footer is global - included automatically */} </> ); }
4. Error Handling
ALWAYS include proper error handling:

Try-catch blocks for async operations
Error boundaries for React components
User-friendly error messages (not technical stack traces)
Loading states during data fetching
Fallback UI for failed states
5. Code Quality Standards
No console errors - Check browser DevTools before committing
TypeScript/ESLint compliance - Fix all warnings
Proper imports - No unused imports, all dependencies declared
Consistent formatting - Use project's prettier/eslint config
Comments - Document complex logic and API interactions
Feature Requirements
Homepage (/)
Feature cards with icons for each main section
"Getting Started" guide with 4 clear steps
Feature highlights: Fast & Automated, Secure & Compliant, Accurate & Reliable
Badge indicators: HIPAA Compliant, Real-time Analytics, Automated Workflows
Stats bar: 4 Simple Steps, 80% Time Saved, 100% Automated, Real-time Analytics
Footer with Quick Links and Legal sections
Upload Data Page (/dashboard/upload)
Multi-step wizard: Upload Files → Validate Data → Review & Confirm
CSV file upload with drag-and-drop
Template downloads for Experience Data and High-Cost Claimants
File validation (max 5 files, 50MB each, CSV only)
Clear file requirements displayed
Error detection and validation feedback
## Configure Fees Page (/dashboard/fees)
**Status: ✅ FULLY IMPLEMENTED**

### Features:
- **Tab 1: Fee Grid** - Overview of all configured fees with V2 fee system
- **Tab 2: Admin Fees Manager** - Dynamic PEPM/PMPM/Flat fee configuration
  - Add/Edit/Delete admin fee line items
  - Auto-calculate based on enrollment data (EE Count or Member Count)
  - Real-time calculation preview
  - Support for TPA fees, Anthem iAX, KPIC Fees, etc.
- **Tab 3: Adjustments** - User-adjustable line items
  - UC Claims Settlement Adjustment (Item #6)
  - Rx Rebates (Item #9)
  - Stop Loss Reimbursement (Item #11)
  - Month-by-month configuration with enable/disable toggle
- **Tab 4: Settings** - Fee calculation documentation
- Tiered and composite stop loss fee support
- Real-time validation and error handling

## Summary Table Page (/dashboard/summary)
**Status: ✅ FULLY IMPLEMENTED - Production Ready!**

### Complete 28-Row Structure:
**Items #1-7: Medical Claims**
- Domestic Medical Facility Claims (IP/OP)
- Non-Domestic Medical Claims (IP/OP)
- Total Hospital Claims
- Non-Hospital Medical Claims
- Total All Medical Claims
- UC Claims Settlement Adjustment (user-adjustable)
- Total Adjusted All Medical Claims

**Items #8-9: Pharmacy**
- Total Rx Claims
- Rx Rebates (user-adjustable)

**Items #10-11: Stop Loss**
- Total Stop Loss Fees (calculated from Configure Fees)
- Stop Loss Reimbursement (user-adjustable)

**Items #12-14: Administrative Fees**
- Consulting fees
- Individual admin fee line items (PEPM/PMPM/Flat auto-calculated)
- Total Admin Fees

**Items #15-16: Totals**
- MONTHLY CLAIMS AND EXPENSES (formula-based calculation)
- CUMULATIVE CLAIMS AND EXPENSES (running total)

**Items #17-18: Enrollment Metrics**
- EE Count (Active & COBRA)
- Member Count

**Items #19-21: PEPM Metrics**
- PEPM Non-Lagged Actual
- PEPM Non-Lagged Cumulative
- Incurred Target PEPM

**Items #22-24: Budget Data**
- 2024-2025 PEPM Budget
- Budget EE Counts
- Annual Cumulative Budget

**Items #25-28: Variance Analysis**
- Actual Monthly Difference
- % Difference (Monthly)
- Cumulative Difference
- % Difference (Cumulative)

### Features:
- ✅ All 28 rows calculate automatically from uploaded CSV + configured fees
- ✅ Color-coded variance cells (red = over budget, green = under budget)
- ✅ Collapsible sections for better organization
- ✅ Tooltips explaining each row's calculation
- ✅ KPI cards showing key metrics
- ✅ Show/Hide adjustments toggle
- ✅ Monthly/Quarterly/Annual view modes
- ✅ Export to CSV functionality (matching spreadsheet format)
- ✅ Auto-calculation when data uploaded
- ✅ Responsive design with sticky headers

## Analytics Dashboard Page (/dashboard/analytics)
**Status: ✅ WORKING**

### Features:
- Interactive charts and visualizations
- KPI cards showing summary metrics
- High-cost member identification
- Date range filtering
- Comprehensive analytics dashboard
Data Flow & State Management
Data Pipeline
Upload → User uploads experience data and high-cost claimant CSV files
Validate → System validates file format, headers, data types
Configure → User sets up fee structures (PMPM/PEPM/flat)
Calculate → System calculates loss ratios, PMPM metrics
Display → Results shown in Summary Table
Analyze → Interactive analytics dashboard with charts
Export → Generate PDF reports for stakeholders
State Considerations
Uploaded file data should persist across pages
Fee configurations should be saveable/retrievable
Calculations should update in real-time when fees change
Error states should be handled gracefully at each step
API Endpoints (To Be Implemented)
POST /api/upload - Upload CSV files GET /api/upload?template - Download templates POST /api/fees/configure - Save fee configuration GET /api/fees - Get current fee config POST /api/calculate - Calculate loss ratios & metrics GET /api/summary - Get summary table data GET /api/analytics - Get analytics data POST /api/export - Generate PDF report
Security & Compliance
HIPAA Considerations
All data handling must be HIPAA-conscious
No PHI (Protected Health Information) in logs
Encryption for data at rest and in transit
Audit logging for data access
Secure file upload/download
Data Validation
CSV headers must match templates exactly
Numeric fields must contain valid numbers
Date fields must be YYYY-MM format
File size limit: 50MB per file
Maximum 5 files total per upload
Testing Checklist
Before marking any work as complete, verify:

[ ] Page loads without errors
[ ] No console errors in browser DevTools
[ ] Navigation bar appears and works
[ ] Footer appears correctly
[ ] All links navigate properly
[ ] Responsive on mobile/tablet/desktop
[ ] Loading states show during async operations
[ ] Error states display user-friendly messages
[ ] Forms validate input properly
[ ] Data persists correctly across page navigation
Deployment
Platform: Render.com
Build Command: npm run build (or appropriate for your setup)
Auto-deploy: Connected to main branch
Environment: Node.js
Common Pitfalls to Avoid
Don't break what's working - The homepage and upload page work perfectly. Don't modify shared components without testing all pages.

Always check imports - Missing imports are the #1 cause of page crashes.

Handle async properly - Always use try-catch with async/await, handle loading states.

Test navigation - Every link should work, no dead ends.

Consistent styling - Use existing Tailwind classes and component patterns.

Data dependencies - Some pages require uploaded data to function. Handle empty states gracefully.

Priority Order for Development
Fix broken pages (fees, summary, analytics) - CRITICAL
Implement fee configuration - HIGH
Build summary table with calculations - HIGH
Create analytics dashboard with charts - HIGH
Add export functionality - MEDIUM
Enhance upload validation - MEDIUM
Add user authentication - FUTURE
Implement data persistence (database) - FUTURE
Questions? Issues?
When encountering errors:

Check browser console for exact error message
Compare with working pages (homepage, upload)
Verify all imports are correct
Check for undefined variables or null access
Ensure async operations have proper error handling
Maintenance Notes
Keep dependencies updated regularly
Run security audits (npm audit)
Test thoroughly before each deployment
Document any architectural decisions
Keep this CLAUDE.md file updated with new findings
Last Updated: 2025-01-XX
Status: ✅ **ALL PAGES WORKING - PRODUCTION READY**

---

## 🎉 NEW IMPLEMENTATION SUMMARY (Latest Update)

### Summary Table Implementation (Complete 28-Row System)

#### Files Created/Modified:
1. **[types/summary.ts](types/summary.ts)** - NEW
   - Complete type definitions for all 28 rows
   - UserAdjustableLineItem, CompleteSummaryRow, SummaryCalculationInput types
   - Export configuration types

2. **[lib/calculations/summaryCalculations.ts](lib/calculations/summaryCalculations.ts)** - NEW
   - Complete calculation engine for all 28 rows
   - Smart fee calculation (PEPM/PMPM/Flat/Tiered/Composite)
   - Medical claims aggregation (Items #1-7)
   - Pharmacy with adjustments (Items #8-9)
   - Stop loss with reimbursements (Items #10-11)
   - Admin fees with auto-calculation (Items #12-14)
   - Monthly and cumulative totals (Items #15-16)
   - PEPM metrics (Items #19-21)
   - Variance analysis (Items #25-28)

3. **[lib/store/HealthcareContext.tsx](lib/store/HealthcareContext.tsx)** - UPDATED
   - Added userAdjustments state and actions
   - Added budgetData state and actions
   - New selector hooks: useUserAdjustments(), useBudgetData()

4. **[app/dashboard/summary/components/EnhancedSummaryTable.tsx](app/dashboard/summary/components/EnhancedSummaryTable.tsx)** - NEW
   - Complete 28-row table component
   - Collapsible sections for organization
   - Color-coded variance cells
   - Tooltips on every row
   - Professional formatting

5. **[app/dashboard/summary/page.tsx](app/dashboard/summary/page.tsx)** - COMPLETELY REBUILT
   - Integration with calculation engine
   - Auto-calculation from CSV + Fees
   - KPI cards
   - Export to CSV
   - Real-time updates

6. **[app/dashboard/fees/components/AdjustableLineItems.tsx](app/dashboard/fees/components/AdjustableLineItems.tsx)** - NEW
   - Manage UC Settlement, Rx Rebates, Stop Loss Reimbursement
   - Add/Edit/Delete adjustments
   - Month-by-month configuration
   - Enable/disable toggles

7. **[app/dashboard/fees/components/AdminFeesManager.tsx](app/dashboard/fees/components/AdminFeesManager.tsx)** - NEW
   - Dynamic admin fee line items
   - PEPM/PMPM/Flat fee types with auto-calculation
   - Real-time preview based on enrollment
   - Customizable fee names and descriptions

8. **[app/dashboard/fees/page.tsx](app/dashboard/fees/page.tsx)** - UPDATED
   - Added new tabs: Admin Fees, Adjustments, Settings
   - Integration with new components
   - Enhanced user experience

9. **[app/api/summary/calculate/route.ts](app/api/summary/calculate/route.ts)** - NEW
   - Backend API for summary calculations
   - Validation and error handling
   - Returns all 28 calculated rows

10. **[app/api/summary/export/route.ts](app/api/summary/export/route.ts)** - NEW
    - CSV export endpoint
    - Formats all 28 rows matching spreadsheet structure
    - Downloads as CSV file

### Key Formulas Implemented (Matching Your Spreadsheet):

**Item #3:** Total Hospital Claims = Domestic (#1) + Non-Domestic (#2)

**Item #5:** Total All Medical = Hospital (#3) + Non-Hospital (#4)

**Item #7:** Total Adjusted Medical = All Medical (#5) + UC Adjustment (#6)

**Item #10:** Stop Loss Fees = Smart calculation (Tiered or Composite)
- Tiered: `(Singles × $35) + (Families × $65)`
- Composite: `Total × $47`

**Item #12-14:** Admin Fees
- PEPM fees: `Amount × EE Count (#17)`
- PMPM fees: `Amount × Member Count (#18)`
- Flat fees: `Amount`
- Total = Sum of all fees

**Item #15:** MONTHLY CLAIMS AND EXPENSES
```
= Total Adjusted Medical (#7)
+ Rx Claims (#8)
+ Rx Rebates (#9)
+ Stop Loss Fees (#10)
- Stop Loss Reimbursement (#11)
+ Total Admin Fees (#14)
```

**Item #16:** CUMULATIVE = Running total of #15

**Item #19:** PEPM Actual = Monthly C&E (#15) / EE Count (#17)

**Item #20:** PEPM Cumulative = Cumulative C&E (#16) / EE Count (#17)

**Item #25:** Monthly Difference = Actual - Budget

**Item #26:** % Difference Monthly = (Difference / Budget) × 100

**Item #27:** Cumulative Difference = Cumulative Actual - Cumulative Budget

**Item #28:** % Difference Cumulative = (Cumulative Diff / Cumulative Budget) × 100

### Testing Instructions:

1. **Upload CSV Data:**
   - Go to `/dashboard/upload`
   - Upload Experience Data CSV
   - System validates and stores data

2. **Configure Fees:**
   - Go to `/dashboard/fees`
   - **Tab 1 (Fee Grid):** View all configured fees
   - **Tab 2 (Admin Fees):** Add PEPM/PMPM/Flat administrative fees
     - Example: "TPA Claims Fee (PEPM)" - $32.40 PEPM
     - System auto-calculates: $32.40 × EE Count
   - **Tab 3 (Adjustments):** Add month-specific adjustments
     - UC Settlement, Rx Rebates, Stop Loss Reimbursement
   - Click "Save Configuration"

3. **View Summary Table:**
   - Go to `/dashboard/summary`
   - System auto-calculates all 28 rows
   - View KPI cards at top
   - Click section headers to expand/collapse
   - Hover over row names for calculation explanations
   - Toggle "Show Adjustments" to hide/show user-editable rows
   - Click "Export CSV" to download

4. **Verify Calculations:**
   - Check that totals match your spreadsheet formulas
   - Verify color coding (red = over budget, green = under)
   - Confirm PEPM calculations are correct
   - Test adjustments impact on totals

### Production Deployment Checklist:

- ✅ All TypeScript errors resolved
- ✅ All calculations match spreadsheet logic
- ✅ No console errors in browser
- ✅ All pages load without "Something went wrong"
- ✅ CSV export generates correct format
- ✅ Responsive design works on mobile/tablet/desktop
- ✅ Error handling implemented throughout
- ✅ User adjustments persist in localStorage
- ✅ Real-time calculations update immediately
- ✅ Documentation updated

**The system is production-ready and fully functional!**

--- ## **Additional Sections You Can Add** Depending on your needs, you can also add: ### **Technology Stack Section** ```markdown ## Technology Stack - **Frontend:** React, Next.js 13+ - **Styling:** Tailwind CSS - **Icons:** React Icons or Font Awesome - **Charts:** Recharts / Chart.js (to be implemented) - **File Handling:** Papaparse for CSV parsing - **PDF Generation:** jsPDF or react-pdf (to be implemented) - **State Management:** React Context / Zustand (if used)
Environment Variables Section
## Environment Variables
NEXT_PUBLIC_API_URL=your_api_url DATABASE_URL=your_database_url

Never commit .env files to git!
Git Workflow Section
## Git Workflow
- Main branch: `main` (production)
- Development branch: `dev`
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`

Always test locally before pushing to main!
Performance Considerations
## Performance
- Lazy load charts and heavy components
- Implement pagination for large data tables
- Use React.memo for expensive components
- Optimize images and assets
- Minimize bundle size

