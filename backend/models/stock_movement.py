from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

    movement_id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False, index=True)
    movement_type = Column(String, nullable=False, index=True)  # INWARD / OUTWARD
    quantity = Column(Integer, nullable=False)
    reference_type = Column(String, nullable=True)
    reference_id = Column(Integer, nullable=True)
    remarks = Column(String, nullable=True)
    created_by = Column(String, nullable=True, default="system")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
