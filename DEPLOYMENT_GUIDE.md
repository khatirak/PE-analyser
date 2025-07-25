# PE Analyser - Vercel Deployment Guide

## Overview
This guide will help you deploy the PE Analyser application to Vercel. The application consists of:
- **Frontend**: React application (in `/frontend`)
- **Backend**: Node.js Express API (in `/backend-js`)

## Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository structure looks like this:
```
PE-analyser/
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
├── backend-js/
│   ├── package.json
│   ├── server.js
│   └── ...
├── vercel.json
└── README.md
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Import Project**: Click "New Project"
3. **Connect Repository**: Select your Git repository
4. **Configure Project**:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as `/` (root)
   - **Build Command**: Leave empty (Vercel will use vercel.json)
   - **Output Directory**: Leave empty (Vercel will use vercel.json)
5. **Environment Variables**: Add these if needed:
   ```
   NODE_ENV=production
   ```
6. **Deploy**: Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Deploy**: `vercel`
4. **Follow prompts**: Vercel will detect the configuration automatically

### 3. Configuration Files

#### vercel.json
This file is already configured to handle both frontend and backend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "backend-js/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/stats",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/pharmacies",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/clusters",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/metrics",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/chart",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/revenue",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/upload",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/health",
      "dest": "backend-js/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### 4. Environment Variables

#### Frontend Environment Variables
The frontend will automatically use the same domain as the backend, so no additional environment variables are needed.

#### Backend Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
NODE_ENV=production
PORT=3000
SECRET_KEY=your-secret-key-here
```

### 5. File Upload Configuration

For file uploads to work on Vercel, you'll need to use a cloud storage service since Vercel's serverless functions don't persist files. Consider:

1. **AWS S3**: For file storage
2. **Cloudinary**: For file uploads
3. **Vercel Blob**: Vercel's file storage service

For now, the upload functionality will work for testing but files won't persist between deployments.

### 6. Post-Deployment

After deployment:

1. **Test the Application**: Visit your Vercel URL
2. **Check API Endpoints**: Test `/health` endpoint
3. **Upload a CSV**: Try uploading your sample data
4. **Verify Charts**: Ensure all functionality works

### 7. Custom Domain (Optional)

1. **Add Domain**: Go to Project Settings → Domains
2. **Configure DNS**: Follow Vercel's DNS instructions
3. **SSL Certificate**: Automatically provided by Vercel

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in package.json
   - Ensure Node.js version is compatible (14+)

2. **API Routes Not Working**:
   - Verify vercel.json routes are correct
   - Check that backend-js/server.js exists

3. **CORS Errors**:
   - Ensure CORS_ORIGINS includes your Vercel domain
   - Check browser console for specific errors

4. **File Upload Issues**:
   - Remember that Vercel serverless functions don't persist files
   - Consider implementing cloud storage

### Debugging

1. **Check Vercel Logs**: Dashboard → Project → Functions → View Logs
2. **Test API Endpoints**: Use tools like Postman or curl
3. **Browser Console**: Check for frontend errors

## Production Considerations

1. **Database**: Consider adding a database (MongoDB Atlas, PostgreSQL, etc.)
2. **File Storage**: Implement cloud storage for file uploads
3. **Monitoring**: Set up error tracking (Sentry, etc.)
4. **Backup**: Regular backups of your data
5. **Security**: Review security headers and CORS settings

## Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review the application logs in Vercel dashboard
3. Test locally first to isolate issues

## Next Steps

After successful deployment:
1. Set up monitoring and analytics
2. Configure custom domain
3. Implement proper file storage
4. Add database for data persistence
5. Set up CI/CD for automatic deployments 