const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/pharmacies', (req, res) => {
  try {
    const pharmacies = dataService.getPharmacies();
    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pharmacies' });
  }
});

router.get('/clusters', (req, res) => {
  try {
    const clusters = dataService.getClusters();
    res.json(clusters);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clusters' });
  }
});

module.exports = router; 