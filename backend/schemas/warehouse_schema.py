from pydantic import BaseModel
from datetime import datetime

class WarehouseCreate(BaseModel):
    name: str
    location: str
    capacity: int

class WarehouseResponse(WarehouseCreate):
    warehouse_id: int
    created_at: datetime

    class Config:
        orm_mode = True