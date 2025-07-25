const fs = require('fs');
const path = require('path');
const config = require('../config');

function ensureUploadDirectory() {
  const uploadPath = path.join(__dirname, '..', config.UPLOAD_FOLDER);
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  return uploadPath;
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