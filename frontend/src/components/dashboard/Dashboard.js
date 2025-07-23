import React from 'react';
import { useDataContext } from '../../context/DataContext';
import StatsGrid from '../charts/StatsGrid';
import RevenueChart from '../charts/RevenueChart';
import ViewSelector from '../filters/ViewSelector';
import RevenueCard from './RevenueCard';

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

        <div className="mb-8">
          <RevenueCard />
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">
              Total Revenue by Pharmacy Over Time
            </h2>
          </div>
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 