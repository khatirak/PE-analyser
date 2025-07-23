import React, { useEffect, useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { fetchRevenueByPeriod } from '../../utils/api';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

function GeneralCard() {
  const { state } = useDataContext();
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRevenueData = async () => {
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
        
        console.log('Fetching revenue data with params:', params);
        const data = await fetchRevenueByPeriod(params);
        console.log('Received revenue data:', data);
        setRevenueData(data);
        
        // Set the current period as default selected
        if (data.periods && data.periods.length > 0) {
          setSelectedPeriod(data.current_period);
        }
      } catch (error) {
        console.error('Error loading revenue data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, [state.data, state.viewType]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const renderCard = (title, value, icon, percentageChange, changeDirection, subtitle) => (
    <div className="card flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Select {getViewTypeLabel()}:</label>
          <select
            value={selectedPeriod || ''}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-auto text-sm"
          >
            {revenueData?.periods?.map((period) => (
              <option key={period.period} value={period.period}>
                {period.period}
              </option>
            ))}
          </select>
        </div>
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
              {Math.abs(percentageChange)}%
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

  if (!revenueData || !revenueData.periods || revenueData.periods.length === 0) {
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

  const currentPeriodData = revenueData.periods.find(p => p.period === selectedPeriod);
  
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

  // For now, we'll use the same revenue data for both cards
  // In the future, you can fetch different metrics for the left card
  const selectedMetricValue = formatCurrency(currentPeriodData.revenue);
  const totalRevenueValue = formatCurrency(currentPeriodData.revenue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Left Card - Selected Metric */}
      {renderCard(
        "Selected Metric",
        selectedMetricValue,
        <BarChart3 className="h-6 w-6 text-blue-600" />,
        currentPeriodData.percentage_change,
        currentPeriodData.change_direction,
        selectedPeriod
      )}
      
      {/* Right Card - Total Revenue */}
      {renderCard(
        "Total Revenue",
        totalRevenueValue,
        <DollarSign className="h-6 w-6 text-green-600" />,
        currentPeriodData.percentage_change,
        currentPeriodData.change_direction,
        selectedPeriod
      )}
    </div>
  );
}

export default GeneralCard; 