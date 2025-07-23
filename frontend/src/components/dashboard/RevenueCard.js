import React, { useEffect, useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { fetchRevenueByPeriod } from '../../utils/api';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

function RevenueCard() {
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

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading revenue data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">Error loading revenue data: {error}</div>
        </div>
      </div>
    );
  }

  if (!state.data) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  if (!revenueData || !revenueData.periods || revenueData.periods.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">No revenue periods available</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const currentPeriodData = revenueData.periods.find(p => p.period === selectedPeriod);
  
  if (!currentPeriodData) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">No data for selected period</div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Select {getViewTypeLabel()}:</label>
          <select
            value={selectedPeriod || ''}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-auto text-sm"
          >
            {revenueData.periods.map((period) => (
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
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentPeriodData.revenue)}
            </p>
            <p className="text-sm text-gray-600">{selectedPeriod}</p>
          </div>
        </div>

        {currentPeriodData.percentage_change !== null && (
          <div className="text-right">
            <div className={`flex items-center text-sm font-medium ${
              currentPeriodData.change_direction === 'increase' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {currentPeriodData.change_direction === 'increase' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(currentPeriodData.percentage_change)}%
            </div>
            <p className="text-xs text-gray-500">
              vs previous {getViewTypeLabel().toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevenueCard; 