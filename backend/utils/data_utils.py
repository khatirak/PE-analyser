import pandas as pd
from config import Config

def validate_csv_columns(df):
    """Validate that CSV contains expected columns"""
    missing_columns = [col for col in Config.EXPECTED_COLUMNS if col not in df.columns]
    return len(missing_columns) == 0, missing_columns

def get_basic_stats(df):
    """Get basic statistics from dataframe"""
    if df is None or df.empty:
        return None
    
    return {
        'total_rows': len(df),
        'unique_pharmacies': df['Pharmacy'].nunique(),
        'unique_clusters': df['Cluster'].nunique(),
        'unique_metrics': df['Metric'].nunique(),
        'date_range': {
            'start': df['Date'].min(),
            'end': df['Date'].max()
        } if 'Date' in df.columns else None
    }

def filter_data_by_date_range(df, start_date=None, end_date=None):
    """Filter dataframe by date range"""
    if df is None:
        return df
    
    filtered_df = df.copy()
    
    if start_date:
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date:
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
    return filtered_df

def filter_data_by_pharmacies(df, pharmacies):
    """Filter dataframe by selected pharmacies"""
    if df is None or not pharmacies:
        return df
    
    return df[df['Pharmacy'].isin(pharmacies)]

def format_currency(value):
    """Format value as currency"""
    try:
        return f"£{value:,.0f}"
    except:
        return str(value) 