import React from 'react';
import { useDataContext } from '../context/DataContext';
import StatsGrid from './StatsGrid';
import RevenueChart from './RevenueChart';
import ViewSelector from './ViewSelector';

function Dashboard() {
  const { state } = useDataContext();

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
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Total Revenue by Pharmacy Over Time
          </h2>
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 