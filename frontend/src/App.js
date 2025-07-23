import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { useData } from './hooks/useData';
import { useChartData } from './hooks/useChartData';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <Dashboard />
        </div>
      </div>
    </DataProvider>
  );
}

export default App; 