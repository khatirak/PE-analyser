import React, { useEffect, useState, useCallback } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchTotalRevenueScoreCardData } from '../../utils/api';
import { useDataContext } from '../../context/DataContext';

function TotalRevenueModal({ isOpen, onClose, revenueData: passedRevenueData }) {
  const { state, dispatch } = useDataContext();
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePeriodClick = (period) => {
    dispatch({ type: 'SET_SELECTED_TOTAL_REVENUE_PERIOD', payload: period });
    onClose();
  };

  const handleResetToCurrent = () => {
    dispatch({ type: 'SET_SELECTED_TOTAL_REVENUE_PERIOD', payload: null });
    onClose();
  };

  const loadTotalRevenueData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the new unfiltered score card data method
      const data = await fetchTotalRevenueScoreCardData(state.viewType);
      
      setRevenueData(data);
    } catch (error) {
      console.error('Error loading total revenue data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [state.viewType]);

  useEffect(() => {
    if (isOpen) {
      if (passedRevenueData) {
        // Use passed data from chart
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
                      {formatCurrency(revenueData.periods?.reduce((sum, p) => sum + (p.value || 0), 0) || 0)}
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
                        
                        const isSelected = state.selectedTotalRevenuePeriod === period.period;
                        return (
                          <tr 
                            key={index} 
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => handlePeriodClick(period.period)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {period.period || 'N/A'}
                            </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(period.value || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {period.percentage_change !== null && period.percentage_change !== undefined ? (
                                <span className={`font-medium ${
                                  period.change_direction === 'increase' 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {period.change_direction === 'increase' ? '+' : ''}
                                  {Number(period.percentage_change).toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {period.percentage_change !== null && period.percentage_change !== undefined ? (
                                <div className={`flex items-center ${
                                  period.change_direction === 'increase' 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {period.change_direction === 'increase' ? (
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {period.change_direction === 'increase' ? 'Growth' : 'Decline'}
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
            {state.selectedTotalRevenuePeriod && (
              <span className="ml-2 text-blue-600">
                • Click a row to select that period
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {state.selectedTotalRevenuePeriod && (
              <button
                onClick={handleResetToCurrent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reset to Current
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalRevenueModal; 