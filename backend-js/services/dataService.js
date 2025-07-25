const csv = require('csv-parser');
const fs = require('fs');
const { validateCsvColumns, getBasicStats, cleanFiscalYear } = require('../utils/dataUtils');
const { isAcquiredPharmacy, parseDate } = require('../utils/dateUtils');
const config = require('../config');

class DataService {
  constructor() {
    this.currentData = null;
  }
  
  loadData(file) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      console.log('📄 Starting CSV parsing...');
      
      file.stream
        .pipe(csv())
        .on('data', (data) => {
          // Clean column names (remove BOM and trim whitespace)
          const cleanedData = {};
          Object.keys(data).forEach(key => {
            const cleanedKey = key.replace(/^\uFEFF/, '').trim(); // Remove BOM and trim
            cleanedData[cleanedKey] = data[key];
          });
          
          // Clean fiscal year data (remove FY prefix if present)
          if (cleanedData.Fiscal_Year) {
            cleanedData.Fiscal_Year = cleanFiscalYear(cleanedData.Fiscal_Year);
          }
          results.push(cleanedData);
        })
        .on('end', () => {
          try {
            console.log(`✅ Parsed ${results.length} rows successfully`);
            
            // Validate columns
            const validation = validateCsvColumns(results);
            if (!validation.isValid) {
              return reject(new Error(`Missing required columns: ${validation.missingColumns.join(', ')}`));
            }
            
            this.currentData = results;
            resolve({ success: true, message: "Data loaded successfully" });
          } catch (error) {
            reject({ success: false, message: `Error loading data: ${error.message}` });
          }
        })
        .on('error', (error) => {
          reject({ success: false, message: `Error parsing CSV: ${error.message}` });
        });
    });
  }
  
  getData() {
    return this.currentData;
  }
  
  getStats() {
    return getBasicStats(this.currentData);
  }
  
  getPharmacies() {
    if (!this.currentData) return [];
    
    const pharmacyMap = new Map();
    
    this.currentData.forEach(row => {
      if (!pharmacyMap.has(row.Pharmacy)) {
        const isAcquired = isAcquiredPharmacy(row.Acquisition_Date);
        
        pharmacyMap.set(row.Pharmacy, {
          name: row.Pharmacy,
          cluster: row.Cluster,
          acquisition_date: row.Acquisition_Date,
          is_acquired: isAcquired,
          status: isAcquired ? 'acquired' : 'pipeline'
        });
      }
    });
    
    return Array.from(pharmacyMap.values());
  }
  
  getClusters() {
    if (!this.currentData) return [];
    
    const clusterMap = new Map();
    
    this.currentData.forEach(row => {
      if (!clusterMap.has(row.Cluster)) {
        clusterMap.set(row.Cluster, {
          name: row.Cluster,
          pharmacies: new Set()
        });
      }
      
      clusterMap.get(row.Cluster).pharmacies.add(row.Pharmacy);
    });
    
    return Array.from(clusterMap.values()).map(cluster => {
      const pharmacyDetails = Array.from(cluster.pharmacies).map(pharmacyName => {
        const pharmacyData = this.currentData.find(row => row.Pharmacy === pharmacyName);
        const isAcquired = isAcquiredPharmacy(pharmacyData.Acquisition_Date);
        
        return {
          name: pharmacyName,
          acquisition_date: pharmacyData.Acquisition_Date,
          is_acquired: isAcquired,
          status: isAcquired ? 'acquired' : 'pipeline'
        };
      });
      
      return {
        name: cluster.name,
        pharmacy_count: pharmacyDetails.length,
        pharmacies: pharmacyDetails
      };
    });
  }
  
  getMetrics() {
    if (!this.currentData) return [];
    
    const uniqueMetrics = [...new Set(this.currentData.map(row => row.Metric))];
    
    return uniqueMetrics.map(metricName => ({
      name: metricName
    }));
  }
  
  getRevenueData(pharmacies = null, acquisitionDates = null, acquisitionDate = null) {
    if (!this.currentData) return null;
    
    let revenueData = [...this.currentData];
    
    // Filter by selected pharmacies
    if (pharmacies && pharmacies.length > 0) {
      revenueData = revenueData.filter(row => pharmacies.includes(row.Pharmacy));
    }
    
    // Apply acquisition date filter
    if (acquisitionDates) {
      revenueData = this._applyAcquisitionFilter(revenueData, acquisitionDates);
    }
    
    // Apply custom acquisition date filter
    if (acquisitionDate) {
      revenueData = this._applyCustomAcquisitionFilter(revenueData, acquisitionDate);
    }
    
    return revenueData;
  }
  
  getChartData(pharmacies = null, metric = null, acquisitionDate = null, dateRangeStart = null, dateRangeEnd = null) {
    if (!this.currentData) return null;
    
    let chartData = [...this.currentData];
    
    console.log('🔍 getChartData - Initial data length:', chartData.length);
    
    // Filter by selected pharmacies
    if (pharmacies && pharmacies.length > 0) {
      chartData = chartData.filter(row => pharmacies.includes(row.Pharmacy));
      console.log('🔍 After pharmacy filter:', chartData.length, 'rows');
    }
    
    // Filter by metric if specified
    if (metric) {
      chartData = chartData.filter(row => row.Metric === metric);
      console.log('🔍 After metric filter:', chartData.length, 'rows');
    }
    
    // Apply custom acquisition date filter
    if (acquisitionDate) {
      chartData = this._applyCustomAcquisitionFilter(chartData, acquisitionDate);
      console.log('🔍 After acquisition date filter:', chartData.length, 'rows');
    }
    
    // Apply date range filter
    if (dateRangeStart || dateRangeEnd) {
      chartData = this._applyDateRangeFilter(chartData, dateRangeStart, dateRangeEnd);
      console.log('🔍 After date range filter:', chartData.length, 'rows');
    }
    
    // Transform data into chart format
    return this._transformToChartFormat(chartData, pharmacies);
  }
  
  _applyAcquisitionFilter(revenueData, acquisitionDates) {
    if (!acquisitionDates) return revenueData;
    
    return revenueData.filter(row => {
      const pharmacy = row.Pharmacy;
      const date = new Date(row.Date);
      
      if (acquisitionDates[pharmacy]) {
        const acquisitionDate = new Date(acquisitionDates[pharmacy]);
        return date >= acquisitionDate;
      }
      
      return true;
    });
  }
  
  _applyCustomAcquisitionFilter(revenueData, acquisitionDate) {
    if (!acquisitionDate) return revenueData;
    
    const filterDate = parseDate(acquisitionDate);
    if (!filterDate) return revenueData;
    
    return revenueData.filter(row => {
      const rowDate = new Date(row.Date);
      return rowDate >= filterDate;
    });
  }
  
  _transformToChartFormat(data, pharmacies) {
    console.log('🔍 Transforming chart data:', { dataLength: data?.length, pharmacies });
    
    if (!data || data.length === 0) {
      console.log('❌ No data to transform');
      return { labels: [], datasets: [] };
    }
    
    // Log first few rows to see structure
    console.log('📊 Sample data rows:', data.slice(0, 3));
    
    // Group data by date and pharmacy
    const groupedData = {};
    const pharmacySet = new Set();
    
    data.forEach(row => {
      const date = row.Date;
      const pharmacy = row.Pharmacy;
      const value = parseFloat(row.Value) || 0;
      
      pharmacySet.add(pharmacy);
      
      if (!groupedData[date]) {
        groupedData[date] = {};
      }
      
      if (!groupedData[date][pharmacy]) {
        groupedData[date][pharmacy] = 0;
      }
      
      groupedData[date][pharmacy] += value;
    });
    
    // Get sorted dates - convert to proper date objects for chronological sorting
    const dateLabels = Object.keys(groupedData);
    const labels = dateLabels.sort((a, b) => {
      // Convert date strings like "Apr-24" to Date objects for proper sorting
      const dateA = this._parseChartDate(a);
      const dateB = this._parseChartDate(b);
      return dateA - dateB;
    });
    
    // Create datasets for each pharmacy
    const datasets = Array.from(pharmacySet).map(pharmacy => ({
      label: pharmacy,
      data: labels.map(date => groupedData[date][pharmacy] || 0)
    }));
    
    const result = { labels, datasets };
    console.log('✅ Transformed chart data:', { 
      labelsCount: labels.length, 
      datasetsCount: datasets.length,
      sampleLabels: labels.slice(0, 5),
      sampleDatasets: datasets.slice(0, 2)
    });
    
    return result;
  }
  
  _parseChartDate(dateStr) {
    // Parse date strings like "Apr-24", "May-25", etc.
    // Format: MMM-YY (3 letter month - 2 digit year)
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = dateStr.split('-');
    if (parts.length !== 2) {
      console.warn('Invalid date format:', dateStr);
      return new Date(0); // Return epoch date for invalid formats
    }
    
    const monthStr = parts[0];
    const yearStr = parts[1];
    
    const month = months[monthStr];
    if (month === undefined) {
      console.warn('Invalid month:', monthStr);
      return new Date(0);
    }
    
    // Convert 2-digit year to 4-digit year
    // Assume years 20-99 are 2020-2099, years 00-19 are 2000-2019
    const year = parseInt(yearStr) < 20 ? 2000 + parseInt(yearStr) : 1900 + parseInt(yearStr);
    
    return new Date(year, month, 1);
  }
  
  _applyDateRangeFilter(data, startDate, endDate) {
    if (!startDate && !endDate) return data;
    
    console.log('🔍 Applying date range filter:', { startDate, endDate });
    
    const startDateObj = startDate ? this._parseChartDate(startDate) : null;
    const endDateObj = endDate ? this._parseChartDate(endDate) : null;
    
    console.log('🔍 Parsed date objects:', { 
      startDateObj: startDateObj?.toISOString(), 
      endDateObj: endDateObj?.toISOString() 
    });
    
    return data.filter(row => {
      const rowDate = this._parseChartDate(row.Date);
      
      if (startDateObj && rowDate < startDateObj) {
        return false;
      }
      
      if (endDateObj && rowDate > endDateObj) {
        return false;
      }
      
      return true;
    });
  }
}

// Global instance
const dataService = new DataService();

module.exports = dataService; 