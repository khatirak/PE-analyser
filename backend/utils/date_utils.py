import pandas as pd
from datetime import datetime
from config import Config

def parse_date(date_str):
    """Parse date string in various formats"""
    if pd.isna(date_str) or date_str == '':
        return None
    
    try:
        # Try the configured format first (MMM-YY)
        return pd.to_datetime(date_str, format=Config.DATE_FORMAT)
    except:
        try:
            # Try DD MMMM YYYY format (e.g., "01 April 2024")
            return pd.to_datetime(date_str, format='%d %B %Y')
        except:
            try:
                # Try DD MMM YYYY format (e.g., "01 Apr 2024")
                return pd.to_datetime(date_str, format='%d %b %Y')
            except:
                try:
                    # Try standard pandas parsing
                    return pd.to_datetime(date_str)
                except:
                    return None

def format_date(date_obj):
    """Format date object to MMM-YY format"""
    if isinstance(date_obj, str):
        return date_obj
    return date_obj.strftime(Config.DATE_FORMAT)

def get_fiscal_year_label(fiscal_year):
    """Get formatted fiscal year label"""
    return f"{Config.FISCAL_YEAR_PREFIX}{fiscal_year}"

def quarter_to_num(quarter):
    """Convert quarter string to number for sorting"""
    quarter_map = {'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4}
    return quarter_map.get(quarter, 0)

def sort_quarter_key(row):
    """Sort key for quarter sorting"""
    return (row['Fiscal_Year'], quarter_to_num(row['Quarter']))

def is_acquired_pharmacy(acquisition_date):
    """Check if pharmacy is acquired based on acquisition date"""
    if pd.isna(acquisition_date) or acquisition_date == '':
        return False
    
    parsed_date = parse_date(acquisition_date)
    if parsed_date is None:
        return False
    
    current_date = pd.Timestamp.now()
    return parsed_date <= current_date 