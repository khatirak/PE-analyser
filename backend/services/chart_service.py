import pandas as pd
from utils.date_utils import parse_date, format_date, get_fiscal_year_label, sort_quarter_key
from utils.data_utils import format_currency
from config import Config

class ChartService:
    """Service for generating chart data"""
    
    def __init__(self):
        self.colors = Config.CHART_COLORS
    
    def create_monthly_chart_data(self, revenue_data, date_range_start='', date_range_end=''):
        """Create monthly chart data"""
        if revenue_data is None or revenue_data.empty:
            return {'labels': [], 'datasets': []}
        
        # Convert Date to datetime for proper sorting
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
        
        # Filter by date range if provided
        if date_range_start:
            start_date = parse_date(date_range_start)
            if start_date:
                revenue_data = revenue_data[revenue_data['Date'] >= start_date]
        
        if date_range_end:
            end_date = parse_date(date_range_end)
            if end_date:
                revenue_data = revenue_data[revenue_data['Date'] <= end_date]
        
        # Sort by date
        revenue_data = revenue_data.sort_values('Date')
        
        # Get unique dates and pharmacies
        dates = revenue_data['Date'].unique()
        pharmacies = revenue_data['Pharmacy'].unique()
        
        # Format dates for labels
        labels = [format_date(date) for date in sorted(dates)]
        
        # Create datasets for each pharmacy
        datasets = []
        for i, pharmacy in enumerate(pharmacies):
            pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
            
            # Create data points for each date
            data = []
            for date in sorted(dates):
                date_data = pharmacy_data[pharmacy_data['Date'] == date]
                total_value = date_data['Value'].sum() if not date_data.empty else 0
                data.append(total_value)
            
            datasets.append({
                'label': pharmacy,
                'data': data,
                'borderColor': self.colors[i % len(self.colors)],
                'backgroundColor': self.colors[i % len(self.colors)],
                'tension': 0.1
            })
        
        return {'labels': labels, 'datasets': datasets}
    
    def create_fiscal_year_chart_data(self, revenue_data, fiscal_year_range_start='', fiscal_year_range_end=''):
        """Create fiscal year chart data"""
        if revenue_data is None or revenue_data.empty:
            return {'labels': [], 'datasets': []}
        
        # Filter by fiscal year range if provided
        if fiscal_year_range_start:
            revenue_data = revenue_data[revenue_data['Fiscal_Year'] >= int(fiscal_year_range_start)]
        
        if fiscal_year_range_end:
            revenue_data = revenue_data[revenue_data['Fiscal_Year'] <= int(fiscal_year_range_end)]
        
        # Get unique fiscal years and pharmacies
        fiscal_years = sorted(revenue_data['Fiscal_Year'].unique())
        pharmacies = revenue_data['Pharmacy'].unique()
        
        # Format fiscal years for labels
        labels = [get_fiscal_year_label(year) for year in fiscal_years]
        
        # Create datasets for each pharmacy
        datasets = []
        for i, pharmacy in enumerate(pharmacies):
            pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
            
            # Create data points for each fiscal year
            data = []
            for year in fiscal_years:
                year_data = pharmacy_data[pharmacy_data['Fiscal_Year'] == year]
                total_value = year_data['Value'].sum() if not year_data.empty else 0
                data.append(total_value)
            
            datasets.append({
                'label': pharmacy,
                'data': data,
                'borderColor': self.colors[i % len(self.colors)],
                'backgroundColor': self.colors[i % len(self.colors)],
                'tension': 0.1
            })
        
        return {'labels': labels, 'datasets': datasets}
    
    def create_quarter_chart_data(self, revenue_data, quarter_range_start='', quarter_range_end=''):
        """Create quarter chart data"""
        if revenue_data is None or revenue_data.empty:
            return {'labels': [], 'datasets': []}
        
        # Create fiscal quarter column
        revenue_data['Fiscal_Quarter'] = revenue_data['Fiscal_Year'].astype(str) + ' ' + revenue_data['Quarter']
        
        # Filter by quarter range if provided
        if quarter_range_start:
            revenue_data = revenue_data[revenue_data['Fiscal_Quarter'] >= quarter_range_start]
        
        if quarter_range_end:
            revenue_data = revenue_data[revenue_data['Fiscal_Quarter'] <= quarter_range_end]
        
        # Sort quarters properly
        revenue_data = revenue_data.sort_values(['Fiscal_Year', 'Quarter'], key=lambda x: x.map(sort_quarter_key))
        
        # Get unique quarters and pharmacies
        quarters = revenue_data['Fiscal_Quarter'].unique()
        pharmacies = revenue_data['Pharmacy'].unique()
        
        # Create labels
        labels = list(quarters)
        
        # Create datasets for each pharmacy
        datasets = []
        for i, pharmacy in enumerate(pharmacies):
            pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
            
            # Create data points for each quarter
            data = []
            for quarter in quarters:
                quarter_data = pharmacy_data[pharmacy_data['Fiscal_Quarter'] == quarter]
                total_value = quarter_data['Value'].sum() if not quarter_data.empty else 0
                data.append(total_value)
            
            datasets.append({
                'label': pharmacy,
                'data': data,
                'borderColor': self.colors[i % len(self.colors)],
                'backgroundColor': self.colors[i % len(self.colors)],
                'tension': 0.1
            })
        
        return {'labels': labels, 'datasets': datasets}
    
    def create_chart_datasets(self, revenue_data, labels, pharmacies, format_str='currency'):
        """Create chart datasets with proper formatting"""
        datasets = []
        
        for i, pharmacy in enumerate(pharmacies):
            pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
            
            # Create data points for each label
            data = []
            for label in labels:
                if format_str == 'month':
                    # For monthly data, filter by date
                    label_data = pharmacy_data[pharmacy_data['Date'] == label]
                elif format_str == 'fiscal_year':
                    # For fiscal year data, filter by fiscal year
                    fiscal_year = int(label.replace('FY', ''))
                    label_data = pharmacy_data[pharmacy_data['Fiscal_Year'] == fiscal_year]
                else:
                    # For quarter data, filter by fiscal quarter
                    label_data = pharmacy_data[pharmacy_data['Fiscal_Quarter'] == label]
                
                total_value = label_data['Value'].sum() if not label_data.empty else 0
                data.append(total_value)
            
            datasets.append({
                'label': pharmacy,
                'data': data,
                'borderColor': self.colors[i % len(self.colors)],
                'backgroundColor': self.colors[i % len(self.colors)],
                'tension': 0.1
            })
        
        return datasets

# Global instance
chart_service = ChartService() 