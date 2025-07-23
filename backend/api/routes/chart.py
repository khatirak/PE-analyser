from flask import Blueprint, request, jsonify
from services.data_service import data_service
from services.chart_service import chart_service
from services.validation_service import validation_service

chart_bp = Blueprint('chart', __name__)

@chart_bp.route('/api/chart-data')
def get_chart_data():
    """Get general chart data for any metric"""
    # Get query parameters
    pharmacies = request.args.getlist('pharmacies[]')
    metric = request.args.get('metric', '')
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
    
    # Get chart data with metric filter
    chart_data = data_service.get_chart_data(
        pharmacies=pharmacies,
        metric=metric,
        acquisition_dates=acquisition_dates_dict,
        acquisition_date=acquisition_date
    )
    
    if chart_data is None or chart_data.empty:
        return jsonify({'labels': [], 'datasets': []})
    
    # Generate chart data based on view type with ranges
    if view_type == 'fiscal_year':
        result = chart_service.create_fiscal_year_chart_data(
            chart_data, fiscal_year_range_start, fiscal_year_range_end
        )
    elif view_type == 'quarter':
        result = chart_service.create_quarter_chart_data(
            chart_data, quarter_range_start, quarter_range_end
        )
    else:  # month
        result = chart_service.create_monthly_chart_data(
            chart_data, date_range_start, date_range_end
        )
    
    return jsonify(result) 