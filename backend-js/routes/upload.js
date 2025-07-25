const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const validationService = require('../services/validationService');

router.post('/upload', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file part' });
    }
    
    // Validate file upload
    const validation = validationService.validateFileUpload(req.file);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }
    
    // Load data
    const loadResult = await dataService.loadData(req.file);
    if (!loadResult.success) {
      return res.status(400).json({ error: loadResult.message });
    }
    
    // Validate CSV data
    const data = dataService.getData();
    const dataValidation = validationService.validateCsvData(data);
    if (!dataValidation.isValid) {
      return res.status(400).json({ error: dataValidation.message });
    }
    
    // Get basic stats
    const stats = dataService.getStats();
    
    res.json({
      message: 'File uploaded successfully',
      stats: stats,
      note: process.env.NODE_ENV === 'production' ? 'Note: Files are processed in memory and not persisted between deployments' : undefined
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({ error: `Error processing file: ${error.message}` });
  }
});

module.exports = router; 