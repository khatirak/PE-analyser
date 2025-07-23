import React, { useEffect } from 'react';
import { useDataContext } from '../../context/DataContext';
import { fetchPharmacies } from '../../utils/api';
import PharmacySelector from '../filters/PharmacySelector';
import RangeSelector from '../filters/RangeSelector';

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
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3 className="sidebar-title">
            Select Pharmacies
          </h3>
          <PharmacySelector />
        </div>
        
        <div className="sidebar-section">
          <RangeSelector />
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 