# PE Analyser - Pharmacy Revenue Analytics Dashboard

A modern, interactive analytics dashboard for pharmacy revenue data built with React, Recharts, and Flask.

## 🚀 Features

- **Interactive Charts**: Beautiful, responsive charts using Recharts
- **General Metric Support**: Dropdown to select from any of the 9 available metrics
- **Multiple View Types**: Month, Fiscal Year, and Quarter views
- **Custom Range Filtering**: Filter data by custom date, fiscal year, or quarter ranges
- **Total Line Toggle**: Show/hide the total line (black dashed line) for aggregated data
- **Live Date Limits**: Current date is used as the upper limit for date ranges
- **Pharmacy Management**: Select/deselect pharmacies with acquisition status indicators
- **Acquisition Date Filtering**: Filter data from pharmacy acquisition dates onwards
- **Real-time Updates**: Charts update automatically when filters change
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Drag & Drop Upload**: Easy CSV file upload with drag & drop support

## 📁 Project Structure

```
PE-analyser/
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── common/      # Reusable components (Header, Sidebar, Modal)
│   │   │   ├── charts/      # Chart-related components (RevenueChart, StatsGrid)
│   │   │   ├── filters/     # Filter components (RangeSelector, ViewSelector, PharmacySelector)
│   │   │   └── dashboard/   # Dashboard-specific components (Dashboard, RevenueCard)
│   │   ├── context/         # React context for state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── constants/       # Constants and configuration
│   │   ├── styles/          # CSS and styling
│   │   ├── App.js           # Main app component
│   │   └── index.js         # React entry point
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind CSS configuration
├── backend/                  # Flask backend
│   ├── api/                 # API endpoints
│   │   ├── routes/          # Route blueprints
│   │   │   ├── upload.py    # File upload endpoints
│   │   │   ├── pharmacy.py  # Pharmacy-related endpoints
│   │   │   ├── revenue.py   # Revenue data endpoints
│   │   │   └── stats.py     # Statistics endpoints
│   │   └── middleware/      # Middleware (CORS, etc.)
│   ├── services/            # Business logic services
│   │   ├── data_service.py  # Data processing logic
│   │   ├── chart_service.py # Chart data generation
│   │   └── validation_service.py # Data validation
│   ├── utils/               # Utility functions
│   │   ├── file_utils.py    # File handling utilities
│   │   ├── date_utils.py    # Date processing utilities
│   │   └── data_utils.py    # Data manipulation utilities
│   ├── models/              # Data models
│   │   └── data_models.py   # Data models/schemas
│   ├── config.py            # Configuration settings
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   └── uploads/             # File upload directory
├── vercel.json              # Vercel deployment configuration
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Recharts** - Beautiful, composable charting library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Backend
- **Flask** - Python web framework
- **Pandas** - Data manipulation and analysis
- **Flask-CORS** - Cross-origin resource sharing

## 🏗️ Architecture

### Backend Architecture
The backend follows a modular, service-oriented architecture:

- **API Routes**: Organized into blueprints by functionality
- **Services**: Business logic separated into focused service classes
- **Utils**: Reusable utility functions for common operations
- **Models**: Data models and schemas for type safety
- **Config**: Centralized configuration management

### Frontend Architecture
The frontend follows a component-based architecture:

- **Common Components**: Reusable UI components (Header, Sidebar, etc.)
- **Feature Components**: Components organized by feature/domain
- **Context**: Global state management using React Context
- **Hooks**: Custom React hooks for reusable logic
- **Utils**: Utility functions for API calls and data processing

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PE-analyser
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   python app.py
   ```
   The Flask server will run on `http://localhost:5001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The React app will run on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### Production Build

1. **Build the React app**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve with Flask**
   The Flask app is configured to serve the built React app from the `frontend/build` directory.

## 📊 Data Format

The application expects CSV files with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Pharmacy | Pharmacy name | "Pharmacy A" |
| Cluster | Cluster/group | "North" |
| Acquisition_Date | Acquisition date | "Jan-24" |
| Metric | Metric type | "Total Revenue" |
| Fiscal_Year | Fiscal year | 2025 |
| Quarter | Fiscal quarter | "Q1" |
| Date | Date in MMM-YY format | "Jan-24" |
| Value | Revenue value | 150000 |

## 🎯 Key Features Explained

### Interactive Charts
- **General Metric Charts**: Support for any of the 9 available metrics with dropdown selection
- **Line Charts**: Show metric trends over time for selected pharmacies
- **Total Line Toggle**: Show/hide aggregated total line (black dashed line)
- **Responsive Design**: Charts adapt to screen size
- **Custom Tooltips**: Detailed information on hover with proper formatting
- **Legend**: Toggle individual pharmacy lines
- **Smart Formatting**: Currency formatting for revenue metrics, number formatting for others
- **Live Date Limits**: Current date automatically used as upper limit for date ranges

### View Types
- **Month View**: Monthly revenue trends
- **Fiscal Year View**: Annual revenue by fiscal year
- **Quarter View**: Quarterly revenue within fiscal years

### Range Filtering
- **Date Range**: Filter by custom month ranges
- **Fiscal Year Range**: Filter by fiscal year ranges
- **Quarter Range**: Filter by quarter ranges
- **Reset Functionality**: Quick reset to show all data

### Pharmacy Management
- **Status Indicators**: Visual indicators for acquired vs pipeline pharmacies
- **Bulk Selection**: Select/deselect all pharmacies
- **Acquisition Filter**: Filter data from acquisition dates onwards
- **Auto-deselection**: Pipeline pharmacies auto-deselected when acquisition filter is enabled

## 🔧 Configuration

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL (defaults to `http://localhost:5001`)

### Backend Configuration
Configuration is centralized in `backend/config.py`:
- Flask settings
- File upload settings
- CORS settings
- Data validation rules
- Chart configuration

### Frontend Configuration
Configuration is centralized in `frontend/src/constants/config.js`:
- API endpoints
- Chart colors and animations
- View types
- UI constants

## 🚀 Deployment

### Vercel Deployment
The project includes `vercel.json` configuration for easy deployment to Vercel.

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

### Other Platforms
The Flask app can be deployed to any platform that supports Python applications (Heroku, Railway, etc.).

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository. 