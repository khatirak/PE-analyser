const config = require('../config');

function validateCsvColumns(data) {
  if (!data || data.length === 0) {
    return { isValid: false, missingColumns: config.EXPECTED_COLUMNS };
  }
  
  const firstRow = data[0];
  const foundColumns = Object.keys(firstRow);
  
  // Check for exact matches first
  const missingColumns = config.EXPECTED_COLUMNS.filter(col => !foundColumns.includes(col));
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns
  };
}

function getBasicStats(data) {
  if (!data || data.length === 0) {
    return null;
  }
  
  const uniquePharmacies = new Set(data.map(row => row.Pharmacy));
  const uniqueClusters = new Set(data.map(row => row.Cluster));
  const uniqueMetrics = new Set(data.map(row => row.Metric));
  
  const dates = data.map(row => new Date(row.Date)).filter(date => !isNaN(date));
  const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
  
  return {
    totalRows: data.length,
    uniquePharmacies: uniquePharmacies.size,
    uniqueClusters: uniqueClusters.size,
    uniqueMetrics: uniqueMetrics.size,
    dateRange: minDate && maxDate ? {
      start: minDate.toISOString().split('T')[0],
      end: maxDate.toISOString().split('T')[0]
    } : null
  };
}

function filterDataByDateRange(data, startDate = null, endDate = null) {
  if (!data) return data;
  
  return data.filter(row => {
    const rowDate = new Date(row.Date);
    if (isNaN(rowDate)) return false;
    
    if (startDate && rowDate < new Date(startDate)) return false;
    if (endDate && rowDate > new Date(endDate)) return false;
    
    return true;
  });
}

function filterDataByPharmacies(data, pharmacies) {
  if (!data || !pharmacies || pharmacies.length === 0) {
    return data;
  }
  
  return data.filter(row => pharmacies.includes(row.Pharmacy));
}

function formatCurrency(value) {
  try {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return String(value);
    return `£${numValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
  } catch {
    return String(value);
  }
}

function cleanFiscalYear(fiscalYear) {
  if (!fiscalYear) return null;
  
  const cleaned = String(fiscalYear).replace(/FY/i, '');
  const numeric = parseInt(cleaned, 10);
  return isNaN(numeric) ? null : numeric;
}

module.exports = {
  validateCsvColumns,
  getBasicStats,
  filterDataByDateRange,
  filterDataByPharmacies,
  formatCurrency,
  cleanFiscalYear
}; 