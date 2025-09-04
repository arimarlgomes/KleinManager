# app/services/notification_service.py
import json
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base


class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # 'price_change', 'tracking_update', etc.
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    data = Column(Text)  # JSON string with additional data
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)


class NotificationService:
    """Service for managing notifications"""

    def create_price_change_notification(self, item_title: str, old_price: float, new_price: float,
                                         data: Dict[str, Any], db: Session):
        """Create a price change notification"""
        change = new_price - old_price
        change_type = "increased" if change > 0 else "decreased"

        notification = Notification(
            type='price_change',
            title=f'Price {change_type}',
            message=f'{item_title}: €{old_price:.2f} → €{new_price:.2f} (€{abs(change):.2f})',
            data=json.dumps(data)
        )

        db.add(notification)
        db.commit()
        return notification

    def create_tracking_notification(self, order_title: str, status: str, data: Dict[str, Any], db: Session):
        """Create a tracking update notification"""
        notification = Notification(
            type='tracking_update',
            title='Tracking Update',
            message=f'{order_title}: {status}',
            data=json.dumps(data)
        )

        db.add(notification)
        db.commit()
        return notification

    def get_unread_notifications(self, db: Session, limit: int = 50) -> List[Notification]:
        """Get unread notifications"""
        return db.query(Notification).filter(
            Notification.read == False
        ).order_by(Notification.created_at.desc()).limit(limit).all()

    def mark_as_read(self, notification_id: int, db: Session):
        """Mark notification as read"""
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.read = True
            db.commit()
        return notification

    def clear_all_notifications(self, db: Session):
        """Clear all notifications"""
        db.query(Notification).delete()
        db.commit()
        return {"message": "All notifications cleared"}