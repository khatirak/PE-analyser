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
    return null;
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