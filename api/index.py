from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import tempfile

app = Flask(__name__, template_folder='../templates', static_folder='../static')
CORS(app)

# Configuration for serverless environment
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global variable to store the current dataset
current_data = None

ALLOWED_EXTENSIONS = {'csv'}

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
        try:
            # Read the CSV file directly from memory (first row is treated as column names)
            current_data = pd.read_csv(file, header=0)
            
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

# This is the entry point for Vercel
def handler(request):
    return app(request.environ, lambda status, headers: None)

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=5001) 