import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MonthlySummary, DashboardKPIs } from '@/types/healthcare';

export interface PDFExportOptions {
  filename: string;
  orientation: 'landscape' | 'portrait';
  title: string;
  subtitle?: string;
  includeCharts: boolean;
  includeTables: boolean;
}

export class PDFExporter {
  private pdf: jsPDF;
  private currentY: number = 0;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number = 20;

  constructor(orientation: 'landscape' | 'portrait' = 'landscape') {
    this.pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.currentY = this.margin;
  }

  addTitle(title: string, subtitle?: string) {
    // Add title
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;

    // Add subtitle if provided
    if (subtitle) {
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(subtitle, this.margin, this.currentY);
      this.currentY += 10;
    }

    // Add generation date
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, this.margin, this.currentY);
    this.currentY += 15;
  }

  addSection(title: string) {
    this.checkPageSpace(20);
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
    
    // Add underline
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
  }

  addText(text: string, fontSize: number = 10) {
    this.checkPageSpace(10);
    
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    
    // Split text into lines that fit the page width
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - (this.margin * 2));
    
    for (const line of lines) {
      this.checkPageSpace(5);
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += 5;
    }
    
    this.currentY += 3;
  }

  async addElementAsImage(elementId: string, title?: string, maxHeight: number = 100) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID "${elementId}" not found`);
      return;
    }

    try {
      if (title) {
        this.addText(title, 12);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pageWidth - (this.margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Scale down if too tall
      const finalHeight = Math.min(imgHeight, maxHeight);
      const finalWidth = (canvas.width * finalHeight) / canvas.height;

      this.checkPageSpace(finalHeight + 10);
      
      this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, finalWidth, finalHeight);
      this.currentY += finalHeight + 10;
    } catch (error) {
      console.error('Failed to add element as image:', error);
      this.addText(`[Error: Could not capture ${title || 'chart'}]`);
    }
  }

  addTable(headers: string[], rows: string[][], title?: string) {
    if (title) {
      this.addText(title, 12);
    }

    const colWidth = (this.pageWidth - (this.margin * 2)) / headers.length;
    const rowHeight = 8;

    // Check if table fits on current page
    const tableHeight = (rows.length + 1) * rowHeight;
    this.checkPageSpace(tableHeight + 10);

    // Draw headers
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      const x = this.margin + (index * colWidth);
      this.pdf.rect(x, this.currentY, colWidth, rowHeight);
      this.pdf.text(header, x + 2, this.currentY + 5);
    });
    
    this.currentY += rowHeight;

    // Draw rows
    this.pdf.setFont('helvetica', 'normal');
    
    rows.forEach(row => {
      row.forEach((cell, index) => {
        const x = this.margin + (index * colWidth);
        this.pdf.rect(x, this.currentY, colWidth, rowHeight);
        this.pdf.text(cell, x + 2, this.currentY + 5);
      });
      this.currentY += rowHeight;
    });

    this.currentY += 5;
  }

  addKPICard(title: string, value: string, trend?: string) {
    this.checkPageSpace(25);
    
    const cardWidth = 60;
    const cardHeight = 20;
    
    // Draw card border
    this.pdf.rect(this.margin, this.currentY, cardWidth, cardHeight);
    
    // Add title
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(title, this.margin + 2, this.currentY + 5);
    
    // Add value
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(value, this.margin + 2, this.currentY + 12);
    
    // Add trend if provided
    if (trend) {
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(trend, this.margin + 2, this.currentY + 17);
    }
    
    this.currentY += cardHeight + 5;
  }

  private checkPageSpace(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  addFooter(text: string = 'Generated with Healthcare Analytics Dashboard') {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      
      // Add page number
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin - 20,
        this.pageHeight - 10
      );
      
      // Add footer text
      this.pdf.text(text, this.margin, this.pageHeight - 10);
    }
  }

  save(filename: string) {
    this.addFooter();
    this.pdf.save(filename);
  }

  getBlob(): Blob {
    this.addFooter();
    return this.pdf.output('blob');
  }

  getDataUrl(): string {
    this.addFooter();
    return this.pdf.output('dataurlstring');
  }
}

interface DashboardExportData {
  kpis?: DashboardKPIs;
  topDiagnoses?: Array<{
    code: string;
    description: string;
    totalCost: number;
    claimCount: number;
  }>;
}

// Helper function to export summary table
export async function exportSummaryTableToPDF(
  summaryData: MonthlySummary[],
  options: PDFExportOptions
) {
  const exporter = new PDFExporter(options.orientation);
  
  exporter.addTitle(options.title, options.subtitle);
  
  if (options.includeTables && summaryData.length > 0) {
    exporter.addSection('Monthly Summary');
    
    const headers = ['Month', 'Claims', 'Fees', 'Premiums', 'Loss Ratio', 'PMPM'];
    const rows = summaryData.map(row => [
      row.month,
      `$${row.claims?.toLocaleString() || '0'}`,
      `$${row.fees?.toLocaleString() || '0'}`,
      `$${row.premiums?.toLocaleString() || '0'}`,
      `${((row.monthlyLossRatio || 0) * 100).toFixed(1)}%`,
      `$${(row.pmpm || 0).toFixed(2)}`
    ]);
    
    exporter.addTable(headers, rows);
  }
  
  if (options.includeCharts) {
    exporter.addSection('Charts and Analytics');
    
    // Try to capture charts if they exist
    await exporter.addElementAsImage('analytics-charts', 'Monthly Trends');
    await exporter.addElementAsImage('category-breakdown', 'Category Breakdown');
  }
  
  exporter.save(options.filename);
}

// Helper function to export dashboard to PDF
export async function exportDashboardToPDF(
  dashboardData: DashboardExportData,
  options: PDFExportOptions
) {
  const exporter = new PDFExporter(options.orientation);
  
  exporter.addTitle(options.title, options.subtitle);
  
  // Add KPIs section
  exporter.addSection('Key Performance Indicators');
  
  if (dashboardData.kpis) {
    exporter.addKPICard(
      'Total Claims',
      `$${dashboardData.kpis.totalClaims?.toLocaleString() || '0'}`,
      '+5.2% YoY'
    );
    
    exporter.addKPICard(
      'Average Loss Ratio',
      `${((dashboardData.kpis.avgLossRatio || 0) * 100).toFixed(1)}%`,
      dashboardData.kpis.avgLossRatio > 0.85 ? 'Above Target' : 'Within Target'
    );
  }
  
  if (options.includeCharts) {
    exporter.addSection('Analytics');
    await exporter.addElementAsImage('monthly-trends-chart', 'Monthly Trends');
    await exporter.addElementAsImage('category-pie-chart', 'Category Breakdown');
  }
  
  if (options.includeTables && dashboardData.topDiagnoses) {
    exporter.addSection('Top Diagnoses');
    
    const headers = ['Code', 'Description', 'Total Cost', 'Claims'];
    const rows = dashboardData.topDiagnoses.slice(0, 10).map((diagnosis) => [
      diagnosis.code,
      diagnosis.description.length > 30 ? `${diagnosis.description.substring(0, 30)}...` : diagnosis.description,
      `$${diagnosis.totalCost?.toLocaleString() || '0'}`,
      diagnosis.claimCount?.toString() || '0'
    ]);
    
    exporter.addTable(headers, rows);
  }
  
  exporter.save(options.filename);
}
