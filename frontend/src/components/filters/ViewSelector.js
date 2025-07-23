import React from 'react';
import { useDataContext } from '../../context/DataContext';

function ViewSelector() {
  const { state, dispatch } = useDataContext();

  const handleViewTypeChange = (viewType) => {
    dispatch({ type: 'SET_VIEW_TYPE', payload: viewType });
  };

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">View by:</label>
      <select
        value={state.viewType}
        onChange={(e) => handleViewTypeChange(e.target.value)}
        className="input-field w-auto"
      >
        <option value="month">Month</option>
        <option value="fiscal_year">Fiscal Year</option>
        <option value="quarter">Quarter (by FY)</option>
      </select>
    </div>
  );
}

export default ViewSelector; 