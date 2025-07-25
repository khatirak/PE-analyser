const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/revenue', (req, res) => {
  try {
    const { pharmacies, acquisition_dates, acquisition_date, view_type } = req.query;
    
    console.log('🔍 Revenue request received:', { pharmacies, acquisition_dates, acquisition_date, view_type });
    
    // Parse query parameters - handle both string and array formats
    let pharmacyList = null;
    if (pharmacies) {
      if (Array.isArray(pharmacies)) {
        pharmacyList = pharmacies;
      } else if (typeof pharmacies === 'string') {
        pharmacyList = pharmacies.split(',');
      }
    }
    const acquisitionDatesMap = acquisition_dates ? JSON.parse(acquisition_dates) : null;    
    
  } catch (error) {
    console.error('❌ Revenue error:', error);
    res.status(500).json({ error: 'Error fetching revenue data' });
  }
});

module.exports = router; 