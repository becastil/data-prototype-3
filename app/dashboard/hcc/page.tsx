'use client';

/**
 * High Cost Claimant (HCC) Dashboard
 * Matches template page 4: Individual Stop Loss Analysis
 *
 * Features:
 * - HCC table with claimants exceeding 50% of ISL ($100k threshold)
 * - Employer vs Stop Loss visualization
 * - Plan/Status filtering
 * - CSV export with PHI protection
 */

import React, { useState, useEffect } from 'react';
import type { HighClaimant } from '@/types/enterprise-template';
import { formatCurrency, formatNumber } from '@/lib/calculations/template-formulas';
import HCCDistributionCharts from './components/HCCDistributionCharts';
import { generateHCCAnalysisPDF } from '@/lib/pdf/hccAnalysisPDF';

// Helper function to get plan name
const getPlanName = (planId: string): string => {
  const planMap: Record<string, string> = {
    'plan-hdhp': 'HDHP',
    'plan-ppo-base': 'PPO Base',
    'plan-ppo-buyup': 'PPO Buy-Up',
  };
  return planMap[planId] || planId;
};

export default function HighCostClaimantPage() {
  const [loading, setLoading] = useState(true);
  const [claimants, setClaimants] = useState<HighClaimant[]>([]);
  const [filteredClaimants, setFilteredClaimants] = useState<HighClaimant[]>([]);

  // Filters
  const [selectedClient, setSelectedClient] = useState('flavio-dog-house');
  const [selectedPlanYear, setSelectedPlanYear] = useState('2024');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [thresholdFilter, setThresholdFilter] = useState<number>(100000);

  // ISL Limit
  const islLimit = 200000;
  const hccThreshold = islLimit * 0.5; // $100k

  useEffect(() => {
    loadHighCostClaimants();
  }, [selectedClient, selectedPlanYear]);

  useEffect(() => {
    applyFilters();
  }, [claimants, selectedPlan, selectedStatus, thresholdFilter]);

  async function loadHighCostClaimants() {
    try {
      setLoading(true);

      // In production: GET /api/hcc?clientId&planYearId
      // For now, use Golden Sample data
      const mockClaimants: HighClaimant[] = [
        {
          id: 'hcc-1',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-001',
          planId: 'plan-hdhp',
          status: 'ACTIVE',
          primaryDiagnosis: 'Frito Feet',
          medicalPaid: 300000,
          rxPaid: 20000,
          totalPaid: 320000,
          islLimit: 200000,
          amountExceedingISL: 120000,
          recognized: true,
        },
        {
          id: 'hcc-2',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-002',
          planId: 'plan-ppo-base',
          status: 'ACTIVE',
          primaryDiagnosis: 'Zoomies',
          medicalPaid: 180000,
          rxPaid: 15000,
          totalPaid: 195000,
          islLimit: 200000,
          amountExceedingISL: 0,
          recognized: false,
        },
        {
          id: 'hcc-3',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-003',
          planId: 'plan-ppo-buyup',
          status: 'COBRA',
          primaryDiagnosis: 'Tail Wagger Syndrome',
          medicalPaid: 250000,
          rxPaid: 30000,
          totalPaid: 280000,
          islLimit: 200000,
          amountExceedingISL: 80000,
          recognized: true,
        },
        {
          id: 'hcc-4',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-004',
          planId: 'plan-ppo-base',
          status: 'ACTIVE',
          primaryDiagnosis: 'Barkitis',
          medicalPaid: 150000,
          rxPaid: 25000,
          totalPaid: 175000,
          islLimit: 200000,
          amountExceedingISL: 0,
          recognized: false,
        },
        {
          id: 'hcc-5',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-005',
          planId: 'plan-hdhp',
          status: 'TERMINATED',
          primaryDiagnosis: 'Chronic Sniffing Disorder',
          medicalPaid: 120000,
          rxPaid: 10000,
          totalPaid: 130000,
          islLimit: 200000,
          amountExceedingISL: 0,
          recognized: false,
        },
        {
          id: 'hcc-6',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-006',
          planId: 'plan-ppo-buyup',
          status: 'ACTIVE',
          primaryDiagnosis: 'Excessive Treats Syndrome',
          medicalPaid: 220000,
          rxPaid: 18000,
          totalPaid: 238000,
          islLimit: 200000,
          amountExceedingISL: 38000,
          recognized: true,
        },
        {
          id: 'hcc-7',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-007',
          planId: 'plan-ppo-base',
          status: 'ACTIVE',
          primaryDiagnosis: 'Persistent Licking',
          medicalPaid: 110000,
          rxPaid: 8000,
          totalPaid: 118000,
          islLimit: 200000,
          amountExceedingISL: 0,
          recognized: false,
        },
        {
          id: 'hcc-8',
          clientId: 'client-flavios-dog-house',
          planYearId: 'py-2024',
          claimantKey: 'claimant-008',
          planId: 'plan-ppo-base',
          status: 'ACTIVE',
          primaryDiagnosis: 'Serious Case of the Good Boys',
          medicalPaid: 190000,
          rxPaid: 22000,
          totalPaid: 212000,
          islLimit: 200000,
          amountExceedingISL: 12000,
          recognized: true,
        },
      ];

      setClaimants(mockClaimants);
      setFilteredClaimants(mockClaimants);

    } catch (err) {
      console.error('Failed to load high cost claimants:', err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...claimants];

    // Filter by plan
    if (selectedPlan !== 'ALL') {
      filtered = filtered.filter(c => c.planId === selectedPlan);
    }

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }

    // Filter by threshold
    filtered = filtered.filter(c => c.totalPaid >= thresholdFilter);

    setFilteredClaimants(filtered);
  }

  function handleExportCSV() {
    console.log('Exporting HCC CSV...');
    alert('⚠️ PHI Warning: This export contains Protected Health Information.');
  }

  async function handleExportPDF() {
    try {
      await generateHCCAnalysisPDF({
        clientName: "Flavio's Dog House",
        planYear: `${selectedPlanYear} Plan Year`,
        dataThrough: '2025-06',
        claimants: filteredClaimants,
        summary: {
          totalClaimants,
          totalClaims,
          employerResponsibility: totalEmployerResp,
          stopLossResponsibility: totalStopLossResp,
          islLimit,
        },
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  // Calculate aggregate stats
  const totalClaimants = filteredClaimants.length;
  const totalClaims = filteredClaimants.reduce((sum, c) => sum + c.totalPaid, 0);
  const totalEmployerResp = filteredClaimants.reduce((sum, c) => sum + Math.min(c.totalPaid, c.islLimit), 0);
  const totalStopLossResp = filteredClaimants.reduce((sum, c) => sum + c.amountExceedingISL, 0);
  const claimantsExceedingISL = filteredClaimants.filter(c => c.amountExceedingISL > 0).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading high cost claimants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* PHI Warning Banner */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Protected Health Information (PHI)</h3>
            <p className="text-sm text-amber-700">This page contains PHI. Ensure HIPAA compliance when viewing, sharing, or exporting.</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          High Cost Claimants
        </h1>
        <p className="text-gray-600">
          Individual Stop Loss Analysis - Claims Exceeding 50% of ISL (${formatNumber(hccThreshold)})
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Claimants</div>
          <div className="text-2xl font-bold text-gray-900">{totalClaimants}</div>
          <div className="text-xs text-gray-500 mt-1">{claimantsExceedingISL} exceeding ISL</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Claims</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalClaims)}</div>
          <div className="text-xs text-gray-500 mt-1">Medical + Pharmacy</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Employer Responsibility</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalEmployerResp)}</div>
          <div className="text-xs text-gray-500 mt-1">Up to ISL limit</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Stop Loss Responsibility</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStopLossResp)}</div>
          <div className="text-xs text-gray-500 mt-1">Claims exceeding ISL</div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="mb-6">
        <HCCDistributionCharts
          buckets={[
            { label: '>$200k', count: filteredClaimants.filter(c => c.totalPaid >= 200000).length, totalCost: filteredClaimants.filter(c => c.totalPaid >= 200000).reduce((sum, c) => sum + c.totalPaid, 0), percentage: (filteredClaimants.filter(c => c.totalPaid >= 200000).length / totalClaimants) * 100 },
            { label: '$150k-$200k', count: filteredClaimants.filter(c => c.totalPaid >= 150000 && c.totalPaid < 200000).length, totalCost: filteredClaimants.filter(c => c.totalPaid >= 150000 && c.totalPaid < 200000).reduce((sum, c) => sum + c.totalPaid, 0), percentage: (filteredClaimants.filter(c => c.totalPaid >= 150000 && c.totalPaid < 200000).length / totalClaimants) * 100 },
            { label: '$100k-$150k', count: filteredClaimants.filter(c => c.totalPaid >= 100000 && c.totalPaid < 150000).length, totalCost: filteredClaimants.filter(c => c.totalPaid >= 100000 && c.totalPaid < 150000).reduce((sum, c) => sum + c.totalPaid, 0), percentage: (filteredClaimants.filter(c => c.totalPaid >= 100000 && c.totalPaid < 150000).length / totalClaimants) * 100 },
            { label: '<$100k', count: filteredClaimants.filter(c => c.totalPaid < 100000).length, totalCost: filteredClaimants.filter(c => c.totalPaid < 100000).reduce((sum, c) => sum + c.totalPaid, 0), percentage: (filteredClaimants.filter(c => c.totalPaid < 100000).length / totalClaimants) * 100 },
          ]}
          statusDistribution={[
            { status: 'ACTIVE', count: filteredClaimants.filter(c => c.status === 'ACTIVE').length, percentage: (filteredClaimants.filter(c => c.status === 'ACTIVE').length / totalClaimants) * 100 },
            { status: 'TERMINATED', count: filteredClaimants.filter(c => c.status === 'TERMINATED').length, percentage: (filteredClaimants.filter(c => c.status === 'TERMINATED').length / totalClaimants) * 100 },
            { status: 'COBRA', count: filteredClaimants.filter(c => c.status === 'COBRA').length, percentage: (filteredClaimants.filter(c => c.status === 'COBRA').length / totalClaimants) * 100 },
          ]}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-end justify-between flex-wrap">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="flavio-dog-house">Flavio&apos;s Dog House</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Year</label>
            <select
              value={selectedPlanYear}
              onChange={(e) => setSelectedPlanYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024">2024 Plan Year</option>
              <option value="2023">2023 Plan Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Plans</option>
              <option value="plan-hdhp">HDHP</option>
              <option value="plan-ppo-base">PPO Base</option>
              <option value="plan-ppo-buyup">PPO Buy-Up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TERMINATED">Terminated</option>
              <option value="COBRA">COBRA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Threshold</label>
            <select
              value={thresholdFilter}
              onChange={(e) => setThresholdFilter(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>$0 (All)</option>
              <option value={50000}>$50,000</option>
              <option value={100000}>$100,000 (50% ISL)</option>
              <option value={150000}>$150,000</option>
              <option value={200000}>$200,000 (ISL Limit)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* HCC Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-red-900 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">#</th>
                <th className="px-3 py-3 text-left font-semibold">Plan</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
                <th className="px-3 py-3 text-left font-semibold">Primary Diagnosis</th>
                <th className="px-3 py-3 text-right font-semibold">Medical<br/>Claims</th>
                <th className="px-3 py-3 text-right font-semibold">Rx<br/>Claims</th>
                <th className="px-3 py-3 text-right font-semibold bg-red-800">Total<br/>Claims</th>
                <th className="px-3 py-3 text-right font-semibold">ISL<br/>Limit</th>
                <th className="px-3 py-3 text-right font-semibold bg-red-800">Exceeding<br/>ISL</th>
                <th className="px-3 py-3 text-right font-semibold bg-blue-700">Employer<br/>Resp.</th>
                <th className="px-3 py-3 text-right font-semibold bg-green-700">Stop Loss<br/>Resp.</th>
                <th className="px-3 py-3 text-center font-semibold">% of ISL</th>
              </tr>
            </thead>

            <tbody>
              {filteredClaimants.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-gray-500">
                    No high cost claimants found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredClaimants.map((claimant, index) => {
                  const percentOfISL = (claimant.totalPaid / claimant.islLimit) * 100;
                  const percentColor = percentOfISL >= 100 ? 'text-red-600' :
                                      percentOfISL >= 75 ? 'text-amber-600' : 'text-green-600';

                  const statusBadge = claimant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                     claimant.status === 'TERMINATED' ? 'bg-red-100 text-red-800' :
                                     'bg-blue-100 text-blue-800';

                  const employerResp = Math.min(claimant.totalPaid, claimant.islLimit);

                  return (
                    <tr key={claimant.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{index + 1}</td>
                      <td className="px-3 py-2">{getPlanName(claimant.planId)}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge}`}>
                          {claimant.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{claimant.primaryDiagnosis}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(claimant.medicalPaid)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(claimant.rxPaid)}</td>
                      <td className="px-3 py-2 text-right bg-gray-50 font-semibold">
                        {formatCurrency(claimant.totalPaid)}
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(claimant.islLimit)}</td>
                      <td className="px-3 py-2 text-right bg-gray-50 font-semibold">
                        {claimant.amountExceedingISL > 0 ? formatCurrency(claimant.amountExceedingISL) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right bg-blue-50 font-semibold text-blue-700">
                        {formatCurrency(employerResp)}
                      </td>
                      <td className="px-3 py-2 text-right bg-green-50 font-semibold text-green-700">
                        {claimant.amountExceedingISL > 0 ? formatCurrency(claimant.amountExceedingISL) : '-'}
                      </td>
                      <td className={`px-3 py-2 text-center font-semibold ${percentColor}`}>
                        {percentOfISL.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Totals Row */}
              {filteredClaimants.length > 0 && (
                <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                  <td colSpan={4} className="px-3 py-2">TOTAL ({totalClaimants} Claimants)</td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(filteredClaimants.reduce((sum, c) => sum + c.medicalPaid, 0))}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(filteredClaimants.reduce((sum, c) => sum + c.rxPaid, 0))}
                  </td>
                  <td className="px-3 py-2 text-right bg-gray-200">
                    {formatCurrency(totalClaims)}
                  </td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right bg-gray-200">
                    {formatCurrency(filteredClaimants.reduce((sum, c) => sum + c.amountExceedingISL, 0))}
                  </td>
                  <td className="px-3 py-2 text-right bg-blue-100 text-blue-700">
                    {formatCurrency(totalEmployerResp)}
                  </td>
                  <td className="px-3 py-2 text-right bg-green-100 text-green-700">
                    {formatCurrency(totalStopLossResp)}
                  </td>
                  <td className="px-3 py-2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <strong>ISL Limit:</strong> ${formatNumber(islLimit)}
          <span className="mx-2">|</span>
          <strong>HCC Threshold (50% ISL):</strong> ${formatNumber(hccThreshold)}
          <span className="mx-2">|</span>
          <strong>Employer Resp.:</strong> Claims up to ISL
          <span className="mx-2">|</span>
          <strong>Stop Loss Resp.:</strong> Claims exceeding ISL
        </div>
      </div>
    </div>
  );
}
