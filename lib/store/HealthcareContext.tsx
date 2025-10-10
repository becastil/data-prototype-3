'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ExperienceData, HighCostClaimant, FeeStructure, MonthlySummary, DashboardConfig } from '@/types/healthcare';
import { FeeStructureV2 } from '@/types/fees';
import { UserAdjustableLineItem, BudgetData } from '@/types/summary';

interface HealthcareState {
  experienceData: ExperienceData[];
  highCostClaimants: HighCostClaimant[];
  feeStructures: FeeStructure[];
  feeStructuresV2: FeeStructureV2[];
  monthlySummaries: MonthlySummary[];
  dashboardConfig: DashboardConfig;
  userAdjustments: UserAdjustableLineItem[];
  budgetData: BudgetData[];
  loading: boolean;
  error: string | null;
  dataLastUpdated: string | null;
}

type HealthcareAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXPERIENCE_DATA'; payload: ExperienceData[] }
  | { type: 'SET_HIGH_COST_CLAIMANTS'; payload: HighCostClaimant[] }
  | { type: 'SET_FEE_STRUCTURES'; payload: FeeStructure[] }
  | { type: 'SET_FEE_STRUCTURES_V2'; payload: FeeStructureV2[] }
  | { type: 'ADD_FEE_STRUCTURE_V2'; payload: FeeStructureV2 }
  | { type: 'UPDATE_FEE_STRUCTURE_V2'; payload: FeeStructureV2 }
  | { type: 'DELETE_FEE_STRUCTURE_V2'; payload: string }
  | { type: 'SET_MONTHLY_SUMMARIES'; payload: MonthlySummary[] }
  | { type: 'UPDATE_DASHBOARD_CONFIG'; payload: Partial<DashboardConfig> }
  | { type: 'SET_USER_ADJUSTMENTS'; payload: UserAdjustableLineItem[] }
  | { type: 'ADD_USER_ADJUSTMENT'; payload: UserAdjustableLineItem }
  | { type: 'UPDATE_USER_ADJUSTMENT'; payload: UserAdjustableLineItem }
  | { type: 'DELETE_USER_ADJUSTMENT'; payload: string }
  | { type: 'SET_BUDGET_DATA'; payload: BudgetData[] }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'LOAD_FROM_STORAGE'; payload: HealthcareState };

const initialDashboardConfig: DashboardConfig = {
  clientName: 'Healthcare Client',
  planYear: '2024',
  reportingPeriod: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  targetLossRatio: 0.85,
  currency: 'USD',
  dateFormat: 'YYYY-MM',
};

const initialState: HealthcareState = {
  experienceData: [],
  highCostClaimants: [],
  feeStructures: [],
  feeStructuresV2: [],
  monthlySummaries: [],
  dashboardConfig: initialDashboardConfig,
  userAdjustments: [],
  budgetData: [],
  loading: false,
  error: null,
  dataLastUpdated: null,
};

function healthcareReducer(state: HealthcareState, action: HealthcareAction): HealthcareState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_EXPERIENCE_DATA':
      return { 
        ...state, 
        experienceData: action.payload, 
        dataLastUpdated: new Date().toISOString(),
        error: null 
      };
    
    case 'SET_HIGH_COST_CLAIMANTS':
      return { 
        ...state, 
        highCostClaimants: action.payload, 
        dataLastUpdated: new Date().toISOString(),
        error: null 
      };
    
    case 'SET_FEE_STRUCTURES':
      return {
        ...state,
        feeStructures: action.payload,
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'SET_FEE_STRUCTURES_V2':
      return {
        ...state,
        feeStructuresV2: action.payload,
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'ADD_FEE_STRUCTURE_V2':
      return {
        ...state,
        feeStructuresV2: [...state.feeStructuresV2, action.payload],
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'UPDATE_FEE_STRUCTURE_V2':
      return {
        ...state,
        feeStructuresV2: state.feeStructuresV2.map(fee =>
          fee.id === action.payload.id ? action.payload : fee
        ),
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'DELETE_FEE_STRUCTURE_V2':
      return {
        ...state,
        feeStructuresV2: state.feeStructuresV2.filter(fee => fee.id !== action.payload),
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'SET_MONTHLY_SUMMARIES':
      return { 
        ...state, 
        monthlySummaries: action.payload, 
        dataLastUpdated: new Date().toISOString(),
        error: null 
      };
    
    case 'UPDATE_DASHBOARD_CONFIG':
      return {
        ...state,
        dashboardConfig: { ...state.dashboardConfig, ...action.payload }
      };

    case 'SET_USER_ADJUSTMENTS':
      return {
        ...state,
        userAdjustments: action.payload,
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'ADD_USER_ADJUSTMENT':
      return {
        ...state,
        userAdjustments: [...state.userAdjustments, action.payload],
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'UPDATE_USER_ADJUSTMENT':
      return {
        ...state,
        userAdjustments: state.userAdjustments.map(adj =>
          adj.id === action.payload.id ? action.payload : adj
        ),
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'DELETE_USER_ADJUSTMENT':
      return {
        ...state,
        userAdjustments: state.userAdjustments.filter(adj => adj.id !== action.payload),
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'SET_BUDGET_DATA':
      return {
        ...state,
        budgetData: action.payload,
        dataLastUpdated: new Date().toISOString(),
        error: null
      };

    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        dashboardConfig: state.dashboardConfig
      };

    case 'LOAD_FROM_STORAGE':
      return action.payload;
    
    default:
      return state;
  }
}

interface HealthcareContextType {
  state: HealthcareState;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setExperienceData: (data: ExperienceData[]) => void;
    setHighCostClaimants: (data: HighCostClaimant[]) => void;
    setFeeStructures: (data: FeeStructure[]) => void;
    setFeeStructuresV2: (data: FeeStructureV2[]) => void;
    addFeeStructureV2: (fee: FeeStructureV2) => void;
    updateFeeStructureV2: (fee: FeeStructureV2) => void;
    deleteFeeStructureV2: (feeId: string) => void;
    setMonthlySummaries: (data: MonthlySummary[]) => void;
    updateDashboardConfig: (config: Partial<DashboardConfig>) => void;
    setUserAdjustments: (data: UserAdjustableLineItem[]) => void;
    addUserAdjustment: (adjustment: UserAdjustableLineItem) => void;
    updateUserAdjustment: (adjustment: UserAdjustableLineItem) => void;
    deleteUserAdjustment: (adjustmentId: string) => void;
    setBudgetData: (data: BudgetData[]) => void;
    clearAllData: () => void;
    saveToStorage: () => void;
    loadFromStorage: () => void;
  };
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

const STORAGE_KEY = 'healthcare-dashboard-data';

export function HealthcareProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(healthcareReducer, initialState);

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedState: HealthcareState = JSON.parse(stored);
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved data' });
      }
    }
  }, []); // Only run once on mount

  // Save to localStorage whenever state changes (debounced, client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [state]); // Depend on state directly

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [state]);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState: HealthcareState = JSON.parse(stored);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved data' });
    }
  }, []);

  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setExperienceData: (data: ExperienceData[]) => dispatch({ type: 'SET_EXPERIENCE_DATA', payload: data }),
    setHighCostClaimants: (data: HighCostClaimant[]) => dispatch({ type: 'SET_HIGH_COST_CLAIMANTS', payload: data }),
    setFeeStructures: (data: FeeStructure[]) => dispatch({ type: 'SET_FEE_STRUCTURES', payload: data }),
    setFeeStructuresV2: (data: FeeStructureV2[]) => dispatch({ type: 'SET_FEE_STRUCTURES_V2', payload: data }),
    addFeeStructureV2: (fee: FeeStructureV2) => dispatch({ type: 'ADD_FEE_STRUCTURE_V2', payload: fee }),
    updateFeeStructureV2: (fee: FeeStructureV2) => dispatch({ type: 'UPDATE_FEE_STRUCTURE_V2', payload: fee }),
    deleteFeeStructureV2: (feeId: string) => dispatch({ type: 'DELETE_FEE_STRUCTURE_V2', payload: feeId }),
    setMonthlySummaries: (data: MonthlySummary[]) => dispatch({ type: 'SET_MONTHLY_SUMMARIES', payload: data }),
    updateDashboardConfig: (config: Partial<DashboardConfig>) => dispatch({ type: 'UPDATE_DASHBOARD_CONFIG', payload: config }),
    setUserAdjustments: (data: UserAdjustableLineItem[]) => dispatch({ type: 'SET_USER_ADJUSTMENTS', payload: data }),
    addUserAdjustment: (adjustment: UserAdjustableLineItem) => dispatch({ type: 'ADD_USER_ADJUSTMENT', payload: adjustment }),
    updateUserAdjustment: (adjustment: UserAdjustableLineItem) => dispatch({ type: 'UPDATE_USER_ADJUSTMENT', payload: adjustment }),
    deleteUserAdjustment: (adjustmentId: string) => dispatch({ type: 'DELETE_USER_ADJUSTMENT', payload: adjustmentId }),
    setBudgetData: (data: BudgetData[]) => dispatch({ type: 'SET_BUDGET_DATA', payload: data }),
    clearAllData: () => dispatch({ type: 'CLEAR_ALL_DATA' }),
    saveToStorage,
    loadFromStorage,
  };

  return (
    <HealthcareContext.Provider value={{ state, actions }}>
      {children}
    </HealthcareContext.Provider>
  );
}

export function useHealthcare() {
  const context = useContext(HealthcareContext);
  if (context === undefined) {
    throw new Error('useHealthcare must be used within a HealthcareProvider');
  }
  return context;
}

// Selector hooks for specific data
export function useExperienceData() {
  const { state } = useHealthcare();
  return state.experienceData;
}

export function useHighCostClaimants() {
  const { state } = useHealthcare();
  return state.highCostClaimants;
}

export function useFeeStructures() {
  const { state } = useHealthcare();
  return state.feeStructures;
}

export function useMonthlySummaries() {
  const { state } = useHealthcare();
  return state.monthlySummaries;
}

export function useDashboardConfig() {
  const { state } = useHealthcare();
  return state.dashboardConfig;
}

export function useLoadingState() {
  const { state } = useHealthcare();
  return { loading: state.loading, error: state.error };
}

export function useFeeStructuresV2() {
  const { state } = useHealthcare();
  return state.feeStructuresV2;
}

export function useUserAdjustments() {
  const { state } = useHealthcare();
  return state.userAdjustments;
}

export function useBudgetData() {
  const { state } = useHealthcare();
  return state.budgetData;
}
