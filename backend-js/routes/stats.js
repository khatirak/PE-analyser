const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/stats', (req, res) => {
  try {
    const stats = dataService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

module.exports = router; 