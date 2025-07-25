import React from 'react';
import { useDataContext } from '../../context/DataContext';
import PharmacySelector from '../filters/PharmacySelector';

function Sidebar() {
  const { state } = useDataContext();

  if (!state.data) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Spacer to push pharmacy selector down */}
        <div className="h-96"></div>
        
        <div className="sidebar-section">
          <h3 className="sidebar-title">
            Select Pharmacies
          </h3>
          <PharmacySelector />
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 