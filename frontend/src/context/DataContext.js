import React, { createContext, useContext, useReducer } from 'react';

const DataContext = createContext();

const initialState = {
  data: null,
  stats: null,
  pharmacies: [],
  selectedPharmacies: [],
  viewType: 'month',
  acquisitionFilter: false,
  dateRange: { start: '', end: '' },
  quarterRange: { start: '', end: '' },
  fiscalYearRange: { start: '', end: '' },
  chartData: null,
  loading: false,
  error: null
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_PHARMACIES':
      return { ...state, pharmacies: action.payload };
    case 'SET_SELECTED_PHARMACIES':
      return { ...state, selectedPharmacies: action.payload };
    case 'SET_VIEW_TYPE':
      return { ...state, viewType: action.payload };
    case 'SET_ACQUISITION_FILTER':
      return { ...state, acquisitionFilter: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_QUARTER_RANGE':
      return { ...state, quarterRange: action.payload };
    case 'SET_FISCAL_YEAR_RANGE':
      return { ...state, fiscalYearRange: action.payload };
    case 'SET_CHART_DATA':
      return { ...state, chartData: action.payload };
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