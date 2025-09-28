'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ExperienceData, HighCostClaimant, FeeStructure, MonthlySummary, DashboardConfig } from '@/types/healthcare';
import { ClientThemeProvider } from '@/components/theme/ClientThemeProvider';

interface HealthcareState {
  experienceData: ExperienceData[];
  highCostClaimants: HighCostClaimant[];
  feeStructures: FeeStructure[];
  monthlySummaries: MonthlySummary[];
  dashboardConfig: DashboardConfig;
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
  | { type: 'SET_MONTHLY_SUMMARIES'; payload: MonthlySummary[] }
  | { type: 'UPDATE_DASHBOARD_CONFIG'; payload: Partial<DashboardConfig> }
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
  monthlySummaries: [],
  dashboardConfig: initialDashboardConfig,
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
    setMonthlySummaries: (data: MonthlySummary[]) => void;
    updateDashboardConfig: (config: Partial<DashboardConfig>) => void;
    clearAllData: () => void;
    saveToStorage: () => void;
    loadFromStorage: () => void;
  };
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

const STORAGE_KEY = 'healthcare-dashboard-data';

export function HealthcareProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(healthcareReducer, initialState);

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
  }, [dispatch]);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Save to localStorage whenever state changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [saveToStorage]);

  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setExperienceData: (data: ExperienceData[]) => dispatch({ type: 'SET_EXPERIENCE_DATA', payload: data }),
    setHighCostClaimants: (data: HighCostClaimant[]) => dispatch({ type: 'SET_HIGH_COST_CLAIMANTS', payload: data }),
    setFeeStructures: (data: FeeStructure[]) => dispatch({ type: 'SET_FEE_STRUCTURES', payload: data }),
    setMonthlySummaries: (data: MonthlySummary[]) => dispatch({ type: 'SET_MONTHLY_SUMMARIES', payload: data }),
    updateDashboardConfig: (config: Partial<DashboardConfig>) => dispatch({ type: 'UPDATE_DASHBOARD_CONFIG', payload: config }),
    clearAllData: () => dispatch({ type: 'CLEAR_ALL_DATA' }),
    saveToStorage,
    loadFromStorage,
  };

  return (
    <ClientThemeProvider>
      <HealthcareContext.Provider value={{ state, actions }}>
        {children}
      </HealthcareContext.Provider>
    </ClientThemeProvider>
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
