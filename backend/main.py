from fastapi import FastAPI
from database import engine, Base

# Import Models
from models.warehouse import Warehouse
from models.product import Product
from models.vendor import Vendor
from models.inventory import Inventory
from models.purchase_order import PurchaseOrder, PurchaseOrderItem

# Import Routers
from routers.warehouse_router import router as warehouse_router
from routers.product_router import router as product_router
from routers.vendor_router import router as vendor_router
from routers.inventory_router import router as inventory_router
from routers.purchase_order_router import router as purchase_order_router

# Create all tables in database
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Warehouse & Supply Chain Tracking System",
    description="US-01 to US-05 Backend APIs",
    version="1.0.0"
)

# Register Routers
app.include_router(warehouse_router)
app.include_router(product_router)
app.include_router(vendor_router)
app.include_router(inventory_router)
app.include_router(purchase_order_router)


# Root Route
@app.get("/")
def root():
    return {
        "message": "Warehouse & Supply Chain Tracking System API is running"
    }