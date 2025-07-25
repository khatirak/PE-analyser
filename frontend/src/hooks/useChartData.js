import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDataContext } from '../context/DataContext';
import { fetchChartData } from '../utils/api';

export const useChartData = () => {
  const { state, dispatch } = useDataContext();
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Memoize the parameters to prevent unnecessary API calls
  const chartParams = useMemo(() => {
    
    console.log('🔍 Chart params check:', {
      selectedPharmacies: state.selectedPharmacies,
      selectedPharmaciesLength: state.selectedPharmacies.length,
      acquisitionDate: state.acquisitionDate,
      selectedMetric: state.selectedMetric
    });
    
    if (state.selectedPharmacies.length === 0) {
      console.log('⚠️ No selected pharmacies, returning null');
      return null;
    }

    const params = {
      view_type: state.viewType,
      pharmacies: state.selectedPharmacies,
      acquisition_date: state.acquisitionDate,
      metric: state.selectedMetric
    };

    // Add range parameters based on view type
    if (state.viewType === 'month') {
      if (state.dateRange.start) {
        params.date_range_start = state.dateRange.start;
      }
      if (state.dateRange.end) {
        params.date_range_end = state.dateRange.end;
      }
    } else if (state.viewType === 'quarter') {
      if (state.quarterRange.start) {
        params.quarter_range_start = state.quarterRange.start;
      }
      if (state.quarterRange.end) {
        params.quarter_range_end = state.quarterRange.end;
      }
    } else if (state.viewType === 'fiscal_year') {
      if (state.fiscalYearRange.start) {
        params.fiscal_year_range_start = state.fiscalYearRange.start;
      }
      if (state.fiscalYearRange.end) {
        params.fiscal_year_range_end = state.fiscalYearRange.end;
      }
    }

    return params;
  }, [
    state.selectedPharmacies, 
    state.selectedMetric,
    state.viewType, 
    state.acquisitionDate, 
    state.dateRange, 
    state.quarterRange, 
    state.fiscalYearRange
  ]);

  const loadChartData = useCallback(async (params) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching chart data with params:', params);
      const data = await fetchChartData(params);
      console.log('🔍 Chart data response:', data);
      
      dispatch({ type: 'SET_CHART_DATA', payload: data });
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!chartParams) {
      dispatch({ type: 'SET_CHART_DATA', payload: null });
      return;
    }

    // Clear any existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call by 300ms to prevent rapid successive calls
    debounceRef.current = setTimeout(() => {
      loadChartData(chartParams);
    }, 300);

    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [chartParams, loadChartData, dispatch]);

  return {
    chartData: state.chartData,
    loading
  };
}; 