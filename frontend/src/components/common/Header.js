import React, { useState, useRef } from 'react';
import { Upload, BarChart3 } from 'lucide-react';
import { useDataContext } from '../../context/DataContext';
import { uploadFile, fetchStats, fetchPharmacies, fetchClusters, fetchMetrics } from '../../utils/api';

function Header() {
  const { state, dispatch } = useDataContext();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a CSV file.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('📤 Uploading file:', file.name);
      
      // Upload the file
      const result = await uploadFile(file);
      console.log('✅ File uploaded successfully:', result);
      
      // Reload all data after successful upload
      console.log('🔄 Reloading data after upload...');
      
      // Fetch updated stats
      const stats = await fetchStats();
      console.log('✅ Stats reloaded:', stats);
      dispatch({ type: 'SET_STATS', payload: stats });
      
      // Fetch updated pharmacies
      const pharmacies = await fetchPharmacies();
      console.log('✅ Pharmacies reloaded:', pharmacies);
      dispatch({ type: 'SET_PHARMACIES', payload: pharmacies });
      
      // Fetch updated clusters
      const clusters = await fetchClusters();
      console.log('✅ Clusters reloaded:', clusters);
      dispatch({ type: 'SET_CLUSTERS', payload: clusters });
      
      // Fetch updated metrics
      const metrics = await fetchMetrics();
      console.log('✅ Metrics reloaded:', metrics);
      dispatch({ type: 'SET_METRICS', payload: metrics });
      
      // Auto-select all pharmacies
      if (pharmacies && Array.isArray(pharmacies) && pharmacies.length > 0) {
        const pharmacyNames = pharmacies.map(p => p.name);
        console.log('✅ Auto-selecting pharmacies after upload:', pharmacyNames.slice(0, 5), '... (total:', pharmacyNames.length, ')');
        dispatch({ type: 'SET_SELECTED_PHARMACIES', payload: pharmacyNames });
      }
      
      // Set data flag
      dispatch({ type: 'SET_DATA', payload: { loaded: true } });
      
      // Clear chart data to force refresh
      dispatch({ type: 'SET_CHART_DATA', payload: null });
      
      console.log('🎉 All data reloaded successfully after upload!');
      
      // Small delay to ensure all state updates are processed
      setTimeout(() => {
        console.log('⏰ Triggering chart data refresh after upload...');
      }, 500);
      
    } catch (error) {
      console.error('❌ Error during file upload:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">PE Analyser</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className={`flex items-center space-x-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {state.loading ? 'Uploading...' : 'Upload CSV'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
      
      {state.error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header; 