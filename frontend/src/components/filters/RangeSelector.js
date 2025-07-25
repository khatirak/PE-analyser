import React, { useEffect, useCallback } from 'react';
import { useDataContext } from '../../context/DataContext';

function RangeSelector() {
  const { state, dispatch } = useDataContext();

  // Define setDefaultRanges function
  const setDefaultRanges = useCallback(() => {
    const currentDate = new Date();
    const startDate = new Date('2024-04-01'); // Apr-24
    
    // Set month range: start from Apr-24, end to current month - 1
    if (!state.dateRange.start || !state.dateRange.end) {
      const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
      const startYear = startDate.getFullYear().toString().slice(-2);
      const startValue = `${startMonth}-${startYear}`;
      
      // Set end date to current month - 1
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const endMonth = currentMonth === 0 ? 11 : currentMonth - 1; // Handle January (month 0)
      const endYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const endDate = new Date(endYear, endMonth, 1);
      const endMonthStr = endDate.toLocaleDateString('en-US', { month: 'short' });
      const endYearStr = endDate.getFullYear().toString().slice(-2);
      const endValue = `${endMonthStr}-${endYearStr}`;
      
      dispatch({ type: 'SET_DATE_RANGE', payload: { start: startValue, end: endValue } });
    }
    
    // Set quarter range: start from Q1 FY2025, end to one quarter before current
    if (!state.quarterRange.start || !state.quarterRange.end) {
      const startQuarter = '2025 Q1';
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
      dispatch({ type: 'SET_QUARTER_RANGE', payload: { start: startQuarter, end: endQuarter } });
    }
    
    // Set fiscal year range: start from 2024, end to current fiscal year
    if (!state.fiscalYearRange.start || !state.fiscalYearRange.end) {
      const startFY = '2025';
      const currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
      dispatch({ type: 'SET_FISCAL_YEAR_RANGE', payload: { start: startFY, end: currentFY.toString() } });
    }
  }, [state.dateRange, state.quarterRange, state.fiscalYearRange, dispatch]);

  // Set default ranges when component mounts
  useEffect(() => {
    setDefaultRanges();
  }, [setDefaultRanges]); // Run only on mount

  // Also set default ranges when view type changes
  useEffect(() => {
    if (state.viewType) {
      setDefaultRanges();
    }
  }, [state.viewType, setDefaultRanges]);

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

  const handleAcquisitionDateChange = (value) => {
    dispatch({ 
      type: 'SET_ACQUISITION_DATE', 
      payload: value 
    });
  };

  const resetRange = () => {
    const currentDate = new Date();
    const startDate = new Date('2024-04-01'); // Apr-24
    
    if (state.viewType === 'month') {
      const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
      const startYear = startDate.getFullYear().toString().slice(-2);
      const startValue = `${startMonth}-${startYear}`;
      
      // Set end date to current month - 1
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const endMonth = currentMonth === 0 ? 11 : currentMonth - 1; // Handle January (month 0)
      const endYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const endDate = new Date(endYear, endMonth, 1);
      const endMonthStr = endDate.toLocaleDateString('en-US', { month: 'short' });
      const endYearStr = endDate.getFullYear().toString().slice(-2);
      const endValue = `${endMonthStr}-${endYearStr}`;
      
      dispatch({ type: 'SET_DATE_RANGE', payload: { start: startValue, end: endValue } });
    } else if (state.viewType === 'quarter') {
      const startQuarter = '2025 Q1';
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
      dispatch({ type: 'SET_QUARTER_RANGE', payload: { start: startQuarter, end: endQuarter } });
    } else if (state.viewType === 'fiscal_year') {
      const currentFY = currentDate.getMonth() < 3 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
      dispatch({ type: 'SET_FISCAL_YEAR_RANGE', payload: { start: '2025', end: currentFY.toString() } });
    }
  };

  const resetAcquisitionDate = () => {
    dispatch({ type: 'SET_ACQUISITION_DATE', payload: '' });
  };

  const generateMonthOptions = () => {
    const months = [];
    const startDate = new Date('2024-04-01'); // Changed from 2025-04-01 to 2024-04-01
    const currentDate = new Date();
    
    let date = new Date(startDate);
    while (date.getFullYear() < currentDate.getFullYear() || 
           (date.getFullYear() === currentDate.getFullYear() && date.getMonth() <= currentDate.getMonth())) {
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      // Convert to MMM-YY format for backend compatibility (with hyphen)
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      const value = `${month}-${year}`;
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
    
    for (let fy = 2025; fy <= currentFY; fy++) {
      fiscalYears.push({ value: `${fy}`, display: `FY${fy}` });
    }
    return fiscalYears;
  };

  const monthOptions = generateMonthOptions();
  const quarterOptions = generateQuarterOptions();
  const fiscalYearOptions = generateFiscalYearOptions();

  return (
    <div className="space-y-6">
      {/* Date/Quarter/Fiscal Year Range Selector */}
      {state.viewType === 'month' && (
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
            Reset Range
          </button>
        </div>
      )}

      {state.viewType === 'quarter' && (
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
            Reset Range
          </button>
        </div>
      )}

      {state.viewType === 'fiscal_year' && (
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
            Reset Range
          </button>
        </div>
      )}

      {/* Acquisition Date Selector */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Acquisition Date Filter</h4>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Pharmacies acquired on or before:
          </label>
          <select
            value={state.acquisitionDate || ''}
            onChange={(e) => handleAcquisitionDateChange(e.target.value)}
            className="input-field text-sm w-full"
          >
            <option value="">All pharmacies (no filter)</option>
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.display}
              </option>
            ))}
          </select>
        </div>
        {state.acquisitionDate && (
          <button
            onClick={resetAcquisitionDate}
            className="btn-secondary text-xs px-3 py-1 w-full"
          >
            Reset Acquisition Filter
          </button>
        )}
      </div>
    </div>
  );
}

export default RangeSelector; 