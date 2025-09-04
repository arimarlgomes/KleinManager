# app/services/watcher.py
import requests
import json
from datetime import datetime
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.notification_service import NotificationService


class PriceWatcher:
    """Service for monitoring price changes"""

    def __init__(self):
        self.headers = {'User-Agent': settings.USER_AGENT}
        self.notification_service = NotificationService()

    def check_price_change(self, watched_item, db: Session) -> Optional[Dict[str, Any]]:
        """Check if price has changed for a watched item"""
        try:
            response = requests.get(watched_item.url, headers=self.headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract current price
            price_elem = soup.find('h2', {'id': 'viewad-price'})
            current_price = 0.0

            if price_elem:
                import re
                price_match = re.search(r'(\d+(?:[.,]\d+)?)', price_elem.text)
                if price_match:
                    current_price = float(price_match.group(1).replace(',', '.'))

            # Check if price changed
            if current_price != watched_item.current_price and current_price > 0:
                # Update price history
                history = json.loads(watched_item.price_history) if watched_item.price_history else []
                history.append({
                    'price': current_price,
                    'date': datetime.now().isoformat()
                })

                # Keep only last 30 entries
                if len(history) > 30:
                    history = history[-30:]

                # Update watched item
                watched_item.last_price = watched_item.current_price
                watched_item.current_price = current_price
                watched_item.price_history = json.dumps(history)
                watched_item.last_checked = datetime.now()
                watched_item.updated_at = datetime.now()

                db.commit()

                # Send notification if enabled
                if watched_item.notifications_enabled:
                    price_change = current_price - watched_item.last_price
                    change_type = "increased" if price_change > 0 else "decreased"

                    notification_data = {
                        'item_id': watched_item.id,
                        'title': watched_item.title,
                        'old_price': watched_item.last_price,
                        'new_price': current_price,
                        'change': abs(price_change),
                        'change_type': change_type,
                        'url': watched_item.url
                    }

                    self.notification_service.create_price_change_notification(
                        watched_item.title,
                        watched_item.last_price,
                        current_price,
                        notification_data,
                        db
                    )

                return {
                    'item_id': watched_item.id,
                    'title': watched_item.title,
                    'old_price': watched_item.last_price,
                    'new_price': current_price,
                    'change': current_price - watched_item.last_price
                }

            # Update last checked
            watched_item.last_checked = datetime.now()
            db.commit()

        except Exception as e:
            print(f"Error checking price for {watched_item.title}: {e}")

        return None