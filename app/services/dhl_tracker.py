# DHL package tracking service
import requests
import json
from datetime import datetime
from typing import Dict, Any
from app.core.config import settings

class DHLTracker:
    """Service for tracking DHL packages"""
    
    def __init__(self):
        self.api_url = settings.DHL_API_URL
        self.headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        }
    
    def track_package(self, tracking_number: str) -> Dict[str, Any]:
        """
        Track a DHL package using the tracking number
        Returns tracking status and history
        """
        try:
            params = {
                "piececode": tracking_number,
                "inputSearch": "true",
                "language": "de"
            }
            
            response = requests.get(
                self.api_url, 
                params=params, 
                headers=self.headers, 
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            # Search for shipment with complete details
            for shipment in data.get("sendungen", []):
                if shipment.get("hasCompleteDetails"):
                    return self._process_shipment_data(shipment, tracking_number)
            
            # No shipment with details found
            return self._create_error_response(
                "Package not found",
                "No tracking data available",
                tracking_number
            )
            
        except Exception as e:
            return self._create_error_response(
                "Tracking error",
                str(e),
                tracking_number
            )
    
    def _process_shipment_data(self, shipment: Dict, tracking_number: str) -> Dict[str, Any]:
        """Process shipment data and format response"""
        details = shipment.get("sendungsdetails", {})
        history = details.get("sendungsverlauf", {})
        current_status = history.get("aktuellerStatus", "Status unknown")
        short_status = history.get("kurzStatus", "")
        events = history.get("events", [])
        
        # Calculate progress based on status
        progress = self._calculate_progress(current_status, short_status)
        
        # Format events
        formatted_events = []
        for event in events[:8]:  # Maximum 8 events
            event_date = event.get("datum", "")
            if event_date:
                try:
                    dt = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
                    formatted_date = dt.strftime('%d.%m.%Y, %H:%M')
                except:
                    formatted_date = event_date
            else:
                formatted_date = "Unknown"
            
            formatted_events.append({
                'time': formatted_date,
                'text': event.get("status", "")
            })
        
        return {
            'status': current_status,
            'short_status': short_status,
            'progress': progress,
            'history': formatted_events,
            'last_update': datetime.now().isoformat(),
            'url': f"https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode={tracking_number}"
        }
    
    def _calculate_progress(self, status: str, short_status: str) -> int:
        """Calculate delivery progress percentage based on status"""
        status_lower = status.lower()
        short_lower = short_status.lower()
        
        if "elektronisch angekündigt" in status_lower:
            return 20
        elif "abgeholt" in status_lower or "abholung erfolgreich" in short_lower:
            return 40
        elif "transport" in status_lower or "unterwegs" in status_lower:
            return 60
        elif "zustellbasis" in status_lower or "zustellung" in status_lower:
            return 80
        elif "zugestellt" in status_lower or "empfangen" in status_lower:
            return 100
        
        return 0
    
    def _create_error_response(self, status: str, error: str, tracking_number: str) -> Dict[str, Any]:
        """Create an error response for tracking failures"""
        return {
            'status': status,
            'progress': 0,
            'history': [],
            'error': error,
            'last_update': datetime.now().isoformat(),
            'url': f"https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode={tracking_number}"
        }
