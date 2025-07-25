# Migration Guide: Python to Node.js Backend

## Overview

The PE Analyser backend has been successfully converted from Python Flask to Node.js Express for easier deployment and better integration with the React frontend.

## What Changed

### Backend Technology Stack
- **Before**: Python Flask + pandas
- **After**: Node.js Express + csv-parser + moment.js

### File Structure
```
backend/          # Old Python backend
backend-js/       # New Node.js backend
├── config.js
├── server.js
├── package.json
├── routes/
├── services/
└── utils/
```

### API Endpoints
All API endpoints remain the same, so **no frontend changes are required**:

- `POST /upload` - File upload
- `GET /stats` - Data statistics
- `GET /pharmacies` - Pharmacy list
- `GET /clusters` - Cluster list
- `GET /metrics` - Available metrics
- `GET /revenue` - Revenue data
- `GET /chart` - Chart data
- `GET /health` - Health check

## Benefits of Node.js Backend

1. **Easier Deployment**: Single language (JavaScript) for both frontend and backend
2. **Better Performance**: Node.js is generally faster for I/O operations
3. **Simplified Dependencies**: No Python environment setup required
4. **Better Integration**: Native JSON handling, no serialization issues
5. **Cloud Deployment**: Works seamlessly with Vercel, Railway, Heroku, etc.

## Migration Steps

### 1. Install Node.js Backend
```bash
cd backend-js
npm install
```

### 2. Start the New Backend
```bash
# Development
npm run dev

# Production
npm start
```

### 3. Update Frontend Configuration (Already Done)
The frontend API configuration has been updated to work with the new backend endpoints.

### 4. Test the Application
- Upload a CSV file
- Verify all charts and data display correctly
- Check that all filters work as expected

## Deployment Options

### Vercel (Recommended)
```bash
vercel
```

### Railway
```bash
railway login
railway init
railway up
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

## Environment Variables

Set these environment variables for production:

```bash
PORT=5001
SECRET_KEY=your-secret-key
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the port in `config.js`
   - Or kill the process using the port

2. **CORS Errors**
   - Update `CORS_ORIGINS` in `config.js`
   - Add your frontend URL to the allowed origins

3. **File Upload Issues**
   - Check file size limits in `config.js`
   - Ensure CSV format is correct

### Performance Optimization

1. **Memory Usage**: The backend loads data into memory. For large datasets, consider database storage
2. **File Processing**: CSV parsing is done in memory for better performance
3. **Caching**: Consider adding Redis for caching if needed

## Rollback Plan

If you need to rollback to the Python backend:

1. Stop the Node.js server
2. Start the Python Flask server: `cd backend && python app.py`
3. Update frontend config to point to Python backend URLs

## Support

The Node.js backend maintains full compatibility with the existing frontend. All features work exactly the same as before. 