from flask import Blueprint, request, jsonify
from services.data_service import data_service
from services.chart_service import chart_service
from services.validation_service import validation_service

revenue_bp = Blueprint('revenue', __name__)

@revenue_bp.route('/api/revenue-data')
def get_revenue_data():
    """Get revenue data for charts"""
    # Get query parameters
    pharmacies = request.args.getlist('pharmacies[]')
    acquisition_dates = request.args.get('acquisition_dates')
    acquisition_date = request.args.get('acquisition_date', '')
    view_type = request.args.get('view_type', 'month')
    date_range_start = request.args.get('date_range_start', '')
    date_range_end = request.args.get('date_range_end', '')
    fiscal_year_range_start = request.args.get('fiscal_year_range_start', '')
    fiscal_year_range_end = request.args.get('fiscal_year_range_end', '')
    quarter_range_start = request.args.get('quarter_range_start', '')
    quarter_range_end = request.args.get('quarter_range_end', '')
    
    # Parse acquisition dates if provided
    acquisition_dates_dict = {}
    if acquisition_dates:
        try:
            acquisition_dates_dict = dict(item.split(":") for item in acquisition_dates.split(","))
        except:
            pass
    
    # Get revenue data
    revenue_data = data_service.get_revenue_data(pharmacies, acquisition_dates_dict, acquisition_date)
    
    if revenue_data is None or revenue_data.empty:
        return jsonify({'labels': [], 'datasets': []})
    
    # Generate chart data based on view type with ranges
    if view_type == 'fiscal_year':
        chart_data = chart_service.create_fiscal_year_chart_data(
            revenue_data, fiscal_year_range_start, fiscal_year_range_end
        )
    elif view_type == 'quarter':
        chart_data = chart_service.create_quarter_chart_data(
            revenue_data, quarter_range_start, quarter_range_end
        )
    else:  # month
        chart_data = chart_service.create_monthly_chart_data(
            revenue_data, date_range_start, date_range_end
        )
    
    return jsonify(chart_data)

@revenue_bp.route('/api/revenue-by-period')
def get_revenue_by_period():
    """Get revenue data by period with filters"""
    # Get query parameters
    pharmacies = request.args.getlist('pharmacies[]')
    acquisition_dates = request.args.get('acquisition_dates')
    acquisition_date = request.args.get('acquisition_date', '')
    view_type = request.args.get('view_type', 'month')
    date_range_start = request.args.get('date_range_start', '')
    date_range_end = request.args.get('date_range_end', '')
    fiscal_year_range_start = request.args.get('fiscal_year_range_start', '')
    fiscal_year_range_end = request.args.get('fiscal_year_range_end', '')
    quarter_range_start = request.args.get('quarter_range_start', '')
    quarter_range_end = request.args.get('quarter_range_end', '')
    
    # Validate ranges
    if view_type == 'month':
        is_valid, message = validation_service.validate_date_range(date_range_start, date_range_end)
        if not is_valid:
            return jsonify({'error': message}), 400
    elif view_type == 'fiscal_year':
        is_valid, message = validation_service.validate_fiscal_year_range(fiscal_year_range_start, fiscal_year_range_end)
        if not is_valid:
            return jsonify({'error': message}), 400
    elif view_type == 'quarter':
        is_valid, message = validation_service.validate_quarter_range(quarter_range_start, quarter_range_end)
        if not is_valid:
            return jsonify({'error': message}), 400
    
    # Parse acquisition dates if provided
    acquisition_dates_dict = {}
    if acquisition_dates:
        try:
            acquisition_dates_dict = dict(item.split(":") for item in acquisition_dates.split(","))
        except:
            pass
    
    # Get revenue data
    revenue_data = data_service.get_revenue_data(pharmacies, acquisition_dates_dict)
    
    if revenue_data is None or revenue_data.empty:
        return jsonify({'labels': [], 'datasets': []})
    
    # Generate chart data based on view type with ranges
    if view_type == 'fiscal_year':
        chart_data = chart_service.create_fiscal_year_chart_data(
            revenue_data, fiscal_year_range_start, fiscal_year_range_end
        )
    elif view_type == 'quarter':
        chart_data = chart_service.create_quarter_chart_data(
            revenue_data, quarter_range_start, quarter_range_end
        )
    else:  # month
        chart_data = chart_service.create_monthly_chart_data(
            revenue_data, date_range_start, date_range_end
        )
    
    return jsonify(chart_data)

@revenue_bp.route('/api/monthly-revenue')
def get_monthly_revenue():
    """Get monthly revenue summary"""
    # Get query parameters
    pharmacies = request.args.getlist('pharmacies[]')
    acquisition_dates = request.args.get('acquisition_dates')
    acquisition_date = request.args.get('acquisition_date', '')
    
    # Parse acquisition dates if provided
    acquisition_dates_dict = {}
    if acquisition_dates:
        try:
            acquisition_dates_dict = dict(item.split(":") for item in acquisition_dates.split(","))
        except:
            pass
    
    # Get revenue data
    revenue_data = data_service.get_revenue_data(pharmacies, acquisition_dates_dict, acquisition_date)
    
    if revenue_data is None or revenue_data.empty:
        return jsonify([])
    
    # Process monthly data
    monthly_data = revenue_data.groupby('Date')['Value'].sum().reset_index()
    monthly_data = monthly_data.sort_values('Date')
    
    # Format for response
    result = []
    for _, row in monthly_data.iterrows():
        result.append({
            'date': row['Date'],
            'total_revenue': row['Value']
        })
    
    return jsonify(result) 