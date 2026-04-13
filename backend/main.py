from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from pydantic import BaseModel

# Apni baki files se logic import karna
import models, schemas
from database import engine, get_db
from models import Base, Product, Warehouse, Inventory, Vendor, Order

# Tables create karna (agar nahi bani hain)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Binit's Inventory Analytics & Management")

@app.get("/")
def root():
    return {"message": "Binit's Reporting & Inventory System is Active"}

# --- SCHEMAS FOR TRANSFER (US-13) ---
class StockTransfer(BaseModel):
    product_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: int

# --- PRIYANI'S PART (REPORTS & LOGIC) ---

# US-14: Inventory Snapshot (Real-time View using Joins)
@app.get("/reports/inventory-snapshot", response_model=List[schemas.InventorySnapshot])
def get_inventory_snapshot(db: Session = Depends(get_db)):
    results = db.query(
        models.Product.name.label("product_name"),
        models.Warehouse.name.label("warehouse_name"),
        models.Inventory.stock_level
    ).join(models.Inventory, models.Product.id == models.Inventory.product_id)\
     .join(models.Warehouse, models.Warehouse.id == models.Inventory.warehouse_id).all()
    return results

# US-11: Product Reports (Sales/Order Aggregation)
@app.get("/reports/product-summary", response_model=List[schemas.ProductSummary])
def get_product_summary(db: Session = Depends(get_db)):
    summary = db.query(
        models.Product.name.label("name"),
        func.sum(models.Order.quantity).label("total_ordered")
    ).join(models.Order, models.Product.id == models.Order.product_id)\
     .group_by(models.Product.name).all()
    return summary

# US-14: Low Stock Alerts (Logic for Inventory Snapshot)
@app.get("/reports/low-stock-alerts")
def low_stock_alerts(db: Session = Depends(get_db)):
    alerts = db.query(
        models.Product.name.label("product"),
        models.Warehouse.name.label("warehouse"),
        models.Inventory.stock_level
    ).join(models.Inventory, models.Product.id == models.Inventory.product_id)\
     .join(models.Warehouse, models.Warehouse.id == models.Inventory.warehouse_id)\
     .filter(models.Inventory.stock_level < 5).all()
    
    return alerts

# US-13: Multi-location Stock Sync (Stock Transfer Logic)
@app.post("/inventory/transfer")
def transfer_stock(transfer: StockTransfer, db: Session = Depends(get_db)):
    # 1. Check karo ki source warehouse mein utna stock hai ya nahi
    source_stock = db.query(models.Inventory).filter(
        models.Inventory.product_id == transfer.product_id,
        models.Inventory.warehouse_id == transfer.from_warehouse_id
    ).first()

    if not source_stock or source_stock.stock_level < transfer.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock in source warehouse")

    # 2. Check karo destination warehouse ka record
    dest_stock = db.query(models.Inventory).filter(
        models.Inventory.product_id == transfer.product_id,
        models.Inventory.warehouse_id == transfer.to_warehouse_id
    ).first()

    # 3. Stock update logic (Syncing across locations)
    source_stock.stock_level -= transfer.quantity
    
    if dest_stock:
        dest_stock.stock_level += transfer.quantity
    else:
        # Agar destination mein pehle se wo product nahi hai, toh naya record banao
        new_inv = models.Inventory(
            product_id=transfer.product_id, 
            warehouse_id=transfer.to_warehouse_id, 
            stock_level=transfer.quantity
        )
        db.add(new_inv)

    db.commit()
    return {"message": "Stock transferred and synced successfully across locations"}