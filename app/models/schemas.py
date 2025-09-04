# Pydantic schemas for request/response validation
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class OrderCreate(BaseModel):
    """Schema for creating a new order"""
    url: HttpUrl

class OrderUpdate(BaseModel):
    """Schema for updating an order"""
    title: Optional[str] = None
    price: Optional[float] = None
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None  # 'dhl', 'hermes', or 'auto'
    status: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    """Schema for order response"""
    id: int
    ad_id: Optional[str]
    title: str
    price: float
    description: Optional[str]
    category: Optional[str]
    location: Optional[str]
    seller_name: Optional[str]
    seller_profile_url: Optional[str]
    seller_since: Optional[str]
    seller_is_new: bool
    article_url: Optional[str]
    image_urls: Optional[str]
    local_images: Optional[str]
    tracking_number: Optional[str]
    carrier: Optional[str]  # NEW
    tracking_details: Optional[str]  # NEW - replaces dhl_details in response
    dhl_status: Optional[str]  # Keep for backward compatibility
    dhl_last_update: Optional[datetime]
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    """Schema for statistics response"""
    total: int
    transit: int
    value: str
    new_sellers: int

class TrackingUpdate(BaseModel):
    """Schema for tracking update response"""
    updated: int