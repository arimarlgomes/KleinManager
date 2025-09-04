import os, sys
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import router
from app.services.notification_service import Notification
from app.services.background_tasks import background_task_manager

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting KleinManager...")
    print("📋 Starting background monitoring tasks...")
    await background_task_manager.start_all_tasks()
    yield
    # Shutdown
    print("🛑 Stopping background monitoring tasks...")
    await background_task_manager.stop_all_tasks()
    print("👋 KleinManager shutdown complete")

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.abspath(".")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

static_dir = os.path.join(base_path, "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates = Jinja2Templates(directory=os.path.join(base_path, "templates"))

app.include_router(router)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/images/{filename}")
async def get_image(filename: str):
    file_path = os.path.join(settings.IMAGE_STORAGE_PATH, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Image not found"}

import logging

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(levelname)s | %(message)s"
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["default"]
    },
}

if __name__ == "__main__":
    import uvicorn, webbrowser, threading, time

    def open_browser():
        time.sleep(1)
        webbrowser.open("http://localhost:8000")

    threading.Thread(target=open_browser).start()

    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"📱 Open http://localhost:8000")
    print(f"📚 API docs: http://localhost:8000/docs")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_config=LOGGING_CONFIG
    )