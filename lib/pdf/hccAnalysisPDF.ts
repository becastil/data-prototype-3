/**
 * HCC Analysis PDF Generator
 * Creates a high cost claimant report matching template page 4
 */

import {
  createPDF,
  addPDFHeader,
  addPDFFooter,
  addPDFTable,
  addKPICards,
  addPDFSection,
  downloadPDF,
  formatPDFCurrency,
  formatPDFDate,
} from './pdfGenerator';
import type { HighClaimant } from '@/types/enterprise-template';

interface HCCAnalysisData {
  clientName: string;
  planYear: string;
  dataThrough: string;
  claimants: HighClaimant[];
  summary: {
    totalClaimants: number;
    totalClaims: number;
    employerResponsibility: number;
    stopLossResponsibility: number;
    islLimit: number;
  };
}

export async function generateHCCAnalysisPDF(data: HCCAnalysisData): Promise<void> {
  const pdf = createPDF();

  // Page 1: HCC Summary
  let currentY = addPDFHeader(pdf, {
    title: 'High Cost Claimant Analysis',
    subtitle: `Individual Stop Loss Analysis - Claims > $${(data.summary.islLimit * 0.5).toLocaleString()}`,
    clientName: data.clientName,
    planYear: data.planYear,
    generatedDate: formatPDFDate(new Date()),
    reportType: 'HCC Analysis',
  });

  // PHI Warning
  pdf.setFillColor(251, 191, 36); // Yellow
  pdf.rect(10, currentY, pdf.internal.pageSize.getWidth() - 20, 12, 'F');
  pdf.setTextColor(146, 64, 14); // Dark yellow
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('⚠ PROTECTED HEALTH INFORMATION (PHI) - HIPAA COMPLIANCE REQUIRED', 15, currentY + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('This report contains PHI. Ensure proper handling, storage, and disposal per HIPAA regulations.', 15, currentY + 9);

  currentY += 17;

  // Summary KPIs
  const kpiData = [
    {
      label: 'Total Claimants',
      value: data.summary.totalClaimants.toString(),
      color: [59, 130, 246] as [number, number, number],
    },
    {
      label: 'Total Claims',
      value: formatPDFCurrency(data.summary.totalClaims),
      color: [99, 102, 241] as [number, number, number],
    },
    {
      label: 'Employer Responsibility',
      value: formatPDFCurrency(data.summary.employerResponsibility),
      color: [59, 130, 246] as [number, number, number],
    },
    {
      label: 'Stop Loss Recovery',
      value: formatPDFCurrency(data.summary.stopLossResponsibility),
      color: [34, 197, 94] as [number, number, number],
    },
  ];

  currentY = addKPICards(pdf, kpiData, currentY);

  // Summary text
  const summaryText = `This report identifies ${data.summary.totalClaimants} claimants who have exceeded ` +
                     `50% of the Individual Stop Loss (ISL) limit of ${formatPDFCurrency(data.summary.islLimit)}. ` +
                     `Total claims for these high-cost claimants amount to ${formatPDFCurrency(data.summary.totalClaims)}, ` +
                     `with ${formatPDFCurrency(data.summary.stopLossResponsibility)} recoverable from stop loss coverage.`;

  currentY = addPDFSection(pdf, 'Executive Summary', summaryText, currentY + 10);

  // Sort claimants by total paid (descending)
  const sortedClaimants = [...data.claimants].sort((a, b) => b.totalPaid - a.totalPaid);

  // HCC Table (first page - top 10)
  currentY += 5;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('High Cost Claimants Detail', 10, currentY);
  currentY += 7;

  const tableHeaders = [
    '#',
    'Plan',
    'Status',
    'Medical',
    'Rx',
    'Total',
    'ISL Limit',
    'Exceeding',
    '% of ISL',
  ];

  const tableRows = sortedClaimants.slice(0, 10).map((claimant, index) => [
    (index + 1).toString(),
    getPlanShortName(claimant.planId),
    claimant.status.substring(0, 3),
    formatPDFCurrency(claimant.medicalPaid),
    formatPDFCurrency(claimant.rxPaid),
    formatPDFCurrency(claimant.totalPaid),
    formatPDFCurrency(claimant.islLimit),
    formatPDFCurrency(claimant.amountExceedingISL),
    `${((claimant.totalPaid / claimant.islLimit) * 100).toFixed(0)}%`,
  ]);

  currentY = addPDFTable(pdf, tableHeaders, tableRows, currentY, {
    headerColor: [127, 29, 29], // Dark red
    alternateRows: true,
  });

  // Footer
  addPDFFooter(pdf, {
    pageNumber: 1,
    totalPages: Math.ceil(sortedClaimants.length / 15) || 1,
    confidential: true,
  });

  // Additional pages if needed
  if (sortedClaimants.length > 10) {
    let remainingClaimants = sortedClaimants.slice(10);
    let pageNumber = 2;

    while (remainingClaimants.length > 0) {
      pdf.addPage();

      currentY = addPDFHeader(pdf, {
        title: 'High Cost Claimant Analysis (continued)',
        subtitle: `Page ${pageNumber}`,
        clientName: data.clientName,
        planYear: data.planYear,
        generatedDate: formatPDFDate(new Date()),
        reportType: 'HCC Analysis',
      });

      const pageClaimants = remainingClaimants.slice(0, 15);
      const pageRows = pageClaimants.map((claimant, index) => [
        (10 + (pageNumber - 2) * 15 + index + 1).toString(),
        getPlanShortName(claimant.planId),
        claimant.status.substring(0, 3),
        formatPDFCurrency(claimant.medicalPaid),
        formatPDFCurrency(claimant.rxPaid),
        formatPDFCurrency(claimant.totalPaid),
        formatPDFCurrency(claimant.islLimit),
        formatPDFCurrency(claimant.amountExceedingISL),
        `${((claimant.totalPaid / claimant.islLimit) * 100).toFixed(0)}%`,
      ]);

      addPDFTable(pdf, tableHeaders, pageRows, currentY, {
        headerColor: [127, 29, 29],
        alternateRows: true,
      });

      addPDFFooter(pdf, {
        pageNumber,
        totalPages: Math.ceil(sortedClaimants.length / 15),
        confidential: true,
      });

      remainingClaimants = remainingClaimants.slice(15);
      pageNumber++;
    }
  }

  // Download PDF
  const filename = `HCC_Analysis_${data.clientName.replace(/\s+/g, '_')}_${data.planYear}_${new Date().toISOString().split('T')[0]}.pdf`;
  downloadPDF(pdf, filename);
}

/**
 * Get short plan name for table display
 */
function getPlanShortName(planId: string): string {
  const planMap: Record<string, string> = {
    'plan-hdhp': 'HDHP',
    'plan-ppo-base': 'PPO-B',
    'plan-ppo-buyup': 'PPO-BU',
  };
  return planMap[planId] || planId.substring(0, 6);
}
