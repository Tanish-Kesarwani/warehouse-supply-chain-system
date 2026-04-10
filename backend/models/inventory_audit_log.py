from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from database import Base


class InventoryAuditLog(Base):
    __tablename__ = "inventory_audit_logs"

    audit_id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False, index=True)
    action = Column(String, nullable=False, index=True)  # INWARD / OUTWARD / ADJUSTMENT
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    delta = Column(Integer, nullable=False)
    actor = Column(String, nullable=True, default="trigger")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
