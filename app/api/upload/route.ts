import { NextRequest, NextResponse } from 'next/server';
import { parseExperienceDataCSV, parseHighCostClaimantCSV, detectCSVType } from '@/lib/utils/csvParser';
import { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      } as ApiResponse<null>, { status: 400 });
    }
    
    if (files.length > 5) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 5 files allowed'
      } as ApiResponse<null>, { status: 400 });
    }
    
    const results = [];
    
    for (const file of files) {
      try {
        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          results.push({
            fileName: file.name,
            success: false,
            error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 50MB limit`
          });
          continue;
        }
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
          results.push({
            fileName: file.name,
            success: false,
            error: 'Only CSV files are allowed'
          });
          continue;
        }
        
        // Read file to detect type
        const fileText = await file.text();
        const lines = fileText.split('\n');
        const headers = lines[0]?.split(',').map(h => h.trim()) || [];
        
        const fileType = detectCSVType(headers);
        
        if (fileType === 'unknown') {
          results.push({
            fileName: file.name,
            success: false,
            error: 'Unknown CSV format. Please use the provided templates.',
            detectedHeaders: headers
          });
          continue;
        }
        
        // Create new File object from text for parsing
        const fileBlob = new Blob([fileText], { type: 'text/csv' });
        const parsableFile = new File([fileBlob], file.name, { type: 'text/csv' });
        
        let parseResult;
        
        if (fileType === 'experience') {
          parseResult = await parseExperienceDataCSV(parsableFile);
        } else if (fileType === 'high-cost-claimant') {
          parseResult = await parseHighCostClaimantCSV(parsableFile);
        } else {
          results.push({
            fileName: file.name,
            success: false,
            error: 'Unsupported file type'
          });
          continue;
        }
        
        results.push({
          fileName: file.name,
          fileType,
          success: parseResult.success,
          data: parseResult.data,
          errors: parseResult.errors,
          totalRows: parseResult.totalRows,
          validRows: parseResult.validRows,
          message: parseResult.success 
            ? `Successfully processed ${parseResult.validRows} of ${parseResult.totalRows} rows`
            : `Failed to process file: ${parseResult.errors.length} errors found`
        });
        
      } catch (error) {
        results.push({
          fileName: file.name,
          success: false,
          error: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    // Check if any files were successfully processed
    const successfulFiles = results.filter(r => r.success);
    const failedFiles = results.filter(r => !r.success);
    
    let overallMessage = '';
    if (successfulFiles.length > 0 && failedFiles.length === 0) {
      overallMessage = `Successfully processed all ${successfulFiles.length} files`;
    } else if (successfulFiles.length > 0 && failedFiles.length > 0) {
      overallMessage = `Processed ${successfulFiles.length} files successfully, ${failedFiles.length} files failed`;
    } else {
      overallMessage = `All ${failedFiles.length} files failed to process`;
    }
    
    return NextResponse.json({
      success: successfulFiles.length > 0,
      data: results,
      message: overallMessage
    } as ApiResponse<typeof results>);
    
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as ApiResponse<null>, { status: 500 });
  }
}

// Handle file download for templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template');
    
    if (!template || !['experience', 'high-cost-claimant'].includes(template)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid template type. Use "experience" or "high-cost-claimant"'
      } as ApiResponse<null>, { status: 400 });
    }
    
    let csvContent = '';
    let filename = '';
    
    if (template === 'experience') {
      filename = 'experience-data-template.csv';
      csvContent = `Month,Domestic_Medical_IP,Domestic_Medical_OP,Non_Domestic_Medical,Prescription_Drugs,Dental,Vision,Mental_Health,Preventive_Care,Emergency_Room,Urgent_Care,Specialty_Care,Lab_Diagnostic,Physical_Therapy,DME,Home_Health,Enrollment
2024-01,125000,89000,15000,45000,12000,3500,18000,8500,25000,12000,35000,15000,8000,5000,7500,1200
2024-02,132000,92000,18000,47000,11500,3200,19500,9000,28000,13500,38000,16500,8500,5500,8000,1195
2024-03,128000,95000,16000,46000,12500,3300,17500,8800,26000,12500,36000,15500,7800,5200,7800,1210`;
    } else {
      filename = 'high-cost-claimants-template.csv';
      csvContent = `Member_ID,Age,Gender,Primary_Diagnosis_Code,Primary_Diagnosis_Description,Total_Paid_Amount,Claim_Count,Enrollment_Months,Risk_Score
M001,45,M,E11.9,Type 2 diabetes mellitus without complications,125000,24,12,2.8
M002,67,F,I25.10,Atherosclerotic heart disease of native coronary artery,89000,18,12,3.2
M003,55,F,N18.6,End stage renal disease,150000,36,12,4.1`;
    }
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as ApiResponse<null>, { status: 500 });
  }
}