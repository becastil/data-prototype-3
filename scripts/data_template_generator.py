"""
Healthcare Analytics Data Template Generator
============================================

Reverse-engineers data requirements from dashboard visualizations to create
comprehensive CSV templates, schemas, and mock data generators.

This module analyzes the ComprehensiveAnalyticsDashboard component and generates:
- Data schemas for each visualization type
- CSV template files with proper headers and data types
- Data validation rules
- Mock data generators
- Mapping between CSV columns and chart elements
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from enum import Enum
import csv
import random
import json
from pathlib import Path


# ============================================================================
# ENUMS AND CONSTANTS
# ============================================================================

class CostRange(Enum):
    """Member cost bracket classifications"""
    UNDER_25K = "<$25K"
    RANGE_25K_50K = "$25K-$49.9K"
    RANGE_50K_100K = "$50K-$99.9K"
    OVER_100K = ">$100K"


class PredictedCostRange(Enum):
    """Predicted future cost ranges for high-cost claimants"""
    OVER_250K = ">$250,000"
    RANGE_100K_250K = "$100,000-$250,000"
    RANGE_50K_100K = "$50,000-$100,000"
    UNDER_50K = "<$50,000"


class PlaceOfService(Enum):
    """Healthcare service location categories"""
    OUTPATIENT_PROCEDURES = "Outpatient Procedures"
    INPATIENT_HOSPITAL = "Hospital Stay (In-Patient)"
    DRUGS = "Drugs"
    IMMEDIATE_ATTENTION = "Immediate Medical Attention"
    TESTING = "Testing"
    OFFICE_CLINIC = "Office/Clinic Visit"
    SUBSTANCE_ABUSE = "Substance Abuse"
    MENTAL_HEALTH = "Mental Health"
    PREGNANCY = "Pregnancy"
    RECOVERY = "Recovery"


class ERCategory(Enum):
    """Emergency room visit classification"""
    ALL_OTHERS = "ER All Others"
    DRUG_ALCOHOL_PSYCH = "ER Drug Alcohol Psych"
    INJURY = "ER Injury"
    NON_EMERGENT_AVOIDABLE = "ER Non Emergent, Avoidable"
    PCP_TREATABLE = "ER PCP Treatable"


# ============================================================================
# DATA SCHEMA CLASSES
# ============================================================================

@dataclass
class PlanInfo:
    """
    Plan identification and period information

    Maps to: Header Card (Dashboard top section)
    """
    client_name: str
    plan_start_date: str  # Format: YYYY-MM-DD
    plan_end_date: str    # Format: YYYY-MM-DD

    def get_plan_period_display(self) -> str:
        """Returns formatted plan period (M/D/YYYY - M/D/YYYY)"""
        start = datetime.strptime(self.plan_start_date, '%Y-%m-%d')
        end = datetime.strptime(self.plan_end_date, '%Y-%m-%d')
        return f"{start.month}/{start.day}/{start.year} - {end.month}/{end.day}/{end.year}"


@dataclass
class FinancialKPI:
    """
    Key financial metrics for the plan period

    Maps to: KPI Cards (3 cards showing total payments)
    - Plan Payment (total)
    - Medical Plan Payment
    - RX Plan Payment
    """
    total_plan_payment: float       # Total across all categories
    medical_plan_payment: float     # Medical services only
    rx_plan_payment: float          # Prescription drugs only

    def validate(self) -> bool:
        """Ensures medical + rx equals total (within rounding)"""
        calculated_total = self.medical_plan_payment + self.rx_plan_payment
        return abs(calculated_total - self.total_plan_payment) < 1.0


@dataclass
class MonthlyCostSummary:
    """
    Monthly cost breakdown with enrollment tracking

    Maps to: Monthly Cost Summary Chart (Area/Line chart)
    - X-axis: Month names
    - Y-axis: Dollar amounts
    - Two series: Medical Plan Payment (blue), RX Plan Payment (orange)
    - Also used for member enrollment tracking over time
    """
    month: str                      # "April", "May", etc.
    year: int                       # 2024
    medical_plan_payment: float     # Medical costs for the month
    rx_plan_payment: float          # RX costs for the month
    member_enrollment: int          # Active members in this month

    @property
    def total_payment(self) -> float:
        return self.medical_plan_payment + self.rx_plan_payment

    @property
    def per_member_cost(self) -> float:
        """PMPM (Per Member Per Month) calculation"""
        return self.total_payment / self.member_enrollment if self.member_enrollment > 0 else 0


@dataclass
class MemberDistribution:
    """
    Member distribution across cost brackets

    Maps to: Member Distribution Chart (Horizontal stacked bar chart)
    - Categories: <$25K, $25K-$49.9K, $50K-$99.9K, >$100K
    - Two metrics per bracket: Claimants (%), Payments (%)
    - Shows concentration of costs in high-cost members
    """
    cost_range: CostRange           # Cost bracket
    claimants_percent: float        # % of total claimants in this bracket (0-100)
    payments_percent: float         # % of total payments from this bracket (0-100)

    def validate(self) -> bool:
        """Ensure percentages are valid"""
        return 0 <= self.claimants_percent <= 100 and 0 <= self.payments_percent <= 100


@dataclass
class BudgetVsActuals:
    """
    Monthly budget comparison with actual costs

    Maps to: Budget vs Actuals Chart (Stacked bar with line overlay)
    - X-axis: Monthly periods
    - Y-axis: Dollar amounts
    - Three series: Claims (stacked), Fixed Costs (stacked), Budget (line)
    """
    month: str                      # "April", "May", etc.
    year: int                       # 2024
    claims_actual: float            # Actual claim costs
    fixed_costs_actual: float       # Fixed administrative/overhead costs
    budget_total: float             # Budgeted amount for the month

    @property
    def total_actual(self) -> float:
        return self.claims_actual + self.fixed_costs_actual

    @property
    def variance(self) -> float:
        """Budget variance (positive = under budget)"""
        return self.budget_total - self.total_actual

    @property
    def variance_percent(self) -> float:
        """Budget variance as percentage"""
        return (self.variance / self.budget_total * 100) if self.budget_total > 0 else 0


@dataclass
class HighCostClaimant:
    """
    Individual high-cost member tracking

    Maps to: Top 10 High-Cost Claimants Table
    - Columns: Member ID, Medical Payment, RX Payment, Plan Payment, Predicted Cost Range
    - Used to identify members requiring case management
    """
    member_id: str                  # Masked/hashed member identifier
    medical_payment: float          # Total medical costs
    rx_payment: float               # Total prescription costs
    predicted_cost_range: Optional[PredictedCostRange] = None  # Future cost prediction

    @property
    def total_plan_payment(self) -> float:
        return self.medical_payment + self.rx_payment


@dataclass
class PlaceOfServiceData:
    """
    Healthcare service location breakdown

    Maps to: Place of Service Chart (Horizontal bar chart)
    - Categories: Procedures, Patient, Drugs, Attention, Testing, Clinic, etc.
    - Single metric: Dollar amounts per service type
    """
    service_category: PlaceOfService
    total_amount: float             # Total spend in this category
    claim_count: Optional[int] = None  # Number of claims (optional)


@dataclass
class DiagnosisByCost:
    """
    Top diagnoses ranked by total cost

    Maps to: Top 10 Diagnosis by Cost (Pie chart + Table)
    - Table columns: Code, Description, Cost, Percentage
    - Pie chart: Each diagnosis as a slice
    """
    diagnosis_code: str             # ICD-10 code (e.g., "C02.1")
    diagnosis_description: str      # Full description
    total_cost: float               # Total costs for this diagnosis
    percentage: float               # % of total diagnosis costs (0-100)

    def validate(self) -> bool:
        return 0 <= self.percentage <= 100


@dataclass
class DiagnosisByUtilization:
    """
    Top diagnoses ranked by frequency

    Maps to: Top 10 Diagnosis by Utilization (Pie chart + Table)
    - Table columns: Code, Description, Count, Percentage
    - Pie chart: Each diagnosis as a slice
    """
    diagnosis_code: str             # ICD-10 code
    diagnosis_description: str      # Full description
    claim_count: int                # Number of claims with this diagnosis
    percentage: float               # % of total claims (0-100)

    def validate(self) -> bool:
        return 0 <= self.percentage <= 100


@dataclass
class MedicalEpisode:
    """
    Episode-based cost grouping

    Maps to: Top 10 Medical Episodes by Plan Payment (Bar chart)
    - Categories: Episode types (Cancer, Heart disease, Chemotherapy, etc.)
    - Single metric: Plan Payment amounts
    """
    episode_description: str        # "Cancer of head and neck", etc.
    total_cost: float               # Total costs for this episode type
    percentage: float               # % of total episode costs (0-100)

    def validate(self) -> bool:
        return 0 <= self.percentage <= 100


@dataclass
class DrugClass:
    """
    Prescription drug utilization by therapeutic class

    Maps to: Top Drug Classes by Utilization Table
    - Columns: Drug Class, Scripts (count), Patient Cost, Plan Payment
    """
    drug_class_name: str            # "ANTIHYPERTENSIVES", etc.
    script_count: int               # Number of prescriptions filled
    patient_cost: float             # Total patient out-of-pocket
    plan_payment: float             # Total plan payment for this class


@dataclass
class ERUtilization:
    """
    Emergency room visit categorization

    Maps to: Emergency Room Category Chart (Bar chart)
    - Categories: All Others, Injury, PCP Treatable, etc.
    - Single metric: Count of visits
    """
    er_category: ERCategory
    visit_count: int                # Number of ER visits in this category


@dataclass
class ERTopDiagnosis:
    """
    Most common ER visit diagnoses

    Maps to: ER Visits - Top 5 Diagnosis (Horizontal bar chart)
    - Diagnosis descriptions with visit counts
    """
    diagnosis_description: str      # "Chest pain; unspecified", etc.
    visit_count: int                # Number of ER visits with this diagnosis


@dataclass
class ChronicConditionCompliance:
    """
    Care compliance tracking for chronic conditions

    Maps to: Chronic Condition Care Compliance (Stacked bar chart)
    - X-axis: Chronic conditions (Hypertension, Diabetes, etc.)
    - Two series: Non-Compliant (red), Compliant (green)
    - Shows adherence to care protocols
    """
    condition_name: str             # "Hypertension", "Diabetes", etc.
    compliant_count: int            # Members compliant with care protocols
    non_compliant_count: int        # Members not compliant
    avg_pmpy: float                 # Average Per Member Per Year cost

    @property
    def total_members(self) -> int:
        return self.compliant_count + self.non_compliant_count

    @property
    def compliance_rate(self) -> float:
        """Returns compliance rate as percentage (0-100)"""
        return (self.compliant_count / self.total_members * 100) if self.total_members > 0 else 0


@dataclass
class PreventiveScreening:
    """
    Year-over-year preventive screening participation

    Maps to: Adult Preventive Screenings Table (Year-over-Year)
    - Columns: Screening, Prior Year Members, Current Members,
               Prior Participation (%), Current Participation (%), Trend
    """
    screening_name: str             # "Preventive Care Visit", etc.
    prior_year_members: int         # Eligible members prior year
    current_year_members: int       # Eligible members current year
    prior_participation_percent: float  # Prior year participation % (0-100)
    current_participation_percent: float  # Current year participation % (0-100)

    @property
    def participation_change(self) -> float:
        """Percentage point change in participation"""
        return self.current_participation_percent - self.prior_participation_percent

    @property
    def trend_direction(self) -> str:
        """Returns 'up', 'down', or 'flat'"""
        if self.participation_change > 0.5:
            return "up"
        elif self.participation_change < -0.5:
            return "down"
        else:
            return "flat"

    def validate(self) -> bool:
        return (0 <= self.prior_participation_percent <= 100 and
                0 <= self.current_participation_percent <= 100)


# ============================================================================
# CONSOLIDATED DASHBOARD DATA MODEL
# ============================================================================

@dataclass
class CompleteDashboardData:
    """
    Complete data model encompassing all dashboard visualizations

    This master class contains all data needed to populate the entire
    ComprehensiveAnalyticsDashboard component.
    """
    # Plan information
    plan_info: PlanInfo

    # Financial KPIs
    financial_kpis: FinancialKPI

    # Time-series data
    monthly_costs: List[MonthlyCostSummary]
    budget_vs_actuals: List[BudgetVsActuals]

    # Distribution data
    member_distribution: List[MemberDistribution]

    # High-cost claimants
    top_claimants: List[HighCostClaimant]

    # Service and diagnosis data
    place_of_service: List[PlaceOfServiceData]
    diagnosis_by_cost: List[DiagnosisByCost]
    diagnosis_by_utilization: List[DiagnosisByUtilization]
    medical_episodes: List[MedicalEpisode]

    # Drug data
    drug_classes: List[DrugClass]

    # ER data
    er_utilization: List[ERUtilization]
    er_top_diagnoses: List[ERTopDiagnosis]

    # Chronic care and preventive
    chronic_condition_compliance: List[ChronicConditionCompliance]
    preventive_screenings: List[PreventiveScreening]

    def validate_all(self) -> Tuple[bool, List[str]]:
        """
        Validates all data components

        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []

        # Validate financial KPIs
        if not self.financial_kpis.validate():
            errors.append("Financial KPIs: Medical + RX doesn't equal total")

        # Validate monthly costs
        if len(self.monthly_costs) != 12:
            errors.append(f"Monthly costs: Expected 12 months, got {len(self.monthly_costs)}")

        # Validate member distribution percentages sum to ~100%
        total_claimants = sum(d.claimants_percent for d in self.member_distribution)
        total_payments = sum(d.payments_percent for d in self.member_distribution)
        if not (99 <= total_claimants <= 101):
            errors.append(f"Member distribution: Claimants % sum to {total_claimants}, expected ~100")
        if not (99 <= total_payments <= 101):
            errors.append(f"Member distribution: Payments % sum to {total_payments}, expected ~100")

        # Validate diagnosis percentages
        for diag in self.diagnosis_by_cost:
            if not diag.validate():
                errors.append(f"Diagnosis by cost: Invalid percentage for {diag.diagnosis_code}")

        for diag in self.diagnosis_by_utilization:
            if not diag.validate():
                errors.append(f"Diagnosis by utilization: Invalid percentage for {diag.diagnosis_code}")

        # Validate preventive screenings
        for screening in self.preventive_screenings:
            if not screening.validate():
                errors.append(f"Preventive screening: Invalid participation % for {screening.screening_name}")

        return len(errors) == 0, errors


# ============================================================================
# CSV TEMPLATE GENERATORS
# ============================================================================

class CSVTemplateGenerator:
    """
    Generates CSV template files for data import

    Each template includes:
    - Proper column headers
    - Data type descriptions
    - Sample row
    - Validation rules in comments
    """

    @staticmethod
    def generate_monthly_costs_template(output_path: Path) -> None:
        """
        Generates CSV template for Monthly Cost Summary data

        Required columns:
        - month: Month name (January, February, etc.)
        - year: 4-digit year
        - medical_plan_payment: Float, >= 0
        - rx_plan_payment: Float, >= 0
        - member_enrollment: Integer, > 0

        Validation:
        - Must have exactly 12 rows (one per month)
        - Months must be sequential
        - Member enrollment should be consistent or declining
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            # Header with data types
            writer.writerow(['# Monthly Cost Summary - Template'])
            writer.writerow(['# Validation Rules:'])
            writer.writerow(['# - Must have exactly 12 rows (one per month)'])
            writer.writerow(['# - Months: January, February, March, April, May, June, July, August, September, October, November, December'])
            writer.writerow(['# - medical_plan_payment: numeric, >= 0'])
            writer.writerow(['# - rx_plan_payment: numeric, >= 0'])
            writer.writerow(['# - member_enrollment: integer, > 0'])
            writer.writerow([])

            # Column headers
            writer.writerow([
                'month',
                'year',
                'medical_plan_payment',
                'rx_plan_payment',
                'member_enrollment'
            ])

            # Sample row
            writer.writerow([
                'April',
                '2024',
                '450000.00',
                '95000.00',
                '1050'
            ])

    @staticmethod
    def generate_high_cost_claimants_template(output_path: Path) -> None:
        """
        Generates CSV template for High-Cost Claimants data

        Required columns:
        - member_id: String, unique identifier (masked/hashed)
        - medical_payment: Float, >= 0
        - rx_payment: Float, >= 0
        - predicted_cost_range: Optional, one of: >$250,000 | $100,000-$250,000 | $50,000-$100,000 | <$50,000

        Validation:
        - Typically top 10-20 claimants
        - member_id should be de-identified
        - Sorted by total cost descending
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            writer.writerow(['# High-Cost Claimants - Template'])
            writer.writerow(['# Validation Rules:'])
            writer.writerow(['# - member_id: De-identified/hashed identifier'])
            writer.writerow(['# - medical_payment: numeric, >= 0'])
            writer.writerow(['# - rx_payment: numeric, >= 0'])
            writer.writerow(['# - predicted_cost_range: Optional, values: >$250,000 | $100,000-$250,000 | $50,000-$100,000 | <$50,000 | (blank)'])
            writer.writerow(['# - Typically top 10-20 claimants sorted by total descending'])
            writer.writerow([])

            writer.writerow([
                'member_id',
                'medical_payment',
                'rx_payment',
                'predicted_cost_range'
            ])

            writer.writerow([
                'M5678871894251147653',
                '551798.00',
                '1648.00',
                '>$250,000'
            ])

    @staticmethod
    def generate_diagnosis_by_cost_template(output_path: Path) -> None:
        """
        Generates CSV template for Diagnosis by Cost data

        Required columns:
        - diagnosis_code: ICD-10 code
        - diagnosis_description: Full diagnosis description
        - total_cost: Float, >= 0
        - percentage: Float, 0-100

        Validation:
        - Top 10 diagnoses only
        - Percentages should sum to ~100%
        - Sorted by cost descending
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            writer.writerow(['# Top Diagnosis by Cost - Template'])
            writer.writerow(['# Validation Rules:'])
            writer.writerow(['# - Top 10 diagnoses only'])
            writer.writerow(['# - diagnosis_code: Valid ICD-10 code'])
            writer.writerow(['# - total_cost: numeric, >= 0'])
            writer.writerow(['# - percentage: numeric, 0-100, all percentages should sum to ~100'])
            writer.writerow(['# - Sorted by total_cost descending'])
            writer.writerow([])

            writer.writerow([
                'diagnosis_code',
                'diagnosis_description',
                'total_cost',
                'percentage'
            ])

            writer.writerow([
                'C02.1',
                'Malignant neoplasm of border of tongue',
                '305000.00',
                '17.02'
            ])

    @staticmethod
    def generate_diagnosis_by_utilization_template(output_path: Path) -> None:
        """
        Generates CSV template for Diagnosis by Utilization data

        Required columns:
        - diagnosis_code: ICD-10 code
        - diagnosis_description: Full diagnosis description
        - claim_count: Integer, > 0
        - percentage: Float, 0-100

        Validation:
        - Top 10 diagnoses only
        - Percentages should sum to ~100%
        - Sorted by count descending
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            writer.writerow(['# Top Diagnosis by Utilization - Template'])
            writer.writerow(['# Validation Rules:'])
            writer.writerow(['# - Top 10 diagnoses only'])
            writer.writerow(['# - diagnosis_code: Valid ICD-10 code'])
            writer.writerow(['# - claim_count: integer, > 0'])
            writer.writerow(['# - percentage: numeric, 0-100, all percentages should sum to ~100'])
            writer.writerow(['# - Sorted by claim_count descending'])
            writer.writerow([])

            writer.writerow([
                'diagnosis_code',
                'diagnosis_description',
                'claim_count',
                'percentage'
            ])

            writer.writerow([
                'Z00.00',
                'Encounter for general adult medical exam',
                '2000',
                '29.87'
            ])

    @staticmethod
    def generate_drug_classes_template(output_path: Path) -> None:
        """
        Generates CSV template for Drug Classes data

        Required columns:
        - drug_class_name: Therapeutic class name
        - script_count: Integer, > 0
        - patient_cost: Float, >= 0
        - plan_payment: Float, >= 0

        Validation:
        - Top 10 drug classes by utilization
        - Sorted by script_count descending
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            writer.writerow(['# Top Drug Classes by Utilization - Template'])
            writer.writerow(['# Validation Rules:'])
            writer.writerow(['# - Top 10 drug classes only'])
            writer.writerow(['# - drug_class_name: Therapeutic class name (all caps)'])
            writer.writerow(['# - script_count: integer, > 0'])
            writer.writerow(['# - patient_cost: numeric, >= 0 (patient out-of-pocket)'])
            writer.writerow(['# - plan_payment: numeric, >= 0 (plan payment)'])
            writer.writerow(['# - Sorted by script_count descending'])
            writer.writerow([])

            writer.writerow([
                'drug_class_name',
                'script_count',
                'patient_cost',
                'plan_payment'
            ])

            writer.writerow([
                'ANTIHYPERTENSIVES',
                '1149',
                '8640.91',
                '4861.57'
            ])

    @staticmethod
    def generate_preventive_screenings_template(output_path: Path) -> None:
        """
        Generates CSV template for Preventive Screenings data

        Required columns:
        - screening_name: Name of screening
        - prior_year_members: Integer, >= 0
        - current_year_members: Integer, >= 0
        - prior_participation_percent: Float, 0-100
        - current_participation_percent: Float, 0-100

        Validation:
        - Common screenings (6-10 types)
        - Participation percentages must be 0-100
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            writer.writerow(['# Adult Preventive Screenings - Template'])
            writer.writerow(['# Validation Rules:'])
            writer.writerow(['# - screening_name: Type of preventive screening'])
            writer.writerow(['# - prior_year_members: integer, >= 0 (eligible members prior year)'])
            writer.writerow(['# - current_year_members: integer, >= 0 (eligible members current year)'])
            writer.writerow(['# - prior_participation_percent: numeric, 0-100'])
            writer.writerow(['# - current_participation_percent: numeric, 0-100'])
            writer.writerow([])

            writer.writerow([
                'screening_name',
                'prior_year_members',
                'current_year_members',
                'prior_participation_percent',
                'current_participation_percent'
            ])

            writer.writerow([
                'Preventive Care Visit',
                '1100',
                '1050',
                '92',
                '94'
            ])

    @staticmethod
    def generate_chronic_condition_compliance_template(output_path: Path) -> None:
        """
        Generates CSV template for Chronic Condition Care Compliance data

        Required columns:
        - condition_name: Chronic condition name
        - compliant_count: Integer, >= 0
        - non_compliant_count: Integer, >= 0
        - avg_pmpy: Float, >= 0 (Average Per Member Per Year cost)

        Validation:
        - 5-10 common chronic conditions
        - Compliance counts should reflect actual member population
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            writer.writerow(['# Chronic Condition Care Compliance - Template'])
            writer.writerow(['# Validation Rules:'])
            writer.writerow(['# - condition_name: Chronic condition name'])
            writer.writerow(['# - compliant_count: integer, >= 0 (members compliant with care protocols)'])
            writer.writerow(['# - non_compliant_count: integer, >= 0 (members not compliant)'])
            writer.writerow(['# - avg_pmpy: numeric, >= 0 (Average Per Member Per Year cost)'])
            writer.writerow([])

            writer.writerow([
                'condition_name',
                'compliant_count',
                'non_compliant_count',
                'avg_pmpy'
            ])

            writer.writerow([
                'Hypertension',
                '180',
                '65',
                '12000.00'
            ])

    @staticmethod
    def generate_all_templates(output_dir: Path) -> None:
        """
        Generates all CSV templates in the specified directory

        Args:
            output_dir: Directory path where templates will be created
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        templates = [
            ('monthly_costs.csv', CSVTemplateGenerator.generate_monthly_costs_template),
            ('high_cost_claimants.csv', CSVTemplateGenerator.generate_high_cost_claimants_template),
            ('diagnosis_by_cost.csv', CSVTemplateGenerator.generate_diagnosis_by_cost_template),
            ('diagnosis_by_utilization.csv', CSVTemplateGenerator.generate_diagnosis_by_utilization_template),
            ('drug_classes.csv', CSVTemplateGenerator.generate_drug_classes_template),
            ('preventive_screenings.csv', CSVTemplateGenerator.generate_preventive_screenings_template),
            ('chronic_condition_compliance.csv', CSVTemplateGenerator.generate_chronic_condition_compliance_template),
        ]

        for filename, generator_func in templates:
            output_path = output_dir / filename
            generator_func(output_path)
            print(f"✓ Generated template: {output_path}")


# ============================================================================
# MOCK DATA GENERATORS
# ============================================================================

class MockDataGenerator:
    """
    Generates realistic mock data for all dashboard visualizations

    Uses healthcare-specific data patterns and realistic distributions
    to create sample datasets.
    """

    # Common diagnosis codes and descriptions
    ICD10_CODES = [
        ("C02.1", "Malignant neoplasm of border of tongue"),
        ("C04.9", "Malignant neoplasm of floor of mouth"),
        ("I71.01", "Dissection of ascending aorta"),
        ("A41.9", "Sepsis; unspecified organism"),
        ("Z51.12", "Encounter for antineoplastic immunotherapy"),
        ("J96.01", "Acute respiratory failure with hypoxia"),
        ("I42.2", "Other hypertrophic cardiomyopathy"),
        ("Z12.39", "Encounter for screening for malignant neoplasm"),
        ("C34.11", "Malignant neoplasm of upper lobe, right bronchus"),
        ("I47.1", "Other supraventricular tachycardia"),
        ("Z00.00", "Encounter for general adult medical exam"),
        ("I10", "Essential (primary) hypertension"),
        ("Z23", "Encounter for immunization"),
        ("E11.65", "Type 2 diabetes mellitus with hyperglycemia"),
        ("G47.33", "Obstructive sleep apnea (adult)"),
        ("Z51.11", "Encounter for antineoplastic chemotherapy"),
        ("Z12.11", "Encounter for screening for malignant neoplasm of colon"),
        ("E11.9", "Type 2 diabetes mellitus without complications"),
    ]

    DRUG_CLASSES = [
        "ANTIHYPERTENSIVES",
        "ANTIDEPRESSANTS",
        "ANTIHYPERLIPIDEMICS",
        "ANTIDIABETICS",
        "ANTICONVULSANTS",
        "BETA BLOCKERS",
        "ANTIASTHMATIC AND BRONCHODILATOR AGENTS",
        "CALCIUM CHANNEL BLOCKERS",
        "ANALGESICS - OPIOID",
        "ADHD/ANTI-NARCOLEPSY/ANTI-OBESITY/ANOREXIANTS",
    ]

    CHRONIC_CONDITIONS = [
        "Hypertension",
        "Lipid Metabolism",
        "Depression",
        "Asthma",
        "Diabetes",
        "Hypothyroidism",
        "Ischemic Heart Disease",
    ]

    PREVENTIVE_SCREENINGS = [
        "Preventive Care Visit",
        "Lipid Disorder Screening",
        "Diabetes Screening",
        "Colorectal Cancer Screening",
        "Cervical Cancer Screening",
        "Breast Cancer Screening",
    ]

    @staticmethod
    def generate_member_id() -> str:
        """Generates a realistic masked member ID"""
        return f"M{random.randint(1000000000000000000, 9999999999999999999)}"

    @staticmethod
    def generate_monthly_costs(year: int = 2024, base_enrollment: int = 1200) -> List[MonthlyCostSummary]:
        """
        Generates 12 months of cost data with realistic patterns

        - Medical costs vary with seasonal patterns
        - RX costs are more stable
        - Enrollment typically declines slightly over time
        """
        months = ["April", "May", "June", "July", "August", "September",
                  "October", "November", "December", "January", "February", "March"]

        monthly_data = []
        enrollment = base_enrollment

        for i, month in enumerate(months):
            # Seasonal variation in medical costs
            seasonal_factor = 1.0 + random.uniform(-0.3, 0.3)
            # Potential spike in costs (10% chance of high-cost month)
            spike = random.uniform(1.0, 2.0) if random.random() < 0.1 else 1.0

            medical = int(450000 * seasonal_factor * spike)
            rx = int(random.uniform(85000, 125000))

            # Enrollment decreases slightly over time
            enrollment = max(900, enrollment - random.randint(0, 25))

            monthly_data.append(MonthlyCostSummary(
                month=month,
                year=year,
                medical_plan_payment=float(medical),
                rx_plan_payment=float(rx),
                member_enrollment=enrollment
            ))

        return monthly_data

    @staticmethod
    def generate_high_cost_claimants(count: int = 10) -> List[HighCostClaimant]:
        """
        Generates high-cost claimant data

        - Costs follow Pareto distribution (80/20 rule)
        - Top claimants have very high costs
        - Some have predictive cost ranges
        """
        claimants = []

        for i in range(count):
            # Pareto distribution for costs
            base_cost = 600000 / (i + 1) ** 0.7
            medical = base_cost * random.uniform(0.85, 0.98)
            rx = base_cost - medical

            # Only assign prediction to ~70% of claimants
            prediction = None
            if random.random() < 0.7:
                total = medical + rx
                if total > 400000:
                    prediction = PredictedCostRange.OVER_250K
                elif total > 150000:
                    prediction = PredictedCostRange.RANGE_100K_250K
                elif total > 75000:
                    prediction = PredictedCostRange.RANGE_50K_100K
                else:
                    prediction = PredictedCostRange.UNDER_50K

            claimants.append(HighCostClaimant(
                member_id=MockDataGenerator.generate_member_id(),
                medical_payment=medical,
                rx_payment=rx,
                predicted_cost_range=prediction
            ))

        # Sort by total cost descending
        claimants.sort(key=lambda x: x.total_plan_payment, reverse=True)

        return claimants

    @staticmethod
    def generate_diagnosis_by_cost(count: int = 10) -> List[DiagnosisByCost]:
        """
        Generates top diagnoses by cost

        - Uses realistic ICD-10 codes
        - Percentages sum to 100%
        - Sorted by cost descending
        """
        diagnoses = []
        total_cost = 1800000  # Total diagnosis pool
        remaining_percent = 100.0

        for i in range(count):
            code, description = MockDataGenerator.ICD10_CODES[i % len(MockDataGenerator.ICD10_CODES)]

            # Decreasing percentage allocation
            if i < count - 1:
                percent = remaining_percent * random.uniform(0.15, 0.25) / (count - i)
            else:
                percent = remaining_percent  # Last diagnosis gets remaining

            cost = total_cost * (percent / 100)

            diagnoses.append(DiagnosisByCost(
                diagnosis_code=code,
                diagnosis_description=description,
                total_cost=cost,
                percentage=percent
            ))

            remaining_percent -= percent

        return diagnoses

    @staticmethod
    def generate_diagnosis_by_utilization(count: int = 10) -> List[DiagnosisByUtilization]:
        """
        Generates top diagnoses by utilization

        - Uses realistic ICD-10 codes
        - Percentages sum to 100%
        - Sorted by count descending
        """
        diagnoses = []
        total_claims = 6700  # Total claim count
        remaining_percent = 100.0

        for i in range(count):
            code, description = MockDataGenerator.ICD10_CODES[i + 10 % len(MockDataGenerator.ICD10_CODES)]

            # Decreasing percentage allocation
            if i < count - 1:
                percent = remaining_percent * random.uniform(0.08, 0.35) / (count - i)
            else:
                percent = remaining_percent

            claim_count = int(total_claims * (percent / 100))

            diagnoses.append(DiagnosisByUtilization(
                diagnosis_code=code,
                diagnosis_description=description,
                claim_count=claim_count,
                percentage=percent
            ))

            remaining_percent -= percent

        # Sort by count descending
        diagnoses.sort(key=lambda x: x.claim_count, reverse=True)

        return diagnoses

    @staticmethod
    def generate_drug_classes(count: int = 10) -> List[DrugClass]:
        """
        Generates drug class utilization data

        - Realistic therapeutic classes
        - Script counts, patient costs, plan payments
        - Sorted by script count descending
        """
        drug_data = []

        for i in range(count):
            class_name = MockDataGenerator.DRUG_CLASSES[i % len(MockDataGenerator.DRUG_CLASSES)]
            scripts = int(random.uniform(300, 1200))
            patient_cost = scripts * random.uniform(5, 50)
            plan_payment = scripts * random.uniform(3, 500)

            drug_data.append(DrugClass(
                drug_class_name=class_name,
                script_count=scripts,
                patient_cost=patient_cost,
                plan_payment=plan_payment
            ))

        # Sort by script count descending
        drug_data.sort(key=lambda x: x.script_count, reverse=True)

        return drug_data

    @staticmethod
    def generate_chronic_condition_compliance() -> List[ChronicConditionCompliance]:
        """
        Generates chronic condition care compliance data

        - Common chronic conditions
        - Compliance rates vary by condition
        - Higher cost conditions typically have lower compliance
        """
        compliance_data = []

        for condition in MockDataGenerator.CHRONIC_CONDITIONS:
            total_members = random.randint(50, 250)
            compliance_rate = random.uniform(0.5, 0.8)  # 50-80% compliance
            compliant = int(total_members * compliance_rate)
            non_compliant = total_members - compliant

            # Higher cost conditions
            if condition in ["Ischemic Heart Disease", "Diabetes"]:
                avg_pmpy = random.uniform(20000, 40000)
                # Lower compliance for expensive conditions
                if random.random() < 0.5:
                    compliant, non_compliant = non_compliant, compliant
            else:
                avg_pmpy = random.uniform(8000, 18000)

            compliance_data.append(ChronicConditionCompliance(
                condition_name=condition,
                compliant_count=compliant,
                non_compliant_count=non_compliant,
                avg_pmpy=avg_pmpy
            ))

        return compliance_data

    @staticmethod
    def generate_preventive_screenings() -> List[PreventiveScreening]:
        """
        Generates preventive screening participation data

        - Year-over-year comparison
        - Generally improving participation rates
        - Declining eligible populations in some categories
        """
        screenings = []

        for screening_name in MockDataGenerator.PREVENTIVE_SCREENINGS:
            prior_members = random.randint(250, 1100)
            # Current members typically decrease
            current_members = int(prior_members * random.uniform(0.85, 1.05))

            prior_participation = random.uniform(45, 85)
            # Most screenings show improvement
            if random.random() < 0.8:
                current_participation = prior_participation + random.uniform(1, 8)
            else:
                current_participation = prior_participation - random.uniform(1, 5)

            # Cap at 100%
            current_participation = min(current_participation, 100.0)

            screenings.append(PreventiveScreening(
                screening_name=screening_name,
                prior_year_members=prior_members,
                current_year_members=current_members,
                prior_participation_percent=round(prior_participation, 1),
                current_participation_percent=round(current_participation, 1)
            ))

        return screenings

    @staticmethod
    def generate_complete_dashboard_data() -> CompleteDashboardData:
        """
        Generates a complete dataset for the entire dashboard

        Returns:
            CompleteDashboardData with all visualizations populated
        """
        # Generate monthly costs first (needed for aggregations)
        monthly_costs = MockDataGenerator.generate_monthly_costs()

        # Calculate financial KPIs from monthly data
        total_medical = sum(m.medical_plan_payment for m in monthly_costs)
        total_rx = sum(m.rx_plan_payment for m in monthly_costs)

        # Generate budget data
        budget_data = []
        for month_data in monthly_costs:
            budget_total = month_data.total_payment * random.uniform(1.05, 1.15)
            claims = month_data.total_payment * random.uniform(0.75, 0.85)
            fixed = month_data.total_payment - claims

            budget_data.append(BudgetVsActuals(
                month=month_data.month,
                year=month_data.year,
                claims_actual=claims,
                fixed_costs_actual=fixed,
                budget_total=budget_total
            ))

        # Member distribution (Pareto principle)
        member_dist = [
            MemberDistribution(CostRange.UNDER_25K, 94.0, 29.0),
            MemberDistribution(CostRange.RANGE_25K_50K, 2.0, 9.0),
            MemberDistribution(CostRange.RANGE_50K_100K, 2.0, 19.0),
            MemberDistribution(CostRange.OVER_100K, 2.0, 43.0),
        ]

        # Place of service data
        pos_data = [
            PlaceOfServiceData(PlaceOfService.OUTPATIENT_PROCEDURES, total_medical * 0.34),
            PlaceOfServiceData(PlaceOfService.INPATIENT_HOSPITAL, total_medical * 0.23),
            PlaceOfServiceData(PlaceOfService.DRUGS, total_rx),
            PlaceOfServiceData(PlaceOfService.IMMEDIATE_ATTENTION, total_medical * 0.10),
            PlaceOfServiceData(PlaceOfService.TESTING, total_medical * 0.06),
            PlaceOfServiceData(PlaceOfService.OFFICE_CLINIC, total_medical * 0.05),
            PlaceOfServiceData(PlaceOfService.SUBSTANCE_ABUSE, total_medical * 0.015),
            PlaceOfServiceData(PlaceOfService.MENTAL_HEALTH, total_medical * 0.009),
            PlaceOfServiceData(PlaceOfService.PREGNANCY, total_medical * 0.006),
            PlaceOfServiceData(PlaceOfService.RECOVERY, total_medical * 0.005),
        ]

        # Medical episodes
        episodes = [
            MedicalEpisode("Cancer of head and neck", 699000, 22.84),
            MedicalEpisode("Heart disease", 509000, 16.63),
            MedicalEpisode("Chemotherapy", 322000, 10.52),
            MedicalEpisode("Respiratory disease", 286000, 9.34),
            MedicalEpisode("Screening", 276000, 9.02),
            MedicalEpisode("Septicemia", 256000, 8.35),
            MedicalEpisode("Vascular disorder", 218000, 7.11),
            MedicalEpisode("Back pain", 176000, 5.76),
            MedicalEpisode("Cancer of respiratory system", 161000, 5.25),
            MedicalEpisode("Medical examination", 159000, 5.19),
        ]

        # ER utilization
        er_util = [
            ERUtilization(ERCategory.ALL_OTHERS, 1560),
            ERUtilization(ERCategory.DRUG_ALCOHOL_PSYCH, 133),
            ERUtilization(ERCategory.INJURY, 497),
            ERUtilization(ERCategory.NON_EMERGENT_AVOIDABLE, 1576),
            ERUtilization(ERCategory.PCP_TREATABLE, 1464),
        ]

        er_diagnoses = [
            ERTopDiagnosis("Chest pain; unspecified", 117),
            ERTopDiagnosis("Neutropenia; unspecified", 104),
            ERTopDiagnosis("Hydronephrosis with renal and ureteral calculous", 101),
            ERTopDiagnosis("Other chest pain", 101),
            ERTopDiagnosis("Atherosclerotic heart disease", 98),
        ]

        return CompleteDashboardData(
            plan_info=PlanInfo(
                client_name="Sample Healthcare Plan",
                plan_start_date="2024-04-01",
                plan_end_date="2025-03-31"
            ),
            financial_kpis=FinancialKPI(
                total_plan_payment=total_medical + total_rx,
                medical_plan_payment=total_medical,
                rx_plan_payment=total_rx
            ),
            monthly_costs=monthly_costs,
            budget_vs_actuals=budget_data,
            member_distribution=member_dist,
            top_claimants=MockDataGenerator.generate_high_cost_claimants(10),
            place_of_service=pos_data,
            diagnosis_by_cost=MockDataGenerator.generate_diagnosis_by_cost(10),
            diagnosis_by_utilization=MockDataGenerator.generate_diagnosis_by_utilization(10),
            medical_episodes=episodes,
            drug_classes=MockDataGenerator.generate_drug_classes(10),
            er_utilization=er_util,
            er_top_diagnoses=er_diagnoses,
            chronic_condition_compliance=MockDataGenerator.generate_chronic_condition_compliance(),
            preventive_screenings=MockDataGenerator.generate_preventive_screenings()
        )


# ============================================================================
# VISUALIZATION MAPPING DICTIONARY
# ============================================================================

VISUALIZATION_MAPPING = {
    "kpi_cards": {
        "description": "Three KPI cards showing total financial metrics",
        "component": "Card components with financial totals",
        "data_source": "FinancialKPI",
        "fields": {
            "Plan Payment": "total_plan_payment",
            "Medical Plan Payment": "medical_plan_payment",
            "RX Plan Payment": "rx_plan_payment"
        }
    },
    "monthly_cost_summary_chart": {
        "description": "Area/Line chart showing monthly medical and RX costs",
        "component": "LineChart with two series",
        "data_source": "MonthlyCostSummary (list)",
        "x_axis": "month",
        "series": {
            "Medical Plan Payment": "medical_plan_payment",
            "RX Plan Payment": "rx_plan_payment"
        }
    },
    "member_distribution_chart": {
        "description": "Horizontal stacked bar chart showing member distribution by cost bracket",
        "component": "Custom horizontal bars",
        "data_source": "MemberDistribution (list)",
        "categories": "cost_range",
        "metrics": {
            "Claimants %": "claimants_percent",
            "Payments %": "payments_percent"
        }
    },
    "budget_vs_actuals_chart": {
        "description": "Stacked bar chart with line overlay comparing budget to actual costs",
        "component": "BudgetVsActualsChart",
        "data_source": "BudgetVsActuals (list)",
        "x_axis": "month",
        "series": {
            "Claims (stacked)": "claims_actual",
            "Fixed Costs (stacked)": "fixed_costs_actual",
            "Budget (line)": "budget_total"
        }
    },
    "top_claimants_table": {
        "description": "Table showing top 10 high-cost members",
        "component": "MUI Table",
        "data_source": "HighCostClaimant (list)",
        "columns": {
            "Member ID": "member_id",
            "Medical Payment": "medical_payment",
            "RX Payment": "rx_payment",
            "Plan Payment": "total_plan_payment (computed)",
            "Predicted Cost Range": "predicted_cost_range"
        }
    },
    "place_of_service_chart": {
        "description": "Horizontal bar chart showing costs by service location",
        "component": "BarChart (horizontal)",
        "data_source": "PlaceOfServiceData (list)",
        "y_axis": "service_category",
        "x_axis": "total_amount"
    },
    "diagnosis_by_cost_chart": {
        "description": "Pie chart showing top diagnoses by cost",
        "component": "PieChart",
        "data_source": "DiagnosisByCost (list)",
        "value": "total_cost",
        "label": "diagnosis_code"
    },
    "diagnosis_by_cost_table": {
        "description": "Table showing top 10 diagnoses by cost",
        "component": "MUI Table",
        "data_source": "DiagnosisByCost (list)",
        "columns": {
            "Code": "diagnosis_code",
            "Description": "diagnosis_description",
            "Cost": "total_cost",
            "%": "percentage"
        }
    },
    "diagnosis_by_utilization_table": {
        "description": "Table showing top 10 diagnoses by claim count",
        "component": "MUI Table",
        "data_source": "DiagnosisByUtilization (list)",
        "columns": {
            "Code": "diagnosis_code",
            "Description": "diagnosis_description",
            "Count": "claim_count",
            "%": "percentage"
        }
    },
    "medical_episodes_chart": {
        "description": "Bar chart showing top medical episodes by cost",
        "component": "BarChart",
        "data_source": "MedicalEpisode (list)",
        "x_axis": "episode_description",
        "y_axis": "total_cost"
    },
    "drug_classes_table": {
        "description": "Table showing top drug classes by utilization",
        "component": "MUI Table",
        "data_source": "DrugClass (list)",
        "columns": {
            "Drug Class": "drug_class_name",
            "Scripts": "script_count",
            "Patient Cost": "patient_cost",
            "Plan Payment": "plan_payment"
        }
    },
    "er_category_chart": {
        "description": "Bar chart showing ER visits by category",
        "component": "BarChart",
        "data_source": "ERUtilization (list)",
        "x_axis": "er_category",
        "y_axis": "visit_count"
    },
    "er_top_diagnosis_chart": {
        "description": "Horizontal bar chart showing top ER diagnoses",
        "component": "Custom horizontal bars",
        "data_source": "ERTopDiagnosis (list)",
        "label": "diagnosis_description",
        "value": "visit_count"
    },
    "chronic_condition_compliance_chart": {
        "description": "Stacked bar chart showing care compliance by condition",
        "component": "BarChart (stacked)",
        "data_source": "ChronicConditionCompliance (list)",
        "x_axis": "condition_name",
        "series": {
            "Non-Compliant": "non_compliant_count",
            "Compliant": "compliant_count"
        }
    },
    "preventive_screenings_table": {
        "description": "Table showing year-over-year preventive screening participation",
        "component": "MUI Table",
        "data_source": "PreventiveScreening (list)",
        "columns": {
            "Screening": "screening_name",
            "Prior Year Members": "prior_year_members",
            "Current Members": "current_year_members",
            "Prior Participation": "prior_participation_percent",
            "Current Participation": "current_participation_percent",
            "Trend": "participation_change (computed)"
        }
    }
}


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("Healthcare Analytics Data Template Generator")
    print("=" * 80)
    print()

    # Create output directory
    output_dir = Path("./data_templates")

    # Generate CSV templates
    print("Generating CSV templates...")
    CSVTemplateGenerator.generate_all_templates(output_dir)
    print()

    # Generate mock data
    print("Generating complete mock dataset...")
    mock_data = MockDataGenerator.generate_complete_dashboard_data()
    print("✓ Mock data generated successfully")
    print()

    # Validate mock data
    print("Validating mock data...")
    is_valid, errors = mock_data.validate_all()
    if is_valid:
        print("✓ All validation checks passed")
    else:
        print("✗ Validation errors found:")
        for error in errors:
            print(f"  - {error}")
    print()

    # Save visualization mapping
    print("Saving visualization mapping...")
    mapping_path = output_dir / "visualization_mapping.json"
    with open(mapping_path, 'w', encoding='utf-8') as f:
        json.dump(VISUALIZATION_MAPPING, f, indent=2)
    print(f"✓ Visualization mapping saved to: {mapping_path}")
    print()

    # Print summary statistics
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Plan Period: {mock_data.plan_info.get_plan_period_display()}")
    print(f"Total Plan Payment: ${mock_data.financial_kpis.total_plan_payment:,.2f}")
    print(f"  - Medical: ${mock_data.financial_kpis.medical_plan_payment:,.2f}")
    print(f"  - RX: ${mock_data.financial_kpis.rx_plan_payment:,.2f}")
    print()
    print(f"Monthly Cost Records: {len(mock_data.monthly_costs)}")
    print(f"High-Cost Claimants: {len(mock_data.top_claimants)}")
    print(f"Top Claimant Total: ${mock_data.top_claimants[0].total_plan_payment:,.2f}")
    print()
    print(f"Diagnosis by Cost: {len(mock_data.diagnosis_by_cost)} records")
    print(f"Diagnosis by Utilization: {len(mock_data.diagnosis_by_utilization)} records")
    print(f"Drug Classes: {len(mock_data.drug_classes)} records")
    print(f"Chronic Conditions: {len(mock_data.chronic_condition_compliance)} records")
    print(f"Preventive Screenings: {len(mock_data.preventive_screenings)} records")
    print()
    print("=" * 80)
    print("Templates and mappings saved to:", output_dir.absolute())
    print("=" * 80)
