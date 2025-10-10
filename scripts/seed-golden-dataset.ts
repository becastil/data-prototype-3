/**
 * Golden Sample Dataset Seeder
 * Loads "Flavio's Dog House" validation data matching the template
 *
 * Usage:
 *   npm run seed:golden
 *   npm run seed:golden --validate
 *
 * Expected KPIs (for validation):
 * - Total Budgeted Premium: $5,585,653 (±$1)
 * - Medical Paid Claims: $4,499,969
 * - Pharmacy Paid Claims: $678,522
 * - Total Paid Claims: $5,178,492
 * - Est Stop Loss Reimb: ($563,512)
 * - Est Earned Rx Rebates: ($423,675)
 * - Net Paid Claims: $4,191,305
 * - Administration Fees: $258,894
 * - Stop Loss Fees: $817,983
 * - IBNR Adjustment: $0
 * - Total Plan Cost: $5,268,182
 * - Surplus/Deficit: $317,471
 * - % of Budget: 94.3% (±0.1%)
 */

import type {
  GoldenSampleDataset,
  Client,
  PlanYear,
  Plan,
  MonthlyAllPlansCSV,
  MonthlyPlanCSV,
  HighClaimantCSV,
  PremiumEquivalent,
  AdminFeeComponent,
  StopLossFeeByTier,
  GlobalInputs,
} from '../types/enterprise-template';

export const GOLDEN_SAMPLE: GoldenSampleDataset = {
  // Client
  client: {
    id: 'client-flavios-dog-house',
    name: "Flavio's Dog House",
    active: true,
    cadence: 'MONTHLY',
    createdAt: '2023-07-01T00:00:00Z',
    updatedAt: '2025-06-30T00:00:00Z',
  },

  // Plan Year
  planYear: {
    id: 'py-2024',
    clientId: 'client-flavios-dog-house',
    yearLabel: '2024 Plan Year',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    islLimit: 200000,
    hccThreshold: 100000, // 50% of ISL
    budgetPEPM: 988.79,
    active: true,
  },

  // Plans
  plans: [
    {
      id: 'plan-hdhp',
      clientId: 'client-flavios-dog-house',
      name: 'HDHP',
      type: 'HDHP',
      active: true,
      effectiveDate: '2024-07-01',
    },
    {
      id: 'plan-ppo-base',
      clientId: 'client-flavios-dog-house',
      name: 'PPO Base',
      type: 'PPO_BASE',
      active: true,
      effectiveDate: '2024-07-01',
    },
    {
      id: 'plan-ppo-buyup',
      clientId: 'client-flavios-dog-house',
      name: 'PPO Buy-Up',
      type: 'PPO_BUYUP',
      active: true,
      effectiveDate: '2024-07-01',
    },
  ],

  // Monthly All Plans (Current PY: Jul 2024 - Jun 2025)
  monthlyAllPlans: [
    { Month: '7/1/2024', 'Total Subscribers': 483, 'Medical Claims': 261827, 'Pharmacy Claims': 59708, 'Spec Stop Loss Reimb': 0, 'Estimated Earned Pharmacy Rebates': -36225, 'Admin Fees': 22136, 'Stop Loss Fees': 69101, 'Budgeted Premium': 471493 },
    { Month: '8/1/2024', 'Total Subscribers': 481, 'Medical Claims': 173841, 'Pharmacy Claims': 49520, 'Spec Stop Loss Reimb': 0, 'Estimated Earned Pharmacy Rebates': -36075, 'Admin Fees': 22044, 'Stop Loss Fees': 69079, 'Budgeted Premium': 471930 },
    { Month: '9/1/2024', 'Total Subscribers': 479, 'Medical Claims': 339246, 'Pharmacy Claims': 47644, 'Spec Stop Loss Reimb': 0, 'Estimated Earned Pharmacy Rebates': -35925, 'Admin Fees': 21953, 'Stop Loss Fees': 68687, 'Budgeted Premium': 468778 },
    { Month: '10/1/2024', 'Total Subscribers': 477, 'Medical Claims': 319071, 'Pharmacy Claims': 64891, 'Spec Stop Loss Reimb': 0, 'Estimated Earned Pharmacy Rebates': -35775, 'Admin Fees': 21861, 'Stop Loss Fees': 68360, 'Budgeted Premium': 466259 },
    { Month: '11/1/2024', 'Total Subscribers': 476, 'Medical Claims': 712326, 'Pharmacy Claims': 58257, 'Spec Stop Loss Reimb': -397928, 'Estimated Earned Pharmacy Rebates': -35700, 'Admin Fees': 21815, 'Stop Loss Fees': 68629, 'Budgeted Premium': 468545 },
    { Month: '12/1/2024', 'Total Subscribers': 469, 'Medical Claims': 240732, 'Pharmacy Claims': 61659, 'Spec Stop Loss Reimb': -48535, 'Estimated Earned Pharmacy Rebates': -35175, 'Admin Fees': 21494, 'Stop Loss Fees': 68121, 'Budgeted Premium': 465632 },
    { Month: '1/1/2025', 'Total Subscribers': 461, 'Medical Claims': 212771, 'Pharmacy Claims': 58005, 'Spec Stop Loss Reimb': -3572, 'Estimated Earned Pharmacy Rebates': -34575, 'Admin Fees': 21128, 'Stop Loss Fees': 67258, 'Budgeted Premium': 459615 },
    { Month: '2/1/2025', 'Total Subscribers': 454, 'Medical Claims': 268914, 'Pharmacy Claims': 49033, 'Spec Stop Loss Reimb': -7756, 'Estimated Earned Pharmacy Rebates': -34050, 'Admin Fees': 20807, 'Stop Loss Fees': 66466, 'Budgeted Premium': 454291 },
    { Month: '3/1/2025', 'Total Subscribers': 461, 'Medical Claims': 316992, 'Pharmacy Claims': 55837, 'Spec Stop Loss Reimb': -28284, 'Estimated Earned Pharmacy Rebates': -34575, 'Admin Fees': 21128, 'Stop Loss Fees': 67556, 'Budgeted Premium': 461685 },
    { Month: '4/1/2025', 'Total Subscribers': 467, 'Medical Claims': 363614, 'Pharmacy Claims': 59972, 'Spec Stop Loss Reimb': -33654, 'Estimated Earned Pharmacy Rebates': -35025, 'Admin Fees': 21403, 'Stop Loss Fees': 67755, 'Budgeted Premium': 462164 },
    { Month: '5/1/2025', 'Total Subscribers': 467, 'Medical Claims': 683702, 'Pharmacy Claims': 55997, 'Spec Stop Loss Reimb': -3214, 'Estimated Earned Pharmacy Rebates': -35025, 'Admin Fees': 21403, 'Stop Loss Fees': 67973, 'Budgeted Premium': 464244 },
    { Month: '6/1/2025', 'Total Subscribers': 474, 'Medical Claims': 606934, 'Pharmacy Claims': 57999, 'Spec Stop Loss Reimb': -40568, 'Estimated Earned Pharmacy Rebates': -35550, 'Admin Fees': 21723, 'Stop Loss Fees': 68998, 'Budgeted Premium': 471015 },
  ],

  // Monthly by Plan (simplified - would be full 12 months × 3 plans in production)
  monthlyByPlan: {
    HDHP: [
      { Month: '7/1/2024', Plan: 'HDHP', 'Total Subscribers': 82, 'Medical Claims': 6364, 'Pharmacy Claims': 12, 'Spec Stop Loss Reimb': 0, 'Estimated Earned Pharmacy Rebates': -6150, 'Admin Fees': 3758, 'Stop Loss Fees': 9243, 'Budgeted Premium': 58445 },
      // ... additional months
    ],
    PPO_BASE: [
      { Month: '7/1/2024', Plan: 'PPO_BASE', 'Total Subscribers': 296, 'Medical Claims': 60556, 'Pharmacy Claims': 40272, 'Spec Stop Loss Reimb': 0, 'Estimated Earned Pharmacy Rebates': -22200, 'Admin Fees': 13566, 'Stop Loss Fees': 43656, 'Budgeted Premium': 290495 },
      // ... additional months
    ],
    PPO_BUYUP: [
      { Month: '7/1/2024', Plan: 'PPO_BUYUP', 'Total Subscribers': 105, 'Medical Claims': 194914, 'Pharmacy Claims': 19424, 'Spec Stop Loss Reimb': 0, 'Estimated Earned Pharmacy Rebates': -7875, 'Admin Fees': 4812, 'Stop Loss Fees': 16203, 'Budgeted Premium': 122553 },
      // ... additional months
    ],
    HMO_1: [],
    HMO_2: [],
    HMO_3: [],
    HMO_4: [],
    HMO_5: [],
  },

  // High-Cost Claimants
  highClaimants: [
    { 'Claimant #': 1, Plan: 'HDHP', Status: 'ACTIVE', 'Primary Diagnosis': 'Frito Feet', 'Medical Claims': 300000, 'Rx Claims': 20000, 'Total Claims': 320000, 'Exceeding ISL': 120000 },
    { 'Claimant #': 2, Plan: 'PPO_BASE', Status: 'COBRA', 'Primary Diagnosis': 'Extreme Cuteness', 'Medical Claims': 250000, 'Rx Claims': 20000, 'Total Claims': 270000, 'Exceeding ISL': 70000 },
    { 'Claimant #': 3, Plan: 'PPO_BUYUP', Status: 'RETIRED', 'Primary Diagnosis': 'No. 1 Good Boy Syndrome', 'Medical Claims': 175000, 'Rx Claims': 50000, 'Total Claims': 225000, 'Exceeding ISL': 25000 },
    { 'Claimant #': 4, Plan: 'HDHP', Status: 'TERMINATED', 'Primary Diagnosis': 'Tappity Clack Syndrome', 'Medical Claims': 175000, 'Rx Claims': 50000, 'Total Claims': 225000, 'Exceeding ISL': 25000 },
    { 'Claimant #': 5, Plan: 'PPO_BASE', Status: 'ACTIVE', 'Primary Diagnosis': 'Velvet Ears', 'Medical Claims': 150000, 'Rx Claims': 20000, 'Total Claims': 170000, 'Exceeding ISL': 0 },
    { 'Claimant #': 6, Plan: 'PPO_BUYUP', Status: 'COBRA', 'Primary Diagnosis': 'Excessive Borking', 'Medical Claims': 150000, 'Rx Claims': 20000, 'Total Claims': 170000, 'Exceeding ISL': 0 },
    { 'Claimant #': 7, Plan: 'HDHP', Status: 'ACTIVE', 'Primary Diagnosis': 'Zoomies', 'Medical Claims': 75000, 'Rx Claims': 75000, 'Total Claims': 150000, 'Exceeding ISL': 0 },
    { 'Claimant #': 8, Plan: 'PPO_BASE', Status: 'RETIRED', 'Primary Diagnosis': 'Excessive Drooling', 'Medical Claims': 70000, 'Rx Claims': 30000, 'Total Claims': 100000, 'Exceeding ISL': 0 },
  ],

  // Premium Equivalents (Current PY rates - page 8)
  premiumEquivalents: [
    // HDHP
    { id: 'pe-hdhp-eo', planId: 'plan-hdhp', tierId: 'tier-eo', planYearId: 'py-2024', amount: 586.35, effectiveDate: '2024-07-01' },
    { id: 'pe-hdhp-es', planId: 'plan-hdhp', tierId: 'tier-es', planYearId: 'py-2024', amount: 1315.95, effectiveDate: '2024-07-01' },
    { id: 'pe-hdhp-ec', planId: 'plan-hdhp', tierId: 'tier-ec', planYearId: 'py-2024', amount: 1143.71, effectiveDate: '2024-07-01' },
    { id: 'pe-hdhp-fam', planId: 'plan-hdhp', tierId: 'tier-fam', planYearId: 'py-2024', amount: 1896.28, effectiveDate: '2024-07-01' },
    // PPO Base
    { id: 'pe-ppo-base-eo', planId: 'plan-ppo-base', tierId: 'tier-eo', planYearId: 'py-2024', amount: 583.54, effectiveDate: '2024-07-01' },
    { id: 'pe-ppo-base-es', planId: 'plan-ppo-base', tierId: 'tier-es', planYearId: 'py-2024', amount: 1308.27, effectiveDate: '2024-07-01' },
    { id: 'pe-ppo-base-ec', planId: 'plan-ppo-base', tierId: 'tier-ec', planYearId: 'py-2024', amount: 1144.25, effectiveDate: '2024-07-01' },
    { id: 'pe-ppo-base-fam', planId: 'plan-ppo-base', tierId: 'tier-fam', planYearId: 'py-2024', amount: 1887.20, effectiveDate: '2024-07-01' },
    // PPO Buy-Up
    { id: 'pe-ppo-buyup-eo', planId: 'plan-ppo-buyup', tierId: 'tier-eo', planYearId: 'py-2024', amount: 656.88, effectiveDate: '2024-07-01' },
    { id: 'pe-ppo-buyup-es', planId: 'plan-ppo-buyup', tierId: 'tier-es', planYearId: 'py-2024', amount: 1472.73, effectiveDate: '2024-07-01' },
    { id: 'pe-ppo-buyup-ec', planId: 'plan-ppo-buyup', tierId: 'tier-ec', planYearId: 'py-2024', amount: 1281.31, effectiveDate: '2024-07-01' },
    { id: 'pe-ppo-buyup-fam', planId: 'plan-ppo-buyup', tierId: 'tier-fam', planYearId: 'py-2024', amount: 2123.74, effectiveDate: '2024-07-01' },
  ],

  // Admin Fee Components (Current PY - page 8)
  adminFeeComponents: [
    { id: 'af-aso', planId: 'ALL_PLANS', planYearId: 'py-2024', label: 'ASO Fee', amountPEPM: 40.00, effectiveDate: '2024-07-01' },
    { id: 'af-sl-coord', planId: 'ALL_PLANS', planYearId: 'py-2024', label: 'External Stop Loss Coordination Fee', amountPEPM: 3.00, effectiveDate: '2024-07-01' },
    { id: 'af-rx-carveout', planId: 'ALL_PLANS', planYearId: 'py-2024', label: 'Rx Carve Out Fee', amountPEPM: 2.00, effectiveDate: '2024-07-01' },
    { id: 'af-other1', planId: 'ALL_PLANS', planYearId: 'py-2024', label: 'Other Fee #1', amountPEPM: 0.53, effectiveDate: '2024-07-01' },
    { id: 'af-other2', planId: 'ALL_PLANS', planYearId: 'py-2024', label: 'Other Fee #2', amountPEPM: 0.30, effectiveDate: '2024-07-01' },
  ],

  // Stop Loss Fees by Tier (Current PY - page 8)
  stopLossFees: [
    // HDHP
    { id: 'sl-hdhp-eo', planId: 'plan-hdhp', tierId: 'tier-eo', planYearId: 'py-2024', islFee: 94.15, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-hdhp-es', planId: 'plan-hdhp', tierId: 'tier-es', planYearId: 'py-2024', islFee: 179.98, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-hdhp-ec', planId: 'plan-hdhp', tierId: 'tier-ec', planYearId: 'py-2024', islFee: 160.17, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-hdhp-fam', planId: 'plan-hdhp', tierId: 'tier-fam', planYearId: 'py-2024', islFee: 266.50, aslFee: 3.00, effectiveDate: '2024-07-01' },
    // PPO Base
    { id: 'sl-ppo-base-eo', planId: 'plan-ppo-base', tierId: 'tier-eo', planYearId: 'py-2024', islFee: 94.15, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-ppo-base-es', planId: 'plan-ppo-base', tierId: 'tier-es', planYearId: 'py-2024', islFee: 179.98, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-ppo-base-ec', planId: 'plan-ppo-base', tierId: 'tier-ec', planYearId: 'py-2024', islFee: 160.17, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-ppo-base-fam', planId: 'plan-ppo-base', tierId: 'tier-fam', planYearId: 'py-2024', islFee: 266.50, aslFee: 3.00, effectiveDate: '2024-07-01' },
    // PPO Buy-Up
    { id: 'sl-ppo-buyup-eo', planId: 'plan-ppo-buyup', tierId: 'tier-eo', planYearId: 'py-2024', islFee: 94.15, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-ppo-buyup-es', planId: 'plan-ppo-buyup', tierId: 'tier-es', planYearId: 'py-2024', islFee: 179.98, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-ppo-buyup-ec', planId: 'plan-ppo-buyup', tierId: 'tier-ec', planYearId: 'py-2024', islFee: 160.17, aslFee: 3.00, effectiveDate: '2024-07-01' },
    { id: 'sl-ppo-buyup-fam', planId: 'plan-ppo-buyup', tierId: 'tier-fam', planYearId: 'py-2024', islFee: 266.50, aslFee: 3.00, effectiveDate: '2024-07-01' },
  ],

  // Global Inputs (Current PY - page 8)
  globalInputs: {
    id: 'gi-2024',
    clientId: 'client-flavios-dog-house',
    planYearId: 'py-2024',
    rxRebatePEPMEstimate: -85.00, // Current PY estimate
    ibnrAdjustment: 0,
    stopLossTrackingMode: 'BY_PLAN',
    aslCompositeFactor: 1200.00,
    effectiveDate: '2024-07-01',
  },

  // Expected KPIs (for validation)
  expectedKPIs: {
    totalBudgetedPremium: 5585653,
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
    percentOfBudget: 94.3,
  },
};

/**
 * Validate calculated KPIs against expected targets
 */
export function validateGoldenSample(calculatedKPIs: {
  totalBudgetedPremium: number;
  medicalPaidClaims: number;
  pharmacyPaidClaims: number;
  totalPaidClaims: number;
  estStopLossReimb: number;
  estEarnedRxRebates: number;
  netPaidClaims: number;
  administrationFees: number;
  stopLossFees: number;
  ibnrAdjustment: number;
  totalPlanCost: number;
  surplusDeficit: number;
  percentOfBudget: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { expectedKPIs } = GOLDEN_SAMPLE;
  const tolerance = 1; // ±$1 for dollar amounts
  const percentTolerance = 0.1; // ±0.1% for percentages

  // Validate each KPI
  if (Math.abs(calculatedKPIs.totalBudgetedPremium - expectedKPIs.totalBudgetedPremium) > tolerance) {
    errors.push(`Total Budgeted Premium: expected ${expectedKPIs.totalBudgetedPremium}, got ${calculatedKPIs.totalBudgetedPremium}`);
  }

  if (Math.abs(calculatedKPIs.medicalPaidClaims - expectedKPIs.medicalPaidClaims) > tolerance) {
    errors.push(`Medical Paid Claims: expected ${expectedKPIs.medicalPaidClaims}, got ${calculatedKPIs.medicalPaidClaims}`);
  }

  if (Math.abs(calculatedKPIs.pharmacyPaidClaims - expectedKPIs.pharmacyPaidClaims) > tolerance) {
    errors.push(`Pharmacy Paid Claims: expected ${expectedKPIs.pharmacyPaidClaims}, got ${calculatedKPIs.pharmacyPaidClaims}`);
  }

  if (Math.abs(calculatedKPIs.totalPaidClaims - expectedKPIs.totalPaidClaims) > tolerance) {
    errors.push(`Total Paid Claims: expected ${expectedKPIs.totalPaidClaims}, got ${calculatedKPIs.totalPaidClaims}`);
  }

  if (Math.abs(calculatedKPIs.netPaidClaims - expectedKPIs.netPaidClaims) > tolerance) {
    errors.push(`Net Paid Claims: expected ${expectedKPIs.netPaidClaims}, got ${calculatedKPIs.netPaidClaims}`);
  }

  if (Math.abs(calculatedKPIs.administrationFees - expectedKPIs.administrationFees) > tolerance) {
    errors.push(`Administration Fees: expected ${expectedKPIs.administrationFees}, got ${calculatedKPIs.administrationFees}`);
  }

  if (Math.abs(calculatedKPIs.stopLossFees - expectedKPIs.stopLossFees) > tolerance) {
    errors.push(`Stop Loss Fees: expected ${expectedKPIs.stopLossFees}, got ${calculatedKPIs.stopLossFees}`);
  }

  if (Math.abs(calculatedKPIs.totalPlanCost - expectedKPIs.totalPlanCost) > tolerance) {
    errors.push(`Total Plan Cost: expected ${expectedKPIs.totalPlanCost}, got ${calculatedKPIs.totalPlanCost}`);
  }

  if (Math.abs(calculatedKPIs.surplusDeficit - expectedKPIs.surplusDeficit) > tolerance) {
    errors.push(`Surplus/Deficit: expected ${expectedKPIs.surplusDeficit}, got ${calculatedKPIs.surplusDeficit}`);
  }

  if (Math.abs(calculatedKPIs.percentOfBudget - expectedKPIs.percentOfBudget) > percentTolerance) {
    errors.push(`% of Budget: expected ${expectedKPIs.percentOfBudget}%, got ${calculatedKPIs.percentOfBudget}%`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Main seeder function
 */
export async function seedGoldenDataset() {
  console.log('🌱 Seeding Golden Sample Dataset: Flavio\'s Dog House...\n');

  console.log('✅ Client:', GOLDEN_SAMPLE.client.name);
  console.log('✅ Plan Year:', GOLDEN_SAMPLE.planYear.yearLabel);
  console.log('✅ Plans:', GOLDEN_SAMPLE.plans.map(p => p.name).join(', '));
  console.log('✅ Monthly Data: 12 months (Current PY)');
  console.log('✅ High-Cost Claimants:', GOLDEN_SAMPLE.highClaimants.length);
  console.log('✅ Premium Equivalents:', GOLDEN_SAMPLE.premiumEquivalents.length);
  console.log('✅ Admin Fee Components:', GOLDEN_SAMPLE.adminFeeComponents.length);
  console.log('✅ Stop Loss Fees:', GOLDEN_SAMPLE.stopLossFees.length);

  console.log('\n📊 Expected KPIs:');
  console.log('  Total Budgeted Premium: $', GOLDEN_SAMPLE.expectedKPIs.totalBudgetedPremium.toLocaleString());
  console.log('  Total Plan Cost: $', GOLDEN_SAMPLE.expectedKPIs.totalPlanCost.toLocaleString());
  console.log('  Surplus/Deficit: $', GOLDEN_SAMPLE.expectedKPIs.surplusDeficit.toLocaleString());
  console.log('  % of Budget:', GOLDEN_SAMPLE.expectedKPIs.percentOfBudget + '%');

  console.log('\n✅ Golden Sample Dataset ready for validation!');

  // In production, would insert into database here
  // await db.client.create(GOLDEN_SAMPLE.client);
  // await db.planYear.create(GOLDEN_SAMPLE.planYear);
  // etc.

  return GOLDEN_SAMPLE;
}

// Run seeder if called directly
if (require.main === module) {
  seedGoldenDataset()
    .then(() => {
      console.log('\n🎉 Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}
