import React, { useEffect, useState, useCallback } from 'react';
import { X, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchSelectedMetricData, fetchSelectedMetricScoreCardData } from '../../utils/api';
import { useDataContext } from '../../context/DataContext';

function SelectedMetricModal({ isOpen, onClose, selectedMetric, metricData: passedMetricData }) {
  const { state } = useDataContext();
  const [metricData, setMetricData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSelectedMetricData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the new unfiltered score card data method
      const data = await fetchSelectedMetricScoreCardData(selectedMetric, state.viewType);
      setMetricData(data);
    } catch (error) {
      console.error('Error loading selected metric data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMetric, state.viewType]);

  useEffect(() => {
    if (isOpen && selectedMetric) {
      if (passedMetricData) {
        // Use passed data from chart
        setMetricData(passedMetricData);
        setLoading(false);
        setError(null);
      } else {
        // Fallback to API call if no passed data
        loadSelectedMetricData();
      }
    }
  }, [isOpen, selectedMetric, passedMetricData, loadSelectedMetricData]);

  const formatValue = (value, metric) => {
    // Check if the metric is currency-based
    const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
    if (currencyMetrics.some(m => metric.includes(m))) {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    // For non-currency metrics, format as number
    return new Intl.NumberFormat('en-GB').format(value);
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
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">{selectedMetric} - All Pharmacies</h2>
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
              <div className="text-gray-500">Loading {selectedMetric} data...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error loading data: {error}</div>
            </div>
          )}

          {!loading && !error && metricData && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedMetric} Summary ({getViewTypeLabel()} View)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Periods</p>
                    <p className="text-2xl font-bold text-gray-900">{metricData.periods?.length || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Current Period</p>
                    <p className="text-2xl font-bold text-blue-600">{metricData.current_period || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cumulative Total {selectedMetric}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatValue(metricData.periods?.reduce((sum, p) => sum + p.value, 0) || 0, selectedMetric)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Periods Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMetric} by {getViewTypeLabel()}
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
                          {selectedMetric}
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
                      {metricData.periods?.map((period, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {period.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(period.value, selectedMetric)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {period.percentage_change !== null ? (
                              <span className={`font-medium ${
                                period.change_direction === 'increase' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {period.change_direction === 'increase' ? '+' : ''}
                                {period.percentage_change.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {period.percentage_change !== null ? (
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
                      ))}
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
            Showing {selectedMetric} across all pharmacies for {getViewTypeLabel().toLowerCase()} view
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

export default SelectedMetricModal; 