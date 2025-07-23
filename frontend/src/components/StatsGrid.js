import React from 'react';
import { useDataContext } from '../context/DataContext';
import { Building2, TrendingUp, Users, BarChart3 } from 'lucide-react';

function StatsGrid() {
  const { state } = useDataContext();

  if (!state.stats) {
    return null;
  }

  const stats = [
    {
      name: 'Total Pharmacies',
      value: state.stats.unique_pharmacies || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Total Rows',
      value: state.stats.total_rows || 0,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Unique Clusters',
      value: state.stats.unique_clusters || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Unique Metrics',
      value: state.stats.unique_metrics || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid; 