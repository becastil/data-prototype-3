// Loss Ratio calculation functions

export interface LossRatioInput {
  claims: number;
  fees: number;
  premiums: number;
}

export interface LossRatioResult {
  lossRatio: number;
  variance: number;
  status: 'good' | 'warning' | 'critical';
}

export interface RollingLossRatioResult {
  endMonth: string;
  period: number;
  lossRatio: number;
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Calculate monthly loss ratio
 * Formula: (Claims + Fees) / Premiums
 */
export function calculateMonthlyLossRatio(
  claims: number,
  fees: number,
  premiums: number
): number {
  if (premiums === 0) {
    throw new Error('Premiums cannot be zero for loss ratio calculation');
  }
  return (claims + fees) / premiums;
}

/**
 * Calculate loss ratio with variance from target
 */
export function calculateLossRatioWithVariance(
  input: LossRatioInput,
  targetLossRatio: number = 0.85
): LossRatioResult {
  const lossRatio = calculateMonthlyLossRatio(input.claims, input.fees, input.premiums);
  const variance = ((lossRatio - targetLossRatio) / targetLossRatio) * 100;
  
  let status: 'good' | 'warning' | 'critical';
  if (lossRatio <= targetLossRatio * 1.05) { // Within 5% of target
    status = 'good';
  } else if (lossRatio <= targetLossRatio * 1.15) { // Within 15% of target
    status = 'warning';
  } else {
    status = 'critical';
  }
  
  return {
    lossRatio,
    variance,
    status
  };
}

/**
 * Calculate rolling 12-month loss ratio
 */
export function calculateRolling12LossRatio(
  monthlyData: Array<{ month: string; claims: number; fees: number; premiums: number }>
): number {
  if (monthlyData.length === 0) {
    throw new Error('No data provided for rolling calculation');
  }
  
  // Take the last 12 months or all available data if less than 12 months
  const dataToUse = monthlyData.slice(-12);
  
  const totalClaims = dataToUse.reduce((sum, month) => sum + month.claims, 0);
  const totalFees = dataToUse.reduce((sum, month) => sum + month.fees, 0);
  const totalPremiums = dataToUse.reduce((sum, month) => sum + month.premiums, 0);
  
  if (totalPremiums === 0) {
    throw new Error('Total premiums cannot be zero for rolling loss ratio calculation');
  }
  
  return (totalClaims + totalFees) / totalPremiums;
}

/**
 * Calculate rolling loss ratios for multiple periods
 */
export function calculateRollingLossRatios(
  monthlyData: Array<{ month: string; claims: number; fees: number; premiums: number }>,
  periods: number[] = [3, 6, 12]
): RollingLossRatioResult[] {
  const results: RollingLossRatioResult[] = [];
  
  for (const period of periods) {
    if (monthlyData.length < period) continue;
    
    const dataForPeriod = monthlyData.slice(-period);
    const totalClaims = dataForPeriod.reduce((sum, month) => sum + month.claims, 0);
    const totalFees = dataForPeriod.reduce((sum, month) => sum + month.fees, 0);
    const totalPremiums = dataForPeriod.reduce((sum, month) => sum + month.premiums, 0);
    
    if (totalPremiums === 0) continue;
    
    const lossRatio = (totalClaims + totalFees) / totalPremiums;
    
    // Calculate trend by comparing first half vs second half of period
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (period >= 6) {
      const halfPeriod = Math.floor(period / 2);
      const firstHalf = dataForPeriod.slice(0, halfPeriod);
      const secondHalf = dataForPeriod.slice(halfPeriod);
      
      const firstHalfLR = calculateAverageLossRatio(firstHalf);
      const secondHalfLR = calculateAverageLossRatio(secondHalf);
      
      const changeThreshold = 0.02; // 2% threshold for trend detection
      if (secondHalfLR < firstHalfLR - changeThreshold) {
        trend = 'improving';
      } else if (secondHalfLR > firstHalfLR + changeThreshold) {
        trend = 'declining';
      }
    }
    
    results.push({
      endMonth: monthlyData[monthlyData.length - 1].month,
      period,
      lossRatio,
      trend
    });
  }
  
  return results;
}

/**
 * Calculate average loss ratio for a period
 */
function calculateAverageLossRatio(
  data: Array<{ claims: number; fees: number; premiums: number }>
): number {
  const totalClaims = data.reduce((sum, month) => sum + month.claims, 0);
  const totalFees = data.reduce((sum, month) => sum + month.fees, 0);
  const totalPremiums = data.reduce((sum, month) => sum + month.premiums, 0);
  
  return totalPremiums > 0 ? (totalClaims + totalFees) / totalPremiums : 0;
}

/**
 * Generate loss ratio summary statistics
 */
export function generateLossRatioSummary(
  monthlyData: Array<{ month: string; claims: number; fees: number; premiums: number }>,
  targetLossRatio: number = 0.85
): {
  averageLossRatio: number;
  bestMonth: { month: string; lossRatio: number };
  worstMonth: { month: string; lossRatio: number };
  volatility: number;
  monthsOnTarget: number;
  monthsAboveTarget: number;
  totalVariance: number;
} {
  if (monthlyData.length === 0) {
    throw new Error('No data provided for summary calculation');
  }
  
  const monthlyLossRatios = monthlyData.map(month => {
    const lossRatio = calculateMonthlyLossRatio(month.claims, month.fees, month.premiums);
    return { month: month.month, lossRatio };
  });
  
  const averageLossRatio = monthlyLossRatios.reduce((sum, month) => sum + month.lossRatio, 0) / monthlyLossRatios.length;
  
  const bestMonth = monthlyLossRatios.reduce((best, current) => 
    current.lossRatio < best.lossRatio ? current : best
  );
  
  const worstMonth = monthlyLossRatios.reduce((worst, current) => 
    current.lossRatio > worst.lossRatio ? current : worst
  );
  
  // Calculate volatility (standard deviation)
  const variance = monthlyLossRatios.reduce((sum, month) => 
    sum + Math.pow(month.lossRatio - averageLossRatio, 2), 0
  ) / monthlyLossRatios.length;
  const volatility = Math.sqrt(variance);
  
  // Count months within target
  const targetThreshold = targetLossRatio * 1.05; // 5% tolerance
  const monthsOnTarget = monthlyLossRatios.filter(month => month.lossRatio <= targetThreshold).length;
  const monthsAboveTarget = monthlyLossRatios.filter(month => month.lossRatio > targetLossRatio).length;
  
  // Calculate total variance from target
  const totalVariance = monthlyLossRatios.reduce((sum, month) => 
    sum + Math.abs(month.lossRatio - targetLossRatio), 0
  );
  
  return {
    averageLossRatio,
    bestMonth,
    worstMonth,
    volatility,
    monthsOnTarget,
    monthsAboveTarget,
    totalVariance
  };
}

/**
 * Predict future loss ratio based on historical trend
 */
export function predictLossRatio(
  monthlyData: Array<{ month: string; claims: number; fees: number; premiums: number }>,
  monthsToPredict: number = 3
): Array<{ month: string; predictedLossRatio: number; confidence: number }> {
  if (monthlyData.length < 6) {
    throw new Error('Insufficient data for prediction (minimum 6 months required)');
  }
  
  const monthlyLossRatios = monthlyData.map((month, index) => ({
    index,
    lossRatio: calculateMonthlyLossRatio(month.claims, month.fees, month.premiums)
  }));
  
  // Simple linear regression for trend
  const n = monthlyLossRatios.length;
  const sumX = monthlyLossRatios.reduce((sum, point) => sum + point.index, 0);
  const sumY = monthlyLossRatios.reduce((sum, point) => sum + point.lossRatio, 0);
  const sumXY = monthlyLossRatios.reduce((sum, point) => sum + point.index * point.lossRatio, 0);
  const sumXX = monthlyLossRatios.reduce((sum, point) => sum + point.index * point.index, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared for confidence
  const meanY = sumY / n;
  const totalSumSquares = monthlyLossRatios.reduce((sum, point) => 
    sum + Math.pow(point.lossRatio - meanY, 2), 0
  );
  const residualSumSquares = monthlyLossRatios.reduce((sum, point) => {
    const predicted = slope * point.index + intercept;
    return sum + Math.pow(point.lossRatio - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (residualSumSquares / totalSumSquares);
  const confidence = Math.max(0, Math.min(1, rSquared)); // Clamp between 0 and 1
  
  // Generate predictions
  const predictions = [];
  for (let i = 1; i <= monthsToPredict; i++) {
    const futureIndex = n + i - 1;
    const predictedLossRatio = slope * futureIndex + intercept;
    
    // Generate future month string (simplified)
    const lastMonth = new Date(monthlyData[monthlyData.length - 1].month + '-01');
    const futureMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i, 1);
    const monthString = futureMonth.toISOString().substring(0, 7);
    
    predictions.push({
      month: monthString,
      predictedLossRatio: Math.max(0, predictedLossRatio), // Ensure non-negative
      confidence
    });
  }
  
  return predictions;
}

/**
 * Calculate loss ratio impact of cost changes
 */
export function calculateLossRatioImpact(
  currentData: LossRatioInput,
  changes: {
    claimsChange?: number;
    feesChange?: number;
    premiumsChange?: number;
  }
): {
  currentLossRatio: number;
  newLossRatio: number;
  impact: number;
  impactPercent: number;
} {
  const currentLossRatio = calculateMonthlyLossRatio(
    currentData.claims,
    currentData.fees,
    currentData.premiums
  );
  
  const newClaims = currentData.claims + (changes.claimsChange || 0);
  const newFees = currentData.fees + (changes.feesChange || 0);
  const newPremiums = currentData.premiums + (changes.premiumsChange || 0);
  
  const newLossRatio = calculateMonthlyLossRatio(newClaims, newFees, newPremiums);
  const impact = newLossRatio - currentLossRatio;
  const impactPercent = (impact / currentLossRatio) * 100;
  
  return {
    currentLossRatio,
    newLossRatio,
    impact,
    impactPercent
  };
}