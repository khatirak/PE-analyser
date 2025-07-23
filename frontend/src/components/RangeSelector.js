import React from 'react';
import { useDataContext } from '../context/DataContext';

function RangeSelector() {
  const { state, dispatch } = useDataContext();

  const handleDateRangeChange = (field, value) => {
    dispatch({ 
      type: 'SET_DATE_RANGE', 
      payload: { ...state.dateRange, [field]: value } 
    });
  };

  const handleQuarterRangeChange = (field, value) => {
    dispatch({ 
      type: 'SET_QUARTER_RANGE', 
      payload: { ...state.quarterRange, [field]: value } 
    });
  };

  const handleFiscalYearRangeChange = (field, value) => {
    dispatch({ 
      type: 'SET_FISCAL_YEAR_RANGE', 
      payload: { ...state.fiscalYearRange, [field]: value } 
    });
  };

  const resetRange = () => {
    if (state.viewType === 'month') {
      dispatch({ type: 'SET_DATE_RANGE', payload: { start: '', end: '' } });
    } else if (state.viewType === 'quarter') {
      dispatch({ type: 'SET_QUARTER_RANGE', payload: { start: '', end: '' } });
    } else if (state.viewType === 'fiscal_year') {
      dispatch({ type: 'SET_FISCAL_YEAR_RANGE', payload: { start: '', end: '' } });
    }
  };

  const generateMonthOptions = () => {
    const months = [];
    const startDate = new Date('2024-04-01');
    const currentDate = new Date();
    
    let date = new Date(startDate);
    while (date.getFullYear() < currentDate.getFullYear() || 
           (date.getFullYear() === currentDate.getFullYear() && date.getMonth() <= currentDate.getMonth())) {
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const value = date.toISOString().substring(0, 7);
      months.push({ value, display: monthStr });
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  const generateQuarterOptions = () => {
    const quarters = [];
    const currentDate = new Date();
    let currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
    
    for (let fy = 2025; fy <= currentFY; fy++) {
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
        if (fy === currentFY) {
          const month = currentDate.getMonth() + 1;
          const currentQ = month >= 4 && month <= 6 ? 'Q1' : 
                          month >= 7 && month <= 9 ? 'Q2' : 
                          month >= 10 && month <= 12 ? 'Q3' : 'Q4';
          if (q <= currentQ) {
            quarters.push({ value: `${q}-FY${fy}`, display: `${q} FY${fy}` });
          }
        } else {
          quarters.push({ value: `${q}-FY${fy}`, display: `${q} FY${fy}` });
        }
      });
    }
    return quarters;
  };

  const generateFiscalYearOptions = () => {
    const fiscalYears = [];
    const currentDate = new Date();
    let currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
    
    for (let fy = 2025; fy <= currentFY; fy++) {
      fiscalYears.push({ value: `FY${fy}`, display: `FY${fy}` });
    }
    return fiscalYears;
  };

  if (state.viewType === 'month') {
    const monthOptions = generateMonthOptions();
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Custom Date Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">From:</label>
            <select
              value={state.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">To:</label>
            <select
              value={state.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={resetRange}
          className="btn-secondary text-xs px-3 py-1 w-full"
        >
          Reset to All
        </button>
      </div>
    );
  }

  if (state.viewType === 'quarter') {
    const quarterOptions = generateQuarterOptions();
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Custom Quarter Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">From:</label>
            <select
              value={state.quarterRange.start}
              onChange={(e) => handleQuarterRangeChange('start', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All</option>
              {quarterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">To:</label>
            <select
              value={state.quarterRange.end}
              onChange={(e) => handleQuarterRangeChange('end', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All</option>
              {quarterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={resetRange}
          className="btn-secondary text-xs px-3 py-1 w-full"
        >
          Reset to All
        </button>
      </div>
    );
  }

  if (state.viewType === 'fiscal_year') {
    const fiscalYearOptions = generateFiscalYearOptions();
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Custom Fiscal Year Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">From:</label>
            <select
              value={state.fiscalYearRange.start}
              onChange={(e) => handleFiscalYearRangeChange('start', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All</option>
              {fiscalYearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">To:</label>
            <select
              value={state.fiscalYearRange.end}
              onChange={(e) => handleFiscalYearRangeChange('end', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All</option>
              {fiscalYearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.display}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={resetRange}
          className="btn-secondary text-xs px-3 py-1 w-full"
        >
          Reset to All
        </button>
      </div>
    );
  }

  return null;
}

export default RangeSelector; 