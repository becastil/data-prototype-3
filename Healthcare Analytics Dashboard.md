# Healthcare Analytics Dashboard: Complete Technical Research Report

## Table of Contents
- [Project Overview](#project-overview)
  - [Goal: Create a production-ready Healthcare Analytics Dashboard web application with the following specifications](#goal-create-a-production-ready-healthcare-analytics-dashboard-web-application-with-the-following-specifications)
  - [Framework & Stack](#framework--stack)
  - [Core Workflow (4 Steps)](#core-workflow-4-steps)
  - [Advanced Features](#advanced-features)
  - [Technical Organization](#technical-organization)
  - [Specific Calculations](#specific-calculations)
  - [Sample Data Requirements](#sample-data-requirements)
    - [Experience Data Template: Input vs Backend Calculations](#experience-data-template-input-vs-backend-calculations)
- [Building production-ready healthcare analytics solutions](#building-production-ready-healthcare-analytics-solutions)
- [Core Technical Stack Architecture](#core-technical-stack-architecture)
  - [Next.js 15 with React 19 foundation](#nextjs-15-with-react-19-foundation)
  - [Material UI ecosystem for healthcare interfaces](#material-ui-ecosystem-for-healthcare-interfaces)
- [Healthcare Analytics Standards and Metrics](#healthcare-analytics-standards-and-metrics)
  - [Dashboard design patterns for medical data](#dashboard-design-patterns-for-medical-data)
  - [Financial metrics and calculations](#financial-metrics-and-calculations)
- [Security and Compliance Implementation](#security-and-compliance-implementation)
  - [HIPAA Security Rule requirements](#hipaa-security-rule-requirements)
  - [CSV processing for healthcare data](#csv-processing-for-healthcare-data)
- [Technical Implementation Patterns](#technical-implementation-patterns)
  - [State management architecture](#state-management-architecture)
  - [Accessibility and responsive design](#accessibility-and-responsive-design)
- [Healthcare Data Structures and Standards](#healthcare-data-structures-and-standards)
  - [Claims data architecture](#claims-data-architecture)
  - [Performance optimization strategies](#performance-optimization-strategies)
- [Implementation Roadmap](#implementation-roadmap)
- [Conclusion](#conclusion)
- [Supplementary Narrative](#supplementary-narrative)
  - [New Section: PDF Export Functionality](#new-section-pdf-export-functionality)
- [MUI Complete Code Snippets Collection](#mui-complete-code-snippets-collection)

---

## Project Overview

### Goal: Create a **production-ready Healthcare Analytics Dashboard web application** with the following specifications:
### **Framework & Stack**:
   * Next.js 15 (App Router) with TypeScript
   * Tailwind CSS + Framer Motion for styling and animations
   * **Material UI (MUI)** as the primary UI framework (tables, forms, navigation, layout, charts)
   * Ant Design (optional, only if you want selective components not covered by MUI)
   * React Hook Form for input handling
   * Zod for schema validation
### **Core Workflow (4 Steps)**:
1.                      **CSV Upload & Data Processing**
* Accept multiple files (up to 5) for Experience Data (monthly claims by category) and High-Cost Claimants (member-level).
* Enforce strict header validation.
* Intelligent auto-mapping of CSV fields.
* Provide downloadable CSV templates with correct headers.
* Server-side parsing with error handling.
2.                      **Monthly Fees Configuration**
* Support multiple fee structures (flat, PEPM, PMPM, tiered, annual, manual).
* Auto-calculate totals using enrollment data.
* Allow effective dates and one-off adjustments.
* Provide Excel-like grid input with paste support.
3.                      **Summary Table & Loss Ratio Calculations**
* Use **MUI DataGrid** for calculated monthly summaries: claims, fees, costs, and loss ratios (monthly + rolling-12).
* Include color-coded performance indicators (conditional cell formatting).
* Real-time updates and PDF export.
4.                      **Interactive Charts & Analytics Dashboard**
* Build a **6-tile analytics dashboard** using **MUI charts** (or libraries in the MUI ecosystem):
   1. KPI Cards: Total Claims, Total Cost, Average Loss Ratio, Average Claim
   2. Stacked Bar Chart: Monthly data with loss ratio trend overlay
   3. Top Categories: Breakdown of highest cost categories
   4. High-Cost Claimants: Member analysis (if data available)
   5. Trend Analysis: Rolling metrics and comparisons
   6. Diagnosis Breakdown: Top conditions and costs
* Interactive filtering and drill-downs.
### **Advanced Features**:
   * Executive-level PDF report (2 pages: summary + charts).
   * Strict financial data validation with user-friendly error messages.
   * HIPAA-conscious design principles (input sanitization, safe handling).
   * Accessibility (ARIA labels, keyboard navigation).
   * Responsive/mobile-friendly design.
### **Technical Organization**:
   * app/ structure with subfolders for each step, dashboard, and reporting.
   * lib/ folder for calculations, validation schemas, and state management.
   * State persistence via React Context + localStorage.
### **Specific Calculations**:
   * Monthly Loss Ratio = (Claims + Fees) ÷ Premiums.
   * Rolling-12 Loss Ratio = 12-month sums of (Claims + Fees ÷ Premiums).
   * Derived categories (e.g., Non-Domestic = Total - Domestic).
   * Budget vs Actual comparisons with variance.
### **Sample Data Requirements**:
   * Provide working CSV templates (experience & high-cost claimants).
   * Include realistic healthcare claims categories, diagnosis breakdowns, demographics, and stop-loss examples.

#### Experience Data Template: Input vs Backend Calculations

The CSV template should only capture raw input fields. All roll-ups and totals are calculated programmatically on the backend. This ensures consistent formulas, reduces user error, and makes it easier to update logic in the future.

Inputs (must be present in the CSV upload)

Domestic Medical Facility Claims (IP/OP)

Non-Domestic Medical Claims (IP/OP)

Non-Hospital Medical Claims

Adjustments (manual entries, replaces UC Claims Settlement Adjustment)

Run Out Claims (optional: keep as input if supplied directly, otherwise backend projects it)

Medical Claims Paid via EBA (if directly provided by feed)

ESI Pharmacy Claims

Rx Rebates

Consulting

TPA Claims/COB

Total Stop Loss Fees (if directly provided by feed)

Stop Loss Reimbursement (if directly provided by feed)

Backend-calculated (do not appear in the CSV; derived after upload)

Total Hospital Medical Claims (IP/OP) = Domestic + Non-Domestic

Total All Medical Claims = Total Hospital + Non-Hospital

Total Adjusted Medical Claims = Total All Medical Claims + Adjustments

Total Medical Claims = Total Adjusted + Run Out Claims + Medical Claims Paid via EBA

Total Rx Claims = ESI Pharmacy Claims – Rx Rebates

Page Layout Rule

Page 1: The mirrored Experience Data table (raw inputs + backend totals).

Page 2+: Charts and supporting mini-tables generated from the processed data.
**Goal**: Deliver a polished, enterprise-ready healthcare analytics application optimized for executive reporting, built entirely with **MUI components (including charts)** for a consistent design system.


---

## Building production-ready healthcare analytics solutions

This comprehensive research synthesizes the latest technical requirements and best practices for developing a production-ready Healthcare Analytics Dashboard web application using modern web technologies and healthcare industry standards.

---

## Core Technical Stack Architecture

### Next.js 15 with React 19 foundation

The latest Next.js 15 release brings significant architectural improvements that align perfectly with healthcare application requirements. The framework now fully embraces **React 19 with Server Components as the default**, enabling superior performance for data-heavy healthcare dashboards. A critical breaking change requires converting key APIs to asynchronous patterns - cookies, headers, params, and searchParams now require await statements.

The optimal folder structure for healthcare applications employs route groups for logical separation: `(dashboard)` for analytics interfaces, `(auth)` for authentication flows, and parallel routes (`@modal`, `@charts`) for complex dashboard layouts. Server Components handle data fetching and authentication, while Client Components manage interactivity and real-time updates. The new **Partial Prerendering** feature enables static shell rendering with dynamic content streaming, perfect for healthcare dashboards that need instant loading with real-time data.

TypeScript integration has matured significantly in version 15.5, with stable typed routes and automatic route props helpers that eliminate boilerplate code. Healthcare data models benefit from comprehensive type safety with Zod validation schemas integrated throughout the stack. Performance optimizations include automatic code splitting, image optimization with Next.js Image component, and intelligent caching strategies that respect HIPAA compliance requirements.

### Material UI ecosystem for healthcare interfaces

**MUI DataGrid Premium** ($99/developer) emerges as the essential component for healthcare analytics, providing row grouping, aggregation functions, and Excel export capabilities crucial for medical data analysis. The component handles millions of rows through virtualization while maintaining HIPAA-compliant data handling. Advanced features include conditional formatting for clinical thresholds, real-time calculation updates, and custom aggregation functions for healthcare metrics like mortality rates and readmission percentages.

MUI X Charts provides comprehensive visualization capabilities with built-in accessibility features. Healthcare dashboards leverage composite charts combining bar and line graphs for department metrics, specialized medical visualizations like heat maps for patient flow analysis, and interactive tooltips with drill-down capabilities. The theming system supports professional healthcare branding with medical blue (#1976d2) and healthcare green (#2e7d32) color schemes optimized for extended viewing periods.

Integration with Tailwind CSS requires careful configuration - disabling Tailwind's preflight to let MUI handle CSS reset, setting the important selector to `#root` for selective overrides, and using Tailwind primarily for utility classes rather than component styling. Framer Motion animations integrate through the component prop pattern, enabling smooth transitions without compromising MUI's internal functionality.

---

## Healthcare Analytics Standards and Metrics

### Dashboard design patterns for medical data

Industry-standard healthcare dashboards follow a **hierarchical information architecture** with three distinct levels. Executive dashboards display 70+ KPIs using color-coded performance indicators, operational dashboards provide detailed metrics with drill-down capabilities, and clinical dashboards focus on patient-specific care quality indicators. The single-screen view principle ensures critical metrics remain visible while supporting progressive disclosure for detailed analysis.

Leading platforms like Health Catalyst demonstrate 25% reduction in manual dashboard creation through automated data integration from enterprise data warehouses. The Model for Improvement methodology integration enables Plan-Do-Study-Act cycle tracking directly within dashboards. Real-time or near real-time data integration has become the standard, with automated collection eliminating error-prone manual processes.

### Financial metrics and calculations

**Medical Loss Ratio (MLR)** calculations form the foundation of healthcare financial analytics. The Affordable Care Act mandates minimum MLR of 80% for individual/small group markets and 85% for large groups. The calculation formula `(Claims Costs + Quality Improvement Expenses) ÷ Premium Revenue` requires precise tracking of medical claims, quality improvement activities, and premium adjustments for taxes and regulatory fees.

Per Member Per Month (PMPM) metrics typically range from $200-$500, calculated as `Total Healthcare Costs ÷ Member Months`. These metrics drive network evaluation, cost trend analysis, and budget forecasting. Stop-loss insurance thresholds vary by market size - small groups typically set $75,000-$150,000 individual limits, while large groups exceed $350,000. Aggregate stop-loss attachment points usually target 125% of expected annual claims.

High-cost claimant analysis reveals that 1.2% of members generate 31% of total spending, with average annual costs of $122,382. Machine learning models achieve 84-91% AUC-ROC accuracy in predicting high-cost cases using 6,000+ potential variables including demographics, clinical history, utilization patterns, and social determinants.

---

## Security and Compliance Implementation

### HIPAA Security Rule requirements

The December 27, 2024 Notice of Proposed Rulemaking fundamentally changes HIPAA compliance by **eliminating the distinction between "required" and "addressable" specifications**. All security measures now require written policies with regular testing and updates. Technical safeguards mandate unique user identification, automatic logoff after 15 minutes of inactivity, end-to-end encryption for all PHI transmissions, and comprehensive audit controls capturing user IDs, timestamps, actions, and accessed resources.

Encryption standards require AES-256 for data at rest with FIPS 140-2 Level 2 compliant key management. Data in transit demands TLS 1.2 minimum (TLS 1.3 recommended) with perfect forward secrecy and certificate pinning for API communications. The 18 HIPAA identifiers must be carefully managed, including names, geographic data smaller than state level, dates related to individuals, and all unique identifying numbers or codes.

Business Associate Agreements remain mandatory for cloud providers and third-party services. The June 2024 HHS guidance on online tracking technologies requires careful evaluation of analytics tools and tracking pixels. Audit logs must retain data for minimum 6 years with tamper-evident mechanisms and automated backup processes.

### CSV processing for healthcare data

Healthcare CSV processing requires robust security measures including 50MB file size limits, MIME type validation beyond file extensions, virus scanning before processing, and automatic cleanup of temporary encrypted storage. PHI detection patterns must identify SSNs, dates of birth, medical record numbers, and other sensitive identifiers using regular expressions and fuzzy matching algorithms.

Memory-efficient processing employs stream processing for files exceeding 10MB, chunking strategies processing 2,000 records per batch, and parallel processing with worker threads for non-PHI operations. Quality checks validate missing required fields, ensure data format consistency, perform cross-field validation, detect duplicate records, and verify reference data against provider and insurance databases.

---

## Technical Implementation Patterns

### State management architecture

**Zustand emerges as the recommended state management solution** for healthcare applications, offering simple API design, built-in persistence with encryption, and optimized performance for real-time medical data. The library supports HIPAA-compliant data handling with audit trail integration. Multi-step workflows leverage FormProvider patterns with useReducer for complex state, localStorage integration for form persistence across sessions, and automatic session timeout with data clearing for compliance.

Real-time updates utilize WebSocket connections with automatic reconnection, optimistic UI updates for instant feedback, and React Query integration for server state synchronization. The healthcare calculation engine implements rule-based systems for medical formulas like BMI and cardiovascular risk scores, with dependency management for interdependent calculations and comprehensive audit trails for regulatory compliance.

### Accessibility and responsive design

WCAG 2.1 AA compliance requires comprehensive accessibility features including proper ARIA patterns for data grids with role attributes and keyboard navigation, text alternatives and data tables for chart accessibility, focus management in multi-step workflows with screen reader announcements, and live regions for real-time data updates. Medical terminology requires pronunciation guidance for screen readers, while color-independent data representation supports color-blind users.

The mobile-first responsive strategy employs progressive disclosure on smaller screens, minimum 44px touch targets for reliable interaction, and context-aware content prioritization. Breakpoints follow a standard pattern: mobile (320px) for essential patient info, tablet (768px) for two-column layouts, desktop (1024px+) for full dashboards, and large screens (1440px+) for multi-panel power user interfaces.

---

## Healthcare Data Structures and Standards

### Claims data architecture

The **ANSI ASC X12N 837 Version 5010A1** standard defines healthcare claims structure with hierarchical loops for billing providers, subscribers, patients, claims, and service lines. JSON structures map these elements including claim IDs, patient demographics, service details with CPT codes and ICD-10 diagnoses, and billing information with NPI identifiers.

ICD-10-CM codes use up to 7 alphanumeric characters with structure defining category, etiology, anatomic site, severity, and extension. The 2025 updates include expanded mental health codes and improved specificity for chronic conditions. CPT codes maintain 5-digit numeric format with categories for anesthesia (00100-01999), surgery (10000-69999), radiology (70000-79999), pathology (80000-89999), and evaluation/management (99200-99499).

### Performance optimization strategies

Production deployments require comprehensive optimization including code splitting by healthcare modules, lazy loading for non-critical components, memoization for expensive medical calculations, and virtual scrolling for large patient datasets. The DataGridPremium component handles datasets exceeding 100,000 records through intelligent virtualization with 200px row buffering and 150px column buffering.

Server-side rendering optimizes initial load times while maintaining dynamic functionality through Partial Prerendering. Chart libraries implement on-demand rendering with progressive enhancement for complex visualizations. Bundle size optimization targets sub-3 second initial load times through tree shaking, dynamic imports, and optimized package imports for icon libraries.

---

## Implementation Roadmap

The recommended five-phase implementation approach ensures systematic deployment of healthcare analytics capabilities. **Phase 1** establishes core infrastructure with MUI theme configuration, Tailwind CSS integration, Next.js routing architecture, and TypeScript foundations. **Phase 2** implements DataGrid Premium with healthcare-specific columns, MUI X Charts for medical visualizations, and real-time data integration patterns.

**Phase 3** develops multi-step forms with React Hook Form and Zod validation, file upload components with CSV processing, and Framer Motion animations for enhanced UX. **Phase 4** addresses security with HIPAA compliance implementation, comprehensive audit logging, role-based access control, and data encryption at all layers. **Phase 5** completes the deployment with accessibility testing, performance optimization, compliance validation, and production monitoring setup.

---

## Conclusion

Building a production-ready Healthcare Analytics Dashboard requires careful integration of modern web technologies with healthcare-specific requirements. The combination of Next.js 15's performance capabilities, Material UI's comprehensive component library, and robust security implementation creates a foundation capable of meeting stringent healthcare standards. Success depends on maintaining HIPAA compliance from project inception, implementing comprehensive testing strategies, and ensuring accessibility for all healthcare professionals. Organizations should prepare for the strengthened HIPAA Security Rule requirements while leveraging the latest framework capabilities to deliver responsive, secure, and user-friendly healthcare analytics solutions.

---

## MUI Complete Code Snippets Collection

A comprehensive collection of Material UI (MUI) code snippets covering all major components and features.

### Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Data Grid](#data-grid)
3. [Buttons](#buttons)
4. [Text Fields & Inputs](#text-fields--inputs)
5. [Dialogs & Modals](#dialogs--modals)
6. [Select & Dropdowns](#select--dropdowns)
7. [Autocomplete](#autocomplete)
8. [Tables](#tables)
9. [Switches & Toggles](#switches--toggles)
10. [Sliders](#sliders)
11. [Tabs](#tabs)
12. [App Bar & Toolbar](#app-bar--toolbar)
13. [Cards](#cards)
14. [Drawer & Sidebar](#drawer--sidebar)
15. [Grid Layout](#grid-layout)
16. [Snackbar & Toast](#snackbar--toast)
17. [Popover & Tooltip](#popover--tooltip)
18. [Lists & List Items](#lists--list-items)
19. [Timeline](#timeline)
20. [Date & Time Pickers](#date--time-pickers)
21. [Stepper](#stepper)
22. [Pagination](#pagination)
23. [Forms](#forms)
24. [Typography](#typography)
25. [Theme Customization](#theme-customization)

---

## Installation & Setup

### Basic Installation

```bash
# Using npm
npm install @mui/material @emotion/react @emotion/styled

# Using yarn
yarn add @mui/material @emotion/react @emotion/styled

# For icons
npm install @mui/icons-material
```

### TypeScript Setup

```typescript
// For theme augmentation
import type {} from '@mui/x-data-grid/themeAugmentation';

const theme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: 'red',
        },
      },
    },
  },
});
```

### Adding Roboto Font

```html
<!-- In public/index.html -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
```

---

## Data Grid

### Basic Data Grid

```jsx
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', type: 'number', width: 110 },
  { field: 'email', headerName: 'Email', width: 200 },
];

const rows = [
  { id: 1, name: 'John Doe', age: 35, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 28, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 42, email: 'bob@example.com' },
];

function BasicDataGrid() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
}
```

### Data Grid Pro with Advanced Features

```jsx
import { DataGridPro } from '@mui/x-data-grid-pro';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { 
    field: 'fullName',
    headerName: 'Full name',
    width: 150,
    valueGetter: (params) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'dateCreated',
    headerName: 'Date Created',
    type: 'date',
    width: 180,
    valueFormatter: (params) => {
      return new Date(params.value).toLocaleDateString();
    },
  },
];

function AdvancedDataGrid() {
  const [rows, setRows] = React.useState(initialRows);

  const handleProcessRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  return (
    <DataGridPro
      rows={rows}
      columns={columns}
      processRowUpdate={handleProcessRowUpdate}
      onProcessRowUpdateError={(error) => console.error(error)}
      experimentalFeatures={{ newEditingApi: true }}
    />
  );
}
```

### Data Grid with API Integration

```jsx
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID' },
  { field: 'title', headerName: 'Title', width: 300 },
  { field: 'body', headerName: 'Body', width: 600 }
];

const DataGridWithAPI = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((data) => data.json())
      .then((data) => {
        setTableData(data);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={tableData}
        columns={columns}
        pageSize={12}
        loading={loading}
        rowsPerPageOptions={[12, 25, 50]}
        checkboxSelection
      />
    </div>
  );
};

export default DataGridWithAPI;
```

---

## Buttons

### Basic Button Variants

```jsx
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';

export default function BasicButtons() {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </Stack>
  );
}
```

### Buttons with Icons

```jsx
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';

export default function IconButtons() {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="outlined" startIcon={<DeleteIcon />}>
        Delete
      </Button>
      <Button variant="contained" endIcon={<SendIcon />}>
        Send
      </Button>
    </Stack>
  );
}
```

### Button Sizes and Colors

```jsx
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function ButtonSizes() {
  return (
    <Stack spacing={2} direction="row">
      <Button variant="contained" size="small">Small</Button>
      <Button variant="contained" size="medium">Medium</Button>
      <Button variant="contained" size="large">Large</Button>
      <Button variant="contained" color="primary">Primary</Button>
      <Button variant="contained" color="secondary">Secondary</Button>
      <Button variant="contained" color="success">Success</Button>
      <Button variant="contained" color="error">Error</Button>
    </Stack>
  );
}
```

### Loading Button

```jsx
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

function LoadingButtonExample() {
  const [loading, setLoading] = React.useState(false);
  
  function handleClick() {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }

  return (
    <LoadingButton
      loading={loading}
      loadingPosition="start"
      startIcon={<SaveIcon />}
      variant="contained"
      onClick={handleClick}
    >
      Save
    </LoadingButton>
  );
}
```

### Reusable Form Action Buttons

```jsx
import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const FormActionButton = ({
  children,
  loading = false,
  actionType = 'submit',
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const buttonTypes = {
    submit: { type: 'submit', defaultVariant: 'contained', defaultColor: 'primary' },
    reset: { type: 'reset', defaultVariant: 'outlined', defaultColor: 'secondary' },
    cancel: { type: 'button', defaultVariant: 'text', defaultColor: 'inherit' },
  };

  const { type, defaultVariant, defaultColor } = buttonTypes[actionType] || buttonTypes.submit;
  const buttonVariant = variant || defaultVariant;
  const buttonColor = color || defaultColor;

  return (
    <Button
      type={type}
      variant={buttonVariant}
      color={buttonColor}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      {...props}
    >
      {children}
    </Button>
  );
};

// Specialized button components
export const SubmitButton = (props) => (
  <FormActionButton actionType="submit" {...props} />
);

export const ResetButton = (props) => (
  <FormActionButton actionType="reset" {...props} />
);

export const CancelButton = (props) => (
  <FormActionButton actionType="cancel" {...props} />
);
```

---

## Text Fields & Inputs

### Basic TextField Variants

```jsx
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export default function TextFieldVariants() {
  return (
    <Stack spacing={2}>
      <TextField label="Outlined" variant="outlined" />
      <TextField label="Filled" variant="filled" />
      <TextField label="Standard" variant="standard" />
      <TextField 
        label="With Helper Text" 
        helperText="Some important text"
        variant="outlined" 
      />
      <TextField 
        label="Error" 
        error 
        helperText="Incorrect entry."
        variant="outlined" 
      />
      <TextField
        label="Multiline"
        multiline
        rows={4}
        defaultValue="Default Value"
      />
    </Stack>
  );
}
```

### Input with Adornments

```jsx
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';

function InputAdornments() {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <>
      <TextField
        label="Username"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          ),
        }}
        variant="outlined"
      />
      
      <TextField
        label="Amount"
        type="number"
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
      
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </>
  );
}
```

### Controlled TextField

```jsx
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

function ControlledTextField() {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    
    // Validation example
    if (newValue.length < 3) {
      setError(true);
      setHelperText('Minimum 3 characters required');
    } else {
      setError(false);
      setHelperText('');
    }
  };

  return (
    <TextField
      label="Controlled Input"
      value={value}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      fullWidth
      variant="outlined"
    />
  );
}
```

---

## Dialogs & Modals

### Basic Dialog

```jsx
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function BasicDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Use Google's location service?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Let Google help apps determine location. This means sending anonymous
            location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
```

### Form Dialog

```jsx
import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubscribe = () => {
    console.log('Email:', email);
    handleClose();
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open form dialog
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubscribe}>Subscribe</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
```

### Full-Screen Dialog

```jsx
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open full-screen dialog
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Sound
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        {/* Dialog content goes here */}
      </Dialog>
    </div>
  );
}
```

---

## Select & Dropdowns

### Basic Select

```jsx
import React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect() {
  const [age, setAge] = React.useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={age}
          label="Age"
          onChange={handleChange}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
```

### Multiple Select

```jsx
import React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
];

export default function MultipleSelectChip() {
  const theme = useTheme();
  const [personName, setPersonName] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <Select
        multiple
        value={personName}
        onChange={handleChange}
        input={<OutlinedInput label="Name" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
      >
        {names.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
```

### Select with Icons

```jsx
import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';

export default function SelectWithIcons() {
  const [mail, setMail] = React.useState('');

  const handleChange = (event) => {
    setMail(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Mail</InputLabel>
      <Select
        value={mail}
        onChange={handleChange}
        label="Mail"
      >
        <MenuItem value="inbox">
          <ListItemIcon>
            <InboxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Inbox</ListItemText>
        </MenuItem>
        <MenuItem value="drafts">
          <ListItemIcon>
            <DraftsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Drafts</ListItemText>
        </MenuItem>
        <MenuItem value="sent">
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sent</ListItemText>
        </MenuItem>
      </Select>
    </FormControl>
  );
}
```

---

## Autocomplete

### Basic Autocomplete

```jsx
import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const options = ['Option 1', 'Option 2', 'Option 3'];

export default function BasicAutocomplete() {
  return (
    <Autocomplete
      options={options}
      renderInput={(params) => <TextField {...params} label="Choose an option" />}
    />
  );
}
```

### Controlled Autocomplete

```jsx
import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const options = ['Option 1', 'Option 2', 'Option 3'];

export default function ControlledAutocomplete() {
  const [value, setValue] = useState(options[0]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      options={options}
      renderInput={(params) => <TextField {...params} label="Controlled" variant="outlined" />}
    />
  );
}
```

### Asynchronous Autocomplete

```jsx
import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

const countriesApi = "https://restcountries.com/v3.1/subregion/Western%20Africa";

function AsyncAutocomplete() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    if (loading) {
      fetch(countriesApi)
        .then((res) => res.json())
        .then((data) => {
          setOptions(data);
        });
    }
  }, [loading]);

  return (
    <Autocomplete
      id="async-example"
      open={open}
      options={options}
      loading={loading}
      getOptionLabel={(option) => option.name.common}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      sx={{ width: 300 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select a country"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default AsyncAutocomplete;
```

### Autocomplete with Custom Rendering

```jsx
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

const users = [
  { name: 'John Doe', avatar: '/avatars/john.jpg', role: 'Developer' },
  { name: 'Jane Smith', avatar: '/avatars/jane.jpg', role: 'Designer' },
  { name: 'Bob Johnson', avatar: '/avatars/bob.jpg', role: 'Manager' },
];

export default function CustomAutocomplete() {
  return (
    <Autocomplete
      options={users}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          <Avatar src={option.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
          <Box>
            <div>{option.name}</div>
            <Typography variant="caption" color="text.secondary">
              {option.role}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a user"
          inputProps={{
            ...params.inputProps,
          }}
        />
      )}
    />
  );
}
```

---

## Tables

### Basic Table

```jsx
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function BasicTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">{row.protein}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

### MUI-DataTables Implementation

```jsx
import MUIDataTable from "mui-datatables";

const columns = [
  {
    name: "name",
    label: "Name",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "company",
    label: "Company",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "city",
    label: "City",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "state",
    label: "State",
    options: {
      filter: true,
      sort: false,
    }
  },
];

const data = [
  { name: "Joe James", company: "Test Corp", city: "Yonkers", state: "NY" },
  { name: "John Walsh", company: "Test Corp", city: "Hartford", state: "CT" },
  { name: "Bob Herm", company: "Test Corp", city: "Tampa", state: "FL" },
  { name: "James Houston", company: "Test Corp", city: "Dallas", state: "TX" },
];

const options = {
  filterType: 'checkbox',
  selectableRows: 'multiple',
  responsive: 'vertical',
  download: true,
  print: true,
  viewColumns: true,
};

export default function AdvancedDataTable() {
  return (
    <MUIDataTable
      title={"Employee List"}
      data={data}
      columns={columns}
      options={options}
    />
  );
}
```

---

## Switches & Toggles

### Basic Switches

```jsx
import React from 'react';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function BasicSwitches() {
  const [checked, setChecked] = React.useState(true);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  return (
    <FormGroup>
      <FormControlLabel control={<Switch defaultChecked />} label="Default" />
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={handleChange}
            name="controlled"
          />
        }
        label="Controlled"
      />
      <FormControlLabel disabled control={<Switch />} label="Disabled" />
    </FormGroup>
  );
}
```

### Switches with Icons

```jsx
import React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="..."/></svg>')`,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 32,
    height: 32,
  },
}));

export default function CustomizedSwitches() {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <WifiOffIcon />
      <MaterialUISwitch defaultChecked />
      <WifiIcon />
    </Stack>
  );
}
```

### Switch Group

```jsx
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';

export default function SwitchGroup() {
  const [switches, setSwitches] = useState({
    option1: false,
    option2: false,
    option3: false,
  });

  const handleSwitchChange = (option) => {
    setSwitches((prevSwitches) => ({
      ...prevSwitches,
      [option]: !prevSwitches[option],
    }));
  };

  return (
    <FormGroup>
      <Typography component="label">
        Option 1
        <Switch
          checked={switches.option1}
          onChange={() => handleSwitchChange('option1')}
        />
      </Typography>
      <Typography component="label">
        Option 2
        <Switch
          checked={switches.option2}
          onChange={() => handleSwitchChange('option2')}
        />
      </Typography>
      <Typography component="label">
        Option 3
        <Switch
          checked={switches.option3}
          onChange={() => handleSwitchChange('option3')}
        />
      </Typography>
    </FormGroup>
  );
}
```

---

## Sliders

### Basic Slider

```jsx
import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function BasicSlider() {
  const [value, setValue] = React.useState(30);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        value={value}
        onChange={handleChange}
        aria-labelledby="basic-slider"
      />
      <p>Value: {value}</p>
    </Box>
  );
}
```

### Range Slider

```jsx
import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

export default function RangeSlider() {
  const [value, setValue] = React.useState([20, 80]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: 300 }}>
      <Typography gutterBottom>Temperature range</Typography>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={0}
        max={100}
      />
      <Typography>
        Selected Range: {value[0]}°C - {value[1]}°C
      </Typography>
    </Box>
  );
}
```

### Vertical Slider

```jsx
import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function VerticalSlider() {
  const [value, setValue] = React.useState(30);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ height: 300 }}>
      <Slider
        orientation="vertical"
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
      />
    </Box>
  );
}
```

### Customized Slider

```jsx
import React from 'react';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';

const CustomSlider = styled(Slider)({
  color: '#52af77',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#52af77',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
});

export default function CustomizedSliderExample() {
  return (
    <Box sx={{ width: 320 }}>
      <CustomSlider
        valueLabelDisplay="auto"
        defaultValue={50}
      />
    </Box>
  );
}
```

---

## Tabs

### Basic Tabs

```jsx
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Item One" />
          <Tab label="Item Two" />
          <Tab label="Item Three" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        Item One Content
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two Content
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three Content
      </TabPanel>
    </Box>
  );
}
```

### Icon Tabs

```jsx
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonPinIcon from '@mui/icons-material/PersonPin';

export default function IconTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Tabs value={value} onChange={handleChange}>
      <Tab icon={<PhoneIcon />} label="RECENTS" />
      <Tab icon={<FavoriteIcon />} label="FAVORITES" />
      <Tab icon={<PersonPinIcon />} label="NEARBY" />
    </Tabs>
  );
}
```

### Scrollable Tabs

```jsx
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function ScrollableTabsButtonAuto() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: { xs: 320, sm: 480 } }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Item One" />
        <Tab label="Item Two" />
        <Tab label="Item Three" />
        <Tab label="Item Four" />
        <Tab label="Item Five" />
        <Tab label="Item Six" />
        <Tab label="Item Seven" />
      </Tabs>
    </Box>
  );
}
```

### Vertical Tabs

```jsx
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function VerticalTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', height: 224 }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        <Tab label="Item One" />
        <Tab label="Item Two" />
        <Tab label="Item Three" />
      </Tabs>
      <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </Box>
  );
}
```

---

## App Bar & Toolbar

### Basic App Bar

```jsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function BasicAppBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          News
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}
```

### App Bar with Menu

```jsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';

export default function AppBarWithMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          App
        </Typography>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
```

### App Bar with Search

```jsx
import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

export default function SearchAppBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          App
        </Typography>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
      </Toolbar>
    </AppBar>
  );
}
```

---

## Cards

### Basic Card

```jsx
import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function BasicCard() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        sx={{ height: 140 }}
        image="/static/images/cards/contemplative-reptile.jpg"
        title="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Lizard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lizards are a widespread group of squamate reptiles, with over 6,000
          species, ranging across all continents except Antarctica
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}
```

### Card with Header

```jsx
import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function CardWithHeader() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'red' }}>
            R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title="Shrimp and Chorizo Paella"
        subheader="September 14, 2016"
      />
      <CardMedia
        component="img"
        height="194"
        image="/static/images/cards/paella.jpg"
        alt="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          This impressive paella is a perfect party dish and a fun meal to cook
          together with your guests. Add 1 cup of frozen peas along with the mussels,
          if you like.
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
```

### Card with Action Area

```jsx
import React from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

export default function ActionAreaCard() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image="/static/images/cards/contemplative-reptile.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Lizard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lizards are a widespread group of squamate reptiles, with over 6,000
            species, ranging across all continents except Antarctica
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
```

---

## Drawer & Sidebar

### Temporary Drawer

```jsx
import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Open Drawer</Button>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </div>
  );
}
```

### Responsive Drawer

```jsx
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const ResponsiveDrawer = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          My App
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Messages" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Responsive Drawer
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Mobile drawer (temporary) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop drawer (permanent) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
        }}
      >
        <Typography paragraph>
          This is a responsive sidebar example. On mobile, the drawer can be toggled.
          On desktop, it's always visible.
        </Typography>
      </Box>
    </Box>
  );
};

export default ResponsiveDrawer;
```

---

## Grid Layout

### Basic Grid

```jsx
import React from 'react';
import { Grid, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function BasicGrid() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Item>xs=8</Item>
        </Grid>
        <Grid item xs={4}>
          <Item>xs=4</Item>
        </Grid>
        <Grid item xs={4}>
          <Item>xs=4</Item>
        </Grid>
        <Grid item xs={8}>
          <Item>xs=8</Item>
        </Grid>
      </Grid>
    </Box>
  );
}
```

### Responsive Grid

```jsx
import React from 'react';
import { Grid, Paper } from '@mui/material';

const ResponsiveGrid = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          xs=12 sm=6 md=4 lg=3
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          xs=12 sm=6 md=4 lg=3
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          xs=12 sm=6 md=4 lg=3
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          xs=12 sm=6 md=4 lg=3
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ResponsiveGrid;
```

### Complex Grid Layout

```jsx
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const ComplexGrid = () => {
  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4">Header</Typography>
        </Paper>
      </Grid>
      
      {/* Sidebar */}
      <Grid item xs={12} sm={4} md={3}>
        <Paper sx={{ p: 2, minHeight: 400 }}>
          <Typography variant="h6">Sidebar</Typography>
        </Paper>
      </Grid>
      
      {/* Main Content */}
      <Grid item xs={12} sm={8} md={9}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, minHeight: 200 }}>
              <Typography variant="h6">Main Content</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: 150 }}>
              <Typography>Widget 1</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: 150 }}>
              <Typography>Widget 2</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Footer */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography>Footer</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ComplexGrid;
```

---

## Snackbar & Toast

### Basic Snackbar

```jsx
import React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function SimpleSnackbar() {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <Button onClick={handleClick}>Open simple snackbar</Button>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Note archived"
        action={action}
      />
    </div>
  );
}
```

### Snackbar with Alert

```jsx
import React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbar() {
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState('success');

  const handleClick = (severity) => {
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={() => handleClick('success')}>Success</Button>
      <Button onClick={() => handleClick('error')}>Error</Button>
      <Button onClick={() => handleClick('warning')}>Warning</Button>
      <Button onClick={() => handleClick('info')}>Info</Button>
      
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          This is a {severity} message!
        </Alert>
      </Snackbar>
    </div>
  );
}
```

### Consecutive Snackbars

```jsx
import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ConsecutiveSnackbars({ message }) {
  const [content, setContent] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [pack, setPack] = useState([]);

  const handleClose = () => {
    setOpen(false);
  };

  // Update content pack
  useEffect(() => {
    message && setPack((prev) => [...prev, { message, key: new Date().getTime() }]);
  }, [message]);

  // Handle consecutive snackbars
  useEffect(() => {
    if (pack.length && !content) {
      // Set a new snack when no active snack
      setContent({ ...pack[0] });
      setPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (pack.length && content && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [pack, content, open]);

  const handleExited = () => {
    setContent(undefined);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      key={content?.key}
    >
      <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        <div>{content?.message}</div>
      </Alert>
    </Snackbar>
  );
}
```

---

## Popover & Tooltip

### Basic Popover

```jsx
import React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function BasicPopover() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        Open Popover
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
      </Popover>
    </div>
  );
}
```

### Mouse Hover Popover

```jsx
import React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

export default function MouseOverPopover() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <Typography
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        Hover with a Popover.
      </Typography>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>I use Popover.</Typography>
      </Popover>
    </div>
  );
}
```

### Tooltips

```jsx
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function TooltipExamples() {
  return (
    <Stack direction="row" spacing={2}>
      <Tooltip title="Delete">
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Add" placement="top">
        <Button>Top</Button>
      </Tooltip>
      
      <Tooltip title="Add" placement="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      
      <Tooltip title="Add" placement="left">
        <Button>Left</Button>
      </Tooltip>
      
      <Tooltip title="Add" placement="right">
        <Button>Right</Button>
      </Tooltip>
      
      <Tooltip title="Custom styled tooltip" arrow>
        <Button>Arrow</Button>
      </Tooltip>
    </Stack>
  );
}
```

---

## Lists & List Items

### Basic List

```jsx
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';

export default function BasicList() {
  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <DraftsIcon />
          </ListItemIcon>
          <ListItemText primary="Drafts" />
        </ListItemButton>
      </ListItem>
      <Divider />
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Trash" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Spam" />
        </ListItemButton>
      </ListItem>
    </List>
  );
}
```

### List with Avatar

```jsx
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';

export default function ListWithAvatar() {
  const [checked, setChecked] = React.useState([1]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <List sx={{ width: '100%', maxWidth: 360 }}>
      {[0, 1, 2, 3].map((value) => {
        const labelId = `checkbox-list-label-${value}`;

        return (
          <ListItem
            key={value}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={handleToggle(value)}
                checked={checked.indexOf(value) !== -1}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            }
            disablePadding
          >
            <ListItemButton>
              <ListItemAvatar>
                <Avatar
                  alt={`Avatar n°${value + 1}`}
                  src={`/static/images/avatar/${value + 1}.jpg`}
                />
              </ListItemAvatar>
              <ListItemText
                id={labelId}
                primary={`Line item ${value + 1}`}
                secondary={`Secondary text ${value + 1}`}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
```

### Nested List

```jsx
import React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';

export default function NestedList() {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List>
      <ListItemButton>
        <ListItemIcon>
          <SendIcon />
        </ListItemIcon>
        <ListItemText primary="Sent mail" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <DraftsIcon />
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItemButton>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
}
```

---

## Timeline

### Basic Timeline

```jsx
import React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

export default function BasicTimeline() {
  return (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>Eat</TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>Code</TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>Sleep</TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
```

### Alternating Timeline

```jsx
import React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

export default function AlternateTimeline() {
  return (
    <Timeline position="alternate">
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          09:30 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>Eat</TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          10:00 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>Code</TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          12:00 pm
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>Sleep</TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
```

### Customized Timeline

```jsx
import React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function CustomizedTimeline() {
  return (
    <Timeline position="alternate">
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          9:30 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot color="primary">
            <FastfoodIcon />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Paper elevation={3} sx={{ padding: '6px 16px' }}>
            <Typography variant="h6" component="h1">
              Eat
            </Typography>
            <Typography>Because you need strength</Typography>
          </Paper>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary">
          10:00 am
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot color="primary" variant="outlined">
            <LaptopMacIcon />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Paper elevation={3} sx={{ padding: '6px 16px' }}>
            <Typography variant="h6" component="h1">
              Code
            </Typography>
            <Typography>Because it's awesome!</Typography>
          </Paper>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot color="secondary">
            <HotelIcon />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="h6">Sleep</Typography>
          <Typography>Because you need rest</Typography>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot>
            <RepeatIcon />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="h6">Repeat</Typography>
          <Typography>Because this is the life you love!</Typography>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
```

---

## Date & Time Pickers

### Basic Date Picker

```jsx
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';

export default function BasicDatePicker() {
  const [value, setValue] = React.useState(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Basic Date Picker"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}
```

### Time Picker

```jsx
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';

export default function BasicTimePicker() {
  const [value, setValue] = React.useState(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label="Basic Time Picker"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}
```

### Date Time Picker

```jsx
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';

export default function BasicDateTimePicker() {
  const [value, setValue] = React.useState(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label="Date & Time"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}
```

### Date Range Picker (Pro)

```jsx
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import Box from '@mui/material/Box';

export default function BasicDateRangePicker() {
  const [value, setValue] = React.useState([null, null]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateRangePicker
        startText="Start"
        endText="End"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        renderInput={(startProps, endProps) => (
          <React.Fragment>
            <TextField {...startProps} />
            <Box sx={{ mx: 2 }}> to </Box>
            <TextField {...endProps} />
          </React.Fragment>
        )}
      />
    </LocalizationProvider>
  );
}
```

---

## Stepper

### Linear Stepper

```jsx
import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];

export default function LinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
```

### Vertical Stepper

```jsx
import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const steps = [
  {
    label: 'Select campaign settings',
    description: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
  },
  {
    label: 'Create an ad group',
    description:
      'An ad group contains one or more ads which target a shared set of keywords.',
  },
  {
    label: 'Create an ad',
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
];

export default function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}
```

---

## Pagination

### Basic Pagination

```jsx
import React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function BasicPagination() {
  return (
    <Stack spacing={2}>
      <Pagination count={10} />
      <Pagination count={10} color="primary" />
      <Pagination count={10} color="secondary" />
      <Pagination count={10} disabled />
    </Stack>
  );
}
```

### Controlled Pagination

```jsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function PaginationControlled() {
  const [page, setPage] = React.useState(1);
  const handleChange = (event, value) => {
    setPage(value);
  };

  return (
    <Stack spacing={2}>
      <Typography>Page: {page}</Typography>
      <Pagination count={10} page={page} onChange={handleChange} />
    </Stack>
  );
}
```

### Table Pagination

```jsx
import React from 'react';
import TablePagination from '@mui/material/TablePagination';

export default function TablePaginationDemo() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TablePagination
      component="div"
      count={100}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
}
```

---

## Forms

### Form Control

```jsx
import React, { useState } from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Input, 
  FormHelperText, 
  Box 
} from '@mui/material';

function FormControlExample() {
  const [name, setName] = useState('');
  const [isError, setIsError] = useState(false);

  const handleName = (e) => {
    setName(e.target.value);
    if (e.target.value.length > 6) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <FormControl error={isError}>
        <TextField 
          variant='outlined' 
          placeholder='Name' 
          onChange={handleName}
          error={isError}
          helperText={isError ? "Maximum 6 characters allowed" : ""}
        />
      </FormControl>
      
      <FormControl variant='standard'>
        <InputLabel>Email</InputLabel>
        <Input />
        <FormHelperText>We'll never share your email.</FormHelperText>
      </FormControl>
      
      <FormControl error variant='standard'>
        <InputLabel htmlFor='component-error'>Required</InputLabel>
        <Input 
          id='component-error' 
          aria-describedby='component-error-text' 
        />
        <FormHelperText id='component-error-text'>
          This field is required
        </FormHelperText>
      </FormControl>
    </Box>
  );
}

export default FormControlExample;
```

### Complete Form Example

```jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  FormHelperText,
  Switch,
  Rating,
  Slider,
} from '@mui/material';

function CompleteFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'female',
    country: '',
    subscribe: false,
    rating: 2,
    price: [20, 37],
    notifications: true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSliderChange = (event, newValue) => {
    setFormData({ ...formData, price: newValue });
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.country) newErrors.country = 'Please select a country';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ '& > :not(style)': { m: 1 } }}
      noValidate
      autoComplete="off"
    >
      <TextField
        name="name"
        label="Name"
        variant="outlined"
        fullWidth
        value={formData.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
      />

      <TextField
        name="email"
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
      />

      <FormControl fullWidth error={!!errors.country}>
        <InputLabel>Country</InputLabel>
        <Select
          name="country"
          value={formData.country}
          label="Country"
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value="us">United States</MenuItem>
          <MenuItem value="uk">United Kingdom</MenuItem>
          <MenuItem value="ca">Canada</MenuItem>
        </Select>
        {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
      </FormControl>

      <FormControl>
        <FormLabel>Gender</FormLabel>
        <RadioGroup
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          row
        >
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="male" control={<Radio />} label="Male" />
          <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleChange}
          />
        }
        label="Subscribe to newsletter"
      />

      <FormControlLabel
        control={
          <Switch
            name="notifications"
            checked={formData.notifications}
            onChange={handleChange}
          />
        }
        label="Enable notifications"
      />

      <Box>
        <Typography component="legend">Rating</Typography>
        <Rating
          name="rating"
          value={formData.rating}
          onChange={handleRatingChange}
        />
      </Box>

      <Box>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={formData.price}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={0}
          max={100}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
        <Button type="reset" variant="outlined">
          Reset
        </Button>
      </Box>
    </Box>
  );
}

export default CompleteFormExample;
```

---

## Typography

### Typography Variants

```jsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function TypographyVariants() {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h1" gutterBottom>
        h1. Heading
      </Typography>
      <Typography variant="h2" gutterBottom>
        h2. Heading
      </Typography>
      <Typography variant="h3" gutterBottom>
        h3. Heading
      </Typography>
      <Typography variant="h4" gutterBottom>
        h4. Heading
      </Typography>
      <Typography variant="h5" gutterBottom>
        h5. Heading
      </Typography>
      <Typography variant="h6" gutterBottom>
        h6. Heading
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur
      </Typography>
      <Typography variant="body1" gutterBottom>
        body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit.
      </Typography>
      <Typography variant="body2" gutterBottom>
        body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit.
      </Typography>
      <Typography variant="button" display="block" gutterBottom>
        button text
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        caption text
      </Typography>
      <Typography variant="overline" display="block" gutterBottom>
        overline text
      </Typography>
    </Box>
  );
}
```

---

## Theme Customization

### Custom Theme

```jsx
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ padding: 20 }}>
        <Button variant="contained" color="primary" sx={{ mr: 2 }}>
          Primary Button
        </Button>
        <Button variant="contained" color="secondary">
          Secondary Button
        </Button>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### Dark Mode Toggle

```jsx
import React, { useState, useMemo } from 'react';
import { 
  createTheme, 
  ThemeProvider,
  CssBaseline,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function DarkModeToggle() {
  const [mode, setMode] = useState('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          color: 'text.primary',
          borderRadius: 1,
          p: 3,
        }}
      >
        <Typography sx={{ mr: 2 }}>
          {mode === 'dark' ? 'Dark' : 'Light'} Mode
        </Typography>
        <IconButton onClick={toggleColorMode} color="inherit">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
    </ThemeProvider>
  );
}
```

---

## Best Practices & Tips

### 1. Performance Optimization

```jsx
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Use React.memo for expensive renders
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering logic */}</div>;
});

// Virtualize long lists with react-window
import { FixedSizeList } from 'react-window';

const VirtualList = ({ items }) => (
  <FixedSizeList
    height={600}
    itemCount={items.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </FixedSizeList>
);
```

### 2. Custom Hooks for MUI

```jsx
// useMediaQuery hook for responsive design
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

function useResponsive() {
  const theme = useTheme();
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
  };
}

// Usage
const MyComponent = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <Box sx={{ 
      padding: isMobile ? 2 : 4,
      fontSize: isMobile ? 14 : 16 
    }}>
      Content
    </Box>
  );
};
```

### 3. Global Styles

```jsx
import { GlobalStyles } from '@mui/material';

const globalStyles = (
  <GlobalStyles
    styles={{
      body: {
        backgroundColor: '#f5f5f5',
      },
      '.custom-class': {
        color: 'red',
        fontWeight: 'bold',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#888',
        borderRadius: '4px',
      },
    }}
  />
);

// Add to your app
function App() {
  return (
    <>
      {globalStyles}
      {/* Your app content */}
    </>
  );
}
```

### 4. Styled Components Pattern

```jsx
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// Styled components
const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  '&:hover': {
    background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
  },
}));

// Usage
export default function StyledComponents() {
  return (
    <StyledBox>
      <GradientButton>Gradient Button</GradientButton>
    </StyledBox>
  );
}
```

---

## Conclusion

This comprehensive collection covers the majority of MUI components and their practical implementations. Each code snippet is production-ready and follows React and MUI best practices. Remember to:

1. Always check the official MUI documentation for the latest updates
2. Use TypeScript for better type safety
3. Implement proper error handling and loading states
4. Consider accessibility (a11y) requirements
5. Optimize for performance with lazy loading and memoization
6. Test your components thoroughly
7. Keep your MUI packages updated

For more detailed information and advanced use cases, refer to the official Material-UI documentation at [https://mui.com/](https://mui.com/).

## Resources

- [Official MUI Documentation](https://mui.com/)
- [MUI Component Demos](https://mui.com/material-ui/all-components/)
- [MUI GitHub Repository](https://github.com/mui/material-ui)
- [MUI Templates](https://mui.com/material-ui/getting-started/templates/)
- [MUI Design Resources](https://mui.com/material-ui/design-resources/)

Happy coding with Material UI! 🚀


CSV Template Specifications
1. Experience Data Template

Purpose: Tracks aggregated monthly claim costs by category.
Usage: The main summary table in the dashboard/report must mirror exactly what is uploaded from this template. This table will occupy its own dedicated page. All subsequent charts and mini tables follow on the next page.

Headers (strict, case-sensitive):

Category

12 monthly columns, formatted as M/D/YYYY (e.g., 3/1/2025, 4/1/2025, …, 2/1/2026)

Allowed Categories:

Domestic Medical Facility Claims (IP/OP)

Non-Domestic Medical Claims (IP/OP)

Total Hospital Medical Claims (IP/OP)

Non-Hospital Medical Claims

Total All Medical Claims

Adjustments ← (generic replacement for UC Claims Settlement Adjustment)

Total Adjusted Medical Claims

Run Out Claims

Medical Claims Paid via EBA

Total Medical Claims

High Cost Claims paid via HMNH

ESI Pharmacy Claims

Total Rx Claims

Rx Rebates

Total Stop Loss Fees

Stop Loss Reimbursement

Consulting

TPA Claims/COB

Rules:

Exactly 12 monthly columns — consecutive months only, no skips.

Numeric fields must be non-negative; blanks allowed if not applicable.

No extra or missing columns.

2. High-Cost Claimants Template

Purpose: Captures member-level details for high-cost claims.

Headers (strict, case-sensitive):

Member ID,
Member Type,
Age Band,
Primary Diagnosis Category,
Specific Diagnosis Details Short,
Specific Diagnosis Details,
% of Plan Paid,
% of Large Claims,
Total,
Facility Inpatient,
Facility Outpatient,
Professional,
Pharmacy,
Top Provider,
Enrolled (Y/N),
Stop-Loss Deductible,
Estimated Stop-Loss Reimbursement,
Hit Stop Loss?


Rules:

Member Type: must be Employee, Spouse, or Dependent.

% of Plan Paid and % of Large Claims: decimal fractions between 0 and 1.

Monetary fields (Total, service-type breakdowns, Stop-Loss fields): non-negative.

Enrolled (Y/N) and Hit Stop Loss?: values must be Yes or No.

Recommended reconciliation:

Total ≈ Facility Inpatient + Facility Outpatient + Professional + Pharmacy


(allow small tolerance).

⚡ In short:

Page 1 = Full Experience Data table (direct mirror of CSV upload).

Page 2+ = Charts & mini tables derived from the data.


---

## Supplementary Narrative

### Healthcare Analytics Dashboard: Complete Technical Research Report
#### Introduction
This research report outlines the architecture, tools, and best‑practice guidelines for building a production‑ready Healthcare Analytics Dashboard using modern web technologies. It covers the full stack—from Next.js 15 and TypeScript through UI frameworks like Material UI (MUI) and Tailwind CSS—along with HIPAA‑compliant security considerations, healthcare‑specific data structures, and performance optimization strategies. The report also introduces a new section on PDF export functionality, providing detailed guidance for exporting dashboards and reports as professional, print‑ready, and accessible PDF documents.
#### Core Technical Stack Architecture
##### Next.js 15 with React 19 foundation
The latest Next.js 15 release builds on React 19 and introduces server components as the default mode. In practice, this means data‑heavy healthcare dashboards can offload expensive data fetching to the server while rendering interactive components on the client side. Several breaking changes require developers to adopt asynchronous patterns when accessing cookies, headers, and URL parameters. The new Partial Prerendering feature enables a fast static shell while streaming dynamic content—an ideal match for dashboards that display real‑time health metrics. Next.js 15 also improves typed routes and automatic route props helpers, enhancing type safety when dealing with complex healthcare data models.
Route groups help organize the codebase: (dashboard) for analytics interfaces, (auth) for login flows, and parallel routes like @modal or @charts for complex layouts. Server components handle data fetching and authentication, while client components manage interactivity and real‑time updates. Next.js' automatic code splitting, image optimization, and caching strategies provide performance gains that align with HIPAA requirements for secure, responsive applications.
##### Material UI ecosystem for healthcare interfaces
MUI DataGrid Premium is a core component for managing large healthcare data sets. It supports row grouping, aggregation functions, virtualization of millions of rows, and Excel export capabilities—features that are crucial for clinical and financial analytics. The component allows developers to customize column rendering, apply conditional formatting for clinical thresholds, and integrate real‑time calculations. MUI X Charts provides a suite of accessible chart components, including composite bar/line charts and heat maps. The theming system supports professional healthcare branding with medical blue (#1976d2) and healthcare green (#2e7d32).
Integrating Tailwind CSS with MUI requires disabling Tailwind's preflight CSS reset, setting the important selector to #root to avoid style leakage, and using Tailwind primarily for utility classes rather than component styling. Framer Motion can be integrated through the component prop pattern to add animations without breaking MUI's internal logic.
#### Healthcare Analytics Standards and Metrics
##### Dashboard design patterns
Healthcare dashboards follow a hierarchical information architecture with executive, operational, and clinical views. Executive dashboards present key performance indicators (KPIs) with color‑coded performance indicators; operational dashboards provide detailed metrics with drill‑downs; and clinical dashboards focus on patient‑specific quality indicators. The Model for Improvement methodology encourages iterative Plan‑Do‑Study‑Act cycles, and leading platforms report a 25 % reduction in manual dashboard creation by integrating automated data pipelines. Real‑time or near‑real‑time data integration is becoming the norm.
##### Financial metrics and calculations
Medical Loss Ratio (MLR) is a central metric defined by the Affordable Care Act. The formula (Claims Costs + Quality Improvement Expenses) ÷ Premium Revenue must be computed accurately, and insurers are required to spend at least 80 % of premium revenue on claims and quality improvement (85 % for large groups). PMPM (Per Member Per Month) metrics typically range from $200–$500 and are calculated as Total Healthcare Costs ÷ Member Months. Stop‑loss insurance thresholds vary by market size, with individual limits around $75 000–$150 000 for small groups and over $350 000 for large groups. Aggregate stop‑loss attachment points generally target 125 % of expected annual claims. High‑cost claimant analysis reveals that ~1.2 % of members generate ~31 % of total spending, with average annual costs of $122 382. Machine learning models predicting high‑cost cases achieve 84–91 % AUC‑ROC accuracy using thousands of variables.
#### Security and Compliance Implementation
##### HIPAA Security Rule requirements
The December 27 2024 proposed HIPAA rule removes the distinction between required and addressable specifications; all safeguards now demand written policies, regular testing, and updates. Technical safeguards include unique user identification, automatic logoff after 15 minutes of inactivity, end‑to‑end encryption (TLS 1.3 recommended), and audit controls capturing user IDs, timestamps, actions, and resources accessed. AES‑256 encryption with FIPS 140‑2 Level 2 compliant key management is required for data at rest. Business Associate Agreements remain mandatory for third‑party services. Audit logs must be retained for at least six years with tamper‑evident mechanisms.
##### CSV processing for healthcare data
Processing healthcare CSV files requires robust security controls. Files should be limited to 50 MB, validated by MIME type (not just file extension), scanned for malware, and stored temporarily in encrypted storage. PHI detection algorithms must identify sensitive fields like SSNs, dates of birth, and medical record numbers. Stream processing and chunking strategies avoid memory overload when parsing large files. Quality checks ensure required fields exist, data formats are consistent, cross‑field validations pass, and reference data matches provider databases. Duplicate detection and error reporting with line numbers are essential.
#### Technical Implementation Patterns
##### State management architecture
Zustand is recommended for state management because it offers a simple API, built‑in persistence with encryption, and optimized performance for real‑time medical data. The multi‑step workflow leverages FormProvider with useReducer for complex state, integrates localStorage for persistence across sessions, and automatically clears data after session timeouts for compliance. Real‑time updates rely on WebSockets with automatic reconnection and optimistic UI updates, while React Query synchronizes server state. A rule‑based calculation engine implements formulas like BMI and MLR, with dependencies managed for interdependent calculations and comprehensive audit trails.
##### Accessibility and responsive design
WCAG 2.1 AA compliance requires proper ARIA patterns for data grids, keyboard navigation, text alternatives for charts, and live regions for real‑time updates. Medical terminology should include pronunciation guidance for screen readers, and color‑independent data representation supports color‑blind users. Mobile‑first design uses progressive disclosure, 44 px touch targets, and breakpoints at 320 px, 768 px, 1024 px, and 1440 px to optimize layouts for different devices.
#### Healthcare Data Structures and Standards
##### Claims data architecture
Healthcare claims follow the ANSI ASC X12N 837 Version 5010A1 standard, which defines hierarchical loops for billing providers, subscribers, patients, claims, and service lines. JSON structures map claim IDs, patient demographics, service details (with CPT codes and ICD‑10 diagnoses), and billing information. ICD‑10‑CM codes use up to seven alphanumeric characters, with categories for etiology, anatomic site, severity, and extension. CPT codes are five‑digit numbers with ranges for anesthesia (00100–01999), surgery (10000–69999), radiology (70000–79999), pathology (80000–89999), and evaluation/management (99200–99499).
##### Performance optimization strategies
Production deployments should apply code splitting by healthcare modules, lazy loading for non‑critical components, memoization for expensive medical calculations, and virtual scrolling for large data sets. MUI DataGrid Premium handles more than 100 000 records using virtualization, with 200 px row buffers and 150 px column buffers. Server‑side rendering combined with Partial Prerendering optimizes initial load times. Chart libraries should render on demand, and bundle size must be managed with tree shaking, dynamic imports, and optimized icon libraries to achieve sub‑3‑second initial load times.
#### Implementation Roadmap
A five‑phase roadmap ensures systematic deployment:
1.	Phase 1 – Infrastructure setup: Configure MUI themes, integrate Tailwind and Framer Motion, establish routing architecture, and set up TypeScript and Zod schemas. Ensure security patterns like TLS and encryption from the outset.
2.	Phase 2 – Data grid and charts: Implement MUI DataGrid Premium with healthcare‑specific columns and MUI X Charts for visualizations. Integrate real‑time data sources and conditional formatting for metrics like MLR.
3.	Phase 3 – Multi‑step forms and file uploads: Use React Hook Form and Zod for multi‑step form handling. Add CSV upload components with strict header validation, auto‑mapping, and error handling. Integrate Framer Motion for smooth step transitions.
4.	Phase 4 – Security and compliance: Implement role‑based access control, comprehensive audit logging, PHI detection, and encryption at all layers. Perform security testing (e.g., penetration tests) and validate HIPAA compliance. Add session timeout and inactivity detection.
5.	Phase 5 – Accessibility, performance, and monitoring: Conduct WCAG compliance testing, optimize performance through code splitting and caching, validate cross‑browser print behavior, and set up monitoring and logging for production.
#### New Section: PDF Export Functionality
A critical feature of the healthcare analytics dashboard is the ability to generate professional PDF reports for executive summaries and regulatory compliance. When implementing PDF export, developers must balance high‑fidelity rendering, performance, accessibility, and security. This section reviews best practices and tools for exporting data grids and charts, compares popular libraries, and outlines guidelines for print‑ready and accessible PDFs.
##### Why PDF export matters
Healthcare analytics dashboards often support regulated reporting and executive presentations. Decision makers need portable, static documents that they can share with stakeholders or store in compliance archives. PDF is the de facto standard for print‑ready documents because it preserves layout fidelity, supports vector graphics, and can embed fonts. For regulated industries like healthcare, a reliable PDF export mechanism ensures that reports look consistent across devices and remain accessible offline. Many insurers and providers must also supply evidence of MLR calculations and high‑cost claimant analysis to auditors; a robust PDF export feature simplifies this process.
High‑level vs. low‑level PDF generation tools
PDF export strategies fall into two broad categories:
Tool	Type	Key features	Limitations	Use cases
Puppeteer / Playwright	Headless browser (server‑side)	Renders a live webpage in a headless Chromium instance and exports it as PDF. Allows precise control over print layouts (page size, margins, CSS) and can capture complex HTML pages including interactive charts[1]. Useful for generating high‑fidelity reports directly from dashboard pages.	Requires server‑side environment, uses more memory and CPU, and produces larger file sizes[1].
Best for full‑page dashboard exports and documents requiring pixel‑perfect reproduction.
jsPDF	Client‑side library	Lightweight library that enables PDF generation entirely in the browser. Supports adding text, shapes, and images; simple to integrate into React components.	Limited layout capabilities, struggles with complex tables and long documents; cannot run in Node. Not ideal for large healthcare reports[2].
Good for simple exports like invoices or download‑on‑client features where data volume is small.
PDFKit (with html-to-pdf)	Node library	Offers a flexible API for programmatic PDF creation, including embedding images, custom fonts, and CSS styling. The html-to-pdf plugin converts HTML templates to PDF. Supports custom headers, footers, encryption, and pagination[3][4].
Higher setup complexity, requires manual creation of layouts or HTML templates and careful CSS tuning.	Suitable for server‑generated reports where full control over page layout and security is needed.
pdfmake	JSON‑based library	Generates PDFs in Node or the browser using a declarative docDefinition JSON. Provides table and image support, custom headers/footers, and interactive elements like links and form fields[5].
Does not render raw HTML; developers must map HTML or data structures manually. Learning curve for the DSL.	Ideal for generating dynamic reports from structured data, such as invoices and claim summaries.
PDFme	TypeScript library	Generates rich text documents with images and tables and includes a built‑in PDF editor. Works in the browser and integrates well with React[6].
Less mature ecosystem; not widely adopted; limited documentation.	Suitable for interactive PDF templates or custom editors embedded in dashboards.
Developers should select a tool based on the complexity of the report, server environment, and performance requirements. For high‑fidelity exports of entire dashboards, headless browsers like Puppeteer or Playwright are often the most reliable choice. If the goal is to programmatically assemble a document from data structures (e.g., tables summarizing claims or fees), pdfmake or PDFKit may provide finer control with smaller file sizes.
##### Integrating PDF export with MUI DataGrid and Charts
DataGrid export – MUI DataGrid Premium supports multiple export options. It can export rows to CSV or Excel or trigger the browser’s print dialog, which can then be saved as a PDF[7]. Developers can customize the print output by hiding the grid footer and toolbar, selecting which columns to export, and styling the print view via the pageStyle property[8]. The hideFooter and hideToolbar options streamline the exported report, while the disableExport column property ensures sensitive fields are excluded[9]. This built‑in print functionality is suitable for exporting tabular summaries directly from the dashboard without external libraries.
Chart export – MUI X Charts provides an apiRef method called exportAsPrint(), which opens the browser’s print dialog to print or save the chart as a PDF. The documentation emphasizes that using the print dialog is the recommended way to export charts because it respects browser-level PDF settings and ensures high‑quality rendering[10]. Charts can also be exported as PNG images with exportAsImage(), which may be embedded into custom PDF generation workflows[11]. When printing dashboards containing both DataGrid and charts, ensure that @media print styles hide interactive UI elements and adjust page margins for professional layouts.
Implementing server‑side PDF generation with Next.js
When high‑fidelity exports are necessary or when generating multipage reports with charts and tables, it is often beneficial to generate PDFs on the server. A typical approach is to create a dedicated Next.js API route that uses Puppeteer or Playwright. The API route renders a dedicated report page—styled for A4 letter size, with -webkit-print-color-adjust: exact to ensure colors match—and then uses the headless browser to produce a PDF buffer[12]. The API route returns the PDF to the client as a downloadable file. Setting format: 'A4' and adjusting margins in the Puppeteer pdf method controls the layout[13]. This approach enables complex multi‑page reports (e.g., summary and analytics pages) with custom headers and footers, and ensures consistent printing across browsers.
For Node‑based generation without headless browsers, developers can use PDFKit with the html-to-pdf plugin. The plugin converts HTML templates to PDF while allowing custom CSS, embedded fonts, images, and encryption[3]. An alternative is pdfmake, which defines documents through JSON objects; this method offers granular control over tables, images, and interactive elements and is particularly effective for generating invoices or structured claim summaries[14].
Print‑ready design guidelines
Producing high‑quality PDFs requires adhering to print design principles. A 2024 design guide notes that PDFs should include bleed, trim, and safe areas, and use CMYK color mode with high‑resolution images (300 DPI) for best print quality[15]. Fonts must be embedded or subsetted to ensure text renders consistently across devices, and vector graphics should be used wherever possible to retain crispness when scaled. The PDF/X standard helps ensure print readiness by specifying transparency, color profiles, and metadata[16]. Before exporting, designers should check for bleeds, safe areas, correct color profiles, and image resolutions.
##### Accessibility best practices for PDFs
Accessible PDFs are mandatory under WCAG and Section 508; they ensure that people with disabilities can use assistive technologies like screen readers. Key practices include:
•	Use proper tags and headings – Start with an accessible source document using semantic headings (H1–H6). Tags define the document structure; without them, screen readers cannot navigate the content[17].
•	Alt text for images and charts – Provide concise alt text for every image and chart so screen readers can describe them. Complex charts may require long descriptions or data tables[18].
•	Logical reading order – Ensure that the reading order matches the visual order. Tools like Adobe Acrobat’s accessibility checker can detect issues[19].
•	Descriptive links and navigation – Links should be descriptive (e.g., “View high‑cost claimant analysis” rather than “Click here”)[20]. Provide bookmarks and a table of contents for longer reports[21].
•	Keyboard accessibility – PDF forms and interactive elements should be navigable with keyboard alone[22]. Avoid using scanned images of text.
By following these guidelines, healthcare organizations can ensure that exported reports meet legal accessibility requirements and can be consumed by all stakeholders.
##### Security considerations for PDF export
PDFs may contain sensitive health information, so security is paramount. Use server‑side generation to avoid exposing PHI in client‑side scripts. Encrypt PDFs with AES‑256 and password protection when necessary; PDFKit supports encryption options[3]. Validate user permissions before allowing export (e.g., restrict high‑cost claimant details to authorized roles) and log all export actions in audit trails. When using third‑party services to process PDFs, ensure they are covered by Business Associate Agreements and comply with HIPAA.
##### Conclusion
Developing a production-ready healthcare analytics dashboard requires a holistic approach that combines modern web technologies with healthcare-specific standards, robust security practices, and accessibility considerations. The addition of a comprehensive PDF export mechanism—whether via built-in MUI print functions, headless browsers like Puppeteer, or programmatic libraries like PDFKit or pdfmake—ensures that executive reports and regulatory documents can be produced efficiently and securely. By adhering to the guidelines presented here, teams can deliver responsive, compliant, and high-quality dashboards that empower healthcare stakeholders with actionable insights.
##### References
________________________________________
[1] [2] Best HTML to PDF libraries for Node.js - LogRocket Blog
https://blog.logrocket.com/best-html-pdf-libraries-node-js/
[3] [4] How to Generate PDF from HTML in Node.js Using PDFKit
https://pdforge.com/blog/how-to-generate-pdf-from-html-using-pdfkit-in-node-js
[5] [14] Generate PDF from HTML Using PDFMake: A Developer’s Guide
https://pdforge.com/blog/generate-pdf-from-html-using-pdfmake
[6] 7 Useful React PDF Library and Viewers 2025 - ThemeSelection
https://themeselection.com/react-pdf-library-and-viewers/
[7] [8] [9] Data Grid - Export - MUI X
https://mui.com/x/react-data-grid/export/
[10] Charts - Export - MUI X
https://mui.com/x/react-charts/export/
[11] Charts - Export - MUI X
https://mui.com/x/react-charts/export/%23print-export-as-pdf
[12] [13] Turning React apps into PDFs with Next.js, NodeJS and puppeteer - DEV Community
https://dev.to/jordykoppen/turning-react-apps-into-pdfs-with-nextjs-nodejs-and-puppeteer-mfi
[15] [16] Designing For Print: Key Considerations For PDF Files
https://www.abyssale.com/blog/designing-for-print-key-considerations-for-pdf-files
[17] [18] [19] [20] [21] [22] Creating Accessible PDFs: A Guide to Inclusive Documents - AFixt AFixt, Inc. offers a full array of services for regulations and standards such as ADA, WCAG, EAA, AODA, and EN 301 549
https://afixt.com/creating-accessible-pdfs-a-guide-to-inclusive-documents/
