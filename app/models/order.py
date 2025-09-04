# app/models/order.py
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
    carrier = Column(String)
    tracking_details = Column(Text)
    dhl_status = Column(String)  # Keep for backward compatibility
    dhl_details = Column(Text)  # Keep for backward compatibility
    dhl_last_update = Column(DateTime)
    status = Column(String, default="Ordered")
    color = Column(String)  # NEW: Color tag
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class WatchedItem(Base):
    """Watched item model for price monitoring"""
    __tablename__ = "watched_items"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    current_price = Column(Float, default=0.0)
    initial_price = Column(Float, default=0.0)
    last_price = Column(Float, default=0.0)
    price_history = Column(Text)  # JSON string
    notifications_enabled = Column(Boolean, default=True)
    last_checked = Column(DateTime, default=datetime.now)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class MyListing(Base):
    """My listings from Kleinanzeigen"""
    __tablename__ = "my_listings"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, default=0.0)
    category = Column(String)
    url = Column(String)
    image_url = Column(String)
    status = Column(String, default="Active")
    visitors = Column(Integer, default=0)
    favorites = Column(Integer, default=0)
    end_date = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class AppSettings(Base):
    """Application settings"""
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)