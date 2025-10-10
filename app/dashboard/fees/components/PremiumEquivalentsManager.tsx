'use client';

/**
 * Premium Equivalents Manager
 * Matches template page 8: Premium Equivalent inputs
 *
 * Features:
 * - CRUD for premium equivalent rates by plan and tier
 * - 4 tiers: Employee Only, E+Spouse, E+Child, Family
 * - 3 plans: HDHP, PPO Base, PPO Buy-Up
 * - Effective date tracking
 * - Auto-save functionality
 */

import React, { useState } from 'react';

// Local interface for component - simplified version
interface PremiumEquivalent {
  id: string;
  planId: string;
  tier: 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY';
  amount: number;
  effectiveDate: string;
}

interface PremiumEquivalentsManagerProps {
  premiumEquivalents: PremiumEquivalent[];
  onAdd: (premium: PremiumEquivalent) => void;
  onUpdate: (premium: PremiumEquivalent) => void;
  onDelete: (id: string) => void;
}

const TIERS = [
  { value: 'EMPLOYEE_ONLY', label: 'Employee Only' },
  { value: 'EMPLOYEE_SPOUSE', label: 'Employee + Spouse' },
  { value: 'EMPLOYEE_CHILDREN', label: 'Employee + Children' },
  { value: 'FAMILY', label: 'Family' },
];

const PLANS = [
  { value: 'plan-hdhp', label: 'HDHP' },
  { value: 'plan-ppo-base', label: 'PPO Base' },
  { value: 'plan-ppo-buyup', label: 'PPO Buy-Up' },
];

export function PremiumEquivalentsManager({
  premiumEquivalents,
  onAdd,
  onUpdate,
  onDelete,
}: PremiumEquivalentsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PremiumEquivalent>>({});

  const handleEdit = (premium: PremiumEquivalent) => {
    setEditingId(premium.id);
    setFormData(premium);
  };

  const handleSave = () => {
    if (!formData.planId || !formData.tier || formData.amount === undefined || !formData.effectiveDate) {
      alert('Please fill in all required fields');
      return;
    }

    // After validation, we know all fields exist
    const premiumData: PremiumEquivalent = {
      id: editingId || `prem-${Date.now()}`,
      planId: formData.planId,
      tier: formData.tier,
      amount: formData.amount,
      effectiveDate: formData.effectiveDate,
    };

    if (editingId) {
      onUpdate(premiumData);
    } else {
      onAdd(premiumData);
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
    });
  };

  // Group premiums by plan for easier display
  const groupedByPlan = PLANS.map(plan => ({
    plan,
    equivalents: TIERS.map(tier => {
      const existing = premiumEquivalents.find(
        p => p.planId === plan.value && p.tier === tier.value
      );
      return {
        tier,
        data: existing,
      };
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Premium Equivalents</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure premium equivalent rates by plan and enrollment tier
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Premium
        </button>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-700">
            <strong>Premium Equivalents</strong> represent the monthly employer contribution per enrollment tier. These values are used for budget calculations and variance analysis.
          </div>
        </div>
      </div>

      {/* Edit Form (if editing) */}
      {editingId && (
        <div className="bg-white rounded-lg border-2 border-blue-500 shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {editingId === 'new' ? 'Add New Premium Equivalent' : 'Edit Premium Equivalent'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan *
              </label>
              <select
                value={formData.planId || ''}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a plan...</option>
                {PLANS.map(plan => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
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
                Monthly Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
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
              Save Premium
            </button>
          </div>
        </div>
      )}

      {/* Premium Grid by Plan */}
      <div className="space-y-6">
        {groupedByPlan.map(({ plan, equivalents }) => (
          <div key={plan.value} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h4 className="text-md font-semibold text-gray-900">{plan.label}</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Monthly Amount
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
                  {equivalents.map(({ tier, data }) => (
                    <tr key={tier.value} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tier.label}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {data ? (
                          <span className="font-medium">${data.amount.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
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
                                if (confirm(`Delete ${tier.label} premium for ${plan.label}?`)) {
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
                                planId: plan.value,
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
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="text-sm text-gray-600">
          <strong>Total Configured:</strong> {premiumEquivalents.length} of {PLANS.length * TIERS.length} possible combinations
        </div>
      </div>
    </div>
  );
}
