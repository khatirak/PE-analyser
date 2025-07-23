from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class Pharmacy:
    """Pharmacy data model"""
    name: str
    cluster: str
    acquisition_date: str
    is_acquired: bool
    status: str

@dataclass
class ChartData:
    """Chart data model"""
    labels: List[str]
    datasets: List[Dict[str, Any]]

@dataclass
class RevenueData:
    """Revenue data model"""
    date: str
    total_revenue: float

@dataclass
class Stats:
    """Statistics data model"""
    total_rows: int
    unique_pharmacies: int
    unique_clusters: int
    unique_metrics: int
    date_range: Optional[Dict[str, str]]

@dataclass
class UploadResponse:
    """Upload response model"""
    message: str
    stats: Stats 