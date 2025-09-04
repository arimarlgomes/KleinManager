import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.order import WatchedItem, Order, AppSettings
from app.services.watcher import PriceWatcher
from app.api.tracking_service import TrackingService


class BackgroundTaskManager:
    def __init__(self):
        self.price_task: Optional[asyncio.Task] = None
        self.tracking_task: Optional[asyncio.Task] = None
        self.price_task_active = False
        self.tracking_task_active = False
        self.last_price_check: Optional[datetime] = None
        self.last_tracking_check: Optional[datetime] = None

        self.price_watcher = PriceWatcher()
        self.tracking_service = TrackingService()

        # Default intervals (in minutes)
        self.price_check_interval = 60
        self.tracking_check_interval = 30
        self.auto_price_enabled = True
        self.auto_tracking_enabled = True

    async def start_all_tasks(self):
        """Start all background monitoring tasks"""
        await self.load_settings()
        await self.start_price_monitoring()
        await self.start_tracking_monitoring()

    async def stop_all_tasks(self):
        """Stop all background monitoring tasks"""
        await self.stop_price_monitoring()
        await self.stop_tracking_monitoring()

    async def load_settings(self):
        """Load settings from database"""
        db = SessionLocal()
        try:
            settings = {}
            db_settings = db.query(AppSettings).all()
            for setting in db_settings:
                try:
                    settings[setting.key] = json.loads(setting.value)
                except:
                    settings[setting.key] = setting.value

            self.auto_price_enabled = settings.get('auto_check_enabled', True)
            self.price_check_interval = settings.get('auto_check_interval', 60)
            self.auto_tracking_enabled = settings.get('auto_tracking_enabled', True)
            self.tracking_check_interval = settings.get('auto_tracking_interval', 30)
        finally:
            db.close()

    async def start_price_monitoring(self):
        """Start automatic price monitoring"""
        if self.price_task and not self.price_task.done():
            self.price_task.cancel()

        if self.auto_price_enabled:
            self.price_task = asyncio.create_task(self._price_monitoring_loop())
            self.price_task_active = True
            print(f"🔍 Price monitoring started (interval: {self.price_check_interval} minutes)")

    async def stop_price_monitoring(self):
        """Stop automatic price monitoring"""
        if self.price_task and not self.price_task.done():
            self.price_task.cancel()
            self.price_task_active = False
            print("⏹️ Price monitoring stopped")

    async def start_tracking_monitoring(self):
        """Start automatic tracking monitoring"""
        if self.tracking_task and not self.tracking_task.done():
            self.tracking_task.cancel()

        if self.auto_tracking_enabled:
            self.tracking_task = asyncio.create_task(self._tracking_monitoring_loop())
            self.tracking_task_active = True
            print(f"🚚 Tracking monitoring started (interval: {self.tracking_check_interval} minutes)")

    async def stop_tracking_monitoring(self):
        """Stop automatic tracking monitoring"""
        if self.tracking_task and not self.tracking_task.done():
            self.tracking_task.cancel()
            self.tracking_task_active = False
            print("⏹️ Tracking monitoring stopped")

    async def restart_with_new_settings(self, new_settings):
        """Restart tasks with new settings"""
        # Update settings
        if 'auto_check_enabled' in new_settings:
            self.auto_price_enabled = new_settings['auto_check_enabled']
        if 'auto_check_interval' in new_settings:
            self.price_check_interval = new_settings['auto_check_interval']
        if 'auto_tracking_enabled' in new_settings:
            self.auto_tracking_enabled = new_settings['auto_tracking_enabled']
        if 'auto_tracking_interval' in new_settings:
            self.tracking_check_interval = new_settings['auto_tracking_interval']

        # Restart tasks
        await self.stop_all_tasks()
        await asyncio.sleep(1)  # Give tasks time to stop
        await self.start_all_tasks()

    async def _price_monitoring_loop(self):
        """Background loop for price monitoring"""
        while self.auto_price_enabled:
            try:
                db = SessionLocal()
                try:
                    # Get all watched items with notifications enabled
                    items = db.query(WatchedItem).filter(
                        WatchedItem.notifications_enabled == True
                    ).all()

                    if items:
                        print(f"💰 Checking prices for {len(items)} items...")
                        updates_count = 0

                        for item in items:
                            try:
                                result = self.price_watcher.check_price_change(item, db)
                                if result:
                                    updates_count += 1
                                    print(f"📈 Price change detected: {item.title}")

                                # Small delay between checks to be nice to the server
                                await asyncio.sleep(2)

                            except Exception as e:
                                print(f"❌ Error checking price for {item.title}: {e}")
                                continue

                        self.last_price_check = datetime.now()
                        print(f"✅ Price check completed. {updates_count} changes detected.")

                finally:
                    db.close()

                # Wait for next check
                await asyncio.sleep(self.price_check_interval * 60)

            except asyncio.CancelledError:
                print("🛑 Price monitoring task cancelled")
                break
            except Exception as e:
                print(f"❌ Error in price monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying

    async def _tracking_monitoring_loop(self):
        """Background loop for tracking monitoring"""
        while self.auto_tracking_enabled:
            try:
                db = SessionLocal()
                try:
                    # Get all orders with active tracking
                    orders = db.query(Order).filter(
                        Order.tracking_number.isnot(None),
                        Order.status != 'Delivered'
                    ).all()

                    if orders:
                        print(f"🚚 Checking tracking for {len(orders)} orders...")
                        updates_count = 0

                        for order in orders:
                            try:
                                carrier = getattr(order, 'carrier', None) or 'auto'
                                tracking_data = self.tracking_service.track_package(order.tracking_number, carrier)

                                if hasattr(order, 'carrier'):
                                    order.carrier = tracking_data.get('carrier',
                                                                      '').lower() if 'carrier' in tracking_data else carrier

                                order.tracking_details = json.dumps(tracking_data)
                                order.dhl_details = json.dumps(tracking_data)
                                order.dhl_status = tracking_data.get('status', '')
                                order.dhl_last_update = datetime.now()

                                if 'error' not in tracking_data and tracking_data.get('history'):
                                    updates_count += 1

                                if tracking_data.get('progress', 0) == 100:
                                    if order.status != 'Delivered':
                                        print(f"📦 Package delivered: {order.title}")
                                    order.status = 'Delivered'
                                elif 'error' not in tracking_data and order.status == 'Ordered':
                                    order.status = 'Shipped'

                                # Small delay between checks
                                await asyncio.sleep(1)

                            except Exception as e:
                                print(f"❌ Error checking tracking for {order.title}: {e}")
                                continue

                        db.commit()
                        self.last_tracking_check = datetime.now()
                        print(f"✅ Tracking check completed. {updates_count} updates processed.")

                finally:
                    db.close()

                # Wait for next check
                await asyncio.sleep(self.tracking_check_interval * 60)

            except asyncio.CancelledError:
                print("🛑 Tracking monitoring task cancelled")
                break
            except Exception as e:
                print(f"❌ Error in tracking monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying


# Global instance
background_task_manager = BackgroundTaskManager()