from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class Warehouse(Base):
    __tablename__ = "warehouses"

    warehouse_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)