'use client';

/**
 * Stop Loss Fees by Tier Manager
 * Matches template page 8: Stop Loss fee configuration
 *
 * Features:
 * - CRUD for ISL (Individual Stop Loss) and ASL (Aggregate Stop Loss) fees
 * - 4 tiers: Employee Only, E+Spouse, E+Child, Family
 * - Per-tier rates (e.g., EE: $35, ES: $65)
 * - Effective date tracking
 * - Preview of monthly calculations
 */

import React, { useState } from 'react';

// Local interface for component
interface StopLossFeeByTier {
  id: string;
  feeType: 'ISL' | 'ASL' | 'COMPOSITE';
  tier: 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY';
  amountPerMember: number;
  effectiveDate: string;
}

interface StopLossFeesByTierProps {
  stopLossFees: StopLossFeeByTier[];
  onAdd: (fee: StopLossFeeByTier) => void;
  onUpdate: (fee: StopLossFeeByTier) => void;
  onDelete: (id: string) => void;
  enrollmentCounts?: {
    tier: string;
    count: number;
  }[];
}

const TIERS = [
  { value: 'EMPLOYEE_ONLY', label: 'Employee Only', shortLabel: 'EE' },
  { value: 'EMPLOYEE_SPOUSE', label: 'Employee + Spouse', shortLabel: 'ES' },
  { value: 'EMPLOYEE_CHILDREN', label: 'Employee + Children', shortLabel: 'EC' },
  { value: 'FAMILY', label: 'Family', shortLabel: 'FAM' },
];

const FEE_TYPES = [
  { value: 'ISL', label: 'Individual Stop Loss (ISL)' },
  { value: 'ASL', label: 'Aggregate Stop Loss (ASL)' },
];

export function StopLossFeesByTier({
  stopLossFees,
  onAdd,
  onUpdate,
  onDelete,
  enrollmentCounts = [],
}: StopLossFeesByTierProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<StopLossFeeByTier>>({});

  const handleEdit = (fee: StopLossFeeByTier) => {
    setEditingId(fee.id);
    setFormData(fee);
  };

  const handleSave = () => {
    if (!formData.feeType || !formData.tier || formData.amountPerMember === undefined) {
      alert('Please fill in all required fields');
      return;
    }

    const feeData: StopLossFeeByTier = {
      id: editingId || `sl-${Date.now()}`,
      feeType: formData.feeType as 'ISL' | 'ASL',
      tier: formData.tier as 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY',
      amountPerMember: formData.amountPerMember,
      effectiveDate: formData.effectiveDate || new Date().toISOString().split('T')[0],
    };

    if (editingId && editingId !== 'new') {
      onUpdate(feeData);
    } else {
      onAdd(feeData);
    }

    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      effectiveDate: new Date().toISOString().split('T')[0],
      feeType: 'ISL',
    });
  };

  // Group fees by type and tier
  const groupedByType = FEE_TYPES.map(type => ({
    type,
    fees: TIERS.map(tier => {
      const existing = stopLossFees.find(
        f => f.feeType === type.value && f.tier === tier.value
      );
      const enrollment = enrollmentCounts.find(e => e.tier === tier.value);
      const monthlyTotal = existing && enrollment ? existing.amountPerMember * enrollment.count : 0;

      return {
        tier,
        data: existing,
        enrollment: enrollment?.count || 0,
        monthlyTotal,
      };
    }),
  }));

  const calculateTotalMonthly = (feeType: string) => {
    return groupedByType
      .find(g => g.type.value === feeType)
      ?.fees.reduce((sum, f) => sum + f.monthlyTotal, 0) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Stop Loss Fees by Tier</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure ISL and ASL fee rates per enrollment tier
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Stop Loss Fee
        </button>
      </div>

      {/* Info Alert */}
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-purple-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-purple-700">
            <strong>Stop Loss Fees</strong> are charged per enrolled member by tier. ISL protects against individual high-cost claimants ($200k+ limit). ASL protects against aggregate claim costs exceeding expected levels.
          </div>
        </div>
      </div>

      {/* Edit Form (if editing) */}
      {editingId && (
        <div className="bg-white rounded-lg border-2 border-blue-500 shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {editingId === 'new' ? 'Add New Stop Loss Fee' : 'Edit Stop Loss Fee'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Type *
              </label>
              <select
                value={formData.feeType || 'ISL'}
                onChange={(e) => setFormData({ ...formData, feeType: e.target.value as 'ISL' | 'ASL' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {FEE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Tier *
              </label>
              <select
                value={formData.tier || ''}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a tier...</option>
                {TIERS.map(tier => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Per Member *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amountPerMember || ''}
                  onChange={(e) => setFormData({ ...formData, amountPerMember: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={formData.effectiveDate || ''}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Fee
            </button>
          </div>
        </div>
      )}

      {/* Fees Grid by Type */}
      <div className="space-y-6">
        {groupedByType.map(({ type, fees }) => {
          const totalMonthly = calculateTotalMonthly(type.value);

          return (
            <div key={type.value} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-purple-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-md font-semibold text-gray-900">{type.label}</h4>
                {totalMonthly > 0 && (
                  <div className="text-sm text-purple-700 font-semibold">
                    Monthly Total: ${totalMonthly.toFixed(2)}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Rate Per Member
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Monthly Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Effective Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {fees.map(({ tier, data, enrollment, monthlyTotal }) => (
                      <tr key={tier.value} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {tier.label}
                          <span className="ml-2 text-xs text-gray-500">({tier.shortLabel})</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                          {data ? (
                            <span className="font-medium">${data.amountPerMember.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400 italic">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {enrollment > 0 ? enrollment : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-purple-700">
                          {monthlyTotal > 0 ? `$${monthlyTotal.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {data ? data.effectiveDate : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {data ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(data)}
                                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete ${tier.label} ${type.label} fee?`)) {
                                    onDelete(data.id);
                                  }
                                }}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId('new');
                                setFormData({
                                  feeType: type.value as 'ISL' | 'ASL',
                                  tier: tier.value as 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY',
                                  effectiveDate: new Date().toISOString().split('T')[0],
                                });
                              }}
                              className="px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              Add
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Total Configured:</strong> {stopLossFees.length} of {FEE_TYPES.length * TIERS.length} possible combinations
          </div>
          <div>
            <strong>Total ISL Monthly:</strong> ${calculateTotalMonthly('ISL').toFixed(2)}
          </div>
          <div>
            <strong>Total ASL Monthly:</strong> ${calculateTotalMonthly('ASL').toFixed(2)}
          </div>
          <div className="font-semibold text-purple-700">
            <strong>Combined Monthly:</strong> ${(calculateTotalMonthly('ISL') + calculateTotalMonthly('ASL')).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
