/**
 * Executive Summary PDF Generator
 * Creates a comprehensive executive report matching template page 2
 */

import jsPDF from 'jspdf';
import {
  createPDF,
  addPDFHeader,
  addPDFFooter,
  addKPICards,
  addChartToPDF,
  addPDFSection,
  downloadPDF,
  formatPDFCurrency,
  formatPDFPercentage,
  formatPDFDate,
} from './pdfGenerator';

interface ExecutiveSummaryData {
  clientName: string;
  planYear: string;
  dataThrough: string;
  kpis: {
    totalCost: number;
    budgetedPremium: number;
    surplusDeficit: number;
    percentOfBudget: number;
    medicalPaidClaims: number;
    pharmacyPaidClaims: number;
    totalSubscribers: number;
  };
  fuelGauge: {
    value: number;
    status: 'green' | 'yellow' | 'red';
    label: string;
  };
}

export async function generateExecutiveSummaryPDF(data: ExecutiveSummaryData): Promise<void> {
  const pdf = createPDF();

  // Page 1: Executive Summary
  let currentY = addPDFHeader(pdf, {
    title: 'Executive Summary Report',
    subtitle: `Claims & Expenses Analysis through ${data.dataThrough}`,
    clientName: data.clientName,
    planYear: data.planYear,
    generatedDate: formatPDFDate(new Date()),
    reportType: 'Executive Summary',
  });

  // KPI Cards
  const kpiData = [
    {
      label: 'Total Plan Cost',
      value: formatPDFCurrency(data.kpis.totalCost),
      color: [59, 130, 246] as [number, number, number], // Blue
    },
    {
      label: 'Budgeted Premium',
      value: formatPDFCurrency(data.kpis.budgetedPremium),
      color: [99, 102, 241] as [number, number, number], // Indigo
    },
    {
      label: 'Surplus / (Deficit)',
      value: formatPDFCurrency(data.kpis.surplusDeficit),
      color: (data.kpis.surplusDeficit >= 0 ? [34, 197, 94] : [239, 68, 68]) as [number, number, number],
    },
    {
      label: '% of Budget',
      value: formatPDFPercentage(data.kpis.percentOfBudget),
      color: getFuelGaugeColor(data.kpis.percentOfBudget),
    },
  ];

  currentY = addKPICards(pdf, kpiData, currentY);

  // Fuel Gauge section
  currentY = addPDFSection(
    pdf,
    'Budget Performance',
    `Current spending is at ${formatPDFPercentage(data.kpis.percentOfBudget)} of budget. ` +
    `Status: ${data.fuelGauge.label}`,
    currentY + 5
  );

  // Add fuel gauge visualization
  currentY = drawFuelGauge(pdf, data.fuelGauge.value, currentY + 5);

  // Claims breakdown
  currentY = addPDFSection(
    pdf,
    'Claims Breakdown',
    `Medical Claims: ${formatPDFCurrency(data.kpis.medicalPaidClaims)} | ` +
    `Pharmacy Claims: ${formatPDFCurrency(data.kpis.pharmacyPaidClaims)} | ` +
    `Total Subscribers: ${data.kpis.totalSubscribers.toLocaleString()}`,
    currentY + 10
  );

  // Try to capture the Plan YTD chart if available
  try {
    const chartElement = document.querySelector('[class*="PlanYTDChart"]');
    if (chartElement && chartElement.id) {
      currentY = await addChartToPDF(pdf, chartElement.id, 10, currentY + 5, 277, 100);
    }
  } catch (error) {
    console.log('Could not capture chart:', error);
  }

  // Executive Summary narrative
  const narrative = generateNarrative(data);
  currentY = addPDFSection(pdf, 'Executive Summary', narrative, currentY + 10);

  // Footer
  addPDFFooter(pdf, {
    pageNumber: 1,
    totalPages: 1,
    confidential: true,
  });

  // Download PDF
  const filename = `Executive_Summary_${data.clientName.replace(/\s+/g, '_')}_${data.planYear}_${new Date().toISOString().split('T')[0]}.pdf`;
  downloadPDF(pdf, filename);
}

/**
 * Draw a simple fuel gauge representation
 */
function drawFuelGauge(pdf: jsPDF, percentage: number, startY: number): number {
  const centerX = pdf.internal.pageSize.getWidth() / 2;
  const gaugeY = startY + 10;
  const gaugeWidth = 100;
  const gaugeHeight = 15;

  // Background
  pdf.setFillColor(230, 230, 230);
  pdf.roundedRect(centerX - gaugeWidth / 2, gaugeY, gaugeWidth, gaugeHeight, 3, 3, 'F');

  // Fill based on percentage
  const fillWidth = (gaugeWidth * Math.min(percentage, 100)) / 100;
  const fillColor = getFuelGaugeColor(percentage);
  pdf.setFillColor(...fillColor);
  pdf.roundedRect(centerX - gaugeWidth / 2, gaugeY, fillWidth, gaugeHeight, 3, 3, 'F');

  // Markers
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);

  // 95% marker (green/yellow threshold)
  const marker95 = centerX - gaugeWidth / 2 + (gaugeWidth * 95) / 100;
  pdf.line(marker95, gaugeY, marker95, gaugeY + gaugeHeight);

  // 105% marker (yellow/red threshold)
  const marker105 = centerX - gaugeWidth / 2 + (gaugeWidth * 105) / 100;
  if (marker105 <= centerX + gaugeWidth / 2) {
    pdf.line(marker105, gaugeY, marker105, gaugeY + gaugeHeight);
  }

  // Percentage text
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`${percentage.toFixed(1)}%`, centerX, gaugeY + gaugeHeight + 6, { align: 'center' });

  // Legend
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('< 95%: On Track', centerX - 40, gaugeY + gaugeHeight + 12);
  pdf.text('95-105%: Monitor', centerX - 10, gaugeY + gaugeHeight + 12);
  pdf.text('> 105%: Over Budget', centerX + 25, gaugeY + gaugeHeight + 12);

  return gaugeY + gaugeHeight + 18;
}

/**
 * Get fuel gauge color based on percentage
 */
function getFuelGaugeColor(percentage: number): [number, number, number] {
  if (percentage < 95) {
    return [34, 197, 94]; // Green
  } else if (percentage <= 105) {
    return [251, 191, 36]; // Yellow
  } else {
    return [239, 68, 68]; // Red
  }
}

/**
 * Generate executive narrative based on data
 */
function generateNarrative(data: ExecutiveSummaryData): string {
  const surplusOrDeficit = data.kpis.surplusDeficit >= 0 ? 'surplus' : 'deficit';
  const performanceStatus = data.kpis.percentOfBudget < 95 ? 'under budget' :
                           data.kpis.percentOfBudget <= 105 ? 'on budget' : 'over budget';

  const medicalPercentage = (data.kpis.medicalPaidClaims / data.kpis.totalCost) * 100;
  const pharmacyPercentage = (data.kpis.pharmacyPaidClaims / data.kpis.totalCost) * 100;

  return `As of ${data.dataThrough}, the plan has incurred ${formatPDFCurrency(data.kpis.totalCost)} ` +
         `in total costs against a budgeted premium of ${formatPDFCurrency(data.kpis.budgetedPremium)}, ` +
         `resulting in a ${surplusOrDeficit} of ${formatPDFCurrency(Math.abs(data.kpis.surplusDeficit))}. ` +
         `\n\nCurrent spending is ${performanceStatus} at ${formatPDFPercentage(data.kpis.percentOfBudget)} of budget. ` +
         `Medical claims represent ${medicalPercentage.toFixed(1)}% of total costs ` +
         `(${formatPDFCurrency(data.kpis.medicalPaidClaims)}), while pharmacy claims account for ` +
         `${pharmacyPercentage.toFixed(1)}% (${formatPDFCurrency(data.kpis.pharmacyPaidClaims)}). ` +
         `\n\nThe plan currently covers ${data.kpis.totalSubscribers.toLocaleString()} subscribers.`;
}
