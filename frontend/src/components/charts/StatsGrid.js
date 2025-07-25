import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { Building2, TrendingUp, Users, BarChart3 } from 'lucide-react';
import PharmacyModal from '../common/PharmacyModal';
import ClusterModal from '../common/ClusterModal';
import MetricsModal from '../common/MetricsModal';

function StatsGrid() {
  const { state } = useDataContext();
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

  console.log('StatsGrid - state.stats:', state.stats);
  if (!state.stats) {
    console.log('StatsGrid - No stats available');
    return (
      <div className="text-center py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4">
                Upload a CSV file to start analyzing your pharmacy data.
              </p>
              <p className="text-sm text-gray-500">
                Click the "Upload CSV" button in the top right to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Pharmacies',
      value: state.stats.uniquePharmacies || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      clickable: true,
      onClick: () => setIsPharmacyModalOpen(true)
    },
    {
      name: 'Total Rows',
      value: state.stats.totalRows || 0,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      clickable: false
    },
    {
      name: 'Unique Clusters',
      value: state.stats.uniqueClusters || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      clickable: true,
      onClick: () => setIsClusterModalOpen(true)
    },
    {
      name: 'Unique Metrics',
      value: state.stats.uniqueMetrics || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      clickable: true,
      onClick: () => setIsMetricsModalOpen(true)
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className={`card ${stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
              onClick={stat.clickable ? stat.onClick : undefined}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.clickable && (
                    <p className="text-xs text-blue-600 mt-1">Click to view details</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PharmacyModal 
        isOpen={isPharmacyModalOpen} 
        onClose={() => setIsPharmacyModalOpen(false)} 
      />
      
      <ClusterModal 
        isOpen={isClusterModalOpen} 
        onClose={() => setIsClusterModalOpen(false)} 
      />
      
      <MetricsModal 
        isOpen={isMetricsModalOpen} 
        onClose={() => setIsMetricsModalOpen(false)} 
      />
    </>
  );
}

export default StatsGrid; 