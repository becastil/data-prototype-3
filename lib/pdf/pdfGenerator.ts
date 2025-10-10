/**
 * PDF Generation Utility
 * Generates professional PDF reports for healthcare analytics
 *
 * Uses jsPDF for PDF creation and html2canvas for chart capture
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFHeader {
  title: string;
  subtitle?: string;
  clientName: string;
  planYear: string;
  generatedDate: string;
  reportType: 'Executive Summary' | 'Monthly Detail' | 'HCC Analysis';
}

interface PDFFooter {
  pageNumber: number;
  totalPages: number;
  confidential?: boolean;
}

/**
 * Create a new PDF document with standard settings
 */
export function createPDF(): jsPDF {
  return new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
}

/**
 * Add header to PDF page
 */
export function addPDFHeader(pdf: jsPDF, header: PDFHeader, yPosition = 10): number {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Company logo placeholder (can be replaced with actual logo)
  pdf.setFillColor(37, 99, 235); // Blue
  pdf.rect(10, yPosition, 30, 10, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text('C&E REPORTING', 12, yPosition + 7);

  // Report title
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(header.title, pageWidth / 2, yPosition + 5, { align: 'center' });

  if (header.subtitle) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(header.subtitle, pageWidth / 2, yPosition + 11, { align: 'center' });
  }

  // Client info (right side)
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Client: ${header.clientName}`, pageWidth - 10, yPosition + 3, { align: 'right' });
  pdf.text(`Plan Year: ${header.planYear}`, pageWidth - 10, yPosition + 8, { align: 'right' });
  pdf.text(`Generated: ${header.generatedDate}`, pageWidth - 10, yPosition + 13, { align: 'right' });

  // Horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(10, yPosition + 18, pageWidth - 10, yPosition + 18);

  return yPosition + 22; // Return new Y position after header
}

/**
 * Add footer to PDF page
 */
export function addPDFFooter(pdf: jsPDF, footer: PDFFooter): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const yPosition = pageHeight - 10;

  // Horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(10, yPosition - 3, pageWidth - 10, yPosition - 3);

  // Page number
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Page ${footer.pageNumber} of ${footer.totalPages}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  // Confidential notice
  if (footer.confidential) {
    pdf.setTextColor(239, 68, 68); // Red
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONFIDENTIAL - HIPAA PROTECTED', 10, yPosition);
  }

  // Company info
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text('C&E Reporting Platform', pageWidth - 10, yPosition, { align: 'right' });
}

/**
 * Add a table to the PDF
 */
export function addPDFTable(
  pdf: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  startY: number,
  options?: {
    headerColor?: [number, number, number];
    alternateRows?: boolean;
  }
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const tableWidth = pageWidth - 2 * margin;
  const colWidth = tableWidth / headers.length;
  const rowHeight = 7;

  let currentY = startY;

  // Draw header
  pdf.setFillColor(...(options?.headerColor || [37, 99, 235]));
  pdf.rect(margin, currentY, tableWidth, rowHeight, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);

  headers.forEach((header, i) => {
    pdf.text(
      header,
      margin + colWidth * i + colWidth / 2,
      currentY + 5,
      { align: 'center' }
    );
  });

  currentY += rowHeight;

  // Draw rows
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  rows.forEach((row, rowIndex) => {
    // Alternate row colors
    if (options?.alternateRows && rowIndex % 2 === 1) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, currentY, tableWidth, rowHeight, 'F');
    }

    row.forEach((cell, colIndex) => {
      const text = typeof cell === 'number' ? cell.toLocaleString() : cell;
      pdf.text(
        text,
        margin + colWidth * colIndex + colWidth / 2,
        currentY + 5,
        { align: 'center' }
      );
    });

    currentY += rowHeight;

    // Check if we need a new page
    if (currentY > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      currentY = 25;
    }
  });

  return currentY + 5; // Return new Y position
}

/**
 * Capture an HTML element as an image and add to PDF
 */
export async function addChartToPDF(
  pdf: jsPDF,
  elementId: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<number> {
  const element = document.getElementById(elementId);

  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return y;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', x, y, width, height);

    return y + height + 5; // Return new Y position after image
  } catch (error) {
    console.error('Error capturing chart:', error);
    return y;
  }
}

/**
 * Add text section to PDF
 */
export function addPDFSection(
  pdf: jsPDF,
  title: string,
  content: string,
  startY: number
): number {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 10, startY);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const lines = pdf.splitTextToSize(content, pdf.internal.pageSize.getWidth() - 20);
  pdf.text(lines, 10, startY + 6);

  return startY + 6 + lines.length * 5 + 5; // Return new Y position
}

/**
 * Add KPI cards to PDF
 */
export function addKPICards(
  pdf: jsPDF,
  kpis: Array<{ label: string; value: string; color: [number, number, number] }>,
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const cardWidth = (pageWidth - 50) / 4;
  const cardHeight = 20;
  let x = 10;

  kpis.forEach((kpi, index) => {
    // Card background
    pdf.setFillColor(...kpi.color);
    pdf.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');

    // Label
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(kpi.label, x + cardWidth / 2, startY + 6, { align: 'center' });

    // Value
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(kpi.value, x + cardWidth / 2, startY + 14, { align: 'center' });

    x += cardWidth + 10;
  });

  return startY + cardHeight + 10; // Return new Y position
}

/**
 * Generate and download a PDF
 */
export function downloadPDF(pdf: jsPDF, filename: string): void {
  pdf.save(filename);
}

/**
 * Format currency for PDF display
 */
export function formatPDFCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for PDF display
 */
export function formatPDFPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format date for PDF display
 */
export function formatPDFDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
