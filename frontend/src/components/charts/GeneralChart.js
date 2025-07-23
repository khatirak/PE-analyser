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
import RangeSelector from '../filters/RangeSelector';

function GeneralChart() {
  const { state, dispatch } = useDataContext();
  const { chartData, loading } = useChartData();
  
  const [selectedMetric, setSelectedMetric] = useState('');
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const [showTotalLine, setShowTotalLine] = useState(true);
  const [showCombinedTotal, setShowCombinedTotal] = useState(false);
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

  // Set default ranges if not set
  useEffect(() => {
    const currentDate = new Date();
    
    // Set default date range if not set
    if (!state.dateRange.start || !state.dateRange.end) {
      console.log('Setting default date range in GeneralChart...');
      const startDate = new Date('2024-04-01');
      
      const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
      const startYear = startDate.getFullYear().toString().slice(-2);
      const startValue = `${startMonth}-${startYear}`;
      
      // Set end date to current month - 1
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const endMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const endYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const endDate = new Date(endYear, endMonth, 1);
      const endMonthStr = endDate.toLocaleDateString('en-US', { month: 'short' });
      const endYearStr = endDate.getFullYear().toString().slice(-2);
      const endValue = `${endMonthStr}-${endYearStr}`;
      
      console.log('Setting default date range:', { start: startValue, end: endValue });
      dispatch({ type: 'SET_DATE_RANGE', payload: { start: startValue, end: endValue } });
    }
    
    // Set default quarter range if not set
    if (!state.quarterRange.start || !state.quarterRange.end) {
      console.log('Setting default quarter range in GeneralChart...');
      const startQuarter = '2024 Q1';
      const currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
      const month = currentDate.getMonth() + 1;
      const currentQ = month >= 4 && month <= 6 ? 'Q1' : 
                      month >= 7 && month <= 9 ? 'Q2' : 
                      month >= 10 && month <= 12 ? 'Q3' : 'Q4';
      
      // Calculate one quarter before current
      let defaultQ, defaultFY;
      if (currentQ === 'Q1') {
        defaultQ = 'Q4';
        defaultFY = currentFY - 1;
      } else {
        const qNum = parseInt(currentQ.replace('Q', ''));
        defaultQ = 'Q' + (qNum - 1);
        defaultFY = currentFY;
      }
      const endQuarter = `${defaultFY} ${defaultQ}`;
      
      console.log('Setting default quarter range:', { start: startQuarter, end: endQuarter });
      dispatch({ type: 'SET_QUARTER_RANGE', payload: { start: startQuarter, end: endQuarter } });
    }
    
    // Set default fiscal year range if not set
    if (!state.fiscalYearRange.start || !state.fiscalYearRange.end) {
      console.log('Setting default fiscal year range in GeneralChart...');
      const startFY = '2024';
      const currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
      
      console.log('Setting default fiscal year range:', { start: startFY, end: currentFY.toString() });
      dispatch({ type: 'SET_FISCAL_YEAR_RANGE', payload: { start: startFY, end: currentFY.toString() } });
    }
  }, [state.dateRange.start, state.dateRange.end, state.quarterRange.start, state.quarterRange.end, state.fiscalYearRange.start, state.fiscalYearRange.end, dispatch]);

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

  // Helper function to get selected clusters
  const getSelectedClusters = () => {
    if (state.pharmacySelectionMode !== 'clusters') return [];
    
    return state.clusters.filter(cluster => {
      const clusterPharmacyNames = cluster.pharmacies.map(p => p.name);
      const selectedInCluster = clusterPharmacyNames.filter(name => 
        state.selectedPharmacies.includes(name)
      );
      return selectedInCluster.length > 0;
    });
  };

  // Helper function to get individual cluster totals
  const getClusterTotals = () => {
    const selectedClusters = getSelectedClusters();
    if (selectedClusters.length === 0) return null;

    return chartData.labels.map((label, index) => {
      const dataPoint = { name: label };
      let combinedTotal = 0;
      
      selectedClusters.forEach(cluster => {
        let clusterTotal = 0;
        cluster.pharmacies.forEach(pharmacy => {
          const dataset = chartData.datasets.find(d => d.label === pharmacy.name);
          if (dataset) {
            clusterTotal += dataset.data[index] || 0;
          }
        });
        dataPoint[`cluster_${cluster.name}`] = clusterTotal;
        combinedTotal += clusterTotal;
      });
      
      // Add combined total
      dataPoint.total = combinedTotal;
      
      return dataPoint;
    });
  };

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

  // Create total-only data when showTotalLine is false
  const totalOnlyData = chartData.labels.map((label, index) => {
    let totalValue = 0;
    chartData.datasets.forEach(dataset => {
      const value = dataset.data[index] || 0;
      totalValue += value;
    });
    return { name: label, total: totalValue };
  });

  // Get the appropriate total data based on selection mode
  const getTotalData = () => {
    if (state.pharmacySelectionMode === 'clusters') {
      const clusterTotals = getClusterTotals();
      return clusterTotals || totalOnlyData;
    }
    return totalOnlyData;
  };

  const finalTotalData = getTotalData();

  // Debug logging
  console.log('GeneralChart render - Date range:', state.dateRange);
  console.log('GeneralChart render - Chart data labels:', chartData.labels);
  console.log('GeneralChart render - Transformed data:', transformedData);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  // Distinct colors for cluster totals (darker, more prominent)
  const clusterColors = [
    '#1F2937', '#DC2626', '#059669', '#D97706', '#7C3AED',
    '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
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

  // Helper function to calculate dynamic increment for currency values
  const calculateCurrencyIncrement = (maxValue, minValue) => {
    const range = maxValue - minValue;
    const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
    let increment;
    
    if (range / magnitude >= 5) {
      increment = magnitude;
    } else if (range / magnitude >= 2) {
      increment = magnitude / 2;
    } else {
      increment = magnitude / 4;
    }
    
    // Ensure minimum increment for readability
    increment = Math.max(increment, 50000);
    
    return increment;
  };

  // Calculate y-axis domain with appropriate increments
  const calculateYAxisDomain = () => {
    if (showTotalLine) {
      // When showing individual pharmacies, calculate based on individual values
      if (transformedData.length === 0) return [0, 1000000];
      
      // Get all individual pharmacy values (excluding totalValue)
      const allValues = [];
      transformedData.forEach(item => {
        chartData.datasets.forEach(dataset => {
          const value = item[dataset.label] || 0;
          if (value > 0) allValues.push(value);
        });
      });
      
      if (allValues.length === 0) return [0, 1000000];
      
      const maxValue = Math.max(...allValues);
      const minValue = Math.min(...allValues);
      
      // For currency metrics, use dynamic increments, otherwise use appropriate scaling
      const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
      const isCurrency = currencyMetrics.some(metric => selectedMetric.includes(metric));
      
      if (isCurrency) {
        const increment = calculateCurrencyIncrement(maxValue, minValue);
        const maxDomain = Math.ceil(maxValue / increment) * increment;
        const minDomain = Math.floor(minValue / increment) * increment;
        if (maxDomain === minDomain) {
          return [0, maxDomain + increment];
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
    } else {
      // When showing total only, calculate based on total values
      if (finalTotalData.length === 0) return [0, 1000000];
      
      // For cluster mode, get all cluster values plus combined total (if visible)
      let allValues = [];
      if (state.pharmacySelectionMode === 'clusters') {
        finalTotalData.forEach(item => {
          Object.keys(item).forEach(key => {
            if (key.startsWith('cluster_') && item[key] > 0) {
              allValues.push(item[key]);
            }
            // Only include combined total if it's visible
            if (key === 'total' && item[key] > 0 && showCombinedTotal) {
              allValues.push(item[key]);
            }
          });
        });
      } else {
        // For regular total mode
        allValues = finalTotalData.map(item => item.total);
      }
      
      if (allValues.length === 0) return [0, 1000000];
      
      const maxValue = Math.max(...allValues);
      const minValue = Math.min(...allValues);
      
      // For currency metrics, use dynamic increments, otherwise use appropriate scaling
      const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
      const isCurrency = currencyMetrics.some(metric => selectedMetric.includes(metric));
      
      if (isCurrency) {
        const increment = calculateCurrencyIncrement(maxValue, minValue);
        const maxDomain = Math.ceil(maxValue / increment) * increment;
        const minDomain = Math.floor(minValue / increment) * increment;
        if (maxDomain === minDomain) {
          return [0, maxDomain + increment];
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
    }
  };

  const [yMin, yMax] = calculateYAxisDomain();

  // Generate y-axis ticks
  const generateYTicks = () => {
    const currencyMetrics = ['Total Revenue', 'Revenue', 'Sales', 'Income'];
    const isCurrency = currencyMetrics.some(metric => selectedMetric.includes(metric));
    
    if (isCurrency) {
      // Calculate the same increment used for the domain
      const increment = calculateCurrencyIncrement(yMax, yMin);
      const ticks = [];
      for (let i = yMin; i <= yMax; i += increment) {
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
          {showTotalLine && payload.length > 1 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              {state.pharmacySelectionMode === 'clusters' ? (
                <>
                  {/* Show individual cluster totals */}
                  {getSelectedClusters().map((cluster, index) => {
                    const clusterValue = payload[0].payload[`cluster_${cluster.name}`] || 0;
                    const clusterColor = clusterColors[index % clusterColors.length];
                    return (
                      <p key={cluster.name} className="text-sm font-semibold" style={{ color: clusterColor }}>
                        {cluster.name} Total: {formatValue(clusterValue)}
                      </p>
                    );
                  })}
                  {/* Show combined total of all clusters */}
                  <p className="text-sm font-semibold text-gray-800 mt-1 pt-1 border-t border-gray-300">
                    Combined Total: {formatValue(payload[0].payload.totalValue)}
                  </p>
                </>
              ) : (
                // Show single total for pharmacy mode
                <p className="text-sm font-semibold text-gray-800">
                  Total: {formatValue(payload[0].payload.totalValue)}
                </p>
              )}
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

  // Generate month options for date range selector
  const generateMonthOptions = () => {
    const months = [];
    const startDate = new Date('2024-04-01');
    const currentDate = new Date();
    
    let date = new Date(startDate);
    while (date.getFullYear() < currentDate.getFullYear() || 
           (date.getFullYear() === currentDate.getFullYear() && date.getMonth() <= currentDate.getMonth())) {
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      const value = `${month}-${year}`;
      months.push({ value, display: monthStr });
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  // Generate quarter options for quarter range selector
  const generateQuarterOptions = () => {
    const quarters = [];
    const currentDate = new Date();
    let currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
    
    for (let fy = 2024; fy <= currentFY; fy++) {
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
        if (fy === currentFY) {
          const month = currentDate.getMonth() + 1;
          const currentQ = month >= 4 && month <= 6 ? 'Q1' : 
                          month >= 7 && month <= 9 ? 'Q2' : 
                          month >= 10 && month <= 12 ? 'Q3' : 'Q4';
          if (q <= currentQ) {
            quarters.push({ value: `${fy} ${q}`, display: `${q} FY${fy}` });
          }
        } else {
          quarters.push({ value: `${fy} ${q}`, display: `${q} FY${fy}` });
        }
      });
    }
    return quarters;
  };

  // Generate fiscal year options for fiscal year range selector
  const generateFiscalYearOptions = () => {
    const fiscalYears = [];
    const currentDate = new Date();
    let currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
    
    for (let fy = 2024; fy <= currentFY; fy++) {
      fiscalYears.push({ value: `${fy}`, display: `FY${fy}` });
    }
    return fiscalYears;
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
            {showTotalLine 
              ? (state.pharmacySelectionMode === 'clusters' ? 'Hide Cluster Totals' : 'Hide Total')
              : (state.pharmacySelectionMode === 'clusters' ? 'Show Cluster Totals' : 'Show Total')
            }
          </span>
        </button>

        {/* Combined Total Toggle - Only show in cluster mode */}
        {state.pharmacySelectionMode === 'clusters' && (
          <button
            onClick={() => setShowCombinedTotal(!showCombinedTotal)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showCombinedTotal 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showCombinedTotal ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {showCombinedTotal ? 'Hide Combined Total' : 'Show Combined Total'}
            </span>
          </button>
        )}

        {/* Date Range Selector */}
        {state.viewType === 'month' && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Date Range:</span>
            <select
              value={state.dateRange.start}
              onChange={(e) => dispatch({ 
                type: 'SET_DATE_RANGE', 
                payload: { ...state.dateRange, start: e.target.value } 
              })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generateMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-400">to</span>
            <select
              value={state.dateRange.end}
              onChange={(e) => dispatch({ 
                type: 'SET_DATE_RANGE', 
                payload: { ...state.dateRange, end: e.target.value } 
              })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generateMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quarter Range Selector */}
        {state.viewType === 'quarter' && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Quarter Range:</span>
            <select
              value={state.quarterRange.start}
              onChange={(e) => dispatch({ 
                type: 'SET_QUARTER_RANGE', 
                payload: { ...state.quarterRange, start: e.target.value } 
              })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generateQuarterOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-400">to</span>
            <select
              value={state.quarterRange.end}
              onChange={(e) => dispatch({ 
                type: 'SET_QUARTER_RANGE', 
                payload: { ...state.quarterRange, end: e.target.value } 
              })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generateQuarterOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Fiscal Year Range Selector */}
        {state.viewType === 'fiscal_year' && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Fiscal Year Range:</span>
            <select
              value={state.fiscalYearRange.start}
              onChange={(e) => dispatch({ 
                type: 'SET_FISCAL_YEAR_RANGE', 
                payload: { ...state.fiscalYearRange, start: e.target.value } 
              })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generateFiscalYearOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-400">to</span>
            <select
              value={state.fiscalYearRange.end}
              onChange={(e) => dispatch({ 
                type: 'SET_FISCAL_YEAR_RANGE', 
                payload: { ...state.fiscalYearRange, end: e.target.value } 
              })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generateFiscalYearOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Chart */}
      <div className="w-full h-[600px]" key={`${state.dateRange.start}-${state.dateRange.end}-${state.quarterRange.start}-${state.quarterRange.end}-${state.fiscalYearRange.start}-${state.fiscalYearRange.end}-${state.viewType}-${JSON.stringify(chartData.labels)}-${showTotalLine}-${showCombinedTotal}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={showTotalLine ? transformedData : finalTotalData} 
            margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          >
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
            
            {showTotalLine ? (
              <>
                {/* Individual pharmacy lines only - no dotted total line */}
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
              </>
            ) : (
              /* Render appropriate total lines based on selection mode */
              state.pharmacySelectionMode === 'clusters' ? (
                              <>
                {/* Individual cluster lines when in cluster mode */}
                {getSelectedClusters().map((cluster, index) => (
                  <Line
                    key={`cluster_${cluster.name}`}
                    type="monotone"
                    dataKey={`cluster_${cluster.name}`}
                    stroke={clusterColors[index % clusterColors.length]}
                    strokeWidth={3}
                    dot={{ fill: clusterColors[index % clusterColors.length], strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: clusterColors[index % clusterColors.length], strokeWidth: 2 }}
                    name={`${cluster.name} Total`}
                  />
                ))}
                {/* Combined total line for all clusters - only show if toggle is on */}
                {showCombinedTotal && (
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1F2937"
                    strokeWidth={4}
                    strokeDasharray="8 4"
                    dot={{ fill: "#1F2937", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#1F2937", strokeWidth: 2 }}
                    name="Combined Total"
                  />
                )}
              </>
              ) : (
                /* Single total line when in pharmacy mode */
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1F2937"
                  strokeWidth={3}
                  dot={{ fill: "#1F2937", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#1F2937", strokeWidth: 2 }}
                  name="Total"
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default GeneralChart; 