import { useEffect, useState } from 'react';
import { useDataContext } from '../context/DataContext';
import { fetchChartData } from '../utils/api';

export const useChartData = () => {
  const { state, dispatch } = useDataContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.selectedPharmacies.length === 0) {
      dispatch({ type: 'SET_CHART_DATA', payload: null });
      return;
    }

    const loadChartData = async () => {
      setLoading(true);
      try {
        const params = {
          view_type: state.viewType,
          'pharmacies[]': state.selectedPharmacies,
          acquisition_filter: state.acquisitionFilter
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

        const data = await fetchChartData(params);
        dispatch({ type: 'SET_CHART_DATA', payload: data });
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [
    state.selectedPharmacies, 
    state.viewType, 
    state.acquisitionFilter, 
    state.dateRange, 
    state.quarterRange, 
    state.fiscalYearRange,
    dispatch
  ]);

  return {
    chartData: state.chartData,
    loading
  };
}; 