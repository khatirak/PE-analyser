import pandas as pd
from utils.data_utils import validate_csv_columns, get_basic_stats
from utils.date_utils import is_acquired_pharmacy
from config import Config

class DataService:
    """Service for handling data operations"""
    
    def __init__(self):
        self.current_data = None
    
    def load_data(self, file):
        """Load data from uploaded file"""
        try:
            self.current_data = pd.read_csv(file, header=0)
            
            # Validate columns
            is_valid, missing_columns = validate_csv_columns(self.current_data)
            if not is_valid:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            # Clean fiscal year data (remove FY prefix if present)
            if 'Fiscal_Year' in self.current_data.columns:
                self.current_data['Fiscal_Year'] = self.current_data['Fiscal_Year'].astype(str).str.replace('FY', '', case=False)
                self.current_data['Fiscal_Year'] = pd.to_numeric(self.current_data['Fiscal_Year'], errors='coerce')
            
            return True, "Data loaded successfully"
        except Exception as e:
            return False, f"Error loading data: {str(e)}"
    
    def get_data(self):
        """Get current data"""
        return self.current_data
    
    def get_stats(self):
        """Get basic statistics"""
        return get_basic_stats(self.current_data)
    
    def get_pharmacies(self):
        """Get pharmacy information with acquisition status"""
        if self.current_data is None:
            return []
        
        pharmacy_details = []
        
        # Group by pharmacy to get unique entries
        pharmacy_info = self.current_data.groupby('Pharmacy').agg({
            'Acquisition_Date': 'first',
            'Cluster': 'first'
        }).reset_index()
        
        for _, row in pharmacy_info.iterrows():
            pharmacy_name = row['Pharmacy']
            acquisition_date = row['Acquisition_Date']
            cluster = row['Cluster']
            
            is_acquired = is_acquired_pharmacy(acquisition_date)
            
            pharmacy_details.append({
                'name': pharmacy_name,
                'cluster': cluster,
                'acquisition_date': acquisition_date,
                'is_acquired': is_acquired,
                'status': 'acquired' if is_acquired else 'pipeline'
            })
        
        return pharmacy_details
    
    def get_clusters(self):
        """Get cluster information with associated pharmacies"""
        if self.current_data is None:
            return []
        
        cluster_details = []
        
        # Group by cluster to get unique entries and associated pharmacies
        cluster_info = self.current_data.groupby('Cluster').agg({
            'Pharmacy': lambda x: list(x.unique()),
            'Acquisition_Date': 'first'
        }).reset_index()
        
        for _, row in cluster_info.iterrows():
            cluster_name = row['Cluster']
            pharmacies = row['Pharmacy']
            
            # Get pharmacy details for this cluster
            cluster_pharmacies = []
            for pharmacy_name in pharmacies:
                pharmacy_data = self.current_data[self.current_data['Pharmacy'] == pharmacy_name].iloc[0]
                acquisition_date = pharmacy_data['Acquisition_Date']
                is_acquired = is_acquired_pharmacy(acquisition_date)
                
                cluster_pharmacies.append({
                    'name': pharmacy_name,
                    'acquisition_date': acquisition_date,
                    'is_acquired': is_acquired,
                    'status': 'acquired' if is_acquired else 'pipeline'
                })
            
            cluster_details.append({
                'name': cluster_name,
                'pharmacy_count': len(cluster_pharmacies),
                'pharmacies': cluster_pharmacies
            })
        
        return cluster_details
    
    def get_metrics(self):
        """Get unique metrics information"""
        if self.current_data is None:
            return []
        
        # Get unique metrics
        unique_metrics = self.current_data['Metric'].unique()
        
        metrics_details = []
        for metric_name in unique_metrics:
            metrics_details.append({
                'name': metric_name
            })
        
        return metrics_details
    
    def get_revenue_data(self, pharmacies=None, acquisition_dates=None, acquisition_date=None):
        """Get revenue data with optional filters"""
        if self.current_data is None:
            return None
        
        revenue_data = self.current_data.copy()
        
        # Filter by selected pharmacies
        if pharmacies:
            revenue_data = revenue_data[revenue_data['Pharmacy'].isin(pharmacies)]
        
        # Apply acquisition date filter
        if acquisition_dates:
            revenue_data = self._apply_acquisition_filter(revenue_data, acquisition_dates)
        
        # Apply custom acquisition date filter
        if acquisition_date:
            revenue_data = self._apply_custom_acquisition_filter(revenue_data, acquisition_date)
        
        return revenue_data

    def get_chart_data(self, pharmacies=None, metric=None, acquisition_dates=None, acquisition_date=None):
        """Get chart data for any metric with optional filters"""
        if self.current_data is None:
            return None
        
        chart_data = self.current_data.copy()
        
        # Filter by selected pharmacies
        if pharmacies:
            chart_data = chart_data[chart_data['Pharmacy'].isin(pharmacies)]
        
        # Filter by metric if specified
        if metric:
            chart_data = chart_data[chart_data['Metric'] == metric]
        
        # Apply acquisition date filter
        if acquisition_dates:
            chart_data = self._apply_acquisition_filter(chart_data, acquisition_dates)
        
        # Apply custom acquisition date filter
        if acquisition_date:
            chart_data = self._apply_custom_acquisition_filter(chart_data, acquisition_date)
        
        return chart_data
    
    def _apply_acquisition_filter(self, revenue_data, acquisition_dates):
        """Apply acquisition date filter to revenue data"""
        if not acquisition_dates:
            return revenue_data
        
        filtered_data = []
        
        for _, row in revenue_data.iterrows():
            pharmacy = row['Pharmacy']
            date = row['Date']
            
            if pharmacy in acquisition_dates:
                acquisition_date = acquisition_dates[pharmacy]
                if date >= acquisition_date:
                    filtered_data.append(row)
            else:
                filtered_data.append(row)
        
        return pd.DataFrame(filtered_data) if filtered_data else pd.DataFrame()
    
    def _apply_custom_acquisition_filter(self, revenue_data, acquisition_date):
        """Apply custom acquisition date filter - only include pharmacies acquired on or before the specified date"""
        if not acquisition_date:
            return revenue_data
        
        from utils.date_utils import parse_date
        
        # Parse the acquisition date filter
        filter_date = parse_date(acquisition_date)
        if not filter_date:
            return revenue_data
        
        # Get unique pharmacies and their acquisition dates
        pharmacy_acquisitions = self.current_data.groupby('Pharmacy')['Acquisition_Date'].first()
        
        # Filter pharmacies that were acquired on or before the filter date
        acquired_pharmacies = []
        for pharmacy, acq_date in pharmacy_acquisitions.items():
            if acq_date and acq_date != 'nan':
                parsed_acq_date = parse_date(acq_date)
                if parsed_acq_date and parsed_acq_date <= filter_date:
                    acquired_pharmacies.append(pharmacy)
        
        # Filter revenue data to only include acquired pharmacies
        if acquired_pharmacies:
            return revenue_data[revenue_data['Pharmacy'].isin(acquired_pharmacies)]
        else:
            return pd.DataFrame()

# Global instance
data_service = DataService() 