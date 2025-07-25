const moment = require('moment');

class ChartService {
  constructor() {}

  createMonthlyChartData(revenueData, dateRangeStart = null, dateRangeEnd = null) {
    if (!revenueData || revenueData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Filter by date range if provided
    let filteredData = revenueData;
    if (dateRangeStart || dateRangeEnd) {
      filteredData = this._applyDateRangeFilter(revenueData, dateRangeStart, dateRangeEnd);
    }

    return this._transformToChartFormat(filteredData, 'month');
  }

  createQuarterChartData(revenueData, quarterRangeStart = null, quarterRangeEnd = null) {
    if (!revenueData || revenueData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Filter by quarter range if provided
    let filteredData = revenueData;
    if (quarterRangeStart || quarterRangeEnd) {
      filteredData = this._applyQuarterRangeFilter(revenueData, quarterRangeStart, quarterRangeEnd);
    }

    return this._transformToChartFormat(filteredData, 'quarter');
  }

  createFiscalYearChartData(revenueData, fiscalYearRangeStart = null, fiscalYearRangeEnd = null) {
    if (!revenueData || revenueData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Filter by fiscal year range if provided
    let filteredData = revenueData;
    if (fiscalYearRangeStart || fiscalYearRangeEnd) {
      filteredData = this._applyFiscalYearRangeFilter(revenueData, fiscalYearRangeStart, fiscalYearRangeEnd);
    }

    return this._transformToChartFormat(filteredData, 'fiscal_year');
  }

  createMonthlyPeriodData(revenueData, dateRangeStart = null, dateRangeEnd = null) {
    if (!revenueData || revenueData.length === 0) {
      return { periods: [], current_period: null };
    }

    // Filter by date range if provided
    let filteredData = revenueData;
    if (dateRangeStart || dateRangeEnd) {
      filteredData = this._applyDateRangeFilter(revenueData, dateRangeStart, dateRangeEnd);
    }

    return this._createPeriodData(filteredData, 'month');
  }

  createQuarterPeriodData(revenueData, quarterRangeStart = null, quarterRangeEnd = null) {
    if (!revenueData || revenueData.length === 0) {
      return { periods: [], current_period: null };
    }

    // Filter by quarter range if provided
    let filteredData = revenueData;
    if (quarterRangeStart || quarterRangeEnd) {
      filteredData = this._applyQuarterRangeFilter(revenueData, quarterRangeStart, quarterRangeEnd);
    }

    return this._createPeriodData(filteredData, 'quarter');
  }

  createFiscalYearPeriodData(revenueData, fiscalYearRangeStart = null, fiscalYearRangeEnd = null) {
    if (!revenueData || revenueData.length === 0) {
      return { periods: [], current_period: null };
    }

    // Filter by fiscal year range if provided
    let filteredData = revenueData;
    if (fiscalYearRangeStart || fiscalYearRangeEnd) {
      filteredData = this._applyFiscalYearRangeFilter(revenueData, fiscalYearRangeStart, fiscalYearRangeEnd);
    }

    return this._createPeriodData(filteredData, 'fiscal_year');
  }

  _transformToChartFormat(data, viewType = 'month') {
    // Group data based on view type
    const groupedData = {};
    const pharmacySet = new Set();

    data.forEach(row => {
      let periodKey;

      if (viewType === 'month') {
        periodKey = row.Date; // Use Date column for monthly view
      } else if (viewType === 'quarter') {
        periodKey = row.Quarter; // Use Quarter column for quarterly view
      } else if (viewType === 'fiscal_year') {
        periodKey = row.Fiscal_Year; // Use Fiscal_Year column for fiscal year view
      } else {
        periodKey = row.Date; // Default to monthly
      }

      const pharmacy = row.Pharmacy;
      const value = parseFloat(row.Value) || 0;

      pharmacySet.add(pharmacy);

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {};
      }

      if (!groupedData[periodKey][pharmacy]) {
        groupedData[periodKey][pharmacy] = 0;
      }

      groupedData[periodKey][pharmacy] += value;
    });

    // Get sorted period labels
    const periodLabels = Object.keys(groupedData);
    const labels = periodLabels.sort((a, b) => {
      if (viewType === 'month') {
        // Convert date strings like "Apr-24" to Date objects for proper sorting
        const dateA = this._parseChartDate(a);
        const dateB = this._parseChartDate(b);
        return dateA - dateB;
      } else if (viewType === 'quarter') {
        // Sort quarters chronologically (e.g., "Q1 2024", "Q2 2024")
        return this._parseQuarter(a) - this._parseQuarter(b);
      } else if (viewType === 'fiscal_year') {
        // Sort fiscal years numerically
        return parseInt(a) - parseInt(b);
      }
      return a.localeCompare(b);
    });

    // Create datasets for each pharmacy
    const datasets = Array.from(pharmacySet).map(pharmacy => ({
      label: pharmacy,
      data: labels.map(period => groupedData[period][pharmacy] || 0)
    }));

    return { labels, datasets };
  }

  _createPeriodData(data, viewType = 'month') {
    // Group data by period and calculate totals
    const groupedData = {};

    data.forEach(row => {
      let periodKey;

      if (viewType === 'month') {
        periodKey = row.Date;
      } else if (viewType === 'quarter') {
        periodKey = row.Quarter;
      } else if (viewType === 'fiscal_year') {
        periodKey = row.Fiscal_Year;
      } else {
        periodKey = row.Date;
      }

      const value = parseFloat(row.Value) || 0;

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = 0;
      }

      groupedData[periodKey] += value;
    });

    // Convert to periods array with percentage changes
    const periods = [];
    const sortedPeriods = Object.keys(groupedData).sort((a, b) => {
      if (viewType === 'month') {
        const dateA = this._parseChartDate(a);
        const dateB = this._parseChartDate(b);
        return dateA - dateB;
      } else if (viewType === 'quarter') {
        return this._parseQuarter(a) - this._parseQuarter(b);
      } else if (viewType === 'fiscal_year') {
        return parseInt(a) - parseInt(b);
      }
      return a.localeCompare(b);
    });

    sortedPeriods.forEach((period, index) => {
      const revenue = groupedData[period];
      let percentageChange = null;
      let changeDirection = null;

      if (index > 0) {
        const previousRevenue = groupedData[sortedPeriods[index - 1]];
        if (previousRevenue > 0) {
          percentageChange = ((revenue - previousRevenue) / previousRevenue) * 100;
          changeDirection = percentageChange >= 0 ? 'increase' : 'decrease';
        }
      }

      periods.push({
        period,
        revenue,
        percentage_change: percentageChange,
        change_direction: changeDirection
      });
    });

    const currentPeriod = sortedPeriods[sortedPeriods.length - 1] || null;

    return { periods, current_period: currentPeriod };
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

  _parseQuarter(quarterStr) {
    // Parse quarter strings like "Q1 2024", "Q2 2024", "Q1-2024", etc.
    // Handle multiple possible formats
    let quarter, year;
    
    // Try format "Q1 2024"
    const spaceParts = quarterStr.split(' ');
    if (spaceParts.length === 2) {
      quarter = parseInt(spaceParts[0].charAt(1));
      year = parseInt(spaceParts[1]);
    } else {
      // Try format "Q1-2024"
      const dashParts = quarterStr.split('-');
      if (dashParts.length === 2) {
        quarter = parseInt(dashParts[0].charAt(1));
        year = parseInt(dashParts[1]);
      } else {
        // Try to extract quarter and year from any format
        const quarterMatch = quarterStr.match(/Q(\d)/);
        const yearMatch = quarterStr.match(/(\d{4})/);
        
        if (quarterMatch && yearMatch) {
          quarter = parseInt(quarterMatch[1]);
          year = parseInt(yearMatch[1]);
        } else {
          console.warn('Invalid quarter format:', quarterStr);
          return 0; // Return 0 for invalid formats
        }
      }
    }
    
    if (isNaN(quarter) || isNaN(year)) {
      console.warn('Invalid quarter or year in:', quarterStr);
      return 0;
    }
    
    // Map to a chronological order: Q1 2024 = 1, Q2 2024 = 2, Q1 2025 = 5, etc.
    return quarter + (year - 2000) * 4;
  }

  _applyDateRangeFilter(data, startDate, endDate) {
    if (!startDate && !endDate) return data;

    return data.filter(row => {
      const rowDate = new Date(row.Date);

      if (startDate && rowDate < new Date(startDate)) return false;
      if (endDate && rowDate > new Date(endDate)) return false;

      return true;
    });
  }

  _applyQuarterRangeFilter(data, startQuarter, endQuarter) {
    if (!startQuarter && !endQuarter) return data;

    return data.filter(row => {
      const quarter = row.Quarter;

      if (startQuarter && quarter < startQuarter) return false;
      if (endQuarter && quarter > endQuarter) return false;

      return true;
    });
  }

  _applyFiscalYearRangeFilter(data, startFiscalYear, endFiscalYear) {
    if (!startFiscalYear && !endFiscalYear) return data;

    return data.filter(row => {
      const fiscalYear = row.Fiscal_Year;

      if (startFiscalYear && fiscalYear < startFiscalYear) return false;
      if (endFiscalYear && fiscalYear > endFiscalYear) return false;

      return true;
    });
  }
}

module.exports = new ChartService(); 