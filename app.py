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
        # Get parameters
        selected_pharmacies_param = request.args.get('pharmacies', '')
        view_type = request.args.get('view_type', 'month')
        
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
        
        if view_type == 'month':
            return _create_monthly_chart_data_app(revenue_data)
        elif view_type == 'fiscal_year':
            return _create_fiscal_year_chart_data_app(revenue_data)
        elif view_type == 'quarter':
            return _create_quarter_chart_data_app(revenue_data)
        else:
            return jsonify({'error': 'Invalid view type'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Error getting revenue data: {str(e)}'}), 400

def _create_monthly_chart_data_app(revenue_data):
    # Convert Date to datetime for proper sorting
    revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
    
    # Get current date and filter data up to current month
    current_date = datetime.now()
    current_month_start = current_date.replace(day=1)
    
    # Filter data to only include dates up to current month
    revenue_data = revenue_data[revenue_data['Date'] <= current_month_start]
    
    # Sort by date
    revenue_data = revenue_data.sort_values('Date')
    
    # Get unique dates and pharmacies
    dates = revenue_data['Date'].dt.strftime('%b-%y').unique().tolist()
    pharmacies = revenue_data['Pharmacy'].unique().tolist()
    
    # Create the chart data structure
    datasets = _create_chart_datasets_app(revenue_data, dates, pharmacies, '%b-%y')
    
    return jsonify({
        'labels': dates,
        'datasets': datasets
    })

def _create_fiscal_year_chart_data_app(revenue_data):
    # Group by fiscal year and pharmacy
    fy_data = revenue_data.groupby(['Fiscal_Year', 'Pharmacy'])['Value'].sum().reset_index()
    fy_data = fy_data.sort_values('Fiscal_Year')
    
    # Get unique fiscal years and pharmacies
    unique_fys = sorted(fy_data['Fiscal_Year'].unique())
    fiscal_years = []
    for fy in unique_fys:
        # Clean up the fiscal year display - remove any existing FY prefix
        fy_clean = str(fy).replace('FY', '').replace('fy', '').strip()
        fiscal_years.append(f'FY{fy_clean}')
    
    pharmacies = fy_data['Pharmacy'].unique().tolist()
    
    # Create datasets
    datasets = []
    colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ]
    
    for i, pharmacy in enumerate(pharmacies):
        pharmacy_data = fy_data[fy_data['Pharmacy'] == pharmacy]
        
        data_points = []
        for j, fy_label in enumerate(fiscal_years):
            fy_num = unique_fys[j]  # Use the original fiscal year value from data
            fy_row = pharmacy_data[pharmacy_data['Fiscal_Year'] == fy_num]
            if not fy_row.empty:
                data_points.append(fy_row['Value'].iloc[0])
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
        'labels': fiscal_years,
        'datasets': datasets
    })

def _create_quarter_chart_data_app(revenue_data):
    # Group by fiscal year, quarter, and pharmacy
    quarter_data = revenue_data.groupby(['Fiscal_Year', 'Quarter', 'Pharmacy'])['Value'].sum().reset_index()
    quarter_data = quarter_data.sort_values(['Fiscal_Year', 'Quarter'])
    
    # Create quarter labels
    quarter_labels = []
    unique_periods = quarter_data[['Fiscal_Year', 'Quarter']].drop_duplicates()
    for _, row in unique_periods.iterrows():
        fy_clean = str(row['Fiscal_Year']).replace('FY', '').replace('fy', '').strip()
        quarter_labels.append(f"{row['Quarter']} FY{fy_clean}")
    
    pharmacies = quarter_data['Pharmacy'].unique().tolist()
    
    # Create datasets
    datasets = []
    colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ]
    
    for i, pharmacy in enumerate(pharmacies):
        pharmacy_data = quarter_data[quarter_data['Pharmacy'] == pharmacy]
        
        data_points = []
        for j, label in enumerate(quarter_labels):
            quarter, fy_part = label.split(' FY')
            # Get the original fiscal year value from the unique_periods
            original_fy = unique_periods.iloc[j]['Fiscal_Year']
            matching_row = pharmacy_data[
                (pharmacy_data['Fiscal_Year'] == original_fy) & 
                (pharmacy_data['Quarter'] == quarter)
            ]
            if not matching_row.empty:
                data_points.append(matching_row['Value'].iloc[0])
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
        'labels': quarter_labels,
        'datasets': datasets
    })

def _create_chart_datasets_app(revenue_data, labels, pharmacies, format_str):
    datasets = []
    colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ]
    
    for i, pharmacy in enumerate(pharmacies):
        pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
        
        data_points = []
        for label in labels:
            if format_str == '%b-%y':
                label_data = pharmacy_data[pharmacy_data['Date'].dt.strftime(format_str) == label]
            else:
                label_data = pharmacy_data  # For non-date based grouping
            
            if not label_data.empty:
                data_points.append(label_data['Value'].iloc[0])
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
    
    return datasets

@app.route('/api/revenue-by-period')
def get_revenue_by_period():
    global current_data
    
    if current_data is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    view_type = request.args.get('view_type', 'month')
    
    try:
        # Filter for Total Revenue metric only
        revenue_data = current_data[current_data['Metric'] == 'Total Revenue'].copy()
        
        if revenue_data.empty:
            return jsonify({'error': 'No Total Revenue data found'}), 400
        
        # Convert Date to datetime for proper processing
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
        
        if view_type == 'month':
            return _process_monthly_data(revenue_data)
        elif view_type == 'fiscal_year':
            return _process_fiscal_year_data(revenue_data)
        elif view_type == 'quarter':
            return _process_quarter_data(revenue_data)
        else:
            return jsonify({'error': 'Invalid view type'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Error getting revenue data: {str(e)}'}), 400

def _process_monthly_data(revenue_data):
    # Group by month and sum the revenue across all pharmacies
    monthly_revenue = revenue_data.groupby(revenue_data['Date'].dt.to_period('M'))['Value'].sum().reset_index()
    monthly_revenue['Date'] = monthly_revenue['Date'].astype(str)
    
    # Sort by date (earliest to latest)
    monthly_revenue = monthly_revenue.sort_values('Date')
    
    # Get current live month
    current_live_month = pd.Timestamp.now().to_period('M')
    current_live_month_str = str(current_live_month)
    
    # Find current revenue
    current_revenue = 0
    current_period_display = ""
    
    live_month_data = monthly_revenue[monthly_revenue['Date'] == current_live_month_str]
    if not live_month_data.empty:
        current_revenue = float(live_month_data.iloc[0]['Value'])
        current_period_display = current_live_month.strftime('%b-%y')
    else:
        most_recent = monthly_revenue.iloc[-1]
        current_revenue = float(most_recent['Value'])
        current_period_display = pd.Period(most_recent['Date']).strftime('%b-%y')
    
    # Format data with percentage changes
    periods_data = []
    previous_revenue = None
    
    for _, row in monthly_revenue.iterrows():
        period_formatted = pd.Period(row['Date']).strftime('%b-%y')
        revenue = float(row['Value'])
        
        percentage_change = None
        change_direction = None
        if previous_revenue is not None and previous_revenue > 0:
            percentage_change = ((revenue - previous_revenue) / previous_revenue) * 100
            change_direction = 'increase' if percentage_change > 0 else 'decrease'
        
        periods_data.append({
            'period': period_formatted,
            'revenue': revenue,
            'percentage_change': round(percentage_change, 1) if percentage_change is not None else None,
            'change_direction': change_direction
        })
        
        previous_revenue = revenue
    
    return jsonify({
        'periods': periods_data,
        'current_period': current_period_display,
        'current_revenue': current_revenue,
        'live_period': current_live_month.strftime('%b-%y'),
        'view_type': 'month'
    })

def _process_fiscal_year_data(revenue_data):
    # Group by fiscal year
    fiscal_year_revenue = revenue_data.groupby('Fiscal_Year')['Value'].sum().reset_index()
    fiscal_year_revenue = fiscal_year_revenue.sort_values('Fiscal_Year')
    
    # Get current UK fiscal year (April 6 - April 5)
    # FY is named after the year it ends in
    current_date = pd.Timestamp.now()
    if current_date.month < 4 or (current_date.month == 4 and current_date.day < 6):
        # Before April 6, so we're in the fiscal year that ends this year
        current_fy = current_date.year + 1
    else:
        # After April 6, so we're in the fiscal year that ends next year
        current_fy = current_date.year + 2
    
    # Find revenue for current fiscal year or use most recent available
    current_fy_data = fiscal_year_revenue[fiscal_year_revenue['Fiscal_Year'] == current_fy]
    if not current_fy_data.empty:
        current_revenue = float(current_fy_data.iloc[0]['Value'])
        current_fy_display = current_fy
    else:
        # Use most recent fiscal year in data
        most_recent = fiscal_year_revenue.iloc[-1]
        current_revenue = float(most_recent['Value'])
        current_fy_display = most_recent['Fiscal_Year']
    
    # Format data with percentage changes
    periods_data = []
    previous_revenue = None
    
    for _, row in fiscal_year_revenue.iterrows():
        fy = row['Fiscal_Year']
        revenue = float(row['Value'])
        
        percentage_change = None
        change_direction = None
        if previous_revenue is not None and previous_revenue > 0:
            percentage_change = ((revenue - previous_revenue) / previous_revenue) * 100
            change_direction = 'increase' if percentage_change > 0 else 'decrease'
        
        # Clean up the fiscal year display - remove any existing FY prefix
        fy_clean = str(fy).replace('FY', '').replace('fy', '').strip()
        
        periods_data.append({
            'period': f'FY{fy_clean}',
            'revenue': revenue,
            'percentage_change': round(percentage_change, 1) if percentage_change is not None else None,
            'change_direction': change_direction
        })
        
        previous_revenue = revenue
    
    current_fy_clean = str(current_fy_display).replace('FY', '').replace('fy', '').strip()
    
    return jsonify({
        'periods': periods_data,
        'current_period': f'FY{current_fy_clean}',
        'current_revenue': current_revenue,
        'live_period': f'FY{current_fy_clean}',
        'view_type': 'fiscal_year'
    })

def _process_quarter_data(revenue_data):
    # Create a fiscal quarter column combining FY and Quarter
    revenue_data['FY_Quarter'] = revenue_data['Fiscal_Year'].astype(str) + '-' + revenue_data['Quarter']
    
    # Group by fiscal year and quarter
    quarter_revenue = revenue_data.groupby(['Fiscal_Year', 'Quarter'])['Value'].sum().reset_index()
    quarter_revenue = quarter_revenue.sort_values(['Fiscal_Year', 'Quarter'])
    
    # Get current UK fiscal year and quarter
    # FY is named after the year it ends in
    current_date = pd.Timestamp.now()
    if current_date.month < 4 or (current_date.month == 4 and current_date.day < 6):
        # Before April 6, so we're in the fiscal year that ends this year
        current_fy = current_date.year + 1
    else:
        # After April 6, so we're in the fiscal year that ends next year
        current_fy = current_date.year + 2
    
    # Determine current quarter within fiscal year (April-March)
    if current_date.month >= 4:
        # April to December (Q1-Q3)
        if current_date.month <= 6:
            current_q = 'Q1'
        elif current_date.month <= 9:
            current_q = 'Q2'
        elif current_date.month <= 12:
            current_q = 'Q3'
    else:
        # January to March (Q4)
        current_q = 'Q4'
    
    # Find revenue for current quarter or use most recent available
    current_quarter_data = quarter_revenue[
        (quarter_revenue['Fiscal_Year'] == current_fy) & 
        (quarter_revenue['Quarter'] == current_q)
    ]
    
    if not current_quarter_data.empty:
        current_revenue = float(current_quarter_data.iloc[0]['Value'])
        current_fy_display = current_fy
        current_q_display = current_q
    else:
        # Use most recent quarter in data
        most_recent = quarter_revenue.iloc[-1]
        current_revenue = float(most_recent['Value'])
        current_fy_display = most_recent['Fiscal_Year']
        current_q_display = most_recent['Quarter']
    
    # Format data with percentage changes
    periods_data = []
    previous_revenue = None
    
    for _, row in quarter_revenue.iterrows():
        fy = row['Fiscal_Year']
        quarter = row['Quarter']
        revenue = float(row['Value'])
        
        percentage_change = None
        change_direction = None
        if previous_revenue is not None and previous_revenue > 0:
            percentage_change = ((revenue - previous_revenue) / previous_revenue) * 100
            change_direction = 'increase' if percentage_change > 0 else 'decrease'
        
        # Clean up the fiscal year display
        fy_clean = str(fy).replace('FY', '').replace('fy', '').strip()
        
        periods_data.append({
            'period': f'{quarter} FY{fy_clean}',
            'revenue': revenue,
            'percentage_change': round(percentage_change, 1) if percentage_change is not None else None,
            'change_direction': change_direction
        })
        
        previous_revenue = revenue
    
    current_fy_clean = str(current_fy_display).replace('FY', '').replace('fy', '').strip()
    
    return jsonify({
        'periods': periods_data,
        'current_period': f'{current_q_display} FY{current_fy_clean}',
        'current_revenue': current_revenue,
        'live_period': f'{current_q_display} FY{current_fy_clean}',
        'view_type': 'quarter'
    })

# Keep the old endpoint for backward compatibility
@app.route('/api/monthly-revenue')
def get_monthly_revenue():
    return get_revenue_by_period()

if __name__ == '__main__':
    app.run(debug=True, port=5001) 