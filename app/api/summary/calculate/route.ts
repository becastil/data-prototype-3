// API endpoint for calculating the complete 28-row summary table
import { NextRequest, NextResponse } from 'next/server';
import { calculateCompleteSummary } from '@/lib/calculations/summaryCalculations';
import { SummaryCalculationInput, SummaryCalculationResult } from '@/types/summary';

export async function POST(request: NextRequest) {
  try {
    const input: SummaryCalculationInput = await request.json();

    // Validate input
    if (!input.experienceData || input.experienceData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No experience data provided. Please upload your CSV files first.',
          data: null
        },
        { status: 400 }
      );
    }

    // Perform calculations
    const result: SummaryCalculationResult = calculateCompleteSummary(input);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.join(', ') || 'Calculation failed',
          warnings: result.warnings,
          data: null
        },
        { status: 400 }
      );
    }

    // Return successful calculation
    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: result.metadata,
      warnings: result.warnings
    });
  } catch (error) {
    console.error('Summary calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to calculate summaries.',
    data: null
  }, { status: 405 });
}
