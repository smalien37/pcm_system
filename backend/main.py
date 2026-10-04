from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .routers import lookups, vendors, items, purchase_orders, goods_receipts, stock, auth

app = FastAPI(
    title="PCM System API",
    description="Purchase & Inventory Control Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lookups.router)
app.include_router(vendors.router)
app.include_router(items.router)
app.include_router(purchase_orders.router)
app.include_router(goods_receipts.router)
app.include_router(stock.router)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app.mount("/static", StaticFiles(directory=BASE_DIR), name="static")


@app.get("/")
async def root():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))


@app.get("/app.js")
async def get_app_js():
    return FileResponse(os.path.join(BASE_DIR, "app.js"))


@app.get("/api.js")
async def get_api_js():
    return FileResponse(os.path.join(BASE_DIR, "api.js"))


@app.get("/styles.css")
async def get_styles():
    return FileResponse(os.path.join(BASE_DIR, "styles.css"))


@app.get("/logo.png")
async def get_logo():
    return FileResponse(os.path.join(BASE_DIR, "logo.png"))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
