# Database models for KleinManager
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from datetime import datetime
from app.core.database import Base

class Order(Base):
    """Order model representing a Kleinanzeigen purchase"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, default=0.0)
    description = Column(Text)
    category = Column(String)
    location = Column(String)
    seller_name = Column(String)
    seller_profile_url = Column(String)
    seller_since = Column(String)
    seller_is_new = Column(Boolean, default=False)
    article_url = Column(String)
    image_urls = Column(Text)  # JSON string
    local_images = Column(Text)  # JSON string
    tracking_number = Column(String)
    carrier = Column(String)  # NEW: 'dhl', 'hermes', or null
    tracking_details = Column(Text)  # NEW: Renamed from dhl_details
    dhl_status = Column(String)  # Keep for backward compatibility
    dhl_details = Column(Text)  # Keep for backward compatibility
    dhl_last_update = Column(DateTime)
    status = Column(String, default="Ordered")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)