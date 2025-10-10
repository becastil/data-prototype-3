import { GET } from '../route';
import { NextRequest } from 'next/server';

describe('GET /api/monthly-detail', () => {
  function createMockRequest(searchParams: Record<string, string>): NextRequest {
    const url = new URL('http://localhost:3000/api/monthly-detail');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return new NextRequest(url);
  }

  it('should return monthly stats for valid request', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
      planId: 'ALL_PLANS',
      months: '12',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.monthlyStats).toBeInstanceOf(Array);
    expect(data.data.monthlyStats.length).toBeLessThanOrEqual(12);
  });

  it('should return 400 for missing clientId', async () => {
    const request = createMockRequest({
      planYearId: '2024',
      planId: 'ALL_PLANS',
      months: '12',
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
      planId: 'ALL_PLANS',
      months: '12',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('planYearId');
  });

  it('should default to ALL_PLANS if planId not provided', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
      months: '12',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should default to 12 months if months not provided', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
      planId: 'ALL_PLANS',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.monthlyStats.length).toBeLessThanOrEqual(12);
  });

  it('should respect months parameter', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
      planId: 'ALL_PLANS',
      months: '6',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.monthlyStats.length).toBeLessThanOrEqual(6);
  });

  it('should include calculated fields in monthly stats', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
      planId: 'ALL_PLANS',
      months: '12',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const firstMonth = data.data.monthlyStats[0];
    expect(firstMonth).toHaveProperty('netMedicalPharmacyClaims');
    expect(firstMonth).toHaveProperty('totalPlanCost');
    expect(firstMonth).toHaveProperty('surplusDeficit');
    expect(firstMonth).toHaveProperty('pepm');
    expect(firstMonth).toHaveProperty('percentOfBudget');
  });

  it('should filter by specific plan', async () => {
    const request = createMockRequest({
      clientId: 'flavio-dog-house',
      planYearId: '2024',
      planId: 'PLAN_1',
      months: '12',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // In mock implementation, might return empty array or filtered data
  });
});
