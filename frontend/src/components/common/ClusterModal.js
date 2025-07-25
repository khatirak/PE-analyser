import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Circle } from 'lucide-react';
import { fetchClusters } from '../../utils/api';

function ClusterModal({ isOpen, onClose }) {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadClusters();
    }
  }, [isOpen]);

  const loadClusters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClusters();
      
      setClusters(data);
    } catch (error) {
      console.error('❌ Error loading clusters:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusIcon = (status) => {
    if (status === 'acquired') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <Circle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    return status === 'acquired' ? 'Acquired' : 'Pipeline';
  };

  const getStatusColor = (status) => {
    return status === 'acquired' ? 'text-green-600' : 'text-yellow-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Clusters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(80vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading clusters...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error loading clusters: {error}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clusters.map((cluster, index) => {
                // Safety check for cluster structure
                if (!cluster || !cluster.name) {
                  console.warn('⚠️ Invalid cluster data:', cluster);
                  return null;
                }
                
                const pharmacyCount = cluster.pharmacy_count || 0;
                const pharmacies = cluster.pharmacies || [];
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cluster.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {pharmacyCount} pharmacies
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {pharmacies.map((pharmacy, pIndex) => {
                        // Safety check for pharmacy structure
                        if (!pharmacy || !pharmacy.name) {
                          console.warn('⚠️ Invalid pharmacy data:', pharmacy);
                          return null;
                        }
                        
                        return (
                          <div key={pIndex} className="flex items-center justify-between bg-white rounded-md p-3 shadow-sm">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(pharmacy.status)}
                              <span className="text-sm font-medium text-gray-900">
                                {pharmacy.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium ${getStatusColor(pharmacy.status)}`}>
                                {getStatusText(pharmacy.status)}
                              </span>
                              {pharmacy.acquisition_date && (
                                <span className="text-xs text-gray-500">
                                  ({pharmacy.acquisition_date})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total: {clusters.length} clusters
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClusterModal; 