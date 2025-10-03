# Healthcare Analytics Dashboard - Data Dictionary

## Overview
This document describes the data structure, field definitions, validation rules, and relationships for the C&E Reporting Platform healthcare analytics dashboard.

---

## File Templates

### 1. claims-data-template.csv
**Purpose:** Transaction-level claims data for all medical and pharmacy services
**Frequency:** Upload monthly or as needed
**Primary Key:** claim_id

| Field Name | Data Type | Required | Description | Validation Rules | Example |
|------------|-----------|----------|-------------|------------------|---------|
| claim_id | String | Yes | Unique identifier for each claim | Alphanumeric, max 20 chars | CLM001 |
| member_id | String | Yes | Member identifier (links to demographics) | Alphanumeric, max 20 chars | M12345 |
| service_date | Date | Yes | Date service was provided | YYYY-MM-DD format | 2024-01-15 |
| year_month | String | Yes | Year and month for reporting | YYYY-MM format | 2024-01 |
| medical_payment | Decimal | Yes | Plan payment for medical services | Non-negative, 2 decimals | 5000.00 |
| rx_payment | Decimal | Yes | Plan payment for pharmacy services | Non-negative, 2 decimals | 250.00 |
| total_payment | Decimal | Yes | Total plan payment (medical + rx) | Must equal medical + rx | 5250.00 |
| diagnosis_code | String | No | ICD-10 diagnosis code | Valid ICD-10 format | E11.9 |
| diagnosis_description | String | No | Human-readable diagnosis | Max 200 chars | Type 2 diabetes |
| place_of_service | String | No | Where service was provided | See POS reference | Patient Visit |
| medical_episode | String | No | Episode of care category | See episodes reference | Septicemia |
| drug_class | String | No | Pharmaceutical class | See drug class reference | ANTIDIABETICS |
| er_category | String | No | Emergency room category | Injury, PCP Treatable, All Others | Injury |
| is_high_cost | String | No | High-cost claimant flag (>$100K annual) | Yes/No | Yes |
| cost_tier | String | No | Annual cost tier | <$25K, $25K-$49.9K, $50K-$99.9K, >$100K | $50K-$99.9K |
| claims_count | Integer | Yes | Number of claims (usually 1 per row) | Positive integer | 1 |

**Business Rules:**
- Total payment must equal medical_payment + rx_payment
- is_high_cost = "Yes" if member's annual total > $100,000
- cost_tier is calculated based on member's annual total payments
- One row per claim transaction

---

### 2. member-demographics-template.csv
**Purpose:** Member enrollment and demographic information
**Frequency:** Upload monthly or when demographics change
**Primary Key:** member_id, year_month

| Field Name | Data Type | Required | Description | Validation Rules | Example |
|------------|-----------|----------|-------------|------------------|---------|
| member_id | String | Yes | Unique member identifier | Alphanumeric, max 20 chars | M12345 |
| enrollment_date | Date | Yes | Date member enrolled | YYYY-MM-DD format | 2023-01-01 |
| termination_date | Date | No | Date member terminated (if applicable) | YYYY-MM-DD, after enrollment | 2024-01-31 |
| year_month | String | Yes | Reporting period | YYYY-MM format | 2024-01 |
| age | Integer | Yes | Member age | 0-120 | 45 |
| gender | String | Yes | Member gender | M, F, O | M |
| zip_code | String | Yes | Member ZIP code | 5 digits | 12345 |
| chronic_conditions | String | No | Comma-separated list of conditions | See conditions reference | Diabetes,Hypertension |
| preventive_screenings_completed | String | No | Comma-separated screenings | See screening types | Preventive Care Visit |
| predicted_cost_range | String | No | Predicted annual cost tier | <$25K, $25K-$49.9K, $50K-$99.9K, >$100K | $25K-$49.9K |
| is_active | String | Yes | Currently enrolled flag | Yes/No | Yes |

**Business Rules:**
- is_active = "No" if termination_date is populated and <= current date
- chronic_conditions: multiple values separated by commas
- One row per member per reporting period

---

### 3. diagnosis-reference-template.csv
**Purpose:** ICD-10 diagnosis code reference data
**Frequency:** Update annually or as codes change
**Primary Key:** icd10_code

| Field Name | Data Type | Required | Description | Validation Rules | Example |
|------------|-----------|----------|-------------|------------------|---------|
| icd10_code | String | Yes | ICD-10 diagnosis code | Valid ICD-10 format | E11.9 |
| diagnosis_description | String | Yes | Full diagnosis description | Max 200 chars | Type 2 diabetes mellitus |
| category | String | Yes | High-level category | Max 50 chars | Diabetes |
| severity | String | Yes | Clinical severity level | Low, Moderate, High, Critical | Moderate |
| is_chronic | String | Yes | Chronic condition flag | Yes/No | Yes |

**Business Rules:**
- ICD-10 codes must be valid and current
- Chronic conditions (is_chronic = "Yes") are tracked for compliance reporting

---

### 4. drug-class-reference-template.csv
**Purpose:** Pharmaceutical drug class reference
**Frequency:** Update as needed
**Primary Key:** drug_class

| Field Name | Data Type | Required | Description | Validation Rules | Example |
|------------|-----------|----------|-------------|------------------|---------|
| drug_class | String | Yes | Drug class name (uppercase) | Alphanumeric, max 50 chars | ANTIDIABETICS |
| typical_usage | String | Yes | Common usage description | Max 100 chars | Diabetes management |
| related_conditions | String | No | Comma-separated conditions | Max 200 chars | Diabetes |
| tier | String | Yes | Formulary tier | Tier 1, Tier 2, Tier 3 | Tier 2 |

**Business Rules:**
- Drug class names should be uppercase and consistent
- Tier 1 = generic/low cost, Tier 2 = preferred brand, Tier 3 = specialty

---

### 5. chronic-conditions-reference-template.csv
**Purpose:** Chronic condition definitions and compliance tracking
**Frequency:** Update annually
**Primary Key:** condition_name

| Field Name | Data Type | Required | Description | Validation Rules | Example |
|------------|-----------|----------|-------------|------------------|---------|
| condition_name | String | Yes | Condition name | Max 100 chars | Hypertension |
| icd10_codes | String | Yes | Comma-separated ICD-10 codes | Valid ICD-10 codes | I10,I11.0 |
| compliance_criteria | String | Yes | What defines compliance | Max 300 chars | Regular BP monitoring |
| target_pmpy | Decimal | Yes | Target cost per member per year | Non-negative, 2 decimals | 2500.00 |
| risk_level | String | Yes | Clinical risk level | Low, Medium, High | Medium |

**Business Rules:**
- PMPY (Per Member Per Year) used for cost benchmarking
- Compliance tracked separately in claims/demographics data

---

### 6. place-of-service-reference-template.csv
**Purpose:** Service location reference
**Frequency:** Update as needed
**Primary Key:** pos_code

| Field Name | Data Type | Required | Description | Validation Rules | Example |
|------------|-----------|----------|-------------|------------------|---------|
| pos_code | String | Yes | Place of service code | Numeric, max 3 digits | 11 |
| pos_description | String | Yes | Service location description | Max 100 chars | Patient Visit |
| cost_category | String | Yes | Cost grouping | Outpatient, Inpatient, Specialty, Pharmacy | Outpatient |
| average_cost_range | String | No | Typical cost range | Format: $X-$Y | $100-$500 |

---

### 7. medical-episodes-reference-template.csv
**Purpose:** Episode of care definitions
**Frequency:** Update annually
**Primary Key:** episode_code

| Field Name | Data Type | Required | Description | Validation Rules | Example |
|------------|-----------|----------|-------------|------------------|---------|
| episode_code | String | Yes | Unique episode identifier | Alphanumeric, max 10 chars | EP001 |
| episode_description | String | Yes | Episode description | Max 200 chars | Cancer of head and neck |
| typical_cost_range | String | No | Expected cost range | Format: $X-$Y | $100000-$500000 |
| duration_days | String | No | Typical episode duration | Format: X-Y | 180-365 |
| related_diagnoses | String | No | Comma-separated ICD-10 codes | Valid ICD-10 codes | C77.9,C18.9 |

---

## Data Relationships

### Primary Relationships
```
member-demographics (member_id)
    ↓ 1:N
claims-data (member_id)
    ↓ N:1
diagnosis-reference (diagnosis_code = icd10_code)
    ↓ N:1
drug-class-reference (drug_class)
    ↓ N:1
place-of-service-reference (place_of_service → pos_description)
    ↓ N:1
medical-episodes-reference (medical_episode → episode_description)
```

### Chronic Conditions Relationship
```
chronic-conditions-reference (icd10_codes)
    ↓
diagnosis-reference (icd10_code)
    ↓
claims-data (diagnosis_code)
    ↓
member-demographics (chronic_conditions)
```

---

## Calculated Fields & KPIs

### Executive Summary Metrics
- **Total Plan Payment (Monthly):** SUM(medical_payment + rx_payment) GROUP BY year_month
- **Member Count (Monthly):** COUNT(DISTINCT member_id WHERE is_active = 'Yes') GROUP BY year_month
- **High-Cost Claimants:** COUNT(DISTINCT member_id WHERE is_high_cost = 'Yes')
- **Cost Per Member (PMPM):** Total Plan Payment / Member Count / Months

### Member-Level Metrics
- **Total Payments:** SUM(total_payment) GROUP BY member_id
- **Claims Count:** COUNT(claim_id) GROUP BY member_id
- **Cost Tier:** Categorize based on annual total_payment
  - <$25K
  - $25K-$49.9K
  - $50K-$99.9K
  - >$100K

### Diagnosis Metrics
- **Total Cost by Diagnosis:** SUM(total_payment) GROUP BY diagnosis_code
- **Utilization Count:** COUNT(claim_id) GROUP BY diagnosis_code
- **% of Total Cost:** (Diagnosis Cost / Total Cost) * 100

### Place of Service Metrics
- **Cost by POS:** SUM(total_payment) GROUP BY place_of_service
- **Utilization by POS:** COUNT(claim_id) GROUP BY place_of_service

### Drug Class Metrics
- **Number of Scripts:** COUNT(claim_id WHERE rx_payment > 0) GROUP BY drug_class
- **Plan Payment:** SUM(rx_payment) GROUP BY drug_class
- **Patient Cost:** (calculated if patient responsibility data available)

### Emergency Room Metrics
- **ER Visits:** COUNT(claim_id WHERE er_category IS NOT NULL)
- **ER by Category:** COUNT(claim_id) GROUP BY er_category
- **Top 5 ER Diagnoses:** TOP 5 diagnosis_code BY COUNT(claim_id) WHERE er_category IS NOT NULL

### Chronic Conditions Metrics
- **Compliant Members:** COUNT(DISTINCT member_id WHERE compliance_met = 'Yes') GROUP BY condition
- **Non-Compliant Members:** COUNT(DISTINCT member_id WHERE compliance_met = 'No') GROUP BY condition
- **PMPY Cost:** SUM(total_payment) / COUNT(DISTINCT member_id) / Years GROUP BY condition

### Preventive Screenings Metrics
- **Participation %:** (Members Screened / Total Eligible Members) * 100
- **YoY Trend:** Current Year % - Prior Year %

---

## Data Validation Rules

### File-Level Validations
1. **Required Files:** claims-data, member-demographics (minimum)
2. **File Format:** CSV with comma delimiters, UTF-8 encoding
3. **Header Row:** Must match template exactly (case-sensitive)
4. **Max File Size:** 50MB per file
5. **Max Files:** 5 files per upload

### Field-Level Validations
1. **Date Fields:** YYYY-MM-DD format, valid calendar dates
2. **Decimal Fields:** Non-negative, max 2 decimal places
3. **Required Fields:** Cannot be empty/null
4. **Foreign Keys:** Must exist in reference data (e.g., member_id in demographics)
5. **Calculated Fields:** Must pass logic checks (total = medical + rx)

### Business Logic Validations
1. **Enrollment Logic:** termination_date must be >= enrollment_date
2. **Cost Tiers:** Must align with total_payment amounts
3. **High-Cost Flag:** is_high_cost = "Yes" only if annual total >= $100,000
4. **Active Status:** is_active = "No" if termination_date <= report date
5. **ICD-10 Codes:** Must be valid format (A00.0 - Z99.99)

### Data Quality Checks
1. **Duplicate Claims:** Flag if claim_id appears multiple times
2. **Missing Member:** Warn if claim references unknown member_id
3. **Orphan Records:** Identify members with demographics but no claims
4. **Zero Costs:** Flag claims with total_payment = 0
5. **Extreme Values:** Warn if single claim > $500,000

---

## Upload Process

### Step 1: Prepare Data
1. Download templates from dashboard
2. Populate with your data
3. Validate data quality locally
4. Save as CSV (UTF-8 encoding)

### Step 2: Upload Files
1. Navigate to Upload Data page
2. Drag and drop CSV files (or click to browse)
3. System validates file format and headers
4. Review validation results

### Step 3: Data Validation
1. System checks required fields
2. Validates data types and formats
3. Checks business logic rules
4. Displays errors/warnings for review

### Step 4: Confirm Upload
1. Review validation summary
2. Fix any critical errors
3. Acknowledge warnings if acceptable
4. Confirm upload to process data

### Step 5: Dashboard Generation
1. System calculates all metrics
2. Generates visualizations
3. Populates summary tables
4. Dashboard becomes available

---

## Sample Data Guide

### Small Dataset (Testing)
- **Members:** 10-50
- **Claims:** 100-500
- **Time Period:** 3-6 months
- **Use Case:** Testing dashboard functionality

### Medium Dataset (Demo)
- **Members:** 500-1,000
- **Claims:** 5,000-10,000
- **Time Period:** 12 months
- **Use Case:** Product demonstrations, UAT

### Large Dataset (Production)
- **Members:** 10,000+
- **Claims:** 100,000+
- **Time Period:** 12-24 months
- **Use Case:** Production reporting

---

## Common Data Issues & Solutions

| Issue | Description | Solution |
|-------|-------------|----------|
| Date format errors | Dates in MM/DD/YYYY instead of YYYY-MM-DD | Reformat dates in Excel: =TEXT(A2,"YYYY-MM-DD") |
| Decimal precision | Too many decimal places | Round to 2 decimals: =ROUND(A2,2) |
| Missing member_id | Claims without member reference | Add member to demographics first |
| Invalid ICD-10 codes | Diagnosis codes not in reference | Update diagnosis reference or fix code |
| Total mismatch | total_payment ≠ medical + rx | Recalculate: =B2+C2 |
| Character encoding | Special characters display incorrectly | Save as CSV UTF-8 in Excel |
| Duplicate headers | Multiple header rows | Delete extra header rows, keep only first |
| Empty rows | Blank rows in data | Delete empty rows before upload |

---

## Data Privacy & Security

### HIPAA Compliance
- **PHI Fields:** member_id should be de-identified/masked
- **No Direct Identifiers:** Do not include names, SSN, addresses
- **Secure Upload:** Files transmitted over HTTPS
- **Data Retention:** Specify retention period per policy
- **Access Controls:** Limit dashboard access to authorized users

### Best Practices
1. Use synthetic/masked member IDs
2. Aggregate data where possible
3. Remove unnecessary PHI before upload
4. Log all data access
5. Regularly audit data usage

---

## Frequently Asked Questions

**Q: Can I upload partial data (claims only, no demographics)?**
A: Yes, but member-level metrics won't be available without demographics.

**Q: How often should I upload data?**
A: Monthly is recommended for trend analysis and KPI tracking.

**Q: What if I have custom fields not in the template?**
A: Additional columns are ignored. Core fields must match template exactly.

**Q: Can I update previously uploaded data?**
A: Yes, re-upload with same year_month to replace existing data.

**Q: What's the difference between medical_payment and total_payment?**
A: medical_payment is medical services only, total_payment = medical + rx.

**Q: How are high-cost claimants identified?**
A: Members with annual total_payment ≥ $100,000 across all claims.

**Q: What if my diagnosis codes aren't in the reference file?**
A: Update diagnosis-reference-template.csv with your codes before uploading claims.

**Q: Can I export data from the dashboard?**
A: Yes, summary tables and reports can be exported to PDF/Excel.

---

## Support & Resources

- **Template Downloads:** [/dashboard/upload](http://localhost:3000/dashboard/upload)
- **Upload Interface:** [/dashboard/upload](http://localhost:3000/dashboard/upload)
- **Dashboard Home:** [/dashboard](http://localhost:3000/dashboard)
- **Documentation:** This file (DATA-DICTIONARY.md)

---

**Version:** 1.0
**Last Updated:** 2024-01-01
**Maintained By:** C&E Reporting Platform Team
