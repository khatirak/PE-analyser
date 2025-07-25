const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const { ensureUploadDirectory } = require('./utils/fileUtils');
const dataService = require('./services/dataService');

// Import routes
const uploadRoutes = require('./routes/upload');
const statsRoutes = require('./routes/stats');
const pharmacyRoutes = require('./routes/pharmacy');
const revenueRoutes = require('./routes/revenue');
const metricsRoutes = require('./routes/metrics');
const chartRoutes = require('./routes/chart');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true
}));

// Ensure upload directory exists (skipped in production/serverless)
const uploadPath = ensureUploadDirectory();
if (uploadPath) {
  console.log('📁 Upload directory ready:', uploadPath);
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Add file to request for upload route
app.use('/upload', upload.single('file'), (req, res, next) => {
  if (req.file) {
    // Create a stream from the buffer for csv-parser
    const { Readable } = require('stream');
    req.file.stream = Readable.from(req.file.buffer);
  }
  next();
});

// Register routes
app.use('/', uploadRoutes);
app.use('/', statsRoutes);
app.use('/', pharmacyRoutes);
app.use('/', revenueRoutes);
app.use('/', metricsRoutes);
app.use('/', chartRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Backend is running' });
});

// Load sample data if available (skipped in production/serverless)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const sampleCsvPath = path.join(__dirname, '..', 'backend', 'uploads', 'Cur8_formulaKhatira.csv');
  if (fs.existsSync(sampleCsvPath)) {
    try {
      const sampleFile = {
        stream: fs.createReadStream(sampleCsvPath),
        originalname: 'Cur8_formulaKhatira.csv'
      };
      
      dataService.loadData(sampleFile)
        .then(result => {
          if (result.success) {
            console.log(`✅ Sample data loaded: ${result.message}`);
          } else {
            console.log(`⚠️  Could not load sample data: ${result.message}`);
          }
        })
        .catch(error => {
          console.log(`⚠️  Error loading sample data: ${error.message}`);
        });
    } catch (error) {
      console.log(`⚠️  Error loading sample data: ${error.message}`);
    }
  }
} else {
  console.log('⚠️  Skipping sample data load in production/serverless environment');
}

// Serve static files for React app (if needed)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 