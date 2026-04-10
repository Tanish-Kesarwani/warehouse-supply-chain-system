from sqlalchemy import Column, Integer, String, ForeignKey, Float
from database import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    po_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.warehouse_id"))
    status = Column(String, default="Pending")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.po_id"))
    product_id = Column(Integer, ForeignKey("products.product_id"))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)