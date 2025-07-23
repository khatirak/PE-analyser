from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import json

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

# Global variable to store current data
current_data = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

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
        # Get detailed pharmacy information with acquisition status
        pharmacy_details = []
        current_date = pd.Timestamp.now()
        
        # Group by pharmacy to get unique entries with acquisition date
        pharmacy_info = current_data.groupby('Pharmacy').agg({
            'Acquisition_Date': 'first',  # Get the acquisition date for each pharmacy
            'Cluster': 'first'
        }).reset_index()
        
        for _, row in pharmacy_info.iterrows():
            pharmacy_name = row['Pharmacy']
            acquisition_date_str = row['Acquisition_Date']
            cluster = row['Cluster']
            
            # Determine if pharmacy is acquired or pipeline
            is_acquired = False
            acquisition_date = None
            
            if pd.notna(acquisition_date_str) and acquisition_date_str:
                try:
                    # Try different date formats
                    if isinstance(acquisition_date_str, str):
                        if len(acquisition_date_str) <= 7:  # Format like "Jan-24" or "01-24"
                            acquisition_date = pd.to_datetime(acquisition_date_str, format='%b-%y')
                        else:
                            # Try standard date parsing
                            acquisition_date = pd.to_datetime(acquisition_date_str)
                    else:
                        acquisition_date = pd.to_datetime(acquisition_date_str)
                    
                    # Consider acquired if acquisition date is in the past or current month
                    is_acquired = acquisition_date <= current_date
                except:
                    # If date parsing fails, consider it pipeline
                    is_acquired = False
            
            pharmacy_details.append({
                'name': pharmacy_name,
                'status': 'acquired' if is_acquired else 'pipeline',
                'acquisition_date': acquisition_date.strftime('%b-%y') if acquisition_date else None,
                'cluster': cluster
            })
        
        return jsonify(pharmacy_details)
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
        acquisition_filter = request.args.get('acquisition_filter', 'false').lower() == 'true'
        acquisition_dates_param = request.args.get('acquisition_dates', '{}')
        date_range_start = request.args.get('date_range_start', '')
        date_range_end = request.args.get('date_range_end', '')
        quarter_range_start = request.args.get('quarter_range_start', '')
        quarter_range_end = request.args.get('quarter_range_end', '')
        fiscal_year_range_start = request.args.get('fiscal_year_range_start', '')
        fiscal_year_range_end = request.args.get('fiscal_year_range_end', '')
        
        selected_pharmacies = []
        if selected_pharmacies_param:
            selected_pharmacies = [p.strip() for p in selected_pharmacies_param.split(',') if p.strip()]
        
        # Parse acquisition dates if provided
        acquisition_dates = {}
        try:
            acquisition_dates = json.loads(acquisition_dates_param)
        except:
            acquisition_dates = {}
        
        print(f"=== REVENUE DATA DEBUG ===")
        print(f"View type requested: {view_type}")
        print(f"Total data rows: {len(current_data)}")
        print(f"Available metrics: {current_data['Metric'].unique()}")
        print(f"Available columns: {current_data.columns.tolist()}")
        
        # Filter for Total Revenue metric only
        revenue_data = current_data[current_data['Metric'] == 'Total Revenue'].copy()
        
        print(f"Total Revenue data rows: {len(revenue_data)}")
        
        if revenue_data.empty:
            return jsonify({'error': 'No Total Revenue data found'}), 400
        
        # Filter by selected pharmacies if specified
        if selected_pharmacies:
            revenue_data = revenue_data[revenue_data['Pharmacy'].isin(selected_pharmacies)]
            if revenue_data.empty:
                return jsonify({'error': 'No data found for selected pharmacies'}), 400
        
        # Apply acquisition date filter if enabled
        if acquisition_filter and acquisition_dates:
            revenue_data = _apply_acquisition_filter_app(revenue_data, acquisition_dates)
        
        print(f"Final revenue data rows before chart creation: {len(revenue_data)}")
        print(f"Selected pharmacies: {selected_pharmacies}")
        print(f"Acquisition filter enabled: {acquisition_filter}")
        
        if view_type == 'month':
            return _create_monthly_chart_data_app(revenue_data, date_range_start, date_range_end)
        elif view_type == 'fiscal_year':
            return _create_fiscal_year_chart_data_app(revenue_data, fiscal_year_range_start, fiscal_year_range_end)
        elif view_type == 'quarter':
            return _create_quarter_chart_data_app(revenue_data, quarter_range_start, quarter_range_end)
        else:
            return jsonify({'error': 'Invalid view type'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Error getting revenue data: {str(e)}'}), 400

def _create_monthly_chart_data_app(revenue_data, date_range_start='', date_range_end=''):
    # Convert Date to datetime for proper sorting
    revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
    
    # Apply date range filter if provided
    if date_range_start and date_range_end:
        try:
            start_date = pd.to_datetime(date_range_start + '-01')
            end_date = pd.to_datetime(date_range_end + '-01')
            # Add one month to end_date to include the entire end month
            end_date = end_date + pd.DateOffset(months=1) - pd.DateOffset(days=1)
            
            revenue_data = revenue_data[
                (revenue_data['Date'] >= start_date) & 
                (revenue_data['Date'] <= end_date)
            ]
        except:
            # If date parsing fails, fall back to default behavior
            current_date = datetime.now()
            current_month_start = current_date.replace(day=1)
            revenue_data = revenue_data[revenue_data['Date'] <= current_month_start]
    else:
        # Default behavior: filter data up to current month
        current_date = datetime.now()
        current_month_start = current_date.replace(day=1)
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

def _create_fiscal_year_chart_data_app(revenue_data, fiscal_year_range_start='', fiscal_year_range_end=''):
    print(f"Creating fiscal year chart data with {len(revenue_data)} rows")
    print("Sample data:", revenue_data.head() if not revenue_data.empty else "No data")
    print("Columns in revenue_data:", revenue_data.columns.tolist())
    print(f"Fiscal year range: {fiscal_year_range_start} to {fiscal_year_range_end}")
    
    # Check if Fiscal_Year column exists and has data
    if 'Fiscal_Year' not in revenue_data.columns:
        print("ERROR: Fiscal_Year column not found in data")
        return {'labels': [], 'datasets': []}
    
    # Remove any rows where Fiscal_Year is null or empty
    revenue_data = revenue_data.dropna(subset=['Fiscal_Year'])
    revenue_data = revenue_data[revenue_data['Fiscal_Year'] != '']
    
    print(f"Data after removing null Fiscal_Year: {len(revenue_data)} rows")
    print("Unique Fiscal_Year values:", revenue_data['Fiscal_Year'].unique())
    
    if revenue_data.empty:
        print("ERROR: No data after filtering Fiscal_Year")
        return {'labels': [], 'datasets': []}
    
    # Apply fiscal year range filter if provided
    if fiscal_year_range_start and fiscal_year_range_end:
        try:
            # Parse start and end fiscal years (e.g., "FY2025", "FY2026")
            start_fy = int(fiscal_year_range_start.replace('FY', ''))
            end_fy = int(fiscal_year_range_end.replace('FY', ''))
            
            print(f"Filtering fiscal years from {start_fy} to {end_fy}")
            
            # Filter revenue data based on fiscal year range
            revenue_data = revenue_data[
                (revenue_data['Fiscal_Year'] >= start_fy) & 
                (revenue_data['Fiscal_Year'] <= end_fy)
            ]
            
            print(f"Data after fiscal year range filtering: {len(revenue_data)} rows")
            print("Fiscal years after filtering:", revenue_data['Fiscal_Year'].unique())
            
            if revenue_data.empty:
                print("ERROR: No data after fiscal year range filtering")
                return {'labels': [], 'datasets': []}
                
        except Exception as e:
            print(f"Error parsing fiscal year range: {e}")
            # Continue with unfiltered data if parsing fails
    
    # Group by fiscal year and pharmacy
    fy_data = revenue_data.groupby(['Fiscal_Year', 'Pharmacy'])['Value'].sum().reset_index()
    fy_data = fy_data.sort_values('Fiscal_Year')
    
    print(f"Grouped fiscal year data: {len(fy_data)} rows")
    print("Fiscal years found:", fy_data['Fiscal_Year'].unique() if not fy_data.empty else "None")
    
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

def _create_quarter_chart_data_app(revenue_data, quarter_range_start='', quarter_range_end=''):
    print(f"Creating quarter chart data with {len(revenue_data)} rows")
    print("Sample data:", revenue_data.head() if not revenue_data.empty else "No data")
    print("Columns in revenue_data:", revenue_data.columns.tolist())
    
    # Check if required columns exist
    if 'Fiscal_Year' not in revenue_data.columns or 'Quarter' not in revenue_data.columns:
        print("ERROR: Fiscal_Year or Quarter column not found in data")
        return {'labels': [], 'datasets': []}
    
    # Remove any rows where Fiscal_Year or Quarter is null or empty
    revenue_data = revenue_data.dropna(subset=['Fiscal_Year', 'Quarter'])
    revenue_data = revenue_data[(revenue_data['Fiscal_Year'] != '') & (revenue_data['Quarter'] != '')]
    
    print(f"Data after removing null Fiscal_Year/Quarter: {len(revenue_data)} rows")
    print("Unique Fiscal_Year values:", revenue_data['Fiscal_Year'].unique())
    print("Unique Quarter values:", revenue_data['Quarter'].unique())
    
    if revenue_data.empty:
        print("ERROR: No data after filtering Fiscal_Year/Quarter")
        return {'labels': [], 'datasets': []}
    
    # Group by fiscal year, quarter, and pharmacy
    quarter_data = revenue_data.groupby(['Fiscal_Year', 'Quarter', 'Pharmacy'])['Value'].sum().reset_index()
    quarter_data = quarter_data.sort_values(['Fiscal_Year', 'Quarter'])
    
    # Apply quarter range filter if provided
    if quarter_range_start and quarter_range_end:
        try:
            # Parse start quarter (e.g., "Q1-FY2025")
            start_parts = quarter_range_start.split('-FY')
            start_q = start_parts[0]
            start_fy = int(start_parts[1])
            
            # Parse end quarter (e.g., "Q2-FY2026")
            end_parts = quarter_range_end.split('-FY')
            end_q = end_parts[0]
            end_fy = int(end_parts[1])
            
            # Filter quarter data based on range
            filtered_quarters = []
            for _, row in quarter_data.iterrows():
                row_fy = row['Fiscal_Year']
                row_q = row['Quarter']
                
                # Check if this quarter falls within the selected range
                if (row_fy > start_fy or (row_fy == start_fy and row_q >= start_q)) and \
                   (row_fy < end_fy or (row_fy == end_fy and row_q <= end_q)):
                    filtered_quarters.append(row)
            
            if filtered_quarters:
                quarter_data = pd.DataFrame(filtered_quarters)
            else:
                quarter_data = pd.DataFrame(columns=quarter_data.columns)
                
        except Exception as e:
            print(f"Error parsing quarter range: {e}")
            # Continue with unfiltered data if parsing fails
    
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
                # For monthly data, match by formatted date
                matching_data = pharmacy_data[pharmacy_data['Date'].dt.strftime('%b-%y') == label]
            else:
                # For other formats, you might need different matching logic
                matching_data = pharmacy_data[pharmacy_data['Date'].dt.strftime(format_str) == label]
            
            if not matching_data.empty:
                data_points.append(matching_data['Value'].sum())
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

def _apply_acquisition_filter_app(revenue_data, acquisition_dates):
    # Convert Date column to datetime if it's not already
    if not pd.api.types.is_datetime64_any_dtype(revenue_data['Date']):
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
    
    filtered_data = []
    
    for pharmacy, acquisition_date_str in acquisition_dates.items():
        pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy].copy()
        
        if not pharmacy_data.empty and acquisition_date_str:
            try:
                # Parse acquisition date
                if len(acquisition_date_str) <= 7:  # Format like "Jan-24"
                    acquisition_date = pd.to_datetime(acquisition_date_str, format='%b-%y')
                else:
                    acquisition_date = pd.to_datetime(acquisition_date_str)
                
                # Filter data from acquisition date onwards
                pharmacy_data = pharmacy_data[pharmacy_data['Date'] >= acquisition_date]
                
                filtered_data.append(pharmacy_data)
            except Exception as e:
                print(f"Error parsing acquisition date for {pharmacy}: {e}")
                # If date parsing fails, include all data for this pharmacy
                filtered_data.append(pharmacy_data)
        else:
            # If no acquisition date, include all data for this pharmacy
            filtered_data.append(pharmacy_data)
    
    if filtered_data:
        return pd.concat(filtered_data, ignore_index=True)
    else:
        return revenue_data

@app.route('/api/revenue-by-period')
def get_revenue_by_period():
    global current_data
    
    if current_data is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    try:
        view_type = request.args.get('view_type', 'month')
        
        # Filter for Total Revenue metric only
        revenue_data = current_data[current_data['Metric'] == 'Total Revenue'].copy()
        
        if revenue_data.empty:
            return jsonify({'error': 'No Total Revenue data found'}), 400
        
        if view_type == 'month':
            return _process_monthly_data(revenue_data)
        elif view_type == 'fiscal_year':
            return _process_fiscal_year_data(revenue_data)
        elif view_type == 'quarter':
            return _process_quarter_data(revenue_data)
        else:
            return jsonify({'error': 'Invalid view type'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Error getting revenue by period: {str(e)}'}), 400

def _process_monthly_data(revenue_data):
    # Group by month and sum the revenue across all pharmacies
    revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
    
    # Default behavior: filter data up to current month
    current_date = datetime.now()
    current_month_start = current_date.replace(day=1)
    revenue_data = revenue_data[revenue_data['Date'] <= current_month_start]
    
    monthly_revenue = revenue_data.groupby('Date')['Value'].sum().reset_index()
    monthly_revenue = monthly_revenue.sort_values('Date')
    
    # Get current period (most recent month with data)
    current_period = monthly_revenue.iloc[-1]['Date']
    current_period_display = current_period.strftime('%b-%y')
    current_revenue = float(monthly_revenue.iloc[-1]['Value'])
    
    # Get current live month
    current_live_month = datetime.now().replace(day=1)
    
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
    fy_revenue = revenue_data.groupby('Fiscal_Year')['Value'].sum().reset_index()
    fy_revenue = fy_revenue.sort_values('Fiscal_Year')
    
    # Get current period (most recent fiscal year with data)
    current_period = fy_revenue.iloc[-1]['Fiscal_Year']
    current_period_display = f"FY{current_period}"
    current_revenue = float(fy_revenue.iloc[-1]['Value'])
    
    # Calculate current fiscal year
    current_date = datetime.now()
    if current_date.month < 4 or (current_date.month == 4 and current_date.day < 6):
        current_fy = current_date.year
    else:
        current_fy = current_date.year + 1
    current_live_fy = f"FY{current_fy}"
    
    # Format data with percentage changes
    periods_data = []
    previous_revenue = None
    
    for _, row in fy_revenue.iterrows():
        period_formatted = f"FY{row['Fiscal_Year']}"
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
        'live_period': current_live_fy,
        'view_type': 'fiscal_year'
    })

def _process_quarter_data(revenue_data):
    # Create a fiscal quarter column combining FY and Quarter
    revenue_data['Fiscal_Quarter'] = revenue_data['Quarter'] + ' FY' + revenue_data['Fiscal_Year'].astype(str)
    
    # Group by fiscal quarter
    quarter_revenue = revenue_data.groupby('Fiscal_Quarter')['Value'].sum().reset_index()
    
    # Sort quarters properly (Q1 FY2025, Q2 FY2025, Q3 FY2025, Q4 FY2025, Q1 FY2026, etc.)
    def sort_quarter_key(row):
        quarter = row['Fiscal_Quarter']
        q_part, fy_part = quarter.split(' FY')
        q_num = int(q_part.replace('Q', ''))
        fy_num = int(fy_part)
        return (fy_num, q_num)
    
    quarter_revenue['sort_key'] = quarter_revenue.apply(sort_quarter_key, axis=1)
    quarter_revenue = quarter_revenue.sort_values('sort_key').drop('sort_key', axis=1)
    
    # Get current period (most recent quarter with data)
    current_period = quarter_revenue.iloc[-1]['Fiscal_Quarter']
    current_revenue = float(quarter_revenue.iloc[-1]['Value'])
    
    # Calculate current quarter
    current_date = datetime.now()
    if current_date.month < 4 or (current_date.month == 4 and current_date.day < 6):
        current_fy = current_date.year
    else:
        current_fy = current_date.year + 1
    
    # Determine current quarter (Apr-Jun=Q1, Jul-Sep=Q2, Oct-Dec=Q3, Jan-Mar=Q4)
    month = current_date.month
    if month >= 4 and month <= 6:
        current_q = 'Q1'
    elif month >= 7 and month <= 9:
        current_q = 'Q2'
    elif month >= 10 and month <= 12:
        current_q = 'Q3'
    else:  # Jan-Mar
        current_q = 'Q4'
    
    current_live_quarter = f"{current_q} FY{current_fy}"
    
    # Format data with percentage changes
    periods_data = []
    previous_revenue = None
    
    for _, row in quarter_revenue.iterrows():
        period_formatted = row['Fiscal_Quarter']
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
        'current_period': current_period,
        'current_revenue': current_revenue,
        'live_period': current_live_quarter,
        'view_type': 'quarter'
    })

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
        
        # Group by month and sum the revenue across all pharmacies
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
        
        # Default behavior: filter data up to current month
        current_date = datetime.now()
        current_month_start = current_date.replace(day=1)
        revenue_data = revenue_data[revenue_data['Date'] <= current_month_start]
        
        monthly_revenue = revenue_data.groupby('Date')['Value'].sum().reset_index()
        monthly_revenue = monthly_revenue.sort_values('Date')
        
        # Get current period (most recent month with data)
        current_period = monthly_revenue.iloc[-1]['Date']
        current_period_display = current_period.strftime('%b-%y')
        current_revenue = float(monthly_revenue.iloc[-1]['Value'])
        
        # Get current live month
        current_live_month = datetime.now().replace(day=1)
        
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
        
    except Exception as e:
        return jsonify({'error': f'Error getting monthly revenue: {str(e)}'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 