const fs = require('fs');
const path = require('path');
const config = require('../config');

function ensureUploadDirectory() {
  // Skip directory creation in serverless environments (like Vercel)
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    console.log('⚠️  Skipping upload directory creation in production/serverless environment');
    return null;
  }
  
  const uploadPath = path.join(__dirname, '..', config.UPLOAD_FOLDER);
  
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Upload directory created:', uploadPath);
    }
    return uploadPath;
  } catch (error) {
    console.warn('⚠️  Could not create upload directory:', error.message);
    return null;
  }
}

function getAllowedFileExtension(filename) {
  if (!filename) return false;
  
  const ext = path.extname(filename).toLowerCase();
  return config.ALLOWED_EXTENSIONS.includes(ext);
}

function getFileSize(file) {
  if (!file) return 0;
  
  return file.size || 0;
}

function isFileSizeValid(file) {
  const size = getFileSize(file);
  return size <= config.MAX_FILE_SIZE;
}

module.exports = {
  ensureUploadDirectory,
  getAllowedFileExtension,
  getFileSize,
  isFileSizeValid
}; 