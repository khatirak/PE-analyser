const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/chart', (req, res) => {
  try {
    const { 
      pharmacies, 
      metric, 
      acquisition_date, 
      date_range_start, 
      date_range_end,
      view_type,
      quarter_range_start,
      quarter_range_end,
      fiscal_year_range_start,
      fiscal_year_range_end
    } = req.query;
    
    // Parse query parameters - handle both string and array formats
    let pharmacyList = null;
    if (pharmacies) {
      if (Array.isArray(pharmacies)) {
        pharmacyList = pharmacies;
      } else if (typeof pharmacies === 'string') {
        pharmacyList = pharmacies.split(',');
      }
    }
 
    const chartData = dataService.getChartData(
      pharmacyList,
      metric,
      acquisition_date,
      date_range_start,
      date_range_end,
      view_type,
      quarter_range_start,
      quarter_range_end,
      fiscal_year_range_start,
      fiscal_year_range_end
    );
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chart data' });
  }
});

router.get('/scorecard/total-revenue', (req, res) => {
  try {
    const { view_type = 'month' } = req.query;
    console.log('📊 Total Revenue Score Card request:', { view_type });
    
    const scoreCardData = dataService.getTotalRevenueScoreCardData(view_type);
    
    if (!scoreCardData) {
      console.log('⚠️ No data available for total revenue score card');
      return res.json({ periods: [], current_period: null });
    }
    
    console.log('✅ Total Revenue Score Card data:', scoreCardData);
    res.json(scoreCardData);
  } catch (error) {
    console.error('❌ Total Revenue Score Card error:', error);
    res.status(500).json({ error: 'Error fetching total revenue score card data' });
  }
});

router.get('/scorecard/selected-metric', (req, res) => {
  try {
    const { metric, view_type = 'month' } = req.query;    
    console.log('📊 Selected Metric Score Card request:', { metric, view_type });
    
    if (!metric) {
      return res.status(400).json({ error: 'Metric parameter is required' });
    }
    
    const scoreCardData = dataService.getSelectedMetricScoreCardData(metric, view_type);
    
    if (!scoreCardData) {
      console.log('⚠️ No data available for selected metric score card');
      return res.json({ periods: [], current_period: null });
    }
    
    console.log('✅ Selected Metric Score Card data:', scoreCardData);
    res.json(scoreCardData);
  } catch (error) {
    console.error('❌ Selected Metric Score Card error:', error);
    res.status(500).json({ error: 'Error fetching selected metric score card data' });
  }
});

// Test endpoint to verify scorecard routes are working
router.get('/scorecard/test', (req, res) => {
  res.json({ 
    message: 'Scorecard routes are working!',
    timestamp: new Date().toISOString(),
    dataService: !!dataService
  });
});

module.exports = router; 