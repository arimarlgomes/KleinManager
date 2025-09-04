# API routes for KleinManager
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import time
from datetime import datetime

from app.core.database import get_db
from app.models.order import Order
from app.models.schemas import OrderCreate, OrderUpdate, OrderResponse, StatsResponse, TrackingUpdate
from app.services.scraper import KleinanzeigenScraper
from app.api.tracking_service import TrackingService

router = APIRouter(prefix="/api/v1")
scraper = KleinanzeigenScraper()
tracking_service = TrackingService()


@router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order from a Kleinanzeigen URL"""
    # Scrape listing data
    try:
        listing_data = scraper.scrape_listing(str(order_data.url))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape listing: {str(e)}")

    # Check if order already exists
    existing = db.query(Order).filter(Order.ad_id == listing_data['ad_id']).first()
    if existing:
        raise HTTPException(status_code=400, detail="Order already exists")

    # Create new order
    db_order = Order(**listing_data)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
        search: Optional[str] = "",
        status: Optional[str] = "",
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """Get all orders with optional filtering"""
    query = db.query(Order)

    if search:
        query = query.filter(Order.title.contains(search))
    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).limit(limit).all()

    # Convert old dhl_details to tracking_details for backward compatibility
    for order in orders:
        if not order.tracking_details and order.dhl_details:
            order.tracking_details = order.dhl_details
            order.carrier = 'dhl'

    return orders


@router.get("/orders/tracking", response_model=List[OrderResponse])
async def get_tracking_orders(db: Session = Depends(get_db)):
    """Get orders with active tracking"""
    orders = db.query(Order).filter(
        Order.tracking_number.isnot(None),
        Order.status != 'Delivered'
    ).all()

    # Convert old dhl_details to tracking_details for backward compatibility
    for order in orders:
        if not order.tracking_details and order.dhl_details:
            order.tracking_details = order.dhl_details
            order.carrier = 'dhl'

    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Convert old dhl_details to tracking_details for backward compatibility
    if not order.tracking_details and order.dhl_details:
        order.tracking_details = order.dhl_details
        order.carrier = 'dhl'

    return order


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
        order_id: int,
        order_update: OrderUpdate,
        db: Session = Depends(get_db)
):
    """Update an existing order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Update fields
    update_data = order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(order, field):
            setattr(order, field, value)

    order.updated_at = datetime.now()

    # If tracking number was added, fetch tracking data
    if 'tracking_number' in update_data and update_data['tracking_number']:
        carrier = update_data.get('carrier', 'auto')
        tracking_data = tracking_service.track_package(update_data['tracking_number'], carrier)

        order.carrier = tracking_data.get('carrier', '').lower() if 'carrier' in tracking_data else None
        order.tracking_details = json.dumps(tracking_data)
        order.dhl_details = json.dumps(tracking_data)  # Keep for backward compatibility
        order.dhl_status = tracking_data.get('status', '')
        order.dhl_last_update = datetime.now()

        # Update status if tracking is successful
        if 'error' not in tracking_data:
            order.status = 'Shipped'
            if tracking_data.get('progress', 0) == 100:
                order.status = 'Delivered'

    db.commit()
    db.refresh(order)

    # Convert for response
    if not order.tracking_details and order.dhl_details:
        order.tracking_details = order.dhl_details

    return order


@router.post("/orders/{order_id}/tracking")
async def update_tracking(order_id: int, db: Session = Depends(get_db)):
    """Update tracking for a specific order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or not order.tracking_number:
        raise HTTPException(status_code=404, detail="No tracking number found")

    # Use carrier if set, otherwise auto-detect
    carrier = getattr(order, 'carrier', None) or 'auto'

    # Fetch latest tracking data
    tracking_data = tracking_service.track_package(order.tracking_number, carrier)

    # Update order with new tracking data
    if hasattr(order, 'carrier'):
        order.carrier = tracking_data.get('carrier', '').lower() if 'carrier' in tracking_data else carrier

    order.tracking_details = json.dumps(tracking_data)
    order.dhl_details = json.dumps(tracking_data)  # Keep for backward compatibility
    order.dhl_status = tracking_data.get('status', '')
    order.dhl_last_update = datetime.now()

    # Auto-update status if delivered
    if tracking_data.get('progress', 0) == 100:
        order.status = 'Delivered'
    elif 'error' not in tracking_data and order.status == 'Ordered':
        order.status = 'Shipped'

    db.commit()
    return tracking_data


@router.post("/tracking/update-all", response_model=TrackingUpdate)
async def update_all_tracking(db: Session = Depends(get_db)):
    """Update tracking for all active shipments"""
    orders = db.query(Order).filter(
        Order.tracking_number.isnot(None),
        Order.status != 'Delivered'
    ).all()

    updated_count = 0

    for order in orders:
        try:
            # Use carrier if set, otherwise auto-detect
            carrier = getattr(order, 'carrier', None) or 'auto'

            tracking_data = tracking_service.track_package(order.tracking_number, carrier)

            if hasattr(order, 'carrier'):
                order.carrier = tracking_data.get('carrier', '').lower() if 'carrier' in tracking_data else carrier

            order.tracking_details = json.dumps(tracking_data)
            order.dhl_details = json.dumps(tracking_data)  # Keep for backward compatibility
            order.dhl_status = tracking_data.get('status', '')
            order.dhl_last_update = datetime.now()

            if 'error' not in tracking_data and tracking_data.get('history'):
                updated_count += 1

            if tracking_data.get('progress', 0) == 100:
                order.status = 'Delivered'
            elif 'error' not in tracking_data and order.status == 'Ordered':
                order.status = 'Shipped'

            time.sleep(1)  # Rate limiting
        except Exception:
            continue

    db.commit()
    return {"updated": updated_count}


@router.delete("/orders/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Delete local images
    if order.local_images:
        import os
        from app.core.config import settings
        for img in json.loads(order.local_images):
            img_path = os.path.join(settings.IMAGE_STORAGE_PATH, img)
            if os.path.exists(img_path):
                os.remove(img_path)

    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    total = db.query(Order).count()
    transit = db.query(Order).filter(Order.status == 'Shipped').count()
    value = db.query(func.sum(Order.price)).scalar() or 0
    new_sellers = db.query(Order).filter(Order.seller_is_new == True).count()

    return {
        "total": total,
        "transit": transit,
        "value": f"{value:.2f}",
        "new_sellers": new_sellers
    }


@router.get("/stats/detail")
async def get_detailed_stats(db: Session = Depends(get_db)):
    """Get detailed statistics"""
    # Status distribution
    by_status = {}
    for status in ['Ordered', 'Shipped', 'Delivered']:
        count = db.query(Order).filter(Order.status == status).count()
        if count > 0:
            by_status[status] = count

    # Top categories
    top_categories = db.query(
        Order.category,
        func.count(Order.id).label('count')
    ).group_by(Order.category).order_by(func.count(Order.id).desc()).limit(5).all()

    return {
        "by_status": by_status,
        "top_categories": [{"category": cat[0], "count": cat[1]} for cat in top_categories]
    }