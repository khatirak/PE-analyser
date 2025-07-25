import React, { useEffect, useState, useMemo } from 'react';
import { useDataContext } from '../../context/DataContext';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import TotalRevenueModal from '../common/TotalRevenueModal';
import SelectedMetricModal from '../common/SelectedMetricModal';
import { fetchTotalRevenueScoreCardData, fetchSelectedMetricScoreCardData } from '../../utils/api';

function GeneralCard({ viewType }) {
  const { state } = useDataContext();

  const [showTotalRevenueModal, setShowTotalRevenueModal] = useState(false);
  const [showSelectedMetricModal, setShowSelectedMetricModal] = useState(false);
  const [totalRevenueData, setTotalRevenueData] = useState(null);
  const [selectedMetricData, setSelectedMetricData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch score card data when view type or selected metric changes
  useEffect(() => {
    const fetchScoreCardData = async () => {
      if (!state.data) return; // No data loaded yet
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching score card data for view type:', viewType);
        
        // Fetch total revenue data (unfiltered, only view type)
        const totalRevenueResponse = await fetchTotalRevenueScoreCardData(viewType);
        
        setTotalRevenueData(totalRevenueResponse);
        
        // Fetch selected metric data (unfiltered, only view type)
        if (state.selectedMetric) {
          const selectedMetricResponse = await fetchSelectedMetricScoreCardData(state.selectedMetric, viewType);
          setSelectedMetricData(selectedMetricResponse);
        }
      } catch (error) {
        console.error('❌ Error fetching score card data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreCardData();
  }, [viewType, state.selectedMetric, state.data]);

  // Process total revenue data for display
  const totalRevenueCardData = useMemo(() => {
    if (!totalRevenueData || !totalRevenueData.periods) {
      console.log('❌ No total revenue data available for processing');
      return null;
    }

    // The backend already provides the processed data, just use it directly
    return totalRevenueData;
  }, [totalRevenueData]);

  // Process selected metric data for display
  const selectedMetricCardData = useMemo(() => {
    if (!selectedMetricData || !selectedMetricData.periods) {
      return null;
    }

    // The backend already provides the processed data, just use it directly
    return selectedMetricData;
  }, [selectedMetricData]);

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
    switch (viewType) {
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

  const renderCard = (title, value, icon, percentageChange, changeDirection, subtitle, onClick = null, isLoading = false) => (
    <div 
      className={`card flex-1 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-blue-50">
            {icon}
          </div>
          <div className="ml-4">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {value}
                </p>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </>
            )}
          </div>
        </div>

        {!isLoading && percentageChange !== null && (
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

  if (!state.data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Upload a CSV file to get started</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Upload a CSV file to get started</div>
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
            <div className="text-center">
              <div className="text-red-500 mb-1">Error loading data</div>
              <div className="text-sm text-gray-400">{error}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-red-500 mb-1">Error loading data</div>
              <div className="text-sm text-gray-400">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the data for the selected periods (or current period if none selected)
  const getTotalRevenueData = () => {
    if (!totalRevenueCardData?.periods?.length) return null;
    
    if (state.selectedTotalRevenuePeriod) {
      // Find the selected period
      return totalRevenueCardData.periods.find(p => p.period === state.selectedTotalRevenuePeriod) || 
             totalRevenueCardData.periods[totalRevenueCardData.periods.length - 1];
    }
    
    // Default to current period (last in the array)
    return totalRevenueCardData.periods[totalRevenueCardData.periods.length - 1];
  };
  
  const getSelectedMetricData = () => {
    if (!selectedMetricCardData?.periods?.length) return null;
    
    if (state.selectedMetricPeriod) {
      // Find the selected period
      return selectedMetricCardData.periods.find(p => p.period === state.selectedMetricPeriod) || 
             selectedMetricCardData.periods[selectedMetricCardData.periods.length - 1];
    }
    
    // Default to current period (last in the array)
    return selectedMetricCardData.periods[selectedMetricCardData.periods.length - 1];
  };

  const currentTotalRevenueData = getTotalRevenueData();
  const currentSelectedMetricData = getSelectedMetricData();

  // Format values for display
  const totalRevenueValue = currentTotalRevenueData 
    ? formatCurrency(currentTotalRevenueData.value)
    : '£0.00';
    
  const selectedMetricValue = currentSelectedMetricData 
    ? formatValue(currentSelectedMetricData.value, state.selectedMetric || 'Metric')
    : '0';

  // Create subtitles showing the selected period
  const getTotalRevenueSubtitle = () => {
    if (currentTotalRevenueData) {
      const period = state.selectedTotalRevenuePeriod || currentTotalRevenueData.period;
      return `Click to view all periods (${period})`;
    }
    return 'Click to view all periods';
  };

  const getSelectedMetricSubtitle = () => {
    if (currentSelectedMetricData) {
      const period = state.selectedMetricPeriod || currentSelectedMetricData.period;
      return `Click to view all periods (${period})`;
    }
    return 'Click to view all periods';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Card - Selected Metric (Clickable) */}
        {renderCard(
          state.selectedMetric || "Selected Metric",
          selectedMetricValue,
          <BarChart3 className="h-6 w-6 text-blue-600" />,
          currentSelectedMetricData?.percentage_change,
          currentSelectedMetricData?.change_direction,
          getSelectedMetricSubtitle(),
          () => setShowSelectedMetricModal(true),
          loading
        )}
        
        {/* Right Card - Total Revenue (Clickable) */}
        {renderCard(
          "Total Revenue",
          totalRevenueValue,
          <DollarSign className="h-6 w-6 text-green-600" />,
          currentTotalRevenueData?.percentage_change,
          currentTotalRevenueData?.change_direction,
          getTotalRevenueSubtitle(),
          () => setShowTotalRevenueModal(true),
          loading
        )}
      </div>

      {/* Total Revenue Modal */}
      <TotalRevenueModal 
        isOpen={showTotalRevenueModal}
        onClose={() => setShowTotalRevenueModal(false)}
        revenueData={totalRevenueCardData}
      />

      {/* Selected Metric Modal */}
      <SelectedMetricModal 
        isOpen={showSelectedMetricModal}
        onClose={() => setShowSelectedMetricModal(false)}
        selectedMetric={state.selectedMetric || 'Total Revenue'}
        metricData={selectedMetricCardData}
      />
    </>
  );
}

export default GeneralCard; 