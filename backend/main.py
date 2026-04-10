from fastapi import FastAPI
from database import engine, Base
from db_objects import initialize_database_objects

# Import Models
from models.warehouse import Warehouse
from models.product import Product
from models.vendor import Vendor
from models.inventory import Inventory
from models.purchase_order import PurchaseOrder, PurchaseOrderItem
from models.stock_movement import StockMovement
from models.inventory_audit_log import InventoryAuditLog

# Import Routers
from routers.warehouse_router import router as warehouse_router
from routers.product_router import router as product_router
from routers.vendor_router import router as vendor_router
from routers.inventory_router import router as inventory_router
from routers.purchase_order_router import router as purchase_order_router
from routers.stock_movement_router import router as stock_movement_router
from routers.alerts_router import router as alerts_router
from routers.inventory_audit_router import router as inventory_audit_router
from routers.reports_router import router as reports_router

# Create all tables in database
Base.metadata.create_all(bind=engine)
initialize_database_objects(engine)

# Initialize FastAPI app
app = FastAPI(
    title="Warehouse & Supply Chain Tracking System",
    description="US-01 to US-10 Backend APIs",
    version="1.0.0"
)

# Register Routers
app.include_router(warehouse_router)
app.include_router(product_router)
app.include_router(vendor_router)
app.include_router(inventory_router)
app.include_router(purchase_order_router)
app.include_router(stock_movement_router)
app.include_router(alerts_router)
app.include_router(inventory_audit_router)
app.include_router(reports_router)


# Root Route
@app.get("/")
def root():
    return {
        "message": "Warehouse & Supply Chain Tracking System API is running"
    }
