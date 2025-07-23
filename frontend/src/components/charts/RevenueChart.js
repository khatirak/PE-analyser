import React from 'react';
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
import { useDataContext } from '../../context/DataContext';
import { useChartData } from '../../hooks/useChartData';

function RevenueChart() {
  const { state } = useDataContext();
  const { chartData, loading } = useChartData();

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
    let totalRevenue = 0;
    chartData.datasets.forEach(dataset => {
      const value = dataset.data[index] || 0;
      dataPoint[dataset.label] = value;
      totalRevenue += value;
    });
    dataPoint.totalRevenue = totalRevenue;
    return dataPoint;
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Function to format date labels based on view type
  const formatDateLabel = (label) => {
    if (state.viewType === 'month') {
      // For monthly view, labels are already in MMM-YY format
      return label;
    } else if (state.viewType === 'quarter') {
      // For quarterly view, labels are in "YYYY QX" format
      return label;
    } else if (state.viewType === 'fiscal_year') {
      // For fiscal year view, labels are in "FYYYY" format
      return label;
    }
    return label;
  };

  // Calculate y-axis domain with 250,000 increments
  const calculateYAxisDomain = () => {
    if (transformedData.length === 0) return [0, 1000000];
    
    const maxValue = Math.max(...transformedData.map(item => item.totalRevenue));
    const minValue = Math.min(...transformedData.map(item => item.totalRevenue));
    
    // Round up to nearest 250,000 for max, round down for min
    const maxDomain = Math.ceil(maxValue / 250000) * 250000;
    const minDomain = Math.floor(minValue / 250000) * 250000;
    
    // Ensure we have at least 2 ticks
    if (maxDomain === minDomain) {
      return [0, maxDomain + 250000];
    }
    
    return [minDomain, maxDomain];
  };

  const [yMin, yMax] = calculateYAxisDomain();

  // Generate y-axis ticks in 250,000 increments
  const generateYTicks = () => {
    const ticks = [];
    for (let i = yMin; i <= yMax; i += 250000) {
      ticks.push(i);
    }
    return ticks;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDateLabel(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {payload.length > 1 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-800">
                Total: {formatCurrency(payload[0].payload.totalRevenue)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[600px]">
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
            tickFormatter={formatCurrency}
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
          {/* Cumulative revenue line */}
          <Line
            type="monotone"
            dataKey="totalRevenue"
            stroke="#1F2937"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: "#1F2937", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: "#1F2937", strokeWidth: 2 }}
            name="Total Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart; 