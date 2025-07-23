import React, { useEffect } from 'react';
import { useDataContext } from '../context/DataContext';
import { fetchPharmacies } from '../utils/api';
import PharmacySelector from './PharmacySelector';
import RangeSelector from './RangeSelector';

function Sidebar() {
  const { state, dispatch } = useDataContext();

  useEffect(() => {
    if (state.data && state.pharmacies.length === 0) {
      const loadPharmacies = async () => {
        try {
          const pharmacies = await fetchPharmacies();
          dispatch({ type: 'SET_PHARMACIES', payload: pharmacies });
          // Auto-select all pharmacies initially
          dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: pharmacies.map(p => p.name) });
        } catch (error) {
          console.error('Error loading pharmacies:', error);
        }
      };
      loadPharmacies();
    }
  }, [state.data]);

  if (!state.data) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Pharmacies
          </h3>
          <PharmacySelector />
        </div>
        
        <div>
          <RangeSelector />
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 