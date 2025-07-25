import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchStats, fetchPharmacies, fetchClusters, fetchMetrics, testFetchConnection } from '../utils/api';

const DataContext = createContext();

const initialState = {
  data: null,
  stats: null,
  pharmacies: [],
  clusters: [],
  metrics: [],
  selectedPharmacies: [],
  selectedMetric: '',
  viewType: 'month',
  acquisitionDate: '',
  dateRange: { start: '', end: '' },
  quarterRange: { start: '', end: '' },
  fiscalYearRange: { start: '', end: '' },
  chartData: null,
  loading: false,
  error: null,
  pharmacySelectionMode: 'pharmacies', // 'pharmacies' or 'clusters'
  selectedTotalRevenuePeriod: null, // Track selected period for Total Revenue card
  selectedMetricPeriod: null // Track selected period for Selected Metric card
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_PHARMACIES':
      return { ...state, pharmacies: action.payload };
    case 'SET_CLUSTERS':
      return { ...state, clusters: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_SELECTED_PHARMACIES':
      return { ...state, selectedPharmacies: action.payload };
    case 'SET_SELECTED_METRIC':
      return { ...state, selectedMetric: action.payload };
    case 'SET_VIEW_TYPE':
      return { ...state, viewType: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_QUARTER_RANGE':
      return { ...state, quarterRange: action.payload };
    case 'SET_FISCAL_YEAR_RANGE':
      return { ...state, fiscalYearRange: action.payload };
    case 'SET_ACQUISITION_DATE':
      return { ...state, acquisitionDate: action.payload };
    case 'SET_CHART_DATA':
      return { ...state, chartData: action.payload };
    case 'SET_PHARMACY_SELECTION_MODE':
      return { ...state, pharmacySelectionMode: action.payload };
    case 'SET_SELECTED_TOTAL_REVENUE_PERIOD':
      return { ...state, selectedTotalRevenuePeriod: action.payload };
    case 'SET_SELECTED_METRIC_PERIOD':
      return { ...state, selectedMetricPeriod: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load initial data when the app starts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        // Wait a moment for backend to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const fetchWorks = await testFetchConnection();
          if (!fetchWorks) {
            console.error('Fetch test failed - there may be a CORS or network issue');
          } else {
            console.log('✅ Fetch test successful');
          }
        } catch (error) {
          console.error('❌ Fetch test error:', error);
        }
        
        // Load stats directly without connection test
        const stats = await fetchStats();
        dispatch({ type: 'SET_STATS', payload: stats });
        
        // Load pharmacies
        let pharmacies = null;
        try {
          pharmacies = await fetchPharmacies();
          dispatch({ type: 'SET_PHARMACIES', payload: pharmacies });
        } catch (error) {
          console.error('❌ Error loading pharmacies:', error);
          throw error;
        }

        let clusters = null;
        try {
          clusters = await fetchClusters();
          dispatch({ type: 'SET_CLUSTERS', payload: clusters });
        } catch (error) {
          console.error('❌ Error loading clusters:', error);
          throw error;
        }
        
        // Load metrics
        let metrics = null;
        try {
          metrics = await fetchMetrics();
          dispatch({ type: 'SET_METRICS', payload: metrics });
        } catch (error) {
          console.error('❌ Error loading metrics:', error);
          throw error;
        }

        if (pharmacies && Array.isArray(pharmacies) && pharmacies.length > 0) {
          const pharmacyNames = pharmacies.map(p => p.name);
          dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: pharmacyNames });
        }
        
        // Set data flag to indicate data is available
        dispatch({ type: 'SET_DATA', payload: { loaded: true } });
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        const errorMessage = error.message || 'Failed to load data. Please try refreshing the page.';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  // Monitor selectedPharmacies changes
  useEffect(() => {}, [state.selectedPharmacies]);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
} 