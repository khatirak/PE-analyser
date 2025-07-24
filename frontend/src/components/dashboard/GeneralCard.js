import React, { useEffect, useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { fetchRevenueByPeriod, fetchTotalRevenueData, fetchSelectedMetricData } from '../../utils/api';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import TotalRevenueModal from '../common/TotalRevenueModal';
import SelectedMetricModal from '../common/SelectedMetricModal';

function GeneralCard() {
  const { state } = useDataContext();
  const [revenueData, setRevenueData] = useState(null);
  const [totalRevenueData, setTotalRevenueData] = useState(null);
  const [selectedMetricData, setSelectedMetricData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [error, setError] = useState(null);
  const [showTotalRevenueModal, setShowTotalRevenueModal] = useState(false);
  const [showSelectedMetricModal, setShowSelectedMetricModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!state.data) {
        console.log('No state.data available');
        return;
      }
      
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
        
        console.log('Fetching data with params:', params);
        
        // Fetch data for selected metric, total revenue, and regular revenue data
        const [revenueResult, totalRevenueResult, selectedMetricResult] = await Promise.all([
          fetchRevenueByPeriod(params),
          fetchTotalRevenueData(params),
          fetchSelectedMetricData({ ...params, metric: state.selectedMetric || 'Total Revenue' })
        ]);
        
        console.log('Received revenue data:', revenueResult);
        console.log('Received total revenue data:', totalRevenueResult);
        console.log('Received selected metric data:', selectedMetricResult);
        
        setRevenueData(revenueResult);
        setTotalRevenueData(totalRevenueResult);
        setSelectedMetricData(selectedMetricResult);
        
        // Set the current period as default selected
        if (totalRevenueResult.periods && totalRevenueResult.periods.length > 0) {
          setSelectedPeriod(totalRevenueResult.current_period);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [state.data, state.viewType, state.dateRange, state.quarterRange, state.fiscalYearRange, state.selectedMetric]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatValue = (value, metric) => {
    // Check if the metric is currency-based
    const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
    if (currencyMetrics.some(m => metric.includes(m))) {
      return formatCurrency(value);
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

  const renderCard = (title, value, icon, percentageChange, changeDirection, subtitle, onClick = null) => (
    <div 
      className={`card flex-1 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {!onClick && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Select {getViewTypeLabel()}:</label>
            <select
              value={selectedPeriod || ''}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field w-auto text-sm"
            >
              {totalRevenueData?.periods?.map((period) => (
                <option key={period.period} value={period.period}>
                  {period.period}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-blue-50">
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {value}
            </p>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>

        {percentageChange !== null && (
          <div className="text-right">
            <div className={`flex items-center text-sm font-medium ${
              changeDirection === 'increase' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {changeDirection === 'increase' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(percentageChange).toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500">
              vs previous {getViewTypeLabel().toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading data...</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Error loading data: {error}</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Error loading data: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No data available</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No data available</div>
          </div>
        </div>
      </div>
    );
  }

  if (!totalRevenueData || !totalRevenueData.periods || totalRevenueData.periods.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No periods available</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No periods available</div>
          </div>
        </div>
      </div>
    );
  }

  const currentPeriodData = totalRevenueData.periods.find(p => p.period === selectedPeriod);
  const selectedMetricPeriodData = selectedMetricData?.periods?.find(p => p.period === selectedPeriod);
  
  if (!currentPeriodData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No data for selected period</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No data for selected period</div>
          </div>
        </div>
      </div>
    );
  }

  // For the left card, use the selected metric data
  const selectedMetricValue = selectedMetricPeriodData 
    ? formatValue(selectedMetricPeriodData.revenue, state.selectedMetric)
    : formatValue(0, state.selectedMetric);
  
  // For the right card, always show total revenue for the current period
  const totalRevenueValue = formatCurrency(currentPeriodData.revenue);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Card - Selected Metric (Clickable) */}
        {renderCard(
          state.selectedMetric || "Selected Metric",
          selectedMetricValue,
          <BarChart3 className="h-6 w-6 text-blue-600" />,
          selectedMetricPeriodData?.percentage_change,
          selectedMetricPeriodData?.change_direction,
          "Click to view all periods",
          () => setShowSelectedMetricModal(true)
        )}
        
        {/* Right Card - Total Revenue (Clickable) */}
        {renderCard(
          "Total Revenue",
          totalRevenueValue,
          <DollarSign className="h-6 w-6 text-green-600" />,
          currentPeriodData.percentage_change,
          currentPeriodData.change_direction,
          "Click to view all periods",
          () => setShowTotalRevenueModal(true)
        )}
      </div>

      {/* Total Revenue Modal */}
      <TotalRevenueModal 
        isOpen={showTotalRevenueModal}
        onClose={() => setShowTotalRevenueModal(false)}
      />

      {/* Selected Metric Modal */}
      <SelectedMetricModal 
        isOpen={showSelectedMetricModal}
        onClose={() => setShowSelectedMetricModal(false)}
        selectedMetric={state.selectedMetric || 'Total Revenue'}
      />
    </>
  );
}

export default GeneralCard; 