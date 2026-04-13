from pydantic import BaseModel
from typing import List, Optional

# --- BASIC SCHEMAS ---
class WarehouseBase(BaseModel):
    name: str
    location: str

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    price: float

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- PRIYANI'S REPORTING SCHEMAS (Important for your part) ---

# US-14: Inventory Snapshot Schema
class InventorySnapshot(BaseModel):
    product_name: str
    warehouse_name: str
    stock_level: int

    class Config:
        from_attributes = True

# US-11: Product Summary Schema (Ye missing tha!)
class ProductSummary(BaseModel):
    name: str
    total_ordered: int

    class Config:
        from_attributes = True