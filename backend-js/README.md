# PE Analyser Backend (Node.js)

This is the Node.js/Express backend for the PE Analyser application, converted from the original Python Flask backend for easier deployment.

## Features

- File upload and CSV processing
- Data validation and statistics
- Pharmacy and cluster management
- Revenue data analysis
- Chart data generation
- RESTful API endpoints

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### File Upload
- `POST /upload` - Upload CSV file

### Data Statistics
- `GET /stats` - Get basic data statistics

### Pharmacy Management
- `GET /pharmacies` - Get all pharmacies
- `GET /clusters` - Get all clusters

### Metrics
- `GET /metrics` - Get available metrics

### Revenue Data
- `GET /revenue` - Get revenue data with optional filters
  - Query params: `pharmacies`, `acquisition_dates`, `acquisition_date`

### Chart Data
- `GET /chart` - Get chart data with optional filters
  - Query params: `pharmacies`, `metric`, `acquisition_date`

## Configuration

Edit `config.js` to modify:
- Server port
- CORS origins
- File upload limits
- Expected CSV columns
- Chart colors

## Deployment

### Vercel Deployment

1. **Create `vercel.json` in the root directory:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend-js/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "backend-js/server.js"
       }
     ]
   }
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```

### Railway Deployment

1. **Create `railway.json`:**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "cd backend-js && npm start",
       "healthcheckPath": "/health",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

### Heroku Deployment

1. **Create `Procfile` in the root directory:**
   ```
   web: cd backend-js && npm start
   ```

2. **Deploy to Heroku:**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

## Environment Variables

- `PORT` - Server port (default: 5001)
- `SECRET_KEY` - Application secret key
- `NODE_ENV` - Environment (development/production)

## File Structure

```
backend-js/
├── config.js              # Configuration
├── server.js              # Main server file
├── package.json           # Dependencies
├── routes/                # API routes
│   ├── upload.js
│   ├── stats.js
│   ├── pharmacy.js
│   ├── revenue.js
│   ├── metrics.js
│   └── chart.js
├── services/              # Business logic
│   ├── dataService.js
│   └── validationService.js
└── utils/                 # Utility functions
    ├── dataUtils.js
    ├── dateUtils.js
    └── fileUtils.js
```

## Migration from Python Backend

This Node.js backend is a direct conversion of the Python Flask backend with:

- **Express.js** instead of Flask
- **csv-parser** instead of pandas
- **moment.js** for date handling
- **multer** for file uploads
- **cors** for CORS handling

All API endpoints maintain the same interface, so the frontend doesn't need any changes. 