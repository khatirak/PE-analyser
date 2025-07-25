import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { CheckCircle, Circle, Building2, Users } from 'lucide-react';

function PharmacySelector() {
  const { state, dispatch } = useDataContext();
  const [selectionMode, setSelectionMode] = useState(state.pharmacySelectionMode || 'pharmacies'); // 'pharmacies' or 'clusters'

  const handlePharmacyToggle = (pharmacyName) => {
    const isSelected = state.selectedPharmacies.includes(pharmacyName);
    let newSelected;

    if (isSelected) {
      newSelected = state.selectedPharmacies.filter(name => name !== pharmacyName);
    } else {
      newSelected = [...state.selectedPharmacies, pharmacyName];
    }

    dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: newSelected });
  };

  const handleClusterToggle = (clusterName) => {
    // Get all pharmacies in this cluster
    const cluster = state.clusters.find(c => c.name === clusterName);
    if (!cluster) return;

    const clusterPharmacyNames = cluster.pharmacies.map(p => p.name);
    const currentlySelectedInCluster = clusterPharmacyNames.filter(name => 
      state.selectedPharmacies.includes(name)
    );

    let newSelected;
    if (currentlySelectedInCluster.length === clusterPharmacyNames.length) {
      // All pharmacies in cluster are selected, so deselect all
      newSelected = state.selectedPharmacies.filter(name => 
        !clusterPharmacyNames.includes(name)
      );
    } else {
      // Not all pharmacies in cluster are selected, so select all
      newSelected = [...state.selectedPharmacies];
      clusterPharmacyNames.forEach(name => {
        if (!newSelected.includes(name)) {
          newSelected.push(name);
        }
      });
    }

    dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: newSelected });
  };

  const selectAll = () => {
    if (selectionMode === 'pharmacies') {
      if (state.pharmacies && Array.isArray(state.pharmacies)) {
        dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: state.pharmacies.map(p => p.name) });
      }
    } else {
      // Select all pharmacies from all clusters
      if (state.clusters && Array.isArray(state.clusters)) {
        const allPharmacyNames = state.clusters.flatMap(cluster => 
          cluster.pharmacies && Array.isArray(cluster.pharmacies) ? cluster.pharmacies.map(p => p.name) : []
        );
        dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: allPharmacyNames });
      }
    }
  };

  const clearAll = () => {
    dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: [] });
  };



  const acquiredPharmacies = state.pharmacies && Array.isArray(state.pharmacies) ? state.pharmacies.filter(p => p.status === 'acquired') : [];
  const pipelinePharmacies = state.pharmacies && Array.isArray(state.pharmacies) ? state.pharmacies.filter(p => p.status === 'pipeline') : [];

  // Helper function to check if a cluster is fully selected
  const isClusterFullySelected = (clusterName) => {
    const cluster = state.clusters && Array.isArray(state.clusters) ? state.clusters.find(c => c.name === clusterName) : null;
    if (!cluster || !cluster.pharmacies || !Array.isArray(cluster.pharmacies)) return false;
    
    const clusterPharmacyNames = cluster.pharmacies.map(p => p.name);
    return clusterPharmacyNames.every(name => state.selectedPharmacies.includes(name));
  };

  // Generate month options for acquisition date selector
  const generateMonthOptions = () => {
    const months = [];
    const startDate = new Date('2024-04-01'); // Apr-24 (FY2025 Q1)
    const currentDate = new Date();
    
    let date = new Date(startDate);
    while (date.getFullYear() < currentDate.getFullYear() || 
           (date.getFullYear() === currentDate.getFullYear() && date.getMonth() <= currentDate.getMonth())) {
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      const value = `${month}-${year}`;
      months.push({ value, display: monthStr });
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  // Helper function to check if a cluster is partially selected
  const isClusterPartiallySelected = (clusterName) => {
    const cluster = state.clusters && Array.isArray(state.clusters) ? state.clusters.find(c => c.name === clusterName) : null;
    if (!cluster || !cluster.pharmacies || !Array.isArray(cluster.pharmacies)) return false;
    
    const clusterPharmacyNames = cluster.pharmacies.map(p => p.name);
    const selectedInCluster = clusterPharmacyNames.filter(name => 
      state.selectedPharmacies.includes(name)
    );
    
    return selectedInCluster.length > 0 && selectedInCluster.length < clusterPharmacyNames.length;
  };

  return (
    <div className="space-y-4">
      {/* Selection Mode Toggle */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Selection Mode:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setSelectionMode('pharmacies');
              dispatch({ type: 'SET_PHARMACY_SELECTION_MODE', payload: 'pharmacies' });
            }}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectionMode === 'pharmacies'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Pharmacies</span>
          </button>
          <button
            onClick={() => {
              setSelectionMode('clusters');
              dispatch({ type: 'SET_PHARMACY_SELECTION_MODE', payload: 'clusters' });
            }}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectionMode === 'clusters'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Clusters</span>
          </button>
        </div>
      </div>

      {/* Acquisition Month Selector */}
      <div className="space-y-2">
        <label className="text-sm text-gray-700">Include data from month onwards:</label>
        <select
          value={state.acquisitionDate || ''}
          onChange={(e) => {
            const value = e.target.value;
            dispatch({ type: 'SET_ACQUISITION_DATE', payload: value });
            
            if (value) {
              // Auto-deselect pipeline pharmacies when acquisition filter is enabled
              const acquiredPharmacies = state.pharmacies
                .filter(p => p.status === 'acquired')
                .map(p => p.name);
              dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: acquiredPharmacies });
            }
          }}
          className="input-field text-sm w-full"
        >
          <option value="">All data (no filter)</option>
          {generateMonthOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
        {state.acquisitionDate && (
          <button
            onClick={() => {
              dispatch({ type: 'SET_ACQUISITION_DATE', payload: '' });
            }}
            className="btn-secondary text-xs px-3 py-1 w-full"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={selectAll}
          className="btn-secondary text-xs px-3 py-1"
        >
          All
        </button>
        <button
          onClick={clearAll}
          className="btn-secondary text-xs px-3 py-1"
        >
          Clear
        </button>
      </div>

      {/* Status Legend */}
      <div className="flex space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-4 w-4 text-success-500" />
          <span className="text-gray-600">Acquired</span>
        </div>
        <div className="flex items-center space-x-1">
          <Circle className="h-4 w-4 text-warning-500" />
          <span className="text-gray-600">Pipeline</span>
        </div>
      </div>

      {/* Selection Content */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {selectionMode === 'pharmacies' ? (
          // Individual Pharmacy Selection
          <>
            {/* Acquired Pharmacies */}
            {acquiredPharmacies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Acquired Pharmacies</h4>
                {acquiredPharmacies.map(pharmacy => (
                  <PharmacyItem
                    key={pharmacy.name}
                    pharmacy={pharmacy}
                    isSelected={state.selectedPharmacies.includes(pharmacy.name)}
                    onToggle={handlePharmacyToggle}
                  />
                ))}
              </div>
            )}

            {/* Pipeline Pharmacies */}
            {pipelinePharmacies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pipeline Pharmacies</h4>
                {pipelinePharmacies.map(pharmacy => (
                  <PharmacyItem
                    key={pharmacy.name}
                    pharmacy={pharmacy}
                    isSelected={state.selectedPharmacies.includes(pharmacy.name)}
                    onToggle={handlePharmacyToggle}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // Cluster Selection
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Clusters</h4>
            {state.clusters && Array.isArray(state.clusters) ? state.clusters.map(cluster => (
              <ClusterItem
                key={cluster.name}
                cluster={cluster}
                isFullySelected={isClusterFullySelected(cluster.name)}
                isPartiallySelected={isClusterPartiallySelected(cluster.name)}
                selectedPharmacies={state.selectedPharmacies}
                onToggle={handleClusterToggle}
              />
            )) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function PharmacyItem({ pharmacy, isSelected, onToggle }) {
  const Icon = pharmacy.status === 'acquired' ? CheckCircle : Circle;
  const iconColor = pharmacy.status === 'acquired' ? 'text-success-500' : 'text-warning-500';

  return (
    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(pharmacy.name)}
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className="text-sm text-gray-900 flex-1">{pharmacy.name}</span>
      {pharmacy.acquisition_date && (
        <span className="text-xs text-gray-500">({pharmacy.acquisition_date})</span>
      )}
    </label>
  );
}

function ClusterItem({ cluster, isFullySelected, isPartiallySelected, selectedPharmacies, onToggle }) {
  const getSelectionIcon = () => {
    if (isFullySelected) {
      return <CheckCircle className="h-4 w-4 text-success-500" />;
    } else if (isPartiallySelected) {
      return <div className="h-4 w-4 border-2 border-success-500 rounded-sm bg-success-500 bg-opacity-20" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const selectedCount = cluster.pharmacies && Array.isArray(cluster.pharmacies) ? cluster.pharmacies.filter(p => 
    selectedPharmacies.includes(p.name)
  ).length : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded -m-2">
        <input
          type="checkbox"
          checked={isFullySelected}
          ref={(input) => {
            if (input) {
              input.indeterminate = isPartiallySelected;
            }
          }}
          onChange={() => onToggle(cluster.name)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        {getSelectionIcon()}
        <Users className="h-4 w-4 text-purple-500" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{cluster.name}</span>
            <span className="text-xs text-gray-500">
              {selectedCount}/{cluster.pharmacy_count} selected
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {cluster.pharmacies && Array.isArray(cluster.pharmacies) ? cluster.pharmacies.map(p => p.name).join(', ') : ''}
          </div>
        </div>
      </label>
    </div>
  );
}

export default PharmacySelector; 