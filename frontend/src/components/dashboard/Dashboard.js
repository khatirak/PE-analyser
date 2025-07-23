import React from 'react';
import { useDataContext } from '../../context/DataContext';
import StatsGrid from '../charts/StatsGrid';
import GeneralChart from '../charts/GeneralChart';
import ViewSelector from '../filters/ViewSelector';
import RevenueCard from './RevenueCard';
import RangeSelector from '../filters/RangeSelector';

// Compact date range component for the chart header
const CompactDateRange = () => {
  const { state, dispatch } = useDataContext();

  // No automatic date setting - let users control their own date ranges

  const handleDateRangeChange = (field, value) => {
    console.log('Date range change:', field, value);
    console.log('Current date range state:', state.dateRange);
    dispatch({ 
      type: 'SET_DATE_RANGE', 
      payload: { ...state.dateRange, [field]: value } 
    });
  };

  const handleQuarterRangeChange = (field, value) => {
    console.log('Quarter range change:', field, value);
    dispatch({ 
      type: 'SET_QUARTER_RANGE', 
      payload: { ...state.quarterRange, [field]: value } 
    });
  };

  const handleFiscalYearRangeChange = (field, value) => {
    console.log('Fiscal year range change:', field, value);
    dispatch({ 
      type: 'SET_FISCAL_YEAR_RANGE', 
      payload: { ...state.fiscalYearRange, [field]: value } 
    });
  };



  const generateMonthOptions = () => {
    const months = [];
    const startDate = new Date('2024-04-01');
    // Use current live date
    const currentDate = new Date();
    
    let date = new Date(startDate);
    while (date.getFullYear() < currentDate.getFullYear() || 
           (date.getFullYear() === currentDate.getFullYear() && date.getMonth() <= currentDate.getMonth())) {
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const value = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({ value, display: monthStr });
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

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

  const generateFiscalYearOptions = () => {
    const fiscalYears = [];
    const currentDate = new Date();
    let currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
    
    for (let fy = 2024; fy <= currentFY; fy++) {
      fiscalYears.push({ value: `${fy}`, display: `FY${fy}` });
    }
    return fiscalYears;
  };

  const monthOptions = generateMonthOptions();
  const quarterOptions = generateQuarterOptions();
  const fiscalYearOptions = generateFiscalYearOptions();

  if (state.viewType === 'month') {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Date Range:</span>
        <select
          value={state.dateRange.start}
          onChange={(e) => handleDateRangeChange('start', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
        <span className="text-gray-400">to</span>
        <select
          value={state.dateRange.end}
          onChange={(e) => handleDateRangeChange('end', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
      </div>
    );
  } else if (state.viewType === 'quarter') {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Quarter Range:</span>
        <select
          value={state.quarterRange.start}
          onChange={(e) => handleQuarterRangeChange('start', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {quarterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
        <span className="text-gray-400">to</span>
        <select
          value={state.quarterRange.end}
          onChange={(e) => handleQuarterRangeChange('end', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {quarterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
      </div>
    );
  } else if (state.viewType === 'fiscal_year') {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Fiscal Year Range:</span>
        <select
          value={state.fiscalYearRange.start}
          onChange={(e) => handleFiscalYearRangeChange('start', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {fiscalYearOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
        <span className="text-gray-400">to</span>
        <select
          value={state.fiscalYearRange.end}
          onChange={(e) => handleFiscalYearRangeChange('end', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {fiscalYearOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

function Dashboard() {
  const { state } = useDataContext();

  if (state.loading) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <div className="text-gray-500 text-lg">
            Loading data...
          </div>
        </div>
      </div>
    );
  }

  if (!state.data) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <div className="text-gray-500 text-lg">
            Upload a CSV file to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <ViewSelector />
        </div>
        
        <div className="mb-8">
          <StatsGrid />
        </div>

        <div className="mb-8">
          <RevenueCard />
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">
              Metrics by Pharmacy Over Time
            </h2>
            <CompactDateRange />
          </div>
          <GeneralChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 