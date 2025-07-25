const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/metrics', (req, res) => {
  try {
    const metrics = dataService.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

module.exports = router; 