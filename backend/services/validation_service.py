import pandas as pd
from utils.file_utils import allowed_file
from config import Config

class ValidationService:
    """Service for data validation"""
    
    def validate_file_upload(self, file):
        """Validate file upload"""
        if file is None:
            return False, "No file provided"
        
        # Check if file has filename attribute (Flask file object)
        if hasattr(file, 'filename'):
            if file.filename == '':
                return False, "No file selected"
            
            if not allowed_file(file.filename):
                return False, "Invalid file type. Only CSV files are allowed"
        else:
            # For file-like objects without filename, assume it's valid
            # The actual validation will happen during data loading
            pass
        
        return True, "File is valid"
    
    def validate_csv_data(self, df):
        """Validate CSV data structure and content"""
        if df is None or df.empty:
            return False, "No data found in file"
        
        # Check required columns
        missing_columns = [col for col in Config.EXPECTED_COLUMNS if col not in df.columns]
        if missing_columns:
            return False, f"Missing required columns: {missing_columns}"
        
        # Check for required data types
        try:
            # Check if Value column contains numeric data
            df['Value'] = pd.to_numeric(df['Value'], errors='coerce')
            if df['Value'].isna().all():
                return False, "Value column contains no valid numeric data"
            
            # Check if Fiscal_Year column contains valid fiscal year data
            # Handle both numeric (2025) and prefixed (FY2025) formats
            fiscal_year_clean = df['Fiscal_Year'].astype(str).str.replace('FY', '', case=False)
            df['Fiscal_Year'] = pd.to_numeric(fiscal_year_clean, errors='coerce')
            if df['Fiscal_Year'].isna().all():
                return False, "Fiscal_Year column contains no valid fiscal year data"
            
        except Exception as e:
            return False, f"Data type validation failed: {str(e)}"
        
        # Check for minimum data requirements
        if len(df) < 1:
            return False, "File contains no data rows"
        
        if df['Pharmacy'].nunique() < 1:
            return False, "No pharmacies found in data"
        
        return True, "Data validation passed"
    
    def validate_date_range(self, start_date, end_date):
        """Validate date range parameters"""
        if start_date and end_date:
            try:
                start = pd.to_datetime(start_date, format='%b-%y')
                end = pd.to_datetime(end_date, format='%b-%y')
                if start > end:
                    return False, "Start date cannot be after end date"
            except:
                return False, "Invalid date format. Use MMM-YY format (e.g., Jan-24)"
        
        return True, "Date range is valid"
    
    def validate_fiscal_year_range(self, start_year, end_year):
        """Validate fiscal year range parameters"""
        if start_year and end_year:
            try:
                start = int(start_year)
                end = int(end_year)
                if start > end:
                    return False, "Start fiscal year cannot be after end fiscal year"
                if start < 1900 or end > 2100:
                    return False, "Fiscal year must be between 1900 and 2100"
            except ValueError:
                return False, "Invalid fiscal year format"
        
        return True, "Fiscal year range is valid"
    
    def validate_quarter_range(self, start_quarter, end_quarter):
        """Validate quarter range parameters"""
        if start_quarter and end_quarter:
            # Check format: "YYYY QX" where X is 1-4
            try:
                start_parts = start_quarter.split()
                end_parts = end_quarter.split()
                
                if len(start_parts) != 2 or len(end_parts) != 2:
                    return False, "Quarter format should be 'YYYY QX' (e.g., '2024 Q1')"
                
                start_year, start_q = int(start_parts[0]), start_parts[1]
                end_year, end_q = int(end_parts[0]), end_parts[1]
                
                if start_q not in ['Q1', 'Q2', 'Q3', 'Q4'] or end_q not in ['Q1', 'Q2', 'Q3', 'Q4']:
                    return False, "Quarter must be Q1, Q2, Q3, or Q4"
                
                if start_year > end_year or (start_year == end_year and start_q > end_q):
                    return False, "Start quarter cannot be after end quarter"
                    
            except (ValueError, IndexError):
                return False, "Invalid quarter format"
        
        return True, "Quarter range is valid"

# Global instance
validation_service = ValidationService() 