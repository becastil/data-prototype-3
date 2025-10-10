'use client';

/**
 * Global Inputs Manager
 * Matches template page 8: Global calculation inputs
 *
 * Features:
 * - Rx Rebate PEPM configuration
 * - IBNR (Incurred But Not Reported) adjustment
 * - ASL Composite Factor
 * - Effective date tracking
 * - Impact preview on downstream calculations
 */

import React, { useState } from 'react';

interface GlobalInput {
  id: string;
  name: string;
  value: number;
  type: 'currency' | 'percentage' | 'factor';
  description: string;
  effectiveDate: string;
}

interface GlobalInputsManagerProps {
  globalInputs: GlobalInput[];
  onUpdate: (input: GlobalInput) => void;
}

const DEFAULT_INPUTS: Omit<GlobalInput, 'id' | 'effectiveDate'>[] = [
  {
    name: 'Rx Rebate PEPM',
    value: 0,
    type: 'currency',
    description: 'Estimated pharmacy rebate per employee per month. Used to calculate total Rx rebates based on enrollment.',
  },
  {
    name: 'IBNR Adjustment',
    value: 0,
    type: 'currency',
    description: 'Incurred But Not Reported adjustment. Accounts for claims that occurred but have not yet been reported.',
  },
  {
    name: 'ASL Composite Factor',
    value: 0,
    type: 'factor',
    description: 'Aggregate Stop Loss composite factor. Multiplier applied to total enrollment for ASL fee calculation.',
  },
  {
    name: 'ISL Limit',
    value: 200000,
    type: 'currency',
    description: 'Individual Stop Loss limit. Maximum employer responsibility per claimant before stop loss coverage begins.',
  },
  {
    name: 'HCC Threshold',
    value: 100000,
    type: 'currency',
    description: 'High Cost Claimant threshold (typically 50% of ISL). Claimants exceeding this are flagged for monitoring.',
  },
  {
    name: 'Expected Loss Ratio',
    value: 85,
    type: 'percentage',
    description: 'Target loss ratio percentage. Used for variance analysis and budget projections.',
  },
];

export function GlobalInputsManager({
  globalInputs,
  onUpdate,
}: GlobalInputsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<number>(0);

  // Initialize inputs if they don't exist
  const inputs = DEFAULT_INPUTS.map(defaultInput => {
    const existing = globalInputs.find(i => i.name === defaultInput.name);
    return existing || {
      id: `input-${defaultInput.name.toLowerCase().replace(/\s+/g, '-')}`,
      ...defaultInput,
      effectiveDate: new Date().toISOString().split('T')[0],
    };
  });

  const handleEdit = (input: GlobalInput) => {
    setEditingId(input.id);
    setTempValue(input.value);
  };

  const handleSave = (input: GlobalInput) => {
    onUpdate({
      ...input,
      value: tempValue,
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempValue(0);
  };

  const formatValue = (value: number, type: GlobalInput['type']) => {
    switch (type) {
      case 'currency':
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'factor':
        return value.toFixed(4);
      default:
        return value.toString();
    }
  };

  const getInputPlaceholder = (type: GlobalInput['type']) => {
    switch (type) {
      case 'currency':
        return '0.00';
      case 'percentage':
        return '0.0';
      case 'factor':
        return '0.0000';
      default:
        return '0';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Global Calculation Inputs</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure global parameters that affect downstream calculations
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-green-700">
            <strong>Global Inputs</strong> affect all downstream calculations. Changes to these values will recalculate KPIs, summary tables, and variance analyses across all plan years.
          </div>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Input Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Current Value
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
              {inputs.map((input) => (
                <tr key={input.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {input.name}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {input.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-md">
                      {input.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === input.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative w-40">
                          {input.type === 'currency' && (
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                          )}
                          <input
                            type="number"
                            step={input.type === 'factor' ? '0.0001' : input.type === 'percentage' ? '0.1' : '0.01'}
                            value={tempValue}
                            onChange={(e) => setTempValue(parseFloat(e.target.value) || 0)}
                            className={`w-full ${input.type === 'currency' ? 'pl-8' : 'pl-3'} pr-3 py-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-right`}
                            placeholder={getInputPlaceholder(input.type)}
                            autoFocus
                          />
                          {input.type === 'percentage' && (
                            <span className="absolute right-3 top-2 text-gray-500">%</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSave(input)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="Save"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-gray-900 text-right">
                        {formatValue(input.value, input.type)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {input.effectiveDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {editingId !== input.id && (
                      <button
                        onClick={() => handleEdit(input)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Preview */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">Impact on Calculations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Rx Rebate PEPM</strong>
            <div className="text-xs text-blue-700 mt-1">
              Affects: Net Paid Claims (Column H), Total Plan Cost, PEPM calculations
            </div>
          </div>
          <div>
            <strong>IBNR Adjustment</strong>
            <div className="text-xs text-blue-700 mt-1">
              Affects: Total Plan Cost, Monthly C&E, Budget variance
            </div>
          </div>
          <div>
            <strong>ASL Composite Factor</strong>
            <div className="text-xs text-blue-700 mt-1">
              Affects: Stop Loss Fees (Column J), Total Plan Cost
            </div>
          </div>
          <div>
            <strong>ISL Limit & HCC Threshold</strong>
            <div className="text-xs text-blue-700 mt-1">
              Affects: High Cost Claimant identification, Employer/Stop Loss responsibility split
            </div>
          </div>
          <div>
            <strong>Expected Loss Ratio</strong>
            <div className="text-xs text-blue-700 mt-1">
              Affects: Budget targets, Fuel Gauge thresholds, Variance analysis
            </div>
          </div>
        </div>
      </div>

      {/* Version History (Placeholder) */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Version Control</h4>
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Changes to global inputs are effective immediately and create a new version with today&apos;s date.
          </p>
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Version history and rollback functionality will be implemented in Phase 7.
          </p>
        </div>
      </div>
    </div>
  );
}
