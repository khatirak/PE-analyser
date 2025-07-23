#!/usr/bin/env python3
"""
Script to load sample data for testing
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.data_service import data_service

def load_sample_data():
    """Load the sample CSV file into the data service"""
    csv_path = os.path.join('uploads', 'Cur8_formulaKhatira.csv')
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return False
    
    try:
        with open(csv_path, 'rb') as file:
            success, message = data_service.load_data(file)
            if success:
                print("✅ Sample data loaded successfully!")
                stats = data_service.get_stats()
                print(f"📊 Stats: {stats}")
                return True
            else:
                print(f"❌ Error loading data: {message}")
                return False
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    load_sample_data() 