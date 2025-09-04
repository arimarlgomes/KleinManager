# Unified tracking service for DHL and Hermes
import requests
import json
from datetime import datetime
from typing import Dict, Any
from app.core.config import settings


class TrackingService:
    """Unified service for package tracking (DHL and Hermes)"""

    def track_package(self, tracking_number: str, carrier: str = 'auto') -> Dict[str, Any]:
        """
        Track a package with automatic carrier detection or specified carrier
        """
        if carrier == 'auto':
            # Auto-detect carrier based on tracking number format
            carrier = self.detect_carrier(tracking_number)

        if carrier == 'dhl':
            return self.track_dhl(tracking_number)
        elif carrier == 'hermes':
            return self.track_hermes(tracking_number)
        else:
            return {
                'status': 'Unknown carrier',
                'error': 'Could not determine carrier',
                'carrier': 'unknown'
            }

    def detect_carrier(self, tracking_number: str) -> str:
        """Detect carrier based on tracking number format"""
        # DHL: typically 10-39 digits
        # Hermes: typically 14 digits starting with specific patterns

        tn_clean = tracking_number.replace(' ', '').replace('-', '')

        if len(tn_clean) == 14 and tn_clean.isdigit():
            # Likely Hermes
            return 'hermes'
        elif 10 <= len(tn_clean) <= 39 and tn_clean.isdigit():
            # Likely DHL
            return 'dhl'

        # Default to DHL if unsure
        return 'dhl'

    def track_dhl(self, tracking_number: str) -> Dict[str, Any]:
        """Track DHL package"""
        try:
            url = "https://www.dhl.de/int-verfolgen/data/search"
            params = {
                "piececode": tracking_number,
                "inputSearch": "true",
                "language": "de"
            }
            headers = {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }

            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

            for shipment in data.get("sendungen", []):
                if shipment.get("hasCompleteDetails"):
                    details = shipment.get("sendungsdetails", {})
                    history = details.get("sendungsverlauf", {})
                    current_status = history.get("aktuellerStatus", "Status unknown")
                    events = history.get("events", [])

                    # Calculate progress
                    progress = self._calculate_dhl_progress(current_status)

                    # Format events
                    formatted_events = []
                    for event in events[:8]:
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
                        'carrier': 'DHL',
                        'status': current_status,
                        'progress': progress,
                        'history': formatted_events,
                        'last_update': datetime.now().isoformat(),
                        'url': f"https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode={tracking_number}"
                    }

            return {
                'carrier': 'DHL',
                'status': 'Package not found',
                'progress': 0,
                'history': [],
                'error': 'No tracking data available'
            }

        except Exception as e:
            return {
                'carrier': 'DHL',
                'status': 'Tracking error',
                'progress': 0,
                'history': [],
                'error': str(e)
            }

    def track_hermes(self, tracking_number: str) -> Dict[str, Any]:
        """Track Hermes package"""
        try:
            url = f"https://api.my-deliveries.de/tnt/parcelservice/parceldetails/{tracking_number}"
            headers = {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json, text/plain, */*",
                "Origin": "https://www.myhermes.de",
                "Referer": "https://www.myhermes.de/",
                "X-Language": "de"
            }

            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            if "application/json" not in response.headers.get("Content-Type", ""):
                raise ValueError("Invalid response from Hermes API")

            data = response.json()

            current_status = data.get("status", {}).get("text", {}).get("longText", "Unknown")
            short_status = data.get("status", {}).get("text", {}).get("shortText", "")

            # Calculate progress
            progress = self._calculate_hermes_progress(current_status, short_status)

            # Format history
            formatted_events = []
            for event in data.get("parcelHistory", []):
                timestamp = event.get("timestamp")
                if timestamp:
                    try:
                        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        formatted_date = dt.strftime('%d.%m.%Y, %H:%M')
                    except:
                        formatted_date = timestamp
                else:
                    formatted_date = "Pending"

                status_text = event.get("statusHistoryText") or event.get("status", "")
                # Convert internal status codes to readable text
                status_map = {
                    "SENDUNG_IN_ZIELREGION_ANGEKOMMEN": "Package arrived in destination region",
                    "ZUSTELLTOUR": "Out for delivery",
                    "ZUGESTELLT": "Delivered"
                }
                status_text = status_map.get(status_text, status_text)

                if status_text:  # Only add if there's actual status text
                    formatted_events.append({
                        'time': formatted_date,
                        'text': status_text
                    })

            return {
                'carrier': 'Hermes',
                'status': current_status,
                'short_status': short_status,
                'destination': data.get("metaInformation", {}).get("destination", ""),
                'progress': progress,
                'history': formatted_events,
                'last_update': datetime.now().isoformat(),
                'url': f"https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation#{tracking_number}"
            }

        except Exception as e:
            return {
                'carrier': 'Hermes',
                'status': 'Tracking error',
                'progress': 0,
                'history': [],
                'error': str(e)
            }

    def _calculate_dhl_progress(self, status: str) -> int:
        """Calculate progress for DHL shipments"""
        status_lower = status.lower()

        if "elektronisch angekündigt" in status_lower:
            return 20
        elif "abgeholt" in status_lower:
            return 40
        elif "transport" in status_lower or "unterwegs" in status_lower:
            return 60
        elif "zustellbasis" in status_lower or "zustellung" in status_lower:
            return 80
        elif "zugestellt" in status_lower or "empfangen" in status_lower:
            return 100

        return 0

    def _calculate_hermes_progress(self, long_status: str, short_status: str) -> int:
        """Calculate progress for Hermes shipments"""
        status_lower = long_status.lower()
        short_lower = short_status.lower()

        if "eingeliefert" in status_lower or "abgegeben" in short_lower:
            return 30
        elif "übernommen" in status_lower:
            return 40
        elif "zielregion" in status_lower:
            return 60
        elif "zustelltour" in status_lower or "out for delivery" in status_lower:
            return 80
        elif "zugestellt" in status_lower or "delivered" in status_lower:
            return 100

        return 0