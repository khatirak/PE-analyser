# PE Analyser - Pharmacy Revenue Analytics Dashboard

A modern, interactive analytics dashboard for pharmacy revenue data built with React, Recharts, and Flask.

## 🚀 Features

- **Interactive Charts**: Beautiful, responsive charts using Recharts
- **Multiple View Types**: Month, Fiscal Year, and Quarter views
- **Custom Range Filtering**: Filter data by custom date, fiscal year, or quarter ranges
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
│   │   ├── context/         # React context for state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # React entry point
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind CSS configuration
├── backend/                  # Flask backend
│   ├── api/                 # API endpoints
│   ├── utils/               # Backend utilities
│   ├── uploads/             # File upload directory
│   ├── app.py               # Main Flask application
│   └── requirements.txt     # Python dependencies
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
   The Flask server will run on `http://localhost:5000`

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
- **Line Charts**: Show revenue trends over time
- **Responsive Design**: Charts adapt to screen size
- **Custom Tooltips**: Detailed information on hover
- **Legend**: Toggle individual pharmacy lines
- **Currency Formatting**: Proper GBP formatting

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
- `REACT_APP_API_URL`: Backend API URL (defaults to `http://localhost:5000`)

### Tailwind CSS
Custom colors and animations are defined in `frontend/tailwind.config.js`:
- Primary colors for the brand
- Success colors for acquired pharmacies
- Warning colors for pipeline pharmacies
- Custom animations for smooth transitions

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