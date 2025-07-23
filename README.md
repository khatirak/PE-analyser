# PE Analyser Dashboard

A Flask-based web application for analyzing pharmacy data with interactive charts and statistics.

## Features

- 📊 Interactive revenue charts
- 📈 Pharmacy statistics dashboard
- 🔍 Clickable pharmacy list viewer
- 📁 CSV file upload and processing
- 🎨 Clean, minimalist design

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open `http://localhost:5001` in your browser

## Deploy to Vercel

### Prerequisites
- [Vercel CLI](https://vercel.com/cli) installed
- Vercel account

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy the application**:
```bash
vercel
```

4. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (for first deployment)
   - What's your project's name? `pe-analyser` (or your preferred name)
   - In which directory is your code located? `./`

5. **Production deployment**:
```bash
vercel --prod
```

### Environment Configuration

The application is configured for Vercel's serverless environment:
- Flask app runs as a serverless function
- File uploads are handled in memory
- Static files are served from the `/static` directory
- Templates are served from the `/templates` directory

### Project Structure for Vercel

```
PE-analyser/
├── api/
│   └── index.py          # Main serverless function
├── static/
│   └── style.css         # CSS styles
├── templates/
│   └── index.html        # Main template
├── vercel.json           # Vercel configuration
├── requirements.txt      # Python dependencies
└── .vercelignore        # Files to ignore during deployment
```

## CSV File Format

Your CSV file should contain the following columns:
- `Pharmacy`: Pharmacy name
- `Cluster`: Pharmacy cluster/group
- `Acquisition_Date`: Date of acquisition
- `Metric`: Type of metric (e.g., "Total Revenue")
- `Fiscal_Year`: Fiscal year
- `Quarter`: Quarter information
- `Date`: Date in MMM-YY format (e.g., "Jan-24")
- `Value`: Numeric value

## Usage

1. Upload a CSV file using the drag-and-drop interface
2. View pharmacy statistics in the dashboard
3. Click on "Unique Pharmacies" card to see the full pharmacy list
4. Select pharmacies to display in the revenue chart
5. Analyze revenue trends over time

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Charts**: Chart.js
- **Data Processing**: Pandas
- **Deployment**: Vercel Serverless Functions 