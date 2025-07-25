const { getAllowedFileExtension, isFileSizeValid } = require('../utils/fileUtils');
const config = require('../config');

class ValidationService {
  validateFileUpload(file) {
    if (!file) {
      return { isValid: false, message: 'No file provided' };
    }
    
    if (!file.originalname) {
      return { isValid: false, message: 'Invalid file' };
    }
    
    if (!getAllowedFileExtension(file.originalname)) {
      return { isValid: false, message: 'Only CSV files are allowed' };
    }
    
    if (!isFileSizeValid(file)) {
      return { isValid: false, message: `File size must be less than ${config.MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }
    
    return { isValid: true, message: 'File is valid' };
  }
  
  validateCsvData(data) {
    if (!data || data.length === 0) {
      return { isValid: false, message: 'CSV file is empty' };
    }
    
    // Check for required columns
    const requiredColumns = config.EXPECTED_COLUMNS;
    const firstRow = data[0];
    
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    if (missingColumns.length > 0) {
      return { isValid: false, message: `Missing required columns: ${missingColumns.join(', ')}` };
    }
    
    // Check for data quality
    const hasValidData = data.some(row => {
      return row.Pharmacy && row.Metric && row.Value !== undefined;
    });
    
    if (!hasValidData) {
      return { isValid: false, message: 'CSV file contains no valid data rows' };
    }
    
    return { isValid: true, message: 'CSV data is valid' };
  }
}

// Global instance
const validationService = new ValidationService();

module.exports = validationService; 