import React from 'react';
import { useDataContext } from '../../context/DataContext';
import StatsGrid from '../charts/StatsGrid';
import GeneralChart from '../charts/GeneralChart';
import ViewSelector from '../filters/ViewSelector';
import GeneralCard from './GeneralCard';

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
          <StatsGrid />
        </div>

        <div className="mb-4">
          <ViewSelector />
        </div>

        <div className="mb-8">
          <GeneralCard viewType={state.viewType} />
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">
              Metrics by Pharmacy Over Time
            </h2>
          </div>
          <GeneralChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 