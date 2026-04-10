from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class StockMovementCreate(BaseModel):
    warehouse_id: int
    product_id: int
    quantity: int = Field(gt=0)
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    remarks: Optional[str] = None
    created_by: Optional[str] = "system"


class StockMovementResponse(BaseModel):
    movement_id: int
    warehouse_id: int
    product_id: int
    movement_type: str
    quantity: int
    reference_type: Optional[str]
    reference_id: Optional[int]
    remarks: Optional[str]
    created_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StockMovementActionResponse(BaseModel):
    message: str
    movement: StockMovementResponse
    current_quantity: int
