import React, { useState, useEffect, useRef } from 'react';
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
import { ChevronDown, Calendar, BarChart3, Eye, EyeOff } from 'lucide-react';
import { useDataContext } from '../../context/DataContext';
import { useChartData } from '../../hooks/useChartData';

function GeneralChart() {
  const { state, dispatch } = useDataContext();
  const { chartData, loading } = useChartData();
  
  const [selectedMetric, setSelectedMetric] = useState('');
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const [showTotalLine, setShowTotalLine] = useState(true);
  const [currentDate] = useState(new Date());
  const dropdownRef = useRef(null);

  // Set default metric if none selected and metrics are available
  useEffect(() => {
    if (!selectedMetric && state.metrics.length > 0) {
      const defaultMetric = state.metrics[0].name;
      setSelectedMetric(defaultMetric);
      dispatch({ type: 'SET_SELECTED_METRIC', payload: defaultMetric });
    }
  }, [state.metrics, selectedMetric, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMetricDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No data available for the selected filters</div>
      </div>
    );
  }

  // Transform data for Recharts
  const transformedData = chartData.labels.map((label, index) => {
    const dataPoint = { name: label };
    let totalValue = 0;
    chartData.datasets.forEach(dataset => {
      const value = dataset.data[index] || 0;
      dataPoint[dataset.label] = value;
      totalValue += value;
    });
    dataPoint.totalValue = totalValue;
    return dataPoint;
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const formatValue = (value) => {
    // Check if the metric is currency-based
    const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
    if (currencyMetrics.some(metric => selectedMetric.includes(metric))) {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    // For non-currency metrics, format as number
    return new Intl.NumberFormat('en-GB').format(value);
  };

  // Function to format date labels based on view type
  const formatDateLabel = (label) => {
    if (state.viewType === 'month') {
      return label;
    } else if (state.viewType === 'quarter') {
      return label;
    } else if (state.viewType === 'fiscal_year') {
      return label;
    }
    return label;
  };

  // Calculate y-axis domain with appropriate increments
  const calculateYAxisDomain = () => {
    if (transformedData.length === 0) return [0, 1000000];
    
    const maxValue = Math.max(...transformedData.map(item => item.totalValue));
    const minValue = Math.min(...transformedData.map(item => item.totalValue));
    
    // For currency metrics, use 250,000 increments, otherwise use appropriate scaling
    const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
    const isCurrency = currencyMetrics.some(metric => selectedMetric.includes(metric));
    
    if (isCurrency) {
      const maxDomain = Math.ceil(maxValue / 250000) * 250000;
      const minDomain = Math.floor(minValue / 250000) * 250000;
      if (maxDomain === minDomain) {
        return [0, maxDomain + 250000];
      }
      return [minDomain, maxDomain];
    } else {
      // For non-currency metrics, use 10% increments
      const range = maxValue - minValue;
      const increment = Math.max(1, Math.ceil(range / 10));
      const maxDomain = Math.ceil(maxValue / increment) * increment;
      const minDomain = Math.floor(minValue / increment) * increment;
      if (maxDomain === minDomain) {
        return [0, maxDomain + increment];
      }
      return [minDomain, maxDomain];
    }
  };

  const [yMin, yMax] = calculateYAxisDomain();

  // Generate y-axis ticks
  const generateYTicks = () => {
    const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
    const isCurrency = currencyMetrics.some(metric => selectedMetric.includes(metric));
    
    if (isCurrency) {
      const ticks = [];
      for (let i = yMin; i <= yMax; i += 250000) {
        ticks.push(i);
      }
      return ticks;
    } else {
      const range = yMax - yMin;
      const increment = Math.max(1, Math.ceil(range / 10));
      const ticks = [];
      for (let i = yMin; i <= yMax; i += increment) {
        ticks.push(i);
      }
      return ticks;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDateLabel(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
          {payload.length > 1 && showTotalLine && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-800">
                Total: {formatValue(payload[0].payload.totalValue)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
    setShowMetricDropdown(false);
    // Update the context to trigger chart data refresh
    dispatch({ type: 'SET_SELECTED_METRIC', payload: metric });
  };



  return (
    <div className="w-full">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Metric Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMetricDropdown(!showMetricDropdown)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {selectedMetric || 'Select Metric'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
          
          {showMetricDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {state.metrics.map((metric, index) => (
                <button
                  key={index}
                  onClick={() => handleMetricChange(metric.name)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                >
                  {metric.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Total Line Toggle */}
        <button
          onClick={() => setShowTotalLine(!showTotalLine)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showTotalLine 
              ? 'bg-gray-800 text-white border-gray-800' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {showTotalLine ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {showTotalLine ? 'Hide Total' : 'Show Total'}
          </span>
        </button>


      </div>

      {/* Chart */}
      <div className="w-full h-[600px]" key={`${state.dateRange.start}-${state.dateRange.end}-${state.viewType}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={transformedData} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
              tickMargin={10}
              tickFormatter={formatDateLabel}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={formatValue}
              tickMargin={10}
              width={80}
              domain={[yMin, yMax]}
              ticks={generateYTicks()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Individual pharmacy lines */}
            {chartData.datasets.map((dataset, index) => (
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
            
            {/* Total line (only if toggle is on) */}
            {showTotalLine && (
              <Line
                type="monotone"
                dataKey="totalValue"
                stroke="#1F2937"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: "#1F2937", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#1F2937", strokeWidth: 2 }}
                name="Total"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default GeneralChart; 