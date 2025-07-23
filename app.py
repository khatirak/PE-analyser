from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variable to store the current dataset
current_data = None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global current_data
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Read the CSV file (first row is treated as column names)
            current_data = pd.read_csv(filepath, header=0)
            
            # Basic validation
            expected_columns = ['Pharmacy', 'Cluster', 'Acquisition_Date', 'Metric', 'Fiscal_Year', 'Quarter', 'Date', 'Value']
            if not all(col in current_data.columns for col in expected_columns):
                return jsonify({'error': 'CSV file does not contain expected columns'}), 400
            
            # Calculate basic stats
            stats = {
                'total_rows': len(current_data),
                'unique_pharmacies': current_data['Pharmacy'].nunique(),
                'columns': list(current_data.columns)
            }
            
            return jsonify({
                'message': 'File uploaded successfully',
                'stats': stats
            })
            
        except Exception as e:
            return jsonify({'error': f'Error processing file: {str(e)}'}), 400
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/stats')
def get_stats():
    global current_data
    
    if current_data is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    try:
        stats = {
            'total_rows': len(current_data),
            'unique_pharmacies': current_data['Pharmacy'].nunique(),
            'unique_clusters': current_data['Cluster'].nunique(),
            'unique_metrics': current_data['Metric'].nunique(),
            'date_range': {
                'start': current_data['Date'].min(),
                'end': current_data['Date'].max()
            } if 'Date' in current_data.columns else None
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': f'Error calculating stats: {str(e)}'}), 400

@app.route('/api/pharmacies')
def get_pharmacies():
    global current_data
    
    if current_data is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    try:
        pharmacies = current_data['Pharmacy'].unique().tolist()
        return jsonify(pharmacies)
    except Exception as e:
        return jsonify({'error': f'Error getting pharmacies: {str(e)}'}), 400

@app.route('/api/revenue-data')
def get_revenue_data():
    global current_data
    
    if current_data is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    try:
        # Get selected pharmacies from query parameter
        selected_pharmacies_param = request.args.get('pharmacies', '')
        selected_pharmacies = []
        if selected_pharmacies_param:
            selected_pharmacies = [p.strip() for p in selected_pharmacies_param.split(',') if p.strip()]
        
        # Filter for Total Revenue metric only
        revenue_data = current_data[current_data['Metric'] == 'Total Revenue'].copy()
        
        if revenue_data.empty:
            return jsonify({'error': 'No Total Revenue data found'}), 400
        
        # Filter by selected pharmacies if specified
        if selected_pharmacies:
            revenue_data = revenue_data[revenue_data['Pharmacy'].isin(selected_pharmacies)]
            if revenue_data.empty:
                return jsonify({'error': 'No data found for selected pharmacies'}), 400
        
        # Convert Date to datetime for proper sorting
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
        
        # Get current date and filter data up to current month
        current_date = datetime.now()
        current_month_start = current_date.replace(day=1)
        
        # Filter data to only include dates up to current month
        revenue_data = revenue_data[revenue_data['Date'] <= current_month_start]
        
        # Sort by date
        revenue_data = revenue_data.sort_values('Date')
        
        # Get unique dates and pharmacies (filtered to current date)
        dates = revenue_data['Date'].dt.strftime('%b-%y').unique().tolist()
        pharmacies = revenue_data['Pharmacy'].unique().tolist()
        
        # Create the chart data structure
        datasets = []
        colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
        ]
        
        for i, pharmacy in enumerate(pharmacies):
            pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
            
            # Create data points for each date
            data_points = []
            for date in dates:
                date_data = pharmacy_data[pharmacy_data['Date'].dt.strftime('%b-%y') == date]
                if not date_data.empty:
                    data_points.append(date_data['Value'].iloc[0])
                else:
                    data_points.append(0)
            
            datasets.append({
                'label': pharmacy,
                'data': data_points,
                'borderColor': colors[i % len(colors)],
                'backgroundColor': colors[i % len(colors)] + '20',
                'fill': False,
                'tension': 0.1
            })
        
        return jsonify({
            'labels': dates,
            'datasets': datasets
        })
        
    except Exception as e:
        return jsonify({'error': f'Error getting revenue data: {str(e)}'}), 400

@app.route('/api/monthly-revenue')
def get_monthly_revenue():
    global current_data
    
    if current_data is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    try:
        # Filter for Total Revenue metric only
        revenue_data = current_data[current_data['Metric'] == 'Total Revenue'].copy()
        
        if revenue_data.empty:
            return jsonify({'error': 'No Total Revenue data found'}), 400
        
        # Convert Date to datetime for proper processing
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
        
        # Group by month and sum the revenue across all pharmacies
        monthly_revenue = revenue_data.groupby(revenue_data['Date'].dt.to_period('M'))['Value'].sum().reset_index()
        monthly_revenue['Date'] = monthly_revenue['Date'].astype(str)
        
        # Get current month (most recent month in data)
        current_month_period = revenue_data['Date'].max().to_period('M')
        current_month_str = str(current_month_period)
        
        # Format the data for the frontend
        months_data = []
        current_revenue = 0
        
        for _, row in monthly_revenue.iterrows():
            month_formatted = pd.Period(row['Date']).strftime('%b-%y')
            revenue = float(row['Value'])
            
            months_data.append({
                'month': month_formatted,
                'revenue': revenue
            })
            
            if row['Date'] == current_month_str:
                current_revenue = revenue
        
        # Sort by date (most recent first)
        months_data.sort(key=lambda x: pd.to_datetime(x['month'], format='%b-%y'), reverse=True)
        
        # Get current month formatted
        current_month_formatted = pd.Period(current_month_str).strftime('%b-%y')
        
        return jsonify({
            'months': months_data,
            'current_month': current_month_formatted,
            'current_revenue': current_revenue
        })
        
    except Exception as e:
        return jsonify({'error': f'Error getting monthly revenue: {str(e)}'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001) 