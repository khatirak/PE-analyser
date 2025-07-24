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
        print(f"Creating monthly chart data with date range: {date_range_start} to {date_range_end}")
        
        if revenue_data is None or revenue_data.empty:
            return {'labels': [], 'datasets': []}
        
        # Convert Date to datetime for proper sorting
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
        
        # Determine the date range for x-axis
        if date_range_start and date_range_end:
            start_date = parse_date(date_range_start)
            end_date = parse_date(date_range_end)
            print(f"Parsed dates - start: {start_date}, end: {end_date}")
            if start_date and end_date:
                print(f"Using specified date range: {start_date} to {end_date}")
                # Generate complete date range for x-axis
                date_range = pd.date_range(start=start_date, end=end_date, freq='MS')  # Month start
                labels = [format_date(date) for date in date_range]
                print(f"Generated labels: {labels}")
                
                # Filter labels to only include those that have data
                available_dates = set(revenue_data['Date'].dt.strftime('%b-%y'))
                print(f"Available dates in data: {sorted(available_dates)}")
                filtered_labels = [label for label in labels if label in available_dates]
                print(f"Filtered labels (with data): {filtered_labels}")
                
                if filtered_labels:
                    labels = filtered_labels
                else:
                    print("No matching dates found, using all available dates")
                    dates = sorted(revenue_data['Date'].unique())
                    labels = [format_date(date) for date in dates]
            else:
                print("Failed to parse dates, falling back to data-based dates")
                # Fallback to data-based dates
                dates = sorted(revenue_data['Date'].unique())
                labels = [format_date(date) for date in dates]
        else:
            print("No date range specified, using data-based dates")
            # No date range specified, use data-based dates
            dates = sorted(revenue_data['Date'].unique())
            labels = [format_date(date) for date in dates]
        
        # Filter data by date range if provided
        if date_range_start:
            start_date = parse_date(date_range_start)
            if start_date:
                print(f"Filtering by start date: {start_date}")
                revenue_data = revenue_data[revenue_data['Date'] >= start_date]
        
        if date_range_end:
            end_date = parse_date(date_range_end)
            if end_date:
                print(f"Filtering by end date: {end_date}")
                revenue_data = revenue_data[revenue_data['Date'] <= end_date]
        
        print(f"Data after filtering: {len(revenue_data)} rows")
        print(f"Available dates after filtering: {sorted(revenue_data['Date'].dt.strftime('%b-%y').unique())}")
        
        # Get pharmacies
        pharmacies = revenue_data['Pharmacy'].unique()
        
        # Create datasets for each pharmacy
        datasets = []
        for i, pharmacy in enumerate(pharmacies):
            pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
            
            # Create data points for each label (date)
            data = []
            for label in labels:
                # Convert label back to date for comparison
                try:
                    label_date = pd.to_datetime(label, format='%b-%y')
                    date_data = pharmacy_data[pharmacy_data['Date'] == label_date]
                    total_value = date_data['Value'].sum() if not date_data.empty else 0
                except:
                    # If label parsing fails, try to find matching data
                    total_value = 0
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
        
        # Determine the fiscal year range for x-axis
        if fiscal_year_range_start and fiscal_year_range_end:
            start_year = int(fiscal_year_range_start)
            end_year = int(fiscal_year_range_end)
            print(f"Using specified fiscal year range: {start_year} to {end_year}")
            # Generate complete fiscal year range for x-axis
            fiscal_years = list(range(start_year, end_year + 1))
            labels = [get_fiscal_year_label(year) for year in fiscal_years]
        else:
            # No range specified, use data-based fiscal years
            fiscal_years = sorted(revenue_data['Fiscal_Year'].unique())
            labels = [get_fiscal_year_label(year) for year in fiscal_years]
        
        # Filter data by fiscal year range if provided
        if fiscal_year_range_start:
            revenue_data = revenue_data[revenue_data['Fiscal_Year'] >= int(fiscal_year_range_start)]
        
        if fiscal_year_range_end:
            revenue_data = revenue_data[revenue_data['Fiscal_Year'] <= int(fiscal_year_range_end)]
        
        # Get pharmacies
        pharmacies = revenue_data['Pharmacy'].unique()
        
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
        
        # Determine the quarter range for x-axis
        if quarter_range_start and quarter_range_end:
            print(f"Using specified quarter range: {quarter_range_start} to {quarter_range_end}")
            # Parse the quarter range to generate complete range
            start_parts = quarter_range_start.split(' ')
            end_parts = quarter_range_end.split(' ')
            if len(start_parts) == 2 and len(end_parts) == 2:
                start_year = int(start_parts[0])
                start_q = start_parts[1]
                end_year = int(end_parts[0])
                end_q = end_parts[1]
                
                # Generate complete quarter range
                quarters = []
                current_year = start_year
                current_q = start_q
                while (current_year < end_year) or (current_year == end_year and current_q <= end_q):
                    quarters.append(f"{current_year} {current_q}")
                    # Move to next quarter
                    if current_q == 'Q1':
                        current_q = 'Q2'
                    elif current_q == 'Q2':
                        current_q = 'Q3'
                    elif current_q == 'Q3':
                        current_q = 'Q4'
                    elif current_q == 'Q4':
                        current_q = 'Q1'
                        current_year += 1
                labels = quarters
            else:
                # Fallback to data-based quarters
                quarters = sorted(revenue_data['Fiscal_Quarter'].unique(), key=sort_quarter_key)
                labels = list(quarters)
        else:
            # No range specified, use data-based quarters
            quarters = sorted(revenue_data['Fiscal_Quarter'].unique(), key=sort_quarter_key)
            labels = list(quarters)
        
        # Filter data by quarter range if provided
        if quarter_range_start:
            revenue_data = revenue_data[revenue_data['Fiscal_Quarter'] >= quarter_range_start]
        
        if quarter_range_end:
            revenue_data = revenue_data[revenue_data['Fiscal_Quarter'] <= quarter_range_end]
        
        # Get pharmacies
        pharmacies = revenue_data['Pharmacy'].unique()
        
        # Create datasets for each pharmacy
        datasets = []
        for i, pharmacy in enumerate(pharmacies):
            pharmacy_data = revenue_data[revenue_data['Pharmacy'] == pharmacy]
            
            # Create data points for each quarter
            data = []
            for quarter in labels:
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

    def create_monthly_period_data(self, revenue_data, date_range_start='', date_range_end=''):
        """Create monthly period data for total revenue cards"""
        if revenue_data is None or revenue_data.empty:
            return {'periods': [], 'current_period': None}
        
        # Convert Date to datetime for proper sorting
        revenue_data['Date'] = pd.to_datetime(revenue_data['Date'], format='%b-%y')
        
        # Filter data by date range if provided
        if date_range_start:
            start_date = parse_date(date_range_start)
            if start_date:
                revenue_data = revenue_data[revenue_data['Date'] >= start_date]
        
        if date_range_end:
            end_date = parse_date(date_range_end)
            if end_date:
                revenue_data = revenue_data[revenue_data['Date'] <= end_date]
        
        # Group by date and sum all pharmacy values
        monthly_totals = revenue_data.groupby('Date')['Value'].sum().reset_index()
        monthly_totals = monthly_totals.sort_values('Date')
        
        # Calculate percentage changes
        periods = []
        for i, row in monthly_totals.iterrows():
            period = format_date(row['Date'])
            revenue = row['Value']
            
            # Calculate percentage change from previous period
            percentage_change = None
            change_direction = None
            if i > 0:
                prev_revenue = monthly_totals.iloc[i-1]['Value']
                if prev_revenue > 0:
                    percentage_change = round(((revenue - prev_revenue) / prev_revenue) * 100, 2)
                    change_direction = 'increase' if percentage_change > 0 else 'decrease'
            
            periods.append({
                'period': period,
                'revenue': revenue,
                'percentage_change': percentage_change,
                'change_direction': change_direction
            })
        
        # Set current period as the most recent
        current_period = periods[-1]['period'] if periods else None
        
        return {
            'periods': periods,
            'current_period': current_period
        }
    
    def create_quarter_period_data(self, revenue_data, quarter_range_start='', quarter_range_end=''):
        """Create quarter period data for total revenue cards"""
        if revenue_data is None or revenue_data.empty:
            return {'periods': [], 'current_period': None}
        
        # Create combined fiscal quarter column for filtering
        revenue_data = revenue_data.copy()
        revenue_data['Fiscal_Quarter_Combined'] = revenue_data['Fiscal_Year'].astype(str) + ' ' + revenue_data['Quarter'].astype(str)
        
        # Filter data by quarter range if provided
        if quarter_range_start:
            revenue_data = revenue_data[revenue_data['Fiscal_Quarter_Combined'] >= quarter_range_start]
        
        if quarter_range_end:
            revenue_data = revenue_data[revenue_data['Fiscal_Quarter_Combined'] <= quarter_range_end]
        
        # Group by fiscal quarter and sum all pharmacy values
        quarter_totals = revenue_data.groupby('Fiscal_Quarter_Combined')['Value'].sum().reset_index()
        quarter_totals = quarter_totals.sort_values('Fiscal_Quarter_Combined', key=lambda x: x.map(sort_quarter_key))
        
        # Calculate percentage changes
        periods = []
        for i, row in quarter_totals.iterrows():
            period = row['Fiscal_Quarter_Combined']
            revenue = row['Value']
            
            # Calculate percentage change from previous period
            percentage_change = None
            change_direction = None
            if i > 0:
                prev_revenue = quarter_totals.iloc[i-1]['Value']
                if prev_revenue > 0:
                    percentage_change = round(((revenue - prev_revenue) / prev_revenue) * 100, 2)
                    change_direction = 'increase' if percentage_change > 0 else 'decrease'
            
            periods.append({
                'period': period,
                'revenue': revenue,
                'percentage_change': percentage_change,
                'change_direction': change_direction
            })
        
        # Set current period as the most recent
        current_period = periods[-1]['period'] if periods else None
        
        return {
            'periods': periods,
            'current_period': current_period
        }
    
    def create_fiscal_year_period_data(self, revenue_data, fiscal_year_range_start='', fiscal_year_range_end=''):
        """Create fiscal year period data for total revenue cards"""
        if revenue_data is None or revenue_data.empty:
            return {'periods': [], 'current_period': None}
        
        # Filter data by fiscal year range if provided
        if fiscal_year_range_start:
            start_year = int(fiscal_year_range_start.replace('FY', ''))
            revenue_data = revenue_data[revenue_data['Fiscal_Year'] >= start_year]
        
        if fiscal_year_range_end:
            end_year = int(fiscal_year_range_end.replace('FY', ''))
            revenue_data = revenue_data[revenue_data['Fiscal_Year'] <= end_year]
        
        # Group by fiscal year and sum all pharmacy values
        year_totals = revenue_data.groupby('Fiscal_Year')['Value'].sum().reset_index()
        year_totals = year_totals.sort_values('Fiscal_Year')
        
        # Calculate percentage changes
        periods = []
        for i, row in year_totals.iterrows():
            period = f"FY{row['Fiscal_Year']}"
            revenue = row['Value']
            
            # Calculate percentage change from previous period
            percentage_change = None
            change_direction = None
            if i > 0:
                prev_revenue = year_totals.iloc[i-1]['Value']
                if prev_revenue > 0:
                    percentage_change = round(((revenue - prev_revenue) / prev_revenue) * 100, 2)
                    change_direction = 'increase' if percentage_change > 0 else 'decrease'
            
            periods.append({
                'period': period,
                'revenue': revenue,
                'percentage_change': percentage_change,
                'change_direction': change_direction
            })
        
        # Set current period as the most recent
        current_period = periods[-1]['period'] if periods else None
        
        return {
            'periods': periods,
            'current_period': current_period
        }

# Global instance
chart_service = ChartService() 