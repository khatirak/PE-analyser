import React from 'react';
import Header from './components/common/Header';
import Dashboard from './components/dashboard/Dashboard';
import Sidebar from './components/common/Sidebar';
import { DataProvider } from './context/DataContext';
import './styles/components.css';

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