import React, { useEffect, useState, useMemo } from 'react';
import { useDataContext } from '../../context/DataContext';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import TotalRevenueModal from '../common/TotalRevenueModal';
import SelectedMetricModal from '../common/SelectedMetricModal';

function GeneralCard() {
  const { state } = useDataContext();

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showTotalRevenueModal, setShowTotalRevenueModal] = useState(false);
  const [showSelectedMetricModal, setShowSelectedMetricModal] = useState(false);

  // Process chart data to create period-based data for cards
  const processedData = useMemo(() => {
    if (!state.chartData || !state.chartData.labels || !state.chartData.datasets) {
      console.log('No chart data available for processing');
      return null;
    }

    console.log('🔍 Processing chart data for cards:', {
      labels: state.chartData.labels,
      datasets: state.chartData.datasets.length,
      selectedMetric: state.selectedMetric
    });

    const periods = state.chartData.labels.map((label, index) => {
      // Calculate total revenue for this period (sum of all datasets)
      const totalRevenue = state.chartData.datasets.reduce((sum, dataset) => {
        return sum + (dataset.data[index] || 0);
      }, 0);

      // Calculate selected metric value for this period
      let selectedMetricValue = 0;
      if (state.selectedMetric) {
        // Find the dataset that matches the selected metric
        const metricDataset = state.chartData.datasets.find(dataset => 
          dataset.label === state.selectedMetric
        );
        selectedMetricValue = metricDataset ? (metricDataset.data[index] || 0) : 0;
      }

      // Calculate percentage change for total revenue (right card)
      let totalRevenuePercentageChange = null;
      let totalRevenueChangeDirection = null;
      
      if (index > 0) {
        const previousTotalRevenue = state.chartData.datasets.reduce((sum, dataset) => {
          return sum + (dataset.data[index - 1] || 0);
        }, 0);
        
        if (previousTotalRevenue > 0) {
          totalRevenuePercentageChange = ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100;
          totalRevenueChangeDirection = totalRevenuePercentageChange >= 0 ? 'increase' : 'decrease';
        }
      }

      // Calculate percentage change for selected metric (left card)
      let selectedMetricPercentageChange = null;
      let selectedMetricChangeDirection = null;
      
      if (index > 0 && state.selectedMetric) {
        const metricDataset = state.chartData.datasets.find(dataset => 
          dataset.label === state.selectedMetric
        );
        if (metricDataset) {
          const previousMetricValue = metricDataset.data[index - 1] || 0;
          const currentMetricValue = metricDataset.data[index] || 0;
          
          if (previousMetricValue > 0) {
            selectedMetricPercentageChange = ((currentMetricValue - previousMetricValue) / previousMetricValue) * 100;
            selectedMetricChangeDirection = selectedMetricPercentageChange >= 0 ? 'increase' : 'decrease';
          }
        }
      }

      return {
        period: label,
        revenue: totalRevenue,
        selectedMetricValue: selectedMetricValue,
        totalRevenuePercentageChange: totalRevenuePercentageChange,
        totalRevenueChangeDirection: totalRevenueChangeDirection,
        selectedMetricPercentageChange: selectedMetricPercentageChange,
        selectedMetricChangeDirection: selectedMetricChangeDirection
      };
    });

    // Find current period (last period with data)
    const currentPeriod = periods.length > 0 ? periods[periods.length - 1].period : null;

    return {
      periods,
      current_period: currentPeriod,
      total_revenue: periods.reduce((sum, p) => sum + p.revenue, 0)
    };
  }, [state.chartData, state.selectedMetric]);

  // Set default selected period when data changes
  useEffect(() => {
    if (processedData && processedData.current_period && !selectedPeriod) {
      setSelectedPeriod(processedData.current_period);
    }
  }, [processedData, selectedPeriod]);

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
              {processedData?.periods?.map((period) => (
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

  if (!state.chartData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No chart data available</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No chart data available</div>
          </div>
        </div>
      </div>
    );
  }

  if (!processedData || !processedData.periods || processedData.periods.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-gray-500 mb-1">No chart data available</div>
              <div className="text-sm text-gray-400">Select pharmacies and metrics to see data</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-gray-500 mb-1">No chart data available</div>
              <div className="text-sm text-gray-400">Select pharmacies and metrics to see data</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPeriodData = processedData.periods.find(p => p.period === selectedPeriod);
  
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

  // For the left card, use the selected metric value
  const selectedMetricValue = formatValue(currentPeriodData.selectedMetricValue, state.selectedMetric);
  
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
          currentPeriodData.selectedMetricPercentageChange,
          currentPeriodData.selectedMetricChangeDirection,
          "Click to view all periods",
          () => setShowSelectedMetricModal(true)
        )}
        
        {/* Right Card - Total Revenue (Clickable) */}
        {renderCard(
          "Total Revenue",
          totalRevenueValue,
          <DollarSign className="h-6 w-6 text-green-600" />,
          currentPeriodData.totalRevenuePercentageChange,
          currentPeriodData.totalRevenueChangeDirection,
          "Click to view all periods",
          () => setShowTotalRevenueModal(true)
        )}
      </div>

      {/* Total Revenue Modal */}
      <TotalRevenueModal 
        isOpen={showTotalRevenueModal}
        onClose={() => setShowTotalRevenueModal(false)}
        revenueData={processedData}
      />

      {/* Selected Metric Modal */}
      <SelectedMetricModal 
        isOpen={showSelectedMetricModal}
        onClose={() => setShowSelectedMetricModal(false)}
        selectedMetric={state.selectedMetric || 'Total Revenue'}
        metricData={processedData}
      />
    </>
  );
}

export default GeneralCard; 