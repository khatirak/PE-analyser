import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext';
import { CheckCircle, Circle, Building2, Users } from 'lucide-react';

function PharmacySelector() {
  const { state, dispatch } = useDataContext();
  const [selectionMode, setSelectionMode] = useState(state.pharmacySelectionMode || 'pharmacies'); // 'pharmacies' or 'clusters'

  // Monitor selectedPharmacies changes
  useEffect(() => {
    console.log('🔍 selectedPharmacies state changed:', {
      selectedPharmacies: state.selectedPharmacies,
      length: state.selectedPharmacies.length,
      acquisitionDate: state.acquisitionDate
    });
  }, [state.selectedPharmacies, state.acquisitionDate]);

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

    // Get eligible pharmacies in this cluster (considering acquisition filter)
    const eligiblePharmacyNames = cluster.pharmacies
      .map(p => p.name)
      .filter(pharmacyName => {
        const pharmacy = state.pharmacies.find(p => p.name === pharmacyName);
        return pharmacy && shouldIncludePharmacy(pharmacy);
      });

    if (eligiblePharmacyNames.length === 0) return;

    const currentlySelectedInCluster = eligiblePharmacyNames.filter(name => 
      state.selectedPharmacies.includes(name)
    );

    let newSelected;
    if (currentlySelectedInCluster.length === eligiblePharmacyNames.length) {
      // All eligible pharmacies in cluster are selected, so deselect all
      newSelected = state.selectedPharmacies.filter(name => 
        !eligiblePharmacyNames.includes(name)
      );
    } else {
      // Not all eligible pharmacies in cluster are selected, so select all
      newSelected = [...state.selectedPharmacies];
      eligiblePharmacyNames.forEach(name => {
        if (!newSelected.includes(name)) {
          newSelected.push(name);
        }
      });
    }

    dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: newSelected });
  };

  const selectAll = () => {
    if (selectionMode === 'pharmacies') {
      // Use filtered pharmacies when acquisition date filter is applied
      const pharmaciesToSelect = state.acquisitionDate ? filteredPharmacies : state.pharmacies;
      if (pharmaciesToSelect && Array.isArray(pharmaciesToSelect)) {
        dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: pharmaciesToSelect.map(p => p.name) });
      }
    } else {
      // Select all pharmacies from all clusters (considering acquisition filter)
      if (state.clusters && Array.isArray(state.clusters)) {
        const allPharmacyNames = state.clusters.flatMap(cluster => 
          cluster.pharmacies && Array.isArray(cluster.pharmacies) ? cluster.pharmacies.map(p => p.name) : []
        );
        
        // If acquisition filter is applied, only select pharmacies that meet the criteria
        if (state.acquisitionDate) {
          const eligiblePharmacyNames = allPharmacyNames.filter(pharmacyName => {
            const pharmacy = state.pharmacies.find(p => p.name === pharmacyName);
            return pharmacy && shouldIncludePharmacy(pharmacy);
          });
          dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: eligiblePharmacyNames });
        } else {
          dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: allPharmacyNames });
        }
      }
    }
  };

  const clearAll = () => {
    dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: [] });
  };



  // Helper function to parse acquisition date string to Date object
  // Handles both formats: "Apr-24" and "01 July 2025"
  const parseAcquisitionDate = (dateStr) => {
    if (!dateStr) return null;
    
    console.log('🔍 Parsing date:', dateStr);
    
    // Try to parse as short format first (e.g., "Apr-24")
    if (dateStr.includes('-') && dateStr.length <= 7) {
      const [month, year] = dateStr.split('-');
      
      // Handle 2-digit years (20xx for 20-99, 19xx for 00-19)
      let fullYear;
      const yearNum = parseInt(year);
      if (yearNum >= 20) {
        fullYear = 2000 + yearNum;
      } else {
        fullYear = 1900 + yearNum;
      }
      
      // Get month index (0-11) - use a more reliable method
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
      
      if (monthIndex === -1) {
        console.error('Invalid month:', month);
        return null;
      }
      
      const result = new Date(fullYear, monthIndex, 1);
      console.log('✅ Parsed as short date:', { month, year, fullYear, monthIndex, result });
      return result;
    }
    
    // Try to parse as full date format (e.g., "01 July 2025")
    const fullDate = new Date(dateStr);
    if (!isNaN(fullDate.getTime())) {
      console.log('✅ Parsed as full date:', fullDate);
      return fullDate;
    }
    
    console.log('❌ Could not parse date:', dateStr);
    return null;
  };

  // Helper function to check if pharmacy should be included based on acquisition date filter
  const shouldIncludePharmacy = (pharmacy) => {
    if (!state.acquisitionDate) return true; // No filter applied
    if (pharmacy.status !== 'acquired') return false; // Only acquired pharmacies are affected
    
    if (!pharmacy.acquisition_date) return false; // No acquisition date means not included
    
    const filterDate = parseAcquisitionDate(state.acquisitionDate);
    const pharmacyDate = parseAcquisitionDate(pharmacy.acquisition_date);
    
    if (!filterDate || !pharmacyDate) {
      return false;
    }
    
    // Include pharmacy if its acquisition date is on or before the selected month
    return pharmacyDate <= filterDate;
  };

  // Filter pharmacies based on acquisition date
  const filteredPharmacies = state.pharmacies && Array.isArray(state.pharmacies) 
    ? state.pharmacies.filter(shouldIncludePharmacy) 
    : [];
  
  const acquiredPharmacies = filteredPharmacies.filter(p => p.status === 'acquired');
  const pipelinePharmacies = state.acquisitionDate ? [] : (state.pharmacies && Array.isArray(state.pharmacies) ? state.pharmacies.filter(p => p.status === 'pipeline') : []);



  // Helper function to check if a cluster is fully selected
  const isClusterFullySelected = (clusterName) => {
    const cluster = state.clusters && Array.isArray(state.clusters) ? state.clusters.find(c => c.name === clusterName) : null;
    if (!cluster || !cluster.pharmacies || !Array.isArray(cluster.pharmacies)) return false;
    
    // Get eligible pharmacies in this cluster (considering acquisition filter)
    const eligiblePharmacyNames = cluster.pharmacies
      .map(p => p.name)
      .filter(pharmacyName => {
        const pharmacy = state.pharmacies.find(p => p.name === pharmacyName);
        return pharmacy && shouldIncludePharmacy(pharmacy);
      });
    
    if (eligiblePharmacyNames.length === 0) return false;
    
    return eligiblePharmacyNames.every(name => state.selectedPharmacies.includes(name));
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
    
    // Get eligible pharmacies in this cluster (considering acquisition filter)
    const eligiblePharmacyNames = cluster.pharmacies
      .map(p => p.name)
      .filter(pharmacyName => {
        const pharmacy = state.pharmacies.find(p => p.name === pharmacyName);
        return pharmacy && shouldIncludePharmacy(pharmacy);
      });
    
    if (eligiblePharmacyNames.length === 0) return false;
    
    const selectedInCluster = eligiblePharmacyNames.filter(name => 
      state.selectedPharmacies.includes(name)
    );
    
    return selectedInCluster.length > 0 && selectedInCluster.length < eligiblePharmacyNames.length;
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
        <label className="text-sm text-gray-700">Include acquisition data from selected month and prior:</label>
        <select
          value={state.acquisitionDate || ''}
          onChange={(e) => {
            const value = e.target.value;
            dispatch({ type: 'SET_ACQUISITION_DATE', payload: value });
            
            if (value) {
              // Auto-select all acquired pharmacies that meet the acquisition date criteria
              const eligiblePharmacies = state.pharmacies
                .filter(p => {
                  if (p.status !== 'acquired') return false;
                  if (!p.acquisition_date) return false;
                  
                  const filterDate = parseAcquisitionDate(value);
                  const pharmacyDate = parseAcquisitionDate(p.acquisition_date);
                  
                  const shouldInclude = filterDate && pharmacyDate && !isNaN(filterDate.getTime()) && !isNaN(pharmacyDate.getTime()) ? pharmacyDate <= filterDate : false;
                  
                  // Only log for specific pharmacies or when there's an issue
                  if (p.name === 'Darwen' || shouldInclude) {
                    console.log('🔍 Pharmacy date check:', {
                      pharmacy: p.name,
                      pharmacyDate: p.acquisition_date,
                      parsedPharmacyDate: pharmacyDate,
                      filterDate: value,
                      parsedFilterDate: filterDate,
                      isValid: filterDate && pharmacyDate && !isNaN(filterDate.getTime()) && !isNaN(pharmacyDate.getTime()),
                      shouldInclude
                    });
                  }
                  
                  if (!filterDate || !pharmacyDate || isNaN(filterDate.getTime()) || isNaN(pharmacyDate.getTime())) return false;
                  return pharmacyDate <= filterDate;
                })
                .map(p => p.name);
              
              console.log('🔍 Acquisition date selection:', {
                selectedDate: value,
                totalPharmacies: state.pharmacies.length,
                acquiredPharmacies: state.pharmacies.filter(p => p.status === 'acquired').length,
                eligiblePharmacies: eligiblePharmacies.length,
                eligiblePharmacyNames: eligiblePharmacies
              });
              
              console.log('🔍 Dispatching SET_SELECTED_PHARMACIES with:', eligiblePharmacies);
              dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: eligiblePharmacies });
            } else {
              // When clearing the filter, select all acquired pharmacies
              const allAcquiredPharmacies = state.pharmacies
                .filter(p => p.status === 'acquired')
                .map(p => p.name);
              dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: allAcquiredPharmacies });
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
              // When clearing the filter, select all acquired pharmacies
              const allAcquiredPharmacies = state.pharmacies
                .filter(p => p.status === 'acquired')
                .map(p => p.name);
              dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: allAcquiredPharmacies });
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
                shouldIncludePharmacy={shouldIncludePharmacy}
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

function ClusterItem({ cluster, isFullySelected, isPartiallySelected, selectedPharmacies, onToggle, shouldIncludePharmacy }) {
  const getSelectionIcon = () => {
    if (isFullySelected) {
      return <CheckCircle className="h-4 w-4 text-success-500" />;
    } else if (isPartiallySelected) {
      return <div className="h-4 w-4 border-2 border-success-500 rounded-sm bg-success-500 bg-opacity-20" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get eligible pharmacies in this cluster (considering acquisition filter)
  const eligiblePharmacies = cluster.pharmacies && Array.isArray(cluster.pharmacies) 
    ? cluster.pharmacies.filter(p => shouldIncludePharmacy(p))
    : [];
  
  const selectedCount = eligiblePharmacies.filter(p => 
    selectedPharmacies.includes(p.name)
  ).length;

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
              {selectedCount}/{eligiblePharmacies.length} selected
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {eligiblePharmacies.map(p => p.name).join(', ')}
          </div>
        </div>
      </label>
    </div>
  );
}

export default PharmacySelector; 