import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Circle, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchPharmacies } from '../../utils/api';

function PharmacyModal({ isOpen, onClose }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    if (isOpen) {
      loadPharmacies();
    }
  }, [isOpen]);

  const loadPharmacies = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading pharmacies...');
      const data = await fetchPharmacies();
      console.log('✅ Pharmacies loaded:', data);
      console.log('📊 Pharmacy structure check:', data.slice(0, 3).map(pharmacy => ({
        name: pharmacy.name,
        cluster: pharmacy.cluster,
        status: pharmacy.status,
        acquisition_date: pharmacy.acquisition_date
      })));
      setPharmacies(data);
    } catch (error) {
      console.error('❌ Error loading pharmacies:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusIcon = (status) => {
    if (status === 'acquired') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <Circle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    return status === 'acquired' ? 'Acquired' : 'Pipeline';
  };

  const getStatusColor = (status) => {
    return status === 'acquired' ? 'text-green-600' : 'text-yellow-600';
  };

  // Sorting functions
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedPharmacies = () => {
    if (!sortConfig.key) return pharmacies;

    return [...pharmacies].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (!aValue) aValue = '';
      if (!bValue) bValue = '';

      // Handle status sorting (acquired comes before pipeline)
      if (sortConfig.key === 'status') {
        if (aValue === 'acquired' && bValue === 'pipeline') {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue === 'pipeline' && bValue === 'acquired') {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }

      // Handle date sorting
      if (sortConfig.key === 'acquisition_date') {
        // Put 'Not acquired' at the end
        if (aValue === 'Not acquired' && bValue !== 'Not acquired') {
          return 1;
        }
        if (bValue === 'Not acquired' && aValue !== 'Not acquired') {
          return -1;
        }
        if (aValue === 'Not acquired' && bValue === 'Not acquired') {
          return 0;
        }
        
        // Convert date strings to Date objects for proper comparison
        try {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          
          if (aDate < bDate) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aDate > bDate) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        } catch (error) {
          // Fallback to string comparison if date parsing fails
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      }

      // String comparison
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-gray-600" />
      : <ChevronDown className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Pharmacies</h2>
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
              <div className="text-gray-500">Loading pharmacies...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error loading pharmacies: {error}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Pharmacy Name</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('cluster')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Cluster</span>
                        {getSortIcon('cluster')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('acquisition_date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Acquisition Date</span>
                        {getSortIcon('acquisition_date')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedPharmacies().map((pharmacy, index) => {
                    // Safety check for pharmacy structure
                    if (!pharmacy || !pharmacy.name) {
                      console.warn('⚠️ Invalid pharmacy data:', pharmacy);
                      return null;
                    }
                    
                    return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(pharmacy.status)}
                          <span className={`ml-2 text-sm font-medium ${getStatusColor(pharmacy.status)}`}>
                            {getStatusText(pharmacy.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pharmacy.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pharmacy.cluster || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pharmacy.acquisition_date || 'Not acquired'}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total: {pharmacies.length} pharmacies
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

export default PharmacyModal; 