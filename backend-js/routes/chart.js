const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/chart', (req, res) => {
  try {
    const { pharmacies, metric, acquisition_date, date_range_start, date_range_end } = req.query;
    
    console.log('🔍 Chart request received:', { 
      pharmacies, 
      metric, 
      acquisition_date, 
      date_range_start, 
      date_range_end 
    });
    
    // Parse query parameters - handle both string and array formats
    let pharmacyList = null;
    if (pharmacies) {
      if (Array.isArray(pharmacies)) {
        pharmacyList = pharmacies;
      } else if (typeof pharmacies === 'string') {
        pharmacyList = pharmacies.split(',');
      }
    }
    
    console.log('📊 Parsed pharmacy list:', pharmacyList);
    
    const chartData = dataService.getChartData(
      pharmacyList,
      metric,
      acquisition_date,
      date_range_start,
      date_range_end
    );
    
    console.log('✅ Chart data response:', { 
      hasData: !!chartData, 
      labelsCount: chartData?.labels?.length,
      datasetsCount: chartData?.datasets?.length,
      dateRange: date_range_start && date_range_end ? `${date_range_start} to ${date_range_end}` : 'No filter'
    });
    
    res.json(chartData);
  } catch (error) {
    console.error('❌ Chart error:', error);
    res.status(500).json({ error: 'Error fetching chart data' });
  }
});

module.exports = router; 