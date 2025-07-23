import pandas as pd
from datetime import datetime
from config import Config

def parse_date(date_str):
    """Parse date string in various formats"""
    print(f"parse_date called with: '{date_str}'")
    if pd.isna(date_str) or date_str == '':
        print("Empty or NaN date string")
        return None
    
    try:
        # Try the configured format first (MMM-YY)
        result = pd.to_datetime(date_str, format=Config.DATE_FORMAT)
        print(f"Successfully parsed with format {Config.DATE_FORMAT}: {result}")
        return result
    except Exception as e:
        print(f"Failed to parse with format {Config.DATE_FORMAT}: {e}")
        try:
            # Try MMM YY format (e.g., "May 24")
            result = pd.to_datetime(date_str, format='%b %y')
            print(f"Successfully parsed with format '%b %y': {result}")
            return result
        except Exception as e:
            print(f"Failed to parse with format '%b %y': {e}")
            try:
                # Try DD MMMM YYYY format (e.g., "01 April 2024")
                result = pd.to_datetime(date_str, format='%d %B %Y')
                print(f"Successfully parsed with format '%d %B %Y': {result}")
                return result
            except Exception as e:
                print(f"Failed to parse with format '%d %B %Y': {e}")
                try:
                    # Try DD MMM YYYY format (e.g., "01 Apr 2024")
                    result = pd.to_datetime(date_str, format='%d %b %Y')
                    print(f"Successfully parsed with format '%d %b %Y': {result}")
                    return result
                except Exception as e:
                    print(f"Failed to parse with format '%d %b %Y': {e}")
                    try:
                        # Try standard pandas parsing
                        result = pd.to_datetime(date_str)
                        print(f"Successfully parsed with standard pandas: {result}")
                        return result
                    except Exception as e:
                        print(f"Failed to parse with standard pandas: {e}")
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

def sort_quarter_key(quarter_str):
    """Sort key for quarter sorting"""
    # Handle quarter strings in format "YYYY QX"
    if isinstance(quarter_str, str) and ' ' in quarter_str:
        parts = quarter_str.split(' ')
        if len(parts) == 2:
            try:
                fiscal_year = int(parts[0])
                quarter = parts[1]
                return (fiscal_year, quarter_to_num(quarter))
            except (ValueError, IndexError):
                return (0, 0)
    # Fallback for other formats
    return (0, 0)

def is_acquired_pharmacy(acquisition_date):
    """Check if pharmacy is acquired based on acquisition date"""
    if pd.isna(acquisition_date) or acquisition_date == '':
        return False
    
    parsed_date = parse_date(acquisition_date)
    if parsed_date is None:
        return False
    
    current_date = pd.Timestamp.now()
    return parsed_date <= current_date 