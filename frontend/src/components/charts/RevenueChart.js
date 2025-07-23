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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {payload.length > 1 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-800">
                Total: {formatCurrency(payload.reduce((sum, entry) => sum + entry.value, 0))}
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
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={formatCurrency}
            tickMargin={10}
            width={80}
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