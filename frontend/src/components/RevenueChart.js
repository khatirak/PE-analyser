import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useDataContext } from '../context/DataContext';
import { fetchChartData } from '../utils/api';

function RevenueChart() {
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
          pharmacies: state.selectedPharmacies.join(','),
          acquisition_filter: state.acquisitionFilter
        };

        // Add range parameters based on view type
        if (state.viewType === 'month') {
          if (state.dateRange.start && state.dateRange.end) {
            params.date_range_start = state.dateRange.start;
            params.date_range_end = state.dateRange.end;
          }
        } else if (state.viewType === 'quarter') {
          // Send quarter range parameters if either start or end is set (not empty)
          if (state.quarterRange.start || state.quarterRange.end) {
            params.quarter_range_start = state.quarterRange.start || '';
            params.quarter_range_end = state.quarterRange.end || '';
          }
        } else if (state.viewType === 'fiscal_year') {
          if (state.fiscalYearRange.start && state.fiscalYearRange.end) {
            params.fiscal_year_range_start = state.fiscalYearRange.start;
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
  }, [state.selectedPharmacies, state.viewType, state.acquisitionFilter, state.dateRange, state.quarterRange, state.fiscalYearRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (!state.chartData || !state.chartData.labels || state.chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available for the selected filters</div>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = state.chartData.labels.map((label, index) => {
    const dataPoint = { name: label };
    state.chartData.datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[index] || 0;
    });
    return dataPoint;
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {state.chartData.datasets.map((dataset, index) => (
            <Line
              key={dataset.label}
              type="monotone"
              dataKey={dataset.label}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart; 