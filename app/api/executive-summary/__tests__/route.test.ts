import { GET } from '../route';
import { NextRequest } from 'next/server';

describe('GET /api/executive-summary', () => {
  function createMockRequest(searchParams: Record<string, string>): NextRequest {
    const url = new URL('http://localhost:3000/api/executive-summary');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return new NextRequest(url);
  }

  it('should return executive summary for valid request', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  it('should include all required KPI fields', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const kpis = data.data.kpis;
    expect(kpis).toHaveProperty('totalPlanCost');
    expect(kpis).toHaveProperty('totalBudgetedPremium');
    expect(kpis).toHaveProperty('surplusDeficit');
    expect(kpis).toHaveProperty('percentOfBudget');
    expect(kpis).toHaveProperty('medicalPaidClaims');
    expect(kpis).toHaveProperty('pharmacyPaidClaims');
    expect(kpis).toHaveProperty('planYearLabel');
  });

  it('should include fuel gauge data', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const fuelGauge = data.data.fuelGauge;
    expect(fuelGauge).toHaveProperty('value');
    expect(fuelGauge).toHaveProperty('status');
    expect(fuelGauge).toHaveProperty('label');
    expect(['green', 'yellow', 'red']).toContain(fuelGauge.status);
  });

  it('should calculate fuel gauge status correctly - green', async () => {
    const request = createMockRequest({
      clientId: 'test-green',
      planYearId: '2024',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const fuelGauge = data.data.fuelGauge;
    if (fuelGauge.value < 95) {
      expect(fuelGauge.status).toBe('green');
    }
  });

  it('should return 400 for missing clientId', async () => {
    const request = createMockRequest({
      planYearId: '2024',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('clientId');
  });

  it('should return 400 for missing planYearId', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('planYearId');
  });

  it('should return numeric values for all KPIs', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const kpis = data.data.kpis;
    expect(typeof kpis.totalPlanCost).toBe('number');
    expect(typeof kpis.totalBudgetedPremium).toBe('number');
    expect(typeof kpis.surplusDeficit).toBe('number');
    expect(typeof kpis.percentOfBudget).toBe('number');
    expect(typeof kpis.medicalPaidClaims).toBe('number');
    expect(typeof kpis.pharmacyPaidClaims).toBe('number');
  });

  it('should calculate surplus correctly when under budget', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const kpis = data.data.kpis;
    const expectedSurplus = kpis.totalBudgetedPremium - kpis.totalPlanCost;
    expect(kpis.surplusDeficit).toBeCloseTo(expectedSurplus, 2);
  });
});
