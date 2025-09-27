// Per Member Per Month (PMPM) calculation functions

export interface PMPMInput {
  totalCost: number;
  memberMonths: number;
}

export interface PMPMByCategory {
  category: string;
  totalCost: number;
  memberMonths: number;
  pmpm: number;
  percentage: number;
}

export interface PMPMTrend {
  month: string;
  pmpm: number;
  memberMonths: number;
  totalCost: number;
  change: number;
  changePercent: number;
}

/**
 * Calculate Per Member Per Month (PMPM)
 * Formula: Total Cost / Member Months
 */
export function calculatePMPM(totalCost: number, memberMonths: number): number {
  if (memberMonths === 0) {
    throw new Error('Member months cannot be zero for PMPM calculation');
  }
  return totalCost / memberMonths;
}

/**
 * Calculate Per Employee Per Month (PEPM)
 * Formula: Total Cost / Employees
 */
export function calculatePEPM(totalCost: number, employees: number): number {
  if (employees === 0) {
    throw new Error('Employees cannot be zero for PEPM calculation');
  }
  return totalCost / employees;
}

/**
 * Calculate member months from enrollment data
 * Formula: Enrollment × Months
 */
export function calculateMemberMonths(enrollment: number, months: number): number {
  return enrollment * months;
}

/**
 * Calculate PMPM with trend analysis
 */
export function calculatePMPMWithTrend(
  currentData: PMPMInput,
  previousData: PMPMInput
): {
  currentPMPM: number;
  previousPMPM: number;
  change: number;
  changePercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
} {
  const currentPMPM = calculatePMPM(currentData.totalCost, currentData.memberMonths);
  const previousPMPM = calculatePMPM(previousData.totalCost, previousData.memberMonths);
  
  const change = currentPMPM - previousPMPM;
  const changePercent = previousPMPM !== 0 ? (change / previousPMPM) * 100 : 0;
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  const threshold = 0.02; // 2% threshold for trend detection
  
  if (Math.abs(changePercent) < threshold) {
    trend = 'stable';
  } else if (changePercent > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  
  return {
    currentPMPM,
    previousPMPM,
    change,
    changePercent,
    trend
  };
}

/**
 * Calculate PMPM by category
 */
export function calculatePMPMByCategory(
  categoryData: Array<{
    category: string;
    totalCost: number;
  }>,
  totalMemberMonths: number
): PMPMByCategory[] {
  if (totalMemberMonths === 0) {
    throw new Error('Total member months cannot be zero');
  }
  
  const totalCostAllCategories = categoryData.reduce(
    (sum, category) => sum + category.totalCost,
    0
  );
  
  return categoryData.map(category => ({
    category: category.category,
    totalCost: category.totalCost,
    memberMonths: totalMemberMonths,
    pmpm: calculatePMPM(category.totalCost, totalMemberMonths),
    percentage: totalCostAllCategories > 0 
      ? (category.totalCost / totalCostAllCategories) * 100 
      : 0
  }));
}

/**
 * Calculate monthly PMPM trends
 */
export function calculateMonthlyPMPMTrends(
  monthlyData: Array<{
    month: string;
    totalCost: number;
    memberMonths: number;
  }>
): PMPMTrend[] {
  if (monthlyData.length === 0) {
    return [];
  }
  
  return monthlyData.map((current, index) => {
    const pmpm = calculatePMPM(current.totalCost, current.memberMonths);
    
    let change = 0;
    let changePercent = 0;
    
    if (index > 0) {
      const previous = monthlyData[index - 1];
      const previousPMPM = calculatePMPM(previous.totalCost, previous.memberMonths);
      change = pmpm - previousPMPM;
      changePercent = previousPMPM !== 0 ? (change / previousPMPM) * 100 : 0;
    }
    
    return {
      month: current.month,
      pmpm,
      memberMonths: current.memberMonths,
      totalCost: current.totalCost,
      change,
      changePercent
    };
  });
}

/**
 * Calculate rolling average PMPM
 */
export function calculateRollingAveragePMPM(
  monthlyData: Array<{
    month: string;
    totalCost: number;
    memberMonths: number;
  }>,
  rollingPeriods: number = 3
): Array<{
  month: string;
  rollingPMPM: number;
  rollingTotalCost: number;
  rollingMemberMonths: number;
}> {
  if (monthlyData.length < rollingPeriods) {
    return [];
  }
  
  const results = [];
  
  for (let i = rollingPeriods - 1; i < monthlyData.length; i++) {
    const periodData = monthlyData.slice(i - rollingPeriods + 1, i + 1);
    
    const rollingTotalCost = periodData.reduce(
      (sum, month) => sum + month.totalCost,
      0
    );
    const rollingMemberMonths = periodData.reduce(
      (sum, month) => sum + month.memberMonths,
      0
    );
    
    const rollingPMPM = calculatePMPM(rollingTotalCost, rollingMemberMonths);
    
    results.push({
      month: monthlyData[i].month,
      rollingPMPM,
      rollingTotalCost,
      rollingMemberMonths
    });
  }
  
  return results;
}

/**
 * Calculate PMPM benchmarks and performance
 */
export function calculatePMPMBenchmarks(
  actualPMPM: number,
  benchmarks: {
    industry?: number;
    target?: number;
    previous?: number;
  }
): {
  performance: {
    vsIndustry?: { difference: number; percentDifference: number; better: boolean };
    vsTarget?: { difference: number; percentDifference: number; onTarget: boolean };
    vsPrevious?: { difference: number; percentDifference: number; improved: boolean };
  };
  ranking: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
} {
  const performance: any = {};
  
  // Compare against industry benchmark
  if (benchmarks.industry !== undefined) {
    const difference = actualPMPM - benchmarks.industry;
    const percentDifference = (difference / benchmarks.industry) * 100;
    performance.vsIndustry = {
      difference,
      percentDifference,
      better: actualPMPM < benchmarks.industry // Lower PMPM is generally better
    };
  }
  
  // Compare against target
  if (benchmarks.target !== undefined) {
    const difference = actualPMPM - benchmarks.target;
    const percentDifference = (difference / benchmarks.target) * 100;
    const tolerance = 0.05; // 5% tolerance
    performance.vsTarget = {
      difference,
      percentDifference,
      onTarget: Math.abs(percentDifference) <= tolerance * 100
    };
  }
  
  // Compare against previous period
  if (benchmarks.previous !== undefined) {
    const difference = actualPMPM - benchmarks.previous;
    const percentDifference = (difference / benchmarks.previous) * 100;
    performance.vsPrevious = {
      difference,
      percentDifference,
      improved: actualPMPM < benchmarks.previous
    };
  }
  
  // Determine overall ranking
  let ranking: 'excellent' | 'good' | 'average' | 'below-average' | 'poor' = 'average';
  
  if (benchmarks.industry !== undefined) {
    const percentDiff = ((actualPMPM - benchmarks.industry) / benchmarks.industry) * 100;
    if (percentDiff <= -15) ranking = 'excellent';
    else if (percentDiff <= -5) ranking = 'good';
    else if (percentDiff <= 5) ranking = 'average';
    else if (percentDiff <= 15) ranking = 'below-average';
    else ranking = 'poor';
  }
  
  return { performance, ranking };
}

/**
 * Calculate PMPM variance analysis
 */
export function calculatePMPMVarianceAnalysis(
  actualData: Array<{
    category: string;
    actualPMPM: number;
    budgetPMPM: number;
    memberMonths: number;
  }>
): Array<{
  category: string;
  actualPMPM: number;
  budgetPMPM: number;
  variance: number;
  variancePercent: number;
  dollarImpact: number;
  status: 'favorable' | 'unfavorable' | 'on-budget';
}> {
  return actualData.map(item => {
    const variance = item.actualPMPM - item.budgetPMPM;
    const variancePercent = item.budgetPMPM !== 0 
      ? (variance / item.budgetPMPM) * 100 
      : 0;
    const dollarImpact = variance * item.memberMonths;
    
    let status: 'favorable' | 'unfavorable' | 'on-budget';
    const threshold = 0.02; // 2% threshold
    
    if (Math.abs(variancePercent) <= threshold * 100) {
      status = 'on-budget';
    } else if (variance < 0) {
      status = 'favorable'; // Lower cost is favorable
    } else {
      status = 'unfavorable';
    }
    
    return {
      category: item.category,
      actualPMPM: item.actualPMPM,
      budgetPMPM: item.budgetPMPM,
      variance,
      variancePercent,
      dollarImpact,
      status
    };
  });
}

/**
 * Calculate projected PMPM based on trends
 */
export function projectPMPM(
  historicalData: Array<{
    month: string;
    pmpm: number;
  }>,
  monthsToProject: number = 6
): Array<{
  month: string;
  projectedPMPM: number;
  confidence: number;
}> {
  if (historicalData.length < 6) {
    throw new Error('Insufficient historical data for projection (minimum 6 months required)');
  }
  
  // Calculate trend using linear regression
  const dataPoints = historicalData.map((item, index) => ({
    x: index,
    y: item.pmpm
  }));
  
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
  const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
  const sumXY = dataPoints.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = dataPoints.reduce((sum, point) => sum + point.x * point.x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared for confidence
  const meanY = sumY / n;
  const totalSumSquares = dataPoints.reduce((sum, point) => 
    sum + Math.pow(point.y - meanY, 2), 0
  );
  const residualSumSquares = dataPoints.reduce((sum, point) => {
    const predicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (residualSumSquares / totalSumSquares);
  const confidence = Math.max(0, Math.min(1, rSquared));
  
  // Generate projections
  const projections = [];
  for (let i = 1; i <= monthsToProject; i++) {
    const futureX = n + i - 1;
    const projectedPMPM = slope * futureX + intercept;
    
    // Generate future month string (simplified)
    const lastMonth = new Date(historicalData[historicalData.length - 1].month + '-01');
    const futureMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i, 1);
    const monthString = futureMonth.toISOString().substring(0, 7);
    
    projections.push({
      month: monthString,
      projectedPMPM: Math.max(0, projectedPMPM),
      confidence
    });
  }
  
  return projections;
}

/**
 * Calculate cost driver analysis for PMPM changes
 */
export function analyzePMPMCostDrivers(
  currentPeriod: {
    categories: Array<{ category: string; cost: number; utilization: number; unitCost: number }>;
    memberMonths: number;
  },
  previousPeriod: {
    categories: Array<{ category: string; cost: number; utilization: number; unitCost: number }>;
    memberMonths: number;
  }
): Array<{
  category: string;
  pmpmChange: number;
  drivers: {
    utilizationImpact: number;
    unitCostImpact: number;
    membershipImpact: number;
  };
  primaryDriver: 'utilization' | 'unit-cost' | 'membership';
}> {
  return currentPeriod.categories.map(currentCategory => {
    const previousCategory = previousPeriod.categories.find(
      cat => cat.category === currentCategory.category
    );
    
    if (!previousCategory) {
      return {
        category: currentCategory.category,
        pmpmChange: currentCategory.cost / currentPeriod.memberMonths,
        drivers: {
          utilizationImpact: 0,
          unitCostImpact: 0,
          membershipImpact: 0
        },
        primaryDriver: 'utilization' as const
      };
    }
    
    const currentPMPM = currentCategory.cost / currentPeriod.memberMonths;
    const previousPMPM = previousCategory.cost / previousPeriod.memberMonths;
    const pmpmChange = currentPMPM - previousPMPM;
    
    // Decompose PMPM change into components
    const utilizationChange = currentCategory.utilization - previousCategory.utilization;
    const unitCostChange = currentCategory.unitCost - previousCategory.unitCost;
    const membershipChange = (1 / currentPeriod.memberMonths) - (1 / previousPeriod.memberMonths);
    
    const utilizationImpact = (utilizationChange * previousCategory.unitCost) / currentPeriod.memberMonths;
    const unitCostImpact = (unitCostChange * currentCategory.utilization) / currentPeriod.memberMonths;
    const membershipImpact = previousCategory.cost * membershipChange;
    
    // Determine primary driver
    const impacts = {
      utilization: Math.abs(utilizationImpact),
      'unit-cost': Math.abs(unitCostImpact),
      membership: Math.abs(membershipImpact)
    };
    
    const primaryDriver = Object.keys(impacts).reduce((a, b) => 
      impacts[a as keyof typeof impacts] > impacts[b as keyof typeof impacts] ? a : b
    ) as 'utilization' | 'unit-cost' | 'membership';
    
    return {
      category: currentCategory.category,
      pmpmChange,
      drivers: {
        utilizationImpact,
        unitCostImpact,
        membershipImpact
      },
      primaryDriver
    };
  });
}