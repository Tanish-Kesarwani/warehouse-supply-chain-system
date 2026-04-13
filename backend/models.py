from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

# --- PARENT TABLES (Independent) ---

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String)
    
    # Link to Inventory
    stocks = relationship("Inventory", back_populates="warehouse")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    category = Column(String)
    price = Column(Float)
    
    stocks = relationship("Inventory", back_populates="product")
    orders = relationship("Order", back_populates="product")

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact = Column(String)
    
    orders = relationship("Order", back_populates="vendor")

# --- CHILD TABLES (Dependent on Foreign Keys) ---

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    stock_level = Column(Integer, default=0)

    product = relationship("Product", back_populates="stocks")
    warehouse = relationship("Warehouse", back_populates="stocks")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    quantity = Column(Integer)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="orders")
    vendor = relationship("Vendor", back_populates="orders")
    