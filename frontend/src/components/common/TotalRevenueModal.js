import React, { useEffect, useState, useCallback } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchTotalRevenueData } from '../../utils/api';
import { useDataContext } from '../../context/DataContext';

function TotalRevenueModal({ isOpen, onClose, revenueData: passedRevenueData }) {
  const { state } = useDataContext();
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTotalRevenueData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        view_type: state.viewType
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
      
      console.log('🔍 Loading total revenue data with params:', params);
      const data = await fetchTotalRevenueData(params);
      console.log('✅ Total revenue data loaded:', data);
      console.log('📊 Revenue data structure check:', {
        hasData: !!data,
        hasPeriods: !!data?.periods,
        periodsLength: data?.periods?.length,
        currentPeriod: data?.current_period,
        samplePeriod: data?.periods?.[0]
      });
      setRevenueData(data);
    } catch (error) {
      console.error('Error loading total revenue data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [state.viewType, state.dateRange, state.quarterRange, state.fiscalYearRange]);

  useEffect(() => {
    if (isOpen) {
      if (passedRevenueData) {
        // Use passed data from chart
        console.log('📊 Using passed revenue data from chart:', passedRevenueData);
        setRevenueData(passedRevenueData);
        setLoading(false);
        setError(null);
      } else {
        // Fallback to API call if no passed data
        loadTotalRevenueData();
      }
    }
  }, [isOpen, passedRevenueData, loadTotalRevenueData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getViewTypeLabel = () => {
    switch (state.viewType) {
      case 'month':
        return 'Month';
      case 'quarter':
        return 'Quarter';
      case 'fiscal_year':
        return 'Fiscal Year';
      default:
        return 'Period';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Total Revenue - All Pharmacies</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading total revenue data...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error loading data: {error}</div>
            </div>
          )}

          {!loading && !error && revenueData && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Revenue Summary ({getViewTypeLabel()} View)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Periods</p>
                    <p className="text-2xl font-bold text-gray-900">{revenueData.periods?.length || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Current Period</p>
                    <p className="text-2xl font-bold text-green-600">{revenueData.current_period || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cumulative Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(revenueData.periods?.reduce((sum, p) => sum + (p.revenue || 0), 0) || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Periods Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Revenue by {getViewTypeLabel()}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {getViewTypeLabel()}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change from Previous
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData.periods?.map((period, index) => {
                        // Safety check for period data
                        if (!period) {
                          console.warn('⚠️ Invalid period data:', period);
                          return null;
                        }
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {period.period || 'N/A'}
                            </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(period.revenue || 0)}
                            </td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {period.totalRevenuePercentageChange !== null && period.totalRevenuePercentageChange !== undefined ? (
                              <span className={`font-medium ${
                                period.totalRevenueChangeDirection === 'increase'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {period.totalRevenueChangeDirection === 'increase' ? '+' : ''}
                                {Number(period.totalRevenuePercentageChange).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {period.totalRevenuePercentageChange !== null && period.totalRevenuePercentageChange !== undefined ? (
                                <div className={`flex items-center ${
                                  period.totalRevenueChangeDirection === 'increase' 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {period.totalRevenueChangeDirection === 'increase' ? (
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {period.totalRevenueChangeDirection === 'increase' ? 'Growth' : 'Decline'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No change</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing total revenue across all pharmacies for {getViewTypeLabel().toLowerCase()} view
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TotalRevenueModal; 