import React from 'react';
import { useDataContext } from '../context/DataContext';
import { CheckCircle, Circle } from 'lucide-react';

function PharmacySelector() {
  const { state, dispatch } = useDataContext();

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

  const selectAll = () => {
    dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: state.pharmacies.map(p => p.name) });
  };

  const clearAll = () => {
    dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: [] });
  };

  const toggleAcquisitionFilter = () => {
    const newValue = !state.acquisitionFilter;
    dispatch({ type: 'SET_ACQUISITION_FILTER', payload: newValue });
    
    if (newValue) {
      // Auto-deselect pipeline pharmacies when acquisition filter is enabled
      const acquiredPharmacies = state.pharmacies
        .filter(p => p.status === 'acquired')
        .map(p => p.name);
      dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: acquiredPharmacies });
    }
  };

  const acquiredPharmacies = state.pharmacies.filter(p => p.status === 'acquired');
  const pipelinePharmacies = state.pharmacies.filter(p => p.status === 'pipeline');

  return (
    <div className="space-y-4">
      {/* Acquisition Filter Toggle */}
      <div className="flex items-center space-x-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={state.acquisitionFilter}
            onChange={toggleAcquisitionFilter}
            className="sr-only"
          />
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            state.acquisitionFilter ? 'bg-primary-600' : 'bg-gray-200'
          }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              state.acquisitionFilter ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </label>
        <span className="text-sm text-gray-700">From acquisition date only</span>
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

      {/* Pharmacy List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
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

export default PharmacySelector; 