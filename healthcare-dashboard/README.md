# Healthcare Analytics Dashboard

A production-ready C&E (Claims and Expenses) reporting platform built with Next.js 15, Material UI, and TypeScript. This application provides comprehensive healthcare analytics with automated calculations, interactive visualizations, and professional reporting capabilities.

## 🏥 Features

### Core Functionality
- **CSV Data Upload**: Upload experience data and high-cost claimant files with validation
- **Fee Configuration**: Flexible fee structures (PMPM, PEPM, flat, tiered, annual, manual)
- **Automated Calculations**: Loss ratio, PMPM, rolling metrics with real-time updates
- **Interactive Summary Table**: Color-coded performance indicators and conditional formatting
- **Analytics Dashboard**: 6-tile layout with KPIs, trends, and insights
- **PDF Export**: Landscape-oriented reports with charts and tables

### Technical Highlights
- **Next.js 15**: App Router with React 19 and TypeScript
- **Material UI**: Complete UI framework with healthcare-specific theming
- **MUI X DataGrid**: Advanced data grid with editing and export capabilities
- **MUI X Charts**: Interactive charts and visualizations
- **State Management**: React Context with localStorage persistence
- **Responsive Design**: Mobile-first approach with accessibility compliance
- **Type Safety**: Comprehensive TypeScript coverage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production
```bash
npm run build
npm start
```

## 📊 Project Structure

```
healthcare-dashboard/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── upload/              # CSV upload functionality
│   │   ├── fees/                # Fee configuration
│   │   ├── summary/             # Loss ratio summary table
│   │   └── analytics/           # Interactive dashboard
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── lib/                         # Core libraries
│   ├── calculations/            # Healthcare calculation functions
│   ├── store/                   # State management
│   ├── utils/                   # Utility functions
│   └── theme.ts                 # MUI theme configuration
├── types/                       # TypeScript definitions
├── public/templates/            # CSV templates
└── package.json
```

## 📈 Usage Guide

### 1. Upload Data
- Navigate to the Upload page
- Download CSV templates for proper formatting
- Upload experience data and high-cost claimant files

### 2. Configure Fees
- Set up monthly fee structures
- Choose from multiple fee types (PMPM, PEPM, etc.)
- Auto-calculation based on enrollment data

### 3. Review Summary
- View calculated loss ratios and PMPM metrics
- Color-coded performance indicators
- Export capabilities

### 4. Analytics Dashboard
- Interactive KPI cards
- Monthly trend analysis
- Category breakdowns

## 🧮 Key Calculations

### Loss Ratio
```
Monthly Loss Ratio = (Claims + Fees) / Premiums
```

### PMPM (Per Member Per Month)
```
PMPM = Total Cost / Member Months
```

## 🎨 Design System

- **Primary Color**: Medical Blue (#1976d2)
- **Secondary Color**: Healthcare Green (#2e7d32)
- **Performance Colors**: Green (Good) / Orange (Warning) / Red (Critical)

## 🔒 Security Features

- Client-side processing (no PHI sent to servers)
- Secure data handling practices
- Input validation and sanitization
- Session-based data storage

## 📄 Requirements Based On

This implementation strictly follows the specifications in `Healthcare Analytics Dashboard.md`, including:

- Next.js 15 with TypeScript and App Router
- Material UI framework with healthcare theming
- CSV upload with validation and templates
- Fees configuration with auto-calculations
- Summary table with loss ratio calculations
- Analytics dashboard with 6-tile layout
- PDF export in landscape orientation
- All charts and tables fed from uploaded CSV data

## 🚢 Deployment

The application is ready for deployment to Vercel, Netlify, or any Node.js hosting platform.

```bash
npm run build
```

Built following the Healthcare Analytics Dashboard specification for professional C&E reporting.
