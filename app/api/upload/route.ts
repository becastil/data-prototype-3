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

    const validTemplates = [
      'experience',
      'high-cost-claimant',
      'monthly-costs',
      'diagnosis-cost',
      'diagnosis-utilization',
      'drug-classes',
      'preventive-screenings',
      'chronic-condition'
    ];

    if (!template || !validTemplates.includes(template)) {
      return NextResponse.json({
        success: false,
        error: `Invalid template type. Valid types: ${validTemplates.join(', ')}`
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
    } else if (template === 'high-cost-claimant') {
      filename = 'high-cost-claimants-template.csv';
      csvContent = `Member_ID,Age,Gender,Primary_Diagnosis_Code,Primary_Diagnosis_Description,Total_Paid_Amount,Claim_Count,Enrollment_Months,Risk_Score
M001,45,M,E11.9,Type 2 diabetes mellitus without complications,125000,24,12,2.8
M002,67,F,I25.10,Atherosclerotic heart disease of native coronary artery,89000,18,12,3.2
M003,55,F,N18.6,End stage renal disease,150000,36,12,4.1`;
    } else if (template === 'monthly-costs') {
      filename = 'monthly-costs-template.csv';
      csvContent = `# Monthly Cost Summary - Template
# Validation Rules:
# - Must have exactly 12 rows (one per month)
# - Months: January, February, March, April, May, June, July, August, September, October, November, December
# - medical_plan_payment: numeric, >= 0
# - rx_plan_payment: numeric, >= 0
# - member_enrollment: integer, > 0

month,year,medical_plan_payment,rx_plan_payment,member_enrollment
April,2024,450000.00,95000.00,1050
May,2024,620000.00,110000.00,1045
June,2024,480000.00,102000.00,1038`;
    } else if (template === 'diagnosis-cost') {
      filename = 'diagnosis-by-cost-template.csv';
      csvContent = `# Top Diagnosis by Cost - Template
# Validation Rules:
# - Top 10 diagnoses only
# - diagnosis_code: Valid ICD-10 code
# - total_cost: numeric, >= 0
# - percentage: numeric, 0-100, all percentages should sum to ~100
# - Sorted by total_cost descending

diagnosis_code,diagnosis_description,total_cost,percentage
C02.1,Malignant neoplasm of border of tongue,305000.00,17.02
C04.9,Malignant neoplasm of floor of mouth,235000.00,13.11
I71.01,Dissection of ascending aorta,208000.00,11.58`;
    } else if (template === 'diagnosis-utilization') {
      filename = 'diagnosis-by-utilization-template.csv';
      csvContent = `# Top Diagnosis by Utilization - Template
# Validation Rules:
# - Top 10 diagnoses only
# - diagnosis_code: Valid ICD-10 code
# - claim_count: integer, > 0
# - percentage: numeric, 0-100, all percentages should sum to ~100
# - Sorted by claim_count descending

diagnosis_code,diagnosis_description,claim_count,percentage
Z00.00,Encounter for general adult medical exam,2000,29.87
I10,Essential (primary) hypertension,1000,12.60
Z23,Encounter for immunization,1000,11.45`;
    } else if (template === 'drug-classes') {
      filename = 'drug-classes-template.csv';
      csvContent = `# Top Drug Classes by Utilization - Template
# Validation Rules:
# - Top 10 drug classes only
# - drug_class_name: Therapeutic class name (all caps)
# - script_count: integer, > 0
# - patient_cost: numeric, >= 0 (patient out-of-pocket)
# - plan_payment: numeric, >= 0 (plan payment)
# - Sorted by script_count descending

drug_class_name,script_count,patient_cost,plan_payment
ANTIHYPERTENSIVES,1149,8640.91,4861.57
ANTIDEPRESSANTS,1070,10087.33,14033.49
ANTIHYPERLIPIDEMICS,1020,6649.62,21403.87`;
    } else if (template === 'preventive-screenings') {
      filename = 'preventive-screenings-template.csv';
      csvContent = `# Adult Preventive Screenings - Template
# Validation Rules:
# - screening_name: Type of preventive screening
# - prior_year_members: integer, >= 0 (eligible members prior year)
# - current_year_members: integer, >= 0 (eligible members current year)
# - prior_participation_percent: numeric, 0-100
# - current_participation_percent: numeric, 0-100

screening_name,prior_year_members,current_year_members,prior_participation_percent,current_participation_percent
Preventive Care Visit,1100,1050,92,94
Lipid Disorder Screening,650,580,78,82
Diabetes Screening,550,520,65,68`;
    } else if (template === 'chronic-condition') {
      filename = 'chronic-condition-compliance-template.csv';
      csvContent = `# Chronic Condition Care Compliance - Template
# Validation Rules:
# - condition_name: Chronic condition name
# - compliant_count: integer, >= 0 (members compliant with care protocols)
# - non_compliant_count: integer, >= 0 (members not compliant)
# - avg_pmpy: numeric, >= 0 (Average Per Member Per Year cost)

condition_name,compliant_count,non_compliant_count,avg_pmpy
Hypertension,180,65,12000.00
Lipid Metabolism,155,48,15000.00
Depression,142,38,18000.00`;
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