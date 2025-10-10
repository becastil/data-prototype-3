// API endpoint for exporting summary table to CSV
import { NextRequest, NextResponse } from 'next/server';
import { CompleteSummaryRow } from '@/types/summary';

export async function POST(request: NextRequest) {
  try {
    const { data, format = 'csv' } = await request.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: 'No summary data provided' },
        { status: 400 }
      );
    }

    if (format === 'csv') {
      const csv = generateCSV(data);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="summary-table-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported export format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Export error: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}

function generateCSV(data: CompleteSummaryRow[]): string {
  if (data.length === 0) return '';

  const months = data.map(row => row.month);
  const lines: string[] = [];

  // Header row
  lines.push(['Cost Category', ...months].join(','));

  // Medical Claims Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['MEDICAL CLAIMS', ...months.map(() => '')].join(','));

  lines.push([
    'Domestic Medical Facility Claims (IP/OP)',
    ...data.map(r => r.medicalClaims.domesticMedicalFacilityIPOP)
  ].join(','));

  lines.push([
    'Non-Domestic Medical Claims (IP/OP)',
    ...data.map(r => r.medicalClaims.nonDomesticMedicalIPOP)
  ].join(','));

  lines.push([
    'Total Hospital Claims',
    ...data.map(r => r.medicalClaims.totalHospitalClaims)
  ].join(','));

  lines.push([
    'Non-Hospital Medical Claims',
    ...data.map(r => r.medicalClaims.nonHospitalMedicalClaims)
  ].join(','));

  lines.push([
    'Total All Medical Claims',
    ...data.map(r => r.medicalClaims.totalAllMedicalClaims)
  ].join(','));

  lines.push([
    'UC Claims Settlement Adjustment',
    ...data.map(r => r.medicalClaims.ucSettlementAdjustment)
  ].join(','));

  lines.push([
    'Total Adjusted All Medical Claims',
    ...data.map(r => r.medicalClaims.totalAdjustedMedicalClaims)
  ].join(','));

  // Pharmacy Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['PHARMACY', ...months.map(() => '')].join(','));

  lines.push([
    'Total Rx Claims',
    ...data.map(r => r.pharmacy.totalRxClaims)
  ].join(','));

  lines.push([
    'Rx Rebates',
    ...data.map(r => r.pharmacy.rxRebates)
  ].join(','));

  // Stop Loss Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['STOP LOSS', ...months.map(() => '')].join(','));

  lines.push([
    'Total Stop Loss Fees',
    ...data.map(r => r.stopLoss.totalStopLossFees)
  ].join(','));

  lines.push([
    'Stop Loss Reimbursement',
    ...data.map(r => r.stopLoss.stopLossReimbursement)
  ].join(','));

  // Admin Fees Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['ADMINISTRATIVE FEES', ...months.map(() => '')].join(','));

  lines.push([
    'Consulting',
    ...data.map(r => r.adminFees.consulting)
  ].join(','));

  // Individual admin fee line items
  const allFeeIds = new Set<string>();
  data.forEach(row => {
    row.adminFees.adminFeeLineItems.forEach(fee => allFeeIds.add(fee.id));
  });

  allFeeIds.forEach(feeId => {
    const feeName = data[0].adminFees.adminFeeLineItems.find(f => f.id === feeId)?.name || feeId;
    lines.push([
      feeName,
      ...data.map(r => {
        const fee = r.adminFees.adminFeeLineItems.find(f => f.id === feeId);
        return fee?.calculatedAmount || 0;
      })
    ].join(','));
  });

  lines.push([
    'Total Admin Fees',
    ...data.map(r => r.adminFees.totalAdminFees)
  ].join(','));

  // Totals Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['MONTHLY TOTALS', ...months.map(() => '')].join(','));

  lines.push([
    'MONTHLY CLAIMS AND EXPENSES',
    ...data.map(r => r.totals.monthlyClaimsAndExpenses)
  ].join(','));

  lines.push([
    'CUMULATIVE CLAIMS AND EXPENSES',
    ...data.map(r => r.totals.cumulativeClaimsAndExpenses)
  ].join(','));

  // Enrollment Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['ENROLLMENT METRICS', ...months.map(() => '')].join(','));

  lines.push([
    'EE COUNT (Active & COBRA)',
    ...data.map(r => r.enrollment.eeCount)
  ].join(','));

  lines.push([
    'MEMBER COUNT',
    ...data.map(r => r.enrollment.memberCount)
  ].join(','));

  // PEPM Metrics Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['PEPM METRICS', ...months.map(() => '')].join(','));

  lines.push([
    'PEPM NON-LAGGED ACTUAL',
    ...data.map(r => r.pepm.pepmNonLaggedActual.toFixed(2))
  ].join(','));

  lines.push([
    'PEPM NON-LAGGED CUMULATIVE',
    ...data.map(r => r.pepm.pepmNonLaggedCumulative.toFixed(2))
  ].join(','));

  lines.push([
    'INCURRED TARGET PEPM',
    ...data.map(r => r.pepm.incurredTargetPEPM.toFixed(2))
  ].join(','));

  // Budget Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['BUDGET DATA', ...months.map(() => '')].join(','));

  lines.push([
    '2024-2025 PEPM BUDGET (with 0% Margin)',
    ...data.map(r => r.budget.pepmBudget.toFixed(2))
  ].join(','));

  lines.push([
    '2024-2025 PEPM BUDGET Ee EE COUNTS',
    ...data.map(r => r.budget.pepmBudgetEECounts)
  ].join(','));

  lines.push([
    'ANNUAL CUMULATIVE BUDGET',
    ...data.map(r => r.budget.annualCumulativeBudget)
  ].join(','));

  // Variance Section
  lines.push(['', ...months.map(() => '')].join(','));
  lines.push(['VARIANCE ANALYSIS', ...months.map(() => '')].join(','));

  lines.push([
    'ACTUAL MONTHLY DIFFERENCE',
    ...data.map(r => r.variance.actualMonthlyDifference.toFixed(2))
  ].join(','));

  lines.push([
    '% DIFFERENCE (MONTHLY)',
    ...data.map(r => r.variance.percentDifferenceMonthly.toFixed(2) + '%')
  ].join(','));

  lines.push([
    'CUMULATIVE DIFFERENCE',
    ...data.map(r => r.variance.cumulativeDifference.toFixed(2))
  ].join(','));

  lines.push([
    '% DIFFERENCE (CUMULATIVE)',
    ...data.map(r => r.variance.percentDifferenceCumulative.toFixed(2) + '%')
  ].join(','));

  return lines.join('\n');
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to export summary data.',
  }, { status: 405 });
}
