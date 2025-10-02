# C&E Reporting Platform - Development Guide

## Project Overview
Healthcare analytics dashboard for claims and expenses (C&E) reporting with automated calculations and interactive analytics. Built with Next.js, React, and deployed on Render.

**Live URL:** https://becastil-data-prototype-2-webbecastil.onrender.com/

## Project Structure
/app /dashboard /upload ✅ WORKING - Use as reference template /fees ❌ NEEDS FIXING /summary ❌ NEEDS FIXING /analytics ❌ NEEDS FIXING /components - Navigation bar - Footer - Feature cards /api - Upload endpoints - Template downloads

## Critical Issues & Known Bugs ### 🔴 CRITICAL - Currently Broken Pages Three pages are throwing "Something went wrong" errors: - `/dashboard/fees` - Configure Fees page - `/dashboard/summary` - Summary Table page - `/dashboard/analytics` - Analytics Dashboard page **Root Cause:** Client-side JavaScript errors during page load **Priority:** URGENT - These pages must be fixed before any other work ### Working Pages (Reference Templates) - `/` - Homepage ✅ - `/dashboard/upload` - Upload Data page ✅ When creating new pages or fixing broken ones, USE THE UPLOAD PAGE AS A TEMPLATE. ## Development Guidelines ### 1. Consistent Branding - **Official Name:** C&E Reporting Platform - **Browser Title:** C&E Reporting Platform - **Color Scheme:** Blue primary (#2563eb), white, gray accents - **Typography:** Clear, professional, healthcare-appropriate ### 2. Navigation Requirements All pages MUST include: - Persistent top navigation bar with links to all sections - Active page highlighting in navigation - Footer with Quick Links, Legal links, and copyright - Consistent header/logo placement ### 3. Page Structure Template Every dashboard page should follow this structure: ```javascript export default function PageName() { return ( <> {/* Navigation bar is global - included automatically */} <div className="container mx-auto px-4 py-8"> <h1 className="text-3xl font-bold mb-4">[Page Title]</h1> <p className="text-gray-600 mb-8">[Page description]</p> {/* Main content area */} <div className="content-wrapper"> {/* Your content here */} </div> </div> {/* Footer is global - included automatically */} </> ); }
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
Configure Fees Page (/dashboard/fees)
Status: Currently broken - needs implementation Requirements:

Fee structure configuration (PMPM, PEPM, flat rates)
Automatic calculations based on enrollment data
Save/load fee configurations
Preview calculations before applying
Integration with summary calculations
Summary Table Page (/dashboard/summary)
Status: Currently broken - needs implementation Requirements:

Display calculated loss ratios
PMPM (Per Member Per Month) metrics
Monthly performance indicators
Color-coded alerts (red for high loss ratios, green for good)
Sortable/filterable table
Export functionality
Analytics Dashboard Page (/dashboard/analytics)
Status: Currently broken - needs implementation Requirements:

Interactive charts (line, bar, trend analysis)
KPI cards (key metrics at a glance)
High-cost member identification
Drill-down capabilities
PDF report generation
Date range filtering
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
Last Updated: [Current Date] Status: 3 pages need urgent fixes, 2 pages working perfectly

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

