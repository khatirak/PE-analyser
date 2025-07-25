import React, { useEffect, useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { fetchMetrics } from '../../utils/api';

function MetricsModal({ isOpen, onClose }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
    }
  }, [isOpen]);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('❌ Error loading metrics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">All Metrics</h2>
          </div>
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
              <div className="text-gray-500">Loading metrics...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error loading metrics: {error}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {metrics.map((metric, index) => {
                // Safety check for metric structure
                if (!metric || !metric.name) {
                  console.warn('⚠️ Invalid metric data:', metric);
                  return null;
                }
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      {metric.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total: {metrics.length} unique metrics
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

export default MetricsModal; 